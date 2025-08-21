import React, { useState, useMemo } from 'react';
import { Waste, WasteType, BusinessUnit } from '../types';
import { ReportIcon } from './icons';

interface WasteReportProps {
    wasteRecords: Waste[];
    units: BusinessUnit[];
}

const getWeekRange = (offset = 0) => {
    const now = new Date();
    now.setDate(now.getDate() + offset * 7);
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // Monday is 0, Sunday is 6
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return { startOfWeek, endOfWeek };
};

const WasteReport: React.FC<WasteReportProps> = ({ wasteRecords, units }) => {
    const [weekOffset, setWeekOffset] = useState(0);

    const { startOfWeek, endOfWeek } = useMemo(() => getWeekRange(weekOffset), [weekOffset]);

    const unitMap = useMemo(() => new Map(units.map(u => [u.id, u.name])), [units]);

    const filteredRecords = useMemo(() => {
        return wasteRecords.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= startOfWeek && recordDate <= endOfWeek;
        });
    }, [wasteRecords, startOfWeek, endOfWeek]);

    const summaryByType = useMemo(() => {
        const summary = {} as Record<string, { count: number; quantities: Record<string, number> }>;
        
        filteredRecords.forEach(r => {
            if (!summary[r.type]) summary[r.type] = { count: 0, quantities: {} };
            summary[r.type].count++;
            summary[r.type].quantities[r.unit] = (summary[r.type].quantities[r.unit] || 0) + r.quantity;
        });
        return summary;
    }, [filteredRecords]);

    const summaryByUnit = useMemo(() => {
        const summary = {} as Record<string, { count: number; quantities: Record<string, number> }>;
        filteredRecords.forEach(r => {
            if (!summary[r.unitId]) summary[r.unitId] = { count: 0, quantities: {} };
            summary[r.unitId].count++;
            summary[r.unitId].quantities[r.unit] = (summary[r.unitId].quantities[r.unit] || 0) + r.quantity;
        });
        return summary;
    }, [filteredRecords]);

    const totalByUnit = useMemo(() => {
        const totals = {} as Record<string, number>;
        filteredRecords.forEach(r => {
            totals[r.unit] = (totals[r.unit] || 0) + r.quantity;
        });
        return totals;
    }, [filteredRecords]);

    const renderQuantities = (quantities: Record<string, number>) => {
        const parts = Object.entries(quantities).map(([unit, qty]) => `${qty.toFixed(2)} ${unit}`);
        return parts.length > 0 ? parts.join(', ') : 'N/A';
    };

    return (
        <div className="container mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center"><ReportIcon /> <span className="ml-3">Reporte Semanal de Mermas</span></h1>
                        <p className="text-gray-600 dark:text-slate-300 mt-2 font-semibold text-blue-600 dark:text-blue-400">
                            {startOfWeek.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} - {endOfWeek.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={() => setWeekOffset(weekOffset - 1)} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 dark:text-slate-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 font-medium text-sm">{'<'} Ant</button>
                        <button onClick={() => setWeekOffset(0)} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 dark:text-slate-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 font-medium text-sm" disabled={weekOffset === 0}>Actual</button>
                        <button onClick={() => setWeekOffset(weekOffset + 1)} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 dark:text-slate-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 font-medium text-sm" disabled={weekOffset >= 0}>Sig {'>'}</button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-white mb-4">Totales Consolidados por Unidad</h2>
                <div className="flex flex-wrap gap-4">
                    {Object.keys(totalByUnit).length > 0 ? Object.entries(totalByUnit).map(([unit, qty]) => (
                        <div key={unit} className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg text-center">
                            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">{unit}</p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{qty.toFixed(2)}</p>
                        </div>
                    )) : <p className="text-gray-500 dark:text-slate-400">No hay datos de mermas para esta semana.</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-700 dark:text-white mb-4">Desglose por Tipo de Merma</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-slate-400">
                            <thead className="text-xs text-gray-700 dark:text-slate-300 uppercase bg-gray-50 dark:bg-slate-700">
                                <tr>
                                    <th className="px-4 py-2">Tipo</th>
                                    <th className="px-4 py-2">Registros</th>
                                    <th className="px-4 py-2">Cantidad Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(summaryByType).map(([type, data]) => (
                                    <tr key={type} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600">
                                        <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{type}</td>
                                        <td className="px-4 py-2">{data.count}</td>
                                        <td className="px-4 py-2">{renderQuantities(data.quantities)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-700 dark:text-white mb-4">Desglose por Unidad de Negocio</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-slate-400">
                            <thead className="text-xs text-gray-700 dark:text-slate-300 uppercase bg-gray-50 dark:bg-slate-700">
                                <tr>
                                    <th className="px-4 py-2">Unidad</th>
                                    <th className="px-4 py-2">Registros</th>
                                    <th className="px-4 py-2">Cantidad Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(summaryByUnit).map(([unitId, data]) => (
                                    <tr key={unitId} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600">
                                        <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{unitMap.get(unitId) || unitId}</td>
                                        <td className="px-4 py-2">{data.count}</td>
                                        <td className="px-4 py-2">{renderQuantities(data.quantities)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-white mb-4">Registro Detallado de Mermas</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-slate-400">
                        <thead className="text-xs text-gray-700 dark:text-slate-300 uppercase bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-6 py-3">Fecha</th>
                                <th className="px-6 py-3">Unidad</th>
                                <th className="px-6 py-3">Tipo</th>
                                <th className="px-6 py-3">Detalle</th>
                                <th className="px-6 py-3">Cantidad</th>
                                <th className="px-6 py-3">Responsable</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.length > 0 ? filteredRecords.map(r => (
                                <tr key={r.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600">
                                    <td className="px-6 py-4">{new Date(r.date).toLocaleDateString('es-ES')}</td>
                                    <td className="px-6 py-4">{unitMap.get(r.unitId) || r.unitId}</td>
                                    <td className="px-6 py-4">{r.type}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{r.relatedRecipeOrBatchName || r.description}</td>
                                    <td className="px-6 py-4">{r.quantity} {r.unit}</td>
                                    <td className="px-6 py-4">{r.responsibleUser}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-gray-500 dark:text-slate-400">No hay registros para esta semana.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WasteReport;
