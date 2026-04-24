import { useState, useRef, useCallback, useEffect } from "react";

const STORAGE_KEY = "thesis-structure-v1";

const INITIAL_MODULES = [
  // ── INTRODUCTION ──
  { id: "intro", title: "Introduction", depth: 0, status: "revision", desc: "", tables: "", collapsed: false },
  { id: "intro-hook", title: "Opening hook", depth: 1, status: "done", desc: "Knight (1921) uncertainty → Bernanke (1983) wait-and-see → Bloom (2009) discrete shocks → Brogaard-Detzel (2015) quantification with EPU. Establishes the chain from theory to empirical measurement.", tables: "", collapsed: false },
  { id: "intro-motiv1", title: "Motivation 1: Sample extension", depth: 1, status: "done", desc: "B-D ends in 2012. Post-2012 structural shifts (ZIRP, QE3-5, COVID) make the survival of their result an open question.", tables: "", collapsed: false },
  { id: "intro-motiv2", title: "Motivation 2: Polymarket opportunity", depth: 1, status: "done", desc: "2024 election cycle → Polymarket as first large-scale prediction market. Opportunity to build forward-looking, market-based political uncertainty measure. Wolfers-Zitzewitz (2004), Arrow et al. (2008) on prediction market efficiency.", tables: "", collapsed: false },
  { id: "intro-rq", title: "Research questions", depth: 1, status: "done", desc: "RQ1: How has EPU's asset-pricing role evolved post-2012? RQ2: Do prediction markets capture uncertainty dimensions EPU misses?", tables: "", collapsed: false },

  // ── MAIN CONTRIBUTIONS (currently misplaced as standalone Lit Review) ──
  { id: "contrib", title: "Main Contributions", depth: 1, status: "needs-work", desc: "⚠️ Currently a standalone 'Literature Review' section — needs to be folded INTO Introduction as a subsection, following Rippe & Riley (2025) structure from the same program.", tables: "", collapsed: false },
  { id: "contrib-1", title: "C1: EPU decoupling from business cycle", depth: 2, status: "revision", desc: "B-D's R² of 0.35 on business-cycle variables collapses to 0.16 in extended sample. Davis (2019) argues EPU has become autonomous from cyclical drivers. We quantify the decoupling directly.", tables: "Tables 1-2 Panel A", collapsed: false },
  { id: "contrib-2", title: "C2: Daily frequency adaptation", depth: 2, status: "revision", desc: "BBDS (2021): post-2010 policy jumps more frequent, trade-policy drives 36% of large daily moves. Bloom (2009): shocks mean-revert fast. If uncertainty is event-driven, monthly aggregation loses the signal. We adapt B-D to daily using Baker et al. (2016) daily news-EPU + Andersen-Bollerslev (1998) squared returns as VAR proxy.", tables: "Tables 3, 6", collapsed: false },
  { id: "contrib-3", title: "C3: Pástor-Veronesi framework & prediction markets", depth: 2, status: "revision", desc: "Pástor-Veronesi (2012, 2013): political uncertainty (will policy change?) vs. impact uncertainty (what are consequences?). EPU conflates both. Kelly-Pástor-Veronesi (2016): options spanning elections trade at premium. We extend using Polymarket prices on binary political outcomes. Multi-dimensionality context: Manela-Moreira (2017), Caldara-Iacoviello (2022), JLN (2015).", tables: "", collapsed: false },
  { id: "contrib-pos", title: "Positioning statement", depth: 2, status: "done", desc: "Not 'does Polymarket beat EPU' — tests whether two measures capture distinct, separately priced dimensions of a latent construct. Retains EPU throughout as benchmark.", tables: "", collapsed: false },

  // ── DATA & METHODOLOGY ──
  { id: "method", title: "Data & Methodology", depth: 0, status: "done", desc: "", tables: "", collapsed: false },
  { id: "method-data", title: "Data sources & sample", depth: 1, status: "done", desc: "Jan 1985 – Dec 2024 (EPU/macro). FRED, WRDS CRSP, EPU website. Monthly: composite 3-component EPU. Daily: news-only EPU. Polymarket: 4 contracts over calendar 2024.", tables: "", collapsed: false },
  { id: "method-vars", title: "Variable construction", depth: 1, status: "done", desc: "LHS: cumulative log excess return (CRSP VW − T-bill). RHS: EPU/100, VAR (monthly: intra-month variance; daily: squared return), VXO, TERM, DEFAULT, RREL, CFI (monthly only), Log(D/P) (monthly only).", tables: "", collapsed: false },
  { id: "method-contemp", title: "Contemporaneous specification", depth: 1, status: "done", desc: "EPU regressed on controls (levels, σ-scaled). Returns regressed on ΔEPU + Δcontrols. AR(p) persistence + DF-GLS stationarity. NW SEs: 4 lags monthly, 21 daily.", tables: "", collapsed: false },
  { id: "method-predict", title: "Predictive specification", depth: 1, status: "done", desc: "Cumulative h-period forward returns on EPU levels + controls. Hodrick (1992) SEs for overlapping returns. Monthly h ∈ {1,2,3,6,12}, Daily h ∈ {1,5,10,21,63}.", tables: "", collapsed: false },
  { id: "method-poly", title: "Polymarket methodology", depth: 1, status: "done", desc: "Shannon entropy H = −p·ln(p) − (1−p)·ln(1−p) for binary; H = −Σpᵢ·ln(pᵢ) for multi-outcome Presidential. AR(1) residualization → innovation (Innov). Unit-variance standardization. Fed contract: stitched across FOMC meetings.", tables: "", collapsed: false },
  { id: "method-diag", title: "Polymarket diagnostics", depth: 2, status: "done", desc: "D1: Leverage drop (top-5 |Innov| days removed). D2: Monte Carlo power analysis (plant β, detect at 5%, 1000 sims). Validates that nulls aren't artifacts of low power.", tables: "Table 8, Figure 1", collapsed: false },

  // ── RESULTS ──
  { id: "results", title: "Empirical Results", depth: 0, status: "revision", desc: "", tables: "", collapsed: false },

  { id: "res-contemp", title: "Contemporaneous Results", depth: 1, status: "done", desc: "", tables: "", collapsed: false },
  { id: "res-c-rep", title: "Replication (1985–2012)", depth: 2, status: "done", desc: "Panel A: EPU on controls — all univariate significant, VXO/TERM/Log(D/P) survive multivariate. Panel B: returns on ΔEPU — significant at 1% univariate, 5% multivariate. Panel C: AR persistence, DF-GLS rejects unit root. Highly congruent with original B-D.", tables: "Table 1", collapsed: false },
  { id: "res-c-ext", title: "Extension (1985–2024)", depth: 2, status: "done", desc: "Panel A: VXO loses multivariate significance; DEFAULT gains it. Business-cycle R² collapses 0.35→0.16. Panel B: EPU remains significant but magnitude weakens. Panel C: AR(1) drops 0.77→0.66 — persistence falling.", tables: "Table 2", collapsed: false },
  { id: "res-c-daily", title: "Daily frequency (1985–2024)", depth: 2, status: "done", desc: "Panel A: similar pattern to monthly. Panel B: ΔEPU is NULL — neither univariate nor multivariate significance. This is the key frequency finding. Panel C: stationarity confirmed; AR(1) = 0.30.", tables: "Table 3", collapsed: false },

  { id: "res-predict", title: "Predictive Results", depth: 1, status: "done", desc: "", tables: "", collapsed: false },
  { id: "res-p-rep", title: "Replication (1985–2012)", depth: 2, status: "done", desc: "EPU positive predictor at h=3,6 months (Panel A). Survives VAR/VXO controls (Panel B) and full controls (Panel C). RREL significant at longer horizons.", tables: "Table 4", collapsed: false },
  { id: "res-p-ext", title: "Extension (1985–2024)", depth: 2, status: "done", desc: "EPU significance STRENGTHENS — all horizons now significant. VAR/VXO lose significance. Predictive power has intensified despite weakening contemporaneous relationship.", tables: "Table 5", collapsed: false },
  { id: "res-p-daily", title: "Daily frequency (1985–2024)", depth: 2, status: "done", desc: "EPU significant at h≥10 days with controls (Panel C). Establishes that predictive power kicks in at ~2 trading weeks. Sub-monthly resolution impossible with monthly data alone → motivates Polymarket test.", tables: "Table 6", collapsed: false },

  { id: "res-poly", title: "Polymarket Results", depth: 1, status: "needs-work", desc: "", tables: "", collapsed: false },
  { id: "res-pm-contemp", title: "Contemporaneous null (4 contracts)", depth: 2, status: "done", desc: "Presidential (t=−0.86) and Fed (t=+0.78): null. Senate (t=−4.02) and House (t=−5.54): apparently significant but collapse under leverage diagnostic. VIX absorbs equity-relevant content at daily frequency.", tables: "Table 7", collapsed: false },
  { id: "res-pm-lev", title: "Leverage diagnostic", depth: 2, status: "done", desc: "Senate: −0.10→−0.07 (t: −4.02→−0.43). House: −0.09→+0.24 (sign reversal, t: −5.54→+0.70). Both driven by ≤5 election-week days.", tables: "Table 8", collapsed: false },
  { id: "res-pm-power", title: "Monte Carlo power analysis", depth: 2, status: "done", desc: "House contract: 71% power at β=0.05, 95% at β=0.10, 100% at β≥0.20. Null is not an artifact of low power.", tables: "Figure 1", collapsed: false },
  { id: "res-pm-pred", title: "Predictive horizons (NEW)", depth: 2, status: "needs-work", desc: "Presidential: univariate hump at h=7–11 (t=2.4–3.3). With controls: hump shape survives but t drops to 1.6–2.0. Senate/House/Fed: null at all horizons. Permutation test rejects at p=0.002. Leverage drop kills significance (t: 2.77→0.82) — signal identified off 5 events.", tables: "Table 9 (new)", collapsed: false },
  { id: "res-pm-synth", title: "Polymarket synthesis paragraph", depth: 2, status: "missing", desc: "Structured null contemporaneously. Event-driven predictive signal for Presidential at h=7–11 (same horizon as EPU's own power). Not a continuous risk premium — identified off 5 regime-probability shocks. Single-cycle limitation.", tables: "", collapsed: false },

  // ── DISCUSSION ──
  { id: "discuss", title: "Discussion", depth: 0, status: "needs-work", desc: "", tables: "", collapsed: false },
  { id: "disc-decouple", title: "EPU & structural decoupling", depth: 1, status: "revision", desc: "Business-cycle R² collapse (0.35→0.16). EPU increasingly exogenous — driven by discrete political events rather than macro cycles. Davis (2019) confirmed and quantified.", tables: "", collapsed: false },
  { id: "disc-temporal", title: "Temporal aggregation insight", depth: 1, status: "revision", desc: "Monthly contemporaneous coefficient (negative) aggregates an initial shock + predictive rebound. Daily data separates these: null contemporaneous + positive predictive at h≥10. The monthly result was hiding a microstructure.", tables: "", collapsed: false },
  { id: "disc-fragile", title: "Fragile market hypothesis", depth: 1, status: "revision", desc: "Paradox: predictive power strengthened but contemporaneous weakened. Compressed equity risk premia (Damodaran) + increased sensitivity = sharper downturns + sharper rebounds. ZIRP/QE as possible mechanism (search for yield → risk-parity divestment under uncertainty → re-entry on stabilization).", tables: "", collapsed: false },
  { id: "disc-persist", title: "Persistence drop & feedback loop", depth: 1, status: "missing", desc: "⚠️ AR(1) drops 0.77→0.66. VAR persistence also falls. VXO stable. EPU increasingly driven by lagged market returns (feedback loop intensifying). Currently promised in draft but not fully written.", tables: "", collapsed: false },
  { id: "disc-poly-null", title: "Polymarket: contemporaneous null interpretation", depth: 1, status: "revision", desc: "VIX prices equity-relevant content in real time from S&P options. Polymarket measures uncertainty about political outcomes, not equity returns. By end-of-day, the volatility surface has already moved. At daily contemporaneous horizon, VIX absorbs everything.", tables: "", collapsed: false },
  { id: "disc-poly-pred", title: "Polymarket: predictive signal interpretation (NEW)", depth: 1, status: "missing", desc: "⚠️ NOT YET WRITTEN. Presidential entropy innovations predict h=7–11 day returns. Event-driven (5 regime shocks), not continuous premium. Same horizon as EPU — consistent with Pástor-Veronesi regime-change resolution. Controls weaken but don't destroy hump shape. Single-cycle caveat.", tables: "", collapsed: false },
  { id: "disc-caveats", title: "Caveats & future directions", depth: 1, status: "revision", desc: "Single election cycle. Shannon entropy is one measure — bid-ask spreads, volume, probability variance are alternatives. Aggregating multiple markets may be statistically fragile. Multiple cycles needed for generalizability.", tables: "", collapsed: false },

  // ── CONCLUSION ──
  { id: "conclusion", title: "Conclusion", depth: 0, status: "missing", desc: "⚠️ Currently ends mid-sentence. Needs full write-up.", tables: "", collapsed: false },

  // ── REFERENCES ──
  { id: "refs", title: "References", depth: 0, status: "revision", desc: "Check: 'Dentzel' typo in multiple places. BBDS citation inconsistency (2019 vs 2021). Verify all references are cited in text and vice versa.", tables: "", collapsed: false },
];

const STATUS_CONFIG = {
  done: { label: "Done", color: "#16a34a", bg: "#f0fdf4" },
  revision: { label: "Revision", color: "#ca8a04", bg: "#fefce8" },
  "needs-work": { label: "Needs Work", color: "#ea580c", bg: "#fff7ed" },
  missing: { label: "Missing", color: "#dc2626", bg: "#fef2f2" },
};

const DEPTH_COLORS = [
  "#1e293b",
  "#334155",
  "#475569",
];

export default function ThesisOrganizer() {
  const [modules, setModules] = useState(INITIAL_MODULES);
  const [loaded, setLoaded] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState({ title: "", desc: "", depth: 0, status: "missing", tables: "" });
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const fileInputRef = useRef(null);
  const dragRef = useRef(null);

  // ── Load from localStorage on mount ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setModules(parsed);
        }
      }
    } catch (e) {
      // No saved state — use defaults
    }
    setLoaded(true);
  }, []);

  // ── Save to localStorage on every change (after initial load) ──
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(modules));
    } catch (e) {
      // Storage full or unavailable
    }
  }, [modules, loaded]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // ── Export as JSON file ──
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(modules, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "thesis_structure.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported — share the JSON file with Axel");
  };

  // ── Copy JSON to clipboard ──
  const copyJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(modules, null, 2));
      showToast("Copied to clipboard");
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = JSON.stringify(modules, null, 2);
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast("Copied to clipboard");
    }
  };

  // ── Import from JSON text ──
  const handleImport = (text) => {
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Invalid");
      // Basic validation
      if (!parsed[0].id || !parsed[0].title) throw new Error("Invalid format");
      setModules(parsed);
      setShowImport(false);
      setImportText("");
      showToast(`Imported ${parsed.length} modules`);
    } catch {
      showToast("Invalid JSON — check the format");
    }
  };

  // ── Import from file ──
  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => handleImport(ev.target.result);
    reader.readAsText(file);
    e.target.value = "";
  };

  // ── Reset to defaults ──
  const resetToDefaults = () => {
    if (modules.length !== INITIAL_MODULES.length ||
        modules.some((m, i) => m.id !== INITIAL_MODULES[i]?.id)) {
      setModules(INITIAL_MODULES);
      showToast("Reset to defaults");
    }
  };

  const counts = {
    all: modules.length,
    done: modules.filter(m => m.status === "done").length,
    revision: modules.filter(m => m.status === "revision").length,
    "needs-work": modules.filter(m => m.status === "needs-work").length,
    missing: modules.filter(m => m.status === "missing").length,
  };

  const filteredIndices = modules.reduce((acc, m, i) => {
    const matchesFilter = filter === "all" || m.status === filter;
    const matchesSearch = !searchTerm ||
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.desc.toLowerCase().includes(searchTerm.toLowerCase());
    if (matchesFilter && matchesSearch) acc.push(i);
    return acc;
  }, []);

  const handleDragStart = (idx) => { setDragIdx(idx); };
  const handleDragOver = (e, idx) => { e.preventDefault(); setOverIdx(idx); };
  const handleDragEnd = () => {
    if (dragIdx !== null && overIdx !== null && dragIdx !== overIdx) {
      const updated = [...modules];
      const [moved] = updated.splice(dragIdx, 1);
      updated.splice(overIdx, 0, moved);
      setModules(updated);
    }
    setDragIdx(null);
    setOverIdx(null);
  };

  const indent = (idx) => {
    if (idx === 0) return;
    const updated = [...modules];
    if (updated[idx].depth < 2) {
      updated[idx] = { ...updated[idx], depth: updated[idx].depth + 1 };
      setModules(updated);
    }
  };

  const outdent = (idx) => {
    const updated = [...modules];
    if (updated[idx].depth > 0) {
      updated[idx] = { ...updated[idx], depth: updated[idx].depth - 1 };
      setModules(updated);
    }
  };

  const cycleStatus = (idx) => {
    const order = ["missing", "needs-work", "revision", "done"];
    const updated = [...modules];
    const cur = order.indexOf(updated[idx].status);
    updated[idx] = { ...updated[idx], status: order[(cur + 1) % order.length] };
    setModules(updated);
  };

  const deleteModule = (idx) => {
    setModules(modules.filter((_, i) => i !== idx));
    setEditing(null);
  };

  const startEdit = (idx) => {
    setEditing(idx);
    setEditForm({ ...modules[idx] });
  };

  const saveEdit = () => {
    const updated = [...modules];
    updated[editing] = { ...updated[editing], ...editForm };
    setModules(updated);
    setEditing(null);
  };

  const addModule = () => {
    const id = "mod-" + Date.now();
    setModules([...modules, { id, collapsed: false, ...newForm }]);
    setNewForm({ title: "", desc: "", depth: 0, status: "missing", tables: "" });
    setAdding(false);
  };

  const duplicateModule = (idx) => {
    const src = modules[idx];
    const dup = { ...src, id: src.id + "-copy-" + Date.now(), title: src.title + " (copy)" };
    const updated = [...modules];
    updated.splice(idx + 1, 0, dup);
    setModules(updated);
  };

  return (
    <div style={{
      fontFamily: "'Instrument Serif', 'Georgia', serif",
      background: "#fafaf8",
      minHeight: "100vh",
      padding: "24px 16px",
      maxWidth: 820,
      margin: "0 auto",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 26,
          fontWeight: 400,
          color: "#1e293b",
          margin: 0,
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
        }}>
          Thesis Structure
        </h1>
        <p style={{
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
          fontSize: 13,
          color: "#64748b",
          margin: "6px 0 0",
          lineHeight: 1.5,
        }}>
          Rydja & Sjöberg — EPU, Polymarket & Equity Risk Premia
        </p>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          color: "#94a3b8",
          margin: "4px 0 0",
        }}>
          Drag to reorder · Click status badge to cycle · Arrow keys to indent/outdent
        </p>

        {/* Toolbar */}
        <div style={{
          display: "flex",
          gap: 6,
          marginTop: 12,
          flexWrap: "wrap",
        }}>
          <button onClick={exportJSON} style={toolbarBtnStyle}>
            ↓ Export JSON
          </button>
          <button onClick={copyJSON} style={toolbarBtnStyle}>
            ⎘ Copy to clipboard
          </button>
          <button onClick={() => setShowImport(!showImport)} style={toolbarBtnStyle}>
            ↑ Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            style={{ display: "none" }}
          />
          <button onClick={resetToDefaults} style={{ ...toolbarBtnStyle, color: "#94a3b8" }}>
            ↺ Reset
          </button>
        </div>

        {/* Import panel */}
        {showImport && (
          <div style={{
            marginTop: 8,
            padding: 12,
            background: "white",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
          }}>
            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: "#64748b",
              marginBottom: 8,
            }}>
              Paste exported JSON below, or upload a file:
            </div>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='Paste JSON here...'
              rows={3}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #e2e8f0",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
                resize: "vertical",
                background: "#f8fafc",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={toolbarBtnStyle}
              >
                Upload .json file
              </button>
              <button
                onClick={() => handleImport(importText)}
                disabled={!importText.trim()}
                style={{
                  ...toolbarBtnStyle,
                  background: importText.trim() ? "#1e293b" : "#e2e8f0",
                  color: importText.trim() ? "white" : "#94a3b8",
                }}
              >
                Import from text
              </button>
              <div style={{ flex: 1 }} />
              <button onClick={() => { setShowImport(false); setImportText(""); }} style={toolbarBtnStyle}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          fontWeight: 500,
          padding: "10px 20px",
          borderRadius: 8,
          background: "#1e293b",
          color: "white",
          zIndex: 1000,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          animation: "fadeIn 0.2s ease",
        }}>
          {toast}
        </div>
      )}

      {/* Status filter bar */}
      <div style={{
        display: "flex",
        gap: 6,
        marginBottom: 16,
        flexWrap: "wrap",
        alignItems: "center",
      }}>
        {["all", "missing", "needs-work", "revision", "done"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              padding: "5px 12px",
              borderRadius: 20,
              border: filter === f ? "1.5px solid #1e293b" : "1px solid #e2e8f0",
              background: filter === f ? "#1e293b" : "white",
              color: filter === f ? "white" : "#64748b",
              cursor: "pointer",
              fontWeight: filter === f ? 600 : 400,
              transition: "all 0.15s",
            }}
          >
            {f === "all" ? "All" : STATUS_CONFIG[f]?.label} ({counts[f]})
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <input
          type="text"
          placeholder="Search modules..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            padding: "5px 12px",
            borderRadius: 6,
            border: "1px solid #e2e8f0",
            outline: "none",
            width: 160,
            background: "white",
          }}
        />
      </div>

      {/* Module list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {filteredIndices.map((realIdx) => {
          const m = modules[realIdx];
          const st = STATUS_CONFIG[m.status];
          const isDragging = dragIdx === realIdx;
          const isOver = overIdx === realIdx;
          const isEditing = editing === realIdx;
          const depthPx = m.depth * 28;

          return (
            <div key={m.id}>
              <div
                draggable
                onDragStart={() => handleDragStart(realIdx)}
                onDragOver={(e) => handleDragOver(e, realIdx)}
                onDragEnd={handleDragEnd}
                style={{
                  marginLeft: depthPx,
                  padding: "10px 14px",
                  background: isDragging ? "#f1f5f9" : isOver ? "#e0f2fe" : "white",
                  borderRadius: 8,
                  border: isOver ? "1.5px dashed #3b82f6" : "1px solid #e8e8e4",
                  cursor: "grab",
                  opacity: isDragging ? 0.5 : 1,
                  transition: "all 0.12s ease",
                  borderLeft: `3px solid ${DEPTH_COLORS[m.depth] || "#94a3b8"}`,
                }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}>
                  {/* Drag handle */}
                  <span style={{
                    color: "#cbd5e1",
                    fontSize: 14,
                    cursor: "grab",
                    userSelect: "none",
                    marginTop: 2,
                    flexShrink: 0,
                  }}>⠿</span>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}>
                      <span style={{
                        fontFamily: m.depth === 0 ? "'Instrument Serif', Georgia, serif" : "'DM Sans', sans-serif",
                        fontSize: m.depth === 0 ? 17 : m.depth === 1 ? 14 : 13,
                        fontWeight: m.depth === 0 ? 400 : 500,
                        color: DEPTH_COLORS[m.depth] || "#64748b",
                        lineHeight: 1.3,
                      }}>
                        {m.title}
                      </span>

                      {/* Status badge */}
                      <button
                        onClick={(e) => { e.stopPropagation(); cycleStatus(realIdx); }}
                        title="Click to cycle status"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 10,
                          background: st.bg,
                          color: st.color,
                          border: "none",
                          cursor: "pointer",
                          letterSpacing: "0.03em",
                          textTransform: "uppercase",
                          flexShrink: 0,
                        }}
                      >
                        {st.label}
                      </button>

                      {m.tables && (
                        <span style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 10,
                          color: "#94a3b8",
                          background: "#f8fafc",
                          padding: "2px 6px",
                          borderRadius: 4,
                          flexShrink: 0,
                        }}>
                          {m.tables}
                        </span>
                      )}
                    </div>

                    {m.desc && (
                      <p style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 12,
                        color: "#64748b",
                        margin: "5px 0 0",
                        lineHeight: 1.55,
                        whiteSpace: "pre-wrap",
                      }}>
                        {m.desc}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div style={{
                    display: "flex",
                    gap: 2,
                    flexShrink: 0,
                    marginTop: 1,
                  }}>
                    <button onClick={() => outdent(realIdx)} title="Outdent"
                      style={actionBtnStyle}>←</button>
                    <button onClick={() => indent(realIdx)} title="Indent"
                      style={actionBtnStyle}>→</button>
                    <button onClick={() => startEdit(realIdx)} title="Edit"
                      style={actionBtnStyle}>✎</button>
                    <button onClick={() => duplicateModule(realIdx)} title="Duplicate"
                      style={actionBtnStyle}>⧉</button>
                    <button onClick={() => deleteModule(realIdx)} title="Delete"
                      style={{ ...actionBtnStyle, color: "#ef4444" }}>×</button>
                  </div>
                </div>
              </div>

              {/* Inline edit panel */}
              {isEditing && (
                <div style={{
                  marginLeft: depthPx + 20,
                  padding: 14,
                  background: "#f8fafc",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  marginTop: 2,
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input
                      value={editForm.title || ""}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="Title"
                      style={inputStyle}
                    />
                    <textarea
                      value={editForm.desc || ""}
                      onChange={(e) => setEditForm({ ...editForm, desc: e.target.value })}
                      placeholder="Description / content notes"
                      rows={3}
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                    <input
                      value={editForm.tables || ""}
                      onChange={(e) => setEditForm({ ...editForm, tables: e.target.value })}
                      placeholder="Associated tables/figures (e.g. Table 7, Figure 1)"
                      style={inputStyle}
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        style={{ ...inputStyle, width: 140 }}
                      >
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                      <select
                        value={editForm.depth}
                        onChange={(e) => setEditForm({ ...editForm, depth: parseInt(e.target.value) })}
                        style={{ ...inputStyle, width: 120 }}
                      >
                        <option value={0}>Section</option>
                        <option value={1}>Subsection</option>
                        <option value={2}>Module</option>
                      </select>
                      <div style={{ flex: 1 }} />
                      <button onClick={() => setEditing(null)} style={cancelBtnStyle}>Cancel</button>
                      <button onClick={saveEdit} style={saveBtnStyle}>Save</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add module */}
      {adding ? (
        <div style={{
          marginTop: 12,
          padding: 14,
          background: "white",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              value={newForm.title}
              onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
              placeholder="Module title"
              style={inputStyle}
              autoFocus
            />
            <textarea
              value={newForm.desc}
              onChange={(e) => setNewForm({ ...newForm, desc: e.target.value })}
              placeholder="Description"
              rows={2}
              style={{ ...inputStyle, resize: "vertical" }}
            />
            <input
              value={newForm.tables}
              onChange={(e) => setNewForm({ ...newForm, tables: e.target.value })}
              placeholder="Tables/Figures"
              style={inputStyle}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <select
                value={newForm.status}
                onChange={(e) => setNewForm({ ...newForm, status: e.target.value })}
                style={{ ...inputStyle, width: 140 }}
              >
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <select
                value={newForm.depth}
                onChange={(e) => setNewForm({ ...newForm, depth: parseInt(e.target.value) })}
                style={{ ...inputStyle, width: 120 }}
              >
                <option value={0}>Section</option>
                <option value={1}>Subsection</option>
                <option value={2}>Module</option>
              </select>
              <div style={{ flex: 1 }} />
              <button onClick={() => setAdding(false)} style={cancelBtnStyle}>Cancel</button>
              <button onClick={addModule} disabled={!newForm.title.trim()} style={saveBtnStyle}>Add</button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: "#64748b",
            background: "none",
            border: "1.5px dashed #cbd5e1",
            borderRadius: 8,
            padding: "10px 0",
            width: "100%",
            cursor: "pointer",
            marginTop: 12,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.target.style.borderColor = "#94a3b8"; e.target.style.color = "#475569"; }}
          onMouseLeave={(e) => { e.target.style.borderColor = "#cbd5e1"; e.target.style.color = "#64748b"; }}
        >
          + Add module
        </button>
      )}

      {/* Progress bar */}
      <div style={{
        marginTop: 24,
        padding: "12px 14px",
        background: "white",
        borderRadius: 8,
        border: "1px solid #e8e8e4",
      }}>
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          color: "#94a3b8",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          fontWeight: 600,
        }}>
          Progress
        </div>
        <div style={{
          height: 6,
          background: "#f1f5f9",
          borderRadius: 3,
          overflow: "hidden",
          display: "flex",
        }}>
          {["done", "revision", "needs-work", "missing"].map((s) => {
            const pct = (counts[s] / modules.length) * 100;
            return pct > 0 ? (
              <div
                key={s}
                style={{
                  width: `${pct}%`,
                  background: STATUS_CONFIG[s].color,
                  transition: "width 0.3s",
                }}
                title={`${STATUS_CONFIG[s].label}: ${counts[s]}`}
              />
            ) : null;
          })}
        </div>
        <div style={{
          display: "flex",
          gap: 16,
          marginTop: 6,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          color: "#94a3b8",
        }}>
          {["done", "revision", "needs-work", "missing"].map((s) => (
            <span key={s}>
              <span style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: STATUS_CONFIG[s].color,
                marginRight: 4,
                verticalAlign: "middle",
              }} />
              {counts[s]} {STATUS_CONFIG[s].label.toLowerCase()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const actionBtnStyle = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13,
  background: "none",
  border: "none",
  color: "#94a3b8",
  cursor: "pointer",
  padding: "2px 5px",
  borderRadius: 4,
  lineHeight: 1,
};

const inputStyle = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13,
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid #e2e8f0",
  outline: "none",
  background: "white",
  width: "100%",
  boxSizing: "border-box",
};

const saveBtnStyle = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 12,
  fontWeight: 600,
  padding: "6px 16px",
  borderRadius: 6,
  border: "none",
  background: "#1e293b",
  color: "white",
  cursor: "pointer",
};

const cancelBtnStyle = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 12,
  padding: "6px 16px",
  borderRadius: 6,
  border: "1px solid #e2e8f0",
  background: "white",
  color: "#64748b",
  cursor: "pointer",
};

const toolbarBtnStyle = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 11,
  fontWeight: 500,
  padding: "5px 12px",
  borderRadius: 6,
  border: "1px solid #e2e8f0",
  background: "white",
  color: "#475569",
  cursor: "pointer",
  transition: "all 0.12s",
};
