'use client'

import { drawShape } from '@/lib/game/engine'
import {
  GENRE_INFO,
  GENRES,
  SHAPES,
  TUNING_RANGES,
  type Character,
  type GameSpec,
  type TuningKey,
} from '@/lib/director/spec'
import { useEffect, useRef } from 'react'

const input =
  'w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none'
const label = 'mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-400'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h3 className="mb-3 text-sm font-semibold text-zinc-200">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function Lines({ value, onChange, rows = 3 }: { value: string[]; onChange: (v: string[]) => void; rows?: number }) {
  return (
    <textarea
      className={input}
      rows={rows}
      value={value.join('\n')}
      onChange={(e) => onChange(e.target.value.split('\n'))}
    />
  )
}

function Swatch({ c }: { c: Character }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (!ctx) return
    ctx.setTransform(2, 0, 0, 2, 0, 0)
    ctx.clearRect(0, 0, 40, 40)
    drawShape(ctx, c, 20, 20, 14)
  }, [c])
  return <canvas ref={ref} width={80} height={80} className="size-10 shrink-0" aria-hidden />
}

export function PlanEditor({ spec, onChange }: { spec: GameSpec; onChange: (s: GameSpec) => void }) {
  const set = <K extends keyof GameSpec>(k: K, v: GameSpec[K]) => onChange({ ...spec, [k]: v })
  const setChar = (i: number, patch: Partial<Character>) =>
    set(
      'characters',
      spec.characters.map((c, j) => (j === i ? { ...c, ...patch } : c)),
    )

  return (
    <div className="space-y-4">
      <Section title="Concept">
        <div>
          <label className={label}>Title</label>
          <input className={input} value={spec.title} onChange={(e) => set('title', e.target.value)} />
        </div>
        <div>
          <label className={label}>Pitch</label>
          <textarea className={input} rows={2} value={spec.pitch} onChange={(e) => set('pitch', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Game type</label>
            <select
              className={input}
              value={spec.genre}
              onChange={(e) => {
                const genre = e.target.value as GameSpec['genre']
                onChange({ ...spec, genre, camera: genre === 'platformer' ? 'follow' : 'fixed' })
              }}
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {GENRE_INFO[g].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Camera</label>
            <div className={`${input} text-zinc-400`}>{spec.camera === 'follow' ? 'Follows the player' : 'Fixed, whole arena'}</div>
          </div>
        </div>
        <p className="text-xs text-zinc-500">{GENRE_INFO[spec.genre].blurb}</p>
      </Section>

      <Section title="Gameplay">
        <div>
          <label className={label}>Goal</label>
          <input className={input} value={spec.gameplay.goal} onChange={(e) => set('gameplay', { ...spec.gameplay, goal: e.target.value })} />
        </div>
        <div>
          <label className={label}>Rules (one per line)</label>
          <Lines value={spec.gameplay.rules} onChange={(rules) => set('gameplay', { ...spec.gameplay, rules })} rows={4} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={label}>Winning</label>
            <input className={input} value={spec.gameplay.win} onChange={(e) => set('gameplay', { ...spec.gameplay, win: e.target.value })} />
          </div>
          <div>
            <label className={label}>Losing</label>
            <input className={input} value={spec.gameplay.lose} onChange={(e) => set('gameplay', { ...spec.gameplay, lose: e.target.value })} />
          </div>
        </div>
      </Section>

      <Section title="Characters">
        {spec.characters.map((c, i) => (
          <div key={c.role} className="rounded-lg border border-zinc-800 p-3">
            <div className="mb-2 flex items-center gap-3">
              <Swatch c={c} />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-violet-300">{c.role}</span>
                <input className={`${input} mt-1`} value={c.name} onChange={(e) => setChar(i, { name: e.target.value })} />
              </div>
            </div>
            <input className={input} value={c.description} onChange={(e) => setChar(i, { description: e.target.value })} />
            <div className="mt-2 flex items-center gap-3">
              <input
                type="color"
                aria-label={`${c.role} color`}
                className="h-9 w-12 cursor-pointer rounded border border-zinc-800 bg-zinc-900"
                value={c.color}
                onChange={(e) => setChar(i, { color: e.target.value })}
              />
              <select className={input} value={c.shape} onChange={(e) => setChar(i, { shape: e.target.value as Character['shape'] })}>
                {SHAPES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </Section>

      <Section title="Look">
        <div>
          <label className={label}>Art direction</label>
          <input className={input} value={spec.look.style} onChange={(e) => set('look', { ...spec.look, style: e.target.value })} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(['background', 'ground', 'text'] as const).map((k) => (
            <div key={k}>
              <label className={label}>{k}</label>
              <input
                type="color"
                className="h-9 w-full cursor-pointer rounded border border-zinc-800 bg-zinc-900"
                value={spec.look[k]}
                onChange={(e) => set('look', { ...spec.look, [k]: e.target.value })}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tuning & controls">
        {(Object.keys(TUNING_RANGES) as TuningKey[])
          .filter((k) => k !== 'gravity' || spec.genre === 'platformer')
          .map((k) => {
            const r = TUNING_RANGES[k]
            return (
              <div key={k}>
                <div className="mb-1 flex justify-between text-xs text-zinc-400">
                  <span>{r.label}</span>
                  <span className="font-mono text-zinc-200">{spec.tuning[k]}</span>
                </div>
                <input
                  type="range"
                  min={r.min}
                  max={r.max}
                  value={spec.tuning[k]}
                  onChange={(e) => set('tuning', { ...spec.tuning, [k]: Number(e.target.value) })}
                  className="w-full accent-violet-500"
                />
              </div>
            )
          })}
        <div>
          <label className={label}>Controls</label>
          <ul className="space-y-1 text-sm text-zinc-300">
            {GENRE_INFO[spec.genre].controls.map((c) => (
              <li key={c}>{c}</li>
            ))}
            <li className="text-zinc-500">Touch: hold left / right third to move, middle to jump or fire.</li>
          </ul>
        </div>
      </Section>

      <Section title="UI & UX">
        <div>
          <label className={label}>HUD shows</label>
          <div className="flex gap-4 text-sm text-zinc-300">
            {(['score', 'lives', 'timer'] as const).map((h) => (
              <label key={h} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-violet-500"
                  checked={spec.ui.hud.includes(h)}
                  onChange={(e) =>
                    set('ui', { ...spec.ui, hud: e.target.checked ? [...spec.ui.hud, h] : spec.ui.hud.filter((x) => x !== h) })
                  }
                />
                {h}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className={label}>Title screen text</label>
          <input className={input} value={spec.ui.titleScreen} onChange={(e) => set('ui', { ...spec.ui, titleScreen: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={label}>Win message</label>
            <input className={input} value={spec.ui.winMessage} onChange={(e) => set('ui', { ...spec.ui, winMessage: e.target.value })} />
          </div>
          <div>
            <label className={label}>Lose message</label>
            <input className={input} value={spec.ui.loseMessage} onChange={(e) => set('ui', { ...spec.ui, loseMessage: e.target.value })} />
          </div>
        </div>
        <div>
          <label className={label}>UX notes (one per line)</label>
          <Lines value={spec.ux} onChange={(ux) => set('ux', ux)} />
        </div>
      </Section>
    </div>
  )
}
