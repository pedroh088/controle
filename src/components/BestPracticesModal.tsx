import { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Layers, 
  CalendarClock, 
  ArrowDownUp, 
  Boxes, 
  ShieldAlert, 
  PieChart, 
  CheckSquare, 
  Lightbulb, 
  ChevronRight 
} from 'lucide-react';

interface BestPracticesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BestPracticesModal({ isOpen, onClose }: BestPracticesModalProps) {
  const [activeSection, setActiveSection] = useState<'fisica' | 'fifolifo' | 'validade' | 'inventarios' | 'seguranca' | 'curvaabc' | 'checklist'>('fisica');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    chk1: true,
    chk2: true,
    chk3: false,
    chk4: true,
    chk5: false,
    chk6: false,
  });

  if (!isOpen) return null;

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalChecklist = Object.keys(checkedItems).length;
  const scorePercent = Math.round((completedCount / totalChecklist) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Manual Operacional: Boas Práticas na Gestão de Estoques
              </h2>
              <p className="text-xs text-slate-400">
                Diretrizes técnicas para organização, acuracidade e controle de perdas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content layout (Sidebar nav + Content) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Internal Navigation */}
          <div className="w-full md:w-64 bg-slate-950/60 border-b md:border-b-0 md:border-r border-slate-800 p-3 space-y-1 overflow-y-auto">
            <button
              onClick={() => setActiveSection('fisica')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-all ${
                activeSection === 'fisica'
                  ? 'bg-blue-950 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-400" />
                <span>1. Organização Física & 5S</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveSection('fifolifo')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-all ${
                activeSection === 'fifolifo'
                  ? 'bg-blue-950 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <ArrowDownUp className="w-4 h-4 text-amber-400" />
                <span>2. FIFO vs LIFO vs Custo Médio</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveSection('validade')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-all ${
                activeSection === 'validade'
                  ? 'bg-blue-950 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-amber-400" />
                <span>3. Controle de Validade (FEFO)</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveSection('inventarios')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-all ${
                activeSection === 'inventarios'
                  ? 'bg-blue-950 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>4. Inventários & Acuracidade</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveSection('seguranca')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-all ${
                activeSection === 'seguranca'
                  ? 'bg-blue-950 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>5. Estoque de Segurança & Ponto Pedido</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveSection('curvaabc')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-all ${
                activeSection === 'curvaabc'
                  ? 'bg-blue-950 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-amber-400" />
                <span>6. Classificação Curva ABC</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveSection('checklist')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-all ${
                activeSection === 'checklist'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-amber-400" />
                <span>Checklist de Auditoria</span>
              </div>
              <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-400">
                {completedCount}/{totalChecklist}
              </span>
            </button>
          </div>

          {/* Detailed Content Pane */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-900/60 text-slate-200 text-sm leading-relaxed space-y-6">
            {activeSection === 'fisica' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Boxes className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">
                    1. Organização Física, Layout e Endereçamento de Almoxarifado
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-xl space-y-2">
                    <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider">
                      Sistema de Endereçamento Alfanumérico
                    </h4>
                    <p className="text-xs text-slate-300">
                      Todo item deve possuir localização única cadastrada seguindo a regra <strong>Rua - Módulo/Estante - Nível - Vão</strong> (Exemplo: <code>CORR-B-PRAT-02-GAV-01</code>).
                    </p>
                    <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                      <li>Evita perdas de tempo na busca por operadores.</li>
                      <li>Permite rotatividade de equipe sem dependência de memória individual.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-xl space-y-2">
                    <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider">
                      Ergonomia e Peso dos Materiais
                    </h4>
                    <p className="text-xs text-slate-300">
                      Aplique a "Zona de Ouro" (entre a cintura e os ombros do operador) para os materiais de maior giro diário e itens com peso entre 5kg e 20kg.
                    </p>
                    <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                      <li>Nível do Chão/Paletes: Cargas pesadas e volumosas.</li>
                      <li>Níveis Superiores: Materiais leves de baixo giro.</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-blue-950/40 border border-blue-800/50 rounded-xl flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300 space-y-1">
                    <strong className="text-amber-300 block">Metodologia 5S no Almoxarifado:</strong>
                    <p>
                      <strong>Seiri (Descarte):</strong> Separe sucata e materiais obsoletos para evitar poluição visual e ocupação indevida de prateleiras. <br />
                      <strong>Seiton (Organização):</strong> Um lugar para cada coisa e cada coisa no seu lugar demarcado. <br />
                      <strong>Seiso (Limpeza):</strong> Limpeza diária de pó para evitar danos a rolamentos, tintas e componentes eletrônicos.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'fifolifo' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <ArrowDownUp className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">
                    2. Sistemas de Movimentação: FIFO (PEPS), LIFO (UEPS) e Custo Médio
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 uppercase">FIFO (PEPS)</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-semibold">Padrão Recomendado</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong>Primeiro a Entrar, Primeiro a Sair.</strong> O lote que chegou antes ao estoque é o primeiro a ser requisitado e liberado para consumo.
                    </p>
                    <div className="text-[11px] text-slate-400 border-t border-slate-700/60 pt-2">
                      <span className="text-slate-300 font-semibold block">Vantagens:</span>
                      Evita obsolescência e vencimento. Obrigatório pela legislação tributária brasileira (CPC 16 / RIR).
                    </div>
                  </div>

                  <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-400 uppercase">LIFO (UEPS)</span>
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-semibold">Restrito / Proibido BR</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong>Último a Entrar, Primeiro a Sair.</strong> Baixa contábil pelo custo das mercadorias mais recentes.
                    </p>
                    <div className="text-[11px] text-slate-400 border-t border-slate-700/60 pt-2">
                      <span className="text-slate-300 font-semibold block">Atenção Crítica:</span>
                      Proibido para fins fiscais no Brasil porque subavalia o estoque final e reduz artificialmente o lucro tributável.
                    </div>
                  </div>

                  <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 uppercase">Custo Médio (CMP)</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-semibold">Aceito Fiscalmente</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Recalcula o valor unitário a cada nova compra pela média ponderada do saldo anterior mais a nova entrada.
                    </p>
                    <div className="text-[11px] text-slate-400 border-t border-slate-700/60 pt-2">
                      <span className="text-slate-300 font-semibold block">Aplicação:</span>
                      Ideal para insumos contínuos como parafusos, graxas e combustíveis onde lotes se misturam fisicamente.
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-2">
                  <span className="font-bold text-amber-300 block">Dica de Aplicação Física na Prateleira:</span>
                  <p>
                    Para aplicar o FIFO fisicamente sem prateleiras dinâmicas (flow-rack), coloque as caixas novas sempre <strong>atrás</strong> ou <strong>embaixo</strong> das caixas antigas, garantindo que a frente de pega seja sempre o lote mais antigo.
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'validade' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <CalendarClock className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">
                    3. Gestão de Perecíveis e Controle de Validade (FEFO / PVPS)
                  </h3>
                </div>

                <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl space-y-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 font-bold rounded">
                      FEFO = First Expire, First Out (Primeiro que Vence, Primeiro que Sai)
                    </span>
                  </div>
                  <p className="text-slate-300">
                    Em produtos com prazo de validade (solventes, colas industriais, reagentes, borrachas vulcanizadas, EPIs específicos com CA limitado), o critério de prioridade de saída deve ser <strong>a data de validade mais próxima</strong>, e não necessariamente a data em que o item entrou.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg">
                      <span className="font-bold text-emerald-400 block text-xs">Verde: Validade Segura</span>
                      <p className="text-[11px] text-slate-300 mt-1">Mais de 90 dias para vencer. Livre para circulação rotineira.</p>
                    </div>
                    <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg">
                      <span className="font-bold text-amber-400 block text-xs">Amarelo: Alerta Prévio</span>
                      <p className="text-[11px] text-slate-300 mt-1">Entre 30 e 90 dias. Priorizar saídas imediatas para os setores de maior consumo.</p>
                    </div>
                    <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg">
                      <span className="font-bold text-rose-400 block text-xs">Vermelho: Quarentena</span>
                      <p className="text-[11px] text-slate-300 mt-1">Menos de 30 dias ou vencido. Isolar imediatamente em área de descarte/laudo.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'inventarios' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">
                    4. Frequência de Inventários e Acuracidade de Estoque (IRA)
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl space-y-2">
                    <h4 className="font-bold text-amber-300 uppercase">Inventário Rotativo / Cíclico</h4>
                    <p className="text-slate-300">
                      Contagem contínua durante todo o ano, sem paralisar a fábrica. O almoxarife conta um grupo restrito de itens todos os dias (ex: 5 a 10 SKUs por manhã).
                    </p>
                    <ul className="space-y-1 text-slate-400 list-disc list-inside">
                      <li>Itens Classe A: contados 1x por mês ou a cada 15 dias.</li>
                      <li>Itens Classe B: contados a cada trimestre.</li>
                      <li>Itens Classe C: contados 1 ou 2x por ano.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl space-y-2">
                    <h4 className="font-bold text-amber-300 uppercase">Índice de Acuracidade (IRA)</h4>
                    <p className="text-slate-300">
                      Mede a precisão entre o que está registrado no sistema e o que existe fisicamente na prateleira.
                    </p>
                    <div className="p-2.5 bg-slate-950 rounded border border-slate-800 font-mono text-[11px] text-amber-400">
                      IRA (%) = (Nº de Itens Corretos / Nº Total de Itens Auditados) × 100
                    </div>
                    <p className="text-[11px] text-slate-400">
                      <strong>Meta recomendada:</strong> Acima de <strong>98%</strong> de acuracidade física e financeira.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'seguranca' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">
                    5. Dimensionamento de Estoque de Segurança e Ponto de Pedido
                  </h3>
                </div>

                <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl space-y-3 text-xs">
                  <p className="text-slate-300">
                    O <strong>Ponto de Pedido (PP)</strong> é o momento exato em que uma nova ordem de compra deve ser disparada para que o material chegue antes que o estoque de segurança seja atingido.
                  </p>

                  <div className="p-3 bg-slate-950 border border-amber-500/30 rounded-xl font-mono text-xs text-amber-300 space-y-1">
                    <span className="font-bold block text-slate-200">Fórmula Clássica:</span>
                    <code>Ponto de Pedido = (Consumo Médio Diário × Lead Time de Compra) + Estoque de Segurança</code>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-slate-400">
                    <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                      <strong className="text-slate-200 block">Lead Time (Tempo de Espera):</strong>
                      Tempo em dias desde a emissão da requisição de compras até a entrada física no almoxarifado (aprovação + faturamento fornecedor + frete).
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                      <strong className="text-slate-200 block">Estoque de Segurança (Buffer):</strong>
                      Quantidade extra reservada para amortecer atrasos de entrega do fornecedor ou picos inesperados de demanda operacional.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'curvaabc' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <PieChart className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">
                    6. Classificação por Curva ABC (Princípio de Pareto 80/20)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-blue-950/60 border border-amber-500/40 rounded-xl space-y-1.5">
                    <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded text-[10px]">
                      CLASSE A
                    </span>
                    <strong className="block text-white">Alto Valor / Alto Impacto</strong>
                    <p className="text-slate-300 text-[11px]">
                      Representam cerca de <strong>80% do valor total</strong> do estoque, mas apenas <strong>20% da quantidade</strong> de itens.
                    </p>
                    <span className="text-amber-300 block text-[10px] font-bold">Controle rigoroso e contagem frequente.</span>
                  </div>

                  <div className="p-3.5 bg-slate-800/60 border border-slate-700 rounded-xl space-y-1.5">
                    <span className="px-2 py-0.5 bg-blue-600 text-white font-black rounded text-[10px]">
                      CLASSE B
                    </span>
                    <strong className="block text-white">Médio Valor / Intermediário</strong>
                    <p className="text-slate-300 text-[11px]">
                      Representam cerca de <strong>15% do valor total</strong> e <strong>30% do número de itens</strong>.
                    </p>
                    <span className="text-slate-400 block text-[10px] font-medium">Controle balanceado com pedidos periódicos.</span>
                  </div>

                  <div className="p-3.5 bg-slate-800/60 border border-slate-700 rounded-xl space-y-1.5">
                    <span className="px-2 py-0.5 bg-slate-700 text-slate-300 font-black rounded text-[10px]">
                      CLASSE C
                    </span>
                    <strong className="block text-white">Baixo Valor / Alto Volume</strong>
                    <p className="text-slate-300 text-[11px]">
                      Representam apenas <strong>5% do valor total</strong>, mas mais de <strong>50% dos itens físicos</strong> (parafusos, arruelas, fita crepe).
                    </p>
                    <span className="text-slate-400 block text-[10px] font-medium">Comprados em caixas ou lotes maiores.</span>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'checklist' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-bold text-white">
                      Checklist Operacional de Auditoria de Almoxarifado
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-amber-400 font-bold">
                      Maturidade: {scorePercent}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  Marque os itens conformes com o procedimento operacional de seu almoxarifado:
                </p>

                <div className="space-y-2 text-xs">
                  {[
                    { id: 'chk1', title: 'Todas as saídas possuem requisição com identificação de setor e responsável assinada.' },
                    { id: 'chk2', title: 'Todos os materiais possuem localização física (corredor/prateleira) cadastrada no sistema.' },
                    { id: 'chk3', title: 'Existe inventário rotativo diário para os itens com nível de estoque crítico ou classe A.' },
                    { id: 'chk4', title: 'Materiais com validade vencida ou danificados são segregados em área de quarentena.' },
                    { id: 'chk5', title: 'Os níveis de estoque mínimo e máximo são revisados periodicamente com base no giro real.' },
                    { id: 'chk6', title: 'Entradas por nota fiscal são conferidas fisicamente antes da liberação nas prateleiras.' },
                  ].map((item) => (
                    <label
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        checkedItems[item.id]
                          ? 'bg-blue-950/40 border-amber-500/40 text-slate-100'
                          : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800/80'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!checkedItems[item.id]}
                        onChange={() => {}}
                        className="mt-0.5 accent-amber-500 rounded"
                      />
                      <span className="leading-snug">{item.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Manual de Melhores Práticas • Auditoria & Governança de Materiais</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Entendido / Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
