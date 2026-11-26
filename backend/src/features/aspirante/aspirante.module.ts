import { Router } from "express";
import { Database } from "@/config/db";
import { AspiranteRepositoryImpl } from "./infrastructure/repositories/aspirante.repository.impl";
import { CrearPerfilAspiranteUseCase } from "./application/use-cases/crear-perfil-aspirante.use-case";
import { ObtenerPerfilAspiranteUseCase } from "./application/use-cases/obtener-perfil-aspirante.use-case";
import { ActualizarPerfilAspiranteUseCase } from "./application/use-cases/actualizar-perfil-aspirante.use-case";
import { AspiranteController } from "./infrastructure/controllers/aspirante.controller";
import { aspiranteRoutes } from "./infrastructure/routes/aspirante.routes";

// Wiring del feature aspirante (DI por constructor).
export function aspiranteModule(db: Database): Router {
	const aspiranteRepository = new AspiranteRepositoryImpl(db);

	const crearPerfil = new CrearPerfilAspiranteUseCase(aspiranteRepository);
	const obtenerPerfil = new ObtenerPerfilAspiranteUseCase(
		aspiranteRepository,
	);
	const actualizarPerfil = new ActualizarPerfilAspiranteUseCase(
		aspiranteRepository,
	);

	const controller = new AspiranteController(
		crearPerfil,
		obtenerPerfil,
		actualizarPerfil,
	);
	return aspiranteRoutes(controller);
}
