import '../ui/styles/deck-insights.css';
import type { Deck, Flashcard } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { srsService } from '../services/srs.service';
import { studyStats, formatDuration } from '../services/study-stats.service';

/**
 * Herramientas del panel de un mazo: insignias de cada tarjeta, filtros y orden,
 * estadísticas (racha, actividad, previsión) y el lanzador de modos de estudio.
 */

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export type StudyMethod = 'flip' | 'quiz' | 'type';

export interface StudyLaunch {
  cardIds: string[];
  method: StudyMethod;
  /** Práctica libre: las respuestas no cambian el calendario de repasos */
  practice: boolean;
  label: string;
}

/** Tarjeta "difícil": se ha fallado varias veces o su facilidad ha caído mucho */
export const isHardCard = (c: Flashcard): boolean => (c.lapses || 0) >= 3 || ((c.reps || 0) >= 3 && (c.easeFactor || 2.5) < 2.0);

const stateOf = (c: Flashcard): 'new' | 'learning' | 'review' => (c.state === 'new' ? 'new' : c.state === 'review' || c.intervalMinutes >= 10080 ? 'review' : 'learning');

function dueLabel(c: Flashcard, now: number): string {
  if (c.archived) return 'Archivada';
  if (c.suspended) return 'Pausada';
  if (c.buriedUntil && c.buriedUntil > now) return 'Pospuesta a mañana';
  if (c.state === 'new') return 'Nueva';
  const diff = c.dueDate - now;
  if (diff <= 0) return 'Para hoy';
  return `En ${srsService.formatMinutesToHuman(diff / 60000)}`;
}

/* -------------------------------------------------------------------------- */
/*  Insignias y atributos de cada tarjeta                                      */
/* -------------------------------------------------------------------------- */

export function cardDataAttrs(c: Flashcard): string {
  const tags = (c.tags || []).join('|');
  return `data-st="${stateOf(c)}" data-due="${c.dueDate}" data-created="${c.createdAt}" data-lapses="${c.lapses || 0}" data-ease="${c.easeFactor || 2.5}" data-star="${c.starred ? 1 : 0}" data-susp="${c.suspended ? 1 : 0}" data-arch="${c.archived ? 1 : 0}" data-hard="${isHardCard(c) ? 1 : 0}" data-buried="${c.buriedUntil && c.buriedUntil > Date.now() ? 1 : 0}" data-tags="|${esc(tags)}|"`;
}

export function cardBadgesHtml(c: Flashcard): string {
  const now = Date.now();
  const st = stateOf(c);
  const due = c.dueDate <= now && !c.suspended && st !== 'new';
  const bits: string[] = [];
  bits.push(`<span class="dk-badge st-${c.suspended ? 'susp' : due ? 'due' : st}">${dueLabel(c, now)}</span>`);
  if (c.starred) bits.push('<span class="dk-badge star" title="Favorita">⭐</span>');
  if (isHardCard(c)) bits.push(`<span class="dk-badge hard" title="Fallada ${c.lapses || 0} veces">🔥 Difícil</span>`);
  if (c.hint) bits.push('<span class="dk-badge" title="Tiene pista">💡</span>');
  (c.tags || []).slice(0, 4).forEach((t) => bits.push(`<span class="dk-badge tag">#${esc(t)}</span>`));
  if ((c.tags || []).length > 4) bits.push(`<span class="dk-badge tag">+${(c.tags as string[]).length - 4}</span>`);
  return `<div class="dk-badges">${bits.join('')}</div>`;
}

/* -------------------------------------------------------------------------- */
/*  Filtros y orden                                                            */
/* -------------------------------------------------------------------------- */

interface FilterState {
  filter: string;
  sort: string;
  tag: string;
  query: string;
}
const filterMemory = new Map<string, FilterState>();
const stateFor = (deckId: string): FilterState => {
  let s = filterMemory.get(deckId);
  if (!s) {
    s = { filter: 'all', sort: 'recent', tag: '', query: '' };
    filterMemory.set(deckId, s);
  }
  return s;
};

export function deckFilterBarHtml(deck: Deck): string {
  const everything = deckService.getCardsByDeck(deck.id, true);
  const cards = everything.filter((c) => !c.archived);
  const now = Date.now();
  const st = stateFor(deck.id);
  const n = {
    all: cards.length,
    due: cards.filter((c) => c.dueDate <= now && deckService.isStudyable(c, now)).length,
    new: cards.filter((c) => c.state === 'new').length,
    learning: cards.filter((c) => stateOf(c) === 'learning').length,
    review: cards.filter((c) => stateOf(c) === 'review').length,
    star: cards.filter((c) => c.starred).length,
    hard: cards.filter(isHardCard).length,
    susp: cards.filter((c) => c.suspended).length,
    arch: everything.length - cards.length
  };
  const chip = (id: string, label: string, count: number, hideEmpty = false) =>
    hideEmpty && !count && st.filter !== id ? '' : `<button type="button" class="dk-chip ${st.filter === id ? 'on' : ''}" data-filter="${id}">${label}<i>${count}</i></button>`;
  const tags = deckService.getDeckTags(deck.id);
  const opt = (v: string, l: string) => `<option value="${v}" ${st.sort === v ? 'selected' : ''}>${l}</option>`;
  return `
    <div class="dk-filters" id="dk-filters">
      <div class="dk-chips" role="tablist" aria-label="Filtrar tarjetas">
        ${chip('all', 'Todas', n.all)}
        ${chip('due', 'Para hoy', n.due)}
        ${chip('new', 'Nuevas', n.new)}
        ${chip('learning', 'Aprendiendo', n.learning)}
        ${chip('review', 'Dominadas', n.review)}
        ${chip('star', '⭐ Favoritas', n.star, true)}
        ${chip('hard', '🔥 Difíciles', n.hard, true)}
        ${chip('susp', '⏸ Pausadas', n.susp, true)}
        ${chip('arch', '📦 Archivadas', n.arch, true)}
      </div>
      <label class="dk-sort" title="Ordenar tarjetas">
        <span>Orden</span>
        <select id="dk-sort">
          ${opt('recent', 'Más recientes')}
          ${opt('oldest', 'Más antiguas')}
          ${opt('due', 'Próximo repaso')}
          ${opt('hard', 'Más difíciles')}
          ${opt('az', 'A → Z')}
        </select>
      </label>
    </div>
    ${
      tags.length
        ? `<div class="dk-tags" id="dk-tags">${tags
            .map((t) => `<button type="button" class="dk-tagchip ${st.tag === t.tag ? 'on' : ''}" data-tag="${esc(t.tag)}">#${esc(t.tag)}<i>${t.count}</i></button>`)
            .join('')}</div>`
        : ''
    }
    <div class="dk-noresults" id="dk-noresults" hidden>Ninguna tarjeta coincide con el filtro. <button type="button" id="dk-clear">Quitar filtros</button></div>`;
}

export function bindDeckFilters(container: HTMLElement, deck: Deck): void {
  const st = stateFor(deck.id);
  const mount = container.querySelector('#dash-cards-list-mount') as HTMLElement | null;
  const search = container.querySelector('#dash-search-input') as HTMLInputElement | null;
  const empty = container.querySelector('#dk-noresults') as HTMLElement | null;
  if (!mount) return;
  if (search && st.query) search.value = st.query;

  const unitOf = (el: HTMLElement): HTMLElement => (el.closest('.figma-card-stacked-wrapper') as HTMLElement | null) || el;

  const apply = () => {
    const now = Date.now();
    const q = st.query.toLowerCase();
    let shown = 0;
    const items = Array.from(mount.querySelectorAll<HTMLElement>('.selectable-card-target'));
    for (const el of items) {
      const d = el.dataset;
      let ok = st.filter === 'arch' ? d.arch === '1' : d.arch !== '1';
      if (ok) switch (st.filter) {
        case 'due':
          ok = Number(d.due) <= now && d.susp !== '1' && d.buried !== '1';
          break;
        case 'new':
        case 'learning':
        case 'review':
          ok = d.st === st.filter;
          break;
        case 'star':
          ok = d.star === '1';
          break;
        case 'hard':
          ok = d.hard === '1';
          break;
        case 'susp':
          ok = d.susp === '1';
          break;
      }
      if (ok && st.tag) ok = (d.tags || '').includes(`|${st.tag}|`);
      if (ok && q) ok = (el.textContent || '').toLowerCase().includes(q);
      unitOf(el).style.display = ok ? '' : 'none';
      if (ok) shown++;
    }
    if (empty) empty.hidden = shown > 0 || items.length === 0;
  };

  const sort = () => {
    const units = Array.from(new Set(Array.from(mount.querySelectorAll<HTMLElement>('.selectable-card-target')).map(unitOf)));
    if (units.length < 2) return;
    const key = (u: HTMLElement): HTMLElement => (u.matches('.selectable-card-target') ? u : (u.querySelector('.selectable-card-target') as HTMLElement)) || u;
    const num = (u: HTMLElement, f: string) => Number(key(u).dataset[f] || 0);
    const cmp: Record<string, (a: HTMLElement, b: HTMLElement) => number> = {
      recent: (a, b) => num(b, 'created') - num(a, 'created'),
      oldest: (a, b) => num(a, 'created') - num(b, 'created'),
      due: (a, b) => num(a, 'due') - num(b, 'due'),
      hard: (a, b) => num(b, 'lapses') - num(a, 'lapses') || num(a, 'ease') - num(b, 'ease'),
      az: (a, b) => (a.textContent || '').trim().localeCompare((b.textContent || '').trim(), 'es')
    };
    units.sort(cmp[st.sort] || cmp.recent);
    const frag = document.createDocumentFragment();
    units.forEach((u) => frag.appendChild(u));
    mount.appendChild(frag);
  };

  const syncChips = () => {
    container.querySelectorAll<HTMLElement>('.dk-chip').forEach((b) => b.classList.toggle('on', b.dataset.filter === st.filter));
    container.querySelectorAll<HTMLElement>('.dk-tagchip').forEach((b) => b.classList.toggle('on', b.dataset.tag === st.tag));
  };

  container.querySelector('#dk-filters')?.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('[data-filter]') as HTMLElement | null;
    if (!b) return;
    st.filter = b.dataset.filter || 'all';
    syncChips();
    apply();
  });
  container.querySelector('#dk-tags')?.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('[data-tag]') as HTMLElement | null;
    if (!b) return;
    st.tag = st.tag === b.dataset.tag ? '' : b.dataset.tag || '';
    syncChips();
    apply();
  });
  (container.querySelector('#dk-sort') as HTMLSelectElement | null)?.addEventListener('change', (e) => {
    st.sort = (e.target as HTMLSelectElement).value;
    sort();
  });
  let t = 0;
  search?.addEventListener('input', () => {
    window.clearTimeout(t);
    t = window.setTimeout(() => {
      st.query = search.value.trim();
      apply();
    }, 120);
  });
  container.querySelector('#dk-clear')?.addEventListener('click', () => {
    st.filter = 'all';
    st.tag = '';
    st.query = '';
    if (search) search.value = '';
    syncChips();
    apply();
  });

  if (st.sort !== 'recent') sort();
  apply();
}

/* -------------------------------------------------------------------------- */
/*  Ventanas                                                                   */
/* -------------------------------------------------------------------------- */

function openSheet(title: string, bodyHtml: string, wide = false): { el: HTMLElement; close: () => void } {
  document.getElementById('dk-sheet')?.remove();
  const el = document.createElement('div');
  el.id = 'dk-sheet';
  el.className = 'apple-modal-overlay dk-overlay';
  el.innerHTML = `
    <div class="dk-sheet ${wide ? 'wide' : ''}" role="dialog" aria-label="${esc(title)}">
      <header class="dk-sheet-head"><h3>${title}</h3><button type="button" class="dk-x" data-close aria-label="Cerrar">✕</button></header>
      <div class="dk-sheet-body">${bodyHtml}</div>
    </div>`;
  document.body.appendChild(el);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
  };
  const close = () => {
    el.remove();
    window.removeEventListener('keydown', onKey);
  };
  window.addEventListener('keydown', onKey);
  el.addEventListener('click', (e) => {
    if (e.target === el || (e.target as HTMLElement).closest('[data-close]')) close();
  });
  return { el, close };
}

/** Pide una etiqueta (con sugerencias del mazo) y devuelve el texto elegido */
export function askTag(deck: Deck, onPick: (tag: string, remove: boolean) => void): void {
  const tags = deckService.getDeckTags(deck.id);
  const { el, close } = openSheet(
    '🏷️ Etiquetar tarjetas',
    `<p class="dk-p">Escribe una etiqueta nueva o elige una del mazo. Sirven para filtrar y estudiar por temas.</p>
     <input type="text" class="dk-input" id="dk-tag-new" placeholder="tema, examen-1, capítulo-3…" autocomplete="off" autocapitalize="off" maxlength="32" />
     ${tags.length ? `<div class="dk-tags inl">${tags.map((t) => `<button type="button" class="dk-tagchip" data-pick="${esc(t.tag)}">#${esc(t.tag)}<i>${t.count}</i></button>`).join('')}</div>` : ''}
     <div class="dk-row-btns">
       <button type="button" class="dk-btn ghost" id="dk-tag-remove">Quitar etiqueta</button>
       <button type="button" class="dk-btn pri" id="dk-tag-add">Añadir etiqueta</button>
     </div>`
  );
  const input = el.querySelector('#dk-tag-new') as HTMLInputElement;
  window.setTimeout(() => input.focus(), 40);
  const done = (remove: boolean) => {
    const v = input.value.trim();
    if (!v) return input.focus();
    close();
    onPick(v, remove);
  };
  el.querySelectorAll<HTMLElement>('[data-pick]').forEach((b) => b.addEventListener('click', () => (input.value = b.dataset.pick || '')));
  input.addEventListener('keydown', (e) => e.key === 'Enter' && done(false));
  el.querySelector('#dk-tag-add')?.addEventListener('click', () => done(false));
  el.querySelector('#dk-tag-remove')?.addEventListener('click', () => done(true));
}

export function openDeckStats(deck: Deck): void {
  const cards = deckService.getCardsByDeck(deck.id, true);
  const now = Date.now();
  const streak = studyStats.streak();
  const today = studyStats.today();
  const month = studyStats.lastDays(30);
  const m = month.reduce((a, d) => ({ n: a.n + d.log.n, ok: a.ok + d.log.g + d.log.e, a: a.a + d.log.a, h: a.h + d.log.h, g: a.g + d.log.g, e: a.e + d.log.e, ms: a.ms + d.log.ms }), { n: 0, ok: 0, a: 0, h: 0, g: 0, e: 0, ms: 0 });
  const acc = m.n ? Math.round((m.ok / m.n) * 100) : 0;

  // Estado del mazo
  const cNew = cards.filter((c) => c.state === 'new').length;
  const cSusp = cards.filter((c) => c.suspended).length;
  const cReview = cards.filter((c) => stateOf(c) === 'review').length;
  const cLearn = cards.length - cNew - cReview;
  const total = Math.max(1, cards.length);
  const seen = cards.filter((c) => (c.reps || 0) > 0);
  const avgEase = seen.length ? seen.reduce((s, c) => s + (c.easeFactor || 2.5), 0) / seen.length : 2.5;
  const mature = cards.filter((c) => c.intervalMinutes >= 21 * 1440).length;

  // Mapa de actividad: 17 semanas, columnas = semanas (lunes arriba)
  const days = studyStats.lastDays(119);
  const offset = (days[0].date.getDay() + 6) % 7;
  const max = Math.max(1, ...days.map((d) => d.log.n));
  const cells: string[] = new Array(offset).fill('<i class="pad"></i>');
  days.forEach((d) => {
    const lvl = d.log.n === 0 ? 0 : Math.min(4, 1 + Math.floor((d.log.n / max) * 3.999));
    cells.push(`<i class="l${lvl}" title="${d.date.toLocaleDateString('es', { day: 'numeric', month: 'short' })}: ${d.log.n} repasos"></i>`);
  });

  // Previsión de carga
  const fc = studyStats.forecast(cards, 14);
  const fmax = Math.max(1, ...fc);
  const dayNames = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  const bars = fc
    .map((v, i) => {
      const d = new Date(now + i * 86400000);
      return `<div class="dk-bar" title="${v} tarjetas"><b style="height:${Math.max(3, Math.round((v / fmax) * 100))}%" class="${i === 0 ? 'today' : ''}"></b><span>${v || ''}</span><small>${i === 0 ? 'Hoy' : dayNames[d.getDay()]}</small></div>`;
    })
    .join('');

  const hardest = cards
    .filter((c) => (c.lapses || 0) > 0)
    .sort((a, b) => (b.lapses || 0) - (a.lapses || 0))
    .slice(0, 5);
  const plain = (t: string) => t.replace(/\{\{c\d*::([\s\S]*?)(?:::[\s\S]*?)?\}\}/g, '$1').replace(/[$*_#`]/g, '').slice(0, 70);
  const pct = (v: number) => `${Math.round((v / total) * 100)}%`;
  const ratingTotal = Math.max(1, m.a + m.h + m.g + m.e);

  openSheet(
    `📊 Estadísticas · ${esc(deck.name)}`,
    `
    <div class="dk-kpis">
      <div class="dk-kpi"><b>🔥 ${streak.current}</b><span>días de racha</span><small>Mejor: ${streak.best}</small></div>
      <div class="dk-kpi"><b>${today.n}</b><span>repasos hoy</span><small>${today.ms ? formatDuration(today.ms) : 'sin tiempo aún'}</small></div>
      <div class="dk-kpi"><b>${acc}%</b><span>aciertos (30 días)</span><small>${m.n} repasos</small></div>
      <div class="dk-kpi"><b>${cards.length}</b><span>tarjetas</span><small>${mature} maduras (+21 d)</small></div>
    </div>

    <section class="dk-sec">
      <h4>Actividad de las últimas 17 semanas</h4>
      <div class="dk-heat">${cells.join('')}</div>
      <div class="dk-heat-legend"><span>Menos</span><i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i><span>Más</span></div>
    </section>

    <section class="dk-sec">
      <h4>Tarjetas que vencen los próximos 14 días</h4>
      <div class="dk-bars">${bars}</div>
    </section>

    <section class="dk-sec">
      <h4>Estado del mazo</h4>
      <div class="dk-stack">
        <b class="s-new" style="width:${pct(cNew)}"></b><b class="s-learn" style="width:${pct(Math.max(0, cLearn))}"></b><b class="s-rev" style="width:${pct(cReview)}"></b>
      </div>
      <div class="dk-legend">
        <span><i class="s-new"></i>${cNew} nuevas</span><span><i class="s-learn"></i>${Math.max(0, cLearn)} aprendiendo</span><span><i class="s-rev"></i>${cReview} dominadas</span>${cSusp ? `<span>⏸ ${cSusp} pausadas</span>` : ''}
      </div>
      <p class="dk-p">Facilidad media: <b>${avgEase.toFixed(2)}</b> ${avgEase < 2.1 ? '— el mazo te está costando; prueba tarjetas más cortas o añade pistas.' : avgEase > 2.6 ? '— lo llevas muy bien.' : ''}</p>
    </section>

    <section class="dk-sec">
      <h4>Tus respuestas (30 días)</h4>
      <div class="dk-stack">
        <b class="r-again" style="width:${(m.a / ratingTotal) * 100}%"></b><b class="r-hard" style="width:${(m.h / ratingTotal) * 100}%"></b><b class="r-good" style="width:${(m.g / ratingTotal) * 100}%"></b><b class="r-easy" style="width:${(m.e / ratingTotal) * 100}%"></b>
      </div>
      <div class="dk-legend">
        <span><i class="r-again"></i>${m.a} de nuevo</span><span><i class="r-hard"></i>${m.h} difícil</span><span><i class="r-good"></i>${m.g} bien</span><span><i class="r-easy"></i>${m.e} fácil</span>
      </div>
      <p class="dk-p">Tiempo de estudio en 30 días: <b>${formatDuration(m.ms)}</b></p>
    </section>

    ${
      hardest.length
        ? `<section class="dk-sec"><h4>Las que más se te resisten</h4><ol class="dk-hardest">${hardest
            .map((c) => `<li><span>${esc(plain(c.front) || 'Tarjeta con imagen')}</span><b>${c.lapses}× fallada</b></li>`)
            .join('')}</ol></section>`
        : ''
    }
    <p class="dk-note">La racha, la actividad y el tiempo se registran en este dispositivo a partir de ahora.</p>`,
    true
  );
}

/** Lanzador: qué tarjetas estudiar, cómo y cuántas */
export function openStudyLauncher(deck: Deck, onStart: (launch: StudyLaunch) => void): void {
  const all = deckService.getCardsByDeck(deck.id, true).filter((c) => !c.suspended);
  const now = Date.now();
  const sets: Record<string, { label: string; desc: string; icon: string; cards: Flashcard[]; practice: boolean }> = {
    due: { icon: '🧠', label: 'Repaso de hoy', desc: 'Lo que toca según el repaso espaciado', cards: all.filter((c) => c.dueDate <= now && deckService.isStudyable(c, now)), practice: false },
    all: { icon: '📚', label: 'Todo el mazo', desc: 'Repaso general antes de un examen', cards: all, practice: true },
    star: { icon: '⭐', label: 'Favoritas', desc: 'Solo las que marcaste', cards: all.filter((c) => c.starred), practice: true },
    hard: { icon: '🔥', label: 'Difíciles', desc: 'Las que más has fallado', cards: all.filter(isHardCard), practice: true },
    new: { icon: '🆕', label: 'Nuevas', desc: 'Las que aún no has visto', cards: all.filter((c) => c.state === 'new'), practice: false },
    failed: { icon: '↩️', label: 'Falladas alguna vez', desc: 'Con al menos un «De nuevo»', cards: all.filter((c) => (c.lapses || 0) > 0), practice: true }
  };
  const tags = deckService.getDeckTags(deck.id);
  let setId = sets.due.cards.length ? 'due' : 'all';
  let tag = '';
  let method: StudyMethod = 'flip';
  let limit = 0;
  let order = 'smart';
  let practice = sets[setId].practice;

  const { el, close } = openSheet(
    '🎯 Modos de estudio',
    `
    <h4 class="dk-h">¿Qué quieres estudiar?</h4>
    <div class="dk-sets" id="dk-sets">
      ${Object.entries(sets)
        .map(([id, s]) => `<button type="button" class="dk-set" data-set="${id}" ${s.cards.length ? '' : 'disabled'}><span class="ic">${s.icon}</span><span class="tx"><b>${s.label}</b><small>${s.desc}</small></span><i>${s.cards.length}</i></button>`)
        .join('')}
    </div>
    ${tags.length ? `<h4 class="dk-h">O por etiqueta</h4><div class="dk-tags inl" id="dk-l-tags">${tags.map((t) => `<button type="button" class="dk-tagchip" data-tag="${esc(t.tag)}">#${esc(t.tag)}<i>${t.count}</i></button>`).join('')}</div>` : ''}

    <h4 class="dk-h">¿Cómo?</h4>
    <div class="dk-seg" id="dk-method">
      <button type="button" data-v="flip"><b>🃏 Voltear</b><small>Clásico</small></button>
      <button type="button" data-v="quiz"><b>🔘 Opción múltiple</b><small>Elige la respuesta</small></button>
      <button type="button" data-v="type"><b>⌨️ Escribir</b><small>Teclea la respuesta</small></button>
    </div>

    <div class="dk-two">
      <div><h4 class="dk-h">Cantidad</h4><div class="dk-seg sm" id="dk-limit"><button type="button" data-v="10">10</button><button type="button" data-v="20">20</button><button type="button" data-v="50">50</button><button type="button" data-v="0">Todas</button></div></div>
      <div><h4 class="dk-h">Orden</h4><div class="dk-seg sm" id="dk-order"><button type="button" data-v="smart">Recomendado</button><button type="button" data-v="random">Aleatorio</button><button type="button" data-v="hard">Difíciles 1.º</button></div></div>
    </div>

    <label class="dk-check"><input type="checkbox" id="dk-practice" /><span><b>Práctica libre</b><small>Las respuestas no cambian tu calendario de repasos</small></span></label>

    <button type="button" class="dk-btn pri big" id="dk-start">Empezar</button>`
  );

  const pool = (): Flashcard[] => (tag ? all.filter((c) => (c.tags || []).includes(tag)) : sets[setId].cards);
  const refresh = () => {
    el.querySelectorAll<HTMLElement>('[data-set]').forEach((b) => b.classList.toggle('on', !tag && b.dataset.set === setId));
    el.querySelectorAll<HTMLElement>('#dk-l-tags [data-tag]').forEach((b) => b.classList.toggle('on', b.dataset.tag === tag));
    const seg = (id: string, v: string) => el.querySelectorAll<HTMLElement>(`#${id} button`).forEach((b) => b.classList.toggle('on', b.dataset.v === v));
    seg('dk-method', method);
    seg('dk-limit', String(limit));
    seg('dk-order', order);
    (el.querySelector('#dk-practice') as HTMLInputElement).checked = practice;
    const n = pool().length;
    const count = limit ? Math.min(limit, n) : n;
    const start = el.querySelector('#dk-start') as HTMLButtonElement;
    start.disabled = count === 0;
    start.textContent = count ? `Empezar · ${count} tarjeta${count === 1 ? '' : 's'}` : 'No hay tarjetas en esta selección';
  };

  el.querySelector('#dk-sets')?.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('[data-set]') as HTMLButtonElement | null;
    if (!b || b.disabled) return;
    setId = b.dataset.set as string;
    tag = '';
    practice = sets[setId].practice;
    refresh();
  });
  el.querySelector('#dk-l-tags')?.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('[data-tag]') as HTMLElement | null;
    if (!b) return;
    tag = tag === b.dataset.tag ? '' : b.dataset.tag || '';
    if (tag) practice = true;
    refresh();
  });
  const bindSeg = (id: string, set: (v: string) => void) =>
    el.querySelector(`#${id}`)?.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest('[data-v]') as HTMLElement | null;
      if (!b) return;
      set(b.dataset.v as string);
      refresh();
    });
  bindSeg('dk-method', (v) => (method = v as StudyMethod));
  bindSeg('dk-limit', (v) => (limit = Number(v)));
  bindSeg('dk-order', (v) => (order = v));
  el.querySelector('#dk-practice')?.addEventListener('change', (e) => (practice = (e.target as HTMLInputElement).checked));

  el.querySelector('#dk-start')?.addEventListener('click', () => {
    let list = pool().slice();
    if (order === 'random' || (order === 'smart' && deck.settings.mixCards)) list.sort(() => Math.random() - 0.5);
    else if (order === 'hard') list.sort((a, b) => (b.lapses || 0) - (a.lapses || 0) || (a.easeFactor || 2.5) - (b.easeFactor || 2.5));
    else list.sort((a, b) => a.dueDate - b.dueDate);
    if (limit) list = list.slice(0, limit);
    if (!list.length) return;
    close();
    onStart({ cardIds: list.map((c) => c.id), method, practice, label: tag ? `#${tag}` : sets[setId].label });
  });

  refresh();
}
