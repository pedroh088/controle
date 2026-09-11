import { useState, FormEvent } from 'react';
import { 
  Box, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  Calendar, 
  X, 
  Check, 
  Building2,
  DollarSign
} from 'lucide-react';
import { Material, Sector } from '../types';
import { createMaterial, updateMaterial, deleteMaterial } from '../services/api';

interface MaterialsViewProps {
  materials: Material[];
  sectors: Sector[];
  onRefresh: () => void;
  onNavigateToMovements: (prefillMaterialId?: string, defaultType?: 'ENTRADA' | 'SAIDA') => void;
}

export default function MaterialsView({
  materials,
  sectors,
  onRefresh,
  onNavigateToMovements,
}: MaterialsViewProps) {
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [lowStockOnly, setLowStockOnly] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Form states
  const [sku, setSku] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('EPIs & Segurança');
  const [unit, setUnit] = useState<Material['unit']>('UN');
  const [minStock, setMinStock] = useState<number>(10);
  const [maxStock, setMaxStock] = useState<number>(100);
  const [initialStock, setInitialStock] = useState<number>(0);
  const [initialSectorId, setInitialSectorId] = useState<string>(sectors[0]?.id || 'sec-1');
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [location, setLocation] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Categories list
  const categories = Array.from(new Set(materials.map((m) => m.category))).sort();

  const handleOpenNewModal = () => {
    setEditingMaterial(null);
    setSku(`MAT-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setDescription('');
    setCategory('EPIs & Segurança');
    setUnit('UN');
    setMinStock(10);
    setMaxStock(100);
    setInitialStock(0);
    setInitialSectorId(sectors[0]?.id || 'sec-1');
    setUnitPrice(0);
    setLocation('Corredor A - Prateleira 01');
    setExpiryDate('');
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (mat: Material) => {
    setEditingMaterial(mat);
    setSku(mat.sku);
    setName(mat.name);
    setDescription(mat.description);
    setCategory(mat.category);
    setUnit(mat.unit);
    setMinStock(mat.minStock);
    setMaxStock(mat.maxStock);
    setUnitPrice(mat.unitPrice);
    setLocation(mat.location);
    setExpiryDate(mat.expiryDate || '');
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!sku.trim() || !name.trim()) {
      setErrorMsg('Código SKU e Nome do material são campos obrigatórios.');
      return;
    }

    setSaving(true);
    try {
      if (editingMaterial) {
        await updateMaterial(editingMaterial.id, {
          sku,
          name,
          description,
          category,
          unit,
          minStock: Number(minStock),
          maxStock: Number(maxStock),
          unitPrice: Number(unitPrice),
          location,
          expiryDate: expiryDate || undefined,
        });
      } else {
        await createMaterial({
          sku,
          name,
          description,
          category,
          unit,
          minStock: Number(minStock),
          maxStock: Number(maxStock),
          currentStock: Number(initialStock),
          initialSectorId,
          unitPrice: Number(unitPrice),
          location,
          expiryDate: expiryDate || undefined,
        });
      }

      setModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar material.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, matName: string) => {
    if (!confirm(`Deseja realmente inativar o material "${matName}"?`)) return;
    try {
      await deleteMaterial(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir material.');
    }
  };

  // Filter
  const filtered = materials.filter((m) => {
    if (categoryFilter !== 'ALL' && m.category !== categoryFilter) return false;
    if (lowStockOnly && m.currentStock > m.minStock) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.sku.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Box className="w-5 h-5 text-amber-400" />
            Catálogo e Cadastro de Materiais
          </h2>
          <p className="text-xs text-slate-400">
            Cadastre novos itens, parametrize limites de estoque mínimo e gerencie o catálogo de suprimentos.
          </p>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Material</span>
        </button>
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Pesquisar por SKU, nome ou localização..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 pl-8 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Todas as Categorias ({categories.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer bg-slate-950 border border-slate-700/80 px-3 py-2 rounded-lg text-slate-300 select-none">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="accent-amber-500 rounded"
          />
          <span>Apenas Alertas (Estoque Baixo)</span>
        </label>
      </div>

      {/* Materials Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-300 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-bold">SKU</th>
                <th className="py-3 px-4 font-bold">Nome / Especificação</th>
                <th className="py-3 px-4 font-bold">Categoria</th>
                <th className="py-3 px-3 font-bold text-center">Unid.</th>
                <th className="py-3 px-4 font-bold">Localização</th>
                <th className="py-3 px-3 font-bold text-right">Saldo Físico</th>
                <th className="py-3 px-3 font-bold text-right">Preço Unit.</th>
                <th className="py-3 px-3 font-bold text-center">Nível vs Mínimo</th>
                <th className="py-3 px-4 font-bold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    Nenhum material encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((mat) => {
                  const isLow = mat.currentStock <= mat.minStock;
                  const isZero = mat.currentStock === 0;
                  const percentOfMax = Math.min(100, Math.round((mat.currentStock / (mat.maxStock || 100)) * 100));

                  return (
                    <tr key={mat.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {mat.sku}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-100 block">
                          {mat.name}
                        </span>
                        {mat.description && (
                          <span className="text-[11px] text-slate-400 block truncate max-w-[220px]">
                            {mat.description}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {mat.category}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold text-slate-300">
                        {mat.unit}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-400">
                        {mat.location}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-sm text-white">
                        {mat.currentStock}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-300">
                        R$ {mat.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3">
                        <div className="w-24 mx-auto space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Mín: {mat.minStock}</span>
                            <span className={isZero ? 'text-rose-400 font-bold' : isLow ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                              {mat.currentStock}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${percentOfMax}%` }}
                              className={`h-full rounded-full ${
                                isZero ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onNavigateToMovements(mat.id, isLow ? 'ENTRADA' : 'SAIDA')}
                            title="Movimentar material"
                            className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(mat)}
                            title="Editar parâmetros"
                            className="p-1 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(mat.id, mat.name)}
                            title="Inativar item"
                            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Cadastro / Edição de Material */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden my-auto">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  {editingMaterial ? 'Editar Parâmetros do Material' : 'Cadastrar Novo Material'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-lg text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    Código SKU / Identificador *
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    placeholder="Ex: EPI-005"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    Nome do Material *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Máscara Respiratória N95 com Válvula"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    Categoria
                  </label>
                  <input
                    type="text"
                    list="cat-options"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Selecione ou digite nova"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <datalist id="cat-options">
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                    <option value="EPIs & Segurança" />
                    <option value="Ferramentas Manuais" />
                    <option value="Químicos & Lubrificantes" />
                    <option value="Elétrica & Cabos" />
                    <option value="Tecnologia & TI" />
                    <option value="Material de Escritório" />
                    <option value="Peças & Reposição" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    Unidade de Medida
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="UN">UN - Unidade</option>
                    <option value="PAR">PAR - Par</option>
                    <option value="CX">CX - Caixa</option>
                    <option value="KG">KG - Quilograma</option>
                    <option value="L">L - Litro</option>
                    <option value="M">M - Metro</option>
                    <option value="PCT">PCT - Pacote</option>
                    <option value="ROLO">ROLO - Rolo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                  Descrição Técnica / Aplicação
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Especificações técnicas, normas aplicáveis, marca ou modelo"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              {/* Stock control limits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    Estoque Mínimo (Alerta)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    Estoque Máximo (Capacidade)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxStock}
                    onChange={(e) => setMaxStock(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    Preço Unitário (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Initial stock (only for new material) */}
              {!editingMaterial && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-blue-950/30 rounded-xl border border-blue-900/50">
                  <div>
                    <label className="block text-amber-300 font-bold uppercase text-[10px] mb-1">
                      Saldo Inicial em Estoque
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={initialStock}
                      onChange={(e) => setInitialStock(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-300 font-bold uppercase text-[10px] mb-1">
                      Setor de Armazenamento
                    </label>
                    <select
                      value={initialSectorId}
                      onChange={(e) => setInitialSectorId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100"
                    >
                      {sectors.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Physical location & Expiry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    Endereçamento Físico (Localização)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Corredor A - Prateleira 03 - Caixa 02"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    Data de Validade (Opcional)
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow transition-all cursor-pointer"
                >
                  {saving ? 'Salvando...' : editingMaterial ? 'Atualizar Material' : 'Cadastrar Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
