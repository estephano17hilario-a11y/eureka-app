import { R, cat, sub, mapList, type Cat, type Sym } from './catalog-core';
import { EL } from './unicode-data';

/* Tabla periódica completa: símbolo + nombre en español (el número atómico es la posición) */
const ELEMENTS = `H Hidrógeno
He Helio
Li Litio
Be Berilio
B Boro
C Carbono
N Nitrógeno
O Oxígeno
F Flúor
Ne Neón
Na Sodio
Mg Magnesio
Al Aluminio
Si Silicio
P Fósforo
S Azufre
Cl Cloro
Ar Argón
K Potasio
Ca Calcio
Sc Escandio
Ti Titanio
V Vanadio
Cr Cromo
Mn Manganeso
Fe Hierro
Co Cobalto
Ni Níquel
Cu Cobre
Zn Zinc
Ga Galio
Ge Germanio
As Arsénico
Se Selenio
Br Bromo
Kr Kriptón
Rb Rubidio
Sr Estroncio
Y Itrio
Zr Circonio
Nb Niobio
Mo Molibdeno
Tc Tecnecio
Ru Rutenio
Rh Rodio
Pd Paladio
Ag Plata
Cd Cadmio
In Indio
Sn Estaño
Sb Antimonio
Te Telurio
I Yodo
Xe Xenón
Cs Cesio
Ba Bario
La Lantano
Ce Cerio
Pr Praseodimio
Nd Neodimio
Pm Prometio
Sm Samario
Eu Europio
Gd Gadolinio
Tb Terbio
Dy Disprosio
Ho Holmio
Er Erbio
Tm Tulio
Yb Iterbio
Lu Lutecio
Hf Hafnio
Ta Tantalio
W Wolframio
Re Renio
Os Osmio
Ir Iridio
Pt Platino
Au Oro
Hg Mercurio
Tl Talio
Pb Plomo
Bi Bismuto
Po Polonio
At Astato
Rn Radón
Fr Francio
Ra Radio
Ac Actinio
Th Torio
Pa Protactinio
U Uranio
Np Neptunio
Pu Plutonio
Am Americio
Cm Curio
Bk Berkelio
Cf Californio
Es Einstenio
Fm Fermio
Md Mendelevio
No Nobelio
Lr Lawrencio
Rf Rutherfordio
Db Dubnio
Sg Seaborgio
Bh Bohrio
Hs Hasio
Mt Meitnerio
Ds Darmstatio
Rg Roentgenio
Cn Copernicio
Nh Nihonio
Fl Flerovio
Mc Moscovio
Lv Livermorio
Ts Teneso
Og Oganesón`;

const elementSyms = (): Sym[] =>
  mapList(ELEMENTS, (symbol, name, i) => {
    const [en, family] = EL[i].split('=');
    return {
      c: symbol,
      t: `\\ce{${symbol}}`,
      n: `${name} (Z=${i + 1})`,
      u: `${en} (${symbol}, Z=${i + 1})`,
      y: `Elemento químico · ${family}`,
      k: `elemento ${symbol} ${en} ${family} ${i + 1} tabla periodica`
    };
  });

const isotopeSyms = (): Sym[] =>
  mapList(ELEMENTS, (symbol, name, i) => {
    const [en] = EL[i].split('=');
    return {
      t: `\\ce{^{#?}_{${i + 1}}${symbol}}`,
      n: `Núclido de ${name.toLowerCase()}`,
      u: `Nuclide of ${en.toLowerCase()} (Z=${i + 1})`,
      y: 'Núclido (número másico editable)',
      k: `isotopo ${symbol} ${en} masa atomica nuclide`
    };
  }).slice(0, 103);

export const SCIENCE_CATS: Cat[] = [
  cat('phys', 'Física', '⚛️', [
    sub('Mecánica', R`
      \vec{F}=m\vec{a} :: Segunda ley de Newton
      v=\frac{\Delta x}{\Delta t} :: Velocidad media
      a=\frac{\Delta v}{\Delta t} :: Aceleración media
      v=v_0+at :: Velocidad en MRUA
      x=x_0+v_0t+\frac{1}{2}at^2 :: Posición en MRUA
      v^2=v_0^2+2a\Delta x :: Ecuación sin tiempo
      \vec{p}=m\vec{v} :: Cantidad de movimiento :: momento lineal
      \vec{F}=\frac{d\vec{p}}{dt} :: Fuerza como variación del momento
      \vec{J}=\vec{F}\Delta t=\Delta\vec{p} :: Impulso
      W=\vec{F}\cdot\vec{d}=Fd\cos\theta :: Trabajo
      E_c=\frac{1}{2}mv^2 :: Energía cinética
      E_p=mgh :: Energía potencial gravitatoria
      E_e=\frac{1}{2}kx^2 :: Energía potencial elástica
      P=\frac{W}{t} :: Potencia
      F=-kx :: Ley de Hooke
      F_r=\mu N :: Fuerza de rozamiento
      P=mg :: Peso
      F=G\frac{m_1m_2}{r^2} :: Gravitación universal
      a_c=\frac{v^2}{r} :: Aceleración centrípeta
      \omega=\frac{d\theta}{dt} :: Velocidad angular
      v=\omega r :: Velocidad lineal y angular
      \vec{\tau}=\vec{r}\times\vec{F} :: Momento de una fuerza :: torque
      \vec{L}=\vec{r}\times\vec{p} :: Momento angular
      \tau=I\alpha :: Dinámica de rotación
      I=\sum m_ir_i^2 :: Momento de inercia
      T=2\pi\sqrt{\frac{l}{g}} :: Periodo del péndulo
      T=2\pi\sqrt{\frac{m}{k}} :: Periodo del muelle
      v_e=\sqrt{\frac{2GM}{r}} :: Velocidad de escape
      T^2=\frac{4\pi^2}{GM}r^3 :: Tercera ley de Kepler
      \rho=\frac{m}{V} :: Densidad
      P=\frac{F}{A} :: Presión
      P=P_0+\rho gh :: Presión hidrostática
      E=\rho_fVg :: Empuje (Arquímedes)
      A_1v_1=A_2v_2 :: Ecuación de continuidad
      P+\frac{1}{2}\rho v^2+\rho gh=\text{cte} :: Ecuación de Bernoulli
      L=T-V :: Lagrangiano
      \frac{d}{dt}\frac{\partial L}{\partial\dot{q}}-\frac{\partial L}{\partial q}=0 :: Ecuaciones de Euler-Lagrange
    `),
    sub('Ondas y óptica', R`
      v=\lambda f :: Velocidad de una onda
      f=\frac{1}{T} :: Frecuencia
      \omega=2\pi f :: Frecuencia angular
      k=\frac{2\pi}{\lambda} :: Número de onda
      y(x,t)=A\sin(kx-\omega t+\varphi) :: Onda armónica
      x(t)=A\cos(\omega t+\varphi) :: Movimiento armónico simple
      \beta=10\log\frac{I}{I_0} :: Nivel de intensidad sonora
      f'=f\frac{v\pm v_o}{v\mp v_f} :: Efecto Doppler
      n=\frac{c}{v} :: Índice de refracción
      n_1\sin\theta_1=n_2\sin\theta_2 :: Ley de Snell
      \frac{1}{f}=\frac{1}{s}+\frac{1}{s'} :: Ecuación de las lentes
      M=-\frac{s'}{s} :: Aumento lateral
      P=\frac{1}{f} :: Potencia de una lente :: dioptrias
      d\sin\theta=m\lambda :: Interferencia / red de difracción
      \sin\theta_c=\frac{n_2}{n_1} :: Ángulo límite
      I=I_0\cos^2\theta :: Ley de Malus
    `),
    sub('Termodinámica', R`
      PV=nRT :: Gas ideal
      Q=mc\Delta T :: Calor sensible
      Q=mL :: Calor latente
      \Delta U=Q-W :: Primer principio
      W=P\Delta V :: Trabajo de expansión
      \eta=\frac{W}{Q_c}=1-\frac{Q_f}{Q_c} :: Rendimiento
      \eta_C=1-\frac{T_f}{T_c} :: Rendimiento de Carnot
      \Delta S=\frac{Q}{T} :: Variación de entropía
      \Delta S\ge0 :: Segundo principio
      S=k_B\ln\Omega :: Entropía de Boltzmann
      \frac{P_1V_1}{T_1}=\frac{P_2V_2}{T_2} :: Ley combinada de los gases
      \Delta L=\alpha L_0\Delta T :: Dilatación lineal
      E_c=\frac{3}{2}k_BT :: Energía cinética media
      \frac{Q}{t}=kA\frac{\Delta T}{d} :: Conducción (Fourier)
      P=\varepsilon\sigma AT^4 :: Ley de Stefan-Boltzmann
      \lambda_{\max}T=b :: Ley de Wien
      PV^{\gamma}=\text{cte} :: Proceso adiabático
      T(K)=T(^\circ\text{C})+273{,}15 :: Kelvin y Celsius
      H=U+PV :: Entalpía
      G=H-TS :: Energía libre de Gibbs
    `),
    sub('Electricidad y magnetismo', R`
      F=k\frac{q_1q_2}{r^2} :: Ley de Coulomb
      \vec{E}=\frac{\vec{F}}{q} :: Campo eléctrico
      E=k\frac{Q}{r^2} :: Campo de una carga puntual
      V=k\frac{Q}{r} :: Potencial eléctrico
      V=IR :: Ley de Ohm
      P=VI=I^2R :: Potencia eléctrica
      I=\frac{dQ}{dt} :: Intensidad de corriente
      R=\rho\frac{l}{A} :: Resistencia de un conductor
      R_s=R_1+R_2+\cdots :: Resistencias en serie
      \frac{1}{R_p}=\frac{1}{R_1}+\frac{1}{R_2}+\cdots :: Resistencias en paralelo
      C=\frac{Q}{V} :: Capacidad
      C=\varepsilon_0\frac{A}{d} :: Condensador plano
      U=\frac{1}{2}CV^2 :: Energía de un condensador
      \vec{F}=q\vec{v}\times\vec{B} :: Fuerza de Lorentz
      \vec{F}=q(\vec{E}+\vec{v}\times\vec{B}) :: Fuerza de Lorentz completa
      F=BIl\sin\theta :: Fuerza sobre un conductor
      B=\frac{\mu_0I}{2\pi r} :: Campo de un hilo
      B=\mu_0nI :: Campo de un solenoide
      \Phi_B=\vec{B}\cdot\vec{A} :: Flujo magnético
      \varepsilon=-\frac{d\Phi_B}{dt} :: Ley de Faraday-Lenz
      \varepsilon=-L\frac{dI}{dt} :: Autoinducción
      \frac{V_1}{V_2}=\frac{N_1}{N_2} :: Transformador
      X_L=\omega L :: Reactancia inductiva
      X_C=\frac{1}{\omega C} :: Reactancia capacitiva
      Z=\sqrt{R^2+(X_L-X_C)^2} :: Impedancia
      f_0=\frac{1}{2\pi\sqrt{LC}} :: Frecuencia de resonancia
      \oint\vec{E}\cdot d\vec{A}=\frac{Q}{\varepsilon_0} :: Ley de Gauss
      \oint\vec{B}\cdot d\vec{A}=0 :: Gauss para el magnetismo
      \oint\vec{E}\cdot d\vec{l}=-\frac{d\Phi_B}{dt} :: Faraday (integral)
      \oint\vec{B}\cdot d\vec{l}=\mu_0I+\mu_0\varepsilon_0\frac{d\Phi_E}{dt} :: Ampère-Maxwell
      \nabla\cdot\vec{E}=\frac{\rho}{\varepsilon_0} :: Maxwell: Gauss
      \nabla\cdot\vec{B}=0 :: Maxwell: sin monopolos
      \nabla\times\vec{E}=-\frac{\partial\vec{B}}{\partial t} :: Maxwell: Faraday
      \nabla\times\vec{B}=\mu_0\vec{J}+\mu_0\varepsilon_0\frac{\partial\vec{E}}{\partial t} :: Maxwell: Ampère
      c=\frac{1}{\sqrt{\mu_0\varepsilon_0}} :: Velocidad de la luz
      \vec{S}=\frac{1}{\mu_0}\vec{E}\times\vec{B} :: Vector de Poynting
    `),
    sub('Cuántica y notación de Dirac', R`
      |#?\rangle :: Ket
      \langle#?| :: Bra
      \langle#?|#?\rangle :: Bra-ket :: producto interno
      \langle#?|#?|#?\rangle :: Elemento de matriz
      |#?\rangle\langle#?| :: Proyector
      \langle#?\rangle :: Valor esperado
      \hat{H}|\psi\rangle=E|\psi\rangle :: Ecuación de autovalores
      i\hbar\frac{\partial}{\partial t}\Psi=\hat{H}\Psi :: Ecuación de Schrödinger
      -\frac{\hbar^2}{2m}\nabla^2\psi+V\psi=E\psi :: Schrödinger independiente del tiempo
      E=h\nu :: Energía del fotón
      E=\hbar\omega :: Energía (ħω)
      \lambda=\frac{h}{p} :: Longitud de onda de De Broglie
      \Delta x\,\Delta p\ge\frac{\hbar}{2} :: Principio de incertidumbre
      \Delta E\,\Delta t\ge\frac{\hbar}{2} :: Incertidumbre energía-tiempo
      [\hat{x},\hat{p}]=i\hbar :: Conmutador posición-momento
      [#?,#?] :: Conmutador
      \{#?,#?\} :: Anticonmutador
      \hat{p}=-i\hbar\nabla :: Operador momento
      E_n=-\frac{13{,}6\ \text{eV}}{n^2} :: Niveles del hidrógeno
      E_n=\left(n+\frac{1}{2}\right)\hbar\omega :: Oscilador armónico cuántico
      hf=\phi+E_{c,\max} :: Efecto fotoeléctrico
      \frac{1}{\lambda}=R_H\left(\frac{1}{n_1^2}-\frac{1}{n_2^2}\right) :: Fórmula de Rydberg
      |\psi|^2 :: Densidad de probabilidad
      \int|\psi|^2\,dV=1 :: Normalización
      \hat{a}^{\dagger} :: Operador de creación
      \hat{a} :: Operador de aniquilación
      \otimes :: Producto tensorial
      |\uparrow\rangle :: Espín arriba
      |\downarrow\rangle :: Espín abajo
      |0\rangle :: Estado base / qubit 0
      |1\rangle :: Qubit 1
      \frac{1}{\sqrt{2}}(|0\rangle+|1\rangle) :: Superposición
      \sigma_x,\sigma_y,\sigma_z :: Matrices de Pauli
      \operatorname{Tr}(\rho\hat{A}) :: Traza con matriz densidad
    `),
    sub('Relatividad y nuclear', R`
      E=mc^2 :: Equivalencia masa-energía
      E^2=(pc)^2+(mc^2)^2 :: Energía relativista
      \gamma=\frac{1}{\sqrt{1-\frac{v^2}{c^2}}} :: Factor de Lorentz
      \Delta t=\gamma\Delta t_0 :: Dilatación del tiempo
      L=\frac{L_0}{\gamma} :: Contracción de la longitud
      p=\gamma mv :: Momento relativista
      ds^2=-c^2dt^2+dx^2+dy^2+dz^2 :: Intervalo espacio-temporal
      G_{\mu\nu}+\Lambda g_{\mu\nu}=\frac{8\pi G}{c^4}T_{\mu\nu} :: Ecuaciones de Einstein
      r_s=\frac{2GM}{c^2} :: Radio de Schwarzschild
      N=N_0e^{-\lambda t} :: Desintegración radiactiva
      t_{1/2}=\frac{\ln2}{\lambda} :: Periodo de semidesintegración
      A=\lambda N :: Actividad
      \Delta m=Zm_p+(A-Z)m_n-M :: Defecto de masa
      E_b=\Delta m\,c^2 :: Energía de enlace
      \ce{^{A}_{Z}X} :: Núclido genérico
      \ce{^{A}_{Z}X -> ^{A-4}_{Z-2}Y + ^{4}_{2}He} :: Desintegración alfa
      \ce{^{A}_{Z}X -> ^{A}_{Z+1}Y + e^- + \bar{\nu}_e} :: Desintegración beta menos
      \ce{^{A}_{Z}X -> ^{A}_{Z-1}Y + e^+ + \nu_e} :: Desintegración beta más
      \ce{^{235}_{92}U + ^{1}_{0}n -> ^{141}_{56}Ba + ^{92}_{36}Kr + 3^{1}_{0}n} :: Fisión del uranio
      \ce{^{2}_{1}H + ^{3}_{1}H -> ^{4}_{2}He + ^{1}_{0}n} :: Fusión D-T
    `),
    sub('Partículas', R`
      e^{-} :: Electrón
      e^{+} :: Positrón
      p^{+} :: Protón
      \bar{p} :: Antiprotón
      n^{0} :: Neutrón
      \gamma :: Fotón
      \nu_e :: Neutrino electrónico
      \bar{\nu}_e :: Antineutrino
      \nu_\mu :: Neutrino muónico
      \nu_\tau :: Neutrino tauónico
      \mu^{-} :: Muon
      \tau^{-} :: Tau
      \pi^{+} :: Pion positivo
      \pi^{0} :: Pion neutro
      K^{+} :: Kaón
      W^{\pm} :: Bosón W
      Z^{0} :: Bosón Z
      H^{0} :: Bosón de Higgs
      g :: Gluon
      u :: Quark arriba
      d :: Quark abajo
      s :: Quark extraño
      c :: Quark encanto
      b :: Quark fondo
      t :: Quark cima
      \alpha :: Partícula alfa
      \beta^{-} :: Partícula beta
      \Lambda^{0} :: Barión lambda
      \Sigma^{+} :: Barión sigma
      \Omega^{-} :: Barión omega
    `),
    sub('Constantes', R`
      c=3{,}00\times10^{8}\ \text{m/s} :: Velocidad de la luz
      h=6{,}626\times10^{-34}\ \text{J·s} :: Constante de Planck
      \hbar=\frac{h}{2\pi} :: Planck reducida
      G=6{,}674\times10^{-11}\ \text{N·m}^2/\text{kg}^2 :: Constante de gravitación
      g=9{,}81\ \text{m/s}^2 :: Gravedad terrestre
      k_B=1{,}381\times10^{-23}\ \text{J/K} :: Constante de Boltzmann
      N_A=6{,}022\times10^{23}\ \text{mol}^{-1} :: Número de Avogadro
      R=8{,}314\ \text{J/(mol·K)} :: Constante de los gases
      e=1{,}602\times10^{-19}\ \text{C} :: Carga elemental
      \varepsilon_0=8{,}854\times10^{-12}\ \text{F/m} :: Permitividad del vacío
      \mu_0=4\pi\times10^{-7}\ \text{T·m/A} :: Permeabilidad del vacío
      k=8{,}99\times10^{9}\ \text{N·m}^2/\text{C}^2 :: Constante de Coulomb
      m_e=9{,}109\times10^{-31}\ \text{kg} :: Masa del electrón
      m_p=1{,}673\times10^{-27}\ \text{kg} :: Masa del protón
      m_n=1{,}675\times10^{-27}\ \text{kg} :: Masa del neutrón
      \sigma=5{,}670\times10^{-8}\ \text{W/(m}^2\text{K}^4) :: Stefan-Boltzmann
      R_H=1{,}097\times10^{7}\ \text{m}^{-1} :: Constante de Rydberg
      u=1{,}661\times10^{-27}\ \text{kg} :: Unidad de masa atómica
      F=96485\ \text{C/mol} :: Constante de Faraday
      a_0=5{,}29\times10^{-11}\ \text{m} :: Radio de Bohr
      \alpha\approx\frac{1}{137} :: Constante de estructura fina
      1\ \text{eV}=1{,}602\times10^{-19}\ \text{J} :: Electronvoltio
      1\ \text{atm}=101325\ \text{Pa} :: Atmósfera
    `),
    sub('Unidades', R`
      \text{m} :: metro :: longitud
      \text{kg} :: kilogramo :: masa
      \text{s} :: segundo :: tiempo
      \text{A} :: amperio :: corriente
      \text{K} :: kelvin :: temperatura
      \text{mol} :: mol :: cantidad de sustancia
      \text{cd} :: candela :: intensidad luminosa
      \text{N} :: newton :: fuerza
      \text{J} :: julio :: energia joule
      \text{W} :: vatio :: potencia watt
      \text{Pa} :: pascal :: presion
      \text{Hz} :: hercio :: frecuencia hertz
      \text{C} :: culombio :: carga coulomb
      \text{V} :: voltio :: tension
      Ω ~ \Omega :: ohmio :: resistencia
      \text{F} :: faradio :: capacidad
      \text{T} :: tesla :: campo magnetico
      \text{Wb} :: weber :: flujo magnetico
      \text{H} :: henrio :: inductancia
      \text{S} :: siemens :: conductancia
      \text{lm} :: lumen
      \text{lx} :: lux
      \text{Bq} :: becquerel
      \text{Gy} :: gray
      \text{Sv} :: sievert
      \text{rad} :: radián
      \text{sr} :: estereorradián
      ℃ ~ ^\circ\text{C} :: grado Celsius
      ℉ ~ ^\circ\text{F} :: grado Fahrenheit
      Å ~ \text{\AA} :: ángstrom
      \text{eV} :: electronvoltio
      \text{L} :: litro
      \text{atm} :: atmósfera
      \text{bar} :: bar
      \text{mmHg} :: milímetro de mercurio
      \text{cal} :: caloría
      \text{kWh} :: kilovatio hora
      \text{dB} :: decibelio
      \text{u} :: unidad de masa atómica
      \text{m/s} :: metro por segundo
      \text{m/s}^2 :: metro por segundo al cuadrado
      \text{km/h} :: kilómetro por hora
      \text{kg/m}^3 :: kilogramo por metro cúbico
      \text{N·m} :: newton metro
      \text{J/(kg·K)} :: calor específico (unidad)
      \text{mol/L} :: molaridad (unidad)
      μ ~ \mu :: micro (prefijo)
      @ ㎜ ㎝ ㎞ ㎡ ㎥ ㎏ ㎎ ㎍ ㎖ ㎗ ㎐ ㎑ ㎒ ㎓ ㎩ ㎪ ㎫ ㎂ ㎃ ㎄ ㎶ ㎷ ㎸ ㎽ ㎾ ㎿ ㏀ ㏁ ㏄ ㏈ ㎧ ㎨ ㎭ ㏖ ㏗ ㎈ ㎉
    `)
  ]),

  cat('chem', 'Química', '🧪', [
    sub('Escribir química (mhchem)', R`
      \ce{#?} :: Fórmula química libre :: mhchem
      \ce{#? -> #?} :: Reacción
      \ce{#? + #? -> #?} :: Reacción con dos reactivos
      \ce{#? + #? -> #? + #?} :: Reacción completa
      \ce{#? <=> #?} :: Equilibrio
      \ce{#? ->[#?] #?} :: Reacción con catalizador
      \ce{#? ->[#?][#?] #?} :: Reacción con condiciones arriba y abajo
      \ce{#?^{#?}} :: Ion con carga
      \ce{^{#?}_{#?}#?} :: Núclido (A, Z)
      \ce{#?(s)} :: Estado sólido
      \ce{#?(l)} :: Estado líquido
      \ce{#?(g)} :: Estado gaseoso
      \ce{#?(aq)} :: Disolución acuosa
      \ce{#? v} :: Precipitado ↓
      \ce{#? ^} :: Desprendimiento de gas ↑
      \ce{#? . #?H2O} :: Hidrato
      [\ce{#?}] :: Concentración molar
    `),
    sub('Flechas y enlaces', R`
      \ce{->} :: Flecha de reacción
      \ce{<-} :: Flecha inversa
      \ce{<->} :: Resonancia
      \ce{<=>} :: Equilibrio
      \ce{<=>>} :: Equilibrio desplazado a la derecha
      \ce{<<=>} :: Equilibrio desplazado a la izquierda
      \ce{<-->} :: Doble flecha
      \ce{->[\Delta]} :: Calentar
      \ce{->[h\nu]} :: Luz
      \ce{->[H2O]} :: En agua
      \ce{->[\text{cat.}]} :: Catalizador
      \ce{->[T][P]} :: Temperatura y presión
      \ce{A-B} :: Enlace simple
      \ce{A=B} :: Enlace doble
      \ce{A#B} :: Enlace triple
      \ce{A\bond{~}B} :: Enlace de resonancia
      \ce{A\bond{...}B} :: Enlace de hidrógeno
      \ce{A\bond{->}B} :: Enlace dativo
      \ce{A\bond{~-}B} :: Enlace parcial doble
      ⇌ ~ \rightleftharpoons :: Equilibrio (símbolo)
      ⇄ :: Reversible (símbolo)
      ↑ :: Gas (símbolo)
      ↓ :: Precipitado (símbolo)
      Δ ~ \Delta :: Calor
    `),
    sub('Elementos (tabla periódica)', elementSyms()),
    sub('Núclidos e isótopos', [
      ...R`
        \ce{^{1}_{1}H} :: Protio
        \ce{^{2}_{1}H} :: Deuterio
        \ce{^{3}_{1}H} :: Tritio
        \ce{^{4}_{2}He} :: Helio-4 :: alfa
        \ce{^{12}_{6}C} :: Carbono-12
        \ce{^{13}_{6}C} :: Carbono-13
        \ce{^{14}_{6}C} :: Carbono-14 :: datacion
        \ce{^{14}_{7}N} :: Nitrógeno-14
        \ce{^{16}_{8}O} :: Oxígeno-16
        \ce{^{18}_{8}O} :: Oxígeno-18
        \ce{^{40}_{19}K} :: Potasio-40
        \ce{^{60}_{27}Co} :: Cobalto-60
        \ce{^{90}_{38}Sr} :: Estroncio-90
        \ce{^{99m}_{43}Tc} :: Tecnecio-99m
        \ce{^{131}_{53}I} :: Yodo-131
        \ce{^{133}_{55}Cs} :: Cesio-133
        \ce{^{137}_{55}Cs} :: Cesio-137
        \ce{^{222}_{86}Rn} :: Radón-222
        \ce{^{226}_{88}Ra} :: Radio-226
        \ce{^{235}_{92}U} :: Uranio-235
        \ce{^{238}_{92}U} :: Uranio-238
        \ce{^{239}_{94}Pu} :: Plutonio-239
        \ce{^{1}_{0}n} :: Neutrón
        \ce{^{1}_{1}p} :: Protón
        \ce{^{0}_{-1}e} :: Electrón (beta)
        \ce{^{0}_{+1}e} :: Positrón
      `,
      ...isotopeSyms()
    ]),
    sub('Iones', R`
      \ce{H+} :: Protón / hidrón
      \ce{H3O+} :: Hidronio :: oxonio
      \ce{OH-} :: Hidróxido
      \ce{Na+} :: Sodio
      \ce{K+} :: Potasio
      \ce{Li+} :: Litio
      \ce{Ag+} :: Plata
      \ce{NH4+} :: Amonio
      \ce{Ca^2+} :: Calcio
      \ce{Mg^2+} :: Magnesio
      \ce{Ba^2+} :: Bario
      \ce{Zn^2+} :: Zinc
      \ce{Cu+} :: Cobre(I)
      \ce{Cu^2+} :: Cobre(II)
      \ce{Fe^2+} :: Hierro(II) :: ferroso
      \ce{Fe^3+} :: Hierro(III) :: ferrico
      \ce{Al^3+} :: Aluminio
      \ce{Pb^2+} :: Plomo(II)
      \ce{Hg^2+} :: Mercurio(II)
      \ce{Hg2^2+} :: Mercurio(I)
      \ce{Sn^2+} :: Estaño(II)
      \ce{Mn^2+} :: Manganeso(II)
      \ce{Cr^3+} :: Cromo(III)
      \ce{Co^2+} :: Cobalto(II)
      \ce{Ni^2+} :: Níquel(II)
      \ce{F-} :: Fluoruro
      \ce{Cl-} :: Cloruro
      \ce{Br-} :: Bromuro
      \ce{I-} :: Yoduro
      \ce{O^2-} :: Óxido
      \ce{S^2-} :: Sulfuro
      \ce{N^3-} :: Nitruro
      \ce{H-} :: Hidruro
      \ce{O2^2-} :: Peróxido
      \ce{CN-} :: Cianuro
      \ce{SCN-} :: Tiocianato
      \ce{NO3-} :: Nitrato
      \ce{NO2-} :: Nitrito
      \ce{SO4^2-} :: Sulfato
      \ce{SO3^2-} :: Sulfito
      \ce{HSO4-} :: Hidrogenosulfato :: bisulfato
      \ce{CO3^2-} :: Carbonato
      \ce{HCO3-} :: Hidrogenocarbonato :: bicarbonato
      \ce{PO4^3-} :: Fosfato
      \ce{HPO4^2-} :: Hidrogenofosfato
      \ce{H2PO4-} :: Dihidrogenofosfato
      \ce{ClO-} :: Hipoclorito
      \ce{ClO2-} :: Clorito
      \ce{ClO3-} :: Clorato
      \ce{ClO4-} :: Perclorato
      \ce{MnO4-} :: Permanganato
      \ce{CrO4^2-} :: Cromato
      \ce{Cr2O7^2-} :: Dicromato
      \ce{CH3COO-} :: Acetato :: etanoato
      \ce{C2O4^2-} :: Oxalato
      \ce{S2O3^2-} :: Tiosulfato
      \ce{SiO3^2-} :: Silicato
      \ce{BO3^3-} :: Borato
      \ce{AlO2-} :: Aluminato
      \ce{[Fe(CN)6]^4-} :: Hexacianoferrato(II)
      \ce{[Cu(NH3)4]^2+} :: Tetraamincobre(II)
      \ce{[Ag(NH3)2]+} :: Diaminplata
      \ce{e-} :: Electrón
    `),
    sub('Compuestos inorgánicos', R`
      \ce{H2O} :: Agua
      \ce{H2O2} :: Agua oxigenada :: peroxido
      \ce{O2} :: Oxígeno molecular
      \ce{O3} :: Ozono
      \ce{H2} :: Hidrógeno molecular
      \ce{N2} :: Nitrógeno molecular
      \ce{Cl2} :: Cloro molecular
      \ce{CO2} :: Dióxido de carbono
      \ce{CO} :: Monóxido de carbono
      \ce{NH3} :: Amoniaco
      \ce{CH4} :: Metano
      \ce{NaCl} :: Cloruro de sodio :: sal
      \ce{HCl} :: Ácido clorhídrico
      \ce{HF} :: Ácido fluorhídrico
      \ce{HBr} :: Ácido bromhídrico
      \ce{H2SO4} :: Ácido sulfúrico
      \ce{HNO3} :: Ácido nítrico
      \ce{H3PO4} :: Ácido fosfórico
      \ce{H2CO3} :: Ácido carbónico
      \ce{HClO4} :: Ácido perclórico
      \ce{H2S} :: Sulfuro de hidrógeno
      \ce{HCN} :: Cianuro de hidrógeno
      \ce{NaOH} :: Hidróxido de sodio :: sosa
      \ce{KOH} :: Hidróxido de potasio :: potasa
      \ce{Ca(OH)2} :: Hidróxido de calcio :: cal apagada
      \ce{Mg(OH)2} :: Hidróxido de magnesio
      \ce{Al(OH)3} :: Hidróxido de aluminio
      \ce{CaCO3} :: Carbonato de calcio :: caliza
      \ce{NaHCO3} :: Bicarbonato de sodio
      \ce{Na2CO3} :: Carbonato de sodio
      \ce{CaO} :: Óxido de calcio :: cal viva
      \ce{Fe2O3} :: Óxido de hierro(III)
      \ce{Fe3O4} :: Magnetita
      \ce{Al2O3} :: Alúmina
      \ce{SiO2} :: Dióxido de silicio :: silice cuarzo
      \ce{SO2} :: Dióxido de azufre
      \ce{SO3} :: Trióxido de azufre
      \ce{NO} :: Monóxido de nitrógeno
      \ce{NO2} :: Dióxido de nitrógeno
      \ce{N2O} :: Óxido nitroso
      \ce{N2O4} :: Tetraóxido de dinitrógeno
      \ce{P4O10} :: Pentóxido de fósforo
      \ce{KMnO4} :: Permanganato de potasio
      \ce{K2Cr2O7} :: Dicromato de potasio
      \ce{AgNO3} :: Nitrato de plata
      \ce{CuSO4} :: Sulfato de cobre(II)
      \ce{CuSO4.5H2O} :: Sulfato de cobre pentahidratado
      \ce{NH4Cl} :: Cloruro de amonio
      \ce{NH4NO3} :: Nitrato de amonio
      \ce{KNO3} :: Nitrato de potasio
      \ce{CaSO4} :: Sulfato de calcio :: yeso
      \ce{BaSO4} :: Sulfato de bario
      \ce{AgCl} :: Cloruro de plata
      \ce{NaClO} :: Hipoclorito de sodio :: lejia
      \ce{CaCl2} :: Cloruro de calcio
      \ce{MgO} :: Óxido de magnesio
      \ce{ZnO} :: Óxido de zinc
      \ce{TiO2} :: Dióxido de titanio
    `),
    sub('Orgánica y bioquímica', R`
      \ce{CH4} :: Metano
      \ce{C2H6} :: Etano
      \ce{C3H8} :: Propano
      \ce{C4H10} :: Butano
      \ce{C2H4} :: Eteno :: etileno
      \ce{C2H2} :: Etino :: acetileno
      \ce{C6H6} :: Benceno
      \ce{CH3OH} :: Metanol
      \ce{C2H5OH} :: Etanol
      \ce{CH3COOH} :: Ácido acético :: etanoico
      \ce{HCOOH} :: Ácido fórmico :: metanoico
      \ce{CH3CHO} :: Etanal :: acetaldehido
      \ce{HCHO} :: Metanal :: formaldehido
      \ce{CH3COCH3} :: Propanona :: acetona
      \ce{CH3COOCH2CH3} :: Acetato de etilo
      \ce{CH3NH2} :: Metilamina
      \ce{CH3CONH2} :: Acetamida
      \ce{C6H5OH} :: Fenol
      \ce{C6H5CH3} :: Tolueno
      \ce{CHCl3} :: Cloroformo
      \ce{CCl4} :: Tetracloruro de carbono
      \ce{C6H12O6} :: Glucosa
      \ce{C12H22O11} :: Sacarosa
      \ce{(C6H10O5)_n} :: Almidón / celulosa
      \ce{CO(NH2)2} :: Urea
      \ce{C3H8O3} :: Glicerol
      \ce{C10H16N5O13P3} :: ATP
      \ce{R-OH} :: Alcohol (grupo)
      \ce{R-CHO} :: Aldehído (grupo)
      \ce{R-CO-R'} :: Cetona (grupo)
      \ce{R-COOH} :: Ácido carboxílico (grupo)
      \ce{R-COO-R'} :: Éster (grupo)
      \ce{R-O-R'} :: Éter (grupo)
      \ce{R-NH2} :: Amina (grupo)
      \ce{R-CONH2} :: Amida (grupo)
      \ce{R-X} :: Haluro de alquilo
      \ce{R-SH} :: Tiol
      \ce{R-C#N} :: Nitrilo
      \ce{-CH3} :: Metilo
      \ce{-CH2-} :: Metileno
      \ce{-C6H5} :: Fenilo
      \ce{C_nH_{2n+2}} :: Alcanos (fórmula general)
      \ce{C_nH_{2n}} :: Alquenos (fórmula general)
      \ce{C_nH_{2n-2}} :: Alquinos (fórmula general)
      ⌬ :: Anillo de benceno
      ⏣ :: Benceno con círculo
      α ~ \alpha :: Posición alfa
      β ~ \beta :: Posición beta
      (R) :: Configuración R
      (S) :: Configuración S
      \textit{cis} :: cis
      \textit{trans} :: trans
      \textit{o}\text{-} :: orto
      \textit{m}\text{-} :: meta
      \textit{p}\text{-} :: para
      (+) :: Dextrógiro
      (-) :: Levógiro
    `),
    sub('Reacciones típicas', R`
      \ce{2H2 + O2 -> 2H2O} :: Formación del agua
      \ce{CH4 + 2O2 -> CO2 + 2H2O} :: Combustión del metano
      \ce{C3H8 + 5O2 -> 3CO2 + 4H2O} :: Combustión del propano
      \ce{6CO2 + 6H2O ->[h\nu] C6H12O6 + 6O2} :: Fotosíntesis
      \ce{C6H12O6 + 6O2 -> 6CO2 + 6H2O} :: Respiración celular
      \ce{HCl + NaOH -> NaCl + H2O} :: Neutralización
      \ce{N2 + 3H2 <=> 2NH3} :: Síntesis de Haber
      \ce{2SO2 + O2 <=> 2SO3} :: Proceso de contacto
      \ce{CaCO3 ->[\Delta] CaO + CO2} :: Descomposición de la caliza
      \ce{Zn + 2HCl -> ZnCl2 + H2 ^} :: Metal con ácido
      \ce{AgNO3 + NaCl -> AgCl v + NaNO3} :: Precipitación
      \ce{2Na + 2H2O -> 2NaOH + H2 ^} :: Sodio con agua
      \ce{Fe2O3 + 3CO -> 2Fe + 3CO2} :: Alto horno
      \ce{4Fe + 3O2 -> 2Fe2O3} :: Oxidación del hierro
      \ce{2H2O2 -> 2H2O + O2} :: Descomposición del peróxido
      \ce{2H2O -> 2H2 + O2} :: Electrólisis del agua
      \ce{CH3COOH + C2H5OH <=> CH3COOC2H5 + H2O} :: Esterificación
      \ce{C2H4 + H2 ->[Ni] C2H6} :: Hidrogenación
      \ce{C6H12O6 -> 2C2H5OH + 2CO2} :: Fermentación alcohólica
      \ce{H2O <=> H+ + OH-} :: Autoionización del agua
      \ce{CO2 + H2O <=> H2CO3} :: Ácido carbónico
      \ce{Zn + Cu^2+ -> Zn^2+ + Cu} :: Pila Daniell
      \ce{MnO4- + 8H+ + 5e- -> Mn^2+ + 4H2O} :: Semirreacción del permanganato
      \ce{2H+ + 2e- -> H2} :: Electrodo de hidrógeno
    `),
    sub('Magnitudes y fórmulas', R`
      n=\frac{m}{M} :: Moles
      M=\frac{n}{V} :: Molaridad
      m=\frac{n_{soluto}}{kg_{disolvente}} :: Molalidad
      \chi_i=\frac{n_i}{n_T} :: Fracción molar
      \%\,m/m=\frac{m_{soluto}}{m_{disolución}}\cdot100 :: Porcentaje en masa
      C_1V_1=C_2V_2 :: Dilución
      PV=nRT :: Gases ideales
      P_T=\sum P_i :: Ley de Dalton
      pH=-\log[\ce{H+}] :: pH
      pOH=-\log[\ce{OH-}] :: pOH
      pH+pOH=14 :: Relación pH y pOH
      K_w=[\ce{H+}][\ce{OH-}]=10^{-14} :: Producto iónico del agua
      K_a=\frac{[\ce{H+}][\ce{A-}]}{[\ce{HA}]} :: Constante de acidez
      pK_a=-\log K_a :: pKa
      pH=pK_a+\log\frac{[\ce{A-}]}{[\ce{HA}]} :: Henderson-Hasselbalch
      K_c=\frac{[C]^c[D]^d}{[A]^a[B]^b} :: Constante de equilibrio
      K_p=K_c(RT)^{\Delta n} :: Relación Kp y Kc
      K_{ps} :: Producto de solubilidad
      Q :: Cociente de reacción
      \Delta H :: Variación de entalpía
      \Delta H^\circ_f :: Entalpía de formación estándar
      \Delta S :: Variación de entropía
      \Delta G=\Delta H-T\Delta S :: Energía libre de Gibbs
      \Delta G^\circ=-RT\ln K :: Gibbs y equilibrio
      \Delta G^\circ=-nFE^\circ :: Gibbs y potencial
      E=E^\circ-\frac{RT}{nF}\ln Q :: Ecuación de Nernst
      E^\circ_{pila}=E^\circ_{cátodo}-E^\circ_{ánodo} :: Potencial de la pila
      v=k[A]^m[B]^n :: Ley de velocidad
      k=Ae^{-\frac{E_a}{RT}} :: Ecuación de Arrhenius
      t_{1/2}=\frac{\ln2}{k} :: Vida media (orden 1)
      \Delta T_e=K_e\,m :: Ascenso ebulloscópico
      \Delta T_c=K_c\,m :: Descenso crioscópico
      \pi=MRT :: Presión osmótica
      A=\varepsilon lc :: Ley de Lambert-Beer
      \Delta H=\sum\Delta H_f(\text{prod})-\sum\Delta H_f(\text{react}) :: Ley de Hess
      q=mc_e\Delta T :: Calorimetría
      \text{Rendimiento}=\frac{m_{real}}{m_{teórica}}\cdot100 :: Rendimiento
      E_a :: Energía de activación
      \ce{1s^2 2s^2 2p^6} :: Configuración electrónica
      [\ce{Ne}]\,3s^2\,3p^5 :: Configuración abreviada
      \delta^{+} :: Carga parcial positiva
      \delta^{-} :: Carga parcial negativa
      \ddagger :: Estado de transición
      ‡ :: Estado de transición (símbolo)
      • ~ \bullet :: Radical libre / electrón desapareado
      \uparrow\downarrow :: Par de electrones (orbital)
      sp^3 :: Hibridación sp³
      sp^2 :: Hibridación sp²
      \sigma :: Enlace sigma
      \pi :: Enlace pi
    `),
    sub('Alquimia y laboratorio', R`
      @ 🜀 🜁 🜂 🜃 🜄 🜅 🜆 🜇 🜈 🜉 🜊 🜋 🜌 🜍 🜎 🜏 🜐 🜑 🜒 🜓 🜔 🜕 🜖 🜗 🜘 🜙 🜚 🜛 🜜 🜝 🜞 🜟 🜠 🜡 🜢 🜣 🜤 🜥 🜦 🜧 🜨 🜩 🜪 🜫 🜬 🜭 🜮 🜯
      ⚗ :: Alambique
      🧪 :: Tubo de ensayo
      ⚛ :: Átomo
      ☢ :: Radiactivo
      ☣ :: Riesgo biológico
      ☠ :: Tóxico
      ⚠ :: Peligro
      🔥 :: Inflamable
      ♻ :: Reciclaje
      ⚡ :: Alta tensión
    `)
  ]),

  cat('bio', 'Biología y medicina', '🧬', [
    sub('Genética', R`
      ♀ :: Hembra :: femenino mujer venus
      ♂ :: Macho :: masculino hombre marte
      ⚥ :: Intersexual / hermafrodita
      ⚧ :: Transgénero
      ⚲ :: Neutro
      ⚢ :: Dos hembras
      ⚣ :: Dos machos
      ⚤ :: Hembra y macho
      × :: Cruce :: cruzamiento
      P :: Generación parental
      F_1 :: Primera generación filial
      F_2 :: Segunda generación filial
      AA :: Homocigoto dominante
      Aa :: Heterocigoto
      aa :: Homocigoto recesivo
      X^{A}X^{a} :: Portadora (ligado al X)
      X^{a}Y :: Varón afectado (ligado al X)
      I^{A}I^{B} :: Grupo sanguíneo AB
      I^{A}i :: Grupo A heterocigoto
      ii :: Grupo sanguíneo 0
      Rh^{+} :: Rh positivo
      Rh^{-} :: Rh negativo
      2n :: Diploide
      n :: Haploide
      3n :: Triploide
      2n=46 :: Cariotipo humano
      46,XX :: Cariotipo femenino
      46,XY :: Cariotipo masculino
      47,XX,+21 :: Trisomía 21
      p^2+2pq+q^2=1 :: Equilibrio de Hardy-Weinberg
      p+q=1 :: Frecuencias alélicas
      9:3:3:1 :: Proporción dihíbrida
      3:1 :: Proporción monohíbrida
      1:2:1 :: Proporción genotípica
      □ :: Varón (genealogía) :: pedigree
      ○ :: Mujer (genealogía)
      ■ :: Varón afectado
      ● :: Mujer afectada
      ◇ :: Sexo desconocido
      ◐ :: Portador/a
      ⚭ :: Matrimonio :: union
      ⚮ :: Divorcio
      ⚯ :: Pareja no casada
      † :: Fallecido
      \begin{array}{c|cc} & A & a\\\hline A & AA & Aa\\ a & Aa & aa\end{array} :: Cuadro de Punnett
    `),
    sub('Molecular y bioquímica', R`
      5'\to3' :: Sentido 5′→3′
      3'\to5' :: Sentido 3′→5′
      A=T :: Par adenina-timina
      G\equiv C :: Par guanina-citosina
      A=U :: Par adenina-uracilo
      \text{ADN}\to\text{ARN}\to\text{proteína} :: Dogma central
      \text{ARNm} :: ARN mensajero
      \text{ARNt} :: ARN de transferencia
      \text{ARNr} :: ARN ribosómico
      \ce{ATP -> ADP + P_i} :: Hidrólisis del ATP
      \ce{NAD+ + 2e- + H+ -> NADH} :: Reducción del NAD
      \ce{NADP+} :: NADP+
      \ce{FADH2} :: FADH₂
      \ce{CoA-SH} :: Coenzima A
      \ce{6CO2 + 6H2O ->[luz] C6H12O6 + 6O2} :: Fotosíntesis
      \ce{C6H12O6 + 6O2 -> 6CO2 + 6H2O + ATP} :: Respiración aerobia
      \ce{C6H12O6 -> 2C3H6O3} :: Fermentación láctica
      v=\frac{V_{max}[S]}{K_m+[S]} :: Michaelis-Menten
      K_m :: Constante de Michaelis
      V_{max} :: Velocidad máxima
      \ce{-NH2} :: Grupo amino
      \ce{-COOH} :: Grupo carboxilo
      \ce{-PO4^3-} :: Grupo fosfato
      \ce{H3N+-CHR-COO-} :: Aminoácido (zwitterión)
      \alpha\text{-hélice} :: Hélice alfa
      \beta\text{-lámina} :: Lámina beta
      \Delta G<0 :: Reacción exergónica
      pH=7{,}4 :: pH fisiológico
      \ce{Na+}/\ce{K+} :: Bomba sodio-potasio
      \ce{Ca^2+} :: Calcio (señalización)
      E=\frac{RT}{zF}\ln\frac{[ion]_{ext}}{[ion]_{int}} :: Potencial de Nernst
      \Psi=\Psi_s+\Psi_p :: Potencial hídrico
      🧬 :: ADN
      🦠 :: Microbio
      🧫 :: Placa de Petri
      🔬 :: Microscopio
    `),
    sub('Ecología y evolución', R`
      \frac{dN}{dt}=rN :: Crecimiento exponencial
      \frac{dN}{dt}=rN\left(1-\frac{N}{K}\right) :: Crecimiento logístico
      N_t=N_0e^{rt} :: Tamaño poblacional
      K :: Capacidad de carga
      r :: Tasa intrínseca de crecimiento
      H'=-\sum p_i\ln p_i :: Índice de Shannon
      D=1-\sum p_i^2 :: Índice de Simpson
      \Delta p :: Cambio en la frecuencia alélica
      w :: Eficacia biológica :: fitness
      s :: Coeficiente de selección
      N_e :: Tamaño efectivo de la población
      \text{PPN}=\text{PPB}-R :: Producción primaria neta
      10\% :: Regla del diez por ciento
      \textit{Homo sapiens} :: Nombre científico (cursiva)
      \textit{sp.} :: Especie no determinada
      \textit{spp.} :: Varias especies
      † :: Extinto
      ♁ :: Tierra
      🌱 :: Productor
      🍃 :: Hoja
      🌿 :: Planta
      🐾 :: Fauna
      🦴 :: Fósil
      ↔ :: Mutualismo / interacción
      ☘ :: Trébol
      ⚘ :: Flor
      ❀ :: Flor (fórmula floral)
      ⚥ :: Flor hermafrodita
      ⊕ :: Simetría actinomorfa
      ↓ :: Simetría zigomorfa
      K_{(5)}C_{(5)}A_5G_{(2)} :: Fórmula floral
    `),
    sub('Medicina y farmacia', R`
      ℞ :: Receta :: prescripcion rx
      ⚕ :: Vara de Esculapio :: medicina
      ☤ :: Caduceo
      ⚚ :: Vara de Hermes
      ✚ :: Cruz médica
      ♿ :: Accesibilidad
      ℥ :: Onza (apotecario)
      ℈ :: Escrúpulo
      ʒ :: Dracma
      ♡ :: Corazón
      🫀 :: Corazón anatómico
      🫁 :: Pulmones
      🧠 :: Cerebro
      🦷 :: Diente
      🦴 :: Hueso
      👁 :: Ojo
      🩸 :: Sangre
      💊 :: Fármaco
      💉 :: Inyección
      🩺 :: Estetoscopio
      🌡 :: Termómetro
      ↑ :: Aumentado
      ↓ :: Disminuido
      ↔ :: Sin cambios
      Δ :: Cambio / diagnóstico
      Ø :: Ausente / negativo
      ⊕ :: Positivo
      ⊖ :: Negativo
      ≈ :: Aproximadamente
      ♯ :: Fractura
      c̄ :: Con (cum)
      s̄ :: Sin (sine)
      p̄ :: Después (post)
      ā :: Antes (ante)
      \text{IMC}=\frac{m}{h^2} :: Índice de masa corporal
      \text{GC}=\text{FC}\times\text{VS} :: Gasto cardíaco
      \text{PAM}=\text{PAD}+\frac{\text{PAS}-\text{PAD}}{3} :: Presión arterial media
      \text{Cl}=\frac{U\cdot V}{P} :: Aclaramiento renal
      t_{1/2}=\frac{0{,}693\,V_d}{Cl} :: Semivida de eliminación
      \text{mg/kg} :: Dosis por peso
      \text{mmHg} :: Milímetros de mercurio
      \text{lpm} :: Latidos por minuto
      \text{mEq/L} :: Miliequivalentes por litro
      \text{UI} :: Unidades internacionales
      \mu\text{g} :: Microgramo
      \ce{SpO2} :: Saturación de oxígeno
      \ce{PaO2} :: Presión arterial de oxígeno
      \ce{PaCO2} :: Presión arterial de CO₂
      \ce{HCO3-} :: Bicarbonato
      \ce{HbO2} :: Oxihemoglobina
    `)
  ]),

  cat('astro', 'Astronomía y Tierra', '🪐', [
    sub('Sistema solar', R`
      ☉ :: Sol
      ☿ :: Mercurio
      ♀ :: Venus
      ♁ :: Tierra
      🜨 :: Tierra (variante)
      ☾ :: Luna
      ☽ :: Luna creciente
      ♂ :: Marte
      ♃ :: Júpiter
      ♄ :: Saturno
      ♅ :: Urano
      ⛢ :: Urano (variante)
      ♆ :: Neptuno
      ♇ :: Plutón
      ⚳ :: Ceres
      ⚴ :: Palas
      ⚵ :: Juno
      ⚶ :: Vesta
      ⚷ :: Quirón
      ☄ :: Cometa
      ★ :: Estrella
      ☆ :: Estrella (hueca)
      ✦ :: Estrella de cuatro puntas
      ☊ :: Nodo ascendente
      ☋ :: Nodo descendente
      ☌ :: Conjunción
      ☍ :: Oposición
      ⚹ :: Sextil
      △ :: Trígono
      □ :: Cuadratura
      M_\odot :: Masa solar
      R_\odot :: Radio solar
      L_\odot :: Luminosidad solar
      M_\oplus :: Masa terrestre
      R_\oplus :: Radio terrestre
      \text{UA} :: Unidad astronómica
      \text{pc} :: Pársec
      \text{al} :: Año luz
      m-M=5\log d-5 :: Módulo de distancia
      v=H_0d :: Ley de Hubble
      z=\frac{\Delta\lambda}{\lambda} :: Corrimiento al rojo
      L=4\pi R^2\sigma T^4 :: Luminosidad estelar
      F=\frac{L}{4\pi d^2} :: Flujo
      d=\frac{1}{p} :: Paralaje
    `),
    sub('Fases lunares y zodiaco', R`
      @ 🌑 🌒 🌓 🌔 🌕 🌖 🌗 🌘 🌙 🌚 🌛 🌜 🌝 🌞 ⭐ 🌟 💫 🌠 🌌 🪐 🌍 🌎 🌏 ☀ 🔭 🚀 🛰
      ♈ :: Aries
      ♉ :: Tauro
      ♊ :: Géminis
      ♋ :: Cáncer
      ♌ :: Leo
      ♍ :: Virgo
      ♎ :: Libra
      ♏ :: Escorpio
      ♐ :: Sagitario
      ♑ :: Capricornio
      ♒ :: Acuario
      ♓ :: Piscis
      ⛎ :: Ofiuco
    `),
    sub('Geografía y clima', R`
      ° :: Grado
      ′ :: Minuto de arco
      ″ :: Segundo de arco
      #?^\circ\,#?'\,#?''\,\text{N} :: Coordenada (grados, minutos, segundos)
      N :: Norte
      S :: Sur
      E :: Este
      O :: Oeste
      ↑ :: Norte (flecha)
      ⌖ :: Posición
      ⊕ :: Punto de referencia
      📍 :: Ubicación
      🧭 :: Brújula
      🗺 :: Mapa
      ⛰ :: Montaña
      🌋 :: Volcán
      🏔 :: Pico nevado
      🏝 :: Isla
      🏜 :: Desierto
      🌊 :: Ola / océano
      ☀ :: Soleado
      ☁ :: Nublado
      ⛅ :: Parcialmente nublado
      ☂ :: Lluvia
      ☔ :: Lluvia intensa
      ⛈ :: Tormenta
      ⚡ :: Rayo
      ❄ :: Nieve
      ☃ :: Muñeco de nieve
      🌪 :: Tornado
      🌫 :: Niebla
      🌈 :: Arcoíris
      🌡 :: Temperatura
      💧 :: Gota
      💨 :: Viento
      ☈ :: Tormenta eléctrica
      ⛆ :: Lluvia (símbolo)
      \text{hPa} :: Hectopascal
      \text{mm} :: Milímetros de precipitación
      \text{msnm} :: Metros sobre el nivel del mar
      \text{hab/km}^2 :: Densidad de población
      1:50\,000 :: Escala
      M_w :: Magnitud de momento
      \rho=\frac{P}{S} :: Densidad de población (fórmula)
      \text{TN}=\frac{N}{P}\cdot1000 :: Tasa de natalidad
    `)
  ]),

  cat('cs', 'Informática y electrónica', '💻', [
    sub('Lógica y bits', R`
      ∧ ~ \land :: AND
      ∨ ~ \lor :: OR
      ¬ ~ \lnot :: NOT
      ⊕ ~ \oplus :: XOR
      ⊼ ~ \barwedge :: NAND
      ⊽ :: NOR
      ⊙ ~ \odot :: XNOR
      \overline{#?} :: Negación (barra)
      A\cdot B :: AND (producto)
      A+B :: OR (suma)
      \overline{A\cdot B}=\overline{A}+\overline{B} :: Ley de De Morgan
      \ll :: Desplazamiento a la izquierda
      \gg :: Desplazamiento a la derecha
      \& :: AND bit a bit
      | :: OR bit a bit
      c:^ :: XOR bit a bit
      ~ :: NOT bit a bit
      #?_{2} :: Número en binario
      #?_{16} :: Número en hexadecimal
      #?_{8} :: Número en octal
      \texttt{0x#?} :: Literal hexadecimal
      \texttt{0b#?} :: Literal binario
      ⊤ :: Verdadero
      ⊥ :: Falso
      \text{true} :: true
      \text{false} :: false
      \emptyset :: Nulo / vacío
    `),
    sub('Algoritmos y complejidad', R`
      O(#?) :: O grande :: cota superior
      \Omega(#?) :: Omega grande :: cota inferior
      \Theta(#?) :: Theta :: cota ajustada
      o(#?) :: o pequeña
      \omega(#?) :: omega pequeña
      O(1) :: Constante
      O(\log n) :: Logarítmica
      O(n) :: Lineal
      O(n\log n) :: Linealítmica
      O(n^2) :: Cuadrática
      O(2^n) :: Exponencial
      O(n!) :: Factorial
      T(n)=aT\left(\frac{n}{b}\right)+f(n) :: Recurrencia (teorema maestro)
      \lfloor\log_2n\rfloor :: Altura de un árbol binario
      \leftarrow :: Asignación (pseudocódigo)
      \gets :: Asignación
      := :: Asignación (texto)
      \neq :: Distinto
      \bmod :: Módulo
      \lfloor#?\rfloor :: Suelo
      \lceil#?\rceil :: Techo
      \sum_{i=1}^{n}i=\frac{n(n+1)}{2} :: Suma de iteraciones
      \mathcal{P} :: Clase P
      \mathcal{NP} :: Clase NP
      \Sigma^{*} :: Clausura de Kleene
      \varepsilon :: Cadena vacía
      \delta(q,a) :: Función de transición
      L(M) :: Lenguaje aceptado
      \vdash :: Deriva (un paso)
      \lambda x.#? :: Abstracción lambda
      \langle#?\rangle :: Codificación
      G=(V,E) :: Grafo
      |V| :: Número de vértices
      |E| :: Número de aristas
      H(X)=-\sum p(x)\log_2p(x) :: Entropía de Shannon
    `),
    sub('Programación (caracteres)', R`
      @ { } [ ] ( ) < > / | ; : , . ! ? @ # $ % & * + - = ~
      c:\ :: Barra invertida
      c:^ :: Circunflejo
      c:_ :: Guion bajo
      c:{ :: Llave de apertura
      c:} :: Llave de cierre
      == :: Igual a
      != :: Distinto de
      === :: Idéntico
      <= :: Menor o igual
      >= :: Mayor o igual
      && :: Y lógico
      || :: O lógico
      => :: Flecha (función)
      -> :: Flecha (puntero / retorno)
      ++ :: Incremento
      -- :: Decremento
      += :: Suma y asigna
      :: :: Ámbito
      ... :: Propagación
      // :: Comentario
      /* */ :: Comentario de bloque
      <> :: Fragmento / distinto
      </> :: Etiqueta
      ?? :: Fusión nula
      ?. :: Encadenamiento opcional
      |> :: Tubería
      λ :: Lambda
      ∅ :: Vacío
      ⏎ :: Retorno
      ⇥ :: Tabulador
      ␣ :: Espacio visible
      ¶ :: Fin de párrafo
    `),
    sub('Teclas e interfaz', R`
      ⌘ :: Comando (Mac)
      ⌥ :: Opción
      ⇧ :: Mayúsculas
      ⌃ :: Control
      ⎋ :: Escape
      ⇪ :: Bloqueo de mayúsculas
      ⏎ :: Intro
      ↵ :: Retorno
      ⌫ :: Borrar
      ⌦ :: Suprimir
      ⇥ :: Tabulador
      ⇤ :: Tabulador inverso
      ␣ :: Barra espaciadora
      ⏏ :: Expulsar
      ⏻ :: Encendido
      ⏼ :: Encendido/apagado
      ⏽ :: Encendido (I)
      ⭘ :: Apagado (O)
      ⏯ :: Reproducir/pausa
      ⏸ :: Pausa
      ⏹ :: Detener
      ⏺ :: Grabar
      ⏭ :: Siguiente
      ⏮ :: Anterior
      ⏩ :: Avance rápido
      ⏪ :: Rebobinar
      🔍 :: Buscar
      ⚙ :: Ajustes
      ☰ :: Menú
      ⋮ :: Más opciones (vertical)
      ⋯ :: Más opciones
      ✕ :: Cerrar
      ⌂ :: Inicio
      ⎘ :: Copiar
      ✂ :: Cortar
      ⎌ :: Deshacer
      ↻ :: Recargar
      ⇱ :: Inicio (tecla)
      ⇲ :: Fin (tecla)
      ⇞ :: Página arriba
      ⇟ :: Página abajo
      @ ␀ ␁ ␂ ␃ ␄ ␅ ␆ ␇ ␈ ␉ ␊ ␋ ␌ ␍ ␎ ␏ ␐ ␑ ␒ ␓ ␔ ␕ ␖ ␗ ␘ ␙ ␚ ␛ ␜ ␝ ␞ ␟ ␠ ␡ ␤
    `),
    sub('Electrónica', R`
      V=IR :: Ley de Ohm
      P=VI :: Potencia
      \sum I_{ent}=\sum I_{sal} :: Ley de Kirchhoff de corrientes
      \sum V=0 :: Ley de Kirchhoff de tensiones
      \tau=RC :: Constante de tiempo RC
      V_C=V_0\left(1-e^{-t/RC}\right) :: Carga de un condensador
      f_c=\frac{1}{2\pi RC} :: Frecuencia de corte
      A_v=\frac{V_{out}}{V_{in}} :: Ganancia de tensión
      A_{dB}=20\log\frac{V_{out}}{V_{in}} :: Ganancia en decibelios
      I_C=\beta I_B :: Transistor (ganancia)
      Z=R+jX :: Impedancia compleja
      V_{rms}=\frac{V_p}{\sqrt{2}} :: Valor eficaz
      Ω :: Ohmio
      ℧ :: Mho (siemens)
      µ :: Micro
      ⏚ :: Tierra
      ⏛ :: Fusible
      ⎓ :: Corriente continua
      ⏦ :: Corriente alterna
      ∿ :: Onda senoidal
      ⎍ :: Onda cuadrada
      ⌁ :: Flecha eléctrica
      ⚡ :: Tensión
      ⏧ :: Intersección eléctrica
      ⊣ :: Condensador (aprox.)
      ⊥ :: Tierra (aprox.)
      ⟜ :: Conexión
      🔋 :: Batería
      🔌 :: Enchufe
      💡 :: Bombilla
      \text{k}\Omega :: Kiloohmio
      \mu\text{F} :: Microfaradio
      \text{mA} :: Miliamperio
      \text{mAh} :: Miliamperio hora
    `)
  ])
];
