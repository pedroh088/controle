import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  History, 
  Layers, 
  Box, 
  Building2, 
  FileText, 
  BookMarked 
} from 'lucide-react';

export type TabType = 
  | 'dashboard' 
  | 'movements' 
  | 'history' 
  | 'position' 
  | 'materials' 
  | 'sectors' 
  | 'requisition'
  | 'practices';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  lowStockCount: number;
}

export default function Navigation({ activeTab, onTabChange, lowStockCount }: NavigationProps) {
  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: 'Indicadores & KPIs',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'movements' as TabType,
      label: 'Movimentações',
      icon: ArrowLeftRight,
      badge: null,
    },
    {
      id: 'position' as TabType,
      label: 'Posição de Estoque',
      icon: Layers,
      badge: null,
    },
    {
      id: 'materials' as TabType,
      label: 'Materiais',
      icon: Box,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeAlert: true,
    },
    {
      id: 'sectors' as TabType,
      label: 'Setores',
      icon: Building2,
      badge: null,
    },
    {
      id: 'history' as TabType,
      label: 'Histórico Completo',
      icon: History,
      badge: null,
    },
    {
      id: 'requisition' as TabType,
      label: 'Guia de Requisição',
      icon: FileText,
      badge: null,
    },
    {
      id: 'practices' as TabType,
      label: 'Boas Práticas',
      icon: BookMarked,
      badge: 'Guia',
    },
  ];

  return (
    <nav className="no-print bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-[69px] z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-950 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      tab.badgeAlert
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
