import { Fighter } from './actors/fighter'
import { Game } from './game'

export class Player {
  game: Game
  id: string
  fighter: Fighter

  constructor (game: Game, id: string) {
    this.game = game
    this.id = id
    this.fighter = new Fighter(game, id)
    this.game.players.set(id, this)
    this.joinTeam()
  }

  joinTeam (): void {
    this.fighter.joinTeam(this.game.getSmallPlayerTeam())
  }

  remove (): void {
    this.fighter.remove()
    this.game.players.delete(this.id)
  }
}
