import { Game } from '../game'
import { FighterSummary } from './fighterSummary'

export class GameSummary {
  fighters: FighterSummary[]
  scoreDiff: number
  waited: number

  constructor (game: Game) {
    const fighters = [...game.fighters.values()]
    this.fighters = fighters.map(fighter => new FighterSummary(fighter))
    this.scoreDiff = game.scoreDiff
    this.waited = game.waited
  }
}
