/**
 * Temas del mapa mental.
 * Cada tema define el lienzo (fondo/ambiente inmersivo), la paleta de ramas, el "look" de cada nivel de nodos
 * (raíz, ramas principales, ideas) y el estilo de las líneas. Los ambientes inmersivos coinciden con los
 * de la aplicación (escritorio, cabaña, biblioteca, oficina, zen, futurista, espacio…).
 */

import { darken, lighten, mix, readableOn, withAlpha, isTransparent } from './color';

export type LookMode = 'solid' | 'tinted' | 'outline' | 'ghost' | 'paper' | 'glass';
export type LineStyle = 'organic' | 'curve' | 'straight' | 'elbow';
export type CanvasPattern = 'none' | 'dots' | 'grid' | 'lines' | 'blueprint';

export interface NodeLook {
  mode: LookMode;
  /** Color explícito o 'branch' (color de la rama) / 'tint' (rama translúcida) / 'transparent' */
  fill: string;
  border: string;
  borderWidth: number;
  /** 'auto' = legible sobre el relleno, 'ink' = tinta del lienzo, 'branch' = color de la rama */
  text: string;
  radius: number;
  fontSize: number;
  fontWeight: number;
  paddingX: number;
  paddingY: number;
  shadow?: string;
  family?: string;
}

export interface MapTheme {
  id: string;
  name: string;
  emoji: string;
  group: 'Clásicos' | 'Claros' | 'Inmersivos';
  dark: boolean;
  /** Fuente por defecto de los nodos */
  font: string;
  /** Color de la tinta del lienzo (texto sobre el fondo) */
  ink: string;
  accent: string;
  canvas: {
    bg: string;
    pattern: CanvasPattern;
    patternColor: string;
    patternSize: number;
    /** 0-1: oscurecimiento de bordes */
    vignette: number;
    /** Textura de grano superpuesta */
    grain: number;
  };
  palette: string[];
  root: NodeLook;
  second: NodeLook;
  node: NodeLook;
  line: {
    style: LineStyle;
    width: number;
    rootWidth: number;
    opacity: number;
    cap: 'round' | 'butt';
    dash?: string;
  };
}

const INTER = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";
const HAND = "'Caveat', 'Segoe Print', 'Bradley Hand', cursive";
const SERIF = "'Merriweather', Georgia, serif";
const CORMORANT = "'Cormorant Garamond', Georgia, serif";
const ORBITRON = "'Orbitron', 'Segoe UI', sans-serif";
const MINCHO = "'Shippori Mincho', Georgia, serif";
const GROTESK = "'Space Grotesk', 'Inter', sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, Menlo, monospace";

export const FONT_CHOICES: { id: string; label: string; family: string; note?: string }[] = [
  { id: 'inter', label: 'Inter', family: INTER, note: 'Moderna y nítida' },
  { id: 'grotesk', label: 'Space Grotesk', family: GROTESK },
  { id: 'serif', label: 'Merriweather', family: SERIF, note: 'Serif lectura' },
  { id: 'cormorant', label: 'Cormorant', family: CORMORANT, note: 'Elegante' },
  { id: 'hand', label: 'Caveat', family: HAND, note: 'Manuscrita' },
  { id: 'mincho', label: 'Shippori Mincho', family: MINCHO, note: 'Caligráfica' },
  { id: 'orbitron', label: 'Orbitron', family: ORBITRON, note: 'Futurista' },
  { id: 'mono', label: 'JetBrains Mono', family: MONO, note: 'Código y fórmulas' }
];

const SPECTRAL = ['#38bdf8', '#a78bfa', '#34d399', '#fbbf24', '#fb7185', '#22d3ee', '#818cf8', '#2dd4bf'];
const VIVID = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#6366f1', '#14b8a6'];
const EARTH = ['#c2410c', '#b45309', '#4d7c0f', '#0f766e', '#1d4ed8', '#7e22ce', '#be123c', '#92400e'];
const NEON = ['#22d3ee', '#a855f7', '#f472b6', '#4ade80', '#facc15', '#fb923c', '#60a5fa', '#e879f9'];

function look(partial: Partial<NodeLook> & Pick<NodeLook, 'mode'>): NodeLook {
  return {
    fill: 'transparent',
    border: 'transparent',
    borderWidth: 0,
    text: 'ink',
    radius: 10,
    fontSize: 14,
    fontWeight: 500,
    paddingX: 14,
    paddingY: 8,
    ...partial
  };
}

export const MAP_THEMES: MapTheme[] = [
  /* ============================ CLÁSICOS ============================ */
  {
    id: 'aurora',
    name: 'Aurora',
    emoji: '🌌',
    group: 'Clásicos',
    dark: true,
    font: INTER,
    ink: '#f1f5f9',
    accent: '#a78bfa',
    canvas: {
      bg: 'radial-gradient(ellipse 80% 60% at 15% 10%, rgba(139,92,246,0.28), transparent 60%), radial-gradient(ellipse 70% 60% at 90% 90%, rgba(56,189,248,0.22), transparent 60%), #0b0d1a',
      pattern: 'dots',
      patternColor: 'rgba(255,255,255,0.09)',
      patternSize: 26,
      vignette: 0.35,
      grain: 0.05
    },
    palette: SPECTRAL,
    root: look({ mode: 'solid', fill: '#1e1b4b', border: '#a78bfa', borderWidth: 2, text: '#f5f3ff', radius: 16, fontSize: 19, fontWeight: 800, paddingX: 24, paddingY: 14, shadow: '0 10px 30px rgba(139,92,246,0.35)' }),
    second: look({ mode: 'solid', fill: 'branch', text: 'auto', radius: 14, fontSize: 15, fontWeight: 700, paddingX: 16, paddingY: 9, shadow: '0 6px 18px rgba(0,0,0,0.3)' }),
    node: look({ mode: 'tinted', fill: 'tint', border: 'branch', borderWidth: 1.2, text: 'ink', radius: 11, fontSize: 13.5, fontWeight: 500, paddingX: 12, paddingY: 6 }),
    line: { style: 'organic', width: 2.4, rootWidth: 9, opacity: 0.92, cap: 'round' }
  },
  {
    id: 'ocean',
    name: 'Océano',
    emoji: '🌊',
    group: 'Clásicos',
    dark: true,
    font: INTER,
    ink: '#e0f2fe',
    accent: '#38bdf8',
    canvas: {
      bg: 'linear-gradient(180deg, #04152b 0%, #062a4a 55%, #031020 100%)',
      pattern: 'lines',
      patternColor: 'rgba(125,211,252,0.07)',
      patternSize: 34,
      vignette: 0.3,
      grain: 0.04
    },
    palette: ['#38bdf8', '#22d3ee', '#60a5fa', '#2dd4bf', '#818cf8', '#7dd3fc', '#34d399', '#a5b4fc'],
    root: look({ mode: 'solid', fill: '#0c4a6e', border: '#38bdf8', borderWidth: 2, text: '#e0f2fe', radius: 18, fontSize: 19, fontWeight: 800, paddingX: 24, paddingY: 14 }),
    second: look({ mode: 'solid', fill: 'branch', text: 'auto', radius: 16, fontSize: 15, fontWeight: 700, paddingX: 16, paddingY: 9 }),
    node: look({ mode: 'outline', fill: 'transparent', border: 'branch', borderWidth: 1.4, text: 'ink', radius: 12, fontSize: 13.5, paddingX: 12, paddingY: 6 }),
    line: { style: 'curve', width: 2.4, rootWidth: 3.2, opacity: 0.9, cap: 'round' }
  },
  {
    id: 'forest',
    name: 'Bosque',
    emoji: '🌲',
    group: 'Clásicos',
    dark: true,
    font: INTER,
    ink: '#ecfdf5',
    accent: '#34d399',
    canvas: {
      bg: 'radial-gradient(ellipse 70% 50% at 80% 0%, rgba(52,211,153,0.2), transparent 60%), #06140f',
      pattern: 'dots',
      patternColor: 'rgba(110,231,183,0.1)',
      patternSize: 28,
      vignette: 0.4,
      grain: 0.05
    },
    palette: ['#34d399', '#a3e635', '#2dd4bf', '#fbbf24', '#4ade80', '#86efac', '#22d3ee', '#facc15'],
    root: look({ mode: 'solid', fill: '#064e3b', border: '#34d399', borderWidth: 2, text: '#ecfdf5', radius: 18, fontSize: 19, fontWeight: 800, paddingX: 24, paddingY: 14 }),
    second: look({ mode: 'solid', fill: 'branch', text: 'auto', radius: 16, fontSize: 15, fontWeight: 700, paddingX: 16, paddingY: 9 }),
    node: look({ mode: 'tinted', fill: 'tint', border: 'transparent', text: 'ink', radius: 11, fontSize: 13.5, paddingX: 12, paddingY: 6 }),
    line: { style: 'organic', width: 2.4, rootWidth: 8, opacity: 0.9, cap: 'round' }
  },
  {
    id: 'sunset',
    name: 'Atardecer',
    emoji: '🌅',
    group: 'Clásicos',
    dark: true,
    font: INTER,
    ink: '#fff1f2',
    accent: '#fb7185',
    canvas: {
      bg: 'radial-gradient(ellipse 80% 55% at 10% 100%, rgba(251,146,60,0.28), transparent 60%), radial-gradient(ellipse 70% 60% at 95% 5%, rgba(217,70,239,0.25), transparent 60%), #14070f',
      pattern: 'none',
      patternColor: 'transparent',
      patternSize: 24,
      vignette: 0.35,
      grain: 0.05
    },
    palette: ['#fb7185', '#fb923c', '#fbbf24', '#e879f9', '#f472b6', '#f97316', '#c084fc', '#fda4af'],
    root: look({ mode: 'solid', fill: '#4c0519', border: '#fb7185', borderWidth: 2, text: '#fff1f2', radius: 20, fontSize: 19, fontWeight: 800, paddingX: 24, paddingY: 14 }),
    second: look({ mode: 'solid', fill: 'branch', text: 'auto', radius: 20, fontSize: 15, fontWeight: 700, paddingX: 17, paddingY: 9 }),
    node: look({ mode: 'tinted', fill: 'tint', border: 'branch', borderWidth: 1, text: 'ink', radius: 16, fontSize: 13.5, paddingX: 12, paddingY: 6 }),
    line: { style: 'organic', width: 2.6, rootWidth: 9, opacity: 0.92, cap: 'round' }
  },
  {
    id: 'midnight',
    name: 'Medianoche',
    emoji: '🖤',
    group: 'Clásicos',
    dark: true,
    font: INTER,
    ink: '#f8fafc',
    accent: '#38bdf8',
    canvas: {
      bg: '#000000',
      pattern: 'dots',
      patternColor: 'rgba(255,255,255,0.1)',
      patternSize: 24,
      vignette: 0,
      grain: 0
    },
    palette: NEON,
    root: look({ mode: 'outline', fill: '#0a0a0c', border: '#f8fafc', borderWidth: 2, text: '#ffffff', radius: 14, fontSize: 19, fontWeight: 800, paddingX: 24, paddingY: 14 }),
    second: look({ mode: 'outline', fill: '#050507', border: 'branch', borderWidth: 2, text: '#ffffff', radius: 12, fontSize: 15, fontWeight: 700, paddingX: 16, paddingY: 9 }),
    node: look({ mode: 'ghost', fill: 'transparent', border: 'transparent', text: 'ink', radius: 8, fontSize: 13.5, paddingX: 10, paddingY: 5 }),
    line: { style: 'curve', width: 2, rootWidth: 2.4, opacity: 0.95, cap: 'round' }
  },

  /* ============================== CLAROS ============================ */
  {
    id: 'whiteboard',
    name: 'Pizarra blanca',
    emoji: '⬜',
    group: 'Claros',
    dark: false,
    font: INTER,
    ink: '#0f172a',
    accent: '#2563eb',
    canvas: {
      bg: '#fafafa',
      pattern: 'dots',
      patternColor: 'rgba(15,23,42,0.16)',
      patternSize: 24,
      vignette: 0,
      grain: 0
    },
    palette: VIVID,
    root: look({ mode: 'solid', fill: '#0f172a', border: '#0f172a', borderWidth: 0, text: '#ffffff', radius: 14, fontSize: 19, fontWeight: 800, paddingX: 24, paddingY: 14, shadow: '0 10px 24px rgba(15,23,42,0.28)' }),
    second: look({ mode: 'solid', fill: 'branch', text: 'auto', radius: 14, fontSize: 15, fontWeight: 700, paddingX: 16, paddingY: 9, shadow: '0 6px 14px rgba(15,23,42,0.18)' }),
    node: look({ mode: 'tinted', fill: 'tint', border: 'branch', borderWidth: 1.2, text: 'ink', radius: 11, fontSize: 13.5, paddingX: 12, paddingY: 6 }),
    line: { style: 'organic', width: 2.4, rootWidth: 9, opacity: 0.95, cap: 'round' }
  },
  {
    id: 'paper',
    name: 'Papel',
    emoji: '📄',
    group: 'Claros',
    dark: false,
    font: SERIF,
    ink: '#2a2f3d',
    accent: '#b45309',
    canvas: {
      bg: 'radial-gradient(ellipse 90% 70% at 50% 40%, #fbf4e2 0%, #f1e6c9 100%)',
      pattern: 'lines',
      patternColor: 'rgba(70,110,170,0.16)',
      patternSize: 32,
      vignette: 0.12,
      grain: 0.12
    },
    palette: EARTH,
    root: look({ mode: 'solid', fill: '#3b2a1a', border: '#3b2a1a', text: '#fbf4e2', radius: 8, fontSize: 19, fontWeight: 700, paddingX: 24, paddingY: 14, shadow: '0 8px 20px rgba(60,40,10,0.3)' }),
    second: look({ mode: 'solid', fill: 'branch', text: 'auto', radius: 8, fontSize: 15, fontWeight: 700, paddingX: 16, paddingY: 9, shadow: '0 4px 10px rgba(60,40,10,0.22)' }),
    node: look({ mode: 'tinted', fill: 'tint', border: 'branch', borderWidth: 1, text: 'ink', radius: 6, fontSize: 13.5, paddingX: 12, paddingY: 6 }),
    line: { style: 'curve', width: 2.2, rootWidth: 3, opacity: 0.9, cap: 'round' }
  },
  {
    id: 'candy',
    name: 'Caramelo',
    emoji: '🍬',
    group: 'Claros',
    dark: false,
    font: INTER,
    ink: '#3b0764',
    accent: '#d946ef',
    canvas: {
      bg: 'radial-gradient(ellipse 80% 60% at 20% 0%, #fdf4ff, transparent 60%), radial-gradient(ellipse 70% 60% at 90% 100%, #ecfeff, transparent 60%), #fff7fb',
      pattern: 'dots',
      patternColor: 'rgba(168,85,247,0.18)',
      patternSize: 26,
      vignette: 0,
      grain: 0
    },
    palette: ['#f472b6', '#c084fc', '#60a5fa', '#34d399', '#fbbf24', '#fb923c', '#22d3ee', '#a3e635'],
    root: look({ mode: 'solid', fill: '#581c87', border: '#581c87', text: '#fdf4ff', radius: 24, fontSize: 19, fontWeight: 800, paddingX: 26, paddingY: 14, shadow: '0 10px 24px rgba(88,28,135,0.3)' }),
    second: look({ mode: 'solid', fill: 'branch', text: 'auto', radius: 22, fontSize: 15, fontWeight: 700, paddingX: 18, paddingY: 9, shadow: '0 6px 14px rgba(88,28,135,0.2)' }),
    node: look({ mode: 'tinted', fill: 'tint', border: 'branch', borderWidth: 1.2, text: 'ink', radius: 16, fontSize: 13.5, paddingX: 13, paddingY: 6 }),
    line: { style: 'organic', width: 2.6, rootWidth: 9, opacity: 0.95, cap: 'round' }
  },

  /* ========================== INMERSIVOS ============================ */
  {
    id: 'desk',
    name: 'Escritorio',
    emoji: '🪵',
    group: 'Inmersivos',
    dark: true,
    font: HAND,
    ink: '#fff3df',
    accent: '#f59e0b',
    canvas: {
      bg: 'radial-gradient(ellipse 70% 55% at 12% 0%, rgba(255,186,98,0.22) 0%, transparent 62%), repeating-linear-gradient(94deg, rgba(0,0,0,0.16) 0 2px, transparent 2px 9px, rgba(255,220,170,0.025) 9px 10px, transparent 10px 23px), linear-gradient(180deg, #2c1b10 0%, #20150c 55%, #170e08 100%)',
      pattern: 'none',
      patternColor: 'transparent',
      patternSize: 24,
      vignette: 0.45,
      grain: 0.1
    },
    palette: ['#fde68a', '#fbcfe8', '#bae6fd', '#bbf7d0', '#fed7aa', '#ddd6fe', '#fecaca', '#a7f3d0'],
    root: look({ mode: 'paper', fill: '#fbf4e2', border: 'transparent', text: '#3a2a12', radius: 4, fontSize: 24, fontWeight: 700, paddingX: 26, paddingY: 12, shadow: '0 14px 26px rgba(0,0,0,0.55), 0 2px 0 rgba(255,255,255,0.4) inset' }),
    second: look({ mode: 'paper', fill: 'branch', text: '#2b2112', radius: 3, fontSize: 21, fontWeight: 700, paddingX: 18, paddingY: 8, shadow: '0 10px 20px rgba(0,0,0,0.5)' }),
    node: look({ mode: 'paper', fill: '#fdf8ea', text: '#2b2112', radius: 3, fontSize: 18, fontWeight: 600, paddingX: 13, paddingY: 5, shadow: '0 6px 14px rgba(0,0,0,0.45)' }),
    line: { style: 'curve', width: 2.4, rootWidth: 3, opacity: 0.85, cap: 'round' }
  },
  {
    id: 'corkboard',
    name: 'Corcho',
    emoji: '📌',
    group: 'Inmersivos',
    dark: false,
    font: HAND,
    ink: '#3b2410',
    accent: '#dc2626',
    canvas: {
      bg: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.18), transparent 40%), radial-gradient(circle at 70% 80%, rgba(90,50,10,0.25), transparent 45%), #b98a58',
      pattern: 'none',
      patternColor: 'transparent',
      patternSize: 24,
      vignette: 0.35,
      grain: 0.5
    },
    palette: ['#fde047', '#fda4af', '#7dd3fc', '#86efac', '#fdba74', '#c4b5fd', '#fca5a5', '#5eead4'],
    root: look({ mode: 'paper', fill: '#fffaf0', text: '#3b2410', radius: 2, fontSize: 24, fontWeight: 700, paddingX: 26, paddingY: 12, shadow: '0 10px 18px rgba(60,30,5,0.5)' }),
    second: look({ mode: 'paper', fill: 'branch', text: '#3b2410', radius: 2, fontSize: 21, fontWeight: 700, paddingX: 18, paddingY: 9, shadow: '0 8px 14px rgba(60,30,5,0.45)' }),
    node: look({ mode: 'paper', fill: '#fffdf5', text: '#3b2410', radius: 2, fontSize: 18, fontWeight: 600, paddingX: 13, paddingY: 6, shadow: '0 5px 10px rgba(60,30,5,0.4)' }),
    line: { style: 'curve', width: 2.2, rootWidth: 2.6, opacity: 0.95, cap: 'round', dash: '' }
  },
  {
    id: 'chalkboard',
    name: 'Pizarra',
    emoji: '🧑‍🏫',
    group: 'Inmersivos',
    dark: true,
    font: HAND,
    ink: '#f1f5e9',
    accent: '#86efac',
    canvas: {
      bg: 'radial-gradient(ellipse 80% 60% at 50% 30%, #2f4f3f 0%, #1f3a2d 60%, #152a20 100%)',
      pattern: 'none',
      patternColor: 'transparent',
      patternSize: 24,
      vignette: 0.4,
      grain: 0.14
    },
    palette: ['#fef9c3', '#fbcfe8', '#bae6fd', '#bbf7d0', '#fed7aa', '#e9d5ff', '#fecaca', '#a7f3d0'],
    root: look({ mode: 'outline', fill: 'transparent', border: '#f1f5e9', borderWidth: 2.4, text: '#f8fafc', radius: 18, fontSize: 26, fontWeight: 700, paddingX: 26, paddingY: 12 }),
    second: look({ mode: 'outline', fill: 'transparent', border: 'branch', borderWidth: 2.2, text: 'branch', radius: 14, fontSize: 22, fontWeight: 700, paddingX: 18, paddingY: 8 }),
    node: look({ mode: 'ghost', fill: 'transparent', border: 'transparent', text: 'ink', radius: 8, fontSize: 19, fontWeight: 600, paddingX: 10, paddingY: 4 }),
    line: { style: 'curve', width: 2.6, rootWidth: 3, opacity: 0.85, cap: 'round', dash: '7 5' }
  },
  {
    id: 'cabin',
    name: 'Cabaña',
    emoji: '🏡',
    group: 'Inmersivos',
    dark: true,
    font: HAND,
    ink: '#fff1e0',
    accent: '#ea580c',
    canvas: {
      bg: 'radial-gradient(ellipse 46% 34% at 6% 100%, rgba(255,120,40,0.3), transparent 70%), radial-gradient(ellipse 30% 38% at 94% 10%, rgba(165,190,255,0.15), transparent 70%), repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0 3px, transparent 3px 15px), repeating-linear-gradient(180deg, #5d391f 0px, #4a2c17 16px, #35200f 52px, #1e1008 68px)',
      pattern: 'none',
      patternColor: 'transparent',
      patternSize: 24,
      vignette: 0.5,
      grain: 0.1
    },
    palette: ['#e9c58f', '#d8a86a', '#c9b37e', '#b9a07a', '#e2b987', '#cfa870', '#d9bd8e', '#c4a574'],
    root: look({ mode: 'paper', fill: '#ecd3a4', text: '#3a200c', radius: 3, fontSize: 24, fontWeight: 700, paddingX: 26, paddingY: 12, shadow: '0 12px 22px rgba(0,0,0,0.6)' }),
    second: look({ mode: 'paper', fill: 'branch', text: '#3a200c', radius: 3, fontSize: 21, fontWeight: 700, paddingX: 18, paddingY: 8, shadow: '0 9px 18px rgba(0,0,0,0.55)' }),
    node: look({ mode: 'paper', fill: '#f3e1ba', text: '#3a200c', radius: 3, fontSize: 18, fontWeight: 600, paddingX: 13, paddingY: 5, shadow: '0 5px 12px rgba(0,0,0,0.5)' }),
    line: { style: 'curve', width: 2.4, rootWidth: 3, opacity: 0.9, cap: 'round' }
  },
  {
    id: 'library',
    name: 'Biblioteca',
    emoji: '📚',
    group: 'Inmersivos',
    dark: true,
    font: SERIF,
    ink: '#f6f1de',
    accent: '#d4a93a',
    canvas: {
      bg: 'radial-gradient(ellipse 60% 45% at 86% 0%, rgba(235,200,110,0.22), transparent 65%), radial-gradient(ellipse 50% 50% at 0% 100%, rgba(30,120,80,0.14), transparent 70%), repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 2px, transparent 2px 28px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.02) 0 2px, transparent 2px 28px), linear-gradient(180deg, #112219 0%, #0a1510 100%)',
      pattern: 'none',
      patternColor: 'transparent',
      patternSize: 24,
      vignette: 0.5,
      grain: 0.08
    },
    palette: ['#d4a93a', '#c2693a', '#7aa874', '#6d8fbf', '#b5748a', '#8e7cc3', '#c49a6c', '#5fa8a0'],
    root: look({ mode: 'solid', fill: '#2a120f', border: '#d4a93a', borderWidth: 2, text: '#f0d58c', radius: 4, family: CORMORANT, fontSize: 26, fontWeight: 700, paddingX: 26, paddingY: 12, shadow: '0 12px 24px rgba(0,0,0,0.55)' }),
    second: look({ mode: 'solid', fill: '#efe2bd', border: 'branch', borderWidth: 2, text: '#33281a', radius: 4, family: CORMORANT, fontSize: 20, fontWeight: 700, paddingX: 18, paddingY: 8, shadow: '0 8px 18px rgba(0,0,0,0.5)' }),
    node: look({ mode: 'solid', fill: '#e6d8ae', border: 'transparent', text: '#33281a', radius: 3, fontSize: 13.5, fontWeight: 500, paddingX: 12, paddingY: 6, shadow: '0 4px 10px rgba(0,0,0,0.45)' }),
    line: { style: 'curve', width: 2.2, rootWidth: 3, opacity: 0.85, cap: 'round' }
  },
  {
    id: 'office',
    name: 'Oficina',
    emoji: '🏢',
    group: 'Inmersivos',
    dark: true,
    font: INTER,
    ink: '#f1f5fb',
    accent: '#60a5fa',
    canvas: {
      bg: 'linear-gradient(180deg, rgba(225,238,255,0.18) 0, rgba(225,238,255,0) 12%), radial-gradient(ellipse 80% 40% at 50% 0%, rgba(190,215,255,0.12), transparent 70%), repeating-linear-gradient(180deg, rgba(255,255,255,0.035) 0 3px, transparent 3px 24px), linear-gradient(180deg, #1e2735 0%, #111720 100%)',
      pattern: 'none',
      patternColor: 'transparent',
      patternSize: 24,
      vignette: 0.3,
      grain: 0.03
    },
    palette: ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#22d3ee', '#fb923c', '#94a3b8'],
    root: look({ mode: 'solid', fill: '#ffffff', border: 'transparent', text: '#0b1220', radius: 12, fontSize: 19, fontWeight: 800, paddingX: 24, paddingY: 14, shadow: '0 12px 26px rgba(0,0,0,0.45)' }),
    second: look({ mode: 'solid', fill: '#f4f6fa', border: 'transparent', text: '#0f172a', radius: 10, fontSize: 15, fontWeight: 700, paddingX: 16, paddingY: 9, shadow: '0 8px 18px rgba(0,0,0,0.38)' }),
    node: look({ mode: 'solid', fill: '#e8edf5', border: 'transparent', text: '#1e293b', radius: 8, fontSize: 13.5, fontWeight: 500, paddingX: 12, paddingY: 6, shadow: '0 4px 10px rgba(0,0,0,0.3)' }),
    line: { style: 'elbow', width: 2.2, rootWidth: 2.6, opacity: 0.95, cap: 'round' }
  },
  {
    id: 'zen',
    name: 'Zen',
    emoji: '🎋',
    group: 'Inmersivos',
    dark: false,
    font: MINCHO,
    ink: '#1f2a1c',
    accent: '#c0392b',
    canvas: {
      bg: 'radial-gradient(circle at 82% 16%, rgba(192,57,43,0.12) 0 70px, transparent 72px), radial-gradient(ellipse 80% 60% at 30% 0%, rgba(255,255,255,0.7), transparent 60%), #efe9d8',
      pattern: 'grid',
      patternColor: 'rgba(60,70,50,0.07)',
      patternSize: 140,
      vignette: 0.18,
      grain: 0.35
    },
    palette: ['#2f3d2a', '#8a3b2e', '#4a5d45', '#7a5c3e', '#5b6b5a', '#a04a3a', '#3f4f3a', '#6b4e3a'],
    root: look({ mode: 'solid', fill: '#1f2a1c', border: 'transparent', text: '#f4efe0', radius: 2, fontSize: 22, fontWeight: 700, paddingX: 26, paddingY: 14, shadow: '0 8px 18px rgba(30,40,20,0.35)' }),
    second: look({ mode: 'outline', fill: '#f8f3e4', border: 'branch', borderWidth: 1.6, text: 'ink', radius: 2, fontSize: 16, fontWeight: 700, paddingX: 17, paddingY: 9 }),
    node: look({ mode: 'ghost', fill: 'transparent', border: 'transparent', text: 'ink', radius: 2, fontSize: 14, fontWeight: 600, paddingX: 10, paddingY: 5 }),
    line: { style: 'curve', width: 2, rootWidth: 5, opacity: 0.9, cap: 'round' }
  },
  {
    id: 'cyber',
    name: 'Futurista',
    emoji: '🧬',
    group: 'Inmersivos',
    dark: true,
    font: INTER,
    ink: '#e8fbff',
    accent: '#22d3ee',
    canvas: {
      bg: 'radial-gradient(ellipse 70% 40% at 50% 100%, rgba(34,211,238,0.24), transparent 70%), radial-gradient(ellipse 50% 40% at 82% 0%, rgba(168,85,247,0.22), transparent 70%), linear-gradient(180deg, #060b1c 0%, #050814 60%, #04060f 100%)',
      pattern: 'grid',
      patternColor: 'rgba(34,211,238,0.14)',
      patternSize: 56,
      vignette: 0.5,
      grain: 0
    },
    palette: NEON,
    root: look({ mode: 'glass', fill: 'rgba(8,20,40,0.85)', border: '#22d3ee', borderWidth: 2, text: '#e8fbff', radius: 6, family: ORBITRON, fontSize: 17, fontWeight: 800, paddingX: 24, paddingY: 14, shadow: '0 0 28px rgba(34,211,238,0.45)' }),
    second: look({ mode: 'glass', fill: 'rgba(8,20,40,0.8)', border: 'branch', borderWidth: 1.8, text: '#e8fbff', radius: 6, fontSize: 15, fontWeight: 700, paddingX: 16, paddingY: 9, shadow: '0 0 18px rgba(34,211,238,0.28)' }),
    node: look({ mode: 'glass', fill: 'rgba(8,18,36,0.7)', border: 'branch', borderWidth: 1, text: 'ink', radius: 5, fontSize: 13.5, fontWeight: 500, paddingX: 12, paddingY: 6 }),
    line: { style: 'elbow', width: 2, rootWidth: 2.6, opacity: 0.95, cap: 'butt' }
  },
  {
    id: 'space',
    name: 'Espacio',
    emoji: '🪐',
    group: 'Inmersivos',
    dark: true,
    font: GROTESK,
    ink: '#eef2ff',
    accent: '#a5b4fc',
    canvas: {
      bg: 'radial-gradient(1.2px 1.2px at 12% 18%, #fff, transparent), radial-gradient(1px 1px at 28% 62%, rgba(255,255,255,0.9), transparent), radial-gradient(1.4px 1.4px at 44% 12%, #cfe3ff, transparent), radial-gradient(1px 1px at 63% 38%, #fff, transparent), radial-gradient(1.2px 1.2px at 78% 72%, #ffe9c4, transparent), radial-gradient(1px 1px at 90% 20%, #fff, transparent), radial-gradient(1px 1px at 8% 84%, #fff, transparent), radial-gradient(ellipse 60% 45% at 80% 12%, rgba(99,102,241,0.36), transparent 70%), radial-gradient(ellipse 50% 40% at 8% 92%, rgba(168,85,247,0.26), transparent 70%), radial-gradient(ellipse 130% 36% at 50% 135%, rgba(56,189,248,0.5), transparent 60%), linear-gradient(180deg, #050615, #0a0c24)',
      pattern: 'none',
      patternColor: 'transparent',
      patternSize: 24,
      vignette: 0.45,
      grain: 0
    },
    palette: ['#a5b4fc', '#c4b5fd', '#7dd3fc', '#f0abfc', '#fda4af', '#fde68a', '#99f6e4', '#bef264'],
    root: look({ mode: 'glass', fill: 'rgba(20,24,60,0.7)', border: '#a5b4fc', borderWidth: 1.8, text: '#ffffff', radius: 22, fontSize: 19, fontWeight: 700, paddingX: 26, paddingY: 14, shadow: '0 0 34px rgba(129,140,248,0.4)' }),
    second: look({ mode: 'glass', fill: 'rgba(20,24,60,0.6)', border: 'branch', borderWidth: 1.6, text: '#f1f5ff', radius: 18, fontSize: 15, fontWeight: 700, paddingX: 17, paddingY: 9, shadow: '0 0 20px rgba(129,140,248,0.22)' }),
    node: look({ mode: 'glass', fill: 'rgba(16,20,52,0.5)', border: 'transparent', text: 'ink', radius: 14, fontSize: 13.5, paddingX: 12, paddingY: 6 }),
    line: { style: 'curve', width: 2, rootWidth: 3, opacity: 0.85, cap: 'round' }
  },
  {
    id: 'blueprint',
    name: 'Plano',
    emoji: '📐',
    group: 'Inmersivos',
    dark: true,
    font: MONO,
    ink: '#e0f2fe',
    accent: '#7dd3fc',
    canvas: {
      bg: 'radial-gradient(ellipse 90% 70% at 50% 40%, #1d4f91 0%, #14386a 100%)',
      pattern: 'blueprint',
      patternColor: 'rgba(255,255,255,0.14)',
      patternSize: 48,
      vignette: 0.3,
      grain: 0.04
    },
    palette: ['#e0f2fe', '#bae6fd', '#fde68a', '#bbf7d0', '#fbcfe8', '#ddd6fe', '#fed7aa', '#a7f3d0'],
    root: look({ mode: 'outline', fill: 'rgba(255,255,255,0.08)', border: '#e0f2fe', borderWidth: 2, text: '#ffffff', radius: 2, fontSize: 18, fontWeight: 700, paddingX: 24, paddingY: 14 }),
    second: look({ mode: 'outline', fill: 'transparent', border: 'branch', borderWidth: 1.6, text: '#ffffff', radius: 2, fontSize: 14.5, fontWeight: 700, paddingX: 16, paddingY: 9 }),
    node: look({ mode: 'ghost', fill: 'transparent', border: 'transparent', text: 'ink', radius: 2, fontSize: 13, fontWeight: 500, paddingX: 10, paddingY: 5 }),
    line: { style: 'elbow', width: 1.6, rootWidth: 2, opacity: 0.95, cap: 'butt', dash: '' }
  }
];

export const THEME_BY_ID: Record<string, MapTheme> = Object.fromEntries(MAP_THEMES.map((t) => [t.id, t]));

/** Ambiente de la app → tema del mapa (para "Automático") */
export const ENV_TO_MAP_THEME: Record<string, string> = {
  desk_wood: 'desk',
  cabin: 'cabin',
  library: 'library',
  office: 'office',
  modern_black: 'midnight',
  zen_garden: 'zen',
  cyber_grid: 'cyber',
  space_station: 'space',
  holo_cyber: 'aurora',
  digital_blue: 'ocean',
  emerald_vision: 'forest',
  sunset_magenta: 'sunset'
};

export function themeForAppEnvironment(env?: string): MapTheme {
  return THEME_BY_ID[ENV_TO_MAP_THEME[env || ''] || 'aurora'] || MAP_THEMES[0];
}

export interface ResolvedNodeStyle {
  fillColor: string;
  borderColor: string;
  borderWidth: number;
  color: string;
  borderRadius: number;
  fontSize: number;
  fontWeight: number;
  paddingX: number;
  paddingY: number;
  fontFamily: string;
  /** Pintura CSS del contenido (papel / vidrio / sombra) */
  boxCss: string;
}

/** Resuelve el estilo final de un nivel dado el color de su rama. */
export function resolveLook(theme: MapTheme, level: 'root' | 'second' | 'node', branch: string): ResolvedNodeStyle {
  const lk = theme[level];
  const tintAlpha = theme.dark ? 0.2 : 0.16;

  const resolveColor = (v: string): string => {
    if (v === 'branch') return branch;
    if (v === 'tint') return withAlpha(branch, tintAlpha);
    return v;
  };

  let fill = resolveColor(lk.fill);
  const border = resolveColor(lk.border);

  let color: string;
  if (lk.text === 'ink') color = theme.ink;
  else if (lk.text === 'branch') color = lk.mode === 'ghost' || lk.mode === 'outline' ? mix(branch, theme.dark ? '#ffffff' : '#000000', 0.25) : branch;
  else if (lk.text === 'auto') color = readableOn(isTransparent(fill) ? (theme.dark ? '#111827' : '#ffffff') : fill);
  else color = lk.text;

  // En modo papel/vidrio el relleno lo pinta el contenido (sombra, degradado) y la forma SVG queda transparente
  let boxCss = '';
  let shapeFill = fill;
  if (lk.mode === 'paper') {
    shapeFill = 'transparent';
    const base = fill;
    boxCss = `background: linear-gradient(180deg, ${lighten(base, 0.18)}, ${base} 55%, ${darken(base, 0.06)}); box-shadow: ${lk.shadow || 'none'};`;
  } else if (lk.mode === 'glass') {
    shapeFill = 'transparent';
    boxCss = `background: ${fill}; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); box-shadow: ${lk.shadow || 'none'};`;
  } else if (lk.shadow) {
    boxCss = `box-shadow: ${lk.shadow};`;
  }
  if (lk.mode === 'ghost') {
    shapeFill = 'transparent';
  }
  fill = shapeFill;

  return {
    fillColor: fill,
    borderColor: lk.mode === 'paper' || lk.mode === 'glass' ? (lk.mode === 'glass' ? border : 'transparent') : border,
    borderWidth: lk.mode === 'paper' ? 0 : lk.borderWidth,
    color,
    borderRadius: lk.radius,
    fontSize: lk.fontSize,
    fontWeight: lk.fontWeight,
    paddingX: lk.paddingX,
    paddingY: lk.paddingY,
    fontFamily: lk.family || theme.font,
    boxCss
  };
}
