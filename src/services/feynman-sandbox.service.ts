/**
 * Servicio de Sandbox para Ejecución en Vivo de Código React & TypeScript en Eureka.
 * Renderiza componentes interactivos de React 18 (TSX / Functional Components con Hooks),
 * transpilación instantánea con Sucrase, Tailwind CSS, Lucide icons, Canvas 2D,
 * visor de código con números de línea, vista dividida (Split View) y consola de depuración.
 */
import { transform } from 'sucrase';
import { katexService } from './katex.service';

export class FeynmanSandboxService {
  private static instance: FeynmanSandboxService;

  private constructor() {}

  public static getInstance(): FeynmanSandboxService {
    if (!FeynmanSandboxService.instance) {
      FeynmanSandboxService.instance = new FeynmanSandboxService();
    }
    return FeynmanSandboxService.instance;
  }

  /**
   * Transpila código TypeScript y React (TSX / JSX) a JavaScript ejecutable en el navegador usando Sucrase.
   * Elimina tipos, interfaces, genéricos y convierte sintaxis JSX en llamadas React.createElement con 100% de fidelidad.
   */
  public transpileTsToJs(tsCode: string): string {
    if (!tsCode || !tsCode.trim()) return '';

    // 1. Limpieza de bloques de markdown si vinieran encapsulados
    let cleanTs = tsCode
      .replace(/^```(?:typescript|ts|tsx|jsx|javascript|js|react)?\s*\n?/i, '')
      .replace(/\n?```\s*$/i, '')
      .trim();

    // 2. Si el código no tiene export default / exports.default, detectar componente principal y auto-exportarlo
    cleanTs = this.ensureComponentExport(cleanTs);

    // 3. Transpilación primaria con Sucrase (TypeScript + JSX + ESM Imports/Exports)
    try {
      const result = transform(cleanTs, {
        transforms: ['typescript', 'jsx', 'imports'],
        jsxRuntime: 'classic',
        production: true
      });
      return result.code;
    } catch (err: any) {
      console.warn('[FeynmanSandbox] Sucrase standard transpilation error, trying tolerant mode:', err?.message);
    }

    // 4. Transpilación tolerante de rescate
    try {
      // Limpiar declaraciones problemáticas antes de segundo intento
      let sanitized = cleanTs
        .replace(/import\s+type\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
        .replace(/export\s+type\s+[\s\S]*?;/g, '')
        .replace(/export\s+interface\s+[\s\S]*?\}/g, '')
        .replace(/interface\s+[A-Za-z0-9_]+(?:\s*<[^>]+>)?(?:\s+extends\s+[^{]+)?\s*\{[\s\S]*?\}/g, '')
        .replace(/type\s+[A-Za-z0-9_]+(?:\s*<[^>]+>)?\s*=\s*[^;]+;/g, '');

      const result = transform(sanitized, {
        transforms: ['typescript', 'jsx', 'imports'],
        jsxRuntime: 'classic',
        production: true
      });
      return result.code;
    } catch (secondErr: any) {
      console.warn('[FeynmanSandbox] Sucrase fallback failed, running JSX-only transform:', secondErr?.message);
      try {
        let stripped = this.stripTypeScriptTypes(cleanTs);
        const result = transform(stripped, {
          transforms: ['jsx', 'imports'],
          jsxRuntime: 'classic',
          production: true
        });
        return result.code;
      } catch (finalErr: any) {
        console.error('[FeynmanSandbox] All transpilation passes failed:', finalErr?.message);
        return `console.error("Error de transpilación: " + ${JSON.stringify(finalErr?.message || 'Error desconocido')});`;
      }
    }
  }

  /**
   * Garantiza que el código tenga un export default para que el harness lo monte automáticamente.
   */
  private ensureComponentExport(code: string): string {
    if (
      code.includes('export default') ||
      code.includes('export {') ||
      code.includes('exports.default') ||
      code.includes('module.exports') ||
      code.includes('ReactDOM.render') ||
      code.includes('createRoot(')
    ) {
      return code;
    }

    // Buscar nombres de componentes candidatos (PascalCase: App, Simulator, etc.)
    const funcMatch = code.match(/(?:function|const|let|var|class)\s+([A-Z][A-Za-z0-9_]*)/);
    if (funcMatch && funcMatch[1]) {
      const compName = funcMatch[1];
      return `${code}\n\nexport default ${compName};`;
    }

    return code;
  }

  /**
   * Limpia tipos de TypeScript de forma tolerante para transpilación JSX directa.
   */
  private stripTypeScriptTypes(tsCode: string): string {
    let js = tsCode;
    js = js.replace(/import\s+type\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '');
    js = js.replace(/export\s+type\s+[\s\S]*?;/g, '');
    js = js.replace(/export\s+interface\s+[\s\S]*?\}/g, '');
    js = js.replace(/interface\s+[A-Za-z0-9_]+(?:\s*<[^>]+>)?(?:\s+extends\s+[^{]+)?\s*\{[\s\S]*?\}/g, '');
    js = js.replace(/type\s+[A-Za-z0-9_]+(?:\s*<[^>]+>)?\s*=\s*[^;]+;/g, '');
    js = js.replace(/\b(public|private|protected|readonly|abstract|override|declare)\s+/g, '');
    js = js.replace(/\b(const|let|var)\s+([A-Za-z0-9_$]+)\s*:\s*[A-Za-z0-9_<>[\]|&{}:,\s]+?\s*=/g, '$1 $2 =');
    js = js.replace(/\s+as\s+[A-Za-z0-9_<>[\]|&]+/g, '');
    js = js.replace(/<[A-Za-z0-9_,\s<>]+>(?=\s*[\(\{])/g, '');
    return js;
  }

  /**
   * Genera el HTML completo del entorno aislado de React 18 + TypeScript + Tailwind CSS.
   * Incluye React 18, ReactDOM 18 (createRoot), Tailwind CDN, Lucide Icons, Canvas 2D,
   * React ErrorBoundary, audio sintetizado, y auto-montador de componentes React.
   */
  public generateSandboxHtml(tsCode: string, _levelTitle?: string): string {
    const transpiledJs = this.transpileTsToJs(tsCode);
    const jsonCode = JSON.stringify(transpiledJs);

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Tailwind CSS CDN para estética moderna y rápida -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- React 18 & ReactDOM 18 UMD -->
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script>
    // Configuración Tailwind
    if (window.tailwind) {
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            colors: {
              brand: {
                50: '#f0f9ff',
                100: '#e0f2fe',
                400: '#38bdf8',
                500: '#0ea5e9',
                600: '#0284c7',
                700: '#0369a1',
                900: '#0c4a6e',
              }
            }
          }
        }
      }
    }
  </script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      background: #030712;
      color: #f8fafc;
      width: 100%;
      min-height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      overflow-x: hidden;
      overflow-y: auto;
      -webkit-font-smoothing: antialiased;
    }
    /* Contenedor principal de la aplicación React */
    #root, #app {
      width: 100%;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 2;
    }
    /* Canvas subyacente para simulaciones físicas/gráficas */
    #canvas {
      display: none;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      cursor: crosshair;
      outline: none;
    }
    /* Estilos Glassmorphism elegantes */
    .glass-card {
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
    }
    .glass-btn {
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.35);
      color: #38bdf8;
      transition: all 0.2s ease;
    }
    .glass-btn:hover {
      background: rgba(56, 189, 248, 0.28);
      border-color: rgba(56, 189, 248, 0.6);
      transform: translateY(-1px);
    }
    /* Barra de scroll estilizada */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.3); }
    ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.18); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(56, 189, 248, 0.4); }

    /* Consola flotante compacta */
    #termDrawer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      max-height: 140px;
      background: rgba(3, 7, 18, 0.96);
      border-top: 1px solid rgba(56, 189, 248, 0.25);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      display: flex;
      flex-direction: column;
      z-index: 9999;
      backdrop-filter: blur(10px);
      transition: all 0.2s ease;
    }
    #termDrawer.hidden {
      display: none !important;
    }
    .term-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 14px;
      background: rgba(15, 23, 42, 0.95);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 10px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .term-body {
      flex: 1;
      overflow-y: auto;
      padding: 8px 14px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .log-line { word-break: break-all; color: #cbd5e1; line-height: 1.4; }
    .log-err { color: #f87171; background: rgba(239, 68, 68, 0.12); padding: 3px 8px; border-radius: 4px; }
    .log-warn { color: #fbbf24; }

    #errBanner {
      position: fixed;
      top: 12px;
      left: 12px;
      right: 12px;
      padding: 12px 16px;
      background: rgba(239, 68, 68, 0.94);
      color: #fff;
      font-weight: 600;
      font-size: 13px;
      border-radius: 12px;
      z-index: 10000;
      display: none;
      box-shadow: 0 8px 24px rgba(0,0,0,0.6);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
  </style>
</head>
<body class="bg-slate-950 text-slate-100">
  <div id="errBanner"></div>
  <canvas id="canvas" tabindex="0"></canvas>
  <div id="root"></div>
  <div id="app"></div>

  <div id="termDrawer" class="hidden">
    <div class="term-head">
      <span>📟 Consola React (<span id="termCount">0</span>)</span>
      <button id="btnClear" style="background:transparent; border:none; color:#94a3b8; cursor:pointer; font-size:10px;">Limpiar</button>
    </div>
    <div class="term-body" id="termLogs"></div>
  </div>

  <!-- SCRIPT 1: SETUP HARNESS, REACT HOOKS GLOBALES & REQUIRE SHIM -->
  <script>
    // Exponer hooks de React globalmente para código que no use 'React.'
    if (window.React) {
      window.useState = window.React.useState;
      window.useEffect = window.React.useEffect;
      window.useMemo = window.React.useMemo;
      window.useCallback = window.React.useCallback;
      window.useRef = window.React.useRef;
      window.useReducer = window.React.useReducer;
      window.useContext = window.React.useContext;
      window.createContext = window.React.createContext;
      window.Fragment = window.React.Fragment;
    }

    // Auto-revelar canvas si el código obtiene su contexto 2D
    if (typeof HTMLCanvasElement !== 'undefined') {
      var _origGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type) {
        if (this.id === 'canvas' || this.tagName.toLowerCase() === 'canvas') {
          this.style.display = 'block';
        }
        return _origGetContext.apply(this, arguments);
      };
    }

    // Lucide Icons Mock/Shim para React
    window.LucideIcons = new Proxy({}, {
      get: function(target, prop) {
        return function(props) {
          props = props || {};
          var size = props.size || 20;
          var className = props.className || '';
          return window.React.createElement('span', {
            className: 'inline-flex items-center justify-center ' + className,
            style: { width: size + 'px', height: size + 'px', fontSize: (size * 0.75) + 'px' }
          }, '✨');
        };
      }
    });

    // Fallback Proxy para imports externos no empaquetados
    var safeFallbackObj = new Proxy(function() { return null; }, {
      get: function(target, prop) {
        if (prop === '__esModule') return true;
        if (prop === 'default') return function(props) { return (props && props.children) ? props.children : null; };
        return function(props) { return (props && props.children) ? props.children : null; };
      }
    });

    // Módulo require shim
    window.require = function(mod) {
      if (mod === 'react') return window.React;
      if (mod === 'react-dom' || mod === 'react-dom/client') return window.ReactDOM;
      if (mod === 'lucide-react' || (typeof mod === 'string' && mod.indexOf('lucide') !== -1)) return window.LucideIcons;
      if (window[mod]) return window[mod];
      return safeFallbackObj;
    };
    window.exports = {};
    window.module = { exports: window.exports };

    // Logger & Error Handling
    window.__EUREKA__ = {
      logCount: 0,
      showError: function(msg) {
        var errBanner = document.getElementById('errBanner');
        if (errBanner) {
          errBanner.innerHTML = '<div style="display:flex; justify-content:space-between; align-items:center;"><span>⚠️ ' + 
            String(msg).replace(/</g, '&lt;') + 
            '</span><button onclick="this.parentElement.parentElement.style.display=\\'none\\'" style="background:transparent; border:none; color:#fff; cursor:pointer; font-weight:bold; margin-left:12px;">✕</button></div>';
          errBanner.style.display = 'block';
        }
        window.__EUREKA__.appendLog('ERROR: ' + msg, 'log-err');
      },
      appendLog: function(str, cls) {
        var termDrawer = document.getElementById('termDrawer');
        var termLogs = document.getElementById('termLogs');
        var termCount = document.getElementById('termCount');
        if (!termLogs || !termDrawer) return;
        termDrawer.classList.remove('hidden');
        var d = document.createElement('div');
        d.className = 'log-line ' + (cls || '');
        d.textContent = str;
        termLogs.appendChild(d);
        window.__EUREKA__.logCount++;
        if (termCount) termCount.textContent = window.__EUREKA__.logCount;
        termLogs.scrollTop = termLogs.scrollHeight;
      }
    };

    var btnClear = document.getElementById('btnClear');
    if (btnClear) {
      btnClear.addEventListener('click', function() {
        var termLogs = document.getElementById('termLogs');
        var termCount = document.getElementById('termCount');
        var termDrawer = document.getElementById('termDrawer');
        if (termLogs) termLogs.innerHTML = '';
        window.__EUREKA__.logCount = 0;
        if (termCount) termCount.textContent = '0';
        if (termDrawer) termDrawer.classList.add('hidden');
      });
    }

    var _origLog = console.log;
    console.log = function() {
      var args = Array.prototype.slice.call(arguments);
      var msg = args.map(function(a) {
        return (typeof a === 'object') ? JSON.stringify(a) : String(a);
      }).join(' ');
      window.__EUREKA__.appendLog(msg);
      _origLog.apply(console, arguments);
    };

    var _origWarn = console.warn;
    console.warn = function() {
      var args = Array.prototype.slice.call(arguments);
      window.__EUREKA__.appendLog('WARN: ' + args.join(' '), 'log-warn');
      _origWarn.apply(console, arguments);
    };

    var _origErr = console.error;
    console.error = function() {
      var args = Array.prototype.slice.call(arguments);
      window.__EUREKA__.showError(args.join(' '));
      _origErr.apply(console, arguments);
    };

    window.onerror = function(msg, src, lineno, colno, err) {
      window.__EUREKA__.showError((err && err.message) ? err.message : msg);
      return false;
    };

    window.addEventListener('unhandledrejection', function(e) {
      window.__EUREKA__.showError(e.reason ? (e.reason.message || String(e.reason)) : 'Promise rechazada');
    });

    // Helper global de audio sintetizado
    window.playTone = function(freq, type, duration, vol) {
      try {
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        if (!window._audioCtx) window._audioCtx = new AudioCtx();
        if (window._audioCtx.state === 'suspended') window._audioCtx.resume();
        var osc = window._audioCtx.createOscillator();
        var gain = window._audioCtx.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq || 440, window._audioCtx.currentTime);
        gain.gain.setValueAtTime(vol || 0.08, window._audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, window._audioCtx.currentTime + (duration || 0.2));
        osc.connect(gain);
        gain.connect(window._audioCtx.destination);
        osc.start();
        osc.stop(window._audioCtx.currentTime + (duration || 0.2));
      } catch(e) {}
    };

    // React ErrorBoundary Component
    if (window.React) {
      window.FeynmanErrorBoundary = class extends window.React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false, error: null };
        }
        static getDerivedStateFromError(error) {
          return { hasError: true, error: error };
        }
        componentDidCatch(error, errorInfo) {
          console.error('React ErrorBoundary:', error, errorInfo);
        }
        render() {
          if (this.state.hasError) {
            return window.React.createElement('div', {
              className: 'p-6 m-4 bg-red-950/80 border border-red-500/40 rounded-2xl text-red-200 backdrop-blur-md shadow-2xl flex flex-col gap-4'
            }, [
              window.React.createElement('div', { key: 'head', className: 'flex items-center gap-3 text-red-400 font-bold text-lg' }, [
                window.React.createElement('span', { key: 'icon', className: 'text-2xl' }, '⚠️'),
                'Error en la Ejecución del Componente React'
              ]),
              window.React.createElement('p', { key: 'msg', className: 'text-sm font-mono bg-black/40 p-3 rounded-lg border border-red-900/50 break-all' },
                this.state.error ? (this.state.error.message || String(this.state.error)) : 'Error desconocido'
              ),
              window.React.createElement('button', {
                key: 'retry',
                onClick: () => this.setState({ hasError: false, error: null }),
                className: 'self-start px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold text-xs uppercase tracking-wider transition-all'
              }, '🔄 Reintentar Renderizado')
            ]);
          }
          return this.props.children;
        }
      };
    }
  </script>

  <!-- SCRIPT 2: EJECUCIÓN SEGURA Y AISLADA DE REACT + TYPESCRIPT -->
  <script>
    (function() {
      try {
        var codeToRun = ${jsonCode};
        var runner = new Function('React', 'ReactDOM', 'exports', 'module', 'require', codeToRun);
        runner(window.React, window.ReactDOM, window.exports, window.module, window.require);
      } catch (err) {
        console.error('Error al evaluar código del simulador:', err);
        window.__EUREKA__.showError(err.message || String(err));
      }
    })();
  </script>

  <!-- SCRIPT 3: AUTO-MONTAJE Y RENDERIZADO DE REACT 18 -->
  <script>
    (function() {
      try {
        // 1. Identificar el componente React a montar desde exports o globals
        var targetComponent = 
          (window.exports && (window.exports.default || window.exports.App || window.exports.Simulator || window.exports.InteractiveGuide || window.exports.Main)) ||
          (window.module && window.module.exports && (
            (typeof window.module.exports === 'function' ? window.module.exports : null) ||
            window.module.exports.default || 
            window.module.exports.App || 
            window.module.exports.Simulator
          )) ||
          window.App || 
          window.Simulator || 
          window.InteractiveGuide || 
          window.FeynmanComponent || 
          window.Main;

        if (!targetComponent && window.exports) {
          for (var key in window.exports) {
            if (typeof window.exports[key] === 'function') {
              targetComponent = window.exports[key];
              break;
            }
          }
        }

        var rootContainer = document.getElementById('root') || document.getElementById('app');

        if (targetComponent && typeof targetComponent === 'function' && window.React && rootContainer) {
          var appElement = window.React.createElement(
            window.FeynmanErrorBoundary || window.React.Fragment,
            null,
            window.React.createElement(targetComponent)
          );

          if (window.ReactDOM && typeof window.ReactDOM.createRoot === 'function') {
            var root = window.ReactDOM.createRoot(rootContainer);
            root.render(appElement);
          } else if (window.ReactDOM && typeof window.ReactDOM.render === 'function') {
            window.ReactDOM.render(appElement, rootContainer);
          }
        } else {
          // Si no es un componente React puro, verificar funciones de inicio de Canvas / Vanilla JS
          var startFuncs = ['init', 'start', 'run', 'play', 'main', 'startSimulation', 'initGame', 'setup'];
          for (var i = 0; i < startFuncs.length; i++) {
            var fnName = startFuncs[i];
            if (typeof window[fnName] === 'function') {
              try { window[fnName](); } catch(e) {}
            }
          }
        }
      } catch(err) {
        window.__EUREKA__.showError(err.message || String(err));
      }
    })();
  </script>
</body>
</html>`;
  }

  /**
   * Codifica el documento HTML a un Data URL Base64 con UTF-8 exacto
   */
  public encodeHtmlToDataUrl(html: string): string {
    try {
      if (typeof btoa !== 'undefined') {
        return 'data:text/html;charset=utf-8;base64,' + btoa(unescape(encodeURIComponent(html)));
      }
      if (typeof Buffer !== 'undefined') {
        return 'data:text/html;charset=utf-8;base64,' + Buffer.from(html, 'utf8').toString('base64');
      }
    } catch (err) {
      console.warn('[FeynmanSandbox] DataUrl fallback:', err);
    }
    return 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
  }

  /**
   * Resalta sintaxis básica de TypeScript y React (TSX) para una lectura ultra-clara
   */
  public formatSyntaxHighlighting(code: string): string {
    const lines = code.split('\n');
    return lines
      .map((line, idx) => {
        const lineNum = idx + 1;
        const escaped = this.escapeHtml(line);
        // Resaltado de palabras clave de TypeScript y React
        const highlighted = escaped
          .replace(/\b(import|export|default|from|const|let|var|function|return|if|else|for|while|switch|case|break|try|catch|throw|class|interface|type|extends|implements|new|async|await|typeof|as)\b/g, '<span class="tok-keyword">$1</span>')
          .replace(/\b(useState|useEffect|useMemo|useCallback|useRef|useReducer|useContext)\b/g, '<span class="tok-hook">$1</span>')
          .replace(/\b(React|ReactDOM|Array|Object|String|Number|Boolean|Promise|Map|Set|Math|Date)\b/g, '<span class="tok-builtin">$1</span>')
          .replace(/(&lt;\/?[A-Z][A-Za-z0-9_]*|&lt;\/?(?:div|span|button|input|p|h1|h2|h3|h4|h5|h6|select|option|label|form|ul|li|section|header|footer|nav|svg|path|canvas|main|aside)&gt;|&lt;\/?(?:div|span|button|input|p|h1|h2|h3|h4|h5|h6|select|option|label|form|ul|li|section|header|footer|nav|svg|path|canvas|main|aside)\b)/g, '<span class="tok-tag">$1</span>')
          .replace(/(&quot;[^&]*&quot;|&#039;[^&]*&#039;|`[^`]*`)/g, '<span class="tok-string">$1</span>')
          .replace(/(\/\/[^\n]*)/g, '<span class="tok-comment">$1</span>');

        return `<div class="code-line"><span class="code-gutter">${lineNum}</span><span class="code-content">${highlighted || '&nbsp;'}</span></div>`;
      })
      .join('');
  }

  /**
   * Genera el widget interactivo HTML optimizado para React 18 + TypeScript (TSX).
   * Incluye barra de herramientas moderna, selector de vistas (En Vivo, Código TSX, Dividida, Consola),
   * hot-reload, copiado y pantalla completa.
   */
  public renderInteractiveSandboxWidget(tsCode: string, levelTitle: string = 'Simulador Interactivo'): string {
    const sandboxDoc = this.generateSandboxHtml(tsCode, levelTitle);
    const dataUrl = this.encodeHtmlToDataUrl(sandboxDoc);
    const lineCount = (tsCode.match(/\n/g) || []).length + 1;
    const highlightedCodeHtml = this.formatSyntaxHighlighting(tsCode);
    const rawEscaped = this.escapeHtml(tsCode);

    return `
      <div class="feynman-interactive-sandbox-widget apple-glass-panel" style="margin: 20px 0; border: 1px solid rgba(56,189,248,0.3); border-radius: 18px; overflow: hidden; background: #030712; box-shadow: 0 16px 40px rgba(0,0,0,0.65);">
        <!-- BARRA SUPERIOR ESTILO IDE PROFESIONAL -->
        <div class="reading-sandbox-header" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(15,23,42,0.92); flex-wrap: wrap; gap: 10px;">
          <!-- Título & Tag del Entorno -->
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="width: 9px; height: 9px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981; display: inline-block;"></span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 0.82rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.04em;">⚛️ React 18 • TypeScript</span>
              <span style="font-size: 0.72rem; color: #94a3b8; background: rgba(56,189,248,0.12); padding: 2px 8px; border-radius: 999px; border: 1px solid rgba(56,189,248,0.25);">
                ${lineCount} líneas
              </span>
            </div>
          </div>

          <!-- Selector de Vistas Segmentadas (Tabs Pills) -->
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <div class="reading-sandbox-view-pills" style="display: flex; background: rgba(0,0,0,0.5); padding: 3px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
              <button class="btn-toggle-reading-sandbox active" data-view="live" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 7px; color: #fff; background: rgba(56,189,248,0.25); border: none; cursor: pointer; display: flex; align-items: center; gap: 5px;" title="Ver ejecución en vivo de React">
                <span>⚡</span><span>App en Vivo</span>
              </button>
              <button class="btn-toggle-reading-sandbox" data-view="code" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 7px; color: #94a3b8; background: transparent; border: none; cursor: pointer; display: flex; align-items: center; gap: 5px;" title="Ver código fuente en TypeScript y React">
                <span>📝</span><span>Código TSX</span>
              </button>
              <button class="btn-toggle-reading-sandbox" data-view="split" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 7px; color: #94a3b8; background: transparent; border: none; cursor: pointer; display: flex; align-items: center; gap: 5px;" title="Ver App y Código en paralelo">
                <span>🪟</span><span>Vista Dividida</span>
              </button>
            </div>

            <!-- Acciones Rápidas: Reiniciar, Copiar, Pantalla Completa -->
            <div style="display: flex; align-items: center; gap: 6px;">
              <button class="figma-btn-ghost btn-reload-reading-sandbox" style="padding: 5px 10px; font-size: 0.75rem; border-radius: 7px; border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="Reiniciar App">
                <span>🔄</span><span>Reiniciar</span>
              </button>
              <button class="figma-btn-ghost btn-copy-reading-ts-code" style="padding: 5px 12px; font-size: 0.75rem; border-radius: 7px; border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="Copiar código fuente TSX">
                <span>📋</span><span>Copiar</span>
              </button>
              <button class="figma-btn-ghost btn-fullscreen-reading-sandbox" style="padding: 5px 8px; font-size: 0.75rem; border-radius: 7px; border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; cursor: pointer;" title="Pantalla Completa">
                <span>⛶</span>
              </button>
            </div>
          </div>
        </div>

        <!-- CONTENEDOR PRINCIPAL INTERACTIVO -->
        <div class="reading-sandbox-main-layout" style="width: 100%; position: relative; background: #030712;">
          <!-- 1. CONTENEDOR DE EJECUCIÓN REACT EN VIVO (Visible por defecto) -->
          <div class="reading-sandbox-live-box reading-sandbox-output-box" style="width: 100%; height: 580px; overflow: hidden; background: #030712; display: block;">
            <iframe 
              src="${dataUrl}" 
              tabindex="0"
              style="width: 100%; height: 100%; border: none; background: transparent; display: block;"
            ></iframe>
          </div>

          <!-- 2. CONTENEDOR DE CÓDIGO FUENTE TSX + REACT (Oculto por defecto en vista live) -->
          <div class="reading-sandbox-code-box" style="width: 100%; height: 580px; overflow: hidden; border-top: 1px solid rgba(255,255,255,0.06); display: none; background: #070b14;">
            <div style="padding: 8px 16px; background: rgba(15,23,42,0.8); border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.74rem; font-weight: 700; color: #38bdf8; font-family: ui-monospace, monospace;">⚛️ App.tsx (React 18 + TSX)</span>
              <span style="font-size: 0.7rem; color: #64748b;">TypeScript 5.x • Sucrase Transpiler</span>
            </div>
            <div class="code-viewer-scrollable" style="height: calc(100% - 37px); overflow-y: auto; overflow-x: auto; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.84rem; line-height: 1.6; color: #e2e8f0; background: #050811;">
              ${highlightedCodeHtml}
            </div>
            <textarea class="ts-code-raw-hidden" style="display: none;">${rawEscaped}</textarea>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Parsea un contenido Markdown de estudio, detecta bloques de código TypeScript / React / TSX,
   * y los sustituye por el widget interactivo de React + TypeScript.
   */
  public renderContentWithSandboxes(content: string, title?: string): string {
    if (!content) return '';

    const tsCodeRegex = /```(?:typescript|ts|tsx|jsx|javascript|js|react)\n?([\s\S]*?)```/gi;
    if (!tsCodeRegex.test(content)) {
      return katexService.parseAndRender(content);
    }

    tsCodeRegex.lastIndex = 0;
    let resultHtml = '';
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tsCodeRegex.exec(content)) !== null) {
      const matchIndex = match.index;
      const textBefore = content.substring(lastIndex, matchIndex);
      const rawTsCode = match[1].trim();

      const cleanedTextBefore = textBefore
        .replace(/\*\*Simulador (?:TypeScript|React):?\*\*\s*$/i, '')
        .replace(/##+\s*(?:3\.\s*)?Panel Interactivo(?:\s*\([^)]*\))?:?\s*$/i, '');

      if (cleanedTextBefore) {
        resultHtml += katexService.parseAndRender(cleanedTextBefore);
      }

      resultHtml += this.renderInteractiveSandboxWidget(rawTsCode, title || 'Simulador Interactivo');
      lastIndex = matchIndex + match[0].length;
    }

    const textAfter = content.substring(lastIndex);
    if (textAfter) {
      resultHtml += katexService.parseAndRender(textAfter);
    }

    return resultHtml;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Delegación global de eventos de interacción para el Sandbox de React + TypeScript
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // 1. Selector de Vistas: En Vivo / Código TSX / Vista Dividida
    const toggleBtn = target.closest<HTMLButtonElement>('.btn-toggle-reading-sandbox');
    if (toggleBtn) {
      e.stopPropagation();
      const widget = toggleBtn.closest('.feynman-interactive-sandbox-widget');
      if (!widget) return;
      const view = toggleBtn.dataset.view;
      const liveBox = widget.querySelector<HTMLElement>('.reading-sandbox-live-box, .reading-sandbox-output-box');
      const codeBox = widget.querySelector<HTMLElement>('.reading-sandbox-code-box');
      const mainLayout = widget.querySelector<HTMLElement>('.reading-sandbox-main-layout');
      const buttons = widget.querySelectorAll<HTMLButtonElement>('.btn-toggle-reading-sandbox');

      buttons.forEach((b) => {
        const isActive = b === toggleBtn;
        b.classList.toggle('active', isActive);
        b.style.color = isActive ? '#fff' : '#94a3b8';
        b.style.background = isActive ? 'rgba(56,189,248,0.25)' : 'transparent';
      });

      if (view === 'live') {
        if (mainLayout) mainLayout.style.display = 'block';
        if (liveBox) {
          liveBox.style.display = 'block';
          liveBox.style.width = '100%';
          liveBox.style.height = '580px';
        }
        if (codeBox) codeBox.style.display = 'none';
      } else if (view === 'code') {
        if (mainLayout) mainLayout.style.display = 'block';
        if (liveBox) liveBox.style.display = 'none';
        if (codeBox) {
          codeBox.style.display = 'block';
          codeBox.style.width = '100%';
          codeBox.style.height = '580px';
        }
      } else if (view === 'split') {
        if (mainLayout) {
          mainLayout.style.display = 'grid';
          mainLayout.style.gridTemplateColumns = 'repeat(auto-fit, minmax(340px, 1fr))';
          mainLayout.style.gap = '0';
        }
        if (liveBox) {
          liveBox.style.display = 'block';
          liveBox.style.width = '100%';
          liveBox.style.height = '580px';
          liveBox.style.borderRight = '1px solid rgba(255,255,255,0.08)';
        }
        if (codeBox) {
          codeBox.style.display = 'block';
          codeBox.style.width = '100%';
          codeBox.style.height = '580px';
          codeBox.style.borderTop = 'none';
        }
      }
      return;
    }

    // 2. Reiniciar App React
    const reloadBtn = target.closest<HTMLButtonElement>('.btn-reload-reading-sandbox');
    if (reloadBtn) {
      e.stopPropagation();
      const widget = reloadBtn.closest('.feynman-interactive-sandbox-widget');
      const iframe = widget?.querySelector<HTMLIFrameElement>('iframe');
      if (iframe) {
        const src = iframe.src;
        iframe.src = 'about:blank';
        setTimeout(() => {
          iframe.src = src;
        }, 60);
      }
      return;
    }

    // 3. Copiar Código TSX
    const copyBtn = target.closest<HTMLButtonElement>('.btn-copy-reading-ts-code');
    if (copyBtn) {
      e.stopPropagation();
      const widget = copyBtn.closest('.feynman-interactive-sandbox-widget');
      const rawTextarea = widget?.querySelector<HTMLTextAreaElement>('.ts-code-raw-hidden');
      const rawCode = rawTextarea?.value || '';
      if (rawCode) {
        navigator.clipboard.writeText(rawCode);
        const originalHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span>✓</span><span>Copiado</span>';
        copyBtn.style.color = '#34d399';
        setTimeout(() => {
          copyBtn.innerHTML = originalHtml;
          copyBtn.style.color = '#cbd5e1';
        }, 1800);
      }
      return;
    }

    // 4. Modo Pantalla Completa
    const fullscreenBtn = target.closest<HTMLButtonElement>('.btn-fullscreen-reading-sandbox');
    if (fullscreenBtn) {
      e.stopPropagation();
      const widget = fullscreenBtn.closest<HTMLElement>('.feynman-interactive-sandbox-widget');
      if (!widget) return;
      widget.classList.toggle('reading-sandbox-fullscreen');
      const isFullscreen = widget.classList.contains('reading-sandbox-fullscreen');
      fullscreenBtn.innerHTML = isFullscreen ? '<span>✕</span>' : '<span>⛶</span>';
      return;
    }
  });
}

export const feynmanSandboxService = FeynmanSandboxService.getInstance();
