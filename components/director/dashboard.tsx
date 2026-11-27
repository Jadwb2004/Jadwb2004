'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowUp,
  Clapperboard,
  Download,
  Gamepad2,
  Library,
  Loader2,
  NotebookPen,
  Plus,
  Trash2,
  Upload,
  Wand2,
  X,
} from 'lucide-react'
import { GamePlayer } from './game-player'
import { PlanEditor } from './plan-editor'
import { GENRE_INFO, sanitizeSpec, type GameSpec } from '@/lib/director/spec'
import {
  buildMemory,
  latest,
  loadVault,
  saveVault,
  uid,
  type ThreadMessage,
  type VaultEntry,
} from '@/lib/director/vault'
import { cn } from '@/lib/utils'

const EXAMPLES = [
  'A cozy game where a bee collects flowers and avoids wasps',
  'Dodge falling meteors as a tiny astronaut in space',
  'A fox jumps across forest platforms collecting acorns',
  'Shoot down alien invaders to defend a candy planet',
]

type PlanResponse = { spec: GameSpec; notes: string[]; provider: string; warning?: string; error?: string }
type RedirectResponse = PlanResponse & { changes: string[]; lessons: VaultEntry['lessons'] }

async function callDirector<T>(body: unknown): Promise<T> {
  const res = await fetch('/api/director', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? `Director error ${res.status}`)
  return json as T
}

const msg = (m: Omit<ThreadMessage, 'id' | 'at'>): ThreadMessage => ({ ...m, id: uid(), at: Date.now() })

function diffSpecs(a: GameSpec, b: GameSpec, path = ''): string[] {
  const out: string[] = []
  for (const k of Object.keys(b) as (keyof GameSpec)[]) {
    const av = a[k] as unknown
    const bv = b[k] as unknown
    if (JSON.stringify(av) === JSON.stringify(bv)) continue
    if (av && bv && typeof bv === 'object' && !Array.isArray(bv)) {
      out.push(...diffSpecs(av as GameSpec, bv as GameSpec, `${path}${String(k)}.`))
    } else if (typeof bv === 'string' || typeof bv === 'number') {
      out.push(`${path}${String(k)}: ${String(av)} → ${String(bv)}`)
    } else {
      out.push(`${path}${String(k)} edited`)
    }
  }
  return out
}

export function DirectorDashboard() {
  const [entries, setEntries] = useState<VaultEntry[]>([])
  const [loaded, setLoaded] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState<GameSpec | null>(null)
  const [tab, setTab] = useState<'plan' | 'play'>('plan')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [provider, setProvider] = useState<string>('…')
  const [vaultOpen, setVaultOpen] = useState(false)
  const threadEnd = useRef<HTMLDivElement>(null)
  const importRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEntries(loadVault())
    setLoaded(true)
    fetch('/api/director')
      .then((r) => r.json())
      .then((j) => setProvider(j.provider))
      .catch(() => setProvider('local'))
  }, [])

  useEffect(() => {
    if (loaded) saveVault(entries)
  }, [entries, loaded])

  const active = entries.find((e) => e.id === activeId) ?? null
  const current = active ? latest(active) : null

  useEffect(() => {
    setDraft(current ? structuredClone(current.spec) : null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, current?.v])

  useEffect(() => {
    threadEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [active?.thread.length, busy])

  const dirty = useMemo(
    () => !!(draft && current && JSON.stringify(draft) !== JSON.stringify(current.spec)),
    [draft, current],
  )

  const update = (id: string, fn: (e: VaultEntry) => VaultEntry) =>
    setEntries((all) => all.map((e) => (e.id === id ? { ...fn(e), updatedAt: Date.now() } : e)))

  async function submitIdea(idea: string) {
    setBusy('Directing your game — writing the plan…')
    try {
      const r = await callDirector<PlanResponse>({ action: 'plan', idea, memory: buildMemory(entries) })
      const now = Date.now()
      const entry: VaultEntry = {
        id: uid(),
        idea,
        createdAt: now,
        updatedAt: now,
        provider: r.provider,
        versions: [{ v: 1, spec: r.spec, createdAt: now, source: 'plan', changes: [] }],
        thread: [
          msg({ role: 'user', kind: 'idea', text: idea }),
          msg({
            role: 'director',
            kind: 'plan',
            version: 1,
            text: [
              `Plan v1: **${r.spec.title}** — a ${GENRE_INFO[r.spec.genre].label.toLowerCase()} game. ${r.spec.pitch}`,
              ...r.notes,
              r.warning ? `⚠ ${r.warning}` : '',
              'Review the plan on the right, edit anything, then hit Play. After playing, tell me what was broken, boring, or confusing.',
            ]
              .filter(Boolean)
              .join('\n'),
          }),
        ],
        lessons: [],
        plays: 0,
      }
      setEntries((all) => [entry, ...all])
      setActiveId(entry.id)
      setTab('plan')
      setText('')
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(null)
    }
  }

  async function submitNotes(notes: string) {
    if (!active || !current) return
    const id = active.id
    update(id, (e) => ({ ...e, thread: [...e.thread, msg({ role: 'user', kind: 'notes', text: notes, version: current.v })] }))
    setText('')
    setBusy('Re-directing from your test notes…')
    try {
      const r = await callDirector<RedirectResponse>({ action: 'redirect', spec: current.spec, notes, memory: buildMemory(entries) })
      const v = current.v + 1
      update(id, (e) => ({
        ...e,
        provider: r.provider,
        versions: [...e.versions, { v, spec: r.spec, createdAt: Date.now(), source: 'redirect', changes: r.changes }],
        lessons: [...e.lessons, ...r.lessons],
        thread: [
          ...e.thread,
          msg({
            role: 'director',
            kind: 'changes',
            version: v,
            text: [`Plan v${v}:`, ...r.changes.map((c) => `• ${c}`), r.warning ? `⚠ ${r.warning}` : ''].filter(Boolean).join('\n'),
          }),
        ],
      }))
      setTab('play')
    } catch (e) {
      update(id, (en) => ({
        ...en,
        thread: [...en.thread, msg({ role: 'director', kind: 'error', text: e instanceof Error ? e.message : String(e) })],
      }))
    } finally {
      setBusy(null)
    }
  }

  function saveEdits() {
    if (!active || !current || !draft) return
    const spec = sanitizeSpec(draft)
    const changes = diffSpecs(current.spec, spec)
    const v = current.v + 1
    update(active.id, (e) => ({
      ...e,
      versions: [...e.versions, { v, spec, createdAt: Date.now(), source: 'edit', changes }],
      thread: [
        ...e.thread,
        msg({ role: 'user', kind: 'edit', version: v, text: `Edited the plan by hand (v${v}):\n${changes.slice(0, 8).map((c) => `• ${c}`).join('\n')}${changes.length > 8 ? `\n• …and ${changes.length - 8} more` : ''}` }),
      ],
    }))
    setTab('play')
  }

  function onSend() {
    const t = text.trim()
    if (!t || busy) return
    if (active) submitNotes(t)
    else submitIdea(t)
  }

  function exportVault() {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `director-vault-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function importVault(file: File) {
    try {
      const data = JSON.parse(await file.text()) as VaultEntry[]
      if (!Array.isArray(data)) throw new Error('Not a vault file')
      const known = new Set(entries.map((e) => e.id))
      const fresh = data.filter((e) => e && e.id && Array.isArray(e.versions) && !known.has(e.id))
      fresh.forEach((e) => e.versions.forEach((v) => (v.spec = sanitizeSpec(v.spec))))
      setEntries((all) => [...fresh, ...all])
      alert(`Imported ${fresh.length} vault entr${fresh.length === 1 ? 'y' : 'ies'}.`)
    } catch (e) {
      alert(`Could not import: ${e instanceof Error ? e.message : e}`)
    }
  }

  function remove(id: string) {
    if (!confirm('Delete this game from the vault? This cannot be undone.')) return
    setEntries((all) => all.filter((e) => e.id !== id))
    if (activeId === id) setActiveId(null)
  }

  const lessonsCount = entries.reduce((n, e) => n + e.lessons.length, 0)

  const vaultPanel = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
          <Library className="size-4 text-violet-400" /> Vault
        </div>
        <button className="rounded p-1 text-zinc-400 hover:text-zinc-100 lg:hidden" onClick={() => setVaultOpen(false)} aria-label="Close vault">
          <X className="size-4" />
        </button>
      </div>
      <p className="px-4 pb-3 text-xs text-zinc-500">
        {entries.length} build{entries.length === 1 ? '' : 's'} · {lessonsCount} lesson{lessonsCount === 1 ? '' : 's'} learned. The director reads this before every new plan.
      </p>
      <div className="px-3">
        <button
          onClick={() => {
            setActiveId(null)
            setVaultOpen(false)
          }}
          className="flex w-full items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
        >
          <Plus className="size-4" /> New game
        </button>
      </div>
      <ul className="mt-3 flex-1 space-y-1 overflow-y-auto px-3">
        {entries.map((e) => {
          const s = latest(e).spec
          return (
            <li key={e.id} className="group relative">
              <button
                onClick={() => {
                  setActiveId(e.id)
                  setVaultOpen(false)
                }}
                className={cn(
                  'w-full rounded-lg px-3 py-2 text-left hover:bg-zinc-800/70',
                  e.id === activeId && 'bg-zinc-800',
                )}
              >
                <div className="truncate pr-6 text-sm text-zinc-100">{s.title}</div>
                <div className="truncate text-xs text-zinc-500">
                  {GENRE_INFO[s.genre].label} · v{latest(e).v} · {e.plays} play{e.plays === 1 ? '' : 's'}
                </div>
              </button>
              <button
                onClick={() => remove(e.id)}
                className="absolute right-2 top-2.5 rounded p-1 text-zinc-600 opacity-0 hover:text-red-400 group-hover:opacity-100 focus:opacity-100"
                aria-label={`Delete ${s.title}`}
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          )
        })}
      </ul>
      <div className="flex gap-2 border-t border-zinc-800 p-3">
        <button onClick={exportVault} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100">
          <Download className="size-3.5" /> Export
        </button>
        <button onClick={() => importRef.current?.click()} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100">
          <Upload className="size-3.5" /> Import
        </button>
        <input
          ref={importRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) importVault(f)
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )

  return (
    <div className="flex h-dvh overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Vault sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-zinc-800 bg-zinc-950 lg:block">{vaultPanel}</aside>
      {vaultOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setVaultOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-zinc-800 bg-zinc-950">{vaultPanel}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
          <button className="rounded p-1 text-zinc-400 hover:text-zinc-100 lg:hidden" onClick={() => setVaultOpen(true)} aria-label="Open vault">
            <Library className="size-5" />
          </button>
          <Clapperboard className="size-5 text-violet-400" />
          <h1 className="text-sm font-semibold tracking-tight">AI Game Director</h1>
          <span className="ml-auto rounded-full border border-zinc-800 px-2.5 py-0.5 text-[11px] text-zinc-400" title="Which model the one connection is using">
            Director: {provider}
          </span>
        </header>

        {!active ? (
          <main className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-10">
            <div className="w-full max-w-2xl text-center">
              <Clapperboard className="mx-auto mb-4 size-10 text-violet-400" />
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">What game should we make?</h2>
              <p className="mx-auto mt-3 max-w-lg text-zinc-400">
                Describe it in one sentence. The director writes the full plan — gameplay, UI, controls, look, characters — then builds a game you can play, edit, and improve.
              </p>
              <Composer text={text} setText={setText} onSend={onSend} busy={busy} placeholder="e.g. A cozy game where a bee collects flowers and avoids wasps" autoFocus />
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    disabled={!!busy}
                    onClick={() => submitIdea(ex)}
                    className="rounded-full border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-violet-500 hover:text-white disabled:opacity-50"
                  >
                    {ex}
                  </button>
                ))}
              </div>
              {busy && (
                <p className="mt-6 flex items-center justify-center gap-2 text-sm text-violet-300">
                  <Loader2 className="size-4 animate-spin" /> {busy}
                </p>
              )}
            </div>
          </main>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            {/* Chat thread */}
            <section className="flex min-h-0 flex-col border-zinc-800 max-lg:max-h-[45dvh] lg:w-[400px] lg:shrink-0 lg:border-r">
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {active.thread.map((m) => (
                  <Bubble key={m.id} m={m} />
                ))}
                {busy && (
                  <div className="flex items-center gap-2 text-sm text-violet-300">
                    <Loader2 className="size-4 animate-spin" /> {busy}
                  </div>
                )}
                <div ref={threadEnd} />
              </div>
              <div className="border-t border-zinc-800 p-3">
                <Composer
                  text={text}
                  setText={setText}
                  onSend={onSend}
                  busy={busy}
                  compact
                  placeholder="Test notes: what was broken, boring, or confusing?"
                />
                <p className="mt-1.5 px-1 text-[11px] text-zinc-500">Sends test notes for this game. Use “New game” in the vault for a new idea.</p>
              </div>
            </section>

            {/* Studio */}
            <section className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-1 border-b border-zinc-800 px-3 py-2">
                {(
                  [
                    ['plan', 'Plan', NotebookPen],
                    ['play', 'Play', Gamepad2],
                  ] as const
                ).map(([k, l, Icon]) => (
                  <button
                    key={k}
                    onClick={() => setTab(k)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm',
                      tab === k ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-100',
                    )}
                  >
                    <Icon className="size-4" /> {l}
                  </button>
                ))}
                <span className="ml-2 truncate text-xs text-zinc-500">
                  {current!.spec.title} · v{current!.v}
                </span>
                {tab === 'plan' && (
                  <div className="ml-auto flex gap-2">
                    {dirty && (
                      <button onClick={() => setDraft(structuredClone(current!.spec))} className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-100">
                        Discard
                      </button>
                    )}
                    <button
                      onClick={() => (dirty ? saveEdits() : setTab('play'))}
                      className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500"
                    >
                      <Wand2 className="size-3.5" /> {dirty ? 'Save edits & rebuild' : 'Build & play'}
                    </button>
                  </div>
                )}
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                {tab === 'plan' && draft && (
                  <div className="mx-auto max-w-3xl">
                    <PlanEditor spec={draft} onChange={setDraft} />
                  </div>
                )}
                {tab === 'play' && (
                  <div className="mx-auto max-w-4xl">
                    <GamePlayer
                      key={`${active.id}-${current!.v}`}
                      spec={current!.spec}
                      onEnd={() => update(active.id, (e) => ({ ...e, plays: e.plays + 1 }))}
                    />
                    <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                      <div className="rounded-xl border border-zinc-800 p-4">
                        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">Goal</div>
                        <p className="text-zinc-200">{current!.spec.gameplay.goal}</p>
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-zinc-400">
                          {current!.spec.gameplay.rules.filter(Boolean).map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-xl border border-zinc-800 p-4">
                        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">Test it</div>
                        <p className="text-zinc-400">
                          Click the game, play a round, then write what was broken, boring, or confusing in the chat. The director re-directs those parts and saves the lesson to the vault.
                        </p>
                        <p className="mt-2 text-xs text-zinc-500">
                          Played {active.plays} time{active.plays === 1 ? '' : 's'} · {active.versions.length} version{active.versions.length === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

function Composer({
  text,
  setText,
  onSend,
  busy,
  placeholder,
  compact,
  autoFocus,
}: {
  text: string
  setText: (s: string) => void
  onSend: () => void
  busy: string | null
  placeholder: string
  compact?: boolean
  autoFocus?: boolean
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSend()
      }}
      className={cn('relative', !compact && 'mt-8')}
    >
      <textarea
        value={text}
        autoFocus={autoFocus}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSend()
          }
        }}
        rows={compact ? 2 : 3}
        maxLength={compact ? 2000 : 500}
        placeholder={placeholder}
        className="w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-900 py-3 pl-4 pr-14 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none sm:text-base"
      />
      <button
        type="submit"
        disabled={!text.trim() || !!busy}
        aria-label="Send"
        className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-500"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
      </button>
    </form>
  )
}

function Bubble({ m }: { m: ThreadMessage }) {
  const mine = m.role === 'user'
  const html = m.text.split('\n').map((line, i) => (
    <p key={i} className={cn(i > 0 && 'mt-1.5')}>
      {line.split(/\*\*(.+?)\*\*/g).map((part, j) => (j % 2 ? <strong key={j}>{part}</strong> : part))}
    </p>
  ))
  return (
    <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
          mine ? 'bg-violet-600/90 text-white' : 'border border-zinc-800 bg-zinc-900 text-zinc-200',
          m.kind === 'error' && 'border-red-900 bg-red-950/50 text-red-200',
        )}
      >
        {!mine && (
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-violet-300">
            <Clapperboard className="size-3" /> Director
          </div>
        )}
        {m.kind === 'notes' && <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-violet-200">Test notes · v{m.version}</div>}
        {html}
      </div>
    </div>
  )
}
