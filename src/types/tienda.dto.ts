export interface CrearTiendaDTO {
  nombre: string;
  claseTienda: string;
  idClase?: number | null;
}

export interface ActualizarTiendaDTO {
  nombre?: string;
  claseTienda?: string;
  idClase?: number | null;
}

export interface TiendaPublicaDTO {
  idTienda: number;
  nombre: string;
  claseTienda: string;
  idClase: number | null;
}
