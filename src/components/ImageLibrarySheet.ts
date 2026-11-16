import '../ui/styles/imagelib.css';
import {
  searchLibrary,
  planQuery,
  sourcesFor,
  interleave,
  fetchLibraryImageAsDataUrl,
  compressImageFile,
  creditFor,
  type LibraryImage,
  type LibraryKind,
  type LibrarySource,
  type QueryPlan
} from '../services/image-library.service';

export interface ImageLibraryOptions {
  title?: string;
  /** Texto con el que arrancar la búsqueda (por ejemplo, el anverso de la tarjeta) */
  initialQuery?: string;
  onPick: (dataUrl: string, credit: string) => void;
  onClose?: () => void;
}

/** Ideas para empezar, por materia (en español; la búsqueda se traduce sola) */
const SUGGESTIONS: Array<{ name: string; items: string[] }> = [
  { name: '🧬 Biología', items: ['célula', 'mitocondria', 'ADN', 'fotosíntesis', 'neurona', 'mariposa monarca'] },
  { name: '🫀 Anatomía', items: ['corazón humano', 'esqueleto', 'cerebro', 'sistema digestivo', 'ojo humano', 'pulmones'] },
  { name: '⚗️ Química', items: ['tabla periódica', 'átomo', 'molécula de agua', 'enlace covalente', 'cristal de sal', 'laboratorio'] },
  { name: '⚡ Física', items: ['circuito eléctrico', 'campo magnético', 'prisma', 'onda', 'palanca', 'péndulo'] },
  { name: '🪐 Tierra y espacio', items: ['sistema solar', 'volcán', 'placas tectónicas', 'galaxia', 'ciclo del agua', 'eclipse'] },
  { name: '🏛️ Historia y arte', items: ['Revolución Francesa', 'antiguo Egipto', 'Imperio romano', 'Machu Picchu', 'Renacimiento', 'Gioconda'] }
];

const KIND_TABS: Array<{ id: LibraryKind; label: string; hint: string }> = [
  { id: 'all', label: '✨ Todo', hint: 'Todas las fuentes mezcladas' },
  { id: 'encyclopedia', label: '📚 Enciclopedia', hint: 'Las imágenes del artículo de Wikipedia del tema' },
  { id: 'diagram', label: '🧬 Diagramas', hint: 'Esquemas, láminas e ilustraciones' },
  { id: 'photo', label: '📷 Fotos', hint: 'Fotografías reales (y especies de iNaturalist)' }
];

const SOURCE_BADGE: Record<LibrarySource, string> = {
  wikipedia: 'W',
  wikimedia: 'C',
  openverse: 'O',
  inaturalist: 'iN'
};

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Limpia el texto de una tarjeta para usarlo como búsqueda (sin markdown, fórmulas ni huecos). */
export function queryFromCardText(text: string): string {
  return (text || '')
    .replace(/\{\{c\d*::([\s\S]*?)(?:::[\s\S]*?)?\}\}/g, '$1')
    .replace(/\$\$?[^$]*\$\$?/g, ' ')
    .replace(/[*_~`#>\[\]()¿?¡!:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 6)
    .join(' ');
}

export function openImageLibrary(opts: ImageLibraryOptions): { close: () => void } {
  document.getElementById('imglib-root')?.remove();

  const root = document.createElement('div');
  root.id = 'imglib-root';
  root.className = 'imglib-overlay';
  root.innerHTML = `
    <div class="imglib-sheet" role="dialog" aria-modal="true" aria-label="Biblioteca de imágenes">
      <div class="imglib-head">
        <div class="imglib-title">
          <span class="imglib-title-ic">🖼️</span>
          <div>
            <h3>${esc(opts.title || 'Biblioteca de imágenes')}</h3>
            <p>Wikipedia, Wikimedia Commons, Openverse e iNaturalist · licencias abiertas · busca en español o inglés</p>
          </div>
        </div>
        <button class="imglib-x" id="imglib-close" aria-label="Cerrar">✕</button>
      </div>

      <form class="imglib-search" id="imglib-form" autocomplete="off">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input id="imglib-q" type="search" inputmode="search" enterkeyhint="search" placeholder="Busca: mitocondria, Revolución Francesa, volcano…" />
        <button type="submit" class="imglib-go">Buscar</button>
      </form>

      <div class="imglib-plan" id="imglib-plan" hidden></div>

      <div class="imglib-tabs" role="tablist">
        ${KIND_TABS.map((t) => `<button class="imglib-tab ${t.id === 'all' ? 'on' : ''}" data-kind="${t.id}" role="tab" title="${esc(t.hint)}">${t.label}</button>`).join('')}
        <label class="imglib-upload" title="Usar una imagen de tu dispositivo">
          ⬆️ <span>Mi dispositivo</span>
          <input type="file" id="imglib-file" accept="image/*" hidden />
        </label>
      </div>

      <div class="imglib-body" id="imglib-body"></div>
      <div class="imglib-foot" id="imglib-foot">Las imágenes se reducen y guardan en tu tarjeta; se anota su autor y licencia.</div>
    </div>`;
  document.body.appendChild(root);
  requestAnimationFrame(() => root.classList.add('show'));

  const $ = <T extends HTMLElement>(id: string) => root.querySelector('#' + id) as T;
  const input = $<HTMLInputElement>('imglib-q');
  const body = $<HTMLElement>('imglib-body');
  const planEl = $<HTMLElement>('imglib-plan');
  const foot = $<HTMLElement>('imglib-foot');

  let kind: LibraryKind = 'all';
  let query = '';
  let plan: QueryPlan | null = null;
  let page = 1;
  let busy = false;
  let hasMore = false;
  let ctrl: AbortController | null = null;
  /** Imágenes de las tandas anteriores (fijas) y las de la tanda en curso, por fuente */
  let done: LibraryImage[] = [];
  let current: Partial<Record<LibrarySource, LibraryImage[]>> = {};
  let items: LibraryImage[] = [];
  let closed = false;

  const close = () => {
    if (closed) return;
    closed = true;
    ctrl?.abort();
    window.removeEventListener('keydown', onKey, true);
    root.classList.remove('show');
    window.setTimeout(() => root.remove(), 180);
    opts.onClose?.();
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
    }
  };
  window.addEventListener('keydown', onKey, true);

  const showSuggestions = () => {
    planEl.hidden = true;
    body.innerHTML = `
      <div class="imglib-empty">
        <div class="imglib-empty-ic">🔎</div>
        <h4>¿Qué imagen necesitas?</h4>
        <p>Escribe un concepto en español o en inglés: se identifica el tema y se busca en los dos idiomas a la vez.</p>
        <div class="imglib-sugs">${SUGGESTIONS.map(
          (g) => `<div class="imglib-sug"><b>${g.name}</b><div class="imglib-chips">${g.items.map((s) => `<button class="imglib-chip" data-q="${esc(s)}">${esc(s)}</button>`).join('')}</div></div>`
        ).join('')}</div>
      </div>`;
  };

  const renderPlan = () => {
    if (!plan) {
      planEl.hidden = true;
      return;
    }
    const parts: string[] = [];
    const topic = plan.lang === 'es' ? plan.topicEs : plan.topicEn;
    if (topic) parts.push(`<span class="imglib-pl">Tema: <b>${esc(topic)}</b></span>`);
    if (plan.lang === 'es' && plan.en && plan.en.toLowerCase() !== plan.es.toLowerCase()) parts.push(`<span class="imglib-pl">EN · <b>${esc(plan.en)}</b></span>`);
    if (plan.lang === 'en' && plan.es && plan.es.toLowerCase() !== plan.en.toLowerCase()) parts.push(`<span class="imglib-pl">ES · <b>${esc(plan.es)}</b></span>`);
    const related = plan.related.slice(0, 6);
    planEl.innerHTML = `${parts.join('')}${related.length ? `<span class="imglib-rel">¿Querías decir?</span>${related.map((r) => `<button class="imglib-chip sm" data-q="${esc(r)}">${esc(r)}</button>`).join('')}` : ''}`;
    planEl.hidden = !parts.length && !related.length;
  };

  const renderSkeleton = () => {
    body.innerHTML = `<div class="imglib-grid">${Array.from({ length: 15 }, () => '<div class="imglib-cell skeleton"></div>').join('')}</div>`;
  };

  const cellHtml = (img: LibraryImage, i: number) => `
    <button class="imglib-cell" data-i="${i}" title="${esc(img.title)} · ${esc(img.creator)} · ${esc(img.provider)}">
      <img src="${esc(img.thumb)}" alt="${esc(img.title)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" />
      <span class="imglib-src s-${img.source}">${SOURCE_BADGE[img.source]}</span>
      <span class="imglib-lic">${esc(img.license)}</span>
      <span class="imglib-cap">${esc(img.title)}</span>
      <span class="imglib-spin"></span>
    </button>`;

  const rebuild = () => {
    const seen = new Set<string>();
    done.forEach((d) => {
      seen.add(d.id);
      seen.add(d.thumb.split('?')[0]);
    });
    const order = sourcesFor(kind);
    items = done.concat(interleave(order.map((s) => current[s] || []), seen));
  };

  const renderItems = (loadingMore = false) => {
    if (!items.length) {
      body.innerHTML = `<div class="imglib-empty"><div class="imglib-empty-ic">🫥</div><h4>Sin resultados</h4><p>Prueba con otra palabra, un tema relacionado de arriba o cambia de pestaña.</p></div>`;
      return;
    }
    const keep = body.scrollTop;
    body.innerHTML = `<div class="imglib-grid">${items.map(cellHtml).join('')}</div>${
      hasMore ? `<button class="imglib-more" id="imglib-more">${loadingMore ? 'Cargando…' : 'Cargar más imágenes'}</button>` : ''
    }`;
    body.scrollTop = keep;
    foot.textContent = `${items.length} imágenes · toca una para añadirla · W Wikipedia · C Commons · O Openverse · iN iNaturalist`;
  };

  const run = async (reset: boolean) => {
    if (busy && !reset) return;
    if (!query) {
      showSuggestions();
      return;
    }
    ctrl?.abort();
    ctrl = new AbortController();
    const myCtrl = ctrl;
    busy = true;
    if (reset) {
      page = 1;
      done = [];
      items = [];
      hasMore = false;
      plan = null;
      renderSkeleton();
      planEl.hidden = true;
    } else {
      done = items.slice();
      renderItems(true);
    }
    current = {};

    try {
      plan = await planQuery(query, myCtrl.signal);
    } catch {
      plan = { original: query, lang: 'es', en: query, es: query, related: [] };
    }
    if (myCtrl.signal.aborted || closed) return;
    renderPlan();

    const sources = sourcesFor(kind);
    let failed = 0;
    let more = false;
    // Cada fuente pinta en cuanto responde, mezclada por turnos con las demás
    await Promise.all(
      sources.map((src) =>
        searchLibrary(src, plan as QueryPlan, page, kind, myCtrl.signal)
          .then((res) => {
            if (myCtrl.signal.aborted || closed) return;
            current[src] = res.items;
            more = more || res.hasMore;
            hasMore = more;
            rebuild();
            if (items.length) renderItems();
          })
          .catch((e: any) => {
            if (e?.name === 'AbortError') return;
            failed++;
          })
      )
    );
    busy = false;
    if (myCtrl.signal.aborted || closed) return;
    rebuild();
    if (failed === sources.length && page === 1) {
      body.innerHTML = `<div class="imglib-empty"><div class="imglib-empty-ic">📡</div><h4>No se pudo buscar</h4><p>Revisa tu conexión e inténtalo de nuevo.</p><button class="imglib-chip" id="imglib-retry">Reintentar</button></div>`;
      return;
    }
    renderItems();
    // Pocas imágenes en la primera tanda: se pide otra enseguida para llenar la pantalla
    if (hasMore && items.length < 24 && page < 3) {
      page++;
      void run(false);
    }
  };

  const pick = async (cell: HTMLElement, img: LibraryImage) => {
    if (cell.classList.contains('loading')) return;
    cell.classList.add('loading');
    try {
      const dataUrl = await fetchLibraryImageAsDataUrl(img);
      if (closed) return;
      opts.onPick(dataUrl, creditFor(img));
      close();
    } catch {
      cell.classList.remove('loading');
      cell.classList.add('failed');
      window.setTimeout(() => cell.classList.remove('failed'), 1400);
    }
  };

  const searchFor = (q: string) => {
    input.value = q;
    query = q.trim();
    void run(true);
  };

  // Eventos
  $('imglib-close').addEventListener('click', close);
  root.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t === root) return close();
    const chip = t.closest('.imglib-chip[data-q]') as HTMLElement | null;
    if (chip) return searchFor(chip.dataset.q || '');
    if (t.closest('#imglib-retry')) return void run(true);
    if (t.closest('#imglib-more')) {
      page++;
      void run(false);
      return;
    }
    const cell = t.closest('.imglib-cell:not(.skeleton)') as HTMLElement | null;
    if (cell) {
      const img = items[Number(cell.dataset.i)];
      if (img) void pick(cell, img);
      return;
    }
    const tab = t.closest('.imglib-tab') as HTMLElement | null;
    if (tab) {
      kind = (tab.dataset.kind as LibraryKind) || 'all';
      root.querySelectorAll('.imglib-tab').forEach((b) => b.classList.toggle('on', b === tab));
      if (query) void run(true);
    }
  });

  $('imglib-form').addEventListener('submit', (e) => {
    e.preventDefault();
    query = input.value.trim();
    input.blur();
    void run(true);
  });

  let typingTimer = 0;
  input.addEventListener('input', () => {
    window.clearTimeout(typingTimer);
    typingTimer = window.setTimeout(() => {
      const q = input.value.trim();
      if (q.length >= 3 && q !== query) {
        query = q;
        void run(true);
      }
    }, 650);
  });

  $<HTMLInputElement>('imglib-file').addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file);
      opts.onPick(dataUrl, '');
      close();
    } catch {
      body.innerHTML = `<div class="imglib-empty"><div class="imglib-empty-ic">⚠️</div><h4>No se pudo leer la imagen</h4></div>`;
    }
  });

  // Carga automática de más resultados al llegar al final
  body.addEventListener('scroll', () => {
    if (busy || !hasMore) return;
    if (body.scrollTop + body.clientHeight >= body.scrollHeight - 320) {
      page++;
      void run(false);
    }
  });

  const initial = (opts.initialQuery || '').trim();
  if (initial) searchFor(initial);
  else {
    showSuggestions();
    window.setTimeout(() => input.focus(), 120);
  }

  return { close };
}
