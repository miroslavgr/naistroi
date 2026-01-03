import React, { useState } from 'react';
import { Settings, Trash2, Plus, X, Info } from 'lucide-react';
import { useStore } from '../../store';

export const AttributesTab = () => {
    const { attributes, terms, addAttribute, deleteAttribute, addTerm, deleteTerm } = useStore();
    const [newAttr, setNewAttr] = useState('');

    return (
        <div className="grid md:grid-cols-2 gap-8">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
                 <h3 className="font-heading font-bold uppercase mb-4 flex items-center gap-2"><Settings size={18} /> Дефиниране на Атрибути</h3>
                 <div className="flex gap-2 mb-6">
                     <input className="flex-grow border rounded-lg p-2" placeholder="Нов атрибут (напр. Цвят)" value={newAttr} onChange={e => setNewAttr(e.target.value)} />
                     <button onClick={() => { if(newAttr) { addAttribute(newAttr); setNewAttr(''); } }} className="bg-neutral-900 text-white px-4 rounded-lg font-bold"><Plus size={18}/></button>
                 </div>
                 <div className="space-y-4">
                     {attributes?.map(attr => (
                         <div key={attr.id} className="border rounded-xl p-4">
                             <div className="flex justify-between items-center mb-3">
                                 <span className="font-bold uppercase text-sm tracking-wider">{attr.name}</span>
                                 <button onClick={() => deleteAttribute(attr.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                             </div>
                             
                             {/* Terms List */}
                             <div className="flex flex-wrap gap-2 mb-3">
                                 {terms?.filter(t => t.attributeId === attr.id).map(term => (
                                     <div key={term.id} className="bg-slate-100 px-3 py-1 rounded-full text-xs flex items-center gap-2 group">
                                         {term.name}
                                         <button onClick={() => deleteTerm(term.id)} className="text-slate-400 hover:text-red-500 hidden group-hover:block"><X size={12}/></button>
                                     </div>
                                 ))}
                             </div>

                             {/* Add Term */}
                             <div className="flex gap-2">
                                 <input 
                                    className="w-full border rounded p-1 text-xs bg-slate-50" 
                                    placeholder={`Добави стойност към ${attr.name} (Enter)`}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            addTerm(attr.id, e.currentTarget.value);
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                 />
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
             <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 h-fit text-sm text-blue-800">
                 <h4 className="font-bold mb-2 flex items-center gap-2"><Info size={16}/> Как работи?</h4>
                 <p className="mb-2">1. Създайте атрибут (напр. "Цвят" или "Размер").</p>
                 <p className="mb-2">2. Добавете стойности към него (напр. "Червен", "XL").</p>
                 <p>3. При редакция на продукт ще можете да изберете кои от тези стойности важат за него.</p>
             </div>
         </div>
    );
};