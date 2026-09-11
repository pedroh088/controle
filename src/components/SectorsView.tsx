import { useState, FormEvent } from 'react';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  User as UserIcon, 
  Phone, 
  Mail, 
  Hash, 
  X, 
  AlertTriangle,
  Boxes
} from 'lucide-react';
import { Sector, Material } from '../types';
import { createSector, updateSector, deleteSector } from '../services/api';

interface SectorsViewProps {
  sectors: Sector[];
  materials: Material[];
  onRefresh: () => void;
}

export default function SectorsView({ sectors, materials, onRefresh }: SectorsViewProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);

  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [responsible, setResponsible] = useState<string>('');
  const [costCenter, setCostCenter] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const handleOpenNew = () => {
    setEditingSector(null);
    setCode(`SET-0${sectors.length + 1}`);
    setName('');
    setResponsible('');
    setCostCenter(`CC-${Math.floor(1000 + Math.random() * 9000)}`);
    setContactPhone('');
    setEmail('');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (sec: Sector) => {
    setEditingSector(sec);
    setCode(sec.code);
    setName(sec.name);
    setResponsible(sec.responsible);
    setCostCenter(sec.costCenter);
    setContactPhone(sec.contactPhone || '');
    setEmail(sec.email || '');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!code.trim() || !name.trim()) {
      setErrorMsg('Código e Nome do Setor são obrigatórios.');
      return;
    }

    setSaving(true);
    try {
      if (editingSector) {
        await updateSector(editingSector.id, {
          code,
          name,
          responsible,
          costCenter,
          contactPhone,
          email,
        });
      } else {
        await createSector({
          code,
          name,
          responsible,
          costCenter,
          contactPhone,
          email,
        });
      }
      setModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar setor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, secName: string) => {
    if (!confirm(`Deseja desativar o setor "${secName}"?`)) return;
    try {
      await deleteSector(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao desativar setor.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            Setores e Centros de Custo da Organização
          </h2>
          <p className="text-xs text-slate-400">
            Cadastre os departamentos solicitantes, centros de custo e respectivos gestores operacionais.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Setor / Centro de Custo</span>
        </button>
      </div>

      {/* Grid of Sector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sectors.map((sec) => {
          // Calculate stock allocated in this sector
          const itemsInSector = materials.filter(
            (m) => (m.sectorDistribution[sec.id] || 0) > 0
          );
          const totalUnitsInSector = itemsInSector.reduce(
            (acc, m) => acc + (m.sectorDistribution[sec.id] || 0),
            0
          );
          const totalValueInSector = itemsInSector.reduce(
            (acc, m) => acc + (m.sectorDistribution[sec.id] || 0) * m.unitPrice,
            0
          );

          return (
            <div
              key={sec.id}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-xl p-5 shadow-sm space-y-4 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-950 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs">
                      {sec.code.slice(0, 3)}
                    </span>
                    <div>
                      <span className="font-mono text-[10px] text-amber-400 font-bold block">
                        {sec.code} • {sec.costCenter}
                      </span>
                      <h3 className="text-sm font-bold text-white leading-snug">
                        {sec.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(sec)}
                      title="Editar setor"
                      className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {sec.code !== 'ALM-01' && (
                      <button
                        onClick={() => handleDelete(sec.id, sec.name)}
                        title="Desativar setor"
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                  <div className="flex items-center gap-2 text-slate-300">
                    <UserIcon className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="truncate">Gestor: <strong>{sec.responsible}</strong></span>
                  </div>

                  {sec.contactPhone && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span>{sec.contactPhone}</span>
                    </div>
                  )}

                  {sec.email && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{sec.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stock allocated summary */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Itens Alocados:</span>
                  <span className="font-mono font-bold text-white text-xs mt-0.5 block">
                    {totalUnitsInSector} un. ({itemsInSector.length} SKUs)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Valor Financeiro:</span>
                  <span className="font-mono font-bold text-emerald-400 text-xs mt-0.5 block">
                    R$ {totalValueInSector.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Cadastro / Edição de Setor */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden my-auto">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  {editingSector ? 'Editar Dados do Setor' : 'Cadastrar Novo Setor / Departamento'}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    Sigla / Código *
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Ex: LOG-02"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    Centro de Custo
                  </label>
                  <input
                    type="text"
                    value={costCenter}
                    onChange={(e) => setCostCenter(e.target.value.toUpperCase())}
                    placeholder="Ex: CC-3020"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                  Nome do Setor / Departamento *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Almoxarifado Central ou Manutenção"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                  Responsável / Gestor do Setor
                </label>
                <input
                  type="text"
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  placeholder="Nome completo do coordenador"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    Telefone / Ramal
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="(11) 3456-7890"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    E-mail Corporativo
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="setor@empresa.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
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
                  {saving ? 'Salvando...' : editingSector ? 'Salvar Alterações' : 'Cadastrar Setor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
