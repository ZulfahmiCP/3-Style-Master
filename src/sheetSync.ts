import Papa from "papaparse";
import { LetterPair } from "./types";

export async function fetchAndParseGoogleSheet(
  url: string,
): Promise<LetterPair[]> {
  // Extract sheet ID
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    throw new Error(
      "Invalid Google Sheets URL. Please make sure you copy the full link.",
    );
  }
  const sheetId = match[1];

  const fetchSheet = async (sheetName: string) => {
    const fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    const res = await fetch(fetchUrl);
    if (!res.ok) return null;

    const text = await res.text();
    if (
      text.trim().startsWith("<html") ||
      text.trim().startsWith("<!DOCTYPE html>")
    ) {
      return null;
    }
    return text;
  };

  const [wordsCsv, algsCsv, edgeAlgsCsv, cornerTypesCsv, edgeTypesCsv] =
    await Promise.all([
      fetchSheet("Corner Words"),
      fetchSheet("Corner Algs"),
      fetchSheet("Edge Algs"),
      fetchSheet("Corner Types"),
      fetchSheet("Edge Types"),
    ]);

  const parseCsvSafe = (csv: string | null): string[][] => {
    if (!csv) return []; // Perbaikan: Langsung kembalikan array kosong
    return Papa.parse<string[]>(csv, { skipEmptyLines: "greedy" }).data;
  };

  const wordsParsed = parseCsvSafe(wordsCsv);
  const algsParsed = parseCsvSafe(algsCsv);
  const edgeAlgsParsed = parseCsvSafe(edgeAlgsCsv);
  const cornerTypesParsed = parseCsvSafe(cornerTypesCsv);
  const edgeTypesParsed = parseCsvSafe(edgeTypesCsv);

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
        const value = row[c]?.trim() || "";
        if (value) map.set(`${firstLetter}${secondLetter}`, value);
      }
    }
    return map;
  };

  const wordsMap = buildMap(wordsParsed);
  const algsMap = buildMap(algsParsed);
  const edgeAlgsMap = buildMap(edgeAlgsParsed);
  const cornerTypesMap = buildMap(cornerTypesParsed); // Buat map
  const edgeTypesMap = buildMap(edgeTypesParsed); // Buat map

  const pairs: LetterPair[] = [];

  const extractColorMap = (data: string[][], startRow: number, endRow: number) => {
    const colorMap = new Map<string, string>();
    if (!data || data.length < startRow) return colorMap;

    // Baris di spreadsheet (1-indexed) ke array (0-indexed)
    for (let r = startRow - 1; r < Math.min(data.length, endRow); r++) {
      const row = data[r];
      if (!row) continue;
      
      // Kolom B, D, F, H adalah indeks 1, 3, 5, 7 (Tipe)
      // Kolom C, E, G, I adalah indeks 2, 4, 6, 8 (Warna)
      const pairs = [
        { typeIdx: 1, colorIdx: 2 },
        { typeIdx: 3, colorIdx: 4 },
        { typeIdx: 5, colorIdx: 6 },
        { typeIdx: 7, colorIdx: 8 },
      ];

      pairs.forEach(({ typeIdx, colorIdx }) => {
        const typeName = row[typeIdx]?.trim();
        let colorCode = row[colorIdx]?.trim();

        if (typeName && colorCode) {
          // Cek dan tambahkan '#' jika tidak ada
          if (!colorCode.startsWith("#")) {
            // Validasi sederhana apakah ini hex (3 atau 6 karakter)
            if (/^[0-9A-Fa-f]{3,6}$/.test(colorCode)) {
              colorCode = "#" + colorCode;
            }
          }
          colorMap.set(typeName, colorCode);
        }
      });
    }
    return colorMap;
  };

  const cornerColorMap = extractColorMap(cornerTypesParsed, 23, 28);
  const edgeColorMap = extractColorMap(edgeTypesParsed, 24, 29);

  const cornerKeys = new Set([...wordsMap.keys(), ...algsMap.keys()]);
  cornerKeys.forEach((key) => {
    // 1. Ambil tipe algoritmanya dulu
    const currentAlgType = cornerTypesMap.get(key) || "";
    // 2. Jika tipenya ada, cari warnanya. Jika tidak ada, biarkan undefined
    const currentColor = currentAlgType ? cornerColorMap.get(currentAlgType) : undefined;

    pairs.push({
      id: `corner_${key}`,
      type: "corner",
      letters: key,
      word: wordsMap.get(key) || "",
      alg: algsMap.get(key) || "",
      algType: currentAlgType,
      color: currentColor, 
      status: "new",
    });
  });

  const edgeKeys = new Set([...edgeAlgsMap.keys()]);
  edgeKeys.forEach((key) => {
    // 1. Ambil tipe algoritmanya dulu
    const currentAlgType = edgeTypesMap.get(key) || "";
    // 2. Jika tipenya ada, cari warnanya. Jika tidak ada, biarkan undefined
    const currentColor = currentAlgType ? edgeColorMap.get(currentAlgType) : undefined;

    pairs.push({
      id: `edge_${key}`,
      type: "edge",
      letters: key,
      word: "",
      alg: edgeAlgsMap.get(key) || "",
      algType: currentAlgType,
      color: currentColor,
      status: "new",
    });
  });

  if (pairs.length === 0) {
    throw new Error(
      'No valid data found. Ensure your sheet has "Corner Words", "Corner Algs", or "Edge Algs" tabs.',
    );
  }

  return pairs;
}
