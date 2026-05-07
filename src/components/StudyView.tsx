import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, RotateCcw, CornerDownRight, Play } from "lucide-react";
import { LetterPair } from "../types";

interface StudyViewProps {
  pairs: LetterPair[];
  onUpdatePair: (id: string, updates: Partial<LetterPair>) => void;
  onNavigateToImport: () => void;
}

export function StudyView({
  pairs,
  onUpdatePair,
  onNavigateToImport,
}: StudyViewProps) {
  const [activeQueue, setActiveQueue] = useState<LetterPair[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Initialize study queue with non-mastered items
  useEffect(() => {
    const toStudy = pairs.filter((p) => p.status !== "mastered");
    // Shuffle the queue for a random study session
    const shuffled = [...toStudy].sort(() => Math.random() - 0.5);
    setActiveQueue(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [pairs]);

  const currentPair = activeQueue[currentIndex];

  const handleNext = (markMastered: boolean) => {
    if (!currentPair) return;

    if (markMastered) {
      onUpdatePair(currentPair.id, { status: "mastered" });
    } else {
      onUpdatePair(currentPair.id, { status: "learning" });
    }

    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 150); // slight delay for flip animation to start before content changes
  };

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
            <h1 className="letter-pair-display text-white">
              {currentPair.letters}
            </h1>
            <p className="absolute bottom-6 md:bottom-8 px-6 md:px-8 py-2 bg-white/5 rounded-full border border-white/10 text-xs text-text-muted flex items-center gap-2">
              Tap to reveal <CornerDownRight className="w-4 h-4" />
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
      <div className="fixed bottom-24 left-0 right-0 px-4 z-40">
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
