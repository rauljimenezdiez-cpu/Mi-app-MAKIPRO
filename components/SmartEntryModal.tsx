import React, { useState } from 'react';
import { ShiftType, ShiftVariable } from '../types';
import { parseShiftFromText } from '../services/geminiService';
import { SparklesIcon } from './Icons';

interface SmartEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftTypes: ShiftType[];
  variables: ShiftVariable[];
  onParsed: (data: any) => void;
}

const SmartEntryModal: React.FC<SmartEntryModalProps> = ({ isOpen, onClose, shiftTypes, variables, onParsed }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleProcess = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    
    try {
      const result = await parseShiftFromText(text, shiftTypes, variables);
      onParsed(result);
      setText('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Hubo un error al procesar el texto. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Ingreso Inteligente con IA</h3>
            <p className="text-sm text-gray-600">Describe tu turno y dejaremos que la IA rellene el formulario.</p>
          </div>
        </div>
        
        <div className="p-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ej: Ayer trabajé de 22:00 a 06:00, fue turno de noche y me toca bono de festivo."
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            disabled={loading}
          ></textarea>
          
          {error && <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
          
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              onClick={handleProcess}
              disabled={loading || !text.trim()}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none flex items-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : 'Generar Formulario'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartEntryModal;
