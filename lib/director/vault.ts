import type { GameSpec, Genre, TuningKey } from './spec'

/**
 * The vault: the company's own saved, linked library of everything the
 * director has ever directed — idea, plan, build, test notes, fixes.
 *
 * v1 stores it in the browser (localStorage) with JSON export/import.
 * Phase 2 moves the same shape to a server database; nothing else changes.
 */

export type Lesson = { genre: Genre; param: TuningKey; delta: number; reason: string }

export type Version = {
  v: number
  spec: GameSpec
  createdAt: number
  source: 'plan' | 'edit' | 'redirect'
  changes: string[]
}

export type ThreadMessage = {
  id: string
  role: 'user' | 'director'
  kind: 'idea' | 'plan' | 'notes' | 'changes' | 'edit' | 'error'
  text: string
  version?: number
  at: number
}

export type VaultEntry = {
  id: string
  idea: string
  createdAt: number
  updatedAt: number
  provider: string
  versions: Version[]
  thread: ThreadMessage[]
  lessons: Lesson[]
  plays: number
}

/** What the director reads from the vault before planning something new. */
export type VaultMemory = {
  builds: number
  lessons: Lesson[]
  recent: { idea: string; genre: Genre; title: string; notes: string[] }[]
}

const KEY = 'ai-game-director.vault.v1'

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

export function loadVault(): VaultEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as VaultEntry[]) : []
  } catch {
    return []
  }
}

export function saveVault(entries: VaultEntry[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries))
  } catch {
    // storage full or blocked: the session still works, it just won't persist
  }
}

export function latest(entry: VaultEntry): Version {
  return entry.versions[entry.versions.length - 1]
}

export function buildMemory(entries: VaultEntry[]): VaultMemory {
  return {
    builds: entries.length,
    lessons: entries.flatMap((e) => e.lessons),
    recent: entries.slice(0, 12).map((e) => {
      const spec = latest(e).spec
      return {
        idea: e.idea,
        genre: spec.genre,
        title: spec.title,
        notes: e.thread.filter((m) => m.kind === 'notes').map((m) => m.text),
      }
    }),
  }
}
