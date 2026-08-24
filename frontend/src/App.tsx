import { useState, useEffect } from 'react';
import type { Clase, Personaje } from './interfaces';
import { MOCK_CLASES, MOCK_PERSONAJES } from './mockData';

// Modulo de Clases
import ClaseLista from './components/clases/ClaseLista';
import ClaseFormulario from './components/clases/ClaseFormulario';
import ClaseDetalle from './components/clases/ClaseDetalle';
import {
  obtenerClases,
  crearClase,
  actualizarClase,
  eliminarClase,
  type CrearClaseData,
} from './services/clase.service';

// Modulo de Personajes
import PersonajeLista from './components/personajes/PersonajeLista';
import PersonajeFormulario from './components/personajes/PersonajeFormulario';
import PersonajeDetalle from './components/personajes/PersonajeDetalle';
import {
  obtenerPersonajes,
  crearPersonaje,
  actualizarPersonaje,
  eliminarPersonaje,
  type CrearPersonajeData,
} from './services/personaje.service';

type ModuloNavegacion = 'clases' | 'personajes' | 'inicio';

export default function MenuApp() {
  const [modulo, setModulo] = useState<ModuloNavegacion>('clases');

  // Estado del módulo de Clases
  const [clases, setClases] = useState<Clase[]>([]);
  const [cargandoClases, setCargandoClases] = useState(false);
  const [modoClase, setModoClase] = useState<'listado' | 'crear' | 'editar' | 'detalle'>('listado');
  const [claseSeleccionada, setClaseSeleccionada] = useState<Clase | null>(null);

  // Estado del módulo de Personajes
  const [personajes, setPersonajes] = useState<Personaje[]>([]);
  const [cargandoPersonajes, setCargandoPersonajes] = useState(false);
  const [modoPersonaje, setModoPersonaje] = useState<'listado' | 'crear' | 'editar' | 'detalle'>('listado');
  const [personajeSeleccionado, setPersonajeSeleccionado] = useState<Personaje | null>(null);

  const [mensajeGlobal, setMensajeGlobal] = useState<string | null>(null);

  // Cargar Clases al iniciar
  const fetchClases = async () => {
    setCargandoClases(true);
    try {
      const data = await obtenerClases();
      setClases(data);
    } catch {
      // Fallback a Mock Data si no hay backend activo
      setClases(MOCK_CLASES);
    } finally {
      setCargandoClases(false);
    }
  };

  // Cargar Personajes al iniciar
  const fetchPersonajes = async () => {
    setCargandoPersonajes(true);
    try {
      const data = await obtenerPersonajes();
      setPersonajes(data);
    } catch {
      // Fallback a Mock Data si no hay backend activo
      setPersonajes(MOCK_PERSONAJES);
    } finally {
      setCargandoPersonajes(false);
    }
  };

  useEffect(() => {
    fetchClases();
    fetchPersonajes();
  }, []);

  // Handler Guardar Clase
  async function handleGuardarClase(data: CrearClaseData) {
    if (modoClase === 'editar' && claseSeleccionada) {
      try {
        await actualizarClase(claseSeleccionada.idClase, data);
        setMensajeGlobal(`Clase '${data.nombreClase}' actualizada con éxito.`);
      } catch {
        setClases((prev) =>
          prev.map((c) =>
            c.idClase === claseSeleccionada.idClase ? { ...c, ...data } : c
          )
        );
      }
    } else {
      try {
        await crearClase(data);
        setMensajeGlobal(`Clase '${data.nombreClase}' creada con éxito.`);
      } catch {
        const nuevoId = clases.length > 0 ? Math.max(...clases.map((c) => c.idClase)) + 1 : 1;
        setClases((prev) => [...prev, { idClase: nuevoId, ...data }]);
      }
    }
    await fetchClases();
    setModoClase('listado');
    setClaseSeleccionada(null);
  }

  // Handler Eliminar Clase
  async function handleEliminarClase(idClase: number) {
    try {
      await eliminarClase(idClase);
      setMensajeGlobal('Clase eliminada correctamente.');
    } catch {
      setClases((prev) => prev.filter((c) => c.idClase !== idClase));
    }
    await fetchClases();
    if (claseSeleccionada?.idClase === idClase) {
      setClaseSeleccionada(null);
      setModoClase('listado');
    }
  }

  // Handler Guardar Personaje
  async function handleGuardarPersonaje(data: CrearPersonajeData) {
    if (modoPersonaje === 'editar' && personajeSeleccionado) {
      try {
        await actualizarPersonaje(personajeSeleccionado.idPersonaje, data);
        setMensajeGlobal(`Personaje '${data.nombreFicticio}' actualizado con éxito.`);
      } catch {
        setPersonajes((prev) =>
          prev.map((p) =>
            p.idPersonaje === personajeSeleccionado.idPersonaje
              ? {
                  ...p,
                  nombreFicticio: data.nombreFicticio,
                  raza: data.raza,
                  idClase: data.idClase,
                  idUsuarioJugador: data.idUsuarioJugador,
                  idPartida: data.idPartida,
                  nivel: data.nivel ?? p.nivel,
                  xp: data.xp ?? p.xp,
                  dinero: data.dinero ?? p.dinero,
                }
              : p
          )
        );
      }
    } else {
      try {
        await crearPersonaje(data);
        setMensajeGlobal(`Personaje '${data.nombreFicticio}' creado exitosamente.`);
      } catch {
        const nuevoId = personajes.length > 0 ? Math.max(...personajes.map((p) => p.idPersonaje)) + 1 : 1;
        setPersonajes((prev) => [
          ...prev,
          {
            idPersonaje: nuevoId,
            nombreFicticio: data.nombreFicticio,
            raza: data.raza,
            idClase: data.idClase,
            idUsuarioJugador: data.idUsuarioJugador,
            idPartida: data.idPartida,
            nivel: data.nivel ?? 1,
            xp: data.xp ?? 0,
            dinero: data.dinero ?? 100,
          },
        ]);
      }
    }
    await fetchPersonajes();
    setModoPersonaje('listado');
    setPersonajeSeleccionado(null);
  }

  // Handler Eliminar Personaje
  async function handleEliminarPersonaje(idPersonaje: number) {
    try {
      await eliminarPersonaje(idPersonaje);
      setMensajeGlobal('Personaje eliminado correctamente.');
    } catch {
      setPersonajes((prev) => prev.filter((p) => p.idPersonaje !== idPersonaje));
    }
    await fetchPersonajes();
    if (personajeSeleccionado?.idPersonaje === idPersonaje) {
      setPersonajeSeleccionado(null);
      setModoPersonaje('listado');
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: '1.5rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 style={{ color: '#2b6cb0', marginBottom: '0.5rem' }}>
          Gestor de Turnos — Juegos de Rol
        </h1>
        <p style={{ color: '#718096', margin: 0 }}>
          Módulo desarrollado por <strong>Alejandro Ciesco</strong> (Clase y Personaje)
        </p>
      </header>

      {/* Navbar de Modulos */}
      <nav
        style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '0.75rem',
        }}
      >
        <button
          type="button"
          onClick={() => setModulo('clases')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: modulo === 'clases' ? '#3182ce' : '#edf2f7',
            color: modulo === 'clases' ? 'white' : '#4a5568',
          }}
        >
          🛡️ CRUD de Clases
        </button>

        <button
          type="button"
          onClick={() => setModulo('personajes')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: modulo === 'personajes' ? '#805ad5' : '#edf2f7',
            color: modulo === 'personajes' ? 'white' : '#4a5568',
          }}
        >
          🧙‍♂️ Crear Personaje & Listado
        </button>
      </nav>

      {/* Alerta de Mensaje Global */}
      {mensajeGlobal && (
        <div
          style={{
            background: '#ebf8ff',
            border: '1px solid #bee3f8',
            color: '#2b6cb0',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{mensajeGlobal}</span>
          <button
            type="button"
            onClick={() => setMensajeGlobal(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* MÓDULO DE CLASES */}
      {modulo === 'clases' && (
        <div>
          {modoClase === 'listado' && (
            <ClaseLista
              clases={clases}
              cargando={cargandoClases}
              claseSeleccionadaId={claseSeleccionada?.idClase}
              onSeleccionar={(clase) => {
                setClaseSeleccionada(clase);
                setModoClase('detalle');
              }}
              onNuevo={() => {
                setClaseSeleccionada(null);
                setModoClase('crear');
              }}
              onEditar={(clase) => {
                setClaseSeleccionada(clase);
                setModoClase('editar');
              }}
              onEliminar={handleEliminarClase}
            />
          )}

          {(modoClase === 'crear' || modoClase === 'editar') && (
            <ClaseFormulario
              claseInicial={modoClase === 'editar' ? claseSeleccionada : null}
              onGuardar={handleGuardarClase}
              onCancelar={() => {
                setModoClase('listado');
                setClaseSeleccionada(null);
              }}
            />
          )}

          {modoClase === 'detalle' && (
            <ClaseDetalle
              clase={claseSeleccionada}
              onVolver={() => setModoClase('listado')}
              onEditar={(clase) => {
                setClaseSeleccionada(clase);
                setModoClase('editar');
              }}
            />
          )}
        </div>
      )}

      {/* MÓDULO DE PERSONAJES */}
      {modulo === 'personajes' && (
        <div>
          {modoPersonaje === 'listado' && (
            <PersonajeLista
              personajes={personajes}
              clases={clases}
              cargando={cargandoPersonajes}
              personajeSeleccionadoId={personajeSeleccionado?.idPersonaje}
              onSeleccionar={(personaje) => {
                setPersonajeSeleccionado(personaje);
                setModoPersonaje('detalle');
              }}
              onNuevo={() => {
                setPersonajeSeleccionado(null);
                setModoPersonaje('crear');
              }}
              onEditar={(personaje) => {
                setPersonajeSeleccionado(personaje);
                setModoPersonaje('editar');
              }}
              onEliminar={handleEliminarPersonaje}
            />
          )}

          {(modoPersonaje === 'crear' || modoPersonaje === 'editar') && (
            <PersonajeFormulario
              personajeInicial={modoPersonaje === 'editar' ? personajeSeleccionado : null}
              clasesDisponibles={clases}
              onGuardar={handleGuardarPersonaje}
              onCancelar={() => {
                setModoPersonaje('listado');
                setPersonajeSeleccionado(null);
              }}
            />
          )}

          {modoPersonaje === 'detalle' && (
            <PersonajeDetalle
              personaje={personajeSeleccionado}
              clases={clases}
              onVolver={() => setModoPersonaje('listado')}
              onEditar={(personaje) => {
                setPersonajeSeleccionado(personaje);
                setModoPersonaje('editar');
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}