export interface GeneratedCard {
  front: string;
  back: string;
  type: 'standard' | 'latex';
}

export class AiBuilderService {
  private static instance: AiBuilderService;

  private constructor() {}

  public static getInstance(): AiBuilderService {
    if (!AiBuilderService.instance) {
      AiBuilderService.instance = new AiBuilderService();
    }
    return AiBuilderService.instance;
  }

  /**
   * Genera flashcards inteligentes basadas en temas, apuntes completos o textos de longitud ilimitada.
   */
  public generateCards(promptOrText: string, targetCount: number = 5): GeneratedCard[] {
    const raw = promptOrText.trim();
    if (!raw) return [];

    const lower = raw.toLowerCase();
    const cards: GeneratedCard[] = [];

    // 1. Detección de Temas Preconfigurados Especializados
    if (raw.length < 120) {
      if (lower.includes('matemática') || lower.includes('física') || lower.includes('cálculo') || lower.includes('cuántica')) {
        cards.push(
          {
            front: '¿Cuál es el Principio de Incertidumbre de Heisenberg?',
            back: 'Establece la imposibilidad de medir simultáneamente y con precisión absoluta la posición y el momento lineal de una partícula:\n\n$$\\Delta x \\cdot \\Delta p \\ge \\frac{\\hbar}{2}$$',
            type: 'latex'
          },
          {
            front: '¿Qué es la Derivada direccional de una función multivariable?',
            back: 'Representa la tasa de cambio de $f(x,y)$ en la dirección de un vector unitario $\\mathbf{u}$:\n\n$$D_{\\mathbf{u}}f = \\nabla f \\cdot \\mathbf{u}$$',
            type: 'latex'
          },
          {
            front: '¿Qué describe la Ley de Gauss para el campo eléctrico?',
            back: 'El flujo eléctrico total a través de cualquier superficie cerrada es proporcional a la carga eléctrica neta encerrada:\n\n$$\\oint \\mathbf{E} \\cdot d\\mathbf{A} = \\frac{Q_{\\text{enc}}}{\\varepsilon_0}$$',
            type: 'latex'
          },
          {
            front: 'Ecuación de Schrödinger independiente del tiempo',
            back: '$$\\hat{H}\\psi = E\\psi$$\n\nDonde $\\hat{H}$ es el operador Hamiltoniano y $E$ son los niveles de energía propios del sistema.',
            type: 'latex'
          }
        );
      } else if (lower.includes('corazón') || lower.includes('anatomía') || lower.includes('medicina') || lower.includes('humano')) {
        cards.push(
          {
            front: '¿Cuál es la función principal de la Válvula Mitral (bicúspide)?',
            back: 'Permite el flujo unidireccional de sangre oxigenada desde la aurícula izquierda hacia el ventrículo izquierdo, impidiendo el reflujo retrógrado durante la sístole.',
            type: 'standard'
          },
          {
            front: '¿Dónde se origina el impulso eléctrico cardíaco normal?',
            back: 'En el **Nodo Sinoauricular (SA)**, ubicado en la parte superior de la aurícula derecha, actuando como el marcapasos fisiológico natural.',
            type: 'standard'
          },
          {
            front: '¿Qué diferencia a la circulación sistémica de la circulación pulmonar?',
            back: '**Circulación pulmonar**: Lleva sangre desoxigenada a los alvéolos para oxigenación.\n**Circulación sistémica**: Distribuye sangre oxigenada a todos los órganos y tejidos del cuerpo.',
            type: 'standard'
          },
          {
            front: '¿Qué arterias irrigan el músculo miocárdico?',
            back: 'Las **arterias coronarias izquierda y derecha**, que nacen en la raíz de la aorta, justo por encima de las valvas de la válvula aórtica.',
            type: 'standard'
          }
        );
      } else if (lower.includes('inglés') || lower.includes('idioma') || lower.includes('english')) {
        cards.push(
          {
            front: 'Phrasal Verb: "To call it a day"',
            back: '**Meaning:** To stop working on something for the rest of the day.\n\n*Example:* "We have made good progress, let\'s call it a day."',
            type: 'standard'
          },
          {
            front: 'Idiom: "Bite the bullet"',
            back: '**Meaning:** To face a difficult or unpleasant situation with courage and resolve.',
            type: 'standard'
          },
          {
            front: 'Word: "Eloquent" /ˌel.ə.kwənt/',
            back: '**Definition:** Fluent or persuasive in speaking or writing.\n\n*Synonyms:* Articulate, expressive, well-spoken.',
            type: 'standard'
          },
          {
            front: 'Phrasal Verb: "Look forward to"',
            back: '**Meaning:** To feel pleased and excited about something that is going to happen.\n\n*Note:* Followed by gerund (-ing) or noun: "I look forward to meeting you."',
            type: 'standard'
          }
        );
      }
    }

    // 2. Extracción Inteligente de Textos Largos, Artículos o Apuntes Completos
    if (cards.length === 0) {
      const rawLines = raw.split('\n').map(l => l.trim()).filter(Boolean);

      // A. Buscar patrones de Clave : Valor o Término - Definición
      for (const line of rawLines) {
        if (line.includes(' : ') || line.includes(': ') || line.includes(' - ') || line.includes(';')) {
          let parts: string[] = [];
          if (line.includes(';')) parts = line.split(';');
          else if (line.includes(' : ')) parts = line.split(' : ');
          else if (line.includes(' - ')) parts = line.split(' - ');
          else if (line.includes(': ')) parts = line.split(': ');

          if (parts.length >= 2) {
            const front = parts[0].trim();
            const back = parts.slice(1).join(' ').trim();
            if (front.length > 2 && back.length > 2) {
              const isLatex = front.includes('$') || back.includes('$');
              cards.push({
                front: front.startsWith('¿') ? front : `¿Qué es o cómo se define "${front}"?`,
                back,
                type: isLatex ? 'latex' : 'standard'
              });
            }
          }
        }
      }

      // B. Buscar oraciones explicativas (X es ..., X se define ..., X consiste en ...)
      if (cards.length < targetCount) {
        const sentences = raw.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 15);
        for (const sentence of sentences) {
          const match = sentence.match(/^([^,.:;]+)\s+(es\s+un[a]?|son\s+aquell[oa]s|se\s+define\s+como|consiste\s+en|representa|se\s+refiere\s+a)\s+(.+)$/i);
          if (match) {
            const term = match[1].trim();
            const relation = match[2].trim();
            const def = match[3].trim();
            if (term.length < 80) {
              cards.push({
                front: `¿Qué ${relation} ${term}?`,
                back: `${term.charAt(0).toUpperCase() + term.slice(1)} ${relation} ${def}`,
                type: sentence.includes('$') ? 'latex' : 'standard'
              });
            }
          }
        }
      }

      // C. Párrafos por bloques
      if (cards.length < targetCount) {
        const paragraphs = raw.split(/\n\s*\n+/).filter(p => p.trim().length > 20);
        for (let i = 0; i < paragraphs.length; i++) {
          const p = paragraphs[i].trim();
          const pLines = p.split('\n').map(l => l.trim()).filter(Boolean);
          if (pLines.length >= 2) {
            cards.push({
              front: pLines[0],
              back: pLines.slice(1).join('\n'),
              type: p.includes('$') ? 'latex' : 'standard'
            });
          } else {
            const firstSentenceEnd = p.search(/[.?!]/);
            if (firstSentenceEnd > 10 && firstSentenceEnd < 120) {
              const front = p.slice(0, firstSentenceEnd + 1).trim();
              const back = p.slice(firstSentenceEnd + 1).trim();
              if (back.length > 5) {
                cards.push({
                  front: `Explica el siguiente concepto:\n${front}`,
                  back,
                  type: p.includes('$') ? 'latex' : 'standard'
                });
              }
            }
          }
        }
      }

      // D. Si aún no hay suficientes, crear tarjetas contextuales completas
      if (cards.length === 0) {
        cards.push(
          {
            front: `Concepto Principal: ${raw.slice(0, 100)}${raw.length > 100 ? '...' : ''}`,
            back: `Desarrollo y estudio detallado:\n\n${raw}`,
            type: raw.includes('$') ? 'latex' : 'standard'
          },
          {
            front: `¿Cuál es el núcleo central y aplicaciones prácticas del tema?`,
            back: `Retención activa basada en los puntos clave de:\n${raw.slice(0, 200)}${raw.length > 200 ? '...' : ''}`,
            type: 'standard'
          }
        );
      }
    }

    return cards.slice(0, targetCount);
  }
}

export const aiBuilderService = AiBuilderService.getInstance();

