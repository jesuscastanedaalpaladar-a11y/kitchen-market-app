
import React, { useState } from 'react';
import { Recipe, Batch, Waste, WasteType, BusinessUnit } from '../types';
import { WasteIcon } from './icons';
import { MOCK_UNITS } from '../services/mockData';

interface WasteLogProps {
    recipes: Recipe[];
    batches: Batch[];
    onAddWaste: (wasteData: Omit<Waste, 'id' | 'date' | 'responsibleUser'>) => void;
    units: BusinessUnit[];
}

const WasteLog: React.FC<WasteLogProps> = ({ recipes, batches, onAddWaste, units }) => {
    const [unitId, setUnitId] = useState(units[0]?.id || '');
    const [type, setType] = useState<WasteType>(WasteType.Preparacion);
    const [relatedId, setRelatedId] = useState('');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [unit, setUnit] = useState(MOCK_UNITS[0] || '');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!unitId || !type || !quantity || !unit || (!relatedId && !description.trim())) {
            alert('Por favor, completa los campos requeridos. Debes seleccionar una receta/lote o añadir una descripción.');
            return;
        }

        let relatedName = '';
        if (relatedId) {
            const select = document.getElementById('related') as HTMLSelectElement;
            if (select.selectedIndex > 0) { // Check if something other than "Ninguno" is selected
                 relatedName = select.options[select.selectedIndex].text;
            }
        }

        onAddWaste({
            unitId,
            type,
            relatedRecipeOrBatchId: relatedId || undefined,
            relatedRecipeOrBatchName: relatedName || undefined,
            quantity,
            unit,
            description: description.trim() || undefined,
        });

        // Reset form
        setRelatedId('');
        setQuantity('');
        setDescription('');
        setUnitId(units[0]?.id || '');
        setType(WasteType.Preparacion);
        setUnit(MOCK_UNITS[0] || '');
    };

    return (
        <div className="container mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <WasteIcon /> <span className="ml-3">Registro de Mermas</span>
                </h1>
                <p className="text-gray-600 mt-2">Registra rápidamente cualquier merma generada en la operación.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Column 1 */}
                    <div className="space-y-4">
                         <div>
                            <label htmlFor="unitId" className="block text-sm font-medium text-gray-700">Unidad</label>
                            <select id="unitId" value={unitId} onChange={e => setUnitId(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
                                {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo de Merma</label>
                            <select id="type" value={type} onChange={e => setType(e.target.value as WasteType)} className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
                                {Object.values(WasteType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    {/* Column 2 */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="related" className="block text-sm font-medium text-gray-700">Receta o Lote Relacionado (Opcional)</label>
                            <select id="related" value={relatedId} onChange={e => setRelatedId(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
                                <option value="">Ninguno</option>
                                <optgroup label="Recetas">
                                    {recipes.map(r => <option key={`recipe-${r.id}`} value={`recipe-${r.id}`}>{r.name}</option>)}
                                </optgroup>
                                <optgroup label="Lotes">
                                    {batches.map(b => <option key={`batch-${b.id}`} value={`batch-${b.id}`}>{`${b.recipeName} (${b.id})`}</option>)}
                                </optgroup>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción (Si no hay receta/lote)</label>
                            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Ej: Tomates magullados..."></textarea>
                        </div>
                    </div>
                    {/* Column 3 */}
                    <div className="space-y-4">
                         <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Cantidad</label>
                            <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))} className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" min="0" step="0.01" required />
                        </div>
                        <div>
                            <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unidad</label>
                            <select id="unit" value={unit} onChange={e => setUnit(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
                                {MOCK_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="mt-6 text-right">
                    <button type="submit" className="bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors">
                        Registrar Merma
                    </button>
                </div>
            </form>
        </div>
    );
};

export default WasteLog;