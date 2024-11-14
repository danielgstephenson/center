import { BodyDef, Body, Fixture } from 'planck'
import { Game } from '../game'

export class Actor {
  static count = 0
  game: Game
  body: Body
  id: string
  label = ''
  removed = false

  constructor (game: Game, id: string, bodyDef: BodyDef) {
    if (game.actors.has(id)) {
      throw new Error(`Actor id ${id} is already in use.`)
    } else {
      this.game = game
      this.id = id
      this.body = this.game.world.createBody(bodyDef)
      this.body.setUserData(this)
      this.game.actors.set(this.id, this)
    }
  }

  getFixtures (): Fixture[] {
    const fixtures = []
    for (let fixture = this.body.getFixtureList(); fixture != null; fixture = fixture.getNext()) {
      fixtures.push(fixture)
    }
    return fixtures
  }
}
