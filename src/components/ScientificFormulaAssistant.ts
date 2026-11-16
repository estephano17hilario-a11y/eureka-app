import { callbackHost } from '../symbols/host';
import { openSymbolStudioLazy } from '../symbols/autocomplete';

export interface FormulaAssistantOptions {
  initialLatex?: string;
  onInsert?: (latex: string) => void;
  onClose?: () => void;
}

/**
 * Asistente de fórmulas. Ahora abre el estudio de símbolos universal (catálogo completo + editor visual);
 * se conserva esta función para los sitios que solo necesitan recibir el texto a insertar.
 */
export function openScientificFormulaAssistant(options: FormulaAssistantOptions = {}): void {
  const initial = (options.initialLatex || '').trim();
  // Solo se precarga si lo recibido es una fórmula suelta, no el texto completo de una tarjeta
  const single = /^\$\$?([^$]+)\$\$?$/.exec(initial);
  void openSymbolStudioLazy({
    host: callbackHost((text) => options.onInsert?.(text)),
    mode: 'compose',
    initialLatex: single ? single[1] : undefined,
    onClose: options.onClose
  });
}
