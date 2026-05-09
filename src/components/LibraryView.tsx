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
            <div key={pair.id} className="glass rounded-xl p-5 hover:border-accent/50 transition-colors group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xl font-bold tracking-tight text-white">{pair.letters}</span>

                  {pair.algType && (
                    <div 
                      style={pair.color ? {
                        backgroundColor: `${pair.color}1a`,
                        borderColor: `${pair.color}33`,
                        color: pair.color
                      } : {}}
                      className={`px-2 py-0.5 rounded-md border text-[9px] font-medium inline-block w-fit ${!pair.color ? getSubtleColorClass(pair.algType) : ''}`}
                    >
                      {pair.algType}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onUpdatePair(pair.id, { status: pair.status === 'mastered' ? 'learning' : 'mastered' })}
                  title={pair.status === 'mastered' ? "Unpin / Reset" : "Mark as Mastered"}
                  className={`p-1.5 rounded-lg transition-colors ${
                    pair.status === 'mastered' 
                      ? 'bg-accent/20 text-accent hover:bg-accent/40' 
                      : 'bg-bg-base text-text-muted hover:text-white hover:bg-bg-surface-hover'
                  }`}
                >
                  <Pin className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-1.5 mb-4">
                <p className="text-sm border-b border-bg-surface-hover/50 pb-1.5">
                  <span className="text-text-muted text-xs uppercase tracking-wider block mb-0.5">Word</span>
                  <span className="text-text-primary truncate block" title={pair.word}>{pair.word || <span className="opacity-30 italic">None</span>}</span>
                </p>
                <p className="text-sm">
                  <span className="text-text-muted text-xs uppercase tracking-wider block mb-0.5">Alg</span>
                  <span className="text-text-primary font-mono text-xs truncate block" title={pair.alg}>{pair.alg || <span className="opacity-30 italic">None</span>}</span>
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-bg-surface-hover/30">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-text-muted" />
                  <span className="text-xs text-text-muted capitalize">{pair.status}</span>
                </div>
                {pair.status !== 'new' && (
                  <button 
                    onClick={() => onUpdatePair(pair.id, { status: 'new' })}
                    className="text-xs text-text-muted hover:text-white flex items-center gap-1 transition-colors"
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
