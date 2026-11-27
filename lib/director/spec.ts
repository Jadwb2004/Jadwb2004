import { z } from 'zod'

/**
 * The GameSpec is the director's plan. It is the single contract between the
 * director (any model, rented or our own) and the game engine. The engine only
 * ever reads a GameSpec — it never runs model-written code — so every build is
 * safe, repeatable, and editable by hand.
 */

export const GENRES = ['collector', 'dodger', 'platformer', 'shooter'] as const
export const SHAPES = ['circle', 'square', 'triangle', 'star', 'diamond'] as const
export const CAMERAS = ['fixed', 'follow'] as const

export const GENRE_INFO: Record<(typeof GENRES)[number], { label: string; blurb: string; controls: string[] }> = {
  collector: {
    label: 'Collector',
    blurb: 'Top-down: roam the map, gather items, avoid hazards.',
    controls: ['Arrow keys / WASD — move', 'Enter — start / restart'],
  },
  dodger: {
    label: 'Dodger',
    blurb: 'Things fall from the sky: dodge the bad, catch the good, survive.',
    controls: ['← → / A D — move', 'Enter — start / restart'],
  },
  platformer: {
    label: 'Platformer',
    blurb: 'Side-scrolling: run, jump between platforms, reach the flag.',
    controls: ['← → / A D — run', 'Space / ↑ / W — jump', 'Enter — start / restart'],
  },
  shooter: {
    label: 'Shooter',
    blurb: 'Enemies descend in waves: move and fire to clear them.',
    controls: ['← → / A D — move', 'Space — fire', 'Enter — start / restart'],
  },
}

const hex = z.string().describe('A hex color like #ffcc00')

export const CharacterSchema = z.object({
  name: z.string(),
  role: z.enum(['player', 'enemy', 'collectible']),
  description: z.string().describe('One sentence; keeps the character consistent across scenes'),
  color: hex,
  shape: z.enum(SHAPES),
})

export const GameSpecSchema = z.object({
  title: z.string(),
  pitch: z.string().describe('One-sentence pitch of the finished game'),
  genre: z.enum(GENRES),
  gameplay: z.object({
    goal: z.string(),
    rules: z.array(z.string()),
    win: z.string(),
    lose: z.string(),
  }),
  look: z.object({
    style: z.string().describe('Short art direction, e.g. "soft pastel, rounded shapes"'),
    background: hex,
    ground: hex.describe('Platforms / floor / grid color'),
    text: hex.describe('HUD text color, readable on the background'),
  }),
  camera: z.enum(CAMERAS),
  characters: z.array(CharacterSchema).describe('Exactly one player, one enemy, one collectible'),
  ui: z.object({
    hud: z.array(z.enum(['score', 'lives', 'timer'])),
    titleScreen: z.string().describe('Text shown on the title screen under the title'),
    winMessage: z.string(),
    loseMessage: z.string(),
  }),
  ux: z.array(z.string()).describe('Onboarding and feel notes, e.g. "first 5 seconds have no hazards"'),
  tuning: z.object({
    playerSpeed: z.number().describe('1-10'),
    enemySpeed: z.number().describe('1-10'),
    enemyCount: z.number().describe('1-20'),
    targetScore: z.number().describe('1-100, score needed to win'),
    timeLimit: z.number().describe('0-300 seconds; 0 means no timer'),
    lives: z.number().describe('1-9'),
    gravity: z.number().describe('1-10, platformer only'),
  }),
})

export type GameSpec = z.infer<typeof GameSpecSchema>
export type Character = z.infer<typeof CharacterSchema>
export type Genre = (typeof GENRES)[number]
export type TuningKey = keyof GameSpec['tuning']

export const TUNING_RANGES: Record<TuningKey, { min: number; max: number; label: string }> = {
  playerSpeed: { min: 1, max: 10, label: 'Player speed' },
  enemySpeed: { min: 1, max: 10, label: 'Enemy speed' },
  enemyCount: { min: 1, max: 20, label: 'Enemy count' },
  targetScore: { min: 1, max: 100, label: 'Score to win' },
  timeLimit: { min: 0, max: 300, label: 'Time limit (s, 0 = none)' },
  lives: { min: 1, max: 9, label: 'Lives' },
  gravity: { min: 1, max: 10, label: 'Gravity' },
}

const clamp = (n: number, min: number, max: number) =>
  Math.round(Math.min(max, Math.max(min, Number.isFinite(n) ? n : min)))

const isHex = (s: string) => /^#[0-9a-fA-F]{6}$/.test(s)

/** Make any spec (from a model, an import, or a hand edit) safe for the engine. */
export function sanitizeSpec(spec: GameSpec): GameSpec {
  const t = spec.tuning
  const tuning = Object.fromEntries(
    (Object.keys(TUNING_RANGES) as TuningKey[]).map((k) => [
      k,
      clamp(t[k], TUNING_RANGES[k].min, TUNING_RANGES[k].max),
    ]),
  ) as GameSpec['tuning']

  const fallback: Record<Character['role'], Character> = {
    player: { name: 'Hero', role: 'player', description: 'The hero.', color: '#4fd1c5', shape: 'circle' },
    enemy: { name: 'Hazard', role: 'enemy', description: 'Avoid it.', color: '#f56565', shape: 'triangle' },
    collectible: { name: 'Gem', role: 'collectible', description: 'Grab it.', color: '#f6e05e', shape: 'star' },
  }
  const characters = (['player', 'enemy', 'collectible'] as const).map((role) => {
    const c = spec.characters.find((x) => x.role === role) ?? fallback[role]
    return { ...c, role, color: isHex(c.color) ? c.color : fallback[role].color }
  })

  return {
    ...spec,
    genre: (GENRES as readonly string[]).includes(spec.genre) ? spec.genre : 'collector',
    camera: spec.genre === 'platformer' ? 'follow' : spec.camera,
    look: {
      ...spec.look,
      background: isHex(spec.look.background) ? spec.look.background : '#101820',
      ground: isHex(spec.look.ground) ? spec.look.ground : '#2d3748',
      text: isHex(spec.look.text) ? spec.look.text : '#ffffff',
    },
    characters,
    tuning,
  }
}

export function character(spec: GameSpec, role: Character['role']): Character {
  return spec.characters.find((c) => c.role === role)!
}
