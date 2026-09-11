import { useState, useMemo } from 'react';
import { 
  Layers, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  Building2, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  Boxes 
} from 'lucide-react';
import { Material, Sector } from '../types';

interface StockPositionViewProps {
  materials: Material[];
  sectors: Sector[];
  onNavigateToMovements: (prefillMaterialId?: string, defaultType?: 'ENTRADA' | 'SAIDA') => void;
}

export default function StockPositionView({
  materials,
  sectors,
  onNavigateToMovements,
}: StockPositionViewProps) {
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  // Compute position items
  const positionItems = useMemo(() => {
    return materials.map((m) => {
      let status: 'NORMAL' | 'BAIXO' | 'CRITICO' | 'ZERADO' = 'NORMAL';
      if (m.currentStock === 0) {
        status = 'ZERADO';
      } else if (m.currentStock <= m.minStock * 0.5) {
        status = 'CRITICO';
      } else if (m.currentStock <= m.minStock) {
        status = 'BAIXO';
      }

      // Sector specific balance
      const sectorQty = selectedSector === 'ALL'
        ? m.currentStock
        : (m.sectorDistribution[selectedSector] || 0);

      return {
        ...m,
        computedStatus: status,
        relevantStock: sectorQty,
        totalFinancialValue: m.currentStock * m.unitPrice,
      };
    });
  }, [materials, selectedSector]);

  // Filter items
  const filteredItems = useMemo(() => {
    return positionItems.filter((item) => {
      // Sector filter: if specific sector selected, only show items that have stock or belong to that sector
      if (selectedSector !== 'ALL') {
        const hasStockInSector = (item.sectorDistribution[selectedSector] || 0) > 0;
        if (!hasStockInSector) return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL' && item.computedStatus !== selectedStatus) {
        return false;
      }

      // Text search
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [positionItems, selectedSector, selectedStatus, search]);

  // Totals for filtered selection
  const totalFilteredQuantity = filteredItems.reduce((acc, i) => acc + i.relevantStock, 0);
  const totalFilteredValue = filteredItems.reduce((acc, i) => acc + i.relevantStock * i.unitPrice, 0);
  const lowCount = filteredItems.filter((i) => i.computedStatus !== 'NORMAL').length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'Código SKU',
      'Descrição do Material',
      'Categoria',
      'Unidade',
      'Localização Física',
      'Estoque Mínimo',
      'Estoque Atual',
      'Preço Unitário (R$)',
      'Valor Total (R$)',
      'Status',
    ];

    const rows = filteredItems.map((i) => [
      `"${i.sku}"`,
      `"${i.name.replace(/"/g, '""')}"`,
      `"${i.category}"`,
      `"${i.unit}"`,
      `"${i.location}"`,
      i.minStock,
      i.relevantStock,
      i.unitPrice.toFixed(2).replace('.', ','),
      (i.relevantStock * i.unitPrice).toFixed(2).replace('.', ','),
      `"${i.computedStatus}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `posicao_estoque_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeSectorName = selectedSector === 'ALL'
    ? 'Todos os Setores (Consolidado)'
    : sectors.find((s) => s.id === selectedSector)?.name || 'Setor Específico';

  return (
    <div className="space-y-6">
      {/* Printable Report Header (Active on print) */}
      <div className="hidden print:block mb-6 border-b-2 border-slate-900 pb-4 text-slate-900">
        <h1 className="text-xl font-bold uppercase tracking-tight">
          Relatório Oficial de Posição de Estoque & Inventário Físico
        </h1>
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>Setor / Escopo: <strong>{activeSectorName}</strong></span>
          <span>Emissão: {new Date().toLocaleString('pt-BR')}</span>
          <span>Responsável Técnico: <strong>Pedro H. S. Alves</strong></span>
        </div>
      </div>

      {/* Screen Toolbar & Summary */}
      <div className="no-print space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              Relatório de Posição de Estoque por Setor
            </h2>
            <p className="text-xs text-slate-400">
              Visualização analítica do saldo físico, endereçamento e valor financeiro de cada item em estoque.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Relatório</span>
            </button>
          </div>
        </div>

        {/* Summary Metric Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Itens Listados:</span>
            <span className="text-xl font-bold font-mono text-white mt-0.5 block">
              {filteredItems.length} SKUs
            </span>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Saldo Físico Total:</span>
            <span className="text-xl font-bold font-mono text-amber-300 mt-0.5 block">
              {totalFilteredQuantity.toLocaleString()} un.
            </span>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Valor Financeiro:</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5 block">
              R$ {totalFilteredValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className={`p-3 border rounded-xl ${
            lowCount > 0 ? 'bg-rose-950/30 border-rose-500/40 text-rose-300' : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}>
            <span className="text-[10px] uppercase font-bold block">Abaixo do Mínimo:</span>
            <span className="text-xl font-bold font-mono mt-0.5 block">
              {lowCount} itens
            </span>
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar por SKU, nome, categoria ou localização..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 pl-8 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>

          {/* Sector filter */}
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-slate-500" />
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Todos os Setores (Consolidado)</option>
              {sectors.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  Setor: {sec.name} ({sec.code})
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Status: Todos os Níveis</option>
              <option value="NORMAL">Estoque Normal</option>
              <option value="BAIXO">Estoque Baixo</option>
              <option value="CRITICO">Estoque Crítico</option>
              <option value="ZERADO">Estoque Zerado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table (Optimized for both screen & print) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm print:border-none print:shadow-none print:bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-300 border-b border-slate-800 print:bg-slate-100 print:text-slate-900 print:border-slate-300">
              <tr>
                <th className="py-3 px-4 font-bold">SKU</th>
                <th className="py-3 px-4 font-bold">Descrição do Material</th>
                <th className="py-3 px-4 font-bold">Categoria</th>
                <th className="py-3 px-3 font-bold text-center">Unid.</th>
                <th className="py-3 px-4 font-bold">Endereçamento / Local</th>
                <th className="py-3 px-3 font-bold text-right">Est. Mín.</th>
                <th className="py-3 px-3 font-bold text-right">Saldo Atual</th>
                <th className="py-3 px-3 font-bold text-right">Preço Unit.</th>
                <th className="py-3 px-4 font-bold text-right">Total (R$)</th>
                <th className="py-3 px-3 font-bold text-center">Status</th>
                <th className="py-3 px-3 font-bold text-center no-print">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 print:divide-slate-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    Nenhum material localizado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.computedStatus === 'BAIXO';
                  const isCritical = item.computedStatus === 'CRITICO';
                  const isZero = item.computedStatus === 'ZERADO';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/40 transition-colors print:hover:bg-transparent"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-amber-400 print:text-slate-950">
                        {item.sku}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-100 print:text-slate-950 block">
                          {item.name}
                        </span>
                        {item.description && (
                          <span className="text-[11px] text-slate-400 print:text-slate-600 block line-clamp-1">
                            {item.description}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300 print:text-slate-700">
                        {item.category}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold text-slate-300 print:text-slate-700">
                        {item.unit}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-400 print:text-slate-600">
                        {item.location}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-400 print:text-slate-600">
                        {item.minStock}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-sm text-slate-100 print:text-slate-950">
                        {item.relevantStock}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-300 print:text-slate-700">
                        R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-300 print:text-slate-950">
                        R$ {(item.relevantStock * item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isZero ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 print:text-rose-700">
                            ZERADO
                          </span>
                        ) : isCritical ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 print:text-rose-700">
                            CRÍTICO
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 print:text-amber-800">
                            BAIXO
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 print:text-emerald-800">
                            NORMAL
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center no-print">
                        <button
                          onClick={() => onNavigateToMovements(item.id, isLow || isZero || isCritical ? 'ENTRADA' : 'SAIDA')}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Movimentar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredItems.length > 0 && (
              <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-800 text-xs print:bg-slate-100 print:text-slate-900 print:border-slate-400">
                <tr>
                  <td colSpan={6} className="py-3 px-4 text-right text-slate-300 print:text-slate-800">
                    Totalização Geral:
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-amber-300 print:text-slate-950 text-sm">
                    {totalFilteredQuantity.toLocaleString()} un.
                  </td>
                  <td className="py-3 px-3"></td>
                  <td className="py-3 px-4 text-right font-mono font-black text-emerald-400 print:text-slate-950 text-sm">
                    R$ {totalFilteredValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2} className="no-print"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
