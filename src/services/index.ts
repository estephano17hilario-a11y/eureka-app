/**
 * Eureka Services Module Barrel
 * Agrupación modular de todos los servicios del ecosistema Eureka.
 */

// 1. Pedagogía Feynman y Modelos de Lenguaje
export { feynmanPedagogyService, FeynmanPedagogyService } from './feynman-pedagogy.service';
export { feynmanLlmService, FeynmanLlmService } from './feynman-llm.service';
export { feynmanSandboxService, FeynmanSandboxService } from './feynman-sandbox.service';

// 2. Estudio Activo y Algoritmos de Memoria
export { activeStudyService } from './active-study.service';
export { srsService } from './srs.service';
export { deckService } from './deck.service';
export { aiBuilderService } from './ai-builder.service';

// 3. Motores de Renderizado, Matemáticas & Voz
export { katexService } from './katex.service';
export { ce, getComputeEngine } from './math-engine.service';
export { ttsService } from './tts.service';

// 4. Plataforma, Sistema & Persistencia VPS
export { eurekaBackend } from './backend.service';
export { dialogService } from './dialog.service';
export { nativeService } from './native.service';
export { themeService } from './theme.service';
