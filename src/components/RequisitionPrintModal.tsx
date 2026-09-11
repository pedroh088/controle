import { Printer, X, ShieldCheck, CheckCircle2, Building2, Calendar, FileText } from 'lucide-react';
import { Movement } from '../types';

interface RequisitionPrintModalProps {
  requisition: Movement | null;
  onClose: () => void;
}

export default function RequisitionPrintModal({ requisition, onClose }: RequisitionPrintModalProps) {
  if (!requisition) return null;

  const handlePrint = () => {
    window.print();
  };

  const isSaida = requisition.type === 'SAIDA';
  const formattedDate = new Date(requisition.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto modal-backdrop-blur">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden my-auto print-only-container">
        {/* Action bar (Hidden when printing) */}
        <div className="no-print bg-slate-950 px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Visualização de Requisição Oficial para Impressão / PDF
              </h3>
              <p className="text-xs text-slate-400">
                Protocolo: <span className="font-mono text-amber-300 font-semibold">{requisition.requisitionCode}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Gerar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body (A4 styled) */}
        <div className="p-6 sm:p-10 bg-white text-slate-900 print-card font-sans">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                  GESTÃO OPERACIONAL DE ALMOXARIFADO
                </span>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-950 uppercase">
                  {isSaida ? 'Guia de Requisição & Saída de Materiais' : 'Comprovante de Entrada & Recebimento'}
                </h1>
                <p className="text-xs text-slate-600">
                  Departamento de Logística e Suprimentos • Controle Interno
                </p>
              </div>

              <div className="text-right">
                <div className="inline-block bg-slate-100 border-2 border-slate-900 px-3 py-1.5 rounded text-center">
                  <span className="block text-[9px] uppercase font-bold text-slate-600">
                    Número do Protocolo
                  </span>
                  <span className="text-base font-black font-mono text-slate-950">
                    {requisition.requisitionCode}
                  </span>
                </div>
                {/* SVG Barcode simulation */}
                <div className="mt-1 flex justify-end">
                  <svg className="h-6 w-36" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <rect x="0" y="0" width="3" height="20" fill="#0f172a" />
                    <rect x="5" y="0" width="2" height="20" fill="#0f172a" />
                    <rect x="9" y="0" width="4" height="20" fill="#0f172a" />
                    <rect x="15" y="0" width="1" height="20" fill="#0f172a" />
                    <rect x="18" y="0" width="3" height="20" fill="#0f172a" />
                    <rect x="23" y="0" width="5" height="20" fill="#0f172a" />
                    <rect x="30" y="0" width="2" height="20" fill="#0f172a" />
                    <rect x="34" y="0" width="4" height="20" fill="#0f172a" />
                    <rect x="40" y="0" width="2" height="20" fill="#0f172a" />
                    <rect x="44" y="0" width="3" height="20" fill="#0f172a" />
                    <rect x="49" y="0" width="5" height="20" fill="#0f172a" />
                    <rect x="56" y="0" width="1" height="20" fill="#0f172a" />
                    <rect x="59" y="0" width="4" height="20" fill="#0f172a" />
                    <rect x="65" y="0" width="2" height="20" fill="#0f172a" />
                    <rect x="69" y="0" width="3" height="20" fill="#0f172a" />
                    <rect x="74" y="0" width="5" height="20" fill="#0f172a" />
                    <rect x="81" y="0" width="2" height="20" fill="#0f172a" />
                    <rect x="85" y="0" width="4" height="20" fill="#0f172a" />
                    <rect x="91" y="0" width="3" height="20" fill="#0f172a" />
                    <rect x="96" y="0" width="4" height="20" fill="#0f172a" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs mb-6">
            <div>
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">Data & Horário:</span>
              <span className="font-medium text-slate-900 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {formattedDate}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">Tipo de Operação:</span>
              <span className={`inline-block font-bold mt-0.5 px-2 py-0.5 rounded text-[11px] ${
                isSaida ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {requisition.type} — {requisition.reason}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">Setor de Origem:</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                {requisition.sectorName}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">
                {isSaida ? 'Setor Solicitante / Destino:' : 'Setor Beneficiado:'}
              </span>
              <span className="font-semibold text-slate-900 mt-0.5 block">
                {requisition.targetSectorName || requisition.sectorName}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">Responsável / Liberador:</span>
              <span className="font-medium text-slate-900 mt-0.5 block">
                {requisition.responsibleName}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">Requisitante / Recebedor:</span>
              <span className="font-medium text-slate-900 mt-0.5 block">
                {requisition.requesterName || 'Não especificado'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">Documento de Referência:</span>
              <span className="font-mono text-slate-900 mt-0.5 block">
                {requisition.documentNumber || 'S/N'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">Responsável Técnico:</span>
              <span className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-600" />
                Pedro H. S. Alves
              </span>
            </div>
          </div>

          {/* Table of Items */}
          <div className="mb-6">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Especificação dos Materiais Movimentados
            </h2>
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-300">
                <tr>
                  <th className="py-2 px-3 font-bold">Item</th>
                  <th className="py-2 px-3 font-bold">Código SKU</th>
                  <th className="py-2 px-3 font-bold">Descrição do Material</th>
                  <th className="py-2 px-3 font-bold text-center">Unid.</th>
                  <th className="py-2 px-3 font-bold text-right">Qtd. Liberada</th>
                  <th className="py-2 px-3 font-bold text-right">Valor Unit.</th>
                  <th className="py-2 px-3 font-bold text-right">Total (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2.5 px-3 font-mono">01</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{requisition.materialSku}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">
                    {requisition.materialName}
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold">{requisition.materialUnit}</td>
                  <td className="py-2.5 px-3 text-right font-black text-slate-950 text-sm">
                    {requisition.quantity}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700">
                    R$ {requisition.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    R$ {requisition.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-bold">
                <tr>
                  <td colSpan={4} className="py-2 px-3 text-right text-slate-700">
                    Total Geral da Requisição:
                  </td>
                  <td className="py-2 px-3 text-right text-slate-950 font-black">
                    {requisition.quantity} {requisition.materialUnit}
                  </td>
                  <td className="py-2 px-3"></td>
                  <td className="py-2 px-3 text-right text-slate-950 font-black text-sm">
                    R$ {requisition.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Observations */}
          {requisition.notes && (
            <div className="mb-6 p-3 bg-amber-50/70 border border-amber-200 rounded text-xs">
              <span className="font-bold text-amber-950 block mb-0.5">Observações / Justificativa Operacional:</span>
              <p className="text-slate-800">{requisition.notes}</p>
            </div>
          )}

          {/* Terms & Legal disclaimer */}
          <div className="text-[10px] text-slate-600 mb-8 p-2.5 border border-slate-200 rounded bg-slate-50 leading-relaxed">
            <strong>Termo de Responsabilidade:</strong> Declaro para os devidos fins que conferi e recebi integralmente o(s) material(is) discriminado(s) nesta requisição, assumindo inteira responsabilidade por sua guarda, manuseio e correta aplicação no setor competente, em conformidade com as normas internas de segurança e governança de estoques da empresa.
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-10 pt-4 border-t border-slate-300 text-center">
            <div>
              <div className="h-12 border-b border-slate-400 flex items-end justify-center pb-1">
                <span className="font-serif italic text-xs text-slate-700">{requisition.responsibleName}</span>
              </div>
              <p className="text-xs font-bold text-slate-900 mt-1">
                {requisition.responsibleName}
              </p>
              <p className="text-[10px] text-slate-500">
                Almoxarife / Liberador do Material
              </p>
              <p className="text-[9px] text-slate-400 mt-0.5">
                Data: ____/____/2026
              </p>
            </div>

            <div>
              <div className="h-12 border-b border-slate-400 flex items-end justify-center pb-1">
                <span className="font-serif italic text-xs text-slate-700">
                  {requisition.requesterName || 'Assinatura'}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 mt-1">
                {requisition.requesterName || 'Requisitante / Recebedor'}
              </p>
              <p className="text-[10px] text-slate-500">
                Matrícula / Cargo / Carimbo
              </p>
              <p className="text-[9px] text-slate-400 mt-0.5">
                Data: ____/____/2026
              </p>
            </div>
          </div>

          {/* Footer watermark & technical compliance */}
          <div className="mt-8 pt-3 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400">
            <span>Sistema Integrado de Gestão de Estoques • Protocolo Autenticado Digitalmente</span>
            <span>Responsável Técnico: Pedro H. S. Alves</span>
          </div>
        </div>
      </div>
    </div>
  );
}
