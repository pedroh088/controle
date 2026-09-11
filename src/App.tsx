import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Navigation, { TabType } from './components/Navigation';
import DashboardView from './components/DashboardView';
import MaterialsView from './components/MaterialsView';
import MovementsView from './components/MovementsView';
import StockPositionView from './components/StockPositionView';
import MovementsHistoryView from './components/MovementsHistoryView';
import SectorsView from './components/SectorsView';
import RequisitionPrintModal from './components/RequisitionPrintModal';
import BestPracticesModal from './components/BestPracticesModal';

import { 
  getMaterials, 
  getSectors, 
  getMovements, 
  getDashboardMetrics 
} from './services/api';
import { Material, Sector, Movement, DashboardMetrics } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals & Navigation triggers
  const [selectedRequisition, setSelectedRequisition] = useState<Movement | null>(null);
  const [bestPracticesOpen, setBestPracticesOpen] = useState<boolean>(false);
  const [movementPrefill, setMovementPrefill] = useState<{
    materialId?: string;
    defaultType?: 'ENTRADA' | 'SAIDA';
  }>({ defaultType: 'SAIDA' });

  const currentUser = {
    id: 'usr-1',
    name: 'Pedro H. S. Alves',
    username: 'Pedro H. S. Alves',
    role: 'admin' as const,
    sectorId: 'sec-1',
  };

  // Load all data
  const loadAppData = useCallback(async () => {
    try {
      setLoading(true);
      const [mats, secs, movs, mets] = await Promise.all([
        getMaterials(),
        getSectors(),
        getMovements(),
        getDashboardMetrics(),
      ]);

      setMaterials(mats);
      setSectors(secs);
      setMovements(movs);
      setMetrics(mets);
    } catch (err) {
      console.error('Erro ao carregar dados do sistema:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppData();
  }, [loadAppData]);

  // Navigate to movement with prefill
  const handleNavigateToMovements = (materialId?: string, defaultType: 'ENTRADA' | 'SAIDA' = 'SAIDA') => {
    setMovementPrefill({ materialId, defaultType });
    setActiveTab('movements');
  };

  const handleMovementSuccess = (newMovement: Movement) => {
    // Reload metrics and data
    loadAppData();
  };

  const handleOpenRequisition = (movement: Movement) => {
    setSelectedRequisition(movement);
  };

  const lowStockCount = materials.filter((m) => m.currentStock <= m.minStock).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onOpenAuth={() => {}}
        onLogout={() => {}}
        onOpenNewMovement={() => handleNavigateToMovements(undefined, 'SAIDA')}
        onOpenPractices={() => setBestPracticesOpen(true)}
        onRefreshData={loadAppData}
        lowStockCount={lowStockCount}
      />

      {/* Navigation Sub-bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'requisition') {
            if (movements.length > 0) {
              setSelectedRequisition(movements[0]);
            } else {
              setActiveTab('history');
            }
          } else if (tab === 'practices') {
            setBestPracticesOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        lowStockCount={lowStockCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            metrics={metrics}
            materials={materials}
            onNavigateToMovements={handleNavigateToMovements}
            onNavigateToPosition={() => setActiveTab('position')}
            onRefresh={loadAppData}
            loading={loading}
          />
        )}

        {activeTab === 'movements' && (
          <MovementsView
            materials={materials}
            sectors={sectors}
            currentUserResponsible={currentUser.name}
            prefillMaterialId={movementPrefill.materialId}
            defaultType={movementPrefill.defaultType}
            onMovementSuccess={handleMovementSuccess}
            onOpenRequisition={handleOpenRequisition}
          />
        )}

        {activeTab === 'position' && (
          <StockPositionView
            materials={materials}
            sectors={sectors}
            onNavigateToMovements={handleNavigateToMovements}
          />
        )}

        {activeTab === 'history' && (
          <MovementsHistoryView
            movements={movements}
            materials={materials}
            sectors={sectors}
            onOpenRequisition={handleOpenRequisition}
          />
        )}

        {activeTab === 'materials' && (
          <MaterialsView
            materials={materials}
            sectors={sectors}
            onRefresh={loadAppData}
            onNavigateToMovements={handleNavigateToMovements}
          />
        )}

        {activeTab === 'sectors' && (
          <SectorsView
            sectors={sectors}
            materials={materials}
            onRefresh={loadAppData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-800/80 bg-slate-950/80 text-xs text-slate-500 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="space-y-0.5">
            <p className="text-slate-300 font-semibold">
              Sistema Integrado de Gestão de Estoques e Almoxarifado
            </p>
            <p className="text-[11px] text-slate-500">
              Controle físico-financeiro, rastreabilidade de requisições e parâmetros de acurácia.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-[11px]">
            <span className="text-slate-400">
              Responsável Técnico: <strong className="text-amber-400 font-semibold">Pedro H. S. Alves</strong>
            </span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="font-mono text-slate-500">
              Versão Operacional 2.4.0 (ISO 9001 Compliant)
            </span>
          </div>
        </div>
      </footer>

      {/* Official Requisition Printable Document Modal */}
      <RequisitionPrintModal
        requisition={selectedRequisition}
        onClose={() => setSelectedRequisition(null)}
      />

      {/* Best Practices Modal */}
      <BestPracticesModal
        isOpen={bestPracticesOpen}
        onClose={() => setBestPracticesOpen(false)}
      />
    </div>
  );
}
