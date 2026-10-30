import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  MessageCircle,
  Copy,
  Check,
  Share2,
  X,
  ExternalLink,
  ShieldCheck,
  Printer,
  Sparkles,
  Award,
} from 'lucide-react';
import {
  BetRecord,
  RAFFLE_CONFIG,
  formatCurrencyBRL,
  cleanPhoneNumber,
  buildApostadorConfirmationMessage,
  buildOrganizerNotificationMessage,
} from '../types/raffle';
import { schoolSoundtrack } from '../utils/audio';

interface BetSummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bet: BetRecord | null;
}

export const BetSummaryDialog: React.FC<BetSummaryDialogProps> = ({
  isOpen,
  onClose,
  bet,
}) => {
  const [copiedApostador, setCopiedApostador] = useState(false);
  const [copiedOrganizer, setCopiedOrganizer] = useState(false);
  const [copiedAuthCode, setCopiedAuthCode] = useState(false);

  useEffect(() => {
    if (isOpen && bet) {
      // Play festive celebration sound
      schoolSoundtrack.playCelebrationChime();

      // Launch cheerful confetti celebration
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.55 },
          colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'],
        });

        const timer = setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 60,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 60,
            origin: { x: 1 },
          });
        }, 350);

        return () => clearTimeout(timer);
      } catch {
        // ignore
      }
    }
  }, [isOpen, bet]);

  if (!isOpen || !bet) return null;

  const apostadorMessage = buildApostadorConfirmationMessage(bet.numbers, bet.totalAmount);
  const organizerMessage = buildOrganizerNotificationMessage(
    bet.name,
    bet.phone,
    bet.numbers,
    bet.totalAmount
  );

  const apostadorCleanPhone = cleanPhoneNumber(bet.phone);
  const apostadorWaLink = `https://wa.me/${apostadorCleanPhone}?text=${encodeURIComponent(apostadorMessage)}`;
  const organizerWaLink = `https://wa.me/${RAFFLE_CONFIG.organizerPhone}?text=${encodeURIComponent(organizerMessage)}`;

  const sortedNumbers = [...bet.numbers].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  const handleCopyApostador = () => {
    navigator.clipboard.writeText(apostadorMessage);
    setCopiedApostador(true);
    setTimeout(() => setCopiedApostador(false), 2500);
  };

  const handleCopyOrganizer = () => {
    navigator.clipboard.writeText(organizerMessage);
    setCopiedOrganizer(true);
    setTimeout(() => setCopiedOrganizer(false), 2500);
  };

  const handleCopyAuth = () => {
    if (bet.banking?.authenticationCode) {
      navigator.clipboard.writeText(bet.banking.authenticationCode);
      setCopiedAuthCode(true);
      setTimeout(() => setCopiedAuthCode(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = bet.banking?.confirmedAt
    ? new Date(bet.banking.confirmedAt).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'medium',
      })
    : new Date(bet.paidAt).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'medium',
      });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bet-summary-title"
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border-2 border-emerald-400 overflow-hidden my-6 print:border-none print:shadow-none print:my-0 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header - Resumo da Aposta */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-700 p-5 sm:p-6 text-white text-center relative print:bg-white print:text-black">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer print:hidden"
            aria-label="Fechar Resumo da Aposta"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/70 border border-emerald-400/40 text-[11px] font-bold uppercase tracking-wider text-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Participação Registrada • Formatura da Luna</span>
          </div>

          <h2 id="bet-summary-title" className="text-2xl sm:text-3xl font-black font-display tracking-tight">
            RESUMO DA APOSTA
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1">
            Bilhete Oficial de Participação • Rifa Formatura da Luna
          </p>
        </div>

        {/* Receipt Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Card: Status da Participação */}
          <div className="bg-emerald-50/90 border border-emerald-300 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-emerald-900 uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Participação Confirmada na Rifa</span>
              </span>
              <span className="text-[11px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                Status: CONFIRMADO
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 text-slate-700">
              <div>
                <span className="text-slate-500 block text-[11px]">Data e Hora do Registro:</span>
                <span className="font-bold text-slate-900">{formattedDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Chave PIX da Rifa:</span>
                <span className="font-bold text-slate-900 truncate block">
                  {RAFFLE_CONFIG.pixKey} ({RAFFLE_CONFIG.pixKeyType})
                </span>
              </div>
              {bet.banking?.endToEndId && (
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block text-[11px]">ID da Transação:</span>
                  <span className="font-mono text-[11px] font-semibold text-slate-800 break-all bg-white px-2 py-1 rounded border border-emerald-200 block">
                    {bet.banking.endToEndId}
                  </span>
                </div>
              )}
              {bet.banking?.authenticationCode && (
                <div className="sm:col-span-2 flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-emerald-200">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Autenticação:</span>
                    <span className="font-mono text-xs font-bold text-emerald-950">
                      {bet.banking.authenticationCode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyAuth}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedAuthCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAuthCode ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Apostador & Bet Specs Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 uppercase font-semibold text-[10px] block">Nome do Apostador</span>
                <span className="text-sm font-extrabold text-slate-900 block">{bet.name}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-semibold text-[10px] block">WhatsApp do Apostador</span>
                <span className="text-sm font-extrabold text-slate-900 block">{bet.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-semibold text-[10px] block">Data do Sorteio</span>
                <span className="text-sm font-extrabold text-emerald-800 block">{RAFFLE_CONFIG.drawDate}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-semibold text-[10px] block">Prêmio</span>
                <span className="text-sm font-extrabold text-amber-700 block flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Kit Churrasco</span>
                </span>
              </div>
            </div>

            {/* Chosen Numbers Display with Lock notification */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                  Números Escolhidos e Pagos ({sortedNumbers.length}):
                </span>
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  Bloqueados com "X" no painel
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sortedNumbers.map((num) => (
                  <span
                    key={num}
                    className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-black font-display text-sm flex items-center justify-center shadow-xs border border-emerald-500"
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>

            {/* Total Paid */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Valor Total Pago:</span>
              <span className="text-xl font-black text-emerald-800 font-display">
                {formatCurrencyBRL(bet.totalAmount)}
              </span>
            </div>
          </div>

          {/* Bloco 1: Mensagem Oficial gerada para o Apostador */}
          <div className="bg-amber-50/90 rounded-2xl p-4 border border-amber-300 space-y-2.5">
            <div className="text-[11px] font-bold text-amber-950 uppercase tracking-wider flex items-center justify-between">
              <span>Mensagem Oficial gerada para o Apostador</span>
              <span className="text-emerald-700 font-extrabold text-xs">Pronto para Enviar</span>
            </div>

            <pre className="text-xs font-sans whitespace-pre-wrap text-slate-900 bg-white/95 p-3.5 rounded-xl border border-amber-200 leading-relaxed font-semibold">
              {apostadorMessage}
            </pre>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href={apostadorWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Abrir no meu WhatsApp ({bet.phone})</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <button
                type="button"
                onClick={handleCopyApostador}
                title="Copiar mensagem do comprovante"
                className="py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedApostador ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Mensagem</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bloco 2: Notificação para o Dono da Rifa (71) 99158-1015 */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Notificação para o Dono da Rifa ({RAFFLE_CONFIG.organizerPhoneDisplay}):</span>
            </div>

            <pre className="text-xs font-sans whitespace-pre-wrap text-slate-800 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed font-semibold">
              {organizerMessage}
            </pre>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href={organizerWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Reenviar Notificação para o Dono da Rifa</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <button
                type="button"
                onClick={handleCopyOrganizer}
                title="Copiar notificação da organizadora"
                className="py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedOrganizer ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Notificação</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="flex-1 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer text-center"
            >
              Ver Painel com Números Marcados com "X"
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
