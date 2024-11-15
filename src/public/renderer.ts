import { Vec2 } from 'planck'
import { Arena } from '../actors/arena'
import { Blade } from '../features/blade'
import { Torso } from '../features/torso'
import { FighterSummary } from '../summaries/fighterSummary'
import { PlayerSummary } from '../summaries/playerSummary'
import { WeaponSummary } from '../summaries/weaponSummary'
import { Camera } from './camera'

export class Renderer {
  mainCanvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  camera = new Camera()
  fighterSummaries: FighterSummary[] = []
  weaponSummaries: WeaponSummary[] = []
  fighterPosition = Vec2(0, 0)

  torsoColor1 = 'rgb(000,020,255)'
  torsoColor2 = 'rgb(000,120,000)'
  bladeColor1 = 'rgb(000,170,255)'
  bladeColor2 = 'rgb(000,200,050)'
  id = ''
  scoreDiff = 0
  waited = 0

  constructor () {
    this.mainCanvas = document.getElementById('mainCanvas') as HTMLCanvasElement
    this.context = this.mainCanvas.getContext('2d') as CanvasRenderingContext2D
    this.draw()
  }

  readSummary (summary: PlayerSummary): void {
    this.fighterSummaries = summary.game.fighters
    this.weaponSummaries = summary.game.weapons
    this.id = summary.id
    this.scoreDiff = summary.game.scoreDiff
    this.waited = summary.game.waited
    this.fighterPosition = summary.game.fighterPosition
  }

  draw (): void {
    window.requestAnimationFrame(() => this.draw())
    this.setupCanvas()
    this.drawArena()
    this.drawScoreArc()
    this.fighterSummaries.forEach(fighter => {
      this.drawTarget(fighter)
    })
    this.weaponSummaries.forEach(weapon => {
      this.drawSpring(weapon)
    })
    this.fighterSummaries.forEach(fighter => {
      this.drawTorso(fighter)
    })
    this.weaponSummaries.forEach(weapon => {
      this.drawBlade(weapon)
    })
  }

  drawTorso (fighter: FighterSummary): void {
    this.setupContext()
    this.context.fillStyle = fighter.team === 1 ? this.torsoColor1 : this.torsoColor2
    this.context.beginPath()
    this.context.arc(
      fighter.position.x,
      fighter.position.y,
      Torso.radius, 0, 2 * Math.PI
    )
    this.context.fill()
  }

  drawTarget (fighter: FighterSummary): void {
    this.setupContext()
    this.context.lineCap = 'round'
    this.context.strokeStyle = fighter.team === 1 ? this.torsoColor1 : this.torsoColor2
    this.context.lineWidth = 0.2
    this.context.beginPath()
    this.context.moveTo(fighter.position.x, fighter.position.y)
    this.context.lineTo(fighter.target.x, fighter.target.y)
    this.context.stroke()
  }

  drawBlade (weapon: WeaponSummary): void {
    this.setupContext()
    this.context.fillStyle = weapon.team === 1 ? this.bladeColor1 : this.bladeColor2
    this.context.beginPath()
    this.context.arc(
      weapon.position.x,
      weapon.position.y,
      Blade.radius, 0, 2 * Math.PI
    )
    this.context.fill()
  }

  drawSpring (weapon: WeaponSummary): void {
    this.setupContext()
    this.context.strokeStyle = weapon.team === 1 ? this.bladeColor1 : this.bladeColor2
    this.context.lineWidth = 0.07
    this.context.beginPath()
    this.context.moveTo(weapon.position.x, weapon.position.y)
    this.context.lineTo(weapon.fighterPosition.x, weapon.fighterPosition.y)
    this.context.stroke()
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
    this.context.lineWidth = 0.05
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
    this.context.strokeStyle = this.scoreDiff < 0 ? this.torsoColor1 : this.torsoColor2
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
    const vmin = Math.min(window.innerWidth, window.innerHeight)
    this.mainCanvas.width = vmin
    this.mainCanvas.height = vmin
  }

  setupContext (): void {
    this.context.resetTransform()
    this.context.translate(0.5 * this.mainCanvas.width, 0.5 * this.mainCanvas.height)
    const vmin = Math.min(this.mainCanvas.width, this.mainCanvas.height)
    this.context.scale(vmin, -vmin)
    this.camera.scale = 0.1 * Math.exp(0.1 * this.camera.zoom - 1)
    this.context.scale(this.camera.scale, this.camera.scale)
    this.context.translate(-this.camera.position.x, -this.camera.position.y)
    this.context.globalAlpha = 1
  }
}
