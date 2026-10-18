'use client';

import React, { useState } from 'react';
import { Category, Item, Subcategory, UserProfile } from '@/types';
import { Layers, Plus, Edit, Trash2, CheckCircle2, ChevronRight, FolderPlus } from 'lucide-react';

interface CategoryManagementViewProps {
  categories: Category[];
  subcategories: Subcategory[];
  items: Item[];
  currentUser: UserProfile;
  onSaveCategory: (cat: Partial<Category> & { name: string }) => void;
  onSaveSubcategory: (sub: Partial<Subcategory> & { categoryId: string; name: string }) => void;
  onDeleteCategory: (id: string) => void;
}

export const CategoryManagementView: React.FC<CategoryManagementViewProps> = ({
  categories,
  subcategories,
  items,
  currentUser,
  onSaveCategory,
  onSaveSubcategory,
  onDeleteCategory,
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || '');

  // Category Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Subcategory Modal
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subName, setSubName] = useState('');
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  const selectedCategory = categories.find((c) => c.id === selectedCatId) || categories[0];
  const activeSubcategories = subcategories.filter((s) => s.categoryId === selectedCategory?.id);

  const handleOpenCatModal = (cat?: Category) => {
    if (cat) {
      setEditingCatId(cat.id);
      setCatName(cat.name);
      setCatCode(cat.code || '');
    } else {
      setEditingCatId(null);
      setCatName('');
      setCatCode('');
    }
    setIsCatModalOpen(true);
  };

  const handleSaveCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    onSaveCategory({
      id: editingCatId || undefined,
      name: catName.trim(),
      code: catCode.trim().toUpperCase() || undefined,
      sortOrder: categories.length + 1,
      isActive: true,
    });
    setIsCatModalOpen(false);
  };

  const handleOpenSubModal = (sub?: Subcategory) => {
    if (sub) {
      setEditingSubId(sub.id);
      setSubName(sub.name);
    } else {
      setEditingSubId(null);
      setSubName('');
    }
    setIsSubModalOpen(true);
  };

  const handleSaveSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim() || !selectedCategory) return;
    onSaveSubcategory({
      id: editingSubId || undefined,
      categoryId: selectedCategory.id,
      name: subName.trim(),
      isActive: true,
    });
    setIsSubModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Layers className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Product Structure & Hierarchy
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            Category & Subcategory Hierarchy
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Structure packaging products: Category → Subcategory → Item Specifications
          </p>
        </div>

        <button
          onClick={() => handleOpenCatModal()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Product Category</span>
        </button>
      </div>

      {/* Two Column Layout: Categories Left, Subcategories Right */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Categories List */}
        <div className="md:col-span-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Categories ({categories.length})
            </h3>
            <button
              onClick={() => handleOpenCatModal()}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-1.5">
            {categories.map((cat) => {
              const isSelected = cat.id === selectedCategory?.id;
              const catItemCount = items.filter((i) => i.categoryId === cat.id).length;

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="truncate">
                    <p className="text-xs font-bold truncate">{cat.name}</p>
                    <p className="text-[10px] text-slate-500 font-normal">
                      Code: {cat.code || '—'} • {catItemCount} items
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCatModal(cat);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-600"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Subcategories & Items within selected category */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  CATEGORY: {selectedCategory?.name}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                Subcategories ({activeSubcategories.length})
              </h3>
            </div>

            <button
              onClick={() => handleOpenSubModal()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Add Subcategory</span>
            </button>
          </div>

          {activeSubcategories.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No subcategories created yet for {selectedCategory?.name}.
            </div>
          ) : (
            <div className="space-y-3">
              {activeSubcategories.map((sub) => {
                const subItems = items.filter((i) => i.subcategoryId === sub.id);

                return (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {sub.name}
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {subItems.length} products
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenSubModal(sub)}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </div>

                    {/* Products in this subcategory */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {subItems.length === 0 ? (
                        <span className="text-[11px] text-slate-400">
                          No packaging items assigned to this subcategory yet.
                        </span>
                      ) : (
                        subItems.map((it) => (
                          <span
                            key={it.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-xs"
                          >
                            <span className="font-mono text-emerald-600 font-bold">[{it.itemCode}]</span>
                            <span>{it.itemName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">({it.approvedIdealWeight}g)</span>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <form
            onSubmit={handleSaveCat}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingCatId ? 'Edit Product Category' : 'Create Product Category'}
              </h3>
              <button type="button" onClick={() => setIsCatModalOpen(false)}>✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plastic Jars"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Category Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. JAR"
                  value={catCode}
                  onChange={(e) => setCatCode(e.target.value)}
                  className="w-full p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-800 uppercase font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subcategory Modal */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <form
            onSubmit={handleSaveSub}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingSubId ? 'Edit Subcategory' : `Add Subcategory to ${selectedCategory?.name}`}
              </h3>
              <button type="button" onClick={() => setIsSubModalOpen(false)}>✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Subcategory Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PET Wide Mouth Food Jars"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-800 font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSubModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Save Subcategory
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
