// Estructura del Esquema / Mapa Conceptual
export interface OutlineNode {
  id: string;
  topicId: string;
  parentId: string | null; // null si es nodo raíz
  orderIndex: number;
  text: string;
  linkedFlashcardId?: string; // Flashcard asociada como soporte (opcional)
  children?: OutlineNode[];
}

// Unidad Atómica de Información dentro de un Tema
export interface StudyChunk {
  id: string;
  topicId: string;
  orderIndex: number;
  title: string;
  sourceContent: string; // Texto original o contenido de estudio
  isCompleted: boolean;
}

// Estado de Bloqueo y Acceso al Contenido Original (24 horas)
export interface TopicAccessLock {
  topicId: string;
  userId: string;
  completedAt: string | null; // ISO Date al finalizar todo el tema
  unlockAvailableAt: string | null; // completedAt + 24 horas
  isContentHidden: boolean;
}

// Extensión al modelo existente de Flashcard
export interface StudyFlashcardExtension {
  id: string; // ID existente
  chunkId: string; // Relación con el fragmento de origen
  front: string; // Anverso (pregunta/estímulo)
  back: string;  // Reverso (respuesta)
}

// Máquina de estados para la sesión de estudio activo
export type ActiveStudyState =
  | 'READING_CHUNK'
  | 'CARDS_CREATED'
  | 'BUILDING_OUTLINE'
  | 'CHUNK_COMPLETED'
  | 'TOPIC_CONSOLIDATED';

// Tema completo de estudio activo
export interface ActiveStudyTopic {
  id: string;
  deckId: string;
  title: string;
  description?: string;
  chunks: StudyChunk[];
  currentChunkIndex: number;
  state: ActiveStudyState;
  createdAt: number;
  updatedAt: number;
}
