import React, { useEffect, useMemo, useState } from "react";

export default function Workdays({ onBack }) {
  const [p, setP] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setP((x) => Math.min(100, x + 1)), 22);
    return () => window.clearInterval(t);
  }, []);

  const label = useMemo(() => {
    if (p < 18) return "gathering notes";
    if (p < 42) return "warming lights";
    if (p < 72) return "aligning moments";
    if (p < 95) return "almost there";
    return "ready";
  }, [p]);

  return (
    <div style={styles.root}>
      <div style={styles.bgA} />
      <div style={styles.bgB} />
      <div style={styles.grain} />

      <button type="button" onClick={onBack} style={styles.back}>
        ← Back to explore
      </button>

      <div style={styles.center}>
        <div style={styles.badge}>Workdaysss</div>
        <div style={styles.title}>Loading chapter</div>
        <div style={styles.sub}>
          This one is intentionally slow—like a deep breath before the day begins.
        </div>

        <div style={styles.ringWrap} aria-hidden="true">
          <div style={styles.ringOuter} />
          <div style={styles.ringInner} />
          <div style={styles.spark} />
        </div>

        <div style={styles.progressRow}>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${p}%` }} />
          </div>
          <div style={styles.progressMeta}>
            <span style={styles.progressText}>{label}</span>
            <span style={styles.progressPct}>{p}%</span>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06060e; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { transform: scale(1); opacity: .75; } 50% { transform: scale(1.05); opacity: 1; } }
        @keyframes drift { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(14px,-10px,0); } }
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
  bgA: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(900px 620px at 18% 20%, rgba(52,211,153,0.12) 0%, transparent 60%), radial-gradient(920px 700px at 86% 84%, rgba(99,102,241,0.14) 0%, transparent 62%), radial-gradient(700px 520px at 58% 50%, rgba(245,201,122,0.08) 0%, transparent 62%)",
    filter: "blur(10px)",
    opacity: 0.85,
    pointerEvents: "none",
    zIndex: 0,
  },
  bgB: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(1200px 800px at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 62%), linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.6) 100%)",
    pointerEvents: "none",
    zIndex: 1,
  },
  grain: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 2,
    opacity: 0.10,
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E\")",
    mixBlendMode: "overlay",
  },
  back: {
    position: "fixed",
    top: "18px",
    left: "18px",
    zIndex: 10,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.86)",
    borderRadius: "999px",
    padding: "10px 12px",
    cursor: "pointer",
    fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.06em",
    fontSize: "12px",
    backdropFilter: "blur(14px)",
  },
  center: {
    position: "relative",
    zIndex: 5,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "90px 22px 60px",
    textAlign: "center",
    gap: "12px",
  },
  badge: {
    fontSize: "10px",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "rgba(52,211,153,0.95)",
    background: "rgba(52,211,153,0.10)",
    border: "1px solid rgba(52,211,153,0.18)",
    padding: "8px 12px",
    borderRadius: "999px",
    backdropFilter: "blur(14px)",
  },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: "italic",
    fontWeight: 300,
    fontSize: "clamp(44px, 7vw, 86px)",
    letterSpacing: "0.02em",
    textShadow: "0 30px 120px rgba(0,0,0,0.75)",
  },
  sub: {
    maxWidth: "720px",
    fontSize: "12px",
    letterSpacing: "0.06em",
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.7,
    marginBottom: "10px",
  },
  ringWrap: {
    width: "260px",
    height: "260px",
    position: "relative",
    margin: "10px 0 6px",
  },
  ringOuter: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.35)",
    background:
      "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08) 0%, transparent 60%)",
    animation: "spin 10s linear infinite",
  },
  ringInner: {
    position: "absolute",
    inset: "28px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.10)",
    background:
      "radial-gradient(circle at 60% 60%, rgba(99,102,241,0.18) 0%, transparent 62%), radial-gradient(circle at 30% 30%, rgba(52,211,153,0.14) 0%, transparent 62%)",
    filter: "blur(0.2px)",
    animation: "pulse 2.6s ease-in-out infinite",
  },
  spark: {
    position: "absolute",
    left: "62%",
    top: "18%",
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(245,201,122,0.38) 0%, transparent 70%)",
    filter: "blur(10px)",
    animation: "drift 3.8s ease-in-out infinite",
  },
  progressRow: {
    width: "min(640px, 92vw)",
    marginTop: "8px",
  },
  progressTrack: {
    height: "12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    overflow: "hidden",
    backdropFilter: "blur(14px)",
  },
  progressFill: {
    height: "100%",
    borderRadius: "999px",
    background:
      "linear-gradient(90deg, rgba(52,211,153,0.55) 0%, rgba(245,201,122,0.45) 50%, rgba(99,102,241,0.55) 100%)",
    transition: "width 280ms cubic-bezier(0.16, 1, 0.3, 1)",
  },
  progressMeta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "10px",
    color: "rgba(255,255,255,0.55)",
    fontSize: "11px",
    letterSpacing: "0.08em",
  },
  progressText: { textTransform: "uppercase" },
  progressPct: { color: "rgba(255,255,255,0.75)" },
};

