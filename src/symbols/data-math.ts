import { R, cat, sub, fontSubs, type Cat } from './catalog-core';

/* Matemáticas: de la aritmética al análisis, con todo el repertorio de KaTeX / AMS. */
export const MATH_CATS: Cat[] = [
  cat('arit', 'Aritmética', '➕', [
    sub('Operaciones', R`
      + :: Más :: suma adicion plus
      − ~ - :: Menos :: resta sustraccion minus
      × ~ \times :: Por :: multiplicar producto times cruz
      ÷ ~ \div :: Entre :: dividir division
      · ~ \cdot :: Punto de producto :: multiplicar dot
      ± ~ \pm :: Más menos :: plus minus
      ∓ ~ \mp :: Menos más :: minus plus
      = :: Igual :: equals
      ≠ ~ \ne :: Distinto :: diferente no igual neq
      ≈ ~ \approx :: Aproximadamente :: casi aprox
      / :: Barra de división :: slash
      ∗ ~ \ast :: Asterisco :: estrella
      ∶ ~ \colon :: Razón :: proporcion dos puntos
      ∷ :: Proporción :: como
      % ~ \% :: Por ciento :: porcentaje
      ‰ :: Por mil :: permil
      ‱ :: Por diez mil :: basis point
      √ ~ \surd :: Radical :: raiz
      ∞ ~ \infty :: Infinito
    `),
    sub('Fracciones y potencias', R`
      \frac{#?}{#?} :: Fracción :: quebrado division numerador denominador
      #?\frac{#?}{#?} :: Fracción mixta :: numero mixto
      \dfrac{#?}{#?} :: Fracción grande :: display
      \tfrac{#?}{#?} :: Fracción pequeña :: texto
      \cfrac{#?}{#?+\cfrac{#?}{#?}} :: Fracción continua
      #?/#? :: Fracción en línea :: slash
      #?^{2} :: Al cuadrado :: potencia exponente
      #?^{3} :: Al cubo :: potencia exponente
      #?^{#?} :: Potencia :: exponente elevado superindice
      #?^{-1} :: Inverso :: reciproco
      #?_{#?} :: Subíndice :: indice
      #?_{#?}^{#?} :: Subíndice y superíndice
      \sqrt{#?} :: Raíz cuadrada :: radical sqrt
      \sqrt[3]{#?} :: Raíz cúbica
      \sqrt[#?]{#?} :: Raíz n-ésima :: indice
      #?\times10^{#?} :: Notación científica :: potencia de diez
      \left|#?\right| :: Valor absoluto :: modulo
      #?\% :: Porcentaje
      #?! :: Factorial
      #?:#? :: Razón
    `),
    sub('Comparación', R`
      < :: Menor que
      > :: Mayor que
      ≤ ~ \le :: Menor o igual
      ≥ ~ \ge :: Mayor o igual
      ≪ ~ \ll :: Mucho menor
      ≫ ~ \gg :: Mucho mayor
      ≡ ~ \equiv :: Idéntico :: equivalente congruente
      ≅ ~ \cong :: Congruente
      ∼ ~ \sim :: Semejante :: similar
      ∝ ~ \propto :: Proporcional
      ≟ :: ¿Igual? :: pregunta
      ≜ ~ \triangleq :: Igual por definición
      ≔ ~ \coloneqq :: Se define como :: asignacion
    `),
    sub('Fracciones Unicode', R`
      ½ :: Un medio :: 1/2
      ⅓ :: Un tercio :: 1/3
      ⅔ :: Dos tercios :: 2/3
      ¼ :: Un cuarto :: 1/4
      ¾ :: Tres cuartos :: 3/4
      ⅕ :: Un quinto :: 1/5
      ⅖ :: Dos quintos :: 2/5
      ⅗ :: Tres quintos :: 3/5
      ⅘ :: Cuatro quintos :: 4/5
      ⅙ :: Un sexto :: 1/6
      ⅚ :: Cinco sextos :: 5/6
      ⅐ :: Un séptimo :: 1/7
      ⅛ :: Un octavo :: 1/8
      ⅜ :: Tres octavos :: 3/8
      ⅝ :: Cinco octavos :: 5/8
      ⅞ :: Siete octavos :: 7/8
      ⅑ :: Un noveno :: 1/9
      ⅒ :: Un décimo :: 1/10
      ↉ :: Cero tercios :: 0/3
      ⅟ :: Numerador uno
      ⁄ :: Barra de fracción
    `),
    sub('Superíndices y subíndices', R`
      @ ⁰ ¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹ ⁺ ⁻ ⁼ ⁽ ⁾ ⁿ ⁱ ᵃ ᵇ ᶜ ᵈ ᵉ ᶠ ᵍ ʰ ʲ ᵏ ˡ ᵐ ᵒ ᵖ ʳ ˢ ᵗ ᵘ ᵛ ʷ ˣ ʸ ᶻ
      @ ₀ ₁ ₂ ₃ ₄ ₅ ₆ ₇ ₈ ₉ ₊ ₋ ₌ ₍ ₎ ₐ ₑ ₕ ᵢ ⱼ ₖ ₗ ₘ ₙ ₒ ₚ ᵣ ₛ ₜ ᵤ ᵥ ₓ
    `),
    sub('Números romanos', R`
      @ Ⅰ Ⅱ Ⅲ Ⅳ Ⅴ Ⅵ Ⅶ Ⅷ Ⅸ Ⅹ Ⅺ Ⅻ Ⅼ Ⅽ Ⅾ Ⅿ ⅰ ⅱ ⅲ ⅳ ⅴ ⅵ ⅶ ⅷ ⅸ ⅹ ⅺ ⅻ ⅼ ⅽ ⅾ ⅿ ↀ ↁ ↂ
    `)
  ]),

  cat('alg', 'Álgebra', '📐', [
    sub('Estructuras', R`
      \frac{#?}{#?} :: Fracción
      #?^{#?} :: Potencia
      #?_{#?} :: Subíndice
      \sqrt{#?} :: Raíz
      \sqrt[#?]{#?} :: Raíz n-ésima
      \left(#?\right) :: Paréntesis
      \left[#?\right] :: Corchetes
      \left\{#?\right\} :: Llaves
      \left|#?\right| :: Valor absoluto
      \log_{#?}{#?} :: Logaritmo base b
      \ln{#?} :: Logaritmo natural
      \log{#?} :: Logaritmo decimal
      e^{#?} :: Exponencial
      \sum_{#?}^{#?}#? :: Sumatoria
      \prod_{#?}^{#?}#? :: Productoria
      \binom{#?}{#?} :: Coeficiente binomial :: combinatoria
      \begin{cases}#? & #?\\#? & #?\end{cases} :: Función a trozos :: casos sistema
      \begin{cases}#?\\#?\end{cases} :: Sistema de ecuaciones :: llave
      \begin{aligned}#? &= #?\\ &= #?\end{aligned} :: Pasos alineados :: desarrollo igualdad
    `),
    sub('Identidades y fórmulas', R`
      x=\frac{-b\pm\sqrt{b^2-4ac}}{2a} :: Fórmula general :: cuadratica bhaskara
      \Delta=b^2-4ac :: Discriminante
      (a+b)^2=a^2+2ab+b^2 :: Cuadrado de un binomio
      (a-b)^2=a^2-2ab+b^2 :: Cuadrado de una diferencia
      a^2-b^2=(a+b)(a-b) :: Diferencia de cuadrados
      (a+b)^3=a^3+3a^2b+3ab^2+b^3 :: Cubo de un binomio
      a^3+b^3=(a+b)(a^2-ab+b^2) :: Suma de cubos
      a^3-b^3=(a-b)(a^2+ab+b^2) :: Diferencia de cubos
      (a+b)^n=\sum_{k=0}^{n}\binom{n}{k}a^{n-k}b^k :: Binomio de Newton
      a^m\cdot a^n=a^{m+n} :: Producto de potencias
      \frac{a^m}{a^n}=a^{m-n} :: Cociente de potencias
      (a^m)^n=a^{mn} :: Potencia de potencia
      a^{-n}=\frac{1}{a^n} :: Exponente negativo
      a^{\frac{m}{n}}=\sqrt[n]{a^m} :: Exponente fraccionario
      \log_b(xy)=\log_b x+\log_b y :: Logaritmo de un producto
      \log_b\frac{x}{y}=\log_b x-\log_b y :: Logaritmo de un cociente
      \log_b x^n=n\log_b x :: Logaritmo de una potencia
      \log_b x=\frac{\log_a x}{\log_a b} :: Cambio de base
      y=mx+b :: Recta pendiente-ordenada
      m=\frac{y_2-y_1}{x_2-x_1} :: Pendiente
      a_n=a_1+(n-1)d :: Progresión aritmética
      a_n=a_1r^{n-1} :: Progresión geométrica
      S_n=\frac{n(a_1+a_n)}{2} :: Suma aritmética
      S_n=a_1\frac{1-r^n}{1-r} :: Suma geométrica
    `),
    sub('Conjuntos numéricos', R`
      ℕ ~ \mathbb{N} :: Naturales
      ℤ ~ \mathbb{Z} :: Enteros
      ℚ ~ \mathbb{Q} :: Racionales
      ℝ ~ \mathbb{R} :: Reales
      ℂ ~ \mathbb{C} :: Complejos
      𝕀 ~ \mathbb{I} :: Irracionales
      ℙ ~ \mathbb{P} :: Primos
      ℍ ~ \mathbb{H} :: Cuaterniones
      𝔽 ~ \mathbb{F} :: Cuerpo finito
      𝕂 ~ \mathbb{K} :: Cuerpo
      \mathbb{R}^{+} :: Reales positivos
      \mathbb{R}^{n} :: Espacio n-dimensional
      \mathbb{Z}^{+} :: Enteros positivos
      \mathbb{N}_0 :: Naturales con cero
      \mathbb{Z}_n :: Enteros módulo n
      \mathbb{R}\setminus\{0\} :: Reales sin el cero
    `),
    sub('Complejos', R`
      i :: Unidad imaginaria
      a+bi :: Forma binómica
      \overline{z} :: Conjugado
      |z| :: Módulo
      \Re(z) :: Parte real
      \Im(z) :: Parte imaginaria
      \arg(z) :: Argumento
      re^{i\theta} :: Forma exponencial
      r(\cos\theta+i\sin\theta) :: Forma polar
      e^{i\pi}+1=0 :: Identidad de Euler
      e^{i\theta}=\cos\theta+i\sin\theta :: Fórmula de Euler
      i^2=-1 :: Definición de i
    `),
    sub('Combinatoria', R`
      n! :: Factorial
      \binom{n}{k} :: Combinaciones
      \binom{n}{k}=\frac{n!}{k!(n-k)!} :: Fórmula de combinaciones
      P(n,k)=\frac{n!}{(n-k)!} :: Variaciones
      {}_{n}C_{k} :: nCk
      {}_{n}P_{k} :: nPk
      n!! :: Doble factorial
      \left\langle{n\atop k}\right\rangle :: Número euleriano
      \left\{{n\atop k}\right\} :: Stirling de segunda especie
      \dbinom{#?}{#?} :: Binomial grande
    `),
    sub('Teoría de números', R`
      ∣ ~ \mid :: Divide a
      ∤ ~ \nmid :: No divide a
      a\equiv b\pmod{n} :: Congruencia módulo n
      #?\bmod#? :: Módulo (operación) :: resto
      \pmod{#?} :: (mod n)
      \gcd(#?,#?) :: Máximo común divisor :: mcd
      \operatorname{mcm}(#?,#?) :: Mínimo común múltiplo :: lcm
      \operatorname{mcd}(#?,#?) :: mcd
      \lfloor #?\rfloor :: Suelo :: parte entera floor
      \lceil #?\rceil :: Techo :: ceil
      \varphi(n) :: Función phi de Euler
      \pi(x) :: Contador de primos
      \zeta(s) :: Función zeta
      \mu(n) :: Función de Möbius
      \sigma(n) :: Suma de divisores
      \left(\frac{a}{p}\right) :: Símbolo de Legendre
    `)
  ]),

  cat('linalg', 'Matrices y vectores', '🔢', [
    sub('Matrices', R`
      \begin{pmatrix}#? & #?\\#? & #?\end{pmatrix} :: Matriz 2×2 ( )
      \begin{pmatrix}#? & #? & #?\\#? & #? & #?\\#? & #? & #?\end{pmatrix} :: Matriz 3×3 ( )
      \begin{bmatrix}#? & #?\\#? & #?\end{bmatrix} :: Matriz 2×2 [ ]
      \begin{bmatrix}#? & #? & #?\\#? & #? & #?\\#? & #? & #?\end{bmatrix} :: Matriz 3×3 [ ]
      \begin{vmatrix}#? & #?\\#? & #?\end{vmatrix} :: Determinante 2×2
      \begin{vmatrix}#? & #? & #?\\#? & #? & #?\\#? & #? & #?\end{vmatrix} :: Determinante 3×3
      \begin{Vmatrix}#? & #?\\#? & #?\end{Vmatrix} :: Norma matricial ‖ ‖
      \begin{Bmatrix}#? & #?\\#? & #?\end{Bmatrix} :: Matriz { }
      \begin{matrix}#? & #?\\#? & #?\end{matrix} :: Matriz sin bordes
      \begin{pmatrix}#? & #? & #? & #?\\#? & #? & #? & #?\\#? & #? & #? & #?\\#? & #? & #? & #?\end{pmatrix} :: Matriz 4×4
      \begin{pmatrix}#? & #? & #?\\#? & #? & #?\end{pmatrix} :: Matriz 2×3
      \begin{pmatrix}#? & #?\\#? & #?\\#? & #?\end{pmatrix} :: Matriz 3×2
      \begin{pmatrix}#?\\#?\end{pmatrix} :: Vector columna 2
      \begin{pmatrix}#?\\#?\\#?\end{pmatrix} :: Vector columna 3
      \begin{pmatrix}#? & #? & #?\end{pmatrix} :: Vector fila
      \left(\begin{array}{cc|c}#? & #? & #?\\#? & #? & #?\end{array}\right) :: Matriz aumentada 2×3
      \left(\begin{array}{ccc|c}#? & #? & #? & #?\\#? & #? & #? & #?\\#? & #? & #? & #?\end{array}\right) :: Matriz aumentada 3×4
      \begin{pmatrix}a_{11} & \cdots & a_{1n}\\\vdots & \ddots & \vdots\\a_{m1} & \cdots & a_{mn}\end{pmatrix} :: Matriz general m×n
      \begin{pmatrix}1 & 0\\0 & 1\end{pmatrix} :: Identidad 2×2
      \begin{pmatrix}1 & 0 & 0\\0 & 1 & 0\\0 & 0 & 1\end{pmatrix} :: Identidad 3×3
      \begin{pmatrix}\cos\theta & -\sin\theta\\\sin\theta & \cos\theta\end{pmatrix} :: Matriz de rotación
      \begin{smallmatrix}#? & #?\\#? & #?\end{smallmatrix} :: Matriz pequeña en línea
    `),
    sub('Operaciones', R`
      A^{T} :: Traspuesta
      A^{-1} :: Inversa
      A^{\dagger} :: Adjunta hermítica :: daga
      A^{*} :: Conjugada
      \det(A) :: Determinante
      |A| :: Determinante (barras)
      \operatorname{tr}(A) :: Traza
      \operatorname{rg}(A) :: Rango :: rank
      \operatorname{adj}(A) :: Adjunta
      \ker(A) :: Núcleo :: kernel
      \operatorname{Im}(A) :: Imagen
      \dim(V) :: Dimensión
      \operatorname{span}\{#?\} :: Espacio generado
      A\vec{x}=\vec{b} :: Sistema lineal
      A\vec{v}=\lambda\vec{v} :: Autovalores y autovectores
      \det(A-\lambda I)=0 :: Ecuación característica
      ⊗ ~ \otimes :: Producto tensorial :: kronecker
      ⊕ ~ \oplus :: Suma directa
      I_n :: Matriz identidad
      \mathbf{0} :: Matriz nula
      \delta_{ij} :: Delta de Kronecker
      \varepsilon_{ijk} :: Símbolo de Levi-Civita
    `),
    sub('Vectores', R`
      \vec{#?} :: Vector (flecha)
      \overrightarrow{#?} :: Vector largo :: segmento dirigido
      \mathbf{#?} :: Vector en negrita
      \hat{#?} :: Vector unitario :: versor
      \hat{\imath} :: Versor i
      \hat{\jmath} :: Versor j
      \hat{k} :: Versor k
      \|#?\| :: Norma
      \vec{a}\cdot\vec{b} :: Producto escalar :: punto
      \vec{a}\times\vec{b} :: Producto vectorial :: cruz
      \langle #?,#?\rangle :: Producto interno
      \vec{a}\cdot\vec{b}=|\vec{a}||\vec{b}|\cos\theta :: Definición producto escalar
      \vec{a}\times\vec{b}=\begin{vmatrix}\hat{\imath} & \hat{\jmath} & \hat{k}\\a_1 & a_2 & a_3\\b_1 & b_2 & b_3\end{vmatrix} :: Producto vectorial (determinante)
      \operatorname{proy}_{\vec{b}}\vec{a} :: Proyección
      \vec{0} :: Vector nulo
      \vec{a}\perp\vec{b} :: Vectores perpendiculares
      \vec{a}\parallel\vec{b} :: Vectores paralelos
      (#?,#?) :: Par ordenado :: coordenadas punto
      (#?,#?,#?) :: Terna :: coordenadas 3d
    `)
  ]),

  cat('calc', 'Cálculo', '📈', [
    sub('Límites', R`
      \lim_{#?\to#?}#? :: Límite
      \lim_{x\to\infty}#? :: Límite al infinito
      \lim_{x\to0}#? :: Límite en cero
      \lim_{x\to a^{+}}#? :: Límite por la derecha :: lateral
      \lim_{x\to a^{-}}#? :: Límite por la izquierda :: lateral
      \lim_{h\to0}\frac{f(x+h)-f(x)}{h} :: Definición de derivada
      \limsup_{#?\to#?}#? :: Límite superior
      \liminf_{#?\to#?}#? :: Límite inferior
      → ~ \to :: Tiende a
      \lim_{x\to0}\frac{\sin x}{x}=1 :: Límite notable del seno
      \lim_{n\to\infty}\left(1+\frac{1}{n}\right)^n=e :: Definición de e
      \sup_{#?}#? :: Supremo
      \inf_{#?}#? :: Ínfimo
      \max_{#?}#? :: Máximo
      \min_{#?}#? :: Mínimo
    `),
    sub('Derivadas', R`
      \frac{d}{dx}#? :: Derivada respecto a x
      \frac{d#?}{d#?} :: Derivada dy/dx :: leibniz
      \frac{d^2#?}{d#?^2} :: Segunda derivada
      \frac{d^n#?}{d#?^n} :: Derivada n-ésima
      f'(x) :: f prima
      f''(x) :: f segunda
      f^{(n)}(x) :: f n-ésima
      \dot{#?} :: Derivada temporal :: punto newton
      \ddot{#?} :: Segunda derivada temporal
      \frac{\partial#?}{\partial#?} :: Derivada parcial
      \frac{\partial^2#?}{\partial#?^2} :: Segunda parcial
      \frac{\partial^2#?}{\partial#?\,\partial#?} :: Parcial mixta
      ∂ ~ \partial :: Parcial (símbolo) :: d redonda
      \left.#?\right|_{#?} :: Evaluada en
      \frac{D#?}{Dt} :: Derivada material
      \mathrm{d}#? :: Diferencial
      (fg)'=f'g+fg' :: Regla del producto
      \left(\frac{f}{g}\right)'=\frac{f'g-fg'}{g^2} :: Regla del cociente
      (f\circ g)'=(f'\circ g)\cdot g' :: Regla de la cadena
    `),
    sub('Integrales', R`
      \int#?\,d#? :: Integral indefinida
      \int_{#?}^{#?}#?\,d#? :: Integral definida
      \iint_{#?}#?\,dA :: Integral doble
      \iiint_{#?}#?\,dV :: Integral triple
      \oint_{#?}#?\,d#? :: Integral de línea cerrada :: circulacion
      \oiint_{#?}#?\,dS :: Integral de superficie cerrada
      \int_{-\infty}^{\infty}#?\,d#? :: Integral impropia
      \int_{0}^{\infty}#?\,d#? :: Integral de 0 a infinito
      \left[#?\right]_{#?}^{#?} :: Regla de Barrow :: evaluar primitiva
      \int_a^b f(x)\,dx=F(b)-F(a) :: Teorema fundamental
      \int u\,dv=uv-\int v\,du :: Integración por partes
      \int x^n\,dx=\frac{x^{n+1}}{n+1}+C :: Integral de potencia
      \int\frac{1}{x}\,dx=\ln|x|+C :: Integral de 1/x
      \int e^x\,dx=e^x+C :: Integral exponencial
      @ ∫~\int ∬~\iint ∭~\iiint ∮~\oint ∯~\oiint ∰~\oiiint \smallint \intop
      \int\limits_{#?}^{#?}#? :: Integral con límites arriba y abajo
    `),
    sub('Series y sumas', R`
      \sum_{#?=#?}^{#?}#? :: Sumatoria
      \sum_{n=0}^{\infty}#? :: Serie infinita
      \sum_{i=1}^{n}#? :: Suma de 1 a n
      \prod_{#?=#?}^{#?}#? :: Productoria
      \sum_{k=1}^{n}k=\frac{n(n+1)}{2} :: Suma de Gauss
      \sum_{n=0}^{\infty}ar^n=\frac{a}{1-r} :: Serie geométrica
      f(x)=\sum_{n=0}^{\infty}\frac{f^{(n)}(a)}{n!}(x-a)^n :: Serie de Taylor
      e^x=\sum_{n=0}^{\infty}\frac{x^n}{n!} :: Serie de e^x
      \sum_{\substack{#?\\#?}}#? :: Suma con varias condiciones
      \bigcup_{#?}^{#?}#? :: Unión generalizada
      \bigcap_{#?}^{#?}#? :: Intersección generalizada
      \coprod_{#?}^{#?}#? :: Coproducto
      a_n :: Término general
      \{a_n\}_{n=1}^{\infty} :: Sucesión
    `),
    sub('Cálculo vectorial', R`
      ∇ ~ \nabla :: Nabla :: gradiente del
      \nabla f :: Gradiente
      \nabla\cdot\vec{F} :: Divergencia
      \nabla\times\vec{F} :: Rotacional :: curl
      \nabla^2 f :: Laplaciano
      \Delta f :: Laplaciano (delta)
      \Box :: D'Alembertiano
      \oint_C\vec{F}\cdot d\vec{r} :: Circulación
      \iint_S\vec{F}\cdot d\vec{S} :: Flujo
      \oint_{\partial S}\vec{F}\cdot d\vec{r}=\iint_S(\nabla\times\vec{F})\cdot d\vec{S} :: Teorema de Stokes
      \oiint_{\partial V}\vec{F}\cdot d\vec{S}=\iiint_V(\nabla\cdot\vec{F})\,dV :: Teorema de la divergencia
      \frac{\partial(#?,#?)}{\partial(#?,#?)} :: Jacobiano
      d\vec{r} :: Diferencial de línea
      d\vec{S} :: Diferencial de superficie
    `),
    sub('Ecuaciones diferenciales y transformadas', R`
      y'+p(x)y=q(x) :: EDO lineal de primer orden
      ay''+by'+cy=0 :: EDO lineal de segundo orden
      \frac{dy}{dx}=f(x,y) :: EDO de primer orden
      \frac{\partial u}{\partial t}=\alpha\nabla^2u :: Ecuación del calor
      \frac{\partial^2u}{\partial t^2}=c^2\nabla^2u :: Ecuación de onda
      \mathcal{L}\{#?\} :: Transformada de Laplace
      \mathcal{L}^{-1}\{#?\} :: Laplace inversa
      \mathcal{F}\{#?\} :: Transformada de Fourier
      \hat{f}(\xi)=\int_{-\infty}^{\infty}f(x)e^{-2\pi ix\xi}\,dx :: Definición de Fourier
      F(s)=\int_0^{\infty}f(t)e^{-st}\,dt :: Definición de Laplace
      (f*g)(t) :: Convolución
      \delta(#?) :: Delta de Dirac
      \Gamma(#?) :: Función gamma
      \operatorname{erf}(#?) :: Función error
      H(#?) :: Función escalón de Heaviside
      O(#?) :: O grande :: orden landau
      o(#?) :: o pequeña
    `)
  ]),

  cat('geo', 'Geometría y trigonometría', '📏', [
    sub('Ángulos y figuras', R`
      ∠ ~ \angle :: Ángulo
      ∡ ~ \measuredangle :: Ángulo medido
      ∢ ~ \sphericalangle :: Ángulo esférico
      ° ~ ^\circ :: Grados
      ′ ~ ' :: Minutos :: prima
      ″ ~ '' :: Segundos :: doble prima
      \widehat{#?} :: Ángulo ABC :: sombrero
      \angle #?#?#? :: Ángulo con tres puntos
      #?^\circ :: Medida en grados
      \overline{#?} :: Segmento
      \overrightarrow{#?} :: Semirrecta :: rayo
      \overleftrightarrow{#?} :: Recta
      \overset{\frown}{#?} :: Arco
      △ ~ \triangle :: Triángulo
      □ ~ \square :: Cuadrado
      ▱ :: Paralelogramo
      ▭ :: Rectángulo
      ◯ ~ \bigcirc :: Círculo
      ⊙ ~ \odot :: Circunferencia con centro
      ⬠ :: Pentágono
      ⬡ :: Hexágono
      ◇ ~ \Diamond :: Rombo
      ⏢ :: Trapecio
      ⟂ ~ \perp :: Perpendicular
      ∥ ~ \parallel :: Paralelo
      ∦ ~ \nparallel :: No paralelo
      ≅ ~ \cong :: Congruente
      ∼ ~ \sim :: Semejante
      ⌒ ~ \frown :: Arco (símbolo)
      ∟ :: Ángulo recto
      ⊿ :: Triángulo rectángulo
      π ~ \pi :: Pi
      τ ~ \tau :: Tau (2π)
      \triangle #?#?#? :: Triángulo ABC
      \text{rad} :: Radianes
    `),
    sub('Trigonometría', R`
      \sin#? :: Seno
      \cos#? :: Coseno
      \tan#? :: Tangente
      \cot#? :: Cotangente
      \sec#? :: Secante
      \csc#? :: Cosecante
      \arcsin#? :: Arcoseno
      \arccos#? :: Arcocoseno
      \arctan#? :: Arcotangente
      \sin^{-1}#? :: Seno inverso
      \cos^{-1}#? :: Coseno inverso
      \tan^{-1}#? :: Tangente inversa
      \sin^2#? :: Seno al cuadrado
      \cos^2#? :: Coseno al cuadrado
      \sinh#? :: Seno hiperbólico
      \cosh#? :: Coseno hiperbólico
      \tanh#? :: Tangente hiperbólica
      \coth#? :: Cotangente hiperbólica
      \operatorname{sen}#? :: sen (español)
      \operatorname{tg}#? :: tg (español)
      \operatorname{arcsen}#? :: arcsen (español)
      \operatorname{sech}#? :: Secante hiperbólica
      \operatorname{csch}#? :: Cosecante hiperbólica
      \operatorname{arsinh}#? :: Arcoseno hiperbólico
    `),
    sub('Identidades', R`
      \sin^2\theta+\cos^2\theta=1 :: Identidad pitagórica
      1+\tan^2\theta=\sec^2\theta :: Pitagórica de la tangente
      \tan\theta=\frac{\sin\theta}{\cos\theta} :: Tangente como cociente
      \sin(\alpha\pm\beta)=\sin\alpha\cos\beta\pm\cos\alpha\sin\beta :: Seno de la suma
      \cos(\alpha\pm\beta)=\cos\alpha\cos\beta\mp\sin\alpha\sin\beta :: Coseno de la suma
      \sin2\theta=2\sin\theta\cos\theta :: Seno del ángulo doble
      \cos2\theta=\cos^2\theta-\sin^2\theta :: Coseno del ángulo doble
      \sin^2\theta=\frac{1-\cos2\theta}{2} :: Reducción de potencia
      \frac{a}{\sin A}=\frac{b}{\sin B}=\frac{c}{\sin C} :: Teorema del seno
      c^2=a^2+b^2-2ab\cos C :: Teorema del coseno
      a^2+b^2=c^2 :: Teorema de Pitágoras
    `),
    sub('Áreas, volúmenes y analítica', R`
      A=\pi r^2 :: Área del círculo
      C=2\pi r :: Longitud de la circunferencia
      A=\frac{b\cdot h}{2} :: Área del triángulo
      A=\sqrt{s(s-a)(s-b)(s-c)} :: Fórmula de Herón
      A=\frac{(B+b)h}{2} :: Área del trapecio
      V=\frac{4}{3}\pi r^3 :: Volumen de la esfera
      A=4\pi r^2 :: Área de la esfera
      V=\pi r^2h :: Volumen del cilindro
      V=\frac{1}{3}\pi r^2h :: Volumen del cono
      V=\frac{1}{3}A_bh :: Volumen de la pirámide
      d=\sqrt{(x_2-x_1)^2+(y_2-y_1)^2} :: Distancia entre dos puntos
      M=\left(\frac{x_1+x_2}{2},\frac{y_1+y_2}{2}\right) :: Punto medio
      (x-h)^2+(y-k)^2=r^2 :: Ecuación de la circunferencia
      \frac{x^2}{a^2}+\frac{y^2}{b^2}=1 :: Elipse
      \frac{x^2}{a^2}-\frac{y^2}{b^2}=1 :: Hipérbola
      y=ax^2+bx+c :: Parábola
      Ax+By+C=0 :: Ecuación general de la recta
      d=\frac{|Ax_0+By_0+C|}{\sqrt{A^2+B^2}} :: Distancia punto-recta
      V-E+F=2 :: Fórmula de Euler (poliedros)
    `)
  ]),

  cat('sets', 'Conjuntos y lógica', '🧠', [
    sub('Conjuntos', R`
      ∈ ~ \in :: Pertenece
      ∉ ~ \notin :: No pertenece
      ∋ ~ \ni :: Contiene como elemento
      ∌ ~ \notni :: No contiene
      ⊂ ~ \subset :: Subconjunto propio
      ⊃ ~ \supset :: Superconjunto
      ⊆ ~ \subseteq :: Subconjunto o igual
      ⊇ ~ \supseteq :: Superconjunto o igual
      ⊄ ~ \not\subset :: No es subconjunto
      ⊈ ~ \nsubseteq :: No subconjunto ni igual
      ⊊ ~ \subsetneq :: Subconjunto estricto
      ⊋ ~ \supsetneq :: Superconjunto estricto
      ∪ ~ \cup :: Unión
      ∩ ~ \cap :: Intersección
      ∖ ~ \setminus :: Diferencia
      △ ~ \triangle :: Diferencia simétrica
      ∅ ~ \emptyset :: Conjunto vacío
      ⌀ ~ \varnothing :: Vacío (variante)
      ∁ ~ \complement :: Complemento
      A^{c} :: Complemento (exponente)
      \overline{A} :: Complemento (barra)
      × ~ \times :: Producto cartesiano
      ⊎ ~ \uplus :: Unión disjunta
      ⊔ ~ \sqcup :: Unión cuadrada
      ⊓ ~ \sqcap :: Intersección cuadrada
      \{#?\} :: Conjunto por extensión
      \{#?\mid#?\} :: Conjunto por comprensión :: tal que
      \{x\in\mathbb{R}\mid#?\} :: Reales tales que
      |A| :: Cardinal
      \#A :: Cardinal (numeral)
      \mathcal{P}(A) :: Conjunto potencia :: partes
      ℵ ~ \aleph :: Álef
      \aleph_0 :: Álef cero
      (#?,#?) :: Intervalo abierto
      [#?,#?] :: Intervalo cerrado
      [#?,#?) :: Intervalo semiabierto derecha
      (#?,#?] :: Intervalo semiabierto izquierda
      (-\infty,\infty) :: Recta real
      @ ⋃~\bigcup ⋂~\bigcap ⨆~\bigsqcup ⨄~\biguplus ⋐~\Subset ⋑~\Supset ⋒~\Cap ⋓~\Cup ⊏~\sqsubset ⊐~\sqsupset ⊑~\sqsubseteq ⊒~\sqsupseteq
      @ \subseteqq \supseteqq \nsupseteq \nsubseteqq \nsupseteqq \subsetneqq \supsetneqq \varsubsetneq \varsupsetneq \varsubsetneqq \varsupsetneqq \smallsetminus
    `),
    sub('Lógica', R`
      ∀ ~ \forall :: Para todo :: cuantificador universal
      ∃ ~ \exists :: Existe
      ∄ ~ \nexists :: No existe
      \exists! :: Existe un único
      ¬ ~ \neg :: Negación :: no
      ∧ ~ \land :: Conjunción :: y and
      ∨ ~ \lor :: Disyunción :: o or
      ⊻ ~ \veebar :: Disyunción exclusiva :: xor
      ⊕ ~ \oplus :: XOR
      ⇒ ~ \Rightarrow :: Implica
      ⟹ ~ \implies :: Implica (largo)
      ⇐ ~ \Leftarrow :: Es implicado por
      ⟸ ~ \impliedby :: Implicado por (largo)
      ⇔ ~ \Leftrightarrow :: Si y solo si
      ⟺ ~ \iff :: Si y solo si (largo)
      → ~ \to :: Condicional
      ↔ ~ \leftrightarrow :: Bicondicional
      ⊤ ~ \top :: Verdadero :: tautologia
      ⊥ ~ \bot :: Falso :: contradiccion
      ∴ ~ \therefore :: Por lo tanto
      ∵ ~ \because :: Porque
      ⊢ ~ \vdash :: Demuestra :: deduce
      ⊨ ~ \models :: Satisface :: modelo
      ⊣ ~ \dashv :: Adjunto izquierdo
      ≡ ~ \equiv :: Equivalencia lógica
      ∎ ~ \blacksquare :: Fin de demostración :: qed
      □ ~ \square :: QED (hueco) :: necesario modal
      ◇ ~ \Diamond :: Posible (modal)
      : :: Tal que
      ∣ ~ \mid :: Tal que (barra)
      ≔ ~ \coloneqq :: Definición
      \overset{\text{def}}{=} :: Igual por definición
      \text{s.t.} :: Sujeto a
      @ ⊬~\nvdash ⊭~\nvDash ⊩~\Vdash ⊪~\Vvdash ⊮~\nVdash ⊯~\nVDash \vDash ⋀~\bigwedge ⋁~\bigvee \lnot \barwedge \doublebarwedge \curlyvee \curlywedge
    `),
    sub('Funciones y aplicaciones', R`
      f\colon A\to B :: Función de A en B
      x\mapsto#? :: Asigna :: mapsto
      f(x) :: f de x
      f^{-1} :: Función inversa
      g\circ f :: Composición
      ↦ ~ \mapsto :: Flecha de asignación
      ↪ ~ \hookrightarrow :: Inyección :: inclusion
      ↠ ~ \twoheadrightarrow :: Sobreyección
      ⤖ :: Biyección
      \operatorname{Dom}(f) :: Dominio
      \operatorname{Ran}(f) :: Rango :: recorrido
      \operatorname{Im}(f) :: Imagen
      \operatorname{id} :: Identidad
      \operatorname{sgn}(#?) :: Función signo
      f|_{A} :: Restricción
      \lfloor#?\rfloor :: Suelo
      \lceil#?\rceil :: Techo
      \max(#?,#?) :: Máximo
      \min(#?,#?) :: Mínimo
      \arg\max_{#?}#? :: Argumento del máximo
      \arg\min_{#?}#? :: Argumento del mínimo
      \cong :: Isomorfo
      \simeq :: Homotópico :: equivalente
    `)
  ]),

  cat('rel', 'Relaciones', '⚖️', [
    sub('Igualdad y equivalencia', R`
      @ = ≠~\ne ≈~\approx ≡~\equiv ≢~\not\equiv ≅~\cong ≇~\ncong ≃~\simeq ∼~\sim ≁~\nsim ≊~\approxeq ≍~\asymp ≐~\doteq ≑~\Doteq ≒~\fallingdotseq ≓~\risingdotseq ≔~\coloneqq ≕~\eqqcolon ≖~\eqcirc ≗~\circeq ≜~\triangleq ≏~\bumpeq ≎~\Bumpeq ≂~\eqsim ∽~\backsim ⋍~\backsimeq ∝~\propto
      @ \thickapprox \thicksim \varpropto \doteqdot \coloneq \Coloneq \Coloneqq \eqcolon \Eqcolon \Eqqcolon \colonapprox \Colonapprox \colonsim \Colonsim \dblcolon \vcentcolon
      \overset{?}{=} :: ¿Igual? (por comprobar)
      \overset{!}{=} :: Debe ser igual
      \stackrel{#?}{=} :: Igual con anotación
      \xlongequal{#?} :: Igual largo con texto
    `),
    sub('Desigualdades', R`
      @ < > ≤~\le ≥~\ge ≦~\leqq ≧~\geqq ⩽~\leqslant ⩾~\geqslant ≪~\ll ≫~\gg ⋘~\lll ⋙~\ggg ≲~\lesssim ≳~\gtrsim ⪅~\lessapprox ⪆~\gtrapprox ≶~\lessgtr ≷~\gtrless ⋚~\lesseqgtr ⋛~\gtreqless ⪋~\lesseqqgtr ⪌~\gtreqqless ⋖~\lessdot ⋗~\gtrdot ⪕~\eqslantless ⪖~\eqslantgtr
      @ ≮~\nless ≯~\ngtr ≰~\nleq ≱~\ngeq ⪇~\lneq ⪈~\gneq ≨~\lneqq ≩~\gneqq ⋦~\lnsim ⋧~\gnsim ⪉~\lnapprox ⪊~\gnapprox \nleqslant \ngeqslant \nleqq \ngeqq \lvertneqq \gvertneqq
    `),
    sub('Orden y otras', R`
      @ ≺~\prec ≻~\succ ⪯~\preceq ⪰~\succeq ≼~\preccurlyeq ≽~\succcurlyeq ≾~\precsim ≿~\succsim ⪷~\precapprox ⪸~\succapprox ⋞~\curlyeqprec ⋟~\curlyeqsucc ⊀~\nprec ⊁~\nsucc ⋠~\npreceq ⋡~\nsucceq ⪹~\precnapprox ⪺~\succnapprox ⪵~\precneqq ⪶~\succneqq ⋨~\precnsim ⋩~\succnsim
      @ ∣~\mid ∤~\nmid ∥~\parallel ∦~\nparallel ⟂~\perp ⋈~\bowtie ≬~\between ⋔~\pitchfork ⌣~\smile ⌢~\frown ⊸~\multimap ∍~\backepsilon \shortmid \nshortmid \shortparallel \nshortparallel \smallsmile \smallfrown \Join \owns
      @ ⊲~\vartriangleleft ⊳~\vartriangleright ⊴~\trianglelefteq ⊵~\trianglerighteq ⋪~\ntriangleleft ⋫~\ntriangleright ⋬~\ntrianglelefteq ⋭~\ntrianglerighteq \vartriangle \lhd \rhd \unlhd \unrhd
      \not#? :: Negar cualquier relación :: tachar
    `)
  ]),

  cat('arrows', 'Flechas', '➡️', [
    sub('Simples', R`
      → ~ \rightarrow :: Flecha derecha
      ← ~ \leftarrow :: Flecha izquierda
      ↑ ~ \uparrow :: Flecha arriba
      ↓ ~ \downarrow :: Flecha abajo
      ↔ ~ \leftrightarrow :: Flecha doble sentido
      ↕ ~ \updownarrow :: Flecha arriba-abajo
      ↗ ~ \nearrow :: Flecha noreste
      ↘ ~ \searrow :: Flecha sureste
      ↙ ~ \swarrow :: Flecha suroeste
      ↖ ~ \nwarrow :: Flecha noroeste
      ⟶ ~ \longrightarrow :: Flecha larga derecha
      ⟵ ~ \longleftarrow :: Flecha larga izquierda
      ⟷ ~ \longleftrightarrow :: Flecha larga doble
      ↦ ~ \mapsto :: Asigna
      ⟼ ~ \longmapsto :: Asigna (larga)
      ↛ ~ \nrightarrow :: No flecha derecha
      ↚ ~ \nleftarrow :: No flecha izquierda
      ↮ ~ \nleftrightarrow :: No flecha doble
    `),
    sub('Dobles', R`
      ⇒ ~ \Rightarrow :: Implica
      ⇐ ~ \Leftarrow :: Implicado por
      ⇔ ~ \Leftrightarrow :: Equivale
      ⇑ ~ \Uparrow :: Doble arriba
      ⇓ ~ \Downarrow :: Doble abajo
      ⇕ ~ \Updownarrow :: Doble arriba-abajo
      ⟹ ~ \Longrightarrow :: Implica (larga)
      ⟸ ~ \Longleftarrow :: Implicado (larga)
      ⟺ ~ \Longleftrightarrow :: Equivale (larga)
      ⇏ ~ \nRightarrow :: No implica
      ⇍ ~ \nLeftarrow :: No implicado
      ⇎ ~ \nLeftrightarrow :: No equivale
      ⇛ ~ \Rrightarrow :: Triple derecha
      ⇚ ~ \Lleftarrow :: Triple izquierda
    `),
    sub('Arpones, ganchos y curvas', R`
      @ ⇀~\rightharpoonup ⇁~\rightharpoondown ↼~\leftharpoonup ↽~\leftharpoondown ⇌~\rightleftharpoons ⇋~\leftrightharpoons ↾~\upharpoonright ↿~\upharpoonleft ⇂~\downharpoonright ⇃~\downharpoonleft
      @ ↪~\hookrightarrow ↩~\hookleftarrow ↠~\twoheadrightarrow ↞~\twoheadleftarrow ↣~\rightarrowtail ↢~\leftarrowtail ↬~\looparrowright ↫~\looparrowleft ↝~\leadsto ⇝~\rightsquigarrow ↭~\leftrightsquigarrow ↷~\curvearrowright ↶~\curvearrowleft ↻~\circlearrowright ↺~\circlearrowleft ↰~\Lsh ↱~\Rsh
      @ ⇉~\rightrightarrows ⇇~\leftleftarrows ⇈~\upuparrows ⇊~\downdownarrows ⇄~\rightleftarrows ⇆~\leftrightarrows ⇢~\dashrightarrow ⇠~\dashleftarrow \restriction \gets \to
    `),
    sub('Con texto encima', R`
      \xrightarrow{#?} :: Flecha con texto
      \xleftarrow{#?} :: Flecha izquierda con texto
      \xrightarrow[#?]{#?} :: Flecha con texto arriba y abajo
      \xRightarrow{#?} :: Implica con texto
      \xLeftarrow{#?} :: Implicado con texto
      \xleftrightarrow{#?} :: Doble sentido con texto
      \xLeftrightarrow{#?} :: Equivale con texto
      \xhookrightarrow{#?} :: Inclusión con texto
      \xhookleftarrow{#?} :: Gancho izquierdo con texto
      \xtwoheadrightarrow{#?} :: Sobreyección con texto
      \xtwoheadleftarrow{#?} :: Dos puntas izquierda con texto
      \xmapsto{#?} :: Asigna con texto
      \xrightleftharpoons{#?} :: Equilibrio con texto
      \xleftrightharpoons{#?} :: Equilibrio inverso con texto
      \xrightharpoonup{#?} :: Arpón derecha con texto
      \xleftharpoonup{#?} :: Arpón izquierda con texto
      \xrightharpoondown{#?} :: Arpón abajo con texto
      \xleftharpoondown{#?} :: Arpón abajo izquierda con texto
      \xtofrom{#?} :: Ida y vuelta con texto
      \overset{#?}{\rightarrow} :: Anotación sobre flecha
      \underset{#?}{\rightarrow} :: Anotación bajo flecha
    `),
    sub('Flechas de texto', R`
      @ ← → ↑ ↓ ↔ ↕ ↖ ↗ ↘ ↙ ⇐ ⇒ ⇑ ⇓ ⇔ ⇕ ⟵ ⟶ ⟷ ⟸ ⟹ ⟺ ↩ ↪ ↰ ↱ ↲ ↳ ↴ ↵ ↶ ↷ ↺ ↻ ⇄ ⇅ ⇆ ⇦ ⇧ ⇨ ⇩ ⇪ ➔ ➘ ➙ ➚ ➛ ➜ ➝ ➞ ➟ ➠ ➡ ➢ ➣ ➤ ➥ ➦ ➧ ➨ ➩ ➪ ➫ ➬ ➭ ➮ ➯ ➱ ➲ ➳ ➴ ➵ ➶ ➷ ➸ ➹ ➺ ➻ ➼ ➽ ➾ ⬅ ⬆ ⬇ ⬈ ⬉ ⬊ ⬋ ⬌ ⬍ ⤴ ⤵ ↯ ⟲ ⟳ ⏎ ⮐ ⮑ ⭠ ⭡ ⭢ ⭣ ◀ ▶ ▲ ▼ ◁ ▷ △ ▽ ◄ ► ☚ ☛ ☜ ☝ ☞ ☟
    `)
  ]),

  cat('ops', 'Operadores', '⊗', [
    sub('Binarios', R`
      @ +  ×~\times ÷~\div ·~\cdot ∘~\circ ∙~\bullet ∗~\ast ⋆~\star ±~\pm ∓~\mp ⊕~\oplus ⊖~\ominus ⊗~\otimes ⊘~\oslash ⊙~\odot ⊛~\circledast ⊚~\circledcirc ⊝~\circleddash ⊞~\boxplus ⊟~\boxminus ⊠~\boxtimes ⊡~\boxdot
      @ ∧~\wedge ∨~\vee ∩~\cap ∪~\cup ⊓~\sqcap ⊔~\sqcup ⊎~\uplus ∖~\setminus ≀~\wr ⨿~\amalg †~\dagger ‡~\ddagger ⋄~\diamond ◁~\triangleleft ▷~\triangleright △~\bigtriangleup ▽~\bigtriangledown ◯~\bigcirc
      @ ∔~\dotplus ⋇~\divideontimes ⋉~\ltimes ⋊~\rtimes ⋋~\leftthreetimes ⋌~\rightthreetimes ⊺~\intercal ⊼~\barwedge ⊻~\veebar ⋏~\curlywedge ⋎~\curlyvee ⩞~\doublebarwedge \centerdot \cdotp \And \plusmn
    `),
    sub('Grandes', R`
      \sum_{#?}^{#?} :: Sumatoria
      \prod_{#?}^{#?} :: Productoria
      \coprod_{#?}^{#?} :: Coproducto
      \int_{#?}^{#?} :: Integral
      \bigcup_{#?}^{#?} :: Unión
      \bigcap_{#?}^{#?} :: Intersección
      \bigoplus_{#?}^{#?} :: Suma directa
      \bigotimes_{#?}^{#?} :: Producto tensorial
      \bigodot_{#?}^{#?} :: Producto punto
      \bigvee_{#?}^{#?} :: Disyunción
      \bigwedge_{#?}^{#?} :: Conjunción
      \bigsqcup_{#?}^{#?} :: Unión disjunta
      \biguplus_{#?}^{#?} :: Unión múltiple
      @ ∑~\sum ∏~\prod ∐~\coprod ⨁~\bigoplus ⨂~\bigotimes ⨀~\bigodot
      \sum\limits_{#?}^{#?} :: Límites arriba y abajo
      \sum\nolimits_{#?}^{#?} :: Límites al lado
    `),
    sub('Con nombre', R`
      @ \sin \cos \tan \cot \sec \csc \arcsin \arccos \arctan \sinh \cosh \tanh \coth \exp \log \ln \lg \det \dim \ker \hom \deg \arg \gcd \max \min \sup \inf \lim \limsup \liminf \Pr \bmod
      @ \arctg \arcctg \ch \cosec \cotg \ctg \cth \sh \tg \th \argmax \argmin \injlim \projlim \varinjlim \varprojlim \varliminf \varlimsup
      \operatorname{#?} :: Operador personalizado
      \operatorname*{#?}_{#?} :: Operador con límites
    `)
  ]),

  cat('greek', 'Griego y letras', 'αβ', [
    sub('Minúsculas', R`
      α ~ \alpha :: alfa
      β ~ \beta :: beta
      γ ~ \gamma :: gamma
      δ ~ \delta :: delta
      ε ~ \varepsilon :: épsilon
      ϵ ~ \epsilon :: épsilon (lunar)
      ζ ~ \zeta :: zeta
      η ~ \eta :: eta
      θ ~ \theta :: theta
      ϑ ~ \vartheta :: theta (variante)
      ι ~ \iota :: iota
      κ ~ \kappa :: kappa
      ϰ ~ \varkappa :: kappa (variante)
      λ ~ \lambda :: lambda
      μ ~ \mu :: mu :: micro
      ν ~ \nu :: nu
      ξ ~ \xi :: xi
      ο ~ o :: ómicron
      π ~ \pi :: pi
      ϖ ~ \varpi :: pi (variante)
      ρ ~ \rho :: rho
      ϱ ~ \varrho :: rho (variante)
      σ ~ \sigma :: sigma
      ς ~ \varsigma :: sigma final
      τ ~ \tau :: tau
      υ ~ \upsilon :: ípsilon
      φ ~ \varphi :: phi :: fi
      ϕ ~ \phi :: phi (recta) :: fi
      χ ~ \chi :: ji :: chi
      ψ ~ \psi :: psi
      ω ~ \omega :: omega
      ϝ ~ \digamma :: digamma
    `),
    sub('Mayúsculas', R`
      Α ~ A :: Alfa
      Β ~ B :: Beta
      Γ ~ \Gamma :: Gamma
      Δ ~ \Delta :: Delta :: incremento
      Ε ~ E :: Épsilon
      Ζ ~ Z :: Zeta
      Η ~ H :: Eta
      Θ ~ \Theta :: Theta
      Ι ~ I :: Iota
      Κ ~ K :: Kappa
      Λ ~ \Lambda :: Lambda
      Μ ~ M :: Mu
      Ν ~ N :: Nu
      Ξ ~ \Xi :: Xi
      Ο ~ O :: Ómicron
      Π ~ \Pi :: Pi
      Ρ ~ P :: Rho
      Σ ~ \Sigma :: Sigma
      Τ ~ T :: Tau
      Υ ~ \Upsilon :: Ípsilon
      Φ ~ \Phi :: Phi :: fi
      Χ ~ X :: Ji
      Ψ ~ \Psi :: Psi
      Ω ~ \Omega :: Omega :: ohmio
      @ \varGamma \varDelta \varTheta \varLambda \varXi \varPi \varSigma \varUpsilon \varPhi \varPsi \varOmega
    `),
    sub('Hebreo y letras especiales', R`
      ℵ ~ \aleph :: álef
      ℶ ~ \beth :: bet
      ℷ ~ \gimel :: guímel
      ℸ ~ \daleth :: dálet
      ℏ ~ \hbar :: h barra :: planck reducida
      ℓ ~ \ell :: ele cursiva :: litro longitud
      ℘ ~ \wp :: p de Weierstrass
      ℜ ~ \Re :: Parte real
      ℑ ~ \Im :: Parte imaginaria
      ∂ ~ \partial :: d parcial
      ∇ ~ \nabla :: nabla
      ı ~ \imath :: i sin punto
      ȷ ~ \jmath :: j sin punto
      ð ~ \eth :: eth
      Å ~ \text{\AA} :: ángstrom
      ∞ ~ \infty :: infinito
      @ \hslash \Finv \Game \Bbbk \mho \backepsilon
      @ \text{\aa} \text{\ae} \text{\AE} \text{\oe} \text{\OE} \text{\o} \text{\O} \text{\ss} \text{\i} \text{\j}
    `),
    sub('Griego con acentos (texto)', R`
      @ ά έ ή ί ό ύ ώ ϊ ϋ ΐ ΰ Ά Έ Ή Ί Ό Ύ Ώ Ϊ Ϋ ϐ ϑ ϒ ϕ ϖ Ϙ ϙ Ϛ ϛ Ϝ ϝ Ϟ ϟ Ϡ ϡ ϰ ϱ ϲ ϴ ϵ ϶
    `)
  ]),

  cat('fonts', 'Estilos de letra', 'ℬ', [
    ...fontSubs(),
    sub('Comandos de estilo', R`
      \mathbb{#?} :: Pizarra (doble trazo)
      \mathcal{#?} :: Caligráfica
      \mathscr{#?} :: Manuscrita
      \mathfrak{#?} :: Gótica
      \mathbf{#?} :: Negrita recta
      \boldsymbol{#?} :: Negrita (símbolos y griego)
      \bm{#?} :: Negrita matemática
      \mathit{#?} :: Cursiva
      \mathrm{#?} :: Redonda
      \mathsf{#?} :: Palo seco
      \mathtt{#?} :: Monoespaciada
      \mathnormal{#?} :: Normal matemática
      \text{#?} :: Texto dentro de fórmula
      \textbf{#?} :: Texto en negrita
      \textit{#?} :: Texto en cursiva
      \textrm{#?} :: Texto redondo
      \textsf{#?} :: Texto palo seco
      \texttt{#?} :: Texto monoespaciado
      \emph{#?} :: Énfasis
      \boldsymbol{\alpha} :: Alfa en negrita
      \boldsymbol{\nabla} :: Nabla en negrita
      \mathbf{v} :: Vector v en negrita
    `),
    sub('Tamaño y color', R`
      \tiny #? :: Diminuto
      \scriptsize #? :: Muy pequeño
      \footnotesize #? :: Nota al pie
      \small #? :: Pequeño
      \normalsize #? :: Normal
      \large #? :: Grande
      \Large #? :: Más grande
      \LARGE #? :: Muy grande
      \huge #? :: Enorme
      \Huge #? :: Gigante
      \displaystyle #? :: Estilo de bloque
      \textstyle #? :: Estilo de línea
      \scriptstyle #? :: Estilo de índice
      \scriptscriptstyle #? :: Estilo de subíndice doble
      \textcolor{red}{#?} :: Rojo
      \textcolor{blue}{#?} :: Azul
      \textcolor{green}{#?} :: Verde
      \textcolor{orange}{#?} :: Naranja
      \textcolor{purple}{#?} :: Morado
      \textcolor{teal}{#?} :: Turquesa
      \textcolor{magenta}{#?} :: Magenta
      \textcolor{gray}{#?} :: Gris
      \textcolor{#38bdf8}{#?} :: Color hexadecimal
      \colorbox{yellow}{$#?$} :: Fondo amarillo (resaltado)
      \colorbox{pink}{$#?$} :: Fondo rosa
      \colorbox{lightblue}{$#?$} :: Fondo azul claro
      \fcolorbox{red}{white}{$#?$} :: Caja con borde de color
    `)
  ]),

  cat('accents', 'Acentos y decoraciones', 'â', [
    sub('Acentos', R`
      \hat{#?} :: Sombrero :: circunflejo unitario estimador
      \bar{#?} :: Barra :: media promedio conjugado
      \vec{#?} :: Flecha de vector
      \dot{#?} :: Punto :: derivada
      \ddot{#?} :: Dos puntos :: segunda derivada
      \tilde{#?} :: Tilde :: virgulilla
      \check{#?} :: Anticircunflejo :: caron
      \acute{#?} :: Acento agudo
      \grave{#?} :: Acento grave
      \breve{#?} :: Breve
      \mathring{#?} :: Anillo
      \widehat{#?} :: Sombrero ancho
      \widetilde{#?} :: Tilde ancha
      \widecheck{#?} :: Caron ancho
      \overline{#?} :: Línea superior
      \underline{#?} :: Subrayado
      \underbar{#?} :: Barra inferior
      \utilde{#?} :: Tilde inferior
      #?' :: Prima
      #?'' :: Doble prima
      #?^{*} :: Asterisco
      #?^{\dagger} :: Daga
      #?^{\circ} :: Grado
      #?^{\prime} :: Prima (comando)
    `),
    sub('Flechas y llaves encima/debajo', R`
      \overrightarrow{#?} :: Flecha derecha encima
      \overleftarrow{#?} :: Flecha izquierda encima
      \overleftrightarrow{#?} :: Flecha doble encima
      \underrightarrow{#?} :: Flecha derecha debajo
      \underleftarrow{#?} :: Flecha izquierda debajo
      \underleftrightarrow{#?} :: Flecha doble debajo
      \overrightharpoon{#?} :: Arpón derecha encima
      \overleftharpoon{#?} :: Arpón izquierda encima
      \Overrightarrow{#?} :: Flecha doble trazo encima
      \overbrace{#?} :: Llave superior
      \underbrace{#?} :: Llave inferior
      \overbrace{#?}^{#?} :: Llave superior con texto
      \underbrace{#?}_{#?} :: Llave inferior con texto
      \overgroup{#?} :: Paréntesis superior
      \undergroup{#?} :: Paréntesis inferior
      \overlinesegment{#?} :: Segmento encima
      \underlinesegment{#?} :: Segmento debajo
      \overset{#?}{#?} :: Colocar encima
      \underset{#?}{#?} :: Colocar debajo
      \stackrel{#?}{#?} :: Apilar
      \overset{#?}{\underset{#?}{#?}} :: Encima y debajo
      #?\atop#? :: Uno sobre otro (sin barra)
      \substack{#?\\#?} :: Subíndice en varias líneas
    `),
    sub('Tachados, cajas y resaltes', R`
      \cancel{#?} :: Tachar (diagonal) :: cancelar simplificar
      \bcancel{#?} :: Tachar (diagonal inversa)
      \xcancel{#?} :: Tachar en cruz
      \sout{#?} :: Tachado horizontal
      \boxed{#?} :: Recuadro :: resultado caja
      \fbox{#?} :: Recuadro de texto
      \colorbox{yellow}{$#?$} :: Resaltado
      \phase{#?} :: Fasor
      \angl{#?} :: Ángulo actuarial
      \phantom{#?} :: Espacio invisible
      \hphantom{#?} :: Espacio invisible horizontal
      \vphantom{#?} :: Espacio invisible vertical
      \not#? :: Negar símbolo
    `)
  ]),

  cat('delims', 'Delimitadores', '⟨⟩', [
    sub('Pares', R`
      \left(#?\right) :: Paréntesis ajustables
      \left[#?\right] :: Corchetes ajustables
      \left\{#?\right\} :: Llaves ajustables
      \left|#?\right| :: Barras ajustables
      \left\|#?\right\| :: Doble barra ajustable :: norma
      \left\langle#?\right\rangle :: Ángulos ajustables
      \left\lfloor#?\right\rfloor :: Suelo ajustable
      \left\lceil#?\right\rceil :: Techo ajustable
      \left\lgroup#?\right\rgroup :: Grupo
      \left\lmoustache#?\right\rmoustache :: Bigote
      \llbracket#?\rrbracket :: Corchetes dobles
      \lBrace#?\rBrace :: Llaves dobles
      \left(#?\middle|#?\right) :: Con barra central :: condicional
      \left.#?\right|_{#?} :: Solo barra derecha :: evaluar
      \left\{#?\right. :: Solo llave izquierda
      \left[#?\right) :: Corchete y paréntesis
      \left(#?\right] :: Paréntesis y corchete
      \langle#?|#?\rangle :: Bra-ket
      \lvert#?\rvert :: Barras (valor absoluto)
      \lVert#?\rVert :: Doble barra (norma)
      \ulcorner#?\urcorner :: Esquinas superiores
      \llcorner#?\lrcorner :: Esquinas inferiores
    `),
    sub('Sueltos y tamaños', R`
      @ ( ) [ ] \{ \} | \| \langle \rangle \lfloor \rfloor \lceil \rceil \lvert \rvert \lVert \rVert \lgroup \rgroup \lmoustache \rmoustache \ulcorner \urcorner \llcorner \lrcorner \llbracket \rrbracket \lBrace \rBrace \backslash \vert \Vert
      \big(#?\big) :: Paréntesis grandes
      \Big(#?\Big) :: Paréntesis más grandes
      \bigg(#?\bigg) :: Paréntesis muy grandes
      \Bigg(#?\Bigg) :: Paréntesis enormes
      \big[#?\big] :: Corchetes grandes
      \Big\{#?\Big\} :: Llaves grandes
      \bigm| :: Barra central grande
      \Bigm| :: Barra central más grande
      @ ⟨ ⟩ ⟦ ⟧ ⟪ ⟫ ⌈ ⌉ ⌊ ⌋ ⦃ ⦄ ⦅ ⦆ ⦇ ⦈ ⦉ ⦊ ⦋ ⦌ ⟮ ⟯ ❨ ❩ ❪ ❫ ❬ ❭ ❮ ❯ ❰ ❱ ❲ ❳ ❴ ❵ 〈 〉 《 》 「 」 『 』 【 】 〔 〕 〖 〗
    `)
  ]),

  cat('layout', 'Estructuras y espaciado', '🧱', [
    sub('Entornos', R`
      \begin{aligned}#? &= #?\\#? &= #?\end{aligned} :: Ecuaciones alineadas
      \begin{gathered}#?\\#?\end{gathered} :: Ecuaciones centradas
      \begin{cases}#? & \text{si }#?\\#? & \text{si }#?\end{cases} :: Casos con condición
      \begin{rcases}#?\\#?\end{rcases}#? :: Llave a la derecha
      \begin{array}{c|c}#? & #?\\\hline#? & #?\end{array} :: Tabla con líneas
      \begin{array}{ccc}#? & #? & #?\\#? & #? & #?\end{array} :: Tabla 2×3
      \begin{array}{l}#?\\#?\\#?\end{array} :: Lista en columna
      \begin{alignedat}{2}#? &= #? &\quad#? &= #?\end{alignedat} :: Alineación múltiple
      \begin{array}{r}#?\\+\;#?\\\hline#?\end{array} :: Suma en vertical
      \begin{array}{r}#?\\\times\;#?\\\hline#?\end{array} :: Multiplicación en vertical
      \begin{array}{r|l}#? & #?\\\hline#? & #?\end{array} :: División / tabla en T
      \displaystyle#? :: Forzar tamaño grande
      \genfrac{(}{)}{0pt}{}{#?}{#?} :: Fracción generalizada
      \\ :: Salto de línea
      & :: Separador de columna
    `),
    sub('Espacios', R`
      \, :: Espacio fino
      \: :: Espacio medio
      \; :: Espacio grueso
      \! :: Espacio negativo
      \quad :: Espacio cuadratín
      \qquad :: Doble cuadratín
      \enspace :: Medio cuadratín
      ~ :: Espacio irrompible
      \hspace{1em} :: Espacio a medida
      \kern{1em} :: Kern
      \thinspace :: Espacio fino (nombre)
      \medspace :: Espacio medio (nombre)
      \thickspace :: Espacio grueso (nombre)
      \negthinspace :: Negativo fino
      \negmedspace :: Negativo medio
      \negthickspace :: Negativo grueso
      \mathstrut :: Puntal
      \smash{#?} :: Sin altura
      \mathllap{#?} :: Solapar a la izquierda
      \mathrlap{#?} :: Solapar a la derecha
      \mathclap{#?} :: Solapar centrado
      \raisebox{0.25em}{#?} :: Elevar
    `),
    sub('Puntos y símbolos sueltos', R`
      … ~ \ldots :: Puntos suspensivos (bajos)
      ⋯ ~ \cdots :: Puntos centrados
      ⋮ ~ \vdots :: Puntos verticales
      ⋱ ~ \ddots :: Puntos diagonales
      @ \dots \dotsb \dotsc \dotsi \dotsm \dotso \mathellipsis \ldotp \cdotp
      @ ′~\prime ‵~\backprime ∞~\infty ∅~\emptyset ∠~\angle √~\surd ⊤~\top ⊥~\bot ♭~\flat ♮~\natural ♯~\sharp ♣~\clubsuit ♢~\diamondsuit ♡~\heartsuit ♠~\spadesuit ✓~\checkmark ✠~\maltese Ⓡ~\circledR Ⓢ~\circledS ★~\bigstar ◊~\lozenge ⧫~\blacklozenge ■~\blacksquare ▲~\blacktriangle ▼~\blacktriangledown ◀~\blacktriangleleft ▶~\blacktriangleright ▽~\triangledown
      @ \# \% \& \_ \$ \S \P \dag \ddag \pounds \yen \copyright \degree \diagup \diagdown \KaTeX \LaTeX \TeX
    `)
  ]),

  cat('stats', 'Probabilidad y estadística', '🎲', [
    sub('Probabilidad', R`
      P(#?) :: Probabilidad
      P(#?\mid#?) :: Probabilidad condicional
      P(A\cap B) :: Probabilidad de la intersección
      P(A\cup B)=P(A)+P(B)-P(A\cap B) :: Regla de la suma
      P(A\mid B)=\frac{P(B\mid A)P(A)}{P(B)} :: Teorema de Bayes
      P(A\cap B)=P(A)P(B) :: Sucesos independientes
      P(\overline{A})=1-P(A) :: Suceso contrario
      \Omega :: Espacio muestral
      E[#?] :: Esperanza
      \mathbb{E}[#?] :: Esperanza (pizarra)
      \operatorname{Var}(#?) :: Varianza
      \operatorname{Cov}(#?,#?) :: Covarianza
      \sigma_{#?} :: Desviación típica
      X\sim\mathcal{N}(\mu,\sigma^2) :: Distribución normal
      X\sim B(n,p) :: Distribución binomial
      X\sim\operatorname{Poisson}(\lambda) :: Distribución de Poisson
      X\sim U(a,b) :: Distribución uniforme
      X\sim\operatorname{Exp}(\lambda) :: Distribución exponencial
      P(X=k)=\binom{n}{k}p^k(1-p)^{n-k} :: Función binomial
      P(X=k)=\frac{\lambda^ke^{-\lambda}}{k!} :: Función de Poisson
      f(x)=\frac{1}{\sigma\sqrt{2\pi}}e^{-\frac{(x-\mu)^2}{2\sigma^2}} :: Densidad normal
      \perp\!\!\!\perp :: Independencia
      ⫫ :: Independiente (símbolo)
      \Pr(#?) :: Pr
      \chi^2 :: Ji cuadrado
    `),
    sub('Estadística', R`
      \bar{x} :: Media muestral
      \mu :: Media poblacional
      \tilde{x} :: Mediana
      \hat{#?} :: Estimador
      s^2 :: Varianza muestral
      \sigma^2 :: Varianza poblacional
      \bar{x}=\frac{1}{n}\sum_{i=1}^{n}x_i :: Fórmula de la media
      s=\sqrt{\frac{1}{n-1}\sum_{i=1}^{n}(x_i-\bar{x})^2} :: Desviación típica muestral
      \sigma=\sqrt{\frac{1}{N}\sum_{i=1}^{N}(x_i-\mu)^2} :: Desviación típica poblacional
      z=\frac{x-\mu}{\sigma} :: Puntuación z :: tipificar
      t=\frac{\bar{x}-\mu}{s/\sqrt{n}} :: Estadístico t
      \bar{x}\pm z_{\alpha/2}\frac{\sigma}{\sqrt{n}} :: Intervalo de confianza
      r=\frac{\sum(x_i-\bar{x})(y_i-\bar{y})}{\sqrt{\sum(x_i-\bar{x})^2\sum(y_i-\bar{y})^2}} :: Correlación de Pearson
      \hat{y}=\beta_0+\beta_1x :: Recta de regresión
      R^2 :: Coeficiente de determinación
      H_0 :: Hipótesis nula
      H_1 :: Hipótesis alternativa
      \alpha :: Nivel de significación
      p\text{-valor} :: p-valor
      \chi^2=\sum\frac{(O_i-E_i)^2}{E_i} :: Estadístico ji cuadrado
      Q_1 :: Primer cuartil
      Q_3 :: Tercer cuartil
      \operatorname{Mo} :: Moda
      \operatorname{Me} :: Mediana
      \operatorname{RIC} :: Rango intercuartílico
      n :: Tamaño de muestra
      \nu :: Grados de libertad
      \sum x_i :: Suma de datos
      f_i :: Frecuencia absoluta
      \varepsilon :: Error
    `)
  ])
];
