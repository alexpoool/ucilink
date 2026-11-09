import { ObtenerMetricasUseCase } from '@/features/admin/application/use-cases/obtener-metricas.use-case';
import { ListarEmpresasPendientesUseCase } from '@/features/admin/application/use-cases/listar-empresas-pendientes.use-case';
import { VerificarEmpresaUseCase } from '@/features/admin/application/use-cases/verificar-empresa.use-case';
import { CancelarOfertaAdminUseCase } from '@/features/admin/application/use-cases/cancelar-oferta-admin.use-case';
import { AdminRepository } from '@/features/admin/domain/admin.repository';
import { EmpresaRepository } from '@/features/empresa/domain/empresa.repository';
import { OfertaRepository } from '@/features/oferta/domain/oferta.repository';
import { CreadorNotificaciones } from '@/shared/domain/creador-notificaciones.port';
import { EmpresaNoEncontradaException } from '@/features/empresa/domain/empresa-no-encontrado.exception';

const ADMIN_ID = 'aaaaaaa1-0000-0000-0000-000000000001';
const EMPRESA_ID = 'bbbbbbb1-0000-0000-0000-000000000002';
const EMPRESA_USER = 'bbbbbbb1-0000-0000-0000-000000000003';

function datos() {
  const adminRepo: jest.Mocked<AdminRepository> = {
    obtenerMetricas: jest.fn().mockResolvedValue({
      usuariosPorRol: [
        { clave: 'aspirante', total: 10 },
        { clave: 'empresa', total: 4 },
      ],
      ofertasPorEstado: [{ clave: 'publicada', total: 7 }],
      postulacionesPorEstado: [{ clave: 'postulado', total: 12 }],
      totalGrupos: 3,
      totalCurriculos: 9,
    }),
    listarOfertas: jest.fn().mockResolvedValue([]),
    listarEmpresasPendientes: jest.fn().mockResolvedValue([]),
  };
  const empresaRepo: jest.Mocked<EmpresaRepository> = {
    buscarPorUsuarioId: jest.fn(),
    buscarPorId: jest.fn().mockResolvedValue({
      id: EMPRESA_ID, usuarioId: EMPRESA_USER, nombre: 'Fintech', razonSocial: null,
      ruc: null, sector: null, descripcion: null, sitioWeb: null, logoUrl: null,
      ciudad: null, verificada: false, createdAt: new Date(), updatedAt: new Date(),
    }),
    crear: jest.fn(), actualizar: jest.fn(),
    cambiarVerificacion: jest.fn().mockResolvedValue({
      id: EMPRESA_ID, usuarioId: EMPRESA_USER, nombre: 'Fintech', razonSocial: null,
      ruc: null, sector: null, descripcion: null, sitioWeb: null, logoUrl: null,
      ciudad: null, verificada: true, createdAt: new Date(), updatedAt: new Date(),
    }),
  };
  const ofertaRepo: jest.Mocked<OfertaRepository> = {
    listarFeed: jest.fn(), listarPorAutor: jest.fn(), buscarPorId: jest.fn(), crear: jest.fn(),
    actualizar: jest.fn(), cambiarEstado: jest.fn(),
  };
  const notificaciones: jest.Mocked<CreadorNotificaciones> = { crear: jest.fn().mockResolvedValue(undefined) };
  return { adminRepo, empresaRepo, ofertaRepo, notificaciones };
}

describe('admin use-cases', () => {
  it('métricas agregadas llegan del repo', async () => {
    const d = datos();
    const out = await new ObtenerMetricasUseCase(d.adminRepo).execute({ adminId: ADMIN_ID });
    expect(out.totalGrupos).toBe(3);
    expect(out.usuariosPorRol[0].total).toBe(10);
  });

  it('verificar empresa: cambia estado Y notifica sistema al titular', async () => {
    const d = datos();
    const out = await new VerificarEmpresaUseCase(d.empresaRepo, d.notificaciones).execute({
      empresaId: EMPRESA_ID, verificada: true,
    });
    expect(d.empresaRepo.cambiarVerificacion).toHaveBeenCalledWith(EMPRESA_ID, true);
    expect(d.notificaciones.crear).toHaveBeenCalledWith({
      usuarioId: EMPRESA_USER, tipo: 'sistema', referenciaId: EMPRESA_ID,
    });
    expect(out.verificada).toBe(true);
  });

  it('revocar verificación NO notifica', async () => {
    const d = datos();
    await new VerificarEmpresaUseCase(d.empresaRepo, d.notificaciones).execute({
      empresaId: EMPRESA_ID, verificada: false,
    });
    expect(d.notificaciones.crear).not.toHaveBeenCalled();
  });

  it('empresa inexistente → 404', async () => {
    const d = datos();
    d.empresaRepo.buscarPorId.mockResolvedValue(null);
    await expect(
      new VerificarEmpresaUseCase(d.empresaRepo, d.notificaciones).execute({
        empresaId: EMPRESA_ID, verificada: true,
      }),
    ).rejects.toThrow(EmpresaNoEncontradaException);
  });

  it('cancelar oferta: solo si está publicada (VO de la oferta cierra la MT)', async () => {
    const d = datos();
    d.ofertaRepo.buscarPorId.mockResolvedValue({
      oferta: {
        id: 'cccccccc-0000-0000-0000-000000000001', autorTipo: 'empresa',
        autorId: EMPRESA_ID, tipoOferta: 'normal', titulo: 'x', descripcion: 'd',
        requisitos: null, habilidadesReq: [], modalidad: null, ubicacion: null,
        salarioMin: null, salarioMax: null, tipoContrato: null, objetivo: null,
        grupoId: null, fechaLimite: null, cupos: 1, estado: 'borrador',
        createdAt: new Date(), updatedAt: new Date(),
      },
      autorNombre: null, autorVerificado: false, autorLogoUrl: null, likes: 0, dislikes: 0,
    });

    await expect(
      new CancelarOfertaAdminUseCase(d.ofertaRepo).execute({
        ofertaId: 'cccccccc-0000-0000-0000-000000000001',
      }),
    ).rejects.toThrow(); // TransicionInvalida: borrador → cancelada NO es válida
    expect(d.ofertaRepo.cambiarEstado).not.toHaveBeenCalled();
  });
});
