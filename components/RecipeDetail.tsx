
import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Recipe, User, Role, RecipeType, Unit, Ingredient, RecipeStep, MasterIngredient, AppModule } from '../types';
import { YieldIcon, EditIcon, TrashIcon, CameraIcon, VideoIcon, UploadIcon, XIcon } from './icons';
import { UNITS } from '../services/mockData';

interface RecipeDetailProps {
    recipes: Recipe[];
    masterIngredients: MasterIngredient[];
    currentUser: User;
    onUpdateRecipe: (recipe: Recipe) => void;
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

const EditRecipeModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (recipe: Recipe) => void; recipeToEdit: Recipe; masterIngredients: MasterIngredient[]; }> = ({ isOpen, onClose, onSave, recipeToEdit, masterIngredients }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [type, setType] = useState<RecipeType>(RecipeType.Produccion);
    const [prepTime, setPrepTime] = useState<number | ''>('');
    const [yieldAmount, setYieldAmount] = useState<number | ''>('');
    const [yieldUnit, setYieldUnit] = useState('');
    const [shelfLife, setShelfLife] = useState<number | ''>('');
    const [ingredients, setIngredients] = useState<Partial<Ingredient>[]>([{}]);
    const [steps, setSteps] = useState<Partial<RecipeStep>[]>([{ description: '' }]);

    const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
    const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
    const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
    const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
    const [activeIngredientInput, setActiveIngredientInput] = useState<number | null>(null);


    useEffect(() => {
        if (isOpen && recipeToEdit) {
            setName(recipeToEdit.name);
            setCategory(recipeToEdit.category);
            setType(recipeToEdit.type);
            setPrepTime(recipeToEdit.prepTimeMinutes);
            setYieldAmount(recipeToEdit.expectedYield);
            setYieldUnit(recipeToEdit.yieldUnit);
            setShelfLife(recipeToEdit.shelfLifeDays);
            setIngredients(recipeToEdit.ingredients.map(i => ({...i})));
            setSteps(recipeToEdit.steps.map(s => ({...s})));
            setPhotoUrl(recipeToEdit.photoUrl);
            setVideoUrl(recipeToEdit.videoUrl);
            setNewPhotoFile(null);
            setNewVideoFile(null);
        }
    }, [isOpen, recipeToEdit]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewPhotoFile(file);
            setPhotoUrl(URL.createObjectURL(file));
        }
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewVideoFile(file);
            setVideoUrl(URL.createObjectURL(file));
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

        const updatedRecipe: Recipe = {
            ...recipeToEdit,
            name,
            category,
            type,
            prepTimeMinutes: Number(prepTime),
            expectedYield: Number(yieldAmount),
            yieldUnit,
            shelfLifeDays: type === RecipeType.Produccion ? Number(shelfLife) || 0 : 0,
            ingredients: finalIngredients,
            steps: finalSteps,
        };
        
        if (newPhotoFile) {
            updatedRecipe.photoUrl = await fileToDataUrl(newPhotoFile);
        } else if (photoUrl === undefined) {
            updatedRecipe.photoUrl = undefined;
        }

        if (newVideoFile) {
            updatedRecipe.videoUrl = await fileToDataUrl(newVideoFile);
        } else if (videoUrl === undefined) {
            updatedRecipe.videoUrl = undefined;
        }

        onSave(updatedRecipe);
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start p-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl my-8" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-slate-700">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Editar Receta</h2>
                </div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" placeholder="Nombre de la Receta" value={name} onChange={e => setName(e.target.value)} className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
                        <input type="text" placeholder="Categoría (ej. Salsas)" value={category} onChange={e => setCategory(e.target.value)} className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
                        <select value={type} onChange={e => setType(e.target.value as RecipeType)} className="p-2 border rounded bg-white dark:bg-slate-700 dark:border-slate-600">
                            <option value={RecipeType.Produccion}>Producción</option>
                            <option value={RecipeType.Servicio}>Servicio</option>
                        </select>
                    </div>
                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input type="number" step="0.5" placeholder="Tiempo Prep. (minutos)" value={prepTime} onChange={e => setPrepTime(e.target.value === '' ? '' : parseFloat(e.target.value))} className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
                        <input type="number" placeholder="Rendimiento" value={yieldAmount} onChange={e => setYieldAmount(e.target.value === '' ? '' : parseFloat(e.target.value))} className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
                        <input type="text" placeholder="Unidad Rendimiento" value={yieldUnit} onChange={e => setYieldUnit(e.target.value)} className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
                        {type === RecipeType.Produccion && (
                             <input type="number" placeholder="Tiempo de Vida (días)" value={shelfLife} onChange={e => setShelfLife(e.target.value === '' ? '' : parseInt(e.target.value))} className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
                        )}
                    </div>
                     {/* Media Upload */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t dark:border-slate-700">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Foto</label>
                            <div className="relative h-24 w-24 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                {photoUrl ? <img src={photoUrl} alt="Preview" className="h-full w-full object-cover" /> : <CameraIcon className="h-12 w-12 text-slate-400 dark:text-slate-500" />}
                                {photoUrl && <button onClick={() => {setPhotoUrl(undefined); setNewPhotoFile(null);}} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-0.5"><XIcon/></button>}
                            </div>
                            <input type="file" accept="image/*" onChange={handlePhotoChange} id="photo-upload-edit" className="hidden" />
                            <label htmlFor="photo-upload-edit" className="mt-2 cursor-pointer bg-white dark:bg-slate-600 py-2 px-3 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-500">Cambiar foto</label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Video</label>
                            {videoUrl && (
                                <div className="relative mb-2">
                                     <video src={videoUrl} controls className="w-full rounded-md" />
                                     <button onClick={() => {setVideoUrl(undefined); setNewVideoFile(null);}} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-0.5"><XIcon/></button>
                                </div>
                            )}
                             <input type="file" accept="video/*" onChange={handleVideoChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/50 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900" />
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
                                        className="p-2 border rounded bg-white dark:bg-slate-700 dark:border-slate-600 w-full"
                                        autoComplete="off"
                                    />
                                    {activeIngredientInput === index && ing.ingredientName && !ing.ingredientId && (
                                        <ul className="absolute z-20 w-full bg-white dark:bg-slate-600 border dark:border-slate-500 rounded mt-1 max-h-48 overflow-y-auto shadow-lg">
                                            {masterIngredients
                                                .filter(mi => mi.name.toLowerCase().includes((ing.ingredientName || '').toLowerCase()))
                                                .map(mi => (
                                                    <li
                                                        key={mi.id}
                                                        className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-500 cursor-pointer"
                                                        onMouseDown={() => handleSelectIngredient(index, mi)}
                                                    >
                                                        {mi.name}
                                                    </li>
                                                ))
                                            }
                                        </ul>
                                    )}
                                </div>
                                <input type="number" placeholder="Cant." value={ing.quantity ?? ''} onChange={e => handleIngredientChange(index, 'quantity', e.target.value)} className="p-2 border rounded w-24 dark:bg-slate-700 dark:border-slate-600" />
                                <select value={ing.unit} onChange={e => handleIngredientChange(index, 'unit', e.target.value)} className="p-2 border rounded bg-white dark:bg-slate-700 dark:border-slate-600 w-28">
                                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                                <button onClick={() => removeIngredient(index)} className="p-2 bg-red-100 text-red-600 rounded"><TrashIcon className="h-4 w-4"/></button>
                            </div>
                        ))}
                        <button onClick={addIngredient} className="text-indigo-600 font-semibold mt-2 text-sm">+ Agregar Ingrediente</button>
                    </div>

                     {/* Steps */}
                     <div>
                        <h3 className="font-semibold text-lg mb-2">Pasos de Preparación</h3>
                        {steps.map((step, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                                <span className="font-bold">{index + 1}.</span>
                                <textarea placeholder="Descripción del paso" value={step.description || ''} onChange={e => handleStepChange(index, e.target.value)} className="p-2 border rounded flex-grow dark:bg-slate-700 dark:border-slate-600" rows={1}></textarea>
                                <button onClick={() => removeStep(index)} className="p-2 bg-red-100 text-red-600 rounded"><TrashIcon className="h-4 w-4"/></button>
                            </div>
                        ))}
                        <button onClick={addStep} className="text-indigo-600 font-semibold mt-2 text-sm">+ Agregar Paso</button>
                    </div>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t dark:border-slate-700 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-200 text-slate-800 font-bold rounded-lg hover:bg-slate-300 transition">Cancelar</button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition">Guardar Cambios</button>
                </div>
            </div>
        </div>
    );
};


const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipes, masterIngredients, currentUser, onUpdateRecipe, hasPermission }) => {
    const { recipeId } = useParams<{ recipeId: string }>();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const recipe = useMemo(() => {
        return recipes.find(r => r.id === recipeId);
    }, [recipes, recipeId]);

    if (!recipe) {
        return <div className="text-center text-red-500 font-bold p-8">Receta no encontrada.</div>;
    }

    const canEdit = hasPermission('recetas', 'edit');

    return (
        <div className="container mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Media Section */}
                    <div className="p-4 md:p-0">
                         <div className="relative w-full aspect-video bg-slate-200 dark:bg-slate-700 flex items-center justify-center rounded-t-xl md:rounded-l-xl md:rounded-t-none overflow-hidden">
                            {recipe.photoUrl ? (
                                <img src={recipe.photoUrl} alt={recipe.name} className="w-full h-full object-cover"/>
                            ) : (
                                <CameraIcon className="w-24 h-24 text-slate-400 dark:text-slate-500" />
                            )}
                        </div>
                        {recipe.videoUrl && (
                            <div className="mt-4 px-4 pb-4 md:px-6 md:pb-6">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center"><VideoIcon /><span className="ml-2">Video de Preparación</span></h3>
                                <video src={recipe.videoUrl} controls className="w-full rounded-md shadow-inner"></video>
                            </div>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="p-6 md:p-8 flex flex-col">
                        <div className="flex justify-between items-start">
                             <div>
                                <span className="text-sm font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-3 py-1 rounded-full">{recipe.category}</span>
                                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mt-3">{recipe.name}</h1>
                            </div>
                            {canEdit && (
                                <button 
                                    onClick={() => setIsEditModalOpen(true)} 
                                    className="flex items-center space-x-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                >
                                    <EditIcon />
                                    <span>Editar</span>
                                </button>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 mt-6 border-t dark:border-slate-700 pt-6">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tiempo de Preparación</p>
                                <p className="text-lg font-semibold text-slate-800 dark:text-white">{recipe.prepTimeMinutes} minutos</p>
                            </div>
                             <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Rendimiento Esperado</p>
                                <p className="text-lg font-semibold text-slate-800 dark:text-white">{recipe.expectedYield} {recipe.yieldUnit}</p>
                            </div>
                             {recipe.type === RecipeType.Produccion && (
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Vida de Anaquel</p>
                                    <p className="text-lg font-semibold text-slate-800 dark:text-white">{recipe.shelfLifeDays} días</p>
                                </div>
                            )}
                             <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tipo</p>
                                <p className="text-lg font-semibold text-slate-800 dark:text-white">{recipe.type}</p>
                            </div>
                        </div>
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 p-6 md:p-8 border-t dark:border-slate-700">
                    {/* Ingredients */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Ingredientes</h2>
                        <ul className="space-y-3 list-disc list-inside bg-slate-50 dark:bg-slate-700/50 p-6 rounded-lg shadow-inner">
                            {recipe.ingredients.map(ing => (
                                <li key={ing.ingredientId} className="text-slate-700 dark:text-slate-300">
                                    <span className="font-semibold">{ing.ingredientName}:</span> {ing.quantity} {ing.unit}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Steps */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Pasos de Preparación</h2>
                        <ol className="space-y-4">
                            {recipe.steps.map((step, index) => (
                                <li key={index} className="flex items-start">
                                    <div className="flex-shrink-0 bg-indigo-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold mr-4">{index + 1}</div>
                                    <p className="text-slate-700 dark:text-slate-300 pt-1">{step.description}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>

            {canEdit && (
                <EditRecipeModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={onUpdateRecipe}
                    recipeToEdit={recipe}
                    masterIngredients={masterIngredients}
                />
            )}
        </div>
    );
};

export default RecipeDetail;