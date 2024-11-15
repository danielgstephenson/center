import { Actor } from './actor'
import { DistanceJoint, Vec2 } from 'planck'
import { Blade } from '../features/blade'
import { Fighter } from './fighter'

export class Weapon extends Actor {
  static movePower = 0.15
  static maxSpeed = 1
  static swingPower = 0.015
  static maxSpin = 0.8
  startTime = 0
  fighter: Fighter
  position = Vec2(0, 0)
  velocity = Vec2(0, 0)
  move = Vec2(0, 0)
  angle = 0
  spin = 0
  blade: Blade
  team: number

  constructor (fighter: Fighter) {
    super(fighter.game, {
      type: 'dynamic',
      bullet: true,
      linearDamping: 0,
      angularDamping: 0,
      fixedRotation: true
    })
    this.startTime = performance.now()
    this.fighter = fighter
    this.team = this.fighter.team
    this.blade = new Blade(this)
    this.label = 'weapon'
    this.body.setMassData({
      mass: 0.001,
      center: Vec2(0, 0),
      I: 1
    })
    this.body.setPosition(this.fighter.body.getPosition())
    this.updateConfiguration()
    this.game.world.createJoint(new DistanceJoint({
      bodyA: this.body,
      bodyB: this.fighter.body,
      collideConnected: false,
      dampingRatio: 0.0,
      frequencyHz: 0.1,
      localAnchorA: Vec2(0, 0),
      localAnchorB: Vec2(0, 0)
    }))
    this.game.weapons.set(this.id, this)
  }

  updateConfiguration (): void {
    this.position = this.body.getPosition()
    this.velocity = this.body.getLinearVelocity()
  }

  postStep (): void {
    if (this.removed) {
      this.game.world.destroyBody(this.body)
      this.game.weapons.delete(this.id)
      return
    }
    this.updateConfiguration()
  }

  remove (): void {
    this.game.actors.delete(this.id)
    this.removed = true
  }
}
