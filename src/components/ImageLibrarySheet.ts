import '../ui/styles/imagelib.css';
import {
  searchLibrary,
  fetchLibraryImageAsDataUrl,
  compressImageFile,
  creditFor,
  type LibraryImage,
  type LibrarySource
} from '../services/image-library.service';

export interface ImageLibraryOptions {
  title?: string;
  /** Texto con el que arrancar la búsqueda (por ejemplo, el anverso de la tarjeta) */
  initialQuery?: string;
  onPick: (dataUrl: string, credit: string) => void;
  onClose?: () => void;
}

const SUGGESTIONS = ['célula', 'anatomía', 'ADN', 'átomo', 'planeta', 'mapa del mundo', 'cerebro', 'volcán', 'circuito', 'mariposa', 'fórmula', 'historia'];

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Limpia el texto de una tarjeta para usarlo como búsqueda (sin markdown, fórmulas ni huecos). */
export function queryFromCardText(text: string): string {
  return (text || '')
    .replace(/\{\{c\d*::([\s\S]*?)(?:::[\s\S]*?)?\}\}/g, '$1')
    .replace(/\$\$?[^$]*\$\$?/g, ' ')
    .replace(/[*_~`#>\[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 5)
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
            <p>Millones de fotos y diagramas gratuitos con licencia abierta</p>
          </div>
        </div>
        <button class="imglib-x" id="imglib-close" aria-label="Cerrar">✕</button>
      </div>

      <form class="imglib-search" id="imglib-form" autocomplete="off">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input id="imglib-q" type="search" inputmode="search" enterkeyhint="search" placeholder="Busca: mitocondria, Revolución Francesa, onda…" />
        <button type="submit" class="imglib-go">Buscar</button>
      </form>

      <div class="imglib-tabs" role="tablist">
        <button class="imglib-tab on" data-src="all" role="tab">✨ Todo</button>
        <button class="imglib-tab" data-src="openverse" role="tab">📷 Fotos</button>
        <button class="imglib-tab" data-src="wikimedia" role="tab">🧬 Diagramas y láminas</button>
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

  let source: LibrarySource | 'all' = 'all';
  let query = '';
  let page = 1;
  let busy = false;
  let hasMore = false;
  let ctrl: AbortController | null = null;
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
    body.innerHTML = `
      <div class="imglib-empty">
        <div class="imglib-empty-ic">🔎</div>
        <h4>¿Qué imagen necesitas?</h4>
        <p>Escribe un concepto o elige uno de estos. Tip: en inglés hay más resultados.</p>
        <div class="imglib-chips">${SUGGESTIONS.map((s) => `<button class="imglib-chip" data-q="${esc(s)}">${esc(s)}</button>`).join('')}</div>
      </div>`;
  };

  const renderSkeleton = () => {
    body.innerHTML = `<div class="imglib-grid">${Array.from({ length: 12 }, () => '<div class="imglib-cell skeleton"></div>').join('')}</div>`;
  };

  const cellHtml = (img: LibraryImage, i: number) => `
    <button class="imglib-cell" data-i="${i}" title="${esc(img.title)} · ${esc(img.creator)}">
      <img src="${esc(img.thumb)}" alt="${esc(img.title)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" />
      <span class="imglib-lic">${esc(img.license)}</span>
      <span class="imglib-spin"></span>
    </button>`;

  const renderItems = () => {
    if (!items.length) {
      body.innerHTML = `<div class="imglib-empty"><div class="imglib-empty-ic">🫥</div><h4>Sin resultados</h4><p>Prueba con otra palabra, en inglés, o cambia de pestaña.</p></div>`;
      return;
    }
    body.innerHTML = `<div class="imglib-grid">${items.map(cellHtml).join('')}</div>${hasMore ? '<button class="imglib-more" id="imglib-more">Cargar más</button>' : ''}`;
  };

  const run = async (reset: boolean) => {
    if (busy && !reset) return;
    if (!query) {
      showSuggestions();
      return;
    }
    ctrl?.abort();
    ctrl = new AbortController();
    busy = true;
    if (reset) {
      page = 1;
      items = [];
      hasMore = false;
      renderSkeleton();
    }
    const myCtrl = ctrl;
    const sources: LibrarySource[] = source === 'all' ? ['wikimedia', 'openverse'] : [source];
    let failed = 0;
    let arrived = 0;
    const seen = new Set(items.map((i) => i.id));
    let more = false;

    // Cada fuente pinta en cuanto responde: Wikimedia suele tardar menos de un segundo, Openverse algo más
    await Promise.all(
      sources.map((src) =>
        searchLibrary(src, query, page, myCtrl.signal)
          .then((res) => {
            if (myCtrl.signal.aborted || closed) return;
            arrived++;
            res.items.forEach((it) => {
              if (!seen.has(it.id)) {
                seen.add(it.id);
                items.push(it);
              }
            });
            more = more || res.hasMore;
            hasMore = more;
            renderItems();
          })
          .catch((e: any) => {
            if (e?.name === 'AbortError') return;
            failed++;
          })
      )
    );
    busy = false;
    if (myCtrl.signal.aborted || closed) return;
    if (arrived === 0 && failed > 0) {
      if (page > 1) {
        hasMore = false;
        page--;
        renderItems();
      } else {
        body.innerHTML = `<div class="imglib-empty"><div class="imglib-empty-ic">📡</div><h4>No se pudo buscar</h4><p>Revisa tu conexión e inténtalo de nuevo.</p><button class="imglib-chip" id="imglib-retry">Reintentar</button></div>`;
      }
    } else if (items.length === 0) {
      renderItems();
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

  // Eventos
  $('imglib-close').addEventListener('click', close);
  root.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t === root) return close();
    const chip = t.closest('.imglib-chip[data-q]') as HTMLElement | null;
    if (chip) {
      input.value = chip.dataset.q || '';
      query = input.value;
      void run(true);
      return;
    }
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
      source = (tab.dataset.src as LibrarySource | 'all') || 'all';
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
    }, 550);
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
    if (body.scrollTop + body.clientHeight >= body.scrollHeight - 240) {
      page++;
      void run(false);
    }
  });

  const initial = (opts.initialQuery || '').trim();
  if (initial) {
    input.value = initial;
    query = initial;
    void run(true);
  } else {
    showSuggestions();
    window.setTimeout(() => input.focus(), 120);
  }

  return { close };
}
