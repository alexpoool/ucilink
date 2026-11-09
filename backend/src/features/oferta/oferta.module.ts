import { Router } from 'express';
import { Database } from '@/config/db';
import { AspiranteRepositoryImpl } from '@/features/aspirante/infrastructure/repositories/aspirante.repository.impl';
import { EmpresaRepositoryImpl } from '@/features/empresa/infrastructure/repositories/empresa.repository.impl';
import { OfertaRepositoryImpl } from './infrastructure/repositories/oferta.repository.impl';
import { ListarOfertasFeedUseCase } from './application/use-cases/listar-ofertas-feed.use-case';
import { ObtenerOfertaPublicaUseCase } from './application/use-cases/obtener-oferta-publica.use-case';
import { CrearOfertaUseCase } from './application/use-cases/crear-oferta.use-case';
import { ActualizarOfertaUseCase } from './application/use-cases/actualizar-oferta.use-case';
import { CambiarEstadoOfertaUseCase } from './application/use-cases/cambiar-estado-oferta.use-case';
import { ListarMisOfertasUseCase } from './application/use-cases/listar-mis-ofertas.use-case';
import {
  OfertaPublicaController,
} from './infrastructure/controllers/oferta-publica.controller';
import { OfertaAutorController } from './infrastructure/controllers/oferta-autor.controller';
import { OfertasPropiasController } from './infrastructure/controllers/ofertas-propias.controller';
import {
  ofertaPublicasRoutes,
  ofertaAutorRoutes,
  ofertaPropiasRoutes,
} from './infrastructure/routes/oferta.routes';

// Wiring del feature oferta: pública + autor + propias. Cross-feature hacia
// los PUERTOS de dominio (aspirante/empresa) — su infraestructura solo en
// el wiring (capa permitida).
export function ofertaModule(db: Database): {
  publicas: Router;
  autor: Router;
  propias: Router;
} {
  const ofertaRepository = new OfertaRepositoryImpl(db);
  const aspiranteRepository = new AspiranteRepositoryImpl(db);
  const empresaRepository = new EmpresaRepositoryImpl(db);

  const feed = new ListarOfertasFeedUseCase(ofertaRepository);
  const detalle = new ObtenerOfertaPublicaUseCase(ofertaRepository);
  const crear = new CrearOfertaUseCase(
    ofertaRepository,
    aspiranteRepository,
    empresaRepository,
  );
  const actualizar = new ActualizarOfertaUseCase(ofertaRepository);
  const cambiarEstado = new CambiarEstadoOfertaUseCase(ofertaRepository);
  const listarMias = new ListarMisOfertasUseCase(ofertaRepository);

  const publicaController = new OfertaPublicaController(feed, detalle);
  const autorController = new OfertaAutorController(crear, actualizar, cambiarEstado);
  const propiasController = new OfertasPropiasController(
    listarMias,
    aspiranteRepository,
    empresaRepository,
  );

  return {
    publicas: ofertaPublicasRoutes(publicaController),
    autor: ofertaAutorRoutes(autorController),
    propias: ofertaPropiasRoutes(propiasController),
  };
}
