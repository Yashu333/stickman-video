import {ACCENT, FONT_FAMILY, INK, PAPER} from '../theme';

const LINE = 12;

const inked = {
  fill: PAPER,
  stroke: INK,
  strokeWidth: LINE,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export const Floor = ({y}: {y: number}) => (
  <line x1={0} y1={y} x2={1080} y2={y} stroke={INK} strokeWidth={LINE} />
);

/**
 * The bed is split so the stickman can lie between its parts: draw BedFrame,
 * then the stickman, then BedBlanket.
 */
export const BED = {
  left: 90,
  right: 1020,
  mattressTop: 1290,
  floor: 1500,
};

export const BedFrame = () => {
  const {left, right, mattressTop, floor} = BED;
  return (
    <g {...inked}>
      <rect x={left} y={1090} width={36} height={floor - 1090} rx={8} />
      <rect x={right - 36} y={1210} width={36} height={floor - 1210} rx={8} />
      <rect
        x={left + 36}
        y={mattressTop}
        width={right - left - 72}
        height={70}
        rx={12}
      />
      <rect x={left + 36} y={mattressTop + 70} width={right - left - 72} height={44} />
      {/* Pillow */}
      <rect x={left + 54} y={mattressTop - 46} width={210} height={52} rx={26} />
    </g>
  );
};

export const BedBlanket = ({
  left,
  rise = 0,
}: {
  /** Left edge: near the chest when asleep, slides to the lap on sitting up. */
  left: number;
  /** A small lift so the blanket breathes during sleep. */
  rise?: number;
}) => {
  const {right, mattressTop} = BED;
  const inner = right - 42;
  const top = mattressTop - 112 - rise;
  return (
    <path
      {...inked}
      d={`M ${left} ${mattressTop + 34}
          L ${left} ${top + 26}
          Q ${left} ${top} ${left + 30} ${top}
          L ${inner - 40} ${mattressTop - 66}
          Q ${inner} ${mattressTop - 62} ${inner} ${mattressTop - 20}
          L ${inner} ${mattressTop + 34}
          Z`}
    />
  );
};

export const AlarmClock = ({
  x,
  y,
  tilt,
  squash = 1,
}: {
  x: number;
  y: number;
  tilt: number;
  /** Flattens the clock slightly when it gets smacked. */
  squash?: number;
}) => (
  <g
    transform={`translate(${x} ${y}) rotate(${tilt}) scale(${2 - squash} ${squash})`}
    fill={PAPER}
    stroke={ACCENT}
    strokeWidth={LINE}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1={-38} y1={54} x2={-50} y2={70} />
    <line x1={38} y1={54} x2={50} y2={70} />
    <path d="M -58 -40 A 30 30 0 0 1 -20 -72 Z" fill={ACCENT} />
    <path d="M 58 -40 A 30 30 0 0 0 20 -72 Z" fill={ACCENT} />
    <circle r={62} />
    <polyline points="0,-34 0,0 24,14" stroke={INK} fill="none" />
  </g>
);

/** Curved shock lines, used for a ringing alarm and a buzzing phone. */
export const RingLines = ({
  x,
  y,
  radius,
  phase,
}: {
  x: number;
  y: number;
  radius: number;
  /** 0 to 1, loops: each pulse travels outward and fades. */
  phase: number;
}) => {
  const arcs = [0, 1].map((index) => {
    const t = (phase + index / 2) % 1;
    const r = radius + t * 42;
    return {r, opacity: 1 - t};
  });

  const arc = (r: number, side: 1 | -1) => {
    const dx = Math.cos(Math.PI / 5) * r;
    const dy = Math.sin(Math.PI / 5) * r;
    const sweep = side === 1 ? 1 : 0;
    return `M ${side * dx} ${-dy} A ${r} ${r} 0 0 ${sweep} ${side * dx} ${dy}`;
  };

  return (
    <g
      transform={`translate(${x} ${y})`}
      fill="none"
      stroke={ACCENT}
      strokeWidth={9}
      strokeLinecap="round"
    >
      {arcs.map(({r, opacity}) => (
        <g key={r} opacity={opacity}>
          <path d={arc(r, 1)} />
          <path d={arc(r, -1)} />
        </g>
      ))}
    </g>
  );
};

export const Phone = ({
  x,
  y,
  tilt = 0,
}: {
  x: number;
  y: number;
  tilt?: number;
}) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt})`} {...inked} strokeWidth={10}>
    <rect x={-40} y={-74} width={80} height={148} rx={14} />
    <line x1={-12} y1={56} x2={12} y2={56} strokeWidth={7} />
  </g>
);

export const Desk = ({top, floor}: {top: number; floor: number}) => (
  <g {...inked}>
    <line x1={475} y1={top} x2={475} y2={floor} />
    <line x1={1000} y1={top} x2={1000} y2={floor} />
    <rect x={420} y={top - 8} width={640} height={22} rx={6} />
  </g>
);

export const Stool = ({x, top, floor}: {x: number; top: number; floor: number}) => (
  <g {...inked}>
    <line x1={x - 58} y1={top} x2={x - 72} y2={floor} />
    <line x1={x + 58} y1={top} x2={x + 72} y2={floor} />
    <line x1={x - 66} y1={floor - 60} x2={x + 66} y2={floor - 60} />
    <rect x={x - 92} y={top - 10} width={184} height={22} rx={10} />
  </g>
);

/**
 * Laptop in three-quarter view, with lines of text filling the screen.
 * `written` is how many lines have been typed, fractions included.
 */
export const Laptop = ({
  deskTop,
  written,
}: {
  deskTop: number;
  written: number;
}) => {
  const y = deskTop - 14;
  // The screen is a parallelogram rising from the hinge at the far side of the keyboard.
  const hingeX = 700;
  const screenWidth = 205;
  const screenHeight = 240;
  const skew = 30;
  const lineCount = 6;

  const screenPoint = (across: number, up: number) => ({
    x: hingeX + across * screenWidth,
    y: y - skew * across - up * screenHeight,
  });
  const corners = [
    screenPoint(0, 0),
    screenPoint(1, 0),
    screenPoint(1, 1),
    screenPoint(0, 1),
  ];

  return (
    <g>
      <polygon
        {...inked}
        points={corners.map((c) => `${c.x},${c.y}`).join(' ')}
      />
      {Array.from({length: lineCount}, (_, index) => {
        const fill = Math.max(0, Math.min(1, written - index));
        if (fill === 0) {
          return null;
        }
        const up = 0.86 - index * 0.135;
        const fullLength = index % 3 === 2 ? 0.55 : 0.78;
        const start = screenPoint(0.11, up);
        const end = screenPoint(0.11 + fullLength * fill, up);
        const isCurrent = written - index < 1;
        return (
          <g key={index}>
            <line
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={INK}
              strokeWidth={9}
              strokeLinecap="round"
            />
            {isCurrent ? (
              <line
                x1={end.x + 12}
                y1={end.y - 14}
                x2={end.x + 12}
                y2={end.y + 14}
                stroke={ACCENT}
                strokeWidth={7}
                strokeLinecap="round"
              />
            ) : null}
          </g>
        );
      })}
      <polygon
        {...inked}
        points={`${hingeX - 250},${y + 6} ${hingeX + 6},${y + 6} ${hingeX + 22},${y - 18} ${hingeX - 214},${y - 18}`}
      />
    </g>
  );
};

export const SleepingZ = ({
  x,
  y,
  size,
  opacity,
}: {
  x: number;
  y: number;
  size: number;
  opacity: number;
}) => (
  <text
    x={x}
    y={y}
    fontFamily={FONT_FAMILY}
    fontWeight={700}
    fontSize={size}
    fill={INK}
    opacity={opacity}
  >
    z
  </text>
);
