export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

export function buildOptions(correct: string, pool: readonly string[], count: number): string[] {
  const distractors = shuffle(pool.filter((p) => p !== correct)).slice(0, count - 1)
  return shuffle([correct, ...distractors])
}

export function joinNotes(notes: string[]): string {
  if (notes.length <= 1) return notes.join('')
  return notes.join(' + ')
}
