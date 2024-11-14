import { EdgeShape, Vec2 } from 'planck'
import { Actor } from '../actors/actor'
import { Feature } from './feature'

export class Wall extends Feature {
  constructor (actor: Actor, points: Vec2[]) {
    super(actor, {
      shape: new EdgeShape(points[0], points[1]),
      friction: 0,
      restitution: 0
    })
    this.label = 'wall'
  }
}
