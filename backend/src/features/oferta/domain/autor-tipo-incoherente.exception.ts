import { HttpException } from '@/shared/domain/http.exception';

// 422: combinación autor_tipo/tipo_oferta incoherente (duplicación voluntaria
// del CHECK de esquema.sql a nivel de dominio — la DB es el segundo cinturón).
export class AutorTipoIncoherenteException extends HttpException {
  constructor(autorTipo: string, tipoOferta: string) {
    super(
      `Combinación inválida: autor "${autorTipo}" solo puede publicar ` +
        (autorTipo === 'empresa' ? "ofertas 'normal' o 'dash'" : "ofertas 'feat'") +
        ` (recibió: ${tipoOferta})`,
      422,
    );
  }
}
