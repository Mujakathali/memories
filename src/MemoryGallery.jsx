import { useEffect, useMemo, useRef, useState } from "react";

const seedMemories = [
  {
    id: 1,
    type: "image",
    tag: "Adventure",
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    title: "Mountain Escape",
    date: "March 2024",
    note: "That sunrise we'll never forget 🌄",
    span: "tall",
  },
  {
    id: 2,
    type: "text",
    tag: "Thoughts",
    title: "A note to us",
    note:
      '"Some memories are so perfect you\'re afraid to revisit them — afraid they won\'t be as beautiful as they felt. But they always are."',
    date: "Jan 2024",
    span: "normal",
    color: "#f5c97a",
  },
  {
    id: 3,
    type: "image",
    tag: "Coimbatore Days",
    src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80",
    title: "Golden Hour",
    date: "Feb 2024",
    note: "Light like this only exists in dreams",
    span: "wide",
  },
  {
    id: 4,
    type: "video",
    tag: "School Days",
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    title: "That Silly Evening",
    date: "Dec 2023",
    note: "We laughed so hard 😂",
    span: "normal",
  },
  {
    id: 5,
    type: "image",
    tag: "Chennai Days",
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80",
    title: "The Road Trip",
    date: "Nov 2023",
    note: "Miles of music and madness",
    span: "normal",
  },
  {
    id: 6,
    type: "text",
    tag: "Love",
    title: "Favourite things",
    note:
      "☕ Coffee before noon\n🎵 Playlists at midnight\n📸 Candid shots\n🌧️ Rainy windows\n🍕 Late night slices",
    date: "Oct 2023",
    span: "normal",
    color: "#a78bfa",
  },
  {
    id: 7,
    type: "image",
    tag: "Adventure",
    src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80",
    title: "Lake at Dusk",
    date: "Sep 2023",
    note: "Still waters, loud hearts",
    span: "tall",
  },
  {
    id: 8,
    type: "image",
    tag: "Coimbatore Days",
    src: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600&q=80",
    title: "City Lights",
    date: "Aug 2023",
    note: "The city never sleeps, neither did we",
    span: "wide",
  },
  {
    id: 9,
    type: "text",
    tag: "Thoughts",
    title: "What I remember most",
    note:
      "Not the places. Not the photos. The feeling of being exactly where I was supposed to be.",
    date: "Jul 2023",
    span: "normal",
    color: "#f87171",
  },
  {
    id: 10,
    type: "image",
    tag: "Chennai Days",
    src: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80",
    title: "Forest Walk",
    date: "Jun 2023",
    note: "Getting lost on purpose",
    span: "normal",
  },
];

const tags = [
  "All",
  "Adventure",
  "Thoughts",
  "Coimbatore Days",
  "Chennai Days",
  "School Days",
  "Love",
  "Book",
];

const tagColors = {
  Adventure: "#34d399",
  Thoughts: "#60a5fa",
  "Coimbatore Days": "#f5c97a",
  "Chennai Days": "#60a5fa",
  "School Days": "#a78bfa",
  Love: "#fb7185",
  Book: "#f5c97a",
};

export default function MemoryGallery({ onOpenBook }) {
  const [memoryList, setMemoryList] = useState(() => seedMemories);
  const [active, setActive] = useState("All");
  const [selected, setSelected] = useState(null);
  const [visible, setVisible] = useState(() => new Set());
  const [headerVisible, setHeaderVisible] = useState(false);
  const cardRefs = useRef({});
  const starsCanvasRef = useRef(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addTag, setAddTag] = useState("Adventure");
  const [addType, setAddType] = useState("image"); // image | video | text
  const [addTitle, setAddTitle] = useState("");
  const [addDate, setAddDate] = useState("");
  const [addNote, setAddNote] = useState("");
  const [addFileUrl, setAddFileUrl] = useState("");
  const addFileUrlRef = useRef("");
  const [addSpan, setAddSpan] = useState("normal"); // normal | tall | wide
  const [addColor, setAddColor] = useState(tagColors.Love);
  const addTagOptions = useMemo(
    () => tags.filter((t) => t !== "All" && t !== "Book"),
    []
  );

  const nextId = useMemo(() => {
    const maxId = memoryList.reduce((mx, m) => Math.max(mx, Number(m.id) || 0), 0);
    return maxId + 1;
  }, [memoryList]);

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const canvas = starsCanvasRef.current;
    if (!canvas) return undefined;
    if (process.env.NODE_ENV === "test") return undefined;
    // JSDOM doesn't implement canvas; skip gracefully in tests.
    if (typeof canvas.getContext !== "function") return undefined;
    let ctx = null;
    try {
      ctx = canvas.getContext("2d");
    } catch {
      return undefined;
    }
    if (!ctx) return undefined;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let stars = [];
    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;

    const DPR = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);

    const rand = (min, max) => min + Math.random() * (max - min);

    const drawStar = (x, y, r, innerRatio, rot) => {
      const spikes = 5;
      const inner = r * innerRatio;
      let angle = rot;
      ctx.beginPath();
      for (let i = 0; i < spikes; i++) {
        ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
        angle += Math.PI / spikes;
        ctx.lineTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner);
        angle += Math.PI / spikes;
      }
      ctx.closePath();
      ctx.fill();
    };

    const resize = () => {
      w = Math.max(1, window.innerWidth);
      h = Math.max(1, window.innerHeight);
      cx = w / 2;
      cy = h / 2;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      const count = Math.floor((w * h) / 9000);
      const zMax = 1400;
      stars = Array.from({ length: Math.max(220, Math.min(900, count)) }, () => ({
        x: rand(-cx, cx),
        y: rand(-cy, cy),
        z: rand(1, zMax),
        r: rand(0.6, 1.6),
        tw: rand(0.2, 1),
        rot: rand(0, Math.PI * 2),
        ir: rand(0.42, 0.58),
      }));
    };

    const zMax = 1400;
    const speed = 8.5;

    const step = () => {
      ctx.clearRect(0, 0, w, h);

      // soft vignette so stars feel embedded in space
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.65);
      g.addColorStop(0, "rgba(255,255,255,0.00)");
      g.addColorStop(1, "rgba(0,0,0,0.40)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.z -= speed;
        if (s.z <= 1) {
          s.x = rand(-cx, cx);
          s.y = rand(-cy, cy);
          s.z = zMax;
          s.r = rand(0.6, 1.6);
          s.tw = rand(0.2, 1);
          s.rot = rand(0, Math.PI * 2);
          s.ir = rand(0.42, 0.58);
        }

        const k = 900 / s.z; // perspective
        const x = cx + s.x * k;
        const y = cy + s.y * k;
        if (x < -20 || x > w + 20 || y < -20 || y > h + 20) continue;

        const a = Math.min(0.9, 0.12 + (1 - s.z / zMax) * 0.85) * (0.7 + 0.3 * s.tw);
        const size = Math.max(0.6, s.r * k * 1.2);

        // subtle color drift to match orbs (cool -> warm)
        const hue = 220 + (1 - s.z / zMax) * 40; // 220..260
        ctx.fillStyle = `hsla(${hue}, 55%, 92%, ${a})`;
        drawStar(x, y, size * 1.4, s.ir, s.rot);

        // occasional streaks for depth
        if (s.z < 240) {
          ctx.strokeStyle = `rgba(245,201,122,${a * 0.25})`;
          ctx.lineWidth = Math.max(1, size * 0.6);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + (s.x * 0.004), y + (s.y * 0.004));
          ctx.stroke();
        }
      }

      if (!prefersReduced) raf = window.requestAnimationFrame(step);
    };

    resize();
    if (!prefersReduced) raf = window.requestAnimationFrame(step);
    else step();

    window.addEventListener("resize", resize, { passive: true });
    return () => {
      window.removeEventListener("resize", resize);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    setVisible(new Set());

    if (typeof IntersectionObserver === "undefined") {
      setVisible(new Set(memoryList.map((m) => String(m.id))));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = e.target?.dataset?.id;
            if (id) setVisible((v) => new Set([...v, id]));
          }
        });
      },
      { threshold: 0.1 }
    );

    Object.values(cardRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [active, memoryList]);

  const filtered = useMemo(() => {
    if (active === "All") return memoryList;
    return memoryList.filter((m) => m.tag === active);
  }, [active, memoryList]);

  const onCardOpen = (m) => {
    setSelected(m);
  };

  const openAddForTag = (t) => {
    setAddTag(t);
    setAddType("image");
    setAddTitle("");
    setAddDate("");
    setAddNote("");
    if (addFileUrlRef.current) URL.revokeObjectURL(addFileUrlRef.current);
    addFileUrlRef.current = "";
    setAddFileUrl("");
    setAddSpan("normal");
    setAddColor(tagColors[t] || "#a78bfa");
    setAddOpen(true);
  };

  const closeAdd = () => {
    if (addFileUrlRef.current) URL.revokeObjectURL(addFileUrlRef.current);
    addFileUrlRef.current = "";
    setAddFileUrl("");
    setAddOpen(false);
  };

  const submitAdd = () => {
    const base = {
      id: nextId,
      tag: addTag,
      title: addTitle.trim() || "Untitled",
      date: addDate.trim() || "—",
      note: addNote.trim(),
      span: addSpan,
    };

    const type = addType;
    if (type === "text") {
      setMemoryList((list) => [
        ...list,
        { ...base, type: "text", color: addColor || (tagColors[addTag] ?? "#a78bfa") },
      ]);
      setAddOpen(false);
      return;
    }

    if (!addFileUrl) return;

    setMemoryList((list) => [
      ...list,
      { ...base, type, src: addFileUrl },
    ]);
    setAddOpen(false);
  };

  return (
    <div style={styles.root}>
      <canvas ref={starsCanvasRef} style={styles.starsCanvas} aria-hidden="true" />
      <div style={styles.noise} aria-hidden="true" />
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      <header
        style={{
          ...styles.header,
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? "translateY(0)" : "translateY(-30px)",
        }}
      >
        <div style={styles.logo}>
          <span style={styles.logoIcon}>✦</span>
          <span style={styles.logoText}>Memora</span>
        </div>
      </header>

      <div style={styles.filterBar}>
        {tags.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              if (t === "Book") {
                if (onOpenBook) onOpenBook();
                return;
              }
              setActive(t);
            }}
            style={{
              ...styles.filterBtn,
              background:
                active === t
                  ? tagColors[t] || "rgba(255,255,255,0.15)"
                  : "rgba(255,255,255,0.05)",
              color: active === t ? "#0a0a0f" : "rgba(255,255,255,0.6)",
              fontWeight: active === t ? 700 : 400,
              border: active === t ? "none" : "1px solid rgba(255,255,255,0.1)",
              transform: active === t ? "scale(1.05)" : "scale(1)",
            }}
          >
            {t === "All" ? "✦ All" : t}
          </button>
        ))}
      </div>

      <div style={styles.grid}>
        {filtered.map((m, i) => (
          <div
            key={m.id}
            className="card-hover"
            data-id={String(m.id)}
            ref={(el) => {
              cardRefs.current[m.id] = el;
            }}
            onClick={() => onCardOpen(m)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onCardOpen(m);
            }}
            style={{
              ...styles.card,
              ...(m.span === "tall" ? styles.cardTall : {}),
              ...(m.span === "wide" ? styles.cardWide : {}),
              opacity: visible.has(String(m.id)) ? 1 : 0,
              transform: visible.has(String(m.id))
                ? "translateY(0) scale(1)"
                : "translateY(40px) scale(0.96)",
              transitionDelay: `${(i % 4) * 80}ms`,
            }}
          >
            {m.type === "image" && (
              <>
                <img src={m.src} alt={m.title} style={styles.cardImg} />
                <div style={styles.imgOverlay} />
              </>
            )}
            {m.type === "video" && (
              <>
                <video
                  src={m.src}
                  style={styles.cardImg}
                  muted
                  loop
                  playsInline
                  onMouseEnter={(e) => {
                    e.currentTarget.play();
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                />
                <div style={styles.imgOverlay} />
                <div style={styles.playBadge}>▶</div>
              </>
            )}
            {m.type === "text" && (
              <div
                style={{
                  ...styles.textCard,
                  borderColor: m.color || "#a78bfa",
                }}
              >
                <div
                  style={{
                    ...styles.textGlow,
                    background: m.color || "#a78bfa",
                  }}
                />
                <p style={{ ...styles.textNote, color: m.color || "#a78bfa" }}>
                  {m.note}
                </p>
              </div>
            )}
            <div style={styles.cardMeta}>
              <span
                style={{ ...styles.cardTag, color: tagColors[m.tag] || "#fff" }}
              >
                #{m.tag}
              </span>
              <h3 style={styles.cardTitle}>{m.title}</h3>
              {m.type !== "text" && <p style={styles.cardHint}>{m.note}</p>}
              <span style={styles.cardDate}>{m.date}</span>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div style={styles.lightbox} onClick={() => setSelected(null)}>
          <div
            style={styles.lightboxInner}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              style={styles.closeBtn}
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <span
              style={{ ...styles.lbTag, color: tagColors[selected.tag] || "#fff" }}
            >
              #{selected.tag}
            </span>
            <h2 style={styles.lbTitle}>{selected.title}</h2>
            {selected.type === "image" && (
              <img
                src={selected.src}
                alt={selected.title}
                style={styles.lbMedia}
              />
            )}
            {selected.type === "video" && (
              <video src={selected.src} controls style={styles.lbMedia} />
            )}
            {selected.type === "text" && (
              <div
                style={{ ...styles.lbTextBox, borderColor: selected.color }}
              >
                <p
                  style={{
                    ...styles.lbTextContent,
                    color: selected.color,
                  }}
                >
                  {selected.note}
                </p>
              </div>
            )}
            {selected.type !== "text" && <p style={styles.lbNote}>{selected.note}</p>}
            <p style={styles.lbDate}>{selected.date}</p>
          </div>
        </div>
      )}

      {active !== "Book" && (
        <button
          type="button"
          onClick={() => openAddForTag(active === "All" ? "Adventure" : active)}
          style={{
            ...styles.bottomAddBtn,
            boxShadow: "0 18px 50px rgba(0,0,0,0.55)",
          }}
        >
          ＋ Add
        </button>
      )}

      {addOpen && (
        <div style={styles.addOverlay} onClick={closeAdd}>
          <div style={styles.addInner} onClick={(e) => e.stopPropagation()}>
            <div style={styles.addTop}>
              <span style={{ ...styles.addTag, color: tagColors[addTag] || "#fff" }}>
                #{addTag}
              </span>
              <button type="button" style={styles.addClose} onClick={closeAdd}>
                ✕
              </button>
            </div>

            <h3 style={styles.addTitle}>Add memory</h3>

            <div style={styles.addRow}>
              <label style={styles.addLabel}>Category</label>
              <select
                value={addTag}
                onChange={(e) => setAddTag(e.target.value)}
                style={styles.addSelect}
              >
                {addTagOptions.map((t) => (
                  <option key={t} value={t} style={{ color: "#000" }}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.addRow}>
              <label style={styles.addLabel}>Type</label>
              <div style={styles.addPills}>
                {["image", "video", "text"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAddType(t)}
                    style={{
                      ...styles.addPill,
                      background:
                        addType === t ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
                      borderColor:
                        addType === t ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.10)",
                      color: addType === t ? "#fff" : "rgba(255,255,255,0.65)",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.addRow}>
              <label style={styles.addLabel}>Title</label>
              <input
                value={addTitle}
                onChange={(e) => setAddTitle(e.target.value)}
                style={styles.addInput}
                placeholder="Memory title"
              />
            </div>

            <div style={styles.addRow}>
              <label style={styles.addLabel}>Date</label>
              <input
                value={addDate}
                onChange={(e) => setAddDate(e.target.value)}
                style={styles.addInput}
                placeholder="e.g. Mar 2026"
              />
            </div>

            {addType !== "text" && (
              <div style={styles.addRow}>
                <label style={styles.addLabel}>
                  {addType === "image" ? "Upload image" : "Upload video"}
                </label>
                <input
                  type="file"
                  accept={addType === "image" ? "image/*" : "video/*"}
                  onChange={(e) => {
                    const f = e.target.files && e.target.files[0];
                    if (!f) return;
                    if (addFileUrlRef.current) URL.revokeObjectURL(addFileUrlRef.current);
                    const url = URL.createObjectURL(f);
                    addFileUrlRef.current = url;
                    setAddFileUrl(url);
                  }}
                  style={styles.addInput}
                />
                {addFileUrl && (
                  <div style={styles.uploadHint}>
                    {addType === "image" ? "Image selected" : "Video selected"}
                  </div>
                )}
              </div>
            )}

            {addType === "text" && (
              <div style={styles.addRow}>
                <label style={styles.addLabel}>Accent</label>
                <input
                  value={addColor}
                  onChange={(e) => setAddColor(e.target.value)}
                  style={styles.addInput}
                  placeholder="#fb7185"
                />
              </div>
            )}

            <div style={styles.addRow}>
              <label style={styles.addLabel}>Span</label>
              <div style={styles.addPills}>
                {["normal", "tall", "wide"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setAddSpan(s)}
                    style={{
                      ...styles.addPill,
                      background:
                        addSpan === s ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
                      borderColor:
                        addSpan === s ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.10)",
                      color: addSpan === s ? "#fff" : "rgba(255,255,255,0.65)",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.addRow}>
              <label style={styles.addLabel}>Note</label>
              <textarea
                value={addNote}
                onChange={(e) => setAddNote(e.target.value)}
                style={styles.addTextarea}
                placeholder="Write something..."
              />
            </div>

            <button type="button" onClick={submitAdd} style={styles.addSubmit}>
              Add
            </button>
          </div>
        </div>
      )}

      <footer style={styles.footer}>
        <span style={styles.footerIcon}>✦</span>
        <span>Made with love · Memora 2024</span>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06060e; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .card-hover:hover { transform: translateY(-6px) scale(1.02) !important; box-shadow: 0 24px 60px rgba(0,0,0,0.6) !important; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background:
      "radial-gradient(1200px 800px at 20% 10%, rgba(99,102,241,0.10) 0%, transparent 60%), radial-gradient(900px 650px at 85% 85%, rgba(244,114,182,0.08) 0%, transparent 62%), #06060e",
    fontFamily: "'DM Mono', monospace",
    color: "#fff",
    overflowX: "hidden",
    position: "relative",
  },
  noise: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
    opacity: 0.12,
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E\")",
    mixBlendMode: "overlay",
  },
  starsCanvas: {
    position: "fixed",
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 0,
    opacity: 0.55,
    mixBlendMode: "normal",
  },
  orb1: {
    position: "fixed",
    top: "-200px",
    left: "-200px",
    width: "600px",
    height: "600px",
    background:
      "radial-gradient(circle, rgba(99,102,241,0.11) 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 0,
  },
  orb2: {
    position: "fixed",
    bottom: "-150px",
    right: "-150px",
    width: "500px",
    height: "500px",
    background:
      "radial-gradient(circle, rgba(244,114,182,0.09) 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 0,
  },
  orb3: {
    position: "fixed",
    top: "40%",
    left: "50%",
    width: "300px",
    height: "300px",
    background:
      "radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
    position: "fixed",
    top: "18px",
    left: "18px",
    zIndex: 200,
    transition: "all 0.9s cubic-bezier(0.16,1,0.3,1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "10px 12px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(14px)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "12px",
    marginBottom: 0,
  },
  logoIcon: { fontSize: "28px", color: "#f5c97a", animation: "none" },
  logoText: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "24px",
    fontWeight: 300,
    letterSpacing: "0.12em",
    background:
      "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.5) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  filterBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    justifyContent: "center",
    padding: "96px 20px 40px",
    position: "relative",
    zIndex: 1,
  },
  filterBtn: {
    padding: "8px 18px",
    borderRadius: "50px",
    cursor: "pointer",
    fontSize: "12px",
    letterSpacing: "0.06em",
    transition: "all 0.25s ease",
    fontFamily: "'DM Mono', monospace",
    WebkitTapHighlightColor: "transparent",
  },
  bottomAddBtn: {
    position: "fixed",
    left: "50%",
    bottom: "22px",
    transform: "translateX(-50%)",
    zIndex: 120,
    padding: "12px 18px",
    borderRadius: "999px",
    cursor: "pointer",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    backdropFilter: "blur(14px)",
    color: "#fff",
    transition: "all 0.25s ease",
    fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.06em",
    fontSize: "12px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
    padding: "0 24px 80px",
    maxWidth: "1400px",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
    gridAutoRows: "280px",
  },
  card: {
    borderRadius: "16px",
    overflow: "hidden",
    position: "relative",
    cursor: "pointer",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    transition: "all 0.55s cubic-bezier(0.16,1,0.3,1)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    outline: "none",
  },
  // loveLocked* removed (login gates whole site now)
  cardTall: { gridRow: "span 2" },
  cardWide: { gridColumn: "span 2" },
  cardImg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.6s ease",
  },
  imgOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to top, rgba(6,6,14,0.9) 0%, rgba(6,6,14,0.2) 50%, transparent 100%)",
  },
  cardMeta: {
    position: "relative",
    zIndex: 2,
    padding: "20px",
  },
  cardTag: {
    fontSize: "10px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontWeight: 500,
    marginBottom: "6px",
    display: "block",
  },
  cardTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "22px",
    fontWeight: 400,
    lineHeight: 1.2,
    marginBottom: "6px",
    color: "#fff",
  },
  cardHint: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.45)",
    lineHeight: 1.5,
    marginBottom: "8px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardDate: {
    fontSize: "10px",
    color: "rgba(255,255,255,0.25)",
    letterSpacing: "0.08em",
  },
  textCard: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "28px",
    borderLeft: "3px solid",
    overflow: "hidden",
  },
  textGlow: {
    position: "absolute",
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    opacity: 0.08,
    filter: "blur(50px)",
    top: "-40px",
    left: "-40px",
    pointerEvents: "none",
  },
  textNote: {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: "italic",
    fontSize: "18px",
    lineHeight: 1.7,
    whiteSpace: "pre-line",
    textAlign: "center",
    position: "relative",
    zIndex: 1,
  },
  playBadge: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "48px",
    height: "48px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(8px)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    zIndex: 2,
    border: "1px solid rgba(255,255,255,0.2)",
  },
  lightbox: {
    position: "fixed",
    inset: 0,
    background: "rgba(6,6,14,0.9)",
    backdropFilter: "blur(20px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: "20px",
    animation: "fadeIn 0.25s ease",
  },
  lightboxInner: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px",
    padding: "40px",
    maxWidth: "720px",
    width: "100%",
    position: "relative",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  // pass* removed (login gates whole site now)
  addOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(6,6,14,0.9)",
    backdropFilter: "blur(20px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 120,
    padding: "20px",
    animation: "fadeIn 0.25s ease",
  },
  addInner: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "18px",
    padding: "28px",
    maxWidth: "620px",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  addTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "14px",
  },
  addTag: {
    fontSize: "11px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  addClose: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  addTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 300,
    fontSize: "30px",
    marginBottom: "18px",
  },
  addRow: {
    display: "grid",
    gridTemplateColumns: "110px 1fr",
    gap: "12px",
    alignItems: "center",
    marginBottom: "12px",
  },
  addLabel: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.45)",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  addInput: {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "12px",
    padding: "12px 12px",
    outline: "none",
    color: "#fff",
    fontSize: "13px",
    fontFamily: "'DM Mono', monospace",
  },
  addSelect: {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "12px",
    padding: "12px 12px",
    outline: "none",
    color: "rgba(255,255,255,0.85)",
    fontSize: "13px",
    fontFamily: "'DM Mono', monospace",
    appearance: "none",
  },
  uploadHint: {
    gridColumn: "2 / -1",
    fontSize: "10px",
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.4)",
    marginTop: "-6px",
  },
  addTextarea: {
    width: "100%",
    minHeight: "96px",
    resize: "vertical",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "12px",
    padding: "12px 12px",
    outline: "none",
    color: "#fff",
    fontSize: "13px",
    fontFamily: "'DM Mono', monospace",
    lineHeight: 1.5,
  },
  addPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  addPill: {
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    cursor: "pointer",
    fontSize: "12px",
    letterSpacing: "0.06em",
    fontFamily: "'DM Mono', monospace",
    transition: "all 0.25s ease",
  },
  addSubmit: {
    marginTop: "12px",
    width: "100%",
    padding: "14px 14px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(245,201,122,0.18)",
    color: "#fff",
    cursor: "pointer",
    fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.08em",
  },
  closeBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  lbTag: {
    fontSize: "11px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "10px",
  },
  lbTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(28px, 5vw, 44px)",
    fontWeight: 300,
    marginBottom: "24px",
  },
  lbMedia: {
    width: "100%",
    borderRadius: "12px",
    marginBottom: "20px",
    maxHeight: "460px",
    objectFit: "cover",
  },
  lbNote: {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: "italic",
    fontSize: "18px",
    color: "rgba(255,255,255,0.65)",
    lineHeight: 1.7,
    marginBottom: "16px",
  },
  lbDate: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.25)",
    letterSpacing: "0.08em",
  },
  lbTextBox: {
    borderLeft: "3px solid",
    padding: "20px 24px",
    marginBottom: "20px",
  },
  lbTextContent: {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: "italic",
    fontSize: "22px",
    lineHeight: 1.8,
    whiteSpace: "pre-line",
  },
  footer: {
    textAlign: "center",
    padding: "40px 20px",
    color: "rgba(255,255,255,0.2)",
    fontSize: "12px",
    letterSpacing: "0.1em",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    position: "relative",
    zIndex: 1,
  },
  footerIcon: { color: "#f5c97a" },
};

