import { Actor } from './actor'
import { Game } from '../game'
import { Torso } from '../features/torso'
import { Vec2 } from 'planck'
import { clamp, clampVec, dirToFrom } from '../math'
import { Arena } from './arena'
import { Weapon } from './weapon'

export class Fighter extends Actor {
  static movePower = 0.5
  static maxSpeed = 1
  static swingPower = 0.015
  static maxSpin = 0.8
  startTime = 0
  position = Vec2(0, 0)
  velocity = Vec2(0, 0)
  target = Vec2(0, 0)
  move = Vec2(0, 0)
  angle = 0
  spin = 0
  torso: Torso
  weapon: Weapon
  team = 0
  spawnPoint = Vec2(0, 0)
  spawnSign = 0

  constructor (game: Game, team: number) {
    super(game, {
      type: 'dynamic',
      bullet: true,
      linearDamping: 0,
      angularDamping: 0,
      fixedRotation: true
    })
    this.startTime = performance.now()
    this.torso = new Torso(this)
    this.label = 'fighter'
    this.body.setMassData({
      mass: 1,
      center: Vec2(0, 0),
      I: 1
    })
    this.game.fighters.set(this.id, this)
    this.team = team
    this.spawnPoint = this.getSpawnPoint()
    this.updateConfiguration()
    this.weapon = new Weapon(this)
  }

  joinTeam (team: number): void {
    this.team = team
    this.weapon.team = team
    this.spawnSign = 2 * this.team - 3
    this.respawn()
  }

  respawn (): void {
    this.body.setPosition(this.spawnPoint)
    this.body.setLinearVelocity(Vec2(0, 0))
    this.weapon.body.setPosition(this.spawnPoint)
    this.weapon.body.setLinearVelocity(Vec2(0, 0))
    this.target = this.spawnPoint
    this.torso.alive = true
    this.updateConfiguration()
  }

  getSpawnPoint (): Vec2 {
    const allyCount = this.getAllies().length
    const xSign = 2 * this.team - 3
    const ySign = 1 - 2 * allyCount
    const scale = 0.9
    const x = xSign * scale * Arena.hx
    const y = ySign * scale * Arena.hy
    return Vec2(x, y)
  }

  getAllies (): Fighter[] {
    const fighters = [...this.game.fighters.values()]
    return fighters.filter(fighter => fighter.team === this.team && fighter.id !== this.id)
  }

  getEnemies (): Fighter[] {
    const fighters = [...this.game.fighters.values()]
    return fighters.filter(fighter => fighter.team !== this.team)
  }

  getAllyDistance (position: Vec2): number {
    const allyDistances = this.getAllies().map(ally => {
      return Vec2.distance(ally.position, position)
    })
    return Math.min(...allyDistances)
  }

  preStep (): void {
    const move = dirToFrom(this.target, this.position)
    const force = Vec2.mul(move, Fighter.movePower)
    this.body.applyForce(force, this.body.getPosition())
  }

  updateConfiguration (): void {
    this.position = this.body.getPosition()
    this.velocity = clampVec(this.body.getLinearVelocity(), Fighter.maxSpeed)
    this.body.setLinearVelocity(this.velocity)
    this.angle = this.body.getAngle()
    this.spin = clamp(-Fighter.maxSpin, Fighter.maxSpin, this.body.getAngularVelocity())
    this.body.setAngularVelocity(this.spin)
  }

  postStep (): void {
    if (this.removed) {
      this.game.world.destroyBody(this.body)
      this.game.fighters.delete(this.id)
      return
    }
    this.updateConfiguration()
    if (!this.torso.alive) this.respawn()
  }

  remove (): void {
    this.weapon.remove()
    this.game.actors.delete(this.id)
    this.removed = true
  }
}
