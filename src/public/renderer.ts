import { Vec2 } from 'planck'
import { Arena } from '../actors/arena'
import { Blade } from '../features/blade'
import { Torso } from '../features/torso'
import { FighterSummary } from '../summaries/fighterSummary'
import { PlayerSummary } from '../summaries/playerSummary'
import { Camera } from './camera'

export class Renderer {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  camera = new Camera()
  fighterSummaries: FighterSummary[] = []
  bladeVertices = [
    Vec2(Blade.start, -Blade.hy),
    Vec2(Blade.narrow, -Blade.hy),
    Vec2(Blade.reach, 0),
    Vec2(Blade.narrow, Blade.hy),
    Vec2(Blade.start, Blade.hy)
  ]

  color1 = 'blue'
  color2 = 'rgb(0,120,0)'
  id = ''
  scoreDiff = 0
  waited = 0

  constructor () {
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D
    this.draw()
  }

  readSummary (summary: PlayerSummary): void {
    this.fighterSummaries = summary.game.fighters
    this.id = summary.id
    this.scoreDiff = summary.game.scoreDiff
    this.waited = summary.game.waited
  }

  draw (): void {
    window.requestAnimationFrame(() => this.draw())
    this.setupCanvas()
    this.setupCamera()
    this.drawArena()
    this.drawScoreArc()
    this.fighterSummaries.forEach(fighter => {
      this.drawBlade(fighter)
    })
    this.fighterSummaries.forEach(fighter => {
      this.drawTorso(fighter)
    })
  }

  drawBlade (fighter: FighterSummary): void {
    this.setupContext()
    this.context.fillStyle = 'hsl(0 0 100)'
    this.context.translate(fighter.position.x, fighter.position.y)
    this.context.rotate(fighter.angle)
    this.context.beginPath()
    this.bladeVertices.forEach((vertex, i) => {
      if (i === 0) this.context.moveTo(vertex.x, vertex.y)
      else this.context.lineTo(vertex.x, vertex.y)
    })
    this.context.fill()
  }

  drawTorso (fighter: FighterSummary): void {
    this.setupContext()
    this.context.fillStyle = fighter.team === 1 ? this.color1 : this.color2
    this.context.beginPath()
    this.context.arc(
      fighter.position.x,
      fighter.position.y,
      Torso.radius, 0, 2 * Math.PI
    )
    this.context.fill()
  }

  drawArena (): void {
    this.setupContext()
    this.context.strokeStyle = 'hsl(0 0 30)'
    this.context.lineWidth = 1
    this.context.fillStyle = 'black'
    this.context.beginPath()
    this.context.rect(-Arena.hx, -Arena.hy, 2 * Arena.hx, 2 * Arena.hy)
    this.context.stroke()
    this.context.beginPath()
    this.context.rect(-Arena.hx, -Arena.hy, 2 * Arena.hx, 2 * Arena.hy)
    this.context.fill()
    this.context.strokeStyle = 'hsl(0 0 30)'
    this.context.lineWidth = 0.2
    this.context.beginPath()
    const startLine = Arena.safeX
    this.context.moveTo(-startLine, 0)
    this.context.lineTo(-Arena.criticalRadius, 0)
    this.context.moveTo(+Arena.criticalRadius, 0)
    this.context.lineTo(+startLine, 0)
    this.context.moveTo(-startLine, +Arena.hy)
    this.context.lineTo(-startLine, -Arena.hy)
    this.context.moveTo(0, Arena.hy)
    this.context.lineTo(0, +Arena.criticalRadius)
    this.context.moveTo(0, -Arena.criticalRadius)
    this.context.lineTo(0, -Arena.hy)
    this.context.moveTo(startLine, +Arena.hy)
    this.context.lineTo(startLine, -Arena.hy)
    this.context.stroke()
    this.context.beginPath()
    this.context.arc(0, 0, Arena.outerRadius, 0, 2 * Math.PI)
    this.context.stroke()
    this.context.beginPath()
    this.context.arc(0, 0, Arena.indicatorRadius, 0, 2 * Math.PI)
    this.context.stroke()
    this.context.beginPath()
    this.context.arc(0, 0, Arena.criticalRadius, 0, 2 * Math.PI)
    this.context.stroke()
  }

  drawScoreArc (): void {
    this.setupContext()
    this.context.globalAlpha = 0.5
    this.context.strokeStyle = this.scoreDiff < 0 ? this.color1 : this.color2
    this.context.lineWidth = 1 + this.waited * 2 * (Arena.indicatorRadius - Arena.criticalRadius - 0.5)
    this.context.beginPath()
    if (this.scoreDiff > 0) {
      const startAngle = 0.5 * Math.PI
      const endAngle = startAngle + 2 * Math.PI * this.scoreDiff
      this.context.arc(0, 0, Arena.indicatorRadius, startAngle, endAngle)
    }
    if (this.scoreDiff < 0) {
      const endAngle = 0.5 * Math.PI
      const startAngle = endAngle + 2 * Math.PI * this.scoreDiff
      this.context.arc(0, 0, Arena.indicatorRadius, startAngle, endAngle)
    }
    this.context.stroke()
  }

  setupCanvas (): void {
    this.canvas.width = window.visualViewport?.width ?? window.innerWidth
    this.canvas.height = window.visualViewport?.height ?? window.innerHeight
  }

  setupCamera (): void {
    this.fighterSummaries.forEach(fighter => {
      if (fighter.id === this.id) {
        this.camera.position = fighter.position
      }
    })
  }

  setupContext (): void {
    this.context.resetTransform()
    this.context.translate(0.5 * this.canvas.width, 0.5 * this.canvas.height)
    const vmin = Math.min(this.canvas.width, this.canvas.height)
    this.context.scale(0.1 * vmin, -0.1 * vmin)
    const cameraScale = Math.exp(0.1 * this.camera.zoom - 1)
    this.context.scale(cameraScale, cameraScale)
    this.context.translate(-this.camera.position.x, -this.camera.position.y)
    this.context.globalAlpha = 1
  }
}
