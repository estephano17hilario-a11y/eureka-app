/**
 * Biblioteca de imágenes gratuita (sin cuenta ni clave), con búsqueda bilingüe:
 *  - Wikipedia: las imágenes del artículo del concepto (las más fiables para estudiar) y las de artículos afines.
 *  - Wikimedia Commons: diagramas, láminas anatómicas, mapas, esquemas científicos.
 *  - Openverse: cientos de millones de fotos e ilustraciones con licencias abiertas.
 *  - iNaturalist: fotos de especies (animales, plantas, hongos…) cuando la búsqueda es un ser vivo.
 *
 * Antes de buscar se «entiende» la consulta: con Wikipedia se identifica el concepto y su nombre en el otro idioma
 * (célula → Cell (biology)), así las fuentes en inglés dan muchos más resultados y sin confusiones de sentido.
 * Las imágenes elegidas se reducen y comprimen antes de guardarse en la tarjeta.
 */

export type LibrarySource = 'wikipedia' | 'wikimedia' | 'openverse' | 'inaturalist';
/** Pestaña de la biblioteca: qué tipo de imagen se busca */
export type LibraryKind = 'all' | 'encyclopedia' | 'diagram' | 'photo';

export interface LibraryImage {
  id: string;
  title: string;
  /** Miniatura para la cuadrícula */
  thumb: string;
  /** Versión de buen tamaño para guardar en la tarjeta */
  full: string;
  creator: string;
  license: string;
  sourceUrl: string;
  provider: string;
  source: LibrarySource;
  width?: number;
  height?: number;
}

export interface LibraryPage {
  items: LibraryImage[];
  hasMore: boolean;
}

/** Lo que se entendió de la búsqueda */
export interface QueryPlan {
  original: string;
  lang: 'es' | 'en';
  /** Términos que se envían a cada idioma */
  en: string;
  es: string;
  /** Artículo de Wikipedia del concepto (si se identificó) */
  topicEn?: string;
  topicEs?: string;
  /** Otros temas parecidos, para afinar con un toque */
  related: string[];
}

const WIKI_PAGE = 20;
const COMMONS_PAGE = 30;
/** Openverse limita a 20 por página a las consultas anónimas: se piden dos páginas por tanda */
const OPENVERSE_PAGE = 20;
const MIN_SIDE = 220;

const cache = new Map<string, LibraryPage>();
const planCache = new Map<string, Promise<QueryPlan>>();

const norm = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[¿?¡!.,;:"«»()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function licenseLabel(code: string, version?: string): string {
  const c = (code || '').toLowerCase();
  if (c === 'cc0' || c === 'pdm') return c === 'cc0' ? 'CC0 · dominio público' : 'Dominio público';
  if (!c) return 'Licencia abierta';
  return `CC ${c.replace(/^cc-/, '').toUpperCase()}${version ? ' ' + version : ''}`;
}

function stripHtml(html: string): string {
  const d = document.createElement('div');
  d.innerHTML = html || '';
  return (d.textContent || '').trim();
}

async function getJson(url: string, signal?: AbortSignal): Promise<any> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`${new URL(url).host} ${res.status}`);
  return res.json();
}

/* ======================================================================= */
/*  Diccionario rápido español ⇄ inglés (respaldo si Wikipedia no responde)  */
/* ======================================================================= */

const ES_EN_RAW = `célula:cell|mitocondria:mitochondria|núcleo:nucleus|adn:DNA|arn:RNA|proteína:protein|enzima:enzyme|ribosoma:ribosome|cloroplasto:chloroplast|membrana:membrane|cromosoma:chromosome|gen:gene|mitosis:mitosis|meiosis:meiosis|bacteria:bacteria|virus:virus|hongo:fungus|planta:plant|flor:flower|hoja:leaf|raíz:root|semilla:seed|árbol:tree|animal:animal|insecto:insect|mariposa:butterfly|abeja:bee|hormiga:ant|araña:spider|pez:fish|ave:bird|pájaro:bird|reptil:reptile|anfibio:amphibian|mamífero:mammal|perro:dog|gato:cat|caballo:horse|vaca:cow|ballena:whale|tiburón:shark|delfín:dolphin|león:lion|tigre:tiger|elefante:elephant|serpiente:snake|rana:frog|dinosaurio:dinosaur|fósil:fossil|ecosistema:ecosystem|evolución:evolution|fotosíntesis:photosynthesis|respiración celular:cellular respiration|cerebro:brain|corazón:heart|pulmón:lung|pulmones:lungs|hígado:liver|riñón:kidney|estómago:stomach|intestino:intestine|esqueleto:skeleton|hueso:bone|músculo:muscle|neurona:neuron|sangre:blood|piel:skin|ojo:eye|oído:ear|diente:tooth|sistema nervioso:nervous system|sistema digestivo:digestive system|sistema circulatorio:circulatory system|sistema respiratorio:respiratory system|sistema inmunitario:immune system|vena:vein|arteria:artery|átomo:atom|molécula:molecule|electrón:electron|protón:proton|neutrón:neutron|enlace químico:chemical bond|tabla periódica:periodic table|elemento químico:chemical element|ácido:acid|base:base|sal:salt|agua:water|oxígeno:oxygen|hidrógeno:hydrogen|carbono:carbon|nitrógeno:nitrogen|hierro:iron|oro:gold|plata:silver|cobre:copper|cristal:crystal|reacción química:chemical reaction|laboratorio:laboratory|microscopio:microscope|energía:energy|fuerza:force|gravedad:gravity|velocidad:velocity|aceleración:acceleration|masa:mass|presión:pressure|temperatura:temperature|calor:heat|luz:light|sonido:sound|onda:wave|electricidad:electricity|circuito:circuit|imán:magnet|magnetismo:magnetism|campo magnético:magnetic field|lente:lens|prisma:prism|espectro:spectrum|motor:engine|máquina:machine|palanca:lever|polea:pulley|planeta:planet|estrella:star|sol:sun|luna:moon|tierra:earth|galaxia:galaxy|universo:universe|cometa:comet|asteroide:asteroid|eclipse:eclipse|sistema solar:solar system|agujero negro:black hole|nebulosa:nebula|marte:Mars|júpiter:Jupiter|saturno:Saturn|venus:Venus|mercurio:Mercury|neptuno:Neptune|urano:Uranus|volcán:volcano|terremoto:earthquake|montaña:mountain|río:river|lago:lake|mar:sea|océano:ocean|desierto:desert|selva:rainforest|bosque:forest|glaciar:glacier|isla:island|continente:continent|mapa:map|mapa del mundo:world map|clima:climate|nube:cloud|lluvia:rain|tormenta:storm|huracán:hurricane|tornado:tornado|roca:rock|mineral:mineral|placas tectónicas:plate tectonics|ciclo del agua:water cycle|contaminación:pollution|reciclaje:recycling|historia:history|guerra:war|revolución:revolution|imperio:empire|castillo:castle|pirámide:pyramid|templo:temple|iglesia:church|catedral:cathedral|rey:king|reina:queen|bandera:flag|moneda:coin|edad media:Middle Ages|renacimiento:Renaissance|revolución francesa:French Revolution|revolución industrial:Industrial Revolution|segunda guerra mundial:World War II|primera guerra mundial:World War I|antiguo egipto:ancient Egypt|antigua grecia:ancient Greece|antigua roma:ancient Rome|imperio romano:Roman Empire|imperio inca:Inca Empire|maya:Maya civilization|azteca:Aztec|conquista de américa:Spanish conquest of the Americas|independencia:independence|pintura:painting|escultura:sculpture|arquitectura:architecture|música:music|instrumento musical:musical instrument|piano:piano|guitarra:guitar|violín:violin|teatro:theatre|literatura:literature|libro:book|poema:poem|matemáticas:mathematics|geometría:geometry|triángulo:triangle|círculo:circle|cuadrado:square|cubo:cube|esfera:sphere|cono:cone|cilindro:cylinder|pirámide geométrica:pyramid geometry|ángulo:angle|fracción:fraction|ecuación:equation|gráfica:graph|función:function|estadística:statistics|probabilidad:probability|computadora:computer|ordenador:computer|robot:robot|internet:internet|programación:programming|economía:economy|dinero:money|mercado:market|banco:bank|empresa:company|comercio:trade|agricultura:agriculture|granja:farm|ciudad:city|pueblo:village|casa:house|puente:bridge|carretera:road|tren:train|avión:airplane|barco:ship|coche:car|bicicleta:bicycle|cuerpo humano:human body|anatomía:anatomy|medicina:medicine|vacuna:vaccine|enfermedad:disease|salud:health|nutrición:nutrition|alimento:food|fruta:fruit|verdura:vegetable|pan:bread|deporte:sport|fútbol:football|niño:child|familia:family|escuela:school|estudiante:student|profesor:teacher|girasol:sunflower|rosa:rose|tulipán:tulip|manzana:apple|naranja:orange|plátano:banana|uva:grape|fresa:strawberry|tomate:tomato|papa:potato|maíz:maize|trigo:wheat|arroz:rice|café:coffee|cacao:cacao|algodón:cotton|cactus:cactus|helecho:fern|musgo:moss|pino:pine|roble:oak|palmera:palm tree|lobo:wolf|zorro:fox|oso:bear|conejo:rabbit|ratón:mouse|murciélago:bat|mono:monkey|gorila:gorilla|jirafa:giraffe|cebra:zebra|camello:camel|pingüino:penguin|águila:eagle|búho:owl|loro:parrot|tortuga:turtle|cocodrilo:crocodile|pulpo:octopus|medusa:jellyfish|estrella de mar:starfish|cangrejo:crab|caracol:snail|gusano:worm|lombriz:earthworm|mosquito:mosquito|escarabajo:beetle|libélula:dragonfly|colibrí:hummingbird|cóndor:Andean condor|llama:llama|alpaca:alpaca|vicuña:vicuña|jaguar:jaguar|puma:cougar|delfín rosado:Amazon river dolphin`;

const ES_EN = new Map<string, string>();
const EN_ES = new Map<string, string>();
for (const pair of ES_EN_RAW.split('|')) {
  const [es, en] = pair.split(':');
  ES_EN.set(norm(es), en);
  if (!EN_ES.has(norm(en))) EN_ES.set(norm(en), es);
}

/** Palabras vacías del español que no sirven para buscar imágenes */
const STOP_ES = new Set('el la los las un una unos unas de del al a en y o u que qué cual cuál cuales cuáles como cómo donde dónde cuando cuándo por para con sin sobre es son se su sus lo le les ese esa este esta esto eso hay tiene tienen produce producen sirve sirven significa define explica'.split(' ').map((w) => w.normalize('NFD').replace(/[̀-ͯ]/g, '')));

const SPANISH_HINT =/[áéíóúñ¿¡]|\b(el|la|los|las|del|de|que|qué|como|cómo|cuál|para|por|una|uno|sistema|ciclo|partes|tipos)\b/i;

/** Traducción palabra a palabra con el diccionario (respaldo) */
function dictTranslate(q: string, map: Map<string, string>): string | null {
  const n = norm(q);
  if (map.has(n)) return map.get(n) as string;
  const words = n.split(' ');
  let hit = false;
  const out = words.map((w) => {
    const t = map.get(w);
    if (t) hit = true;
    return t || w;
  });
  return hit ? out.join(' ') : null;
}

/** «Cell (biology)» → «cell biology»: el apunte entre paréntesis desambigua sin estorbar la búsqueda */
const flatTitle = (t: string): string => t.replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();

interface WikiHit {
  title: string;
  other?: string;
}

async function wikiSearch(lang: 'es' | 'en', q: string, signal?: AbortSignal): Promise<WikiHit[]> {
  const other = lang === 'es' ? 'en' : 'es';
  const url =
    `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&generator=search` +
    `&gsrsearch=${encodeURIComponent(q)}&gsrlimit=8&prop=langlinks|pageviews&pvipdays=14&lllang=${other}&lllimit=max`;
  const json = await getJson(url, signal);
  const pages: any[] = Object.values(json?.query?.pages || {});
  pages.sort((a, b) => (a.index || 0) - (b.index || 0));
  const nq = norm(q);
  const hits = pages.map((p, i) => {
    const views = Object.values(p.pageviews || {}).reduce((s: number, v: any) => s + (Number(v) || 0), 0) as number;
    const title = String(p.title);
    // Entre los primeros resultados gana el significado más consultado que además nombra lo buscado
    const named = norm(title).includes(nq) || nq.includes(norm(title)) ? 0.6 : 0;
    return { title, other: p.langlinks?.[0]?.['*'], score: Math.log10(views + 10) - 0.35 * i + named, i };
  });
  const head = hits.slice(0, 5).sort((a, b) => b.score - a.score);
  return [...head, ...hits.slice(5)].map(({ title, other }) => ({ title, other }));
}

/**
 * Artículo cuyo título es exactamente la consulta (siguiendo redirecciones: «mariposa monarca» → Danaus plexippus).
 * Si es una página de desambiguación se marca, para elegir luego el significado más consultado.
 */
async function wikiTitle(lang: 'es' | 'en', q: string, signal?: AbortSignal): Promise<(WikiHit & { disambig?: boolean }) | null> {
  if (!q || q.split(/\s+/).length > 4) return null;
  const other = lang === 'es' ? 'en' : 'es';
  const title = q.charAt(0).toUpperCase() + q.slice(1);
  const json = await getJson(
    `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&titles=${encodeURIComponent(title)}` +
      `&prop=langlinks|pageprops&ppprop=disambiguation&lllang=${other}&lllimit=max`,
    signal
  );
  const page: any = Object.values(json?.query?.pages || {})[0];
  if (!page || page.missing !== undefined) return null;
  return { title: String(page.title), other: page.langlinks?.[0]?.['*'], disambig: page.pageprops?.disambiguation !== undefined };
}

/**
 * Entiende la consulta: idioma, concepto de Wikipedia y su nombre en el otro idioma.
 * Nunca falla: sin conexión con Wikipedia usa el diccionario y, si no, la consulta tal cual.
 */
export function planQuery(query: string, signal?: AbortSignal): Promise<QueryPlan> {
  const q = query.trim();
  const key = norm(q);
  const hit = planCache.get(key);
  if (hit) return hit;
  const p = (async (): Promise<QueryPlan> => {
    const clean = q.replace(/[¿?¡!]/g, '').trim();
    const nq = norm(q);
    const [esFound, enFound, esPage, enPage] = await Promise.all([
      wikiSearch('es', q, signal).catch(() => [] as WikiHit[]),
      wikiSearch('en', q, signal).catch(() => [] as WikiHit[]),
      wikiTitle('es', clean, signal).catch(() => null),
      wikiTitle('en', clean, signal).catch(() => null)
    ]);
    const close = (t?: string) => !!t && (norm(t) === nq || norm(t).startsWith(nq) || nq.startsWith(norm(t)));

    /**
     * Significado principal en un idioma:
     *  1) el artículo con el título exacto (o su redirección);
     *  2) si ese título es una desambiguación («mercurio»), la acepción «Mercurio (…)» más consultada;
     *  3) si no, el primer resultado de búsqueda (ya ordenado por relevancia y popularidad).
     */
    const pick = (page: (WikiHit & { disambig?: boolean }) | null, found: WikiHit[]): { top?: WikiHit; list: WikiHit[] } => {
      if (page && !page.disambig) return { top: page, list: [page, ...found.filter((h) => h.title !== page.title)] };
      if (page?.disambig) {
        const sense = found.find((h) => norm(h.title).startsWith(nq + ' '));
        if (sense) return { top: sense, list: [sense, ...found.filter((h) => h.title !== sense.title)] };
      }
      return { top: found[0], list: found };
    };
    const es = pick(esPage, esFound);
    const en = pick(enPage, enFound);

    // Idioma: español salvo que la consulta sea claramente inglesa (la app se usa en español)
    const clearlyEnglish =
      !SPANISH_HINT.test(q) && !ES_EN.has(nq) && (EN_ES.has(nq) || (!!enPage && !enPage.disambig && !esPage) || (close(en.top?.title) && !close(es.top?.title) && !esPage));
    // Una pregunta o frase larga («¿qué orgánulo produce ATP?») se busca por su tema, no palabra por palabra
    const longQuery = nq.split(' ').length > 3;

    if (!clearlyEnglish) {
      const keywords = nq
        .split(' ')
        .filter((w) => !STOP_ES.has(w))
        .join(' ');
      const exact = ES_EN.get(norm(keywords || q));
      let top = es.top;
      let topicEn = top?.other;
      // El diccionario corrige cuando Wikipedia entiende otra cosa («girasol» no es el ópalo girasol)
      if (exact && top && !close(top.title)) {
        const enExact = await wikiTitle('en', exact, signal).catch(() => null);
        top = undefined;
        topicEn = enExact && !enExact.disambig ? enExact.title : undefined;
      }
      // Si el artículo en español no enlaza al inglés, se usa lo que la Wikipedia inglesa entiende de la misma frase
      const enGuess = !topicEn && !exact && en.top ? en.top.title : undefined;
      const enTerm = topicEn || exact || enGuess || dictTranslate(keywords || q, ES_EN) || keywords || q;
      return {
        original: q,
        lang: 'es',
        es: longQuery && top ? top.title : q,
        en: flatTitle(enTerm),
        topicEs: top?.title,
        topicEn: topicEn || enGuess,
        related: es.list.filter((h) => h.title !== top?.title).slice(0, 7).map((h) => h.title)
      };
    }
    const top = en.top;
    return {
      original: q,
      lang: 'en',
      en: longQuery && top ? flatTitle(top.title) : q,
      es: top?.other || dictTranslate(q, EN_ES) || q,
      topicEn: top?.title,
      topicEs: top?.other,
      related: en.list.filter((h) => h.title !== top?.title).slice(0, 7).map((h) => h.title)
    };
  })();
  planCache.set(key, p);
  // Si se cancela o falla, no se guarda un plan a medias
  p.catch(() => planCache.delete(key));
  if (planCache.size > 80) planCache.delete(planCache.keys().next().value as string);
  return p;
}

/* ======================================================================= */
/*  Filtros de calidad                                                       */
/* ======================================================================= */

/** Iconos, logotipos y piezas de interfaz de Wikipedia que no son contenido */
const JUNK = /(^|[\s_:\-/])(icon|logo|commons-logo|wiki|wikipedia|wikisource|wiktionary|wikiquote|wikibooks|wikinews|wikiversity|wikidata|portal|stub|edit-clear|symbol (support|oppose)|ambox|question book|crystal clear|nuvola|padlock|disambig|folder|text-x|gnome|oojs|red pencil|lock-|semi-protection|blue pencil|pd-icon|cscr-featured|featured article|good article|wikiproject|yes check|x mark|checkmark|check mark|green tick|red x|cc-by|cc-zero|public domain|flag of|coat of arms|signature|firma|escudo de|bandera de)/i;

function goodSize(w?: number, h?: number): boolean {
  if (!w || !h) return true;
  if (Math.min(w, h) < MIN_SIDE * 0.6 && Math.max(w, h) < MIN_SIDE) return false;
  const ratio = Math.max(w, h) / Math.min(w, h);
  return ratio <= 5;
}

/** Id común para que una misma imagen de Commons no salga dos veces (vía Wikipedia y vía Commons) */
const fileId = (title: string): string => 'file:' + title.replace(/^(File|Archivo|Imagen):/i, '').replace(/_/g, ' ').toLowerCase();

function fromImageInfo(p: any, source: LibrarySource, provider: string): LibraryImage | null {
  const info = p.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata || {};
  if (meta.NonFree?.value === 'true' || meta.NonFree?.value === true) return null;
  const mime = String(info.mime || '');
  if (mime && !/image\/(jpeg|png|svg\+xml|webp|gif|tiff)/.test(mime)) return null;
  const title = String(p.title || '');
  if (JUNK.test(title)) return null;
  const w = info.width;
  const h = info.height;
  if (!goodSize(w, h)) return null;
  // Las imágenes vectoriales pequeñas suelen ser iconos
  if (/svg/.test(mime) && w && h && Math.max(w, h) < 300) return null;
  const thumb: string = info.thumburl || info.url;
  return {
    id: fileId(title),
    title: title.replace(/^(File|Archivo|Imagen):/i, '').replace(/\.[a-z0-9]+$/i, '').replace(/_/g, ' '),
    thumb,
    full: thumb,
    creator: stripHtml(meta.Artist?.value) || provider,
    license: stripHtml(meta.LicenseShortName?.value) || 'Licencia abierta',
    sourceUrl: info.descriptionurl || info.url,
    provider,
    source,
    width: w,
    height: h
  };
}

/* ======================================================================= */
/*  Fuentes                                                                  */
/* ======================================================================= */

const IMAGEINFO = '&prop=imageinfo&iiprop=url|extmetadata|size|mime&iiurlwidth=900';

/** Imágenes que ilustran el artículo del concepto (y las imágenes principales de artículos afines) */
async function searchWikipedia(plan: QueryPlan, page: number, signal?: AbortSignal): Promise<LibraryPage> {
  const jobs: Promise<LibraryImage[]>[] = [];
  const articleImages = (lang: 'es' | 'en', title: string) =>
    getJson(
      `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&generator=images` +
        `&titles=${encodeURIComponent(title)}&gimlimit=50${IMAGEINFO}`,
      signal
    ).then((json) => (Object.values(json?.query?.pages || {}) as any[]).map((p) => fromImageInfo(p, 'wikipedia', `Wikipedia (${lang})`)).filter(Boolean) as LibraryImage[]);

  if (page === 1) {
    if (plan.topicEn) jobs.push(articleImages('en', plan.topicEn).catch(() => []));
    if (plan.topicEs) jobs.push(articleImages('es', plan.topicEs).catch(() => []));
  }
  // Imagen principal de los artículos que salen al buscar (en inglés hay muchos más)
  const offset = (page - 1) * WIKI_PAGE;
  const leadUrl =
    `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&generator=search` +
    `&gsrsearch=${encodeURIComponent(plan.en)}&gsrlimit=${WIKI_PAGE}&gsroffset=${offset}&prop=pageimages&piprop=name&pilicense=free`;
  let more = false;
  jobs.push(
    getJson(leadUrl, signal)
      .then(async (json) => {
        more = Boolean(json?.continue);
        const pages: any[] = Object.values(json?.query?.pages || {});
        pages.sort((a, b) => (a.index || 0) - (b.index || 0));
        const files = pages.map((p) => p.pageimage).filter(Boolean) as string[];
        if (!files.length) return [];
        const info = await getJson(
          `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&titles=${encodeURIComponent(files.map((f) => 'File:' + f).join('|'))}${IMAGEINFO}`,
          signal
        );
        const byTitle = new Map<string, any>();
        (Object.values(info?.query?.pages || {}) as any[]).forEach((p) => byTitle.set(fileId(p.title), p));
        // Se respeta el orden de relevancia de la búsqueda
        return files.map((f) => byTitle.get(fileId(f))).filter(Boolean).map((p) => fromImageInfo(p, 'wikipedia', 'Wikipedia')).filter(Boolean) as LibraryImage[];
      })
      .catch(() => [])
  );
  const lists = await Promise.all(jobs);
  const seen = new Set<string>();
  const items: LibraryImage[] = [];
  for (const list of lists)
    for (const it of list) {
      if (seen.has(it.id)) continue;
      seen.add(it.id);
      items.push(it);
    }
  if (!items.length && signal?.aborted) throw new DOMException('aborted', 'AbortError');
  return { items, hasMore: more };
}

async function searchCommons(plan: QueryPlan, page: number, kind: LibraryKind, signal?: AbortSignal): Promise<LibraryPage> {
  const offset = (page - 1) * COMMONS_PAGE;
  const types = kind === 'photo' ? 'bitmap' : kind === 'diagram' ? 'drawing|bitmap' : 'bitmap|drawing';
  const run = (text: string) =>
    getJson(
      'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6' +
        `&gsrsearch=${encodeURIComponent(`${text} filetype:${types}`)}&gsrlimit=${COMMONS_PAGE}&gsroffset=${offset}${IMAGEINFO}`,
      signal
    );
  const queries = [plan.en];
  // En la primera tanda también se busca en español (Commons tiene descripciones en muchos idiomas)
  if (page === 1 && norm(plan.es) !== norm(plan.en)) queries.push(plan.es);
  const results = await Promise.all(queries.map((q) => run(q).catch(() => null)));
  const items: LibraryImage[] = [];
  let more = false;
  for (const json of results) {
    if (!json) continue;
    more = more || Boolean(json?.continue);
    const pages: any[] = Object.values(json?.query?.pages || {});
    pages.sort((a, b) => (a.index || 0) - (b.index || 0));
    pages.forEach((p) => {
      const it = fromImageInfo(p, 'wikimedia', 'Wikimedia Commons');
      if (it) items.push(it);
    });
  }
  if (results.every((r) => r === null)) throw new Error('Commons sin respuesta');
  return { items, hasMore: more };
}

async function searchOpenverse(plan: QueryPlan, page: number, kind: LibraryKind, signal?: AbortSignal): Promise<LibraryPage> {
  const category = kind === 'photo' ? '&category=photograph' : kind === 'diagram' ? '&category=illustration,digitized_artwork' : '';
  const one = (p: number) =>
    getJson(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(plan.en)}&page=${p}&page_size=${OPENVERSE_PAGE}&mature=false${category}`, signal);
  // Dos páginas por tanda: 40 imágenes en vez de 20
  const results = await Promise.all([one(page * 2 - 1), one(page * 2).catch(() => null)]);
  const items: LibraryImage[] = [];
  let pageCount = 1;
  for (const json of results) {
    if (!json) continue;
    pageCount = Math.max(pageCount, json.page_count || 1);
    (json.results || []).forEach((r: any) => {
      if (!(r?.thumbnail || r?.url)) return;
      if (!goodSize(r.width, r.height)) return;
      if (JUNK.test(r.title || '')) return;
      items.push({
        id: `ov:${r.id}`,
        title: r.title || 'Sin título',
        thumb: r.thumbnail || r.url,
        full: r.thumbnail || r.url,
        creator: r.creator || 'Autor desconocido',
        license: licenseLabel(r.license, r.license_version),
        sourceUrl: r.foreign_landing_url || r.url,
        provider: r.provider || r.source || 'Openverse',
        source: 'openverse',
        width: r.width,
        height: r.height
      });
    });
  }
  return { items, hasMore: page * 2 < pageCount };
}

/** Fotos de una especie: solo si la búsqueda nombra de verdad un ser vivo (evita confusiones) */
async function searchINaturalist(plan: QueryPlan, page: number, signal?: AbortSignal): Promise<LibraryPage> {
  if (page > 1) return { items: [], hasMore: false };
  // Solo vale la especie cuyo artículo de Wikipedia es el tema de la búsqueda: «banco» no debe traer el árbol llamado «banco»
  const topics = new Set([plan.topicEn, plan.topicEs, plan.en].filter(Boolean).map((x) => norm(x as string)));
  if (!topics.size) return { items: [], hasMore: false };
  const wikiKey = (u?: string) => (u ? norm(decodeURIComponent(u.split('/wiki/')[1] || '').replace(/_/g, ' ')) : '');
  // Se busca primero por nombre científico (Panthera leo), luego por el tema en inglés y por la consulta tal cual
  const binomial = (t?: string) => !!t && /^[A-Z][a-z]+ [a-z]+$/.test(t);
  const candidates = Array.from(
    new Set([plan.topicEs, plan.topicEn, ...plan.related.slice(0, 3)].filter(binomial).concat([plan.topicEn, plan.original]).filter(Boolean))
  ) as string[];
  let taxon: any = null;
  for (const q of candidates.slice(0, 3)) {
    const json = await getJson(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(q)}&per_page=8&locale=es&is_active=true`, signal).catch(() => null);
    taxon = (json?.results || []).find((t: any) => topics.has(wikiKey(t.wikipedia_url)) || topics.has(norm(t.name || '')));
    if (taxon) break;
  }
  if (!taxon) return { items: [], hasMore: false };
  const detail = await getJson(`https://api.inaturalist.org/v1/taxa/${taxon.id}?locale=es`, signal).catch(() => null);
  const photos: any[] = (detail?.results?.[0]?.taxon_photos || []).map((tp: any) => tp.photo);
  if (!photos.length && taxon.default_photo) photos.push(taxon.default_photo);
  const name = taxon.preferred_common_name ? `${taxon.preferred_common_name} (${taxon.name})` : taxon.name;
  const items: LibraryImage[] = photos
    .filter((ph) => ph?.medium_url && ph.license_code)
    .slice(0, 16)
    .map((ph) => ({
      id: `in:${ph.id}`,
      title: name,
      thumb: ph.medium_url,
      full: String(ph.medium_url).replace('/medium.', '/large.'),
      creator: String(ph.attribution || 'iNaturalist').replace(/^\(c\)\s*/i, ''),
      license: licenseLabel(ph.license_code),
      sourceUrl: `https://www.inaturalist.org/taxa/${taxon.id}`,
      provider: 'iNaturalist',
      source: 'inaturalist' as LibrarySource,
      width: ph.original_dimensions?.width,
      height: ph.original_dimensions?.height
    }));
  return { items, hasMore: false };
}

/** Fuentes que se consultan en cada pestaña, en orden de fiabilidad */
export function sourcesFor(kind: LibraryKind): LibrarySource[] {
  if (kind === 'encyclopedia') return ['wikipedia'];
  if (kind === 'diagram') return ['wikimedia', 'openverse'];
  if (kind === 'photo') return ['inaturalist', 'openverse', 'wikimedia'];
  return ['wikipedia', 'inaturalist', 'wikimedia', 'openverse'];
}

export async function searchLibrary(source: LibrarySource, plan: QueryPlan, page = 1, kind: LibraryKind = 'all', signal?: AbortSignal): Promise<LibraryPage> {
  const key = `${source}|${kind}|${norm(plan.original)}|${page}`;
  const hit = cache.get(key);
  if (hit) return hit;
  let result: LibraryPage;
  if (source === 'wikipedia') result = await searchWikipedia(plan, page, signal);
  else if (source === 'wikimedia') result = await searchCommons(plan, page, kind, signal);
  else if (source === 'openverse') result = await searchOpenverse(plan, page, kind, signal);
  else result = await searchINaturalist(plan, page, signal);
  if (cache.size > 80) cache.delete(cache.keys().next().value as string);
  cache.set(key, result);
  return result;
}

/** Mezcla las fuentes por turnos (las más fiables primero) para que haya variedad desde la primera fila */
export function interleave(lists: LibraryImage[][], seen: Set<string>): LibraryImage[] {
  const out: LibraryImage[] = [];
  const idx = lists.map(() => 0);
  let left = true;
  while (left) {
    left = false;
    lists.forEach((list, i) => {
      // Dos de cada fuente por turno
      for (let k = 0; k < 2 && idx[i] < list.length; k++) {
        const it = list[idx[i]++];
        left = true;
        const thumbKey = it.thumb.split('?')[0];
        if (seen.has(it.id) || seen.has(thumbKey)) continue;
        seen.add(it.id);
        seen.add(thumbKey);
        out.push(it);
      }
      if (idx[i] < list.length) left = true;
    });
  }
  return out;
}

/* ======================================================================= */
/*  Compresión de imágenes                                                  */
/* ======================================================================= */

let webpOk: boolean | null = null;
function supportsWebp(): boolean {
  if (webpOk !== null) return webpOk;
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    webpOk = c.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    webpOk = false;
  }
  return webpOk;
}

async function decodeBlob(blob: Blob): Promise<{ src: CanvasImageSource; width: number; height: number; close: () => void }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(blob);
      return { src: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close?.() };
    } catch {
      /* se prueba con <img> */
    }
  }
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('imagen no válida'));
      el.src = url;
    });
    return { src: img, width: img.naturalWidth, height: img.naturalHeight, close: () => URL.revokeObjectURL(url) };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

/** Reduce y comprime una imagen (archivo, foto de la cámara o descarga) a un data URL ligero. */
export async function compressImageBlob(blob: Blob, maxDim = 1100, quality = 0.82): Promise<string> {
  const dec = await decodeBlob(blob);
  try {
    const k = Math.min(1, maxDim / Math.max(dec.width, dec.height));
    const w = Math.max(1, Math.round(dec.width * k));
    const h = Math.max(1, Math.round(dec.height * k));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas no disponible');
    // Fondo blanco: los PNG/SVG con transparencia no deben quedar negros al pasar a JPEG
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(dec.src, 0, 0, w, h);
    return supportsWebp() ? canvas.toDataURL('image/webp', quality) : canvas.toDataURL('image/jpeg', quality);
  } finally {
    dec.close();
  }
}

export async function compressImageFile(file: File | Blob, maxDim = 1100, quality = 0.82): Promise<string> {
  // GIF animados y SVG se conservan tal cual si ya pesan poco
  if (file.type === 'image/gif' && file.size < 400_000) return blobToDataUrl(file);
  return compressImageBlob(file, maxDim, quality);
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ''));
    r.onerror = () => reject(r.error || new Error('lectura fallida'));
    r.readAsDataURL(blob);
  });
}

/** Descarga la imagen elegida de la biblioteca y la deja comprimida lista para guardar en la tarjeta. */
export async function fetchLibraryImageAsDataUrl(img: LibraryImage, maxDim = 1100): Promise<string> {
  let res = await fetch(img.full, { mode: 'cors' }).catch(() => null);
  // Si la versión grande no se puede descargar, se usa la miniatura
  if ((!res || !res.ok) && img.thumb !== img.full) res = await fetch(img.thumb, { mode: 'cors' });
  if (!res || !res.ok) throw new Error(`descarga ${res?.status}`);
  const blob = await res.blob();
  return compressImageBlob(blob, maxDim, 0.82);
}

export function creditFor(img: LibraryImage): string {
  return `${img.title} — ${img.creator} · ${img.license} · ${img.provider}`;
}
