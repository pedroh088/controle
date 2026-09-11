import { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  Printer, 
  Download, 
  ArrowDownLeft, 
  ArrowUpRight, 
  FileText,
  User as UserIcon,
  Building2
} from 'lucide-react';
import { Movement, Material, Sector } from '../types';

interface MovementsHistoryViewProps {
  movements: Movement[];
  materials: Material[];
  sectors: Sector[];
  onOpenRequisition: (movement: Movement) => void;
}

export default function MovementsHistoryView({
  movements,
  materials,
  sectors,
  onOpenRequisition,
}: MovementsHistoryViewProps) {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterMaterial, setFilterMaterial] = useState<string>('ALL');
  const [filterSector, setFilterSector] = useState<string>('ALL');
  const [periodPreset, setPeriodPreset] = useState<'TODOS' | 'HOJE' | '7DIAS' | '30DIAS' | 'CUSTOM'>('30DIAS');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const filteredMovements = useMemo(() => {
    const now = new Date();
    let minTime = 0;

    if (periodPreset === 'HOJE') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      minTime = today.getTime();
    } else if (periodPreset === '7DIAS') {
      minTime = now.getTime() - 7 * 86400000;
    } else if (periodPreset === '30DIAS') {
      minTime = now.getTime() - 30 * 86400000;
    } else if (periodPreset === 'CUSTOM') {
      if (startDate) minTime = new Date(startDate).getTime();
    }

    let maxTime = Infinity;
    if (periodPreset === 'CUSTOM' && endDate) {
      maxTime = new Date(endDate).getTime() + 86400000;
    }

    return movements.filter((m) => {
      const mTime = new Date(m.date).getTime();
      if (mTime < minTime || mTime > maxTime) return false;

      if (filterType !== 'ALL' && m.type !== filterType) return false;
      if (filterMaterial !== 'ALL' && m.materialId !== filterMaterial) return false;
      if (filterSector !== 'ALL' && m.sectorId !== filterSector && m.targetSectorId !== filterSector) {
        return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          m.requisitionCode.toLowerCase().includes(q) ||
          m.materialName.toLowerCase().includes(q) ||
          m.materialSku.toLowerCase().includes(q) ||
          m.responsibleName.toLowerCase().includes(q) ||
          (m.requesterName && m.requesterName.toLowerCase().includes(q)) ||
          (m.documentNumber && m.documentNumber.toLowerCase().includes(q)) ||
          (m.notes && m.notes.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [movements, filterType, filterMaterial, filterSector, periodPreset, startDate, endDate, search]);

  const handleExportCSV = () => {
    const headers = [
      'Protocolo',
      'Data',
      'Tipo',
      'Motivo',
      'SKU',
      'Material',
      'Quantidade',
      'Unidade',
      'Valor Unit. (R$)',
      'Valor Total (R$)',
      'Setor Origem',
      'Setor Destino',
      'Responsável Almoxarifado',
      'Requisitante',
      'Documento',
      'Observações',
    ];

    const rows = filteredMovements.map((m) => [
      `"${m.requisitionCode}"`,
      `"${new Date(m.date).toLocaleString('pt-BR')}"`,
      `"${m.type}"`,
      `"${m.reason}"`,
      `"${m.materialSku}"`,
      `"${m.materialName.replace(/"/g, '""')}"`,
      m.quantity,
      `"${m.materialUnit}"`,
      m.unitPrice.toFixed(2).replace('.', ','),
      m.totalPrice.toFixed(2).replace('.', ','),
      `"${m.sectorName}"`,
      `"${m.targetSectorName || ''}"`,
      `"${m.responsibleName}"`,
      `"${m.requesterName || ''}"`,
      `"${m.documentNumber || ''}"`,
      `"${(m.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `historico_movimentacoes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalEntradas = filteredMovements
    .filter((m) => m.type === 'ENTRADA')
    .reduce((acc, m) => acc + m.quantity, 0);

  const totalSaidas = filteredMovements
    .filter((m) => m.type === 'SAIDA')
    .reduce((acc, m) => acc + m.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            Histórico e Log de Movimentações de Estoque
          </h2>
          <p className="text-xs text-slate-400">
            Registro cronológico inalterável de todas as entradas, baixas operacionais e transferências emitidas.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Exportar Relatório CSV</span>
        </button>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Registros Encontrados:</span>
          <span className="text-xl font-bold font-mono text-white mt-0.5 block">
            {filteredMovements.length}
          </span>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Volume de Entradas:</span>
          <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5 block flex items-center gap-1">
            <ArrowDownLeft className="w-4 h-4" /> {totalEntradas} un.
          </span>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Volume de Saídas:</span>
          <span className="text-xl font-bold font-mono text-rose-400 mt-0.5 block flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" /> {totalSaidas} un.
          </span>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Período Selecionado:</span>
          <span className="text-xs font-semibold text-amber-300 mt-1 block truncate">
            {periodPreset === 'TODOS' ? 'Histórico Integral' : periodPreset === 'HOJE' ? 'Hoje' : periodPreset === '7DIAS' ? 'Últimos 7 dias' : periodPreset === '30DIAS' ? 'Últimos 30 dias' : 'Período Personalizado'}
          </span>
        </div>
      </div>

      {/* Dynamic Filters Bar */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3 text-xs">
        {/* Top filter row: Presets & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Period presets buttons */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-lg">
            {(['TODOS', 'HOJE', '7DIAS', '30DIAS', 'CUSTOM'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => setPeriodPreset(preset)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  periodPreset === preset
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {preset === 'TODOS' ? 'Todos' : preset === 'HOJE' ? 'Hoje' : preset === '7DIAS' ? '7 Dias' : preset === '30DIAS' ? '30 Dias' : 'Personalizado'}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="Buscar por protocolo (REQ-...), material, responsável..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 pl-8 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Custom date range if selected */}
        {periodPreset === 'CUSTOM' && (
          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-800">
            <span className="text-slate-400 font-semibold text-[11px]">Intervalo de Datas:</span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
              <span className="text-slate-500">até</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>
        )}

        {/* Secondary filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
          {/* Type Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Tipo de Operação:
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Todas (Entradas e Saídas)</option>
              <option value="ENTRADA">Apenas Entradas (Recebimento)</option>
              <option value="SAIDA">Apenas Saídas (Consumo/Transferência)</option>
            </select>
          </div>

          {/* Material Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Filtrar por Material:
            </label>
            <select
              value={filterMaterial}
              onChange={(e) => setFilterMaterial(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Todos os Materiais</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.sku}] {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sector Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Filtrar por Setor Envolvido:
            </label>
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Todos os Setores</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.code}] {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-300 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-bold">Data/Hora</th>
                <th className="py-3 px-3 font-bold">Protocolo</th>
                <th className="py-3 px-3 font-bold">Tipo & Motivo</th>
                <th className="py-3 px-4 font-bold">Material</th>
                <th className="py-3 px-3 font-bold text-right">Qtd.</th>
                <th className="py-3 px-4 font-bold">Origem → Destino</th>
                <th className="py-3 px-3 font-bold">Responsável / Requisitante</th>
                <th className="py-3 px-3 font-bold">Documento</th>
                <th className="py-3 px-3 font-bold text-center">Guia / Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    Nenhuma movimentação localizada para o período e critérios definidos.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => {
                  const isSaida = mov.type === 'SAIDA';
                  const dateStr = new Date(mov.date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={mov.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-400">
                        {mov.requisitionCode}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          isSaida ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {isSaida ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                          {mov.type}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px]">
                          {mov.reason}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-amber-400/90 text-[11px] font-bold block">
                          {mov.materialSku}
                        </span>
                        <span className="font-medium text-slate-200 block truncate max-w-[200px]">
                          {mov.materialName}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-sm text-white">
                        {mov.quantity} <span className="text-[10px] text-slate-400 font-normal">{mov.materialUnit}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-[11px]">
                        <div className="font-semibold text-slate-200">{mov.sectorName}</div>
                        {mov.targetSectorName && (
                          <div className="text-slate-400 flex items-center gap-1 text-[10px]">
                            <span>↳</span>
                            <span>{mov.targetSectorName}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-300 text-[11px]">
                        <div className="font-medium text-slate-200">{mov.responsibleName}</div>
                        {mov.requesterName && (
                          <div className="text-slate-400 text-[10px]">
                            Req: {mov.requesterName}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                        {mov.documentNumber || '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onOpenRequisition(mov)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                          title="Visualizar Requisição Timbrada para Impressão"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Guia</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
