import { Contact } from 'planck'
import { Game } from './game'
import { Feature } from './features/feature'
import { Torso } from './features/torso'
import { Blade } from './features/blade'

export class Collider {
  game: Game

  constructor (game: Game) {
    this.game = game
    this.game.world.on('begin-contact', contact => this.beginContact(contact))
    this.game.world.on('pre-solve', contact => this.preSolve(contact))
  }

  preSolve (contact: Contact): void {
    const feature0 = contact.getFixtureA().getUserData() as Feature
    const feature1 = contact.getFixtureB().getUserData() as Feature
    const pairs = [[feature0, feature1], [feature1, feature0]]
    pairs.forEach(features => {
      const a = features[0]
      const b = features[1]
      if (a instanceof Blade && b instanceof Torso) {
        contact.setEnabled(false)
        if (a.weapon.team !== b.fighter.team) {
          setTimeout(() => { b.alive = false }, 100)
        }
      }
    })
  }

  beginContact (contact: Contact): void {}
}
