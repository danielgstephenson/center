import { Vec2 } from 'planck'
import { Weapon } from '../actors/weapon'

export class WeaponSummary {
  position: Vec2
  fighterPosition: Vec2
  id: string
  team: number

  constructor (weapon: Weapon) {
    this.position = weapon.body.getPosition()
    this.fighterPosition = weapon.fighter.body.getPosition()
    this.id = weapon.id
    this.team = weapon.team
  }
}
