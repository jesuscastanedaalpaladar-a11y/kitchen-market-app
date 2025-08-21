
import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Recipe, RecipeType, Unit, Ingredient, RecipeStep, MasterIngredient, AppModule } from '../types';
import { RecipeIcon, SearchIcon, SparklesIcon, PlusIcon, TrashIcon, CameraIcon, UploadIcon, ListIcon, BoardIcon } from './icons';
import { GoogleGenAI, Type } from "@google/genai";
import { UNITS } from '../services/mockData';

interface RecipeListProps {
    recipes: Recipe[];
    masterIngredients: MasterIngredient[];
    onAddRecipe: (recipe: Recipe) => void;
    hasPermission: (module: AppModule, requiredLevel: 'view' | 'edit') => boolean;
}

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};


const AddRecipeModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (recipe: Recipe) => void; masterIngredients: MasterIngredient[]; }> = ({ isOpen, onClose, onSave, masterIngredients }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [type, setType] = useState<RecipeType>(RecipeType.Produccion);
    const [prepTime, setPrepTime] = useState<number | ''>('');
    const [yieldAmount, setYieldAmount] = useState<number | ''>('');
    const [yieldUnit, setYieldUnit] = useState('');
    const [shelfLife, setShelfLife] = useState<number | ''>('');
    const [ingredients, setIngredients] = useState<Partial<Ingredient>[]>([{ unit: Unit.g }]);
    const [steps, setSteps] = useState<Partial<RecipeStep>[]>([{ description: '' }]);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [activeIngredientInput, setActiveIngredientInput] = useState<number | null>(null);


    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleIngredientChange = (index: number, field: keyof Ingredient, value: any) => {
        const newIngredients = [...ingredients];
        const currentIngredient = { ...newIngredients[index] };

        if (field === 'ingredientName') {
            currentIngredient.ingredientName = value;
            currentIngredient.ingredientId = undefined; // Invalidate ID because user is typing
        } else if (field === 'quantity') {
            (currentIngredient as any)[field] = value === '' ? undefined : parseFloat(value);
        } else {
            (currentIngredient as any)[field] = value;
        }
        newIngredients[index] = currentIngredient;
        setIngredients(newIngredients);
    };

    const handleSelectIngredient = (index: number, mi: MasterIngredient) => {
        const newIngredients = [...ingredients];
        const currentIngredient = { ...newIngredients[index] };
        currentIngredient.ingredientId = mi.id;
        currentIngredient.ingredientName = mi.name;
        currentIngredient.unit = mi.unit as Unit; // auto-set unit
        newIngredients[index] = currentIngredient;
        setIngredients(newIngredients);
        setActiveIngredientInput(null);
    };

    const addIngredient = () => setIngredients([...ingredients, { unit: Unit.g }]);
    const removeIngredient = (index: number) => setIngredients(ingredients.filter((_, i) => i !== index));

    const handleStepChange = (index: number, value: string) => {
        const newSteps = [...steps];
        newSteps[index].description = value;
        setSteps(newSteps);
    };

    const addStep = () => setSteps([...steps, { description: '' }]);
    const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index));

    const handleSubmit = async () => {
        if (!name.trim() || !category.trim() || prepTime === '' || yieldAmount === '' || !yieldUnit.trim() || (type === RecipeType.Produccion && shelfLife === '')) {
            alert('Por favor, completa todos los campos requeridos.');
            return;
        }

        const finalIngredients = ingredients.filter(ing => ing.ingredientId && ing.quantity != null && ing.unit).map(ing => ing as Ingredient);
        const finalSteps = steps.filter(step => step.description?.trim()).map(step => ({ description: step.description!.trim() }));

        if (finalIngredients.length === 0 || finalSteps.length === 0) {
            alert('Debes agregar al menos un ingrediente y un paso válidos.');
            return;
        }
        
        let photoUrl: string | undefined;
        if (photoFile) {
            photoUrl = await fileToDataUrl(photoFile);
        }
        
        let videoUrl: string | undefined;
        if (videoFile) {
            videoUrl = await fileToDataUrl(videoFile);
        }

        const newRecipe: Recipe = {
            id: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
            name,
            category,
            type,
            prepTimeMinutes: Number(prepTime),
            expectedYield: Number(yieldAmount),
            yieldUnit,
            shelfLifeDays: type === RecipeType.Produccion ? Number(shelfLife) || 0 : 0,
            ingredients: finalIngredients,
            steps: finalSteps,
            photoUrl,
            videoUrl
        };
        onSave(newRecipe);
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start p-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl my-8" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-slate-700">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Agregar Nueva Receta</h2>
                </div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" placeholder="Nombre de la Receta" value={name} onChange={e => setName(e.target.value)} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        <input type="text" placeholder="Categoría (ej. Salsas)" value={category} onChange={e => setCategory(e.target.value)} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        <select value={type} onChange={e => setType(e.target.value as RecipeType)} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            <option value={RecipeType.Produccion}>Producción</option>
                            <option value={RecipeType.Servicio}>Servicio</option>
                        </select>
                    </div>
                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input type="number" step="0.5" placeholder="Tiempo Prep. (minutos)" value={prepTime} onChange={e => setPrepTime(e.target.value === '' ? '' : parseFloat(e.target.value))} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        <input type="number" placeholder="Rendimiento" value={yieldAmount} onChange={e => setYieldAmount(e.target.value === '' ? '' : parseFloat(e.target.value))} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        <input type="text" placeholder="Unidad Rendimiento" value={yieldUnit} onChange={e => setYieldUnit(e.target.value)} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        {type === RecipeType.Produccion && (
                             <input type="number" placeholder="Tiempo de Vida (días)" value={shelfLife} onChange={e => setShelfLife(e.target.value === '' ? '' : parseInt(e.target.value))} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        )}
                    </div>

                    {/* Media Upload */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t dark:border-slate-700">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Foto de la Receta</label>
                            <div className="flex items-center space-x-4">
                                <div className="h-24 w-24 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                    {photoPreview ? <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" /> : <CameraIcon className="h-12 w-12 text-slate-400 dark:text-slate-500" />}
                                </div>
                                <input type="file" accept="image/*" onChange={handlePhotoChange} id="photo-upload" className="hidden" />
                                <label htmlFor="photo-upload" className="cursor-pointer bg-white dark:bg-slate-600 py-2 px-3 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm text-sm leading-4 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    <span>Subir foto</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Video de la Receta (Opcional)</label>
                             <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/50 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900" />
                             {videoFile && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Archivo seleccionado: {videoFile.name}</p>}
                        </div>
                    </div>

                    {/* Ingredients */}
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Ingredientes</h3>
                        {ingredients.map((ing, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                                <div className="relative flex-grow">
                                    <input
                                        type="text"
                                        placeholder="Buscar ingrediente..."
                                        value={ing.ingredientName || ''}
                                        onChange={e => handleIngredientChange(index, 'ingredientName', e.target.value)}
                                        onFocus={() => setActiveIngredientInput(index)}
                                        onBlur={() => setTimeout(() => setActiveIngredientInput(null), 150)} // Delay to allow click on suggestions
                                        className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white w-full"
                                        autoComplete="off"
                                    />
                                    {activeIngredientInput === index && ing.ingredientName && !ing.ingredientId && (
                                        <ul className="absolute z-20 w-full bg-white dark:bg-slate-700 border dark:border-slate-600 rounded mt-1 max-h-48 overflow-y-auto shadow-lg">
                                            {masterIngredients
                                                .filter(mi => mi.name.toLowerCase().includes((ing.ingredientName || '').toLowerCase()))
                                                .map(mi => (
                                                    <li
                                                        key={mi.id}
                                                        className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-600 cursor-pointer"
                                                        onMouseDown={() => handleSelectIngredient(index, mi)}
                                                    >
                                                        {mi.name}
                                                    </li>
                                                ))
                                            }
                                        </ul>
                                    )}
                                </div>
                                <input type="number" placeholder="Cant." value={ing.quantity ?? ''} onChange={e => handleIngredientChange(index, 'quantity', e.target.value)} className="p-3 border rounded-lg w-24 bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                <select value={ing.unit} onChange={e => handleIngredientChange(index, 'unit', e.target.value)} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white w-28">
                                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                                <button onClick={() => removeIngredient(index)} className="p-2 bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300 rounded"><TrashIcon className="h-4 w-4"/></button>
                            </div>
                        ))}
                        <button onClick={addIngredient} className="text-indigo-600 dark:text-indigo-400 font-semibold mt-2 text-sm">+ Agregar Ingrediente</button>
                    </div>

                     {/* Steps */}
                     <div>
                        <h3 className="font-semibold text-lg mb-2">Pasos de Preparación</h3>
                        {steps.map((step, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                                <span className="font-bold">{index + 1}.</span>
                                <textarea placeholder="Descripción del paso" value={step.description || ''} onChange={e => handleStepChange(index, e.target.value)} className="p-3 border rounded-lg flex-grow bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white" rows={1}></textarea>
                                <button onClick={() => removeStep(index)} className="p-2 bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300 rounded"><TrashIcon className="h-4 w-4"/></button>
                            </div>
                        ))}
                        <button onClick={addStep} className="text-indigo-600 dark:text-indigo-400 font-semibold mt-2 text-sm">+ Agregar Paso</button>
                    </div>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t dark:border-slate-700 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-6 py-3 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition">Cancelar</button>
                    <button onClick={handleSubmit} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition">Guardar Receta</button>
                </div>
            </div>
        </div>
    );
};


const RecipeList: React.FC<RecipeListProps> = ({ recipes, masterIngredients, onAddRecipe, hasPermission }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
    // AI Modal State
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Manual Add Modal State
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);


    const categories = useMemo(() => ['All', ...new Set(recipes.map(r => r.category))], [recipes]);

    const filteredRecipes = useMemo(() => {
        return recipes.filter(recipe => {
            const matchesCategory = selectedCategory === 'All' || recipe.category === selectedCategory;
            const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [recipes, searchTerm, selectedCategory]);

    const handleGenerateRecipe = useCallback(async () => {
        if (!aiPrompt.trim()) {
            alert('Por favor, describe la receta que quieres crear.');
            return;
        }

        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const schema = {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "El nombre de la receta." },
                category: { type: Type.STRING, description: "Categoría de la receta (ej. Salsas, Pastas, Proteínas)." },
                type: { type: Type.STRING, enum: [RecipeType.Produccion, RecipeType.Servicio], description: "Tipo de receta: Producción o Servicio." },
                ingredients: {
                  type: Type.ARRAY,
                  description: "Lista de ingredientes.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      ingredientName: { type: Type.STRING, description: "Nombre del ingrediente. Usa nombres comunes y genéricos de la base de datos de ingredientes." },
                      quantity: { type: Type.NUMBER },
                      unit: { type: Type.STRING, enum: Object.values(Unit) },
                    },
                    required: ["ingredientName", "quantity", "unit"],
                  },
                },
                steps: {
                  type: Type.ARRAY,
                  description: "Pasos para preparar la receta.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      description: { type: Type.STRING },
                    },
                    required: ["description"],
                  },
                },
                prepTimeMinutes: { type: Type.NUMBER, description: "Tiempo total de preparación en minutos." },
                expectedYield: { type: Type.NUMBER, description: "Rendimiento esperado de la receta." },
                yieldUnit: { type: Type.STRING, description: "Unidad del rendimiento (ej. litros, porciones, kg)." },
                shelfLifeDays: { type: Type.NUMBER, description: "Días de vida útil del producto final. Opcional si es de servicio." },
              },
              required: ["name", "category", "type", "ingredients", "steps", "prepTimeMinutes", "expectedYield", "yieldUnit"],
            };

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Crea una receta de cocina profesional para: "${aiPrompt}"`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                    systemInstruction: "Eres un chef profesional creando recetas para un sistema de gestión de cocinas. Tu respuesta debe ser solo el JSON. Usa nombres de ingredientes comunes. Para los ingredientes, usa la propiedad 'ingredientName', no 'name'.",
                },
            });
            
            const recipeJson = JSON.parse(response.text);

            // Match AI ingredients with master ingredients
            const matchedIngredients = recipeJson.ingredients.map((ing: {ingredientName: string, quantity: number, unit: Unit}) => {
                const masterIng = masterIngredients.find(mi => mi.name.toLowerCase() === ing.ingredientName.toLowerCase());
                return {
                    ingredientId: masterIng?.id || `unknown-${ing.ingredientName}`,
                    ingredientName: masterIng?.name || ing.ingredientName,
                    quantity: ing.quantity,
                    unit: ing.unit,
                }
            });

            const unknownIngredients = matchedIngredients.filter((ing: any) => ing.ingredientId.startsWith('unknown-')).map((ing: any) => ing.ingredientName);
            if (unknownIngredients.length > 0) {
                alert(`Error: No se pudo crear la receta. Los siguientes ingredientes no existen en la base de datos: ${unknownIngredients.join(', ')}. Por favor, añádelos primero desde la sección de "Ingredientes" en el menú de Admin.`);
                setIsLoading(false);
                return;
            }
            
            const newRecipe: Recipe = {
                ...recipeJson,
                id: recipeJson.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
                photoUrl: `https://picsum.photos/seed/${Math.random().toString(36).substring(7)}/400/300`,
                ingredients: matchedIngredients,
                shelfLifeDays: recipeJson.shelfLifeDays || 0
            };
            
            onAddRecipe(newRecipe);
            setIsAiModalOpen(false);
            setAiPrompt('');
            
        } catch (error) {
            console.error("Error al generar la receta:", error);
            alert("Hubo un error al generar la receta. Por favor, intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    }, [aiPrompt, onAddRecipe, masterIngredients]);

    const canEdit = hasPermission('recetas', 'edit');

    return (
        <div className="container mx-auto">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Recetario</h1>
                    <div className="flex flex-col md:flex-row items-center gap-2">
                        {canEdit && (
                            <>
                                <button onClick={() => setIsManualModalOpen(true)} className="w-full md:w-auto flex items-center justify-center space-x-2 p-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg">
                                    <PlusIcon />
                                    <span>Agregar Receta</span>
                                </button>
                                <button onClick={() => setIsAiModalOpen(true)} className="w-full md:w-auto flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg">
                                    <SparklesIcon />
                                    <span>Crear con IA</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mt-6">
                    <div className="relative flex-grow w-full md:w-auto">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <SearchIcon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar receta..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-3 pl-12 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-700 dark:text-white"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:text-white w-full md:w-auto"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category === 'All' ? 'Todas las categorías' : category}
                            </option>
                        ))}
                    </select>
                     <div className="inline-flex rounded-md shadow-sm" role="group">
                        <button onClick={() => setViewMode('grid')} className={`p-3 border dark:border-slate-600 rounded-l-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'}`} aria-label="Vista de cuadrícula">
                            <BoardIcon />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-3 border dark:border-slate-600 rounded-r-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'}`} aria-label="Vista de lista">
                            <ListIcon />
                        </button>
                    </div>
                </div>
            </div>

            {filteredRecipes.length > 0 ? (
                 viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredRecipes.map(recipe => (
                            <Link to={`/recetas/${recipe.id}`} key={recipe.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 block group border dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500">
                                <div className="w-full h-48 bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                     {recipe.photoUrl ? (
                                        <img src={recipe.photoUrl} alt={recipe.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"/>
                                    ) : (
                                        <CameraIcon className="w-16 h-16 text-slate-400 dark:text-slate-500" />
                                    )}
                                </div>
                                <div className="p-4">
                                    <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-1 rounded-full">{recipe.category}</span>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-2">{recipe.name}</h2>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{recipe.prepTimeMinutes} min • Rinde {recipe.expectedYield} {recipe.yieldUnit}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border dark:border-slate-700">
                        <div className="overflow-x-auto">
                            <table className="w-full text-base text-left text-slate-500 dark:text-slate-400">
                                <thead className="text-sm text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 w-24">Foto</th>
                                        <th scope="col" className="px-6 py-3">Nombre Receta</th>
                                        <th scope="col" className="px-6 py-3">Categoría</th>
                                        <th scope="col" className="px-6 py-3">Tipo</th>
                                        <th scope="col" className="px-6 py-3">Tiempo</th>
                                        <th scope="col" className="px-6 py-3">Rinde</th>
                                        <th scope="col" className="px-6 py-3"><span className="sr-only">Ver</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecipes.map(recipe => (
                                        <tr key={recipe.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                                            <td className="p-2">
                                                <Link to={`/recetas/${recipe.id}`} className="block w-20 h-16 bg-slate-200 dark:bg-slate-700 rounded-md overflow-hidden">
                                                    {recipe.photoUrl ? (
                                                        <img src={recipe.photoUrl} alt={recipe.name} className="w-full h-full object-cover"/>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <CameraIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                                                        </div>
                                                    )}
                                                </Link>
                                            </td>
                                            <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                                <Link to={`/recetas/${recipe.id}`} className="hover:underline">{recipe.name}</Link>
                                            </th>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-1 rounded-full">{recipe.category}</span>
                                            </td>
                                            <td className="px-6 py-4">{recipe.type}</td>
                                            <td className="px-6 py-4">{recipe.prepTimeMinutes} min</td>
                                            <td className="px-6 py-4">{recipe.expectedYield} {recipe.yieldUnit}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Link to={`/recetas/${recipe.id}`} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Ver</Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm text-center py-20">
                    <p className="text-slate-500 dark:text-slate-400 text-lg">No se encontraron recetas con los filtros actuales.</p>
                </div>
            )}
            
            {/* AI Generation Modal */}
            {isAiModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={() => !isLoading && setIsAiModalOpen(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b dark:border-slate-700">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                                <SparklesIcon className="text-purple-500 h-6 w-6"/> 
                                <span>Generador de Recetas con IA</span>
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">Describe la receta que tienes en mente.</p>
                        </div>
                        <div className="p-6">
                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                                    <p className="mt-4 text-slate-600 dark:text-slate-300 font-semibold">Creando una receta deliciosa...</p>
                                </div>
                            ) : (
                                <textarea 
                                    value={aiPrompt}
                                    onChange={e => setAiPrompt(e.target.value)}
                                    rows={5}
                                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 dark:bg-slate-700 dark:text-white"
                                    placeholder="Ej: Un postre de chocolate y aguacate, estilo mousse vegano..."
                                    aria-label="Descripción de la receta a generar"
                                />
                            )}
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t dark:border-slate-700 flex justify-end space-x-4">
                            <button onClick={() => setIsAiModalOpen(false)} disabled={isLoading} className="px-6 py-3 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition disabled:opacity-50">Cancelar</button>
                            <button onClick={handleGenerateRecipe} disabled={isLoading} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition disabled:bg-slate-400">Generar Receta</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Manual Add Modal */}
            <AddRecipeModal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} onSave={onAddRecipe} masterIngredients={masterIngredients} />

        </div>
    );
};

export default RecipeList;
