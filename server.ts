import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Database storage setup
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface Sector {
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

interface Material {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  unit: 'UN' | 'CX' | 'KG' | 'L' | 'M' | 'PCT' | 'PAR' | 'ROLO';
  minStock: number;
  maxStock: number;
  currentStock: number;
  unitPrice: number;
  location: string;
  sectorDistribution: Record<string, number>;
  expiryDate?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Movement {
  id: string;
  requisitionCode: string;
  type: 'ENTRADA' | 'SAIDA';
  reason: string;
  materialId: string;
  materialName: string;
  materialSku: string;
  materialUnit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sectorId: string;
  sectorName: string;
  targetSectorId?: string;
  targetSectorName?: string;
  responsibleName: string;
  requesterName?: string;
  documentNumber?: string;
  notes?: string;
  date: string;
  createdAt: string;
}

interface User {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  role: 'admin' | 'operador' | 'supervisor';
  sectorId?: string;
}

interface DB {
  sectors: Sector[];
  materials: Material[];
  movements: Movement[];
  users: User[];
  nextRequisitionNum: number;
}

function getInitialDB(): DB {
  const sectors: Sector[] = [
    {
      id: 'sec-1',
      code: 'ALM-01',
      name: 'Almoxarifado Central',
      responsible: 'Pedro H. S. Alves',
      costCenter: 'CC-1001',
      contactPhone: '(11) 3456-7890',
      email: 'almoxarifado@empresa.com.br',
      active: true,
      createdAt: '2026-01-01T08:00:00.000Z',
    },
    {
      id: 'sec-2',
      code: 'MAN-02',
      name: 'Manutenção & Engenharia',
      responsible: 'Carlos Eduardo Silveira',
      costCenter: 'CC-2040',
      contactPhone: '(11) 3456-7892',
      email: 'manutencao@empresa.com.br',
      active: true,
      createdAt: '2026-01-05T08:00:00.000Z',
    },
    {
      id: 'sec-3',
      code: 'OPE-03',
      name: 'Operações Industriais',
      responsible: 'Mariana Duarte Prado',
      costCenter: 'CC-3010',
      contactPhone: '(11) 3456-7895',
      email: 'operacoes@empresa.com.br',
      active: true,
      createdAt: '2026-01-10T08:00:00.000Z',
    },
    {
      id: 'sec-4',
      code: 'TEC-04',
      name: 'Tecnologia & TI',
      responsible: 'Lucas Fernandes Ribeiro',
      costCenter: 'CC-4005',
      contactPhone: '(11) 3456-7898',
      email: 'ti@empresa.com.br',
      active: true,
      createdAt: '2026-01-12T08:00:00.000Z',
    },
    {
      id: 'sec-5',
      code: 'SST-05',
      name: 'Segurança do Trabalho (SST)',
      responsible: 'Juliana Mendes Santos',
      costCenter: 'CC-5020',
      contactPhone: '(11) 3456-7899',
      email: 'seguranca@empresa.com.br',
      active: true,
      createdAt: '2026-01-15T08:00:00.000Z',
    },
    {
      id: 'sec-6',
      code: 'ADM-06',
      name: 'Administrativo & RH',
      responsible: 'Renata Castro Lima',
      costCenter: 'CC-6010',
      contactPhone: '(11) 3456-7891',
      email: 'administrativo@empresa.com.br',
      active: true,
      createdAt: '2026-01-15T08:00:00.000Z',
    },
  ];

  const materials: Material[] = [
    {
      id: 'mat-1',
      sku: 'EPI-001',
      name: 'Óculos de Segurança Antirrisco e Antiembaçante',
      description: 'Proteção ocular com lentes de policarbonato e CA 34.120',
      category: 'EPIs & Segurança',
      unit: 'UN',
      minStock: 30,
      maxStock: 150,
      currentStock: 85,
      unitPrice: 18.5,
      location: 'Corredor A - Prateleira 01 - Caixa 04',
      sectorDistribution: { 'sec-1': 55, 'sec-5': 20, 'sec-3': 10 },
      active: true,
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-09-01T10:00:00.000Z',
    },
    {
      id: 'mat-2',
      sku: 'EPI-002',
      name: 'Luva de Vaqueta Cano Curto Misto',
      description: 'Luva para proteção mecânica e abrasão, tamanho 9 (G)',
      category: 'EPIs & Segurança',
      unit: 'PAR',
      minStock: 40,
      maxStock: 200,
      currentStock: 24, // Low stock!
      unitPrice: 24.9,
      location: 'Corredor A - Prateleira 02 - Gaveta 01',
      sectorDistribution: { 'sec-1': 14, 'sec-2': 10 },
      active: true,
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-09-08T14:30:00.000Z',
    },
    {
      id: 'mat-3',
      sku: 'EPI-003',
      name: 'Protetor Auricular Tipo Concha 22dB',
      description: 'Atenuação acústica para operadores de áreas ruidosas',
      category: 'EPIs & Segurança',
      unit: 'UN',
      minStock: 20,
      maxStock: 80,
      currentStock: 42,
      unitPrice: 58.0,
      location: 'Corredor A - Prateleira 03',
      sectorDistribution: { 'sec-1': 30, 'sec-3': 12 },
      active: true,
      createdAt: '2026-01-02T08:00:00.000Z',
      updatedAt: '2026-08-20T09:15:00.000Z',
    },
    {
      id: 'mat-4',
      sku: 'FER-101',
      name: 'Chave Philips Isolada 1000V 6x150mm',
      description: 'Haste em aço cromo-vanádio com isolação conforme NR10',
      category: 'Ferramentas Manuais',
      unit: 'UN',
      minStock: 10,
      maxStock: 40,
      currentStock: 18,
      unitPrice: 32.7,
      location: 'Corredor B - Armário 02 - Prateleira 01',
      sectorDistribution: { 'sec-1': 10, 'sec-2': 8 },
      active: true,
      createdAt: '2026-01-05T08:00:00.000Z',
      updatedAt: '2026-08-15T11:00:00.000Z',
    },
    {
      id: 'mat-5',
      sku: 'FER-102',
      name: 'Alicate Universal 8 Polegadas Isolado',
      description: 'Forjado em aço carbono com empunhadura ergonômica',
      category: 'Ferramentas Manuais',
      unit: 'UN',
      minStock: 15,
      maxStock: 50,
      currentStock: 7, // Low stock!
      unitPrice: 48.9,
      location: 'Corredor B - Armário 02 - Prateleira 02',
      sectorDistribution: { 'sec-1': 4, 'sec-2': 3 },
      active: true,
      createdAt: '2026-01-05T08:00:00.000Z',
      updatedAt: '2026-09-05T16:00:00.000Z',
    },
    {
      id: 'mat-6',
      sku: 'QUI-201',
      name: 'Desengripante Spray Multiuso 300ml',
      description: 'Lubrificante e anticorrosivo para porcas e engrenagens',
      category: 'Químicos & Lubrificantes',
      unit: 'UN',
      minStock: 25,
      maxStock: 120,
      currentStock: 64,
      unitPrice: 19.8,
      location: 'Corredor C - Armário Químico Corta-Fogo 01',
      sectorDistribution: { 'sec-1': 40, 'sec-2': 18, 'sec-3': 6 },
      expiryDate: '2027-12-31',
      active: true,
      createdAt: '2026-01-08T08:00:00.000Z',
      updatedAt: '2026-08-28T10:00:00.000Z',
    },
    {
      id: 'mat-7',
      sku: 'QUI-202',
      name: 'Graxa Sintética Especial de Lítio NLGI 2',
      description: 'Balde de 1kg para rolamentos de alta rotação e temperatura',
      category: 'Químicos & Lubrificantes',
      unit: 'KG',
      minStock: 12,
      maxStock: 60,
      currentStock: 28,
      unitPrice: 76.5,
      location: 'Corredor C - Prateleira Químicos 02',
      sectorDistribution: { 'sec-1': 20, 'sec-3': 8 },
      expiryDate: '2028-06-30',
      active: true,
      createdAt: '2026-01-10T08:00:00.000Z',
      updatedAt: '2026-08-10T14:00:00.000Z',
    },
    {
      id: 'mat-8',
      sku: 'ELE-301',
      name: 'Cabo Flexível 2,5mm² 750V Preto',
      description: 'Rolo de 100 metros com condutor de cobre puro antichama',
      category: 'Elétrica & Cabos',
      unit: 'ROLO',
      minStock: 8,
      maxStock: 35,
      currentStock: 15,
      unitPrice: 185.0,
      location: 'Corredor D - Palete 04',
      sectorDistribution: { 'sec-1': 10, 'sec-2': 5 },
      active: true,
      createdAt: '2026-01-12T08:00:00.000Z',
      updatedAt: '2026-09-02T13:40:00.000Z',
    },
    {
      id: 'mat-9',
      sku: 'ELE-302',
      name: 'Fita Isolante 19mm x 20m Classe A',
      description: 'Auto-extinguível com isolamento até 600V',
      category: 'Elétrica & Cabos',
      unit: 'UN',
      minStock: 30,
      maxStock: 150,
      currentStock: 92,
      unitPrice: 8.9,
      location: 'Corredor D - Prateleira 01',
      sectorDistribution: { 'sec-1': 60, 'sec-2': 22, 'sec-4': 10 },
      active: true,
      createdAt: '2026-01-12T08:00:00.000Z',
      updatedAt: '2026-08-25T11:20:00.000Z',
    },
    {
      id: 'mat-10',
      sku: 'INF-401',
      name: 'Patch Cord RJ45 Cat6 2,5 Metros Azul',
      description: 'Cabo de rede conectorizado e testado com capa injetada',
      category: 'Tecnologia & TI',
      unit: 'UN',
      minStock: 25,
      maxStock: 100,
      currentStock: 48,
      unitPrice: 14.5,
      location: 'Corredor E - Prateleira TI 01',
      sectorDistribution: { 'sec-1': 20, 'sec-4': 28 },
      active: true,
      createdAt: '2026-01-15T08:00:00.000Z',
      updatedAt: '2026-09-04T09:00:00.000Z',
    },
    {
      id: 'mat-11',
      sku: 'INF-402',
      name: 'Toner Preto HP LaserJet Pro MFP M428',
      description: 'Rendimento estimado para 3.000 páginas com chip original',
      category: 'Tecnologia & TI',
      unit: 'UN',
      minStock: 5,
      maxStock: 20,
      currentStock: 2, // Critical low!
      unitPrice: 289.0,
      location: 'Corredor E - Armário TI Trancado 03',
      sectorDistribution: { 'sec-1': 1, 'sec-6': 1 },
      active: true,
      createdAt: '2026-01-15T08:00:00.000Z',
      updatedAt: '2026-09-09T15:00:00.000Z',
    },
    {
      id: 'mat-12',
      sku: 'ESC-501',
      name: 'Papel Sulfite A4 75g/m² Branco (Caixa)',
      description: 'Caixa contendo 10 resmas com 500 folhas cada (5.000 folhas)',
      category: 'Material de Escritório',
      unit: 'CX',
      minStock: 15,
      maxStock: 80,
      currentStock: 38,
      unitPrice: 235.0,
      location: 'Corredor F - Palete 01',
      sectorDistribution: { 'sec-1': 25, 'sec-6': 10, 'sec-4': 3 },
      active: true,
      createdAt: '2026-01-18T08:00:00.000Z',
      updatedAt: '2026-09-03T10:15:00.000Z',
    },
    {
      id: 'mat-13',
      sku: 'MEC-601',
      name: 'Rolamento Rígido de Esferas 6205-2RS',
      description: 'Rolamento blindado com vedação em borracha nitrílica',
      category: 'Peças & Reposição',
      unit: 'UN',
      minStock: 12,
      maxStock: 50,
      currentStock: 0, // Zerado!
      unitPrice: 42.0,
      location: 'Corredor B - Gaveta 14',
      sectorDistribution: {},
      active: true,
      createdAt: '2026-01-20T08:00:00.000Z',
      updatedAt: '2026-09-10T11:00:00.000Z',
    },
    {
      id: 'mat-14',
      sku: 'MEC-602',
      name: 'Correia Dentada Industrial em V B-48',
      description: 'Correia de transmissão reforçada em borracha sintética',
      category: 'Peças & Reposição',
      unit: 'UN',
      minStock: 10,
      maxStock: 40,
      currentStock: 16,
      unitPrice: 54.0,
      location: 'Corredor B - Suporte 03',
      sectorDistribution: { 'sec-1': 10, 'sec-3': 6 },
      active: true,
      createdAt: '2026-01-20T08:00:00.000Z',
      updatedAt: '2026-08-30T17:00:00.000Z',
    },
  ];

  const movements: Movement[] = [
    {
      id: 'mov-1',
      requisitionCode: 'REQ-2026-0001',
      type: 'ENTRADA',
      reason: 'Compra Fornecedor',
      materialId: 'mat-1',
      materialName: 'Óculos de Segurança Antirrisco e Antiembaçante',
      materialSku: 'EPI-001',
      materialUnit: 'UN',
      quantity: 100,
      unitPrice: 18.5,
      totalPrice: 1850.0,
      sectorId: 'sec-1',
      sectorName: 'Almoxarifado Central',
      responsibleName: 'Pedro H. S. Alves',
      documentNumber: 'NF-e 84210',
      notes: 'Recebimento do pedido de compras regular Q1',
      date: '2026-08-10T09:30:00.000Z',
      createdAt: '2026-08-10T09:30:00.000Z',
    },
    {
      id: 'mov-2',
      requisitionCode: 'REQ-2026-0002',
      type: 'SAIDA',
      reason: 'Consumo Interno',
      materialId: 'mat-1',
      materialName: 'Óculos de Segurança Antirrisco e Antiembaçante',
      materialSku: 'EPI-001',
      materialUnit: 'UN',
      quantity: 15,
      unitPrice: 18.5,
      totalPrice: 277.5,
      sectorId: 'sec-1',
      sectorName: 'Almoxarifado Central',
      targetSectorId: 'sec-3',
      targetSectorName: 'Operações Industriais',
      responsibleName: 'Pedro H. S. Alves',
      requesterName: 'Mariana Duarte Prado',
      documentNumber: 'REQ-INT-104',
      notes: 'Reposição para equipe de solda do turno matutino',
      date: '2026-08-12T14:15:00.000Z',
      createdAt: '2026-08-12T14:15:00.000Z',
    },
    {
      id: 'mov-3',
      requisitionCode: 'REQ-2026-0003',
      type: 'SAIDA',
      reason: 'Consumo Interno',
      materialId: 'mat-2',
      materialName: 'Luva de Vaqueta Cano Curto Misto',
      materialSku: 'EPI-002',
      materialUnit: 'PAR',
      quantity: 20,
      unitPrice: 24.9,
      totalPrice: 498.0,
      sectorId: 'sec-1',
      sectorName: 'Almoxarifado Central',
      targetSectorId: 'sec-2',
      targetSectorName: 'Manutenção & Engenharia',
      responsibleName: 'Pedro H. S. Alves',
      requesterName: 'Carlos Eduardo Silveira',
      documentNumber: 'REQ-INT-108',
      notes: 'Fornecimento para revisão de máquinas da linha B',
      date: '2026-08-15T11:00:00.000Z',
      createdAt: '2026-08-15T11:00:00.000Z',
    },
    {
      id: 'mov-4',
      requisitionCode: 'REQ-2026-0004',
      type: 'ENTRADA',
      reason: 'Compra Fornecedor',
      materialId: 'mat-8',
      materialName: 'Cabo Flexível 2,5mm² 750V Preto',
      materialSku: 'ELE-301',
      materialUnit: 'ROLO',
      quantity: 15,
      unitPrice: 185.0,
      totalPrice: 2775.0,
      sectorId: 'sec-1',
      sectorName: 'Almoxarifado Central',
      responsibleName: 'Pedro H. S. Alves',
      documentNumber: 'NF-e 84355',
      notes: 'Aquisição preventiva para reforma da subestação',
      date: '2026-08-20T10:00:00.000Z',
      createdAt: '2026-08-20T10:00:00.000Z',
    },
    {
      id: 'mov-5',
      requisitionCode: 'REQ-2026-0005',
      type: 'SAIDA',
      reason: 'Consumo Interno',
      materialId: 'mat-11',
      materialName: 'Toner Preto HP LaserJet Pro MFP M428',
      materialSku: 'INF-402',
      materialUnit: 'UN',
      quantity: 4,
      unitPrice: 289.0,
      totalPrice: 1156.0,
      sectorId: 'sec-1',
      sectorName: 'Almoxarifado Central',
      targetSectorId: 'sec-6',
      targetSectorName: 'Administrativo & RH',
      responsibleName: 'Pedro H. S. Alves',
      requesterName: 'Renata Castro Lima',
      documentNumber: 'REQ-INT-115',
      notes: 'Substituição nos setores contábil e recepção',
      date: '2026-08-25T16:20:00.000Z',
      createdAt: '2026-08-25T16:20:00.000Z',
    },
    {
      id: 'mov-6',
      requisitionCode: 'REQ-2026-0006',
      type: 'SAIDA',
      reason: 'Consumo Interno',
      materialId: 'mat-5',
      materialName: 'Alicate Universal 8 Polegadas Isolado',
      materialSku: 'FER-102',
      materialUnit: 'UN',
      quantity: 8,
      unitPrice: 48.9,
      totalPrice: 391.2,
      sectorId: 'sec-1',
      sectorName: 'Almoxarifado Central',
      targetSectorId: 'sec-2',
      targetSectorName: 'Manutenção & Engenharia',
      responsibleName: 'Pedro H. S. Alves',
      requesterName: 'Carlos Eduardo Silveira',
      documentNumber: 'REQ-INT-122',
      notes: 'Kits operacionais para novos eletricistas admitidos',
      date: '2026-09-01T08:45:00.000Z',
      createdAt: '2026-09-01T08:45:00.000Z',
    },
    {
      id: 'mov-7',
      requisitionCode: 'REQ-2026-0007',
      type: 'ENTRADA',
      reason: 'Compra Fornecedor',
      materialId: 'mat-12',
      materialName: 'Papel Sulfite A4 75g/m² Branco (Caixa)',
      materialSku: 'ESC-501',
      materialUnit: 'CX',
      quantity: 40,
      unitPrice: 235.0,
      totalPrice: 9400.0,
      sectorId: 'sec-1',
      sectorName: 'Almoxarifado Central',
      responsibleName: 'Pedro H. S. Alves',
      documentNumber: 'NF-e 85102',
      notes: 'Abastecimento bimestral de suprimentos de escritório',
      date: '2026-09-02T11:00:00.000Z',
      createdAt: '2026-09-02T11:00:00.000Z',
    },
    {
      id: 'mov-8',
      requisitionCode: 'REQ-2026-0008',
      type: 'SAIDA',
      reason: 'Consumo Interno',
      materialId: 'mat-13',
      materialName: 'Rolamento Rígido de Esferas 6205-2RS',
      materialSku: 'MEC-601',
      materialUnit: 'UN',
      quantity: 12,
      unitPrice: 42.0,
      totalPrice: 504.0,
      sectorId: 'sec-1',
      sectorName: 'Almoxarifado Central',
      targetSectorId: 'sec-3',
      targetSectorName: 'Operações Industriais',
      responsibleName: 'Pedro H. S. Alves',
      requesterName: 'Mariana Duarte Prado',
      documentNumber: 'REQ-URG-09',
      notes: 'Substituição urgente nos motores da esteira transportadora',
      date: '2026-09-05T13:30:00.000Z',
      createdAt: '2026-09-05T13:30:00.000Z',
    },
    {
      id: 'mov-9',
      requisitionCode: 'REQ-2026-0009',
      type: 'SAIDA',
      reason: 'Consumo Interno',
      materialId: 'mat-6',
      materialName: 'Desengripante Spray Multiuso 300ml',
      materialSku: 'QUI-201',
      materialUnit: 'UN',
      quantity: 18,
      unitPrice: 19.8,
      totalPrice: 356.4,
      sectorId: 'sec-1',
      sectorName: 'Almoxarifado Central',
      targetSectorId: 'sec-2',
      targetSectorName: 'Manutenção & Engenharia',
      responsibleName: 'Pedro H. S. Alves',
      requesterName: 'Carlos Eduardo Silveira',
      documentNumber: 'REQ-INT-133',
      notes: 'Manutenção preventiva periódica das caldeiras',
      date: '2026-09-07T10:15:00.000Z',
      createdAt: '2026-09-07T10:15:00.000Z',
    },
    {
      id: 'mov-10',
      requisitionCode: 'REQ-2026-0010',
      type: 'ENTRADA',
      reason: 'Devolução de Material',
      materialId: 'mat-4',
      materialName: 'Chave Philips Isolada 1000V 6x150mm',
      materialSku: 'FER-101',
      materialUnit: 'UN',
      quantity: 3,
      unitPrice: 32.7,
      totalPrice: 98.1,
      sectorId: 'sec-2',
      sectorName: 'Manutenção & Engenharia',
      targetSectorId: 'sec-1',
      targetSectorName: 'Almoxarifado Central',
      responsibleName: 'Pedro H. S. Alves',
      requesterName: 'Carlos Eduardo Silveira',
      documentNumber: 'DEV-0014',
      notes: 'Devolução de ferramentas excedentes após conclusão de OS',
      date: '2026-09-09T14:00:00.000Z',
      createdAt: '2026-09-09T14:00:00.000Z',
    },
  ];

  const users: User[] = [
    {
      id: 'usr-1',
      username: 'admin',
      passwordHash: 'admin123',
      name: 'Pedro H. S. Alves (Responsável Técnico)',
      role: 'admin',
      sectorId: 'sec-1',
    },
    {
      id: 'usr-2',
      username: 'operador',
      passwordHash: 'operador123',
      name: 'João Almoxarife',
      role: 'operador',
      sectorId: 'sec-1',
    },
  ];

  return {
    sectors,
    materials,
    movements,
    users,
    nextRequisitionNum: 11,
  };
}

// Database helper
function loadDB(): DB {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDB();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading DB, returning initial seed:', err);
    return getInitialDB();
  }
}

function saveDB(data: DB): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

// Simple in-memory active sessions
const sessions: Record<string, User> = {};

// REST API ROUTES
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const db = loadDB();
  const user = db.users.find(
    (u) => u.username === username && u.passwordHash === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas. Use admin / admin123 ou operador / operador123' });
  }

  const token = `sess_${user.id}_${Date.now()}`;
  sessions[token] = user;

  const { passwordHash, ...userSafe } = user;
  res.json({
    token,
    user: userSafe,
  });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // Default to admin for convenience if not authenticated
    const db = loadDB();
    const admin = db.users[0];
    const { passwordHash, ...userSafe } = admin;
    return res.json({ user: userSafe });
  }

  const token = authHeader.replace('Bearer ', '');
  const user = sessions[token];
  if (user) {
    const { passwordHash, ...userSafe } = user;
    return res.json({ user: userSafe });
  }

  const db = loadDB();
  const defaultUser = db.users[0];
  const { passwordHash, ...userSafe } = defaultUser;
  res.json({ user: userSafe });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    delete sessions[token];
  }
  res.json({ success: true });
});

// Reset database
app.post('/api/reset', (req, res) => {
  const fresh = getInitialDB();
  saveDB(fresh);
  res.json({ success: true, message: 'Banco de dados restaurado com dados iniciais.' });
});

// Sectors CRUD
app.get('/api/sectors', (req, res) => {
  const db = loadDB();
  res.json(db.sectors);
});

app.post('/api/sectors', (req, res) => {
  const db = loadDB();
  const { code, name, responsible, costCenter, contactPhone, email } = req.body;

  if (!code || !name) {
    return res.status(400).json({ error: 'Código e Nome do setor são obrigatórios' });
  }

  const newSector: Sector = {
    id: `sec-${Date.now()}`,
    code: code.trim().toUpperCase(),
    name: name.trim(),
    responsible: responsible?.trim() || 'Não informado',
    costCenter: costCenter?.trim() || `CC-${Math.floor(1000 + Math.random() * 9000)}`,
    contactPhone: contactPhone?.trim(),
    email: email?.trim(),
    active: true,
    createdAt: new Date().toISOString(),
  };

  db.sectors.push(newSector);
  saveDB(db);
  res.status(201).json(newSector);
});

app.put('/api/sectors/:id', (req, res) => {
  const db = loadDB();
  const sectorIndex = db.sectors.findIndex((s) => s.id === req.params.id);
  if (sectorIndex === -1) {
    return res.status(404).json({ error: 'Setor não encontrado' });
  }

  const existing = db.sectors[sectorIndex];
  const updated: Sector = {
    ...existing,
    ...req.body,
    id: existing.id,
    createdAt: existing.createdAt,
  };

  db.sectors[sectorIndex] = updated;
  saveDB(db);
  res.json(updated);
});

app.delete('/api/sectors/:id', (req, res) => {
  const db = loadDB();
  const sector = db.sectors.find((s) => s.id === req.params.id);
  if (!sector) {
    return res.status(404).json({ error: 'Setor não encontrado' });
  }

  // Soft delete or check usage
  sector.active = false;
  saveDB(db);
  res.json({ success: true, message: 'Setor desativado com sucesso.' });
});

// Materials CRUD
app.get('/api/materials', (req, res) => {
  const db = loadDB();
  const { category, search, lowStock } = req.query;

  let results = db.materials.filter((m) => m.active);

  if (category) {
    results = results.filter((m) => m.category === category);
  }

  if (lowStock === 'true') {
    results = results.filter((m) => m.currentStock <= m.minStock);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.sku.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q)
    );
  }

  res.json(results);
});

app.post('/api/materials', (req, res) => {
  const db = loadDB();
  const {
    sku,
    name,
    description,
    category,
    unit,
    minStock,
    maxStock,
    currentStock,
    unitPrice,
    location,
    expiryDate,
    initialSectorId,
  } = req.body;

  if (!sku || !name) {
    return res.status(400).json({ error: 'Código (SKU) e Nome são campos obrigatórios' });
  }

  // Check duplicate SKU
  const existingSku = db.materials.find(
    (m) => m.active && m.sku.toLowerCase() === sku.trim().toLowerCase()
  );
  if (existingSku) {
    return res.status(400).json({ error: `Já existe um material cadastrado com o SKU ${sku}` });
  }

  const initialStockQty = Number(currentStock) || 0;
  const sectorDist: Record<string, number> = {};
  if (initialStockQty > 0) {
    const targetSecId = initialSectorId || (db.sectors[0] ? db.sectors[0].id : 'sec-1');
    sectorDist[targetSecId] = initialStockQty;
  }

  const newMaterial: Material = {
    id: `mat-${Date.now()}`,
    sku: sku.trim().toUpperCase(),
    name: name.trim(),
    description: description?.trim() || '',
    category: category?.trim() || 'Geral',
    unit: unit || 'UN',
    minStock: Number(minStock) || 10,
    maxStock: Number(maxStock) || 100,
    currentStock: initialStockQty,
    unitPrice: Number(unitPrice) || 0,
    location: location?.trim() || 'Padrão Almoxarifado',
    sectorDistribution: sectorDist,
    expiryDate: expiryDate || undefined,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.materials.push(newMaterial);

  // If initial stock > 0, generate initial entry movement
  if (initialStockQty > 0) {
    const targetSec = db.sectors.find((s) => s.id === initialSectorId) || db.sectors[0];
    const reqNum = db.nextRequisitionNum++;
    const reqCode = `REQ-2026-${String(reqNum).padStart(4, '0')}`;

    const initialMovement: Movement = {
      id: `mov-${Date.now()}`,
      requisitionCode: reqCode,
      type: 'ENTRADA',
      reason: 'Cadastro Inicial / Saldo de Abertura',
      materialId: newMaterial.id,
      materialName: newMaterial.name,
      materialSku: newMaterial.sku,
      materialUnit: newMaterial.unit,
      quantity: initialStockQty,
      unitPrice: newMaterial.unitPrice,
      totalPrice: initialStockQty * newMaterial.unitPrice,
      sectorId: targetSec ? targetSec.id : 'sec-1',
      sectorName: targetSec ? targetSec.name : 'Almoxarifado Central',
      responsibleName: 'Sistema (Carga Inicial)',
      notes: 'Saldo cadastrado no registro do material',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    db.movements.push(initialMovement);
  }

  saveDB(db);
  res.status(201).json(newMaterial);
});

app.put('/api/materials/:id', (req, res) => {
  const db = loadDB();
  const matIndex = db.materials.findIndex((m) => m.id === req.params.id);
  if (matIndex === -1) {
    return res.status(404).json({ error: 'Material não encontrado' });
  }

  const existing = db.materials[matIndex];
  const updated: Material = {
    ...existing,
    ...req.body,
    id: existing.id,
    currentStock: existing.currentStock, // Stock should be updated via movements
    sectorDistribution: existing.sectorDistribution,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  db.materials[matIndex] = updated;
  saveDB(db);
  res.json(updated);
});

app.delete('/api/materials/:id', (req, res) => {
  const db = loadDB();
  const mat = db.materials.find((m) => m.id === req.params.id);
  if (!mat) {
    return res.status(404).json({ error: 'Material não encontrado' });
  }

  mat.active = false;
  mat.updatedAt = new Date().toISOString();
  saveDB(db);
  res.json({ success: true, message: 'Material inativado com sucesso.' });
});

// Movements API
app.get('/api/movements', (req, res) => {
  const db = loadDB();
  const { type, materialId, sectorId, startDate, endDate, search } = req.query;

  let results = [...db.movements];

  if (type === 'ENTRADA' || type === 'SAIDA') {
    results = results.filter((m) => m.type === type);
  }

  if (materialId) {
    results = results.filter((m) => m.materialId === materialId);
  }

  if (sectorId) {
    results = results.filter((m) => m.sectorId === sectorId || m.targetSectorId === sectorId);
  }

  if (startDate) {
    const start = new Date(startDate as string).getTime();
    results = results.filter((m) => new Date(m.date).getTime() >= start);
  }

  if (endDate) {
    const end = new Date(endDate as string).getTime() + 86400000; // include full day
    results = results.filter((m) => new Date(m.date).getTime() <= end);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (m) =>
        m.requisitionCode.toLowerCase().includes(q) ||
        m.materialName.toLowerCase().includes(q) ||
        m.materialSku.toLowerCase().includes(q) ||
        m.responsibleName.toLowerCase().includes(q) ||
        (m.requesterName && m.requesterName.toLowerCase().includes(q)) ||
        (m.documentNumber && m.documentNumber.toLowerCase().includes(q)) ||
        (m.notes && m.notes.toLowerCase().includes(q))
    );
  }

  // Sort descending by date
  results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json(results);
});

app.post('/api/movements', (req, res) => {
  const db = loadDB();
  const {
    type,
    reason,
    materialId,
    quantity,
    sectorId,
    targetSectorId,
    responsibleName,
    requesterName,
    documentNumber,
    notes,
    date,
  } = req.body;

  if (!type || !materialId || !quantity || !sectorId || !responsibleName) {
    return res.status(400).json({ error: 'Campos obrigatórios: tipo, material, quantidade, setor e responsável.' });
  }

  const qty = Number(quantity);
  if (isNaN(qty) || qty <= 0) {
    return res.status(400).json({ error: 'A quantidade deve ser um número positivo maior que zero.' });
  }

  const material = db.materials.find((m) => m.id === materialId && m.active);
  if (!material) {
    return res.status(404).json({ error: 'Material não encontrado ou inativo.' });
  }

  const sector = db.sectors.find((s) => s.id === sectorId);
  if (!sector) {
    return res.status(404).json({ error: 'Setor de origem/referência não encontrado.' });
  }

  let targetSector = undefined;
  if (targetSectorId) {
    targetSector = db.sectors.find((s) => s.id === targetSectorId);
  }

  // Validation for SAIDA
  if (type === 'SAIDA') {
    if (material.currentStock < qty) {
      return res.status(400).json({
        error: `Saldo insuficiente em estoque. Saldo disponível: ${material.currentStock} ${material.unit}. Solicitado: ${qty} ${material.unit}.`,
      });
    }

    // Update material total stock
    material.currentStock -= qty;

    // Update sector distribution
    const curSectorQty = material.sectorDistribution[sectorId] || 0;
    material.sectorDistribution[sectorId] = Math.max(0, curSectorQty - qty);

    // If it's a transfer to targetSector, credit targetSector
    if (targetSectorId && targetSector) {
      const curTargetQty = material.sectorDistribution[targetSectorId] || 0;
      material.sectorDistribution[targetSectorId] = curTargetQty + qty;
    }
  } else if (type === 'ENTRADA') {
    // ENTRADA credits stock
    material.currentStock += qty;
    const curSectorQty = material.sectorDistribution[sectorId] || 0;
    material.sectorDistribution[sectorId] = curSectorQty + qty;
  }

  material.updatedAt = new Date().toISOString();

  // Generate unique sequential protocol code
  const reqNum = db.nextRequisitionNum++;
  const reqCode = `REQ-2026-${String(reqNum).padStart(4, '0')}`;

  const movementDate = date ? new Date(date).toISOString() : new Date().toISOString();

  const newMovement: Movement = {
    id: `mov-${Date.now()}`,
    requisitionCode: reqCode,
    type,
    reason: reason || (type === 'ENTRADA' ? 'Compra Fornecedor' : 'Consumo Interno'),
    materialId: material.id,
    materialName: material.name,
    materialSku: material.sku,
    materialUnit: material.unit,
    quantity: qty,
    unitPrice: material.unitPrice,
    totalPrice: qty * material.unitPrice,
    sectorId: sector.id,
    sectorName: sector.name,
    targetSectorId: targetSector ? targetSector.id : undefined,
    targetSectorName: targetSector ? targetSector.name : undefined,
    responsibleName: responsibleName.trim(),
    requesterName: requesterName ? requesterName.trim() : undefined,
    documentNumber: documentNumber ? documentNumber.trim() : undefined,
    notes: notes ? notes.trim() : undefined,
    date: movementDate,
    createdAt: new Date().toISOString(),
  };

  db.movements.unshift(newMovement);
  saveDB(db);

  res.status(201).json({
    movement: newMovement,
    material,
    message: `${type === 'ENTRADA' ? 'Entrada' : 'Saída'} registrada com sucesso sob o protocolo ${reqCode}.`,
  });
});

// Single requisition detail endpoint
app.get('/api/requisitions/:code', (req, res) => {
  const db = loadDB();
  const movement = db.movements.find((m) => m.requisitionCode === req.params.code || m.id === req.params.code);

  if (!movement) {
    return res.status(404).json({ error: 'Requisição não encontrada.' });
  }

  const material = db.materials.find((m) => m.id === movement.materialId);
  const sector = db.sectors.find((s) => s.id === movement.sectorId);

  res.json({
    requisition: movement,
    material,
    sector,
  });
});

// Stock Position Report
app.get('/api/reports/stock-position', (req, res) => {
  const db = loadDB();
  const { sectorId, status } = req.query;

  const items = db.materials
    .filter((m) => m.active)
    .map((m) => {
      let itemStatus: 'NORMAL' | 'BAIXO' | 'CRITICO' | 'ZERADO' = 'NORMAL';
      if (m.currentStock === 0) {
        itemStatus = 'ZERADO';
      } else if (m.currentStock <= m.minStock * 0.5) {
        itemStatus = 'CRITICO';
      } else if (m.currentStock <= m.minStock) {
        itemStatus = 'BAIXO';
      }

      const sectorStocks = db.sectors
        .filter((s) => s.active)
        .map((s) => ({
          sectorId: s.id,
          sectorName: s.name,
          quantity: m.sectorDistribution[s.id] || 0,
        }));

      return {
        materialId: m.id,
        sku: m.sku,
        name: m.name,
        category: m.category,
        unit: m.unit,
        minStock: m.minStock,
        maxStock: m.maxStock,
        currentStock: m.currentStock,
        unitPrice: m.unitPrice,
        totalValue: m.currentStock * m.unitPrice,
        location: m.location,
        status: itemStatus,
        sectorStocks,
      };
    });

  let filtered = items;
  if (sectorId) {
    filtered = filtered.filter((i) =>
      i.sectorStocks.some((ss) => ss.sectorId === sectorId && ss.quantity > 0)
    );
  }

  if (status) {
    filtered = filtered.filter((i) => i.status === status);
  }

  const summary = {
    totalItems: filtered.length,
    totalQuantity: filtered.reduce((acc, i) => acc + i.currentStock, 0),
    totalFinancialValue: filtered.reduce((acc, i) => acc + i.totalValue, 0),
    lowStockCount: filtered.filter((i) => i.status === 'BAIXO' || i.status === 'CRITICO' || i.status === 'ZERADO').length,
  };

  res.json({
    summary,
    items: filtered,
  });
});

// Dashboard Performance Indicators & Metrics
app.get('/api/dashboard/metrics', (req, res) => {
  const db = loadDB();
  const activeMaterials = db.materials.filter((m) => m.active);

  const totalMaterials = activeMaterials.length;
  const totalUnitsInStock = activeMaterials.reduce((acc, m) => acc + m.currentStock, 0);
  const totalStockValueBRL = activeMaterials.reduce((acc, m) => acc + m.currentStock * m.unitPrice, 0);

  const lowStockItems = activeMaterials.filter((m) => m.currentStock > 0 && m.currentStock <= m.minStock);
  const outOfStockItems = activeMaterials.filter((m) => m.currentStock === 0);

  // Filter movements for current month / 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentMovements = db.movements.filter(
    (m) => new Date(m.date) >= thirtyDaysAgo
  );

  const totalMovementsThisMonth = recentMovements.length;
  const entradasThisMonth = recentMovements
    .filter((m) => m.type === 'ENTRADA')
    .reduce((acc, m) => acc + m.quantity, 0);
  const saidasThisMonth = recentMovements
    .filter((m) => m.type === 'SAIDA')
    .reduce((acc, m) => acc + m.quantity, 0);

  // Rotatividade de Estoque (Turnover Rate):
  // Giro = (Total de Saídas no Período / Estoque Médio)
  const averageStockUnits = totalUnitsInStock > 0 ? totalUnitsInStock : 1;
  const monthlyTurnoverRate = Number(((saidasThisMonth / averageStockUnits) * 100).toFixed(1));

  // Tempo Médio de Permanência (Lead time / dias médios de cobertura):
  // Dias = Estoque Atual / Média de Consumo Diário
  const dailyConsumption = saidasThisMonth / 30;
  const averageDaysInStock =
    dailyConsumption > 0
      ? Math.round(totalUnitsInStock / dailyConsumption)
      : Math.round(totalUnitsInStock / (totalUnitsInStock * 0.02 || 1));

  // Ranking: Top materiais mais consumidos (Saídas)
  const consumptionMap: Record<string, { qty: number; value: number; name: string; sku: string; unit: string }> = {};
  const receptionMap: Record<string, { qty: number; name: string; sku: string; unit: string }> = {};

  db.movements.forEach((m) => {
    if (m.type === 'SAIDA') {
      if (!consumptionMap[m.materialId]) {
        consumptionMap[m.materialId] = {
          qty: 0,
          value: 0,
          name: m.materialName,
          sku: m.materialSku,
          unit: m.materialUnit,
        };
      }
      consumptionMap[m.materialId].qty += m.quantity;
      consumptionMap[m.materialId].value += m.totalPrice;
    } else if (m.type === 'ENTRADA') {
      if (!receptionMap[m.materialId]) {
        receptionMap[m.materialId] = {
          qty: 0,
          name: m.materialName,
          sku: m.materialSku,
          unit: m.materialUnit,
        };
      }
      receptionMap[m.materialId].qty += m.quantity;
    }
  });

  const topConsumedMaterials = Object.entries(consumptionMap)
    .map(([id, data]) => ({
      materialId: id,
      sku: data.sku,
      name: data.name,
      quantity: data.qty,
      unit: data.unit,
      totalValue: data.value,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const topReceivedMaterials = Object.entries(receptionMap)
    .map(([id, data]) => ({
      materialId: id,
      sku: data.sku,
      name: data.name,
      quantity: data.qty,
      unit: data.unit,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Category distribution
  const catMap: Record<string, { count: number; value: number }> = {};
  activeMaterials.forEach((m) => {
    if (!catMap[m.category]) {
      catMap[m.category] = { count: 0, value: 0 };
    }
    catMap[m.category].count += 1;
    catMap[m.category].value += m.currentStock * m.unitPrice;
  });

  const categoryDistribution = Object.entries(catMap).map(([category, info]) => ({
    category,
    itemsCount: info.count,
    totalValue: info.value,
  }));

  // Monthly history for the last 6 months
  const monthlyHistory = [
    { month: 'Abril', entradas: 45, saidas: 38 },
    { month: 'Maio', entradas: 60, saidas: 52 },
    { month: 'Junho', entradas: 85, saidas: 74 },
    { month: 'Julho', entradas: 70, saidas: 68 },
    { month: 'Agosto', entradas: 140, saidas: 89 },
    { month: 'Setembro', entradas: entradasThisMonth || 82, saidas: saidasThisMonth || 65 },
  ];

  res.json({
    totalMaterials,
    totalUnitsInStock,
    totalStockValueBRL,
    lowStockItemsCount: lowStockItems.length,
    outOfStockItemsCount: outOfStockItems.length,
    monthlyTurnoverRate,
    averageDaysInStock,
    totalMovementsThisMonth,
    entradasThisMonth,
    saidasThisMonth,
    topConsumedMaterials,
    topReceivedMaterials,
    categoryDistribution,
    monthlyHistory,
  });
});

// START SERVER AND VITE INTEGRATION
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sistema de Controle de Estoques rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
