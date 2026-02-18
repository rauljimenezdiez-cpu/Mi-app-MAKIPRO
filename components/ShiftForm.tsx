
import React, { useState, useEffect } from 'react';
import { Shift, ShiftType, ShiftVariable } from '../types';
import { calculateHours, calculateEarnings, calculateExcessMinutes } from '../lib/utils';
import { SparklesIcon } from './Icons';

interface ShiftFormProps {
  shiftTypes: ShiftType[];
  variables: ShiftVariable[];
  onSave: (shift: Omit<Shift, 'id'>) => void;
  onCancel: () => void;
  initialData?: Partial<Shift>;
  onOpenSmartEntry: () => void;
}

const ShiftForm: React.FC<ShiftFormProps> = ({ shiftTypes, variables, onSave, onCancel, initialData, onOpenSmartEntry }) => {
  const defaultDate = new Date().toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(initialData?.startDate || defaultDate);
  const [startTime, setStartTime] = useState(initialData?.startTime || '09:00');
  const [endDate, setEndDate] = useState(initialData?.endDate || initialData?.startDate || defaultDate);
  const [endTime, setEndTime] = useState(initialData?.endTime || '17:00');
  
  const [realEndDate, setRealEndDate] = useState(initialData?.realEndDate || initialData?.endDate || initialData?.startDate || defaultDate);
  const [realEndTime, setRealEndTime] = useState(initialData?.realEndTime || initialData?.endTime || '17:00');
  
  // Flag para saber si el usuario ha tocado manualmente el final real
  const [isRealEndModified, setIsRealEndModified] = useState(
    initialData?.realEndDate !== undefined && 
    (initialData.realEndDate !== initialData.endDate || initialData.realEndTime !== initialData.endTime)
  );
  
  const [shiftTypeId, setShiftTypeId] = useState(initialData?.shiftTypeId || '');
  const [variableIds, setVariableIds] = useState<string[]>(initialData?.variableIds || []);
  const [notes, setNotes] = useState(initialData?.notes || '');

  const [previewHours, setPreviewHours] = useState(0);
  const [previewEarnings, setPreviewEarnings] = useState(0);
  const [previewExcess, setPreviewExcess] = useState(0);

  const selectedType = shiftTypes.find(t => t.id === shiftTypeId);
  const typeName = selectedType?.name.toUpperCase() || '';
  const isLibre = typeName === 'LIBRE';
  const isVacaciones = typeName === 'VACACIONES';
  const isSpecial = isLibre || isVacaciones;

  const isIda = typeName === 'IDA';
  const isVuelta = typeName === 'VUELTA';
  const isIdaVuelta = typeName === 'IDA/VUELTA';
  
  const [y, m, d] = startDate.split('-');
  const isSunday = new Date(Number(y), Number(m)-1, Number(d)).getDay() === 0;

  // Sincronizar fechas si la de inicio cambia
  useEffect(() => {
    if (startDate > endDate) {
      setEndDate(startDate);
      if (!isRealEndModified) setRealEndDate(startDate);
    }
    if (startDate > realEndDate) {
      setRealEndDate(startDate);
    }
  }, [startDate, endDate, realEndDate, isRealEndModified]);

  useEffect(() => {
    if (startDate && startTime && realEndDate && realEndTime) {
      const hours = calculateHours(startDate, startTime, realEndDate, realEndTime);
      setPreviewHours(hours);
      
      const excess = calculateExcessMinutes(startDate, startTime, realEndDate, realEndTime);
      setPreviewExcess(excess);

      if (isSpecial) {
        if (variableIds.length > 0) setVariableIds([]);
        setPreviewEarnings(0);
        return;
      }

      let updatedVariableIds = [...variableIds];
      let hasChanges = false;
      
      const shouldHaveTl1 = hours > 8 && hours <= 9;
      const shouldHaveTl2 = hours > 9;
      const shouldHavePi = hours > 9.5;

      if (isSunday && !updatedVariableIds.includes('v_sun')) {
        updatedVariableIds.push('v_sun');
        hasChanges = true;
      } else if (!isSunday && updatedVariableIds.includes('v_sun')) {
        updatedVariableIds = updatedVariableIds.filter(id => id !== 'v_sun');
        hasChanges = true;
      }

      if (shouldHaveTl1 && !updatedVariableIds.includes('v_tl1')) {
        updatedVariableIds.push('v_tl1');
        hasChanges = true;
      } else if (!shouldHaveTl1 && updatedVariableIds.includes('v_tl1')) {
        updatedVariableIds = updatedVariableIds.filter(id => id !== 'v_tl1');
        hasChanges = true;
      }

      if (shouldHaveTl2 && !updatedVariableIds.includes('v_tl2')) {
        updatedVariableIds.push('v_tl2');
        hasChanges = true;
      } else if (!shouldHaveTl2 && updatedVariableIds.includes('v_tl2')) {
        updatedVariableIds = updatedVariableIds.filter(id => id !== 'v_tl2');
        hasChanges = true;
      }

      if (shouldHavePi && !updatedVariableIds.includes('v_pi')) {
        updatedVariableIds.push('v_pi');
        hasChanges = true;
      } else if (!shouldHavePi && updatedVariableIds.includes('v_pi')) {
        updatedVariableIds = updatedVariableIds.filter(id => id !== 'v_pi');
        hasChanges = true;
      }

      let targetDcpCount = 0;
      if (isIda) {
        targetDcpCount = startTime >= '15:00' ? 1 : 2;
      } else if (isVuelta) {
        if (realEndTime > '21:00') {
          targetDcpCount = 2;
        } else if (realEndTime >= '13:00') {
          targetDcpCount = 1;
        }
      }

      const currentDcpCount = updatedVariableIds.filter(id => id === 'v_dcp').length;
      if (currentDcpCount !== targetDcpCount) {
        updatedVariableIds = updatedVariableIds.filter(id => id !== 'v_dcp');
        for (let i = 0; i < targetDcpCount; i++) {
          updatedVariableIds.push('v_dcp');
        }
        hasChanges = true;
      }

      const currentDspCount = updatedVariableIds.filter(id => id === 'v_dsp').length;
      const targetDspCount = isIdaVuelta ? 1 : 0;
      if (currentDspCount !== targetDspCount) {
        updatedVariableIds = updatedVariableIds.filter(id => id !== 'v_dsp');
        if (targetDspCount > 0) updatedVariableIds.push('v_dsp');
        hasChanges = true;
      }

      if (hasChanges) {
        setVariableIds(updatedVariableIds);
        return; 
      }
      
      if (shiftTypeId) {
        const type = shiftTypes.find(t => t.id === shiftTypeId);
        const appliedVars = variableIds.map(id => variables.find(v => v.id === id)).filter(Boolean) as ShiftVariable[];
        const sundayVar = variables.find(v => v.id === 'v_sun');
        
        if (type) {
          setPreviewEarnings(calculateEarnings(startDate, hours, type, appliedVars, sundayVar?.amount));
        }
      }
    }
  }, [startDate, startTime, endDate, endTime, realEndDate, realEndTime, shiftTypeId, variableIds, shiftTypes, variables, isIda, isVuelta, isIdaVuelta, isSunday, isSpecial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftTypeId) return;
    onSave({
      startDate, startTime, endDate, endTime,
      realEndDate, realEndTime,
      shiftTypeId, variableIds, notes,
      hoursWorked: previewHours,
      totalEarnings: previewEarnings,
      excessMinutes: previewExcess
    });
  };

  const toggleVariable = (id: string) => {
    if (isSpecial) return;
    setVariableIds(prev => 
      prev.includes(id) ? prev.filter(vId => vId !== id) : [...prev, id]
    );
  };

  const handleTheoreticalDateChange = (val: string) => {
    setEndDate(val);
    if (!isRealEndModified) {
      setRealEndDate(val);
    }
  };

  const handleTheoreticalTimeChange = (val: string) => {
    setEndTime(val);
    if (!isRealEndModified) {
      setRealEndTime(val);
    }
  };

  const handleRealDateChange = (val: string) => {
    setRealEndDate(val);
    setIsRealEndModified(true);
  };

  const handleRealTimeChange = (val: string) => {
    setRealEndTime(val);
    setIsRealEndModified(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800">Registrar Turno</h3>
        <button type="button" onClick={onOpenSmartEntry} className="flex items-center space-x-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors">
          <SparklesIcon className="w-4 h-4" />
          <span className="hidden sm:inline">IA Relleno Inteligente</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h4 className="text-[10px] font-black text-indigo-500 mb-3 uppercase tracking-widest">Inicio</h4>
            <div className="flex flex-col space-y-2">
              <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm" />
              <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm" />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
             <h4 className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest">Fin Turno (Teórico)</h4>
             <div className="flex flex-col space-y-2">
                <input type="date" required min={startDate} value={endDate} onChange={e => handleTheoreticalDateChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm" />
                <input type="time" required value={endTime} onChange={e => handleTheoreticalTimeChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm" />
            </div>
          </div>

          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
             <h4 className="text-[10px] font-black text-indigo-600 mb-3 uppercase tracking-widest">Fin Turno Real</h4>
             <div className="flex flex-col space-y-2">
                <input type="date" required min={startDate} value={realEndDate} onChange={e => handleRealDateChange(e.target.value)} className="w-full px-3 py-2 border border-indigo-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm" />
                <input type="time" required value={realEndTime} onChange={e => handleRealTimeChange(e.target.value)} className="w-full px-3 py-2 border border-indigo-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm" />
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Trayecto / Turno</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {shiftTypes.map(type => (
              <label key={type.id} className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center justify-center text-center transition-all ${shiftTypeId === type.id ? 'border-indigo-500 ring-2 bg-indigo-50 shadow-sm' : 'border-gray-200 hover:border-indigo-300'}`}>
                <input type="radio" name="shiftType" value={type.id} checked={shiftTypeId === type.id} onChange={() => setShiftTypeId(type.id)} className="sr-only" />
                <span className="font-medium text-sm">{type.name}</span>
                <span className="text-[10px] mt-1 opacity-60">{ (type.name.toUpperCase() === 'LIBRE' || type.name.toUpperCase() === 'VACACIONES') ? '0' : type.dailyRate}€</span>
              </label>
            ))}
          </div>
        </div>

        <div className={isSpecial ? 'opacity-50 pointer-events-none' : ''}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bonos Automáticos y Variables {isSpecial && `(Desactivado para ${typeName})`}
          </label>
          <div className="flex flex-wrap gap-2">
            {variables.map(v => {
              const count = variableIds.filter(vid => vid === v.id).length;
              const isSelected = count > 0;
              const isAuto = !isSpecial && (
                (v.id === 'v_sun' && isSunday) ||
                (v.id === 'v_tl1' && previewHours > 8 && previewHours <= 9) ||
                (v.id === 'v_tl2' && previewHours > 9) ||
                (v.id === 'v_pi' && previewHours > 9.5)
              );
              
              return (
                <button 
                  key={v.id} 
                  type="button" 
                  onClick={() => toggleVariable(v.id)} 
                  disabled={isSpecial}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black border transition-all uppercase tracking-tighter ${isSelected ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-gray-600 border-gray-200'} ${isAuto ? 'ring-2 ring-indigo-400' : ''}`}
                >
                  {v.name} {count > 1 && `x${count}`}
                  {isAuto && " 🤖"}
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-indigo-50 -mx-6 -mb-6 p-6 mt-6 flex flex-col md:flex-row items-center justify-between border-t border-indigo-100">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-indigo-600 font-bold uppercase tracking-widest">Resumen del Turno Real</p>
            <p className="text-2xl font-black text-indigo-900">{previewHours}h = {previewEarnings}€</p>
            {previewExcess > 0 && (
              <p className="text-[11px] text-orange-600 font-black uppercase mt-1">+{previewExcess.toFixed(2)} min Excesos Compensados</p>
            )}
            <p className="text-[10px] text-indigo-400 mt-1 uppercase font-bold">* Cálculos basados en el horario real</p>
          </div>
          <div className="flex space-x-3 w-full md:w-auto">
            <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white">Cancelar</button>
            <button type="submit" disabled={!shiftTypeId} className="flex-1 px-6 py-2 bg-indigo-600 text-white font-bold rounded-md disabled:opacity-50">Guardar Turno</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ShiftForm;
