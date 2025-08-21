
import React, { useState, useMemo } from 'react';
import { Recipe } from '../types';
import { CalculatorIcon, YieldIcon } from './icons';

interface RecipeCalculatorProps {
    recipes: Recipe[];
    onAddTask: (recipeId: string, quantity: number) => void;
}

const RecipeCalculator: React.FC<RecipeCalculatorProps> = ({ recipes, onAddTask }) => {
    const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipes[0]?.id || '');
    const [desiredYield, setDesiredYield] = useState<number | string>('');

    const selectedRecipe = useMemo(() => {
        return recipes.find(r => r.id === selectedRecipeId);
    }, [recipes, selectedRecipeId]);

    const multiplier = useMemo(() => {
        if (!selectedRecipe || typeof desiredYield !== 'number' || desiredYield <= 0 || selectedRecipe.expectedYield <= 0) {
            return 1;
        }
        return desiredYield / selectedRecipe.expectedYield;
    }, [selectedRecipe, desiredYield]);

    const scaledIngredients = useMemo(() => {
        if (!selectedRecipe) return [];
        // If desiredYield is not set, show base recipe
        const effectiveMultiplier = typeof desiredYield === 'number' && desiredYield > 0 ? multiplier : 1;
        return selectedRecipe.ingredients.map(ing => ({
            ...ing,
            quantity: ing.quantity * effectiveMultiplier
        }));
    }, [selectedRecipe, multiplier, desiredYield]);

    const handleYieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '') {
            setDesiredYield('');
        } else {
            const numValue = parseFloat(value);
            if (!isNaN(numValue) && numValue >= 0) {
                setDesiredYield(numValue);
            }
        }
    };

    const handleCreateTask = () => {
        if (selectedRecipe && typeof desiredYield === 'number' && desiredYield > 0) {
            onAddTask(selectedRecipe.id, desiredYield);
            setDesiredYield('');
        } else {
            alert('Por favor, introduce un rendimiento deseado válido para crear una tarea.');
        }
    }

    return (
        <div className="container mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <CalculatorIcon /> <span className="ml-3">Calculadora de Recetas</span>
                </h1>
                <p className="text-gray-600 mt-2">Escala los ingredientes de cualquier receta según el rendimiento que necesites.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Controls */}
                <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Configuración</h2>
                    <div className="space-y-4 flex-grow">
                        <div>
                            <label htmlFor="recipe-select" className="block text-sm font-medium text-gray-700">1. Selecciona una receta</label>
                            <select
                                id="recipe-select"
                                value={selectedRecipeId}
                                onChange={e => {
                                    setSelectedRecipeId(e.target.value);
                                    setDesiredYield(''); // Reset yield when recipe changes
                                }}
                                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                {recipes.map(recipe => (
                                    <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
                                ))}
                            </select>
                        </div>
                        {selectedRecipe && (
                            <div>
                                <label htmlFor="desired-yield" className="block text-sm font-medium text-gray-700">2. Introduce el rendimiento deseado ({selectedRecipe.yieldUnit})</label>
                                <input
                                    type="number"
                                    id="desired-yield"
                                    value={desiredYield}
                                    onChange={handleYieldChange}
                                    placeholder={`Rendimiento base: ${selectedRecipe.expectedYield} ${selectedRecipe.yieldUnit}`}
                                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    min="0"
                                />
                            </div>
                        )}
                    </div>
                     {selectedRecipe && (
                        <div className="mt-6">
                            <button
                                onClick={handleCreateTask}
                                disabled={!(typeof desiredYield === 'number' && desiredYield > 0)}
                                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Crear Tarea de Producción
                            </button>
                        </div>
                    )}
                </div>

                {/* Results */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2 flex items-center">
                        <YieldIcon /> <span className="ml-2">Ingredientes Calculados</span>
                    </h2>
                    {selectedRecipe ? (
                        <div>
                            <p className="text-gray-600 mb-4">
                                Para obtener <span className="font-bold text-blue-600">{desiredYield || `(base) ${selectedRecipe.expectedYield}`} {selectedRecipe.yieldUnit}</span> de <span className="font-bold">{selectedRecipe.name}</span>, necesitarás:
                            </p>
                            <ul className="space-y-2 list-disc list-inside text-gray-700 bg-gray-50 p-4 rounded-md">
                                {scaledIngredients.map(ing => (
                                    <li key={ing.ingredientId}>
                                        <span className="font-semibold">{ing.ingredientName}:</span> {ing.quantity.toFixed(2)} {ing.unit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p className="text-gray-500">Selecciona una receta para empezar.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecipeCalculator;