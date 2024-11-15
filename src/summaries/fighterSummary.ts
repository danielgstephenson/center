import { Vec2 } from 'planck'
import { Fighter } from '../actors/fighter'

export class FighterSummary {
  position: Vec2
  target: Vec2
  id: string
  team: number

  constructor (fighter: Fighter) {
    this.position = fighter.body.getPosition()
    this.target = fighter.target
    this.id = fighter.id
    this.team = fighter.team
  }
}
