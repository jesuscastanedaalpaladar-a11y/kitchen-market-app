
import React, { useState, useMemo } from 'react';
import { Batch, Recipe } from '../types';
import { CalendarIcon, UserIcon } from './icons';

interface WeeklySummaryProps {
    batches: Batch[];
    recipes: Recipe[];
}

type FilterPeriod = 'this_week' | 'last_month';

const formatDuration = (totalSeconds: number) => {
    if (isNaN(totalSeconds) || totalSeconds < 0) return 'N/A';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
};

const WeeklySummary: React.FC<WeeklySummaryProps> = ({ batches, recipes }) => {
    const [filter, setFilter] = useState<FilterPeriod>('this_week');

    const recipesById = useMemo(() =>
        recipes.reduce((acc, recipe) => {
            acc[recipe.id] = recipe;
            return acc;
        }, {} as Record<string, Recipe>),
    [recipes]);

    const filteredBatches = useMemo(() => {
        const now = new Date();
        let startDate: Date;

        if (filter === 'this_week') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        } else { // last_month
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            now.setDate(0); // End of last month
        }
        startDate.setHours(0, 0, 0, 0);

        return batches
            .filter(batch => {
                const batchDate = new Date(batch.productionDate);
                return batchDate >= startDate && batchDate <= now;
            })
            .sort((a, b) => new Date(b.productionDate).getTime() - new Date(a.productionDate).getTime());
    }, [batches, filter]);

    return (
        <div className="container mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                            <CalendarIcon />
                            <span className="ml-3">Resumen de Producción</span>
                        </h1>
                        <p className="text-gray-600 mt-2">Concentrado de los lotes de producción generados.</p>
                    </div>
                    <div>
                        <label htmlFor="filter-period" className="sr-only">Filtrar periodo</label>
                        <select
                            id="filter-period"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as FilterPeriod)}
                             className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="this_week">Esta Semana</option>
                            <option value="last_month">Mes Pasado</option>
                        </select>
                    </div>
                </div>
            </div>
             <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Fecha</th>
                                <th scope="col" className="px-6 py-3">Receta</th>
                                <th scope="col" className="px-6 py-3">Cantidad Producida</th>
                                <th scope="col" className="px-6 py-3">Tiempo Real / Esperado</th>
                                <th scope="col" className="px-6 py-3">Responsable</th>
                                <th scope="col" className="px-6 py-3">ID Lote</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBatches.length > 0 ? filteredBatches.map(batch => {
                                const recipe = recipesById[batch.recipeId];
                                const expectedTimeSeconds = recipe ? recipe.prepTimeMinutes * 60 : 0;
                                const isOverTime = expectedTimeSeconds > 0 && batch.durationSeconds > expectedTimeSeconds;

                                return (
                                <tr key={batch.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">{new Date(batch.productionDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900">{batch.recipeName}</th>
                                    <td className="px-6 py-4">{batch.quantity} {batch.unit}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className={`font-bold ${isOverTime ? 'text-red-600' : 'text-green-600'}`}>{formatDuration(batch.durationSeconds)}</span>
                                            <span className="text-xs text-gray-500">Esperado: {formatDuration(expectedTimeSeconds)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <UserIcon className="h-4 w-4 text-gray-400" />
                                            <span>{batch.responsibleUser}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-gray-700">{batch.id}</td>
                                </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={6} className="text-center text-gray-500 py-10">
                                        No se encontraron producciones para el periodo seleccionado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WeeklySummary;