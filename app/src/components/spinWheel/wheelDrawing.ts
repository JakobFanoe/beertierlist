import { Option } from '../../services/wheelService';

export const WHEEL_COLORS = [
  '#e53935',
  '#8e24aa',
  '#3949ab',
  '#00897b',
  '#e65100',
  '#039be5',
  '#c0ca33',
  '#d81b60',
  '#1e88e5',
  '#43a047',
  '#fb8c00',
  '#6d4c41',
  '#546e7a',
  '#f4511e',
  '#7b1fa2',
  '#00acc1',
];

export const CANVAS_SIZE = Math.min(window.innerWidth * 0.55, 700);
const RADIUS = CANVAS_SIZE / 2 - 4; // Leave room for the wheel's outer edge.
const CENTER = CANVAS_SIZE / 2;

export function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

export function cryptoRandom(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] / 4294967296;
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function drawHub(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  ctx.arc(CENTER, CENTER, 28, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(CENTER, CENTER, 11, 0, Math.PI * 2);
  ctx.fillStyle = '#bdbdbd';
  ctx.fill();
}

export function drawWheel(
  ctx: CanvasRenderingContext2D,
  entries: Option[],
  rotation: number,
): void {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  if (entries.length === 0) {
    ctx.fillStyle = '#e0e0e0';
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9e9e9e';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Add names →', CENTER, CENTER);
    drawHub(ctx);
    return;
  }

  const slice = (Math.PI * 2) / entries.length;
  const fontSize = entries.length > 12 ? 13 : entries.length > 8 ? 15 : 17;

  entries.forEach((entry, index) => {
    const start = rotation + index * slice;
    const end = start + slice;

    ctx.beginPath();
    ctx.moveTo(CENTER, CENTER);
    ctx.arc(CENTER, CENTER, RADIUS, start, end);
    ctx.closePath();
    ctx.fillStyle = WHEEL_COLORS[index % WHEEL_COLORS.length];
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.save();
    ctx.translate(CENTER, CENTER);
    ctx.rotate(start + slice / 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 3;
    ctx.font = `500 ${fontSize}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(truncate(entry.name, 20), RADIUS - 12, 0);
    ctx.restore();
  });

  drawHub(ctx);
}
