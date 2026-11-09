# AGENT.md

Guía de contexto y reglas para agentes de IA (y humanos) que trabajen en este proyecto backend.

---

## 1. Descripción del proyecto

Backend **WebAPI** construido con **Clean Architecture** organizado por **features** (vertical slice). Cada feature agrupa sus tres capas: `domain`, `application` e `infrastructure`.

**Stack base:**
- Lenguaje: TypeScript
- Runtime: Node.js
- Framework HTTP: Express / Fastify *(ajustar según proyecto)*
- ORM: Prisma / TypeORM / Knex *(ajustar según proyecto)*
- Testing: Jest + ts-jest
- Logger: pino / winston
- Validación: zod / class-validator

---

## 2. Estructura de carpetas
backend/
├── src/
│ ├── config/ # Configuración transversal
│ │ ├── secrets.ts
│ │ ├── logs.ts
│ │ ├── db.ts
│ │ └── cors.ts
│ │
│ ├── features/
│ │ └── <feature>/ # user, auth, product, order, ...
│ │ ├── domain/ # Plano, sin subcarpetas
│ │ │ ├── <x>.entity.ts
│ │ │ ├── <x>.vo.ts
│ │ │ ├── <x>.repository.ts # interfaz (puerto)
│ │ │ └── <x>.exception.ts
│ │ │
│ │ ├── application/
│ │ │ ├── dtos/
│ │ │ │ └── <x>.dto.ts
│ │ │ ├── use-cases/ # 1 archivo por caso de uso
│ │ │ │ └── <verb>-<x>.use-case.ts
│ │ │ └── <x>.mapper.ts
│ │ │
│ │ └── infrastructure/
│ │ ├── controllers/
│ │ │ └── <x>.controller.ts
│ │ ├── repositories/
│ │ │ └── <x>.repository.impl.ts
│ │ ├── models/
│ │ │ └── <x>.model.ts
│ │ ├── routes/
│ │ │ └── <x>.routes.ts
│ │ └── <x>.module.ts # wiring / DI
│ │
│ ├── shared/
│ │ ├── domain/
│ │ │ ├── base-entity.ts
│ │ │ ├── value-object.ts
│ │ │ └── result.ts
│ │ ├── application/
│ │ │ └── base-use-case.ts
│ │ └── infrastructure/
│ │ └── middlewares/
│ │ ├── error.middleware.ts
│ │ └── auth.middleware.ts
│ │
│ ├── app.ts
│ └── server.ts
│
├── migrations/ # Migraciones globales (ver sección 3.7)
│ ├── 20240101120000_create_users_table.ts
│ ├── 20240102150000_create_products_table.ts
│ └── runner.ts # orquestador de migraciones
│
├── seeds/ # Datos iniciales (opcional)
│ ├── 001_users.seed.ts
│ ├── 002_products.seed.ts
│ └── runner.ts
│
├── tests/ # Espejo 1:1 de src/
│ ├── config/
│ ├── features/
│ │ └── <feature>/
│ │ ├── domain/
│ │ ├── application/
│ │ │ └── use-cases/
│ │ └── infrastructure/
│ ├── shared/
│ └── e2e/
│
├── .env
├── .env.example
├── tsconfig.json
├── jest.config.js
├── package.json
└── README.md


---

## 3. Reglas de arquitectura

### 3.1 Dirección de dependencias (obligatorio)

- `domain` **no depende de nadie** (ni librerías externas, ni ORM, ni framework HTTP).
- `application` **solo depende de `domain`**.
- `infrastructure` puede depender de `application` y `domain`, además de librerías externas (ORM, Express, etc.).

**Nunca** importar `infrastructure` desde `application` ni desde `domain`.

### 3.2 Capa `domain/` — plano, sin subcarpetas

Todo archivo del dominio vive al mismo nivel. Se distinguen por **sufijo**:

| Tipo | Sufijo | Ejemplo |
|---|---|---|
| Entidad | `.entity.ts` | `user.entity.ts` |
| Value Object | `.vo.ts` | `email.vo.ts` |
| Interfaz de repositorio (puerto) | `.repository.ts` | `user.repository.ts` |
| Excepción de dominio | `.exception.ts` | `user-not-found.exception.ts` |

- El dominio solo contiene **interfaces** de repositorios, nunca implementaciones.
- Las entidades deben ser **puras** (sin decoradores de ORM).
- Los value objects son **inmutables**.

### 3.3 Capa `application/`

- **`dtos/`** → contratos de entrada/salida. Sin lógica de negocio.
- **`use-cases/`** → **un archivo por caso de uso**, con un único método público `execute()`.
  - Nomenclatura: `<verbo>-<entidad>.use-case.ts` (`create-user.use-case.ts`).
  - Dependen de interfaces del dominio (inyectadas por constructor).
- **`<feature>.mapper.ts`** → conversión entidad ↔ DTO.
- **Nunca** importar ORM, Express ni nada de `infrastructure`.

### 3.4 Capa `infrastructure/`

- **`controllers/`** → un archivo por controlador. Solo traducen HTTP ↔ caso de uso. **Sin lógica de negocio**.
- **`repositories/`** → implementaciones concretas de las interfaces del dominio. Sufijo `.repository.impl.ts`.
- **`models/`** → modelos del ORM, aislados. Nunca se exponen fuera de `infrastructure`.
- **`routes/`** → definición de endpoints.
- **`<feature>.module.ts`** → wiring / inyección de dependencias del feature.

### 3.5 `config/`

Configuraciones globales transversales. Todos los secretos y variables de entorno se leen **únicamente** desde `config/secrets.ts`.

### 3.6 `shared/`

Código reutilizable entre features:
- `shared/domain/` → base de entidades, value objects, result pattern.
- `shared/application/` → interfaces base.
- `shared/infrastructure/` → middlewares, plugins globales.

**Regla:** si un tipo solo lo usa un feature, va en el feature. Si lo usan 2+ features, va en `shared/`.

### 3.7 Migraciones y seeds

**Opción A — globales (recomendada si usas Prisma):**

- Todas las migraciones viven en `migrations/` en la raíz del proyecto.
- Nomenclatura: `<timestamp>_<descripcion>.ts` (o `.sql`).
- Una migración = un cambio de esquema atómico.
- No editar migraciones ya aplicadas; crear una nueva.

**Opción B — por feature:**

- Las migraciones viven en `src/features/<feature>/infrastructure/migrations/`.
- El runner en `migrations/runner.ts` descubre y ordena por timestamp.
- Una migración nunca modifica tablas de otro feature.

**Reglas comunes:**

- Toda migración debe tener `up()` y `down()` reversibles.
- Los `seeds/` nunca van dentro de migraciones; son archivos separados.
- Los seeds son idempotentes (pueden correrse N veces sin duplicar datos).
- Nunca hardcodear datos sensibles en migraciones o seeds; usar `config/secrets.ts`.
- **Nunca** usar `synchronize: true` (TypeORM) ni `db push` (Prisma) en producción.

---

## 4. Reglas de tests

- La carpeta `tests/` **espeja 1:1 la estructura de `src/`**.
- Cada archivo con lógica tiene su gemelo: `<archivo>.test.ts`.
- Los `dtos/` **no se testean** salvo que tengan validación explícita.
- Las **interfaces de repositorio** (`.repository.ts`) **no se testean**; se testean sus implementaciones (`.repository.impl.test.ts`).
- Los tests **e2e** van en `tests/e2e/`, no dentro de un feature.

---

## 5. Convenciones de nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| Carpetas | `kebab-case` | `use-cases`, `value-objects` |
| Archivos | `kebab-case` + sufijo de capa | `create-user.use-case.ts` |
| Clases | `PascalCase` | `CreateUserUseCase` |
| Interfaces | `PascalCase` (sin prefijo `I`) | `UserRepository` |
| Métodos públicos de casos de uso | `execute()` | `execute(dto)` |
| Variables y funciones | `camelCase` | `userRepository` |
| Constantes | `UPPER_SNAKE_CASE` | `DEFAULT_TIMEOUT` |
| Env vars | `UPPER_SNAKE_CASE` | `DATABASE_URL` |
| Migraciones | `<timestamp>_<snake_case>` | `20240101120000_create_users_table.ts` |

---

## 6. Reglas generales de código

1. **Nunca** exponer entidades de dominio directamente en controllers; siempre mapear a DTOs de respuesta.
2. **Nunca** importar el ORM dentro de `domain` o `application`.
3. **Nunca** poner lógica de negocio en controllers ni en middlewares.
4. **Siempre** inyectar dependencias por constructor.
5. **Siempre** lanzar excepciones de dominio desde `domain/` (no `Error` genéricos).
6. **Siempre** manejar errores en el `error.middleware.ts` global.
7. **Un archivo = una responsabilidad**. No mezclar dos casos de uso, dos entidades, ni dos controllers en un mismo archivo.
8. **No crear archivos `index.ts`** para barrel exports, salvo acuerdo explícito (evita ciclos y problemas de tree-shaking).
9. **Los modelos del ORM no salen de `infrastructure/`**; se mapean a entidades de dominio.
10. **Validación de entrada** con zod/class-validator **en el DTO** (application) o en middleware (infrastructure), no en controllers dispersa.
11. **Nunca** modificar migraciones ya aplicadas en producción; crear una nueva.
12. **Siempre** versionar los cambios de esquema en migraciones, nunca en `synchronize: true`.

---

## 7. Reglas para agentes de IA

Al generar o modificar código en este repo:

- **Respeta siempre** la estructura de carpetas y la dirección de dependencias.
- **Nunca** importes desde `infrastructure` en `application` o `domain`.
- **Nunca** agregues subcarpetas dentro de `domain/`; usa sufijos.
- **Un caso de uso por archivo**, con clase `PascalCase` y método `execute()`.
- **Un controller por archivo**, sin lógica de negocio.
- **Los repositorios del dominio son solo interfaces**. La implementación va en `infrastructure/repositories/<x>.repository.impl.ts`.
- **Todo nuevo archivo con lógica** debe tener su test gemelo en `tests/` con la misma ruta y sufijo `.test.ts`.
- **Los DTOs** son clases/interfaces puras, sin lógica, sin llamadas a DB, sin ORM.
- **Los secretos y configs** se leen **solo** desde `config/secrets.ts`.
- **Los logs** se emiten **solo** a través de `config/logs.ts`.
- **CORS y middlewares globales** se registran en `app.ts`.
- **No crear archivos `index.ts`** de barrel exports.
- **No instalar dependencias nuevas** sin justificar y sin actualizar `package.json` explícitamente.
- **Todo cambio de esquema** debe ir acompañado de su migración correspondiente con `up()` y `down()`.
- **Todo seed nuevo** debe ser idempotente.
- Si agregas un nuevo **feature**, replica la estructura completa (`domain` / `application` / `infrastructure`) y su espejo en `tests/`.
- Si detectas violaciones a estas reglas en el código existente, **repórtalas antes de modificarlas**.

---

## 8. Checklist antes de hacer commit

- [ ] La dirección de dependencias se respeta (`infrastructure → application → domain`).
- [ ] Los casos de uso están en archivos individuales con `execute()`.
- [ ] Los controllers no contienen lógica de negocio.
- [ ] Los DTOs no tienen lógica.
- [ ] Los repositorios de dominio son interfaces; las implementaciones están en `infrastructure`.
- [ ] Los tests gemelos existen para los archivos nuevos con lógica.
- [ ] No hay `index.ts` de barrel export.
- [ ] No se importó ORM ni Express en `domain` ni `application`.
- [ ] Toda migración nueva tiene `up()` y `down()` reversibles.
- [ ] Los cambios de esquema están en migraciones, no en `synchronize: true`.
- [ ] Los seeds son idempotentes y no contienen secretos hardcodeados.
- [ ] `tsc --noEmit` pasa sin errores.
- [ ] `npm test` pasa.
- [ ] `.env.example` está actualizado si se agregaron variables.

---

## 9. Comandos útiles

```bash
npm run dev          # servidor en modo desarrollo
npm run build        # compilar TypeScript
npm start            # ejecutar build
npm test             # correr tests
npm run test:watch   # tests en watch mode
npm run test:cov     # cobertura
npm run lint         # lint
npm run type-check   # tsc --noEmit

npm run db:migrate        # aplicar migraciones
npm run db:migrate:down   # revertir última migración
npm run db:seed           # ejecutar seeds
npm run db:reset          # reset completo (down + migrate + seed)
