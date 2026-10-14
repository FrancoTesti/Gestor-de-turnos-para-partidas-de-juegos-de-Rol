import { useState } from 'react';
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
  nivelObjeto: '1',
  idTienda: '',
  posicion: '0',
};

export default function ObjetoFormulario(props: ObjetoFormularioProps) {
  return <ObjetoFormularioBody key={JSON.stringify(props.objeto ?? null)} {...props} />;
}

function ObjetoFormularioBody({
  objeto,
  tiendas,
  onGuardar,
  onCancelar,
}: ObjetoFormularioProps) {
  const [form, setForm] = useState<FormularioObjeto>(() => objeto ? {
    nombre: objeto.nombre, descripcion: objeto.descripcion, tipoObjeto: objeto.tipoObjeto,
    valor: String(objeto.valor), nivelObjeto: String(objeto.nivelObjeto),
    idTienda: objeto.idTienda === null ? '' : String(objeto.idTienda), posicion: String(objeto.posicion),
  } : formularioVacio);
  const [esUnico, setEsUnico] = useState<boolean>(() => objeto ? (objeto.esUnico ?? false) : false);
  const [errores, setErrores] = useState<Errores>({});
  const [guardando, setGuardando] = useState(false);

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
    if (!Number.isSafeInteger(valor) || valor < 0) nuevos.valor = 'Ingresá un valor entero mayor o igual a cero.';
    if (!Number.isSafeInteger(nivel) || nivel < 1) nuevos.nivelObjeto = 'Ingresá un nivel entero mayor o igual a uno.';
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
        esUnico,
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

      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
        <input
          id="esUnicoCheck"
          type="checkbox"
          checked={esUnico}
          onChange={(e) => setEsUnico(e.target.checked)}
          disabled={guardando}
        />
        <label htmlFor="esUnicoCheck" style={{ fontWeight: 600, cursor: 'pointer' }}>
          Objeto Único (solo puede existir una vez por personaje / partida)
        </label>
      </div>

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
      <div style={{ margin: '0.25rem 0 0.75rem 0', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span>💡 Progresión RPG: +25% de valor por nivel superior.</span>
        {Number(form.nivelObjeto) > (objeto?.nivelObjeto ?? 1) && (
          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            onClick={() => {
              const nivelActual = Number(form.nivelObjeto) || 1;
              const nivelBase = objeto?.nivelObjeto ?? 1;
              const valorBase = objeto?.valor ?? (Number(form.valor) || 0);
              if (nivelActual > nivelBase && valorBase > 0) {
                const nuevoValor = Math.round(valorBase * (1 + (nivelActual - nivelBase) * 0.25));
                cambiar('valor', String(nuevoValor));
              }
            }}
          >
            ⚡ Calcular valor para Nivel {form.nivelObjeto} (+{((Number(form.nivelObjeto) - (objeto?.nivelObjeto ?? 1)) * 25)}%)
          </button>
        )}
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
