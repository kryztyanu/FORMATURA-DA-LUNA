import React, { useState } from 'react';
import { Sparkles, RefreshCw, Check, X as LucideX, Info, Flame, Search } from 'lucide-react';
import { generateNumbersList, RAFFLE_CONFIG, formatCurrencyBRL } from '../types/raffle';
import { schoolSoundtrack } from '../utils/audio';

interface NumbersGridProps {
  selectedNumbers: string[];
  paidNumbersMap: Map<string, { name: string; phone: string }>;
  onToggleNumber: (num: string) => void;
  onClearSelection: () => void;
  onSelectRandom: (count: number) => void;
}

export const NumbersGrid: React.FC<NumbersGridProps> = ({
  selectedNumbers,
  paidNumbersMap,
  onToggleNumber,
  onClearSelection,
  onSelectRandom,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const allNumbers = generateNumbersList(); // "00" to "99"

  const handleNumberClick = (num: string) => {
    if (paidNumbersMap.has(num)) {
      // Inaccessible
      return;
    }
    const isCurrentlySelected = selectedNumbers.includes(num);
    schoolSoundtrack.playClickSound(!isCurrentlySelected);
    onToggleNumber(num);
  };

  const filteredNumbers = searchTerm.trim() === ''
    ? allNumbers
    : allNumbers.filter(n => n.includes(searchTerm.trim()));

  return (
    <div id="painel-numeros" className="w-full bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-amber-200/80 school-border-sketch">
      {/* Header and Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
            <span>100 Números Sequenciais</span>
            <span className="text-slate-400">·</span>
            <span>Do 00 ao 99</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display mt-1">
            Escolha Seus Números da Sorte
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Clique em um ou mais botões verdes para escolher seus números para o sorteio.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-2xl border border-slate-200/70">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-md bg-emerald-500 border border-emerald-600 shadow-xs inline-block"></span>
            <span className="font-semibold text-slate-700">Verde:</span>
            <span className="text-slate-600">Disponível</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-md bg-emerald-950 border border-emerald-500 shadow-xs inline-block"></span>
            <span className="font-semibold text-slate-700">Verde Escura:</span>
            <span className="text-emerald-800 font-medium">Escolhido</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-md bg-slate-200 border border-slate-300 relative inline-flex items-center justify-center text-rose-600 font-black text-[10px]">
              ✕
            </span>
            <span className="font-semibold text-slate-700">Com "X":</span>
            <span className="text-slate-500">Inacessível (Pago)</span>
          </div>
        </div>
      </div>

      {/* Action shortcuts & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 my-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onSelectRandom(1)}
            type="button"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>+1 Aleatório</span>
          </button>
          <button
            onClick={() => onSelectRandom(3)}
            type="button"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors flex items-center gap-1"
          >
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>+3 da Sorte</span>
          </button>

          {selectedNumbers.length > 0 && (
            <button
              onClick={onClearSelection}
              type="button"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors flex items-center gap-1"
            >
              <LucideX className="w-3.5 h-3.5" />
              <span>Limpar ({selectedNumbers.length})</span>
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar número (ex: 07, 77)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.replace(/\D/g, '').slice(0, 2))}
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44"
          />
        </div>
      </div>

      {/* Live Selection Summary banner */}
      {selectedNumbers.length > 0 ? (
        <div className="mb-4 p-3 bg-emerald-950 text-emerald-100 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md border-2 border-emerald-400">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs">
              {selectedNumbers.length}
            </span>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wide">
                Você escolheu {selectedNumbers.length} {selectedNumbers.length === 1 ? 'número' : 'números'} (Verde Escura):
              </div>
              <div className="text-sm font-extrabold text-emerald-300 tracking-wider">
                {selectedNumbers.join(', ')}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-emerald-300 uppercase">Subtotal a pagar:</div>
            <div className="text-base sm:text-lg font-black text-white font-display">
              {formatCurrencyBRL(selectedNumbers.length * RAFFLE_CONFIG.pricePerNumber)}
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Nenhum número selecionado ainda. Clique nos botões <strong>VERDES</strong> abaixo para escolher seus números da sorte!</span>
        </div>
      )}

      {/* 100 Sequential Numbers Grid (00 to 99) */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-2.5 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80">
        {filteredNumbers.map((num) => {
          const isPaid = paidNumbersMap.has(num);
          const isSelected = selectedNumbers.includes(num);
          const paidInfo = paidNumbersMap.get(num);

          if (isPaid) {
            // INACESSÍVEL / PAGO (Stylized X marking as requested)
            return (
              <button
                key={num}
                type="button"
                disabled
                title={`Número ${num} já escolhido e pago por ${paidInfo?.name || 'outro apostador'}`}
                className="relative h-12 sm:h-14 rounded-xl bg-slate-200/90 text-slate-400 border border-slate-300 cursor-not-allowed select-none flex flex-col items-center justify-center overflow-hidden transition-all shadow-inner"
              >
                {/* Stylized prominent X */}
                <span className="absolute inset-0 flex items-center justify-center text-rose-600 font-black text-2xl sm:text-3xl opacity-85 select-none pointer-events-none drop-shadow-xs rotate-6">
                  ✕
                </span>
                {/* Number beneath X */}
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 line-through decoration-rose-500/80 decoration-2">
                  {num}
                </span>
                <span className="text-[9px] font-medium text-rose-700 tracking-tighter uppercase mt-0.5">
                  Pago
                </span>
              </button>
            );
          }

          if (isSelected) {
            // VERDE ESCURA (Selected by current user as requested)
            return (
              <button
                key={num}
                type="button"
                onClick={() => handleNumberClick(num)}
                title={`Número ${num} selecionado por você. Clique para desmarcar.`}
                className="relative h-12 sm:h-14 rounded-xl bg-emerald-950 text-emerald-100 hover:bg-emerald-900 border-2 border-emerald-400 shadow-md ring-2 ring-emerald-300/80 font-extrabold flex flex-col items-center justify-center transition-all cursor-pointer scale-105 z-10"
              >
                <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 flex items-center justify-center">
                  <Check className="w-2 h-2 text-emerald-950 stroke-[3]" />
                </div>
                <span className="text-base sm:text-lg font-black tracking-tight font-display text-white">
                  {num}
                </span>
                <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-tighter">
                  Escolhido
                </span>
              </button>
            );
          }

          // VERDE (Available as requested)
          return (
            <button
              key={num}
              type="button"
              onClick={() => handleNumberClick(num)}
              title={`Número ${num} disponível! Clique para escolher.`}
              className="relative h-12 sm:h-14 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 active:scale-95 text-white border border-emerald-400 shadow-sm hover:shadow-md font-bold flex flex-col items-center justify-center transition-all cursor-pointer"
            >
              <span className="text-base sm:text-lg font-black tracking-tight font-display text-white drop-shadow-2xs">
                {num}
              </span>
              <span className="text-[9px] font-semibold text-emerald-100 uppercase tracking-tighter">
                Livre
              </span>
            </button>
          );
        })}
      </div>

      {filteredNumbers.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          Nenhum número encontrado para a busca "{searchTerm}".
        </div>
      )}
    </div>
  );
};
