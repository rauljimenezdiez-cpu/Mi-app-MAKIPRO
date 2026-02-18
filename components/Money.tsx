
import React, { useState, useMemo } from 'react';
import { Shift, ShiftVariable, ShiftType } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { formatCurrency } from '../lib/utils';

interface MoneyProps {
  shifts: Shift[];
  variables: ShiftVariable[];
  shiftTypes: ShiftType[];
}

type ViewMode = 'monthly' | 'yearly';

const Money: React.FC<MoneyProps> = ({ shifts, variables, shiftTypes }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');

  const handlePrev = () => {
    if (viewMode === 'monthly') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear() - 1, 0, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'monthly') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear() + 1, 0, 1));
    }
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const stats = useMemo(() => {
    const periodShifts = shifts.filter(s => {
      const [y, m, d] = s.startDate.split('-');
      const dateObj = new Date(Number(y), Number(m)-1, Number(d));
      
      const yearMatch = dateObj.getFullYear() === year;
      if (viewMode === 'yearly') return yearMatch;
      
      const monthMatch = dateObj.getMonth() === month;
      return yearMatch && monthMatch;
    });

    // Recuento de DÍAS LIBRES
    const libreType = shiftTypes.find(t => t.name.toUpperCase() === 'LIBRE');
    const libreCount = periodShifts.filter(s => s.shiftTypeId === libreType?.id).length;

    // Recuento de VACACIONES
    const vacacionesType = shiftTypes.find(t => t.name.toUpperCase() === 'VACACIONES');
    const vacacionesCount = periodShifts.filter(s => s.shiftTypeId === vacacionesType?.id).length;

    // Recuento de RESERVA
    const reservaType = shiftTypes.find(t => t.name.toUpperCase() === 'RESERVA');
    const reservaCount = periodShifts.filter(s => s.shiftTypeId === reservaType?.id).length;

    // Recuento de FORMACIÓN
    const formacionType = shiftTypes.find(t => t.name.toUpperCase() === 'FORMACIÓN');
    const formacionCount = periodShifts.filter(s => s.shiftTypeId === formacionType?.id).length;

    // Recuento de todas las variables, incluyendo DOMINGO (v_sun)
    // Especial: EXCESOS (v_exc) cuenta los días con minutos de exceso
    const varCounts = variables
      .map(v => {
        let count = 0;
        if (v.id === 'v_exc') {
          // El usuario pidió que EXCESOS cuente los días que ha habido excesos
          count = periodShifts.filter(s => (s.excessMinutes || 0) > 0).length;
        } else {
          count = periodShifts.reduce((acc, s) => {
            return acc + s.variableIds.filter(id => id === v.id).length;
          }, 0);
        }
        return { id: v.id, name: v.name, count };
      });

    const totalEarnings = periodShifts.reduce((sum, shift) => sum + shift.totalEarnings, 0);
    const totalExcess = periodShifts.reduce((sum, shift) => sum + (shift.excessMinutes || 0), 0);

    return { 
      varCounts, 
      totalEarnings, 
      totalExcess,
      shiftCount: periodShifts.length, 
      libreCount, 
      vacacionesCount, 
      reservaCount, 
      formacionCount 
    };
  }, [shifts, currentDate, variables, shiftTypes, viewMode, month, year]);

  return (
    <div className="space-y-6">
      {/* Selector de periodo y vista */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3 border-b border-gray-100 bg-gray-50 gap-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-bold text-gray-800 capitalize min-w-[120px]">
              {viewMode === 'monthly' ? `${monthNames[month]} ${year}` : `Año ${year}`}
            </h2>
            <div className="flex bg-gray-200 p-1 rounded-lg">
              <button
                onClick={handlePrev}
                className="p-1 rounded-md hover:bg-white hover:shadow-sm text-gray-600 transition-all"
                aria-label="Anterior"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1 rounded-md hover:bg-white hover:shadow-sm text-gray-600 transition-all"
                aria-label="Siguiente"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex bg-indigo-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setViewMode('monthly')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'monthly' 
                ? 'bg-white text-indigo-700 shadow-sm' 
                : 'text-indigo-500 hover:text-indigo-700'
              }`}
            >
              MENSUAL
            </button>
            <button
              onClick={() => setViewMode('yearly')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'yearly' 
                ? 'bg-white text-indigo-700 shadow-sm' 
                : 'text-indigo-500 hover:text-indigo-700'
              }`}
            >
              ANUAL
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* Tarjeta de Ganancias Compacta */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 border border-indigo-500 rounded-xl p-6 text-white shadow-md relative overflow-hidden mb-8">
             <div className="absolute top-0 right-0 -mt-2 -mr-2 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
             
             <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
               <div>
                 <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mb-1">Ganancias Totales {viewMode === 'monthly' ? 'del Mes' : 'del Año'}</p>
                 <p className="text-4xl font-black drop-shadow-md">
                   {formatCurrency(stats.totalEarnings)}
                 </p>
               </div>
               <div className="flex flex-wrap gap-2">
                  <div className="bg-white/10 px-3 py-1 rounded-lg text-[11px] font-bold border border-white/10 backdrop-blur-sm">
                    {stats.shiftCount} TURNOS
                  </div>
                  {stats.totalExcess > 0 && (
                    <div className="bg-orange-500/30 px-3 py-1 rounded-lg text-[11px] font-bold border border-orange-400/30 backdrop-blur-sm text-orange-100">
                      {stats.totalExcess.toFixed(2)} MIN EXCESOS
                    </div>
                  )}
               </div>
             </div>
          </div>

          <h3 className="text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em] flex items-center">
            <span className="bg-indigo-600 w-1.5 h-1.5 rounded-full mr-2"></span>
            Recuento de Bonos y Variables
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {/* Recuento Especial: DÍAS LIBRES */}
            <div className="group bg-white p-3 rounded-xl shadow-sm border border-emerald-100 flex flex-col items-center justify-center text-center hover:shadow-md hover:border-emerald-200 transition-all duration-300">
              <p className="text-[9px] text-emerald-600 font-black uppercase tracking-tight mb-2 leading-none h-3 flex items-center justify-center text-balance px-1">
                DÍAS LIBRES
              </p>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-black ring-2 text-emerald-600 bg-emerald-50 ring-emerald-100/50 group-hover:scale-110 transition-transform">
                {stats.libreCount}
              </div>
            </div>

            {/* Recuento Especial: VACACIONES */}
            <div className="group bg-white p-3 rounded-xl shadow-sm border border-rose-100 flex flex-col items-center justify-center text-center hover:shadow-md hover:border-rose-200 transition-all duration-300">
              <p className="text-[9px] text-rose-600 font-black uppercase tracking-tight mb-2 leading-none h-3 flex items-center justify-center text-balance px-1">
                VACACIONES
              </p>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-black ring-2 text-rose-600 bg-rose-50 ring-rose-100/50 group-hover:scale-110 transition-transform">
                {stats.vacacionesCount}
              </div>
            </div>

            {/* Recuento Especial: RESERVA */}
            <div className="group bg-white p-3 rounded-xl shadow-sm border border-amber-100 flex flex-col items-center justify-center text-center hover:shadow-md hover:border-amber-200 transition-all duration-300">
              <p className="text-[9px] text-amber-600 font-black uppercase tracking-tight mb-2 leading-none h-3 flex items-center justify-center text-balance px-1">
                RESERVA
              </p>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-black ring-2 text-amber-600 bg-amber-50 ring-amber-100/50 group-hover:scale-110 transition-transform">
                {stats.reservaCount}
              </div>
            </div>

            {/* Recuento Especial: FORMACIÓN */}
            <div className="group bg-white p-3 rounded-xl shadow-sm border border-cyan-100 flex flex-col items-center justify-center text-center hover:shadow-md hover:border-cyan-200 transition-all duration-300">
              <p className="text-[9px] text-cyan-600 font-black uppercase tracking-tight mb-2 leading-none h-3 flex items-center justify-center text-balance px-1">
                FORMACIÓN
              </p>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-black ring-2 text-cyan-600 bg-cyan-50 ring-cyan-100/50 group-hover:scale-110 transition-transform">
                {stats.formacionCount}
              </div>
            </div>

            {/* Recuento de Variables (incluyendo domingos) */}
            {stats.varCounts.map((v, index) => {
              const colors = [
                'text-orange-600 bg-orange-50 ring-orange-100/50',
                'text-blue-600 bg-blue-50 ring-blue-100/50',
                'text-green-600 bg-green-50 ring-green-100/50',
                'text-purple-600 bg-purple-50 ring-purple-100/50',
                'text-yellow-700 bg-yellow-50 ring-yellow-100/50',
                'text-pink-600 bg-pink-50 ring-pink-100/50',
                'text-teal-600 bg-teal-50 ring-teal-100/50',
                'text-indigo-600 bg-indigo-50 ring-indigo-100/50'
              ];
              
              // Color especial para Domingo si es v_sun o EXCESOS si es v_exc
              const isSunday = v.id === 'v_sun';
              const isExcess = v.id === 'v_exc';
              
              let colorClass = colors[index % colors.length];
              if (isSunday) colorClass = 'text-red-600 bg-red-50 ring-red-100/50';
              if (isExcess) colorClass = 'text-orange-600 bg-orange-50 ring-orange-100/50';

              return (
                <div key={v.id} className={`group bg-white p-3 rounded-xl shadow-sm border flex flex-col items-center justify-center text-center hover:shadow-md transition-all duration-300 ${isSunday ? 'border-red-100' : isExcess ? 'border-orange-100' : 'border-gray-100'}`}>
                  <p className={`text-[9px] font-bold uppercase tracking-tight mb-2 leading-none h-3 flex items-center justify-center text-balance px-1 ${isSunday ? 'text-red-400' : isExcess ? 'text-orange-400' : 'text-gray-400'}`}>
                    {v.name}
                  </p>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-black ring-2 ${colorClass} group-hover:scale-110 transition-transform`}>
                    {v.count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {viewMode === 'yearly' && (
        <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <p className="text-[10px] text-amber-700 text-center font-bold uppercase tracking-wide">
            Estadísticas anuales {year}
          </p>
        </div>
      )}
    </div>
  );
};

export default Money;
