import React, { useState, useMemo } from 'react';
import { Search, Pin, RotateCcw, Activity, Filter } from 'lucide-react';
import { LetterPair } from '../types';

interface LibraryViewProps {
  pairs: LetterPair[];
  onUpdatePair: (id: string, updates: Partial<LetterPair>) => void;
}

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

export function LibraryView({ pairs, onUpdatePair }: LibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'corner' | 'edge'>('all');
  const [letterFilter, setLetterFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const firstLetters = useMemo(() => {
    const letters = new Set<string>();
    pairs.forEach(p => {
       if (p.letters && p.letters.length > 0) letters.add(p.letters[0].toUpperCase());
    });
    return Array.from(letters).sort();
  }, [pairs]);

  const filteredPairs = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return pairs.filter(p => {
      const matchSearch = p.letters.toLowerCase().includes(q) || 
           p.word.toLowerCase().includes(q) || 
           p.alg.toLowerCase().includes(q);
      const matchType = typeFilter === 'all' || p.type === typeFilter || (!p.type && typeFilter === 'corner');
      const matchLetter = letterFilter === 'all' || (p.letters.length > 0 && p.letters[0].toUpperCase() === letterFilter);

      return matchSearch && matchType && matchLetter;
    });
  }, [pairs, searchQuery, typeFilter, letterFilter]);

  const stats = {
    total: pairs.length,
    mastered: pairs.filter(p => p.status === 'mastered').length,
    learning: pairs.filter(p => p.status === 'learning').length,
  };

  // Hitung persentase untuk Library
  const progressPercent = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary">Library</h2>
          <p className="text-text-muted mt-1 text-sm">Manage your letter pairs and track progress.</p>
        </div>
        
        <div className="flex w-full md:w-auto">
           {/* Stats with Progress Bar */}
           <div className="flex flex-col w-full md:w-auto px-5 py-3.5 glass rounded-xl md:min-w-[240px]">
             <div className="flex items-center justify-between gap-6 mb-3">
               <div className="flex flex-col flex-1">
                 <span className="text-xs text-text-muted font-medium uppercase tracking-wider">Total</span>
                 <span className="text-sm font-semibold text-text-primary">{stats.total}</span>
               </div>
               <div className="h-6 w-px bg-white/10 shrink-0"></div>
               <div className="flex flex-col flex-1 text-right">
                 <span className="text-xs text-text-muted font-medium uppercase tracking-wider">Mastered</span>
                 <span className="text-sm font-semibold text-white">{stats.mastered}</span>
               </div>
             </div>
             
             {/* Progress Bar Visual */}
             <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden flex items-center">
                <div 
                  className="h-full bg-accent transition-all duration-700 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                />
             </div>
             <div className="text-[10px] text-text-muted mt-1.5 text-right font-medium">
                {progressPercent}% Completed
             </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-text-muted" />
            </div>
            <input
              type="text"
              placeholder="Search by letters, word, or alg..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass focus:border-accent focus:ring-1 focus:ring-accent rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted transition-all outline-none"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-xl transition-colors md:hidden shrink-0 border border-white/5 ${showFilters ? 'bg-accent text-[#050505]' : 'glass text-text-muted hover:text-white'}`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
        
        <div className={`flex flex-col sm:flex-row gap-4 ${showFilters ? 'block' : 'hidden md:flex'}`}>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full md:w-auto glass focus:border-accent focus:ring-1 focus:ring-accent rounded-xl px-4 py-3 text-sm text-text-primary outline-none"
          >
            <option value="all" className="bg-[#050505]">All Types</option>
            <option value="corner" className="bg-[#050505]">Corners</option>
            <option value="edge" className="bg-[#050505]">Edges</option>
          </select>
          
          <select 
            value={letterFilter}
            onChange={(e) => setLetterFilter(e.target.value)}
            className="w-full md:w-auto glass focus:border-accent focus:ring-1 focus:ring-accent rounded-xl px-4 py-3 text-sm text-text-primary outline-none min-w-[120px]"
          >
            <option value="all" className="bg-[#050505]">All Letters</option>
            {firstLetters.map(l => <option key={l} value={l} className="bg-[#050505]">First Letter {l}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPairs.length === 0 ? (
          <div className="col-span-full py-12 text-center border border-dashed border-bg-surface-hover rounded-2xl text-text-muted">
            {pairs.length === 0 ? "No pairs found. Import some data to get started!" : "No pairs match your search."}
          </div>
        ) : (
          filteredPairs.map((pair) => (
            <div key={pair.id} className="glass rounded-2xl p-6 hover:border-accent/30 transition-all group flex flex-col items-center text-center relative overflow-hidden">
              {/* Efek kilauan halus di pojok */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors" />

              <div className="w-full flex justify-between items-start mb-5">
                {/* Info Tipe (Badge) */}
                {pair.algType ? (
                  <div 
                    style={pair.color ? {
                      backgroundColor: `${pair.color}1a`,
                      borderColor: `${pair.color}33`,
                      color: pair.color
                    } : {}}
                    className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${!pair.color ? getSubtleColorClass(pair.algType) : ''}`}
                  >
                    {pair.algType}
                  </div>
                ) : <div />}
                
                <button
                  onClick={() => onUpdatePair(pair.id, { status: pair.status === 'mastered' ? 'learning' : 'mastered' })}
                  className={`p-2 rounded-xl transition-all ${
                    pair.status === 'mastered' 
                      ? 'bg-accent text-[#050505] shadow-lg shadow-accent/20' 
                      : 'bg-white/5 text-text-muted hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Pin className="w-4 h-4" />
                </button>
              </div>

              {/* Konten Utama (Centered) */}
              <div className="flex flex-col items-center gap-1 mb-6">
                <span className="text-4xl font-black tracking-tighter text-white group-hover:scale-110 transition-transform duration-300">
                  {pair.letters}
                </span>
                <span className="text-sm font-medium text-text-primary/80 italic">
                  {pair.word || <span className="opacity-20">No word</span>}
                </span>
              </div>

              {/* Kontainer Algoritma yang lebih menonjol */}
              <div className="w-full bg-white/5 border border-white/5 rounded-xl p-3 mb-6 group-hover:bg-white/10 transition-colors">
                <span className="text-[10px] text-text-muted uppercase tracking-[0.2em] block mb-2 font-bold">Algorithm</span>
                <code className="text-xs font-mono text-accent/90 break-words line-clamp-2 leading-relaxed">
                  {pair.alg || "No algorithm"}
                </code>
              </div>

              {/* Footer Kartu */}
              <div className="w-full flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${pair.status === 'mastered' ? 'bg-accent' : 'bg-text-muted/30'}`} />
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{pair.status}</span>
                </div>
                {pair.status !== 'new' && (
                  <button 
                    onClick={() => onUpdatePair(pair.id, { status: 'new' })}
                    className="text-[10px] text-text-muted hover:text-white flex items-center gap-1.5 transition-colors font-bold uppercase tracking-widest"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
