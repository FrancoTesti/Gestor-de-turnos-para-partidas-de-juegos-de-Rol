import { useState } from 'react';
import { useUser } from '../context/UserContext';
import UsuarioLista from '../components/usuarios/UsuarioLista';
import UsuarioDetalle from '../components/usuarios/UsuarioDetalle';
import UsuarioFormulario, { type UsuarioFormData } from '../components/usuarios/UsuarioFormulario';
import { AvisoModal } from '../components/ui';
import type { Usuario } from '../interfaces';
import { api } from '../services/api';
import './UsersPage.css';

export default function UsersPage() {
  const { usuarios, usuarioLogueado, recargar, rolDe, logout, cargandoSesion } = useUser();
  const [selected, setSelected] = useState<Usuario>();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const own = selected?.idUsuario === usuarioLogueado?.idUsuario;
  const save = async (data: UsuarioFormData) => {
    try {
      setError('');
      setBusy(true);
      const { idUsuario: _id, ...payload } = data;
      await api(selected ? `/usuarios/${selected.idUsuario}` : '/usuarios', selected ? 'PUT' : 'POST', payload);
      if (selected && payload.contrasena) await logout();
      else await recargar();
      setEditing(false); setSelected(undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setBusy(false);
    }
  };
  const remove = async (id: number) => {
    if (!window.confirm('¿Eliminar tu cuenta? Si tiene personajes o partidas, primero deberás resolver esas relaciones.')) return;
    setBusy(true); setError('');
    try { await api(`/usuarios/${id}`, 'DELETE'); await logout(); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo eliminar'); }
    finally { setBusy(false); }
  };
  return <section className="users-page">
    <h1>Gestión de Usuarios</h1>
    {error && <p role="alert">{error}</p>}
    <AvisoModal
      isOpen={Boolean(error)}
      titulo="Aviso de Usuarios"
      mensaje={error}
      onClose={() => setError('')}
    />
    {usuarioLogueado && rolDe(usuarioLogueado.idUsuario) === 'anfitrion' && !editing && <button className="btn-primary" onClick={() => { setSelected(undefined); setEditing(true); }}>Nuevo usuario</button>}
    {editing ? <UsuarioFormulario usuario={selected} onGuardar={save} onCancelar={() => setEditing(false)} /> : <>
      <UsuarioLista usuarios={usuarios} onSeleccionar={setSelected} cargando={busy || (cargandoSesion && usuarios.length === 0)} usuarioSeleccionadoId={selected?.idUsuario} />
      <UsuarioDetalle usuario={selected} onCerrar={() => setSelected(undefined)} onEditar={own ? () => setEditing(true) : undefined} onEliminar={own ? remove : undefined} />
    </>}
  </section>;
}
