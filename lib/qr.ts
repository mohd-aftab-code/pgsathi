/**
 * lib/qr.ts
 * A small QR encoder — byte mode, error-correction level M, versions 1–10.
 *
 * Written by hand rather than pulled in as a dependency because the only thing
 * the marketing kit needs to encode is a short referral URL (~30 characters,
 * comfortably inside version 3), and a QR library is a surprisingly large
 * amount of code and supply-chain surface for that.
 *
 * Level M corrects ~15% damage, which is the usual choice for something that
 * ends up printed on a poster or a visiting card.
 *
 * Output is an SVG string: no canvas, no image pipeline, scales cleanly, and
 * can be inlined straight into a page or a download.
 */

// ─────────────────────────────────────────────────────────────────────────────
//  Capacity tables (level M only)
// ─────────────────────────────────────────────────────────────────────────────

/** [eccPerBlock, group1Blocks, group1DataCodewords, group2Blocks, group2DataCodewords] */
const ECC_M: Record<number, [number, number, number, number, number]> = {
  1: [10, 1, 16, 0, 0],
  2: [16, 1, 28, 0, 0],
  3: [26, 1, 44, 0, 0],
  4: [18, 2, 32, 0, 0],
  5: [24, 2, 43, 0, 0],
  6: [16, 4, 27, 0, 0],
  7: [18, 4, 31, 0, 0],
  8: [22, 2, 38, 2, 39],
  9: [22, 3, 36, 2, 37],
  10: [26, 4, 43, 1, 44],
};

/** Centres of the alignment patterns for each version. */
const ALIGNMENT: Record<number, number[]> = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
};

const dataCapacity = (version: number): number => {
  const [, g1, d1, g2, d2] = ECC_M[version];
  return g1 * d1 + g2 * d2;
};

// ─────────────────────────────────────────────────────────────────────────────
//  GF(256) arithmetic for Reed–Solomon
// ─────────────────────────────────────────────────────────────────────────────

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d; // QR's primitive polynomial
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();

const gfMul = (a: number, b: number): number => (a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]]);

/** Generator polynomial for `degree` ECC codewords. */
function rsGenerator(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], EXP[i]);
    }
    poly = next;
  }
  return poly;
}

/** The `degree` ECC codewords for one data block. */
export function rsEncode(data: number[], degree: number): number[] {
  const gen = rsGenerator(degree);
  const rem = new Array(degree).fill(0);
  for (const byte of data) {
    const factor = byte ^ rem[0];
    rem.shift();
    rem.push(0);
    for (let i = 0; i < degree; i++) rem[i] ^= gfMul(gen[i + 1], factor);
  }
  return rem;
}

// ─────────────────────────────────────────────────────────────────────────────
//  BCH codes for the format and version information
// ─────────────────────────────────────────────────────────────────────────────

function bch(value: number, generator: number, genBits: number): number {
  let v = value << (genBits - 1);
  const genLen = 32 - Math.clz32(generator);
  while (32 - Math.clz32(v) >= genLen) {
    v ^= generator << (32 - Math.clz32(v) - genLen);
  }
  return v;
}

/** 15-bit format info for level M and the given mask. */
function formatBits(mask: number): number {
  const data = (0b00 << 3) | mask; // 00 = level M
  return ((data << 10) | bch(data, 0b10100110111, 11)) ^ 0b101010000010010;
}

/** 18-bit version info, required from version 7 upwards. */
function versionBits(version: number): number {
  return (version << 12) | bch(version, 0b1111100100100, 13);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Encoding
// ─────────────────────────────────────────────────────────────────────────────

function toUtf8(text: string): number[] {
  const out: number[] = [];
  for (const byte of new TextEncoder().encode(text)) out.push(byte);
  return out;
}

function chooseVersion(byteLength: number): number {
  for (let v = 1; v <= 10; v++) {
    // 4 mode bits + character count (8 bits up to v9, 16 bits from v10) + data
    const countBits = v < 10 ? 8 : 16;
    const needed = Math.ceil((4 + countBits + byteLength * 8) / 8);
    if (needed <= dataCapacity(v)) return v;
  }
  throw new Error("QR: content too long (max is version 10 at level M)");
}

/** Mode indicator, length, payload, terminator and padding — as codewords. */
function buildDataCodewords(bytes: number[], version: number): number[] {
  const capacity = dataCapacity(version);
  const countBits = version < 10 ? 8 : 16;

  const bits: number[] = [];
  const push = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >> i) & 1);
  };

  push(0b0100, 4); // byte mode
  push(bytes.length, countBits);
  for (const b of bytes) push(b, 8);

  // Terminator, then pad to a byte boundary.
  const capacityBits = capacity * 8;
  for (let i = 0; i < 4 && bits.length < capacityBits; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);

  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    codewords.push(byte);
  }

  // The spec's alternating pad bytes.
  const PAD = [0xec, 0x11];
  let p = 0;
  while (codewords.length < capacity) codewords.push(PAD[p++ % 2]);

  return codewords;
}

/** Splits into blocks, computes ECC, and interleaves both as the spec requires. */
function interleave(dataCodewords: number[], version: number): number[] {
  const [eccPerBlock, g1, d1, g2, d2] = ECC_M[version];

  const blocks: number[][] = [];
  let offset = 0;
  for (let i = 0; i < g1; i++) {
    blocks.push(dataCodewords.slice(offset, offset + d1));
    offset += d1;
  }
  for (let i = 0; i < g2; i++) {
    blocks.push(dataCodewords.slice(offset, offset + d2));
    offset += d2;
  }

  const eccBlocks = blocks.map((b) => rsEncode(b, eccPerBlock));

  const out: number[] = [];
  const maxData = Math.max(...blocks.map((b) => b.length));
  for (let i = 0; i < maxData; i++) {
    for (const block of blocks) if (i < block.length) out.push(block[i]);
  }
  for (let i = 0; i < eccPerBlock; i++) {
    for (const block of eccBlocks) out.push(block[i]);
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Matrix
// ─────────────────────────────────────────────────────────────────────────────

type Matrix = {
  size: number;
  /** 1 = dark, 0 = light */
  modules: Uint8Array;
  /** 1 = reserved (function pattern), data must not be written here */
  reserved: Uint8Array;
};

const at = (m: Matrix, r: number, c: number) => m.modules[r * m.size + c];
const set = (m: Matrix, r: number, c: number, dark: number, reserve = true) => {
  m.modules[r * m.size + c] = dark;
  if (reserve) m.reserved[r * m.size + c] = 1;
};

function placeFunctionPatterns(m: Matrix, version: number): void {
  const size = m.size;

  const finder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = row + r;
        const cc = col + c;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        const inRing = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        const dark = inRing && (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
        set(m, rr, cc, dark ? 1 : 0);
      }
    }
  };
  finder(0, 0);
  finder(0, size - 7);
  finder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    const dark = i % 2 === 0 ? 1 : 0;
    set(m, 6, i, dark);
    set(m, i, 6, dark);
  }

  // Alignment patterns, skipping the three finder corners
  const centres = ALIGNMENT[version];
  for (const r of centres) {
    for (const c of centres) {
      const nearFinder =
        (r <= 8 && c <= 8) || (r <= 8 && c >= size - 9) || (r >= size - 9 && c <= 8);
      if (nearFinder) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const ring = Math.max(Math.abs(dr), Math.abs(dc));
          set(m, r + dr, c + dc, ring === 1 ? 0 : 1);
        }
      }
    }
  }

  // Dark module, always set, always at this position
  set(m, size - 8, 8, 1);

  // Reserve the format information areas
  for (let i = 0; i < 9; i++) {
    if (!m.reserved[8 * size + i]) set(m, 8, i, 0);
    if (!m.reserved[i * size + 8]) set(m, i, 8, 0);
  }
  for (let i = 0; i < 8; i++) {
    if (!m.reserved[8 * size + (size - 1 - i)]) set(m, 8, size - 1 - i, 0);
    if (!m.reserved[(size - 1 - i) * size + 8]) set(m, size - 1 - i, 8, 0);
  }

  // Reserve the version information areas (version 7 and up)
  if (version >= 7) {
    for (let i = 0; i < 18; i++) {
      const r = Math.floor(i / 3);
      const c = size - 11 + (i % 3);
      set(m, r, c, 0);
      set(m, c, r, 0);
    }
  }
}

function placeData(m: Matrix, codewords: number[]): void {
  const size = m.size;
  const bits: number[] = [];
  for (const cw of codewords) for (let i = 7; i >= 0; i--) bits.push((cw >> i) & 1);

  let bitIndex = 0;
  let upward = true;

  for (let right = size - 1; right >= 1; right -= 2) {
    // Column 6 is the vertical timing pattern and is skipped entirely.
    if (right === 6) right = 5;
    for (let step = 0; step < size; step++) {
      const row = upward ? size - 1 - step : step;
      for (const col of [right, right - 1]) {
        if (m.reserved[row * size + col]) continue;
        const bit = bitIndex < bits.length ? bits[bitIndex++] : 0;
        m.modules[row * size + col] = bit;
      }
    }
    upward = !upward;
  }
}

const MASKS: ((r: number, c: number) => boolean)[] = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

function applyMask(m: Matrix, mask: number): void {
  const fn = MASKS[mask];
  for (let r = 0; r < m.size; r++) {
    for (let c = 0; c < m.size; c++) {
      if (m.reserved[r * m.size + c]) continue;
      if (fn(r, c)) m.modules[r * m.size + c] ^= 1;
    }
  }
}

function placeFormat(m: Matrix, mask: number): void {
  const size = m.size;
  const bits = formatBits(mask);
  const bit = (i: number) => (bits >> i) & 1;

  // Copy 1, around the top-left finder
  for (let i = 0; i <= 5; i++) set(m, 8, i, bit(i));
  set(m, 8, 7, bit(6));
  set(m, 8, 8, bit(7));
  set(m, 7, 8, bit(8));
  for (let i = 9; i <= 14; i++) set(m, 14 - i, 8, bit(i));

  // Copy 2: bits 0–6 run up column 8 from the bottom, bits 7–14 run along row 8
  // to the right edge. The split is 7/8, not 8/7 — the eighth module up that
  // column is the dark module, which is fixed and not part of the format info.
  for (let i = 0; i <= 6; i++) set(m, size - 1 - i, 8, bit(i));
  for (let i = 7; i <= 14; i++) set(m, 8, size - 15 + i, bit(i));
}

function placeVersion(m: Matrix, version: number): void {
  if (version < 7) return;
  const size = m.size;
  const bits = versionBits(version);
  for (let i = 0; i < 18; i++) {
    const bit = (bits >> i) & 1;
    const r = Math.floor(i / 3);
    const c = size - 11 + (i % 3);
    set(m, r, c, bit);
    set(m, c, r, bit);
  }
}

/** The spec's four penalty rules — lower is better. */
function penalty(m: Matrix): number {
  const size = m.size;
  let score = 0;

  // Rule 1: runs of five or more same-coloured modules in a row or column
  for (const vertical of [false, true]) {
    for (let a = 0; a < size; a++) {
      let run = 1;
      let prev = vertical ? at(m, 0, a) : at(m, a, 0);
      for (let b = 1; b < size; b++) {
        const cur = vertical ? at(m, b, a) : at(m, a, b);
        if (cur === prev) {
          run++;
        } else {
          if (run >= 5) score += 3 + (run - 5);
          run = 1;
          prev = cur;
        }
      }
      if (run >= 5) score += 3 + (run - 5);
    }
  }

  // Rule 2: 2×2 blocks of one colour
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const v = at(m, r, c);
      if (v === at(m, r, c + 1) && v === at(m, r + 1, c) && v === at(m, r + 1, c + 1)) score += 3;
    }
  }

  // Rule 3: finder-like 1:1:3:1:1 patterns
  const P1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
  const P2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
  for (const vertical of [false, true]) {
    for (let a = 0; a < size; a++) {
      for (let b = 0; b + 11 <= size; b++) {
        let m1 = true;
        let m2 = true;
        for (let k = 0; k < 11; k++) {
          const v = vertical ? at(m, b + k, a) : at(m, a, b + k);
          if (v !== P1[k]) m1 = false;
          if (v !== P2[k]) m2 = false;
        }
        if (m1) score += 40;
        if (m2) score += 40;
      }
    }
  }

  // Rule 4: deviation from a 50/50 dark ratio
  let dark = 0;
  for (let i = 0; i < m.modules.length; i++) dark += m.modules[i];
  const percent = (dark * 100) / (size * size);
  score += Math.floor(Math.abs(percent - 50) / 5) * 10;

  return score;
}

/** The finished module grid — `true` is a dark module. */
export function qrMatrix(text: string): boolean[][] {
  const bytes = toUtf8(text);
  const version = chooseVersion(bytes.length);
  const size = 17 + version * 4;
  const codewords = interleave(buildDataCodewords(bytes, version), version);

  let best: Matrix | null = null;
  let bestScore = Infinity;

  for (let mask = 0; mask < 8; mask++) {
    const m: Matrix = {
      size,
      modules: new Uint8Array(size * size),
      reserved: new Uint8Array(size * size),
    };
    placeFunctionPatterns(m, version);
    placeData(m, codewords);
    applyMask(m, mask);
    placeFormat(m, mask);
    placeVersion(m, version);

    const score = penalty(m);
    if (score < bestScore) {
      bestScore = score;
      best = m;
    }
  }

  const m = best!;
  const grid: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) row.push(at(m, r, c) === 1);
    grid.push(row);
  }
  return grid;
}

/**
 * An SVG QR code for `text`.
 *
 * The quiet zone is not optional — scanners rely on the 4-module light border
 * to find the symbol, and a QR pasted flush against artwork often will not read.
 */
export function qrSvg(
  text: string,
  opts: { size?: number; dark?: string; light?: string; quietZone?: number } = {},
): string {
  const grid = qrMatrix(text);
  const modules = grid.length;
  const quiet = opts.quietZone ?? 4;
  const total = modules + quiet * 2;
  const px = opts.size ?? 240;
  const dark = opts.dark ?? "#111111";
  const light = opts.light ?? "#ffffff";

  // One path for every dark module keeps the SVG small and crisp at any size.
  let path = "";
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (grid[r][c]) path += `M${c + quiet} ${r + quiet}h1v1h-1z`;
    }
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" ` +
    `viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges" role="img" aria-label="QR code">` +
    `<rect width="${total}" height="${total}" fill="${light}"/>` +
    `<path d="${path}" fill="${dark}"/>` +
    `</svg>`
  );
}

/** Data-URI form, for `<img src>` and for embedding in a downloadable poster. */
export function qrDataUri(text: string, opts?: Parameters<typeof qrSvg>[1]): string {
  return `data:image/svg+xml;base64,${Buffer.from(qrSvg(text, opts)).toString("base64")}`;
}
