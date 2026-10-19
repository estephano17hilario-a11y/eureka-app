/**
 * Vista de esquema: el mismo mapa como lista jerárquica editable (como un documento).
 * Los cambios se aplican al mapa al terminar de escribir (y siempre al volver a la vista de mapa).
 */

import type { MindMapStudio } from './MindMapStudio';
import { icon } from './icons';
import { makeNode, type MapNodeData } from './templates';
import { stripToPlain } from './richText';
import { dialogService } from '../services/dialog.service';

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export class OutlineView {
  private root: MapNodeData | null = null;
  private dirty = false;
  private timer = 0;

  constructor(private studio: MindMapStudio, private el: HTMLElement) {
    el.addEventListener('input', (e) => this.onInput(e));
    el.addEventListener('keydown', (e) => this.onKey(e));
    el.addEventListener('click', (e) => this.onClick(e));
  }

  public show(): void {
    const data = this.studio.engine.mm.getData(false);
    this.root = JSON.parse(JSON.stringify(data)) as MapNodeData;
    this.dirty = false;
    this.renderList();
    const first = this.el.querySelector('.mmx-ol-input') as HTMLInputElement | null;
    first?.blur();
  }

  /** Aplica los cambios pendientes al mapa */
  public flush(): void {
    window.clearTimeout(this.timer);
    if (!this.dirty || !this.root) return;
    this.dirty = false;
    try {
      this.studio.engine.mm.updateData(JSON.parse(JSON.stringify(this.root)));
    } catch (e) {
      console.warn('[Outline] no se pudo aplicar', e);
    }
  }

  private scheduleCommit(): void {
    this.dirty = true;
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.flush(), 900);
  }

  /* ------------------------------ Render ------------------------------ */
  private renderList(focusUid?: string, caret?: number): void {
    if (!this.root) return;
    const e = this.studio.engine;
    const th = e.theme;
    const rows: string[] = [];
    const walk = (n: MapNodeData, depth: number, color: string) => {
      const d = n.data || {};
      const kids = n.children || [];
      const collapsed = d.expand === false;
      const c = depth === 0 ? th.accent : color;
      rows.push(`
        <div class="mmx-ol-row d${Math.min(depth, 6)} ${depth === 0 ? 'is-root' : ''}" data-uid="${esc(d.uid)}" style="--ol-depth:${depth};--ol-c:${esc(c)}">
          <button class="mmx-ol-caret ${kids.length ? '' : 'empty'}" data-ol="fold" aria-label="${collapsed ? 'Expandir' : 'Contraer'}" aria-expanded="${!collapsed}">${kids.length ? icon(collapsed ? 'caretR' : 'caretD', 14) : ''}</button>
          <span class="mmx-ol-dot"></span>
          ${d.emoji ? `<span class="mmx-ol-emoji">${esc(d.emoji)}</span>` : ''}
          <input class="mmx-ol-input" type="text" value="${esc(stripToPlain(String(d.text ?? '')).replace(/\n/g, ' '))}" placeholder="${depth === 0 ? 'Tema central' : 'Escribe una idea…'}" aria-label="Idea" />
          <span class="mmx-ol-actions">
            <button data-ol="child" aria-label="Añadir idea hija" title="Añadir idea hija">${icon('plus', 15)}</button>
            ${depth > 0 ? `<button data-ol="up" aria-label="Subir" title="Subir">${icon('up', 15)}</button><button data-ol="down" aria-label="Bajar" title="Bajar">${icon('down', 15)}</button><button data-ol="del" class="danger" aria-label="Eliminar" title="Eliminar">${icon('trash', 15)}</button>` : ''}
          </span>
        </div>`);
      if (!collapsed) {
        kids.forEach((k, i) => {
          const nextColor = depth === 0 ? th.palette[i % th.palette.length] : color;
          walk(k, depth + 1, nextColor);
        });
      }
    };
    walk(this.root, 0, th.accent);

    this.el.innerHTML = `
      <div class="mmx-ol-wrap">
        <div class="mmx-ol-head"><h3>Esquema</h3><p>Enter añade una idea · Tab la sangra · Mayús+Tab la saca · ↑ ↓ para moverte</p></div>
        <div class="mmx-ol-list" role="tree">${rows.join('')}</div>
      </div>`;

    if (focusUid) {
      const input = this.el.querySelector(`.mmx-ol-row[data-uid="${CSS.escape(focusUid)}"] .mmx-ol-input`) as HTMLInputElement | null;
      if (input) {
        input.focus({ preventScroll: false });
        const pos = caret ?? input.value.length;
        input.setSelectionRange(pos, pos);
      }
    }
  }

  /* ------------------------------ Datos ------------------------------ */
  private find(uid: string): { node: MapNodeData; parent: MapNodeData | null; index: number } | null {
    if (!this.root) return null;
    const walk = (n: MapNodeData, parent: MapNodeData | null, index: number): { node: MapNodeData; parent: MapNodeData | null; index: number } | null => {
      if (n.data?.uid === uid) return { node: n, parent, index };
      const kids = n.children || [];
      for (let i = 0; i < kids.length; i++) {
        const r = walk(kids[i], n, i);
        if (r) return r;
      }
      return null;
    };
    return walk(this.root, null, 0);
  }

  private uidOf(target: HTMLElement): string {
    return (target.closest('.mmx-ol-row') as HTMLElement | null)?.dataset.uid || '';
  }

  private visibleInputs(): HTMLInputElement[] {
    return Array.from(this.el.querySelectorAll('.mmx-ol-input')) as HTMLInputElement[];
  }

  /* ------------------------------ Eventos ------------------------------ */
  private onInput(e: Event): void {
    const t = e.target as HTMLInputElement;
    if (!t.classList.contains('mmx-ol-input')) return;
    const found = this.find(this.uidOf(t));
    if (!found) return;
    found.node.data.text = t.value;
    this.scheduleCommit();
  }

  private onKey(e: KeyboardEvent): void {
    const t = e.target as HTMLInputElement;
    if (!t.classList?.contains('mmx-ol-input') || e.isComposing) return;
    const uid = this.uidOf(t);
    const found = this.find(uid);
    if (!found) return;
    const { node, parent, index } = found;

    if (e.key === 'Enter') {
      e.preventDefault();
      const fresh = makeNode('');
      if (!parent) {
        node.children = [fresh, ...(node.children || [])];
        node.data.expand = true;
      } else if (node.children?.length && node.data.expand !== false) {
        node.children.unshift(fresh);
      } else {
        parent.children.splice(index + 1, 0, fresh);
      }
      this.scheduleCommit();
      this.renderList(fresh.data.uid);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (!parent) return;
      if (e.shiftKey) {
        const grand = this.find(parent.data.uid);
        if (!grand?.parent) return;
        parent.children.splice(index, 1);
        grand.parent.children.splice(grand.index + 1, 0, node);
      } else {
        if (index === 0) return;
        const prev = parent.children[index - 1];
        parent.children.splice(index, 1);
        prev.children = prev.children || [];
        prev.children.push(node);
        prev.data.expand = true;
      }
      this.scheduleCommit();
      this.renderList(uid, t.selectionStart ?? undefined);
    } else if (e.key === 'Backspace' && t.value === '' && parent && !(node.children?.length)) {
      e.preventDefault();
      const inputs = this.visibleInputs();
      const i = inputs.indexOf(t);
      parent.children.splice(index, 1);
      this.scheduleCommit();
      const prevUid = i > 0 ? this.uidOf(inputs[i - 1]) : '';
      this.renderList(prevUid || undefined);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const inputs = this.visibleInputs();
      const i = inputs.indexOf(t) + (e.key === 'ArrowUp' ? -1 : 1);
      if (inputs[i]) {
        e.preventDefault();
        inputs[i].focus();
        inputs[i].setSelectionRange(inputs[i].value.length, inputs[i].value.length);
      }
    } else if (e.key === 'Escape') {
      t.blur();
    }
  }

  private onClick(e: MouseEvent): void {
    const b = (e.target as HTMLElement).closest('[data-ol]') as HTMLElement | null;
    if (!b) return;
    const uid = this.uidOf(b);
    const found = this.find(uid);
    if (!found) return;
    const { node, parent, index } = found;

    switch (b.dataset.ol) {
      case 'fold':
        node.data.expand = node.data.expand === false;
        this.scheduleCommit();
        this.renderList();
        break;
      case 'child': {
        const fresh = makeNode('');
        node.children = node.children || [];
        node.children.push(fresh);
        node.data.expand = true;
        this.scheduleCommit();
        this.renderList(fresh.data.uid);
        break;
      }
      case 'up':
        if (parent && index > 0) {
          parent.children.splice(index, 1);
          parent.children.splice(index - 1, 0, node);
          this.scheduleCommit();
          this.renderList(uid);
        }
        break;
      case 'down':
        if (parent && index < parent.children.length - 1) {
          parent.children.splice(index, 1);
          parent.children.splice(index + 1, 0, node);
          this.scheduleCommit();
          this.renderList(uid);
        }
        break;
      case 'del': {
        if (!parent) return;
        const remove = () => {
          parent.children.splice(index, 1);
          this.scheduleCommit();
          this.renderList();
        };
        const count = (n: MapNodeData): number => (n.children || []).reduce((s, c) => s + 1 + count(c), 0);
        const extra = count(node);
        if (extra === 0 && !String(node.data.text || '').trim()) return remove();
        dialogService.showConfirm({
          title: '¿Estás seguro?',
          message: `Vas a eliminar «${esc(stripToPlain(String(node.data.text || 'Idea sin texto')).slice(0, 60))}»${extra ? ` y ${extra} ${extra === 1 ? 'idea' : 'ideas'} dentro de ella` : ''}.`,
          confirmText: 'Sí, eliminar',
          isDanger: true,
          onConfirm: remove
        });
        break;
      }
    }
  }
}
