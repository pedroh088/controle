import { useState, useEffect } from 'react';
import { 
  Package, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  Clock, 
  PlusCircle, 
  BookOpen, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenNewMovement: () => void;
  onOpenPractices: () => void;
  onRefreshData: () => void;
  lowStockCount: number;
}

export default function Header({
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenNewMovement,
  onOpenPractices,
  onRefreshData,
  lowStockCount,
}: HeaderProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="no-print bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-md">
      {/* Top microbar */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-1.5 text-xs flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-4 text-slate-400">
          <div className="flex items-center gap-1.5 font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {time.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}{' '}
              {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <span className="hidden md:inline text-slate-600">|</span>
          <div className="hidden sm:flex items-center gap-1 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Sistema Operacional Online</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Technical Responsible Highlight Requirement */}
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-0.5 rounded-full text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Responsável Técnico: <strong>Pedro H. S. Alves</strong></span>
          </div>

          <button
            onClick={onRefreshData}
            title="Atualizar dados do sistema"
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-amber-400 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 border border-amber-500/40 flex items-center justify-center shadow-inner">
            <Package className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                CONTROLE DE ESTOQUES
              </h1>
              <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded">
                PROD v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Gestão Operacional de Movimentações, Requisições & Indicadores
            </p>
          </div>
        </div>

        {/* Right side: Actions & User Info */}
        <div className="flex items-center gap-2.5">
          {lowStockCount > 0 && (
            <div 
              className="hidden lg:flex items-center gap-1.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 px-2.5 py-1 rounded-md text-xs font-medium"
              title={`${lowStockCount} itens com estoque em nível de alerta ou zerado`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span><strong>{lowStockCount}</strong> itens críticos</span>
            </div>
          )}

          <button
            onClick={onOpenPractices}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 hover:border-amber-500/40 text-xs font-medium text-slate-200 transition-all shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Guia de Boas Práticas</span>
            <span className="sm:hidden">Dicas</span>
          </button>

          <button
            onClick={onOpenNewMovement}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>Nova Movimentação</span>
          </button>

          {/* User profile dropdown/button */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 pl-2.5 pr-1.5 py-1 rounded-lg">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-blue-800 text-amber-300 flex items-center justify-center text-xs font-bold border border-amber-400/40">
                  {currentUser.username[0].toUpperCase()}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-semibold text-slate-200 leading-tight">
                    {currentUser.username}
                  </div>
                  <div className="text-[10px] text-amber-400 font-mono">
                    {currentUser.role === 'admin' ? 'Administrador' : 'Almoxarife'}
                  </div>
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Desconectar da sessão"
                className="p-1 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200"
            >
              <UserIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
