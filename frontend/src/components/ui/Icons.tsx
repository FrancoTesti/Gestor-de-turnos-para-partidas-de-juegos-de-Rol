import type { SVGProps } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

const defaultProps = (props: IconProps): SVGProps<SVGSVGElement> => {
  const { size, style, ...rest } = props;
  return {
    width: size ?? 16,
    height: size ?? 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    style: { verticalAlign: 'middle', display: 'inline-block', flexShrink: 0, ...style },
    ...rest,
  };
};

// Moneda / Dinero / Oro (reemplaza 🪙)
export function CoinIcon(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" strokeDasharray="1 2" />
      <path d="M12 9v6M10 10.5h4M10 13.5h4" strokeWidth="1.5" />
    </svg>
  );
}

// Jugador / Usuario (reemplaza 👤)
export function UserIcon(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// Grupo de Jugadores / Participantes (reemplaza 👥)
export function UsersIcon(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// Espadas cruzadas para Partidas / Combate (reemplaza ⚔️)
export function SwordsIcon(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" y1="19" x2="19" y2="13" />
      <polyline points="9.5 17.5 21 6 21 3 18 3 6.5 14.5" />
      <line x1="11" y1="19" x2="5" y2="13" />
    </svg>
  );
}

// Mando / Partida / Juego (reemplaza 🎮)
export function GameIcon(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      <rect x="2" y="6" width="20" height="12" rx="4" />
      <line x1="6" y1="12" x2="10" y2="12" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <line x1="15" y1="13" x2="15.01" y2="13" strokeWidth="3" />
      <line x1="18" y1="11" x2="18.01" y2="11" strokeWidth="3" />
    </svg>
  );
}

// Dado de rol D6 (reemplaza 🎲)
export function DiceIcon(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
      <circle cx="16" cy="8" r="1.2" fill="currentColor" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      <circle cx="8" cy="16" r="1.2" fill="currentColor" />
      <circle cx="16" cy="16" r="1.2" fill="currentColor" />
    </svg>
  );
}

// Escudo para Clases y Defensa (reemplaza 🛡️)
export function ShieldIcon(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

// Corona para Anfitrión / Game Master
export function CrownIcon(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z" />
      <path d="M5 20h14" />
    </svg>
  );
}

// Estrella para Objetos Únicos (reemplaza ⭐)
export function StarIcon(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// Tienda / Mercado (reemplaza 🏪)
export function StoreIcon(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

// Inventario / Paquete (reemplaza 📦)
export function PackageIcon(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

// Pergamino para Misiones (reemplaza 📜)
export function ScrollIcon(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      <path d="M19 17V5a2 2 0 0 0-2-2H4" />
      <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1z" />
      <path d="M19 17a2 2 0 0 1-2 2H4" />
      <path d="M4 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2" />
      <line x1="8" y1="7" x2="15" y2="7" />
      <line x1="8" y1="11" x2="15" y2="11" />
    </svg>
  );
}

// Rayo para XP / Venta Rápida (reemplaza ⚡)
export function ZapIcon(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

// Advertencia / Peligro (reemplaza ⚠️)
export function AlertTriangleIcon(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

// Éxito / Confirmación (reemplaza ✅)
export function CheckCircleIcon(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

// Tilde de selección activa (reemplaza ✓)
export function CheckIcon(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// Información (reemplaza ℹ️)
export function InfoIcon(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

// Cruz de cierre (reemplaza ✕)
export function CloseIcon(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// Signo más para Crear (+)
export function PlusIcon(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// Candado cerrado para Partida Privada (reemplaza 🔒)
export function LockIcon(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

// Candado abierto para Partida Pública (reemplaza 🔓)
export function UnlockIcon(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}

// Flecha abajo para desplegables (reemplaza ▾)
export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// Nivel / Progreso hacia arriba
export function TrendingUpIcon(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
