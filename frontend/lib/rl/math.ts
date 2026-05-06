// Minimal linear algebra for the bandit.

export function eye(d: number, scale = 1): number[][] {
  return Array.from({ length: d }, (_, i) => Array.from({ length: d }, (_, j) => i === j ? scale : 0))
}

export function vecZero(d: number): number[] {
  return Array.from({ length: d }, () => 0)
}

export function dot(a: number[], b: number[]): number {
  let s = 0
  for (let i = 0; i < a.length; i++) s += a[i] * b[i]
  return s
}

export function matVec(M: number[][], v: number[]): number[] {
  const d = M.length
  const out = vecZero(d)
  for (let i = 0; i < d; i++) {
    let s = 0
    for (let j = 0; j < d; j++) s += M[i][j] * v[j]
    out[i] = s
  }
  return out
}

export function outerProductInto(M: number[][], v: number[]): void {
  const d = v.length
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) M[i][j] += v[i] * v[j]
  }
}

export function inverse(M: number[][]): number[][] {
  const d = M.length
  const aug: number[][] = M.map((row, i) => {
    const r = row.slice()
    for (let j = 0; j < d; j++) r.push(i === j ? 1 : 0)
    return r
  })
  for (let col = 0; col < d; col++) {
    let pivot = col
    for (let r = col + 1; r < d; r++) {
      if (Math.abs(aug[r][col]) > Math.abs(aug[pivot][col])) pivot = r
    }
    if (Math.abs(aug[pivot][col]) < 1e-12) return eye(d, 1)
    if (pivot !== col) [aug[pivot], aug[col]] = [aug[col], aug[pivot]]
    const div = aug[col][col]
    for (let j = 0; j < 2 * d; j++) aug[col][j] /= div
    for (let r = 0; r < d; r++) {
      if (r === col) continue
      const factor = aug[r][col]
      if (factor === 0) continue
      for (let j = 0; j < 2 * d; j++) aug[r][j] -= factor * aug[col][j]
    }
  }
  return aug.map(row => row.slice(d))
}

export function gaussianSample(mean = 0, std = 1): number {
  const u = Math.random() || 1e-9
  const v = Math.random() || 1e-9
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  return mean + z * std
}
