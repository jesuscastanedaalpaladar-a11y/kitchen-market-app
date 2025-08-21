import React, { useState, useMemo } from 'react';
import { MasterIngredient, CategorySummary } from '../types';
import { TagIcon, EditIcon, TrashIcon, SaveIcon, XIcon } from './icons';

interface CategoryManagementProps {
    masterIngredients: MasterIngredient[];
    onUpdateCategory: (oldName: string, newName: string) => void;
    onDeleteCategory: (categoryToDelete: string, targetCategory: string) => void;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({ masterIngredients, onUpdateCategory, onDeleteCategory }) => {
    // State for inline editing
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [newCategoryName, setNewCategoryName] = useState('');

    // State for deletion modal
    const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
    const [reassignCategory, setReassignCategory] = useState('');

    const categorySummary = useMemo((): CategorySummary[] => {
        const counts = masterIngredients.reduce((acc, ing) => {
            acc[ing.category] = (acc[ing.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [masterIngredients]);

    const handleEditClick = (category: CategorySummary) => {
        setEditingCategory(category.name);
        setNewCategoryName(category.name);
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
        setNewCategoryName('');
    };

    const handleSaveEdit = () => {
        if (editingCategory && newCategoryName.trim()) {
            onUpdateCategory(editingCategory, newCategoryName.trim());
            handleCancelEdit();
        }
    };
    
    const handleDeleteClick = (categoryName: string) => {
        setDeletingCategory(categoryName);
        // Set a default reassignment category
        const otherCategory = categorySummary.find(c => c.name !== categoryName);
        if (otherCategory) {
            setReassignCategory(otherCategory.name);
        } else {
            setReassignCategory(''); // Should not happen if there is more than 1 category
        }
    };
    
    const handleConfirmDelete = () => {
        if (deletingCategory && reassignCategory) {
            onDeleteCategory(deletingCategory, reassignCategory);
            setDeletingCategory(null);
        } else {
            alert("Por favor, selecciona una categoría para reasignar los ingredientes.");
        }
    };

    return (
        <div className="container mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <TagIcon />
                    <span className="ml-3">Gestión de Categorías</span>
                </h1>
                <p className="text-gray-600 mt-2">Edita y elimina las categorías de ingredientes.</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Nombre de Categoría</th>
                                <th className="px-6 py-3">Nº de Ingredientes</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categorySummary.map(cat => (
                                <tr key={cat.name} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {editingCategory === cat.name ? (
                                            <input 
                                                type="text" 
                                                value={newCategoryName} 
                                                onChange={e => setNewCategoryName(e.target.value)} 
                                                className="p-1 border rounded w-full" 
                                            />
                                        ) : (
                                            cat.name
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{cat.count}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {editingCategory === cat.name ? (
                                            <div className="flex justify-end items-center space-x-2">
                                                <button onClick={handleSaveEdit} className="p-2 text-green-600 hover:bg-green-100 rounded-full" aria-label="Guardar"><SaveIcon/></button>
                                                <button onClick={handleCancelEdit} className="p-2 text-red-600 hover:bg-red-100 rounded-full" aria-label="Cancelar"><XIcon/></button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end items-center space-x-2">
                                                <button onClick={() => handleEditClick(cat)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" aria-label="Editar"><EditIcon/></button>
                                                <button onClick={() => handleDeleteClick(cat.name)} disabled={categorySummary.length <= 1} className="p-2 text-red-600 hover:bg-red-100 rounded-full disabled:text-gray-300 disabled:hover:bg-transparent" aria-label="Eliminar"><TrashIcon className={categorySummary.length <= 1 ? "text-gray-300" : ""}/></button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Deletion Modal */}
            {deletingCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={() => setDeletingCategory(null)}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b">
                            <h2 className="text-2xl font-bold text-gray-800">Eliminar Categoría "{deletingCategory}"</h2>
                            <p className="text-gray-600 mt-2">No se puede eliminar una categoría con ingredientes. Por favor, reasigna todos los ingredientes a otra categoría primero.</p>
                        </div>
                        <div className="p-6 space-y-4">
                             <div>
                                <label htmlFor="reassign-category" className="block text-sm font-medium text-gray-700">Mover ingredientes a:</label>
                                <select 
                                    id="reassign-category"
                                    value={reassignCategory}
                                    onChange={e => setReassignCategory(e.target.value)}
                                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    <option value="" disabled>Selecciona una categoría</option>
                                    {categorySummary.filter(c => c.name !== deletingCategory).map(cat => (
                                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                             </div>
                        </div>
                        <div className="p-6 bg-gray-50 border-t flex justify-end space-x-4">
                            <button onClick={() => setDeletingCategory(null)} className="px-6 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition">Cancelar</button>
                            <button onClick={handleConfirmDelete} disabled={!reassignCategory} className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition disabled:bg-gray-400">Eliminar y Reasignar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagement;
