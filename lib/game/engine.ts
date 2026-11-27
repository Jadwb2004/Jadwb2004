import { character, GENRE_INFO, type Character, type GameSpec } from '@/lib/director/spec'

/**
 * The game engine. It reads a GameSpec and nothing else — no model-written
 * code ever runs — so a plan always builds, and every hand edit takes effect.
 */

export const W = 800
export const H = 480

type Vec = { x: number; y: number }
type Body = Vec & { vx: number; vy: number; r: number; alive?: boolean; minX?: number; maxX?: number }
type Plat = { x: number; y: number; w: number }
type State = 'title' | 'play' | 'won' | 'lost'

export type EndEvent = { won: boolean; score: number; seconds: number }

function seeded(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619)
  return () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function drawShape(ctx: CanvasRenderingContext2D, c: Pick<Character, 'shape' | 'color'>, x: number, y: number, r: number) {
  ctx.fillStyle = c.color
  ctx.beginPath()
  switch (c.shape) {
    case 'circle':
      ctx.arc(x, y, r, 0, Math.PI * 2)
      break
    case 'square':
      ctx.roundRect(x - r, y - r, r * 2, r * 2, r * 0.3)
      break
    case 'triangle':
      ctx.moveTo(x, y - r)
      ctx.lineTo(x + r, y + r * 0.85)
      ctx.lineTo(x - r, y + r * 0.85)
      ctx.closePath()
      break
    case 'diamond':
      ctx.moveTo(x, y - r)
      ctx.lineTo(x + r, y)
      ctx.lineTo(x, y + r)
      ctx.lineTo(x - r, y)
      ctx.closePath()
      break
    case 'star':
      for (let i = 0; i < 10; i++) {
        const a = (Math.PI / 5) * i - Math.PI / 2
        const rr = i % 2 === 0 ? r : r * 0.45
        ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr)
      }
      ctx.closePath()
      break
  }
  ctx.fill()
  // tiny face/eye so characters read as characters
  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  ctx.beginPath()
  ctx.arc(x - r * 0.28, y - r * 0.1, Math.max(1.5, r * 0.12), 0, Math.PI * 2)
  ctx.arc(x + r * 0.28, y - r * 0.1, Math.max(1.5, r * 0.12), 0, Math.PI * 2)
  ctx.fill()
}

export class GameRuntime {
  private ctx: CanvasRenderingContext2D
  private spec: GameSpec
  private raf = 0
  private last = 0
  private keys = new Set<string>()
  private touch = { left: false, right: false, action: false }
  private state: State = 'title'
  private rng = Math.random
  private onEnd?: (e: EndEvent) => void

  // shared play state
  private t = 0
  private score = 0
  private lives = 0
  private shield = 0
  private player: Body = { x: 0, y: 0, vx: 0, vy: 0, r: 16 }
  private enemies: Body[] = []
  private items: Body[] = []
  private bullets: Body[] = []
  private spawnAcc = 0
  private cooldown = 0
  private wave = 0
  private formationDir = 1
  // platformer
  private plats: Plat[] = []
  private levelLen = 0
  private camX = 0
  private grounded = false
  private checkpoint: Vec = { x: 60, y: 0 }
  private jumpHeld = false

  constructor(private canvas: HTMLCanvasElement, spec: GameSpec, onEnd?: (e: EndEvent) => void) {
    this.ctx = canvas.getContext('2d')!
    this.spec = spec
    this.onEnd = onEnd
    canvas.addEventListener('keydown', this.onKeyDown)
    canvas.addEventListener('keyup', this.onKeyUp)
    canvas.addEventListener('pointerdown', this.onPointer)
    canvas.addEventListener('pointermove', this.onPointer)
    canvas.addEventListener('pointerup', this.onPointerUp)
    canvas.addEventListener('pointercancel', this.onPointerUp)
    canvas.addEventListener('blur', this.onBlur)
    this.raf = requestAnimationFrame(this.frame)
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    const c = this.canvas
    c.removeEventListener('keydown', this.onKeyDown)
    c.removeEventListener('keyup', this.onKeyUp)
    c.removeEventListener('pointerdown', this.onPointer)
    c.removeEventListener('pointermove', this.onPointer)
    c.removeEventListener('pointerup', this.onPointerUp)
    c.removeEventListener('pointercancel', this.onPointerUp)
    c.removeEventListener('blur', this.onBlur)
  }

  // ---------- input ----------
  private onKeyDown = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase()
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault()
    if (k === 'enter' && this.state !== 'play') this.start()
    this.keys.add(k)
  }
  private onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.key.toLowerCase())
  private onBlur = () => this.keys.clear()
  private onPointer = (e: PointerEvent) => {
    if (e.type === 'pointerdown') {
      this.canvas.focus()
      if (this.state !== 'play') return this.start()
    }
    if (e.buttons === 0 && e.pointerType === 'mouse') return
    const rect = this.canvas.getBoundingClientRect()
    const fx = (e.clientX - rect.left) / rect.width
    this.touch = { left: fx < 0.33, right: fx > 0.67, action: fx >= 0.33 && fx <= 0.67 }
  }
  private onPointerUp = () => (this.touch = { left: false, right: false, action: false })

  private get left() { return this.keys.has('arrowleft') || this.keys.has('a') || this.touch.left }
  private get right() { return this.keys.has('arrowright') || this.keys.has('d') || this.touch.right }
  private get up() { return this.keys.has('arrowup') || this.keys.has('w') }
  private get down() { return this.keys.has('arrowdown') || this.keys.has('s') }
  private get action() { return this.keys.has(' ') || this.touch.action }

  // ---------- tuning in pixels ----------
  private get pSpeed() { return 120 + this.spec.tuning.playerSpeed * 30 }
  private get eSpeed() { return 40 + this.spec.tuning.enemySpeed * 22 }
  private get gravityPx() { return 900 + this.spec.tuning.gravity * 150 }
  private readonly jumpV = 650

  // ---------- lifecycle ----------
  private start() {
    const s = this.spec
    this.rng = seeded(s.title + s.genre)
    this.state = 'play'
    this.t = 0
    this.score = 0
    this.lives = s.tuning.lives
    this.shield = 2 // safe start
    this.enemies = []
    this.items = []
    this.bullets = []
    this.spawnAcc = 0
    this.cooldown = 0
    this.wave = 0
    this.camX = 0
    this.player = { x: W / 2, y: H / 2, vx: 0, vy: 0, r: 16 }

    if (s.genre === 'collector') {
      for (let i = 0; i < Math.min(12, s.tuning.enemyCount); i++) this.enemies.push(this.spawnAway(18))
      for (let i = 0; i < 3; i++) this.items.push(this.spawnAway(12))
    } else if (s.genre === 'dodger') {
      this.player.y = H - 40
    } else if (s.genre === 'shooter') {
      this.player.y = H - 40
      this.nextWave()
    } else {
      this.buildLevel()
    }
  }

  private end(won: boolean) {
    this.state = won ? 'won' : 'lost'
    this.keys.clear()
    this.onEnd?.({ won, score: this.score, seconds: Math.round(this.t) })
  }

  private hit() {
    if (this.shield > 0) return false
    this.lives -= 1
    this.shield = 1.5
    if (this.lives <= 0) this.end(false)
    return true
  }

  private spawnAway(r: number): Body {
    for (let i = 0; i < 30; i++) {
      const b = { x: 30 + this.rng() * (W - 60), y: 50 + this.rng() * (H - 80), vx: 0, vy: 0, r, alive: true }
      if (Math.hypot(b.x - this.player.x, b.y - this.player.y) > 160) return b
    }
    return { x: 40, y: 60, vx: 0, vy: 0, r, alive: true }
  }

  // ---------- frame ----------
  private frame = (now: number) => {
    const dt = Math.min(0.033, (now - (this.last || now)) / 1000)
    this.last = now
    if (this.state === 'play') this.update(dt)
    this.draw()
    this.raf = requestAnimationFrame(this.frame)
  }

  private update(dt: number) {
    this.t += dt
    this.shield = Math.max(0, this.shield - dt)
    const s = this.spec
    if (s.genre === 'collector') this.updateCollector(dt)
    else if (s.genre === 'dodger') this.updateDodger(dt)
    else if (s.genre === 'shooter') this.updateShooter(dt)
    else this.updatePlatformer(dt)
    if (this.state !== 'play') return

    const timed = s.tuning.timeLimit > 0 && s.genre !== 'platformer' && s.genre !== 'shooter'
    if (timed && this.t >= s.tuning.timeLimit) {
      this.end(s.genre === 'dodger') // dodger: surviving the timer is the win
    } else if (s.genre !== 'platformer' && !(s.genre === 'dodger' && s.tuning.timeLimit > 0) && this.score >= s.tuning.targetScore) {
      this.end(true)
    }
  }

  private touching(a: Body, b: Body) {
    return Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r - 4
  }

  private updateCollector(dt: number) {
    const p = this.player
    const dx = (this.right ? 1 : 0) - (this.left ? 1 : 0)
    const dy = (this.down ? 1 : 0) - (this.up ? 1 : 0) || (this.touch.action ? -1 : 0)
    const len = Math.hypot(dx, dy) || 1
    p.x = Math.max(p.r, Math.min(W - p.r, p.x + (dx / len) * this.pSpeed * dt))
    p.y = Math.max(p.r + 30, Math.min(H - p.r, p.y + (dy / len) * this.pSpeed * dt))

    for (const e of this.enemies) {
      if (this.rng() < dt * 0.8 || (e.vx === 0 && e.vy === 0)) {
        const a = this.rng() * Math.PI * 2
        e.vx = Math.cos(a)
        e.vy = Math.sin(a)
      }
      const tx = p.x - e.x
      const ty = p.y - e.y
      const tl = Math.hypot(tx, ty) || 1
      const vx = e.vx * 0.65 + (tx / tl) * 0.35
      const vy = e.vy * 0.65 + (ty / tl) * 0.35
      const vl = Math.hypot(vx, vy) || 1
      e.x += (vx / vl) * this.eSpeed * dt
      e.y += (vy / vl) * this.eSpeed * dt
      if (e.x < e.r || e.x > W - e.r) e.vx *= -1
      if (e.y < 30 + e.r || e.y > H - e.r) e.vy *= -1
      e.x = Math.max(e.r, Math.min(W - e.r, e.x))
      e.y = Math.max(30 + e.r, Math.min(H - e.r, e.y))
      if (this.touching(p, e)) this.hit()
    }
    for (const it of this.items) {
      if (this.touching(p, it)) {
        this.score += 1
        Object.assign(it, this.spawnAway(12))
      }
    }
  }

  private updateDodger(dt: number) {
    const p = this.player
    const dx = (this.right ? 1 : 0) - (this.left ? 1 : 0)
    p.x = Math.max(p.r, Math.min(W - p.r, p.x + dx * this.pSpeed * dt))
    const ramp = 1 + this.t / 40
    const rate = (0.4 + this.spec.tuning.enemyCount * 0.12) * ramp
    this.spawnAcc += dt * rate
    while (this.spawnAcc >= 1 && this.t > 1) {
      this.spawnAcc -= 1
      const good = this.rng() < 0.28
      const b: Body = { x: 20 + this.rng() * (W - 40), y: -20, vx: 0, vy: this.eSpeed * (0.8 + this.rng() * 0.5) * ramp, r: good ? 12 : 16, alive: true }
      ;(good ? this.items : this.enemies).push(b)
    }
    for (const list of [this.enemies, this.items]) {
      for (const b of list) b.y += b.vy * dt
    }
    for (const e of this.enemies) if (e.alive && this.touching(p, e) && this.hit()) e.alive = false
    for (const it of this.items) {
      if (it.alive && this.touching(p, it)) {
        it.alive = false
        this.score += 1
      }
    }
    this.enemies = this.enemies.filter((b) => b.alive && b.y < H + 30)
    this.items = this.items.filter((b) => b.alive && b.y < H + 30)
  }

  private nextWave() {
    const n = this.spec.tuning.enemyCount
    const cols = Math.min(10, Math.max(3, Math.ceil(Math.sqrt(n * 2))))
    const rows = Math.ceil(n / cols)
    let k = 0
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols && k < n; c++, k++) {
        this.enemies.push({ x: 80 + c * ((W - 160) / Math.max(1, cols - 1)), y: 60 + r * 44, vx: 0, vy: 0, r: 15, alive: true })
      }
    }
    this.wave += 1
  }

  private updateShooter(dt: number) {
    const p = this.player
    const dx = (this.right ? 1 : 0) - (this.left ? 1 : 0)
    p.x = Math.max(p.r, Math.min(W - p.r, p.x + dx * this.pSpeed * dt))
    this.cooldown -= dt
    if (this.action && this.cooldown <= 0) {
      this.bullets.push({ x: p.x, y: p.y - p.r, vx: 0, vy: -620, r: 4, alive: true })
      this.cooldown = 0.25
    }
    for (const b of this.bullets) b.y += b.vy * dt

    const speed = this.eSpeed * 0.8 * (1 + (this.wave - 1) * 0.1)
    let bounce = false
    for (const e of this.enemies) {
      e.x += this.formationDir * speed * dt
      if (e.x < e.r + 10 || e.x > W - e.r - 10) bounce = true
    }
    if (bounce) {
      this.formationDir *= -1
      for (const e of this.enemies) e.y += 18
    }
    for (const e of this.enemies) {
      e.y += speed * 0.06 * dt
      for (const b of this.bullets) {
        if (b.alive && e.alive && this.touching(b, e)) {
          b.alive = false
          e.alive = false
          this.score += 1
          if (this.rng() < 0.1) this.items.push({ x: e.x, y: e.y, vx: 0, vy: 120, r: 11, alive: true })
        }
      }
      if (e.alive && (e.y > H - 50 || this.touching(e, p))) {
        e.alive = false
        this.hit()
      }
    }
    for (const it of this.items) {
      it.y += it.vy * dt
      if (it.alive && this.touching(it, p)) {
        it.alive = false
        this.lives = Math.min(9, this.lives + 1)
      }
    }
    this.enemies = this.enemies.filter((e) => e.alive)
    this.bullets = this.bullets.filter((b) => b.alive && b.y > -10)
    this.items = this.items.filter((b) => b.alive && b.y < H + 20)
    if (this.enemies.length === 0 && this.state === 'play') this.nextWave()
  }

  private buildLevel() {
    const t = this.spec.tuning
    const air = (2 * this.jumpV) / this.gravityPx
    const reach = this.pSpeed * air
    const rise = (this.jumpV * this.jumpV) / (2 * this.gravityPx)
    const maxGap = Math.max(40, Math.min(150, reach * 0.55))
    const maxRise = Math.max(30, Math.min(90, rise * 0.65))
    this.levelLen = 1400 + t.targetScore * 110

    this.plats = [{ x: 0, y: H - 40, w: 420 }]
    let x = 420
    let y = H - 40
    while (x < this.levelLen) {
      const gap = 40 + this.rng() * (maxGap - 40)
      const w = 110 + this.rng() * 170
      y = Math.max(H - 260, Math.min(H - 40, y + (this.rng() * 2 - 1) * maxRise))
      x += gap
      this.plats.push({ x, y, w })
      x += w
    }
    const lastPlat = this.plats[this.plats.length - 1]
    lastPlat.w = Math.max(lastPlat.w, 200)
    this.levelLen = lastPlat.x + lastPlat.w

    // coins over platforms, enemies on platforms (never the first)
    const coinCount = t.targetScore
    for (let i = 0; i < coinCount; i++) {
      const pl = this.plats[1 + Math.floor(this.rng() * (this.plats.length - 1))]
      this.items.push({ x: pl.x + 20 + this.rng() * (pl.w - 40), y: pl.y - 50 - this.rng() * 40, vx: 0, vy: 0, r: 10, alive: true })
    }
    const candidates = this.plats.slice(2, -1).filter((p) => p.w > 140)
    for (let i = 0; i < Math.min(t.enemyCount, candidates.length); i++) {
      const pl = candidates[Math.floor((i / Math.min(t.enemyCount, candidates.length)) * candidates.length)]
      this.enemies.push({ x: pl.x + pl.w / 2, y: pl.y - 15, vx: this.eSpeed * 0.5, vy: 0, r: 15, alive: true, minX: pl.x + 15, maxX: pl.x + pl.w - 15 })
    }
    this.player = { x: 60, y: H - 40 - 16, vx: 0, vy: 0, r: 16 }
    this.checkpoint = { x: 60, y: H - 40 - 16 }
  }

  private updatePlatformer(dt: number) {
    const p = this.player
    const dx = (this.right ? 1 : 0) - (this.left ? 1 : 0)
    p.vx = dx * this.pSpeed
    const jump = this.action || this.up
    if (jump && this.grounded && !this.jumpHeld) {
      p.vy = -this.jumpV
      this.grounded = false
    }
    this.jumpHeld = jump
    // short hop when released early
    const g = this.gravityPx * (p.vy < 0 && !jump ? 1.8 : 1)
    p.vy = Math.min(900, p.vy + g * dt)

    const prevBottom = p.y + p.r
    p.x = Math.max(p.r, Math.min(this.levelLen, p.x + p.vx * dt))
    p.y += p.vy * dt
    this.grounded = false
    for (const pl of this.plats) {
      const within = p.x + p.r * 0.6 > pl.x && p.x - p.r * 0.6 < pl.x + pl.w
      if (within && p.vy >= 0 && prevBottom <= pl.y + 2 && p.y + p.r >= pl.y) {
        p.y = pl.y - p.r
        p.vy = 0
        this.grounded = true
        this.checkpoint = { x: Math.max(pl.x + 20, Math.min(pl.x + pl.w - 20, p.x)), y: pl.y - p.r }
      }
    }

    for (const e of this.enemies) {
      if (!e.alive) continue
      e.x += e.vx * dt
      if (e.x < e.minX! || e.x > e.maxX!) {
        e.vx *= -1
        e.x = Math.max(e.minX!, Math.min(e.maxX!, e.x))
      }
      if (this.touching(p, e)) {
        if (p.vy > 0 && prevBottom <= e.y) {
          e.alive = false
          this.score += 1
          p.vy = -this.jumpV * 0.6
        } else {
          this.hit()
        }
      }
    }
    for (const it of this.items) {
      if (it.alive && this.touching(p, it)) {
        it.alive = false
        this.score += 1
      }
    }
    if (p.y > H + 80) {
      if (this.state === 'play' && this.shield <= 0) this.hit()
      if (this.state === 'play') {
        p.x = this.checkpoint.x
        p.y = this.checkpoint.y - 4
        p.vx = p.vy = 0
        this.shield = Math.max(this.shield, 1.5)
      }
    }
    if (p.x >= this.levelLen - 40) this.end(true)
    this.camX = Math.max(0, Math.min(this.levelLen + 60 - W, p.x - W * 0.35))
  }

  // ---------- draw ----------
  private draw() {
    const ctx = this.ctx
    const s = this.spec
    ctx.setTransform(this.canvas.width / W, 0, 0, this.canvas.height / H, 0, 0)
    ctx.fillStyle = s.look.background
    ctx.fillRect(0, 0, W, H)

    if (this.state === 'title') return this.drawTitle()

    const pc = character(s, 'player')
    const ec = character(s, 'enemy')
    const cc = character(s, 'collectible')

    ctx.save()
    if (s.genre === 'platformer') {
      ctx.translate(-this.camX, 0)
      ctx.fillStyle = s.look.ground
      for (const pl of this.plats) ctx.fillRect(pl.x, pl.y, pl.w, H - pl.y)
      // flag
      ctx.fillStyle = s.look.text
      ctx.fillRect(this.levelLen - 40, this.plats[this.plats.length - 1].y - 90, 4, 90)
      ctx.fillStyle = cc.color
      ctx.beginPath()
      ctx.moveTo(this.levelLen - 36, this.plats[this.plats.length - 1].y - 90)
      ctx.lineTo(this.levelLen - 6, this.plats[this.plats.length - 1].y - 78)
      ctx.lineTo(this.levelLen - 36, this.plats[this.plats.length - 1].y - 66)
      ctx.fill()
    } else {
      ctx.strokeStyle = s.look.ground
      ctx.globalAlpha = 0.35
      ctx.lineWidth = 1
      for (let x = 0; x <= W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 30); ctx.lineTo(x, H); ctx.stroke()
      }
      for (let y = 30; y <= H; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    const bob = Math.sin(this.t * 4) * 2
    for (const it of this.items) if (it.alive !== false) drawShape(ctx, cc, it.x, it.y + bob, it.r)
    for (const e of this.enemies) if (e.alive !== false) drawShape(ctx, ec, e.x, e.y, e.r)
    ctx.fillStyle = s.look.text
    for (const b of this.bullets) ctx.fillRect(b.x - 2, b.y - 8, 4, 12)
    if (!(this.shield > 0 && Math.floor(this.t * 12) % 2 === 0)) drawShape(ctx, pc, this.player.x, this.player.y, this.player.r)
    ctx.restore()

    this.drawHud()
    if (this.state === 'won' || this.state === 'lost') this.drawEnd()
  }

  private drawHud() {
    const ctx = this.ctx
    const s = this.spec
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.fillRect(0, 0, W, 30)
    ctx.fillStyle = s.look.text
    ctx.font = '600 15px ui-sans-serif, system-ui, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    const parts: string[] = []
    const target = s.genre === 'platformer' ? '' : s.genre === 'dodger' && s.tuning.timeLimit > 0 ? '' : ` / ${s.tuning.targetScore}`
    if (s.ui.hud.includes('score')) parts.push(`Score ${this.score}${target}`)
    if (s.ui.hud.includes('lives')) parts.push(`Lives ${'♥'.repeat(Math.max(0, this.lives))}`)
    if (s.ui.hud.includes('timer') && s.tuning.timeLimit > 0 && s.genre !== 'platformer' && s.genre !== 'shooter')
      parts.push(`Time ${Math.max(0, Math.ceil(s.tuning.timeLimit - this.t))}s`)
    if (s.genre === 'shooter') parts.push(`Wave ${this.wave}`)
    if (s.genre === 'platformer') parts.push(`Distance ${Math.round((this.player.x / this.levelLen) * 100)}%`)
    ctx.fillText(parts.join('    '), 12, 15)
    ctx.textAlign = 'right'
    ctx.globalAlpha = 0.7
    ctx.fillText(s.title, W - 12, 15)
    ctx.globalAlpha = 1
  }

  private centerText(text: string, y: number, size: number, weight = 600, alpha = 1) {
    const ctx = this.ctx
    ctx.globalAlpha = alpha
    ctx.fillStyle = this.spec.look.text
    ctx.font = `${weight} ${size}px ui-sans-serif, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // simple wrap
    const words = text.split(' ')
    const lines: string[] = []
    let line = ''
    for (const w of words) {
      const test = line ? line + ' ' + w : w
      if (ctx.measureText(test).width > W - 120 && line) {
        lines.push(line)
        line = w
      } else line = test
    }
    lines.push(line)
    lines.forEach((l, i) => ctx.fillText(l, W / 2, y + i * size * 1.3))
    ctx.globalAlpha = 1
    return lines.length * size * 1.3
  }

  private drawTitle() {
    const s = this.spec
    const ctx = this.ctx
    const pc = character(s, 'player')
    const ec = character(s, 'enemy')
    const cc = character(s, 'collectible')
    drawShape(ctx, ec, W / 2 - 90, 110, 18)
    drawShape(ctx, pc, W / 2, 105, 26)
    drawShape(ctx, cc, W / 2 + 90, 110, 15)
    this.centerText(s.title, 175, 40, 700)
    const h = this.centerText(s.ui.titleScreen, 225, 17, 400, 0.85)
    let y = 240 + h
    for (const c of GENRE_INFO[s.genre].controls) {
      this.centerText(c, y, 14, 400, 0.7)
      y += 22
    }
    const pulse = 0.55 + Math.sin(performance.now() / 300) * 0.35
    this.centerText('Press Enter or click to start', H - 50, 18, 700, pulse)
    ctx.globalAlpha = 1
  }

  private drawEnd() {
    const ctx = this.ctx
    const won = this.state === 'won'
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(0, 0, W, H)
    this.centerText(won ? 'You win!' : 'Game over', H / 2 - 60, 44, 800)
    this.centerText(won ? this.spec.ui.winMessage : this.spec.ui.loseMessage, H / 2, 18, 400, 0.9)
    this.centerText(`Score ${this.score} · ${Math.round(this.t)}s`, H / 2 + 40, 16, 500, 0.8)
    this.centerText('Press Enter or click to play again', H / 2 + 90, 16, 700, 0.75)
  }
}
