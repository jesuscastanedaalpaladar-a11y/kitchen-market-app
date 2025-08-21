import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Batch, ProductionTask, Recipe } from '../types';
import { BatchIcon, RecipeIcon, UserIcon, CalendarIcon } from './icons';

interface BatchDetailProps {
    batches: Batch[];
    tasks: ProductionTask[];
    recipes: Recipe[];
    onAddNote: (batchId: string, note: string) => void;
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`bg-white p-6 rounded-lg shadow-sm ${className}`}>
        <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">{title}</h2>
        {children}
    </div>
);

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 text-gray-500">{icon}</div>
        <div>
            <p className="text-sm font-semibold text-gray-500">{label}</p>
            <p className="text-md text-gray-800">{value}</p>
        </div>
    </div>
);

const BatchDetail: React.FC<BatchDetailProps> = ({ batches, tasks, recipes, onAddNote }) => {
    const { batchId } = useParams<{ batchId: string }>();

    const batch = useMemo(() => batches.find(b => b.id === batchId), [batches, batchId]);
    const sourceTask = useMemo(() => batch?.sourceTaskId ? tasks.find(t => t.id === batch.sourceTaskId) : undefined, [tasks, batch]);
    const recipe = useMemo(() => batch ? recipes.find(r => r.id === batch.recipeId) : undefined, [recipes, batch]);

    const [note, setNote] = useState(batch?.notes || '');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setNote(batch?.notes || '');
    }, [batch]);

    const handleSaveNote = () => {
        if(batch) {
            setIsSaving(true);
            onAddNote(batch.id, note);
            setTimeout(() => setIsSaving(false), 1000); // Simulate network latency
        }
    };
    
    if (!batch) {
        return <div className="text-center text-red-500 font-bold p-8">Lote no encontrado.</div>;
    }

    const expiryDate = new Date(batch.productionDate);
    expiryDate.setDate(expiryDate.getDate() + batch.shelfLifeDays);

    return (
        <div className="container mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <BatchIcon /> <span className="ml-3">Detalle del Lote</span>
                </h1>
                <p className="text-gray-600 mt-2 font-mono">{batch.id}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <InfoCard title="Información General">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailItem icon={<RecipeIcon />} label="Receta" value={
                                <Link to={`/recetas/${batch.recipeId}`} className="text-blue-600 font-bold hover:underline">{batch.recipeName}</Link>
                            } />
                            <DetailItem icon={<UserIcon />} label="Producido por" value={batch.responsibleUser} />
                            <DetailItem icon={<CalendarIcon />} label="Fecha de Producción" value={new Date(batch.productionDate).toLocaleString('es-ES')} />
                            <DetailItem icon={<CalendarIcon />} label="Fecha de Caducidad" value={expiryDate.toLocaleString('es-ES')} />
                            <DetailItem icon={<BatchIcon />} label="Cantidad Producida" value={`${batch.quantity} ${batch.unit}`} />
                         </div>
                    </InfoCard>

                    {sourceTask && (
                        <InfoCard title="Trazabilidad">
                            <p className="text-gray-700">Este lote fue generado a partir de la siguiente tarea de producción:</p>
                            <div className="mt-4 bg-gray-50 p-4 rounded-md border">
                                <p className="font-semibold">{sourceTask.recipeName}</p>
                                <p className="text-sm text-gray-500">
                                    Tarea ID: {sourceTask.id} | Cantidad Planeada: {sourceTask.quantityToProduce} {sourceTask.unit}
                                </p>
                            </div>
                        </InfoCard>
                    )}
                </div>

                <div className="lg:col-span-1">
                     <InfoCard title="Notas de Producción" className="sticky top-6">
                        <p className="text-sm text-gray-500 mb-3">Añade cualquier observación relevante sobre este lote.</p>
                        <textarea 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={8}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ej: La consistencia fue perfecta, el color un poco más claro de lo normal..."
                        />
                        <button 
                            onClick={handleSaveNote}
                            disabled={isSaving}
                            className="mt-4 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:bg-gray-400"
                        >
                            {isSaving ? 'Guardando...' : 'Guardar Nota'}
                        </button>
                     </InfoCard>
                </div>
            </div>
        </div>
    );
};

export default BatchDetail;
