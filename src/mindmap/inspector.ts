/**
 * Panel de formato: pestañas "Idea" (estilo y contenido del nodo), "Mapa" (diseño, tema, líneas, fondo)
 * y "Plantillas". En escritorio es un panel lateral; en móvil, una hoja inferior.
 */

import type { MindMapStudio } from './MindMapStudio';
import { icon, layoutIcon } from './icons';
import { MAP_THEMES, FONT_CHOICES, themeForAppEnvironment } from './themes';
import { TEMPLATES } from './templates';
import { stripToPlain } from './richText';
import { IMAGE_PRESETS, type ImagePresetId } from './images';
import { hexOf } from './color';

export type InspectorTab = 'node' | 'map' | 'templates';

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const EMOJIS = [
  '💡', '🎯', '✅', '❌', '⭐', '🔥', '⚡', '🧠', '📚', '📖', '📝', '✏️', '🔬', '🧪', '🧬', '⚛️', '🧮', '📐', '📊', '📈', '📉', '🗓️', '⏰', '⌛',
  '🔑', '🔒', '🔍', '🧩', '🎓', '🏆', '🚀', '🌍', '🌱', '🌳', '☀️', '🌙', '💧', '🏠', '🏢', '💼', '💰', '🛒', '📞', '📧', '📌', '📎', '🚩', '⚠️',
  '❓', '❗', '💬', '🗣️', '👀', '👍', '👎', '🙂', '😄', '😅', '🤔', '😮', '❤️', '💙', '💚', '💛', '🟣', '🟠', '🔴', '🟢', '🔵', '⚫', '🔶', '🔷',
  '➡️', '⬆️', '🔁', '🔗', '🎬', '🎵', '🎨', '🖼️', '📷', '💻', '📱', '🛠️', '⚙️', '🧰', '🍎', '☕', '🍕', '⚽', '🏃', '🧘', '🛌', '🌈', '❄️', '🏁'
];

const LAYOUTS: { id: string; name: string }[] = [
  { id: 'logicalStructure', name: 'Lógico →' },
  { id: 'logicalStructureLeft', name: '← Lógico' },
  { id: 'mindMap', name: 'Mapa central' },
  { id: 'organizationStructure', name: 'Organigrama' },
  { id: 'catalogOrganization', name: 'Catálogo' },
  { id: 'timeline', name: 'Línea de tiempo' },
  { id: 'timeline2', name: 'Cronología' },
  { id: 'verticalTimeline', name: 'Línea vertical' },
  { id: 'fishbone', name: 'Espina de pez' },
  { id: 'rightFishbone', name: 'Espina inversa' }
];

const NEUTRALS = ['#ffffff', '#f1f5f9', '#94a3b8', '#334155', '#0f172a'];
const BG_SWATCHES = ['#ffffff', '#fafafa', '#f5efe0', '#e8f0ff', '#0b0f1a', '#111827', '#1e293b', '#14231b', '#2a1c12', '#000000'];

export class Inspector {
  public tab: InspectorTab = 'map';
  public lastSelectionCount = 0;
  private body: HTMLElement | null = null;
  private emojiOpen = false;
  private scrollTop: Record<string, number> = {};
  private noteTimer = 0;
  private collapsed = new Set<string>(['branch', 'structure', 'lines', 'bg', 'type', 'view']);
  private opened = new Set<string>();

  constructor(private studio: MindMapStudio, private el: HTMLElement) {
    this.bind();
  }

  public setTab(t: InspectorTab): void {
    this.tab = t;
    this.render(true);
  }

  /* ===================================================================== */
  /*  Render                                                                */
  /* ===================================================================== */
  public render(force = false): void {
    const active = document.activeElement as HTMLElement | null;
    if (!force && active && this.el.contains(active) && (active.tagName === 'TEXTAREA' || (active.tagName === 'INPUT' && /text|search|url/.test((active as HTMLInputElement).type)))) return;

    if (this.body) this.scrollTop[this.tab] = this.body.scrollTop;
    const sel = this.studio.getSelection();
    const mobile = this.studio.isMobile();

    const tabs: [InspectorTab, string, string][] = [
      ['node', 'palette', 'Idea'],
      ['map', 'layout', 'Mapa'],
      ['templates', 'template', 'Plantillas']
    ];
    const head = `
      <div class="mmx-insp-head">
        <div class="mmx-grab" aria-hidden="true"></div>
        <div class="mmx-tabs" role="tablist">
          ${tabs.map(([id, ic, label]) => `<button role="tab" class="mmx-tab ${this.tab === id ? 'on' : ''}" data-tab="${id}">${icon(ic, 16)}<span>${label}</span></button>`).join('')}
        </div>
        ${mobile ? `<button class="mmx-ib sm" data-act="close-sheet" aria-label="Cerrar">${icon('close', 18)}</button>` : ''}
      </div>`;

    let content = '';
    if (this.tab === 'node') content = this.nodeTab(sel);
    else if (this.tab === 'map') content = this.mapTab();
    else content = this.templatesTab();

    this.el.innerHTML = `${head}<div class="mmx-insp-body" data-tab-body="${this.tab}">${content}</div>`;
    this.body = this.el.querySelector('.mmx-insp-body');
    this.el.querySelectorAll<HTMLElement>('.mmx-sec[data-sec]').forEach((sec) => {
      const key = sec.dataset.sec as string;
      const closed = this.collapsed.has(key) && !this.opened.has(key);
      sec.classList.toggle('is-collapsed', closed);
    });
    if (this.body) this.body.scrollTop = this.scrollTop[this.tab] || 0;
  }

  public scrollTo(section: string): void {
    window.setTimeout(() => {
      const target = this.el.querySelector(`[data-sec="${section}"]`) as HTMLElement | null;
      if (target?.classList.contains('is-collapsed')) {
        target.classList.remove('is-collapsed');
        this.collapsed.delete(section);
        this.opened.add(section);
      }
      if (target && this.body) this.body.scrollTo({ top: target.offsetTop - 8, behavior: 'smooth' });
    }, 40);
  }

  public focusField(name: string): void {
    window.setTimeout(() => {
      const f = this.el.querySelector(`[data-field="${name}"]`) as HTMLElement | null;
      f?.focus();
      if (f && this.body) f.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 80);
  }

  /* ----------------------------- Pestaña Idea ----------------------------- */
  private swatchRow(key: string, current: string | undefined, label: string): string {
    const th = this.studio.engine.theme;
    const colors = [...th.palette, ...NEUTRALS];
    const cur = (current || '').toLowerCase();
    const sw = colors.map((c) => `<button class="mmx-sw ${cur === c.toLowerCase() ? 'on' : ''}" data-k="${key}" data-c="${c}" style="--c:${c}" aria-label="${c}"></button>`).join('');
    const hex = hexOf(cur);
    return `
      <div class="mmx-field">
        <div class="mmx-field-label">${label}</div>
        <div class="mmx-sw-row">
          <button class="mmx-sw auto ${!cur ? 'on' : ''}" data-k="${key}" data-c="" title="Automático" aria-label="Automático">${icon('reset', 14)}</button>
          ${sw}
          <label class="mmx-sw custom" title="Color personalizado" style="--c:${esc(hex)}"><input type="color" value="${esc(hex)}" data-colorinput="${key}" /></label>
        </div>
      </div>`;
  }

  private chipRow(key: string, items: { v: string | number | null; label: string }[], current: unknown, extra = ''): string {
    return `<div class="mmx-chips ${extra}">${items
      .map((it) => {
        const on = String(it.v ?? '') === String(current ?? '');
        return `<button class="mmx-chip-btn ${on ? 'on' : ''}" data-k="${key}" data-v="${it.v ?? ''}" data-n="${typeof it.v === 'number' ? 1 : 0}">${it.label}</button>`;
      })
      .join('')}</div>`;
  }

  private nodeTab(sel: any[]): string {
    if (!sel.length) {
      return `
        <div class="mmx-empty">
          <div class="mmx-empty-ic">${icon('palette', 28)}</div>
          <h4>Selecciona una idea</h4>
          <p>Toca cualquier idea del mapa para cambiar su color, forma, texto, foto, nota o enlace.</p>
          <button class="mmx-btn primary" data-tab="map">${icon('layout', 16)}<span>Estilo del mapa</span></button>
        </div>`;
    }
    const e = this.studio.engine;
    const node = sel[0];
    const d: Record<string, any> = node.nodeData?.data || {};
    const st = e.computeStyle(node);
    const multi = sel.length > 1;
    const preview = multi ? `${sel.length} ideas seleccionadas` : stripToPlain(String(d.text || '')).slice(0, 70) || 'Idea sin texto';
    const isBold = Number(st.fontWeight) >= 700;
    const align = d.textAlign || 'center';
    const hasImage = Boolean(d.image);
    const hasCheck = typeof d.checked === 'boolean';
    const baseSize = Math.round((Number(d.fontSize) || st.fontSize / (e.settings.fontScale || 1)) * 10) / 10;

    const fontOptions = [`<option value="">Del mapa</option>`, ...FONT_CHOICES.map((f) => `<option value="${esc(f.family)}" ${d.fontFamily === f.family ? 'selected' : ''}>${esc(f.label)}</option>`)].join('');
    const radius = d.borderRadius !== undefined ? Number(d.borderRadius) : null;

    const imgSizes = hasImage
      ? `<div class="mmx-chips">${(Object.keys(IMAGE_PRESETS) as ImagePresetId[])
          .map((k) => `<button class="mmx-chip-btn" data-i="imgsize" data-v="${k}">${IMAGE_PRESETS[k].label}</button>`)
          .join('')}</div>`
      : '';

    return `
      <div class="mmx-selected"><span class="mmx-selected-dot" style="--c:${esc(e.branchColor(node))}"></span><span class="mmx-selected-txt">${esc(preview)}</span></div>

      <section class="mmx-sec" data-sec="text">
        <h5>Texto</h5>
        <div class="mmx-toolrow">
          <button class="mmx-tool ${isBold ? 'on' : ''}" data-i="bold" aria-label="Negrita" title="Negrita"><b>B</b></button>
          <button class="mmx-tool ${d.fontStyle === 'italic' ? 'on' : ''}" data-i="italic" aria-label="Cursiva" title="Cursiva"><i>I</i></button>
          <button class="mmx-tool ${d.textDecoration === 'underline' ? 'on' : ''}" data-i="underline" aria-label="Subrayado" title="Subrayado"><u>U</u></button>
          <span class="mmx-tool-sep"></span>
          <button class="mmx-tool ${align === 'left' ? 'on' : ''}" data-k="textAlign" data-v="left" aria-label="Alinear a la izquierda">${icon('alignL', 16)}</button>
          <button class="mmx-tool ${align === 'center' ? 'on' : ''}" data-k="textAlign" data-v="center" aria-label="Centrar">${icon('alignC', 16)}</button>
          <button class="mmx-tool ${align === 'right' ? 'on' : ''}" data-k="textAlign" data-v="right" aria-label="Alinear a la derecha">${icon('alignR', 16)}</button>
        </div>
        <div class="mmx-row">
          <div class="mmx-stepper" aria-label="Tamaño del texto">
            <button class="mmx-tool" data-i="size-" aria-label="Reducir texto">A−</button>
            <span class="mmx-stepper-val">${baseSize}</span>
            <button class="mmx-tool" data-i="size+" aria-label="Aumentar texto">A+</button>
          </div>
          <select class="mmx-select" data-field="fontFamily" aria-label="Tipografía">${fontOptions}</select>
        </div>
      </section>

      <section class="mmx-sec" data-sec="colors">
        <h5>Forma y color</h5>
        ${this.swatchRow('fillColor', d.fillColor, 'Relleno')}
        ${this.swatchRow('color', d.color, 'Texto')}
        ${this.swatchRow('borderColor', d.borderColor, 'Borde')}
        <div class="mmx-field">
          <div class="mmx-field-label">Grosor del borde</div>
          ${this.chipRow('borderWidth', [{ v: null, label: 'Auto' }, { v: 0, label: 'Sin' }, { v: 1.5, label: 'Fino' }, { v: 3, label: 'Medio' }, { v: 5, label: 'Grueso' }], d.borderWidth ?? null)}
        </div>
        <div class="mmx-field">
          <div class="mmx-field-label">Esquinas</div>
          ${this.chipRow('borderRadius', [{ v: null, label: 'Auto' }, { v: 2, label: 'Recta' }, { v: 10, label: 'Suave' }, { v: 18, label: 'Redonda' }, { v: 999, label: 'Píldora' }], radius)}
        </div>
      </section>

      <section class="mmx-sec" data-sec="branch">
        <h5>Rama</h5>
        ${this.swatchRow('lineColor', d.lineColor, 'Color de la rama')}
        <div class="mmx-field">
          <div class="mmx-field-label">Grosor de la línea</div>
          ${this.chipRow('lineWidth', [{ v: null, label: 'Auto' }, { v: 1.6, label: 'Fina' }, { v: 2.6, label: 'Media' }, { v: 4, label: 'Gruesa' }, { v: 6, label: 'Extra' }], d.lineWidth ?? null)}
        </div>
        <div class="mmx-field">
          <div class="mmx-field-label">Trazo</div>
          ${this.chipRow('lineDasharray', [{ v: null, label: 'Auto' }, { v: 'none', label: 'Continuo' }, { v: '6 5', label: 'Guiones' }, { v: '1 6', label: 'Puntos' }], d.lineDasharray ?? null)}
        </div>
      </section>

      <section class="mmx-sec" data-sec="content">
        <h5>Contenido</h5>
        <div class="mmx-actions-grid">
          <button class="mmx-action ${d.emoji ? 'on' : ''}" data-i="emoji-toggle">${d.emoji ? `<span class="mmx-action-emoji">${esc(d.emoji)}</span>` : icon('emoji', 18)}<span>Emoji</span></button>
          <button class="mmx-action ${hasImage ? 'on' : ''}" data-i="pick-image">${icon('image', 18)}<span>${hasImage ? 'Cambiar foto' : 'Foto'}</span></button>
          <button class="mmx-action ${hasCheck ? 'on' : ''}" data-i="toggle-check">${icon('check', 18)}<span>Tarea</span></button>
          <button class="mmx-action" data-i="flashcards">${icon('card', 18)}<span>Flashcard</span></button>
        </div>
        ${this.emojiOpen ? `<div class="mmx-emoji-wrap">${this.emojiGridHtml()}</div>` : ''}
        ${
          hasImage
            ? `<div class="mmx-field"><div class="mmx-field-label">Tamaño de la foto</div>${imgSizes}
               <div class="mmx-inline-actions"><button class="mmx-link-btn" data-i="pick-camera">${icon('camera', 15)} Tomar otra</button><button class="mmx-link-btn danger" data-i="remove-image">${icon('trash', 15)} Quitar foto</button></div></div>`
            : `<div class="mmx-inline-actions"><button class="mmx-link-btn" data-i="pick-camera">${icon('camera', 15)} Tomar foto</button><button class="mmx-link-btn" data-i="image-url">${icon('link', 15)} Foto desde enlace</button></div>`
        }
        <div class="mmx-field">
          <label class="mmx-field-label" for="mmx-note">Nota</label>
          <textarea id="mmx-note" class="mmx-textarea" data-field="note" rows="3" placeholder="Añade detalles, ejemplos o recordatorios…">${esc(String(d.note || ''))}</textarea>
        </div>
        <div class="mmx-field">
          <label class="mmx-field-label" for="mmx-link">Enlace</label>
          <div class="mmx-input-row"><input id="mmx-link" class="mmx-input" data-field="hyperlink" type="url" inputmode="url" placeholder="https://…" value="${esc(String(d.hyperlink || ''))}" />${d.hyperlink ? `<button class="mmx-ib sm" data-i="open-link" aria-label="Abrir enlace">${icon('link', 16)}</button>` : ''}</div>
        </div>
        <div class="mmx-field">
          <label class="mmx-field-label" for="mmx-tags">Etiquetas (separadas por coma)</label>
          <input id="mmx-tags" class="mmx-input" data-field="tags" type="text" placeholder="examen, repaso, fórmula" value="${esc(Array.isArray(d.tags) ? d.tags.join(', ') : '')}" />
        </div>
      </section>

      <section class="mmx-sec" data-sec="structure">
        <h5>Estructura</h5>
        <div class="mmx-actions-grid cols3">
          <button class="mmx-action" data-i="child">${icon('child', 18)}<span>Hija</span></button>
          <button class="mmx-action" data-i="sibling" ${node.isRoot ? 'disabled' : ''}>${icon('sibling', 18)}<span>Hermana</span></button>
          <button class="mmx-action" data-i="parent" ${node.isRoot ? 'disabled' : ''}>${icon('parent', 18)}<span>Padre</span></button>
          <button class="mmx-action" data-i="summary" ${node.isRoot ? 'disabled' : ''}>${icon('summary', 18)}<span>Resumen</span></button>
          <button class="mmx-action" data-i="frame" ${node.isRoot ? 'disabled' : ''}>${icon('frame', 18)}<span>Marco</span></button>
          <button class="mmx-action" data-i="relation">${icon('relation', 18)}<span>Relación</span></button>
          <button class="mmx-action" data-i="up" ${node.isRoot ? 'disabled' : ''}>${icon('up', 18)}<span>Subir</span></button>
          <button class="mmx-action" data-i="down" ${node.isRoot ? 'disabled' : ''}>${icon('down', 18)}<span>Bajar</span></button>
          <button class="mmx-action" data-i="duplicate" ${node.isRoot ? 'disabled' : ''}>${icon('duplicate', 18)}<span>Duplicar</span></button>
          <button class="mmx-action" data-i="promote" ${node.isRoot || (node.layerIndex ?? 0) <= 1 ? 'disabled' : ''}>${icon('outdent', 18)}<span>Subir nivel</span></button>
          <button class="mmx-action" data-i="demote" ${node.isRoot ? 'disabled' : ''}>${icon('indent', 18)}<span>Bajar nivel</span></button>
          <button class="mmx-action" data-i="fold" ${node.children?.length ? '' : 'disabled'}>${icon(node.getData?.('expand') === false ? 'expand' : 'collapse', 18)}<span>${node.getData?.('expand') === false ? 'Expandir' : 'Contraer'}</span></button>
        </div>
        <div class="mmx-inline-actions between">
          <button class="mmx-link-btn" data-i="reset-style">${icon('reset', 15)} Restablecer estilo</button>
          <button class="mmx-link-btn danger" data-i="delete" ${node.isRoot ? 'disabled' : ''}>${icon('trash', 15)} Eliminar</button>
        </div>
      </section>`;
  }

  /* ----------------------------- Pestaña Mapa ----------------------------- */
  private mapTab(): string {
    const e = this.studio.engine;
    const s = e.settings;
    const autoTheme = themeForAppEnvironment(e.getAppEnvironment());

    const layouts = LAYOUTS.map((l) => `<button class="mmx-card ${s.layout === l.id ? 'on' : ''}" data-layout="${l.id}" aria-label="${l.name}">${layoutIcon(l.id)}<span>${l.name}</span></button>`).join('');

    const themeCard = (id: string, name: string, emoji: string, bg: string, palette: string[], sub = '') => `
      <button class="mmx-theme ${s.themeId === id ? 'on' : ''}" data-themeid="${id}" aria-label="${esc(name)}">
        <span class="mmx-theme-prev" style="background:${esc(bg)}">
          <i style="background:${palette[0]}"></i><i style="background:${palette[1]}"></i><i style="background:${palette[2]}"></i>
        </span>
        <span class="mmx-theme-name">${emoji} ${esc(name)}</span>
        ${sub ? `<span class="mmx-theme-sub">${esc(sub)}</span>` : ''}
      </button>`;

    const groups = ['Clásicos', 'Claros', 'Inmersivos'] as const;
    const themes =
      `<div class="mmx-theme-grid">${themeCard('auto', 'Automático', '✨', autoTheme.canvas.bg, autoTheme.palette, `Sigue tu ambiente · ${autoTheme.name}`)}</div>` +
      groups
        .map(
          (g) => `<div class="mmx-group-label">${g}</div><div class="mmx-theme-grid">${MAP_THEMES.filter((t) => t.group === g)
            .map((t) => themeCard(t.id, t.name, t.emoji, t.canvas.bg, t.palette))
            .join('')}</div>`
        )
        .join('');

    const fontOptions = [`<option value="theme">Del tema</option>`, ...FONT_CHOICES.map((f) => `<option value="${f.id}" ${s.fontId === f.id ? 'selected' : ''}>${esc(f.label)}${f.note ? ' · ' + esc(f.note) : ''}</option>`)].join('');

    const bgSw = BG_SWATCHES.map((c) => `<button class="mmx-sw ${s.bgColor.toLowerCase() === c ? 'on' : ''}" data-bg="${c}" style="--c:${c}" aria-label="${c}"></button>`).join('');

    return `
      <section class="mmx-sec" data-sec="layouts">
        <h5>Diseño</h5>
        <div class="mmx-card-grid">${layouts}</div>
      </section>

      <section class="mmx-sec" data-sec="themes">
        <h5>Tema y ambiente</h5>
        ${themes}
      </section>

      <section class="mmx-sec" data-sec="lines">
        <h5>Líneas y ramas</h5>
        <div class="mmx-field">
          <div class="mmx-field-label">Estilo de línea</div>
          <div class="mmx-chips" data-setting-row="lineStyle">
            ${[['theme', 'Del tema'], ['organic', 'Orgánica'], ['curve', 'Curva'], ['straight', 'Recta'], ['elbow', 'Ortogonal']].map(([v, l]) => `<button class="mmx-chip-btn ${s.lineStyle === v ? 'on' : ''}" data-setting="lineStyle" data-val="${v}">${l}</button>`).join('')}
          </div>
        </div>
        <div class="mmx-field">
          <div class="mmx-field-label">Espaciado</div>
          <div class="mmx-chips">
            ${[['compact', 'Compacto'], ['normal', 'Normal'], ['airy', 'Amplio']].map(([v, l]) => `<button class="mmx-chip-btn ${s.spacing === v ? 'on' : ''}" data-setting="spacing" data-val="${v}">${l}</button>`).join('')}
          </div>
        </div>
        <label class="mmx-switch"><span>Ramas de colores</span><input type="checkbox" data-setting-check="colorful" ${s.colorful ? 'checked' : ''} /><i></i></label>
      </section>

      <section class="mmx-sec" data-sec="bg">
        <h5>Lienzo</h5>
        <div class="mmx-field">
          <div class="mmx-field-label">Patrón de fondo</div>
          <div class="mmx-chips">
            ${[['theme', 'Del tema'], ['none', 'Ninguno'], ['dots', 'Puntos'], ['grid', 'Cuadrícula'], ['lines', 'Renglones'], ['blueprint', 'Plano']].map(([v, l]) => `<button class="mmx-chip-btn ${s.pattern === v ? 'on' : ''}" data-setting="pattern" data-val="${v}">${l}</button>`).join('')}
          </div>
        </div>
        <div class="mmx-field">
          <div class="mmx-field-label">Color de fondo</div>
          <div class="mmx-sw-row">
            <button class="mmx-sw auto ${!s.bgColor ? 'on' : ''}" data-bg="" title="Del tema" aria-label="Del tema">${icon('reset', 14)}</button>
            ${bgSw}
            <label class="mmx-sw custom" title="Color personalizado" style="--c:${esc(s.bgColor || '#888888')}"><input type="color" value="${esc(hexOf(s.bgColor))}" data-bginput="1" /></label>
          </div>
        </div>
      </section>

      <section class="mmx-sec" data-sec="type">
        <h5>Tipografía</h5>
        <select class="mmx-select full" data-setting-select="fontId" aria-label="Tipografía del mapa">${fontOptions}</select>
        <div class="mmx-field">
          <div class="mmx-field-label">Tamaño del texto <b>${Math.round(s.fontScale * 100)}%</b></div>
          <input class="mmx-range" type="range" min="0.8" max="1.6" step="0.05" value="${s.fontScale}" data-setting-range="fontScale" aria-label="Tamaño del texto" />
        </div>
      </section>

      <section class="mmx-sec" data-sec="view">
        <h5>Vista</h5>
        ${this.studio.isMobile() ? '' : `<label class="mmx-switch"><span>Minimapa</span><input type="checkbox" data-setting-check="showMinimap" ${s.showMinimap ? 'checked' : ''} /><i></i></label>`}
        <div class="mmx-actions-grid cols3">
          <button class="mmx-action" data-i="fit">${icon('fit', 18)}<span>Ajustar</span></button>
          <button class="mmx-action" data-i="expand-all">${icon('expand', 18)}<span>Expandir</span></button>
          <button class="mmx-action" data-i="collapse-1">${icon('collapse', 18)}<span>Contraer</span></button>
        </div>
      </section>`;
  }

  /* --------------------------- Pestaña Plantillas -------------------------- */
  private templatesTab(): string {
    return `
      <section class="mmx-sec">
        <h5>Empezar con una plantilla</h5>
        <p class="mmx-hint">Reemplaza el contenido actual. Puedes deshacerlo.</p>
        <div class="mmx-tpl-list">
          ${TEMPLATES.map((t) => `<button class="mmx-tpl-row" data-tpl="${t.id}"><span class="mmx-tpl-emoji">${t.emoji}</span><span class="mmx-tpl-text"><b>${esc(t.name)}</b><small>${esc(t.description)}</small></span>${icon('caretR', 16)}</button>`).join('')}
        </div>
      </section>
      <section class="mmx-sec">
        <h5>Más formas de crear</h5>
        <div class="mmx-actions-grid cols2">
          <button class="mmx-action" data-i="paste-outline">${icon('outline', 18)}<span>Pegar un esquema</span></button>
          <button class="mmx-action" data-i="import">${icon('import', 18)}<span>Importar archivo</span></button>
        </div>
      </section>`;
  }

  public emojiGridHtml(): string {
    return `<div class="mmx-emoji-grid" role="listbox" aria-label="Emojis">${EMOJIS.map((em) => `<button class="mmx-emoji" data-emoji="${em}" aria-label="${em}">${em}</button>`).join('')}<button class="mmx-emoji none" data-emoji="" aria-label="Quitar emoji">${icon('close', 16)}</button></div>`;
  }

  /* ===================================================================== */
  /*  Eventos                                                               */
  /* ===================================================================== */
  private bind(): void {
    this.el.addEventListener('click', (ev) => this.onClick(ev));
    this.el.addEventListener('input', (ev) => this.onInput(ev));
    this.el.addEventListener('change', (ev) => this.onChange(ev));
  }

  private parseVal(b: HTMLElement): any {
    const raw = b.dataset.v ?? '';
    if (raw === '') return null;
    return b.dataset.n === '1' ? Number(raw) : raw;
  }

  private onClick(ev: MouseEvent): void {
    const t = ev.target as HTMLElement;
    const s = this.studio;
    const e = s.engine;

    const head = t.closest('.mmx-sec > h5') as HTMLElement | null;
    if (head) {
      const sec = head.parentElement as HTMLElement;
      const key = sec.dataset.sec as string;
      const nowClosed = !sec.classList.contains('is-collapsed');
      sec.classList.toggle('is-collapsed', nowClosed);
      if (nowClosed) {
        this.opened.delete(key);
        this.collapsed.add(key);
      } else {
        this.collapsed.delete(key);
        this.opened.add(key);
      }
      return;
    }

    const tab = t.closest('[data-tab]') as HTMLElement | null;
    if (tab) return this.setTab(tab.dataset.tab as InspectorTab);

    const emoji = t.closest('[data-emoji]') as HTMLElement | null;
    if (emoji) {
      s.setEmoji(emoji.dataset.emoji || '');
      this.emojiOpen = false;
      this.render(true);
      return;
    }

    const sw = t.closest('.mmx-sw[data-k]') as HTMLElement | null;
    if (sw) {
      const k = sw.dataset.k as string;
      const c = sw.dataset.c || '';
      s.applyStyle({ [k]: c || null }, k === 'lineColor');
      this.render(true);
      return;
    }

    const bgSw = t.closest('[data-bg]') as HTMLElement | null;
    if (bgSw) {
      e.setCanvasColor(bgSw.dataset.bg || '');
      this.render(true);
      return;
    }

    const kv = t.closest('[data-k][data-v]') as HTMLElement | null;
    if (kv && !kv.classList.contains('mmx-sw')) {
      const k = kv.dataset.k as string;
      const relayout = ['borderRadius', 'borderWidth', 'lineWidth', 'textAlign'].includes(k);
      s.applyStyle({ [k]: this.parseVal(kv) }, relayout);
      this.render(true);
      return;
    }

    const layout = t.closest('[data-layout]') as HTMLElement | null;
    if (layout) {
      e.updateSettings({ layout: layout.dataset.layout });
      this.render(true);
      return;
    }

    const theme = t.closest('[data-themeid]') as HTMLElement | null;
    if (theme) {
      e.updateSettings({ themeId: theme.dataset.themeid });
      this.render(true);
      return;
    }

    const setting = t.closest('[data-setting]') as HTMLElement | null;
    if (setting) {
      e.updateSettings({ [setting.dataset.setting as string]: setting.dataset.val } as any);
      this.render(true);
      return;
    }

    const tpl = t.closest('[data-tpl]') as HTMLElement | null;
    if (tpl) {
      s.applyTemplate(tpl.dataset.tpl || 'blank');
      return;
    }

    const act = t.closest('[data-i]') as HTMLElement | null;
    if (act && !act.hasAttribute('disabled')) this.runInternal(act);
  }

  private runInternal(b: HTMLElement): void {
    const s = this.studio;
    const e = s.engine;
    const sel = s.getSelection();
    const node = sel[0];
    const d: Record<string, any> = node?.nodeData?.data || {};
    switch (b.dataset.i) {
      case 'bold': {
        const bold = Number(e.computeStyle(node).fontWeight) >= 700;
        s.applyStyle({ fontWeight: bold ? 500 : 800 }, true);
        break;
      }
      case 'italic':
        s.applyStyle({ fontStyle: d.fontStyle === 'italic' ? null : 'italic' }, true);
        break;
      case 'underline':
        s.applyStyle({ textDecoration: d.textDecoration === 'underline' ? null : 'underline' }, true);
        break;
      case 'size+':
      case 'size-': {
        const base = Number(d.fontSize) || e.computeStyle(node).fontSize / (e.settings.fontScale || 1);
        const next = Math.max(9, Math.min(60, Math.round(base + (b.dataset.i === 'size+' ? 1 : -1))));
        s.applyStyle({ fontSize: next }, true);
        break;
      }
      case 'emoji-toggle':
        this.emojiOpen = !this.emojiOpen;
        break;
      case 'pick-image':
        s.pickImage();
        return;
      case 'pick-camera':
        s.pickCamera();
        return;
      case 'image-url':
        s.promptImageUrl();
        return;
      case 'remove-image':
        s.removeImage();
        return;
      case 'imgsize':
        s.setImageSize(b.dataset.v as ImagePresetId);
        return;
      case 'toggle-check':
        s.applyStyle({ checked: typeof d.checked === 'boolean' ? null : false }, true);
        break;
      case 'flashcards':
        s.openFlashcards();
        return;
      case 'open-link':
        s.openLink(String(d.hyperlink || ''));
        return;
      case 'child':
        e.addChild(node);
        return;
      case 'sibling':
        e.addSibling(node);
        return;
      case 'parent':
        e.addParent(node);
        return;
      case 'summary':
        e.addSummary(sel);
        return;
      case 'frame':
        e.addFrame();
        return;
      case 'relation':
        s.startRelation();
        return;
      case 'up':
        e.moveUp(node);
        return;
      case 'down':
        e.moveDown(node);
        return;
      case 'duplicate':
        e.duplicateNode(node);
        return;
      case 'promote':
        e.promote(node);
        return;
      case 'demote':
        e.demote(node);
        return;
      case 'fold':
        e.toggleExpand(node);
        break;
      case 'reset-style':
        e.resetStyles(sel);
        break;
      case 'delete':
        s.askDelete();
        return;
      case 'fit':
        e.fit(true);
        return;
      case 'expand-all':
        e.expandAll();
        return;
      case 'collapse-1':
        e.collapseToLevel(1);
        return;
      case 'paste-outline':
        s.openPasteOutline();
        return;
      case 'import':
        (s.getRootEl().querySelector('input[data-file="import"]') as HTMLInputElement | null)?.click();
        return;
    }
    this.render(true);
  }

  private onInput(ev: Event): void {
    const t = ev.target as HTMLInputElement;
    const s = this.studio;

    if (t.dataset.field === 'note') {
      window.clearTimeout(this.noteTimer);
      this.noteTimer = window.setTimeout(() => s.applyStyle({ note: t.value.trim() ? t.value : null }, true, false), 300);
      return;
    }
    if (t.dataset.colorinput) {
      s.applyStyle({ [t.dataset.colorinput]: t.value }, t.dataset.colorinput === 'lineColor', false);
      return;
    }
    if (t.dataset.bginput) {
      s.engine.setCanvasColor(t.value);
      return;
    }
    if (t.dataset.settingRange) {
      const v = Number(t.value);
      const label = t.closest('.mmx-field')?.querySelector('.mmx-field-label b');
      if (label) label.textContent = `${Math.round(v * 100)}%`;
      window.clearTimeout(this.rangeTimer);
      this.rangeTimer = window.setTimeout(() => s.engine.updateSettings({ [t.dataset.settingRange as string]: v } as any), 120);
    }
  }

  private rangeTimer = 0;

  private onChange(ev: Event): void {
    const t = ev.target as HTMLInputElement;
    const s = this.studio;
    const e = s.engine;

    if (t.dataset.field === 'note') {
      window.clearTimeout(this.noteTimer);
      s.applyStyle({ note: t.value.trim() ? t.value : null }, true);
    } else if (t.dataset.field === 'hyperlink') {
      s.applyStyle({ hyperlink: t.value.trim() || null }, true);
      this.render(true);
    } else if (t.dataset.field === 'tags') {
      const tags = t.value
        .split(',')
        .map((x) => x.trim().replace(/^#/, ''))
        .filter(Boolean)
        .slice(0, 8);
      s.applyStyle({ tags: tags.length ? tags : null }, true);
    } else if (t.dataset.field === 'fontFamily') {
      s.applyStyle({ fontFamily: t.value || null }, true);
    } else if (t.dataset.colorinput) {
      s.applyStyle({ [t.dataset.colorinput]: t.value }, t.dataset.colorinput === 'lineColor');
      this.render(true);
    } else if (t.dataset.bginput) {
      e.setCanvasColor(t.value);
      this.render(true);
    } else if (t.dataset.settingSelect) {
      e.updateSettings({ [t.dataset.settingSelect]: t.value } as any);
    } else if (t.dataset.settingCheck) {
      const key = t.dataset.settingCheck;
      e.updateSettings({ [key]: t.checked } as any);
      if (key === 'showMinimap') s.setMinimapVisible(t.checked && !s.isMobile());
    } else if (t.dataset.settingRange) {
      window.clearTimeout(this.rangeTimer);
      e.updateSettings({ [t.dataset.settingRange]: Number(t.value) } as any);
    }
  }
}
