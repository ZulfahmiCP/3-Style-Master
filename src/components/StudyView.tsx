import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, RotateCcw, CornerDownRight, Play } from "lucide-react";
import { LetterPair } from "../types";

interface StudyViewProps {
  pairs: LetterPair[];
  onUpdatePair: (id: string, updates: Partial<LetterPair>) => void;
  onNavigateToImport: () => void;
}

// Fungsi untuk menghasilkan warna elegan secara dinamis berdasarkan teks tipe
const getSubtleColorClass = (type?: string) => {
  if (!type) return "";
  const styles = [
    "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    "bg-blue-500/10 border-blue-500/20 text-blue-400",
    "bg-purple-500/10 border-purple-500/20 text-purple-400",
    "bg-amber-500/10 border-amber-500/20 text-amber-400",
    "bg-rose-500/10 border-rose-500/20 text-rose-400",
    "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
  ];
  let hash = 0;
  for (let i = 0; i < type.length; i++) {
    hash = type.charCodeAt(i) + ((hash << 5) - hash);
  }
  return styles[Math.abs(hash) % styles.length];
};

export function StudyView({
  pairs,
  onUpdatePair,
  onNavigateToImport,
}: StudyViewProps) {
  const [activeQueue, setActiveQueue] = useState<LetterPair[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // 1. SRS & Fisher-Yates Shuffle
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

  // 2. useCallback pada handleNext & Logika SRS
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

  // 3. Logika Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentPair || currentIndex >= activeQueue.length) return;

      switch (e.key) {
        case " ":
        case "Enter":
          e.preventDefault();
          if (!isFlipped) setIsFlipped(true);
          break;
        case "1":
        case "ArrowLeft":
          if (isFlipped) handleNext(false);
          break;
        case "2":
        case "ArrowRight":
          if (isFlipped) handleNext(true);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPair, currentIndex, activeQueue.length, isFlipped, handleNext]);

  if (pairs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 md:min-h-[60vh] text-center max-w-md mx-auto space-y-5 animate-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
          <Play className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text-primary">
            No cards to study
          </h2>
          <p className="text-text-muted mt-2 text-sm leading-relaxed">
            Your library is empty. Import your 3 Style spreadsheet to start
            learning.
          </p>
        </div>
        <button
          onClick={onNavigateToImport}
          className="bg-accent hover:bg-accent-active text-[#050505] px-6 py-2.5 rounded-xl font-medium transition-colors"
        >
          Go to Import
        </button>
      </div>
    );
  }

  if (!currentPair) {
    return (
      <div className="flex flex-col items-center justify-between min-h-[60vh] text-center max-w-md mx-auto space-y-6 animate-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text-primary">
            All caught up!
          </h2>
          <p className="text-text-muted mt-2 text-sm leading-relaxed">
            You've studied all non-mastered letter pairs in your currently
            imported data. Reset some pairs in the library or import more to
            continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center h-full pb-40">
      <div className="w-full flex justify-between items-center mb-6 px-4">
        <span className="text-sm font-medium text-text-muted">
          Card {currentIndex + 1} of {activeQueue.length}
        </span>
        <span className="text-xs uppercase tracking-wider text-text-muted bg-bg-surface px-3 py-1 rounded-full">
          {currentPair.status}
        </span>
      </div>

      {/* The Flashcard */}
      <div
        className="relative w-full h-[52vh] md:aspect-[16/10] cursor-pointer perspective-1000 mb-4"
        onClick={() => !isFlipped && setIsFlipped(true)}
      >
        <motion.div
          className="w-full h-full relative preserve-3d"
          animate={{ rotateX: isFlipped ? 180 : 0 }}
          transition={{
            duration: 0.4,
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
        >
          {/* Front */}
          <div
            className={`absolute inset-0 backface-hidden w-full h-full card-gradient rounded-3xl flex flex-col items-center justify-center p-6 md:p-8 shadow-2xl transition-opacity duration-300 ${isFlipped ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            <div className="absolute top-4 left-4 md:top-6 md:left-6 text-xl md:text-2xl font-bold text-white/30 flex items-center gap-2">
              <span className="text-xs font-normal opacity-50 uppercase tracking-widest">
                {currentPair.type || "corner"}
              </span>
            </div>

            {/* LABEL TIPE ALGORITMA - FRONT */}
            {currentPair.algType && (
              <div
                style={
                  currentPair.color
                    ? {
                        backgroundColor: `${currentPair.color}1a`, // 1a = 10% opacity
                        borderColor: `${currentPair.color}33`,     // 33 = 20% opacity
                        color: currentPair.color,
                      }
                    : {}
                }
                className={`absolute top-4 right-4 md:top-6 md:right-6 px-3 py-1 rounded-full border text-[10px] md:text-xs font-medium tracking-wide ${
                  !currentPair.color ? getSubtleColorClass(currentPair.algType) : ""
                }`}
              >
                {currentPair.algType}
              </div>
            )}

            <h1 className="letter-pair-display text-white">
              {currentPair.letters}
            </h1>
            <p className="absolute bottom-6 md:bottom-8 px-6 md:px-8 py-2 bg-white/5 rounded-full border border-white/10 text-xs text-text-muted flex items-center gap-2">
              Tap or Space to reveal <CornerDownRight className="w-4 h-4" />
            </p>
          </div>

          {/* Back */}
          <div
            className={`absolute inset-0 backface-hidden w-full h-full card-gradient rounded-3xl flex flex-col items-center justify-center p-6 md:p-8 shadow-2xl [transform:rotateX(180deg)] transition-opacity duration-300 ${!isFlipped ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            <div className="absolute top-4 left-4 md:top-6 md:left-6 text-xl md:text-2xl font-bold text-white/30 flex items-center gap-2">
              {currentPair.letters}
              <span className="text-xs font-normal opacity-50 uppercase tracking-widest">
                {currentPair.type || "corner"}
              </span>
            </div>

            {/* LABEL TIPE ALGORITMA - BACK */}
            {currentPair.algType && (
              <div
                style={
                  currentPair.color
                    ? {
                        backgroundColor: `${currentPair.color}1a`, // 1a = 10% opacity
                        borderColor: `${currentPair.color}33`,     // 33 = 20% opacity
                        color: currentPair.color,
                      }
                    : {}
                }
                className={`absolute top-4 right-4 md:top-6 md:right-6 px-3 py-1 rounded-full border text-[10px] md:text-xs font-medium tracking-wide ${
                  !currentPair.color ? getSubtleColorClass(currentPair.algType) : ""
                }`}
              >
                {currentPair.algType}
              </div>
            )}

            <div className="text-center space-y-4 md:space-y-6 max-w-lg w-full mt-4 md:mt-0">
              {(currentPair.type === "corner" || currentPair.word) && (
                <>
                  <div>
                    <span className="text-accent text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-1 md:mb-2 block">
                      Word
                    </span>
                    <p className="text-3xl md:text-5xl font-light text-white">
                      {currentPair.word}
                    </p>
                  </div>
                  <div className="w-12 h-px border-t border-white/10 mx-auto my-2 md:my-0"></div>
                </>
              )}
              <div>
                <span className="text-accent text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-2 md:mb-4 block">
                  Algorithm
                </span>
                <code className="bg-white/5 border border-white/10 shadow-inner px-3 py-2 md:px-4 md:py-3 rounded-xl text-base md:text-xl font-mono text-text-muted break-words block">
                  {currentPair.alg}
                </code>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-24 left-0 md:left-64 right-0 px-4 z-40">
        <AnimatePresence mode="wait">
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex gap-3 w-full max-w-2xl mx-auto"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext(false);
                }}
                className="flex-1 glass hover:bg-white/5 text-white py-3.5 rounded-2xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-text-muted" />
                Still Learning
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext(true);
                }}
                className="flex-1 bg-accent hover:bg-accent-active text-[#050505] py-3.5 rounded-2xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-white/10"
              >
                <CheckCircle2 className="w-4 h-4 text-[#050505]" />
                Mastered
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
