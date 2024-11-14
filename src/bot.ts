import { Vec2 } from 'planck'
import { Fighter } from './actors/fighter'
import { Game } from './game'
import { angleToDir, choose, clamp, dirToFrom, whichMin } from './math'
import { Arena } from './actors/arena'
import { Blade } from './features/blade'

export class Bot {
  game: Game
  id: string
  fighter: Fighter
  centerPoint = Vec2.zero()
  tactic = 0

  constructor (game: Game, id: string) {
    this.game = game
    this.id = id
    this.fighter = new Fighter(game, id)
    this.game.bots.set(id, this)
    this.joinTeam()
    this.chooseCenterPoint()
    this.chooseTactic()
  }

  preStep (dt: number): void {
    this.updateTactics(dt)
    this.move()
  }

  updateTactics (dt: number): void {
    if (Math.random() < dt) this.chooseCenterPoint()
    if (Math.random() < dt / 5) this.chooseTactic()
  }

  chooseTactic (): void {
    this.tactic = 1.5
  }

  move (): void {
    const ally = this.getNearestAlly()
    if (ally != null) {
      const distance = Vec2.distance(ally.position, this.fighter.position)
      if (distance < 2 * Blade.reach) {
        const centerDistance = Vec2.distance(this.fighter.position, this.centerPoint)
        const allyCenterDistance = Vec2.distance(this.fighter.position, this.centerPoint)
        if (allyCenterDistance <= centerDistance) {
          this.fighter.move = dirToFrom(this.fighter.position, ally.position)
          return
        }
      }
    }
    const swingMoveDir = this.getSwingMoveDir()
    const centerMoveDir = this.getCenterMoveDir()
    const spinRatio = Math.abs(this.fighter.spin) / Fighter.maxSpin
    const weight = clamp(0, 1, this.tactic * spinRatio)
    this.fighter.move = Vec2.combine(weight, centerMoveDir, 1 - weight, swingMoveDir)
  }

  getSwingMoveDir (): Vec2 {
    const spinSign = this.fighter.spin === 0 ? choose([-1, 1]) : Math.sign(this.fighter.spin)
    const swingAngle = this.fighter.angle - 0.5 * Math.PI * spinSign
    return angleToDir(swingAngle)
  }

  getCenterMoveDir (): Vec2 {
    const targetVelocity = Vec2.mul(0.5, Vec2.sub(this.centerPoint, this.fighter.position))
    return dirToFrom(targetVelocity, this.fighter.velocity)
  }

  chooseCenterPoint (): void {
    const radius = 0.8 * Arena.criticalRadius
    const angle = 2 * Math.PI * Math.random()
    this.centerPoint = Vec2(radius * Math.cos(angle), radius * Math.sin(angle))
  }

  getNearestEnemy (): Fighter | null {
    const enemies = this.fighter.getEnemies()
    if (enemies.length === 0) return null
    const distances = enemies.map(enemy => Vec2.distance(enemy.position, this.fighter.position))
    return enemies[whichMin(distances)]
  }

  getNearestAlly (): Fighter | null {
    const allies = this.fighter.getAllies()
    if (allies.length === 0) return null
    const distances = allies.map(enemy => Vec2.distance(enemy.position, this.fighter.position))
    return allies[whichMin(distances)]
  }

  joinTeam (): void {
    this.fighter.joinTeam(this.game.getSmallFighterTeam())
  }

  remove (): void {
    this.fighter.remove()
    this.game.bots.delete(this.id)
  }
}
