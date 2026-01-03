import React, { useState, useMemo } from 'react';
import { X, Search, ChevronRight, ChevronDown, Folder, Package, Filter, CheckSquare, Square, Tag } from 'lucide-react';
import { useStore } from '../store';
import { ProductCard } from '../components/ProductCard';
import { CategoryItem } from '../types';

// --- Tree Component ---
interface TreeNodeProps {
  node: CategoryItem;
  allCategories: CategoryItem[];
  level: number;
  selectedIds: string[]; 
  onToggle: (id: string) => void;
  expandedIds: string[];
  toggleExpand: (id: string) => void;
  counts: Record<string, number>; 
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, allCategories, level, selectedIds, onToggle, expandedIds, toggleExpand, counts }) => {
  const children = allCategories.filter(c => c.parentId === node.id);
  const isExpanded = expandedIds.includes(node.id);
  const isSelected = selectedIds.includes(node.id);
  const hasChildren = children.length > 0;
  const count = counts[node.id] || 0;

  return (
    <div className="select-none">
      <div 
        className="flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors group"
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
      >
        <div className="flex items-center overflow-hidden">
            <button 
                onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
                className={`p-1 mr-1 rounded hover:bg-slate-200 text-slate-400 transition ${hasChildren ? '' : 'invisible'}`}
            >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <div className={`mr-2 transition ${isSelected ? 'text-orange-600' : 'text-slate-300 group-hover:text-slate-400'}`}>
                {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
            </div>
            <span className={`text-sm truncate transition ${isSelected ? 'text-orange-700 font-bold' : 'text-slate-700'}`}>{node.name}</span>
        </div>
        <span className="text-xs text-slate-400 bg-slate-100 px-1.5 rounded-full">{count}</span>
      </div>
      {isExpanded && children.length > 0 && (
        <div className="border-l border-slate-100 ml-4">
          {children.map(child => (
            <TreeNode key={child.id} node={child} allCategories={allCategories} level={level + 1} selectedIds={selectedIds} onToggle={onToggle} expandedIds={expandedIds} toggleExpand={toggleExpand} counts={counts}/>
          ))}
        </div>
      )}
    </div>
  );
};

export const Catalog = () => {
  const { products, categories, attributes, terms } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedTermIds, setSelectedTermIds] = useState<string[]>([]); // Selected Attributes
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const rootNodes = useMemo(() => categories.filter(c => !c.parentId), [categories]);

  const getDescendantIds = (parentId: string): string[] => {
      const children = categories.filter(c => c.parentId === parentId);
      let ids = [parentId];
      children.forEach(child => ids = [...ids, ...getDescendantIds(child.id)]);
      return ids;
  };

  // --- FILTERING & COUNTER LOGIC ---
  const { filteredProducts, termCounts, categoryCounts, availableAttributes } = useMemo(() => {
      
      // 1. Base Filter (Search)
      let baseList = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

      // 2. Category Filter (Recursive)
      // We calculate "Attribute Availability" based on this set (Category Filtered)
      let categoryFiltered = baseList;
      if (selectedCategoryIds.length > 0) {
          const allowedCatIds = new Set<string>();
          selectedCategoryIds.forEach(id => getDescendantIds(id).forEach(d => allowedCatIds.add(d)));
          
          categoryFiltered = baseList.filter(p => {
              if (p.categoryIds && p.categoryIds.length > 0) return p.categoryIds.some(cid => allowedCatIds.has(cid));
              return false;
          });
      }

      // 3. Calculate Counters & Available Attributes
      // We do this BEFORE filtering by attributes so the user sees all options relevant to the current Category
      const termCounts: Record<string, number> = {};
      const categoryCounts: Record<string, number> = {};
      const activeAttrIds = new Set<string>();

      // Count categories (global scope within search)
      baseList.forEach(p => {
          p.categoryIds?.forEach(cid => categoryCounts[cid] = (categoryCounts[cid] || 0) + 1);
      });

      // Count terms & identify active attributes (scope within selected category)
      categoryFiltered.forEach(p => {
          p.termIds?.forEach(tid => {
              termCounts[tid] = (termCounts[tid] || 0) + 1;
              const term = terms.find(t => t.id === tid);
              if (term) activeAttrIds.add(term.attributeId);
          });
      });

      const availableAttributes = attributes?.filter(a => activeAttrIds.has(a.id));

      // 4. Final Attribute Filter (AND logic between attributes, OR logic within attribute)
      let finalList = categoryFiltered;
      
      // Group selected terms by attribute
      const selectedAttributes = attributes?.filter(attr => 
          terms.some(t => t.attributeId === attr.id && selectedTermIds.includes(t.id))
      );

      if (selectedAttributes?.length > 0) {
          finalList = finalList.filter(p => {
              // Product must match AT LEAST ONE selected term for EVERY selected attribute group
              return selectedAttributes.every(attr => {
                  const attrSelectedTerms = terms
                      .filter(t => t.attributeId === attr.id && selectedTermIds.includes(t.id))
                      .map(t => t.id);
                  return p.termIds?.some(tid => attrSelectedTerms.includes(tid));
              });
          });
      }

      return { 
          filteredProducts: finalList, 
          termCounts, 
          categoryCounts,
          availableAttributes 
      };
  }, [products, searchTerm, selectedCategoryIds, selectedTermIds, categories, attributes, terms]);

  // Handlers
  const toggleCategory = (id: string) => setSelectedCategoryIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleTerm = (id: string) => setSelectedTermIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleExpand = (id: string) => setExpandedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className={`md:w-72 flex-shrink-0 bg-white md:bg-transparent rounded-2xl shadow-2xl md:shadow-none p-6 md:p-0 fixed md:static inset-0 z-50 md:z-auto transition-transform duration-300 overflow-y-auto md:overflow-visible ${filtersOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="flex justify-between items-center md:hidden mb-6 border-b pb-4">
            <h3 className="font-heading font-bold text-2xl uppercase">Филтри</h3>
            <button onClick={() => setFiltersOpen(false)}><X size={24}/></button>
          </div>

          <div className="space-y-6 sticky top-24">
            {/* Search */}
            <div className="relative">
                <input type="text" placeholder="Търсене..." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl pl-10 focus:ring-2 focus:ring-orange-500 outline-none transition shadow-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
            </div>

            {/* Categories */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <label className="font-bold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2"><Folder size={14}/> Категории</label>
                    {selectedCategoryIds.length > 0 && <button onClick={() => setSelectedCategoryIds([])} className="text-xs text-red-500 font-bold hover:underline">Изчисти</button>}
                </div>
                <div className="space-y-1">
                    {rootNodes.map(node => (
                        <TreeNode key={node.id} node={node} allCategories={categories} level={0} selectedIds={selectedCategoryIds} onToggle={toggleCategory} expandedIds={expandedIds} toggleExpand={toggleExpand} counts={categoryCounts}/>
                    ))}
                </div>
            </div>

            {/* Dynamic Attributes */}
            {availableAttributes?.map(attr => (
                <div key={attr.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-fade-in">
                    <div className="flex justify-between items-center mb-3">
                        <label className="font-bold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2"><Tag size={14}/> {attr.name}</label>
                    </div>
                    <div className="space-y-2">
                        {terms.filter(t => t.attributeId === attr.id && (termCounts[t.id] || 0) > 0).map(term => (
                            <div key={term.id} className="flex items-center justify-between cursor-pointer group" onClick={() => toggleTerm(term.id)}>
                                <div className="flex items-center gap-2">
                                    <div className={`transition ${selectedTermIds.includes(term.id) ? 'text-orange-600' : 'text-slate-300 group-hover:text-slate-400'}`}>
                                        {selectedTermIds.includes(term.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                                    </div>
                                    <span className={`text-sm ${selectedTermIds.includes(term.id) ? 'font-bold text-neutral-900' : 'text-slate-600'}`}>{term.name}</span>
                                </div>
                                <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{termCounts[term.id]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
          </div>
        </div>

        {/* Overlay */}
        {filtersOpen && <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setFiltersOpen(false)}></div>}

        {/* Grid */}
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-heading font-bold text-neutral-900 uppercase">
                {selectedCategoryIds.length === 1 ? categories.find(c => c.id === selectedCategoryIds[0])?.name : 'Продукти'} 
                <span className="text-orange-500 text-2xl align-top ml-2">{filteredProducts.length}</span>
            </h2>
            <button className="md:hidden flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg shadow-lg" onClick={() => setFiltersOpen(true)}><Filter size={18} /></button>
          </div>
          
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-32 text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <Package size={64} className="mx-auto mb-6 text-slate-200" />
              <p className="text-lg">Няма намерени продукти.</p>
              <button onClick={() => { setSearchTerm(''); setSelectedCategoryIds([]); setSelectedTermIds([]); }} className="mt-4 text-orange-600 font-bold hover:underline">Покажи всички</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};