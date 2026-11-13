// The ink stars from the reference: sharp concave four-point stars with
// long tapering swooshes, plus hairline orbits. Vector, drawn at device
// resolution so they stay razor sharp over the stippled garden.

type P = [number, number]; // fractions of width, height
type Tail = { to: P; via: P; w: number }; // w: base width as a fraction of U
type Star = { at: P; r: number; rot: number; long?: number; tails?: Tail[] };
type Arc = { from: P; via: P; to: P; w: number }; // w in CSS px

const WIDE: { stars: Star[]; arcs: Arc[] } = {
	stars: [
		{ at: [0.315, 0.17], r: 0.04, rot: -0.55, long: 1.5, tails: [{ to: [0.43, -0.02], via: [0.39, 0.08], w: 0.011 }, { to: [0.235, 0.31], via: [0.265, 0.25], w: 0.01 }] },
		{ at: [0.225, 0.6], r: 0.028, rot: 0.25, tails: [{ to: [0.262, 0.612], via: [0.245, 0.598], w: 0.006 }] },
		{ at: [0.15, 0.83], r: 0.06, rot: 0.45, long: 1.7, tails: [{ to: [0.25, 0.795], via: [0.2, 0.81], w: 0.009 }, { to: [-0.01, 0.95], via: [0.07, 0.9], w: 0.011 }, { to: [0.13, 1.03], via: [0.145, 0.95], w: 0.006 }] },
		{ at: [0.966, 0.565], r: 0.042, rot: -0.15, long: 1.4, tails: [{ to: [0.86, 0.63], via: [0.91, 0.58], w: 0.008 }, { to: [1.02, 0.48], via: [0.99, 0.52], w: 0.008 }] },
	],
	arcs: [
		{ from: [0.44, -0.01], via: [0.2, 0.24], to: [0.02, 0.6], w: 1.6 },
		{ from: [0.572, 0.978], via: [0.76, 0.9], to: [0.86, 0.6], w: 1.8 },
		{ from: [0.775, 0.55], via: [0.92, 0.42], to: [1.0, 0.12], w: 1.3 },
		{ from: [0.225, 0.6], via: [0.16, 0.78], to: [0.11, 1.0], w: 1.1 },
	],
};

const NARROW: { stars: Star[]; arcs: Arc[] } = {
	stars: [
		{ at: [0.82, 0.13], r: 0.05, rot: -0.4, long: 1.4, tails: [{ to: [0.6, 0.2], via: [0.7, 0.14], w: 0.012 }] },
		{ at: [0.2, 0.86], r: 0.07, rot: 0.4, long: 1.6, tails: [{ to: [0.48, 0.8], via: [0.35, 0.8], w: 0.012 }, { to: [-0.02, 0.95], via: [0.08, 0.92], w: 0.012 }] },
	],
	arcs: [{ from: [0.55, 0.99], via: [0.8, 0.9], to: [1.0, 0.75], w: 1.4 }],
};

const FOOT: { stars: Star[]; arcs: Arc[] } = {
	stars: [
		{ at: [0.24, 0.45], r: 0.085, rot: 0.35, long: 1.6, tails: [{ to: [0.37, 0.16], via: [0.31, 0.24], w: 0.016 }] },
		{ at: [0.79, 0.32], r: 0.065, rot: -0.3, long: 1.4, tails: [{ to: [0.68, 0.1], via: [0.73, 0.16], w: 0.013 }] },
	],
	arcs: [{ from: [0.3, 1.02], via: [0.5, 0.05], to: [0.72, 1.02], w: 1.4 }],
};

const quad = (a: number[], b: number[], c: number[], t: number) => {
	const u = 1 - t;
	return [u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]];
};

// a filled ribbon along a quadratic curve, width given per t
function ribbon(ctx: CanvasRenderingContext2D, a: number[], b: number[], c: number[], width: (t: number) => number) {
	const N = 48;
	const left: number[][] = [], right: number[][] = [];
	for (let i = 0; i <= N; i++) {
		const t = i / N;
		const p = quad(a, b, c, t);
		const q = quad(a, b, c, Math.min(1, t + 0.01));
		const o = quad(a, b, c, Math.max(0, t - 0.01));
		let nx = -(q[1] - o[1]), ny = q[0] - o[0];
		const l = Math.hypot(nx, ny) || 1;
		nx /= l;
		ny /= l;
		const w = width(t) / 2;
		left.push([p[0] + nx * w, p[1] + ny * w]);
		right.push([p[0] - nx * w, p[1] - ny * w]);
	}
	ctx.beginPath();
	ctx.moveTo(left[0][0], left[0][1]);
	for (const p of left) ctx.lineTo(p[0], p[1]);
	for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
	ctx.closePath();
	ctx.stroke();
	ctx.fill();
}

// concave four-point star; `long` stretches one axis
function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number, long = 1.25) {
	ctx.beginPath();
	for (let i = 0; i < 4; i++) {
		const a = rot + (i * Math.PI) / 2 - Math.PI / 2;
		const len = i % 2 === 0 ? r * long : r;
		const tx = x + Math.cos(a) * len, ty = y + Math.sin(a) * len;
		if (i === 0) ctx.moveTo(tx, ty);
		const nb = a + Math.PI / 2;
		const nlen = (i + 1) % 2 === 0 ? r * long : r;
		const ca = a + Math.PI / 4;
		ctx.quadraticCurveTo(x + Math.cos(ca) * r * 0.09, y + Math.sin(ca) * r * 0.09, x + Math.cos(nb) * nlen, y + Math.sin(nb) * nlen);
	}
	ctx.closePath();
	ctx.stroke();
	ctx.fill();
}

// one small star with a tail in a section's main margin
export function sideStars(cssW: number, contentX0: number, contentX1: number, side: 'left' | 'right'): { stars: Star[]; arcs: Arc[] } {
	const left = side === 'left';
	const mf = left ? contentX0 / cssW : 1 - contentX1 / cssW;
	const X = (f: number) => (left ? f : 1 - f);
	return {
		stars: [{ at: [X(mf * 0.62), 0.66], r: 0.035, rot: left ? 0.3 : -0.3, long: 1.5, tails: [{ to: [X(mf * 0.2), 0.58], via: [X(mf * 0.4), 0.6], w: 0.007 }] }],
		arcs: [],
	};
}

export function drawStars(canvas: HTMLCanvasElement, cssW: number, cssH: number, narrow: boolean, ink: string, paper: string, foot = false, custom?: { stars: Star[]; arcs: Arc[] }) {
	const dpr = Math.min(2, window.devicePixelRatio || 1);
	canvas.width = Math.round(cssW * dpr);
	canvas.height = Math.round(cssH * dpr);
	const ctx = canvas.getContext('2d');
	if (!ctx) return;
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.clearRect(0, 0, cssW, cssH);
	ctx.fillStyle = ink;
	// a paper keyline so the stars read as cut-outs over the ink thickets
	ctx.strokeStyle = paper;
	ctx.lineWidth = 3;
	ctx.lineJoin = 'round';
	const U = foot ? Math.min(cssH, cssW * 0.5) : narrow && !custom ? cssW : Math.min(cssH, cssW * 0.62);
	const at = (p: P) => [p[0] * cssW, p[1] * cssH];
	const set = custom ?? (foot ? FOOT : narrow ? NARROW : WIDE);

	for (const a of set.arcs) ribbon(ctx, at(a.from), at(a.via), at(a.to), (t) => a.w * Math.sin(Math.PI * t) ** 0.6);
	for (const s of set.stars) {
		const c = at(s.at);
		for (const t of s.tails ?? []) ribbon(ctx, c, at(t.via), at(t.to), (k) => t.w * U * (1 - k) ** 1.3);
		star(ctx, c[0], c[1], s.r * U, s.rot, s.long);
	}
}
