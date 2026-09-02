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
  idPersonaje: number | null;
  numInventario: number | null;
  posicion: number;
}

export interface ComprarObjetoDTO {
  idPersonaje: number;
  numInventario: number;
  posicion: number;
}

export interface ResultadoCompraObjetoDTO {
  objeto: ObjetoPublicoDTO;
  idPersonaje: number;
  numInventario: number;
  dineroRestante: number;
}
