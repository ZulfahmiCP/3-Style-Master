import React, { useState, useEffect, useCallback } from "react";
import { LetterPair } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, RotateCcw, Award, BookOpen } from "lucide-react";

interface StudyViewProps {
  pairs: LetterPair[];
  onUpdatePair: (id: string, updates: Partial<LetterPair>) => void;
}

const StudyView: React.FC<StudyViewProps> = ({ pairs, onUpdatePair }) => {
  const [activeQueue, setActiveQueue] = useState<LetterPair[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // --- LOGIKA SRS & SHUFFLE (Update) ---
  useEffect(() => {
    const now = Date.now();
    const toStudy = pairs.filter((p) => {
      if (p.status !== "mastered") return true;
      if (p.nextReviewDate && now < p.nextReviewDate) return false;
      return true;
    });

    const shuffled = [...toStudy];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setActiveQueue(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [pairs]);

  const currentPair = activeQueue[currentIndex];

  const handleNext = useCallback((markMastered: boolean) => {
    if (!currentPair) return;

    if (markMastered) {
      const oneDayInMs = 24 * 60 * 60 * 1000;
      onUpdatePair(currentPair.id, { 
        status: "mastered",
        nextReviewDate: Date.now() + oneDayInMs
      });
    } else {
      onUpdatePair(currentPair.id, { 
        status: "learning",
        nextReviewDate: 0 
      });
    }

    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 150);
  }, [currentPair, onUpdatePair]);

  // --- FUNGSI KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Pastikan ada kartu yang aktif
      if (!currentPair || currentIndex >= activeQueue.length) return;

      switch (e.key) {
        case " ": // Space bar
        case "Enter":
          e.preventDefault(); // Mencegah scroll saat tekan space
          setIsFlipped(prev => !prev);
          break;
        case "1":
        case "ArrowLeft":
          if (isFlipped) handleNext(false); // Hanya bisa 'rate' setelah diflip
          break;
        case "2":
        case "ArrowRight":
          if (isFlipped) handleNext(true); // Hanya bisa 'rate' setelah diflip
          break;
      }
    };

    // Tambahkan event listener saat komponen mount
    window.addEventListener("keydown", handleKeyDown);

    // Bersihkan event listener saat komponen unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentPair, currentIndex, activeQueue.length, isFlipped, handleNext]);


  // --- LOGIKA VISUALISASI PROGRES ---
  const totalInQueue = activeQueue.length;
  const completedCount = currentIndex;
  const remainingCount = totalInQueue - completedCount;
  const progressPercentage = totalInQueue > 0 ? (completedCount / totalInQueue) * 100 : 0;

  // Render Selesai
  if (activeQueue.length === 0 || currentIndex >= activeQueue.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
        <Award className="w-20 h-20 text-emerald-400 mb-6" strokeWidth={1} />
        <h2 className="text-3xl font-bold text-zinc-100 mb-3">Sesi Selesai!</h2>
        <p className="text-zinc-400 max-w-md">
          Semua kartu dalam antrean sudah ditinjau. Bagus sekali! Kembali besok untuk kartu yang perlu di-review ulang.
        </p>
      </div>
    );
  }

  return (
    // Menggunakan flex-col dan h-full agar muat dalam view
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100">
      
      {/* 1. Progress Bar Section - Tipis & Padat */}
      <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900 sticky top-0 z-50">
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
          <span>Progres Sesi</span>
          <span>{completedCount} / {totalInQueue}</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* 2. Main Content Area - Memakan sisa ruang */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-6 md:py-10">
        
        {/* Flash Card */}
        <div className="w-full max-w-xl aspect-[3/2] relative perspective-1000 mb-8 md:mb-12">
          <AnimatePresence initial={false} mode="wait">
            {!isFlipped ? (
              // FRONT
              <motion.div
                key="front"
                className="absolute inset-0 bg-zinc-900 border-2 border-zinc-700 rounded-3xl flex flex-col items-center justify-center p-6 cursor-pointer shadow-2xl shadow-black/30"
                initial={{ rotateY: 180, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -180, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                onClick={() => setIsFlipped(true)}
              >
                <div className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-3">LETTER PAIR</div>
                <div className="text-8xl md:text-9xl font-extrabold tracking-tighter text-emerald-400">{currentPair.letters}</div>
                <div className="text-xs text-zinc-600 mt-6">[ Tekan Kartu atau Space untuk Membalik ]</div>
              </motion.div>
            ) : (
              // BACK
              <motion.div
                key="back"
                className="absolute inset-0 bg-zinc-900 border-2 border-emerald-800 rounded-3xl flex flex-col items-center justify-center p-6 cursor-pointer shadow-2xl shadow-emerald-950/20"
                initial={{ rotateY: -180, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 180, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                onClick={() => setIsFlipped(false)}
              >
                <div className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">WORD / ALG</div>
                <div className="text-4xl md:text-5xl font-bold text-zinc-100 mb-5 text-center">{currentPair.word}</div>
                <div className="text-xl md:text-2xl font-mono bg-zinc-800 px-5 py-3 rounded-xl text-emerald-300 break-all text-center">{currentPair.alg}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. Action Buttons - Tidak lagi fixed, berada dalam aliran flex */}
        <AnimatePresence>
          {isFlipped && (
            <motion.div 
              className="w-full max-w-xl grid grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <button 
                onClick={() => handleNext(false)}
                className="group flex flex-col items-center justify-center gap-2 p-5 bg-zinc-900 hover:bg-red-950/30 border border-zinc-700 hover:border-red-800 rounded-2xl transition-all duration-200"
              >
                <X className="w-8 h-8 text-red-500 group-hover:scale-110 transition-transform" />
                <span className="text-zinc-300 font-medium">Still Learning</span>
                <span className="text-xs text-zinc-600">[ Tekan 1 atau ← ]</span>
              </button>
              <button 
                onClick={() => handleNext(true)}
                className="group flex flex-col items-center justify-center gap-2 p-5 bg-zinc-900 hover:bg-emerald-950/30 border border-zinc-700 hover:border-emerald-800 rounded-2xl transition-all duration-200"
              >
                <Check className="w-8 h-8 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="text-zinc-300 font-medium">Mastered</span>
                <span className="text-xs text-zinc-600">[ Tekan 2 atau → ]</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default StudyView;