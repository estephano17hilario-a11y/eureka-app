/**
 * Modo "Ordenar": cada fila muestra un asa (⠿) y se arrastra con el dedo o el ratón.
 * Mientras se arrastra, la fila cambia de sitio al cruzar a sus vecinas; al soltar se devuelve el orden final.
 */

let reorderOn = false;

export const isReorderMode = (): boolean => reorderOn;
export const setReorderMode = (on: boolean): void => {
  reorderOn = on;
};

/** Asa de arrastre para colocar dentro de la fila. */
export const DRAG_HANDLE_HTML =
  '<span class="dk-drag-handle" role="button" aria-label="Arrastrar para reordenar" title="Arrastra para reordenar">' +
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.7"/><circle cx="15" cy="6" r="1.7"/><circle cx="9" cy="12" r="1.7"/><circle cx="15" cy="12" r="1.7"/><circle cx="9" cy="18" r="1.7"/><circle cx="15" cy="18" r="1.7"/></svg></span>';

/** Botón de la cabecera que activa/desactiva el modo. */
export function reorderToggleHtml(active: boolean, id = 'btn-toggle-reorder'): string {
  return `<button class="figma-btn-white-pill dk-reorder-toggle${active ? ' on' : ''}" id="${id}" title="Ordenar" aria-label="Ordenar" style="display:flex; align-items:center; gap:6px; font-weight:700;">
      ${
        active
          ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg><span>Listo</span>'
          : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M7 4v16M7 4 3.5 7.5M7 4l3.5 3.5M17 20V4M17 20l-3.5-3.5M17 20l3.5-3.5"/></svg><span class="dk-rt-label">Ordenar</span>'
      }
    </button>`;
}

/**
 * @param rows   filas hermanas (mismo contenedor) en su orden actual
 * @param idOf   cómo obtener el id de cada fila
 * @param onDone recibe los ids en el nuevo orden (solo si cambió)
 */
export function bindReorder(rows: HTMLElement[], idOf: (row: HTMLElement) => string | undefined, onDone: (ids: string[]) => void): void {
  if (rows.length === 0) return;
  const parent = rows[0].parentElement as HTMLElement;

  rows.forEach((row) => {
    const handle = row.querySelector<HTMLElement>('.dk-drag-handle');
    if (!handle) return;

    handle.addEventListener('pointerdown', (e: PointerEvent) => {
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const before = idsOf();
      handle.setPointerCapture(e.pointerId);
      row.classList.add('dk-dragging');
      let raf = 0;
      let lastY = e.clientY;

      const move = (ev: PointerEvent) => {
        lastY = ev.clientY;
        place(ev.clientY);
      };

      // Cambia la fila de sitio cuando el puntero pasa de la mitad de una vecina
      const place = (y: number) => {
        const sibs = Array.from(parent.querySelectorAll<HTMLElement>(':scope > [data-reorder-row]')).filter((r) => r !== row);
        for (const sib of sibs) {
          const rect = sib.getBoundingClientRect();
          const mid = rect.top + rect.height / 2;
          const rowRect = row.getBoundingClientRect();
          if (rowRect.top < rect.top && y > mid) {
            sib.after(row);
            break;
          }
          if (rowRect.top > rect.top && y < mid) {
            sib.before(row);
            break;
          }
        }
      };

      // Desplazamiento automático al acercarse a los bordes de la pantalla
      const autoScroll = () => {
        const edge = 90;
        const h = window.innerHeight;
        let dy = 0;
        if (lastY < edge) dy = -Math.ceil((edge - lastY) / 6);
        else if (lastY > h - edge - 70) dy = Math.ceil((lastY - (h - edge - 70)) / 6);
        if (dy) {
          const scroller = findScroller(parent);
          if (scroller) scroller.scrollTop += dy;
          else window.scrollBy(0, dy);
          place(lastY);
        }
        raf = requestAnimationFrame(autoScroll);
      };
      raf = requestAnimationFrame(autoScroll);

      const end = () => {
        cancelAnimationFrame(raf);
        row.classList.remove('dk-dragging');
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', end);
        handle.removeEventListener('pointercancel', end);
        const after = idsOf();
        if (after.join('|') !== before.join('|')) onDone(after);
      };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', end);
      handle.addEventListener('pointercancel', end);
    });
  });

  function idsOf(): string[] {
    return Array.from(parent.querySelectorAll<HTMLElement>(':scope > [data-reorder-row]'))
      .map((r) => idOf(r))
      .filter((x): x is string => !!x);
  }
}

function findScroller(el: HTMLElement | null): HTMLElement | null {
  let n = el;
  while (n && n !== document.body) {
    const oy = getComputedStyle(n).overflowY;
    if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight + 4) return n;
    n = n.parentElement;
  }
  return null;
}
