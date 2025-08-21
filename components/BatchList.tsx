
import React from 'react';
import { Link } from 'react-router-dom';
import { Batch } from '../types';
import { BatchIcon, UserIcon } from './icons';

interface BatchListProps {
    batches: Batch[];
}

const BatchList: React.FC<BatchListProps> = ({ batches }) => {

    const getExpiryDate = (productionDate: string, shelfLifeDays: number): Date => {
        const date = new Date(productionDate);
        date.setDate(date.getDate() + shelfLifeDays);
        return date;
    };
    
    const isExpired = (expiryDate: Date): boolean => {
      return new Date() > expiryDate;
    };


    return (
         <div className="container mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <BatchIcon />
                    <span className="ml-3">Lotes de Producción</span>
                </h1>
                <p className="text-gray-600 mt-2">Registro de todos los lotes generados.</p>
            </div>
             <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">ID Lote</th>
                                <th scope="col" className="px-6 py-3">Receta</th>
                                <th scope="col" className="px-6 py-3">Fecha Prod.</th>
                                <th scope="col" className="px-6 py-3">Fecha Cad.</th>
                                <th scope="col" className="px-6 py-3">Cantidad</th>
                                <th scope="col" className="px-6 py-3">Responsable</th>
                                <th scope="col" className="px-6 py-3">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {batches.map(batch => {
                                const expiryDate = getExpiryDate(batch.productionDate, batch.shelfLifeDays);
                                const expired = isExpired(expiryDate);
                                const now = new Date();
                                const isNearingExpiry = !expired && (expiryDate.getTime() - now.getTime()) < 24 * 60 * 60 * 1000;
                                
                                return (
                                <tr key={batch.id} className={`border-b ${expired ? 'bg-red-50 hover:bg-red-100' : isNearingExpiry ? 'bg-yellow-50 hover:bg-yellow-100' : 'bg-white'} transition-colors duration-200 hover:bg-gray-50`}>
                                    <td className="px-6 py-4 font-mono text-gray-700">
                                        <Link to={`/lotes/${batch.id}`} className="text-blue-600 hover:underline">
                                            {batch.id}
                                        </Link>
                                    </td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900">{batch.recipeName}</th>
                                    <td className="px-6 py-4">{new Date(batch.productionDate).toLocaleDateString('es-ES')}</td>
                                    <td className={`px-6 py-4 font-semibold ${expired ? 'text-red-600' : isNearingExpiry ? 'text-yellow-600' : 'text-green-600'}`}>
                                        {expiryDate.toLocaleDateString('es-ES')}
                                        {isNearingExpiry && <span className="ml-2 text-xs font-bold">(Vence pronto)</span>}
                                        {expired && <span className="ml-2 text-xs font-bold">(Vencido)</span>}
                                    </td>
                                    <td className="px-6 py-4">{batch.quantity} {batch.unit}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <UserIcon className="h-4 w-4 text-gray-400" />
                                            <span>{batch.responsibleUser}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => alert(`Imprimiendo etiqueta para lote ${batch.id}...`)} className="font-medium text-blue-600 hover:underline">
                                            Imprimir Etiqueta
                                        </button>
                                    </td>
                                </tr>
                                );
                             })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BatchList;