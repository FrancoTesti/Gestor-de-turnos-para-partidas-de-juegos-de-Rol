import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsuarioService, NicknameEnUsoError } from '../services/usuario.service';
import { UsuarioRepository } from '../repositories/usuario.repository';
import { Usuario } from '../entities/Usuario.entity';
import { UniqueConstraintViolationException } from '@mikro-orm/core';

describe('UsuarioService', () => {
  let mockRepo: Partial<UsuarioRepository>;
  let service: UsuarioService;

  const mockUsuario: Usuario = {
    idUsuario: 1,
    nombreUsuario: 'Juan Perez',
    contrasena: 'secreto123',
    imagen: 'avatar.jpg',
    nickname: 'jperez',
  };

  beforeEach(() => {
    mockRepo = {
      buscarTodos: vi.fn(),
      buscarPorId: vi.fn(),
      buscarPorNickname: vi.fn(),
      crear: vi.fn(),
      asignar: vi.fn(),
      guardarCambios: vi.fn(),
      eliminar: vi.fn(),
    };
    service = new UsuarioService(mockRepo as UsuarioRepository);
  });

  describe('obtenerTodos', () => {
    it('debe retornar los usuarios en formato público (sin contraseña)', async () => {
      vi.mocked(mockRepo.buscarTodos!).mockResolvedValue([mockUsuario]);

      const resultado = await service.obtenerTodos();

      expect(resultado).toEqual([
        {
          idUsuario: 1,
          nombreUsuario: 'Juan Perez',
          imagen: 'avatar.jpg',
          nickname: 'jperez',
        },
      ]);
      expect(resultado[0]).not.toHaveProperty('contrasena');
      expect(mockRepo.buscarTodos).toHaveBeenCalledOnce();
    });
  });

  describe('obtenerPorId', () => {
    it('debe retornar el DTO público del usuario cuando existe', async () => {
      vi.mocked(mockRepo.buscarPorId!).mockResolvedValue(mockUsuario);

      const resultado = await service.obtenerPorId(1);

      expect(resultado).toEqual({
        idUsuario: 1,
        nombreUsuario: 'Juan Perez',
        imagen: 'avatar.jpg',
        nickname: 'jperez',
      });
    });

    it('debe retornar null cuando el usuario no existe', async () => {
      vi.mocked(mockRepo.buscarPorId!).mockResolvedValue(null);

      const resultado = await service.obtenerPorId(999);

      expect(resultado).toBeNull();
    });
  });

  describe('crearUsuario', () => {
    const dtoCrear = {
      nombreUsuario: 'Carlos',
      contrasena: 'pass123',
      imagen: '',
      nickname: 'carlitos',
    };

    it('debe crear un usuario exitosamente cuando el nickname está libre', async () => {
      vi.mocked(mockRepo.buscarPorNickname!).mockResolvedValue(null);
      vi.mocked(mockRepo.crear!).mockReturnValue({ ...dtoCrear, idUsuario: 2 } as Usuario);
      vi.mocked(mockRepo.guardarCambios!).mockResolvedValue();

      const resultado = await service.crearUsuario(dtoCrear);

      expect(resultado).toEqual({
        idUsuario: 2,
        nombreUsuario: 'Carlos',
        imagen: '',
        nickname: 'carlitos',
      });
      expect(mockRepo.guardarCambios).toHaveBeenCalledOnce();
    });

    it('debe lanzar NicknameEnUsoError si el nickname ya existe en la BD previa', async () => {
      vi.mocked(mockRepo.buscarPorNickname!).mockResolvedValue(mockUsuario);

      await expect(
        service.crearUsuario({ ...dtoCrear, nickname: 'jperez' }),
      ).rejects.toThrow(NicknameEnUsoError);
    });

    it('debe capturar UniqueConstraintViolationException al guardar y lanzar NicknameEnUsoError', async () => {
      vi.mocked(mockRepo.buscarPorNickname!).mockResolvedValue(null);
      vi.mocked(mockRepo.crear!).mockReturnValue({ ...dtoCrear, idUsuario: 3 } as Usuario);
      vi.mocked(mockRepo.guardarCambios!).mockRejectedValue(
        new UniqueConstraintViolationException(new Error('Duplicate entry')),
      );

      await expect(service.crearUsuario(dtoCrear)).rejects.toThrow(NicknameEnUsoError);
    });
  });

  describe('actualizarUsuario', () => {
    it('debe actualizar los datos exitosamente cuando el usuario existe', async () => {
      vi.mocked(mockRepo.buscarPorId!).mockResolvedValue({ ...mockUsuario });
      vi.mocked(mockRepo.buscarPorNickname!).mockResolvedValue(null);
      vi.mocked(mockRepo.guardarCambios!).mockResolvedValue();

      const resultado = await service.actualizarUsuario(1, { nickname: 'nuevoNick' });

      expect(resultado).not.toBeNull();
      expect(mockRepo.asignar).toHaveBeenCalled();
      expect(mockRepo.guardarCambios).toHaveBeenCalledOnce();
    });

    it('debe retornar null si el usuario a actualizar no existe', async () => {
      vi.mocked(mockRepo.buscarPorId!).mockResolvedValue(null);

      const resultado = await service.actualizarUsuario(999, { nombreUsuario: 'Nuevo' });

      expect(resultado).toBeNull();
    });
  });

  describe('eliminarUsuario', () => {
    it('debe retornar true cuando elimina un usuario existente', async () => {
      vi.mocked(mockRepo.buscarPorId!).mockResolvedValue(mockUsuario);
      vi.mocked(mockRepo.eliminar!).mockResolvedValue();

      const resultado = await service.eliminarUsuario(1);

      expect(resultado).toBe(true);
      expect(mockRepo.eliminar).toHaveBeenCalledWith(mockUsuario);
    });

    it('debe retornar false cuando se intenta eliminar un usuario inexistente', async () => {
      vi.mocked(mockRepo.buscarPorId!).mockResolvedValue(null);

      const resultado = await service.eliminarUsuario(999);

      expect(resultado).toBe(false);
    });
  });
});
