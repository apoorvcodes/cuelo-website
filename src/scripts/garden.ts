// Cuelo's garden: the stippled botanical frame around the hero.
//
// Everything is generated, nothing is an image. Painted once per size at
// 2 CSS px per art pixel so it reads as print grain:
//   mass   — ink thickets tucked into the corners, sprayed out into stipple
//   plants — slim blue stems, a few narrow leaves, and one bloom each:
//            a daisy, a four-point star flower, a bud or a small umbel
// Each plant is its own sprite, so it can sway on its own (see Garden.astro).
// A clear zone in the middle keeps the copy on bare paper.

export const COLORS: [number, number, number][] = [
	[0, 0, 0], // 0 empty
	[14, 14, 15], // ink
	[58, 58, 60], // grey dark
	[140, 140, 142], // grey
	[201, 200, 196], // grey light
	[251, 250, 247], // white
	[27, 74, 214], // blue dark
	[63, 123, 234], // blue
	[110, 157, 242], // blue mid
	[169, 198, 248], // blue light
];
const INK = 1, GREY_D = 2, GREY = 3, GREY_L = 4, WHITE = 5, BLUE_D = 6, BLUE = 7, BLUE_M = 8, BLUE_L = 9;
const LEAF_BLUE = [BLUE_D, BLUE, BLUE_M, BLUE_L];
const LEAF_GREY = [GREY_D, GREY, GREY_L, WHITE];

export const PX = 2; // CSS px per art pixel

// ---------- noise ----------
const hash = (x: number, y: number, s = 0) => {
	let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s, 2246822519)) >>> 0;
	h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
	return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const vnoise = (x: number, y: number) => {
	const xi = Math.floor(x), yi = Math.floor(y);
	const fx = x - xi, fy = y - yi;
	const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
	const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
	return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
};
const fbm = (x: number, y: number) => vnoise(x, y) * 0.55 + vnoise(x * 2.1, y * 2.1) * 0.3 + vnoise(x * 4.3, y * 4.3) * 0.15;
const rng = (seed: number) => () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// ---------- composition ----------
type P = [number, number]; // x as a fraction of width, y of height
type Blob = [number, number, number]; // x, y, radius (fraction of U)
type Rect = [number, number, number, number]; // x0, y0, x1, y1
type Bloom = 'daisy' | 'star' | 'bud' | 'umbel';
type Stem = { base: P; c1: P; c2: P; tip: P; leaves: number; leaf: number; bloom: Bloom; size: number; width?: number };
export type Scene = { mass: Blob[]; plants: Stem[]; clear: { cx: number; cy: number; rx: number; ry: number }; holes: Rect[] };

const WIDE: Scene = {
	clear: { cx: 0.5, cy: 0.52, rx: 0.27, ry: 0.34 },
	// kept on paper: logo, nav
	holes: [[0, 0, 0.15, 0.1], [0.78, 0, 0.97, 0.1]],
	mass: [
		[0.0, 0.35, 0.2], [0.03, 0.6, 0.22], [0.06, 0.92, 0.28], [0.2, 1.04, 0.16],
		[1.0, 0.3, 0.2], [0.97, 0.66, 0.16], [0.93, 0.98, 0.28], [0.78, 1.06, 0.15],
	],
	plants: [
		// left
		{ base: [0.04, 1.03], c1: [0.05, 0.8], c2: [0.08, 0.55], tip: [0.13, 0.42], leaves: 3, leaf: 0.075, bloom: 'daisy', size: 0.055, width: 1.4 },
		{ base: [0.1, 1.03], c1: [0.12, 0.88], c2: [0.16, 0.75], tip: [0.2, 0.66], leaves: 2, leaf: 0.065, bloom: 'star', size: 0.04 },
		{ base: [-0.01, 0.76], c1: [0.03, 0.7], c2: [0.05, 0.64], tip: [0.09, 0.6], leaves: 2, leaf: 0.055, bloom: 'bud', size: 0.03 },
		{ base: [0.17, 1.04], c1: [0.19, 0.96], c2: [0.21, 0.9], tip: [0.25, 0.84], leaves: 2, leaf: 0.06, bloom: 'daisy', size: 0.042 },
		{ base: [-0.01, 0.32], c1: [0.03, 0.29], c2: [0.06, 0.25], tip: [0.1, 0.21], leaves: 2, leaf: 0.05, bloom: 'star', size: 0.032 },
		{ base: [0.3, 1.05], c1: [0.31, 0.99], c2: [0.32, 0.95], tip: [0.34, 0.91], leaves: 1, leaf: 0.05, bloom: 'umbel', size: 0.04 },
		// right
		{ base: [1.01, 0.44], c1: [0.97, 0.39], c2: [0.93, 0.33], tip: [0.89, 0.27], leaves: 2, leaf: 0.065, bloom: 'daisy', size: 0.048 },
		{ base: [0.98, 1.03], c1: [0.97, 0.85], c2: [0.94, 0.65], tip: [0.92, 0.5], leaves: 3, leaf: 0.07, bloom: 'star', size: 0.045, width: 1.4 },
		{ base: [0.92, 1.04], c1: [0.9, 0.96], c2: [0.87, 0.9], tip: [0.84, 0.84], leaves: 2, leaf: 0.06, bloom: 'daisy', size: 0.04 },
		{ base: [1.01, 0.2], c1: [0.99, 0.18], c2: [0.97, 0.16], tip: [0.95, 0.14], leaves: 1, leaf: 0.045, bloom: 'bud', size: 0.028 },
		{ base: [0.56, 1.06], c1: [0.57, 1.0], c2: [0.58, 0.96], tip: [0.6, 0.93], leaves: 2, leaf: 0.05, bloom: 'star', size: 0.03 },
	],
};

const NARROW: Scene = {
	clear: { cx: 0.5, cy: 0.5, rx: 0.62, ry: 0.36 },
	holes: [[0, 0, 0.45, 0.08], [0.55, 0, 1, 0.08]],
	mass: [[0.0, 0.16, 0.22], [1.0, 0.18, 0.2], [0.0, 1.0, 0.34], [0.5, 1.1, 0.22], [1.0, 0.98, 0.32]],
	plants: [
		{ base: [0.04, 1.03], c1: [0.08, 0.92], c2: [0.14, 0.86], tip: [0.22, 0.82], leaves: 2, leaf: 0.13, bloom: 'daisy', size: 0.09 },
		{ base: [0.22, 1.04], c1: [0.25, 0.97], c2: [0.29, 0.93], tip: [0.34, 0.9], leaves: 1, leaf: 0.1, bloom: 'star', size: 0.06 },
		{ base: [0.98, 1.03], c1: [0.93, 0.93], c2: [0.86, 0.87], tip: [0.78, 0.84], leaves: 2, leaf: 0.12, bloom: 'daisy', size: 0.08 },
		{ base: [1.01, 0.22], c1: [0.95, 0.19], c2: [0.9, 0.16], tip: [0.84, 0.14], leaves: 1, leaf: 0.1, bloom: 'star', size: 0.06 },
		{ base: [-0.01, 0.2], c1: [0.04, 0.17], c2: [0.08, 0.15], tip: [0.13, 0.13], leaves: 1, leaf: 0.09, bloom: 'bud', size: 0.05 },
	],
};

// the footer band: a low bed of thicket and flowers, open in the middle
const FOOT: Scene = {
	clear: { cx: 0.5, cy: 0.1, rx: 0.17, ry: 0.55 },
	holes: [],
	mass: [[0.0, 1.0, 0.7], [0.15, 1.12, 0.6], [0.33, 1.25, 0.45], [0.67, 1.24, 0.45], [0.85, 1.1, 0.6], [1.0, 0.98, 0.7]],
	plants: [
		{ base: [0.05, 1.05], c1: [0.06, 0.8], c2: [0.08, 0.55], tip: [0.1, 0.32], leaves: 2, leaf: 0.2, bloom: 'daisy', size: 0.12, width: 1.3 },
		{ base: [0.15, 1.05], c1: [0.16, 0.85], c2: [0.18, 0.7], tip: [0.2, 0.55], leaves: 2, leaf: 0.17, bloom: 'star', size: 0.1 },
		{ base: [0.26, 1.05], c1: [0.27, 0.92], c2: [0.28, 0.82], tip: [0.3, 0.72], leaves: 1, leaf: 0.15, bloom: 'bud', size: 0.08 },
		{ base: [0.4, 1.05], c1: [0.4, 0.97], c2: [0.41, 0.9], tip: [0.42, 0.84], leaves: 1, leaf: 0.12, bloom: 'umbel', size: 0.09 },
		{ base: [0.61, 1.05], c1: [0.61, 0.96], c2: [0.6, 0.88], tip: [0.59, 0.8], leaves: 1, leaf: 0.13, bloom: 'star', size: 0.08 },
		{ base: [0.74, 1.05], c1: [0.74, 0.88], c2: [0.73, 0.72], tip: [0.71, 0.6], leaves: 2, leaf: 0.16, bloom: 'daisy', size: 0.1 },
		{ base: [0.86, 1.05], c1: [0.86, 0.8], c2: [0.88, 0.6], tip: [0.89, 0.4], leaves: 2, leaf: 0.18, bloom: 'star', size: 0.11, width: 1.3 },
		{ base: [0.96, 1.05], c1: [0.95, 0.9], c2: [0.94, 0.78], tip: [0.93, 0.68], leaves: 1, leaf: 0.14, bloom: 'bud', size: 0.08 },
	],
};

export type Variant = 'hero' | 'foot' | 'side';

// Options for a section's side garden: where the content sits (CSS px),
// which edge carries the main thicket, and whether it continues the hero.
export type SideOpts = { contentX0: number; contentX1: number; side: 'left' | 'right'; first?: boolean; seed?: number };

// A section's margin garden, built to fit the space either side of the
// content: a thicket growing in from one edge, two plants reaching toward
// the copy, a sprig on the opposite edge. Sizes follow the margin width.
function sideScene(W: number, H: number, cssW: number, U: number, o: SideOpts): Scene {
	const a = o.contentX0 / cssW, b = o.contentX1 / cssW;
	const left = o.side === 'left';
	const mf = left ? a : 1 - b; // main margin, as a fraction of width
	const of = left ? 1 - b : a; // the other margin
	const X = (f: number) => (left ? f : 1 - f);
	const Xo = (f: number) => (left ? 1 - f : f);
	const m = (mf * W) / U; // main margin in U units
	const mo = (of * W) / U;
	const mass: Blob[] = [
		[X(-mf * 0.35), 0.5, m * 0.72],
		[X(-mf * 0.3), 0.84, m * 0.55],
		[Xo(-of * 0.35), 0.96, mo * 0.5],
	];
	if (o.first) mass.push([X(-0.01), -0.06, m * 0.55], [Xo(-0.01), -0.08, mo * 0.5]); // carry on from the hero
	const plants: Stem[] = [
		{ base: [X(-0.01), 0.98], c1: [X(mf * 0.2), 0.78], c2: [X(mf * 0.45), 0.6], tip: [X(mf * 0.7), 0.46], leaves: 2, leaf: m * 0.3, bloom: 'daisy', size: m * 0.12 },
		{ base: [X(-0.01), 0.36], c1: [X(mf * 0.22), 0.31], c2: [X(mf * 0.4), 0.27], tip: [X(mf * 0.58), 0.22], leaves: 1, leaf: m * 0.24, bloom: 'star', size: m * 0.1 },
		{ base: [Xo(-0.01), 1.02], c1: [Xo(of * 0.15), 0.92], c2: [Xo(of * 0.3), 0.86], tip: [Xo(of * 0.45), 0.8], leaves: 1, leaf: mo * 0.22, bloom: (o.seed ?? 0) % 2 ? 'bud' : 'umbel', size: mo * 0.09 },
	];
	return {
		clear: { cx: -10, cy: -10, rx: 1, ry: 1 }, // no central clearing; the content box below does it
		holes: [[a - 0.01, -0.2, b + 0.01, 1.2]],
		mass,
		plants,
	};
}

// phones and tall windows get the corner-and-floor composition
export const isNarrow = (cssW: number, cssH: number) => cssW / cssH < 0.9 || cssW < 700;

// ---------- painting ----------
class Layer {
	W: number;
	H: number;
	buf: Uint8Array;
	clip: (x: number, y: number) => number;
	constructor(W: number, H: number, clip: (x: number, y: number) => number) {
		this.W = W;
		this.H = H;
		this.clip = clip;
		this.buf = new Uint8Array(W * H);
	}
	set(x: number, y: number, c: number) {
		x = Math.round(x);
		y = Math.round(y);
		if (x < 0 || y < 0 || x >= this.W || y >= this.H) return;
		if (this.clip(x, y) < 1) return; // inside the clear zone
		this.buf[y * this.W + x] = c;
	}
}

const bez = (p0: number[], p1: number[], p2: number[], p3: number[], t: number) => {
	const u = 1 - t;
	return [
		u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
		u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
	];
};

// a narrow, gently curved leaf: dark rim, mid body, pale vein
function leaf(L: Layer, x0: number, y0: number, ang: number, len: number, bend: number, ramp: number[], seed: number) {
	const ca = Math.cos(ang), sa = Math.sin(ang);
	const width = len * 0.2;
	const R = Math.ceil(len + 2);
	for (let y = Math.floor(y0 - R); y <= y0 + R; y++) {
		for (let x = Math.floor(x0 - R); x <= x0 + R; x++) {
			const dx = x - x0, dy = y - y0;
			const s = (dx * ca + dy * sa) / len;
			if (s <= 0 || s >= 1) continue;
			const n = (-dx * sa + dy * ca) / width - bend * s * s * 2.2; // curve toward the tip
			const hw = Math.sin(Math.PI * s ** 0.7) ** 1.1;
			if (Math.abs(n) > hw) continue;
			const rel = n / Math.max(0.01, hw);
			let c: number;
			if (Math.abs(rel) > 0.72) c = ramp[0];
			else if (Math.abs(n * width) < 0.55 && s < 0.8) c = ramp[3];
			else {
				const v = 0.55 - 0.35 * rel + (hash(x, y, seed) - 0.5) * 0.5;
				c = ramp[clamp(Math.floor(v * 3) + 1, 1, 2)];
			}
			L.set(x, y, c);
		}
	}
}

// --- blooms ---
function daisy(L: Layer, x0: number, y0: number, R: number, tilt: number, seed: number) {
	const rand = rng(seed);
	const n = 9 + Math.floor(rand() * 4);
	const rot = rand() * Math.PI;
	const squash = 0.78; // seen a little from the side
	const ct = Math.cos(tilt), st = Math.sin(tilt);
	const B = Math.ceil(R + 2);
	for (let y = Math.floor(y0 - B); y <= y0 + B; y++) {
		for (let x = Math.floor(x0 - B); x <= x0 + B; x++) {
			// into the flower's own frame (tilted, squashed)
			const dx = x - x0, dy = y - y0;
			const u = dx * ct + dy * st, v = (-dx * st + dy * ct) / squash;
			const r = Math.hypot(u, v);
			if (r > R) continue;
			if (r < R * 0.3) {
				// centre: deep blue, speckled
				L.set(x, y, r > R * 0.24 ? BLUE : hash(x, y, seed) < 0.25 ? BLUE_M : BLUE_D);
				continue;
			}
			const th = Math.atan2(v, u) - rot;
			const k = Math.round((th * n) / (Math.PI * 2));
			const dth = th - (k * Math.PI * 2) / n;
			const along = r * Math.cos(dth), perp = Math.abs(r * Math.sin(dth));
			const pw = R * 0.21 * Math.sin(Math.PI * clamp((along - R * 0.22) / (R * 0.78), 0, 1)) ** 0.7;
			if (perp > pw) continue;
			const rim = perp > pw - 1 || along > R - 1.2;
			const inner = (along - R * 0.22) / (R * 0.78); // 0 at the centre … 1 at the tip
			L.set(x, y, rim ? BLUE : inner < 0.45 && hash(x, y, seed + 1) < 0.75 - inner ? BLUE_M : hash(x, y, seed + 2) < 0.4 ? BLUE_L : WHITE);
		}
	}
}

// a four-point star flower, echoing the ink stars
function starFlower(L: Layer, x0: number, y0: number, R: number, rot: number, seed: number) {
	const B = Math.ceil(R + 2);
	const inside = (u: number, v: number, r: number) => (Math.abs(u) / r) ** 0.55 + (Math.abs(v) / r) ** 0.55 < 1;
	for (let y = Math.floor(y0 - B); y <= y0 + B; y++) {
		for (let x = Math.floor(x0 - B); x <= x0 + B; x++) {
			const dx = x - x0, dy = y - y0;
			const u = dx * Math.cos(rot) + dy * Math.sin(rot), v = -dx * Math.sin(rot) + dy * Math.cos(rot);
			const r = Math.hypot(u, v);
			if (inside(u, v, R)) {
				const edge = !inside(u, v, R - 1.6);
				L.set(x, y, r < R * 0.12 ? BLUE_D : edge ? BLUE_D : r < R * 0.4 ? (hash(x, y, seed) < 0.6 ? BLUE_M : BLUE_L) : hash(x, y, seed + 1) < 0.3 ? BLUE_L : WHITE);
			}
		}
	}
}

function bud(L: Layer, x0: number, y0: number, R: number, ang: number) {
	const ca = Math.cos(ang), sa = Math.sin(ang);
	const B = Math.ceil(R + 2);
	for (let y = Math.floor(y0 - B); y <= y0 + B; y++) {
		for (let x = Math.floor(x0 - B); x <= x0 + B; x++) {
			const dx = x - x0, dy = y - y0;
			const u = (dx * ca + dy * sa) / R, v = (-dx * sa + dy * ca) / (R * 0.55);
			const d = u * u + v * v;
			if (d > 1) continue;
			L.set(x, y, d > 0.7 ? BLUE_D : u > 0.35 ? WHITE : v < 0 ? BLUE_M : BLUE);
		}
	}
}

function umbel(L: Layer, x0: number, y0: number, R: number, ang: number, seed: number) {
	const rand = rng(seed);
	for (let k = 0; k < 9; k++) {
		const a = ang + (k / 8 - 0.5) * 1.9;
		const d = R * (0.75 + rand() * 0.25);
		const fx = x0 + Math.cos(a) * d, fy = y0 + Math.sin(a) * d;
		for (let q = 1; q < d; q++) L.set(x0 + Math.cos(a) * q, y0 + Math.sin(a) * q, BLUE_M);
		for (let oy = -2; oy <= 2; oy++)
			for (let ox = -2; ox <= 2; ox++) {
				const r = Math.hypot(ox, oy);
				if (r <= 1.9) L.set(fx + ox, fy + oy, r < 0.8 ? BLUE_D : WHITE);
			}
	}
}

function plant(L: Layer, s: Stem, W: number, H: number, U: number, seed: number) {
	const rand = rng(seed);
	const p0 = [s.base[0] * W, s.base[1] * H], p1 = [s.c1[0] * W, s.c1[1] * H];
	const p2 = [s.c2[0] * W, s.c2[1] * H], p3 = [s.tip[0] * W, s.tip[1] * H];
	const steps = Math.ceil(Math.hypot(p3[0] - p0[0], p3[1] - p0[1]) * 2);
	const w0 = (s.width ?? 1.1) * Math.max(1, U / 500);

	// stem: thin, darker on its shadow side
	for (let i = 0; i <= steps; i++) {
		const t = i / steps;
		const [x, y] = bez(p0, p1, p2, p3, t);
		const r = w0 * (1 - 0.45 * t);
		for (let oy = -Math.ceil(r); oy <= r; oy++)
			for (let ox = -Math.ceil(r); ox <= r; ox++) {
				if (ox * ox + oy * oy > r * r + 0.3) continue;
				L.set(x + ox, y + oy, ox > 0 ? BLUE_D : BLUE_M);
			}
	}

	// a few narrow leaves, alternating sides
	for (let j = 0; j < s.leaves; j++) {
		const t = 0.2 + (0.55 * (j + 0.5)) / s.leaves + (rand() - 0.5) * 0.06;
		const [x, y] = bez(p0, p1, p2, p3, t);
		const [x2, y2] = bez(p0, p1, p2, p3, Math.min(1, t + 0.01));
		const a = Math.atan2(y2 - y, x2 - x);
		const side = j % 2 ? 1 : -1;
		const ramp = rand() < 0.25 ? LEAF_GREY : LEAF_BLUE;
		leaf(L, x, y, a + side * (0.55 + rand() * 0.3), s.leaf * U * (0.85 + rand() * 0.3), -side * 0.25, ramp, seed * 7 + j);
	}

	// the bloom, facing along the stem's last direction
	const [xb, yb] = bez(p0, p1, p2, p3, 0.96);
	const a = Math.atan2(p3[1] - yb, p3[0] - xb);
	const R = s.size * U * (s.bloom === 'star' ? 1.5 : s.bloom === 'daisy' ? 1.2 : 1);
	if (s.bloom === 'daisy') daisy(L, p3[0], p3[1], R, a + Math.PI / 2, seed);
	else if (s.bloom === 'star') starFlower(L, p3[0], p3[1], R, a + Math.PI / 2 + (rand() - 0.5) * 0.4, seed);
	else if (s.bloom === 'bud') bud(L, p3[0] + Math.cos(a) * R * 0.6, p3[1] + Math.sin(a) * R * 0.6, R, a);
	else umbel(L, p3[0], p3[1], R, a, seed);
}

// ---------- the garden ----------
export type Sprite = { x: number; y: number; w: number; h: number; buf: Uint8Array; base: number; amp: number; period: number; phase: number };
export type Garden = { W: number; H: number; mass: Uint8Array; plants: Sprite[] };

// `tail` (CSS px) extends the canvas below the scene: thickets and stems
// carry on into it and dissolve into stipple, so the garden has no hard
// bottom edge where the next section begins.
// `custom` swaps in a hand-made composition (used for the OG image).
export function buildGarden(cssW: number, cssH: number, variant: Variant = 'hero', side?: SideOpts, tail = 0, custom?: Scene): Garden {
	const W = Math.max(1, Math.ceil(cssW / PX));
	const H = Math.max(1, Math.ceil(cssH / PX));
	const Hs = Math.max(1, H - Math.round(tail / PX)); // the scene's own height
	const narrow = isNarrow(cssW, cssH - tail);
	const U = variant === 'foot' ? Math.min(Hs, W * 0.5) : variant === 'side' ? Math.min(Hs, W * 0.62) : narrow ? W : Math.min(Hs, W * 0.62);
	const scene = custom ?? (variant === 'side' && side ? sideScene(W, Hs, cssW, U, side) : variant === 'foot' ? FOOT : narrow ? NARROW : WIDE);
	const { cx, cy, rx, ry } = scene.clear;
	// where the dissolve starts, and how far through it a row is (0…1)
	const fade0 = tail ? Hs * 0.8 : H;
	const fadeAt = (y: number) => (y <= fade0 ? 0 : (y - fade0) / Math.max(1, H - fade0));

	// superellipse distance from the copy: < 1 inside the clear zone
	const zone = (x: number, y: number) => {
		const ex = Math.abs(x / W - cx) / rx, ey = Math.abs(y / Hs - cy) / ry;
		let e = Math.sqrt(ex ** 4 + ey ** 4);
		const nx = x / W, ny = y / Hs;
		for (const [a, b, c, d] of scene.holes) {
			// soft rounded rectangle: 0.6 inside, rising to 1 about 4% outside
			const out = Math.hypot(Math.max(a - nx, 0, nx - c), Math.max(b - ny, 0, ny - d) * (Hs / W));
			e = Math.min(e, 0.6 + out / 0.04);
		}
		return e;
	};

	// --- ink thickets, tucked into the edges ---
	const mass = new Uint8Array(W * H);
	for (let y = 0; y < H; y++) {
		for (let x = 0; x < W; x++) {
			let d = -1;
			for (const [bx, by, br] of scene.mass) {
				const v = 1 - Math.hypot(x - bx * W, y - by * Hs) / (br * U * 0.72);
				if (v > d) d = v;
			}
			if (d < -0.4) continue;
			d += (fbm(x * 0.016, y * 0.016) - 0.5) * 0.6;
			const e = zone(x, y);
			if (e < 1.3) d -= (1.3 - e) * 1.4;
			d -= fadeAt(y) ** 1.4 * 0.9; // dissolve into the tail
			const h = hash(x, y, 1);
			let c = 0;
			if (d > 0.1) {
				// ink, with soft drifts of grey stipple
				const t = fbm(x * 0.03 + 40, y * 0.03);
				c = t > 0.54 && h < (t - 0.54) * 2.4 ? (hash(x, y, 2) < 0.5 ? GREY : GREY_L) : h < 0.03 ? GREY_D : INK;
			} else if (d > -0.08) {
				const p = (d + 0.08) / 0.18; // sprayed edge
				if (h < p * p) c = INK;
				else if (hash(x, y, 3) < p * 0.18) c = GREY;
			} else if (d > -0.3) {
				if (h < ((d + 0.3) / 0.22) * 0.06) c = GREY;
			}
			if (c) mass[y * W + x] = c;
		}
	}

	// --- plants, each cropped to its own sprite ---
	const clip = (x: number, y: number) => {
		// stems thin out into the tail, starting a little below the thickets
		const f = tail ? Math.max(0, (y - Hs * 0.98) / Math.max(1, H - Hs * 0.98)) : 0;
		if (f > 0 && hash(x, y, 9) < f ** 0.7) return 0;
		return zone(x, y) / 0.92;
	};
	const plants: Sprite[] = [];
	const rand = rng(97);
	scene.plants.forEach((s, i) => {
		const L = new Layer(W, H, clip);
		// with a tail, roots reach down into it instead of stopping at the edge
		const st = tail && s.base[1] >= 1 ? { ...s, base: [s.base[0], (H / Hs) * 0.98] as P } : s;
		plant(L, st, W, Hs, U, 11 + i * 13);
		let x0 = W, y0 = H, x1 = -1, y1 = -1;
		for (let y = 0; y < H; y++)
			for (let x = 0; x < W; x++)
				if (L.buf[y * W + x]) {
					if (x < x0) x0 = x;
					if (x > x1) x1 = x;
					if (y < y0) y0 = y;
					if (y > y1) y1 = y;
				}
		if (x1 < 0) return;
		const w = x1 - x0 + 1, h = y1 - y0 + 1;
		const buf = new Uint8Array(w * h);
		for (let y = 0; y < h; y++) buf.set(L.buf.subarray((y0 + y) * W + x0, (y0 + y) * W + x0 + w), y * w);
		plants.push({
			x: x0,
			y: y0,
			w,
			h,
			buf,
			base: Math.min(H, s.base[1] * Hs), // sway pivots here: the tip moves, the root stays
			amp: 1.5 + rand() * 1.5,
			period: 7 + rand() * 5,
			phase: rand() * Math.PI * 2,
		});
	});

	return { W, H, mass, plants };
}

// Composite one frame: thickets, then each plant leaning by its own sway.
// Rows shift in proportion to their height above the root, so stems bend.
export function renderGarden(g: Garden, img: ImageData, t: number) {
	const data = img.data;
	data.fill(0);
	const put = (i: number, c: number) => {
		const [r, gg, b] = COLORS[c];
		data[i * 4] = r;
		data[i * 4 + 1] = gg;
		data[i * 4 + 2] = b;
		data[i * 4 + 3] = 255;
	};
	for (let i = 0; i < g.mass.length; i++) if (g.mass[i]) put(i, g.mass[i]);
	for (const s of g.plants) {
		const lean = Math.sin((t / s.period) * Math.PI * 2 + s.phase);
		const reach = Math.max(1, s.base - s.y);
		for (let j = 0; j < s.h; j++) {
			const y = s.y + j;
			if (y < 0 || y >= g.H) continue;
			const k = Math.max(0, Math.min(1, (s.base - y) / reach));
			const dx = Math.round(lean * s.amp * k);
			const row = j * s.w;
			for (let i = 0; i < s.w; i++) {
				const c = s.buf[row + i];
				if (!c) continue;
				const x = s.x + i + dx;
				if (x >= 0 && x < g.W) put(y * g.W + x, c);
			}
		}
	}
}
