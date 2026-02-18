
import { ShiftType, ShiftVariable } from '../types';

export function calculateHours(startDate: string, startTime: string, endDate: string, endTime: string): number {
  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0;
  }

  const diffMs = end.getTime() - start.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  return Math.max(0, Number(diffHours.toFixed(2)));
}

/**
 * Calcula los minutos de exceso compensados de forma acumulativa a partir de las 8 horas de trabajo:
 * - El exceso comienza después de 480 minutos (8h) de duración total real.
 * - Tramo 1 (1-60 min de exceso): cada minuto x 1.25
 * - Tramo 2 (61-90 min de exceso): cada minuto x 1.50 (se suma al tramo anterior)
 * - Tramo 3 (>90 min de exceso): cada minuto x 1.00 (se suma a los tramos anteriores)
 */
export function calculateExcessMinutes(
  startDate: string,
  startTime: string,
  realEndDate: string,
  realEndTime: string
): number {
  const start = new Date(`${startDate}T${startTime}`);
  const realEnd = new Date(`${realEndDate}T${realEndTime}`);

  if (isNaN(start.getTime()) || isNaN(realEnd.getTime())) return 0;

  const diffMs = realEnd.getTime() - start.getTime();
  const totalMinutes = diffMs / (1000 * 60);

  // Los excesos se empiezan a contar a partir de las 8 horas (480 minutos)
  const diffMinutes = totalMinutes - 480;

  if (diffMinutes <= 0) return 0;

  let compensatedMinutes = 0;

  // Tramo 1: de 1 a 60 minutos de exceso (x1.25)
  const minutesInSegment1 = Math.min(diffMinutes, 60);
  compensatedMinutes += minutesInSegment1 * 1.25;

  // Tramo 2: de 61 a 90 minutos de exceso (x1.50)
  if (diffMinutes > 60) {
    const minutesInSegment2 = Math.min(diffMinutes - 60, 30); // Máximo 30 minutos en este tramo (90-60)
    compensatedMinutes += minutesInSegment2 * 1.50;
  }

  // Tramo 3: más de 90 minutos de exceso (x1.00)
  if (diffMinutes > 90) {
    const minutesInSegment3 = diffMinutes - 90;
    compensatedMinutes += minutesInSegment3 * 1.00;
  }

  return Number(compensatedMinutes.toFixed(2));
}

export function calculateEarnings(
  startDate: string,
  hours: number,
  shiftType: ShiftType,
  appliedVariables: ShiftVariable[],
  sundayRate: number = 92.25
): number {
  if (shiftType.name.toUpperCase() === 'LIBRE') {
    return 0;
  }

  const [y, m, d] = startDate.split('-');
  const dateObj = new Date(Number(y), Number(m)-1, Number(d));
  const isSunday = dateObj.getDay() === 0;

  let baseEarnings = isSunday ? sundayRate : (shiftType.dailyRate || 0);
  let extraEarnings = 0;

  appliedVariables.forEach((v) => {
    if (v.id === 'v_sun') return;

    if (v.type === 'hourly_bonus') {
      extraEarnings += (v.amount * hours);
    } else if (v.type === 'fixed') {
      extraEarnings += v.amount;
    }
  });

  return Number((baseEarnings + extraEarnings).toFixed(2));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function hexToRgba(hex: string, alpha: number): string {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
