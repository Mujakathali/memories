import { useMemo, useState } from "react";

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const basePages = [
  {
    title: "Trip to the Beach",
    subtitle: "July 2021",
    palette: { paper: "#f6f0e6", ink: "#3a2d2b", accent: "#ff7aa8" },
    stickers: ["🌈", "⭐", "🧸", "📸", "🍦"],
  },
  {
    title: "Road Trip!",
    subtitle: "Remember that epic ride",
    palette: { paper: "#f4efe7", ink: "#2f2a2a", accent: "#7c4dff" },
    stickers: ["🚗", "🗺️", "✨", "📍", "🎵"],
  },
  {
    title: "Best Buds",
    subtitle: "Good times forever",
    palette: { paper: "#f7f2ea", ink: "#2a2a2a", accent: "#ffb020" },
    stickers: ["💛", "📎", "🌻", "🫶", "🎉"],
  },
];

function Polaroid({ src, caption }) {
  return (
    <div style={styles.polaroid}>
      <div style={styles.polaroidImgWrap}>
        <div style={styles.polaroidImgFallback}>{src ? "IMG" : "IMG"}</div>
        {src ? <img src={src} alt="" style={styles.polaroidImg} /> : null}
      </div>
      <div style={styles.polaroidCaption}>{caption || "—"}</div>
    </div>
  );
}

export default function Book({ onBack }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [turn, setTurn] = useState(null); // { dir: "next"|"prev", from:number, to:number } | null

  const [itemsByPage, setItemsByPage] = useState(() =>
    Object.fromEntries(basePages.map((_, i) => [i, []]))
  );

  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState("text"); // text | image | letter
  const [addText, setAddText] = useState("");
  const [addFileUrl, setAddFileUrl] = useState("");
  const addFileUrlRef = useState({ current: "" })[0];

  const page = basePages[pageIndex];

  const currentItems = itemsByPage[pageIndex] || [];

  const canPrev = pageIndex > 0;
  const canNext = pageIndex < basePages.length - 1;

  const randomPlacement = () => {
    const x = Math.round(12 + Math.random() * 60);
    const y = Math.round(10 + Math.random() * 62);
    const r = Math.round(-8 + Math.random() * 16);
    return { x, y, r };
  };

  const openAdd = () => {
    setAddOpen(true);
    setAddType("text");
    setAddText("");
    if (addFileUrlRef.current) URL.revokeObjectURL(addFileUrlRef.current);
    addFileUrlRef.current = "";
    setAddFileUrl("");
  };

  const closeAdd = () => {
    if (addFileUrlRef.current) URL.revokeObjectURL(addFileUrlRef.current);
    addFileUrlRef.current = "";
    setAddFileUrl("");
    setAddOpen(false);
  };

  const submitAdd = () => {
    const text = addText.trim();
    const src = addFileUrl;
    const place = randomPlacement();
    const item = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: addType,
      text,
      src,
      ...place,
    };
    if (addType === "image" && !src) return;
    setItemsByPage((m) => ({
      ...m,
      [pageIndex]: [...(m[pageIndex] || []), item],
    }));
    setAddOpen(false);
  };

  const turnTo = (nextIdx) => {
    if (nextIdx === pageIndex) return;
    const dir = nextIdx > pageIndex ? "next" : "prev";
    setTurn({ dir, from: pageIndex, to: nextIdx });
    window.setTimeout(() => {
      setPageIndex(nextIdx);
      setTurn(null);
    }, 820);
  };

  const leftPage = useMemo(() => {
    const p = basePages[clamp(pageIndex - 1, 0, basePages.length - 1)];
    return p;
  }, [pageIndex]);

  return (
    <div style={styles.root}>
      <div style={styles.galaxyA} />
      <div style={styles.galaxyB} />
      <div style={styles.dust} />

      <div style={styles.topBar}>
        <button type="button" onClick={onBack} style={styles.backBtn}>
          ← Back
        </button>
        <div style={styles.bookMark}>
          <span style={styles.bookMarkDot}>✦</span>
          <span style={styles.bookMarkText}>Book</span>
        </div>
      </div>

      <div style={styles.stage}>
        <div style={styles.book}>
          <div style={styles.bookShadow} />
          <div style={styles.coverBack} />
          <div style={styles.spine} />
          <div style={styles.coverEdgeLeft} />
          <div style={styles.coverEdgeRight} />

          <div style={styles.pageLeft}>
            <div
              style={{
                ...styles.paper,
                background: leftPage.palette.paper,
                color: leftPage.palette.ink,
              }}
            >
              <div style={styles.pageHeader}>
                <div style={styles.pageTitle}>{leftPage.title}</div>
                <div style={styles.pageSub}>{leftPage.subtitle}</div>
              </div>
              <div style={styles.stickerRow}>
                {leftPage.stickers.map((s, idx) => (
                  <div key={`${s}-${idx}`} style={styles.sticker}>
                    {s}
                  </div>
                ))}
              </div>
              <div style={styles.mockGrid}>
                <Polaroid
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80"
                  caption="Graduation Day"
                />
                <div style={styles.noteCard}>
                  <div style={styles.noteTape} />
                  <div style={styles.noteTitle}>Good times!</div>
                  <div style={styles.noteBody}>
                    We collect days like these — the tiny details, the laughter, the
                    light.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.pageRight}>
            <div
              style={{
                ...styles.paper,
                background: page.palette.paper,
                color: page.palette.ink,
                borderLeft: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <div style={styles.pageHeader}>
                <div style={styles.pageTitle}>{page.title}</div>
                <div style={styles.pageSub}>{page.subtitle}</div>
              </div>

              <div style={styles.canvasArea}>
                <div style={styles.pin} />
                <div style={styles.pin2} />

                <div style={styles.pageElements}>
                  <div style={{ ...styles.ribbon, background: page.palette.accent }} />
                  <div style={styles.cardA}>
                    <div style={styles.tape} />
                    <div style={styles.cardATitle}>A small letter</div>
                    <div style={styles.cardABody}>
                      If we ever forget: you were my favorite place to be.
                    </div>
                  </div>
                  <div style={styles.cardB}>
                    <div style={styles.paperClip}>📎</div>
                    <Polaroid
                      src="https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600&q=80"
                      caption="City lights"
                    />
                  </div>
                </div>

                {currentItems.map((it) => (
                  <div
                    key={it.id}
                    style={{
                      ...styles.userItem,
                      left: `${it.x}%`,
                      top: `${it.y}%`,
                      transform: `translate(-50%, -50%) rotate(${it.r}deg)`,
                    }}
                  >
                    {it.type === "image" ? (
                      <Polaroid src={it.src} caption={it.text || "Memory"} />
                    ) : it.type === "letter" ? (
                      <div style={styles.letter}>
                        <div style={styles.letterSeal}>♥</div>
                        <div style={styles.letterText}>
                          {it.text || "A little note…"}
                        </div>
                      </div>
                    ) : (
                      <div style={styles.sticky}>
                        <div style={styles.stickyTop} />
                        <div style={styles.stickyText}>{it.text || "—"}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {turn && (
            <div
              style={{
                ...styles.flipSheet,
                ...(turn.dir === "next" ? styles.flipNext : styles.flipPrev),
              }}
              aria-hidden="true"
            >
              <div style={styles.flipFaceFront}>
                <div
                  style={{
                    ...styles.paper,
                    background: basePages[turn.from].palette.paper,
                    color: basePages[turn.from].palette.ink,
                    borderLeft: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  <div style={styles.pageHeader}>
                    <div style={styles.pageTitle}>{basePages[turn.from].title}</div>
                    <div style={styles.pageSub}>{basePages[turn.from].subtitle}</div>
                  </div>
                  <div style={styles.canvasArea} />
                </div>
              </div>
              <div style={styles.flipFaceBack}>
                <div
                  style={{
                    ...styles.paper,
                    background: basePages[turn.to].palette.paper,
                    color: basePages[turn.to].palette.ink,
                    borderLeft: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  <div style={styles.pageHeader}>
                    <div style={styles.pageTitle}>{basePages[turn.to].title}</div>
                    <div style={styles.pageSub}>{basePages[turn.to].subtitle}</div>
                  </div>
                  <div style={styles.canvasArea} />
                </div>
              </div>
            </div>
          )}

          <div style={styles.controls}>
            <button
              type="button"
              onClick={() => canPrev && turnTo(pageIndex - 1)}
              style={{ ...styles.ctrlBtn, opacity: canPrev ? 1 : 0.4 }}
              disabled={!canPrev}
            >
              Prev
            </button>
            <button type="button" onClick={openAdd} style={styles.ctrlAdd}>
              ＋ Add to page
            </button>
            <button
              type="button"
              onClick={() => canNext && turnTo(pageIndex + 1)}
              style={{ ...styles.ctrlBtn, opacity: canNext ? 1 : 0.4 }}
              disabled={!canNext}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {addOpen && (
        <div style={styles.modalOverlay} onClick={closeAdd}>
          <div style={styles.modalInner} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTop}>
              <div style={styles.modalTitle}>Add to this page</div>
              <button type="button" onClick={closeAdd} style={styles.modalClose}>
                ✕
              </button>
            </div>
            <div style={styles.modalRow}>
              <div style={styles.modalLabel}>Type</div>
              <div style={styles.pills}>
                {["text", "image", "letter"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAddType(t)}
                    style={{
                      ...styles.pill,
                      background:
                        addType === t
                          ? "rgba(0,0,0,0.10)"
                          : "rgba(0,0,0,0.04)",
                      borderColor:
                        addType === t
                          ? "rgba(0,0,0,0.18)"
                          : "rgba(0,0,0,0.10)",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {addType === "image" && (
              <div style={styles.modalRow}>
                <div style={styles.modalLabel}>Upload</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files && e.target.files[0];
                    if (!f) return;
                    if (addFileUrlRef.current) URL.revokeObjectURL(addFileUrlRef.current);
                    const url = URL.createObjectURL(f);
                    addFileUrlRef.current = url;
                    setAddFileUrl(url);
                  }}
                  style={styles.modalInput}
                />
              </div>
            )}
            <div style={styles.modalRow}>
              <div style={styles.modalLabel}>{addType === "image" ? "Caption" : "Text"}</div>
              <textarea
                value={addText}
                onChange={(e) => setAddText(e.target.value)}
                placeholder="Write something…"
                style={styles.modalTextarea}
              />
            </div>
            <button type="button" onClick={submitAdd} style={styles.modalBtn}>
              Add
            </button>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06060e; }
        @keyframes pageFlipNext {
          0% { transform: translateZ(0) rotateY(0deg); }
          100% { transform: translateZ(0) rotateY(-180deg); }
        }
        @keyframes pageFlipPrev {
          0% { transform: translateZ(0) rotateY(0deg); }
          100% { transform: translateZ(0) rotateY(180deg); }
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
  galaxyA: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(900px 600px at 20% 10%, rgba(99,102,241,0.12) 0%, transparent 60%), radial-gradient(900px 700px at 85% 85%, rgba(244,114,182,0.10) 0%, transparent 62%), radial-gradient(700px 540px at 55% 60%, rgba(52,211,153,0.07) 0%, transparent 62%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  galaxyB: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(800px 520px at 10% 80%, rgba(245,201,122,0.06) 0%, transparent 60%), radial-gradient(900px 650px at 90% 20%, rgba(167,139,250,0.06) 0%, transparent 60%)",
    pointerEvents: "none",
    zIndex: 0,
    filter: "blur(10px)",
    opacity: 0.75,
  },
  dust: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
    opacity: 0.12,
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E\")",
    mixBlendMode: "overlay",
  },
  topBar: {
    position: "fixed",
    top: "16px",
    left: "16px",
    right: "16px",
    zIndex: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.86)",
    borderRadius: "999px",
    padding: "10px 14px",
    cursor: "pointer",
    backdropFilter: "blur(12px)",
    fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.06em",
    fontSize: "12px",
  },
  bookMark: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    padding: "10px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
    backdropFilter: "blur(12px)",
  },
  bookMarkDot: { color: "#f5c97a" },
  bookMarkText: { letterSpacing: "0.12em", fontSize: "12px", color: "rgba(255,255,255,0.7)" },
  stage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "90px 18px 38px",
    position: "relative",
    zIndex: 2,
  },
  book: {
    width: "min(1100px, 96vw)",
    height: "min(680px, 74vh)",
    position: "relative",
    perspective: "1400px",
    transform: "translateZ(0)",
  },
  bookShadow: {
    position: "absolute",
    inset: "-20px -24px 44px",
    borderRadius: "30px",
    background:
      "radial-gradient(800px 420px at 50% 55%, rgba(0,0,0,0.65) 0%, transparent 70%)",
    filter: "blur(22px)",
    opacity: 0.75,
    pointerEvents: "none",
  },
  coverBack: {
    position: "absolute",
    inset: "0 0 56px",
    borderRadius: "24px",
    background:
      "linear-gradient(135deg, rgba(120,85,65,0.65), rgba(60,35,28,0.65)), radial-gradient(700px 420px at 20% 20%, rgba(255,255,255,0.10) 0%, transparent 60%)",
    boxShadow: "0 40px 120px rgba(0,0,0,0.55)",
    opacity: 0.55,
    pointerEvents: "none",
  },
  coverEdgeLeft: {
    position: "absolute",
    left: "-10px",
    top: "12px",
    bottom: "72px",
    width: "16px",
    borderRadius: "14px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(0,0,0,0.18))",
    filter: "blur(0.2px)",
    opacity: 0.8,
    pointerEvents: "none",
  },
  coverEdgeRight: {
    position: "absolute",
    right: "-10px",
    top: "12px",
    bottom: "72px",
    width: "16px",
    borderRadius: "14px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(0,0,0,0.18))",
    filter: "blur(0.2px)",
    opacity: 0.8,
    pointerEvents: "none",
  },
  spine: {
    position: "absolute",
    left: "50%",
    top: "10px",
    bottom: "60px",
    width: "14px",
    transform: "translateX(-50%)",
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.22), rgba(255,255,255,0.04), rgba(0,0,0,0.22))",
    borderRadius: "10px",
    filter: "blur(0.2px)",
    opacity: 0.9,
  },
  pageLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "50%",
    height: "calc(100% - 56px)",
    transform: "rotateY(2deg)",
    transformOrigin: "right center",
    filter: "drop-shadow(0 36px 90px rgba(0,0,0,0.55))",
  },
  pageRight: {
    position: "absolute",
    right: 0,
    top: 0,
    width: "50%",
    height: "calc(100% - 56px)",
    transformOrigin: "left center",
    transformStyle: "preserve-3d",
    filter: "drop-shadow(0 36px 90px rgba(0,0,0,0.55))",
  },
  flipSheet: {
    position: "absolute",
    right: 0,
    top: 0,
    width: "50%",
    height: "calc(100% - 56px)",
    transformOrigin: "left center",
    transformStyle: "preserve-3d",
    zIndex: 8,
    pointerEvents: "none",
  },
  flipNext: {
    animation: "pageFlipNext 820ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
  },
  flipPrev: {
    transformOrigin: "right center",
    left: 0,
    right: "auto",
    animation: "pageFlipPrev 820ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
  },
  flipFaceFront: {
    position: "absolute",
    inset: 0,
    backfaceVisibility: "hidden",
    transform: "rotateY(0deg)",
  },
  flipFaceBack: {
    position: "absolute",
    inset: 0,
    backfaceVisibility: "hidden",
    transform: "rotateY(180deg)",
  },
  paper: {
    width: "100%",
    height: "100%",
    borderRadius: "18px",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
    boxShadow:
      "0 24px 60px rgba(0,0,0,0.26), inset 0 0 0 1px rgba(0,0,0,0.08)",
  },
  pageHeader: {
    marginBottom: "14px",
  },
  pageTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 400,
    fontSize: "32px",
    letterSpacing: "0.02em",
  },
  pageSub: {
    fontSize: "12px",
    letterSpacing: "0.12em",
    opacity: 0.7,
    marginTop: "6px",
    textTransform: "uppercase",
  },
  stickerRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "14px",
  },
  sticker: {
    width: "34px",
    height: "34px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.05)",
    border: "1px dashed rgba(0,0,0,0.14)",
    transform: "rotate(-4deg)",
  },
  mockGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
    marginTop: "10px",
  },
  polaroid: {
    background: "#fff",
    borderRadius: "14px",
    padding: "10px 10px 14px",
    boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
    transform: "rotate(-2deg)",
  },
  polaroidImgWrap: {
    borderRadius: "10px",
    overflow: "hidden",
    height: "170px",
    background: "linear-gradient(135deg, rgba(0,0,0,0.06), rgba(0,0,0,0.01))",
    position: "relative",
  },
  polaroidImgFallback: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(0,0,0,0.28)",
    letterSpacing: "0.18em",
    fontSize: "12px",
  },
  polaroidImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  polaroidCaption: {
    marginTop: "10px",
    fontSize: "12px",
    color: "rgba(0,0,0,0.55)",
    letterSpacing: "0.04em",
  },
  noteCard: {
    background: "rgba(255,255,255,0.78)",
    borderRadius: "16px",
    padding: "18px",
    boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
    position: "relative",
    transform: "rotate(2deg)",
  },
  noteTape: {
    position: "absolute",
    top: "-10px",
    left: "20px",
    width: "70px",
    height: "22px",
    background: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: "6px",
    transform: "rotate(-5deg)",
  },
  noteTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: "italic",
    fontSize: "22px",
    marginBottom: "10px",
    color: "rgba(0,0,0,0.78)",
  },
  noteBody: {
    fontSize: "12px",
    lineHeight: 1.55,
    color: "rgba(0,0,0,0.62)",
  },
  canvasArea: {
    position: "relative",
    height: "calc(100% - 70px)",
    borderRadius: "14px",
    background:
      "radial-gradient(480px 300px at 20% 30%, rgba(0,0,0,0.06) 0%, transparent 60%), radial-gradient(520px 360px at 80% 70%, rgba(0,0,0,0.05) 0%, transparent 62%)",
  },
  pin: {
    position: "absolute",
    top: "14px",
    left: "18px",
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    background: "#ff4d6d",
    boxShadow: "0 10px 18px rgba(0,0,0,0.22)",
  },
  pin2: {
    position: "absolute",
    top: "20px",
    right: "22px",
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    background: "#5ad7a1",
    boxShadow: "0 10px 18px rgba(0,0,0,0.22)",
  },
  pageElements: {
    position: "absolute",
    inset: 0,
  },
  ribbon: {
    position: "absolute",
    top: "38px",
    left: "10%",
    width: "55%",
    height: "16px",
    borderRadius: "999px",
    opacity: 0.35,
    filter: "blur(0.2px)",
  },
  cardA: {
    position: "absolute",
    top: "70px",
    left: "12%",
    width: "62%",
    background: "rgba(255,255,255,0.85)",
    borderRadius: "18px",
    padding: "16px",
    transform: "rotate(-3deg)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
  },
  tape: {
    position: "absolute",
    top: "-10px",
    right: "22px",
    width: "64px",
    height: "20px",
    background: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: "6px",
    transform: "rotate(7deg)",
  },
  cardATitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: "italic",
    fontSize: "20px",
    color: "rgba(0,0,0,0.8)",
    marginBottom: "8px",
  },
  cardABody: {
    fontSize: "12px",
    lineHeight: 1.55,
    color: "rgba(0,0,0,0.62)",
  },
  cardB: {
    position: "absolute",
    bottom: "34px",
    right: "10%",
    width: "56%",
    transform: "rotate(3deg)",
  },
  paperClip: {
    position: "absolute",
    top: "-20px",
    right: "18px",
    fontSize: "22px",
    filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.22))",
  },
  userItem: {
    position: "absolute",
    transformOrigin: "center",
  },
  sticky: {
    width: "220px",
    borderRadius: "14px",
    background: "rgba(255,255,170,0.92)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.16)",
    border: "1px solid rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  stickyTop: {
    height: "14px",
    background: "rgba(0,0,0,0.04)",
  },
  stickyText: {
    padding: "14px",
    fontSize: "12px",
    color: "rgba(0,0,0,0.72)",
    lineHeight: 1.55,
  },
  letter: {
    width: "260px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.92)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.14)",
    border: "1px solid rgba(0,0,0,0.08)",
    padding: "16px",
    position: "relative",
  },
  letterSeal: {
    position: "absolute",
    top: "12px",
    right: "12px",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: "rgba(255,122,168,0.22)",
    border: "1px solid rgba(255,122,168,0.32)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(0,0,0,0.6)",
  },
  letterText: {
    paddingTop: "10px",
    fontSize: "12px",
    lineHeight: 1.6,
    color: "rgba(0,0,0,0.68)",
  },
  controls: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  ctrlBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.88)",
    borderRadius: "999px",
    padding: "10px 14px",
    cursor: "pointer",
    backdropFilter: "blur(12px)",
    fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.06em",
    fontSize: "12px",
  },
  ctrlAdd: {
    background: "rgba(245,201,122,0.14)",
    border: "1px solid rgba(245,201,122,0.22)",
    color: "rgba(255,255,255,0.92)",
    borderRadius: "999px",
    padding: "10px 16px",
    cursor: "pointer",
    backdropFilter: "blur(12px)",
    fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.08em",
    fontSize: "12px",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(6,6,14,0.85)",
    backdropFilter: "blur(16px)",
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  modalInner: {
    width: "min(560px, 96vw)",
    background: "rgba(255,255,255,0.92)",
    color: "rgba(0,0,0,0.82)",
    borderRadius: "18px",
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 28px 70px rgba(0,0,0,0.45)",
    padding: "18px",
  },
  modalTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  modalTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "28px",
  },
  modalClose: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "rgba(0,0,0,0.06)",
    border: "1px solid rgba(0,0,0,0.10)",
    cursor: "pointer",
  },
  modalRow: {
    display: "grid",
    gridTemplateColumns: "110px 1fr",
    gap: "10px",
    alignItems: "center",
    marginBottom: "10px",
  },
  modalLabel: {
    fontSize: "11px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    opacity: 0.7,
  },
  pills: { display: "flex", gap: "8px", flexWrap: "wrap" },
  pill: {
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(0,0,0,0.10)",
    background: "rgba(0,0,0,0.04)",
    cursor: "pointer",
    fontFamily: "'DM Mono', monospace",
    fontSize: "12px",
    letterSpacing: "0.06em",
  },
  modalInput: {
    width: "100%",
    borderRadius: "12px",
    border: "1px solid rgba(0,0,0,0.12)",
    padding: "10px 12px",
    outline: "none",
    fontFamily: "'DM Mono', monospace",
    fontSize: "12px",
  },
  modalTextarea: {
    width: "100%",
    minHeight: "90px",
    borderRadius: "12px",
    border: "1px solid rgba(0,0,0,0.12)",
    padding: "10px 12px",
    outline: "none",
    fontFamily: "'DM Mono', monospace",
    fontSize: "12px",
    resize: "vertical",
  },
  modalBtn: {
    width: "100%",
    marginTop: "8px",
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(0,0,0,0.06)",
    cursor: "pointer",
    fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.08em",
  },
};

