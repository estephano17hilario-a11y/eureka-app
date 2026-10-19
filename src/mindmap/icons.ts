/** Iconos de línea (24×24, trazo currentColor) usados por el estudio de mapas mentales. */

const wrap = (body: string, size = 20): string =>
  `<svg class="mmx-ico" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

const P: Record<string, string> = {
  back: '<path d="M15 5l-7 7 7 7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>',
  redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 000 12h3"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  child: '<rect x="3" y="9" width="7" height="6" rx="1.5"/><path d="M10 12h4"/><rect x="14" y="5" width="7" height="5" rx="1.5"/><rect x="14" y="14" width="7" height="5" rx="1.5"/><path d="M14 12v-4.5M14 12v4.5"/>',
  sibling: '<rect x="4" y="4" width="9" height="6" rx="1.5"/><rect x="4" y="14" width="9" height="6" rx="1.5" stroke-dasharray="3 2.2"/><path d="M18 7v10M15.5 14.5L18 17l2.5-2.5"/>',
  parent: '<rect x="3" y="9" width="7" height="6" rx="1.5"/><path d="M10 12h3"/><rect x="13" y="9" width="8" height="6" rx="1.5"/><path d="M17 5V9M15 7l2-2 2 2"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
  palette: '<path d="M12 3a9 9 0 100 18c1.4 0 2-1 1.6-2.1-.4-1.2.3-2.4 1.6-2.4H17a4 4 0 004-4c0-5-4-9.5-9-9.5z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="1.7"/><path d="M21 16l-5-5-8 8"/>',
  note: '<path d="M5 4h14v12l-4 4H5z"/><path d="M15 20v-4h4"/><path d="M8 9h8M8 13h5"/>',
  link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3A4 4 0 0011 18.7l1-1"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  fit: '<path d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
  layout: '<rect x="3" y="4" width="7" height="6" rx="1.5"/><rect x="14" y="4" width="7" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/>',
  theme: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M12 3a9 9 0 010 18" fill="currentColor" stroke="none" opacity=".35"/>',
  template: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  outline: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
  map: '<circle cx="12" cy="12" r="3"/><circle cx="4.5" cy="5.5" r="1.8"/><circle cx="19.5" cy="5.5" r="1.8"/><circle cx="4.5" cy="18.5" r="1.8"/><circle cx="19.5" cy="18.5" r="1.8"/><path d="M6 7l4.2 3.4M18 7l-4.2 3.4M6 17l4.2-3.4M18 17l-4.2-3.4"/>',
  present: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 21l4-5 4 5M12 16v-0"/>',
  export: '<path d="M12 15V3M8 7l4-4 4 4"/><path d="M5 12v7h14v-7"/>',
  import: '<path d="M12 3v12M8 11l4 4 4-4"/><path d="M5 17v3h14v-3"/>',
  check: '<path d="M5 12.5l4.2 4.2L19 7"/>',
  emoji: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.2a4 4 0 007 0"/><circle cx="9" cy="10" r=".8" fill="currentColor"/><circle cx="15" cy="10" r=".8" fill="currentColor"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
  card: '<rect x="3" y="6" width="14" height="12" rx="2"/><path d="M7 3h12a2 2 0 012 2v10"/><path d="M7 11h6M7 14h4"/>',
  summary: '<path d="M10 5c-3 0-3 2-3 4s0 3-3 3c3 0 3 1 3 3s0 4 3 4"/><path d="M14 8h7M14 12h7M14 16h5"/>',
  frame: '<rect x="3" y="5" width="18" height="14" rx="3" stroke-dasharray="4 3"/>',
  relation: '<circle cx="5" cy="6" r="2.2"/><circle cx="19" cy="18" r="2.2"/><path d="M7 7c6 0 4 10 10 10" stroke-dasharray="3 3"/><path d="M15 15l2 2-3 .6"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  outdent: '<path d="M20 6H10M20 12H10M20 18H4M7 9l-3 3 3 3"/>',
  indent: '<path d="M20 6H10M20 12H10M20 18H4M4 9l3 3-3 3"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/>',
  paste: '<rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 5V3h6v2"/>',
  cut: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8 16L19 4M16 16L5 4"/>',
  duplicate: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 012-2h9" />',
  sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  expand: '<path d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4"/>',
  collapse: '<path d="M4 8h4V4M20 8h-4V4M4 16h4v4M20 16h-4v4"/>',
  save: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
  alignL: '<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>',
  alignC: '<path d="M4 6h16M7 10h10M4 14h16M7 18h10"/>',
  alignR: '<path d="M4 6h16M10 10h10M4 14h16M10 18h10"/>',
  caretR: '<path d="M9 6l6 6-6 6"/>',
  caretD: '<path d="M6 9l6 6 6-6"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  reset: '<path d="M4 12a8 8 0 108-8H7"/><path d="M7 1v6H1"/>',
  minimap: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><rect x="12" y="11" width="6" height="5" rx="1"/>',
  download: '<path d="M12 4v11M8 11l4 4 4-4"/><path d="M5 20h14"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>'
};

export function icon(name: string, size = 20): string {
  return wrap(P[name] || P.more, size);
}

/** Miniaturas esquemáticas de cada diseño (usan currentColor) */
export function layoutIcon(id: string): string {
  const n = (x: number, y: number, w = 8, h = 5) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.4"/>`;
  const body: Record<string, string> = {
    logicalStructure: `${n(3, 17)}<path d="M11 19.5h4M15 19.5V9M15 19.5v10M15 9h3M15 29.5h3"/>${n(18, 6.5)}${n(18, 27)}<path d="M15 19.5h3"/>${n(18, 17)}`,
    logicalStructureLeft: `${n(29, 17)}<path d="M29 19.5h-4M25 19.5V9M25 19.5v10M25 9h-3M25 29.5h-3"/>${n(14, 6.5)}${n(14, 27)}<path d="M25 19.5h-3"/>${n(14, 17)}`,
    mindMap: `${n(16, 17, 8, 6)}<path d="M16 20H12M24 20h4M12 20V10M12 20v10M28 20V10M28 20v10M12 10H9M12 30H9M28 10h3M28 30h3"/>${n(1, 7.5, 8, 5)}${n(1, 27.5, 8, 5)}${n(31, 7.5, 8, 5)}${n(31, 27.5, 8, 5)}`,
    organizationStructure: `${n(16, 3, 8, 6)}<path d="M20 9v5M7 14h26M7 14v4M20 14v4M33 14v4"/>${n(3, 18, 8, 6)}${n(16, 18, 8, 6)}${n(29, 18, 8, 6)}<path d="M7 24v4M33 24v4"/>${n(3, 28, 8, 5)}${n(29, 28, 8, 5)}`,
    catalogOrganization: `${n(14, 3, 12, 6)}<path d="M20 9v4M7 13h26M7 13v3M33 13v3M7 21v3M7 29v3M33 21v3"/>${n(3, 16, 8, 5)}${n(3, 24, 8, 5)}${n(29, 16, 8, 5)}${n(29, 24, 8, 5)}`,
    timeline: `<path d="M3 20h34M37 20l-3-2.5M37 20l-3 2.5"/>${n(5, 8)}<path d="M9 13v7"/>${n(17, 27)}<path d="M21 20v7"/>${n(26, 8)}<path d="M30 13v7"/>`,
    timeline2: `<path d="M3 12h34"/>${n(5, 16)}<path d="M9 12v4"/>${n(17, 16)}<path d="M21 12v4"/>${n(29, 16)}<path d="M33 12v4"/>`,
    verticalTimeline: `<path d="M12 3v34"/>${n(16, 6, 12, 5)}<path d="M12 8.5h4"/>${n(16, 17, 12, 5)}<path d="M12 19.5h4"/>${n(16, 28, 12, 5)}<path d="M12 30.5h4"/>`,
    fishbone: `<path d="M3 20h27"/>${n(30, 16, 8, 8)}<path d="M8 8l6 12M17 8l6 12M8 32l6-12M17 32l6-12"/>${n(3, 4, 7, 4)}${n(14, 4, 7, 4)}${n(3, 32, 7, 4)}${n(14, 32, 7, 4)}`,
    rightFishbone: `<path d="M10 20h27"/>${n(2, 16, 8, 8)}<path d="M32 8l-6 12M23 8l-6 12M32 32l-6-12M23 32l-6-12"/>${n(30, 4, 7, 4)}${n(19, 4, 7, 4)}${n(30, 32, 7, 4)}${n(19, 32, 7, 4)}`
  };
  return `<svg viewBox="0 0 40 40" width="46" height="46" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body[id] || body.logicalStructure}</svg>`;
}
