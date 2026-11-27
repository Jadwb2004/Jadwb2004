import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import { z } from 'zod'
import { GameSpecSchema, GENRE_INFO, sanitizeSpec, TUNING_RANGES, type GameSpec, type TuningKey } from './spec'
import type { Lesson, VaultMemory } from './vault'

/** Rented model #1: Claude through the API. Swappable behind the one connection. */

export const CLAUDE_MODEL = process.env.DIRECTOR_MODEL || 'claude-opus-5-5'

const client = new Anthropic()

const SYSTEM = `You are the AI Game Director. A user describes a game in one sentence; you write the full director's plan that our game engine builds.

The engine supports exactly these genres:
${Object.entries(GENRE_INFO)
  .map(([g, i]) => `- ${g}: ${i.blurb} Controls: ${i.controls.join('; ')}`)
  .join('\n')}

Engine facts you must respect:
- There is exactly one player, one enemy type and one collectible type. Shapes: circle, square, triangle, star, diamond.
- Tuning ranges: ${(Object.keys(TUNING_RANGES) as TuningKey[]).map((k) => `${k} ${TUNING_RANGES[k].min}-${TUNING_RANGES[k].max}`).join(', ')}.
- collector: win at targetScore pickups; timeLimit optional. dodger: if timeLimit > 0 the win is surviving the timer, else reaching targetScore. platformer: win by reaching the flag; level length grows with targetScore. shooter: win by defeating targetScore enemies.
- camera "follow" is used for platformer; "fixed" for the rest.
- Colors are #rrggbb. Make text readable on the background and characters clearly distinct from it and from each other.

Direct like a game designer: pick the genre that best fits the idea, name characters from the idea, keep them consistent, write rules a 10-year-old understands, and tune for fun (an easy first 20 seconds, a clear finish). Use the vault memory: past builds and their test notes tell you what players found broken, boring or confusing — avoid repeating those mistakes.`

function memoryBlock(memory?: VaultMemory) {
  if (!memory || memory.builds === 0) return 'Vault memory: empty (this is the first build).'
  return `Vault memory (${memory.builds} past builds):\n${JSON.stringify({ recent: memory.recent, lessons: memory.lessons }, null, 1)}`
}

const PlanOut = z.object({
  spec: GameSpecSchema,
  directorNotes: z.array(z.string()).describe('2-4 short notes explaining key choices, including any vault lessons applied'),
})

const RedirectOut = z.object({
  spec: GameSpecSchema,
  changes: z.array(z.string()).describe('Plain-language list of what you changed and why'),
  lessons: z
    .array(
      z.object({
        param: z.enum(Object.keys(TUNING_RANGES) as [TuningKey, ...TuningKey[]]),
        delta: z.number(),
        reason: z.string().describe('2-4 word summary of the note, e.g. "too hard"'),
      }),
    )
    .describe('Tuning changes that should carry over to future builds of this genre'),
})

async function ask<T extends z.ZodType>(schema: T, user: string): Promise<z.infer<T>> {
  const response = await client.beta.messages.parse({
    model: CLAUDE_MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'medium', format: betaZodOutputFormat(schema) },
    system: SYSTEM,
    messages: [{ role: 'user', content: user }],
  })
  if (response.stop_reason === 'refusal') throw new Error('The model declined this request.')
  if (response.stop_reason === 'max_tokens') throw new Error('The model ran out of room writing the plan.')
  if (!response.parsed_output) throw new Error('The model returned a plan the engine could not read.')
  return response.parsed_output as z.infer<T>
}

export async function claudePlan(idea: string, memory?: VaultMemory): Promise<{ spec: GameSpec; notes: string[] }> {
  const out = await ask(PlanOut, `${memoryBlock(memory)}\n\nThe user's game idea:\n"""${idea}"""`)
  return { spec: sanitizeSpec(out.spec), notes: out.directorNotes }
}

export async function claudeRedirect(
  spec: GameSpec,
  notes: string,
  memory?: VaultMemory,
): Promise<{ spec: GameSpec; changes: string[]; lessons: Lesson[] }> {
  const out = await ask(
    RedirectOut,
    `${memoryBlock(memory)}\n\nCurrent plan:\n${JSON.stringify(spec)}\n\nA human just play-tested it. Their test notes:\n"""${notes}"""\n\nRe-direct the plan: fix what is broken, boring or confusing. Change only what the notes call for, and keep characters consistent unless asked.`,
  )
  return {
    spec: sanitizeSpec(out.spec),
    changes: out.changes,
    lessons: out.lessons.map((l) => ({ ...l, genre: out.spec.genre })),
  }
}
