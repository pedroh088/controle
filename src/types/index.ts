export type MovementType = 'ENTRADA' | 'SAIDA';

export type MovementReason = 
  | 'Compra Fornecedor'
  | 'Devolução de Material'
  | 'Doação / Ajuste Positivo'
  | 'Consumo Interno'
  | 'Transferência Setorial'
  | 'Avaria / Perda / Vencido'
  | 'Ajuste Negativo de Inventário';

export interface Sector {
  id: string;
  code: string;
  name: string;
  responsible: string;
  costCenter: string;
  contactPhone?: string;
  email?: string;
  active: boolean;
  createdAt: string;
}

export interface Material {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  unit: 'UN' | 'CX' | 'KG' | 'L' | 'M' | 'PCT' | 'PAR' | 'ROLO';
  minStock: number;
  maxStock: number;
  currentStock: number;
  unitPrice: number; // in BRL
  location: string; // e.g. "Corredor B - Prateleira 04"
  sectorDistribution: Record<string, number>; // sectorId -> quantity in that sector
  expiryDate?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Movement {
  id: string;
  requisitionCode: string; // e.g. "REQ-2026-0042"
  type: MovementType;
  reason: MovementReason;
  materialId: string;
  materialName: string;
  materialSku: string;
  materialUnit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sectorId: string; // origin sector or primary sector
  sectorName: string;
  targetSectorId?: string; // in case of transfer
  targetSectorName?: string;
  responsibleName: string; // person registering or requesting
  requesterName?: string; // person receiving or requesting
  documentNumber?: string; // NF or internal order
  notes?: string;
  date: string; // ISO string
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'operador' | 'supervisor';
  sectorId?: string;
}

export interface DashboardMetrics {
  totalMaterials: number;
  totalUnitsInStock: number;
  totalStockValueBRL: number;
  lowStockItemsCount: number;
  outOfStockItemsCount: number;
  monthlyTurnoverRate: number; // Rotatividade de estoque (giro)
  averageDaysInStock: number; // Tempo médio de permanência em dias (cobertura)
  totalMovementsThisMonth: number;
  entradasThisMonth: number;
  saidasThisMonth: number;
  topConsumedMaterials: {
    materialId: string;
    sku: string;
    name: string;
    quantity: number;
    unit: string;
    totalValue: number;
  }[];
  topReceivedMaterials: {
    materialId: string;
    sku: string;
    name: string;
    quantity: number;
    unit: string;
  }[];
  categoryDistribution: {
    category: string;
    itemsCount: number;
    totalValue: number;
  }[];
  monthlyHistory: {
    month: string;
    entradas: number;
    saidas: number;
  }[];
}

export interface StockPositionReportItem {
  materialId: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  minStock: number;
  currentStock: number;
  unitPrice: number;
  totalValue: number;
  status: 'NORMAL' | 'BAIXO' | 'CRITICO' | 'ZERADO';
  sectorStocks: {
    sectorId: string;
    sectorName: string;
    quantity: number;
  }[];
}
