import './index.css';
import './ui/styles/workspace.css';
import './ui/styles/environments.css';
import './ui/styles/surfaces.css';
import './ui/styles/custom.css';
import './ui/styles/perf.css';
import katex from 'katex';
import 'katex/dist/contrib/mhchem.mjs';
import 'katex/dist/katex.min.css';

(window as any).katex = katex;

import { nativeService } from './services/native.service';
import { deckService } from './services/deck.service';
import { themeService } from './services/theme.service';
import { eurekaBackend, type AuthUser } from './services/backend.service';
import { openAuthModal } from './components/AuthModal';
import { openAccountProfileModal } from './components/AccountProfileModal';
import { renderFigmaHeader, type FigmaMainTab } from './components/FigmaHeader';
import { renderEurekaBottomNav } from './components/EurekaBottomNav';
import { renderFigmaDeckList, bindFigmaDeckListEvents } from './components/FigmaDeckList';
import { renderFigmaSubdeckList, bindFigmaSubdeckEvents } from './components/FigmaSubdeckList';
import { renderFigmaDeckDashboard, bindFigmaDashboardEvents } from './components/FigmaDeckDashboard';
import { renderFigmaCardEditor, bindFigmaCardEditorEvents } from './components/FigmaCardEditor';
import { renderFigmaLibraryView, bindFigmaLibraryEvents } from './components/FigmaLibraryView';
import { renderFigmaDeckSettingsView, bindFigmaDeckSettingsViewEvents } from './components/FigmaDeckSettingsView';
import { renderFigmaAdvancedDeckMenuView, bindFigmaAdvancedDeckMenuViewEvents } from './components/FigmaAdvancedDeckMenuView';
import { renderFigmaAlgorithmSelectorView, bindFigmaAlgorithmSelectorViewEvents } from './components/FigmaAlgorithmSelectorView';
import { renderFigmaLearningPhaseView, bindFigmaLearningPhaseViewEvents } from './components/FigmaLearningPhaseView';
import { renderFigmaAppSettingsView, bindFigmaAppSettingsViewEvents } from './components/FigmaAppSettingsView';
import { FigmaStudySession } from './components/FigmaStudySession';
import { dialogService } from './services/dialog.service';
import { openFigmaBatchImportModal } from './components/FigmaBatchImportModal';
import { openFigmaAiBuilderModal } from './components/FigmaAiBuilderModal';
import {
  renderActiveStudyDashboard,
  bindActiveStudyDashboardEvents,
  isActivelyStudying,
  openStudyNotebook,
  closeStudyNotebook,
  openCreateTopicModal,
  openCreateStudyFolder
} from './components/ActiveStudyView';
import { openCreateHub, type CreateHubChoice, type CreateHubContext } from './components/CreateHubSheet';
import type { MindMapStudio } from './mindmap/MindMapStudio';
import { treeFromOutline } from './mindmap/templates';
import { activeStudyService } from './services/active-study.service';
import { feynmanLlmService } from './services/feynman-llm.service';
import { whenIdle } from './services/storage.service';
import { perfService } from './services/perf.service';
import { openFeynmanDiagnosticModal } from './components/FeynmanDiagnosticModal';

type AppView =
  | 'root'
  | 'subdeck'
  | 'dashboard'
  | 'deck_settings'
  | 'advanced_menu'
  | 'algorithm_selector'
  | 'learning_phase'
  | 'app_settings'
  | 'editor'
  | 'library'
  | 'study';

class EurekaFigmaApp {
  private currentTab: FigmaMainTab = 'estudio';
  private currentView: AppView = 'root';
  private selectedRootDeckId: string = '';
  private selectedSubdeckId: string = '';
  private selectedStudyTopicId: string = '';
  private editingCardId: string | null = null;
  private appElement: HTMLElement;
  private activeStudySession: FigmaStudySession | null = null;
  private activeMindMapInstance: MindMapStudio | null = null;
  private cleanupActiveStudyEvents: (() => void) | null = null;
  private returnToStudyOnCardEditorClose: boolean = false;
  private activeStudyChunkIdForNewCards: string | null = null;
  private toastTimeout: number | null = null;
  private sessionSeconds = 0;
  private sessionPaused = false;

  constructor() {
    const el = document.getElementById('app');
    if (!el) throw new Error('Root container #app not found');
    this.appElement = el;
  }

  public async init(): Promise<void> {
    perfService.init();
    themeService.applyTheme();
    await nativeService.initialize();

    // El teclado matemático solo se usa al responder escribiendo: se carga cuando el navegador está libre
    whenIdle(() => {
      void import('mathlive');
      void import('mathlive/static.css');
    }, 4000);

    // Hub de creación: cualquier vista puede pedir crear algo emitiendo este evento
    window.addEventListener('eureka:create', (e) => {
      const detail = (e as CustomEvent).detail || {};
      const choice = detail.choice as CreateHubChoice | 'hub';
      const context = (detail.context as CreateHubContext) || 'notebooks';
      if (choice === 'hub') {
        this.openCreateHubFor(context);
      } else {
        this.runCreate(choice, context, detail.parentId ?? null);
      }
    });

    window.addEventListener('eureka:open-deck', (e) => {
      const deckId = (e as CustomEvent).detail?.deckId as string | undefined;
      if (deckId) this.openDeck(deckId);
    });

    this.startSessionClock();

    // Suscribirse a cambios en los mazos y tarjetas
    deckService.subscribe(() => {
      if (this.currentView !== 'study' && this.currentView !== 'editor') {
        this.render();
      }
    });

    // Suscribirse a cambios de autenticación
    eurekaBackend.onAuthChange(async (user) => {
      const activeId = user?.id || eurekaBackend.getUserId();
      await Promise.all([
        deckService.setUser(activeId),
        activeStudyService.setUser(activeId),
        feynmanLlmService.setUser(activeId),
        themeService.syncWithCloud()
      ]);

      const rootDecks = deckService.getRootDecks();
      if (rootDecks.length > 0) {
        this.selectedRootDeckId = rootDecks[0].id;
        const sub = deckService.getSubdecks(rootDecks[0].id);
        this.selectedSubdeckId = sub.length > 0 ? sub[0].id : rootDecks[0].id;
      }
      this.render();
    });

    // Conexión automática universal a la base de datos de la cuenta activa
    let currentUser = eurekaBackend.getCurrentUser();
    if (!currentUser) {
      currentUser = await eurekaBackend.ensureActiveAccount();
    }
    const activeId = currentUser?.id || eurekaBackend.getUserId();
    await Promise.all([
      deckService.setUser(activeId),
      activeStudyService.setUser(activeId),
      feynmanLlmService.setUser(activeId),
      themeService.syncWithCloud()
    ]);

    const rootDecks = deckService.getRootDecks();
    if (rootDecks.length > 0) {
      this.selectedRootDeckId = rootDecks[0].id;
      const sub = deckService.getSubdecks(rootDecks[0].id);
      this.selectedSubdeckId = sub.length > 0 ? sub[0].id : rootDecks[0].id;
    }
    this.render();

    // 2. Transmisión Automática entre Navegadores y Dispositivos:
    // Sincronización inteligente con comprobación de versión de bajo peso cada 5 segundos y sincronización inmediata al enfocar
    let isPolling = false;
    let lastVersionState = { decks: 0, cards: 0, settings: 0 };

    const pollRemoteSync = async (force: boolean = false) => {
      if (isPolling || this.currentView === 'study' || isActivelyStudying()) return;
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;

      const user = eurekaBackend.getCurrentUser();
      // Si no hay cuenta registrada iniciada (modo invitado offline), no saturar
      if (!user || user.id.startsWith('guest_')) return;

      isPolling = true;
      try {
        if (!force) {
          const version = await eurekaBackend.fetchSyncVersion();
          if (version) {
            const hasNewDecks = version.decksUpdatedAt > lastVersionState.decks;
            const hasNewCards = version.cardsUpdatedAt > lastVersionState.cards;
            const hasNewSettings = version.settingsUpdatedAt > lastVersionState.settings;

            if (!hasNewDecks && !hasNewCards && !hasNewSettings && lastVersionState.decks > 0) {
              return; // Sin cambios en el servidor, no descargar datos innecesarios
            }

            lastVersionState = {
              decks: version.decksUpdatedAt || 0,
              cards: version.cardsUpdatedAt || 0,
              settings: version.settingsUpdatedAt || 0
            };
          }
        }

        await Promise.all([
          deckService.syncWithCloud(),
          activeStudyService.syncWithCloud()
        ]);
      } catch {}
      finally {
        isPolling = false;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        pollRemoteSync(true);
      });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          pollRemoteSync(true);
        }
      });
      setInterval(() => {
        pollRemoteSync(false);
      }, 10000);
    }
  }

  public promptAuth(allowDismiss: boolean = true): void {
    openAuthModal({
      allowDismiss,
      onSuccess: async (user: AuthUser) => {
        this.showToast(`👋 ¡Bienvenido de nuevo, ${user.username}!`);
        await Promise.all([
          deckService.setUser(user.id),
          activeStudyService.setUser(user.id),
          feynmanLlmService.setUser(user.id),
          themeService.syncWithCloud()
        ]);
        this.render();
      },
      onClose: () => {
        if (!eurekaBackend.getCurrentUser()) {
          eurekaBackend.setGuestSession();
        }
        this.render();
      }
    });
  }

  public showToast(message: string): void {
    const existing = document.getElementById('eureka-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'eureka-toast';
    toast.className = 'toast-notice';
    toast.innerHTML = `<span>${message}</span>`;

    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    if (this.toastTimeout) window.clearTimeout(this.toastTimeout);
    this.toastTimeout = window.setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 250);
    }, 2400);
  }

  private openUserAccountMenu(): void {
    openAccountProfileModal({
      onAccountChanged: async (user) => {
        if (user) {
          this.showToast(`✨ Conectado como ${user.username}`);
          await Promise.all([
            deckService.setUser(user.id),
            activeStudyService.setUser(user.id),
            feynmanLlmService.setUser(user.id),
            themeService.syncWithCloud()
          ]);
        } else {
          this.showToast('Sesión cerrada. Espacio de datos local.');
          const guest = eurekaBackend.setGuestSession();
          await Promise.all([
            deckService.setUser(guest.id),
            activeStudyService.setUser(guest.id),
            feynmanLlmService.setUser(guest.id)
          ]);
        }
        this.render();
      }
    });
  }

  private startStudy(deckId: string, specificCardId?: string): void {
    nativeService.triggerHaptics('medium');
    this.currentView = 'study';
    this.activeStudySession = new FigmaStudySession({
      deckId,
      specificCardId,
      onExit: () => {
        this.activeStudySession = null;
        this.currentView = 'dashboard';
        this.render();
      },
      onEditCard: (cardId) => {
        const card = deckService.getCardById(cardId);
        if (card) {
          this.selectedSubdeckId = card.deckId;
          const targetDeck = deckService.getDeckById(card.deckId);
          if (targetDeck?.parentId) {
            this.selectedRootDeckId = targetDeck.parentId;
          } else {
            this.selectedRootDeckId = card.deckId;
          }
        }
        this.activeStudySession = null;
        this.editingCardId = cardId;
        this.currentTab = 'inicio';
        this.currentView = 'editor';
        this.render();
      }
    });

    this.appElement.innerHTML = `
      <div class="figma-app-layout" id="study-mount"></div>
    `;

    const mount = document.getElementById('study-mount');
    if (mount) {
      this.activeStudySession.render(mount);
    }
  }

  private openBatchImport(deckId: string): void {
    nativeService.triggerHaptics('light');
    openFigmaBatchImportModal({
      deckId,
      onImported: (count) => {
        this.showToast(`¡${count} tarjetas importadas con éxito!`);
        this.render();
      },
      onClose: () => {}
    });
  }

  public async openMindMap(topicId?: string): Promise<void> {
    nativeService.triggerHaptics('medium');
    if (this.cleanupActiveStudyEvents) {
      this.cleanupActiveStudyEvents();
      this.cleanupActiveStudyEvents = null;
    }

    // Resolver tema activo por orden de prioridad
    let resolvedTopicId = topicId || this.selectedStudyTopicId;
    if (!resolvedTopicId) {
      const allTopics = activeStudyService.getAllTopics();
      if (allTopics.length > 0) {
        resolvedTopicId = allTopics[0].id;
      }
    }

    let initialData: any = undefined;
    let topicTitle = 'Mapa mental';

    if (resolvedTopicId) {
      const topic = activeStudyService.getTopicById(resolvedTopicId);
      if (topic) {
        topicTitle = topic.title;
        // El mapa guardado lo carga el propio editor; aquí solo se prepara el punto de partida (esquema del cuaderno)
        const roots = activeStudyService.getOutlineTree(resolvedTopicId);
        if (roots.length > 0) initialData = treeFromOutline(topic.title, roots);
      }
    }

    // Limpiar instancia previa si existiera
    const prevMount = document.getElementById('eureka-mindmap-fullscreen-mount');
    if (prevMount) prevMount.remove();

    // Montar en un contenedor de pantalla completa fijo de 100vw y 100vh
    const mount = document.createElement('div');
    mount.id = 'eureka-mindmap-fullscreen-mount';
    document.body.appendChild(mount);

    // El motor del mapa (librería + editor) pesa bastante: solo se descarga al abrir un mapa
    mount.style.cssText = 'position:fixed;inset:0;z-index:2000;display:flex;align-items:center;justify-content:center;background:#0b0d14;color:#cbd5e1;font:600 15px Inter,system-ui,sans-serif';
    mount.textContent = 'Preparando tu mapa…';
    const { MindMapStudio: Studio } = await import('./mindmap/MindMapStudio');
    mount.removeAttribute('style');
    mount.textContent = '';
    this.activeMindMapInstance = new Studio(mount, {
      topicId: resolvedTopicId,
      topicTitle,
      initialData,
      onBack: () => {
        if (this.activeMindMapInstance) {
          this.activeMindMapInstance.destroy();
          this.activeMindMapInstance = null;
        }
        mount.remove();
        this.render();
      },
      onSave: () => {
        this.showToast('🧠 Mapa mental sincronizado');
      }
    });

    this.activeMindMapInstance.mount();
  }

  private handleOpenAddMenu(parentId?: string | null): void {
    nativeService.triggerHaptics('light');
    this.openCreateHubFor('decks', parentId ?? null);
  }

  /** Hub único de creación (cuaderno, ruta Feynman, mazo, carpeta) */
  private openCreateHubFor(context: CreateHubContext, parentId: string | null = null): void {
    const parent = parentId ? deckService.getDeckById(parentId) : undefined;
    openCreateHub({
      context,
      parentName: context === 'decks' ? parent?.name : undefined,
      onChoice: (choice) => this.runCreate(choice, context, parentId)
    });
  }

  private runCreate(choice: CreateHubChoice, context: CreateHubContext, parentId: string | null): void {
    switch (choice) {
      case 'feynman':
        this.openFeynmanFlow();
        break;
      case 'import':
        this.openFeynmanFlow('import_only');
        break;
      case 'notebook':
        openCreateTopicModal((topicId) => {
          this.selectedStudyTopicId = topicId;
          this.currentTab = 'estudio';
          this.currentView = 'root';
          this.showToast('📓 Cuaderno creado con su mazo de flashcards');
          this.render();
        });
        break;
      case 'deck':
        this.promptCreateDeck(context === 'decks' ? parentId : null);
        break;
      case 'folder':
        if (context === 'notebooks') {
          openCreateStudyFolder(() => {
            this.showToast('📁 Carpeta creada');
            this.currentTab = 'estudio';
            this.render();
          });
        } else {
          this.promptCreateFolder(parentId);
        }
        break;
    }
  }

  /** Asistente Feynman: prompt maestro → pegar respuesta → cuaderno + flashcards */
  public openFeynmanFlow(stage?: 'import_only'): void {
    nativeService.triggerHaptics('medium');
    openFeynmanDiagnosticModal({
      initialStage: stage,
      onGenerated: () => {
        this.showToast('✨ Cuaderno y flashcards creados');
        this.render();
      },
      onOpenTopic: (topicId) => this.openNotebook(topicId),
      onOpenDeck: (deckId) => this.openDeck(deckId)
    });
  }

  private openNotebook(topicId: string): void {
    openStudyNotebook(topicId);
    this.selectedStudyTopicId = topicId;
    this.currentTab = 'estudio';
    this.currentView = 'root';
    this.render();
  }

  private openDeck(deckId: string): void {
    const deck = deckService.getDeckById(deckId);
    this.currentTab = 'flashcards';
    if (deck && deckService.isFolder(deck)) {
      this.selectedRootDeckId = deck.id;
      this.currentView = 'subdeck';
    } else {
      this.selectedSubdeckId = deckId;
      this.selectedRootDeckId = deck?.parentId || deckId;
      this.currentView = 'dashboard';
    }
    this.render();
  }

  /** Reloj de la sesión de estudio: cuenta el tiempo real que llevas con la app visible */
  private startSessionClock(): void {
    window.setInterval(() => {
      if (this.sessionPaused || document.visibilityState === 'hidden') return;
      this.sessionSeconds += 1;
      this.updateSessionClock();
    }, 1000);
  }

  private updateSessionClock(): void {
    const el = document.getElementById('header-session-clock');
    if (!el) return;
    const h = Math.floor(this.sessionSeconds / 3600);
    const m = Math.floor((this.sessionSeconds % 3600) / 60);
    const sec = this.sessionSeconds % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(sec).padStart(2, '0');
    el.textContent = h > 0 ? h + ':' + mm + ':' + ss : mm + ':' + ss;
    el.closest('.figma-timer-capsule')?.classList.toggle('paused', this.sessionPaused);
  }

  private promptCreateFolder(parentId: string | null): void {
    const parent = parentId ? deckService.getDeckById(parentId) : undefined;
    dialogService.showPrompt({
      title: parent ? `Nueva Carpeta en "${parent.name}"` : 'Nueva Carpeta',
      placeholder: 'Nombre de la carpeta (ej. Matemáticas, Anatomía)...',
      confirmText: 'Crear Carpeta',
      onConfirm: (name) => {
        if (name && name.trim()) {
          const newFolder = deckService.createDeck({
            name: name.trim(),
            parentId: parentId,
            icon: 'folder',
            color: '#38bdf8'
          });
          this.showToast(`📁 Carpeta "${name}" creada`);
          this.currentTab = 'flashcards';
          if (parentId) {
            this.selectedRootDeckId = parentId;
            this.currentView = 'subdeck';
          } else {
            this.selectedRootDeckId = newFolder.id;
            this.currentView = 'root';
          }
          this.render();
        }
      }
    });
  }

  private promptCreateDeck(parentId: string | null): void {
    const parent = parentId ? deckService.getDeckById(parentId) : undefined;
    dialogService.showPrompt({
      title: parent ? `Nuevo Mazo en "${parent.name}"` : 'Nuevo Mazo de Flashcards',
      placeholder: 'Nombre del mazo (ej. Fórmulas, Huesos)...',
      confirmText: 'Crear Mazo',
      onConfirm: (name) => {
        if (name && name.trim()) {
          const newDeck = deckService.createDeck({
            name: name.trim(),
            parentId: parentId,
            icon: 'deck',
            color: '#a855f7'
          });
          this.showToast(`🎴 Mazo "${name}" creado`);
          this.currentTab = 'flashcards';
          this.selectedSubdeckId = newDeck.id;
          if (parentId) {
            this.selectedRootDeckId = parentId;
          } else {
            this.selectedRootDeckId = newDeck.id;
          }
          this.currentView = 'dashboard';
          this.render();
        }
      }
    });
  }

  public render(): void {
    if (this.currentView === 'study') return;

    const rootDecks = deckService.getRootDecks();
    const rootDeck = deckService.getDeckById(this.selectedRootDeckId) || rootDecks[0] || deckService.getAllDecks()[0];
    const subdeck = deckService.getDeckById(this.selectedSubdeckId) || rootDeck;
    const editCard = this.editingCardId ? deckService.getCardById(this.editingCardId) : undefined;

    let bodyHtml = '';
    let showGlobalHeader = true;

    if (this.currentView === 'editor') {
      showGlobalHeader = false;
      bodyHtml = renderFigmaCardEditor(
        subdeck,
        rootDeck && rootDeck.id !== subdeck.id ? rootDeck : undefined,
        editCard,
        this.activeStudyChunkIdForNewCards || undefined
      );
    } else if (this.currentView === 'deck_settings') {
      showGlobalHeader = false;
      bodyHtml = renderFigmaDeckSettingsView(subdeck);
    } else if (this.currentView === 'advanced_menu') {
      showGlobalHeader = false;
      bodyHtml = renderFigmaAdvancedDeckMenuView(subdeck);
    } else if (this.currentView === 'algorithm_selector') {
      showGlobalHeader = false;
      bodyHtml = renderFigmaAlgorithmSelectorView(subdeck);
    } else if (this.currentView === 'learning_phase') {
      showGlobalHeader = false;
      bodyHtml = renderFigmaLearningPhaseView(subdeck);
    } else if (this.currentTab === 'estudio') {
      if (isActivelyStudying()) {
        showGlobalHeader = false;
      }
      bodyHtml = renderActiveStudyDashboard(this.selectedStudyTopicId);
    } else if (this.currentTab === 'biblioteca') {
      bodyHtml = renderFigmaLibraryView();
    } else if (this.currentTab === 'ajustes' || this.currentView === 'app_settings') {
      bodyHtml = renderFigmaAppSettingsView();
    } else {
      switch (this.currentView) {
        case 'root':
          bodyHtml = renderFigmaDeckList();
          break;

        case 'subdeck':
          bodyHtml = renderFigmaSubdeckList(rootDeck);
          break;

        case 'dashboard':
          bodyHtml = renderFigmaDeckDashboard(subdeck, rootDeck && rootDeck.id !== subdeck.id ? rootDeck : undefined);
          break;

        default:
          bodyHtml = renderFigmaDeckList();
          break;
      }
    }

    const reading = this.currentTab === 'estudio' && isActivelyStudying();
    document.body.classList.toggle('eureka-reading', reading);

    if (reading) {
      this.appElement.innerHTML = bodyHtml;
      this.bindEvents();
      return;
    }

    this.appElement.innerHTML = `
      <div class="figma-app-layout" id="main-layout-mount">
        ${showGlobalHeader ? renderFigmaHeader(this.currentTab) : ''}
        <main class="figma-main-content">
          ${bodyHtml}
        </main>
        ${showGlobalHeader ? renderEurekaBottomNav(this.currentTab) : ''}
      </div>
    `;

    this.bindEvents();
    this.updateSessionClock();
  }

  private bindEvents(): void {
    const layout = document.getElementById('main-layout-mount') || this.appElement;
    if (!layout) return;

    // Limpiar temporizadores previos de la sección de estudio
    if (this.cleanupActiveStudyEvents) {
      this.cleanupActiveStudyEvents();
      this.cleanupActiveStudyEvents = null;
    }

    // Header tabs & Mobile Bottom Nav items
    layout.querySelectorAll<HTMLButtonElement>('.figma-nav-tab-btn, .eureka-bottom-nav-item, .mobile-nav-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab as FigmaMainTab;
        if (tab && tab !== this.currentTab) {
          nativeService.triggerHaptics('light');
          this.currentTab = tab;
          if (tab === 'flashcards' || tab === 'inicio') {
            this.currentView = 'root';
          }
          this.render();
          // Cada pestaña empieza arriba (antes heredaba el scroll de la anterior y parecía vacía)
          window.scrollTo(0, 0);
        }
      });
    });

    layout.querySelector('#nav-brand-logo')?.addEventListener('click', () => {
      closeStudyNotebook();
      this.currentTab = 'estudio';
      this.currentView = 'root';
      this.render();
    });

    // Menú de Cuenta / Avatar
    layout.querySelector('#btn-header-avatar')?.addEventListener('click', () => {
      this.openUserAccountMenu();
    });

    layout.querySelector('#btn-header-theme-mobile')?.addEventListener('click', () => {
      this.currentTab = 'ajustes';
      this.render();
    });

    // Botón "Crear" (escritorio) y botón central "+" (celular)
    const openGlobalCreate = () => {
      nativeService.triggerHaptics('medium');
      if (this.currentTab === 'estudio') {
        this.openCreateHubFor('notebooks');
      } else {
        this.openCreateHubFor('decks', this.currentView === 'subdeck' ? this.selectedRootDeckId : null);
      }
    };
    layout.querySelector('#btn-header-create')?.addEventListener('click', openGlobalCreate);
    layout.querySelector('#btn-nav-create')?.addEventListener('click', openGlobalCreate);

    // Reloj de sesión: toca para pausar / reanudar
    layout.querySelector('#btn-header-premium')?.addEventListener('click', () => {
      this.sessionPaused = !this.sessionPaused;
      this.showToast(this.sessionPaused ? '⏸️ Reloj de sesión en pausa' : '▶️ Reloj de sesión en marcha');
      this.updateSessionClock();
    });

    const rootDecks = deckService.getRootDecks();
    const rootDeck = deckService.getDeckById(this.selectedRootDeckId) || rootDecks[0] || deckService.getAllDecks()[0];
    const subdeck = deckService.getDeckById(this.selectedSubdeckId) || rootDeck;

    // View: Card Editor (Top Priority)
    if (this.currentView === 'editor') {
      const editCard = this.editingCardId ? deckService.getCardById(this.editingCardId) : undefined;
      bindFigmaCardEditorEvents(
        layout,
        subdeck,
        editCard,
        {
          onBack: () => {
            this.editingCardId = null;
            if (this.returnToStudyOnCardEditorClose) {
              this.returnToStudyOnCardEditorClose = false;
              this.activeStudyChunkIdForNewCards = null;
              this.currentTab = 'estudio';
              this.currentView = 'root';
            } else {
              this.currentView = 'dashboard';
            }
            this.render();
          },
          onSaved: () => {
            this.showToast('¡Tarjeta guardada con éxito!');
            this.editingCardId = null;
            if (this.returnToStudyOnCardEditorClose) {
              this.returnToStudyOnCardEditorClose = false;
              this.activeStudyChunkIdForNewCards = null;
              this.currentTab = 'estudio';
              this.currentView = 'root';
            } else {
              this.currentView = 'dashboard';
            }
            this.render();
          }
        },
        this.activeStudyChunkIdForNewCards || undefined
      );
      return;
    }

    // View: Fullscreen Deck Settings (Configuración de Intervalos)
    if (this.currentView === 'deck_settings') {
      bindFigmaDeckSettingsViewEvents(layout, subdeck, {
        onBack: () => {
          this.currentView = 'advanced_menu';
          this.render();
        },
        onOpenAlgorithmSelector: () => {
          this.currentView = 'algorithm_selector';
          this.render();
        },
        onSaved: () => {
          this.showToast('Ajustes guardados');
          this.render();
        }
      });
      return;
    }

    // View: Fullscreen Advanced Menu (Opciones de Mazo - Vista Principal)
    if (this.currentView === 'advanced_menu') {
      bindFigmaAdvancedDeckMenuViewEvents(layout, subdeck, {
        onBack: () => {
          this.currentView = 'dashboard';
          this.render();
        },
        onOpenDeckSettings: () => {
          this.currentView = 'deck_settings';
          this.render();
        },
        onOpenAlgorithmSelector: () => {
          this.currentView = 'algorithm_selector';
          this.render();
        },
        onOpenAiBuilder: () => {
          openFigmaAiBuilderModal({
            deckId: subdeck.id,
            onBatchAdded: () => {
              this.showToast('Tarjetas añadidas');
              this.currentView = 'dashboard';
              this.render();
            },
            onClose: () => {}
          });
        },
        onOpenBatchImport: () => {
          this.openBatchImport(subdeck.id);
        },
        onActionCompleted: () => {
          this.showToast('Acción completada');
          this.currentView = 'dashboard';
          this.render();
        }
      });
      return;
    }

    // View: Fullscreen Algorithm Selector
    if (this.currentView === 'algorithm_selector') {
      bindFigmaAlgorithmSelectorViewEvents(layout, subdeck, {
        onBack: () => {
          this.currentView = 'deck_settings';
          this.render();
        },
        onOpenCustomLearningPhases: () => {
          this.currentView = 'learning_phase';
          this.render();
        },
        onSaved: () => {
          this.showToast('Algoritmo actualizado');
          this.currentView = 'deck_settings';
          this.render();
        }
      });
      return;
    }

    // View: Fullscreen Learning Phase Step Editor
    if (this.currentView === 'learning_phase') {
      bindFigmaLearningPhaseViewEvents(layout, subdeck, {
        onBack: () => {
          this.currentView = 'algorithm_selector';
          this.render();
        },
        onSaved: () => {
          this.showToast('Escalera de 12 pasos guardada');
          this.currentView = 'deck_settings';
          this.render();
        }
      });
      return;
    }

    // View: App Settings / Personalización
    if (this.currentTab === 'ajustes' || this.currentView === 'app_settings') {
      bindFigmaAppSettingsViewEvents(layout, {
        onBack: () => {
          this.currentTab = 'flashcards';
          this.currentView = 'root';
          this.render();
        },
        onThemeChanged: () => {
          this.showToast('Estilo visual aplicado');
          this.render();
        }
      });
      return;
    }

    // Pestaña ESTUDIO ACTIVO (Sección independiente completa)
    if (this.currentTab === 'estudio') {
      this.cleanupActiveStudyEvents = bindActiveStudyDashboardEvents(
        layout,
        () => this.render(),
        (topicId) => {
          this.selectedStudyTopicId = topicId;
        },
        (topicId) => {
          this.openMindMap(topicId);
        },
        (deckId, chunkId) => {
          this.returnToStudyOnCardEditorClose = true;
          this.activeStudyChunkIdForNewCards = chunkId || null;
          this.selectedSubdeckId = deckId;
          const targetDeck = deckService.getDeckById(deckId);
          if (targetDeck?.parentId) {
            this.selectedRootDeckId = targetDeck.parentId;
          } else {
            this.selectedRootDeckId = deckId;
          }
          this.editingCardId = null;
          this.currentView = 'editor';
          this.render();
        }
      );
      return;
    }

    // Floating actions
    layout.querySelector('#btn-fab-gift')?.addEventListener('click', () => {
      this.showToast('🎁 ¡Racha de hoy completada! +50 XP');
    });

    layout.querySelector('#btn-fab-help')?.addEventListener('click', () => {
      this.showToast('Atajos: Espacio = Voltear | 1, 2, 3, 4 = Calificar');
    });

    const isFlashcards = this.currentTab === 'flashcards' || this.currentTab === 'inicio';

    // View 1: Root Deck List
    if (isFlashcards && this.currentView === 'root') {
      bindFigmaDeckListEvents(layout, {
        onSelectDeck: (deckId) => {
          nativeService.triggerHaptics('light');
          const targetDeck = deckService.getDeckById(deckId);
          if (deckService.isFolder(targetDeck)) {
            this.selectedRootDeckId = deckId;
            this.currentView = 'subdeck';
          } else {
            this.selectedRootDeckId = targetDeck?.parentId || deckId;
            this.selectedSubdeckId = deckId;
            this.currentView = 'dashboard';
          }
          this.render();
        },
        onAdd: () => this.handleOpenAddMenu(null),
        onRefresh: () => this.render()
      });
    }

    // View 2: Subdeck Explorer
    else if (isFlashcards && this.currentView === 'subdeck') {
      bindFigmaSubdeckEvents(layout, rootDeck, {
        onBack: () => {
          this.currentView = 'root';
          this.render();
        },
        onSelectSubdeck: (subId) => {
          nativeService.triggerHaptics('light');
          const targetSub = deckService.getDeckById(subId);
          if (deckService.isFolder(targetSub)) {
            this.selectedRootDeckId = subId;
            this.currentView = 'subdeck';
          } else {
            this.selectedSubdeckId = subId;
            this.currentView = 'dashboard';
          }
          this.render();
        },
        onAdd: (parentId) => this.handleOpenAddMenu(parentId),
        onConfigureDeck: () => {
          this.currentView = 'advanced_menu';
          this.render();
        },
        onRefresh: () => this.render()
      });
    }

    // View 3: Dashboard
    else if (isFlashcards && this.currentView === 'dashboard') {
      bindFigmaDashboardEvents(layout, subdeck, {
        onBackToSubdecks: () => {
          if (subdeck.parentId) {
            this.currentView = 'subdeck';
          } else {
            this.currentView = 'root';
          }
          this.render();
        },
        onBackToRoot: () => {
          this.currentView = 'root';
          this.render();
        },
        onStudy: (id) => this.startStudy(id),
        onStudySpecificCard: (deckId, cardId) => {
          this.startStudy(deckId, cardId);
        },
        onAddCard: () => {
          this.editingCardId = null;
          this.currentView = 'editor';
          this.render();
        },
        onConfigureDeck: () => {
          this.currentView = 'advanced_menu';
          this.render();
        },
        onEditCard: (cardId) => {
          this.editingCardId = cardId;
          this.currentView = 'editor';
          this.render();
        },
        onRefresh: () => {
          this.render();
        }
      });
    }

    // View: Library
    else if (this.currentTab === 'biblioteca') {
      bindFigmaLibraryEvents(layout, {
        onAddCard: () => {
          this.editingCardId = null;
          this.currentTab = 'flashcards';
          this.currentView = 'editor';
          this.render();
        },
        onEditCard: (cardId) => {
          this.editingCardId = cardId;
          this.currentTab = 'flashcards';
          this.currentView = 'editor';
          this.render();
        },
        onStudySpecificCard: (deckId, cardId) => {
          this.startStudy(deckId, cardId);
        }
      });
    }
  }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  const app = new EurekaFigmaApp();
  app.init();
});
