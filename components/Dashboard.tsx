
import React, { useState } from 'react';
import { Shift, ShiftType, CalendarTheme } from '../types';
import { formatCurrency, hexToRgba } from '../lib/utils';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from './Icons';

interface DashboardProps {
  shifts: Shift[];
  shiftTypes: ShiftType[];
  onAddShift: (dateStr: string) => void;
  onEditShift: (shift: Shift) => void;
  theme: CalendarTheme;
  customColor?: string;
  customDayNameColor?: string;
  customBgColor?: string;
  customDayNumberColor?: string;
  customHoverLineColor?: string;
  customDayBorderColor?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  shifts, 
  shiftTypes, 
  onAddShift, 
  onEditShift, 
  theme, 
  customColor = '#4f46e5',
  customDayNameColor = '#9ca3af',
  customBgColor = '#ffffff',
  customDayNumberColor = '#1f2937',
  customHoverLineColor = '#4f46e5',
  customDayBorderColor = '#e5e7eb'
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const startingEmptyCells = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyCellsArray = Array.from({ length: startingEmptyCells }, (_, i) => i);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const getShiftsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return shifts.filter(s => s.startDate === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const isCustom = theme.id === 'custom';
  
  // Estilos dinámicos avanzados
  const dynamicStyles = {
    calendarContainer: isCustom ? { 
      backgroundColor: customBgColor,
      borderColor: hexToRgba(customColor, 0.2)
    } : {},
    header: isCustom ? { 
      backgroundColor: 'transparent',
      borderColor: hexToRgba(customColor, 0.1)
    } : {},
    yearText: isCustom ? { color: customColor } : {},
    dayName: isCustom ? { color: customDayNameColor } : {},
    dayNumber: isCustom ? { color: customDayNumberColor } : {},
    emptyCell: isCustom ? { backgroundColor: hexToRgba(customColor, 0.02) } : {},
    cellBorderColor: isCustom ? customDayBorderColor : undefined,
    sundayCell: isCustom ? { backgroundColor: hexToRgba(customColor, 0.05) } : {},
    todayCell: isCustom ? { borderColor: customColor, borderWidth: '2px', backgroundColor: hexToRgba(customColor, 0.03) } : {},
    hoverLine: isCustom ? { backgroundColor: customHoverLineColor } : { backgroundColor: 'currentColor' }
  };

  return (
    <div className="w-full space-y-6">
      <div 
        className={`${!isCustom ? theme.bg : ''} rounded-2xl shadow-xl border ${!isCustom ? theme.border : ''} overflow-hidden transition-all duration-500`}
        style={dynamicStyles.calendarContainer}
      >
        {/* Header del Calendario */}
        <div 
          className={`flex items-center justify-between px-6 py-5 border-b ${!isCustom ? theme.border + ' ' + theme.headerBg : ''} backdrop-blur-sm`}
          style={dynamicStyles.header}
        >
          <h2 className={`text-2xl font-black ${!isCustom ? theme.headerText : 'text-gray-800'} capitalize tracking-tight`}>
            {monthNames[month]} <span className={!isCustom ? theme.accentText : ''} style={dynamicStyles.yearText}>{year}</span>
          </h2>
          <div className="flex space-x-2">
            <button 
              onClick={handlePrevMonth}
              className={`p-2.5 rounded-xl border ${!isCustom ? theme.border : ''} bg-white/50 shadow-sm hover:shadow-md transition-all active:scale-95 text-gray-600`}
              style={isCustom ? { borderColor: hexToRgba(customColor, 0.1) } : {}}
              aria-label="Mes anterior"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNextMonth}
              className={`p-2.5 rounded-xl border ${!isCustom ? theme.border : ''} bg-white/50 shadow-sm hover:shadow-md transition-all active:scale-95 text-gray-600`}
              style={isCustom ? { borderColor: hexToRgba(customColor, 0.1) } : {}}
              aria-label="Mes siguiente"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-6">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dayName => (
              <div 
                key={dayName} 
                className={`text-center text-[10px] md:text-xs font-black ${!isCustom ? theme.dayNameText : ''} uppercase tracking-[0.2em] py-1`}
                style={dynamicStyles.dayName}
              >
                {dayName}
              </div>
            ))}
          </div>
          
          {/* Grid del calendario */}
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {emptyCellsArray.map(i => (
              <div 
                key={`empty-${i}`} 
                className={`aspect-square rounded-xl ${!isCustom ? theme.emptyCell : ''} border border-transparent`}
                style={dynamicStyles.emptyCell}
              ></div>
            ))}
            
            {daysArray.map(day => {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayShifts = getShiftsForDay(day);
              const dateObj = new Date(year, month, day);
              const isSunday = dateObj.getDay() === 0;

              const hasExcess = dayShifts.some(s => s.excessMinutes > 0);

              const hasSpecialDay = dayShifts.some(s => {
                const type = shiftTypes.find(t => t.id === s.shiftTypeId);
                const name = type?.name.toUpperCase() || '';
                return name === 'LIBRE' || name === 'VACACIONES';
              });

              // Estilos de celda
              let cellStyle: React.CSSProperties = isCustom ? { 
                backgroundColor: 'transparent', 
                borderColor: dynamicStyles.cellBorderColor
              } : {};
              let cellClassName = !isCustom ? theme.cellBg + ' ' + theme.cellBorder + ' ' + theme.cellText : '';

              if (isSunday) {
                if (isCustom) cellStyle.backgroundColor = hexToRgba(customColor, 0.05);
                else cellClassName = theme.sundayBg + ' ' + theme.sundayText;
              }
              
              if (hasSpecialDay) {
                if (isCustom) {
                  cellStyle.backgroundColor = '#ecfdf5';
                  cellStyle.borderColor = '#d1fae5';
                } else {
                  cellClassName = 'bg-emerald-50/50 border-emerald-100';
                }
              }
              
              if (isToday(day)) {
                if (isCustom) {
                  cellStyle = { ...cellStyle, ...dynamicStyles.todayCell };
                } else {
                  cellClassName = theme.todayBg + ' ' + theme.todayBorder + ' ' + theme.todayText + ' shadow-lg ring-1 ring-indigo-200';
                }
              }

              const handleDayClick = () => {
                if (dayShifts.length > 0) {
                  onEditShift(dayShifts[0]);
                } else {
                  onAddShift(dateStr);
                }
              };

              return (
                <div
                  key={day}
                  onClick={handleDayClick}
                  style={cellStyle}
                  className={`
                    relative group flex flex-col items-start justify-start p-2 md:p-3 aspect-square rounded-2xl border transition-all duration-300 cursor-pointer
                    ${cellClassName} ${!isCustom ? theme.cellHover : 'hover:shadow-md hover:scale-[1.02]'}
                  `}
                >
                  <div className="w-full flex justify-between items-start mb-1">
                    <span 
                      className="text-xs md:text-base font-black" 
                      style={isCustom ? dynamicStyles.dayNumber : {}}
                    >
                      {day}
                    </span>
                    
                    {/* Indicador de EXCESOS en el día */}
                    {hasExcess && (
                      <span className="text-[7px] md:text-[9px] font-black bg-orange-500 text-white px-1 py-0.5 rounded leading-none shadow-sm animate-pulse">
                        EXCESOS
                      </span>
                    )}
                  </div>

                  {/* Línea horizontal inteligente (Visible solo en hover) */}
                  <div 
                    className="w-full h-0.5 mb-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                    style={dynamicStyles.hoverLine}
                  ></div>
                  
                  <div className="flex flex-col gap-1 w-full overflow-hidden">
                    {dayShifts.map(shift => {
                      const type = shiftTypes.find(t => t.id === shift.shiftTypeId);
                      const typeName = type?.name.toUpperCase() || '';
                      const isLibre = typeName === 'LIBRE';
                      const isReserva = typeName === 'RESERVA';
                      const isFormacion = typeName === 'FORMACIÓN';
                      const isVacaciones = typeName === 'VACACIONES';
                      
                      return (
                        <div 
                          key={shift.id} 
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditShift(shift);
                          }}
                          className={`
                            w-full text-[7px] md:text-[10px] font-bold px-1.5 py-0.5 md:py-1 rounded-lg truncate text-left shadow-sm border border-black/5 hover:brightness-95 active:scale-95 transition-all
                            ${type?.color || 'bg-gray-100 text-gray-800'}
                          `}
                          title={`${type?.name}: ${shift.startTime} - ${shift.endTime}`}
                        >
                          {isLibre ? 'LIBRE' : isReserva ? 'RESERVA' : isFormacion ? 'FORMACIÓN' : isVacaciones ? 'VACACIONES' : `${shift.startTime}-${shift.endTime}`}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Leyenda */}
      <div className="flex flex-wrap justify-center gap-8 mt-6 pb-6">
        <div className="flex items-center space-x-3 text-xs font-bold text-gray-400">
          <div 
            className={`w-5 h-5 rounded-lg border shadow-sm ${!isCustom ? theme.sundayBg + ' ' + theme.border : ''}`}
            style={isCustom ? { backgroundColor: hexToRgba(customColor, 0.05), borderColor: customDayBorderColor } : {}}
          ></div>
          <span className="tracking-wide">DOMINGO</span>
        </div>
        <div className="flex items-center space-x-3 text-xs font-bold text-gray-400">
          <div className="w-5 h-5 rounded-lg bg-emerald-50 border border-emerald-100 shadow-sm"></div>
          <span className="tracking-wide text-emerald-600/70">LIBRE / VACACIONES</span>
        </div>
        <div className="flex items-center space-x-3 text-xs font-bold text-gray-400">
          <div className="w-6 h-4 bg-orange-500 rounded text-[8px] text-white flex items-center justify-center font-black">EXCESOS</div>
          <span className="tracking-wide text-orange-600/70">DÍA CON EXCESO</span>
        </div>
        <div className="flex items-center space-x-3 text-xs font-bold text-gray-400">
          <div 
            className={`w-5 h-5 rounded-lg border shadow-md ${!isCustom ? theme.todayBg + ' ' + theme.todayBorder : ''}`}
            style={isCustom ? { ...dynamicStyles.todayCell } : {}}
          ></div>
          <span className={`tracking-wide ${!isCustom ? theme.todayText : ''}`} style={isCustom ? dynamicStyles.yearText : {}}>HOY</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
