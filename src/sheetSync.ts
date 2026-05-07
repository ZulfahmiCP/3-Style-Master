import Papa from 'papaparse';
import { LetterPair } from './types';

export async function fetchAndParseGoogleSheet(url: string): Promise<LetterPair[]> {
  // Extract sheet ID
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    throw new Error('Invalid Google Sheets URL. Please make sure you copy the full link.');
  }
  const sheetId = match[1];

  const fetchSheet = async (sheetName: string) => {
    const fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    const res = await fetch(fetchUrl);
    if (!res.ok) return null;
    
    const text = await res.text();
    if (text.trim().startsWith('<html') || text.trim().startsWith('<!DOCTYPE html>')) {
       return null;
    }
    return text;
  };

  const [wordsCsv, algsCsv, edgeAlgsCsv] = await Promise.all([
    fetchSheet('Corner Words'),
    fetchSheet('Corner Algs'),
    fetchSheet('Edge Algs')
  ]);

  const parseCsvSafe = (csv: string | null) => {
     if (!csv) return { data: [] };
     return Papa.parse<string[]>(csv, { skipEmptyLines: 'greedy' }).data;
  };

  const wordsParsed = parseCsvSafe(wordsCsv);
  const algsParsed = parseCsvSafe(algsCsv);
  const edgeAlgsParsed = parseCsvSafe(edgeAlgsCsv);

  const buildMap = (data: string[][]) => {
    const map = new Map<string, string>();
    if (!data || data.length === 0) return map;
    const headers = data[0];
    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      const secondLetter = row[0]?.trim();
      if (!secondLetter) continue;
      for (let c = 1; c < Math.min(row.length, headers.length); c++) {
        const firstLetter = headers[c]?.trim();
        if (!firstLetter) continue;
        const value = row[c]?.trim() || '';
        if (value) map.set(`${firstLetter}${secondLetter}`, value);
      }
    }
    return map;
  };

  const wordsMap = buildMap(wordsParsed);
  const algsMap = buildMap(algsParsed);
  const edgeAlgsMap = buildMap(edgeAlgsParsed);

  const pairs: LetterPair[] = [];
  
  const cornerKeys = new Set([...wordsMap.keys(), ...algsMap.keys()]);
  cornerKeys.forEach(key => {
     pairs.push({
       id: `corner_${key}`,
       type: 'corner',
       letters: key,
       word: wordsMap.get(key) || '',
       alg: algsMap.get(key) || '',
       status: 'new'
     });
  });

  const edgeKeys = new Set([...edgeAlgsMap.keys()]);
  edgeKeys.forEach(key => {
     pairs.push({
       id: `edge_${key}`,
       type: 'edge',
       letters: key,
       word: '',
       alg: edgeAlgsMap.get(key) || '',
       status: 'new'
     });
  });

  if (pairs.length === 0) {
    throw new Error('No valid data found. Ensure your sheet has "Corner Words", "Corner Algs", or "Edge Algs" tabs.');
  }
  
  return pairs;
}
