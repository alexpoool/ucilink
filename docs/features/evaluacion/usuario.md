# evaluacion — usuario

## Si eres aspirante
**Postularte**: 1) entra a una oferta publicada 2) pulsa "Solicitar empleo" con el CV principal
(o elige otro CV) 3) quedas "Postulado". Si ya te postulaste a esa oferta con ese CV, la app
te dice "Ya estás postulado a esta oferta".
Postulaciones grupales en feature grupo.

**Seguimiento**: en /aspirante/postulaciones ves cada una con su estado.

| Estado | Significa |
|---|---|
| postulado | llegó a la empresa |
| en revisión | alguien la está viendo |
| preseleccionado | pasaste el primer filtro |
| fichado | ¡contratación / puesto dado! |
| rechazado | el filtro avanzó sin ti |
| retirado | tú retiraste la postulación |

**Retirar**: cualquier botón "Retirar postulación" mientras sigues antes de "fichado" o "postulado".

## Si eres empresa
**Ver CVs recibidos**: en /empresa/ofertas/<id>/cvs.
**Evaluar**: mueve al candidato con los botones del pipeline: "En revisión" → "Preseleccionado" → "Fichar" o "Rechazar", con comentario y puntuación (1 a 5) opcionales al cerrar. Esos cambios quedan con fecha y automática en el historial del(DE la) postulación.

Cada vez que un CV llega, se agrega a la campana de **notificaciones** de tu empresa.
