import { useCallback, useEffect, useState } from 'react';
import './App.css';
import UsuarioDetalle from './components/usuarios/UsuarioDetalle';
import UsuarioFormulario, {
  type UsuarioFormData,
} from './components/usuarios/UsuarioFormulario';
import UsuarioLista from './components/usuarios/UsuarioLista';
import type { Usuario } from './interfaces';
import {
  actualizarUsuario,
  crearUsuario,
  eliminarUsuario,
  obtenerUsuarioPorId,
  obtenerUsuarios,
  type ActualizarUsuarioData,
} from './services/usuario.service';

type Vista = 'listado' | 'formulario';

function mensajeDeError(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado';
}

export default function App() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState<Usuario | undefined>();
  const [vista, setVista] = useState<Vista>('listado');
  const [cargandoLista, setCargandoLista] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorLista, setErrorLista] = useState<string | null>(null);
  const [errorDetalle, setErrorDetalle] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const cargarUsuarios = useCallback(async () => {
    setCargandoLista(true);
    setErrorLista(null);

    try {
      const usuariosObtenidos = await obtenerUsuarios();
      setUsuarios(usuariosObtenidos);
    } catch (error) {
      setErrorLista(mensajeDeError(error));
    } finally {
      setCargandoLista(false);
    }
  }, []);

  useEffect(() => {
    void cargarUsuarios();
  }, [cargarUsuarios]);

  async function seleccionarUsuario(usuario: Usuario): Promise<void> {
    setCargandoDetalle(true);
    setErrorDetalle(null);
    setMensaje(null);

    try {
      const detalle = await obtenerUsuarioPorId(usuario.idUsuario);
      setUsuarioSeleccionado(detalle);
    } catch (error) {
      setUsuarioSeleccionado(null);
      setErrorDetalle(mensajeDeError(error));
    } finally {
      setCargandoDetalle(false);
    }
  }

  function abrirCreacion(): void {
    setUsuarioEnEdicion(undefined);
    setMensaje(null);
    setErrorLista(null);
    setVista('formulario');
  }

  function abrirEdicion(usuario: Usuario): void {
    setUsuarioEnEdicion(usuario);
    setMensaje(null);
    setErrorLista(null);
    setVista('formulario');
  }

  function cerrarFormulario(): void {
    setUsuarioEnEdicion(undefined);
    setVista('listado');
  }

  async function guardarUsuario(data: UsuarioFormData): Promise<void> {
    setErrorLista(null);
    setMensaje(null);

    try {
      if (data.idUsuario !== undefined) {
        const { idUsuario, contrasena, ...campos } = data;
        const datosActualizacion: ActualizarUsuarioData = {
          ...campos,
          ...(contrasena ? { contrasena } : {}),
        };
        const actualizado = await actualizarUsuario(idUsuario, datosActualizacion);

        setUsuarios((actuales) =>
          actuales.map((usuario) =>
            usuario.idUsuario === actualizado.idUsuario ? actualizado : usuario,
          ),
        );
        setUsuarioSeleccionado(actualizado);
        setMensaje('Usuario actualizado correctamente.');
      } else {
        const { idUsuario: _idUsuario, contrasena, ...campos } = data;
        if (!contrasena) {
          setErrorLista('La contraseña es obligatoria para crear un usuario.');
          return;
        }

        const creado = await crearUsuario({ ...campos, contrasena });
        setUsuarios((actuales) => [...actuales, creado]);
        setUsuarioSeleccionado(creado);
        setMensaje('Usuario creado correctamente.');
      }

      cerrarFormulario();
    } catch (error) {
      setErrorLista(mensajeDeError(error));
    }
  }

  async function borrarUsuario(idUsuario: number): Promise<void> {
    const usuario = usuarios.find((item) => item.idUsuario === idUsuario);
    const confirmado = window.confirm(
      `¿Seguro que querés eliminar a ${usuario?.nickname ?? `usuario #${idUsuario}`}?`,
    );
    if (!confirmado) return;

    setErrorLista(null);
    setMensaje(null);

    try {
      await eliminarUsuario(idUsuario);
      setUsuarios((actuales) =>
        actuales.filter((item) => item.idUsuario !== idUsuario),
      );
      if (usuarioSeleccionado?.idUsuario === idUsuario) {
        setUsuarioSeleccionado(null);
      }
      setMensaje('Usuario eliminado correctamente.');
    } catch (error) {
      setErrorLista(mensajeDeError(error));
    }
  }

  return (
    <main className="app-container">
      <header className="app-header">
        <div>
          <p className="app-eyebrow">Gestor de turnos para juegos de rol</p>
          <h1>Administración de usuarios</h1>
        </div>

        {vista === 'listado' && (
          <button type="button" className="btn-nuevo" onClick={abrirCreacion}>
            Nuevo usuario
          </button>
        )}
      </header>

      {mensaje && (
        <p className="mensaje mensaje-exito" role="status">
          {mensaje}
        </p>
      )}

      {errorLista && (
        <div className="mensaje mensaje-error" role="alert">
          <span>{errorLista}</span>
          {vista === 'listado' && (
            <button type="button" onClick={() => void cargarUsuarios()}>
              Reintentar
            </button>
          )}
        </div>
      )}

      {vista === 'formulario' ? (
        <section className="panel-formulario">
          <UsuarioFormulario
            usuario={usuarioEnEdicion}
            onGuardar={guardarUsuario}
            onCancelar={cerrarFormulario}
          />
        </section>
      ) : (
        <div className="usuarios-layout">
          <UsuarioLista
            usuarios={usuarios}
            usuarioSeleccionadoId={usuarioSeleccionado?.idUsuario}
            onSeleccionar={(usuario) => void seleccionarUsuario(usuario)}
            onEditar={abrirEdicion}
            onEliminar={(idUsuario) => void borrarUsuario(idUsuario)}
            cargando={cargandoLista}
          />

          <aside className="panel-detalle">
            <UsuarioDetalle
              usuario={usuarioSeleccionado}
              cargando={cargandoDetalle}
              error={errorDetalle}
              onCerrar={() => {
                setUsuarioSeleccionado(null);
                setErrorDetalle(null);
              }}
              onEditar={abrirEdicion}
              onEliminar={(idUsuario) => void borrarUsuario(idUsuario)}
            />
          </aside>
        </div>
      )}
    </main>
  );
}
