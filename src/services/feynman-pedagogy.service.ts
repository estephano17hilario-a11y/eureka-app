import type {
  FeynmanDiagnosticForm,
  FeynmanLevel,
  FeynmanAtomicSublevel,
  FeynmanTargetGoal,
  FeynmanQuizQuestion,
  FeynmanLevelExam,
  FeynmanFinalExam
} from '../types/feynman';

export interface SubjectPedagogicalProfile {
  id: string;
  name: string;
  domain: string;
  terminologyRule: string;
  mathRule: string;
  simulatorRule: string;
}

export class FeynmanPedagogyService {
  private static instance: FeynmanPedagogyService;

  private constructor() {}

  public static getInstance(): FeynmanPedagogyService {
    if (!FeynmanPedagogyService.instance) {
      FeynmanPedagogyService.instance = new FeynmanPedagogyService();
    }
    return FeynmanPedagogyService.instance;
  }

  /**
   * Obtiene la cantidad matemática exacta de niveles según el objetivo seleccionado.
   */
  public getTargetLevelsCount(goal: FeynmanTargetGoal): 10 | 15 | 20 {
    switch (goal) {
      case 'general':
        return 10;
      case 'adentrado':
        return 15;
      case 'especializado':
        return 20;
    }
  }

  /**
   * Obtiene el perfil pedagógico y las directrices específicas según la materia elegida.
   */
  public getSubjectPedagogicalProfile(subjectIdOrName?: string): SubjectPedagogicalProfile {
    const raw = (subjectIdOrName || 'general').toLowerCase().trim();

    if (raw.includes('matemat') || raw === 'matematicas') {
      return {
        id: 'matematicas',
        name: 'Matemáticas',
        domain: 'Estructuras matemáticas formales, axiomas, teoremas, análisis riguroso y álgebra.',
        terminologyRule: 'Usa demostraciones lógicas, axiomas, teoremas, transformaciones invariantes y estructuras abstractas. Cero analogías vagas sin rigor conceptual.',
        mathRule: 'OBLIGATORIO: Utiliza fórmulas matemáticas en KaTeX ($...$). Si es una fórmula/teorema establecido del mundo matemático, titula: "- (FORMALISMO MATEMÁTICO): $...$". Si es un modelo pedagógico abstracto o mnemotécnico simplificado creado para la explicación, titula: "- (FORMALISMO MATEMÁTICO EUREKA): $...$".',
        simulatorRule: 'Graficador interactivo de funciones 2D/3D, visualizador de transformaciones matriciales, resolvedor numérico interactivo o geometría dinámica en Canvas 2D (+400 a +500 líneas reales en React 18 + TSX).'
      };
    }

    if (raw.includes('fisic') || raw === 'fisica') {
      return {
        id: 'fisica',
        name: 'Física',
        domain: 'Leyes físicas de la naturaleza, dinámicas de partículas, campos, energía y relatividad/cuántica.',
        terminologyRule: 'Fuerzas, conservación del momento y energía, potenciales, funciones de onda, entropía y marcos de referencia inerciales.',
        mathRule: 'OBLIGATORIO: Utiliza ecuaciones físicas en KaTeX ($...$). Si es una ley/ecuación real establecida (ej: Newton, Maxwell, Einstein, Schrödinger), titula: "- (FORMALISMO MATEMÁTICO): $...$". Si es un modelo intuitivo o ley simplificada didáctica, titula: "- (FORMALISMO MATEMÁTICO EUREKA): $...$".',
        simulatorRule: 'Motor de física en tiempo real (integración numérica RK4/Verlet, partículas 2D interactivas, campos vectoriales oscilantes, colisiones elásticas, osciloscopios) en Canvas 2D (+400 a +500 líneas en React 18 + TSX).'
      };
    }

    if (raw.includes('quimic') || raw === 'quimica') {
      return {
        id: 'quimica',
        name: 'Química',
        domain: 'Estructura atómica, enlaces moleculares, cinética química, termodinámica y síntesis.',
        terminologyRule: 'Estequiometría, orbitales moleculares, entalpía, energía libre de Gibbs, equilibrio químico, pH y cinéticas de reacción.',
        mathRule: 'Utiliza ecuaciones químicas y fórmulas termodinámicas en KaTeX ($...$). Si es una ecuación estándar real, titula: "- (FORMALISMO MATEMÁTICO): $...$". Si es un modelo de tasa conceptual simplificado, titula: "- (FORMALISMO MATEMÁTICO EUREKA): $...$". Si el subnivel es puramente estructural o descriptivo, omite la línea.',
        simulatorRule: 'Simulador de cinética de reacciones en tiempo real, balance de equilibrio dinámico, visualizador de enlaces moleculares en Canvas o titulador ácido-base interactivo (+400 a +500 líneas en React 18 + TSX).'
      };
    }

    if (raw.includes('biolog') || raw === 'biologia') {
      return {
        id: 'biologia',
        name: 'Biología',
        domain: 'Sistemas vivos, biología celular y molecular, genética, ecología y evolución.',
        terminologyRule: 'Mecanismos celulares, transcripción genética, homeostasis, vías metabólicas, selección natural y cascadas enzimáticas.',
        mathRule: 'Si el concepto incluye cinéticas cuantitativas (Michaelis-Menten, Lotka-Volterra, Hardy-Weinberg), titula: "- (FORMALISMO MATEMÁTICO): $...$". Si es una relación de proporciones didáctica, titula: "- (FORMALISMO MATEMÁTICO EUREKA): $...$". Si es un proceso biológico cualitativo o anatómico, OMITE la línea de formalismo matemático por completo.',
        simulatorRule: 'Simulador dinámico de ecosistema presa-depredador, cruzamientos genéticos interactivos, cascada de señalización celular o motor de mutación evolutiva (+400 a +500 líneas en React 18 + TSX).'
      };
    }

    if (raw.includes('medicin') || raw.includes('anatom') || raw === 'medicina') {
      return {
        id: 'medicina',
        name: 'Medicina & Anatomía',
        domain: 'Ciencias médicas, fisiopatología, clínica, diagnóstico, farmacología y anatomía humana.',
        terminologyRule: 'Fisiopatología causal, etiología, diagnóstico diferencial, farmacocinética, parámetros hemodinámicos y mecanismos de acción celular.',
        mathRule: 'Si se trata de fórmulas clínicas reales (clearance renal, gasto cardíaco, Henderson-Hasselbalch, dosificación), titula: "- (FORMALISMO MATEMÁTICO): $...$". Para procesos patológicos o anatómicos cualitativos, 🚨 PROHIBIDO FORZAR MATEMÁTICAS: OMITE la línea de formalismo matemático por completo.',
        simulatorRule: 'Simulador de paciente clínico y monitor de signos vitales interactivo, motor de toma de decisiones diagnósticas con feedback causal, o explorador de capas anatómicas/farmacológicas (+400 a +500 líneas en React 18 + TSX).'
      };
    }

    if (raw.includes('histor') || raw === 'historia') {
      return {
        id: 'historia',
        name: 'Historia',
        domain: 'Procesos históricos, causas socioeconómicas, geopolítica, revoluciones y análisis historiográfico.',
        terminologyRule: 'Causalidad histórica, condiciones materiales, corrientes ideológicas, tensiones geopolíticas, fuentes primarias, instituciones y correlación de fuerzas.',
        mathRule: '🚨 PROHIBIDO ABSOLUTAMENTE INVENTAR O INCLUIR FÓRMULAS MATEMÁTICAS. La historia no se rige por ecuaciones pseudocientíficas. OMITE POR COMPLETO la línea de formalismo matemático en cada subnivel.',
        simulatorRule: 'Línea temporal interactiva ramificada con árbol de decisiones de crisis histórica, mapa geopolítico táctico con balance de facciones y recursos, o simulador de análisis de dilemas historiográficos (+400 a +500 líneas en React 18 + TSX).'
      };
    }

    if (raw.includes('geograf') || raw === 'geografia') {
      return {
        id: 'geografia',
        name: 'Geografía',
        domain: 'Geografía física, climatología, geomorfología, geografía humana y demografía.',
        terminologyRule: 'Dinámica de placas tectónicas, gradientes térmicos, patrones de circulación atmosférica, transición demográfica y cuencas hidrográficas.',
        mathRule: 'Solo si aplica a modelos de gradiente térmico, Coriolis o pirámides demográficas, titula: "- (FORMALISMO MATEMÁTICO): $...$". En conceptos geomorfológicos y descriptivos, OMITE la línea de formalismo matemático.',
        simulatorRule: 'Simulador interactivo de placas tectónicas/climatología en Canvas 2D, visualizador de perfiles topográficos o modelo interactivo de transición demográfica (+400 a +500 líneas en React 18 + TSX).'
      };
    }

    if (raw.includes('filosof') || raw === 'filosofia') {
      return {
        id: 'filosofia',
        name: 'Filosofía',
        domain: 'Epistemología, ética, ontología, lógica formal, filosofía política y fenomenología.',
        terminologyRule: 'Silogismos, dialéctica, premisas y conclusiones, experimentos mentales, dilemas éticos, imperativos y marcos ontológicos.',
        mathRule: 'Si se trata de lógica formal/simbólica (\\forall, \\exists, \\rightarrow, \\land), titula: "- (FORMALISMO MATEMÁTICO): $...$". Para filosofía ética, metafísica y política, OMITE la línea de formalismo matemático por completo.',
        simulatorRule: 'Simulador de experimentos mentales éticos (Dilema del tranvía con variables dinámicas de deontología vs utilitarismo), analizador dialéctico interactivo de argumentos o árbol de proposiciones lógicas (+400 a +500 líneas en React 18 + TSX).'
      };
    }

    if (raw.includes('literat') || raw.includes('lengua') || raw === 'literatura') {
      return {
        id: 'literatura',
        name: 'Literatura & Lengua',
        domain: 'Análisis literario, estructuras narrativas, retórica, semiótica y teoría del lenguaje.',
        terminologyRule: 'Arco narrativo, tropos y figuras retóricas, matrices semióticas, cadencia estilística, evolución de personajes y subtexto.',
        mathRule: '🚨 PROHIBIDO FORZAR MATEMÁTICAS. OMITE POR COMPLETO la línea de formalismo matemático en todos los subniveles.',
        simulatorRule: 'Constructor interactivo del viaje del héroe y arco dramático, detector/entrenador de figuras retóricas con feedback en vivo, o visualizador de métrica y estructura poética (+400 a +500 líneas en React 18 + TSX).'
      };
    }

    if (raw.includes('idiom') || raw === 'idiomas') {
      return {
        id: 'idiomas',
        name: 'Idiomas & Lingüística',
        domain: 'Adquisición de lenguas, fonética, sintaxis, morfología y pragmática comunicativa.',
        terminologyRule: 'Estructuras sintácticas, registros de habla, patrones de colocación, concordancia gramatical, fonemas y transcripción IPA.',
        mathRule: '🚨 PROHIBIDO INVENTAR FÓRMULAS MATEMÁTICAS. OMITE la línea de formalismo matemático.',
        simulatorRule: 'Sandbox interactivo de diálogos contextuales con árbol de respuestas, desafiador de orden sintáctico con feedback sonoro/visual, o generador de combinaciones morfológicas (+400 a +500 líneas en React 18 + TSX).'
      };
    }

    if (raw.includes('informat') || raw.includes('program') || raw.includes('software') || raw === 'informatica') {
      return {
        id: 'informatica',
        name: 'Informática & Programación',
        domain: 'Ciencias de la computación, arquitectura de software, algoritmos, concurrencia y sistemas distribuidos.',
        terminologyRule: 'Complejidad algorítmica O(n), máquinas de estados finitos, invariantes de bucle, árboles de sintaxis abstracta (AST), modelos de memoria y concurrencia.',
        mathRule: 'Utiliza complejidades O(...), expresiones booleanas o relaciones de recurrencia en KaTeX. Si es una complejidad o teorema estándar, titula: "- (FORMALISMO MATEMÁTICO): $...$". Si es un modelo pedagógico de coste o latencia, titula: "- (FORMALISMO MATEMÁTICO EUREKA): $...$".',
        simulatorRule: 'Visualizador interactivo de algoritmos (grafos, ordenación, árboles binarios), inspector de memoria y punteros, o simulador de flujo de paquetes en redes en Canvas 2D (+400 a +500 líneas en React 18 + TSX).'
      };
    }

    if (raw.includes('derech') || raw.includes('ley') || raw === 'derecho') {
      return {
        id: 'derecho',
        name: 'Derecho & Leyes',
        domain: 'Ciencia jurídica, derecho constitucional, penal, civil, hermenéutica y jurisprudencia.',
        terminologyRule: 'Jerarquía normativa, causales de justificación, nexo causal jurídico, debido proceso, tipicidad, antijuricidad, culpabilidad y argumentación judicial.',
        mathRule: '🚨 PROHIBIDO INVENTAR FÓRMULAS MATEMÁTICAS. El rigor es estrictamente legal, doctrinal y hermenéutico. OMITE POR COMPLETO la línea de formalismo matemático en cada subnivel.',
        simulatorRule: 'Simulador interactivo de juicio y análisis de casos jurídicos con árbol de decisiones procesales, evaluador de elementos de responsabilidad legal o analizador de cláusulas contractuales (+400 a +500 líneas en React 18 + TSX).'
      };
    }

    if (raw.includes('econom') || raw.includes('finanz') || raw === 'economia') {
      return {
        id: 'economia',
        name: 'Economía & Finanzas',
        domain: 'Microeconomía, macroeconomía, finanzas cuantitativas, econometría y teoría de juegos.',
        terminologyRule: 'Curvas de oferta y demanda, equilibrios de Nash, elasticidad, costes y utilidades marginales, tipos de interés, primas de riesgo y valor actual neto.',
        mathRule: 'Utiliza fórmulas económicas y financieras en KaTeX ($...$). Si es una fórmula estándar real (ej. Black-Scholes, elasticidad, VAN, Cobb-Douglas), titula: "- (FORMALISMO MATEMÁTICO): $...$". Si es un modelo didáctico simplificado, titula: "- (FORMALISMO MATEMÁTICO EUREKA): $...$".',
        simulatorRule: 'Sandbox dinámico de curvas de oferta y demanda con inyección de shocks en tiempo real, simulador de carteras de inversión con riesgo/retorno, o modelo macroeconómico de inflación (+400 a +500 líneas en React 18 + TSX).'
      };
    }

    if (raw.includes('psicolog') || raw === 'psicologia') {
      return {
        id: 'psicologia',
        name: 'Psicología & Ciencias Cognitivas',
        domain: 'Psicología cognitiva, conductual, neurociencias, sesgos cognitivos y psicopatología.',
        terminologyRule: 'Sesgos cognitivos, disonancia cognitiva, condicionamiento operante/clásico, función ejecutiva, esquemas mentales y regulación emocional.',
        mathRule: 'Si se refiere a leyes psicofísicas (Weber-Fechner) o psicometría, titula: "- (FORMALISMO MATEMÁTICO): $...$". En procesos cognitivos o conductuales cualitativos, OMITE la línea de formalismo matemático.',
        simulatorRule: 'Laboratorio interactivo de experimentos cognitivos (Efecto Stroop, memoria de trabajo, detección de sesgos con métricas de tiempo de reacción), o simulador de cadenas conductuales (+400 a +500 líneas en React 18 + TSX).'
      };
    }

    if (raw.includes('arte') || raw.includes('diseñ') || raw === 'arte') {
      return {
        id: 'arte',
        name: 'Arte & Diseño',
        domain: 'Artes visuales, diseño UI/UX, teoría del color, composición y tipografía.',
        terminologyRule: 'Proporción áurea, armonías cromáticas, jerarquía visual, espacio negativo, contraste de luminosidad y pesos visuales.',
        mathRule: 'Solo si aplica a la proporción áurea (\\phi) o relaciones de contraste, titula: "- (FORMALISMO MATEMÁTICO): $...$". De lo contrario, OMITE la línea de formalismo matemático.',
        simulatorRule: 'Generador interactivo de paletas y armonías de color con medidor de contraste WCAG, tester interactivo de composiciones con rejilla áurea, o canvas de experimentación tipográfica (+400 a +500 líneas en React 18 + TSX).'
      };
    }

    if (raw.includes('music') || raw === 'musica') {
      return {
        id: 'musica',
        name: 'Música & Teoría Musical',
        domain: 'Armonía, contrapunto, acústica, ritmo, composición y psicoacústica.',
        terminologyRule: 'Progresiones armónicas, círculo de quintas, intervalos consonantes/disonantes, polirritmias, resonancia armónica y sobretonos.',
        mathRule: 'Utiliza fórmulas acústicas en KaTeX ($f_n = f_0 \\cdot 2^{n/12}$). Si es una ley acústica real, titula: "- (FORMALISMO MATEMÁTICO): $...$". Si es un modelo mnemotécnico de intervalos, titula: "- (FORMALISMO MATEMÁTICO EUREKA): $...$".',
        simulatorRule: 'Sintetizador interactivo con Web Audio API y visualizador osciloscopio en tiempo real, constructor de acordes en el círculo de quintas interactivo, o secuenciador rítmico polifónico (+400 a +500 líneas en React 18 + TSX).'
      };
    }

    if (raw.includes('social') || raw === 'ciencias_sociales') {
      return {
        id: 'ciencias_sociales',
        name: 'Ciencias Sociales & Sociología',
        domain: 'Sociología, antropología, movimientos sociales, estratificación y análisis de redes sociales.',
        terminologyRule: 'Estratificación social, funcionalismo estructural, hegemonía cultural, redes de afinidad, instituciones y capital social.',
        mathRule: '🚨 CERO FÓRMULAS FORZADAS. A menos que sea demografía estadística formal, OMITE la línea de formalismo matemático.',
        simulatorRule: 'Simulador de difusión de opiniones en redes sociales con agentes interactivos, modelo de segregación o mapa interactivo de dinámica poblacional (+400 a +500 líneas en React 18 + TSX).'
      };
    }

    if (raw.includes('ingenier') || raw === 'ingenieria') {
      return {
        id: 'ingenieria',
        name: 'Ingeniería',
        domain: 'Ingeniería mecánica, eléctrica, civil, química, robótica y sistemas de control.',
        terminologyRule: 'Esfuerzos y deformaciones, funciones de transferencia, lazos de control PID, termodinámica de fluidos, diagramas de Bode e impedancia.',
        mathRule: 'OBLIGATORIO: Utiliza fórmulas de ingeniería en KaTeX ($...$). Si es una ecuación estándar, titula: "- (FORMALISMO MATEMÁTICO): $...$". Si es un modelo pedagógico abreviado, titula: "- (FORMALISMO MATEMÁTICO EUREKA): $...$".',
        simulatorRule: 'Simulador de esfuerzos estructurales en puentes/vigas en Canvas 2D, sintonizador interactivo de bucle PID con gráficas de respuesta en el tiempo, o simulador de circuitos RLC (+400 a +500 líneas en React 18 + TSX).'
      };
    }

    if (raw.includes('politic') || raw === 'politica') {
      return {
        id: 'politica',
        name: 'Ciencias Políticas',
        domain: 'Sistemas electorales, teoría política, relaciones internacionales y gobernanza pública.',
        terminologyRule: 'Sistemas de votación, cuotas electorales, equilibrios de poder, ciclos de políticas públicas y disuasión estratégica.',
        mathRule: 'Si es un método electoral matemático (D\'Hondt, Hare, Borda), titula: "- (FORMALISMO MATEMÁTICO): $...$". En teoría política o relaciones internacionales cualitativas, OMITE la línea de formalismo matemático.',
        simulatorRule: 'Simulador comparativo de sistemas electorales y escaños con cálculo en vivo, juego de negociación de crisis geopolítica o constructor de coaliciones parlamentarias (+400 a +500 líneas en React 18 + TSX).'
      };
    }

    // Default / General
    return {
      id: 'general',
      name: 'General / Primeros Principios',
      domain: 'Descomposición fundamental de primeros principios adaptada a la naturaleza específica del tema.',
      terminologyRule: 'Vocabulario analítico preciso propio del tema, sin forzar jerga física ajena si el tema no lo es.',
      mathRule: 'Incluye formalismo matemático únicamente si el tema es intrínsecamente cuantitativo (titulando "- (FORMALISMO MATEMÁTICO):" o "- (FORMALISMO MATEMÁTICO EUREKA):"). Si el tema es cualitativo o social, OMITE la línea de formalismo matemático por completo.',
      simulatorRule: 'Simulador interactivo visual y lúdico específico para este tema en Canvas 2D / React 18 (+400 a +500 líneas reales).'
    };
  }

  /**
   * Construye el System Prompt con las reglas pedagógicas y arquitectónicas de élite,
   * integrando de forma explícita la exigencia inquebrantable de +400/+500 líneas en CADA nivel,
   * exámenes de nivel formativos y el Examen Final de Cuaderno con Mega-Simulador de +1000 líneas.
   */
  public buildSystemPrompt(formOrCount: FeynmanDiagnosticForm | (10 | 15 | 20)): string {
    const isForm = typeof formOrCount === 'object' && formOrCount !== null;
    const form: FeynmanDiagnosticForm = isForm
      ? (formOrCount as FeynmanDiagnosticForm)
      : {
          topic: 'Fundamentos de Primeros Principios',
          currentLevel: 1,
          targetGoal: formOrCount === 20 ? 'especializado' : formOrCount === 15 ? 'adentrado' : 'general'
        };

    const levelsCount = this.getTargetLevelsCount(form.targetGoal);
    const goalTitle =
      form.targetGoal === 'general'
        ? 'Conocedor general (10 Niveles - Visión Global & Intuición Base)'
        : form.targetGoal === 'adentrado'
        ? 'Conocedor adentrado (15 Niveles - Dominio Práctico & Análisis de Problemas)'
        : 'Conocedor exigente especializado (20 Niveles - Rigor Máximo, Arquitectura & Estado del Arte)';

    const currentLevelNames: Record<number, string> = {
      1: 'Nivel 1: Principiante absoluto (Sin nociones previas, requiere intuición cotidiana simple)',
      2: 'Nivel 2: Principiante con nociones (Conoce terminología básica pero sin soltura práctica)',
      3: 'Nivel 3: Intermedio básico (Entiende teoría general pero requiere consolidación técnica)',
      4: 'Nivel 4: Intermedio avanzado (Aplica el tema regularmente con bases sólidas)',
      5: 'Nivel 5: Avanzado / Experto (Busca optimización extrema, casos límite y arquitectura)'
    };

    const levelDescription = currentLevelNames[form.currentLevel] || `Nivel ${form.currentLevel} de 5`;
    const topic = form.topic.trim();
    const subjectProfile = this.getSubjectPedagogicalProfile(form.subject);

    // Bloque de información adjunta si existe
    let attachedInfoInstruction = '';
    if (form.hasAttachedInfo) {
      if (form.attachedInfoType === 'total_basis') {
        attachedInfoInstruction = `
================================================================================
🚨 DIRECTRIZ CRÍTICA DE INFORMACIÓN ADJUNTA: BASE TOTAL DE LA EXPLICACIÓN 🚨
================================================================================
El usuario ha indicado que ADJUNTARÁ o ha adjuntado material documental en el cual DEBE BASARSE TOTALMENTE la explicación de "${topic}".
- 🎯 PROPÓSITO: FUENTE ÚNICA Y VERDAD TOTAL DE LA RUTA PEDAGÓGICA.
- 📜 INSTRUCCIÓN SUPREMA: Todos los ${levelsCount} niveles, axiomas, subniveles y cadenas causales DEBEN derivarse y fundamentarse ESTRICTA Y PRIORITARIAMENTE en este material adjunto. Prohibido inventar datos, contradecir la información o desviarse del alcance temático del documento.
${form.attachedInfoContent?.trim() ? `\nMATERIAL ADJUNTO PROPORCIONADO:\n"""\n${form.attachedInfoContent.trim()}\n"""\n` : '\n(El usuario adjuntará los archivos o el texto en este mensaje o conversación).\n'}`;
      } else {
        attachedInfoInstruction = `
================================================================================
📎 DIRECTRIZ DE INFORMACIÓN ADJUNTA: MATERIAL DE APOYO Y COMPLEMENTO 📎
================================================================================
El usuario ha indicado que ADJUNTARÁ o ha adjuntado material de referencia para enriquecer el aprendizaje de "${topic}".
- 💡 PROPÓSITO: MATERIAL DE APOYO, CONTEXTO Y FUENTE DE EJEMPLOS CLAVE.
- 📜 INSTRUCCIÓN: Utiliza estrechamente los conceptos del material adjunto como referencia primordial, integrándolo y complementándolo de forma armoniosa con tu conocimiento pedagógico experto de primeros principios.
${form.attachedInfoContent?.trim() ? `\nMATERIAL ADJUNTO PROPORCIONADO:\n"""\n${form.attachedInfoContent.trim()}\n"""\n` : '\n(El usuario adjuntará los archivos o el texto en este mensaje o conversación).\n'}`;
      }
    }

    return `# MISIÓN PEDAGÓGICA FEYNMAN & PRIMEROS PRINCIPIOS
- 🎯 TEMA CENTRAL A DOMINAR: "${topic}"
- 📚 MATERIA / ÁREA DISCIPLINAR: ${subjectProfile.name} (${subjectProfile.domain})
- 📊 NIVEL DE PARTIDA DEL ESTUDIANTE: ${levelDescription}
- 🧠 CONOCIMIENTOS PREVIOS DECLARADOS: ${form.previousKnowledge?.trim() ? `"${form.previousKnowledge.trim()}"` : 'Ninguno (partir de los fundamentos y situaciones cotidianas)'}
- 🏆 NIVEL OBJETIVO FINAL: ${goalTitle} -> TOTAL DE NIVELES PRINCIPALES: EXACTAMENTE ${levelsCount} NIVELES
- 🔬 ENFOQUE ESPECÍFICO REQUERIDO: ${form.specificFocus?.trim() ? `"${form.specificFocus.trim()}"` : 'Comprensión integral de primeros principios con simuladores interactivos en React y TypeScript (+400 a +500 líneas por nivel), exámenes de nivel y examen final (+1000 líneas)'}
${attachedInfoInstruction}
# ROL Y DIRECTRICES DE IDENTIDAD
Eres un maestro pedagogo y experto mundial en el Método de Richard Feynman y el razonamiento por Primeros Principios adaptado a la materia de **${subjectProfile.name}**. Tu único objetivo es generar una ruta de estudio exhaustiva, ultraestructurada, hiper-atómica y fiel al dominio real de "${topic}" para que el estudiante domine con maestría absoluta este tema desde su nivel actual (${form.currentLevel}/5) hasta el nivel ${levelsCount} (${goalTitle}), entregado en un ÚNICO ARCHIVO O RECUADRO DE CÓDIGO MARKDOWN CONTINUO (.md).

================================================================================
🚨 DIRECTRICES ESPECÍFICAS PARA EL DOMINIO "${subjectProfile.name.toUpperCase()}" 🚨
================================================================================
1. MARCO CONCEPTUAL Y VOCABULARIO:
   - ${subjectProfile.terminologyRule}
   - Prohibido imponer terminología física a temas de humanidades, historia, literatura o leyes. Habla con el lenguaje natural y formal de ${subjectProfile.name}.

2. REGLA DEL FORMALISMO MATEMÁTICO:
   - ${subjectProfile.mathRule}
   - Si se incluye una fórmula real establecida del mundo académico/científico/económico: titula exactamente "**- (FORMALISMO MATEMÁTICO):** $...$".
   - Si se incluye una fórmula inventada o modelo pedagógico mnemotécnico simplificado para Eureka: titula exactamente "**- (FORMALISMO MATEMÁTICO EUREKA):** $...$".
   - 🚨 SI LA MATERIA NO ES MATEMÁTICA (Historia, Derecho, Literatura, Filosofía, Idiomas, etc.): ESTÁ TOTALMENTE PROHIBIDO INVENTAR FÓRMULAS. DEBES OMITIR LA LÍNEA DE FORMALISMO MATEMÁTICO POR COMPLETO EN CADA SUBNIVEL.

3. SIMULADORES INTERACTIVOS ADAPTADOS (+400 A +500 LÍNEAS):
   - ${subjectProfile.simulatorRule}

================================================================================
🚨 REGLA SUPREMA DE FORMATO, RIGOR Y ENTREGA (OBLIGATORIA E INVIOLABLE) 🚨
================================================================================
1. TODO EL REPORTE DEBE VENIR EN UN ÚNICO DOCUMENTO O RECUADRO MARKDOWN CONTINUO:
   - Todo el contenido, desde el Nivel 1 hasta el Nivel ${levelsCount}, y el Examen Final del Cuaderno, debe estar dentro de un ÚNICO cuerpo de texto Markdown.
   - CERO TEXTO CONVERSACIONAL: PROHIBIDO poner saludos ("¡Hola! Aquí tienes la guía..."), introducciones o notas al pie. Tu respuesta debe comenzar INMEDIATAMENTE con "# Nivel 1: [Título]" y terminar con el último bloque del Examen Final.
   - PROHIBIDO EL TRUNCAMIENTO: Debes redactar explícitamente cada uno de los ${levelsCount} niveles de principio a fin.

2. FIDELIDAD EXACTA DEL NÚMERO DE NIVELES:
   - Debes generar EXACTAMENTE ${levelsCount} NIVELES PRINCIPALES (desde '# Nivel 1:' hasta '# Nivel ${levelsCount}:') seguidos del '# Examen Final del Cuaderno'.

3. ESTRUCTURA Y ORDEN ESTRICTO DE CADA SUBNIVEL HIPER-ATÓMICO (6 A 10 POR NIVEL):
   - Cada Nivel Principal debe dividirse obligatoriamente en ENTRE 6 Y 10 SUBNIVELES ATÓMICOS (Subnivel X.1 a Subnivel X.6, X.7, X.8, X.9 o X.10). La IA decide la cantidad exacta dentro del intervalo [6 - 10] según la complejidad del concepto para lograr la máxima granularidad axiomática sin perder información.
   - ⚠️ **ORDEN EXACTO E INVARIABLE PARA CADA SUBNIVEL**:
     1. **Intuición Feynman:** Micro-analogía cotidiana ultra-simple, amigable y brillante (estilo Richard Feynman puro: como explicárselo a un niño o persona común sin jerga técnica pesada, directa y en 1-2 frases).
     2. **Idea Clave:** Definición formal hiper-atómica, rigurosa y precisa en 1 sola frase contundente sin rodeos.
     3. **Cadena Causal:** Secuencia causal paso a paso directa (Causa -> Efecto -> Estado resultante en 1-2 frases precisas).
     4. **(FORMALISMO MATEMÁTICO)** o **(FORMALISMO MATEMÁTICO EUREKA):** Fórmula en KaTeX ($...$). 🚨 SOLO SI EL TEMA O CONCEPTO REALMENTE LO REQUIERE. SI ES DE HUMANIDADES/CUALITATIVO, OMITE ESTA LÍNEA POR COMPLETO.
     5. **Límite de Ruptura / Condición de Frontera:** 🚨 ESTRICTAMENTE OPCIONAL. Incluir ÚNICA Y EXCLUSIVAMENTE si es SUMAMENTE NECESARIO y existe un límite de frontera o ruptura crítico e indispensable. Si no es estrictamente necesario, OMITE ESTA LÍNEA POR COMPLETO.

4. 🚨 REGLA INVIOLABLE DE CÓDIGO REACT + TYPESCRIPT (+400 A +500 LÍNEAS REALES EN CADA NIVEL) 🚨:
   - ⚠️ **REGLA ESTRICTA**: CADA UNO DE LOS ${levelsCount} NIVELES (DESDE EL NIVEL 1 HASTA EL NIVEL ${levelsCount}) DEBE CONTENER OBLIGATORIAMAMENTE SU PROPIO BLOQUE REACT + TYPESCRIPT (\`\`\`tsx o \`\`\`typescript) CON UN MÍNIMO ESTRICTO DE +400 A +500 LÍNEAS DE CÓDIGO REAL Y ESPECÍFICO DE "${topic}".
   - ⛔ **PROHIBIDO RESUMIR DESPUÉS DEL NIVEL 1**: Prohibido poner '// Código similar al nivel anterior', '// Implementar resto...', o bloques cortos de 50 líneas. CADA nivel debe ser un programa completo, funcional y único de +400 a +500 líneas.
   - 🎨 **EXPERIENCIA TOTALMENTE VISUAL, LÚDICA E HIPER-INTERACTIVA (CERO BOTONES ABURRIDOS O FORMULARIOS PLANOS)**:
     * CERO interfaces monótonas o grises. El programa debe sentirse como un **Laboratorio Científico Gamificado / Sandbox Interactivo**:
     * **Animaciones Gráficas en Vivo**: Utiliza HTML5 Canvas 2D interactivo o SVGs reactivos animados mediante \`requestAnimationFrame\` o \`useEffect\` (partículas dinámicas, ondas oscilantes, trayectorias orbitales, campos vectoriales, grafos con nodos arrastrables o diagramas de estado que reaccionan con brillo al interactuar).
     * **Mecánicas Lúdicas y de Juego**: Retos interactivos, inyector de perturbaciones y sobrecargas con explosión de partículas, medidor de vida/estabilidad en tiempo real con colores dinámicos (neón cian, esmeralda, ámbar, rojo de sobrecarga), y retroalimentación sonora con Web Audio API (\`window.playTone(freq, type, duration)\`).
     * **Controles Visuales y Táctiles**: Sliders con pistas luminosas, interruptores futuristas, selectores con badges brillantes, HUD de telemetría estilo Sci-Fi con gráficas en vivo (osciloscopio reactivo, medidor de entropía, índice de estabilidad) y panel de logros/medallas al superar límites de prueba.
   - Arquitectura del Componente React de cada nivel:
     - Componente Funcional de **React 18** (\`export function App()\`).
     - Hooks de React (\`useState\`, \`useEffect\`, \`useMemo\`, \`useCallback\`, \`useRef\`).
     - UI con **Tailwind CSS** y diseño Glassmorphism oscuro (\`bg-slate-950\`, \`p-6\`, \`rounded-2xl\`, canvas interactivo, controles táctiles y feedback didáctico visual en tiempo real).
     - Audio sintetizado (\`window.playTone(freq, type, duration)\`) y exportación limpia.

5. 📝 EXAMEN POR NIVEL (EVALUACIÓN FORMATIVA DE CADA NIVEL):
   - Al final de cada nivel, incluye una sección \`## 5. Examen de Nivel\` con:
     - Entre 3 y 5 preguntas de selección múltiple con 4 opciones (A, B, C, D) que pongan a prueba la comprensión causal y los conceptos explicados en ese nivel.
     - Indicación explícita de la **Respuesta Correcta** y la **Justificación Causal**.

6. 🎓 EXAMEN FINAL DEL CUADERNO: GRAN RETO DE MAESTRÍA (AL FINAL DE LA GUÍA):
   - Tras el Nivel ${levelsCount}, incluye la sección \`# Examen Final del Cuaderno: Gran Reto de Maestría Holística\` que contiene:
     1. **Quizz Integral de Maestría**: 10 preguntas de alta exigencia que combinan y evalúan la síntesis de todos los niveles.
     2. **🚨 Mega-Simulador Evaluador en React 18 + TypeScript (+1000 LÍNEAS DE CÓDIGO REAL)**:
        - Un bloque \`\`\`tsx con UN MÍNIMO DE MÁS DE 1000 LÍNEAS DE CÓDIGO REAL.
        - **DEBE SER UNA EXPERIENCIA FAKING VISUAL, LÚDICA Y SUMAMENTE INTERACTIVA**: Canvas 2D multi-partícula de alta fidelidad, arena de pruebas de estrés, generador de perturbaciones caóticas, medidores de telemetría en tiempo real, selector de retos de maestría con puntuación dinámica, efectos de audio e iluminación reactiva, y generador de certificado de maestría animado.

================================================================================
ESTRUCTURA MARKDOWN OBLIGATORIA
================================================================================

# Nivel 1: [Título del Concepto Axiomático de ${topic}]

## 1. Axioma Central (Intuición Feynman)
[Explicación concisa y nítida en 1 párrafo corto descomponiendo el fundamento de ${topic} mediante una analogía visual cotidiana, clara y directa].

## 2. Desglose Atómico
### Subnivel 1.1: [Concepto Atómico Específico de ${topic}]
- **Intuición Feynman:** [Micro-analogía cotidiana ultra-simple, directa y sin jerga, estilo Richard Feynman puro en 1-2 frases].
- **Idea Clave:** [Definición formal precisa y concisa en 1 sola frase contundente].
- **Cadena Causal:** [Mecanismo causal: causa -> efecto -> estado en 1-2 frases].
- **(FORMALISMO MATEMÁTICO)** o **(FORMALISMO MATEMÁTICO EUREKA):** $[Fórmula KaTeX solo si aplica; si es cualitativo, omitir esta línea]$
- **Límite de Ruptura / Condición de Frontera:** [SOLO SI ES SUMAMENTE NECESARIO; si no, omitir]

### Subnivel 1.2: [Concepto Atómico Específico de ${topic}]
- **Intuición Feynman:** [Micro-analogía cotidiana ultra-simple].
- **Idea Clave:** [Definición formal precisa en 1 frase].
- **Cadena Causal:** [Mecanismo causal directo].
... (Entre 6 y 10 subniveles: de 1.1 hasta 1.6 ... 1.10 según decida la IA)

## 3. Panel Interactivo (React + TypeScript)
\`\`\`tsx
// ============================================================================
// COMPONENTE INTERACTIVO EN REACT Y TYPESCRIPT (+400 A +500 LÍNEAS DE CÓDIGO REAL)
// ESPECÍFICO DE ${topic.toUpperCase()} • NIVEL 1
// EXPERIENCIA TOTALMENTE VISUAL, LÚDICA, CON CANVAS 2D/ANIMACIONES, AUDIO Y TELEMETRÍA
// ============================================================================
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';

export function App() {
  // Canvas 2D interactivo, partículas, simulación dinámica, sliders con brillo, medidor de vida/estabilidad, audio (+400-500 líneas reales)
  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen font-sans">
      {/* UI React visual, moderna y lúdica con Canvas y Tailwind CSS */}
    </div>
  );
}
\`\`\`

## 4. Nexo Causal
- **Problema resuelto:** [Qué entendemos con exactitud tras este nivel sobre ${topic}].
- **Siguiente obstáculo:** [Qué limitación o nuevo reto surge que nos obliga a ascender al Nivel 2].

## 5. Examen de Nivel (Evaluación Formativa)
### Pregunta 1.1: [Pregunta conceptual de razonamiento causal sobre este nivel]
- A) [Opción A]
- B) [Opción B]
- C) [Opción C]
- D) [Opción D]
- **Respuesta Correcta:** B
- **Justificación Causal:** [Explicación de por qué es la correcta según los primeros principios de este nivel].

### Pregunta 1.2: [Segunda pregunta sobre dinámicas del nivel]
- A) [Opción A]
- B) [Opción B]
- C) [Opción C]
- D) [Opción D]
- **Respuesta Correcta:** C
- **Justificación Causal:** [Explicación].

### Pregunta 1.3: [Tercera pregunta de aplicación práctica]
- A) [Opción A]
- B) [Opción B]
- C) [Opción C]
- D) [Opción D]
- **Respuesta Correcta:** A
- **Justificación Causal:** [Explicación].

---

(REPETIR ESTA ESTRUCTURA EXACTA PARA TODOS LOS ${levelsCount} NIVELES, CON ENTRE 6 Y 10 SUBNIVELES ATÓMICOS Y CÓDIGO REACT HIPER-VISUAL DE +400 A +500 LÍNEAS EN CADA UNO DE ELLOS)

---

# Examen Final del Cuaderno: Gran Reto de Maestría Holística

## 1. Resumen y Objetivos de la Evaluación Integral
[Explicación de los principios consolidados a lo largo de los ${levelsCount} niveles de ${topic}.]

## 2. Quizz Integral de Maestría (10 Preguntas de Síntesis)
### Pregunta F.1: [Pregunta que combina principios de múltiples niveles]
- A) [Opción A]
- B) [Opción B]
- C) [Opción C]
- D) [Opción D]
- **Respuesta Correcta:** B
- **Justificación Causal:** [Explicación].

... (Pregunta F.2 a Pregunta F.10 con el mismo formato)

## 3. Mega-Simulador Evaluador en React 18 + TypeScript (+1000 Líneas de Código Real)
\`\`\`tsx
// ============================================================================
// MEGA-SIMULADOR EVALUADOR FINAL DE MAESTRÍA (+1000 LÍNEAS DE CÓDIGO REAL)
// DOMINIO COMPLETO: ${topic.toUpperCase()}
// SUITE GAMIFICADA, CANVAS 2D DE ALTA FIDELIDAD, ARENA DE PRUEBAS, RETOS DE ESTRÉS Y CERTIFICADO
// ============================================================================
import React, { useState, useEffect, useMemo, useRef, useReducer, useCallback } from 'react';

export function App() {
  // Mega-aplicación lúdica completa con arena de simulación Canvas 2D, inyector de caos,
  // HUD Sci-Fi multi-variable, telemetría integral y certificación animada (+1000 líneas reales).
  return (
    <div className="p-8 bg-slate-950 text-slate-100 min-h-screen font-sans">
      {/* Mega UI React con suite interactiva y lúdica de evaluación */}
    </div>
  );
}
\`\`\``;
  }

  /**
   * Construye el User Prompt calibrando las respuestas del cuestionario de diagnóstico.
   */
  public buildUserPrompt(form: FeynmanDiagnosticForm): string {
    const levelsCount = this.getTargetLevelsCount(form.targetGoal);
    const subjectProfile = this.getSubjectPedagogicalProfile(form.subject);
    const goalTitle =
      form.targetGoal === 'general'
        ? 'Conocedor general (10 Niveles)'
        : form.targetGoal === 'adentrado'
        ? 'Conocedor adentrado (15 Niveles)'
        : 'Conocedor exigente especializado (20 Niveles)';

    let attachSummary = 'Ninguna (utilizar conocimiento general)';
    if (form.hasAttachedInfo) {
      attachSummary = form.attachedInfoType === 'total_basis'
        ? '🚨 INFORMACIÓN ADJUNTA ACTÚA COMO BASE TOTAL Y EXCLUSIVA DE LA EXPLICACIÓN'
        : '📎 INFORMACIÓN ADJUNTA ACTÚA COMO MATERIAL DE APOYO Y CONTEXTO COMPLEMENTARIO';
    }

    return `PARÁMETROS DEL DIAGNÓSTICO DEL ESTUDIANTE:
- TEMA A APRENDER: "${form.topic.trim()}"
- MATERIA / ÁREA DISCIPLINAR: ${subjectProfile.name}
- NIVEL ACTUAL DEL USUARIO: Nivel ${form.currentLevel} de 5
- CONOCIMIENTOS PREVIOS REPORTADOS: ${form.previousKnowledge?.trim() ? `"${form.previousKnowledge.trim()}"` : 'Ninguno especificado (Partir desde los fundamentos)'}
- INFORMACIÓN ADJUNTA / REFERENCIA: ${attachSummary}
- NIVEL OBJETIVO DEL ESTUDIANTE: ${goalTitle} -> TOTAL DE NIVELES PRINCIPALES A GENERAR: EXACTAMENTE ${levelsCount} NIVELES + EXAMEN FINAL
- ENFOQUE PRIORITARIO ESPECÍFICO: ${form.specificFocus?.trim() ? `"${form.specificFocus.trim()}"` : 'Comprensión integral de primeros principios con simuladores en React+TS (+400 a +500 líneas por nivel), exámenes de nivel y examen final (+1000 líneas)'}

================================================================================
🚨 INSTRUCCIONES ESPECÍFICAS Y RECORDATORIO DE RIGOR PARA "${form.topic.trim()}" (${subjectProfile.name}) 🚨
================================================================================
1. FIDELIDAD TOTAL AL DOMINIO "${subjectProfile.name}":
   - ${subjectProfile.terminologyRule}
   - ${subjectProfile.mathRule}
2. GRANULARIDAD AXIOMÁTICA Y ORDEN ESTRICTO EN CADA SUBNIVEL (ENTRE 6 Y 10 SUBNIVELES POR NIVEL):
   - Cada nivel debe contener ENTRE 6 Y 10 SUBNIVELES ATÓMICOS (Subnivel X.1 a Subnivel X.6 ... X.10). La IA decide la cantidad exacta en ese intervalo.
   - Todo debe ser sumamente atómico, conciso y directo al grano, sin perder información.
   1º) Intuición Feynman (micro-analogía cotidiana ultra-simple y amigable, estilo Richard Feynman puro, fácil de entender en 1-2 frases).
   2º) Idea Clave (definición formal, precisa y atómica en 1 sola frase sin relleno).
   3º) Cadena Causal (mecanismo causal directo Causa -> Efecto en 1-2 frases).
   4º) (FORMALISMO MATEMÁTICO) o (FORMALISMO MATEMÁTICO EUREKA) (SOLO SI APLICA; si no aplica, omitir).
   5º) Límite de Ruptura / Condición de Frontera (🚨 ESTRICTAMENTE OPCIONAL: solo si es SUMAMENTE NECESARIO; si no, omitir).
3. 🚨 CÓDIGO EN REACT Y TYPESCRIPT: MÍNIMO +400 A +500 LÍNEAS REALES EN CADA UNO DE LOS ${levelsCount} NIVELES:
   - Prohibido resumir o truncar el código en los niveles posteriores al Nivel 1.
   - CADA NIVEL DEBE TENER SU PROPIO BLOQUE REACT+TS (\`export function App()\`) DE MÁS DE 400-500 LÍNEAS COMPLETAS.
   - 🎨 **DISEÑO FAKING VISUAL, LÚDICO E HIPER-INTERACTIVO (CERO BOTONES ABURRIDOS)**:
     * CADA simulador de cada nivel debe incorporar animaciones gráficas en vivo (Canvas 2D, partículas dinámicas, campos vectoriales, diagramas interactivos).
     * Incluye mecánicas lúdicas de laboratorio/juego (barra de estabilidad dinámica, inyección de perturbaciones y sobrecargas, retos de calibración con puntuación, sonidos con Web Audio API y medidor de telemetría HUD Sci-Fi).
4. 📝 EXAMEN POR NIVEL: Cada nivel debe incluir la sección "## 5. Examen de Nivel" con 3 a 5 preguntas de opción múltiple (A, B, C, D) con respuesta correcta y justificación causal.
5. 🎓 EXAMEN FINAL DEL CUADERNO: Al final, incluye la sección "# Examen Final del Cuaderno: Gran Reto de Maestría Holística" con un Quizz de 10 preguntas y el Mega-Simulador Evaluador en React+TS de MÍNIMO +1000 LÍNEAS DE CÓDIGO REAL.
6. COMIENZA INMEDIATAMENTE CON "# Nivel 1: [Título]" SIN INTRODUCCIONES.
7. GENERA TODOS LOS ${levelsCount} NIVELES COMPLETOS Y EL EXAMEN FINAL SIN TRUNCAMIENTO.`;
  }

  /**
   * Construye el Prompt Maestro Integral ("Textazo") para que el usuario lo copie
   * y lo pegue directamente en cualquier IA externa (ChatGPT, Claude, Gemini, DeepSeek, etc.).
   */
  public buildFullExportablePrompt(form: FeynmanDiagnosticForm): string {
    const levelsCount = this.getTargetLevelsCount(form.targetGoal);
    const systemPrompt = this.buildSystemPrompt(form);
    const userPrompt = this.buildUserPrompt(form);
    const subjectProfile = this.getSubjectPedagogicalProfile(form.subject);

    return `[INSTRUCCIÓN CRÍTICA: ACTÚA COMO EL SIGUIENTE SISTEMA Y DEVUELVE LA RESPUESTA EN UN ÚNICO RECUADRO O ARCHIVO MARKDOWN CONTINUO SIN TEXTO DE RELLENO]

${systemPrompt}

---

# DATOS DEL CUESTIONARIO DE DIAGNÓSTICO DEL ESTUDIANTE
${userPrompt}

---

================================================================================
🚨 RECORDATORIO FINAL: FORMATO, REACT + TYPESCRIPT (+400/500 LÍNEAS/NIVEL), ORDEN FEYNMAN Y EXAMEN FINAL (+1000 LÍNEAS) 🚨
================================================================================
- TEMA EXCLUSIVO: "${form.topic.trim()}" (Materia: ${subjectProfile.name} • Nivel actual: ${form.currentLevel}/5).
- TODO DEBE ESTAR DENTRO DE UN SOLO RECUADRO O ARCHIVO MARKDOWN CONTINUO (.md).
- PROHIBIDO TEXTO CONVERSACIONAL (ni saludos ni despedidas).
- CADA NIVEL CONTIENE ENTRE 6 Y 10 SUBNIVELES ATÓMICOS (Subnivel X.1 a Subnivel X.6 ... X.10).
- ORDEN POR SUBNIVEL: (1) Intuición Feynman ultra-simple (1-2 frases) -> (2) Idea Clave formal precisa (1 frase) -> (3) Cadena Causal directa (1-2 frases) -> (4) Formalismo Matemático (solo si aplica) -> (5) Límite de Ruptura (SOLO si es sumamente necesario).
- FORMALISMO MATEMÁTICO: Omitir si la materia es de humanidades/historia/derecho/letras. Si es fórmula inventada pedagógica usar "(FORMALISMO MATEMÁTICO EUREKA)", si es real usar "(FORMALISMO MATEMÁTICO)".
- LÍMITE DE RUPTURA: Omitir si no es sumamente necesario para el concepto.
- 🚨 REITERACIÓN CRÍTICA: CADA NIVEL (1 al ${levelsCount}) DEBE CONTENER SU PROPIO COMPONENTE EN REACT 18 + TSX (\`export function App()\`) CON MÁS DE 400 A 500 LÍNEAS DE CÓDIGO REAL Y COMPLETO.
- 🎨 DISEÑO VISUAL Y LÚDICO: Cero botones aburridos. Canvas 2D/SVG animados, partículas dinámicas, osciloscopios, barra de estabilidad reactiva, inyección de perturbaciones y efectos sonoros con Web Audio API.
- 📝 CADA NIVEL DEBE INCLUIR SU EXAMEN FORMATIVO (## 5. Examen de Nivel con 3 a 5 preguntas de selección múltiple explicadas).
- 🎓 AL FINAL, INCLUYE EL EXAMEN FINAL DEL CUADERNO CON 10 PREGUNTAS Y EL MEGA-SIMULADOR EN REACT+TS DE MÁS DE 1000 LÍNEAS REALES (Suite gamificada con arena gráfica interactiva, retos de estrés y certificado).
- COMIENZA DIRECTAMENTE CON: "# Nivel 1:"`;
  }

  /**
   * Genera un simulador interactivo completo en React 18 + TypeScript (TSX) con Canvas 2D,
   * partículas reactivas, sliders de control, HUD de telemetría y efectos de audio (+400 líneas).
   */
  public generateLevelInteractiveComponent(lvl: number, title: string, topic?: string): string {
    const safeTopic = (topic || 'Primeros Principios').toUpperCase();
    const safeTitle = (title || `Nivel ${lvl}`).toUpperCase();

    return `import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';

// ============================================================================
// SIMULADOR HIPER-VISUAL E INTERACTIVO DE PRIMEROS PRINCIPIOS • NIVEL ${lvl}
// TEMA: ${safeTopic} | PASO: ${safeTitle}
// TECNOLOGÍA: REACT 18 + TYPESCRIPT (TSX) + CANVAS 2D + TAILWIND CSS + AUDIO
// ============================================================================

export interface SystemParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  energy: number;
  pulsePhase: number;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  color: string;
}

export interface SystemTelemetry {
  cycles: number;
  entropy: number;
  stabilityScore: number;
  meanEnergy: number;
  causalFlow: number;
}

export function App() {
  // 1. Estados Reactivos del Simulador
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [intensity, setIntensity] = useState<number>(${35 + (lvl % 5) * 8});
  const [damping, setDamping] = useState<number>(75);
  const [couplingFactor, setCouplingFactor] = useState<number>(65);
  const [visualMode, setVisualMode] = useState<'particles' | 'waves' | 'energy'>('particles');
  const [activeTab, setActiveTab] = useState<'arena' | 'telemetry' | 'challenge'>('arena');
  
  // Gamificación y Retos de Calibración
  const [challengeProgress, setChallengeProgress] = useState<number>(0);
  const [challengeCompleted, setChallengeCompleted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(100);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<SystemParticle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const mouseRef = useRef<{ x: number; y: number; isDown: boolean }>({ x: -1000, y: -1000, isDown: false });

  const [telemetry, setTelemetry] = useState<SystemTelemetry>({
    cycles: 0,
    entropy: 0.18,
    stabilityScore: 92,
    meanEnergy: 74.5,
    causalFlow: 1.24
  });

  // 2. Audio Sintetizado (Web Audio API)
  const playTone = useCallback((freq: number, type: OscillatorType = 'sine', duration: number = 0.15) => {
    if (typeof window !== 'undefined' && (window as any).playTone) {
      (window as any).playTone(freq, type, duration, 0.08);
    }
  }, []);

  // 3. Inicialización del Enjambre de Partículas
  useEffect(() => {
    const initial: SystemParticle[] = [];
    const colors = ['#38bdf8', '#818cf8', '#a855f7', '#34d399', '#fbbf24', '#f43f5e'];
    for (let i = 0; i < 40; i++) {
      initial.push({
        x: Math.random() * 500 + 50,
        y: Math.random() * 260 + 30,
        vx: (Math.random() - 0.5) * 2.4,
        vy: (Math.random() - 0.5) * 2.4,
        radius: Math.random() * 4 + 3,
        color: colors[i % colors.length],
        energy: Math.random() * 40 + 60,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
    particlesRef.current = initial;
  }, []);

  // 4. Bucle Gráfico Canvas (requestAnimationFrame)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let cycleCounter = 0;

    const render = () => {
      const w = (canvas.width = canvas.parentElement?.clientWidth || 650);
      const h = (canvas.height = 320);

      ctx.fillStyle = 'rgba(8, 12, 28, 0.32)';
      ctx.fillRect(0, 0, w, h);

      if (isRunning) {
        cycleCounter++;

        // Actualizar y dibujar ondas de choque
        shockwavesRef.current = shockwavesRef.current.filter((sw) => {
          sw.radius += 4.5;
          sw.opacity -= 0.024;

          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = \`\${sw.color}\${Math.floor(sw.opacity * 255).toString(16).padStart(2, '0')}\`;
          ctx.lineWidth = 2.5;
          ctx.stroke();

          return sw.opacity > 0;
        });

        // Actualizar partículas
        const particles = particlesRef.current;
        const speedMultiplier = (intensity / 40) * (couplingFactor / 50);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx * speedMultiplier;
          p.y += p.vy * speedMultiplier;
          p.pulsePhase += 0.05 * (intensity / 30);

          // Rebotes con amortiguamiento
          if (p.x < p.radius) { p.x = p.radius; p.vx *= -1; }
          if (p.x > w - p.radius) { p.x = w - p.radius; p.vx *= -1; }
          if (p.y < p.radius) { p.y = p.radius; p.vy *= -1; }
          if (p.y > h - p.radius) { p.y = h - p.radius; p.vy *= -1; }

          // Repulsión con el cursor
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110 && dist > 0) {
            const force = (110 - dist) / 110;
            p.x += (dx / dist) * force * 4.5;
            p.y += (dy / dist) * force * 4.5;
          }

          // Conexiones de red entre partículas
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const pDx = p.x - p2.x;
            const pDy = p.y - p2.y;
            const pDist = Math.sqrt(pDx * pDx + pDy * pDy);

            if (pDist < 85) {
              const alpha = (1 - pDist / 85) * 0.45 * (couplingFactor / 60);
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = \`rgba(56, 189, 248, \${alpha})\`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }

          // Dibujar partícula con pulso
          const currentRadius = p.radius + Math.sin(p.pulsePhase) * 1.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1.5, currentRadius), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Telemetría en tiempo real
        if (cycleCounter % 15 === 0) {
          const currentEntropy = Math.max(0.05, Math.min(0.95, (intensity / 100) * 0.7 + (1 - damping / 100) * 0.3));
          const currentStability = Math.round(Math.max(10, Math.min(100, 100 - currentEntropy * 65 + (damping / 100) * 15)));
          setTelemetry({
            cycles: cycleCounter,
            entropy: parseFloat(currentEntropy.toFixed(2)),
            stabilityScore: currentStability,
            meanEnergy: parseFloat((intensity * 1.1 + couplingFactor * 0.4).toFixed(1)),
            causalFlow: parseFloat(((intensity / 35) * (damping / 70)).toFixed(2))
          });

          // Verificar reto
          if (!challengeCompleted && currentStability >= 85 && intensity >= 60) {
            setChallengeProgress((prev) => {
              const next = prev + 10;
              if (next >= 100) {
                setChallengeCompleted(true);
                playTone(880, 'sine', 0.4);
                return 100;
              }
              return next;
            });
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isRunning, intensity, damping, couplingFactor, visualMode, challengeCompleted, playTone]);

  // Inyección de Perturbación
  const triggerPerturbation = () => {
    playTone(320, 'sawtooth', 0.25);
    const canvas = canvasRef.current;
    const w = canvas?.parentElement?.clientWidth || 600;
    const h = 320;

    shockwavesRef.current.push({
      x: w / 2,
      y: h / 2,
      radius: 10,
      maxRadius: 220,
      opacity: 0.9,
      color: '#f43f5e'
    });

    particlesRef.current.forEach((p) => {
      p.vx += (Math.random() - 0.5) * 6;
      p.vy += (Math.random() - 0.5) * 6;
    });
  };

  const resetEquilibrium = () => {
    playTone(520, 'sine', 0.15);
    setIntensity(45);
    setDamping(80);
    setCouplingFactor(65);
    setChallengeProgress(0);
    setChallengeCompleted(false);
  };

  return (
    <div className="p-5 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl font-sans min-h-[460px] flex flex-col gap-4">
      {/* Header del Simulador */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
          </span>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>⚡ Simulador Feynman • Nivel ${lvl}</span>
              <span className="text-xs font-normal text-sky-400 bg-sky-950/80 border border-sky-500/30 px-2 py-0.5 rounded-full">
                Canvas 2D Activo
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">${safeTitle}</p>
          </div>
        </div>

        {/* Pestañas de Vista */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => { playTone(440); setActiveTab('arena'); }}
            className={\`px-3 py-1 rounded-lg font-semibold transition-all \${activeTab === 'arena' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'}\`}
          >
            Arena Gráfica
          </button>
          <button
            onClick={() => { playTone(440); setActiveTab('telemetry'); }}
            className={\`px-3 py-1 rounded-lg font-semibold transition-all \${activeTab === 'telemetry' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'}\`}
          >
            Telemetría HUD
          </button>
          <button
            onClick={() => { playTone(440); setActiveTab('challenge'); }}
            className={\`px-3 py-1 rounded-lg font-semibold transition-all \${activeTab === 'challenge' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'}\`}
          >
            Reto de Calibración
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      {activeTab === 'arena' && (
        <div className="flex flex-col gap-4">
          {/* Canvas Interactivo */}
          <div
            className="relative w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-900/70 shadow-inner cursor-crosshair min-h-[300px]"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, isDown: true };
            }}
            onMouseLeave={() => { mouseRef.current = { x: -1000, y: -1000, isDown: false }; }}
          >
            <canvas ref={canvasRef} className="w-full h-[320px] block" />
            
            {/* Overlay de Telemetría HUD Rápido */}
            <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-3 text-xs">
              <span className="text-slate-400">Estabilidad:</span>
              <span className={\`font-bold \${telemetry.stabilityScore >= 80 ? 'text-emerald-400' : telemetry.stabilityScore >= 50 ? 'text-amber-400' : 'text-rose-400'}\`}>
                {telemetry.stabilityScore}%
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Entropía:</span>
              <span className="font-mono text-sky-400">{telemetry.entropy}</span>
            </div>

            {challengeCompleted && (
              <div className="absolute top-3 right-3 bg-emerald-950/90 border border-emerald-500/50 px-3 py-1.5 rounded-lg text-emerald-300 font-bold text-xs flex items-center gap-1.5 animate-bounce">
                <span>🏆</span> Reto Superado (+100 pts)
              </div>
            )}
          </div>

          {/* Controles de Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 text-xs">
            <div>
              <div className="flex justify-between mb-1.5 text-slate-300">
                <span className="font-semibold">Intensidad / Fuerza Causal:</span>
                <span className="font-mono text-sky-400">{intensity}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5 text-slate-300">
                <span className="font-semibold">Amortiguación / Resistencia:</span>
                <span className="font-mono text-indigo-400">{damping}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={damping}
                onChange={(e) => setDamping(Number(e.target.value))}
                className="w-full accent-indigo-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5 text-slate-300">
                <span className="font-semibold">Factor de Acoplamiento:</span>
                <span className="font-mono text-purple-400">{couplingFactor}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={couplingFactor}
                onChange={(e) => setCouplingFactor(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { playTone(isRunning ? 380 : 620); setIsRunning(!isRunning); }}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all"
              >
                {isRunning ? '⏸ Pausar Simulación' : '▶️ Reanudar Simulación'}
              </button>
              <button
                onClick={triggerPerturbation}
                className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs rounded-xl transition-all"
              >
                💥 Inyectar Perturbación
              </button>
            </div>

            <button
              onClick={resetEquilibrium}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-xs rounded-xl transition-all"
            >
              🔄 Reequilibrar
            </button>
          </div>
        </div>
      )}

      {/* Tab Telemetría */}
      {activeTab === 'telemetry' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs">
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
            <div className="text-slate-400 mb-1 font-semibold">Ciclos Ejecutados</div>
            <div className="text-lg font-bold text-sky-400 font-mono">{telemetry.cycles}</div>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
            <div className="text-slate-400 mb-1 font-semibold">Índice de Estabilidad</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">{telemetry.stabilityScore}%</div>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
            <div className="text-slate-400 mb-1 font-semibold">Entropía Estimada</div>
            <div className="text-lg font-bold text-amber-400 font-mono">{telemetry.entropy}</div>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
            <div className="text-slate-400 mb-1 font-semibold">Flujo Causal Neto</div>
            <div className="text-lg font-bold text-purple-400 font-mono">{telemetry.causalFlow}x</div>
          </div>
        </div>
      )}

      {/* Tab Reto de Calibración */}
      {activeTab === 'challenge' && (
        <div className="bg-slate-900/80 p-5 rounded-xl border border-amber-500/30 flex flex-col gap-3 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-amber-400">🎯 Reto de Calibración: Estabilidad Dinámica</h4>
            <span className="font-bold text-white bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
              Puntos: {score}
            </span>
          </div>
          <p className="text-slate-300">
            Ajusta los sliders para mantener una <strong>Intensidad superior al 60%</strong> con una <strong>Estabilidad superior al 85%</strong> durante 10 segundos continuos.
          </p>
          <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
            <div
              className="bg-amber-400 h-full transition-all duration-300"
              style={{ width: \`\${challengeProgress}%\` }}
            />
          </div>
          <div className="text-right text-slate-400 font-mono">Progreso: {challengeProgress}%</div>
        </div>
      )}
    </div>
  );
}`;
  }

  /**
   * Normaliza y desfragmenta cualquier texto Markdown o texto plano pegado por el usuario,
   * protegiendo rigurosamente los bloques de código (```...```) para que nunca sean modificados.
   */
  public normalizeAndStructureFeynmanMarkdown(raw: string): string {
    if (!raw || !raw.trim()) return '';
    let text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

    // 1. Eliminar posibles bloques contenedores exteriores ```markdown ... ``` o ```md ... ```
    text = text.replace(/^```(?:markdown|md|text|txt)?\s*\n([\s\S]*?)\n```$/i, '$1').trim();
    if (text.startsWith('```') && text.endsWith('```')) {
      text = text.replace(/^```[a-zA-Z0-9_-]*\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
    }

    // 2. Proteger bloques de código para que NUNCA sean modificados por las expresiones regulares
    const codeBlocks: string[] = [];
    text = text.replace(/```[\s\S]*?```/g, (match) => {
      const placeholder = `__FEYNMAN_CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push(match);
      return placeholder;
    });

    const ANCHOR = '(?:^|\\n)\\s*';

    // 3. Normalizar Encabezados de Nivel (solo al principio de línea)
    text = text.replace(
      new RegExp(`${ANCHOR}(?:#+\\s*|\\*{2}\\s*|__\\s*)?(?:Nivel|Paso|Level|Fase|Etapa|M[oó]dulo|Unidad|Tema|Cap[ií]tulo)\\s*\\[?(\\d+)\\]?[:\\s.-]*([^\\n*]+)?(?:\\n|\\*{2}|__|$)`, 'gim'),
      (_match, num, rawTitle) => {
        const titleClean = (rawTitle || '').replace(/^[*_#:\s-]+|[*_#:\s-]+$/g, '').trim();
        return `\n\n# Nivel ${num}: ${titleClean || `Paso ${num}`}\n\n`;
      }
    );

    // Normalizar Encabezado del Examen Final del Cuaderno
    text = text.replace(
      new RegExp(`${ANCHOR}(?:#+\\s*|\\*{2}\\s*|__\\s*)?(?:Examen\\s*Final(?:\\s*del\\s*Cuaderno)?|Gran\\s*Reto(?:\\s*de\\s*Maestr[ií]a)?|Evaluaci[oó]n\\s*Final)[^\\n*]*[:*_\\s]*`, 'gim'),
      '\n\n# Examen Final del Cuaderno: Gran Reto de Maestría Holística\n\n'
    );

    // 4. Normalizar Secciones Principales
    text = text.replace(
      new RegExp(`${ANCHOR}(?:#+\\s*|\\*{2}\\s*|__\\s*)?(?:1\\.\\s*)?(?:Axioma\\s*Central|Intuici[oó]n\\s*Feynman|Fundamento\\s*Axiom[aá]tico)[^\\n*]*[:*_\\s]*`, 'gim'),
      '\n\n## 1. Axioma Central (Intuición Feynman)\n\n'
    );

    text = text.replace(
      new RegExp(`${ANCHOR}(?:#+\\s*|\\*{2}\\s*|__\\s*)?(?:2\\.\\s*)?(?:Desglose\\s*At[oó]mico|Desglose)[^\\n*]*[:*_\\s]*`, 'gim'),
      '\n\n## 2. Desglose Atómico\n\n'
    );

    text = text.replace(
      new RegExp(`${ANCHOR}(?:#+\\s*|\\*{2}\\s*|__\\s*)?(?:3\\.\\s*)?(?:Panel\\s*Interactivo|Simulador(?:\\s*Gr[aá]fico)?|Videojuego|C[oó]digo(?:\\s*(?:TypeScript|React|TSX))?)[^\\n*]*[:*_\\s]*`, 'gim'),
      '\n\n## 3. Panel Interactivo (React + TypeScript)\n\n'
    );

    text = text.replace(
      new RegExp(`${ANCHOR}(?:#+\\s*|\\*{2}\\s*|__\\s*)?(?:4\\.\\s*)?(?:Nexo\\s*Causal|Nexo)[^\\n*]*[:*_\\s]*`, 'gim'),
      '\n\n## 4. Nexo Causal\n\n'
    );

    text = text.replace(
      new RegExp(`${ANCHOR}(?:#+\\s*|\\*{2}\\s*|__\\s*)?(?:5\\.\\s*)?(?:Examen\\s*de\\s*Nivel|Evaluaci[oó]n\\s*(?:de\\s*Nivel|Formativa)|Autoevaluaci[oó]n|Quiz\\s*de\\s*Nivel)[^\\n*]*[:*_\\s]*`, 'gim'),
      '\n\n## 5. Examen de Nivel (Evaluación Formativa)\n\n'
    );

    // 5. Normalizar Subniveles (### Subnivel X.Y: ...)
    text = text.replace(
      new RegExp(`${ANCHOR}(?:#+\\s*|\\*{2}\\s*|__\\s*)?(?:Subnivel|Paso|Concepto|Subtema|Secci[oó]n)\\s*\\[?(\\d+)(?:[.\\s_-]+(\\d+))?\\]?[:\\s.-]*([^\\n*]+)?`, 'gim'),
      (_match, p1, p2, rawConcept) => {
        const subId = p2 !== undefined ? `${p1}.${p2}` : p1;
        const concept = (rawConcept || '').replace(/^[*_#:\s-]+|[*_#:\s-]+$/g, '').trim();
        return `\n\n### Subnivel ${subId}: ${concept}\n`;
      }
    );

    // 6. Normalizar etiquetas de campos atómicos dentro de subniveles
    text = text.replace(new RegExp(`${ANCHOR}(?:-\\s*)?(?:\\*\\*|__)?(?:Intuici[oó]n(?:\\s*Feynman)?|Analog[ií]a|Met[aá]fora)[:\\s*_\\s]+`, 'gim'), '\n- **Intuición Feynman:** ');
    text = text.replace(new RegExp(`${ANCHOR}(?:-\\s*)?(?:\\*\\*|__)?(?:Idea\\s*Clave(?:\\s*Formal)?|Concepto\\s*Clave|Principio\\s*Formal|Definici[oó]n)[:\\s*_\\s]+`, 'gim'), '\n- **Idea Clave:** ');
    text = text.replace(new RegExp(`${ANCHOR}(?:-\\s*)?(?:\\*\\*|__)?(?:Cadena\\s*Causal|Mecanismo(?:\\s*Causal)?|Causalidad|Explicaci[oó]n\\s*Causal)[:\\s*_\\s]+`, 'gim'), '\n- **Cadena Causal:** ');
    
    // Formalismos matemáticos (Eureka vs Estándar)
    text = text.replace(new RegExp(`${ANCHOR}(?:-\\s*)?(?:\\*\\*|__)?(?:\\(?FORMALISMO\\s*MATEM[AÁ]TICO\\s*EUREKA\\)?|Formalismo\\s*Eureka|Ecuaci[oó]n\\s*Eureka)[:\\s*_\\s]+`, 'gim'), '\n- **(FORMALISMO MATEMÁTICO EUREKA):** ');
    text = text.replace(new RegExp(`${ANCHOR}(?:-\\s*)?(?:\\*\\*|__)?(?:\\(?FORMALISMO\\s*MATEM[AÁ]TICO\\)?|Ecuaci[oó]n(?:\\s*[\\/\\-]\\s*Formalismo)?|Formalismo|F[oó]rmula)(?:\\s*[\\/\\-]\\s*Formalismo)?[:\\s*_\\s]+`, 'gim'), '\n- **(FORMALISMO MATEMÁTICO):** ');
    
    text = text.replace(new RegExp(`${ANCHOR}(?:-\\s*)?(?:\\*\\*|__)?(?:Condici[oó]n\\s*de\\s*Frontera(?:\\s*[\\/\\-]\\s*L[ií]mite(?:\\s*de\\s*Ruptura)?)?|L[ií]mite(?:\\s*de\\s*Ruptura)?|Caso\\s*L[ií]mite|Frontera)[:\\s*_\\s]+`, 'gim'), '\n- **Límite de Ruptura:** ');
    text = text.replace(new RegExp(`${ANCHOR}(?:-\\s*)?(?:\\*\\*|__)?Recurso\\s*Visual[:\\s*_\\s]+`, 'gim'), '\n- **Recurso Visual:** ');
    text = text.replace(new RegExp(`${ANCHOR}(?:-\\s*)?(?:\\*\\*|__)?Problema\\s*resuelto[:\\s*_\\s]+`, 'gim'), '\n- **Problema resuelto:** ');
    text = text.replace(new RegExp(`${ANCHOR}(?:-\\s*)?(?:\\*\\*|__)?Siguiente\\s*obst[aá]culo[:\\s*_\\s]+`, 'gim'), '\n- **Siguiente obstáculo:** ');

    // Normalizar campos de preguntas de examen
    text = text.replace(new RegExp(`${ANCHOR}(?:-\\s*)?(?:\\*\\*|__)?(?:Respuesta\\s*Correcta|Opci[oó]n\\s*Correcta|Correcta)[:\\s*_\\s]+`, 'gim'), '\n- **Respuesta Correcta:** ');
    text = text.replace(new RegExp(`${ANCHOR}(?:-\\s*)?(?:\\*\\*|__)?(?:Justificaci[oó]n(?:\\s*Causal)?|Explicaci[oó]n|Por\\s*qu[eé])[:\\s*_\\s]+`, 'gim'), '\n- **Justificación Causal:** ');

    // 7. Restaurar los bloques de código intactos
    text = text.replace(/__FEYNMAN_CODE_BLOCK_(\d+)__/g, (_, idx) => {
      const code = codeBlocks[parseInt(idx, 10)];
      return code !== undefined ? code : '';
    });

    return text.trim();
  }

  /**
   * Helper para verificar si un string contiene una fórmula matemática válida o es N/A
   */
  private isValidMathString(raw?: string): boolean {
    if (!raw) return false;
    const trimmed = raw.trim().replace(/^[*_$`\s]+|[*_$`\s]+$/g, '').trim();
    if (!trimmed || trimmed === '-' || trimmed === '—') return false;
    const lower = trimmed.toLowerCase();
    if (
      lower.startsWith('n/a') ||
      lower.startsWith('no aplica') ||
      lower.startsWith('ningun') ||
      lower.startsWith('none') ||
      lower.startsWith('no requerid') ||
      lower.startsWith('no necesari') ||
      lower.startsWith('omitir') ||
      lower.startsWith('no hay') ||
      lower.startsWith('no contiene') ||
      lower.startsWith('no procede')
    ) {
      return false;
    }
    return true;
  }

  /**
   * Parsea preguntas de opción múltiple estructuradas en un bloque de examen
   */
  public parseQuizQuestions(text: string): FeynmanQuizQuestion[] {
    if (!text || !text.trim()) return [];

    const questions: FeynmanQuizQuestion[] = [];
    const questionRegex = /(?:^|\n)###+\s*(?:Pregunta|Reto|Q)\s*\[?([A-Za-z0-9._-]+)\]?[:\s.-]+([^\n]+)\n([\s\S]*?)(?=(?:^|\n)###+|(?:^|\n)##+|$)/gi;
    let qm: RegExpExecArray | null;

    while ((qm = questionRegex.exec(text)) !== null) {
      const id = qm[1];
      const questionTitle = (qm[2] || '').trim();
      const body = qm[3] || '';

      // Opciones A, B, C, D
      const options: string[] = [];
      const optionMatches = body.matchAll(/(?:^|\n)\s*-\s*([A-D])\)\s*([^\n]+)/gi);
      for (const om of optionMatches) {
        options.push(`${om[1]}) ${om[2].trim()}`);
      }

      // Si no usaron - A), intentar viñetas simples o A.
      if (options.length === 0) {
        const altOptionMatches = body.matchAll(/(?:^|\n)\s*(?:[A-D][.):\-]|\d[.):\-])\s*([^\n]+)/gi);
        for (const aom of altOptionMatches) {
          options.push(aom[1].trim());
        }
      }

      // Respuesta Correcta
      let correctIndex = 0;
      const correctMatch = body.match(/(?:-\s*)?(?:\*\*|__)?Respuesta\s*Correcta[:\s*_\s]+([A-D0-9])/i);
      if (correctMatch) {
        const letter = correctMatch[1].toUpperCase();
        if (letter === 'A' || letter === '1') correctIndex = 0;
        else if (letter === 'B' || letter === '2') correctIndex = 1;
        else if (letter === 'C' || letter === '3') correctIndex = 2;
        else if (letter === 'D' || letter === '4') correctIndex = 3;
      }

      // Justificación Causal
      let explanation = '';
      const expMatch = body.match(/(?:-\s*)?(?:\*\*|__)?Justificaci[oó]n\s*Causal[:\s*_\s]+([^\n]+(?:\n(?!-\s*(?:\*\*|__)?(?:Pregunta|Respuesta|Idea|Opci))[^\n]+)*)/i);
      if (expMatch) {
        explanation = expMatch[1].trim();
      }

      if (questionTitle) {
        questions.push({
          id: `q-${id}`,
          question: questionTitle,
          options: options.length > 0 ? options : ['A) Principio fundamental', 'B) Ruptura de frontera', 'C) Resonancia armónica', 'D) Conservación local'],
          correctIndex,
          explanation: explanation || 'Principio verificado según el mecanismo causal del nivel.'
        });
      }
    }

    return questions;
  }

  /**
   * Extrae y parsea el Examen Final del Cuaderno si está presente en el Markdown
   */
  public parseFinalExam(markdown: string): FeynmanFinalExam | undefined {
    if (!markdown) return undefined;

    const finalSectionMatch = markdown.match(/(?:^|\n)#+\s*Examen\s*Final(?:[^\n]*)\n([\s\S]*)$/i);
    if (!finalSectionMatch) return undefined;

    const sectionContent = finalSectionMatch[1].trim();

    // Extraer preguntas del Quizz
    const questions = this.parseQuizQuestions(sectionContent);

    // Extraer código React del Mega-Simulador (+1000 líneas)
    let masterReactCode = '';
    const codeRegex = /```(?:typescript|ts|tsx|jsx|javascript|js|react)?(?:\s*\n|\s+)([\s\S]*?)```/g;
    const foundCodes: string[] = [];
    let cm: RegExpExecArray | null;
    while ((cm = codeRegex.exec(sectionContent)) !== null) {
      const c = cm[1].trim();
      if (c) foundCodes.push(c);
    }

    if (foundCodes.length > 0) {
      foundCodes.sort((a, b) => b.length - a.length);
      masterReactCode = foundCodes[0];
    }

    return {
      title: 'Examen Final del Cuaderno: Gran Reto de Maestría Holística',
      summary: 'Evaluación integral de primeros principios y suite de simulación completa que certifica el dominio del tema.',
      questions: questions.length > 0 ? questions : [],
      masterReactCode: masterReactCode || ''
    };
  }

  /**
   * Parsea el Markdown generado en una estructura tipada de niveles garantizando
   * exactamente un objeto por cada nivel con sus respectivos exámenes de nivel.
   */
  public parseFeynmanMarkdown(markdown: string): FeynmanLevel[] {
    if (!markdown || !markdown.trim()) return [];

    const cleanMd = this.normalizeAndStructureFeynmanMarkdown(markdown);
    if (!cleanMd) return [];

    // Encontrar todas las cabeceras principales de nivel (# Nivel 1: ...)
    const levelHeaderRegex = /(?:^|\n)#+\s*(?:Nivel|Paso|Level|Fase|Etapa|M[oó]dulo|Unidad|Tema|Cap[ií]tulo)\s*\[?(\d+)\]?[:\s.-]*([^\n]*)/gi;
    const matches: Array<{ index: number; levelNumber: number; title: string; fullMatch: string }> = [];
    let m: RegExpExecArray | null;

    while ((m = levelHeaderRegex.exec(cleanMd)) !== null) {
      const num = parseInt(m[1], 10);
      const title = (m[2] || `Nivel ${num}`).replace(/^[[\]*_#:\s-]+|[[\]*_#:\s-]+$/g, '').trim();
      matches.push({
        index: m.index,
        levelNumber: num,
        title: title || `Nivel ${num}`,
        fullMatch: m[0]
      });
    }

    // Estrategia de respaldo 1: Si no encontró "Nivel X", buscar encabezados numerados (# 1. ..., ## 2. ...)
    if (matches.length === 0) {
      const numberedHeaderRegex = /(?:^|\n)#+\s*(\d+)[:.\s-]+([^\n]+)/gi;
      let nm: RegExpExecArray | null;
      while ((nm = numberedHeaderRegex.exec(cleanMd)) !== null) {
        const num = parseInt(nm[1], 10);
        const title = (nm[2] || `Nivel ${num}`).replace(/^[[\]*_#:\s-]+|[[\]*_#:\s-]+$/g, '').trim();
        if (title && !title.toLowerCase().includes('examen final')) {
          matches.push({
            index: nm.index,
            levelNumber: num,
            title,
            fullMatch: nm[0]
          });
        }
      }
    }

    // Estrategia de respaldo 2: Buscar cualquier encabezado principal (# ... o ## ...)
    if (matches.length === 0) {
      const genericHeaderRegex = /(?:^|\n)(#{1,2})\s+([^#\n]+)/g;
      let gm: RegExpExecArray | null;
      let counter = 1;
      while ((gm = genericHeaderRegex.exec(cleanMd)) !== null) {
        const rawTitle = (gm[2] || '').trim().replace(/^[[\]*_#:\s-]+|[[\]*_#:\s-]+$/g, '');
        if (
          rawTitle &&
          !rawTitle.toLowerCase().includes('examen final') &&
          !rawTitle.toLowerCase().includes('diagnóstico') &&
          !rawTitle.toLowerCase().includes('datos del cuestionario')
        ) {
          matches.push({
            index: gm.index,
            levelNumber: counter++,
            title: rawTitle,
            fullMatch: gm[0]
          });
        }
      }
    }

    // Estrategia de respaldo 3: Documento plano sin encabezados, crear Nivel 1 contenedor
    if (matches.length === 0) {
      matches.push({
        index: 0,
        levelNumber: 1,
        title: 'Nivel 1: Fundamentos y Primeros Principios',
        fullMatch: ''
      });
    }

    // Extraer exactamente cada bloque delimitado entre match[i] y match[i+1] o el Examen Final
    const finalExamIndexMatch = cleanMd.match(/(?:^|\n)#+\s*Examen\s*Final/i);
    const finalExamIndex = finalExamIndexMatch ? finalExamIndexMatch.index : cleanMd.length;

    const levelsMap = new Map<number, FeynmanLevel>();

    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const next = matches[i + 1];
      const startIdx = current.index;
      const endIdx = next ? next.index : (finalExamIndex ?? cleanMd.length);
      const blockText = cleanMd.slice(startIdx, endIdx).trim();

      const levelNumber = current.levelNumber;
      const title = current.title || `Nivel ${levelNumber}`;

      // 1. Axioma Central
      let axiomIntuition = '';
      const axiomSectionMatch = blockText.match(/(?:^|\n)##+\s*(?:1\.\s*)?(?:Axioma|Fundamento|Intuici[oó]n)[^\n]*\n([\s\S]*?)(?=(?:^|\n)##+|$)/i);
      if (axiomSectionMatch && axiomSectionMatch[1].trim()) {
        axiomIntuition = axiomSectionMatch[1].trim();
      } else {
        const preSubMatch = blockText.match(/(?:^|\n)#+[^\n]+\n+([\s\S]*?)(?=(?:^|\n)##+|###|```|$)/i);
        if (preSubMatch && preSubMatch[1].trim().length > 10) {
          axiomIntuition = preSubMatch[1].trim();
        }
      }

      if (!axiomIntuition) {
        axiomIntuition = `Fundamento axiomático de ${title}: descomposición irreducible mediante analogía cotidiana de primeros principios.`;
      }

      // 2. Subniveles
      const sublevels: FeynmanAtomicSublevel[] = [];
      const subHeaderRegex = /(?:^|\n)###+\s*(?:Subnivel|Paso|Concepto|Subtema|Secci[oó]n)?\s*\[?(\d+(?:\.\d+)?)\]?[:\s.-]*([^\n]*)\n([\s\S]*?)(?=(?:^|\n)###+|(?:^|\n)##+|$)/gi;
      let sMatch: RegExpExecArray | null;

      while ((sMatch = subHeaderRegex.exec(blockText)) !== null) {
        const subId = sMatch[1] || `${levelNumber}.${sublevels.length + 1}`;
        const concept = (sMatch[2] || `Concepto ${subId}`).replace(/^[[\]*_#\s]+|[[\]*_#\s]+$/g, '').trim();
        const subContent = sMatch[3] || '';

        // 1. Intuición Feynman
        let intuition: string | undefined;
        const intM = subContent.match(/(?:-\s*)?(?:\*\*|__)?(?:Intuici[oó]n(?:\s*Feynman)?|Analog[ií]a|Met[aá]fora)[:\s*_\s]+([^\n]+)/i);
        if (intM) intuition = intM[1].trim().replace(/^[*_\s]+|[*_\s]+$/g, '');

        // 2. Idea Clave
        let keyIdea = '';
        const ideaM = subContent.match(/(?:-\s*)?(?:\*\*|__)?(?:Idea\s*Clave(?:\s*Formal)?|Concepto\s*Clave|Principio\s*Formal|Definici[oó]n)[:\s*_\s]+([^\n]+)/i);
        if (ideaM) keyIdea = ideaM[1].trim().replace(/^[*_\s]+|[*_\s]+$/g, '');

        // 3. Cadena Causal
        let mechanism = '';
        const mechM = subContent.match(/(?:-\s*)?(?:\*\*|__)?(?:Cadena\s*Causal|Mecanismo(?:\s*Causal)?|Causalidad|Explicaci[oó]n\s*Causal)[:\s*_\s]+([^\n]+(?:\n(?!-\s*(?:\*\*|__)?(?:Idea|Ecuaci|Condici|L[ií]mite|Intuici|Recurso|FORMALISMO))[^\n]+)*)/i);
        if (mechM) mechanism = mechM[1].trim().replace(/^[*_\s]+|[*_\s]+$/g, '');

        // 4. Formalismo Matemático (Eureka vs Estándar)
        let mathType: 'standard' | 'eureka' | undefined;
        let equation: string | undefined;

        const eurekaEqM = subContent.match(/(?:-\s*)?(?:\*\*|__)?(?:\(?FORMALISMO\s*MATEM[AÁ]TICO\s*EUREKA\)?|Formalismo\s*Eureka|Ecuaci[oó]n\s*Eureka)[:\s*_\s]+([^\n]+)/i);
        if (eurekaEqM) {
          const rawEq = eurekaEqM[1].trim().replace(/^[*_\s]+|[*_\s]+$/g, '').trim();
          if (this.isValidMathString(rawEq)) {
            equation = rawEq;
            mathType = 'eureka';
          }
        } else {
          const stdEqM = subContent.match(/(?:-\s*)?(?:\*\*|__)?(?:\(?FORMALISMO\s*MATEM[AÁ]TICO\)?|Ecuaci[oó]n(?:\s*[\/\-]\s*Formalismo)?|Formalismo|F[oó]rmula)(?:\s*[\/\-]\s*Formalismo)?[:\s*_\s]+([^\n]+)/i);
          if (stdEqM) {
            const rawEq = stdEqM[1].trim().replace(/^[*_\s]+|[*_\s]+$/g, '').trim();
            if (this.isValidMathString(rawEq)) {
              equation = rawEq;
              mathType = 'standard';
            }
          }
        }

        // 5. Límite de Ruptura / Condición de Frontera
        let boundaryCondition: string | undefined;
        const boundM = subContent.match(/(?:-\s*)?(?:\*\*|__)?(?:Condici[oó]n\s*de\s*Frontera(?:\s*[\/\-]\s*L[ií]mite(?:\s*de\s*Ruptura)?)?|L[ií]mite(?:\s*de\s*Ruptura)?|Caso\s*L[ií]mite|Frontera)[:\s*_\s]+([^\n]+)/i);
        if (boundM) boundaryCondition = boundM[1].trim().replace(/^[*_\s]+|[*_\s]+$/g, '');

        let visualResourceUrl: string | undefined;
        const imgM = subContent.match(/!\[([^\]]*)\]\((https?:\/\/[^\s\)]+)\)/i);
        if (imgM) visualResourceUrl = imgM[2].trim();

        sublevels.push({
          sublevelNumber: subId,
          concept,
          intuition,
          keyIdea: keyIdea || `Principio fundamental de ${concept}.`,
          mechanism: mechanism || `Dinámica causal determinista en ${concept}.`,
          mathType,
          equation,
          boundaryCondition,
          visualResourceUrl
        });
      }

      if (sublevels.length === 0) {
        sublevels.push({
          sublevelNumber: `${levelNumber}.1`,
          concept: title,
          intuition: axiomIntuition,
          keyIdea: `Dominio de los fundamentos y principios esenciales de ${title}.`,
          mechanism: `Dinámica y descomposición causal de primeros principios en ${title}.`
        });
      }

      // 3. Panel Interactivo (React + TypeScript Code)
      let typescriptCode = '';
      const codeRegex = /```(?:[a-zA-Z0-9_-]+)?(?:\s*\n|\s+)([\s\S]*?)```/g;
      const foundCodes: string[] = [];
      let cm: RegExpExecArray | null;
      while ((cm = codeRegex.exec(blockText)) !== null) {
        const c = cm[1].trim();
        if (c) foundCodes.push(c);
      }

      if (foundCodes.length > 0) {
        foundCodes.sort((a, b) => b.length - a.length);
        typescriptCode = foundCodes[0];
      }

      if (!typescriptCode || typescriptCode.length < 150 || typescriptCode.includes('Simulador interactivo de primeros principios.')) {
        typescriptCode = this.generateLevelInteractiveComponent(levelNumber, title, 'Primeros Principios');
      }

      // 4. Nexo Causal
      let solvedProblem = '';
      let nextObstacle = '';
      const causalMatch = blockText.match(/(?:##+|###+|\*\*)\s*(?:4\.\s*)?Nexo(?:\s*Causal)?[^\n]*\n([\s\S]*?)(?=(?:^|\n)##+|$)/i);
      if (causalMatch) {
        const causalText = causalMatch[1];
        const solvedMatch = causalText.match(/(?:-\s*)?(?:\*\*|__)?Problema\s*resuelto[:\s*_\s]+([^\n]+)/i);
        if (solvedMatch) solvedProblem = solvedMatch[1].trim().replace(/^[*_\s]+|[*_\s]+$/g, '');

        const obstacleMatch = causalText.match(/(?:-\s*)?(?:\*\*|__)?Siguiente\s*obst[aá]culo[:\s*_\s]+([^\n]+)/i);
        if (obstacleMatch) nextObstacle = obstacleMatch[1].trim().replace(/^[*_\s]+|[*_\s]+$/g, '');
      }

      // 5. Examen de Nivel (Evaluación Formativa)
      let levelExam: FeynmanLevelExam | undefined;
      const examSectionMatch = blockText.match(/(?:^|\n)##+\s*(?:5\.\s*)?(?:Examen|Evaluaci[oó]n|Quiz)[^\n]*\n([\s\S]*)$/i);
      if (examSectionMatch) {
        const examText = examSectionMatch[1].trim();
        const questions = this.parseQuizQuestions(examText);
        if (questions.length > 0) {
          levelExam = {
            title: `Examen del Nivel ${levelNumber}`,
            questions
          };
        }
      }

      const parsedLevel: FeynmanLevel = {
        levelNumber,
        title,
        axiomIntuition: axiomIntuition || `Fundamento axiomático de ${title}.`,
        sublevels,
        typescriptCode,
        causalNexus: {
          solvedProblem: solvedProblem || `Comprensión integral de ${title}.`,
          nextObstacle: nextObstacle || `Dominio consolidado del Nivel ${levelNumber}.`
        },
        exam: levelExam
      };

      // Guardar en Map para deduplicar
      if (!levelsMap.has(levelNumber)) {
        levelsMap.set(levelNumber, parsedLevel);
      } else {
        const existing = levelsMap.get(levelNumber)!;
        if (parsedLevel.typescriptCode.length > existing.typescriptCode.length) {
          existing.typescriptCode = parsedLevel.typescriptCode;
        }
        if (parsedLevel.sublevels.length > existing.sublevels.length) {
          existing.sublevels = parsedLevel.sublevels;
        }
        if (parsedLevel.exam && !existing.exam) {
          existing.exam = parsedLevel.exam;
        }
      }
    }

    return Array.from(levelsMap.values()).sort((a, b) => a.levelNumber - b.levelNumber);
  }
}

export const feynmanPedagogyService = FeynmanPedagogyService.getInstance();
