import React from 'react';
import { generateNumbersList } from '../types/raffle';
import { schoolSoundtrack } from '../utils/audio';

interface NumbersGridProps {
  selectedNumbers: string[];
  paidNumbersMap?: Map<string, { name: string; phone: string }>;
  onToggleNumber: (num: string) => void;
}

export const NumbersGrid: React.FC<NumbersGridProps> = ({
  selectedNumbers,
  onToggleNumber,
}) => {
  const allNumbers = generateNumbersList(); // 100 sequential numbers from "00" to "99"

  const handleNumberClick = (num: string) => {
    const isCurrentlySelected = selectedNumbers.includes(num);
    schoolSoundtrack.playClickSound(!isCurrentlySelected);
    onToggleNumber(num);
  };

  return (
    <div id="painel-numeros" className="w-full max-w-3xl mx-auto px-2">
      {/* Visual & Accessibility header info */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className="text-xs font-bold text-slate-700 tracking-wide">
          Escolha seus números da sorte (00 a 99):
        </span>
        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
          100 números acessíveis
        </span>
      </div>

      {/* 100 sequential number buttons from 00 to 99 - ALL 100% ACCESSIBLE */}
      <div
        role="group"
        aria-label="Tabela de números da rifa de 00 a 99"
        className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-2.5 p-3 sm:p-4 bg-white/95 backdrop-blur-sm rounded-3xl border border-amber-200/90 shadow-xl"
      >
        {allNumbers.map((num) => {
          const isSelected = selectedNumbers.includes(num);

          if (isSelected) {
            // NÚMERO SELECIONADO: Verde escuro com destaque vibrante, totalmente acessível
            return (
              <button
                key={num}
                type="button"
                onClick={() => handleNumberClick(num)}
                aria-pressed="true"
                aria-label={`Número ${num}, selecionado. Clique para desmarcar.`}
                className="relative h-12 sm:h-14 rounded-2xl bg-emerald-950 text-white hover:bg-emerald-900 border-2 border-emerald-400 shadow-md ring-2 ring-emerald-300 font-black text-base sm:text-lg font-display flex items-center justify-center transition-all cursor-pointer scale-105 z-10 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
              >
                <span>{num}</span>
              </button>
            );
          }

          // NÚMERO DISPONÍVEL / ACESSÍVEL: Verde vibrante, clicável e acessível por teclado, toque ou leitor de tela
          return (
            <button
              key={num}
              type="button"
              onClick={() => handleNumberClick(num)}
              aria-pressed="false"
              aria-label={`Número ${num}, disponível para escolha. Clique para selecionar.`}
              className="relative h-12 sm:h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 active:scale-95 text-white border border-emerald-400 shadow-sm hover:shadow-md font-black text-base sm:text-lg font-display flex items-center justify-center transition-all cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
            >
              <span className="drop-shadow-2xs">{num}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
