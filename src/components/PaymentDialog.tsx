import React, { useState, useEffect } from 'react';
import { X, Copy, Check, AlertTriangle, QrCode, Smartphone, User, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { RAFFLE_CONFIG, formatCurrencyBRL, formatPhoneMask } from '../types/raffle';
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
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const totalAmount = selectedNumbers.length * RAFFLE_CONFIG.pricePerNumber;
  const pixPayload = generatePixCopiaECola(
    RAFFLE_CONFIG.pixKey,
    totalAmount,
    'FORMATURA DA LUNA',
    'SALVADOR'
  );

  useEffect(() => {
    if (isOpen) {
      generateQrCodeDataUrl(pixPayload).then((dataUrl) => {
        setQrCodeDataUrl(dataUrl);
      });
    }
  }, [isOpen, pixPayload]);

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
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; phone?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Por favor, digite seu nome completo';
    } else if (name.trim().length < 3) {
      newErrors.name = 'O nome deve ter no mínimo 3 caracteres';
    }

    const digitsOnly = phone.replace(/\D/g, '');
    if (!phone.trim()) {
      newErrors.phone = 'Por favor, digite o seu WhatsApp com DDD';
    } else if (digitsOnly.length < 10) {
      newErrors.phone = 'Número de WhatsApp incompleto (digite DDD + número)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onConfirmPayment(name.trim(), phone.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-dialog-title"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-emerald-300 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-700 p-5 text-white flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
              Finalizar Aposta • Formatura da Luna
            </div>
            <h3 id="payment-dialog-title" className="text-xl sm:text-2xl font-extrabold font-display">
              Pagamento via PIX
            </h3>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
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

          {/* User Fields: EXACT REQUIREMENTS */}
          <div className="space-y-4">
            {/* Campo 1: NOME (Exato como solicitado) */}
            <div>
              <label htmlFor="field-nome" className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1 flex items-center gap-1.5">
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
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border ${
                  errors.name ? 'border-rose-500 bg-rose-50/30 ring-1 ring-rose-500' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                required
              />
              {errors.name && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.name}</p>
              )}
            </div>

            {/* Campo 2: WHATSAPP (Exato como solicitado) */}
            <div>
              <label htmlFor="field-whatsapp" className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1 flex items-center gap-1.5">
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
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border ${
                  errors.phone ? 'border-rose-500 bg-rose-50/30 ring-1 ring-rose-500' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                required
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Você receberá o comprovante oficial com seus números neste WhatsApp.
              </p>
              {errors.phone && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.phone}</p>
              )}
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
                  <div className="font-semibold text-slate-800">Pague direto no seu app bancário:</div>
                  <p className="text-[11px] text-slate-500">
                    Abra o app do seu banco, escolha PIX e aponte a câmera para o QR Code ou cole a chave celular.
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

          {/* EXACT HIGHLIGHTED WARNING MESSAGE REQUIRED BY USER */}
          <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500 text-amber-950 shadow-sm">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <div className="font-black text-sm tracking-wide uppercase text-amber-900 font-display">
                  ATENÇÃO!
                </div>
                <div className="text-xs font-bold leading-relaxed text-amber-950 mt-0.5">
                  Após a confirmação do pagamento, em caso de desistência, o valor pago não será devolvido.
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition-colors cursor-pointer text-center"
            >
              Voltar e Alterar Números
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-[0.98] text-white font-extrabold text-sm sm:text-base font-display tracking-wide uppercase shadow-lg shadow-emerald-700/20 border border-emerald-400 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Confirmar Pagamento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
