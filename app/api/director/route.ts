import { NextResponse } from 'next/server'
import { z } from 'zod'
import { plan, providerStatus, redirect } from '@/lib/director/connection'
import { GameSpecSchema } from '@/lib/director/spec'

const Memory = z
  .object({
    builds: z.number(),
    lessons: z.array(z.object({ genre: z.string(), param: z.string(), delta: z.number(), reason: z.string() })),
    recent: z.array(z.object({ idea: z.string(), genre: z.string(), title: z.string(), notes: z.array(z.string()) })),
  })
  .optional()

const Body = z.discriminatedUnion('action', [
  z.object({ action: z.literal('plan'), idea: z.string().min(3).max(500), memory: Memory }),
  z.object({ action: z.literal('redirect'), spec: GameSpecSchema, notes: z.string().min(2).max(2000), memory: Memory }),
])

export async function GET() {
  return NextResponse.json(providerStatus())
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', issues: parsed.error.issues.slice(0, 5) }, { status: 400 })
  }
  const body = parsed.data
  // Memory is shaped by the client; the director only reads it as context.
  const memory = body.memory as Parameters<typeof plan>[1]
  if (body.action === 'plan') return NextResponse.json(await plan(body.idea, memory))
  return NextResponse.json(await redirect(body.spec, body.notes, memory))
}
