import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

/* ─── Types ──────────────────────────────────────────────── */
interface Project {
  id: number;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  year: number;
  image: string;
  link: string;
  featured?: boolean;
  contributors?: string[];
}

/* ─── Data ───────────────────────────────────────────────── */
const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Echoes of the Forgotten",
    tagline: "A narrative platformer built in 72 hours.",
    description:
      "A hand-crafted pixel art platformer where every room hides a piece of a lost memory. Developed solo during Global Game Jam 2024 — tight scope, full heart. Every level was designed around an emotional beat, not just a mechanic.",
    tags: ["Unity", "C#", "Pixel Art", "Game Jam"],
    year: 2024,
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1400&h=800&fit=crop&auto=format",
    link: "#",
    featured: true,
    contributors: ["OzonZ"],
  },
  {
    id: 2,
    title: "Hamster Odyssey",
    tagline: "Turn-based strategy with procedural dungeons.",
    description:
      "A dungeon crawler built around emergent strategy — every run generates a new labyrinth and a new story. Built in Godot with a hand-painted tileset and custom AI pathfinding.",
    tags: ["Godot", "GDScript", "Procedural Gen"],
    year: 2023,
    image:
      "https://images.unsplash.com/photo-1760753145427-c327d09ace00?w=800&h=600&fit=crop&auto=format",
    link: "#",
    contributors: ["OzonZ", "TeamMate"],
  },
  {
    id: 3,
    title: "DevLog Dashboard",
    tagline: "Track builds, bugs & weekly progress.",
    description:
      "A lightweight dashboard for indie devs to log builds, annotate bugs, and chart weekly progress — built for the Hamster Hub community.",
    tags: ["React", "TypeScript", "Recharts"],
    year: 2025,
    image:
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=600&fit=crop&auto=format",
    link: "#",
  },
];

/* ─── Theme tokens ───────────────────────────────────────── */
type Theme = "dark" | "light";

const T = {
  dark: {
    bg: "#10141A",
    surface: "#1C2026",
    surfaceRaised: "#252B34",
    fg: "#DFE2EB",
    fgSub: "#9299AA",
    primary: "#eae4b1",
    primaryRgb: "234,228,177",
    onPrimary: "#10141A",
    border: "rgba(73,68,85,0.55)",
    borderHover: "rgba(234,228,177,0.5)",
    tagBg: "rgba(234,228,177,0.10)",
    tagFg: "#eae4b1",
    glow: "rgba(234,228,177,0.18)",
    navBg: "rgba(16,20,26,0.85)",
  },
  light: {
    bg: "#FFFDF5",
    surface: "#F4F0DC",
    surfaceRaised: "#EEE8D0",
    fg: "#1A1A0F",
    fgSub: "#4A5240",
    primary: "#386B40",
    primaryRgb: "56,107,64",
    onPrimary: "#ffffff",
    border: "rgba(180,170,140,0.5)",
    borderHover: "rgba(56,107,64,0.6)",
    tagBg: "rgba(56,107,64,0.10)",
    tagFg: "#2D5532",
    glow: "rgba(56,107,64,0.20)",
    navBg: "rgba(255,253,245,0.9)",
  },
} as const;

/* ─── Icons ──────────────────────────────────────────────── */
const IconArrow = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const IconExternal = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
  </svg>
);
const IconClose = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);
const IconSun = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);
const IconMoon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);
const IconUsers = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

/* ─── Tag Pill ───────────────────────────────────────────── */
function TagPill({ label, theme }: { label: string; theme: Theme }) {
  const t = T[theme];
  return (
    <span
      style={{
        background: t.tagBg,
        color: t.tagFg,
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        padding: "3px 10px",
        borderRadius: "4px",
        border: `1px solid ${t.tagBg}`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

/* ─── Detail Modal ───────────────────────────────────────── */
function ProjectModal({
  project,
  onClose,
  theme,
}: {
  project: Project | null;
  onClose: () => void;
  theme: Theme;
}) {
  const t = T[theme];

  return (
    <AnimatePresence>
      {project && (
        <>
          <motion.div
            className="fixed inset-0 z-[800]"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[801] flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="pointer-events-auto w-full max-w-2xl rounded-2xl overflow-hidden"
              style={{
                background: t.surface,
                border: `1px solid ${t.borderHover}`,
                boxShadow: `0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px ${t.border}`,
                maxHeight: "90vh",
                overflowY: "auto",
              }}
              initial={{ scale: 0.94, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 32 }}
            >
              {/* Image hero */}
              <div className="relative w-full overflow-hidden" style={{ height: "280px" }}>
                <img
                  src={project.image}
                  alt={project.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(to top, ${t.surface} 0%, transparent 60%)`,
                  }}
                />
                {/* Year badge */}
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(8px)",
                    color: "rgba(255,255,255,0.9)",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                    padding: "4px 12px",
                    borderRadius: "6px",
                  }}
                >
                  {project.year}
                </div>
                {/* Close */}
                <button
                  onClick={onClose}
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.55)",
                    backdropFilter: "blur(8px)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  <IconClose />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: "28px 32px 32px" }}>
                {/* Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                  {project.tags.map((t2) => (
                    <TagPill key={t2} label={t2} theme={theme} />
                  ))}
                </div>

                <h3
                  style={{
                    fontFamily: "'Mitr', sans-serif",
                    fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: t.fg,
                    lineHeight: 1.1,
                    margin: "0 0 6px",
                  }}
                >
                  {project.title}
                </h3>
                <p style={{ color: t.primary, fontSize: "14px", fontWeight: 600, marginBottom: "20px" }}>
                  {project.tagline}
                </p>

                <div
                  style={{
                    background: t.surfaceRaised,
                    borderRadius: "12px",
                    padding: "16px 20px",
                    marginBottom: "20px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: t.primary,
                      marginBottom: "8px",
                    }}
                  >
                    Project Details
                  </p>
                  <p style={{ color: t.fgSub, fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
                    {project.description}
                  </p>
                </div>

                {project.contributors && project.contributors.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "24px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ color: t.fgSub, display: "flex", alignItems: "center", gap: 5, fontSize: "12px" }}>
                      <IconUsers /> Contributors
                    </span>
                    {project.contributors.map((c) => (
                      <span
                        key={c}
                        style={{
                          background: t.surfaceRaised,
                          color: t.fg,
                          fontSize: "12px",
                          fontWeight: 600,
                          padding: "4px 12px",
                          borderRadius: "20px",
                          border: `1px solid ${t.border}`,
                        }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                <a
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    width: "100%",
                    padding: "16px",
                    borderRadius: "14px",
                    background: t.primary,
                    color: t.onPrimary,
                    fontWeight: 700,
                    fontSize: "13px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    boxSizing: "border-box",
                    boxShadow: `0 8px 28px ${t.glow}`,
                    transition: "opacity 0.2s, transform 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = "0.88";
                    (e.currentTarget as HTMLElement).style.transform = "scale(1.015)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = "1";
                    (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                  }}
                >
                  Visit Project
                  <IconExternal />
                </a>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Featured Card ──────────────────────────────────────── */
function FeaturedCard({ project, theme, onClick }: { project: Project; theme: Theme; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const t = T[theme];

  return (
    <motion.article
      onClick={onClick}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      style={{
        gridColumn: "span 8",
        position: "relative",
        borderRadius: "20px",
        overflow: "hidden",
        cursor: "pointer",
        minHeight: "560px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        border: hov ? `1px solid ${t.borderHover}` : `1px solid ${t.border}`,
        boxShadow: hov
          ? `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${t.borderHover}, 0 0 48px ${t.glow}`
          : "0 4px 20px rgba(0,0,0,0.15)",
        transition: "border-color 0.35s ease, box-shadow 0.35s ease",
      }}
    >
      {/* Full-bleed image */}
      <motion.img
        src={project.image}
        alt={project.title}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        animate={{ scale: hov ? 1.05 : 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      />

      {/* Permanent gradient — ensures text is always readable */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.1) 100%)",
          transition: "opacity 0.35s ease",
          opacity: hov ? 1 : 0.92,
        }}
      />

      {/* Top badges */}
      <div style={{ position: "absolute", top: 20, left: 20, display: "flex", gap: 10, zIndex: 2 }}>
        <span
          style={{
            background: t.primary,
            color: t.onPrimary,
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            padding: "5px 14px",
            borderRadius: "6px",
          }}
        >
          ★ Featured
        </span>
      </div>
      <div style={{ position: "absolute", top: 20, right: 20, zIndex: 2 }}>
        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.15em" }}>
          {project.year}
        </span>
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, padding: "0 32px 32px" }}>
        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
          {project.tags.map((tag) => (
            <span
              key={tag}
              style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
                color: "rgba(255,255,255,0.85)",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                padding: "4px 10px",
                borderRadius: "5px",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <h2
          style={{
            fontFamily: "'Mitr', sans-serif",
            fontSize: "clamp(1.8rem, 3.5vw, 3rem)",
            fontWeight: 700,
            color: "#ffffff",
            textTransform: "uppercase",
            lineHeight: 1.05,
            margin: "0 0 8px",
            letterSpacing: "-0.01em",
            textShadow: "0 2px 20px rgba(0,0,0,0.5)",
          }}
        >
          {project.title}
        </h2>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", margin: "0 0 24px", maxWidth: "500px" }}>
          {project.tagline}
        </p>

        {/* CTA button */}
        <motion.div
          animate={{ opacity: hov ? 1 : 0.7, x: hov ? 0 : -6 }}
          transition={{ duration: 0.25 }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: t.primary,
              color: t.onPrimary,
              padding: "12px 24px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              boxShadow: hov ? `0 8px 32px ${t.glow}` : "none",
              transition: "box-shadow 0.3s ease",
            }}
          >
            View Project
            <IconArrow size={14} />
          </span>
        </motion.div>
      </div>

      {/* Hover: centre "click" pulse */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3,
          pointerEvents: "none",
        }}
        animate={{ opacity: hov ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          animate={hov ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: t.primary,
            color: t.onPrimary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 32px ${t.glow}`,
          }}
        >
          <IconExternal size={22} />
        </motion.div>
      </motion.div>
    </motion.article>
  );
}

/* ─── Side Card ──────────────────────────────────────────── */
function SideCard({ project, theme, onClick }: { project: Project; theme: Theme; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const t = T[theme];

  return (
    <motion.article
      onClick={onClick}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      style={{
        flex: 1,
        borderRadius: "18px",
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        background: t.surface,
        border: hov ? `1px solid ${t.borderHover}` : `1px solid ${t.border}`,
        boxShadow: hov
          ? `0 12px 40px rgba(0,0,0,0.25), 0 0 32px ${t.glow}`
          : "0 2px 12px rgba(0,0,0,0.08)",
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
        minHeight: "260px",
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", height: "180px", overflow: "hidden", flexShrink: 0 }}>
        <motion.img
          src={project.image}
          alt={project.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          animate={{ scale: hov ? 1.07 : 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        {/* Gradient fade into card */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to bottom, transparent 50%, ${t.surface} 100%)`,
          }}
        />
        {/* Year top-right */}
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(6px)",
            color: "rgba(255,255,255,0.85)",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            padding: "3px 10px",
            borderRadius: "5px",
          }}
        >
          {project.year}
        </span>

        {/* Hover overlay — "click" hint */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.28)",
          }}
          animate={{ opacity: hov ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: t.primary,
              color: t.onPrimary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconArrow size={16} />
          </div>
        </motion.div>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 22px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "12px" }}>
          {project.tags.slice(0, 3).map((tag) => (
            <TagPill key={tag} label={tag} theme={theme} />
          ))}
        </div>

        <h3
          style={{
            fontFamily: "'Mitr', sans-serif",
            fontSize: "1.15rem",
            fontWeight: 700,
            textTransform: "uppercase",
            color: t.fg,
            lineHeight: 1.15,
            margin: "0 0 6px",
          }}
        >
          {project.title}
        </h3>
        <p style={{ color: t.fgSub, fontSize: "13px", lineHeight: 1.55, margin: 0, flex: 1 }}>
          {project.tagline}
        </p>

        {/* Footer row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "18px",
            paddingTop: "14px",
            borderTop: `1px solid ${t.border}`,
          }}
        >
          {project.contributors && project.contributors.length > 1 ? (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                color: t.fgSub,
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              <IconUsers />
              {project.contributors.length} contributors
            </span>
          ) : (
            <span />
          )}

          <motion.span
            animate={{ x: hov ? 4 : 0, color: hov ? t.primary : t.fgSub }}
            transition={{ duration: 0.2 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Explore
            <IconArrow size={11} />
          </motion.span>
        </div>
      </div>
    </motion.article>
  );
}

/* ─── Main Section ────────────────────────────────────────── */
export function ProjectSection() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [selected, setSelected] = useState<Project | null>(null);
  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  const t = T[theme];
  const featured = PROJECTS.find((p) => p.featured)!;
  const sides = PROJECTS.filter((p) => !p.featured);

  return (
    <div
      style={{
        background: t.bg,
        minHeight: "100vh",
        fontFamily: "'Space Grotesk', sans-serif",
        transition: "background 0.45s ease",
        color: t.fg,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Mitr:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(${t.primaryRgb},0.25); }
        @media (max-width: 900px) {
          .pf-grid { display: flex !important; flex-direction: column !important; }
          .pf-featured { min-height: 420px !important; }
        }
      `}</style>

      {/* ── Sticky Nav strip ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: t.navBg,
          backdropFilter: "blur(16px)",
          borderBottom: `1px solid ${t.border}`,
          padding: "14px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "background 0.4s ease, border-color 0.4s ease",
        }}
      >
        <span
          style={{
            fontFamily: "'Mitr', sans-serif",
            fontWeight: 700,
            fontSize: "1.1rem",
            color: t.primary,
            letterSpacing: "0.06em",
          }}
        >
          OzonZ
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          {["Work", "About", "Contact"].map((item) => (
            <a
              key={item}
              href="#"
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: t.fgSub,
                textDecoration: "none",
                letterSpacing: "0.08em",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = t.primary)}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = t.fgSub)}
            >
              {item}
            </a>
          ))}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: `1px solid ${t.border}`,
              background: t.surface,
              color: t.primary,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.3s, border-color 0.3s",
            }}
            title={theme === "dark" ? "Switch to light" : "Switch to dark"}
          >
            {theme === "dark" ? <IconSun /> : <IconMoon />}
          </button>
        </div>
      </div>

      {/* ── Section ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "64px 40px 80px" }}>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "44px",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: t.primary,
                marginBottom: "8px",
              }}
            >
              Selected Archives
            </p>
            <h2
              style={{
                fontFamily: "'Mitr', sans-serif",
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                fontWeight: 700,
                textTransform: "uppercase",
                color: t.fg,
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
              }}
            >
              Featured Work
            </h2>
            <p style={{ color: t.fgSub, marginTop: "8px", fontSize: "15px", lineHeight: 1.5 }}>
              A chronicle of interactive experiences &amp; digital creations.
            </p>
          </div>

          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: `1px solid ${t.border}`,
              borderRadius: "10px",
              padding: "10px 20px",
              cursor: "pointer",
              color: t.primary,
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              transition: "border-color 0.25s, background 0.25s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = t.tagBg;
              (e.currentTarget as HTMLElement).style.borderColor = t.borderHover;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "none";
              (e.currentTarget as HTMLElement).style.borderColor = t.border;
            }}
          >
            Explore All
            <IconArrow size={13} />
          </button>
        </div>

        {/* Grid */}
        <div
          className="pf-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "20px",
            alignItems: "stretch",
          }}
        >
          {/* Featured */}
          <div className="pf-featured" style={{ gridColumn: "span 8" }}>
            <FeaturedCard project={featured} theme={theme} onClick={() => setSelected(featured)} />
          </div>

          {/* Side stack */}
          <div
            style={{
              gridColumn: "span 4",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {sides.map((p) => (
              <SideCard key={p.id} project={p} theme={theme} onClick={() => setSelected(p)} />
            ))}
          </div>
        </div>

        {/* Hint */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "8px",
            marginTop: "22px",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: t.primary,
              opacity: 0.5,
            }}
          />
          <span style={{ fontSize: "11px", color: t.fgSub, letterSpacing: "0.06em" }}>
            {PROJECTS.length} projects · hover to preview · click to explore
          </span>
        </div>
      </div>

      {/* Modal */}
      <ProjectModal project={selected} onClose={() => setSelected(null)} theme={theme} />
    </div>
  );
}
