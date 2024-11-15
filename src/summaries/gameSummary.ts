import { Vec2 } from 'planck'
import { Game } from '../game'
import { FighterSummary } from './fighterSummary'
import { WeaponSummary } from './weaponSummary'

export class GameSummary {
  fighters: FighterSummary[]
  weapons: WeaponSummary[]
  scoreDiff: number
  waited: number
  fighterPosition: Vec2

  constructor (game: Game) {
    const fighters = [...game.fighters.values()]
    this.fighters = fighters.map(fighter => new FighterSummary(fighter))
    const weapons = [...game.weapons.values()]
    this.weapons = weapons.map(weapon => new WeaponSummary(weapon))
    this.scoreDiff = game.scoreDiff
    this.waited = game.waited
    this.fighterPosition = game.fighter.position
  }
}
