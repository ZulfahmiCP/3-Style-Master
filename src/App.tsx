import React, { useState, useMemo } from "react";
import { Layers, Database, Play, Compass, Loader2 } from "lucide-react";
import { useLocalStorage } from "./useLocalStorage";
import { LetterPair } from "./types";
import { ImportView } from "./components/ImportView";
import { LibraryView } from "./components/LibraryView";
import { StudyView } from "./components/StudyView";

type Tab = "study-corner" | "study-edge" | "library" | "import";

export default function App() {
  const [pairs, setPairs] = useLocalStorage<LetterPair[]>("3style-pairs", []);
  const [sheetUrl, setSheetUrl] = useLocalStorage<string>(
    "3style-sheet-url",
    "",
  );
  const [activeTab, setActiveTab] = useState<Tab>("study-corner");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const normalizedPairs = useMemo(() => {
    return pairs.map((p) => {
      if (!p.type) {
        return {
          ...p,
          type: "corner" as const,
          id: `corner_${p.letters.toUpperCase()}`,
        };
      }
      return p;
    });
  }, [pairs]);

  const handleImport = (newPairs: LetterPair[], url?: string) => {
    // Merge by id, giving preference to new items
    const newItemsMap = new Map(newPairs.map((p) => [p.id, p]));
    const mergedPairs = normalizedPairs.map((p) =>
      newItemsMap.has(p.id) ? { ...p, ...newItemsMap.get(p.id) } : p,
    );

    // Add definitely new items that weren't in the old array
    const existingIds = new Set(normalizedPairs.map((p) => p.id));
    const newlyAdded = newPairs.filter((p) => !existingIds.has(p.id));

    setPairs([...mergedPairs, ...newlyAdded]);
    if (url) {
      setSheetUrl(url);
    }
  };

  const handleRefresh = async () => {
    if (!sheetUrl) return;
    setIsRefreshing(true);
    try {
      const { fetchAndParseGoogleSheet } = await import("./sheetSync");
      const newPairs = await fetchAndParseGoogleSheet(sheetUrl);
      handleImport(newPairs);
      alert(`Successfully refreshed ${newPairs.length} pairs!`);
    } catch (e) {
      alert(
        "Failed to refresh data: " +
          (e instanceof Error ? e.message : String(e)),
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpdatePair = (id: string, updates: Partial<LetterPair>) => {
    setPairs((current) =>
      current.map((p) => {
        const currentId = p.type ? p.id : `corner_${p.letters.toUpperCase()}`;
        if (currentId === id) {
          return { ...p, ...updates, type: p.type || "corner", id: currentId };
        }
        return p;
      }),
    );
  };

  return (
    <div className="min-h-[100svh] overflow-hidden bg-bg-base text-text-primary font-sans flex flex-col md:flex-row">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
      `,
        }}
      />

      {/* Top Header for Mobile only */}
      <header className="md:hidden glass border-b border-white/5 py-4 px-6 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
          <Layers className="w-4 h-4 text-[#050505]" />
        </div>
        <span className="font-bold text-lg tracking-tight text-white">
          3 Style Master
        </span>
      </header>

      {/* Sidebar / Bottom Navigation */}
      {/* <nav className="fixed bottom-0 left-0 right-0 md:static w-full md:w-64 glass border-t border-t-white/5 md:border-t-0 md:border-r border-r-white/5 p-4 md:p-6 flex flex-row md:flex-col shrink-0 order-last md:order-first z-10 pb-safe md:pb-6"> */}
      <nav className="fixed bottom-0 left-0 right-0 md:static w-full md:w-64 glass border-t border-t-white/5 md:border-t-0 md:border-r border-r-white/5 p-4 md:p-6 flex flex-row md:flex-col shrink-0 order-last md:order-first z-50 pb-safe md:pb-6">
        <div className="hidden md:flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
            <Layers className="w-5 h-5 text-[#050505]" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            3 Style Master
          </span>
        </div>

        <div className="flex flex-row md:flex-col justify-around md:justify-start w-full gap-2">
          <NavItem
            icon={<Play className="w-5 h-5 md:w-4 md:h-4" />}
            label="Corners"
            isActive={activeTab === "study-corner"}
            onClick={() => setActiveTab("study-corner")}
          />
          <NavItem
            icon={<Compass className="w-5 h-5 md:w-4 md:h-4" />}
            label="Edges"
            isActive={activeTab === "study-edge"}
            onClick={() => setActiveTab("study-edge")}
          />
          <NavItem
            icon={<Database className="w-5 h-5 md:w-4 md:h-4" />}
            label="Library"
            isActive={activeTab === "library"}
            onClick={() => setActiveTab("library")}
          />
          <NavItem
            icon={<Layers className="w-5 h-5 md:w-4 md:h-4" />}
            label="Import"
            isActive={activeTab === "import"}
            onClick={() => setActiveTab("import")}
          />
        </div>

        {sheetUrl && (
          <div className="mt-auto space-y-4 pt-6 hidden md:block">
            <div className="p-4 rounded-xl bg-[#050505] border border-white/5">
              <p className="text-xs text-text-muted uppercase tracking-widest mb-2 font-bold">
                Spreadsheet
              </p>
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                <span className="text-xs text-text-muted truncate">
                  {sheetUrl.replace(/^https?:\/\//, "")}
                </span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full mt-3 py-2 text-xs bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isRefreshing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : null}
                {isRefreshing ? "Refreshing..." : "Refresh Data"}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto pb-24 md:pb-12">
        {activeTab === "import" && (
          <ImportView
            onImport={handleImport}
            sheetUrl={sheetUrl}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        )}

        {activeTab === "library" && (
          <LibraryView
            pairs={normalizedPairs}
            onUpdatePair={handleUpdatePair}
          />
        )}

        {activeTab === "study-corner" && (
          <StudyView
            pairs={normalizedPairs.filter((p) => p.type === "corner")}
            onUpdatePair={handleUpdatePair}
            onNavigateToImport={() => setActiveTab("import")}
          />
        )}

        {activeTab === "study-edge" && (
          <StudyView
            pairs={normalizedPairs.filter((p) => p.type === "edge")}
            onUpdatePair={handleUpdatePair}
            onNavigateToImport={() => setActiveTab("import")}
          />
        )}
      </main>
    </div>
  );
}

function NavItem({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded-xl transition-all flex-1 md:flex-initial ${
        isActive
          ? "bg-accent/15 text-accent border border-accent/20"
          : "text-text-muted hover:text-white hover:bg-bg-surface border border-transparent"
      }`}
    >
      {icon}
      <span className="text-[10px] md:text-sm font-medium">{label}</span>
    </button>
  );
}
