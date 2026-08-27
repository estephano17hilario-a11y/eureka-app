# 🚀 Eureka - Capacitor + TypeScript App

Una aplicación móvil y web de última generación construida con **Capacitor 6**, **TypeScript**, y **Vite**.

---

## 📦 Estructura del Proyecto

```
eureka/
├── capacitor.config.ts      # Configuración de Capacitor (ID: com.eureka.app)
├── index.html               # Entry point con viewport móvil y safe-areas
├── package.json             # Scripts y dependencias nativas
├── tsconfig.json            # Configuración TypeScript
├── vite.config.ts           # Bundler Vite
└── src/
    ├── components/          # Componentes modulares
    │   ├── Header.ts
    │   ├── NavigationBar.ts
    │   ├── FeatureCard.ts
    │   ├── NativeCapabilities.ts
    │   └── InsightsPanel.ts
    ├── services/            # APIs nativas de Capacitor
    │   └── native.service.ts
    ├── types/               # Tipos TypeScript
    │   └── index.ts
    ├── index.css            # Sistema de diseño moderno (Glassmorphic)
    └── main.ts              # Entry point y ciclo de vida de la app
```

---

## 🛠️ Comandos Disponibles

### Desarrollo Web Local
```bash
npm install
npm run dev
```

### Compilar para Producción
```bash
npm run build
```

---

## 📱 Añadir Plataformas Móviles (Android / iOS)

### Android
```bash
# 1. Agregar plataforma Android
npx cap add android

# 2. Compilar y sincronizar cambios
npm run build
npm run cap:sync

# 3. Abrir en Android Studio
npm run cap:open:android
```

### iOS (macOS requerido)
```bash
# 1. Agregar plataforma iOS
npx cap add ios

# 2. Compilar y sincronizar cambios
npm run build
npm run cap:sync

# 3. Abrir en Xcode
npm run cap:open:ios
```

---

## 🧩 Plugins Nativos Integrados

- `@capacitor/core` & `@capacitor/cli`
- `@capacitor/status-bar` (Configuración de barra de estado y modo inmersivo)
- `@capacitor/splash-screen` (Pantalla de bienvenida fluida)
- `@capacitor/haptics` (Feedback háptico y vibraciones)
- `@capacitor/device` (Información de hardware y batería)
- `@capacitor/preferences` (Almacenamiento persistente nativo)
- `@capacitor/keyboard` (Control de teclado en pantalla)
