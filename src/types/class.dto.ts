export interface CrearClaseDTO {
  nombreClase: string;
  descripcionClase: string;
}

export interface ActualizarClaseDTO {
  nombreClase?: string;
  descripcionClase?: string;
}

export interface ClasePublicaDTO {
  idClase: number;
  nombreClase: string;
  descripcionClase: string;
}
