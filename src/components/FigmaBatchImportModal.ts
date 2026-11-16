import { deckService } from '../services/deck.service';
import { katexService } from '../services/katex.service';
import {
  DEFAULT_SETTINGS,
  buildExample,
  parseImport,
  type CardSepMode,
  type ImportParseResult,
  type ImportSettings,
  type SideSepKey
} from '../services/import-parser';

export interface FigmaBatchImportOptions {
  deckId: string;
  onImported: (count: number) => void;
  onClose: () => void;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const norm = (t: string) => t.toLowerCase().replace(/\s+/g, ' ').trim();
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const PREVIEW_STEP = 8;

const SIDE_CHIPS: Array<{ key: SideSepKey; label: string }> = [
  { key: 'auto', label: '✨ Automático' },
  { key: 'tab', label: 'Tab' },
  { key: 'semi', label: ';' },
  { key: 'comma', label: ',' },
  { key: 'pipe', label: '|' },
  { key: 'colons', label: ':::' },
  { key: 'dash', label: ' - ' },
  { key: 'custom', label: '✏️ Otro' }
];
const CARD_CHIPS: Array<{ key: CardSepMode; label: string }> = [
  { key: 'auto', label: '✨ Automático' },
  { key: 'line', label: 'Cada línea' },
  { key: 'blank', label: 'Línea en blanco' },
  { key: 'dashes', label: '---' },
  { key: 'custom', label: '✏️ Otro' }
];

export function openFigmaBatchImportModal(options: FigmaBatchImportOptions): void {
  document.getElementById('modal-batch-import-root')?.remove();

  const allDecks = deckService.getAllDecks();
  const settings: ImportSettings = { ...DEFAULT_SETTINGS };
  let parsed: ImportParseResult = parseImport('', settings);
  const excluded = new Set<string>();
  let shown = PREVIEW_STEP;
  let skipDuplicates = true;
  let makeInverted = false;
  let advancedOpen = false;
  let helpOpen = false;
  let existingFronts = new Set<string>();
  let timer = 0;

  const html = `
    <div class="modal-backdrop figma-modal-backdrop" id="modal-batch-import-root">
      <div class="apple-glass-modal imp-panel" role="dialog" aria-label="Importar tarjetas">

        <header class="imp-head">
          <div class="imp-head-ic">⬇️</div>
          <div class="imp-head-tx">
            <h3>Importar tarjetas</h3>
            <p>Pega texto o sube un archivo. Eureka detecta solo cómo está organizado.</p>
          </div>
          <button type="button" class="imp-x" id="imp-close" aria-label="Cerrar">×</button>
        </header>

        <div class="imp-body">

          <section class="imp-step">
            <div class="imp-step-h"><span class="imp-num">1</span><b>¿A qué mazo van?</b></div>
            <select id="imp-deck" class="imp-select">
              ${allDecks.map((d) => `<option value="${d.id}" ${d.id === options.deckId ? 'selected' : ''}>${d.parentId ? '↳ ' : '📁 '}${esc(d.name)}</option>`).join('')}
            </select>
          </section>

          <section class="imp-step">
            <div class="imp-step-h"><span class="imp-num">2</span><b>Tu contenido</b></div>
            <div class="imp-drop" id="imp-drop">
              <textarea id="imp-text" spellcheck="false" autocomplete="off" placeholder="Pega aquí tus tarjetas, o arrastra un archivo (.txt, .csv, .tsv)&#10;&#10;Ejemplo:&#10;Capital de Australia ; Canberra&#10;Ley de Ohm ; $$V = I \cdot R$$"></textarea>
              <div class="imp-drop-over" aria-hidden="true">📄 Suelta el archivo para leerlo</div>
            </div>
            <div class="imp-tools">
              <button type="button" class="imp-btn primary" id="imp-file">📄 Subir archivo</button>
              <button type="button" class="imp-btn" id="imp-paste">📋 Pegar</button>
              <button type="button" class="imp-btn" id="imp-example">💡 Ejemplo</button>
              <button type="button" class="imp-btn danger" id="imp-clear">Limpiar</button>
              <button type="button" class="imp-link" id="imp-help-toggle">¿Qué formatos entiende?</button>
              <input type="file" id="imp-file-input" accept=".txt,.csv,.tsv,.md,.text,text/plain,text/csv,text/tab-separated-values" hidden />
            </div>
            <div class="imp-help hidden" id="imp-help"></div>
          </section>

          <section class="imp-step" id="imp-detect-wrap">
            <div class="imp-step-h"><span class="imp-num">3</span><b>Así lo entendimos</b></div>
            <div id="imp-detect"></div>
            <div class="imp-adv hidden" id="imp-adv"></div>
          </section>

          <section class="imp-step hidden" id="imp-preview-wrap">
            <div class="imp-step-h"><span class="imp-num">4</span><b>Revisa y listo</b><span class="imp-hint" id="imp-preview-hint"></span></div>
            <div id="imp-preview"></div>
            <div class="imp-opts" id="imp-opts"></div>
          </section>

        </div>

        <footer class="imp-foot">
          <button type="button" class="imp-btn" id="imp-cancel">Cancelar</button>
          <button type="button" class="imp-go" id="imp-go" disabled>Importar 0 tarjetas</button>
        </footer>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);

  const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;
  const text = $<HTMLTextAreaElement>('imp-text')!;
  const deckSel = $<HTMLSelectElement>('imp-deck')!;
  const goBtn = $<HTMLButtonElement>('imp-go')!;

  const refreshExisting = () => {
    existingFronts = new Set(deckService.getCardsByDeck(deckSel.value, false).map((c) => norm(c.front)));
  };

  /** Filas ya marcadas como duplicadas / excluidas */
  const rowKey = (f: string, b: string) => `${f}\u0001${b}`;
  const decorate = () => {
    const seen = new Set<string>();
    return parsed.rows.map((r) => {
      const n = norm(r.front);
      const dup = existingFronts.has(n) ? 'mazo' : seen.has(n) ? 'lista' : '';
      seen.add(n);
      return { ...r, dup, off: excluded.has(rowKey(r.front, r.back)) };
    });
  };
  const toImport = () => decorate().filter((r) => !r.off && !(skipDuplicates && r.dup));

  /* ---------------- pintado ---------------- */
  const renderHelp = () => {
    const help = $('imp-help')!;
    help.classList.toggle('hidden', !helpOpen);
    if (!helpOpen) return;
    const ex = (side: Parameters<typeof buildExample>[0], title: string, sample: string) => `
      <button type="button" class="imp-fmt" data-ex="${side}">
        <b>${title}</b>
        <code>${esc(sample)}</code>
        <span>Usar este ejemplo</span>
      </button>`;
    help.innerHTML = `
      <div class="imp-fmt-grid">
        ${ex('semi', 'Una tarjeta por línea', 'Pregunta ; Respuesta')}
        ${ex('tab', 'Excel, Sheets o Anki', 'Pregunta⇥Respuesta  (copiar y pegar celdas)')}
        ${ex('blocks', 'Varias líneas por tarjeta', 'Pregunta\nRespuesta\n\n(línea en blanco entre tarjetas)')}
      </div>
      <p class="imp-note">También entiende <b>CSV con comillas</b>, exportaciones de <b>Anki</b> (texto plano), bloques con <b>«Pregunta: … Respuesta: …»</b> y fila de títulos. Para Excel (.xlsx) elige <i>Guardar como → CSV</i>; para Anki, <i>Exportar → Texto plano</i>.</p>`;
    help.querySelectorAll<HTMLButtonElement>('.imp-fmt').forEach((b) =>
      b.addEventListener('click', () => {
        text.value = buildExample(b.dataset.ex as Parameters<typeof buildExample>[0]);
        resetSettings();
        text.focus();
        recompute(true);
      })
    );
  };

  const renderAdvanced = () => {
    const adv = $('imp-adv')!;
    adv.classList.toggle('hidden', !advancedOpen);
    if (!advancedOpen) return;
    const chips = <K extends string>(group: string, items: Array<{ key: K; label: string }>, cur: K) =>
      items.map((i) => `<button type="button" class="imp-chip ${i.key === cur ? 'on' : ''}" data-group="${group}" data-key="${i.key}">${esc(i.label)}</button>`).join('');
    adv.innerHTML = `
      <div class="imp-adv-row">
        <span>Pregunta y respuesta se separan con</span>
        <div class="imp-chips">${chips('side', SIDE_CHIPS, settings.sideSep)}</div>
        <input class="imp-input ${settings.sideSep === 'custom' ? '' : 'hidden'}" id="imp-side-custom" placeholder="Escribe el separador" value="${esc(settings.sideCustom)}" />
      </div>
      <div class="imp-adv-row">
        <span>Las tarjetas se separan con</span>
        <div class="imp-chips">${chips('card', CARD_CHIPS, settings.cardSep)}</div>
        <input class="imp-input ${settings.cardSep === 'custom' ? '' : 'hidden'}" id="imp-card-custom" placeholder="Escribe el separador" value="${esc(settings.cardCustom)}" />
      </div>`;
    adv.querySelectorAll<HTMLButtonElement>('.imp-chip').forEach((b) =>
      b.addEventListener('click', () => {
        if (b.dataset.group === 'side') settings.sideSep = b.dataset.key as SideSepKey;
        else settings.cardSep = b.dataset.key as CardSepMode;
        renderAdvanced();
        recompute(true);
      })
    );
    $<HTMLInputElement>('imp-side-custom')?.addEventListener('input', (e) => {
      settings.sideCustom = (e.target as HTMLInputElement).value;
      recompute(true);
    });
    $<HTMLInputElement>('imp-card-custom')?.addEventListener('input', (e) => {
      settings.cardCustom = (e.target as HTMLInputElement).value;
      recompute(true);
    });
  };

  const renderDetect = () => {
    const box = $('imp-detect')!;
    const raw = text.value.trim();
    const n = parsed.rows.length;
    const d = parsed.detected;
    const lines: string[] = [];
    let tone = 'idle';
    let title = '';

    if (!raw) {
      title = 'Esperando tu contenido…';
      lines.push('Cuando pegues o subas algo, aquí te decimos qué entendimos.');
    } else if (n === 0) {
      tone = 'bad';
      title = 'No encontramos tarjetas todavía';
      lines.push('Falta algo que separe la pregunta de la respuesta (por ejemplo <b>;</b> o un Tab). Toca «Ajustar» para elegirlo, o mira «¿Qué formatos entiende?».');
    } else {
      tone = parsed.ignored.length ? 'warn' : 'good';
      title = `${n} tarjeta${n === 1 ? '' : 's'} detectada${n === 1 ? '' : 's'}`;
      lines.push(`<b>Formato:</b> ${esc(d.cardSepLabel ? `${d.cardSepLabel} · ` : '')}${esc(d.sideSepLabel)}`);
      if (parsed.headerSkipped) lines.push('Omitimos la primera fila porque parecía un título.');
      if (parsed.extraColumnRows) lines.push(`${parsed.extraColumnRows} fila${parsed.extraColumnRows === 1 ? '' : 's'} con más de 2 columnas: usamos solo las 2 primeras (pregunta y respuesta).`);
      if (parsed.ignored.length) {
        const sample = parsed.ignored.slice(0, 3).map((i) => `línea ${i.line}`).join(', ');
        lines.push(`⚠️ ${parsed.ignored.length} línea${parsed.ignored.length === 1 ? '' : 's'} sin separador ${parsed.ignored.length === 1 ? 'se ignora' : 'se ignoran'} (${sample}${parsed.ignored.length > 3 ? '…' : ''}).`);
      }
    }

    box.innerHTML = `
      <div class="imp-detect ${tone}">
        <div class="imp-detect-ic">${tone === 'good' ? '✅' : tone === 'warn' ? '⚠️' : tone === 'bad' ? '🤔' : '✨'}</div>
        <div class="imp-detect-tx"><b>${title}</b>${lines.map((l) => `<span>${l}</span>`).join('')}</div>
        <button type="button" class="imp-btn small" id="imp-adv-toggle">${advancedOpen ? 'Listo' : '⚙️ Ajustar'}</button>
      </div>`;
    $('imp-adv-toggle')?.addEventListener('click', () => {
      advancedOpen = !advancedOpen;
      renderDetect();
      renderAdvanced();
    });
  };

  const renderPreview = () => {
    const wrap = $('imp-preview-wrap')!;
    const rows = decorate();
    wrap.classList.toggle('hidden', rows.length === 0);
    if (rows.length === 0) return;
    const dups = rows.filter((r) => r.dup).length;
    const hint = $('imp-preview-hint')!;
    hint.textContent = dups ? `${dups} repetida${dups === 1 ? '' : 's'}` : '';

    const list = $('imp-preview')!;
    const visible = rows.slice(0, shown);
    list.innerHTML = `
      <div class="imp-cards">
        ${visible
          .map((r) => {
            const skip = r.off || (skipDuplicates && !!r.dup);
            return `
          <div class="imp-card ${skip ? 'skip' : ''}" data-k="${esc(rowKey(r.front, r.back))}">
            <div class="imp-card-n">${rows.indexOf(r) + 1}</div>
            <div class="imp-card-sides">
              <div class="imp-side"><i>Pregunta</i><div>${katexService.parseAndRender(r.front)}</div></div>
              <div class="imp-side"><i>Respuesta</i><div>${katexService.parseAndRender(r.back)}</div></div>
            </div>
            <div class="imp-card-act">
              ${r.dup ? `<span class="imp-badge" title="Ya existe una tarjeta con esta pregunta ${r.dup === 'mazo' ? 'en el mazo' : 'más arriba en tu lista'}">Repetida</span>` : ''}
              <button type="button" class="imp-rm" data-rm="1" aria-label="${r.off ? 'Incluir' : 'Quitar'} esta tarjeta" title="${r.off ? 'Incluir de nuevo' : 'No importar esta tarjeta'}">${r.off ? '↺' : '✕'}</button>
            </div>
          </div>`;
          })
          .join('')}
      </div>
      ${
        rows.length > shown
          ? `<button type="button" class="imp-more" id="imp-more">Ver ${Math.min(PREVIEW_STEP * 4, rows.length - shown)} más · quedan ${rows.length - shown}</button>`
          : rows.length > PREVIEW_STEP
          ? '<button type="button" class="imp-more" id="imp-less">Ver menos</button>'
          : ''
      }`;
    list.querySelectorAll<HTMLElement>('.imp-card').forEach((c) =>
      c.querySelector('[data-rm]')?.addEventListener('click', () => {
        const k = c.dataset.k || '';
        if (excluded.has(k)) excluded.delete(k);
        else excluded.add(k);
        renderPreview();
        renderGo();
      })
    );
    $('imp-more')?.addEventListener('click', () => {
      shown += PREVIEW_STEP * 4;
      renderPreview();
    });
    $('imp-less')?.addEventListener('click', () => {
      shown = PREVIEW_STEP;
      renderPreview();
    });

    const opts = $('imp-opts')!;
    opts.innerHTML = `
      <label class="imp-toggle"><input type="checkbox" id="imp-opt-dup" ${skipDuplicates ? 'checked' : ''} /><span class="imp-sw"></span><span><b>Omitir repetidas</b><small>No importa las que ya existen en el mazo</small></span></label>
      <label class="imp-toggle"><input type="checkbox" id="imp-opt-inv" ${makeInverted ? 'checked' : ''} /><span class="imp-sw"></span><span><b>Crear también la inversa</b><small>Se estudia Respuesta → Pregunta</small></span></label>
      <label class="imp-tag"><span>🏷️ Etiqueta para todas <small>(opcional)</small></span><input type="text" id="imp-opt-tag" class="imp-input" maxlength="32" placeholder="ej. tema-1, examen" value="${esc(tagValue)}" /></label>`;
    $<HTMLInputElement>('imp-opt-dup')?.addEventListener('change', (e) => {
      skipDuplicates = (e.target as HTMLInputElement).checked;
      renderPreview();
      renderGo();
    });
    $<HTMLInputElement>('imp-opt-inv')?.addEventListener('change', (e) => {
      makeInverted = (e.target as HTMLInputElement).checked;
    });
    $<HTMLInputElement>('imp-opt-tag')?.addEventListener('input', (e) => {
      tagValue = (e.target as HTMLInputElement).value;
    });
  };
  let tagValue = '';

  const renderGo = () => {
    const n = toImport().length;
    goBtn.disabled = n === 0;
    goBtn.textContent = n === 0 ? 'Nada que importar' : `Importar ${n} tarjeta${n === 1 ? '' : 's'}`;
  };

  const recompute = (immediate = false) => {
    window.clearTimeout(timer);
    const run = () => {
      parsed = parseImport(text.value, settings);
      // al cambiar el texto se vuelve a pintar todo; las exclusiones que ya no existen se descartan solas
      renderDetect();
      renderAdvanced();
      renderPreview();
      renderGo();
    };
    if (immediate || text.value.length < 4000) run();
    else timer = window.setTimeout(run, 180);
  };

  const resetSettings = () => {
    Object.assign(settings, DEFAULT_SETTINGS);
    excluded.clear();
    shown = PREVIEW_STEP;
  };

  /* ---------------- eventos ---------------- */
  text.addEventListener('input', () => {
    shown = PREVIEW_STEP;
    recompute();
  });
  deckSel.addEventListener('change', () => {
    refreshExisting();
    recompute(true);
  });

  const loadText = (content: string, name?: string) => {
    resetSettings();
    text.value = content;
    recompute(true);
    if (name) $('imp-preview-hint')!.textContent = `📄 ${name}`;
  };

  const readFile = (file: File) => {
    if (/\.(xlsx|xls|apkg|colpkg|docx|pdf)$/i.test(file.name)) {
      const kind = /\.(xlsx|xls)$/i.test(file.name) ? 'Excel: abre el archivo y usa «Guardar como → CSV»' : /apkg|colpkg/i.test(file.name) ? 'Anki: usa «Exportar → Texto plano (.txt)»' : 'Copia el texto y pégalo aquí';
      renderDetect();
      $('imp-detect')!.innerHTML = `<div class="imp-detect bad"><div class="imp-detect-ic">🤔</div><div class="imp-detect-tx"><b>Ese tipo de archivo no se puede leer directamente</b><span>${kind}, y súbelo de nuevo.</span></div></div>`;
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      $('imp-detect')!.innerHTML = '<div class="imp-detect bad"><div class="imp-detect-ic">⚠️</div><div class="imp-detect-tx"><b>El archivo es demasiado grande</b><span>El máximo es 8 MB. Divídelo en partes.</span></div></div>';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => loadText(String(reader.result || ''), file.name);
    reader.readAsText(file, 'utf-8');
  };

  const fileInput = $<HTMLInputElement>('imp-file-input')!;
  $('imp-file')?.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    const f = fileInput.files?.[0];
    if (f) readFile(f);
    fileInput.value = '';
  });

  const drop = $('imp-drop')!;
  ['dragenter', 'dragover'].forEach((ev) =>
    drop.addEventListener(ev, (e) => {
      e.preventDefault();
      drop.classList.add('over');
    })
  );
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, () => drop.classList.remove('over')));
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    const f = (e as DragEvent).dataTransfer?.files?.[0];
    if (f) readFile(f);
  });

  $('imp-paste')?.addEventListener('click', async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) {
        if (text.value.trim()) text.value += `\n${clip}`;
        else loadText(clip);
        recompute(true);
      }
    } catch {
      text.focus();
    }
  });
  $('imp-example')?.addEventListener('click', () => {
    loadText(buildExample('semi'));
  });
  $('imp-clear')?.addEventListener('click', () => {
    loadText('');
    text.focus();
  });
  $('imp-help-toggle')?.addEventListener('click', () => {
    helpOpen = !helpOpen;
    renderHelp();
  });

  goBtn.addEventListener('click', () => {
    const rows = toImport();
    if (rows.length === 0) return;
    const count = deckService.importParsedCards(deckSel.value, rows, { tag: tagValue, inverted: makeInverted });
    document.getElementById('modal-batch-import-root')?.remove();
    options.onImported(count);
  });

  const close = () => {
    document.getElementById('modal-batch-import-root')?.remove();
    options.onClose();
  };
  $('imp-close')?.addEventListener('click', close);
  $('imp-cancel')?.addEventListener('click', close);
  document.getElementById('modal-batch-import-root')?.addEventListener('mousedown', (e) => {
    if ((e.target as HTMLElement).id === 'modal-batch-import-root') close();
  });

  const onEsc = (e: KeyboardEvent) => {
    if (!document.getElementById('modal-batch-import-root')) return document.removeEventListener('keydown', onEsc);
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', onEsc);
      close();
    }
  };
  document.addEventListener('keydown', onEsc);
  refreshExisting();
  renderDetect();
  renderHelp();
  text.focus();
}
