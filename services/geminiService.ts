import { GoogleGenAI, Type } from '@google/genai';
import { ShiftType, ShiftVariable } from '../types';

export async function parseShiftFromText(
  text: string,
  availableTypes: ShiftType[],
  availableVariables: ShiftVariable[]
) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    const prompt = `
      Analiza el siguiente texto de un usuario que describe un turno de trabajo.
      Extrae la fecha de inicio, hora de inicio, fecha de fin y hora de fin real.
      Si el turno cruza la medianoche, asegúrate de que la fecha de fin sea al día siguiente.
      Intenta identificar qué tipo de turno es y si aplica alguna variable extra basándote en las listas proporcionadas.
      
      Tipos de turno disponibles (usa el ID si coincide):
      ${JSON.stringify(availableTypes.map(t => ({ id: t.id, name: t.name })))}
      
      Variables/Bonos disponibles (usa los IDs si aplican):
      ${JSON.stringify(availableVariables.map(v => ({ id: v.id, name: v.name })))}
      
      Reglas:
      - Si no menciona fecha de inicio, asume que es la fecha actual (${new Date().toISOString().split('T')[0]}).
      - Si no menciona fecha de fin explícita pero la hora de fin es menor a la de inicio, asume que es el día siguiente a la fecha de inicio. Si no, usa la misma que la fecha de inicio.
      - El formato de startTime y endTime DEBE ser HH:MM (24 horas).
      - El formato de startDate y endDate DEBE ser YYYY-MM-DD.
      - Mapea el texto a los IDs proporcionados lo mejor posible.
      
      Texto del usuario: "${text}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            startDate: {
              type: Type.STRING,
              description: 'Start date in YYYY-MM-DD format',
            },
            startTime: {
              type: Type.STRING,
              description: 'Start time in HH:MM format (24h)',
            },
            endDate: {
              type: Type.STRING,
              description: 'End date in YYYY-MM-DD format',
            },
            endTime: {
              type: Type.STRING,
              description: 'End time in HH:MM format (24h)',
            },
            shiftTypeId: {
              type: Type.STRING,
              description: 'The ID of the best matching shift type from the provided list, or empty if none matches well.',
            },
            variableIds: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: 'Array of IDs of the matching variables from the provided list.',
            },
          },
          required: ['startDate', 'startTime', 'endDate', 'endTime'],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Error parsing shift with AI:", error);
    throw error;
  }
}