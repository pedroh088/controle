import { useState, useEffect, FormEvent } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Building2, 
  User as UserIcon, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Search, 
  Info,
  ShieldCheck
} from 'lucide-react';
import { Material, Sector, Movement, MovementReason } from '../types';
import { createMovement } from '../services/api';

interface MovementsViewProps {
  materials: Material[];
  sectors: Sector[];
  currentUserResponsible: string;
  prefillMaterialId?: string;
  defaultType?: 'ENTRADA' | 'SAIDA';
  onMovementSuccess: (movement: Movement) => void;
  onOpenRequisition: (movement: Movement) => void;
}

export default function MovementsView({
  materials,
  sectors,
  currentUserResponsible,
  prefillMaterialId,
  defaultType = 'SAIDA',
  onMovementSuccess,
  onOpenRequisition,
}: MovementsViewProps) {
  const [type, setType] = useState<'ENTRADA' | 'SAIDA'>(defaultType);
  const [materialId, setMaterialId] = useState<string>(prefillMaterialId || (materials[0]?.id || ''));
  const [quantity, setQuantity] = useState<string>('');
  const [reason, setReason] = useState<MovementReason>(type === 'ENTRADA' ? 'Compra Fornecedor' : 'Consumo Interno');
  const [sectorId, setSectorId] = useState<string>(sectors[0]?.id || '');
  const [targetSectorId, setTargetSectorId] = useState<string>(sectors[1]?.id || '');
  const [responsibleName, setResponsibleName] = useState<string>(currentUserResponsible || 'Pedro H. S. Alves');
  const [requesterName, setRequesterName] = useState<string>('');
  const [documentNumber, setDocumentNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [searchMaterial, setSearchMaterial] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastMovement, setLastMovement] = useState<Movement | null>(null);

  // Sync default type when prop changes
  useEffect(() => {
    if (defaultType) {
      setType(defaultType);
      setReason(defaultType === 'ENTRADA' ? 'Compra Fornecedor' : 'Consumo Interno');
    }
  }, [defaultType]);

  // Sync prefill material
  useEffect(() => {
    if (prefillMaterialId) {
      setMaterialId(prefillMaterialId);
    }
  }, [prefillMaterialId]);

  // Update reasons when type changes
  const handleTypeChange = (newType: 'ENTRADA' | 'SAIDA') => {
    setType(newType);
    setReason(newType === 'ENTRADA' ? 'Compra Fornecedor' : 'Consumo Interno');
    setErrorMessage(null);
  };

  const selectedMaterial = materials.find((m) => m.id === materialId);
  const qtyNumber = Number(quantity);
  const isSaida = type === 'SAIDA';
  const hasInsufficientStock = isSaida && selectedMaterial && qtyNumber > selectedMaterial.currentStock;

  // Filter materials for dropdown / picker
  const filteredMaterials = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(searchMaterial.toLowerCase()) ||
      m.sku.toLowerCase().includes(searchMaterial.toLowerCase()) ||
      m.category.toLowerCase().includes(searchMaterial.toLowerCase())
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!materialId) {
      setErrorMessage('Por favor, selecione um material.');
      return;
    }

    if (!qtyNumber || qtyNumber <= 0) {
      setErrorMessage('A quantidade deve ser um valor numérico positivo maior que zero.');
      return;
    }

    if (hasInsufficientStock) {
      setErrorMessage(`Estoque insuficiente! Saldo disponível: ${selectedMaterial?.currentStock} ${selectedMaterial?.unit}.`);
      return;
    }

    if (!responsibleName.trim()) {
      setErrorMessage('O nome do responsável pela liberação é obrigatório.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await createMovement({
        type,
        reason,
        materialId,
        quantity: qtyNumber,
        sectorId,
        targetSectorId: reason === 'Transferência Setorial' || isSaida ? targetSectorId : undefined,
        responsibleName,
        requesterName,
        documentNumber,
        notes,
        date: new Date(date).toISOString(),
      });

      setLastMovement(response.movement);
      onMovementSuccess(response.movement);
      setQuantity('');
      setRequesterName('');
      setDocumentNumber('');
      setNotes('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao processar movimentação.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Registro de Movimentação de Estoque
          </h2>
          <p className="text-xs text-slate-400">
            Lance entradas por compra/devolução ou saídas para abastecimento dos setores com emissão de protocolo.
          </p>
        </div>

        {/* Operation Type Switcher */}
        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => handleTypeChange('SAIDA')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              type === 'SAIDA'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
            <span>SAÍDA / CONSUMO</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('ENTRADA')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              type === 'ENTRADA'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            <span>ENTRADA / REPOSIÇÃO</span>
          </button>
        </div>
      </div>

      {/* Success banner with print trigger */}
      {lastMovement && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-300 block">
                {lastMovement.type === 'ENTRADA' ? 'Entrada' : 'Saída'} registrada com sucesso!
              </span>
              <p className="text-xs text-slate-300">
                Protocolo: <strong className="font-mono text-amber-300">{lastMovement.requisitionCode}</strong> — {lastMovement.quantity} {lastMovement.materialUnit} de {lastMovement.materialName}.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenRequisition(lastMovement)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Visualizar / Imprimir Requisição</span>
          </button>
        </div>
      )}

      {/* Error alert */}
      {errorMessage && (
        <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Inputs */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Motivo da Movimentação */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Motivo / Justificativa *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as MovementReason)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              >
                {type === 'SAIDA' ? (
                  <>
                    <option value="Consumo Interno">Consumo Interno</option>
                    <option value="Transferência Setorial">Transferência Setorial</option>
                    <option value="Avaria / Perda / Vencido">Avaria / Perda / Vencido</option>
                    <option value="Ajuste Negativo de Inventário">Ajuste Negativo de Inventário</option>
                  </>
                ) : (
                  <>
                    <option value="Compra Fornecedor">Compra Fornecedor (NF-e)</option>
                    <option value="Devolução de Material">Devolução de Material</option>
                    <option value="Doação / Ajuste Positivo">Doação / Ajuste Positivo</option>
                  </>
                )}
              </select>
            </div>

            {/* Data da Operação */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Data do Movimento *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
                <Calendar className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Material Selection with search */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Material a Movimentar *
              </label>
              <div className="relative w-48">
                <input
                  type="text"
                  placeholder="Filtrar materiais..."
                  value={searchMaterial}
                  onChange={(e) => setSearchMaterial(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/60 rounded px-2 py-1 pl-6 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
              </div>
            </div>

            <select
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-sans"
              required
            >
              {filteredMaterials.map((mat) => (
                <option key={mat.id} value={mat.id}>
                  [{mat.sku}] {mat.name} • Saldo: {mat.currentStock} {mat.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Quantidade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Quantidade * {selectedMaterial && `(${selectedMaterial.unit})`}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder={`Ex: 5`}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-sm text-slate-100 font-mono font-bold focus:outline-none ${
                    hasInsufficientStock
                      ? 'border-rose-500 focus:border-rose-400 text-rose-300'
                      : 'border-slate-700 focus:border-amber-500'
                  }`}
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs font-mono font-bold text-slate-400">
                  {selectedMaterial?.unit || 'UN'}
                </span>
              </div>
              {hasInsufficientStock && (
                <p className="text-[11px] text-rose-400 mt-1 font-medium">
                  Saldo insuficiente! O estoque atual é de apenas {selectedMaterial?.currentStock} {selectedMaterial?.unit}.
                </p>
              )}
            </div>

            {/* Documento / NF */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Documento de Referência
              </label>
              <input
                type="text"
                placeholder={type === 'ENTRADA' ? 'Ex: NF-e 85402' : 'Ex: OS-2026-104 / Req. Interna'}
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Sectors: Origin & Target */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Setor de Origem *
              </label>
              <select
                value={sectorId}
                onChange={(e) => setSectorId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                required
              >
                {sectors.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    [{sec.code}] {sec.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                {type === 'SAIDA' ? 'Setor Destino / Solicitante *' : 'Setor Beneficiado'}
              </label>
              <select
                value={targetSectorId}
                onChange={(e) => setTargetSectorId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                required={type === 'SAIDA'}
              >
                {sectors.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    [{sec.code}] {sec.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Responsibles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Responsável / Liberador *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nome do almoxarife"
                  value={responsibleName}
                  onChange={(e) => setResponsibleName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 pl-8 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  required
                />
                <UserIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Requisitante / Recebedor
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nome de quem retira o material"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 pl-8 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
                <UserIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Observações / Aplicação do Material
            </label>
            <textarea
              rows={2}
              placeholder="Descreva a finalidade (ex: Reposição de EPIs para a equipe da solda ou número da OS)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !!hasInsufficientStock}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                hasInsufficientStock
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : type === 'SAIDA'
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white shadow-rose-500/10'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-emerald-500/10'
              }`}
            >
              {type === 'SAIDA' ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownLeft className="w-4 h-4" />
              )}
              <span>
                {submitting
                  ? 'Processando e gravando movimentação...'
                  : type === 'SAIDA'
                  ? 'Confirmar e Liberar Saída de Material'
                  : 'Confirmar e Registrar Entrada em Estoque'}
              </span>
            </button>
          </div>
        </div>

        {/* Right 1 Col: Material Summary Card & Rules */}
        <div className="space-y-4">
          {selectedMaterial ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                  {selectedMaterial.sku}
                </span>
                <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">
                  {selectedMaterial.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedMaterial.category} • {selectedMaterial.location}
                </p>
              </div>

              {/* Stock Status Box */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Saldo Disponível:</span>
                  <span className="text-lg font-black font-mono text-white mt-0.5 block">
                    {selectedMaterial.currentStock} <span className="text-xs text-slate-400">{selectedMaterial.unit}</span>
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Estoque Mínimo:</span>
                  <span className="text-lg font-black font-mono text-amber-400 mt-0.5 block">
                    {selectedMaterial.minStock} <span className="text-xs text-slate-400">{selectedMaterial.unit}</span>
                  </span>
                </div>
              </div>

              {/* Simulation Result */}
              {qtyNumber > 0 && !isNaN(qtyNumber) && (
                <div className={`p-3 rounded-lg border text-xs space-y-1 ${
                  hasInsufficientStock
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                    : 'bg-blue-950/40 border-blue-800/50 text-slate-200'
                }`}>
                  <span className="font-bold block uppercase text-[10px] text-amber-300">
                    Previsão Pós-Movimentação:
                  </span>
                  <div className="flex justify-between font-mono">
                    <span>Novo Saldo Estimado:</span>
                    <strong className={hasInsufficientStock ? 'text-rose-400' : 'text-emerald-400'}>
                      {isSaida
                        ? selectedMaterial.currentStock - qtyNumber
                        : selectedMaterial.currentStock + qtyNumber}{' '}
                      {selectedMaterial.unit}
                    </strong>
                  </div>
                  <div className="flex justify-between font-mono text-slate-400 text-[11px]">
                    <span>Valor Financeiro:</span>
                    <span>
                      R$ {(qtyNumber * selectedMaterial.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              {/* Technical disclaimer */}
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Auditoria & Rastreabilidade</span>
                </div>
                <p>
                  Toda movimentação gera protocolo com número sequencial único e fica registrada no log inalterável de auditoria.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center text-xs text-slate-400">
              Nenhum material selecionado.
            </div>
          )}

          {/* Quick instructions */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
              <Info className="w-4 h-4" />
              <span>Diretrizes de Liberação</span>
            </div>
            <ul className="space-y-1 list-disc list-inside text-[11px]">
              <li>Confira a assinatura física do requisitante na guia impressa.</li>
              <li>Apenas almoxarifes cadastrados podem autorizar saídas.</li>
              <li>Em caso de avarias, anote o laudo técnico nas observações.</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
