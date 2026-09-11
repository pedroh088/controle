import { 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Boxes, 
  PackageMinus,
  Sparkles,
  RefreshCw,
  Plus
} from 'lucide-react';
import { DashboardMetrics, Material } from '../types';

interface DashboardViewProps {
  metrics: DashboardMetrics | null;
  materials: Material[];
  onNavigateToMovements: (prefillMaterialId?: string, defaultType?: 'ENTRADA' | 'SAIDA') => void;
  onNavigateToPosition: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function DashboardView({
  metrics,
  materials,
  onNavigateToMovements,
  onNavigateToPosition,
  onRefresh,
  loading,
}: DashboardViewProps) {
  if (loading && !metrics) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Calculando indicadores e rotatividade de estoque...</p>
      </div>
    );
  }

  const m = metrics || {
    totalMaterials: materials.length,
    totalUnitsInStock: materials.reduce((acc, i) => acc + i.currentStock, 0),
    totalStockValueBRL: materials.reduce((acc, i) => acc + i.currentStock * i.unitPrice, 0),
    lowStockItemsCount: materials.filter((i) => i.currentStock > 0 && i.currentStock <= i.minStock).length,
    outOfStockItemsCount: materials.filter((i) => i.currentStock === 0).length,
    monthlyTurnoverRate: 18.5,
    averageDaysInStock: 45,
    totalMovementsThisMonth: 32,
    entradasThisMonth: 120,
    saidasThisMonth: 85,
    topConsumedMaterials: [],
    topReceivedMaterials: [],
    categoryDistribution: [],
    monthlyHistory: [
      { month: 'Abr', entradas: 45, saidas: 38 },
      { month: 'Mai', entradas: 60, saidas: 52 },
      { month: 'Jun', entradas: 85, saidas: 74 },
      { month: 'Jul', entradas: 70, saidas: 68 },
      { month: 'Ago', entradas: 140, saidas: 89 },
      { month: 'Set', entradas: 120, saidas: 85 },
    ],
  };

  const criticalMaterials = materials.filter((mat) => mat.currentStock <= mat.minStock);

  // Calculate max value for chart scaling
  const maxHistoryVal = Math.max(
    ...m.monthlyHistory.map((h) => Math.max(h.entradas, h.saidas)),
    100
  );

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Summary */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-500/20 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white tracking-tight">
              Painel Executivo de Gestão & Indicadores Operacionais
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Monitoramento em tempo real de saldo físico, giro de mercadorias, itens em risco de ruptura e valor imobilizado.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToPosition}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Ver Relatório de Posição
          </button>
          <button
            onClick={onRefresh}
            title="Recalcular Métricas"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-amber-400 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Rotatividade de Materiais (Giro de Estoque) */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 shadow-sm transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all pointer-events-none"></div>
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
              Rotatividade (Giro)
            </span>
            <div className="p-1.5 bg-amber-500/15 border border-amber-500/30 rounded-lg text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {m.monthlyTurnoverRate}%
            </span>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> taxa mensal
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Razão entre saídas consumidas e o estoque médio ativo no período.
          </p>
        </div>

        {/* KPI 2: Tempo Médio de Permanência em Estoque */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 rounded-xl p-4 shadow-sm transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
              Tempo Médio / Cobertura
            </span>
            <div className="p-1.5 bg-blue-500/15 border border-blue-500/30 rounded-lg text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {m.averageDaysInStock} dias
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              estimativa de autonomia
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Dias estimados até o consumo total ao ritmo médio das operações.
          </p>
        </div>

        {/* KPI 3: Itens com Baixo Estoque */}
        <div className={`border rounded-xl p-4 shadow-sm transition-all relative overflow-hidden ${
          m.lowStockItemsCount + m.outOfStockItemsCount > 0
            ? 'bg-rose-950/20 border-rose-500/40'
            : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
              Alerta de Ruptura
            </span>
            <div className={`p-1.5 rounded-lg ${
              m.lowStockItemsCount + m.outOfStockItemsCount > 0
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${
              m.lowStockItemsCount + m.outOfStockItemsCount > 0 ? 'text-rose-400' : 'text-white'
            }`}>
              {m.lowStockItemsCount + m.outOfStockItemsCount}
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              ({m.outOfStockItemsCount} zerados, {m.lowStockItemsCount} baixos)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Materiais com saldo igual ou inferior ao ponto de estoque mínimo.
          </p>
        </div>

        {/* KPI 4: Valor Total Imobilizado */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 shadow-sm transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
              Patrimônio Imobilizado
            </span>
            <div className="p-1.5 bg-amber-500/15 border border-amber-500/30 rounded-lg text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-amber-400 font-bold">R$</span>
            <span className="text-2xl font-black text-white font-mono">
              {m.totalStockValueBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            {m.totalUnitsInStock.toLocaleString()} unidades físicas divididas em {m.totalMaterials} SKUs.
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Histórico de Movimentações (Entradas vs Saídas) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Histórico Mensal de Fluxo Físico (Entradas x Saídas)
              </h3>
              <p className="text-xs text-slate-400">
                Comparativo de volume de materiais movimentados por mês
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500"></span>
                <span className="text-slate-300">Entradas (Compras/Dev.)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-500"></span>
                <span className="text-slate-300">Saídas (Consumo)</span>
              </div>
            </div>
          </div>

          {/* SVG Bar Chart with Dual Bars */}
          <div className="h-60 flex items-end justify-between gap-2 sm:gap-6 pt-6 pb-2 px-2">
            {m.monthlyHistory.map((item, idx) => {
              const entradaHeight = Math.max(12, Math.round((item.entradas / maxHistoryVal) * 160));
              const saidaHeight = Math.max(12, Math.round((item.saidas / maxHistoryVal) * 160));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-44">
                    {/* Entrada Bar (Amber) */}
                    <div className="flex flex-col items-center flex-1 max-w-[28px]">
                      <span className="text-[10px] font-mono text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-bold">
                        {item.entradas}
                      </span>
                      <div
                        style={{ height: `${entradaHeight}px` }}
                        className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-md shadow-sm group-hover:brightness-110 transition-all"
                        title={`${item.month} - Entradas: ${item.entradas} unidades`}
                      ></div>
                    </div>

                    {/* Saída Bar (Blue) */}
                    <div className="flex flex-col items-center flex-1 max-w-[28px]">
                      <span className="text-[10px] font-mono text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-bold">
                        {item.saidas}
                      </span>
                      <div
                        style={{ height: `${saidaHeight}px` }}
                        className="w-full bg-gradient-to-t from-blue-700 to-blue-500 rounded-t-md shadow-sm group-hover:brightness-110 transition-all"
                        title={`${item.month} - Saídas: ${item.saidas} unidades`}
                      ></div>
                    </div>
                  </div>

                  <span className="text-xs font-medium text-slate-400 group-hover:text-amber-300 transition-colors">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Distribuição de Estoque por Categoria */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3 mb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Composição por Categoria
              </h3>
              <p className="text-xs text-slate-400">
                Participação financeira de cada grupo
              </p>
            </div>

            <div className="space-y-3">
              {m.categoryDistribution.map((cat, idx) => {
                const percent = m.totalStockValueBRL > 0
                  ? Math.round((cat.totalValue / m.totalStockValueBRL) * 100)
                  : 0;

                const colorClasses = [
                  'bg-amber-400 text-amber-400',
                  'bg-blue-400 text-blue-400',
                  'bg-emerald-400 text-emerald-400',
                  'bg-indigo-400 text-indigo-400',
                  'bg-purple-400 text-purple-400',
                  'bg-teal-400 text-teal-400',
                ];
                const color = colorClasses[idx % colorClasses.length];

                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="font-medium truncate max-w-[170px]">{cat.category}</span>
                      <span className="font-mono text-slate-400">
                        {percent}% • R$ {cat.totalValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full ${color.split(' ')[0]}`}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs text-slate-400 mt-2">
            <span className="text-slate-300 font-semibold block">Dica de Gestão:</span>
            Categorias de maior peso financeiro devem ter rotatividade monitorada semanalmente para evitar capital ocioso.
          </div>
        </div>
      </div>

      {/* Critical Stock & Top Consumed Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Itens com Baixo Estoque (Ação Imediata) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Atenção Imediata: Itens Abaixo do Estoque Mínimo ({criticalMaterials.length})
              </h3>
              <p className="text-xs text-slate-400">
                Materiais prioritários para compra ou reposição
              </p>
            </div>
            <button
              onClick={onNavigateToPosition}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              Ver todos →
            </button>
          </div>

          {criticalMaterials.length === 0 ? (
            <div className="py-8 text-center text-xs text-emerald-400 flex flex-col items-center gap-1">
              <Boxes className="w-6 h-6 text-emerald-400" />
              <span>Excelente! Todos os materiais estão com estoque acima do nível mínimo de segurança.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="py-2 font-semibold">SKU / Material</th>
                    <th className="py-2 text-right font-semibold">Saldo Atual</th>
                    <th className="py-2 text-right font-semibold">Mínimo</th>
                    <th className="py-2 text-center font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {criticalMaterials.slice(0, 5).map((mat) => {
                    const isZero = mat.currentStock === 0;
                    return (
                      <tr key={mat.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5">
                          <div className="font-mono text-amber-300 text-[11px] font-bold">{mat.sku}</div>
                          <div className="text-slate-200 font-medium truncate max-w-[200px]">{mat.name}</div>
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold">
                          <span className={`px-2 py-0.5 rounded text-[11px] ${
                            isZero ? 'bg-rose-500/20 text-rose-300 font-black' : 'text-amber-300'
                          }`}>
                            {mat.currentStock} {mat.unit}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-mono text-slate-400">
                          {mat.minStock} {mat.unit}
                        </td>
                        <td className="py-2.5 text-center">
                          <button
                            onClick={() => onNavigateToMovements(mat.id, 'ENTRADA')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-semibold text-[11px] transition-all cursor-pointer"
                            title="Registrar entrada de reposição para este item"
                          >
                            <Plus className="w-3 h-3" />
                            Repor
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Table 2: Materiais Mais Movimentados (Top Consumo) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <PackageMinus className="w-4 h-4 text-amber-400" />
              Materiais Mais Movimentados (Maior Demanda / Saídas)
            </h3>
            <p className="text-xs text-slate-400">
              Ranking dos itens mais requisitados pelos setores internos
            </p>
          </div>

          {m.topConsumedMaterials.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Nenhuma movimentação registrada no período para cálculo de ranking.
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {m.topConsumedMaterials.map((item, index) => {
                const topVal = m.topConsumedMaterials[0]?.quantity || 1;
                const percent = Math.round((item.quantity / topVal) * 100);

                return (
                  <div key={item.materialId} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-mono font-bold flex items-center justify-center text-[10px]">
                          #{index + 1}
                        </span>
                        <span className="font-semibold text-slate-200 truncate max-w-[220px]">
                          {item.name}
                        </span>
                        <span className="font-mono text-[10px] text-amber-400/80">({item.sku})</span>
                      </div>
                      <div className="text-right font-mono font-bold text-white">
                        {item.quantity} {item.unit}
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-gradient-to-r from-blue-500 to-amber-500 rounded-full"
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
