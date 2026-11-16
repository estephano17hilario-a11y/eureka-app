import { R, cat, sub, uni, type Cat } from './catalog-core';

/* Música, idiomas, economía, tipografía, formas, juegos y los bloques Unicode completos. */
export const HUMANITIES_CATS: Cat[] = [
  cat('music', 'Música', '🎼', [
    sub('Notas y silencios', R`
      𝅝 :: Redonda
      𝅗𝅥 :: Blanca
      ♩ :: Negra
      ♪ :: Corchea
      𝅘𝅥𝅯 :: Semicorchea
      𝅘𝅥𝅰 :: Fusa
      𝅘𝅥𝅱 :: Semifusa
      ♫ :: Dos corcheas unidas
      ♬ :: Dos semicorcheas unidas
      𝄻 :: Silencio de redonda
      𝄼 :: Silencio de blanca
      𝄽 :: Silencio de negra
      𝄾 :: Silencio de corchea
      𝄿 :: Silencio de semicorchea
      𝅀 :: Silencio de fusa
      𝅁 :: Silencio de semifusa
      𝅭 :: Puntillo
      𝆒 :: Crescendo (regulador)
      𝆓 :: Diminuendo (regulador)
      𝄐 :: Calderón
      𝄑 :: Calderón inferior
      𝄒 :: Respiración
      𝄓 :: Cesura
      ♩=120 :: Indicación metronómica
      🎵 :: Nota musical
      🎶 :: Notas musicales
    `),
    sub('Alteraciones y claves', R`
      ♯ ~ \sharp :: Sostenido
      ♭ ~ \flat :: Bemol
      ♮ ~ \natural :: Becuadro
      𝄪 :: Doble sostenido
      𝄫 :: Doble bemol
      𝄲 :: Cuarto de tono sostenido
      𝄳 :: Cuarto de tono bemol
      𝄞 :: Clave de sol
      𝄢 :: Clave de fa
      𝄡 :: Clave de do
      𝄟 :: Clave de sol octava alta
      𝄠 :: Clave de sol octava baja
      𝄣 :: Clave de fa octava alta
      𝄤 :: Clave de fa octava baja
      𝄥 :: Clave de percusión
      𝄦 :: Clave de percusión 2
      𝄚 :: Pentagrama
      𝄀 :: Barra de compás
      𝄁 :: Doble barra
      𝄂 :: Barra final
      𝄃 :: Barra final invertida
      𝄆 :: Repetición (inicio)
      𝄇 :: Repetición (fin)
      𝄈 :: Puntos de repetición
      𝄋 :: Segno
      𝄌 :: Coda
      𝄊 :: Fine
      𝄉 :: Dal segno
      𝄍 :: Repetir compás
      𝄎 :: Repetir dos compases
      𝄏 :: Repetir cuatro compases
    `),
    sub('Compás, dinámica y expresión', R`
      𝄴 :: Compasillo (4/4)
      𝄵 :: Compás partido (2/2)
      \frac{4}{4} :: Compás de 4/4
      \frac{3}{4} :: Compás de 3/4
      \frac{2}{4} :: Compás de 2/4
      \frac{6}{8} :: Compás de 6/8
      \frac{#?}{#?} :: Compás personalizado
      𝆏 :: piano (p)
      𝆐 :: mezzo (m)
      𝆑 :: forte (f)
      𝆏𝆏 :: pianissimo (pp)
      𝆐𝆏 :: mezzo piano (mp)
      𝆐𝆑 :: mezzo forte (mf)
      𝆑𝆑 :: fortissimo (ff)
      𝆍 :: Rinforzando
      𝆎 :: Subito
      𝆌 :: Rinforzando (r)
      𝅻 :: Acento
      𝅼 :: Staccato
      𝅽 :: Tenuto
      𝅾 :: Staccatissimo
      𝅿 :: Marcato
      𝆖 :: Trino
      𝆗 :: Grupeto
      𝆘 :: Grupeto invertido
      𝆙 :: Grupeto con barra
      𝆮 :: Pedal
      𝆯 :: Soltar pedal
      𝆪 :: Arco abajo
      𝆫 :: Arco arriba
      𝆹𝅥 :: Armónico
      \textit{cresc.} :: crescendo
      \textit{dim.} :: diminuendo
      \textit{rit.} :: ritardando
      \textit{accel.} :: accelerando
      \textit{legato} :: legato
      \textit{D.C. al Fine} :: Da capo al fine
      8^{va} :: Octava alta
      8^{vb} :: Octava baja
      \overset{3}{\frown} :: Tresillo
    `),
    sub('Armonía y acordes', R`
      C :: Do
      D :: Re
      E :: Mi
      F :: Fa
      G :: Sol
      A :: La
      B :: Si
      C♯ :: Do sostenido
      D♭ :: Re bemol
      E♭ :: Mi bemol
      F♯ :: Fa sostenido
      A♭ :: La bemol
      B♭ :: Si bemol
      Cm :: Menor
      C7 :: Séptima de dominante
      Cmaj7 :: Séptima mayor
      Cm7 :: Menor séptima
      C° :: Disminuido
      Cø :: Semidisminuido
      C+ :: Aumentado
      Csus4 :: Suspendido
      C/G :: Inversión (bajo en sol)
      I :: Tónica
      ii :: Supertónica
      iii :: Mediante
      IV :: Subdominante
      V :: Dominante
      vi :: Superdominante
      vii° :: Sensible
      V^7 :: Séptima de dominante (grado)
      I^6_4 :: Seis-cuatro cadencial
      V/V :: Dominante secundaria
      ♭VII :: Séptimo grado rebajado
      \hat{1} :: Grado de la escala
      △ :: Mayor séptima (símbolo)
      ° :: Disminuido (símbolo)
      ø :: Semidisminuido (símbolo)
      f=440\cdot2^{\frac{n}{12}} :: Frecuencia de una nota
      \text{Hz} :: Hercios
      \text{bpm} :: Pulsos por minuto
    `),
    uni('Notación musical completa', 0x1d100, 0x1d1ea, [[0x1d127, 0x1d128], [0x1d173, 0x1d17a]]),
    sub('Instrumentos', R`
      @ 🎹 🎸 🎻 🎺 🎷 🥁 🪘 🪗 🪕 🪈 🎤 🎧 🎼 🎙 📯 🔔 🎚 🎛
    `)
  ]),

  cat('lang', 'Idiomas', '🌍', [
    sub('Español', R`
      @ á é í ó ú ü ñ Á É Í Ó Ú Ü Ñ ¿ ¡ « » ª º € — – … ç Ç
    `),
    sub('Latín extendido (acentos)', R`
      @ à è ì ò ù À È Ì Ò Ù â ê î ô û Â Ê Î Ô Û ä ë ï ö ü ÿ Ä Ë Ï Ö Ü Ÿ ã õ ñ Ã Õ Ñ å Å æ Æ œ Œ ø Ø ç Ç ß ẞ ð Ð þ Þ
      @ ā ē ī ō ū Ā Ē Ī Ō Ū ă ĕ ĭ ŏ ŭ ą ę į ų Ą Ę ć č ĉ ċ Ć Č ď đ Ď Đ ě ė ğ ĝ ġ ģ ĥ ħ ı İ ĵ ķ ĺ ľ ļ ł Ł ń ň ņ ŋ ő ŕ ř ś š ŝ ş ș Ś Š Ş ť ţ ț ŧ ů ű ũ ŵ ý ŷ ź ž ż Ź Ž Ż ĳ Ĳ ŉ ſ
      @ ạ ả ấ ầ ẩ ẫ ậ ắ ằ ẳ ẵ ặ ẹ ẻ ẽ ế ề ể ễ ệ ỉ ị ọ ỏ ố ồ ổ ỗ ộ ớ ờ ở ỡ ợ ụ ủ ứ ừ ử ữ ự ỳ ỵ ỷ ỹ ơ ư đ
    `),
    sub('Marcas diacríticas', R`
      c:´ :: Acento agudo
      c:\u0060 :: Acento grave
      c:^ :: Circunflejo
      ¨ :: Diéresis
      c:~ :: Virgulilla
      ¯ :: Macrón
      ˘ :: Breve
      ˙ :: Punto superior
      ˚ :: Anillo
      ¸ :: Cedilla
      ˛ :: Ogonek
      ˇ :: Carón
      ˝ :: Doble agudo
      ʼ :: Apóstrofo modificador
      ʻ :: Okina
      @ ◌́ ◌̀ ◌̂ ◌̃ ◌̄ ◌̆ ◌̇ ◌̈ ◌̊ ◌̋ ◌̌ ◌̧ ◌̨ ◌̣ ◌̤ ◌̥ ◌̩ ◌̯ ◌̰ ◌̱ ◌̲ ◌̶ ◌̸ ◌⃗ ◌⃝
    `),
    uni('Griego (alfabeto completo)', 0x391, 0x3c9, [[0x3a2, 0x3a2], [0x3aa, 0x3b0]]),
    uni('Cirílico', 0x410, 0x45f, [[0x450, 0x450], [0x45d, 0x45d]]),
    uni('Hebreo', 0x5d0, 0x5ea),
    uni('Árabe', 0x621, 0x64a, [[0x63b, 0x63f]]),
    uni('Japonés · hiragana', 0x3041, 0x3096),
    uni('Japonés · katakana', 0x30a1, 0x30fa),
    sub('Chino, japonés y coreano (básicos)', R`
      @ 一 二 三 四 五 六 七 八 九 十 百 千 万 円 年 月 日 時 分 人 大 小 中 上 下 左 右 水 火 木 金 土 山 川 天 口 目 耳 手 心 学 生 先 本 文 字 語 国 中国 日本 한 글 가 나 다 라 마 바 사 아 자 차 카 타 파 하 、 。 「 」 ・ ー 々 〜
    `),
    sub('Fonética (AFI) · consonantes', R`
      @ p b t d ʈ ɖ c ɟ k ɡ q ɢ ʔ m ɱ n ɳ ɲ ŋ ɴ ʙ r ʀ ⱱ ɾ ɽ ɸ β f v θ ð s z ʃ ʒ ʂ ʐ ç ʝ x ɣ χ ʁ ħ ʕ h ɦ ɬ ɮ ʋ ɹ ɻ j ɰ l ɭ ʎ ʟ ʍ w ɥ ʜ ʢ ʡ ɕ ʑ ɺ ɧ ʘ ǀ ǃ ǂ ǁ ɓ ɗ ʄ ɠ ʛ t͡s t͡ʃ d͡z d͡ʒ
    `),
    sub('Fonética (AFI) · vocales y marcas', R`
      @ i y ɨ ʉ ɯ u ɪ ʏ ʊ e ø ɘ ɵ ɤ o ə ɛ œ ɜ ɞ ʌ ɔ æ ɐ a ɶ ɑ ɒ ɚ ɝ
      ˈ :: Acento primario
      ˌ :: Acento secundario
      ː :: Larga
      ˑ :: Semilarga
      ◌̆ :: Extra breve
      . :: Límite silábico
      | :: Grupo menor
      ‖ :: Grupo mayor
      ‿ :: Ligadura
      ↗ :: Entonación ascendente
      ↘ :: Entonación descendente
      ʰ :: Aspirada
      ʷ :: Labializada
      ʲ :: Palatalizada
      ˠ :: Velarizada
      ˤ :: Faringalizada
      ◌̃ :: Nasalizada
      ◌̥ :: Sorda
      ◌̬ :: Sonora
      ◌̩ :: Silábica
      ◌̯ :: No silábica
      c:/#?/ :: Transcripción fonológica
      c:[#?] :: Transcripción fonética
      c:⟨#?⟩ :: Grafema
      * :: Forma agramatical / reconstruida
      ∅ :: Morfema cero
      → :: Se realiza como
      > :: Evoluciona a
      < :: Procede de
      # :: Límite de palabra
      σ :: Sílaba
      μ :: Mora
    `),
    uni('AFI completo (extensiones)', 0x250, 0x2af),
    uni('Runas', 0x16a0, 0x16f0),
    sub('Lingüística y gramática', R`
      \text{SN} :: Sintagma nominal
      \text{SV} :: Sintagma verbal
      \text{SPrep} :: Sintagma preposicional
      \text{O}\to\text{SN}+\text{SV} :: Regla de reescritura
      [_{\text{SN}}\ #?] :: Corchetes etiquetados
      \text{CD} :: Complemento directo
      \text{CI} :: Complemento indirecto
      \text{CC} :: Complemento circunstancial
      \text{1SG} :: Primera persona singular (glosa)
      \text{3PL} :: Tercera persona plural (glosa)
      \emptyset :: Elemento nulo
      t_i :: Huella
      \lambda x.#? :: Función semántica
      [\![#?]\!] :: Denotación
      \models :: Satisface
      ※ :: Nota
      § :: Sección
    `)
  ]),

  cat('eco', 'Economía y finanzas', '💱', [
    sub('Monedas', R`
      € :: Euro
      $ :: Dólar / peso
      £ :: Libra esterlina
      ¥ :: Yen / yuan
      ₹ :: Rupia india
      ₽ :: Rublo
      ₩ :: Won
      ₪ :: Séquel
      ₺ :: Lira turca
      ₴ :: Grivna
      ₦ :: Naira
      ₱ :: Peso filipino
      ₲ :: Guaraní
      ₡ :: Colón
      ₫ :: Dong
      ₭ :: Kip
      ₮ :: Tugrik
      ₸ :: Tenge
      ₼ :: Manat
      ₾ :: Lari
      ₿ :: Bitcoin
      ¢ :: Centavo
      ₵ :: Cedi
      ₣ :: Franco
      ₧ :: Peseta
      ₤ :: Lira
      ƒ :: Florín
      ₠ :: ECU
      ₢ :: Cruzeiro
      ₥ :: Mill
      ₨ :: Rupia
      ₯ :: Dracma
      ₰ :: Pfennig
      ₳ :: Austral
      ₶ :: Livre tournois
      ₷ :: Spesmilo
      ₻ :: Marco nórdico
      ¤ :: Moneda genérica
      S/ :: Sol peruano
      R$ :: Real brasileño
      Bs :: Bolívar / boliviano
      ؋ :: Afgani
      ৳ :: Taka
      ៛ :: Riel
      ฿ :: Baht
      ﷼ :: Rial
      Ξ :: Ether
      Ł :: Litecoin
    `),
    sub('Fórmulas económicas', R`
      I=C\cdot r\cdot t :: Interés simple
      C_f=C_0(1+r)^t :: Interés compuesto
      C_f=C_0\left(1+\frac{r}{n}\right)^{nt} :: Capitalización periódica
      C_f=C_0e^{rt} :: Capitalización continua
      VA=\frac{VF}{(1+r)^n} :: Valor actual
      VAN=\sum_{t=0}^{n}\frac{F_t}{(1+r)^t} :: Valor actual neto
      \sum_{t=0}^{n}\frac{F_t}{(1+TIR)^t}=0 :: Tasa interna de retorno
      PIB=C+I+G+(X-M) :: Producto interior bruto
      E_p=\frac{\%\Delta Q}{\%\Delta P} :: Elasticidad precio
      Q_d=a-bP :: Función de demanda
      Q_s=c+dP :: Función de oferta
      \pi=IT-CT :: Beneficio
      IT=P\cdot Q :: Ingreso total
      CMg=\frac{\Delta CT}{\Delta Q} :: Coste marginal
      IMg=CMg :: Maximización del beneficio
      MV=PQ :: Ecuación cuantitativa del dinero
      \text{ROE}=\frac{\text{Beneficio neto}}{\text{Patrimonio}} :: Rentabilidad financiera
      \text{ROI}=\frac{\text{Ganancia}-\text{Inversión}}{\text{Inversión}} :: Retorno de la inversión
      \text{IPC}_t=\frac{\text{Cesta}_t}{\text{Cesta}_0}\cdot100 :: Índice de precios
      \text{Inflación}=\frac{IPC_t-IPC_{t-1}}{IPC_{t-1}}\cdot100 :: Tasa de inflación
      k=\frac{1}{1-PMC} :: Multiplicador keynesiano
      Y=AK^{\alpha}L^{1-\alpha} :: Función Cobb-Douglas
      U(x,y) :: Función de utilidad
      \frac{UMg_x}{P_x}=\frac{UMg_y}{P_y} :: Equilibrio del consumidor
      E(R_i)=R_f+\beta_i(E(R_m)-R_f) :: CAPM
      \text{Activo}=\text{Pasivo}+\text{Patrimonio neto} :: Ecuación contable
      \Delta\% :: Variación porcentual
      % :: Por ciento
      ‰ :: Por mil
      p.b. :: Puntos básicos
      ↑ :: Sube
      ↓ :: Baja
      ▲ :: Alza
      ▼ :: Caída
      📈 :: Tendencia alcista
      📉 :: Tendencia bajista
    `)
  ]),

  cat('typo', 'Tipografía y texto', '✒️', [
    sub('Puntuación y comillas', R`
      … :: Puntos suspensivos
      — :: Raya
      – :: Semirraya
      ‐ :: Guion
      ‑ :: Guion irrompible
      ― :: Barra horizontal
      « :: Comilla angular de apertura
      » :: Comilla angular de cierre
      “ :: Comilla inglesa de apertura
      ” :: Comilla inglesa de cierre
      ‘ :: Comilla simple de apertura
      ’ :: Comilla simple de cierre / apóstrofo
      „ :: Comilla baja doble
      ‚ :: Comilla baja simple
      ‹ :: Comilla angular simple de apertura
      › :: Comilla angular simple de cierre
      ¿ :: Interrogación de apertura
      ¡ :: Exclamación de apertura
      ‽ :: Interrobang
      ⸘ :: Interrobang invertido
      · :: Punto medio
      • :: Bolo / viñeta
      ‣ :: Viñeta triangular
      ◦ :: Viñeta hueca
      ⁃ :: Viñeta de guion
      ※ :: Marca de referencia
      ⁂ :: Asterismo
      ‖ :: Doble barra vertical
      ¦ :: Barra partida
      ′ :: Prima
      ″ :: Doble prima
      ‴ :: Triple prima
      ‰ :: Por mil
      № :: Número
      ⁄ :: Barra de fracción
      ⁓ :: Guion ondulado
      〃 :: Ídem
    `),
    sub('Legal, edición y referencias', R`
      § :: Sección / párrafo legal
      ¶ :: Calderón
      © :: Copyright
      ® :: Marca registrada
      ™ :: Marca comercial
      ℠ :: Marca de servicio
      ℗ :: Copyright fonográfico
      🄯 :: Copyleft
      † :: Cruz / obelisco
      ‡ :: Doble cruz
      * :: Asterisco
      ⁑ :: Doble asterisco
      ª :: Ordinal femenino
      º :: Ordinal masculino
      ℅ :: A cargo de (c/o)
      ℀ :: Cuenta (a/c)
      ℡ :: Teléfono
      ℻ :: Fax
      ⚖ :: Balanza (derecho)
      ⌘ :: Lugar de interés
      ✉ :: Correo
      ✆ :: Teléfono (símbolo)
      ✎ :: Editar
      ✐ :: Lápiz
      ✍ :: Escribir
      ⌫ :: Borrar
      ⁁ :: Inserción (corrección)
      ⁀ :: Unir (corrección)
      ⸮ :: Signo de ironía
      ⁋ :: Calderón invertido
      ❡ :: Calderón ornamental
      ❦ :: Hoja ornamental
      ❧ :: Hoja ornamental girada
      ☙ :: Florón
      [sic] :: Sic
      [...] :: Elipsis editorial
      cf. :: Confer
      ibid. :: Ibídem
      et al. :: Et alii
      op. cit. :: Opere citato
      p. ej. :: Por ejemplo
      i. e. :: Id est
    `),
    sub('Espacios invisibles', R`
      c:\u00A0 :: Espacio irrompible :: nbsp
      c:\u2009 :: Espacio fino
      c:\u2002 :: Espacio de medio cuadratín
      c:\u2003 :: Espacio de cuadratín
      c:\u200A :: Espacio ultrafino
      c:\u202F :: Espacio fino irrompible
      c:\u200B :: Espacio de ancho cero
      c:\u00AD :: Guion blando
    `),
    sub('Viñetas, marcas y casillas', R`
      @ ✓ ✔ ✗ ✘ ✕ ✖ ☐ ☑ ☒ ⬜ ⬛ ✅ ❌ ❎ ⭕ ❗ ❓ ❕ ❔ ‼ ⁉ ⚠ ⛔ 🚫 ➕ ➖ ➗ ✚ ✛ ✜ ❖ ◆ ◇ ◈ ● ○ ◉ ◎ ◌ ◍ ◐ ◑ ◒ ◓ ◔ ◕ ▪ ▫ ■ □ ▣ ▤ ▥ ▦ ▧ ▨ ▩ ▸ ▹ ► ▻ ‣ ⁌ ⁍ ❥ ❣ ☛ ☞ 👉 📌 📎 🔖 🏷 💡 ⭐ 🌟 ✨ 🔥 💯 🎯 🔑 🔒 🔓 ⏰ ⏳ 📅 📝 📚 📖 🎓 🧠
    `),
    uni('Números y letras en círculo', 0x2460, 0x24ff),
    sub('Más números decorados', R`
      @ ⓿ ❶ ❷ ❸ ❹ ❺ ❻ ❼ ❽ ❾ ❿ ➀ ➁ ➂ ➃ ➄ ➅ ➆ ➇ ➈ ➉ ➊ ➋ ➌ ➍ ➎ ➏ ➐ ➑ ➒ ➓ ㉑ ㉒ ㉓ ㉔ ㉕ ㉖ ㉗ ㉘ ㉙ ㉚ 🄰 🄱 🄲 🄳 🄴 🄵 🅐 🅑 🅒 🅓 🅔 🅕 🅰 🅱 🅾 🅿
    `)
  ]),

  cat('shapes', 'Formas y dibujo', '🔷', [
    uni('Figuras geométricas', 0x25a0, 0x25ff),
    sub('Estrellas, flores y ornamentos', R`
      @ ★ ☆ ✡ ✦ ✧ ✩ ✪ ✫ ✬ ✭ ✮ ✯ ✰ ✱ ✲ ✳ ✴ ✵ ✶ ✷ ✸ ✹ ✺ ✻ ✼ ✽ ✾ ✿ ❀ ❁ ❂ ❃ ❄ ❅ ❆ ❇ ❈ ❉ ❊ ❋ ⁎ ⁕ ⚝ ⛤ ⛥ ⛦ ⛧ ♥ ♡ ❤ ❥ ♦ ♢ ♠ ♤ ♣ ♧ ⬟ ⬠ ⬡ ⬢ ⬣ ⬤ ⬥ ⬦ ⬧ ⬨ ⬩ ⬪ ⬫ ⬬ ⬭ ⬮ ⬯ ⯀ ⯁ ⯂ ⯃ ⯄ ⯅ ⯆ ⯇ ⯈
    `),
    uni('Líneas de caja', 0x2500, 0x257f),
    uni('Bloques y sombreados', 0x2580, 0x259f),
    uni('Braille', 0x2800, 0x28ff),
    sub('Líneas y conectores para esquemas', R`
      @ ─ │ ┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼ ═ ║ ╔ ╗ ╚ ╝ ╠ ╣ ╦ ╩ ╬ ╭ ╮ ╯ ╰ ╱ ╲ ╳ ⎯ ⎸ ⎹ ⎺ ⎻ ⎼ ⎽ ⏐ ⌜ ⌝ ⌞ ⌟ ⌈ ⌉ ⌊ ⌋ ⎡ ⎢ ⎣ ⎤ ⎥ ⎦ ⎧ ⎨ ⎩ ⎪ ⎫ ⎬ ⎭ ⎛ ⎜ ⎝ ⎞ ⎟ ⎠ ⏜ ⏝ ⏞ ⏟ ⏠ ⏡ ⎴ ⎵ ⎶
    `)
  ]),

  cat('games', 'Juegos, cultura y emojis', '♟️', [
    sub('Ajedrez, cartas y dados', R`
      ♔ :: Rey blanco
      ♕ :: Dama blanca
      ♖ :: Torre blanca
      ♗ :: Alfil blanco
      ♘ :: Caballo blanco
      ♙ :: Peón blanco
      ♚ :: Rey negro
      ♛ :: Dama negra
      ♜ :: Torre negra
      ♝ :: Alfil negro
      ♞ :: Caballo negro
      ♟ :: Peón negro
      ♠ :: Picas
      ♥ :: Corazones
      ♦ :: Diamantes
      ♣ :: Tréboles
      @ ♤ ♡ ♢ ♧ ⚀ ⚁ ⚂ ⚃ ⚄ ⚅ 🂡 🂱 🃁 🃑 🃏 🀄 🎲 🎴 ⛀ ⛁ ⛂ ⛃ ☖ ☗
      + :: Jaque
      # :: Jaque mate
      !! :: Jugada brillante
      ?? :: Error grave
      O-O :: Enroque corto
      O-O-O :: Enroque largo
      ½–½ :: Tablas
    `),
    sub('Religión, cultura y política', R`
      @ ✝ ☦ ✞ ✟ ☨ ☩ ☥ ☪ ☫ ☬ ☮ ☯ ☸ ✡ 🕉 ☧ ⚛ ⚜ ☭ ⚒ ⚔ ⚓ ⚑ ⚐ ♔ ♕ ⚖ ☤ ⚕ ♻ ☘ ⚘ 🏛 🗿 🏺 📜 🗡 🛡 👑 🕊 🏳 🏴 🚩
    `),
    sub('Emojis de estudio', R`
      @ 📚 📖 📕 📗 📘 📙 📓 📒 📔 📑 🔖 📝 ✏ 🖊 🖋 🖍 📐 📏 🧮 🔬 🔭 🧪 🧫 🧬 ⚗ 🩺 💊 🧠 💡 🎓 🏫 🗂 📁 📊 📈 📉 🗓 ⏰ ⏱ ⏳ 🎯 🏆 🥇 ⭐ 🔥 ✅ ❌ ❓ ❗ 💬 💭 🗣 👀 👍 👎 👏 🙌 💪 🤔 😀 😅 😴 🤯 🥳 🌍 🌎 🌏 🗺 🧭 🏛 ⚖ 💰 💻 ⌨ 🖥 📱 🔌 🔋 🎨 🎭 🎬 🎵 ⚽ 🏀
    `),
    uni('Símbolos varios (bloque completo)', 0x2600, 0x26ff),
    uni('Dingbats (bloque completo)', 0x2700, 0x27bf)
  ]),

  cat('unicode', 'Unicode completo', '🗃️', [
    uni('Operadores matemáticos', 0x2200, 0x22ff),
    uni('Operadores matemáticos suplementarios', 0x2a00, 0x2aff),
    uni('Símbolos matemáticos varios A', 0x27c0, 0x27ef),
    uni('Símbolos matemáticos varios B', 0x2980, 0x29ff),
    uni('Flechas', 0x2190, 0x21ff),
    uni('Flechas suplementarias A', 0x27f0, 0x27ff),
    uni('Flechas suplementarias B', 0x2900, 0x297f),
    uni('Símbolos y flechas varios', 0x2b00, 0x2b73),
    uni('Símbolos tipo letra', 0x2100, 0x214f),
    uni('Formas numéricas', 0x2150, 0x218b),
    uni('Superíndices y subíndices', 0x2070, 0x209c, [[0x2072, 0x2073], [0x208f, 0x208f]]),
    uni('Símbolos técnicos', 0x2300, 0x23ff),
    uni('Símbolos de moneda', 0x20a0, 0x20c0),
    uni('Puntuación general', 0x2010, 0x205e, [[0x2028, 0x202f]]),
    uni('Letras modificadoras', 0x2b0, 0x2ff),
    uni('Griego y copto', 0x370, 0x3ff, [[0x378, 0x379], [0x380, 0x383], [0x38b, 0x38b], [0x38d, 0x38d], [0x3a2, 0x3a2]]),
    uni('Latín-1 (símbolos y letras)', 0xa1, 0xff, [[0xad, 0xad]]),
    uni('Latín extendido A', 0x100, 0x17f),
    uni('Alfanuméricos matemáticos', 0x1d400, 0x1d7ff, [[0x1d455, 0x1d455], [0x1d49d, 0x1d49d], [0x1d4a0, 0x1d4a1], [0x1d4a3, 0x1d4a4], [0x1d4a7, 0x1d4a8], [0x1d4ad, 0x1d4ad], [0x1d4ba, 0x1d4ba], [0x1d4bc, 0x1d4bc], [0x1d4c4, 0x1d4c4], [0x1d506, 0x1d506], [0x1d50b, 0x1d50c], [0x1d515, 0x1d515], [0x1d51d, 0x1d51d], [0x1d53a, 0x1d53a], [0x1d53f, 0x1d53f], [0x1d545, 0x1d545], [0x1d547, 0x1d549], [0x1d551, 0x1d551], [0x1d6a6, 0x1d6a7], [0x1d7cc, 0x1d7cd]]),
    uni('Símbolos alquímicos', 0x1f700, 0x1f773),
    uni('Formas geométricas extendidas', 0x1f780, 0x1f7d8),
    uni('Naipes', 0x1f0a0, 0x1f0f5, [[0x1f0af, 0x1f0b0], [0x1f0c0, 0x1f0c0], [0x1f0d0, 0x1f0d0]]),
    uni('Fichas de dominó', 0x1f030, 0x1f093),
    uni('Mahjong', 0x1f000, 0x1f02b),
    uni('Imágenes de control', 0x2400, 0x2426),
    uni('Reconocimiento óptico', 0x2440, 0x244a)
  ])
];
