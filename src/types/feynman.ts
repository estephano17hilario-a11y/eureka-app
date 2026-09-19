/**
 * Tipos de datos para el Sistema de Diagnóstico y Generación de Rutas Feynman
 */

export type FeynmanCurrentLevel = 1 | 2 | 3 | 4 | 5;

export interface FeynmanCurrentLevelOption {
  level: FeynmanCurrentLevel;
  title: string;
  description: string;
  badge: string;
}

export const FEYNMAN_CURRENT_LEVELS: FeynmanCurrentLevelOption[] = [
  {
    level: 1,
    title: 'Nivel 1: Principiante absoluto',
    description: 'Cero nociones del tema. Requiere partir de cero con analogías físicas simples.',
    badge: '🌱 Novato'
  },
  {
    level: 2,
    title: 'Nivel 2: Principiante con nociones',
    description: 'Conoce términos sueltos y vocabulario, pero sin aplicación práctica.',
    badge: '🔍 Nociones'
  },
  {
    level: 3,
    title: 'Nivel 3: Intermedio básico',
    description: 'Entiende la teoría general, pero tiene poca práctica resolutiva.',
    badge: '⚡ Intermedio'
  },
  {
    level: 4,
    title: 'Nivel 4: Intermedio avanzado',
    description: 'Aplica el tema regularmente con bases sólidas y fluidez operativa.',
    badge: '🚀 Sólido'
  },
  {
    level: 5,
    title: 'Nivel 5: Avanzado / Experto',
    description: 'Busca optimización, arquitecturas complejas, casos límite y excepciones.',
    badge: '👑 Experto'
  }
];

export type FeynmanTargetGoal = 'general' | 'adentrado' | 'especializado';

export interface FeynmanTargetGoalOption {
  goal: FeynmanTargetGoal;
  title: string;
  description: string;
  levelsCount: 10 | 15 | 20;
  badge: string;
  gradient: string;
}

export const FEYNMAN_TARGET_GOALS: FeynmanTargetGoalOption[] = [
  {
    goal: 'general',
    title: 'Conocedor general',
    description: 'Comprender conceptos clave, intuición de primeros principios y visión global integral.',
    levelsCount: 10,
    badge: '10 Niveles',
    gradient: 'linear-gradient(135deg, #0284c7, #38bdf8)'
  },
  {
    goal: 'adentrado',
    title: 'Conocedor adentrado',
    description: 'Dominio práctico y analítico profundo para resolver problemas técnicos reales.',
    levelsCount: 15,
    badge: '15 Niveles',
    gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)'
  },
  {
    goal: 'especializado',
    title: 'Conocedor exigente especializado',
    description: 'Rigor técnico exhaustivo, arquitectura avanzada, excepciones críticas y estándares del estado del arte.',
    levelsCount: 20,
    badge: '20 Niveles',
    gradient: 'linear-gradient(135deg, #be123c, #f43f5e)'
  }
];

export interface FeynmanDiagnosticForm {
  topic: string;
  subject?: string; // Categoría de materia (Matemáticas, Historia, Derecho, etc.)
  currentLevel: FeynmanCurrentLevel;
  previousKnowledge?: string;
  targetGoal: FeynmanTargetGoal;
  specificFocus?: string;
  hasAttachedInfo?: boolean;
  attachedInfoType?: 'support' | 'total_basis'; // Apoyo complementario vs Base total de la explicación
  attachedInfoContent?: string;
}

export interface FeynmanAtomicSublevel {
  sublevelNumber: string; // Ej: "1.1", "1.2"
  concept: string;
  intuition?: string; // 1º: Intuición Feynman (resumida, cotidiana, fácil de entender)
  keyIdea: string; // 2º: Idea Clave (términos formales y rigurosos)
  mechanism: string; // 3º: Cadena Causal (mecanismo causa-efecto)
  mathType?: 'standard' | 'eureka'; // '(FORMALISMO MATEMÁTICO)' o '(FORMALISMO MATEMÁTICO EUREKA)'
  equation?: string; // 4º: Formalismo Matemático (solo si aplica al dominio)
  boundaryCondition?: string;
  visualResourceUrl?: string;
}

export interface FeynmanQuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctIndex: number; // 0-based
  explanation: string;
  conceptTested?: string;
}

export interface FeynmanLevelExam {
  title?: string;
  questions: FeynmanQuizQuestion[];
  practicalChallenge?: string;
  examReactCode?: string; // Código opcional de examen interactivo (+400 líneas)
}

export interface FeynmanFinalExam {
  title: string;
  summary: string;
  questions: FeynmanQuizQuestion[]; // Quizz integral de maestría
  masterReactCode: string; // Mega-Simulador Evaluador de +1000 líneas en React+TypeScript
}

export interface FeynmanLevel {
  levelNumber: number;
  title: string;
  axiomIntuition: string;
  sublevels: FeynmanAtomicSublevel[];
  typescriptCode: string; // Componente interactivo React+TS (+500 líneas)
  causalNexus: {
    solvedProblem: string;
    nextObstacle: string;
  };
  exam?: FeynmanLevelExam;
}

export interface FeynmanStudyGuide {
  id: string;
  topic: string;
  formData: FeynmanDiagnosticForm;
  levelsCount: 10 | 15 | 20;
  markdown: string;
  levels: FeynmanLevel[];
  finalExam?: FeynmanFinalExam;
  createdAt: number;
}

