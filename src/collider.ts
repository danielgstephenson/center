import { Contact, WorldManifold } from 'planck'
import { Game } from './game'
import { Feature } from './features/feature'
import { Torso } from './features/torso'
import { Arena } from './actors/arena'

export class Collider {
  game: Game

  constructor (game: Game) {
    this.game = game
    this.game.world.on('begin-contact', contact => this.beginContact(contact))
    this.game.world.on('pre-solve', contact => this.preSolve(contact))
  }

  preSolve (contact: Contact): void {
    const a = contact.getFixtureA().getUserData() as Feature
    const b = contact.getFixtureB().getUserData() as Feature
    const features = [a, b]
    const featureLabels = features.map(feature => feature.label)
    const worldManifold = contact.getWorldManifold(null)
    if (!(worldManifold instanceof WorldManifold)) return
    if (featureLabels.includes('blade') && featureLabels.includes('torso')) {
      contact.setEnabled(false)
      features.forEach(feature => {
        if (feature instanceof Torso) {
          const unsafe = worldManifold.points[0].x * feature.fighter.spawnSign < Arena.safeX
          if (unsafe) {
            setTimeout(() => { feature.alive = false }, 100)
          }
        }
      })
    }
  }

  beginContact (contact: Contact): void {}
}
