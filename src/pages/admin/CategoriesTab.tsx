import React, { useState } from 'react';
import { Package, Edit, Trash2, FolderTree } from 'lucide-react';
import { useStore } from '../../store';
import { CategoryItem } from '../../types';

export const CategoriesTab = () => {
    const { categories, addCategory, updateCategory, deleteCategory } = useStore();
    const [catForm, setCatForm] = useState<Partial<CategoryItem>>({});
    const [isEditingCat, setIsEditingCat] = useState<string | null>(null);

    const handleSaveCategory = async () => {
        if (isEditingCat) {
            await updateCategory(isEditingCat, catForm);
            setIsEditingCat(null);
        } else {
            if (!catForm.name) return;
            const type = catForm.parentId ? 'child' : 'root';
            await addCategory({ ...catForm, id: '', type } as CategoryItem);
            setCatForm({});
        }
    };

    const handleEditCategory = (cat: CategoryItem) => {
        setCatForm(cat);
        setIsEditingCat(cat.id);
    };

    return (
        <div className="grid md:grid-cols-3 gap-8">
             <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit sticky top-24">
                 <h3 className="font-heading font-bold uppercase mb-4">{isEditingCat ? 'Редактиране' : 'Нова Категория'}</h3>
                 <div className="space-y-4">
                     <div>
                         <label className="text-xs font-bold text-slate-400 uppercase">Име</label>
                         <input className="w-full border rounded-lg p-2 mt-1" value={catForm.name || ''} onChange={e => setCatForm({...catForm, name: e.target.value})} />
                     </div>
                     <div>
                         <label className="text-xs font-bold text-slate-400 uppercase">Родител (Опционално)</label>
                         <select className="w-full border rounded-lg p-2 mt-1" value={catForm.parentId || ''} onChange={e => setCatForm({...catForm, parentId: e.target.value})}>
                             <option value="">-- Root (Топ ниво) --</option>
                             {categories?.filter(c => c.id !== isEditingCat && (!c.parentId)).map(c => (
                                 <option key={c.id} value={c.id}>{c.name}</option>
                             ))}
                         </select>
                         <p className="text-[10px] text-slate-400 mt-1">Ако оставите празно, категорията ще бъде Root (Топ ниво).</p>
                     </div>
                     <div className="flex gap-2 pt-2">
                         <button onClick={handleSaveCategory} className="flex-1 bg-neutral-900 text-white py-2 rounded-lg font-bold text-xs uppercase hover:bg-orange-600 transition">Запази</button>
                         {isEditingCat && <button onClick={() => { setIsEditingCat(null); setCatForm({}); }} className="px-3 py-2 border rounded-lg font-bold text-xs">Отказ</button>}
                     </div>
                 </div>
             </div>
             <div className="md:col-span-2 space-y-4">
                 {categories?.filter(c => !c.parentId).map(root => (
                     <div key={root.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                         <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                             <div className="font-bold flex items-center gap-2">
                                 <FolderTree size={16} className="text-orange-500"/> {root.name} 
                                 <span className="text-[10px] text-slate-400 uppercase bg-white px-2 rounded border">Root</span>
                             </div>
                             <div className="flex gap-1">
                                 <button onClick={() => handleEditCategory(root)} className="p-1 hover:bg-white rounded"><Edit size={14} className="text-blue-500"/></button>
                                 <button onClick={() => deleteCategory(root.id)} className="p-1 hover:bg-white rounded"><Trash2 size={14} className="text-red-500"/></button>
                             </div>
                         </div>
                         <div className="p-3 space-y-2">
                             {categories?.filter(c => c.parentId === root.id).map(child => (
                                 <div key={child.id} className="flex items-center justify-between pl-4 pr-2 py-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-100">
                                     <div className="flex items-center gap-2">
                                         <div className="w-2 h-2 border-l border-b border-slate-300"></div>
                                         <span>{child.name}</span>
                                     </div>
                                     <div className="flex gap-1">
                                         <button onClick={() => handleEditCategory(child)} className="p-1 hover:bg-white rounded"><Edit size={14} className="text-blue-500"/></button>
                                         <button onClick={() => deleteCategory(child.id)} className="p-1 hover:bg-white rounded"><Trash2 size={14} className="text-red-500"/></button>
                                     </div>
                                 </div>
                             ))}
                             {categories?.filter(c => c.parentId === root.id).length === 0 && (
                                 <div className="text-xs text-slate-400 pl-6 italic">Няма подкатегории</div>
                             )}
                         </div>
                     </div>
                 ))}
             </div>
         </div>
    );
};