import { Game } from './game'

export class Player {
  game: Game
  id: string
  team = 0

  constructor (game: Game, id: string) {
    this.game = game
    this.id = id
    this.game.players.set(id, this)
    this.team = this.game.getSmallPlayerTeam()
  }

  remove (): void {
    this.game.players.delete(this.id)
  }
}
