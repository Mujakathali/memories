
const tagColors = {
  Adventure: "#34d399",
  Thoughts: "#60a5fa",
  "Coimbatore Days": "#f5c97a",
  "Chennai Days": "#60a5fa",
  "School Days": "#a78bfa",
  Workdaysss: "#34d399",
  Love: "#fb7185",
  Book: "#f5c97a",
};

export default function Home({ onOpenSection, onOpenBook }) {
  const sections = [
    "Adventure",
    "Thoughts",
    "Coimbatore Days",
    "Chennai Days",
    "School Days",
    "Workdaysss",
    "Love",
    "Book",
  ];

  return (
    <div style={styles.root}>
      <div style={styles.bg} />
      <div style={styles.vignette} />
      <div style={styles.noise} />
      <div style={styles.orbA} aria-hidden="true" />
      <div style={styles.orbB} aria-hidden="true" />
      <div style={styles.orbC} aria-hidden="true" />

      <div style={styles.brand}>
        <span style={styles.star}>✦</span>
        <span style={styles.word}>Memora</span>
      </div>

      <div style={styles.bottom}>
        <div style={styles.hero}>
          <div style={styles.kicker}>Tonight’s index</div>
          <div style={styles.subtitle}>Choose a chapter</div>
          <div style={styles.desc}>
            Tap a chapter to step inside. The rest of the world can wait.
          </div>
        </div>

        <div style={styles.sheet}>
          <div style={styles.sheetTopEdge} aria-hidden="true" />
          <div style={styles.grid}>
            {sections.map((s) => (
              <button
                key={s}
                type="button"
                className="home-card"
                onClick={() => (s === "Book" ? onOpenBook?.() : onOpenSection?.(s))}
                style={styles.card}
              >
                <span style={{ ...styles.tag, color: tagColors[s] || "#fff" }}>
                  #{s}
                </span>
                <span style={styles.title}>{s}</span>
                <span style={styles.hint}>
                  {s === "Book" ? "Open scrapbook" : "Open memories"}
                </span>
                <span
                  style={{
                    ...styles.cardGlow,
                    background: `radial-gradient(circle at 30% 30%, ${tagColors[s] || "rgba(255,255,255,0.35)"
                      }22 0%, transparent 60%)`,
                  }}
                  aria-hidden="true"
                />
                <span style={styles.cardSheen} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06060e; }
        .home-card {
          transform: translateY(0);
        }
        .home-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 28px 90px rgba(0,0,0,0.65) !important;
          border-color: rgba(255,255,255,0.22) !important;
        }
        .home-card:focus-visible {
          outline: 2px solid rgba(245,201,122,0.65);
          outline-offset: 3px;
        }
        .home-card::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 18px;
          padding: 1px;
          background: linear-gradient(120deg, rgba(245,201,122,0.00), rgba(245,201,122,0.28), rgba(96,165,250,0.18), rgba(251,113,133,0.22), rgba(245,201,122,0.00));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.0;
          transition: opacity 0.35s ease;
          pointer-events: none;
        }
        .home-card:hover::before { opacity: 0.9; }
        .home-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 18px;
          background: radial-gradient(600px 180px at 30% 10%, rgba(255,255,255,0.10) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.35s ease;
          pointer-events: none;
        }
        .home-card:hover::after { opacity: 1; }
        @keyframes floatOrb {
          0% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(0,-18px,0) scale(1.04); }
          100% { transform: translate3d(0,0,0) scale(1); }
        }
        @keyframes drift {
          0% { transform: translate3d(0,0,0); opacity: 0.55; }
          50% { transform: translate3d(14px,-10px,0); opacity: 0.75; }
          100% { transform: translate3d(0,0,0); opacity: 0.55; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#06060e",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'DM Mono', monospace",
    color: "#fff",
  },
  bg: {
    position: "fixed",
    inset: 0,
    backgroundImage: "url(/media/photos/bg.jpeg)",
    backgroundSize: "cover",
    backgroundPosition: "center 42%",
    filter: "blur(6px) saturate(1.05)",
    transform: "scale(1.04)",
    opacity: 0.95,
    pointerEvents: "none",
    zIndex: 0,
  },
  vignette: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(900px 520px at 50% 35%, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.72) 70%), linear-gradient(180deg, rgba(6,6,14,0.25) 0%, rgba(6,6,14,0.85) 100%)",
    pointerEvents: "none",
    zIndex: 1,
  },
  noise: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 2,
    opacity: 0.10,
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E\")",
    mixBlendMode: "overlay",
  },
  brand: {
    position: "absolute",
    top: "18px",
    left: "22px",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(14px)",
    zIndex: 4,
  },
  star: { color: "#f5c97a" },
  word: {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 300,
    letterSpacing: "0.12em",
    fontSize: "22px",
  },
  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
    padding: "18px 22px 28px",
  },
  hero: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "0 6px 14px",
    textAlign: "center",
  },
  kicker: {
    fontSize: "10px",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.42)",
    marginBottom: "10px",
  },
  subtitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: "italic",
    fontSize: "clamp(22px, 3vw, 34px)",
    color: "rgba(255,255,255,0.78)",
    textAlign: "center",
    textShadow: "0 18px 60px rgba(0,0,0,0.7)",
  },
  desc: {
    marginTop: "10px",
    fontSize: "12px",
    letterSpacing: "0.06em",
    color: "rgba(255,255,255,0.48)",
  },
  sheet: {
    maxWidth: "1100px",
    margin: "0 auto",
    borderRadius: "22px",
    padding: "16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(18px)",
    boxShadow: "0 40px 140px rgba(0,0,0,0.70)",
    position: "relative",
    overflow: "hidden",
  },
  sheetTopEdge: {
    position: "absolute",
    inset: "0 0 auto 0",
    height: "46px",
    background:
      "radial-gradient(900px 120px at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 62%)",
    opacity: 0.65,
    pointerEvents: "none",
  },
  grid: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
  },
  card: {
    textAlign: "left",
    borderRadius: "18px",
    padding: "18px",
    cursor: "pointer",
    background:
      "linear-gradient(180deg, rgba(10,10,18,0.62) 0%, rgba(10,10,18,0.38) 100%)",
    border: "1px solid rgba(255,255,255,0.14)",
    backdropFilter: "blur(14px)",
    transition: "all 0.25s ease",
    display: "grid",
    gap: "8px",
    boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
    position: "relative",
    overflow: "hidden",
  },
  cardGlow: {
    position: "absolute",
    inset: "-40% -40% auto auto",
    width: "220px",
    height: "220px",
    opacity: 0.9,
    filter: "blur(18px)",
    pointerEvents: "none",
  },
  cardSheen: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.06) 35%, transparent 60%)",
    transform: "translateX(-40%)",
    opacity: 0.55,
    pointerEvents: "none",
    mixBlendMode: "screen",
  },
  tag: {
    fontSize: "10px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    textShadow: "0 10px 30px rgba(0,0,0,0.65)",
    position: "relative",
    zIndex: 1,
  },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 300,
    fontSize: "28px",
    lineHeight: 1.05,
    color: "rgba(255,255,255,0.92)",
    textShadow: "0 14px 40px rgba(0,0,0,0.75)",
    position: "relative",
    zIndex: 1,
  },
  hint: {
    fontSize: "11px",
    letterSpacing: "0.06em",
    color: "rgba(255,255,255,0.62)",
    textShadow: "0 10px 30px rgba(0,0,0,0.65)",
    position: "relative",
    zIndex: 1,
  },
  orbA: {
    position: "fixed",
    width: "520px",
    height: "520px",
    left: "-180px",
    top: "-150px",
    background:
      "radial-gradient(circle, rgba(99,102,241,0.20) 0%, transparent 70%)",
    borderRadius: "50%",
    filter: "blur(10px)",
    opacity: 0.7,
    animation: "floatOrb 10s ease-in-out infinite",
    pointerEvents: "none",
    zIndex: 2,
  },
  orbB: {
    position: "fixed",
    width: "520px",
    height: "520px",
    right: "-200px",
    bottom: "-220px",
    background:
      "radial-gradient(circle, rgba(244,114,182,0.18) 0%, transparent 70%)",
    borderRadius: "50%",
    filter: "blur(12px)",
    opacity: 0.65,
    animation: "floatOrb 12s ease-in-out infinite",
    pointerEvents: "none",
    zIndex: 2,
  },
  orbC: {
    position: "fixed",
    width: "360px",
    height: "360px",
    left: "55%",
    top: "22%",
    background:
      "radial-gradient(circle, rgba(245,201,122,0.14) 0%, transparent 70%)",
    borderRadius: "50%",
    filter: "blur(16px)",
    opacity: 0.55,
    animation: "drift 9s ease-in-out infinite",
    pointerEvents: "none",
    zIndex: 2,
  },
};

