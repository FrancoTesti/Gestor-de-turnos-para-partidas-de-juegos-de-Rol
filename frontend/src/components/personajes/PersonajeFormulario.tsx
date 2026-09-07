import { useState, useEffect, type FormEvent } from 'react';
import type { Personaje, Clase } from '../../interfaces';
import type { CrearPersonajeData } from '../../services/personaje.service';
import type { PartidaPublica } from '../../services/partida.service';
import type { JugadorExtendido } from '../../services/jugador.service';
import { obtenerJugadores } from '../../services/jugador.service';
import { obtenerPartidas } from '../../services/partida.service';
import { obtenerClases } from '../../services/clase.service';
import './personajes.css';

export interface PersonajeFormularioProps {
  personajeInicial?: Personaje | null;
  clasesDisponibles?: Clase[];
  jugadoresDisponibles?: JugadorExtendido[];
  partidasDisponibles?: PartidaPublica[];
  onGuardar: (data: CrearPersonajeData) => Promise<void>;
  onCancelar: () => void;
}

export default function PersonajeFormulario({
  personajeInicial,
  clasesDisponibles = [],
  jugadoresDisponibles = [],
  partidasDisponibles = [],
  onGuardar,
  onCancelar,
}: PersonajeFormularioProps) {
  const [nombreFicticio, setNombreFicticio] = useState(personajeInicial?.nombreFicticio ?? '');
  const [raza, setRaza] = useState(personajeInicial?.raza ?? '');
  const [idClase, setIdClase] = useState<number | ''>(personajeInicial?.idClase ?? '');
  const [idUsuarioJugador, setIdUsuarioJugador] = useState<number | ''>(personajeInicial?.idUsuarioJugador ?? '');
  const [idPartida, setIdPartida] = useState<number | ''>(personajeInicial?.idPartida ?? '');

  // Valores iniciales por defecto coherentes
  const [nivel, setNivel] = useState<number>(personajeInicial?.nivel ?? 1);
  const [xp, setXp] = useState<number>(personajeInicial?.xp ?? 0);
  const [dinero, setDinero] = useState<number>(personajeInicial?.dinero ?? 100);

  const [clasesList, setClasesList] = useState<Clase[]>(clasesDisponibles);
  const [jugadoresList, setJugadoresList] = useState<JugadorExtendido[]>(jugadoresDisponibles);
  const [partidasList, setPartidasList] = useState<PartidaPublica[]>(partidasDisponibles);

  const [cargandoRef, setCargandoRef] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const esEdicion = Boolean(personajeInicial);
  const [initialRefs] = useState(() => ({ clasesDisponibles, jugadoresDisponibles, partidasDisponibles, personajeInicial }));

  useEffect(() => {
    async function cargarDatosReferencia() {
      try {
        const [clasesRes, jugadoresRes, partidasRes] = await Promise.all([
          initialRefs.clasesDisponibles.length > 0 ? Promise.resolve(initialRefs.clasesDisponibles) : obtenerClases(),
          initialRefs.jugadoresDisponibles.length > 0 ? Promise.resolve(initialRefs.jugadoresDisponibles) : obtenerJugadores(),
          initialRefs.partidasDisponibles.length > 0 ? Promise.resolve(initialRefs.partidasDisponibles) : obtenerPartidas(),
        ]);

        setClasesList(clasesRes);
        setJugadoresList(jugadoresRes);
        setPartidasList(partidasRes);

        // Preseleccionar primer elemento si no hay ninguno seleccionado y estamos creando
        if (!initialRefs.personajeInicial) {
          if (clasesRes.length > 0) setIdClase(clasesRes[0].idClase);
          if (jugadoresRes.length > 0) setIdUsuarioJugador(jugadoresRes[0].idUsuario);
          if (partidasRes.length > 0) setIdPartida(partidasRes[0].idPartida);
        }
      } catch (err) {
        console.error('Error al cargar datos de referencia:', err);
      } finally {
        setCargandoRef(false);
      }
    }

    cargarDatosReferencia();
  }, [initialRefs]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!nombreFicticio.trim()) {
      setError('El nombre ficticio del personaje es obligatorio.');
      return;
    }

    if (!raza.trim()) {
      setError('La raza del personaje es obligatoria.');
      return;
    }

    if (!idClase) {
      setError('Debe seleccionar una Clase válida.');
      return;
    }

    if (!idUsuarioJugador) {
      setError('Debe seleccionar un Jugador asociado.');
      return;
    }

    if (!idPartida) {
      setError('Debe seleccionar una Partida asociada.');
      return;
    }

    try {
      setGuardando(true);
      await onGuardar({
        nombreFicticio: nombreFicticio.trim(),
        raza: raza.trim(),
        idClase: Number(idClase),
        idUsuarioJugador: Number(idUsuarioJugador),
        idPartida: Number(idPartida),
        nivel: Number(nivel),
        xp: Number(xp),
        dinero: Number(dinero),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el personaje.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="personaje-form">
      <h3>{esEdicion ? 'Editar Personaje' : 'Crear Nuevo Personaje (Caso de Uso)'}</h3>

      {error && <div className="mensaje-error">{error}</div>}
      {cargandoRef && <div style={{ marginBottom: '1rem', color: '#718096' }}>Cargando clases, jugadores y partidas...</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="nombreFicticio">Nombre Ficticio del Personaje *</label>
            <input
              id="nombreFicticio"
              type="text"
              placeholder="Ej: Thorin EscudoDeRoble, Legolas..."
              value={nombreFicticio}
              onChange={(e) => setNombreFicticio(e.target.value)}
              disabled={guardando}
            />
          </div>

          <div className="form-group">
            <label htmlFor="raza">Raza *</label>
            <input
              id="raza"
              type="text"
              placeholder="Ej: Enano, Elfo, Humano, Orco..."
              value={raza}
              onChange={(e) => setRaza(e.target.value)}
              disabled={guardando}
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="selectClase">Clase de Personaje *</label>
            <select
              id="selectClase"
              value={idClase}
              onChange={(e) => setIdClase(Number(e.target.value))}
              disabled={guardando || clasesList.length === 0}
            >
              <option value="" disabled>Seleccione una clase...</option>
              {clasesList.map((c) => (
                <option key={c.idClase} value={c.idClase}>
                  {c.nombreClase}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="selectJugador">Jugador Propietario *</label>
            <select
              id="selectJugador"
              value={idUsuarioJugador}
              onChange={(e) => setIdUsuarioJugador(Number(e.target.value))}
              disabled={guardando || jugadoresList.length === 0}
            >
              <option value="" disabled>Seleccione un jugador...</option>
              {jugadoresList.map((j) => (
                <option key={j.idUsuario} value={j.idUsuario}>
                  {j.nickname || j.nombreUsuario || `Jugador #${j.idUsuario}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="selectPartida">Partida Asociada *</label>
          <select
            id="selectPartida"
            value={idPartida}
            onChange={(e) => setIdPartida(Number(e.target.value))}
            disabled={guardando || partidasList.length === 0}
          >
            <option value="" disabled>Seleccione una partida...</option>
            {partidasList.map((p) => (
              <option key={p.idPartida} value={p.idPartida}>
                {p.nombre} (ID: #{p.idPartida})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 600, color: '#4a5568' }}>
          Atributos Iniciales del Personaje:
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="nivel">Nivel Inicial</label>
            <input
              id="nivel"
              type="number"
              min={1}
              value={nivel}
              onChange={(e) => setNivel(Number(e.target.value))}
              disabled={guardando}
            />
          </div>

          <div className="form-group">
            <label htmlFor="xp">Experiencia (XP)</label>
            <input
              id="xp"
              type="number"
              min={0}
              value={xp}
              onChange={(e) => setXp(Number(e.target.value))}
              disabled={guardando}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="dinero">Dinero Inicial (Monedas de Oro)</label>
          <input
            id="dinero"
            type="number"
            min={0}
            value={dinero}
            onChange={(e) => setDinero(Number(e.target.value))}
            disabled={guardando}
          />
        </div>

        <div className="personaje-acciones">
          <button type="submit" className="btn-purple" disabled={guardando}>
            {guardando ? 'Guardando...' : esEdicion ? 'Actualizar Personaje' : 'Crear Personaje'}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancelar} disabled={guardando}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
