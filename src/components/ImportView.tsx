import React, { useState } from 'react';
import { Link, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { LetterPair } from '../types';

interface ImportViewProps {
  onImport: (pairs: LetterPair[], url?: string) => void;
  sheetUrl?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function ImportView({
  onImport,
  sheetUrl,
  onRefresh,
  isRefreshing,
}: ImportViewProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleImport = async () => {
    setError(null);
    setSuccess(null);
    
    // Extract sheet ID just for validation
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      setError('Invalid Google Sheets URL. Please make sure you copy the full link.');
      return;
    }

    setIsLoading(true);
    try {
      const { fetchAndParseGoogleSheet } = await import('../sheetSync');
      const pairs = await fetchAndParseGoogleSheet(url);
      onImport(pairs, url);
      setSuccess(`Successfully imported ${pairs.length} pairs!`);
      setUrl('');
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch data. Is your spreadsheet shared as "Anyone with the link can view"?');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-text-primary">Import Spreadsheet</h2>
        <p className="text-text-muted mt-2 text-sm leading-relaxed">
          Paste your Google Sheets link below. We will automatically extract data from the 
          <code className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-xs mx-1 text-accent">Corner Words</code> 
          and 
          <code className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-xs mx-1 text-accent">Corner Algs</code> 
          sheets. Make sure the sheet is shared as "Anyone with the link can view".
        </p>
      </div>

      {error && (
        <div className="bg-white/5 border border-white/20 text-white p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-white/10 border border-white/20 text-white p-4 rounded-xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm">{success}</p>
        </div>
      )}

      <div className="glass rounded-2xl p-6 flex flex-col focus-within:border-accent transition-colors">
        <div className="flex items-center gap-2 mb-4">
          <Link className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-medium text-text-primary">Google Sheets Link</h3>
        </div>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full bg-bg-base border border-white/5 rounded-xl p-3.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent transition-all"
          placeholder="https://docs.google.com/spreadsheets/d/..."
        />
        
        <div className="mt-4 bg-white/5 border justify-center border-white/10 text-text-muted p-4 rounded-xl text-xs flex gap-2">
           <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
           <p>Your sheet must have tabs named <strong>Corner Words</strong>, <strong>Corner Algs</strong>, or <strong>Edge Algs</strong>. Ensure the first letter is in the first row (starting from column B), and the second letter is in the first column (starting from row 2).</p>
        </div>

        <button
          onClick={handleImport}
          disabled={!url.trim() || isLoading}
          className="mt-6 w-full bg-accent hover:bg-accent-active disabled:opacity-50 disabled:cursor-not-allowed text-[#050505] font-medium py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Importing...
            </>
          ) : (
            'Import from Sheets'
          )}
        </button>
        {sheetUrl && (
          <div className="glass rounded-2xl p-5 space-y-4 mt-6">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-widest mb-2 font-bold">
                Connected Spreadsheet
              </p>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="text-xs text-text-muted break-all">
                  {sheetUrl.replace(/^https?:\/\//, "")}
                </span>
              </div>
            </div>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl py-3 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                "Refresh Data"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

