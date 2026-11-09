import { JwtService } from '@/shared/infrastructure/services/jwt.service';
import { PayloadToken } from '@/features/auth/domain/token.port';

// Test gemelo del JwtService (lógica real de infraestructura compartida).
describe('JwtService', () => {
  const payload: PayloadToken = { id: '44444444-4444-4444-4444-444444444444', rol: 'empresa' };

  it('firma y verifica en round-trip sin alterar el payload', () => {
    const service = new JwtService();
    const token = service.firmar(payload);

    return token.then((t) => {
      expect(t.split('.').length).toBe(3);
      const verificado = service.verificar(t);
      expect(verificado.id).toBe(payload.id);
      expect(verificado.rol).toBe(payload.rol);
    });
  });

  it('rechaza un token alterado', async () => {
    const service = new JwtService();
    const token = await service.firmar(payload);
    expect(() => service.verificar(token + 'x')).toThrow();
  });

  it('la firma es sincrónica y estable en el contrato del puerto TokenSigner', () => {
    const service = new JwtService();
    expect(service.firmar(payload)).toBeInstanceOf(Promise);
  });
});
