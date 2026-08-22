export interface CrearObjetoDTO {
  valor: number;
  descripcion: string;
  nombre: string;
  nivelObjeto: number;
  tipoObjeto: string;
  idTienda?: number | null;
  posicion?: number;
}

export interface ActualizarObjetoDTO {
  valor?: number;
  descripcion?: string;
  nombre?: string;
  nivelObjeto?: number;
  tipoObjeto?: string;
  idTienda?: number | null;
  posicion?: number;
}

export interface ObjetoPublicoDTO {
  idObjeto: number;
  valor: number;
  descripcion: string;
  nombre: string;
  nivelObjeto: number;
  tipoObjeto: string;
  idTienda: number | null;
  posicion: number;
}
