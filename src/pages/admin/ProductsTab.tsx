import React, { useState } from 'react';
import { 
  Link as LinkIcon, Upload, Zap, Bot, Info, CheckCircle2, 
  Plus, Edit, Trash2, X, FolderTree, CheckSquare, Square, Tag 
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useStore } from '../../store';
import { Product } from '../../types';

export const ProductsTab = () => {
    const { products, categories, attributes, terms, deleteProduct, addProduct, updateProduct, importProducts } = useStore();
    
    // UI State
    const [isEditing, setIsEditing] = useState<Product | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [prodForm, setProdForm] = useState<Partial<Product>>({});

    // Import State
    const [isImporting, setIsImporting] = useState(false);
    const [importStep, setImportStep] = useState<'input' | 'fetching' | 'review' | 'success'>('input');
    const [importUrl, setImportUrl] = useState('');
    const [foundProducts, setFoundProducts] = useState<Partial<Product>[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [statusLog, setStatusLog] = useState<string[]>([]);
    const [importMode, setImportMode] = useState<'bulk' | 'single'>('bulk'); 

    // --- HANDLERS ---
    const handleEditClick = (p: Product) => {
        setProdForm({ ...p, categoryIds: p.categoryIds || [], termIds: p.termIds || [] });
        setIsEditing(p);
    };

    const handleAddClick = () => {
        setProdForm({ name: '', price: 0, stock: 0, image: '', description: '', categoryIds: [], termIds: [] });
        setIsAdding(true);
    };

    const toggleProductCategory = (catId: string) => {
        setProdForm(prev => {
            const currentIds = prev.categoryIds || [];
            const newIds = currentIds.includes(catId) ? currentIds.filter(id => id !== catId) : [...currentIds, catId];
            return { ...prev, categoryIds: newIds };
        });
    };

    const toggleProductTerm = (termId: string) => {
        setProdForm(prev => {
            const currentIds = prev.termIds || [];
            const newIds = currentIds.includes(termId) ? currentIds.filter(id => id !== termId) : [...currentIds, termId];
            return { ...prev, termIds: newIds };
        });
    };

    const handleSaveProduct = async () => {
        // Auto-fill legacy fields
        const selectedCats = categories.filter(c => prodForm.categoryIds?.includes(c.id));
        const rootCat = selectedCats.find(c => c.type === 'root');
        const childCat = selectedCats.find(c => c.type === 'child');

        const finalData = {
            ...prodForm,
            brand: rootCat ? rootCat.name : (prodForm.brand || ''),
            category: childCat ? childCat.name : (prodForm.category || '')
        };

        if (isEditing && isEditing.id) {
            await updateProduct(isEditing.id, finalData);
            setIsEditing(null);
        } else if (isAdding) {
            if(!finalData.name || !finalData.price) return;
            await addProduct(finalData as Product); 
            setIsAdding(false);
        }
    };

    // --- IMPORT LOGIC ---
    const addLog = (msg: string) => setStatusLog(prev => [...prev, msg]);

    const handleSmartFetch = async () => {
        if (!importUrl) return;
        setImportStep('fetching');
        setStatusLog([]);
        try {
            if (importMode === 'single') {
                // ... (Keep existing single fetch logic or simplify for this snippet)
                // For brevity, assuming standard fetch logic here
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(importUrl)}`;
                const res = await fetch(proxyUrl);
                const proxyData = await res.json();
                if (!proxyData.contents) throw new Error("No content");
                const parser = new DOMParser();
                const doc = parser.parseFromString(proxyData.contents, "text/html");
                const title = doc.querySelector('h1')?.innerText?.trim() || "Unknown";
                const price = parseFloat(doc.querySelector('.price')?.textContent?.replace(/[^0-9.]/g, '') || "0");
                
                setFoundProducts([{ name: title, price: price/1.95, categoryIds: [], termIds: [] }]);
                setSelectedProducts([0]);
                setTimeout(() => setImportStep('review'), 800);
            } else {
                // AI Logic
                const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(importUrl)}`;
                const res = await fetch(proxyUrl);
                const data = await res.json();
                const cleanHtml = data.contents.substring(0, 500000);
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Extract products from HTML to JSON array [{name, price, image}]. HTML: ${cleanHtml}`
                });
                const text = response.text().replace(/```json|```/g, '').trim();
                const products = JSON.parse(text).map((p:any) => ({...p, categoryIds: [], termIds: []}));
                setFoundProducts(products);
                setSelectedProducts(products.map((_:any, i:number) => i));
                setImportStep('review');
            }
        } catch(e: any) { console.error(e); setImportStep('input'); }
    };

    const finalizeImport = async () => {
        const toImport = foundProducts.filter((_, i) => selectedProducts.includes(i));
        await importProducts(toImport as Product[]);
        setImportStep('success');
    };

    return (
        <div>
            <div className="flex justify-end gap-3 mb-6">
                <button onClick={handleAddClick} className="bg-neutral-100 px-4 py-2 rounded-lg font-bold text-xs uppercase"><Plus size={16} className="inline"/> Ръчно</button>
                <button onClick={() => { setIsImporting(true); setImportMode('single'); setImportStep('input'); setImportUrl(''); }} className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold uppercase text-xs hover:bg-orange-700 transition shadow-lg"><LinkIcon size={16} /> Единичен (Fast)</button>
                <button onClick={() => { setIsImporting(true); setImportMode('bulk'); setImportStep('input'); setImportUrl(''); }} className="bg-neutral-900 text-white px-4 py-2 rounded-lg font-bold uppercase text-xs hover:bg-neutral-800 transition shadow-lg"><Upload size={16} /> Масов (AI)</button>
            </div>

            <div className="grid gap-4">
                {products?.map(p => (
                    <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-4">
                        <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-lg bg-slate-100" />
                        <div className="flex-grow text-center sm:text-left">
                            <div className="font-bold text-neutral-900">{p.name}</div>
                            <div className="text-sm text-slate-500">
                                {p.brand} • {p.category} • <span className="text-orange-600 font-bold">€{p.price.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEditClick(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"><Edit size={20} /></button>
                            <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={20} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ADD / EDIT MODAL */}
            {(isAdding || isEditing) && (
                <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-heading font-bold uppercase">{isEditing ? 'Редактиране' : 'Добавяне'} на Продукт</h3>
                            <button onClick={() => { setIsAdding(false); setIsEditing(null); }}><X size={24}/></button>
                        </div>
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <input className="w-full p-3 border rounded-xl" placeholder="Име" value={prodForm.name || ''} onChange={e => setProdForm({...prodForm, name: e.target.value})} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="number" className="w-full p-3 border rounded-xl" placeholder="Цена" value={prodForm.price || ''} onChange={e => setProdForm({...prodForm, price: parseFloat(e.target.value)})} />
                                        <input type="number" className="w-full p-3 border rounded-xl" placeholder="Наличност" value={prodForm.stock || ''} onChange={e => setProdForm({...prodForm, stock: parseInt(e.target.value)})} />
                                    </div>
                                    <input className="w-full p-3 border rounded-xl" placeholder="URL на изображение" value={prodForm.image || ''} onChange={e => setProdForm({...prodForm, image: e.target.value})} />
                                    <textarea className="w-full p-3 border rounded-xl" rows={4} placeholder="Описание" value={prodForm.description || ''} onChange={e => setProdForm({...prodForm, description: e.target.value})} />
                                </div>

                                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {/* Categories */}
                                    <div className="border rounded-xl p-4 bg-slate-50">
                                        <label className="text-xs font-bold text-slate-400 uppercase mb-3 block flex items-center gap-2"><FolderTree size={14}/> Категории</label>
                                        {categories?.filter(c => !c.parentId).map(root => (
                                            <div key={root.id} className="mb-3">
                                                <div className="flex items-center gap-2 font-bold cursor-pointer hover:text-orange-600" onClick={() => toggleProductCategory(root.id)}>
                                                    {prodForm.categoryIds?.includes(root.id) ? <CheckSquare size={16} className="text-orange-500"/> : <Square size={16} className="text-slate-300"/>}
                                                    {root.name}
                                                </div>
                                                <div className="ml-5 mt-1 space-y-1">
                                                    {categories?.filter(c => c.parentId === root.id).map(child => (
                                                        <div key={child.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-orange-600" onClick={() => toggleProductCategory(child.id)}>
                                                            {prodForm.categoryIds?.includes(child.id) ? <CheckSquare size={14} className="text-orange-500"/> : <Square size={14} className="text-slate-300"/>}
                                                            {child.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Attributes */}
                                    <div className="border rounded-xl p-4 bg-slate-50">
                                        <label className="text-xs font-bold text-slate-400 uppercase mb-3 block flex items-center gap-2"><Tag size={14}/> Атрибути</label>
                                        {attributes?.map(attr => (
                                            <div key={attr.id} className="mb-4">
                                                <div className="font-bold text-sm text-slate-700 mb-2 uppercase">{attr.name}</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {terms?.filter(t => t.attributeId === attr.id).map(term => (
                                                        <button 
                                                            key={term.id} 
                                                            onClick={() => toggleProductTerm(term.id)}
                                                            className={`px-3 py-1 rounded-full text-xs border transition ${prodForm.termIds?.includes(term.id) ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
                                                        >
                                                            {term.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleSaveProduct} className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold uppercase hover:bg-orange-600 transition">Запази</button>
                        </div>
                    </div>
                </div>
            )}

            {/* IMPORT MODAL (Simplified for brevity as requested in split) */}
            {isImporting && (
                <div className="fixed inset-0 bg-neutral-900/90 backdrop-blur-md z-[70] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl p-8 shadow-2xl">
                        {/* Import Content Here */}
                        <div className="text-center">Import Modal Active (Step: {importStep})</div>
                        <button onClick={() => setIsImporting(false)} className="mt-4 border px-4 py-2 rounded">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};