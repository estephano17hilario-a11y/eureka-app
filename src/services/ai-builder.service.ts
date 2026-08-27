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
   * Genera flashcards inteligentes basadas en el tema o texto de estudio proporcionado.
   */
  public generateCards(promptOrText: string, count: number = 3): GeneratedCard[] {
    const text = promptOrText.trim().toLowerCase();
    const cards: GeneratedCard[] = [];

    if (text.includes('matemática') || text.includes('física') || text.includes('cálculo') || text.includes('cuántica')) {
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
        }
      );
    } else if (text.includes('corazón') || text.includes('anatomía') || text.includes('medicina') || text.includes('humans')) {
      cards.push(
        {
          front: '¿Cuál es la función principal de la Válvula Mitral (bicúspide)?',
          back: 'Permite el flujo unidireccional de sangre oxigenada desde la aurícula izquierda hacia el ventrículo izquierdo, impidiendo el reflujo retrógrado durante la sístole.',
          type: 'standard'
        },
        {
          front: '¿Dónde se origina el impulso eléctrico cardíaco normal?',
          back: 'En el **Nodo Sinoauricular (SA)**, ubicado en la parte superior de la aurícula derecha, actuando como el marcapasos natural.',
          type: 'standard'
        },
        {
          front: '¿Qué diferencia a la circulación sistémica de la pulmonar?',
          back: '**Circulación pulmonar**: Transporta sangre desoxigenada a los pulmones para intercambio gaseoso.\n**Circulación sistémica**: Distribuye sangre rica en $O_2$ a todos los tejidos del organismo.',
          type: 'standard'
        }
      );
    } else if (text.includes('inglés') || text.includes('idioma') || text.includes('english')) {
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
          back: '**Definition:** Fluent or persuasive in speaking or writing.\n\n*Synonyms:* Articulate, expressive, fluent.',
          type: 'standard'
        }
      );
    } else {
      // Generación a partir de oraciones o párrafos
      const lines = promptOrText.split('\n').filter(l => l.trim().length > 5);
      if (lines.length >= 2) {
        for (let i = 0; i < Math.min(count, Math.floor(lines.length / 2)); i++) {
          cards.push({
            front: lines[i * 2].trim(),
            back: lines[i * 2 + 1].trim(),
            type: 'standard'
          });
        }
      } else {
        cards.push(
          {
            front: `Concepto Clave: ${promptOrText.slice(0, 40)}...`,
            back: `Definición detallada y aplicación fundamental de ${promptOrText}.`,
            type: 'standard'
          },
          {
            front: `¿Cuál es el objetivo principal de ${promptOrText.slice(0, 30)}?`,
            back: `Consolidar el conocimiento activo mediante la práctica espaciada y el recuerdo activo.`,
            type: 'standard'
          }
        );
      }
    }

    return cards.slice(0, count);
  }
}

export const aiBuilderService = AiBuilderService.getInstance();
