/**
 * Ejemplos y casos de uso del importador. Cada uno trae un texto de muestra y los ajustes
 * con los que se entiende bien, para que se vea de un vistazo qué separadores usar.
 */
import type { ImportSettings } from './import-parser';

export interface ImportExample {
  id: string;
  icon: string;
  title: string;
  /** Para quién es / cuándo usarlo */
  when: string;
  text: string;
  settings: Partial<ImportSettings>;
}

export const IMPORT_EXAMPLES: ImportExample[] = [
  {
    id: 'vocab',
    icon: '🌍',
    title: 'Vocabulario de idiomas',
    when: 'Una palabra y su traducción en cada línea, separadas por coma.',
    text: 'casa, house\nperro, dog\ngato, cat\nlibro, book\nagua, water',
    settings: {}
  },
  {
    id: 'sheet',
    icon: '📊',
    title: 'Excel, Google Sheets o Quizlet',
    when: 'Copia dos columnas de tu hoja (o el export de Quizlet) y pégalas. También puedes subir el .xlsx directamente.',
    text: 'Capital de Francia\tParís\nCapital de Japón\tTokio\nCapital de Perú\tLima\nCapital de Egipto\tEl Cairo',
    settings: { sideSep: 'tab', cardSep: 'line' }
  },
  {
    id: 'anki',
    icon: '🃏',
    title: 'Anki (texto plano)',
    when: 'En Anki: Exportar → «Notas en texto plano». Se ignoran las columnas extra (etiquetas, etc.). El .apkg también se puede subir.',
    text: '#separator:tab\n#html:true\n#tags column:3\n¿Qué es la mitosis?\tDivisión celular que produce dos células idénticas\tbiologia\n¿Dónde ocurre la fotosíntesis?\tEn los cloroplastos\tbiologia\n¿Qué es el ADN?\tMolécula que guarda la información genética\tbiologia',
    settings: {}
  },
  {
    id: 'glossary',
    icon: '📖',
    title: 'Glosario con dos puntos',
    when: 'Apuntes tipo «Término: definición», incluso con viñetas o numeración.',
    text: '- Mitosis: división de una célula en dos idénticas\n- Meiosis: división que produce gametos con la mitad de cromosomas\n- Ribosoma: orgánulo que fabrica proteínas',
    settings: { sideSep: 'colon', cardSep: 'line' }
  },
  {
    id: 'blocks',
    icon: '📝',
    title: 'Apuntes en varias líneas',
    when: 'La pregunta en la primera línea y la respuesta debajo (puede ocupar varias líneas). Una línea en blanco separa las tarjetas.',
    text: '¿Qué dice la primera ley de Newton?\nTodo cuerpo mantiene su estado de reposo o movimiento rectilíneo uniforme si no actúa una fuerza sobre él.\n\n¿Qué es la inercia?\nLa resistencia de un cuerpo a cambiar su estado de movimiento.\nA mayor masa, mayor inercia.',
    settings: { cardSep: 'blank', sideSep: 'newline' }
  },
  {
    id: 'alternate',
    icon: '🔁',
    title: 'Una línea pregunta, la siguiente respuesta',
    when: 'Texto copiado de apuntes donde se alternan pregunta y respuesta sin ningún símbolo.',
    text: '¿Cuántos huesos tiene un adulto?\n206\n¿Cuál es el hueso más largo?\nEl fémur\n¿Cuál es el órgano más grande?\nLa piel',
    settings: { cardSep: 'pairs', sideSep: 'newline' }
  },
  {
    id: 'qa',
    icon: '❓',
    title: 'Formato Pregunta: / Respuesta:',
    when: 'Bloques con etiquetas. Sirve también «P:» y «R:» o «Q:» y «A:».',
    text: 'P: ¿Cuál es la capital de Australia?\nR: Canberra\n\nP: ¿Quién escribió «Don Quijote»?\nR: Miguel de Cervantes\n\nP: ¿Cuántos planetas tiene el sistema solar?\nR: Ocho',
    settings: {}
  },
  {
    id: 'latex',
    icon: '🧮',
    title: 'Fórmulas y ciencias',
    when: 'Fórmulas entre $…$ o $$…$$ se ven bonitas en la vista previa y en el estudio.',
    text: 'Ley de Ohm ; $$V = I \\cdot R$$\nIdentidad de Euler ; $$e^{i\\pi} + 1 = 0$$\nTeorema de Pitágoras ; $$a^2 + b^2 = c^2$$\nEnergía cinética ; $$E_c = \\tfrac{1}{2} m v^2$$',
    settings: { sideSep: 'semi', cardSep: 'line' }
  },
  {
    id: 'csv',
    icon: '📑',
    title: 'CSV con comillas',
    when: 'Cuando las respuestas llevan comas o saltos de línea, el archivo las pone entre comillas.',
    text: 'Pregunta,Respuesta\n"Colores primarios","Rojo, azul y amarillo"\n"¿Qué es H2O?","Agua:\nformada por dos átomos de hidrógeno y uno de oxígeno"\n"Planeta rojo","Marte"',
    settings: {}
  },
  {
    id: 'arrows',
    icon: '➡️',
    title: 'Con flechas o signo igual',
    when: 'Listas rápidas como «uno → one» o «H2O = agua». Elige el separador en la lista de abajo.',
    text: 'uno → one\ndos → two\ntres → three\ncuatro → four',
    settings: { sideSep: 'arrow', cardSep: 'line' }
  },
  {
    id: 'custom',
    icon: '🛠️',
    title: 'Tus propios separadores',
    when: 'Elige «Otro» en ambas listas y escribe lo que uses: aquí «//» entre pregunta y respuesta y «##» entre tarjetas.',
    text: 'Mitocondria // Produce ATP en la respiración celular ## Ribosoma // Sintetiza proteínas ## Núcleo // Guarda el ADN ## Membrana // Controla lo que entra y sale',
    settings: { sideSep: 'custom', sideCustom: '//', cardSep: 'custom', cardCustom: '##' }
  }
];

/** Guías cortas para conseguir el archivo desde otras apps */
export const EXPORT_GUIDES: Array<{ app: string; steps: string }> = [
  { app: 'Excel / Sheets', steps: 'Sube el .xlsx tal cual, o selecciona las 2 columnas, cópialas y pégalas aquí.' },
  { app: 'Anki', steps: 'Exportar → «Notas en texto plano (.txt)» o «Paquete de Anki (.apkg)» con compatibilidad antigua.' },
  { app: 'Quizlet', steps: 'Conjunto → ⋯ → Exportar. Copia el texto y pégalo (usa Tab entre término y definición).' },
  { app: 'Word / Docs', steps: 'Sube el .docx (las tablas se leen como columnas) o copia y pega el texto.' },
  { app: 'PDF', steps: 'Funciona si el PDF tiene texto seleccionable. Los escaneados no se pueden leer.' }
];

/** Texto con los caracteres invisibles a la vista (Tab → ⇥) para mostrar ejemplos */
export const showInvisibles = (t: string) => t.replace(/\t/g, ' ⇥ ');
