
import React, { useState, useEffect, useCallback } from 'react';
import { Shift, ShiftType, ShiftVariable, AppState } from './types';
import { DEFAULT_SHIFT_TYPES, DEFAULT_VARIABLES, STORAGE_KEY, CALENDAR_THEMES } from './constants';
import Dashboard from './components/Dashboard';
import ShiftList from './components/ShiftList';
import ShiftForm from './components/ShiftForm';
import Settings from './components/Settings';
import Money from './components/Money';
import SmartEntryModal from './components/SmartEntryModal';
import { LayoutDashboardIcon, CalendarIcon, SettingsIcon, PlusIcon, WalletIcon } from './components/Icons';

type Tab = 'dashboard' | 'shifts' | 'informes' | 'settings' | 'add';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
    return {
      shifts: [],
      shiftTypes: DEFAULT_SHIFT_TYPES,
      variables: DEFAULT_VARIABLES,
      calendarThemeId: 'minimal',
      customThemeColor: '#4f46e5',
      customDayNameColor: '#9ca3af',
      customBgColor: '#ffffff',
      customDayNumberColor: '#1f2937',
      customHoverLineColor: '#4f46e5',
      customDayBorderColor: '#e5e7eb'
    };
  });

  const [isSmartEntryOpen, setIsSmartEntryOpen] = useState(false);
  const [smartEntryData, setSmartEntryData] = useState<Partial<Shift> | undefined>(undefined);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const handleSaveShift = useCallback((newShiftData: Omit<Shift, 'id'>) => {
    if (editingShiftId) {
      setState(prev => ({
        ...prev,
        shifts: prev.shifts.map(s => s.id === editingShiftId ? { ...newShiftData, id: editingShiftId } : s)
      }));
      setEditingShiftId(null);
    } else {
      const newShift: Shift = {
        ...newShiftData,
        id: `shift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      setState(prev => ({
        ...prev,
        shifts: [...prev.shifts, newShift]
      }));
    }
    
    // Al guardar, redirigimos directamente al Calendario
    setActiveTab('dashboard');
    setSmartEntryData(undefined);
  }, [editingShiftId]);

  const handleDeleteShift = useCallback((id: string) => {
    if (!id) return;
    setState(prev => ({
      ...prev,
      shifts: prev.shifts.filter(shift => shift.id !== id)
    }));
  }, []);

  const handleEditShift = useCallback((shift: Shift) => {
    setEditingShiftId(shift.id);
    setSmartEntryData(shift);
    setActiveTab('add');
  }, []);

  const handleSmartParsed = useCallback((data: any) => {
    setSmartEntryData(data);
    if (activeTab !== 'add') {
       setActiveTab('add');
    }
  }, [activeTab]);

  const handleAddShiftFromCalendar = useCallback((dateStr: string) => {
    setEditingShiftId(null);
    setSmartEntryData({ startDate: dateStr, endDate: dateStr });
    setActiveTab('add');
  }, []);

  const openNewShift = () => {
    setEditingShiftId(null);
    setSmartEntryData(undefined);
    setActiveTab('add');
  };

  const currentTheme = CALENDAR_THEMES.find(t => t.id === state.calendarThemeId) || CALENDAR_THEMES[0];

  return (
    <div className="flex h-screen bg-gray-50">
      <nav className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center space-x-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">
             <CalendarIcon className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">ShiftCash</h1>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <NavItem 
            icon={<LayoutDashboardIcon />} 
            label="Calendario" 
            isActive={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<CalendarIcon />} 
            label="Historial de Turnos" 
            isActive={activeTab === 'shifts'} 
            onClick={() => setActiveTab('shifts')} 
          />
          <NavItem 
            icon={<WalletIcon />} 
            label="Informes" 
            isActive={activeTab === 'informes'} 
            onClick={() => setActiveTab('informes')} 
          />
          <button
            onClick={openNewShift}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'add' && !editingShiftId ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <PlusIcon />
            <span>Añadir Turno</span>
          </button>
        </div>

        <div className="p-4 border-t border-gray-200">
           <NavItem 
            icon={<SettingsIcon />} 
            label="Configuración" 
            isActive={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
        </div>
      </nav>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center z-10">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded-md">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">ShiftCash</h1>
          </div>
          <button onClick={openNewShift} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full">
            <PlusIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto pb-24 md:pb-0">
            {activeTab === 'dashboard' && (
              <Dashboard 
                shifts={state.shifts} 
                shiftTypes={state.shiftTypes}
                onAddShift={handleAddShiftFromCalendar} 
                onEditShift={handleEditShift}
                theme={currentTheme}
                customColor={state.customThemeColor}
                customDayNameColor={state.customDayNameColor}
                customBgColor={state.customBgColor}
                customDayNumberColor={state.customDayNumberColor}
                customHoverLineColor={state.customHoverLineColor}
                customDayBorderColor={state.customDayBorderColor}
              />
            )}
            {activeTab === 'shifts' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">Historial de Turnos</h2>
                  <button onClick={openNewShift} className="md:hidden bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Añadir</button>
                </div>
                <ShiftList 
                  shifts={state.shifts} 
                  shiftTypes={state.shiftTypes} 
                  variables={state.variables} 
                  onEdit={handleEditShift}
                  onDelete={handleDeleteShift} 
                />
              </div>
            )}
            {activeTab === 'informes' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Informes</h2>
                <Money 
                  shifts={state.shifts} 
                  variables={state.variables} 
                  shiftTypes={state.shiftTypes}
                />
              </div>
            )}
            {activeTab === 'add' && (
              <div className="max-w-3xl mx-auto space-y-6">
                 <h2 className="text-2xl font-bold text-gray-800">{editingShiftId ? 'Editar Turno' : 'Nuevo Turno'}</h2>
                 <ShiftForm 
                    key={editingShiftId || (smartEntryData ? JSON.stringify(smartEntryData) : 'new_form')}
                    shiftTypes={state.shiftTypes}
                    variables={state.variables}
                    onSave={handleSaveShift}
                    onCancel={() => {
                      setActiveTab('dashboard');
                      setEditingShiftId(null);
                      setSmartEntryData(undefined);
                    }}
                    initialData={smartEntryData}
                    onOpenSmartEntry={() => setIsSmartEntryOpen(true)}
                 />
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Configuración</h2>
                <Settings 
                  shiftTypes={state.shiftTypes}
                  variables={state.variables}
                  calendarThemeId={state.calendarThemeId || 'minimal'}
                  customThemeColor={state.customThemeColor || '#4f46e5'}
                  customDayNameColor={state.customDayNameColor || '#9ca3af'}
                  customBgColor={state.customBgColor || '#ffffff'}
                  customDayNumberColor={state.customDayNumberColor || '#1f2937'}
                  customHoverLineColor={state.customHoverLineColor || '#4f46e5'}
                  customDayBorderColor={state.customDayBorderColor || '#e5e7eb'}
                  onUpdateShiftTypes={(types) => setState(prev => ({...prev, shiftTypes: types}))}
                  onUpdateVariables={(vars) => setState(prev => ({...prev, variables: vars}))}
                  onUpdateCalendarTheme={(themeId) => setState(prev => ({...prev, calendarThemeId: themeId}))}
                  onUpdateCustomColor={(color) => setState(prev => ({...prev, customThemeColor: color}))}
                  onUpdateCustomDayNameColor={(color) => setState(prev => ({...prev, customDayNameColor: color}))}
                  onUpdateCustomBgColor={(color) => setState(prev => ({...prev, customBgColor: color}))}
                  onUpdateCustomDayNumberColor={(color) => setState(prev => ({...prev, customDayNumberColor: color}))}
                  onUpdateCustomHoverLineColor={(color) => setState(prev => ({...prev, customHoverLineColor: color}))}
                  onUpdateCustomDayBorderColor={(color) => setState(prev => ({...prev, customDayBorderColor: color}))}
                  onFullStateImport={(fullState) => setState(fullState)}
                  currentState={state}
                />
              </div>
            )}
          </div>
        </div>

        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 pb-safe z-10">
           <MobileNavItem icon={<LayoutDashboardIcon />} isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
           <MobileNavItem icon={<CalendarIcon />} isActive={activeTab === 'shifts'} onClick={() => setActiveTab('shifts')} />
           <MobileNavItem icon={<WalletIcon />} isActive={activeTab === 'informes'} onClick={() => setActiveTab('informes')} />
           <MobileNavItem icon={<SettingsIcon />} isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </div>
      </main>

      <SmartEntryModal 
        isOpen={isSmartEntryOpen} 
        onClose={() => setIsSmartEntryOpen(false)}
        shiftTypes={state.shiftTypes}
        variables={state.variables}
        onParsed={handleSmartParsed}
      />
    </div>
  );
};

const NavItem = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
      isActive 
        ? 'bg-indigo-50 text-indigo-700' 
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    <div className={isActive ? 'text-indigo-600' : 'text-gray-400'}>{icon}</div>
    <span>{label}</span>
  </button>
);

const MobileNavItem = ({ icon, isActive, onClick }: { icon: React.ReactNode, isActive: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`p-3 rounded-xl flex items-center justify-center transition-colors ${
      isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'
    }`}
  >
    {icon}
  </button>
);

export default App;
