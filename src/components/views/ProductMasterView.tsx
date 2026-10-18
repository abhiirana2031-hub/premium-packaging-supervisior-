'use client';

import React, { useState } from 'react';
import {
  Category,
  IdealWeightMode,
  Item,
  Subcategory,
  UserProfile,
} from '@/types';
import {
  Package,
  Plus,
  Edit,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Search,
  Filter,
  Layers,
  Info,
} from 'lucide-react';

interface ProductMasterViewProps {
  items: Item[];
  categories: Category[];
  subcategories: Subcategory[];
  currentUser: UserProfile;
  onSaveItem: (item: Partial<Item> & { itemName: string; itemCode: string; categoryId: string; subcategoryId: string }) => void;
}

export const ProductMasterView: React.FC<ProductMasterViewProps> = ({
  items,
  categories,
  subcategories,
  currentUser,
  onSaveItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Item> | null>(null);

  // Form Fields
  const [itemCode, setItemCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [catId, setCatId] = useState('');
  const [subCatId, setSubCatId] = useState('');

  // Component weights
  const [jarWeight, setJarWeight] = useState<number | ''>('');
  const [capWeight, setCapWeight] = useState<number | ''>('');
  const [plasticHandleWeight, setPlasticHandleWeight] = useState<number | ''>('');
  const [steelHandleWeight, setSteelHandleWeight] = useState<number | ''>('');
  const [otherComponentWeight, setOtherComponentWeight] = useState<number | ''>('');
  const [otherComponentName, setOtherComponentName] = useState('');

  // Ideal weight mode & manual approved weight
  const [idealWeightMode, setIdealWeightMode] = useState<IdealWeightMode>('calculated');
  const [approvedIdealWeight, setApprovedIdealWeight] = useState<number | ''>('');

  // Tolerance
  const [tolerancePct, setTolerancePct] = useState<number>(2.5);
  const [minWeight, setMinWeight] = useState<number | ''>('');
  const [maxWeight, setMaxWeight] = useState<number | ''>('');
  const [targetQty, setTargetQty] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Filter items
  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) return false;
    if (selectedSubcategory !== 'all' && item.subcategoryId !== selectedSubcategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.itemName.toLowerCase().includes(q) ||
        item.itemCode.toLowerCase().includes(q) ||
        (item.itemDescription && item.itemDescription.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Calculate component sum dynamically
  const calculatedSum = Number(
    (
      (Number(jarWeight) || 0) +
      (Number(capWeight) || 0) +
      (Number(plasticHandleWeight) || 0) +
      (Number(steelHandleWeight) || 0) +
      (Number(otherComponentWeight) || 0)
    ).toFixed(2)
  );

  // Active ideal weight resolved
  const activeIdealWeight =
    idealWeightMode === 'manual' && Number(approvedIdealWeight) > 0
      ? Number(approvedIdealWeight)
      : calculatedSum;

  const handleOpenCreate = () => {
    setEditingItem(null);
    setItemCode('');
    setItemName('');
    setItemDescription('');
    setCatId(categories[0]?.id || '');
    const firstSub = subcategories.find((s) => s.categoryId === categories[0]?.id);
    setSubCatId(firstSub?.id || '');
    setJarWeight('');
    setCapWeight('');
    setPlasticHandleWeight('');
    setSteelHandleWeight('');
    setOtherComponentWeight('');
    setOtherComponentName('');
    setIdealWeightMode('calculated');
    setApprovedIdealWeight('');
    setTolerancePct(2.5);
    setMinWeight('');
    setMaxWeight('');
    setTargetQty('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (it: Item) => {
    setEditingItem(it);
    setItemCode(it.itemCode);
    setItemName(it.itemName);
    setItemDescription(it.itemDescription || '');
    setCatId(it.categoryId);
    setSubCatId(it.subcategoryId);
    setJarWeight(it.jarWeight ?? '');
    setCapWeight(it.capWeight ?? '');
    setPlasticHandleWeight(it.plasticHandleWeight ?? '');
    setSteelHandleWeight(it.steelHandleWeight ?? '');
    setOtherComponentWeight(it.otherComponentWeight ?? '');
    setOtherComponentName(it.otherComponentName || '');
    setIdealWeightMode(it.idealWeightMode);
    setApprovedIdealWeight(it.approvedIdealWeight);
    setTolerancePct(it.toleranceLimits.percentage);
    setMinWeight(it.toleranceLimits.minWeight ?? '');
    setMaxWeight(it.toleranceLimits.maxWeight ?? '');
    setTargetQty(it.targetProductionQty ?? '');
    setNotes(it.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCode.trim() || !itemName.trim() || !catId || !subCatId) {
      alert('Item code, name, category, and subcategory are required.');
      return;
    }

    if (activeIdealWeight <= 0) {
      alert('Please specify components or an approved ideal weight (> 0g).');
      return;
    }

    onSaveItem({
      id: editingItem?.id,
      itemCode: itemCode.trim().toUpperCase(),
      itemName: itemName.trim(),
      itemDescription: itemDescription.trim(),
      categoryId: catId,
      subcategoryId: subCatId,
      jarWeight: jarWeight !== '' ? Number(jarWeight) : null,
      capWeight: capWeight !== '' ? Number(capWeight) : null,
      plasticHandleWeight: plasticHandleWeight !== '' ? Number(plasticHandleWeight) : null,
      steelHandleWeight: steelHandleWeight !== '' ? Number(steelHandleWeight) : null,
      otherComponentWeight: otherComponentWeight !== '' ? Number(otherComponentWeight) : null,
      otherComponentName: otherComponentName.trim(),
      idealWeightMode,
      approvedIdealWeight: activeIdealWeight,
      toleranceLimits: {
        percentage: Number(tolerancePct) || 2.5,
        minWeight: minWeight !== '' ? Number(minWeight) : null,
        maxWeight: maxWeight !== '' ? Number(maxWeight) : null,
      },
      targetProductionQty: targetQty !== '' ? Number(targetQty) : null,
      notes: notes.trim(),
      isActive: true,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Package className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Product Master & Specifications (Section 5)
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            Packaging Items Catalog
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define item codes, component weights (jar, cap, handles), dual-mode ideal weights, and quality tolerances.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Packaging Item</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search items by code, name, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div className="w-48">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSubcategory('all');
            }}
            className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-medium"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500 font-semibold ml-auto">
          {filteredItems.length} packaging items cataloged
        </span>
      </div>

      {/* Items Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-3.5">Item Code & Name</th>
                <th className="py-3 px-3.5">Category / Subcategory</th>
                <th className="py-3 px-3.5 text-right">Jar (g)</th>
                <th className="py-3 px-3.5 text-right">Cap (g)</th>
                <th className="py-3 px-3.5 text-right">Handle (g)</th>
                <th className="py-3 px-3.5 text-right">Other (g)</th>
                <th className="py-3 px-3.5 text-right">Component Sum</th>
                <th className="py-3 px-3.5 text-right">Approved Ideal Wt</th>
                <th className="py-3 px-3.5 text-center">Spec Mode</th>
                <th className="py-3 px-3.5 text-center">Tolerance</th>
                <th className="py-3 px-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredItems.map((item) => {
                const cat = categories.find((c) => c.id === item.categoryId);
                const sub = subcategories.find((s) => s.id === item.subcategoryId);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3.5">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {item.itemName}
                      </p>
                      <p className="font-mono text-emerald-600 font-semibold text-[11px]">
                        [{item.itemCode}]
                      </p>
                    </td>

                    <td className="py-3 px-3.5">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {cat?.name || 'General'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {sub?.name || 'Standard'}
                      </p>
                    </td>

                    <td className="py-3 px-3.5 text-right text-slate-600 dark:text-slate-300">
                      {item.jarWeight !== null ? `${item.jarWeight.toFixed(1)} g` : '—'}
                    </td>

                    <td className="py-3 px-3.5 text-right text-slate-600 dark:text-slate-300">
                      {item.capWeight !== null ? `${item.capWeight.toFixed(1)} g` : '—'}
                    </td>

                    <td className="py-3 px-3.5 text-right text-slate-600 dark:text-slate-300">
                      {item.plasticHandleWeight
                        ? `${item.plasticHandleWeight}g (P)`
                        : item.steelHandleWeight
                        ? `${item.steelHandleWeight}g (S)`
                        : '—'}
                    </td>

                    <td className="py-3 px-3.5 text-right text-slate-600 dark:text-slate-300">
                      {item.otherComponentWeight !== null ? `${item.otherComponentWeight.toFixed(1)} g` : '—'}
                    </td>

                    <td className="py-3 px-3.5 text-right text-slate-500 font-mono">
                      {item.calculatedComponentTotal.toFixed(2)} g
                    </td>

                    <td className="py-3 px-3.5 text-right font-black text-slate-900 dark:text-white">
                      {item.approvedIdealWeight.toFixed(2)} g
                    </td>

                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.idealWeightMode === 'manual'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border'
                        }`}
                        title={
                          item.idealWeightMode === 'manual'
                            ? 'Using approved manual ideal weight for comparisons'
                            : 'Using component sum for comparisons'
                        }
                      >
                        {item.idealWeightMode}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 text-center font-semibold text-slate-700 dark:text-slate-300">
                      ±{item.toleranceLimits.percentage}%
                    </td>

                    <td className="py-3 px-3.5 text-center">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                        title="Edit Item Master"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <form
            onSubmit={handleSaveForm}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingItem?.id ? 'Edit Packaging Item Specifications' : 'New Packaging Item Master'}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure component weights, approved ideal weight, and tolerance parameters
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unique Item Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JAR-PET-750"
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="w-full font-mono font-bold p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Product Item Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 750ml Clear Honey Jar"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full font-bold p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Hierarchy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={catId}
                    onChange={(e) => {
                      setCatId(e.target.value);
                      const firstSub = subcategories.find((s) => s.categoryId === e.target.value);
                      setSubCatId(firstSub?.id || '');
                    }}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subcategory <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={subCatId}
                    onChange={(e) => setSubCatId(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                  >
                    {subcategories
                      .filter((s) => s.categoryId === catId)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Component Weights in Grams (Section 5) */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    Packaging Component Weights (Grams)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Leave blank if not applicable to this item
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Jar Body Weight (g)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 32.0"
                      value={jarWeight}
                      onChange={(e) => setJarWeight(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Cap Weight (g)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 10.5"
                      value={capWeight}
                      onChange={(e) => setCapWeight(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Plastic Handle (g)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={plasticHandleWeight}
                      onChange={(e) => setPlasticHandleWeight(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Steel Handle (g)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={steelHandleWeight}
                      onChange={(e) => setSteelHandleWeight(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Other Component Weight (g)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 1.5"
                      value={otherComponentWeight}
                      onChange={(e) => setOtherComponentWeight(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Other Component Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Induction Seal Liner"
                      value={otherComponentName}
                      onChange={(e) => setOtherComponentName(e.target.value)}
                      className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Ideal Weight Calculation Option A vs Option B (Section 5) */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider text-[11px]">
                    Ideal Weight Specification Mode
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    Active Ideal Total: {activeIdealWeight.toFixed(2)} g
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-colors ${
                      idealWeightMode === 'calculated'
                        ? 'border-emerald-600 bg-white dark:bg-slate-900 shadow-xs'
                        : 'border-emerald-200 dark:border-emerald-900 bg-emerald-100/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="idealMode"
                        checked={idealWeightMode === 'calculated'}
                        onChange={() => setIdealWeightMode('calculated')}
                      />
                      <span className="font-bold text-slate-900 dark:text-white">Option A: Automatic Sum</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Sum of defined components: <strong>{calculatedSum.toFixed(2)} g</strong>
                    </p>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-colors ${
                      idealWeightMode === 'manual'
                        ? 'border-emerald-600 bg-white dark:bg-slate-900 shadow-xs'
                        : 'border-emerald-200 dark:border-emerald-900 bg-emerald-100/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="idealMode"
                        checked={idealWeightMode === 'manual'}
                        onChange={() => setIdealWeightMode('manual')}
                      />
                      <span className="font-bold text-slate-900 dark:text-white">Option B: Manually Approved Ideal</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Approved g"
                        disabled={idealWeightMode !== 'manual'}
                        value={approvedIdealWeight}
                        onChange={(e) => setApprovedIdealWeight(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-28 p-1.5 rounded border bg-white dark:bg-slate-800 text-xs font-bold"
                      />
                      <span className="text-[10px] text-slate-500">grams</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Tolerances */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Acceptable Tolerance (±%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tolerancePct}
                    onChange={(e) => setTolerancePct(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Min Acceptable Wt (g)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Optional"
                    value={minWeight}
                    onChange={(e) => setMinWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Max Acceptable Wt (g)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Optional"
                    value={maxWeight}
                    onChange={(e) => setMaxWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Save Packaging Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
