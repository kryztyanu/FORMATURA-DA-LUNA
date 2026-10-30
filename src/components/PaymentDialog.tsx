import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  AlertTriangle,
  QrCode,
  Smartphone,
  User,
  Send,
  MessageCircle,
} from 'lucide-react';
import {
  RAFFLE_CONFIG,
  formatCurrencyBRL,
  formatPhoneMask,
  buildOrganizerNotificationMessage,
} from '../types/raffle';
import { generatePixCopiaECola, generateQrCodeDataUrl } from '../utils/pix';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNumbers: string[];
  onConfirmPayment: (name: string, phone: string) => void;
}

export const PaymentDialog: React.FC<PaymentDialogProps> = ({
  isOpen,
  onClose,
  selectedNumbers,
  onConfirmPayment,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');

  const totalAmount = selectedNumbers.length * RAFFLE_CONFIG.pricePerNumber;
  const pixPayload = generatePixCopiaECola(
    RAFFLE_CONFIG.pixKey,
    totalAmount,
    'FORMATURA DA LUNA',
    'SALVADOR'
  );

  useEffect(() => {
    if (isOpen && selectedNumbers.length > 0) {
      generateQrCodeDataUrl(pixPayload).then((dataUrl) => {
        setQrCodeDataUrl(dataUrl);
      });
      setErrorMessage('');
    }
  }, [isOpen, selectedNumbers, totalAmount, pixPayload]);

  if (!isOpen) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(RAFFLE_CONFIG.pixKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2500);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = formatPhoneMask(e.target.value);
    setPhone(masked);
    if (errorMessage) setErrorMessage('');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (errorMessage) setErrorMessage('');
  };

  /**
   * Action for "ENVIAR PARA O DONO DA RIFA"
   * Emits summary to WhatsApp (71) 99158-1015 containing:
   * - Nome do Apostador
   * - Whatspp do Apostador
   * - Números escolhidos
   * - Valor Pago
   * And marks the numbers as paid/locked with "X" in the app.
   */
  const handleSendToOwner = () => {
    const cleanName = name.trim();
    const cleanDigits = phone.replace(/\D/g, '');

    if (!cleanName) {
      setErrorMessage('Por favor, informe seu NOME antes de enviar.');
      return;
    }
    if (cleanDigits.length < 10) {
      setErrorMessage('Por favor, informe seu WHATSAPP com DDD.');
      return;
    }

    // Build the official summary message for the raffle owner
    const message = buildOrganizerNotificationMessage(
      cleanName,
      phone,
      selectedNumbers,
      totalAmount
    );

    // Direct WhatsApp URL to the owner: (71) 99158-1015 (5571991581015)
    const waUrl = `https://wa.me/${RAFFLE_CONFIG.organizerPhone}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp in a new tab/window
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // Confirm payment and register bet in the app so numbers are marked with 'X'
    onConfirmPayment(cleanName, phone);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-dialog-title"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-emerald-400 overflow-hidden my-6"
      >
        {/* Header - Notice: removed 'integraçao bancaria...' at top per user specification */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-700 p-5 text-white flex items-center justify-between">
          <div>
            <h3 id="payment-dialog-title" className="text-xl sm:text-2xl font-extrabold font-display">
              Chave PIX e Pagamento
            </h3>
            <p className="text-xs text-emerald-100 font-medium mt-0.5">
              Rifa Formatura da Luna • R$ 10,00 por número
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Summary of chosen numbers */}
          <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-emerald-900 font-semibold">
                Números Escolhidos ({selectedNumbers.length}):
              </div>
              <div className="text-sm font-black text-emerald-950 tracking-wider font-display">
                {selectedNumbers.join(', ')}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-emerald-800 font-medium">Total a pagar:</div>
              <div className="text-lg font-black text-emerald-900 font-display">
                {formatCurrencyBRL(totalAmount)}
              </div>
            </div>
          </div>

          {/* User Fields: NOME and WHATSAPP */}
          <div className="space-y-3">
            <div>
              <label
                htmlFor="field-nome"
                className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1 flex items-center gap-1.5"
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>NOME</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                id="field-nome"
                name="nome"
                type="text"
                placeholder="Ex: Maria Clara dos Santos"
                value={name}
                onChange={handleNameChange}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label
                htmlFor="field-whatsapp"
                className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1 flex items-center gap-1.5"
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>WHATSAPP</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                id="field-whatsapp"
                name="whatsapp"
                type="tel"
                placeholder="Ex: (71) 99999-8888"
                value={phone}
                onChange={handlePhoneChange}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            {errorMessage && (
              <div className="text-xs text-rose-600 font-bold bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-center">
                {errorMessage}
              </div>
            )}

            {/* BOTÃO EXATO SOLICITADO PELO USUÁRIO: "ENVIAR PARA O DONO DA RIFA" */}
            <button
              type="button"
              onClick={handleSendToOwner}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/25 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] uppercase tracking-wide"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>ENVIAR PARA O DONO DA RIFA</span>
              <Send className="w-4 h-4" />
            </button>
            <div className="text-[11px] text-center text-slate-500 font-medium">
              Envia o comprovante para o WhatsApp do Dono: <strong className="text-slate-700 font-semibold">{RAFFLE_CONFIG.organizerPhoneDisplay}</strong>
            </div>
          </div>

          {/* PIX Key Section: EXACT REQUIREMENT 71996953785 with copy option */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>CHAVE PIX:</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                {RAFFLE_CONFIG.pixKeyType}
              </span>
            </div>

            {/* Chave com opção de ser copiada */}
            <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border-2 border-emerald-400">
              <div className="font-mono font-bold text-base sm:text-lg text-slate-900 flex-1 select-all px-1">
                {RAFFLE_CONFIG.pixKey}
              </div>
              <button
                type="button"
                onClick={handleCopyKey}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  copiedKey
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                }`}
              >
                {copiedKey ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Chave PIX</span>
                  </>
                )}
              </button>
            </div>

            {/* QR Code and PIX Copia e Cola */}
            {qrCodeDataUrl && (
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <div className="w-28 h-28 bg-white p-1.5 rounded-xl border border-slate-200 shrink-0 shadow-xs flex items-center justify-center">
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code PIX Formatura da Luna"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-xs text-slate-600 space-y-1.5 text-center sm:text-left">
                  <div className="font-semibold text-slate-800">Pague no seu app bancário:</div>
                  <p className="text-[11px] text-slate-500">
                    Abra o app do seu banco, escolha PIX e utilize a chave acima ou o código Copia e Cola.
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyPayload}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedPayload ? 'Código PIX Copiado!' : 'Copiar Código PIX Copia-e-Cola'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* EXACT HIGHLIGHTED WARNING MESSAGE REQUIRED BY USER - CENTERED */}
          <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500 text-amber-950 shadow-sm text-center">
            <div className="flex flex-col items-center justify-center gap-1.5 text-center">
              <AlertTriangle className="w-5 h-5 text-amber-700 mx-auto" />
              <div className="font-black text-sm tracking-wide uppercase text-amber-900 font-display">
                ATENÇÃO!
              </div>
              <div className="text-xs font-bold leading-relaxed text-amber-950 max-w-sm mx-auto">
                Após a confirmação do pagamento, em caso de desistência, o valor pago não será devolvido.
              </div>
            </div>
          </div>

          {/* Botão voltar centralizado (conforme especificado pelo usuário) */}
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={onClose}
              className="w-full max-w-xs py-2.5 px-6 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer text-center mx-auto"
            >
              Voltar e Alterar Números
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
