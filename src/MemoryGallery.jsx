import { useEffect, useMemo, useRef, useState } from "react";

const seedMemories = [];

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

// For now: hide these chapters' memories (requested).
const REMOVE_TAGS = new Set(["Coimbatore Days"]);

const normalizeMemoryList = (list) => {
  if (!Array.isArray(list)) return [];
  return list.filter((m) => {
    const tag = (m?.tag ?? "").toString().trim();
    return !REMOVE_TAGS.has(tag);
  });
};

export default function MemoryGallery({
  onOpenBook,
  activeTag,
  onActiveTagChange,
  onGoHome,
}) {
  const [memoryList, setMemoryList] = useState(() => {
    try {
      const raw = window.localStorage.getItem("memora_memory_list_v3");
      if (!raw) return seedMemories;
      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed) ? parsed : seedMemories;
      return normalizeMemoryList(arr);
    } catch {
      return normalizeMemoryList(seedMemories);
    }
  });
  const [active, setActive] = useState(activeTag || "All");
  const [selected, setSelected] = useState(null);
  const [visible, setVisible] = useState(() => new Set());
  const [headerVisible, setHeaderVisible] = useState(false);
  const cardRefs = useRef({});
  const starsCanvasRef = useRef(null);
  const [mediaIndexById, setMediaIndexById] = useState(() => ({}));
  const lightboxVideoRef = useRef(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addTargetId, setAddTargetId] = useState(null); // append media into this memory when set
  const [addTag, setAddTag] = useState("Adventure");
  const [addType, setAddType] = useState("media"); // media | text
  const [addTitle, setAddTitle] = useState("");
  const [addDate, setAddDate] = useState("");
  const [addNote, setAddNote] = useState("");
  const [addMediaPaths, setAddMediaPaths] = useState(""); // newline or comma-separated /memories/...
  const [addCount, setAddCount] = useState(1);
  const [addCountTouched, setAddCountTouched] = useState(false);
  const [addSpan, setAddSpan] = useState("normal"); // normal | tall | wide
  const [addColor, setAddColor] = useState(tagColors.Love);
  const addTagOptions = useMemo(
    () => tags.filter((t) => t !== "All" && t !== "Book" && !REMOVE_TAGS.has(t)),
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

  // Load repo-persisted memories (works on Vercel).
  // If `public/memories/memory_list.json` is empty, we keep localStorage.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/memories/memory_list.json", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          const normalized = normalizeMemoryList(data);
          setMemoryList(normalized);
          try {
            window.localStorage.setItem("memora_memory_list_v3", JSON.stringify(normalized));
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore (file missing/invalid)
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (activeTag && activeTag !== active) setActive(activeTag);
  }, [activeTag, active]);

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

  const downloadMemoryList = () => {
    // Downloads the current memories so you can paste them into `public/memories/memory_list.json`.
    const payload = JSON.stringify(memoryList, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "memory_list.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const openAddForTag = (t) => {
    if (REMOVE_TAGS.has(t)) return;
    setAddTargetId(null);
    setAddTag(t);
    setAddType(t === "Thoughts" ? "text" : "media");
    setAddTitle("");
    setAddDate("");
    setAddNote("");
    setAddMediaPaths("");
    setAddCount(1);
    setAddCountTouched(false);
    setAddSpan("normal");
    setAddColor(tagColors[t] || "#a78bfa");
    setAddOpen(true);
  };

  const closeAdd = () => {
    setAddMediaPaths("");
    setAddOpen(false);
    setAddTargetId(null);
    setAddCountTouched(false);
  };

  useEffect(() => {
    try {
      window.localStorage.setItem("memora_memory_list_v3", JSON.stringify(memoryList));
    } catch {
      // ignore
    }
  }, [memoryList]);

  const parseMediaPaths = (raw) => {
    const parts = raw
      .replaceAll("@src/media/photos/", "/media/photos/")
      .replaceAll("@src/media/videos/", "/media/videos/")
      .split(/[\n,]/g)
      .map((s) => s.trim())
      .filter(Boolean);

    const inferKind = (p) => {
      const lower = p.toLowerCase();
      if (lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov")) return "video";
      return "image";
    };

    return parts.map((p) => ({ kind: inferKind(p), src: p }));
  };

  // If user pasted multiple paths but didn't change Count,
  // auto-sync Count to the number of paths.
  useEffect(() => {
    if (!addOpen) return;
    if (addType !== "media") return;
    if (addCountTouched) return;
    const n = parseMediaPaths(addMediaPaths).length;
    if (n > 0 && addCount !== n) setAddCount(n);
  }, [addOpen, addType, addMediaPaths, addCountTouched, addCount]);

  const submitAdd = () => {
    if (REMOVE_TAGS.has(addTag)) return;
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
      if (addTag === "Thoughts" && !addColor) return;
      setMemoryList((list) => [
        ...list,
        {
          ...base,
          type: "text",
          color:
            addTag === "Thoughts"
              ? addColor
              : addColor || (tagColors[addTag] ?? "#a78bfa"),
        },
      ]);
      setAddOpen(false);
      return;
    }
    if (addTag === "Thoughts") return;

    const uploads = parseMediaPaths(addMediaPaths);
    if (!uploads.length) return;
    if (uploads.length < addCount) return;
    const slice = uploads.slice(0, addCount);

    // Append into existing card (same caption/title stays).
    if (addTargetId) {
      setMemoryList((list) =>
        list.map((m) => {
          if (String(m.id) !== addTargetId) return m;
          const existing = getMedia(m);
          return {
            ...m,
            type: "media",
            media: [...existing, ...slice],
          };
        })
      );
      setAddOpen(false);
      setAddTargetId(null);
      return;
    }

    // Create new card.
    setMemoryList((list) => [
      ...list,
      { ...base, type: "media", media: slice },
    ]);
    setAddOpen(false);
  };

  const getMedia = (m) => {
    if (m.type === "media" && Array.isArray(m.media) && m.media.length) return m.media;
    if ((m.type === "image" || m.type === "video") && m.src) return [{ kind: m.type, src: m.src }];
    return [];
  };

  const advanceMedia = (id, len) => {
    if (!len || len <= 1) return;
    setMediaIndexById((prev) => ({ ...prev, [id]: ((prev[id] ?? 0) + 1) % len }));
  };

  const setMediaIndex = (id, idx) => {
    setMediaIndexById((prev) => ({ ...prev, [id]: idx }));
  };

  // Auto-advance for cards with multiple media (visible ones).
  useEffect(() => {
    // Prevent conflicts with the lightbox slideshow.
    if (selected) return undefined;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return undefined;

    const ids = filtered
      .map((m) => {
        const media = getMedia(m);
        if (media.length > 1 && visible.has(String(m.id))) return String(m.id);
        return null;
      })
      .filter(Boolean);

    if (!ids.length) return undefined;

    const t = window.setInterval(() => {
      for (const id of ids) {
        const m = memoryList.find((x) => String(x.id) === id);
        if (!m) continue;
        const media = getMedia(m);
        if (media.length <= 1) continue;
        const idx = mediaIndexById[id] ?? 0;
        const current = media[idx] || media[0];
        // Only auto-advance on timer for images; videos advance on ended.
        if (current?.kind === "image") advanceMedia(id, media.length);
      }
    }, 3000);

    return () => window.clearInterval(t);
  }, [filtered, memoryList, visible, mediaIndexById, selected]);

  // Auto-advance media inside the opened lightbox as well.
  useEffect(() => {
    if (!selected) return undefined;
    const media = getMedia(selected);
    if (media.length <= 1) return undefined;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return undefined;

    const id = String(selected.id);
    const idx = mediaIndexById[id] ?? 0;
    const current = media[idx] || media[0];
    if (current?.kind !== "image") return undefined;
    const t = window.setTimeout(() => advanceMedia(id, media.length), 3000);
    return () => window.clearTimeout(t);
  }, [selected, mediaIndexById]);

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
        <button
          type="button"
          style={styles.backBtn}
          onClick={() => onGoHome && onGoHome()}
          title="Back"
        >
          ← Back to explore
        </button>

        <div style={styles.chapterTitle}>
          {active === "All" ? "All Memories" : active}
        </div>
      </header>

      {/* Chapters are selected from Home; no in-page chapter bar */}

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
            {(() => {
              const media = getMedia(m);
              const idx = mediaIndexById[String(m.id)] ?? 0;
              const current = media[idx] || media[0];
              if (!current) return null;
              const id = String(m.id);
              return (
                <>
                  {current.kind === "image" ? (
                    <img src={current.src} alt={m.title} style={styles.cardImg} />
                  ) : (
                    <>
                      <video
                        key={current.src}
                        src={current.src}
                        style={styles.cardImg}
                        muted
                        playsInline
                        autoPlay
                        preload="metadata"
                        onEnded={() => advanceMedia(id, media.length)}
                      />
                      <div style={styles.playBadge}>▶</div>
                    </>
                  )}
                  <div style={styles.imgOverlay} />
                  {media.length > 1 && (
                    <div
                      style={styles.dotRow}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        advanceMedia(id, media.length);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          advanceMedia(id, media.length);
                        }
                      }}
                    >
                      {media.map((_, di) => (
                        <div
                          key={`${id}-dot-${di}`}
                          style={{
                            ...styles.dot,
                            ...(di === idx ? styles.dotActive : {}),
                          }}
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setMediaIndex(id, di);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.stopPropagation();
                              setMediaIndex(id, di);
                            }
                          }}
                        />
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
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
            {(() => {
              const media = getMedia(selected);
              if (!media.length) return null;
              const id = String(selected.id);
              const idx = mediaIndexById[id] ?? 0;
              const current = media[idx] || media[0];
              return (
                <div style={styles.lbMediaWrap}>
                  {current.kind === "image" ? (
                    <img src={current.src} alt={selected.title} style={styles.lbMedia} />
                  ) : (
                    <video
                      key={current.src}
                      ref={lightboxVideoRef}
                      src={current.src}
                      controls
                      muted
                      playsInline
                      autoPlay
                      style={styles.lbMedia}
                      preload="metadata"
                      onEnded={() => advanceMedia(id, media.length)}
                      onLoadedMetadata={(e) => {
                        const v = e.currentTarget;
                        try {
                          v.currentTime = 0;
                          // Autoplay is allowed because it's muted.
                          v.play().catch(() => {});
                        } catch {
                          // ignore
                        }
                      }}
                    />
                  )}
                  {media.length > 1 && (
                    <div style={styles.lbDotRow}>
                      {media.map((_, di) => (
                        <div
                          key={`${id}-lb-dot-${di}`}
                          style={{
                            ...styles.lbDot,
                            ...(di === idx ? styles.lbDotActive : {}),
                          }}
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setMediaIndex(id, di);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.stopPropagation();
                              setMediaIndex(id, di);
                            }
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
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

      {active !== "Book" && !REMOVE_TAGS.has(active) && !selected && (
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

      {!addOpen && (
        <button type="button" onClick={downloadMemoryList} style={styles.exportBtn}>
          Export memories
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

            <h3 style={styles.addTitle}>
              {addTargetId ? "Add to this memory" : "Add memory"}
            </h3>

            {!addTargetId && (
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
            )}

            <div style={styles.addRow}>
              <label style={styles.addLabel}>Type</label>
              <div style={styles.addPills}>
                {(addTag === "Thoughts" ? ["text"] : ["media", "text"]).map((t) => (
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

            {addType === "media" && (
              <>
                <div style={styles.addRow}>
                  <label style={styles.addLabel}>Count</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={addCount}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      const safe = Number.isFinite(n) ? Math.max(1, Math.min(30, Math.floor(n))) : 1;
                      setAddCount(safe);
                      setAddCountTouched(true);
                    }}
                    style={styles.addInput}
                    placeholder="1"
                  />
                </div>

                <div style={styles.addRow}>
                  <label style={styles.addLabel}>Paths</label>
                  <textarea
                    value={addMediaPaths}
                    onChange={(e) => setAddMediaPaths(e.target.value)}
                    style={styles.addTextarea}
                    placeholder={"/memories/photo1.jpg\n/memories/video1.mp4\n/memories/photo2.png"}
                  />
                  <div style={styles.uploadHint}>
                    Put files into `public/media/photos` or `public/media/videos` then paste paths here (comma or newline separated).
                  </div>
                </div>
              </>
            )}

            {addType === "text" && (
              <div style={styles.addRow}>
                <label style={styles.addLabel}>
                  {addTag === "Thoughts" ? "Font color" : "Accent"}
                </label>
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

            <button
              type="button"
              onClick={submitAdd}
              disabled={addType === "media" && parseMediaPaths(addMediaPaths).length < addCount}
              style={{
                ...styles.addSubmit,
                opacity:
                  addType === "media" && parseMediaPaths(addMediaPaths).length < addCount ? 0.6 : 1,
              }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      <footer style={styles.footer}>
        <span style={styles.footerIcon}>✦</span>
        <span>Made with love · Muja</span>
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
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(14px)",
    width: "calc(100% - 36px)",
    maxWidth: "1400px",
    right: "18px",
    margin: "0 auto",
  },
  backBtn: {
    justifySelf: "start",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.86)",
    borderRadius: "999px",
    padding: "10px 12px",
    cursor: "pointer",
    fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.06em",
    fontSize: "12px",
    transition: "all 0.25s ease",
    maxWidth: "240px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  chapterTitle: {
    justifySelf: "center",
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 300,
    letterSpacing: "0.06em",
    fontSize: "clamp(18px, 2.6vw, 30px)",
    color: "rgba(255,255,255,0.90)",
    textShadow: "0 16px 60px rgba(0,0,0,0.65)",
    padding: "0 10px",
    textAlign: "center",
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
  exportBtn: {
    position: "fixed",
    right: "18px",
    bottom: "22px",
    zIndex: 121,
    padding: "12px 14px",
    borderRadius: "999px",
    cursor: "pointer",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(14px)",
    color: "rgba(255,255,255,0.92)",
    transition: "all 0.25s ease",
    fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.06em",
    fontSize: "12px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
    padding: "92px 24px 80px",
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
  dotRow: {
    position: "absolute",
    left: "50%",
    bottom: "14px",
    transform: "translateX(-50%)",
    zIndex: 3,
    display: "flex",
    gap: "6px",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(6,6,14,0.35)",
    border: "1px solid rgba(255,255,255,0.10)",
    backdropFilter: "blur(10px)",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.35)",
    transform: "scale(1)",
    transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
  },
  dotActive: {
    background: "rgba(255,255,255,0.92)",
    transform: "scale(1.35)",
  },
  lightbox: {
    position: "fixed",
    inset: 0,
    background: "rgba(6,6,14,0.9)",
    backdropFilter: "blur(20px)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    zIndex: 100,
    padding: "80px 20px 20px",
    animation: "fadeIn 0.25s ease",
  },
  lightboxInner: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px",
    padding: "36px",
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
    zIndex: 10,
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
    maxHeight: "70vh",
    objectFit: "contain",
    background: "rgba(0,0,0,0.25)",
    display: "block",
  },
  lbMediaWrap: {
    position: "relative",
    width: "100%",
    marginBottom: "14px",
  },
  lbDotRow: {
    position: "absolute",
    left: "50%",
    bottom: "12px",
    transform: "translateX(-50%)",
    zIndex: 2,
    display: "flex",
    gap: "8px",
    padding: "7px 12px",
    borderRadius: "999px",
    background: "rgba(6,6,14,0.35)",
    border: "1px solid rgba(255,255,255,0.10)",
    backdropFilter: "blur(10px)",
  },
  lbDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.35)",
    transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
  },
  lbDotActive: {
    background: "rgba(255,255,255,0.92)",
    boxShadow: "0 0 0 7px rgba(255,255,255,0.08)",
    transform: "scale(1.2)",
  },
  lbAddBtn: {
    position: "sticky",
    left: 0,
    right: 0,
    bottom: "-10px",
    marginTop: "18px",
    width: "100%",
    padding: "12px 14px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    cursor: "pointer",
    fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.08em",
    backdropFilter: "blur(14px)",
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

