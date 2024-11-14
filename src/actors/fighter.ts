import { Actor } from './actor'
import { Game } from '../game'
import { Torso } from '../features/torso'
import { Vec2 } from 'planck'
import { clamp, clampVec, normalize, range } from '../math'
import { Blade } from '../features/blade'
import { Arena } from './arena'

export class Fighter extends Actor {
  static movePower = 0.15
  static maxSpeed = 1
  static swingPower = 0.015
  static maxSpin = 0.8
  startTime = 0
  position = Vec2(0, 0)
  velocity = Vec2(0, 0)
  move = Vec2(0, 0)
  angle = 0
  spin = 0
  torso: Torso
  blade: Blade
  team = 0
  spawnSign = 0
  spawnAngle = 0

  constructor (game: Game, id: string) {
    super(game, id, {
      type: 'dynamic',
      bullet: true,
      linearDamping: 0,
      angularDamping: 0
    })
    this.startTime = performance.now()
    this.torso = new Torso(this)
    this.blade = new Blade(this)
    this.label = 'fighter'
    this.body.setMassData({
      mass: 1,
      center: Vec2(0.1, 0),
      I: 0.25
    })
    this.game.fighters.set(this.id, this)
  }

  joinTeam (team: number): void {
    this.team = team
    this.spawnSign = 2 * this.team - 3
    this.spawnAngle = this.team === 1 ? 0 : Math.PI
    this.respawn()
  }

  respawn (): void {
    const spawnPoint = this.getSpawnPoint()
    this.body.setPosition(spawnPoint)
    this.body.setLinearVelocity(Vec2(0, 0))
    this.body.setAngle(this.spawnAngle)
    this.body.setAngularVelocity(0)
    this.torso.alive = true
    this.updateConfiguration()
  }

  getSpawnPoint (): Vec2 {
    const spawnX = this.spawnSign * (Arena.safeX + 5)
    let spawnPoint = Vec2(spawnX, 0)
    const spawnPoints = [spawnPoint]
    const maxY = Math.floor(Arena.hy) - Math.ceil(Torso.radius)
    range(1, maxY).forEach(y => {
      spawnPoints.push(Vec2(spawnX, +y))
      spawnPoints.push(Vec2(spawnX, -y))
    })
    const allies = this.getAllies()
    for (const point of spawnPoints) {
      const allyDistances = allies.map(ally => Vec2.distance(ally.position, point))
      const minAllyDistance = Math.min(...allyDistances)
      if (minAllyDistance > Blade.reach) {
        spawnPoint = point
        break
      }
    }
    return spawnPoint
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
    const move = this.move.length() > 0 ? this.move : Vec2.mul(this.velocity, -1)
    const force = Vec2.mul(normalize(move), Fighter.movePower)
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
    this.game.actors.delete(this.id)
    this.removed = true
  }
}
