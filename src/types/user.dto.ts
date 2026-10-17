export interface CrearUsuarioDTO {
  nombreUsuario: string;
  contrasena: string;
  imagen: string;
  nickname: string;
}

export type ActualizarUsuarioDTO = Partial<CrearUsuarioDTO>;

export interface UsuarioPublicoDTO {
  idUsuario: number;
  nombreUsuario: string;
  imagen: string;
  nickname: string;
}