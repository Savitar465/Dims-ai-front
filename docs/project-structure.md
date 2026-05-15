# Estructura del proyecto

Esta estructura esta pensada para Next.js con App Router usando `src/` como raiz de codigo.

## Estructura objetivo

```text
.
├── public/
│   └── Static assets (images, fonts)
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── dashboard/
│   │   │   ├── _components/
│   │   │   │   ├── dashboard-header.tsx
│   │   │   │   └── metric-card.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   └── button.tsx
│   │   └── common/
│   │       ├── empty-state.tsx
│   │       ├── navbar.tsx
│   │       └── page-container.tsx
│   ├── lib/
│   │   ├── build-page-title.ts
│   │   └── services/
│   │       └── dashboard-summary.ts
│   ├── hooks/
│   │   └── use-toggle.ts
│   ├── types/
│   │   └── dashboard.ts
│   └── utils/
│       └── format-number.ts
├── .env
├── next.config.ts
├── postcss.config.mjs
└── tsconfig.json
```

## Ejemplo implementado

El proyecto ya incluye una ruta real en `src/app/dashboard/page.tsx` que usa:

- `src/app/dashboard/_components/` para UI privada de la feature.
- `src/lib/services/` para la obtencion de datos de ejemplo.
- `src/components/common/` para contenedores y estados reutilizables.
- `src/utils/` para helpers genericos.

## Reglas de organizacion

- `src/app/` contiene rutas, layouts y archivos de routing de Next.js.
- Usa carpetas con prefijo `_` para codigo privado no enrutable.
- Usa route groups como `(auth)` para organizar flujos sin cambiar la URL.
- Separa componentes globales en `src/components/` y logica compartida en `src/lib/`.
- Reserva `src/components/ui/` para primitives y componentes base de shadcn que luego se componen en el resto de la UI.

## Arquitectura recomendada

- Capa de presentacion: paginas y componentes de feature en `src/app/`.
- Capa de UI global: primitives y componentes compuestos en `src/components/`.
- Capa de dominio/servicios: helpers, servicios y acceso a datos en `src/lib/`.
- Capa de utilidades: funciones puras en `src/utils/`.

## Escalado por feature

Cuando el proyecto crezca, agrupa por feature dentro de `src/app/`:

```text
src/app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── dashboard/
│   ├── _components/
│   ├── _lib/
│   └── page.tsx
└── settings/
	└── page.tsx
```

Este enfoque reduce acoplamiento y hace mas facil mantener cada feature por separado.

