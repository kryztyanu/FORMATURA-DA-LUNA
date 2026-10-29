import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, MessageCircle, Copy, Check, Share2, Sparkles, X } from 'lucide-react';
import {
  BetRecord,
  RAFFLE_CONFIG,
  formatCurrencyBRL,
  cleanPhoneNumber,
  buildApostadorConfirmationMessage,
  buildOrganizerNotificationMessage,
} from '../types/raffle';
import { schoolSoundtrack } from '../utils/audio';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bet: BetRecord | null;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  bet,
}) => {
  const [copiedApostador, setCopiedApostador] = useState(false);
  const [copiedOrganizer, setCopiedOrganizer] = useState(false);

  useEffect(() => {
    if (isOpen && bet) {
      // Fire festive celebration chime
      schoolSoundtrack.playCelebrationChime();

      // Launch cheerful confetti bursts
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'],
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 300);

      return () => clearTimeout(timer);
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
  const apostadorWaLink = `https://api.whatsapp.com/send?phone=${apostadorCleanPhone}&text=${encodeURIComponent(apostadorMessage)}`;
  const organizerWaLink = `https://api.whatsapp.com/send?phone=${RAFFLE_CONFIG.organizerPhone}&text=${encodeURIComponent(organizerMessage)}`;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-dialog-title"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-emerald-400 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Celebration Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/50 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 text-white shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>

          <h3 id="confirmation-dialog-title" className="text-2xl font-black font-display tracking-tight">
            Pagamento Confirmado!
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1">
            Parabéns, {bet.name}! Seus números da sorte já foram registrados e estão bloqueados para você.
          </p>
        </div>

        {/* Official Confirmation Card (EXACT CONTENT REQUIRED) */}
        <div className="p-5 sm:p-6 space-y-5">
          <div className="bg-amber-50/80 rounded-2xl p-4 border-2 border-dashed border-amber-300 relative">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-amber-200 text-xs font-bold text-amber-900 uppercase">
              <span>Comprovante Oficial da Rifa</span>
              <span className="text-emerald-700 font-extrabold">Aprovado</span>
            </div>

            <div className="space-y-2 text-sm text-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Evento:</span>
                <span className="font-extrabold text-amber-950 font-display text-base">
                  {RAFFLE_CONFIG.title}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Sorteio:</span>
                <span className="font-bold text-slate-900">
                  {RAFFLE_CONFIG.drawDate}
                </span>
              </div>

              <div className="flex justify-between items-start pt-1 border-t border-amber-100">
                <span className="text-xs font-bold text-slate-500 uppercase mt-0.5">Números Escolhidos:</span>
                <span className="font-black text-emerald-800 text-base font-display text-right max-w-[240px]">
                  {bet.numbers.join(', ')}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-amber-100">
                <span className="text-xs font-bold text-slate-500 uppercase">Valor Pago:</span>
                <span className="font-black text-slate-900 font-display text-lg">
                  {formatCurrencyBRL(bet.totalAmount)}
                </span>
              </div>

              <div className="pt-3 border-t border-amber-200 text-center">
                <p className="font-black text-emerald-700 text-base font-display">
                  Obrigado por participar, BOA SORTE!
                </p>
              </div>
            </div>
          </div>

          {/* Action 1: Apostador WhatsApp */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>1. Enviar Comprovante para o Seu WhatsApp:</span>
              <span className="text-[11px] font-medium text-slate-500">{bet.phone}</span>
            </div>
            <div className="flex gap-2">
              <a
                href={apostadorWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Receber no WhatsApp ({bet.phone})</span>
              </a>
              <button
                type="button"
                onClick={handleCopyApostador}
                title="Copiar mensagem do comprovante"
                className="px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
              >
                {copiedApostador ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copiedApostador ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Action 2: Organizer WhatsApp Notification (EXACT REQUIREMENT (71) 99695-3785) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>2. Notificar Organizadora da Formatura:</span>
              <span className="text-[11px] font-bold text-emerald-800">{RAFFLE_CONFIG.organizerPhoneDisplay}</span>
            </div>
            <div className="flex gap-2">
              <a
                href={organizerWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Enviar para Organizadora ({RAFFLE_CONFIG.organizerPhoneDisplay})</span>
              </a>
              <button
                type="button"
                onClick={handleCopyOrganizer}
                title="Copiar mensagem para a organizadora"
                className="px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
              >
                {copiedOrganizer ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copiedOrganizer ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Notificação contendo seu Nome, WhatsApp, Números Escolhidos e Valor Pago.
            </p>
          </div>

          {/* Close button */}
          <div className="pt-2">
            <button
              onClick={onClose}
              type="button"
              className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors cursor-pointer text-center"
            >
              Concluir e Ver Painel com Números Marcados (X)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
