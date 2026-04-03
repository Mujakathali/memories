import { useEffect, useState } from "react";
import Book from "./Book";
import Home from "./Home";
import MemoryGallery from "./MemoryGallery";
import Workdays from "./Workdays";

const OPEN_DATE = new Date(2026, 8, 24, 0, 0, 0, 0); // 24/09/2026 (local time)

const getCountdownParts = () => {
  const now = Date.now();
  const ms = Math.max(0, OPEN_DATE.getTime() - now);

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return { ms, days, hours, minutes, seconds };
};

function App() {
  const [authed, setAuthed] = useState(false);
  const [view, setView] = useState("home"); // home | gallery | book | workdays
  const [section, setSection] = useState("All");
  const [bookGateOpen, setBookGateOpen] = useState(false);
  const [bookPin, setBookPin] = useState("");
  const [bookShake, setBookShake] = useState(false);
  const [countdown, setCountdown] = useState(() => getCountdownParts());

  useEffect(() => {
    if (authed) return undefined;
    const check = () => {
      if (Date.now() >= OPEN_DATE.getTime()) {
        setAuthed(true);
        setView("home");
      }
    };
    check();
    const t = window.setInterval(check, 60 * 1000);
    return () => window.clearInterval(t);
  }, [authed]);

  useEffect(() => {
    if (authed) return undefined;
    const t = window.setInterval(() => setCountdown(getCountdownParts()), 1000);
    return () => window.clearInterval(t);
  }, [authed]);

  useEffect(() => {
    if (!authed) return undefined;
    const t = window.setTimeout(() => {
      setAuthed(false);
      setView("home");
      setSection("All");
      setBookGateOpen(false);
      setBookPin("");
    }, 30 * 60 * 1000);
    return () => window.clearTimeout(t);
  }, [authed]);

  const openBookGate = () => {
    setBookPin("");
    setBookGateOpen(true);
  };

  const closeBookGate = () => {
    setBookGateOpen(false);
    setBookPin("");
  };

  const submitBookPin = () => {
    if (bookPin === "0322") {
      setBookGateOpen(false);
      setBookPin("");
      setView("book");
      return;
    }
    setBookPin("");
    setBookShake(true);
    window.setTimeout(() => setBookShake(false), 520);
  };

  if (!authed) {
    return (
      <div style={styles.root}>
        <div style={styles.bgA} />
        <div style={styles.bgB} />
        <div style={styles.bgC} />
        <div style={styles.noise} />

        <div style={styles.center}>
          <div style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.star}>✦</span>
              <span style={styles.brand}>Memora</span>
            </div>
            <div style={styles.title}>Love, locked in time</div>
            <div style={styles.sub}>
              {countdown.ms <= 0 ? (
                <span style={styles.countdownFinal}>Open on 24/09/2026… on your bday</span>
              ) : (
                <div style={styles.countdownWrap} aria-label="Countdown">
                  <div style={styles.countdownItem}>
                    <div style={styles.countdownNum}>{countdown.days}</div>
                    <div style={styles.countdownLab}>Days</div>
                  </div>
                  <div style={styles.countdownSep}>:</div>
                  <div style={styles.countdownItem}>
                    <div style={styles.countdownNum}>{String(countdown.hours).padStart(2, "0")}</div>
                    <div style={styles.countdownLab}>Hours</div>
                  </div>
                  <div style={styles.countdownSep}>:</div>
                  <div style={styles.countdownItem}>
                    <div style={styles.countdownNum}>{String(countdown.minutes).padStart(2, "0")}</div>
                    <div style={styles.countdownLab}>Mins</div>
                  </div>
                  <div style={styles.countdownSep}>:</div>
                  <div style={styles.countdownItem}>
                    <div style={styles.countdownNum}>{String(countdown.seconds).padStart(2, "0")}</div>
                    <div style={styles.countdownLab}>Secs</div>
                  </div>
                </div>
              )}
            </div>
            <div style={styles.lockHint}>It will open on your bday drum uh</div>
          </div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #06060e; }
        `}</style>
      </div>
    );
  }

  // Keep the Book PIN gate above any view.
  const bookGate = bookGateOpen ? (
    <div style={styles.gateOverlay} onClick={closeBookGate}>
      <div
        style={{ ...styles.gateCard, ...(bookShake ? styles.shake : {}) }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.gateTop}>
          <span style={styles.gateTag}>#Book</span>
          <button type="button" onClick={closeBookGate} style={styles.gateClose}>
            ✕
          </button>
        </div>
        <div style={styles.gateTitle}>Open the book</div>
        <div style={styles.gateSub}>Enter the 4-digit pin</div>
        <input
          value={bookPin}
          onChange={(e) => setBookPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitBookPin();
          }}
          inputMode="numeric"
          maxLength={4}
          placeholder="••••"
          style={styles.gateInput}
          autoFocus
        />
        <button
          type="button"
          onClick={submitBookPin}
          style={{ ...styles.gateBtn, opacity: bookPin.length === 4 ? 1 : 0.6 }}
          disabled={bookPin.length !== 4}
        >
          Unlock
        </button>
      </div>
    </div>
  ) : null;

  if (view === "book") {
    return (
      <>
        <Book onBack={() => setView("home")} />
        {bookGate}
      </>
    );
  }

  if (view === "workdays") {
    return <Workdays onBack={() => setView("home")} />;
  }

  if (view === "home") {
    return (
      <>
        <Home
          onOpenBook={openBookGate}
          onOpenSection={(s) => {
            if (s === "Workdaysss") {
              setView("workdays");
              return;
            }
            setSection(s);
            setView("gallery");
          }}
        />
        {bookGate}
      </>
    );
  }

  return (
    <>
      <MemoryGallery
        onOpenBook={openBookGate}
        activeTag={section}
        onActiveTagChange={(t) => setSection(t)}
        onGoHome={() => setView("home")}
      />
      {bookGate}
    </>
  );
}

export default App;

const styles = {
  root: {
    minHeight: "100vh",
    background: "#06060e",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'DM Mono', monospace",
    color: "#fff",
  },
  bgA: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(900px 620px at 18% 12%, rgba(244,114,182,0.16) 0%, transparent 60%), radial-gradient(920px 700px at 86% 84%, rgba(99,102,241,0.14) 0%, transparent 62%), radial-gradient(700px 520px at 55% 58%, rgba(52,211,153,0.08) 0%, transparent 62%)",
    filter: "blur(12px)",
    opacity: 0.8,
    pointerEvents: "none",
  },
  bgB: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(1200px 800px at 40% 50%, rgba(255,255,255,0.05) 0%, transparent 62%)",
    opacity: 0.65,
    pointerEvents: "none",
  },
  bgC: {
    position: "fixed",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%)",
    pointerEvents: "none",
  },
  noise: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    opacity: 0.12,
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E\")",
    mixBlendMode: "overlay",
  },
  center: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    position: "relative",
    zIndex: 2,
  },
  card: {
    width: "min(520px, 94vw)",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "22px",
    padding: "30px",
    backdropFilter: "blur(18px)",
    boxShadow: "0 40px 120px rgba(0,0,0,0.62)",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
  },
  star: { color: "#f5c97a", fontSize: "18px" },
  brand: {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 300,
    letterSpacing: "0.12em",
    fontSize: "22px",
  },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: "italic",
    fontWeight: 300,
    fontSize: "38px",
    lineHeight: 1.1,
    marginBottom: "10px",
  },
  sub: {
    color: "rgba(255,255,255,0.55)",
    letterSpacing: "0.06em",
    fontSize: "12px",
    marginBottom: "18px",
  },
  countdownWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    backdropFilter: "blur(16px)",
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
  },
  countdownItem: {
    minWidth: "62px",
    textAlign: "center",
  },
  countdownNum: {
    fontSize: "18px",
    letterSpacing: "0.14em",
    color: "rgba(255,255,255,0.92)",
  },
  countdownLab: {
    marginTop: "6px",
    fontSize: "10px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.38)",
  },
  countdownSep: {
    color: "rgba(245,201,122,0.65)",
    fontSize: "18px",
    opacity: 0.9,
  },
  countdownFinal: {
    display: "block",
    textAlign: "center",
    padding: "10px 12px",
    borderRadius: "16px",
    background: "rgba(245,201,122,0.10)",
    border: "1px solid rgba(245,201,122,0.22)",
    color: "rgba(255,255,255,0.92)",
    letterSpacing: "0.06em",
  },
  lockHint: {
    marginTop: "10px",
    textAlign: "center",
    fontSize: "10px",
    letterSpacing: "0.12em",
    color: "rgba(255,255,255,0.30)",
  },
  gateOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(6,6,14,0.86)",
    backdropFilter: "blur(18px)",
    zIndex: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  gateCard: {
    width: "min(460px, 94vw)",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "20px",
    padding: "22px",
    backdropFilter: "blur(18px)",
    boxShadow: "0 40px 120px rgba(0,0,0,0.62)",
  },
  gateTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  gateTag: {
    fontSize: "11px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "rgba(245,201,122,0.9)",
  },
  gateClose: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff",
    cursor: "pointer",
  },
  gateTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 300,
    fontSize: "34px",
    lineHeight: 1.1,
    marginBottom: "8px",
  },
  gateSub: {
    fontSize: "12px",
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.55)",
    marginBottom: "14px",
  },
  gateInput: {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "14px",
    padding: "14px 14px",
    outline: "none",
    color: "#fff",
    fontSize: "22px",
    letterSpacing: "0.35em",
    textAlign: "center",
    fontFamily: "'DM Mono', monospace",
    marginBottom: "12px",
  },
  gateBtn: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1px solid rgba(245,201,122,0.22)",
    background: "rgba(245,201,122,0.16)",
    color: "#fff",
    cursor: "pointer",
    fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.08em",
  },
};

