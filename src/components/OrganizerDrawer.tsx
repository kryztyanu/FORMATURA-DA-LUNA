import React, { useState } from 'react';
import { X, Users, DollarSign, Phone, Calendar, Trash2, Download, MessageSquare, Check, RefreshCw } from 'lucide-react';
import { BetRecord, RAFFLE_CONFIG, formatCurrencyBRL, buildOrganizerNotificationMessage } from '../types/raffle';

interface OrganizerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bets: BetRecord[];
  onClearAll: () => void;
  onResetToDemo: () => void;
}

export const OrganizerDrawer: React.FC<OrganizerDrawerProps> = ({
  isOpen,
  onClose,
  bets,
  onClearAll,
  onResetToDemo,
}) => {
  const [filter, setFilter] = useState('');

  if (!isOpen) return null;

  const totalCollected = bets.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalNumbersSold = bets.reduce((sum, b) => sum + b.numbers.length, 0);

  const filteredBets = bets.filter((b) =>
    b.name.toLowerCase().includes(filter.toLowerCase()) ||
    b.phone.includes(filter) ||
    b.numbers.some((n) => n.includes(filter))
  );

  const handleExportCSV = () => {
    const header = 'ID,Nome,WhatsApp,Numeros,Valor,Data\n';
    const rows = bets.map((b) =>
      `"${b.id}","${b.name}","${b.phone}","${b.numbers.join(' - ')}","${b.totalAmount}","${b.paidAt}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rifa_luna_apostas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="organizer-drawer-title"
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Gestão &amp; Armazenamento das Apostas
            </div>
            <h3 id="organizer-drawer-title" className="text-xl font-bold font-display">
              Painel da Organizadora ({RAFFLE_CONFIG.organizerPhoneDisplay})
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border-b border-slate-200 shrink-0 text-center">
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Total Arrecadado</div>
            <div className="text-lg font-black text-emerald-700 font-display">
              {formatCurrencyBRL(totalCollected)}
            </div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Números Vendidos</div>
            <div className="text-lg font-black text-slate-900 font-display">
              {totalNumbersSold} / 100
            </div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Apostadores</div>
            <div className="text-lg font-black text-amber-700 font-display">
              {bets.length}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <input
            type="text"
            placeholder="Filtrar por nome, WhatsApp ou número..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-100 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 w-full sm:w-64"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              type="button"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={onResetToDemo}
              type="button"
              title="Restaurar apostas demonstrativas da família"
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClearAll}
              type="button"
              title="Limpar todas as apostas"
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bets List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filteredBets.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Nenhuma aposta encontrada no armazenamento.
            </div>
          ) : (
            filteredBets.map((b) => {
              const organizerMsg = buildOrganizerNotificationMessage(
                b.name,
                b.phone,
                b.numbers
              );
              const notifyWaLink = `https://api.whatsapp.com/send?phone=${RAFFLE_CONFIG.organizerPhone}&text=${encodeURIComponent(organizerMsg)}`;

              return (
                <div
                  key={b.id}
                  className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{b.name}</span>
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {b.phone}
                      </span>
                    </div>
                    <div className="text-emerald-800 font-semibold flex items-center gap-1.5">
                      <span>Números ({b.numbers.length}):</span>
                      <span className="font-mono font-bold">{b.numbers.join(', ')}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Registrado em: {new Date(b.paidAt).toLocaleString('pt-BR')}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Total</div>
                      <div className="font-extrabold text-slate-900 font-display">
                        {formatCurrencyBRL(b.totalAmount)}
                      </div>
                    </div>

                    <a
                      href={notifyWaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors"
                      title="Enviar notificação oficial desta aposta para o WhatsApp (71) 99695-3785"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Reenviar WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition-colors"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
};
