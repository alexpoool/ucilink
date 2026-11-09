# Documentación — LinkedIn Universitario (UCI Link)

La documentación está organizada en **pares gemelos**: por cada feature del código
existe su doc **técnica** (arquitectura, tablas, puertos, endpoints) y su doc de
**usuario** (qué puede hacer la persona, paso a paso, en lenguaje sin jerga).

```
docs/
├── README.md                      ← este índice
├── tecnica/
│   ├── arquitectura.md            ← global: capas, direcciones, convenciones
│   └── api.md                     ← global: catálogo de endpoints y roles
├── usuario/
│   └── manual.md                  ← global: manual de uso por rol
└── features/<feature>/            ← espejo 1:1 de src/features/
    ├── tecnica.md
    └── usuario.md
```

Features (10, igual que en backend/ y webapp/):

| Feature | Doc técnica | Doc usuario |
|---|---|---|
| auth | features/auth/tecnica.md | features/auth/usuario.md |
| aspirante | features/aspirante/tecnica.md | features/aspirante/usuario.md |
| empresa | features/empresa/tecnica.md | features/empresa/usuario.md |
| curriculum | features/curriculum/tecnica.md | features/curriculum/usuario.md |
| oferta | features/oferta/tecnica.md | features/oferta/usuario.md |
| evaluacion | features/evaluacion/tecnica.md | features/evaluacion/usuario.md |
| grupo | features/grupo/tecnica.md | features/grupo/usuario.md |
| valoracion | features/valoracion/tecnica.md | features/valoracion/usuario.md |
| notificacion | features/notificacion/tecnica.md | features/notificacion/usuario.md |
| admin | features/admin/tecnica.md | features/admin/usuario.md |

Estado de implementación: los docs marcan con **(diseño comprometido)** lo que aún
no tiene código y se actualizan con cada entrega.
