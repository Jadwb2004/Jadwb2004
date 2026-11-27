import { GENRE_INFO, sanitizeSpec, TUNING_RANGES, type GameSpec, type Genre, type TuningKey } from './spec'
import type { Lesson, VaultMemory } from './vault'

/**
 * The built-in director. It needs no API key, so the dashboard always works —
 * offline, in demos, and as the fallback when a rented model is unavailable.
 * It plans from keywords plus vault memory, and re-directs from test notes.
 */

type Theme = {
  words: RegExp
  style: string
  background: string
  ground: string
  text: string
  player: [string, string, GameSpec['characters'][number]['shape']]
  enemy: [string, string, GameSpec['characters'][number]['shape']]
  collectible: [string, string, GameSpec['characters'][number]['shape']]
}

const THEMES: Record<string, Theme> = {
  garden: {
    words: /garden|flower|bee|honey|plant|seed|bloom|cozy|jelly ?bean|butterfly/,
    style: 'soft pastel garden, rounded shapes',
    background: '#1f3b2c', ground: '#3f6b4a', text: '#fdf6e3',
    player: ['Bee', '#f6c945', 'circle'], enemy: ['Wasp', '#e05d5d', 'triangle'], collectible: ['Flower', '#f49ac1', 'star'],
  },
  candy: {
    words: /candy|sweet|sugar|cake|cookie|chocolate|dessert|donut/,
    style: 'bright candy colors, glossy and bouncy',
    background: '#3b1d3f', ground: '#7a3e7f', text: '#fff0fa',
    player: ['Gummy', '#ff7eb6', 'circle'], enemy: ['Sour Drop', '#9be15d', 'diamond'], collectible: ['Candy', '#ffd166', 'star'],
  },
  space: {
    words: /space|alien|star|planet|rocket|galaxy|asteroid|meteor|ufo|invader|cosmic/,
    style: 'deep-space neon, glowing outlines',
    background: '#0b1026', ground: '#2a3563', text: '#e6f1ff',
    player: ['Ship', '#5ee7ff', 'triangle'], enemy: ['Alien', '#ff5c8a', 'diamond'], collectible: ['Star Shard', '#ffe066', 'star'],
  },
  ocean: {
    words: /ocean|sea|fish|shark|underwater|reef|whale|mermaid|dolphin|octopus/,
    style: 'calm underwater blues, bubbly',
    background: '#0c2f4a', ground: '#1f5f7a', text: '#e0fbff',
    player: ['Fish', '#ff9f43', 'circle'], enemy: ['Shark', '#8aa1b1', 'triangle'], collectible: ['Pearl', '#f8f9fa', 'circle'],
  },
  spooky: {
    words: /ghost|spooky|haunt|zombie|halloween|witch|pumpkin|skeleton|vampire|monster/,
    style: 'moody purple night, playful-spooky',
    background: '#1a1025', ground: '#3d2a54', text: '#f3e8ff',
    player: ['Ghost', '#e9e4ff', 'circle'], enemy: ['Zombie', '#7bd389', 'square'], collectible: ['Pumpkin', '#ff8c1a', 'circle'],
  },
  snow: {
    words: /snow|winter|ice|penguin|christmas|frost|cold|holiday/,
    style: 'crisp winter whites and icy blues',
    background: '#1c2a3a', ground: '#a9c7e8', text: '#ffffff',
    player: ['Penguin', '#f1f5f9', 'circle'], enemy: ['Snowball', '#93c5fd', 'circle'], collectible: ['Gift', '#ef4444', 'square'],
  },
  city: {
    words: /city|street|car|robot|cyber|neon|future|tech|hacker/,
    style: 'neon city at night, sharp edges',
    background: '#120f1f', ground: '#33305a', text: '#f0f0ff',
    player: ['Robot', '#38bdf8', 'square'], enemy: ['Drone', '#f43f5e', 'diamond'], collectible: ['Chip', '#a3e635', 'square'],
  },
  forest: {
    words: /forest|wood|tree|fox|rabbit|bunny|animal|mushroom|elf|fairy|nature/,
    style: 'warm woodland greens and browns',
    background: '#1d2b1f', ground: '#5a4632', text: '#fff8e7',
    player: ['Fox', '#f97316', 'triangle'], enemy: ['Bramble', '#7c3aed', 'diamond'], collectible: ['Acorn', '#d4a373', 'circle'],
  },
  desert: {
    words: /desert|sand|cactus|pyramid|egypt|western|cowboy|dune/,
    style: 'sunbaked desert oranges',
    background: '#3d2414', ground: '#c08552', text: '#fff4e0',
    player: ['Explorer', '#fde68a', 'circle'], enemy: ['Scorpion', '#b91c1c', 'triangle'], collectible: ['Coin', '#facc15', 'circle'],
  },
  classic: {
    words: /.^/,
    style: 'clean, bold, high contrast',
    background: '#111827', ground: '#374151', text: '#f9fafb',
    player: ['Hero', '#34d399', 'circle'], enemy: ['Blob', '#f87171', 'square'], collectible: ['Gem', '#fbbf24', 'diamond'],
  },
}

const GENRE_WORDS: [Genre, RegExp][] = [
  ['shooter', /shoot|blast|laser|fire at|gun|invader|defend|wave|zap|attack/],
  ['platformer', /jump|platform|run(ner)?\b|climb|parkour|level|side.?scroll|hop/],
  ['dodger', /dodge|falling|fall\b|rain|survive|meteor|catch/],
  ['collector', /collect|gather|pick|find|grow|harvest|explore|cozy/],
]

const cap = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase())
const singular = (w: string) => (w.endsWith('ies') ? w.slice(0, -3) + 'y' : w.replace(/(?<!s)s$/, ''))

const STOP = new Set(['and', 'or', 'but', 'while', 'to', 'from', 'in', 'on', 'at', 'as', 'with', 'for', 'of', 'the', 'a', 'an', 'that', 'then', 'by', 'into', 'across', 'around', 'game', 'cozy', 'fun', 'simple', 'cute', 'little', 'tiny'])

/** Capture "verb [adjective] noun": prefer the 2nd word unless it is a filler word. */
function pick(sentence: string, re: RegExp): string | null {
  const m = sentence.match(re)
  if (!m) return null
  const word = m[2] && !STOP.has(m[2]) ? m[2] : m[1]
  return STOP.has(word) ? null : cap(singular(word))
}

function detectGenre(s: string): Genre {
  // Explicit verbs first in priority order; "collect" wins only if nothing more specific matched.
  for (const [genre, re] of GENRE_WORDS) if (re.test(s)) return genre
  return 'collector'
}

function detectTheme(s: string): Theme {
  return Object.values(THEMES).find((t) => t.words.test(s)) ?? THEMES.classic
}

function makeTitle(player: string, collectible: string, genre: Genre): string {
  const tail: Record<Genre, string> = {
    collector: `${collectible} Hunt`,
    dodger: `${player} Dash`,
    platformer: `${player}'s Climb`,
    shooter: `${player} Defense`,
  }
  return tail[genre]
}

const BASE_TUNING: Record<Genre, GameSpec['tuning']> = {
  collector: { playerSpeed: 5, enemySpeed: 3, enemyCount: 3, targetScore: 15, timeLimit: 60, lives: 3, gravity: 5 },
  dodger: { playerSpeed: 6, enemySpeed: 4, enemyCount: 5, targetScore: 20, timeLimit: 45, lives: 3, gravity: 5 },
  platformer: { playerSpeed: 5, enemySpeed: 3, enemyCount: 4, targetScore: 10, timeLimit: 0, lives: 3, gravity: 5 },
  shooter: { playerSpeed: 6, enemySpeed: 3, enemyCount: 6, targetScore: 30, timeLimit: 0, lives: 3, gravity: 5 },
}

function rulesFor(genre: Genre, p: string, e: string, c: string, t: GameSpec['tuning']): GameSpec['gameplay'] {
  const timer = t.timeLimit > 0 ? ` within ${t.timeLimit} seconds` : ''
  switch (genre) {
    case 'collector':
      return {
        goal: `Guide the ${p} to collect ${t.targetScore} ${c}s${timer}.`,
        rules: [`Touching a ${c} scores 1 point and a new one appears.`, `Touching a ${e} costs a life and gives a short shield.`, `${e}s drift toward the ${p} — keep moving.`],
        win: `Collect ${t.targetScore} ${c}s.`,
        lose: t.timeLimit > 0 ? `Run out of lives or time.` : `Run out of lives.`,
      }
    case 'dodger':
      return {
        goal: t.timeLimit > 0 ? `Survive ${t.timeLimit} seconds of falling ${e}s.` : `Catch ${t.targetScore} ${c}s while dodging ${e}s.`,
        rules: [`${e}s and ${c}s fall from the top.`, `Catching a ${c} scores 1 point.`, `Getting hit by a ${e} costs a life.`, `Falling gets faster over time.`],
        win: t.timeLimit > 0 ? `Still standing when the timer hits zero.` : `Catch ${t.targetScore} ${c}s.`,
        lose: `Run out of lives.`,
      }
    case 'platformer':
      return {
        goal: `Run and jump the ${p} to the flag at the end of the level.`,
        rules: [`${c}s float above platforms — each scores 1 point.`, `${e}s patrol platforms; touching one costs a life.`, `Falling off the bottom costs a life and respawns at the last platform.`],
        win: `Reach the flag.`,
        lose: `Run out of lives.`,
      }
    case 'shooter':
      return {
        goal: `Defend the line: defeat ${t.targetScore} ${e}s.`,
        rules: [`${e}s descend in waves.`, `Each ${e} hit scores 1 point.`, `${/^[aeiou]/i.test(e) ? 'An' : 'A'} ${e} reaching the bottom or touching the ${p} costs a life.`, `Sometimes a defeated ${e} drops ${/^[aeiou]/i.test(c) ? 'an' : 'a'} ${c} — grab it for an extra life.`],
        win: `Defeat ${t.targetScore} ${e}s.`,
        lose: `Run out of lives.`,
      }
  }
}

/** Average what past notes taught the vault about this genre. */
function vaultAdjustments(memory: VaultMemory | undefined, genre: Genre) {
  const byParam = new Map<TuningKey, { sum: number; n: number; reasons: Set<string> }>()
  for (const l of memory?.lessons ?? []) {
    if (l.genre !== genre) continue
    const cur = byParam.get(l.param) ?? { sum: 0, n: 0, reasons: new Set() }
    cur.sum += l.delta
    cur.n += 1
    cur.reasons.add(l.reason)
    byParam.set(l.param, cur)
  }
  return [...byParam.entries()]
    .map(([param, { sum, n, reasons }]) => ({ param, delta: Math.round(sum / n), n, reasons: [...reasons] }))
    .filter((a) => a.delta !== 0)
}

export function localPlan(idea: string, memory?: VaultMemory): { spec: GameSpec; notes: string[] } {
  const s = idea.toLowerCase()
  const genre = detectGenre(s)
  const theme = detectTheme(s)

  const playerName =
    pick(s, /\b(?:as|play(?:ing)?|control(?:ling)?|where|about)\s+(?:a|an|the)\s+(?:little\s+|tiny\s+|brave\s+|cute\s+|small\s+|young\s+)?([a-z]+)/) ??
    pick(s, /^(?:a|an|the)\s+(?:little\s+|tiny\s+|brave\s+|cute\s+|small\s+|young\s+)?([a-z]+)\s+(?:jumps?|runs?|collects?|dodges?|shoots?|flies|explores?|escapes?|hops?|climbs?|gathers?|avoids?|catches?|defends?)/) ??
    theme.player[0]
  const collectName = pick(s, /\b(?:collect(?:s|ing)?|gather(?:s|ing)?|catch(?:es|ing)?|find(?:s|ing)?|pick(?:s|ing)? up|grab(?:s|bing)?)\s+(?:the\s+|all\s+|some\s+)?([a-z]+)(?:\s+([a-z]+))?/) ?? theme.collectible[0]
  const enemyName = pick(s, /\b(?:avoid(?:s|ing)?|dodg(?:e|es|ing)|escap(?:e|es|ing)|shoot(?:s|ing)?|fight(?:s|ing)?|from|blast(?:s|ing)?|defeat(?:s|ing)?)\s+(?:down\s+|off\s+)?(?:the\s+|all\s+|some\s+)?([a-z]+)(?:\s+([a-z]+))?/) ?? theme.enemy[0]

  const tuning = { ...BASE_TUNING[genre] }
  const notes: string[] = []

  if (/cozy|relax|chill|easy|kid|child|calm|gentle|toddler/.test(s)) {
    tuning.enemySpeed -= 1; tuning.enemyCount -= 1; tuning.lives += 2
    notes.push('Read "cozy/easy" in the idea → gentler enemies and extra lives.')
  }
  if (/hard|intense|fast|challenging|brutal|difficult|chaos|frantic/.test(s)) {
    tuning.enemySpeed += 2; tuning.enemyCount += 3; tuning.lives -= 1
    notes.push('Read "hard/intense" in the idea → faster, more numerous enemies.')
  }
  if (/no timer|endless|untimed/.test(s)) tuning.timeLimit = 0

  for (const a of vaultAdjustments(memory, genre)) {
    tuning[a.param] += a.delta
    notes.push(
      `Vault memory: ${a.n} past ${genre} build${a.n > 1 ? 's' : ''} noted "${a.reasons.join('", "')}" → ${TUNING_RANGES[a.param].label} ${a.delta > 0 ? '+' : ''}${a.delta}.`,
    )
  }

  const gameplay = rulesFor(genre, playerName, enemyName, collectName, tuning)
  const title = makeTitle(playerName, collectName, genre)

  const spec: GameSpec = {
    title,
    pitch: `A ${theme.style.split(',')[0]} ${GENRE_INFO[genre].label.toLowerCase()} game: ${gameplay.goal.charAt(0).toLowerCase()}${gameplay.goal.slice(1)}`,
    genre,
    gameplay,
    look: { style: theme.style, background: theme.background, ground: theme.ground, text: theme.text },
    camera: genre === 'platformer' ? 'follow' : 'fixed',
    characters: [
      { name: playerName, role: 'player', description: `The ${playerName.toLowerCase()} you control — same look in every scene.`, color: theme.player[1], shape: theme.player[2] },
      { name: enemyName, role: 'enemy', description: `The ${enemyName.toLowerCase()} — the thing to avoid${genre === 'shooter' ? ' or defeat' : ''}.`, color: theme.enemy[1], shape: theme.enemy[2] },
      { name: collectName, role: 'collectible', description: `A ${collectName.toLowerCase()} worth 1 point.`, color: theme.collectible[1], shape: theme.collectible[2] },
    ],
    ui: {
      hud: tuning.timeLimit > 0 ? ['score', 'lives', 'timer'] : ['score', 'lives'],
      titleScreen: gameplay.goal,
      winMessage: `You did it! ${title} complete.`,
      loseMessage: `So close — press Enter to try again.`,
    },
    ux: [
      'Title screen shows the goal and controls before play starts.',
      'First 2 seconds are safe so players can find their bearings.',
      'Getting hit flashes the player and grants a 1.5 s shield.',
      'Win / lose screens restart instantly with Enter.',
    ],
    tuning,
  }
  return { spec: sanitizeSpec(spec), notes }
}

type Rule = { re: RegExp; reason: string; apply: Partial<Record<TuningKey, number>>; say: string }

const NOTE_RULES: Rule[] = [
  { re: /too hard|too difficult|unfair|impossible|died too|frustrat/, reason: 'too hard', apply: { enemySpeed: -2, enemyCount: -2, lives: 1 }, say: 'Made it easier: slower and fewer enemies, +1 life.' },
  { re: /too easy|boring|no challenge|dull|bland/, reason: 'too easy', apply: { enemySpeed: 2, enemyCount: 2, targetScore: 5 }, say: 'Added challenge: faster, more enemies, higher score target.' },
  { re: /(player|i|character|movement|moves?) (is |feel |felt )?(too )?(slow|sluggish)|move faster|too slow/, reason: 'player too slow', apply: { playerSpeed: 2 }, say: 'Player moves faster.' },
  { re: /(player|movement|controls?) (is |feel |felt )?(too )?(fast|slippery)|too twitchy|hard to control/, reason: 'player too fast', apply: { playerSpeed: -2 }, say: 'Player moves slower and is easier to control.' },
  { re: /too short|over too (fast|quick)|ended too|wanted more/, reason: 'too short', apply: { targetScore: 10, timeLimit: 30 }, say: 'Longer game: higher score target and more time.' },
  { re: /too long|drag(s|ged)?|took forever/, reason: 'too long', apply: { targetScore: -5, timeLimit: -15 }, say: 'Shorter game: lower score target and less time.' },
  { re: /floaty|jump (is |feels )?too (high|long)|moon/, reason: 'jump floaty', apply: { gravity: 2 }, say: 'Snappier jump: more gravity.' },
  { re: /can'?t jump|jump (is |feels )?too (low|short)|heavy/, reason: 'jump too low', apply: { gravity: -2 }, say: 'Higher jump: less gravity.' },
  { re: /too many enemies|crowded|swarm/, reason: 'too crowded', apply: { enemyCount: -3 }, say: 'Fewer enemies on screen.' },
  { re: /more enemies|empty|lonely/, reason: 'too empty', apply: { enemyCount: 3 }, say: 'More enemies on screen.' },
  { re: /timer|time (ran|runs) out|not enough time|more time/, reason: 'not enough time', apply: { timeLimit: 20 }, say: 'More time on the clock.' },
]

function lighten(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16)
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + amt)))
  return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map((c) => c.toString(16).padStart(2, '0')).join('')
}

export function localRedirect(spec: GameSpec, notes: string): { spec: GameSpec; changes: string[]; lessons: Lesson[] } {
  const s = notes.toLowerCase()
  const next: GameSpec = structuredClone(spec)
  const changes: string[] = []
  const lessons: Lesson[] = []

  for (const rule of NOTE_RULES) {
    if (!rule.re.test(s)) continue
    const applies = (k: TuningKey) =>
      !(k === 'timeLimit' && (spec.genre === 'platformer' || spec.genre === 'shooter')) && !(k === 'gravity' && spec.genre !== 'platformer')
    const edits = (Object.entries(rule.apply) as [TuningKey, number][]).filter(([k]) => applies(k))
    if (edits.length === 0) continue
    for (const [k, d] of edits) {
      next.tuning[k] += d
      lessons.push({ genre: spec.genre, param: k, delta: d, reason: rule.reason })
    }
    changes.push(rule.say)
  }
  if (/too dark|can'?t see|hard to see/.test(s)) {
    next.look.background = lighten(next.look.background, 30)
    changes.push('Brightened the background for visibility.')
  }
  if (/too bright|eye ?strain|glare/.test(s)) {
    next.look.background = lighten(next.look.background, -30)
    changes.push('Darkened the background.')
  }
  const genreSwitch = GENRE_WORDS.find(([g, re]) => g !== spec.genre && /make it|turn it|should be|instead|change to/.test(s) && re.test(s))
  if (genreSwitch) {
    next.genre = genreSwitch[0]
    next.camera = next.genre === 'platformer' ? 'follow' : 'fixed'
    const [p, e, c] = (['player', 'enemy', 'collectible'] as const).map((r) => next.characters.find((x) => x.role === r)!.name)
    next.gameplay = rulesFor(next.genre, p, e, c, next.tuning)
    changes.push(`Switched the game type to ${GENRE_INFO[next.genre].label}.`)
  }

  if (changes.length === 0) {
    changes.push(
      'I could not map these notes to a change. Try words like "too hard", "too easy", "player too slow", "too short", "floaty jump", "too many enemies", or "make it a shooter" — or edit the plan directly.',
    )
  } else {
    // Keep the written rules in sync with the numbers.
    const [p, e, c] = (['player', 'enemy', 'collectible'] as const).map((r) => next.characters.find((x) => x.role === r)!.name)
    const clean = sanitizeSpec(next)
    clean.gameplay = rulesFor(clean.genre, p, e, c, clean.tuning)
    clean.ui.hud = clean.tuning.timeLimit > 0 ? ['score', 'lives', 'timer'] : ['score', 'lives']
    return { spec: clean, changes, lessons }
  }
  return { spec: sanitizeSpec(next), changes, lessons }
}
