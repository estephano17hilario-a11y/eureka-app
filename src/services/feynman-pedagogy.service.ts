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

3. ESTRUCTURA Y ORDEN ESTRICTO DE CADA SUBNIVEL HIPER-ATÓMICO (5 A 7 POR NIVEL):
   - Cada Nivel Principal debe dividirse obligatoriamente en ENTRE 5 Y 7 SUBNIVELES (Subnivel X.1 a Subnivel X.5, X.6 o X.7).
   - ⚠️ **ORDEN EXACTO E INVARIABLE PARA CADA SUBNIVEL**:
     1. **Intuición Feynman:** Micro-analogía cotidiana resumida, simple, intuitiva y sumamente fácil de entender (estilo Feynman puro, sin jerga pesada).
     2. **Idea Clave:** Esa misma intuición explicada ahora en términos formales, rigurosos y precisos de "${topic}".
     3. **Cadena Causal:** Secuencia paso a paso de causa-efecto específica del mecanismo.
     4. **(FORMALISMO MATEMÁTICO)** o **(FORMALISMO MATEMÁTICO EUREKA):** Fórmula en KaTeX ($...$). 🚨 SOLO SI EL TEMA O CONCEPTO REALMENTE LO REQUIERE. SI ES DE HUMANIDADES/CUALITATIVO, OMITE ESTA LÍNEA POR COMPLETO.
     5. **Límite de Ruptura / Condición de Frontera:** El caso extremo o contexto donde este principio falla o genera un conflicto.

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
     - Entre 3 y 5 preguntas de selección múltiple con 4 opciones (A, B, C, D) que pongan a prueba la comprensión causal, las condiciones de frontera y los límites de ruptura explicados en ese nivel.
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
[Explicación en 1 o 2 párrafos descomponiendo el fundamento de ${topic} mediante una analogía visual cotidiana, clara y fácil de entender].

## 2. Desglose Atómico
### Subnivel 1.1: [Concepto Atómico Específico de ${topic}]
- **Intuición Feynman:** [Micro-analogía cotidiana resumida y muy fácil de entender, estilo Feynman, sin jerga técnica].
- **Idea Clave:** [Definición formal y precisa en términos rigurosos del concepto].
- **Cadena Causal:** [Mecanismo causal paso a paso: causa -> efecto -> estado resultante].
- **(FORMALISMO MATEMÁTICO)** o **(FORMALISMO MATEMÁTICO EUREKA):** $[Fórmula KaTeX solo si aplica al tema. Si es historia/humanidades, omite esta línea]$
- **Límite de Ruptura / Condición de Frontera:** [Caso extremo donde falla este modelo o principio].

### Subnivel 1.2: [Concepto Atómico Específico de ${topic}]
- **Intuición Feynman:** [Micro-analogía cotidiana resumida y fácil de entender].
- **Idea Clave:** [Definición formal y precisa].
- **Cadena Causal:** [Mecanismo causal paso a paso].
- **Límite de Ruptura / Condición de Frontera:** [Caso extremo donde falla este modelo].
... (5 a 7 subniveles: de 1.1 hasta 1.5, 1.6 o 1.7)

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
- **Justificación Causal:** [Explicación detallada de por qué es la correcta según los primeros principios de este nivel].

### Pregunta 1.2: [Segunda pregunta sobre límites de ruptura o variables del nivel]
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

(REPETIR ESTA ESTRUCTURA EXACTA PARA TODOS LOS ${levelsCount} NIVELES, CON CÓDIGO REACT HIPER-VISUAL DE +400 A +500 LÍNEAS EN CADA UNO DE ELLOS)

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
2. ORDEN ESTRICTO EN CADA SUBNIVEL:
   1º) Intuición Feynman (metáfora clara, cotidiana y fácil de entender).
   2º) Idea Clave (en términos formales y precisos).
   3º) Cadena Causal (mecanismo causal de causa-efecto).
   4º) (FORMALISMO MATEMÁTICO) o (FORMALISMO MATEMÁTICO EUREKA) (SOLO SI APLICA; si no aplica, omitir).
   5º) Límite de Ruptura / Condición de Frontera.
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
- ORDEN POR SUBNIVEL: (1) Intuición Feynman -> (2) Idea Clave formal -> (3) Cadena Causal -> (4) Formalismo Matemático (si aplica) -> (5) Límite de Ruptura.
- FORMALISMO MATEMÁTICO: Omitir si la materia es de humanidades/historia/derecho/letras. Si es fórmula inventada pedagógica usar "(FORMALISMO MATEMÁTICO EUREKA)", si es real usar "(FORMALISMO MATEMÁTICO)".
- 🚨 REITERACIÓN CRÍTICA: CADA NIVEL (1 al ${levelsCount}) DEBE CONTENER SU PROPIO COMPONENTE EN REACT 18 + TSX (\`export function App()\`) CON MÁS DE 400 A 500 LÍNEAS DE CÓDIGO REAL Y COMPLETO.
- 🎨 DISEÑO VISUAL Y LÚDICO: Cero botones aburridos. Canvas 2D/SVG animados, partículas dinámicas, osciloscopios, barra de estabilidad reactiva, inyección de perturbaciones y efectos sonoros con Web Audio API.
- 📝 CADA NIVEL DEBE INCLUIR SU EXAMEN FORMATIVO (## 5. Examen de Nivel con 3 a 5 preguntas de selección múltiple explicadas).
- 🎓 AL FINAL, INCLUYE EL EXAMEN FINAL DEL CUADERNO CON 10 PREGUNTAS Y EL MEGA-SIMULADOR EN REACT+TS DE MÁS DE 1000 LÍNEAS REALES (Suite gamificada con arena gráfica interactiva, retos de estrés y certificado).
- COMIENZA DIRECTAMENTE CON: "# Nivel 1:"`;
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
      new RegExp(`${ANCHOR}(?:#+\\s*|\\*{2}\\s*|__\\s*)?(?:Nivel|Paso|Level|Fase|Etapa)\\s*\\[?(\\d+)\\]?[:\\s.-]*([^\n*]+)?(?:\n|\\*{2}|__|$)`, 'gim'),
      (_match, num, rawTitle) => {
        const titleClean = (rawTitle || '').replace(/^[*_#:\s-]+|[*_#:\s-]+$/g, '').trim();
        return `\n\n# Nivel ${num}: ${titleClean || `Paso ${num}`}\n\n`;
      }
    );

    // Normalizar Encabezado del Examen Final del Cuaderno
    text = text.replace(
      new RegExp(`${ANCHOR}(?:#+\\s*|\\*{2}\\s*|__\\s*)?(?:Examen\\s*Final(?:\\s*del\\s*Cuaderno)?|Gran\\s*Reto(?:\\s*de\\s*Maestr[ií]a)?|Evaluaci[oó]n\\s*Final)[^\n*]*[:*_\s]*`, 'gim'),
      '\n\n# Examen Final del Cuaderno: Gran Reto de Maestría Holística\n\n'
    );

    // 4. Normalizar Secciones Principales
    text = text.replace(
      new RegExp(`${ANCHOR}(?:#+\\s*|\\*{2}\\s*|__\\s*)?(?:1\\.\\s*)?(?:Axioma\\s*Central|Intuici[oó]n\\s*Feynman|Fundamento\\s*Axiom[aá]tico)[^\n*]*[:*_\s]*`, 'gim'),
      '\n\n## 1. Axioma Central (Intuición Feynman)\n\n'
    );

    text = text.replace(
      new RegExp(`${ANCHOR}(?:#+\\s*|\\*{2}\\s*|__\\s*)?(?:2\\.\\s*)?(?:Desglose\\s*At[oó]mico|Desglose)[^\n*]*[:*_\s]*`, 'gim'),
      '\n\n## 2. Desglose Atómico\n\n'
    );

    text = text.replace(
      new RegExp(`${ANCHOR}(?:#+\\s*|\\*{2}\\s*|__\\s*)?(?:3\\.\\s*)?(?:Panel\\s*Interactivo|Simulador(?:\\s*Gr[aá]fico)?|Videojuego|C[oó]digo(?:\\s*(?:TypeScript|React|TSX))?)[^\n*]*[:*_\s]*`, 'gim'),
      '\n\n## 3. Panel Interactivo (React + TypeScript)\n\n'
    );

    text = text.replace(
      new RegExp(`${ANCHOR}(?:#+\\s*|\\*{2}\\s*|__\\s*)?(?:4\\.\\s*)?(?:Nexo\\s*Causal|Nexo)[^\n*]*[:*_\s]*`, 'gim'),
      '\n\n## 4. Nexo Causal\n\n'
    );

    text = text.replace(
      new RegExp(`${ANCHOR}(?:#+\\s*|\\*{2}\\s*|__\\s*)?(?:5\\.\\s*)?(?:Examen\\s*de\\s*Nivel|Evaluaci[oó]n\\s*(?:de\\s*Nivel|Formativa)|Autoevaluaci[oó]n|Quiz\\s*de\\s*Nivel)[^\n*]*[:*_\s]*`, 'gim'),
      '\n\n## 5. Examen de Nivel (Evaluación Formativa)\n\n'
    );

    // 5. Normalizar Subniveles (### Subnivel X.Y: ...)
    text = text.replace(
      new RegExp(`${ANCHOR}(?:#+\\s*|\\*{2}\\s*|__\\s*)?Subnivel\\s*\\[?(\\d+)(?:[.\\s_-]+(\\d+))?\\]?[:\\s.-]*([^\n*]+)?`, 'gim'),
      (_match, p1, p2, rawConcept) => {
        const subId = p2 !== undefined ? `${p1}.${p2}` : p1;
        const concept = (rawConcept || '').replace(/^[*_#:\s-]+|[*_#:\s-]+$/g, '').trim();
        return `\n\n### Subnivel ${subId}: ${concept}\n`;
      }
    );

    // 6. Normalizar etiquetas de campos atómicos dentro de subniveles
    text = text.replace(new RegExp(`${ANCHOR}(?:-\\s*)?(?:\\*\\*|__)?(?:Intuici[oó]n(?:\\s*Feynman)?|Analog[ií]a)[:\\s*_\\s]+`, 'gim'), '\n- **Intuición Feynman:** ');
    text = text.replace(new RegExp(`${ANCHOR}(?:-\\s*)?(?:\\*\\*|__)?Idea\\s*Clave(?:\\s*Formal)?[:\\s*_\\s]+`, 'gim'), '\n- **Idea Clave:** ');
    text = text.replace(new RegExp(`${ANCHOR}(?:-\\s*)?(?:\\*\\*|__)?(?:Cadena\\s*Causal|Mecanismo(?:\\s*Causal)?|Causalidad)[:\\s*_\\s]+`, 'gim'), '\n- **Cadena Causal:** ');
    
    // Formalismos matemáticos (Eureka vs Estándar)
    text = text.replace(new RegExp(`${ANCHOR}(?:-\\s*)?(?:\\*\\*|__)?(?:\\(?FORMALISMO\\s*MATEM[AÁ]TICO\\s*EUREKA\\)?|Formalismo\\s*Eureka|Ecuaci[oó]n\\s*Eureka)[:\\s*_\\s]+`, 'gim'), '\n- **(FORMALISMO MATEMÁTICO EUREKA):** ');
    text = text.replace(new RegExp(`${ANCHOR}(?:-\\s*)?(?:\\*\\*|__)?(?:\\(?FORMALISMO\\s*MATEM[AÁ]TICO\\)?|Ecuaci[oó]n(?:\\s*[\\/\\-]\\s*Formalismo)?|Formalismo|F[oó]rmula)(?:\\s*[\\/\\-]\\s*Formalismo)?[:\\s*_\\s]+`, 'gim'), '\n- **(FORMALISMO MATEMÁTICO):** ');
    
    text = text.replace(new RegExp(`${ANCHOR}(?:-\\s*)?(?:\\*\\*|__)?(?:Condici[oó]n\\s*de\\s*Frontera(?:\\s*[\\/\\-]\\s*L[ií]mite(?:\\s*de\\s*Ruptura)?)?|L[ií]mite(?:\\s*de\\s*Ruptura)?|Caso\\s*L[ií]mite)[:\\s*_\\s]+`, 'gim'), '\n- **Límite de Ruptura:** ');
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
    const levelHeaderRegex = /(?:^|\n)#+\s*(?:Nivel|Paso|Level|Fase|Etapa)\s*\[?(\\d+)\]?[:\\s.-]+([^\\n]+)/gi;
    const matches: Array<{ index: number; levelNumber: number; title: string; fullMatch: string }> = [];
    let m: RegExpExecArray | null;

    while ((m = levelHeaderRegex.exec(cleanMd)) !== null) {
      const num = parseInt(m[1], 10);
      const title = (m[2] || `Nivel ${num}`).replace(/^[[\]*_#:\s-]+|[[\]*_#:\s-]+$/g, '').trim();
      matches.push({
        index: m.index,
        levelNumber: num,
        title,
        fullMatch: m[0]
      });
    }

    if (matches.length === 0) {
      return [];
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
      const subHeaderRegex = /(?:^|\n)###+\s*Subnivel\s*\[?(\d+(?:\.\d+)?)\]?[:\s.-]+([^\n]+)\n([\s\S]*?)(?=(?:^|\n)###+|(?:^|\n)##+|$)/gi;
      let sMatch: RegExpExecArray | null;

      while ((sMatch = subHeaderRegex.exec(blockText)) !== null) {
        const subId = sMatch[1] || `${levelNumber}.${sublevels.length + 1}`;
        const concept = (sMatch[2] || `Concepto ${subId}`).replace(/^[[\]*_#\s]+|[[\]*_#\s]+$/g, '').trim();
        const subContent = sMatch[3] || '';

        // 1. Intuición Feynman
        let intuition: string | undefined;
        const intM = subContent.match(/(?:-\s*)?(?:\*\*|__)?(?:Intuici[oó]n(?:\\s*Feynman)?|Analog[ií]a)[:\s*_\s]+([^\n]+)/i);
        if (intM) intuition = intM[1].trim().replace(/^[*_\s]+|[*_\s]+$/g, '');

        // 2. Idea Clave
        let keyIdea = '';
        const ideaM = subContent.match(/(?:-\s*)?(?:\*\*|__)?Idea\s*Clave(?:\\s*Formal)?[:\s*_\s]+([^\n]+)/i);
        if (ideaM) keyIdea = ideaM[1].trim().replace(/^[*_\s]+|[*_\s]+$/g, '');

        // 3. Cadena Causal
        let mechanism = '';
        const mechM = subContent.match(/(?:-\s*)?(?:\*\*|__)?(?:Cadena\s*Causal|Mecanismo(?:\s*Causal)?|Causalidad)[:\s*_\s]+([^\n]+(?:\n(?!-\s*(?:\*\*|__)?(?:Idea|Ecuaci|Condici|L[ií]mite|Intuici|Recurso|FORMALISMO))[^\n]+)*)/i);
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
        const boundM = subContent.match(/(?:-\s*)?(?:\*\*|__)?(?:Condici[oó]n\s*de\s*Frontera(?:\\s*[\\/\\-]\\s*L[ií]mite(?:\\s*de\\s*Ruptura)?)?|L[ií]mite(?:\\s*de\\s*Ruptura)?|Caso\\s*L[ií]mite)[:\s*_\s]+([^\n]+)/i);
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

      if (!typescriptCode) {
        typescriptCode = `import React, { useState } from 'react';

export function App() {
  const [active, setActive] = useState(false);
  return (
    <div className="p-6 bg-slate-900 text-white rounded-2xl min-h-screen">
      <h2 className="text-xl font-bold text-sky-400">Nivel ${levelNumber}: ${title}</h2>
      <p className="text-slate-300 mt-2">Simulador interactivo de primeros principios.</p>
      <button 
        onClick={() => setActive(!active)}
        className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-semibold transition-all shadow-lg"
      >
        {active ? '⚡ Simulación Activa' : '▶️ Iniciar Simulación'}
      </button>
    </div>
  );
}`;
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
