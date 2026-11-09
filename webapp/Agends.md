# AGENT.md

Guía de contexto y reglas para agentes de IA (y humanos) que trabajen en este proyecto frontend.

---

## 1. Descripción del proyecto

Frontend **WebApp** construido con **Next.js (App Router)** y organizado por **features** (vertical slice). Cada feature agrupa sus capas de `domain`, `application` e `infrastructure` (UI), y **puede incluir sus propias páginas, layouts y componentes**.

**Stack base:**
- Framework: Next.js 15+ (App Router)
- UI: React 19 + Tailwind CSS
- Lenguaje: TypeScript (strict)
- Testing: Jest + Testing Library
- Validación: zod
- Data fetching: Server Components / Server Actions / TanStack Query *(ajustar según proyecto)*

**Principio clave:** el frontend no replica el backend. El `domain` aquí es **mínimo** y solo contiene lógica pura específica de UI. La lógica de negocio real vive en el backend.

---

## 2. Estructura de carpetas
webapp/
├── src/
│ ├── app/ # Solo routing: re-exporta páginas de features
│ │ ├── layout.tsx # Root layout (providers globales)
│ │ ├── page.tsx # Home
│ │ ├── globals.css
│ │ └── [...rutas]/ # Rutas delgadas que importan de features
│ │
│ ├── features/
│ │ └── <feature>/ # auth, user, product, order, ...
│ │ ├── domain/ # Plano, sin subcarpetas
│ │ │ ├── <x>.types.ts
│ │ │ ├── <x>.schema.ts # zod schemas
│ │ │ ├── <x>.helpers.ts # lógica pura de UI
│ │ │ └── <x>.constants.ts
│ │ │
│ │ ├── application/
│ │ │ ├── dtos/
│ │ │ │ └── <x>.dto.ts
│ │ │ ├── use-cases/ # 1 archivo por caso de uso
│ │ │ │ └── <verb>-<x>.use-case.ts
│ │ │ └── <x>.mapper.ts
│ │ │
│ │ └── infrastructure/
│ │ ├── api/ # Clientes HTTP / Server Actions
│ │ │ └── <x>.api.ts
│ │ ├── ui/ # Todo lo visual del feature
│ │ │ ├── pages/ # Páginas del feature (si las tiene)
│ │ │ │ ├── <X>ListPage.tsx
│ │ │ │ └── <X>DetailPage.tsx
│ │ │ ├── layouts/ # Layouts del feature (si los tiene)
│ │ │ │ └── <X>Layout.tsx
│ │ │ └── components/ # Componentes del feature
│ │ │ ├── <X>Form.client.tsx
│ │ │ ├── <X>List.tsx
│ │ │ └── <X>Card.tsx
│ │ ├── hooks/ # Hooks específicos del feature
│ │ │ └── use-<x>.ts
│ │ └── <x>.module.ts # wiring / barrels internos (opcional)
│ │
│ ├── shared/
│ │ ├── domain/
│ │ │ ├── types.ts
│ │ │ └── result.ts
│ │ ├── application/
│ │ │ └── base-use-case.ts
│ │ └── infrastructure/
│ │ ├── components/
│ │ │ ├── ui/ # primitivas (Button, Input, Modal)
│ │ │ └── layout/ # Header, Footer, Sidebar globales
│ │ ├── hooks/ # hooks genéricos
│ │ └── lib/ # fetcher, cn(), utils
│ │
│ ├── config/
│ │ ├── env.ts # Variables de entorno validadas
│ │ ├── site.ts # Metadatos, rutas, constantes globales
│ │ └── query-client.ts # Configuración de data fetching
│ │
│ └── middleware.ts # Middleware global de Next.js
│
├── tests/ # Espejo 1:1 de src/
│ ├── features/
│ │ └── <feature>/
│ │ ├── domain/
│ │ ├── application/
│ │ │ └── use-cases/
│ │ └── infrastructure/
│ │ ├── api/
│ │ └── ui/
│ │ ├── pages/
│ │ ├── layouts/
│ │ └── components/
│ ├── shared/
│ └── e2e/
│
├── public/
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── jest.config.js
├── package.json
└── README.md

---

## 3. Reglas de arquitectura

### 3.1 Dirección de dependencias

- **`app/`** solo enruta: **re-exporta** las páginas de cada feature. No contiene lógica ni UI.
- **`features/<x>/infrastructure/ui/`** contiene **páginas, layouts y componentes** del feature.
- **`application/`** contiene casos de uso (orquestación API → DTO). Sin JSX.
- **`domain/`** es puro TypeScript. **No importa React ni Next.js**.
- **`shared/`** contiene UI primitives y utilidades reutilizables.

**Nunca** importar desde `app/` dentro de un feature. **Nunca** importar `infrastructure` desde `application` o `domain`.

### 3.2 Capa `domain/` — plano, sin subcarpetas

El dominio frontend es **deliberadamente mínimo**. Solo contiene lógica pura específica de presentación:

| Tipo | Sufijo | Ejemplo |
|---|---|---|
| Tipos/Interfaces | `.types.ts` | `user.types.ts` |
| Schemas de validación | `.schema.ts` | `user.schema.ts` |
| Helpers puros | `.helpers.ts` | `user.helpers.ts` |
| Constantes | `.constants.ts` | `user.constants.ts` |

**Prohibido en `domain/`:**
- Importar React, Next.js, hooks, componentes
- Hacer fetch/llamadas HTTP
- Usar APIs no deterministas (`Date.now()`, `Math.random()`) salvo que sea el propósito del helper

**Ejemplo correcto:**
```ts
// features/user/domain/user.helpers.ts
export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
