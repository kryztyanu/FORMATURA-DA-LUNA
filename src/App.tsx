/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Users } from 'lucide-react';
import { PosterArt } from './components/PosterArt';
import { NumbersGrid } from './components/NumbersGrid';
import { StickyFooter } from './components/StickyFooter';
import { PaymentDialog } from './components/PaymentDialog';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { SoundtrackBar } from './components/SoundtrackBar';
import { OrganizerDrawer } from './components/OrganizerDrawer';
import { BetRecord, RAFFLE_CONFIG } from './types/raffle';

const STORAGE_KEY = 'luna_formatura_rifa_bets_v1';

// Initial realistic demo bets so the stylized "X" is immediately visible on first load
const INITIAL_DEMO_BETS: BetRecord[] = [
  {
    id: 'bet-init-01',
    name: 'Tia Márcia Silveira',
    phone: '(71) 99123-4567',
    numbers: ['07', '21'],
    totalAmount: 20.0,
    paidAt: '2026-10-28T14:30:00Z',
  },
  {
    id: 'bet-init-02',
    name: 'Vovô Carlos Eduardo',
    phone: '(71) 98877-6655',
    numbers: ['10', '15', '29'],
    totalAmount: 30.0,
    paidAt: '2026-10-28T18:15:00Z',
  },
  {
    id: 'bet-init-03',
    name: 'Profª Helena (Tia da Escola)',
    phone: '(71) 99654-3210',
    numbers: ['33', '77'],
    totalAmount: 20.0,
    paidAt: '2026-10-29T10:05:00Z',
  },
  {
    id: 'bet-init-04',
    name: 'Dinda Carol',
    phone: '(71) 99234-5678',
    numbers: ['00', '99'],
    totalAmount: 20.0,
    paidAt: '2026-10-29T12:40:00Z',
  },
];

export default function App() {
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [bets, setBets] = useState<BetRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved bets', e);
    }
    return INITIAL_DEMO_BETS;
  });

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isOrganizerOpen, setIsOrganizerOpen] = useState(false);
  const [lastConfirmedBet, setLastConfirmedBet] = useState<BetRecord | null>(null);

  // Sync bets to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bets));
    } catch (e) {
      console.error('Failed to save bets', e);
    }
  }, [bets]);

  // Fast map of paid numbers -> apostador info
  const paidNumbersMap = useMemo(() => {
    const map = new Map<string, { name: string; phone: string }>();
    bets.forEach((bet) => {
      bet.numbers.forEach((num) => {
        map.set(num, { name: bet.name, phone: bet.phone });
      });
    });
    return map;
  }, [bets]);

  const availableNumbersCount = 100 - paidNumbersMap.size;

  // Toggle selection for a single number button
  const handleToggleNumber = (num: string) => {
    if (paidNumbersMap.has(num)) return; // Inaccessible
    setSelectedNumbers((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const handleScrollToNumbers = () => {
    const el = document.getElementById('painel-numeros');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenPayment = () => {
    if (selectedNumbers.length === 0) {
      handleScrollToNumbers();
      return;
    }
    setIsPaymentOpen(true);
  };

  // Confirmation of payment
  const handleConfirmPayment = (name: string, phone: string) => {
    const totalAmount = selectedNumbers.length * RAFFLE_CONFIG.pricePerNumber;
    const newBet: BetRecord = {
      id: `bet-${Date.now()}`,
      name,
      phone,
      numbers: [...selectedNumbers],
      totalAmount,
      paidAt: new Date().toISOString(),
    };

    // Save bet and clear user selection
    setBets((prev) => [newBet, ...prev]);
    setLastConfirmedBet(newBet);
    setSelectedNumbers([]);
    setIsPaymentOpen(false);
    setIsConfirmationOpen(true);
  };

  const handleClearAllBets = () => {
    if (window.confirm('Tem certeza de que deseja limpar todas as apostas salvas?')) {
      setBets([]);
      setSelectedNumbers([]);
    }
  };

  const handleResetToDemo = () => {
    setBets(INITIAL_DEMO_BETS);
    setSelectedNumbers([]);
  };

  return (
    <div className="min-h-screen bg-notebook-pattern pb-28 text-slate-800">
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-amber-200/80 px-4 sm:px-8 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="/"
            className="text-lg sm:text-xl font-extrabold tracking-tight text-amber-950 font-display whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span>Formatura da Luna</span>
            <span className="text-amber-500 text-xs hidden sm:inline-block">🎓 9 Anos</span>
          </a>

          {/* Zone 2: Concise navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#arte-rifa" className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0">
              Arte da Rifa
            </a>
            <a href="#painel-numeros" className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0">
              Escolher Números ({availableNumbersCount})
            </a>
            <a href="#premio" className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0">
              Kit Churrasco
            </a>
            <a href="#regulamento" className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0">
              Sorteio 29/11/2026
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsOrganizerOpen(true)}
              type="button"
              className="px-3.5 py-1.5 text-xs font-bold text-slate-800 bg-amber-100 hover:bg-amber-200 rounded-xl border border-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-amber-700" />
              <span>Painel Gestão ({paidNumbersMap.size}/100)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
        {/* Background School Soundtrack Player */}
        <SoundtrackBar />

        {/* Section 1: Official Raffle Poster (9,144cm x 16,256cm / 9:16) */}
        <section id="arte-rifa" className="w-full flex justify-center">
          <PosterArt onChooseNumbersClick={handleScrollToNumbers} />
        </section>

        {/* Section 2: Sequential Numbers Panel (100 buttons: 00 to 99 ONLY) */}
        <section className="w-full pt-2">
          <NumbersGrid
            selectedNumbers={selectedNumbers}
            paidNumbersMap={paidNumbersMap}
            onToggleNumber={handleToggleNumber}
          />
        </section>
      </main>

      {/* Sticky Bottom Footer with PAGAR Button */}
      <StickyFooter
        selectedNumbers={selectedNumbers}
        onOpenPaymentDialog={handleOpenPayment}
        onScrollToNumbers={handleScrollToNumbers}
      />

      {/* Payment Dialog */}
      <PaymentDialog
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        selectedNumbers={selectedNumbers}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* Confirmation Dialog after payment */}
      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        bet={lastConfirmedBet}
      />

      {/* Organizer Drawer / Storage Management */}
      <OrganizerDrawer
        isOpen={isOrganizerOpen}
        onClose={() => setIsOrganizerOpen(false)}
        bets={bets}
        onClearAll={handleClearAllBets}
        onResetToDemo={handleResetToDemo}
      />
    </div>
  );
}
