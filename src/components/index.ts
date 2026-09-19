/**
 * Eureka Components Module Barrel
 * Agrupación modular de componentes UI organizados por dominio funcional.
 */

// 1. Suite de Aprendizaje Feynman & Primeros Principios
export { openFeynmanDiagnosticModal, type FeynmanDiagnosticModalOptions } from './FeynmanDiagnosticModal';
export { openFeynmanGuideViewerModal, type FeynmanGuideViewerOptions } from './FeynmanGuideViewerModal';

// 2. Suite de Estudio Activo & Mapas Mentales
export {
  renderActiveStudyDashboard,
  bindActiveStudyDashboardEvents,
  openCreateTopicModal,
  POPULAR_SUBJECTS,
  getSubjectInfo
} from './ActiveStudyView';
export { UltraFastMindMap } from './UltraFastMindMap';
export { StudySession } from './StudySession';
export { FigmaStudySession } from './FigmaStudySession';

// 3. Gestión de Mazos, Submazos & Dashboards
export { renderFigmaDeckDashboard, bindFigmaDashboardEvents } from './FigmaDeckDashboard';
export { renderFigmaDeckList, bindFigmaDeckListEvents } from './FigmaDeckList';
export { renderFigmaSubdeckList, bindFigmaSubdeckEvents } from './FigmaSubdeckList';
export { renderFigmaDeckSettingsView, bindFigmaDeckSettingsViewEvents } from './FigmaDeckSettingsView';
export { renderFigmaAdvancedDeckMenuView, bindFigmaAdvancedDeckMenuViewEvents } from './FigmaAdvancedDeckMenuView';
export { renderFigmaLibraryView, bindFigmaLibraryEvents } from './FigmaLibraryView';

// 4. Editores de Tarjetas, Oclusión de Imágenes & Asistentes Científicos
export { renderFigmaCardEditor, bindFigmaCardEditorEvents } from './FigmaCardEditor';
export { renderCardEditorModal, bindCardEditorModalEvents } from './CardEditorModal';
export { MathEditorDrawer } from './MathEditorDrawer';
export { PhotomathNodeEditor } from './PhotomathNodeEditor';
export { openScientificFormulaAssistant } from './ScientificFormulaAssistant';
export { ImageOcclusionEditor } from './ImageOcclusionEditor';
export { openImageOcclusionModal } from './ImageOcclusionModal';
export { UniversalSymbolSelectorDrawer } from './UniversalSymbolSelectorDrawer';

// 5. Layout, Navegación, Ajustes & Autenticación
export { renderFigmaHeader, type FigmaMainTab } from './FigmaHeader';
export { renderFigmaAppSettingsView, bindFigmaAppSettingsViewEvents } from './FigmaAppSettingsView';
export { renderFigmaAlgorithmSelectorView, bindFigmaAlgorithmSelectorViewEvents } from './FigmaAlgorithmSelectorView';
export { renderFigmaLearningPhaseView, bindFigmaLearningPhaseViewEvents } from './FigmaLearningPhaseView';
export { openAuthModal } from './AuthModal';
export { openFigmaBatchImportModal } from './FigmaBatchImportModal';
export { openFigmaAiBuilderModal } from './FigmaAiBuilderModal';
export { openMicroGameModal } from './MicroGameModal';
