import {random} from 'remotion';
import {BLACK, FONT_FAMILY, RED, RED_DEEP, WHITE} from '../theme';
import {usePalette} from './Scene';

const LINE = 13;

const useInked = () => {
  const {ink, paper} = usePalette();
  return {
    fill: paper,
    stroke: ink,
    strokeWidth: LINE,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;
};

/** A solid block from the floor line down, which anchors the whole frame. */
export const Floor = ({y}: {y: number}) => {
  const {floor} = usePalette();
  return <rect x={-200} y={y} width={1480} height={1600} fill={floor} />;
};

/** Sun or moon behind a window, clipped to the panes. */
export const Window = ({
  x,
  y,
  width,
  height,
  body,
  bodyY,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  body: 'moon' | 'sun';
  bodyY: number;
}) => {
  const inked = useInked();
  const {paper} = usePalette();
  const cx = x + width * 0.56;
  return (
    <g>
      <defs>
        <clipPath id="window-panes">
          <rect x={x} y={y} width={width} height={height} />
        </clipPath>
      </defs>
      <rect x={x} y={y} width={width} height={height} {...inked} />
      <g clipPath="url(#window-panes)">
        {body === 'sun' ? (
          <circle cx={cx} cy={bodyY} r={92} fill={RED} />
        ) : (
          <>
            <circle cx={cx} cy={bodyY} r={66} fill={WHITE} />
            <circle cx={cx + 30} cy={bodyY - 16} r={58} fill={paper} />
          </>
        )}
      </g>
      <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y + height} {...inked} />
      <line x1={x} y1={y + height / 2} x2={x + width} y2={y + height / 2} {...inked} />
    </g>
  );
};

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
  const inked = useInked();
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
      {...useInked()}
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
  size = 1,
  color,
}: {
  x: number;
  y: number;
  tilt: number;
  /** Flattens the clock slightly when it gets smacked. */
  squash?: number;
  size?: number;
  color: string;
}) => {
  const {ink, paper} = usePalette();
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${tilt}) scale(${size * (2 - squash)} ${size * squash})`}
      fill={paper}
      stroke={color}
      strokeWidth={LINE}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1={-38} y1={54} x2={-50} y2={70} />
      <line x1={38} y1={54} x2={50} y2={70} />
      <path d="M -58 -40 A 30 30 0 0 1 -20 -72 Z" fill={color} />
      <path d="M 58 -40 A 30 30 0 0 0 20 -72 Z" fill={color} />
      <circle r={62} />
      <polyline points="0,-34 0,0 24,14" stroke={ink} fill="none" />
    </g>
  );
};

/** Curved shock lines beside a ringing or buzzing object. */
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
    return {index, r: radius + t * 48, opacity: 1 - t};
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
      stroke={RED}
      strokeWidth={11}
      strokeLinecap="round"
    >
      {arcs.map(({index, r, opacity}) => (
        <g key={index} opacity={opacity}>
          <path d={arc(r, 1)} />
          <path d={arc(r, -1)} />
        </g>
      ))}
    </g>
  );
};

/** Full-canvas concentric circles travelling outward. */
export const ShockRings = ({
  x,
  y,
  phase,
  color,
}: {
  x: number;
  y: number;
  phase: number;
  color: string;
}) => (
  <g fill="none" stroke={color} strokeWidth={26}>
    {[0, 1, 2, 3, 4].map((index) => (
      <circle key={index} cx={x} cy={y} r={300 + ((phase + index) % 5) * 240} />
    ))}
  </g>
);

/** A jagged impact star. */
export const Burst = ({
  x,
  y,
  radius,
  color,
}: {
  x: number;
  y: number;
  radius: number;
  color: string;
}) => {
  const points = Array.from({length: 18}, (_, index) => {
    const r = index % 2 === 0 ? radius : radius * 0.52;
    const angle = (index / 18) * Math.PI * 2;
    return `${x + Math.cos(angle) * r},${y + Math.sin(angle) * r}`;
  });
  return <polygon points={points.join(' ')} fill={color} />;
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
  <g
    transform={`translate(${x} ${y}) rotate(${tilt})`}
    {...useInked()}
    fill={BLACK}
    strokeWidth={10}
  >
    <rect x={-40} y={-74} width={80} height={148} rx={14} fill={WHITE} stroke={BLACK} />
    <line x1={-12} y1={56} x2={12} y2={56} stroke={BLACK} strokeWidth={7} />
  </g>
);

/** The phone filling the frame. Children draw on its white screen. */
export const BigPhone = ({children}: {children?: React.ReactNode}) => (
  <g>
    <rect x={120} y={110} width={840} height={1700} rx={96} fill={WHITE} stroke="#3A3A3A" strokeWidth={30} />
    <rect x={430} y={150} width={220} height={40} rx={20} fill={BLACK} />
    {children}
  </g>
);

export const Desk = ({top, floor}: {top: number; floor: number}) => {
  const inked = useInked();
  return (
    <g {...inked}>
      <line x1={475} y1={top} x2={475} y2={floor} />
      <line x1={1000} y1={top} x2={1000} y2={floor} />
      <rect x={420} y={top - 8} width={720} height={22} rx={6} />
    </g>
  );
};

export const Stool = ({x, top, floor}: {x: number; top: number; floor: number}) => {
  const inked = useInked();
  return (
    <g {...inked}>
      <line x1={x - 58} y1={top} x2={x - 72} y2={floor} />
      <line x1={x + 58} y1={top} x2={x + 72} y2={floor} />
      <line x1={x - 66} y1={floor - 60} x2={x + 66} y2={floor - 60} />
      <rect x={x - 92} y={top - 10} width={184} height={22} rx={10} />
    </g>
  );
};

/**
 * Laptop in three-quarter view with a lit screen and lines of text filling it.
 * `written` is how many lines have been typed, fractions included.
 */
export const Laptop = ({
  deskTop,
  written,
}: {
  deskTop: number;
  written: number;
}) => {
  const inked = useInked();
  const y = deskTop - 14;
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
        fill={WHITE}
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
              stroke={BLACK}
              strokeWidth={9}
              strokeLinecap="round"
            />
            {isCurrent ? (
              <line
                x1={end.x + 12}
                y1={end.y - 14}
                x2={end.x + 12}
                y2={end.y + 14}
                stroke={RED}
                strokeWidth={8}
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

export const Cup = ({x, y, size}: {x: number; y: number; size: number}) => {
  const inked = useInked();
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`} {...inked} strokeWidth={9}>
      <path d="M -24 -60 L -19 0 L 19 0 L 24 -60 Z" />
    </g>
  );
};

/** A small rain cloud with falling streaks. */
export const RainCloud = ({
  x,
  y,
  size,
  frame,
  color,
}: {
  x: number;
  y: number;
  size: number;
  frame: number;
  color: string;
}) => (
  <g transform={`translate(${x} ${y}) scale(${size})`}>
    <g fill={color}>
      <circle cx={-62} cy={8} r={44} />
      <circle cx={-6} cy={-18} r={62} />
      <circle cx={58} cy={6} r={48} />
      <rect x={-104} y={6} width={204} height={46} rx={23} />
    </g>
    <g stroke={color} strokeWidth={9} strokeLinecap="round">
      {Array.from({length: 7}, (_, index) => {
        const lineX = -84 + index * 28;
        const fall = (frame * 16 + index * 73) % 170;
        return (
          <line
            key={index}
            x1={lineX}
            y1={62 + fall}
            x2={lineX - 5}
            y2={90 + fall}
          />
        );
      })}
    </g>
  </g>
);

/** Rotating sunburst wedges that fill the canvas. */
export const Rays = ({
  x,
  y,
  rotation,
}: {
  x: number;
  y: number;
  rotation: number;
}) => {
  const count = 14;
  const reach = 2400;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation})`} fill={RED_DEEP}>
      {Array.from({length: count}, (_, index) => {
        const a = (index / count) * Math.PI * 2;
        const b = ((index + 0.5) / count) * Math.PI * 2;
        return (
          <polygon
            key={index}
            points={`0,0 ${Math.cos(a) * reach},${Math.sin(a) * reach} ${Math.cos(b) * reach},${Math.sin(b) * reach}`}
          />
        );
      })}
    </g>
  );
};

/** A burst of paper pieces that fly out, fall under gravity and leave the frame. */
export const Confetti = ({
  frame,
  at,
  x,
  y,
  colors,
  seed,
}: {
  frame: number;
  at: number;
  x: number;
  y: number;
  colors: readonly string[];
  seed: string;
}) => {
  if (frame < at) {
    return null;
  }
  const t = frame - at;
  return (
    <g>
      {Array.from({length: 46}, (_, index) => {
        const angle = random(`${seed}-angle-${index}`) * Math.PI * 2;
        const speed = 12 + random(`${seed}-speed-${index}`) * 26;
        const spin = (random(`${seed}-spin-${index}`) - 0.5) * 36;
        const width = 16 + random(`${seed}-width-${index}`) * 16;
        const height = 28 + random(`${seed}-height-${index}`) * 20;
        const px = x + Math.cos(angle) * speed * t;
        const py = y + Math.sin(angle) * speed * t + 0.62 * t * t;
        return (
          <rect
            key={index}
            x={-width / 2}
            y={-height / 2}
            width={width}
            height={height}
            fill={colors[index % colors.length]}
            transform={`translate(${px} ${py}) rotate(${spin * t})`}
          />
        );
      })}
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
}) => {
  const {ink} = usePalette();
  return (
    <text
      x={x}
      y={y}
      fontFamily={FONT_FAMILY}
      fontWeight={700}
      fontSize={size}
      fill={ink}
      opacity={opacity}
    >
      z
    </text>
  );
};
