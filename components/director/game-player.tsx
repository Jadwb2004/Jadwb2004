'use client'

import { useEffect, useRef } from 'react'
import { GameRuntime, H, W, type EndEvent } from '@/lib/game/engine'
import type { GameSpec } from '@/lib/director/spec'

export function GamePlayer({ spec, onEnd }: { spec: GameSpec; onEnd?: (e: EndEvent) => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const onEndRef = useRef(onEnd)
  onEndRef.current = onEnd

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = W * dpr
    canvas.height = H * dpr
    const game = new GameRuntime(canvas, spec, (e) => onEndRef.current?.(e))
    canvas.focus({ preventScroll: true })
    return () => game.destroy()
  }, [spec])

  return (
    <canvas
      ref={ref}
      tabIndex={0}
      aria-label={`Playable game: ${spec.title}. Click to focus, then use the keyboard.`}
      className="block aspect-[5/3] w-full touch-none rounded-xl outline-none ring-offset-2 ring-offset-zinc-950 focus-visible:ring-2 focus-visible:ring-violet-400"
    />
  )
}
