import { RolUsuario } from './rol.vo';

// Entidad pura del dominio (sin decoradores ni dependencias de ORM).
// `passwordHash` solo viaja de la persistencia al caso de uso de login;
// nunca se expone en los DTOs de respuesta (auth.mapper).
export interface Usuario {
  id: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  passwordHash: string;
}
