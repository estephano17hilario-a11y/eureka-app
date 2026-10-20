/**
 * Estudio de estilo avanzado: panel con vista previa en vivo para personalizar cada elemento de la app
 * (fondo, botones, cuadernos, tarjetas, flashcards, contenido, navegación y texto).
 * Se abre como panel lateral (escritorio) u hoja inferior (móvil) sin tapar la app, para ver el efecto al instante.
 */

import { themeService, DEFAULT_ADVANCED, type AdvancedStyle } from '../services/theme.service';

type Opt = [string | number, string];

type Control =
  | { type: 'seg'; k: keyof AdvancedStyle; label: string; opts: Opt[] }
  | { type: 'color'; k: keyof AdvancedStyle; label: string; swatches: string[] }
  | { type: 'range'; k: keyof AdvancedStyle; label: string; min: number; max: number; step: number; unit: string; off?: number };

interface Tab {
  id: string;
  label: string;
  emoji: string;
  controls: Control[];
}

const DARK_SW = ['#0b0d14', '#111827', '#1e293b', '#14231b', '#2a1c12', '#1a1033', '#3b0a1f', '#000000'];
const LIGHT_SW = ['#ffffff', '#f8fafc', '#fbf4e2', '#e8f0ff', '#e7f5ec', '#fde8ef', '#f5f0ff', '#fff7d6'];
const ACCENT_SW = ['#38bdf8', '#10b981', '#a855f7', '#f59e0b', '#ec4899', '#ef4444', '#6366f1', '#14b8a6', '#f97316', '#ffffff'];
const INK_SW = ['#ffffff', '#f1f5f9', '#cbd5e1', '#0f172a', '#1f2937', '#3b2a1a', '#fde68a', '#86efac'];

const TABS: Tab[] = [
  {
    id: 'bg',
    label: 'Fondo',
    emoji: '🖼️',
    controls: [
      { type: 'range', k: 'bgDim', label: 'Oscurecer', min: 0, max: 70, step: 1, unit: '%' },
      { type: 'range', k: 'bgBlur', label: 'Desenfoque', min: 0, max: 24, step: 1, unit: 'px' },
      { type: 'range', k: 'bgSaturate', label: 'Saturación', min: 40, max: 160, step: 1, unit: '%' },
      { type: 'color', k: 'bgColor', label: 'Color sólido (reemplaza al ambiente)', swatches: DARK_SW }
    ]
  },
  {
    id: 'buttons',
    label: 'Botones',
    emoji: '🔘',
    controls: [
      { type: 'seg', k: 'btnShape', label: 'Forma', opts: [['default', 'Del ambiente'], ['pill', 'Píldora'], ['rounded', 'Redondeado'], ['square', 'Recto']] },
      { type: 'seg', k: 'btnStyle', label: 'Estilo', opts: [['default', 'Del ambiente'], ['solid', 'Sólido'], ['gradient', 'Degradado'], ['glass', 'Cristal'], ['outline', 'Contorno']] },
      { type: 'color', k: 'btnColor', label: 'Color de los botones', swatches: ACCENT_SW },
      { type: 'seg', k: 'btnSize', label: 'Tamaño', opts: [['default', 'Normal'], ['compact', 'Compacto'], ['large', 'Grande']] },
      { type: 'seg', k: 'btnShadow', label: 'Sombra', opts: [['default', 'Normal'], ['none', 'Sin sombra'], ['glow', 'Resplandor']] }
    ]
  },
  {
    id: 'notebooks',
    label: 'Cuadernos',
    emoji: '📓',
    controls: [
      { type: 'seg', k: 'nbStyle', label: 'Tapa', opts: [['default', 'Realista'], ['flat', 'Plana'], ['glass', 'Cristal']] },
      { type: 'range', k: 'nbRadius', label: 'Esquinas', min: 0, max: 28, step: 1, unit: 'px', off: -1 },
      { type: 'seg', k: 'nbShadow', label: 'Sombra', opts: [['default', 'Normal'], ['none', 'Sin sombra'], ['deep', 'Profunda']] }
    ]
  },
  {
    id: 'cards',
    label: 'Tarjetas',
    emoji: '🗂️',
    controls: [
      { type: 'color', k: 'cardBg', label: 'Color de las tarjetas', swatches: DARK_SW.concat(LIGHT_SW.slice(0, 3)) },
      { type: 'range', k: 'cardOpacity', label: 'Transparencia', min: 30, max: 100, step: 1, unit: '%' },
      { type: 'range', k: 'cardBlur', label: 'Efecto cristal', min: 0, max: 30, step: 1, unit: 'px' },
      { type: 'seg', k: 'cardBorder', label: 'Borde', opts: [['default', 'Del ambiente'], ['none', 'Sin borde'], ['thin', 'Fino'], ['accent', 'Acento']] }
    ]
  },
  {
    id: 'flash',
    label: 'Flashcards',
    emoji: '🎴',
    controls: [
      { type: 'color', k: 'fcBg', label: 'Fondo de la tarjeta', swatches: DARK_SW.concat(LIGHT_SW) },
      { type: 'color', k: 'fcText', label: 'Color del texto', swatches: INK_SW },
      { type: 'seg', k: 'fcFont', label: 'Tipografía', opts: [['default', 'Del ambiente'], ['rounded', 'Redonda'], ['serif', 'Serif'], ['mono', 'Código'], ['hand', 'Manuscrita']] },
      { type: 'range', k: 'fcScale', label: 'Tamaño del texto', min: 80, max: 150, step: 5, unit: '%' },
      { type: 'range', k: 'fcRadius', label: 'Esquinas', min: 0, max: 40, step: 1, unit: 'px', off: -1 },
      { type: 'seg', k: 'fcBar', label: 'Franja de acento', opts: [['default', 'Del ambiente'], ['none', 'Ninguna'], ['top', 'Arriba'], ['left', 'Izquierda']] }
    ]
  },
  {
    id: 'content',
    label: 'Contenido',
    emoji: '📖',
    controls: [
      { type: 'color', k: 'paperBg', label: 'Color de la hoja', swatches: LIGHT_SW.concat(DARK_SW.slice(0, 3)) },
      { type: 'color', k: 'paperInk', label: 'Color del texto', swatches: INK_SW },
      { type: 'seg', k: 'contentFont', label: 'Tipografía', opts: [['default', 'Del ambiente'], ['sans', 'Moderna'], ['serif', 'Serif'], ['mono', 'Código'], ['hand', 'Manuscrita']] },
      { type: 'range', k: 'contentScale', label: 'Tamaño del texto', min: 85, max: 150, step: 5, unit: '%' },
      { type: 'range', k: 'contentLine', label: 'Interlineado', min: 0, max: 210, step: 5, unit: '%', off: 0 }
    ]
  },
  {
    id: 'ui',
    label: 'Interfaz',
    emoji: '🧭',
    controls: [
      { type: 'seg', k: 'navStyle', label: 'Barra inferior', opts: [['default', 'Del ambiente'], ['glass', 'Cristal'], ['solid', 'Sólida'], ['minimal', 'Minimal']] },
      { type: 'seg', k: 'uiFont', label: 'Tipografía de la app', opts: [['default', 'Del ambiente'], ['inter', 'Inter'], ['outfit', 'Outfit'], ['serif', 'Serif'], ['mono', 'Código']] },
      { type: 'color', k: 'textColor', label: 'Color del texto general', swatches: INK_SW }
    ]
  }
];

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function controlHtml(c: Control, a: AdvancedStyle): string {
  const cur = a[c.k] as string | number;
  if (c.type === 'seg') {
    return `<div class="ss-field"><div class="ss-label">${c.label}</div><div class="ss-seg">${c.opts
      .map(([v, l]) => `<button type="button" class="${String(cur) === String(v) ? 'on' : ''}" data-k="${c.k}" data-v="${v}">${l}</button>`)
      .join('')}</div></div>`;
  }
  if (c.type === 'color') {
    const v = String(cur || '').toLowerCase();
    return `<div class="ss-field"><div class="ss-label">${c.label}</div><div class="ss-sw-row">
      <button type="button" class="ss-sw auto ${v ? '' : 'on'}" data-k="${c.k}" data-c="" title="Automático">↺</button>
      ${c.swatches.map((s) => `<button type="button" class="ss-sw ${v === s.toLowerCase() ? 'on' : ''}" data-k="${c.k}" data-c="${s}" style="--c:${s}" aria-label="${s}"></button>`).join('')}
      <label class="ss-sw custom" title="Color personalizado"><input type="color" data-colork="${c.k}" value="${/^#[0-9a-f]{6}$/i.test(v) ? v : '#888888'}" /></label>
    </div></div>`;
  }
  const num = Number(cur);
  const off = c.off;
  const isOff = off !== undefined && num === off;
  return `<div class="ss-field"><div class="ss-label">${c.label}<b data-val-of="${c.k}">${isOff ? 'Auto' : `${num}${c.unit}`}</b></div>
    <input class="ss-range" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${isOff ? c.min : num}" data-rangek="${c.k}" data-unit="${c.unit}" ${off !== undefined ? `data-off="${off}"` : ''} /></div>`;
}

let activeEl: HTMLElement | null = null;

export function closeStyleStudio(): void {
  activeEl?.remove();
  activeEl = null;
  document.body.classList.remove('ss-open');
}

export function openStyleStudio(): void {
  closeStyleStudio();
  let tabId = TABS[0].id;
  const el = document.createElement('div');
  el.className = 'style-studio';
  activeEl = el;
  document.body.appendChild(el);
  document.body.classList.add('ss-open');

  const render = () => {
    const a = themeService.getAdvanced();
    const tab = TABS.find((t) => t.id === tabId) || TABS[0];
    el.innerHTML = `
      <div class="ss-grab"></div>
      <div class="ss-head">
        <div><b>Estilo avanzado</b><span>Cada cambio se ve al instante</span></div>
        <button type="button" class="ss-ghost" data-act="reset">Restablecer</button>
        <button type="button" class="ss-close" data-act="close" aria-label="Cerrar">✕</button>
      </div>
      <div class="ss-preview">
        <button type="button" class="figma-btn-blue-pill">Estudiar</button>
        <button type="button" class="figma-btn-white-pill">Secundario</button>
        <div class="ss-mini-fc cupertino-flashcard-box"><span>¿Qué es la entropía?</span></div>
      </div>
      <div class="ss-tabs" role="tablist">${TABS.map((t) => `<button type="button" role="tab" class="${t.id === tabId ? 'on' : ''}" data-tab="${t.id}"><i>${t.emoji}</i>${t.label}</button>`).join('')}</div>
      <div class="ss-body">${tab.controls.map((c) => controlHtml(c, a)).join('')}</div>`;
  };

  const parse = (k: string, v: string): string | number => {
    const def = DEFAULT_ADVANCED[k as keyof AdvancedStyle];
    return typeof def === 'number' ? Number(v) : v;
  };

  el.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const act = (t.closest('[data-act]') as HTMLElement | null)?.dataset.act;
    if (act === 'close') return closeStyleStudio();
    if (act === 'reset') {
      themeService.resetAdvanced();
      render();
      return;
    }
    const tab = t.closest('[data-tab]') as HTMLElement | null;
    if (tab) {
      tabId = tab.dataset.tab as string;
      render();
      return;
    }
    const seg = t.closest('button[data-k][data-v]') as HTMLElement | null;
    if (seg) {
      themeService.setAdvanced({ [seg.dataset.k as string]: parse(seg.dataset.k as string, seg.dataset.v as string) } as Partial<AdvancedStyle>);
      render();
      return;
    }
    const sw = t.closest('button[data-k][data-c]') as HTMLElement | null;
    if (sw) {
      themeService.setAdvanced({ [sw.dataset.k as string]: sw.dataset.c || '' } as Partial<AdvancedStyle>);
      render();
    }
  });

  el.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.dataset.rangek) {
      const v = Number(t.value);
      const off = t.dataset.off !== undefined ? Number(t.dataset.off) : null;
      const label = el.querySelector(`[data-val-of="${t.dataset.rangek}"]`);
      if (label) label.textContent = `${v}${t.dataset.unit}`;
      void off;
      themeService.previewAdvanced({ [t.dataset.rangek]: v } as Partial<AdvancedStyle>);
    } else if (t.dataset.colork) {
      themeService.previewAdvanced({ [t.dataset.colork]: t.value } as Partial<AdvancedStyle>);
    }
  });

  el.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.dataset.rangek) themeService.setAdvanced({ [t.dataset.rangek]: Number(t.value) } as Partial<AdvancedStyle>);
    else if (t.dataset.colork) {
      themeService.setAdvanced({ [t.dataset.colork]: t.value } as Partial<AdvancedStyle>);
      render();
    }
  });

  render();
  void esc;
}
