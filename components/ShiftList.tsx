
import React, { useState, useEffect } from 'react';
import { Shift, ShiftType, ShiftVariable } from '../types';
import { formatDate, formatCurrency } from '../lib/utils';
import { TrashIcon, EditIcon, CalendarIcon, PrinterIcon } from './Icons';

interface ShiftListProps {
  shifts: Shift[];
  shiftTypes: ShiftType[];
  variables: ShiftVariable[];
  onEdit: (shift: Shift) => void;
  onDelete: (id: string) => void;
}

const ShiftList: React.FC<ShiftListProps> = ({ shifts, shiftTypes, variables, onEdit, onDelete }) => {
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  useEffect(() => {
    if (confirmingDelete) {
      const timer = setTimeout(() => setConfirmingDelete(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmingDelete]);

  if (shifts.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <CalendarIcon className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">No hay turnos registrados aún.</p>
      </div>
    );
  }

  const sortedShifts = [...shifts].sort((a, b) => {
    if (a.startDate !== b.startDate) return b.startDate.localeCompare(a.startDate);
    return b.startTime.localeCompare(a.startTime);
  });

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const groupedShifts: { [key: string]: Shift[] } = {};
  sortedShifts.forEach(shift => {
    const [year, month] = shift.startDate.split('-');
    const key = `${monthNames[parseInt(month) - 1]} ${year}`;
    if (!groupedShifts[key]) groupedShifts[key] = [];
    groupedShifts[key].push(shift);
  });

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirmingDelete === id) {
      onDelete(id);
      setConfirmingDelete(null);
    } else {
      setConfirmingDelete(id);
    }
  };

  const handlePrint = (monthKey: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const monthShifts = groupedShifts[monthKey];
    const totalMonth = monthShifts.reduce((acc, s) => acc + s.totalEarnings, 0);

    printWindow.document.write(`
      <html>
        <head>
          <title>Informe de Turnos - ${monthKey}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { color: #4f46e5; border-bottom: 2px solid #eee; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #eee; padding: 12px; text-align: left; }
            th { background-color: #f9fafb; font-size: 10px; text-transform: uppercase; color: #666; }
            .total-row { font-weight: bold; background-color: #f3f4f6; }
            .time-label { font-size: 10px; color: #999; font-weight: normal; }
            .excess-label { font-size: 9px; color: #f97316; font-weight: bold; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Informe de Turnos: ${monthKey}</h1>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Horario (Teórico / Real)</th>
                <th>Tipo</th>
                <th>Bonos</th>
                <th>Horas</th>
                <th>Total (€)</th>
              </tr>
            </thead>
            <tbody>
              ${monthShifts.map(s => {
                const type = shiftTypes.find(t => t.id === s.shiftTypeId);
                const vars = s.variableIds.map(vid => variables.find(v => v.id === vid)?.name).filter(Boolean).join(', ');
                const hasReal = s.realEndTime;
                const excess = s.excessMinutes || 0;
                return `
                  <tr>
                    <td>${formatDate(s.startDate)}</td>
                    <td>
                      <div>T: ${s.startTime} - ${s.endTime}</div>
                      ${hasReal ? `<div class="time-label">R: ${s.realEndTime} ${excess > 0 ? `<span class="excess-label">(+${excess.toFixed(2)} EXC)</span>` : ''}</div>` : ''}
                    </td>
                    <td>${type?.name || '-'}</td>
                    <td>${vars || '-'}</td>
                    <td>${s.hoursWorked}h</td>
                    <td>${formatCurrency(s.totalEarnings)}</td>
                  </tr>
                `;
              }).join('')}
              <tr class="total-row">
                <td colspan="5" style="text-align: right">TOTAL ACUMULADO:</td>
                <td>${formatCurrency(totalMonth)}</td>
              </tr>
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedShifts).map(([monthGroup, monthShifts]) => (
        <div key={monthGroup} className="space-y-3 print:break-after-page">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest flex items-center">
              <span className="bg-indigo-500 w-2 h-2 rounded-full mr-2"></span>
              {monthGroup}
            </h3>
            <button 
              onClick={() => handlePrint(monthGroup)}
              className="flex items-center space-x-1 text-[10px] font-bold text-gray-400 hover:text-indigo-600 transition-colors bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm"
            >
              <PrinterIcon className="w-3 h-3" />
              <span>IMPRIMIR</span>
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Horario</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tipo</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bonos Extra</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {monthShifts.map((shift) => {
                    const type = shiftTypes.find(t => t.id === shift.shiftTypeId);
                    const isConfirming = confirmingDelete === shift.id;
                    const hasReal = shift.realEndTime;
                    const excess = shift.excessMinutes || 0;

                    return (
                      <tr key={shift.id} className="group hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-gray-800 text-xs">{formatDate(shift.startDate)}</div>
                          <div className="text-[10px] text-gray-400 flex flex-col">
                             <span>T: {shift.startTime} - {shift.endTime}</span>
                             {hasReal && (
                               <div className="flex items-center space-x-1 mt-0.5">
                                 <span className="text-indigo-400 font-bold">R: {shift.realEndTime}</span>
                                 {excess > 0 && (
                                   <span className="bg-orange-100 text-orange-600 text-[8px] px-1 rounded font-black uppercase">
                                     +{excess.toFixed(2)} MIN EXC
                                   </span>
                                 )}
                               </div>
                             )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-[9px] font-black uppercase ${type?.color || 'bg-gray-100'}`}>
                            {type?.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {shift.variableIds.length > 0 ? (
                              shift.variableIds.map((vid, idx) => (
                                <span key={idx} className="text-[9px] bg-gray-100 px-1 rounded font-bold uppercase text-gray-500">
                                  {variables.find(v => v.id === vid)?.name}
                                </span>
                              ))
                            ) : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="font-black text-gray-900 text-sm">{formatCurrency(shift.totalEarnings)}</div>
                          <div className="text-[9px] text-gray-400 font-bold">{shift.hoursWorked}h</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end items-center space-x-1">
                            {!isConfirming && (
                              <button onClick={() => onEdit(shift)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                <EditIcon className="w-4 h-4" />
                              </button>
                            )}
                            
                            <button 
                              onClick={(e) => handleDeleteClick(e, shift.id)}
                              className={`
                                flex items-center justify-center transition-all duration-200 rounded-lg overflow-hidden
                                ${isConfirming 
                                  ? 'bg-red-600 text-white px-3 py-1.5 shadow-lg scale-105' 
                                  : 'p-1.5 text-red-300 hover:bg-red-50 hover:text-red-600'}
                              `}
                            >
                              <TrashIcon className={`w-4 h-4 ${isConfirming ? 'mr-2' : ''}`} />
                              {isConfirming && <span className="text-[10px] font-black uppercase tracking-tighter">BORRAR</span>}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShiftList;
