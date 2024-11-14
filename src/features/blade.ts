import { Polygon, Vec2 } from 'planck'
import { Feature } from './feature'
import { Fighter } from '../actors/fighter'

export class Blade extends Feature {
  static hy = 0.19
  static start = 0.9
  static narrow = 6
  static reach = 7
  fighter: Fighter

  constructor (fighter: Fighter) {
    const vertices = [
      Vec2(Blade.start, -Blade.hy),
      Vec2(Blade.narrow, -Blade.hy),
      Vec2(Blade.reach, 0),
      Vec2(Blade.narrow, Blade.hy),
      Vec2(Blade.start, Blade.hy)
    ]
    super(fighter, {
      shape: new Polygon(vertices),
      friction: 0,
      restitution: 0
    })
    this.fighter = fighter
    this.label = 'blade'
  }
}
