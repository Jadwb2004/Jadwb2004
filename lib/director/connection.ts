import 'server-only'
import { localPlan, localRedirect } from './local-director'
import type { GameSpec } from './spec'
import type { Lesson, VaultMemory } from './vault'

/**
 * THE ONE CONNECTION between the director and the models.
 *
 * Everything the dashboard needs goes through `plan` and `redirect` here.
 * To swap a rented model for the company's own model later, add a provider
 * below and point DIRECTOR_PROVIDER at it — nothing customers see changes.
 */

export type Provider = 'claude' | 'local'

export type PlanResult = { spec: GameSpec; notes: string[]; provider: string; warning?: string }
export type RedirectResult = { spec: GameSpec; changes: string[]; lessons: Lesson[]; provider: string; warning?: string }

function chooseProvider(): Provider {
  const wanted = process.env.DIRECTOR_PROVIDER
  if (wanted === 'local') return 'local'
  if (wanted === 'claude') return 'claude'
  return process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN ? 'claude' : 'local'
}

const errText = (e: unknown) => (e instanceof Error ? e.message : String(e))

export function providerStatus() {
  return { provider: chooseProvider() }
}

export async function plan(idea: string, memory?: VaultMemory): Promise<PlanResult> {
  if (chooseProvider() === 'claude') {
    try {
      const { claudePlan, CLAUDE_MODEL } = await import('./claude-director')
      return { ...(await claudePlan(idea, memory)), provider: `claude (${CLAUDE_MODEL})` }
    } catch (e) {
      return { ...localPlan(idea, memory), provider: 'local', warning: `Claude was unavailable (${errText(e)}); used the built-in director.` }
    }
  }
  return { ...localPlan(idea, memory), provider: 'local' }
}

export async function redirect(spec: GameSpec, notes: string, memory?: VaultMemory): Promise<RedirectResult> {
  if (chooseProvider() === 'claude') {
    try {
      const { claudeRedirect, CLAUDE_MODEL } = await import('./claude-director')
      return { ...(await claudeRedirect(spec, notes, memory)), provider: `claude (${CLAUDE_MODEL})` }
    } catch (e) {
      return { ...localRedirect(spec, notes), provider: 'local', warning: `Claude was unavailable (${errText(e)}); used the built-in director.` }
    }
  }
  return { ...localRedirect(spec, notes), provider: 'local' }
}
