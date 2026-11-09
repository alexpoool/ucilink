// Contrato base de un caso de uso: un único método público execute().
export interface UseCase<Input, Output> {
  execute(input: Input): Promise<Output>;
}
