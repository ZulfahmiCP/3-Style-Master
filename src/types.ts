export interface LetterPair {
  id: string; // The letter pair itself, e.g., 'corner_AB'
  type?: 'corner' | 'edge'; // Optional for backwards compatibility
  letters: string; // e.g., 'AB'
  word: string; // e.g., 'Apple'
  alg: string; // e.g., '[U, R DUR\']'
  status: 'new' | 'learning' | 'mastered';
}
