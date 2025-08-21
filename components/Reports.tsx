

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Batch } from '../types';
import { ReportIcon } from './icons';

interface ReportsProps {
    batches: Batch[];
}

const Reports: React.FC<ReportsProps> = ({ batches }) => {

    const productionByRecipe = useMemo(() => {
        const data: { [key: string]: { name: string, cantidad: number } } = {};
        batches.forEach(batch => {
            if (!data[batch.recipeName]) {
                data[batch.recipeName] = { name: batch.recipeName, cantidad: 0 };
            }
            data[batch.recipeName].cantidad += batch.quantity;
        });
        return Object.values(data);
    }, [batches]);

    return (
        <div className="container mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <ReportIcon />
                    <span className="ml-3">Reportes</span>
                </h1>
                <p className="text-gray-600 mt-2">Visualización de datos de producción.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-700 mb-4">Cantidad Total Producida por Receta</h2>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart
                            data={productionByRecipe}
                            margin={{
                                top: 5, right: 30, left: 20, bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="cantidad" fill="#3b82f6" name="Cantidad Producida" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Reports;