
export interface ShiftType {
  id: string;
  name: string;
  dailyRate: number;
  color: string;
}

export type VariableType = 'fixed' | 'hourly_bonus';

export interface ShiftVariable {
  id: string;
  name: string;
  type: VariableType;
  amount: number;
}

export interface Shift {
  id: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:MM
  realEndDate?: string; // YYYY-MM-DD
  realEndTime?: string; // HH:MM
  shiftTypeId: string;
  variableIds: string[];
  notes?: string;
  // Computed fields
  hoursWorked: number;
  totalEarnings: number;
  excessMinutes: number; // Compensated excess time based on theoretical vs real end
}

export interface CalendarTheme {
  id: string;
  name: string;
  bg: string;
  border: string;
  headerBg: string;
  headerText: string;
  accentText: string;
  dayNameText: string;
  emptyCell: string;
  cellBg: string;
  cellBorder: string;
  cellText: string;
  cellHover: string;
  sundayBg: string;
  sundayText: string;
  todayBg: string;
  todayBorder: string;
  todayText: string;
  plusBtn: string;
}

export interface AppState {
  shifts: Shift[];
  shiftTypes: ShiftType[];
  variables: ShiftVariable[];
  calendarThemeId?: string;
  customThemeColor?: string;
  // Personalización avanzada
  customDayNameColor?: string;
  customBgColor?: string;
  customDayNumberColor?: string;
  customHoverLineColor?: string;
  customDayBorderColor?: string;
}
