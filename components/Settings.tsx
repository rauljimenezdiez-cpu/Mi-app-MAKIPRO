
import React, { useRef } from 'react';
import { ShiftType, ShiftVariable, VariableType, AppState } from '../types';
import { TrashIcon, PlusIcon, SparklesIcon, CalendarIcon } from './Icons';
import { CALENDAR_THEMES } from '../constants';

interface SettingsProps {
  shiftTypes: ShiftType[];
  variables: ShiftVariable[];
  calendarThemeId: string;
  customThemeColor: string;
  customDayNameColor: string;
  customBgColor: string;
  customDayNumberColor: string;
  customHoverLineColor: string;
  customDayBorderColor: string;
  onUpdateShiftTypes: (types: ShiftType[]) => void;
  onUpdateVariables: (vars: ShiftVariable[]) => void;
  onUpdateCalendarTheme: (themeId: string) => void;
  onUpdateCustomColor: (color: string) => void;
  onUpdateCustomDayNameColor: (color: string) => void;
  onUpdateCustomBgColor: (color: string) => void;
  onUpdateCustomDayNumberColor: (color: string) => void;
  onUpdateCustomHoverLineColor: (color: string) => void;
  onUpdateCustomDayBorderColor: (color: string) => void;
  // Añadimos prop para actualizar todo el estado (para importación)
  onFullStateImport?: (state: AppState) => void;
  currentState?: AppState;
}

const CORE_VARIABLE_IDS = ['v_exc', 'v_tl1', 'v_tl2', 'v_tdl', 'v_pi', 'v_dcp', 'v_dsp', 'v_de', 'v_sun'];

const Settings: React.FC<SettingsProps> = ({ 
  shiftTypes, 
  variables, 
  calendarThemeId,
  customThemeColor,
  customDayNameColor,
  customBgColor,
  customDayNumberColor,
  customHoverLineColor,
  customDayBorderColor,
  onUpdateShiftTypes, 
  onUpdateVariables,
  onUpdateCalendarTheme,
  onUpdateCustomColor,
  onUpdateCustomDayNameColor,
  onUpdateCustomBgColor,
  onUpdateCustomDayNumberColor,
  onUpdateCustomHoverLineColor,
  onUpdateCustomDayBorderColor,
  onFullStateImport,
  currentState
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddType = () => {
    const newType: ShiftType = {
      id: `t_${Date.now()}`,
      name: 'Nuevo Turno',
      dailyRate: 15,
      color: 'bg-gray-100 text-gray-800'
    };
    onUpdateShiftTypes([...shiftTypes, newType]);
  };

  const handleUpdateType = (id: string, field: keyof ShiftType, value: any) => {
    onUpdateShiftTypes(shiftTypes.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleDeleteType = (id: string) => {
    onUpdateShiftTypes(shiftTypes.filter(t => t.id !== id));
  };

  const handleAddVar = () => {
    const newVar: ShiftVariable = {
      id: `v_${Date.now()}`,
      name: 'NUEVO BONO',
      type: 'fixed',
      amount: 0
    };
    onUpdateVariables([...variables, newVar]);
  };

  const handleUpdateVar = (id: string, field: keyof ShiftVariable, value: any) => {
    onUpdateVariables(variables.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleDeleteVar = (id: string) => {
    onUpdateVariables(variables.filter(v => v.id !== id));
  };

  const handleExportData = () => {
    if (!currentState) return;
    const dataStr = JSON.stringify(currentState, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `shiftcash_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.shifts && json.shiftTypes && onFullStateImport) {
          if (window.confirm('¿Estás seguro de que quieres importar estos datos? Se sobrescribirá tu información actual.')) {
            onFullStateImport(json);
            alert('Datos importados correctamente.');
          }
        } else {
          alert('El archivo no parece ser una copia de seguridad válida de ShiftCash.');
        }
      } catch (err) {
        alert('Error al leer el archivo. Asegúrate de que es un archivo JSON válido.');
      }
    };
    reader.readAsText(file);
    // Reset value to allow importing the same file again if needed
    event.target.value = '';
  };

  const typeColors = [
    'bg-gray-100 text-gray-800',
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-orange-100 text-orange-800',
    'bg-indigo-100 text-indigo-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      
      {/* SECCIÓN 0: COPIA DE SEGURIDAD */}
      <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-emerald-100 bg-emerald-50">
          <h3 className="text-lg font-bold text-emerald-900">Salvar y Restaurar Datos</h3>
          <p className="text-sm text-emerald-600 mt-1">Descarga una copia de seguridad de todos tus turnos y configuraciones.</p>
        </div>
        <div className="p-6 flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleExportData}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>EXPORTAR COPIA (.JSON)</span>
          </button>
          
          <button 
            onClick={handleImportClick}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold rounded-xl transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>IMPORTAR COPIA</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileImport} 
            accept=".json" 
            className="hidden" 
          />
        </div>
      </div>

      {/* SECCIÓN: TEMA DEL CALENDARIO */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">Tema del Calendario</h3>
          <p className="text-sm text-gray-500 mt-1">Elige un estilo predefinido o crea el tuyo propio con control total.</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
            {CALENDAR_THEMES.map(theme => {
              const isSelected = calendarThemeId === theme.id;
              const isCustom = theme.id === 'custom';
              
              return (
                <div key={theme.id} className="relative group">
                  <button
                    onClick={() => onUpdateCalendarTheme(theme.id)}
                    className={`w-full flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      isSelected ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div className="relative">
                      <div 
                        className={`w-12 h-12 rounded-full border border-gray-100 shadow-inner overflow-hidden flex items-center justify-center ${theme.bg === 'bg-[#0f172a]' ? 'bg-[#0f172a]' : theme.bg}`}
                        style={isCustom ? { backgroundColor: customThemeColor } : {}}
                      >
                        {isCustom && (
                          <SparklesIcon className="w-6 h-6 text-white/50" />
                        )}
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${isSelected ? 'text-indigo-700' : 'text-gray-600'}`}>
                      {theme.name}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
          
          {calendarThemeId === 'custom' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center space-x-2 text-indigo-900 mb-4">
                 <SparklesIcon className="w-5 h-5" />
                 <h4 className="font-black uppercase text-xs tracking-widest">Personalización Avanzada</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-700">Color de Acento</span>
                    <span className="text-[10px] text-gray-400">Bordes y Año</span>
                  </div>
                  <input 
                    type="color" 
                    value={customThemeColor} 
                    onChange={(e) => onUpdateCustomColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer p-0.5 border border-gray-200"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-700">Fondo General</span>
                    <span className="text-[10px] text-gray-400">Color base</span>
                  </div>
                  <input 
                    type="color" 
                    value={customBgColor} 
                    onChange={(e) => onUpdateCustomBgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer p-0.5 border border-gray-200"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-700">Días Semana</span>
                    <span className="text-[10px] text-gray-400">Lun, Mar...</span>
                  </div>
                  <input 
                    type="color" 
                    value={customDayNameColor} 
                    onChange={(e) => onUpdateCustomDayNameColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer p-0.5 border border-gray-200"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-700">Números Días</span>
                    <span className="text-[10px] text-gray-400">1, 2, 3...</span>
                  </div>
                  <input 
                    type="color" 
                    value={customDayNumberColor} 
                    onChange={(e) => onUpdateCustomDayNumberColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer p-0.5 border border-gray-200"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-indigo-200 shadow-sm ring-2 ring-indigo-50">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-indigo-700">Línea Enfoque</span>
                    <span className="text-[10px] text-indigo-400">Color al pasar ratón</span>
                  </div>
                  <input 
                    type="color" 
                    value={customHoverLineColor} 
                    onChange={(e) => onUpdateCustomHoverLineColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer p-0.5 border border-indigo-200"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-700">Borde del Día</span>
                    <span className="text-[10px] text-gray-400">Borde de cada cuadro</span>
                  </div>
                  <input 
                    type="color" 
                    value={customDayBorderColor} 
                    onChange={(e) => onUpdateCustomDayBorderColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer p-0.5 border border-gray-200"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN: PRECIOS DE VARIABLES Y BONOS */}
      <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-indigo-100 flex justify-between items-center bg-indigo-50">
          <div>
            <h3 className="text-lg font-bold text-indigo-900">Precios de Variables y Bonos</h3>
            <p className="text-sm text-indigo-600 mt-1">Configura el dinero que sumará cada concepto extra.</p>
          </div>
          <button onClick={handleAddVar} className="hidden sm:flex items-center space-x-1 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md transition-colors">
            <PlusIcon className="w-4 h-4" /> <span>Añadir Variable</span>
          </button>
        </div>
        
        <div className="p-0 sm:p-6">
          <div className="divide-y divide-gray-100">
            {variables.map(v => {
              const isCore = CORE_VARIABLE_IDS.includes(v.id);
              return (
                <div key={v.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 w-full">
                    {isCore ? (
                      <div>
                        <p className="font-bold text-gray-800 uppercase tracking-wide">{v.name}</p>
                        <p className="text-xs text-gray-500 mt-1">Variable del sistema</p>
                      </div>
                    ) : (
                      <input 
                        type="text" 
                        value={v.name} 
                        onChange={e => handleUpdateVar(v.id, 'name', e.target.value.toUpperCase())}
                        className="w-full font-bold text-gray-800 uppercase tracking-wide px-0 py-1 border-0 border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent"
                        placeholder="NOMBRE DE LA VARIABLE"
                      />
                    )}
                  </div>
                  <div className="flex items-center space-x-3 w-full sm:w-auto bg-gray-100 p-2 rounded-lg">
                    <select 
                      value={v.type}
                      onChange={e => handleUpdateVar(v.id, 'type', e.target.value as VariableType)}
                      className="text-sm font-medium px-2 py-1.5 border-none bg-transparent text-gray-600 focus:ring-0 cursor-pointer"
                    >
                      <option value="fixed">Fijo Total</option>
                      <option value="hourly_bonus">Por Hora</option>
                    </select>
                    <div className="flex items-center bg-white border border-gray-300 rounded overflow-hidden shadow-sm">
                      <input 
                        type="number" 
                        value={v.amount}
                        onChange={e => handleUpdateVar(v.id, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-20 px-3 py-1.5 outline-none font-bold text-indigo-700 text-right"
                        min="0" step="0.5"
                      />
                      <span className="px-3 text-gray-500 bg-gray-50 border-l border-gray-200 font-medium">
                        {v.type === 'hourly_bonus' ? '€/h' : '€'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto flex justify-end">
                    <button 
                      onClick={() => !isCore && handleDeleteVar(v.id)} 
                      disabled={isCore}
                      className={`p-2 rounded transition-colors ${isCore ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50 hover:text-red-700'}`}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECCIÓN: TIPOS DE TURNOS BASE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Tipos de Turnos Base</h3>
          </div>
          <button onClick={handleAddType} className="hidden sm:flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-2 rounded-md hover:bg-gray-100">
            <PlusIcon className="w-4 h-4" /> <span>Añadir</span>
          </button>
        </div>
        <div className="p-6 space-y-4">
          {shiftTypes.map(type => (
            <div key={type.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <input 
                type="text" 
                value={type.name} 
                onChange={e => handleUpdateType(type.id, 'name', e.target.value)}
                className="flex-1 w-full sm:w-auto px-3 py-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 font-medium"
              />
              <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center bg-white border border-gray-300 rounded overflow-hidden">
                  <span className="px-3 py-2 text-gray-500 bg-gray-50 border-r border-gray-300 font-medium">Tarifa:</span>
                  <input 
                    type="number" 
                    value={type.dailyRate}
                    onChange={e => handleUpdateType(type.id, 'dailyRate', parseFloat(e.target.value) || 0)}
                    className="w-20 px-3 py-2 outline-none font-bold text-gray-800 text-right"
                  />
                  <span className="px-3 py-2 text-gray-500 bg-gray-50 border-l border-gray-300">€</span>
                </div>
                <select 
                  value={type.color}
                  onChange={e => handleUpdateType(type.id, 'color', e.target.value)}
                  className={`w-10 h-10 px-1 py-1 border border-gray-300 rounded-full cursor-pointer appearance-none text-transparent ${type.color} bg-opacity-100`}
                >
                  {typeColors.map(c => <option key={c} value={c} className={c}>Color</option>)}
                </select>
                <button onClick={() => handleDeleteType(type.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
