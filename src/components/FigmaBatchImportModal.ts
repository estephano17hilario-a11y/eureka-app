import { deckService } from '../services/deck.service';
import { katexService } from '../services/katex.service';
import {
  DEFAULT_SETTINGS,
  SIDE_TOKENS,
  parseImport,
  type CardSepMode,
  type ExtraMode,
  type HeaderMode,
  type ImportParseResult,
  type ImportSettings,
  type SideSepKey
} from '../services/import-parser';
import { EXPORT_GUIDES, IMPORT_EXAMPLES, showInvisibles } from '../services/import-examples';
import type { ExtractedFile } from '../services/file-import';

export interface FigmaBatchImportOptions {
  deckId: string;
  onImported: (count: number) => void;
  onClose: () => void;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const norm = (t: string) => t.toLowerCase().replace(/\s+/g, ' ').trim();
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const PREVIEW_STEP = 8;
const FORMATS = ['TXT', 'CSV', 'TSV', 'XLSX', 'ODS', 'DOCX', 'ODT', 'PPTX', 'PDF', 'HTML', 'JSON', 'MD', 'RTF', 'APKG'];

const SIDE_CHIPS: Array<{ key: SideSepKey; label: string; tip: string }> = [
  { key: 'auto', label: '✨ Auto', tip: 'Eureka lo detecta solo' },
  { key: 'tab', label: 'Tab ⇥', tip: 'Tabulación: Excel, Sheets, Anki, Quizlet' },
  { key: 'comma', label: 'Coma ,', tip: 'casa, house' },
  { key: 'semi', label: 'Punto y coma ;', tip: 'casa ; house' },
  { key: 'pipe', label: 'Barra |', tip: 'casa | house' },
  { key: 'colon', label: 'Dos puntos :', tip: 'casa: house' },
  { key: 'dash', label: 'Guion -', tip: 'casa - house' },
  { key: 'equals', label: 'Igual =', tip: 'casa = house' },
  { key: 'arrow', label: 'Flecha →', tip: 'casa → house' },
  { key: 'period', label: 'Punto .', tip: 'casa. house' },
  { key: 'space', label: 'Espacio', tip: 'casa house (corta en el primer espacio)' },
  { key: 'newline', label: 'Salto de línea ↵', tip: 'La pregunta arriba y la respuesta debajo' },
  { key: 'custom', label: '✏️ Otro…', tip: 'Escribe tu propio separador' }
];
const CARD_CHIPS: Array<{ key: CardSepMode; label: string; tip: string }> = [
  { key: 'auto', label: '✨ Auto', tip: 'Eureka lo detecta solo' },
  { key: 'line', label: 'Cada línea', tip: 'Una tarjeta por línea' },
  { key: 'blank', label: 'Línea en blanco', tip: 'Las tarjetas se separan con una línea vacía' },
  { key: 'pairs', label: 'Cada 2 líneas', tip: 'Pregunta, respuesta, pregunta, respuesta…' },
  { key: 'dashes', label: 'Raya ---', tip: 'Una línea con --- entre tarjetas' },
  { key: 'custom', label: '✏️ Otro…', tip: 'Escribe tu propio separador' }
];
const CARD_SHORT: Record<string, string> = { line: 'una por línea', blank: 'línea en blanco', pairs: 'cada 2 líneas', dashes: '---', custom: 'personalizado' };

const shortSide = (k: SideSepKey, custom: string) => (k === 'auto' ? '' : k === 'custom' ? `«${custom}»` : k === 'newline' ? '↵' : k === 'tab' ? 'Tab' : SIDE_TOKENS[k].short);

export function openFigmaBatchImportModal(options: FigmaBatchImportOptions): void {
  document.getElementById('modal-batch-import-root')?.remove();

  const allDecks = deckService.getAllDecks();
  const settings: ImportSettings = { ...DEFAULT_SETTINGS };
  let parsed: ImportParseResult = parseImport('', settings);
  const excluded = new Set<string>();
  let shown = PREVIEW_STEP;
  let skipDuplicates = true;
  let makeInverted = false;
  let tagValue = '';
  let moreOpen = false;
  let examplesOpen = false;
  let guidesOpen = false;
  let ignoredOpen = false;
  let existingFronts = new Set<string>();
  let timer = 0;
  let busy = '';
  let files: ExtractedFile[] = [];
  let activeSheet = 0;
  let fileErrors: Array<{ name: string; message: string; hint: string }> = [];
  let loadedFromFiles = '';

  const html = `
    <div class="modal-backdrop figma-modal-backdrop" id="modal-batch-import-root">
      <div class="apple-glass-modal imp-panel" role="dialog" aria-label="Importar tarjetas">

        <header class="imp-head">
          <div class="imp-head-ic">⬇️</div>
          <div class="imp-head-tx">
            <h3>Importar tarjetas</h3>
            <p id="imp-sub">Pega texto o sube un archivo</p>
          </div>
          <button type="button" class="imp-x" data-act="close" aria-label="Cerrar">×</button>
        </header>

        <div class="imp-body" id="imp-body">

          <label class="imp-dest">
            <span>Añadir al mazo</span>
            <select id="imp-deck" class="imp-select">
              ${allDecks.map((d) => `<option value="${d.id}" ${d.id === options.deckId ? 'selected' : ''}>${d.parentId ? '↳ ' : '📁 '}${esc(d.name)}</option>`).join('')}
            </select>
          </label>

          <section class="imp-sec">
            <div class="imp-sec-h"><span class="imp-num">1</span><b>Tu contenido</b><span class="imp-count" id="imp-count"></span></div>
            <div class="imp-tools">
              <button type="button" class="imp-btn primary" data-act="file">📄 Subir archivos</button>
              <button type="button" class="imp-btn" data-act="paste">📋 Pegar</button>
              <button type="button" class="imp-btn" data-act="examples" id="imp-b-examples">💡 Ejemplos</button>
              <button type="button" class="imp-btn ghost" data-act="clear" id="imp-b-clear">🗑 Limpiar</button>
              <input type="file" id="imp-file-input" multiple hidden />
            </div>
            <div id="imp-examples"></div>
            <div class="imp-drop" id="imp-drop">
              <textarea id="imp-text" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Contenido a importar"></textarea>
              <div class="imp-empty" aria-hidden="true">
                <b>Pega o escribe aquí tus tarjetas</b>
                <span>o arrastra uno o varios archivos</span>
                <div class="imp-fmts">${FORMATS.map((f) => `<i>${f}</i>`).join('')}</div>
              </div>
              <div class="imp-drop-over" aria-hidden="true">📄 Suelta los archivos para leerlos</div>
            </div>
            <div id="imp-files"></div>
          </section>

          <section class="imp-sec">
            <div class="imp-sec-h"><span class="imp-num">2</span><b>Cómo está organizado</b><button type="button" class="imp-link" data-act="reset" id="imp-reset">Restablecer</button></div>
            <div id="imp-detect"></div>
            <div id="imp-seps"></div>
          </section>

          <section class="imp-sec" id="imp-preview-sec">
            <div class="imp-sec-h"><span class="imp-num">3</span><b>Revisa y listo</b><span class="imp-hint" id="imp-preview-hint"></span></div>
            <div id="imp-preview"></div>
            <div class="imp-opts" id="imp-opts"></div>
          </section>

        </div>

        <footer class="imp-foot">
          <button type="button" class="imp-btn" data-act="close">Cancelar</button>
          <button type="button" class="imp-go" id="imp-go" data-act="go" disabled>Importar 0 tarjetas</button>
        </footer>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);

  const root = document.getElementById('modal-batch-import-root')!;
  const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
  const text = $<HTMLTextAreaElement>('imp-text');
  const deckSel = $<HTMLSelectElement>('imp-deck');
  const goBtn = $<HTMLButtonElement>('imp-go');
  const fileInput = $<HTMLInputElement>('imp-file-input');
  const drop = $('imp-drop');

  const refreshExisting = () => {
    existingFronts = new Set(deckService.getCardsByDeck(deckSel.value, false).map((c) => norm(c.front)));
  };

  const rowKey = (f: string, b: string) => `${f}\u0001${b}`;
  const decorate = () => {
    const seen = new Set<string>();
    return parsed.rows.map((r, i) => {
      const n = norm(r.front);
      const dup = existingFronts.has(n) ? 'mazo' : seen.has(n) ? 'lista' : '';
      seen.add(n);
      return { ...r, i, dup, off: excluded.has(rowKey(r.front, r.back)) };
    });
  };
  const toImport = () => decorate().filter((r) => !r.off && !(skipDuplicates && r.dup));

  const isDirty = () =>
    (Object.keys(DEFAULT_SETTINGS) as Array<keyof ImportSettings>).some((k) => settings[k] !== DEFAULT_SETTINGS[k] && !(k === 'sideCustom' || k === 'cardCustom'));

  /* ---------------- pintado ---------------- */
  const renderFiles = () => {
    const box = $('imp-files');
    const parts: string[] = [];
    if (busy) parts.push(`<div class="imp-busy"><span class="imp-spin"></span>${esc(busy)}</div>`);
    files.forEach((f, i) => {
      const sheets = files.length === 1 && f.sheets.length > 1 ? f.sheets : [];
      parts.push(`
        <div class="imp-file">
          <span class="imp-file-ic">📄</span>
          <div class="imp-file-tx"><b>${esc(f.name)}</b><span>${esc([f.kind, f.note].filter(Boolean).join(' · '))}</span></div>
          <button type="button" class="imp-rm" data-act="rm-file" data-i="${i}" aria-label="Quitar archivo" title="Quitar este archivo">✕</button>
        </div>
        ${sheets.length ? `<div class="imp-sheets"><span>Hoja:</span>${sheets.map((s, si) => `<button type="button" class="imp-chip small ${si === activeSheet ? 'on' : ''}" data-act="sheet" data-i="${si}">${esc(s.name)} <small>${s.rows}</small></button>`).join('')}</div>` : ''}
        ${f.warnings.map((w) => `<div class="imp-note-warn">⚠️ ${esc(w)}</div>`).join('')}`);
    });
    fileErrors.forEach((e, i) =>
      parts.push(`
        <div class="imp-detect bad compact">
          <div class="imp-detect-ic">🤔</div>
          <div class="imp-detect-tx"><b>${esc(e.name)}: ${esc(e.message)}</b>${e.hint ? `<span>${esc(e.hint)}</span>` : ''}</div>
          <button type="button" class="imp-rm" data-act="rm-err" data-i="${i}" aria-label="Cerrar aviso">✕</button>
        </div>`)
    );
    box.innerHTML = parts.join('');
  };

  const renderExamples = () => {
    const box = $('imp-examples');
    $('imp-b-examples').classList.toggle('on', examplesOpen);
    if (!examplesOpen) {
      box.innerHTML = '';
      return;
    }
    box.innerHTML = `
      <div class="imp-ex">
        <div class="imp-ex-head"><b>Casos de uso</b><span>Toca uno y se carga con sus separadores. Luego cámbialo por tus datos.</span></div>
        <div class="imp-ex-grid">
          ${IMPORT_EXAMPLES.map(
            (ex) => `
            <button type="button" class="imp-ex-card" data-act="use-ex" data-id="${ex.id}">
              <span class="imp-ex-t"><i>${ex.icon}</i><b>${esc(ex.title)}</b></span>
              <span class="imp-ex-w">${esc(ex.when)}</span>
              <code>${esc(showInvisibles(ex.text.split('\n').slice(0, 3).join('\n')))}</code>
              <span class="imp-ex-use">Usar este ejemplo →</span>
            </button>`
          ).join('')}
        </div>
        <button type="button" class="imp-link left" data-act="guides">${guidesOpen ? '▾' : '▸'} ¿De dónde saco mi archivo?</button>
        ${guidesOpen ? `<ul class="imp-guides">${EXPORT_GUIDES.map((g) => `<li><b>${esc(g.app)}</b><span>${esc(g.steps)}</span></li>`).join('')}</ul>` : ''}
      </div>`;
  };

  const chipsHtml = <K extends string>(act: string, items: Array<{ key: K; label: string; tip: string }>, cur: K, autoHint: string) =>
    items
      .map((i) => {
        const label = i.key === 'auto' && autoHint ? `${i.label} · ${esc(autoHint)}` : esc(i.label);
        return `<button type="button" class="imp-chip ${i.key === cur ? 'on' : ''}" data-act="${act}" data-key="${i.key}" title="${esc(i.tip)}" aria-pressed="${i.key === cur}">${label}</button>`;
      })
      .join('');

  const segHtml = <K extends string>(act: string, items: Array<[K, string]>, cur: K) =>
    `<div class="imp-seg">${items.map(([k, l]) => `<button type="button" class="${k === cur ? 'on' : ''}" data-act="${act}" data-key="${k}" aria-pressed="${k === cur}">${l}</button>`).join('')}</div>`;

  const renderSeps = () => {
    const d = parsed.detected;
    const hasRows = parsed.rows.length > 0;
    const sideHint = settings.sideSep === 'auto' && hasRows ? shortSide(d.sideSep, settings.sideCustom) : '';
    const cardHint = settings.cardSep === 'auto' && hasRows ? CARD_SHORT[d.cardSep] || '' : '';
    const colsOn = settings.extra === 'cols';
    const dirtyCount = [settings.cut !== 'first', settings.extra !== 'auto', settings.headerMode !== 'auto', settings.swap, !settings.stripList].filter(Boolean).length;
    $('imp-reset').style.display = isDirty() || settings.sideCustom || settings.cardCustom ? '' : 'none';
    $('imp-seps').innerHTML = `
      <div class="imp-grp">
        <div class="imp-grp-l">Entre la <b>pregunta</b> y la <b>respuesta</b> hay…</div>
        <div class="imp-chips">${chipsHtml('side', SIDE_CHIPS, settings.sideSep, sideHint)}</div>
        ${settings.sideSep === 'custom' ? `<input class="imp-input" id="imp-side-custom" placeholder="Escribe tu separador (ej.  //  o  =>  ). Usa \\t para Tab" value="${esc(settings.sideCustom)}" autocomplete="off" spellcheck="false" />` : ''}
      </div>
      <div class="imp-grp">
        <div class="imp-grp-l">Entre una <b>tarjeta</b> y la siguiente hay…</div>
        <div class="imp-chips">${chipsHtml('card', CARD_CHIPS, settings.cardSep, cardHint)}</div>
        ${settings.cardSep === 'custom' ? `<input class="imp-input" id="imp-card-custom" placeholder="Escribe tu separador (ej.  ##  o  ;;;  )" value="${esc(settings.cardCustom)}" autocomplete="off" spellcheck="false" />` : ''}
      </div>
      <button type="button" class="imp-more-t" data-act="more" aria-expanded="${moreOpen}">
        <span>${moreOpen ? '▾' : '▸'} Más opciones</span>${dirtyCount ? `<em>${dirtyCount} cambiada${dirtyCount === 1 ? '' : 's'}</em>` : ''}
      </button>
      ${
        moreOpen
          ? `
      <div class="imp-adv">
        <div class="imp-opt-row"><span>Si el separador se repite en la línea</span>${segHtml<'first' | 'last'>('cut', [['first', 'Cortar en el primero'], ['last', 'Cortar en el último']], settings.cut)}</div>
        <div class="imp-opt-row"><span>Si una fila tiene más de 2 partes</span>${segHtml<ExtraMode>('extra', [['auto', 'Auto'], ['join', 'Unir al final'], ['cols', 'Elegir columnas']], settings.extra)}
          ${
            colsOn
              ? `<div class="imp-cols"><label>Pregunta = columna <input type="number" min="1" max="30" id="imp-col-f" value="${settings.colFront}" /></label><label>Respuesta = columna <input type="number" min="1" max="30" id="imp-col-b" value="${settings.colBack}" /></label></div>`
              : ''
          }
        </div>
        <div class="imp-opt-row"><span>Primera fila (títulos)</span>${segHtml<HeaderMode>('header', [['auto', 'Detectar'], ['skip', 'Omitir'], ['keep', 'Conservar']], settings.headerMode)}</div>
        <label class="imp-toggle"><input type="checkbox" id="imp-opt-swap" ${settings.swap ? 'checked' : ''} /><span class="imp-sw"></span><span><b>Intercambiar caras</b><small>La respuesta pasa a ser la pregunta y al revés</small></span></label>
        <label class="imp-toggle"><input type="checkbox" id="imp-opt-strip" ${settings.stripList ? 'checked' : ''} /><span class="imp-sw"></span><span><b>Quitar viñetas y numeración</b><small>«- », «1. », «• » al inicio de cada línea</small></span></label>
      </div>`
          : ''
      }`;
  };

  /** ¿Con qué otro separador saldrían más tarjetas? */
  const suggestSeps = (): Array<{ key: SideSepKey; n: number }> => {
    if (text.value.length > 150000) return [];
    const keys: SideSepKey[] = ['tab', 'semi', 'comma', 'pipe', 'colon', 'dash', 'equals', 'arrow', 'period', 'space'];
    const out: Array<{ key: SideSepKey; n: number }> = [];
    for (const key of keys) {
      if (key === settings.sideSep) continue;
      const n = parseImport(text.value, { ...settings, sideSep: key }).rows.length;
      if (n > parsed.rows.length) out.push({ key, n });
    }
    return out.sort((a, b) => b.n - a.n).slice(0, 4);
  };

  const renderDetect = () => {
    const box = $('imp-detect');
    const raw = text.value.trim();
    const n = parsed.rows.length;
    const d = parsed.detected;
    const lines: string[] = [];
    let tone = 'idle';
    let title = '';
    let sug: Array<{ key: SideSepKey; n: number }> = [];

    if (!raw) {
      title = 'Esperando tu contenido';
      lines.push('Cuando pegues o subas algo, aquí verás qué entendimos y podrás ajustarlo.');
    } else if (n === 0) {
      tone = 'bad';
      title = 'Todavía no encontramos tarjetas';
      lines.push('Falta decir qué separa la pregunta de la respuesta. Elígelo en las opciones de abajo.');
      sug = suggestSeps();
    } else {
      tone = parsed.ignored.length ? 'warn' : 'good';
      title = `${plural(n, 'tarjeta detectada', 'tarjetas detectadas')}`;
      lines.push(`<b>Formato:</b> ${esc(d.cardSepLabel ? `${d.cardSepLabel} · ` : '')}${esc(d.sideSepLabel)}`);
      if (parsed.headerSkipped) lines.push('Omitimos la primera fila porque eran títulos (puedes conservarla en «Más opciones»).');
      if (parsed.listStripped) lines.push('Quitamos viñetas y numeración del inicio de las líneas.');
      if (parsed.extraColumnRows) lines.push(`${plural(parsed.extraColumnRows, 'fila tiene', 'filas tienen')} más de 2 columnas: solo se usan las elegidas (cambia en «Más opciones»).`);
      if (parsed.ignored.length) {
        lines.push(
          `⚠️ ${plural(parsed.ignored.length, 'línea se ignora', 'líneas se ignoran')} porque no se pudo separar. <button type="button" class="imp-inline" data-act="ignored">${ignoredOpen ? 'Ocultar' : 'Verlas'}</button>`
        );
        sug = suggestSeps();
      }
    }

    const ignoredList =
      ignoredOpen && parsed.ignored.length
        ? `<ul class="imp-ignored">${parsed.ignored
            .slice(0, 30)
            .map((i) => `<li><button type="button" data-act="jump" data-line="${i.line}">línea ${i.line}</button><span>${esc(i.text.length > 90 ? `${i.text.slice(0, 90)}…` : i.text)}</span></li>`)
            .join('')}${parsed.ignored.length > 30 ? `<li><span>… y ${parsed.ignored.length - 30} más</span></li>` : ''}</ul>`
        : '';

    const sugHtml = sug.length
      ? `<div class="imp-sug"><span>¿Quisiste decir…?</span>${sug
          .map((s) => `<button type="button" class="imp-chip small" data-act="side" data-key="${s.key}">Separar con ${esc(shortSide(s.key, '') || s.key)} → ${plural(s.n, 'tarjeta', 'tarjetas')}</button>`)
          .join('')}</div>`
      : '';

    box.innerHTML = `
      <div class="imp-detect ${tone}">
        <div class="imp-detect-ic">${tone === 'good' ? '✅' : tone === 'warn' ? '⚠️' : tone === 'bad' ? '🤔' : '✨'}</div>
        <div class="imp-detect-tx"><b>${title}</b>${lines.map((l) => `<span>${l}</span>`).join('')}${ignoredList}${sugHtml}</div>
      </div>`;
  };

  const renderPreview = () => {
    const sec = $('imp-preview-sec');
    const rows = decorate();
    sec.classList.toggle('hidden', rows.length === 0);
    if (rows.length === 0) return;
    const dups = rows.filter((r) => r.dup).length;
    $('imp-preview-hint').textContent = [plural(rows.length, 'tarjeta', 'tarjetas'), dups ? plural(dups, 'repetida', 'repetidas') : ''].filter(Boolean).join(' · ');

    const visible = rows.slice(0, shown);
    $('imp-preview').innerHTML = `
      <div class="imp-cards">
        ${visible
          .map((r) => {
            const skip = r.off || (skipDuplicates && !!r.dup);
            return `
          <div class="imp-card ${skip ? 'skip' : ''}" data-k="${esc(rowKey(r.front, r.back))}">
            <button type="button" class="imp-card-n" data-act="jump" data-line="${r.line}" title="Ver en el texto (línea ${r.line})">${r.i + 1}</button>
            <div class="imp-card-sides">
              <div class="imp-side"><i>Pregunta</i><div>${katexService.parseAndRender(r.front)}</div></div>
              <div class="imp-side"><i>Respuesta</i><div>${katexService.parseAndRender(r.back)}</div></div>
            </div>
            <div class="imp-card-act">
              ${r.dup ? `<span class="imp-badge" title="Ya existe una tarjeta con esta pregunta ${r.dup === 'mazo' ? 'en el mazo' : 'más arriba en tu lista'}">Repetida</span>` : ''}
              <button type="button" class="imp-rm" data-act="rm" aria-label="${r.off ? 'Incluir' : 'Quitar'} esta tarjeta" title="${r.off ? 'Incluir de nuevo' : 'No importar esta tarjeta'}">${r.off ? '↺' : '✕'}</button>
            </div>
          </div>`;
          })
          .join('')}
      </div>
      ${
        rows.length > shown
          ? `<button type="button" class="imp-more" data-act="more-rows">Ver ${Math.min(PREVIEW_STEP * 4, rows.length - shown)} más · quedan ${rows.length - shown}</button>`
          : rows.length > PREVIEW_STEP
          ? '<button type="button" class="imp-more" data-act="less-rows">Ver menos</button>'
          : ''
      }`;

    // las opciones se pintan una sola vez para no perder el foco al escribir la etiqueta
    const opts = $('imp-opts');
    if (!opts.firstChild) {
      opts.innerHTML = `
        <label class="imp-toggle"><input type="checkbox" id="imp-opt-dup" ${skipDuplicates ? 'checked' : ''} /><span class="imp-sw"></span><span><b>Omitir repetidas</b><small>No importa las que ya existen en el mazo</small></span></label>
        <label class="imp-toggle"><input type="checkbox" id="imp-opt-inv" ${makeInverted ? 'checked' : ''} /><span class="imp-sw"></span><span><b>Crear también la inversa</b><small>Se estudia Respuesta → Pregunta</small></span></label>
        <label class="imp-tag"><span>🏷️ Etiqueta para todas <small>(opcional)</small></span><input type="text" id="imp-opt-tag" class="imp-input" maxlength="32" placeholder="ej. tema-1, examen" value="${esc(tagValue)}" /></label>`;
    }
  };

  const renderGo = () => {
    const n = toImport().length;
    goBtn.disabled = n === 0;
    goBtn.textContent = n === 0 ? 'Nada que importar' : `Importar ${plural(n, 'tarjeta', 'tarjetas')}`;
    $('imp-sub').textContent = !text.value.trim() ? 'Pega texto o sube un archivo' : parsed.rows.length ? `${plural(n, 'tarjeta lista', 'tarjetas listas')} para importar` : 'Ajusta los separadores para encontrar tus tarjetas';
    $('imp-count').textContent = text.value.trim() ? `${plural(text.value.split('\n').filter((l) => l.trim()).length, 'línea', 'líneas')}` : '';
    drop.classList.toggle('has', !!text.value);
    $('imp-b-clear').style.display = text.value || files.length ? '' : 'none';
  };

  const recompute = (immediate = false) => {
    window.clearTimeout(timer);
    const run = () => {
      parsed = parseImport(text.value, settings);
      renderDetect();
      renderSeps();
      renderPreview();
      renderGo();
    };
    if (immediate || text.value.length < 6000) run();
    else timer = window.setTimeout(run, 200);
  };

  const resetSettings = (extra: Partial<ImportSettings> = {}) => {
    Object.assign(settings, DEFAULT_SETTINGS, extra);
    excluded.clear();
    shown = PREVIEW_STEP;
  };

  /* ---------------- archivos ---------------- */
  const sameSuggest = (list: ExtractedFile[]) => (list.every((f) => JSON.stringify(f.suggest) === JSON.stringify(list[0].suggest)) ? list[0].suggest : {});

  const applyFiles = () => {
    const t = files.length === 1 && files[0].sheets.length > 1 ? files[0].sheets[activeSheet].text : files.map((f) => f.text).join('\n');
    text.value = t;
    loadedFromFiles = t;
    resetSettings(files.length ? sameSuggest(files) : {});
    renderFiles();
    recompute(true);
  };

  const loadFiles = async (list: File[]) => {
    if (!list.length) return;
    fileErrors = [];
    busy = 'Leyendo archivos…';
    renderFiles();
    let mod: typeof import('../services/file-import');
    try {
      mod = await import('../services/file-import');
    } catch {
      busy = '';
      fileErrors = [{ name: 'Archivos', message: 'No se pudo cargar el lector de archivos.', hint: 'Revisa tu conexión e inténtalo de nuevo.' }];
      renderFiles();
      return;
    }
    const got: ExtractedFile[] = [];
    for (const f of list) {
      try {
        got.push(await mod.extractFile(f, (m) => {
          busy = list.length > 1 ? `${f.name}: ${m}` : m;
          renderFiles();
        }));
      } catch (e) {
        const err = e as { message?: string; hint?: string };
        fileErrors.push({ name: f.name, message: err.message || 'No se pudo leer.', hint: err.hint || '' });
      }
    }
    busy = '';
    if (got.length) {
      // si el texto sigue siendo el de los archivos anteriores, se suman; si lo escribiste tú, se reemplaza
      const append = files.length > 0 && text.value === loadedFromFiles;
      files = append ? [...files, ...got] : got;
      activeSheet = 0;
      applyFiles();
    } else {
      renderFiles();
    }
  };

  /* ---------------- eventos ---------------- */
  const syncFromInputs = (e: Event) => {
    const t = e.target as HTMLInputElement;
    switch (t.id) {
      case 'imp-text':
        shown = PREVIEW_STEP;
        if (files.length && text.value !== loadedFromFiles) {
          files = [];
          loadedFromFiles = '';
          renderFiles();
        }
        recompute();
        break;
      case 'imp-side-custom':
        settings.sideCustom = t.value;
        recompute(true);
        break;
      case 'imp-card-custom':
        settings.cardCustom = t.value;
        recompute(true);
        break;
      case 'imp-col-f':
        settings.colFront = Math.max(1, parseInt(t.value, 10) || 1);
        recompute(true);
        break;
      case 'imp-col-b':
        settings.colBack = Math.max(1, parseInt(t.value, 10) || 2);
        recompute(true);
        break;
      case 'imp-opt-tag':
        tagValue = t.value;
        break;
    }
  };
  root.addEventListener('input', syncFromInputs);
  root.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    switch (t.id) {
      case 'imp-deck':
        refreshExisting();
        recompute(true);
        break;
      case 'imp-opt-dup':
        skipDuplicates = t.checked;
        renderPreview();
        renderGo();
        break;
      case 'imp-opt-inv':
        makeInverted = t.checked;
        break;
      case 'imp-opt-swap':
        settings.swap = t.checked;
        recompute(true);
        break;
      case 'imp-opt-strip':
        settings.stripList = t.checked;
        recompute(true);
        break;
      case 'imp-file-input': {
        const picked = Array.from(fileInput.files || []);
        fileInput.value = '';
        void loadFiles(picked);
        break;
      }
    }
  });

  const close = () => {
    document.removeEventListener('keydown', onKey);
    root.remove();
    options.onClose();
  };

  const doImport = () => {
    const rows = toImport();
    if (rows.length === 0) return;
    const count = deckService.importParsedCards(deckSel.value, rows, { tag: tagValue, inverted: makeInverted });
    document.removeEventListener('keydown', onKey);
    root.remove();
    options.onImported(count);
  };

  const jumpToLine = (line: number) => {
    const lines = text.value.replace(/\r\n?/g, '\n').split('\n');
    const start = lines.slice(0, line - 1).reduce((n, l) => n + l.length + 1, 0);
    text.focus();
    text.setSelectionRange(start, start + (lines[line - 1] || '').length);
    const lh = parseFloat(getComputedStyle(text).lineHeight) || 20;
    text.scrollTop = Math.max(0, (line - 3) * lh);
    text.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };

  root.addEventListener('click', async (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-act]');
    if (!el) {
      if ((e.target as HTMLElement).id === 'modal-batch-import-root') close();
      return;
    }
    const key = el.dataset.key || '';
    switch (el.dataset.act) {
      case 'close':
        close();
        break;
      case 'go':
        doImport();
        break;
      case 'file':
        fileInput.click();
        break;
      case 'paste':
        try {
          const clip = await navigator.clipboard.readText();
          if (clip) {
            text.value = text.value.trim() ? `${text.value.replace(/\n+$/, '')}\n${clip}` : clip;
            shown = PREVIEW_STEP;
            recompute(true);
          }
        } catch {
          text.focus();
        }
        break;
      case 'examples':
        examplesOpen = !examplesOpen;
        renderExamples();
        if (examplesOpen) $('imp-examples').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        break;
      case 'guides':
        guidesOpen = !guidesOpen;
        renderExamples();
        break;
      case 'use-ex': {
        const ex = IMPORT_EXAMPLES.find((x) => x.id === el.dataset.id);
        if (!ex) break;
        files = [];
        loadedFromFiles = '';
        fileErrors = [];
        renderFiles();
        text.value = ex.text;
        resetSettings(ex.settings);
        examplesOpen = false;
        renderExamples();
        recompute(true);
        text.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        break;
      }
      case 'clear':
        files = [];
        loadedFromFiles = '';
        fileErrors = [];
        text.value = '';
        resetSettings();
        renderFiles();
        recompute(true);
        text.focus();
        break;
      case 'reset':
        resetSettings();
        recompute(true);
        break;
      case 'side':
        settings.sideSep = key as SideSepKey;
        recompute(true);
        if (key === 'custom') $<HTMLInputElement>('imp-side-custom')?.focus();
        break;
      case 'card':
        settings.cardSep = key as CardSepMode;
        recompute(true);
        if (key === 'custom') $<HTMLInputElement>('imp-card-custom')?.focus();
        break;
      case 'cut':
        settings.cut = key as 'first' | 'last';
        recompute(true);
        break;
      case 'extra':
        settings.extra = key as ExtraMode;
        recompute(true);
        break;
      case 'header':
        settings.headerMode = key as HeaderMode;
        recompute(true);
        break;
      case 'more':
        moreOpen = !moreOpen;
        renderSeps();
        break;
      case 'ignored':
        ignoredOpen = !ignoredOpen;
        renderDetect();
        break;
      case 'jump':
        jumpToLine(parseInt(el.dataset.line || '1', 10));
        break;
      case 'rm': {
        const k = el.closest<HTMLElement>('.imp-card')?.dataset.k || '';
        if (excluded.has(k)) excluded.delete(k);
        else excluded.add(k);
        renderPreview();
        renderGo();
        break;
      }
      case 'more-rows':
        shown += PREVIEW_STEP * 4;
        renderPreview();
        break;
      case 'less-rows':
        shown = PREVIEW_STEP;
        renderPreview();
        break;
      case 'sheet':
        activeSheet = parseInt(el.dataset.i || '0', 10);
        applyFiles();
        break;
      case 'rm-file':
        files.splice(parseInt(el.dataset.i || '0', 10), 1);
        activeSheet = 0;
        if (files.length) applyFiles();
        else {
          text.value = '';
          loadedFromFiles = '';
          resetSettings();
          renderFiles();
          recompute(true);
        }
        break;
      case 'rm-err':
        fileErrors.splice(parseInt(el.dataset.i || '0', 10), 1);
        renderFiles();
        break;
    }
  });

  ['dragenter', 'dragover'].forEach((ev) =>
    drop.addEventListener(ev, (e) => {
      if ((e as DragEvent).dataTransfer?.types?.includes('Files')) {
        e.preventDefault();
        drop.classList.add('over');
      }
    })
  );
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, () => drop.classList.remove('over')));
  drop.addEventListener('drop', (e) => {
    const list = Array.from((e as DragEvent).dataTransfer?.files || []);
    if (list.length) {
      e.preventDefault();
      void loadFiles(list);
    }
  });
  text.addEventListener('paste', (e) => {
    const list = Array.from(e.clipboardData?.files || []);
    if (list.length) {
      e.preventDefault();
      void loadFiles(list);
    }
  });

  function onKey(e: KeyboardEvent) {
    if (!document.getElementById('modal-batch-import-root')) return document.removeEventListener('keydown', onKey);
    if (e.key === 'Escape') close();
    else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      doImport();
    }
  }
  document.addEventListener('keydown', onKey);

  refreshExisting();
  renderExamples();
  renderFiles();
  recompute(true);
  text.focus();
}
