// Excepción HTTP base. Todas las excepciones de dominio heredan de aquí,
// de modo que el error.middleware.ts pueda traducirlas a respuestas HTTP
// sin lógica de negocio en el middleware.
export class HttpException extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
  }
}
