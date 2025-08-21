import React, { useState, useMemo } from 'react';
import { MasterIngredient, Unit } from '../types';
import { IngredientIcon, SearchIcon, EditIcon, SaveIcon, XIcon } from './icons';

interface IngredientManagementProps {
    ingredients: MasterIngredient[];
    onAddIngredient: (ingredientData: Omit<MasterIngredient, 'id'>) => void;
    onUpdateIngredient: (ingredientData: MasterIngredient) => void;
}

const IngredientManagement: React.FC<IngredientManagementProps> = ({ ingredients, onAddIngredient, onUpdateIngredient }) => {
    // State for adding a new ingredient
    const [newName, setNewName] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [newUnit, setNewUnit] = useState('');

    // State for filtering and searching
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // State for inline editing
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Omit<MasterIngredient, 'id'>>({ name: '', category: '', unit: '' });

    const categories = useMemo(() => ['All', ...Array.from(new Set(ingredients.map(i => i.category)))], [ingredients]);
    const uniqueCategories = useMemo(() => Array.from(new Set(ingredients.map(i => i.category))), [ingredients]);

    const filteredIngredients = useMemo(() => {
        return ingredients.filter(ing => {
            const matchesCategory = categoryFilter === 'All' || ing.category === categoryFilter;
            const matchesSearch = ing.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [ingredients, searchTerm, categoryFilter]);
    
    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !newCategory.trim() || !newUnit.trim()) {
            alert('Por favor, completa todos los campos.');
            return;
        }
        onAddIngredient({ name: newName, category: newCategory, unit: newUnit });
        setNewName('');
        setNewCategory('');
        setNewUnit('');
    };

    const handleEditClick = (ingredient: MasterIngredient) => {
        setEditingId(ingredient.id);
        setEditData({ name: ingredient.name, category: ingredient.category, unit: ingredient.unit });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const handleSaveEdit = (id: string) => {
        if (!editData.name.trim() || !editData.category.trim() || !editData.unit.trim()) {
            alert('Los campos no pueden estar vacíos.');
            return;
        }
        onUpdateIngredient({ id, ...editData });
        setEditingId(null);
    };
    
    return (
        <div className="container mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <IngredientIcon />
                    <span className="ml-3">Gestión de Ingredientes</span>
                </h1>
                <p className="text-gray-600 mt-2">Administra la base de datos maestra de ingredientes.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <form onSubmit={handleAddSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-4 sticky top-6">
                        <h2 className="text-xl font-bold text-gray-700">Añadir Nuevo Ingrediente</h2>
                        <div>
                            <label htmlFor="ing-name" className="block text-sm font-medium text-gray-700">Nombre del Ingrediente</label>
                            <input type="text" id="ing-name" value={newName} onChange={e => setNewName(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required placeholder="Ej. Tomate Saladet" />
                        </div>
                        <div>
                            <label htmlFor="ing-category" className="block text-sm font-medium text-gray-700">Categoría</label>
                            <input 
                                type="text" 
                                id="ing-category" 
                                value={newCategory} 
                                onChange={e => setNewCategory(e.target.value)} 
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" 
                                required 
                                placeholder="Ej. Vegetales" 
                                list="category-list"
                            />
                             <datalist id="category-list">
                                {uniqueCategories.map(cat => <option key={cat} value={cat} />)}
                            </datalist>
                        </div>
                        <div>
                            <label htmlFor="ing-unit" className="block text-sm font-medium text-gray-700">Unidad de Medida</label>
                            <select 
                                id="ing-unit" 
                                value={newUnit} 
                                onChange={e => setNewUnit(e.target.value)} 
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white" 
                                required
                            >
                                <option value="" disabled>Selecciona...</option>
                                {Object.values(Unit).map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
                            Guardar Ingrediente
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Listado Maestro de Ingredientes</h2>
                        <div className="flex flex-col md:flex-row gap-4">
                             <div className="relative flex-grow">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full p-2 pl-10 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="p-2 border border-gray-300 rounded-lg bg-white"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'All' ? 'Todas las categorías' : cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Folio</th>
                                    <th className="px-6 py-3">Nombre</th>
                                    <th className="px-6 py-3">Categoría</th>
                                    <th className="px-6 py-3">Unidad</th>
                                    <th className="px-6 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredIngredients.map(ing => (
                                    <tr key={ing.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{ing.id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {editingId === ing.id ? (
                                                <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="p-1 border rounded w-full" />
                                            ) : (
                                                ing.name
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingId === ing.id ? (
                                                <input 
                                                    type="text" 
                                                    value={editData.category} 
                                                    onChange={e => setEditData({...editData, category: e.target.value})} 
                                                    className="p-1 border rounded w-full" 
                                                    list="category-list"
                                                />
                                            ) : (
                                                <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{ing.category}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingId === ing.id ? (
                                                <select 
                                                    value={editData.unit} 
                                                    onChange={e => setEditData({...editData, unit: e.target.value})} 
                                                    className="p-1 border rounded bg-white w-full"
                                                >
                                                    {Object.values(Unit).map(u => <option key={u} value={u}>{u}</option>)}
                                                </select>
                                            ) : (
                                                ing.unit
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {editingId === ing.id ? (
                                                <div className="flex justify-end items-center space-x-2">
                                                    <button onClick={() => handleSaveEdit(ing.id)} className="p-2 text-green-600 hover:bg-green-100 rounded-full" aria-label="Guardar"><SaveIcon/></button>
                                                    <button onClick={handleCancelEdit} className="p-2 text-red-600 hover:bg-red-100 rounded-full" aria-label="Cancelar"><XIcon/></button>
                                                </div>
                                            ) : (
                                                <button onClick={() => handleEditClick(ing)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" aria-label="Editar"><EditIcon/></button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IngredientManagement;