import { useEffect, useState } from 'react';
import type { Tienda } from '../../interfaces';
import type { CrearObjetoData, ObjetoPublico } from '../../services/objeto.service';
import './objetos.css';

interface ObjetoFormularioProps {
  objeto?: ObjetoPublico;
  tiendas: Tienda[];
  onGuardar: (datos: CrearObjetoData) => Promise<void> | void;
  onCancelar: () => void;
}

interface FormularioObjeto {
  nombre: string;
  descripcion: string;
  tipoObjeto: string;
  valor: string;
  nivelObjeto: string;
  idTienda: string;
  posicion: string;
}

type Errores = Partial<Record<keyof FormularioObjeto, string>>;

const formularioVacio: FormularioObjeto = {
  nombre: '',
  descripcion: '',
  tipoObjeto: '',
  valor: '0',
  nivelObjeto: '0',
  idTienda: '',
  posicion: '0',
};

export default function ObjetoFormulario({
  objeto,
  tiendas,
  onGuardar,
  onCancelar,
}: ObjetoFormularioProps) {
  const [form, setForm] = useState<FormularioObjeto>(formularioVacio);
  const [errores, setErrores] = useState<Errores>({});
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setForm(
      objeto
        ? {
            nombre: objeto.nombre,
            descripcion: objeto.descripcion,
            tipoObjeto: objeto.tipoObjeto,
            valor: String(objeto.valor),
            nivelObjeto: String(objeto.nivelObjeto),
            idTienda: objeto.idTienda === null ? '' : String(objeto.idTienda),
            posicion: String(objeto.posicion),
          }
        : formularioVacio,
    );
    setErrores({});
  }, [objeto]);

  function cambiar(campo: keyof FormularioObjeto, valor: string): void {
    setForm((actual) => ({ ...actual, [campo]: valor }));
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }));
  }

  function validar(): boolean {
    const nuevos: Errores = {};
    const valor = Number(form.valor);
    const nivel = Number(form.nivelObjeto);
    const posicion = Number(form.posicion);

    if (!form.nombre.trim()) nuevos.nombre = 'El nombre es obligatorio.';
    else if (form.nombre.trim().length > 100) nuevos.nombre = 'No puede superar 100 caracteres.';
    if (!form.descripcion.trim()) nuevos.descripcion = 'La descripción es obligatoria.';
    if (!form.tipoObjeto.trim()) nuevos.tipoObjeto = 'El tipo es obligatorio.';
    else if (form.tipoObjeto.trim().length > 50) nuevos.tipoObjeto = 'No puede superar 50 caracteres.';
    if (!Number.isFinite(valor) || valor < 0) nuevos.valor = 'Ingresá un valor mayor o igual a cero.';
    if (!Number.isInteger(nivel) || nivel < 0) nuevos.nivelObjeto = 'Ingresá un nivel entero mayor o igual a cero.';
    if (!Number.isInteger(posicion) || posicion < 0) nuevos.posicion = 'Ingresá una posición entera mayor o igual a cero.';

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  async function enviar(evento: React.FormEvent): Promise<void> {
    evento.preventDefault();
    if (!validar()) return;

    setGuardando(true);
    try {
      await onGuardar({
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        tipoObjeto: form.tipoObjeto.trim(),
        valor: Number(form.valor),
        nivelObjeto: Number(form.nivelObjeto),
        idTienda: form.idTienda ? Number(form.idTienda) : null,
        posicion: Number(form.posicion),
      });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form className="objeto-formulario" onSubmit={(evento) => void enviar(evento)} noValidate>
      <h2>{objeto ? 'Editar objeto' : 'Nuevo objeto'}</h2>

      <Campo label="Nombre" error={errores.nombre}>
        <input value={form.nombre} onChange={(e) => cambiar('nombre', e.target.value)} disabled={guardando} />
      </Campo>

      <Campo label="Descripción" error={errores.descripcion}>
        <textarea rows={4} value={form.descripcion} onChange={(e) => cambiar('descripcion', e.target.value)} disabled={guardando} />
      </Campo>

      <Campo label="Tipo" error={errores.tipoObjeto}>
        <input value={form.tipoObjeto} onChange={(e) => cambiar('tipoObjeto', e.target.value)} placeholder="Arma, armadura, poción..." disabled={guardando} />
      </Campo>

      <div className="objeto-campos-numericos">
        <Campo label="Valor" error={errores.valor}>
          <input type="number" min="0" step="0.01" value={form.valor} onChange={(e) => cambiar('valor', e.target.value)} disabled={guardando} />
        </Campo>
        <Campo label="Nivel" error={errores.nivelObjeto}>
          <input type="number" min="0" step="1" value={form.nivelObjeto} onChange={(e) => cambiar('nivelObjeto', e.target.value)} disabled={guardando} />
        </Campo>
        <Campo label="Posición" error={errores.posicion}>
          <input type="number" min="0" step="1" value={form.posicion} onChange={(e) => cambiar('posicion', e.target.value)} disabled={guardando} />
        </Campo>
      </div>

      <Campo label="Tienda (opcional)">
        <select value={form.idTienda} onChange={(e) => cambiar('idTienda', e.target.value)} disabled={guardando}>
          <option value="">Sin tienda</option>
          {tiendas.map((tienda) => (
            <option key={tienda.idTienda} value={tienda.idTienda}>{tienda.nombre}</option>
          ))}
        </select>
      </Campo>

      <div className="form-actions">
        <button className="btn-primary" type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar'}</button>
        <button className="btn-secondary" type="button" onClick={onCancelar} disabled={guardando}>Cancelar</button>
      </div>
    </form>
  );
}

function Campo({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="form-group">
      <span>{label}</span>
      {children}
      {error && <span className="error-text">{error}</span>}
    </label>
  );
}
