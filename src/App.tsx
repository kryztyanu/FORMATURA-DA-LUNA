/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { PosterArt } from './components/PosterArt';
import { NumbersGrid } from './components/NumbersGrid';
import { StickyFooter } from './components/StickyFooter';
import { PaymentDialog } from './components/PaymentDialog';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { BetRecord, RAFFLE_CONFIG } from './types/raffle';
import { schoolSoundtrack } from './utils/audio';

const STORAGE_KEY = 'luna_formatura_rifa_bets_v1';

// All 100 buttons start 100% available/eligible, getting an 'X' only when chosen and paid
const INITIAL_BETS: BetRecord[] = [];

export default function App() {
  // Screen state: 'poster' (first screen) or 'numbers' (second screen, shown only after clicking ESCOLHER NUMEROS)
  const [currentScreen, setCurrentScreen] = useState<'poster' | 'numbers'>('poster');

  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [bets, setBets] = useState<BetRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // If previous mock bets were stored, filter them out so only genuine user bets exist
          return parsed.filter((b: BetRecord) => !b.id.startsWith('bet-init-'));
        }
      }
    } catch (e) {
      console.error('Failed to load saved bets', e);
    }
    return INITIAL_BETS;
  });

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [lastConfirmedBet, setLastConfirmedBet] = useState<BetRecord | null>(null);

  // Automatic audio start on app launch (volume 30%) with user gesture fallback for browser policy
  const audioStartedRef = useRef(false);

  useEffect(() => {
    const tryAutoplay = async () => {
      if (audioStartedRef.current) return;
      schoolSoundtrack.setVolume(0.3); // Exactly 30% volume
      const success = await schoolSoundtrack.start();
      if (success) {
        audioStartedRef.current = true;
      }
    };

    tryAutoplay();

    // Browser autoplay policy handler: starts seamlessly on the first tap/click if blocked initially
    const handleFirstGesture = async () => {
      if (!audioStartedRef.current) {
        schoolSoundtrack.setVolume(0.3);
        const ok = await schoolSoundtrack.start();
        if (ok) audioStartedRef.current = true;
      }
    };

    window.addEventListener('click', handleFirstGesture, { passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { passive: true });
    window.addEventListener('keydown', handleFirstGesture, { passive: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, []);

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

  // Toggle selection for a single number button
  const handleToggleNumber = (num: string) => {
    if (paidNumbersMap.has(num)) return; // Inaccessible
    setSelectedNumbers((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  // Called when user clicks "ESCOLHER NUMEROS" on the first screen
  const handleChooseNumbers = () => {
    // Ensure music is playing if it was waiting on gesture
    if (!audioStartedRef.current) {
      schoolSoundtrack.start();
      audioStartedRef.current = true;
    }
    setCurrentScreen('numbers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToPoster = () => {
    setCurrentScreen('poster');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPayment = () => {
    if (selectedNumbers.length === 0) return;
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

    setBets((prev) => [newBet, ...prev]);
    setLastConfirmedBet(newBet);
    setSelectedNumbers([]);
    setIsPaymentOpen(false);
    setIsConfirmationOpen(true);
  };

  return (
    <div className="min-h-screen bg-notebook-pattern pb-28 text-slate-800 flex flex-col items-center justify-start p-3 sm:p-5">
      {/* SCREEN 1: First screen showing only the authentic raffle art */}
      {currentScreen === 'poster' && (
        <main className="w-full max-w-md mx-auto flex flex-col items-center justify-center my-auto">
          <PosterArt onChooseNumbersClick={handleChooseNumbers} />
        </main>
      )}

      {/* SCREEN 2: Second screen showing ONLY the 100 number buttons for selection */}
      {currentScreen === 'numbers' && (
        <main className="w-full max-w-3xl mx-auto flex flex-col items-center pt-2">
          {/* Subtle back navigation button to return to the poster art if desired */}
          <div className="w-full flex justify-start mb-3 px-2">
            <button
              onClick={handleBackToPoster}
              type="button"
              className="px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-300 shadow-sm text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ver Arte da Rifa</span>
            </button>
          </div>

          {/* Contains ONLY the 100 buttons with their respective numbers (00 to 99) */}
          <NumbersGrid
            selectedNumbers={selectedNumbers}
            paidNumbersMap={paidNumbersMap}
            onToggleNumber={handleToggleNumber}
          />
        </main>
      )}

      {/* Sticky Bottom Footer with PAGAR Button (active on the numbers screen) */}
      {currentScreen === 'numbers' && (
        <StickyFooter
          selectedNumbers={selectedNumbers}
          onOpenPaymentDialog={handleOpenPayment}
          onScrollToNumbers={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />
      )}

      {/* Payment Dialog with NOME, WHATSAPP, PIX 71996953785 and centered ATENÇÃO warning */}
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
    </div>
  );
}
