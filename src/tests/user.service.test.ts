import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsuarioService, NicknameEnUsoError } from '../services/user.service';
import { UsuarioRepository } from '../repositories/user.repository';
import { Usuario } from '../entities/User.entity';
import { UniqueConstraintViolationException } from '@mikro-orm/core';

describe('UserService', () => {
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
      findAll: vi.fn(),
      findById: vi.fn(),
      findByNickname: vi.fn(),
      create: vi.fn(),
      assign: vi.fn(),
      saveChanges: vi.fn(),
      delete: vi.fn(),
    };
    service = new UsuarioService(mockRepo as UsuarioRepository);
  });

  describe('getAll', () => {
    it('debe retornar los usuarios en formato público (sin contraseña)', async () => {
      vi.mocked(mockRepo.findAll!).mockResolvedValue([mockUsuario]);

      const resultado = await service.getAll();

      expect(resultado).toEqual([
        {
          idUsuario: 1,
          nombreUsuario: 'Juan Perez',
          imagen: 'avatar.jpg',
          nickname: 'jperez',
        },
      ]);
      expect(resultado[0]).not.toHaveProperty('contrasena');
      expect(mockRepo.findAll).toHaveBeenCalledOnce();
    });
  });

  describe('getById', () => {
    it('debe retornar el DTO público del usuario cuando existe', async () => {
      vi.mocked(mockRepo.findById!).mockResolvedValue(mockUsuario);

      const resultado = await service.getById(1);

      expect(resultado).toEqual({
        idUsuario: 1,
        nombreUsuario: 'Juan Perez',
        imagen: 'avatar.jpg',
        nickname: 'jperez',
      });
    });

    it('debe retornar null cuando el usuario no existe', async () => {
      vi.mocked(mockRepo.findById!).mockResolvedValue(null);

      const resultado = await service.getById(999);

      expect(resultado).toBeNull();
    });
  });

  describe('createUser', () => {
    const dtoCrear = {
      nombreUsuario: 'Carlos',
      contrasena: 'pass123',
      imagen: '',
      nickname: 'carlitos',
    };

    it('debe crear un usuario exitosamente cuando el nickname está libre', async () => {
      vi.mocked(mockRepo.findByNickname!).mockResolvedValue(null);
      vi.mocked(mockRepo.create!).mockReturnValue({ ...dtoCrear, idUsuario: 2 } as Usuario);
      vi.mocked(mockRepo.saveChanges!).mockResolvedValue();

      const resultado = await service.createUser(dtoCrear);

      expect(resultado).toEqual({
        idUsuario: 2,
        nombreUsuario: 'Carlos',
        imagen: '',
        nickname: 'carlitos',
      });
      expect(mockRepo.saveChanges).toHaveBeenCalledOnce();
    });

    it('debe lanzar NicknameEnUsoError si el nickname ya existe en la BD previa', async () => {
      vi.mocked(mockRepo.findByNickname!).mockResolvedValue(mockUsuario);

      await expect(
        service.createUser({ ...dtoCrear, nickname: 'jperez' }),
      ).rejects.toThrow(NicknameEnUsoError);
    });

    it('debe capturar UniqueConstraintViolationException al guardar y lanzar NicknameEnUsoError', async () => {
      vi.mocked(mockRepo.findByNickname!).mockResolvedValue(null);
      vi.mocked(mockRepo.create!).mockReturnValue({ ...dtoCrear, idUsuario: 3 } as Usuario);
      vi.mocked(mockRepo.saveChanges!).mockRejectedValue(
        new UniqueConstraintViolationException(new Error('Duplicate entry')),
      );

      await expect(service.createUser(dtoCrear)).rejects.toThrow(NicknameEnUsoError);
    });
  });

  describe('updateUser', () => {
    it('debe actualizar los datos exitosamente cuando el usuario existe', async () => {
      vi.mocked(mockRepo.findById!).mockResolvedValue({ ...mockUsuario });
      vi.mocked(mockRepo.findByNickname!).mockResolvedValue(null);
      vi.mocked(mockRepo.saveChanges!).mockResolvedValue();

      const resultado = await service.updateUser(1, { nickname: 'nuevoNick' });

      expect(resultado).not.toBeNull();
      expect(mockRepo.assign).toHaveBeenCalled();
      expect(mockRepo.saveChanges).toHaveBeenCalledOnce();
    });

    it('debe retornar null si el usuario a actualizar no existe', async () => {
      vi.mocked(mockRepo.findById!).mockResolvedValue(null);

      const resultado = await service.updateUser(999, { nombreUsuario: 'Nuevo' });

      expect(resultado).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('debe retornar true cuando elimina un usuario existente', async () => {
      vi.mocked(mockRepo.findById!).mockResolvedValue(mockUsuario);
      vi.mocked(mockRepo.delete!).mockResolvedValue();

      const resultado = await service.deleteUser(1);

      expect(resultado).toBe(true);
      expect(mockRepo.delete).toHaveBeenCalledWith(mockUsuario);
    });

    it('debe retornar false cuando se intenta eliminar un usuario inexistente', async () => {
      vi.mocked(mockRepo.findById!).mockResolvedValue(null);

      const resultado = await service.deleteUser(999);

      expect(resultado).toBe(false);
    });
  });
});
