import { Material, Sector, Movement, User, DashboardMetrics, StockPositionReportItem } from '../types';

const BASE_URL = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('estoque_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(username: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Falha ao autenticar.');
  }
  const result = await res.json();
  localStorage.setItem('estoque_auth_token', result.token);
  return result;
}

export async function getCurrentUser(): Promise<User> {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    throw new Error('Não autenticado');
  }
  const data = await res.json();
  return data.user;
}

export async function logout(): Promise<void> {
  await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: getAuthHeader(),
  }).catch(() => {});
  localStorage.removeItem('estoque_auth_token');
}

export async function getMaterials(params?: { category?: string; search?: string; lowStock?: boolean }): Promise<Material[]> {
  const query = new URLSearchParams();
  if (params?.category) query.append('category', params.category);
  if (params?.search) query.append('search', params.search);
  if (params?.lowStock) query.append('lowStock', 'true');

  const res = await fetch(`${BASE_URL}/materials?${query.toString()}`);
  if (!res.ok) throw new Error('Falha ao carregar materiais.');
  return res.json();
}

export async function createMaterial(payload: Partial<Material> & { initialSectorId?: string }): Promise<Material> {
  const res = await fetch(`${BASE_URL}/materials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Erro ao cadastrar material.');
  }
  return res.json();
}

export async function updateMaterial(id: string, payload: Partial<Material>): Promise<Material> {
  const res = await fetch(`${BASE_URL}/materials/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Erro ao atualizar material.');
  }
  return res.json();
}

export async function deleteMaterial(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/materials/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Erro ao inativar material.');
}

export async function getSectors(): Promise<Sector[]> {
  const res = await fetch(`${BASE_URL}/sectors`);
  if (!res.ok) throw new Error('Falha ao carregar setores.');
  return res.json();
}

export async function createSector(payload: Partial<Sector>): Promise<Sector> {
  const res = await fetch(`${BASE_URL}/sectors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Erro ao cadastrar setor.');
  }
  return res.json();
}

export async function updateSector(id: string, payload: Partial<Sector>): Promise<Sector> {
  const res = await fetch(`${BASE_URL}/sectors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Erro ao atualizar setor.');
  }
  return res.json();
}

export async function deleteSector(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/sectors/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Erro ao desativar setor.');
}

export async function getMovements(params?: {
  type?: string;
  materialId?: string;
  sectorId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}): Promise<Movement[]> {
  const query = new URLSearchParams();
  if (params?.type) query.append('type', params.type);
  if (params?.materialId) query.append('materialId', params.materialId);
  if (params?.sectorId) query.append('sectorId', params.sectorId);
  if (params?.startDate) query.append('startDate', params.startDate);
  if (params?.endDate) query.append('endDate', params.endDate);
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`${BASE_URL}/movements?${query.toString()}`);
  if (!res.ok) throw new Error('Falha ao carregar movimentações.');
  return res.json();
}

export async function createMovement(payload: {
  type: 'ENTRADA' | 'SAIDA';
  reason?: string;
  materialId: string;
  quantity: number;
  sectorId: string;
  targetSectorId?: string;
  responsibleName: string;
  requesterName?: string;
  documentNumber?: string;
  notes?: string;
  date?: string;
}): Promise<{ movement: Movement; material: Material; message: string }> {
  const res = await fetch(`${BASE_URL}/movements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Erro ao registrar movimentação.');
  }
  return res.json();
}

export async function getRequisition(code: string): Promise<{
  requisition: Movement;
  material?: Material;
  sector?: Sector;
}> {
  const res = await fetch(`${BASE_URL}/requisitions/${encodeURIComponent(code)}`);
  if (!res.ok) throw new Error('Requisição não encontrada.');
  return res.json();
}

export async function getStockPosition(params?: {
  sectorId?: string;
  status?: string;
}): Promise<{
  summary: {
    totalItems: number;
    totalQuantity: number;
    totalFinancialValue: number;
    lowStockCount: number;
  };
  items: StockPositionReportItem[];
}> {
  const query = new URLSearchParams();
  if (params?.sectorId) query.append('sectorId', params.sectorId);
  if (params?.status) query.append('status', params.status);

  const res = await fetch(`${BASE_URL}/reports/stock-position?${query.toString()}`);
  if (!res.ok) throw new Error('Falha ao carregar posição de estoque.');
  return res.json();
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const res = await fetch(`${BASE_URL}/dashboard/metrics`);
  if (!res.ok) throw new Error('Falha ao carregar indicadores de desempenho.');
  return res.json();
}

export async function resetDatabase(): Promise<void> {
  const res = await fetch(`${BASE_URL}/reset`, {
    method: 'POST',
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Falha ao restaurar banco.');
}
