import { Arena } from './actors/arena'
import { Torso } from './features/torso'
import { Game } from './game'
import { GameSummary } from './summaries/gameSummary'

export class Runner {
  game: Game
  time: number

  constructor (game: Game) {
    this.game = game
    this.time = performance.now()
    setInterval(() => this.step(), 20)
  }

  step (): void {
    const oldTime = this.time
    this.time = performance.now()
    const dt = this.game.timeScale * (this.time - oldTime) / 1000
    this.game.scoreDiff = this.game.score2 - this.game.score1
    if (Math.abs(this.game.scoreDiff) < 1) {
      this.game.preStep()
      this.game.bots.forEach(bot => bot.preStep(dt))
      this.game.fighters.forEach(fighter => fighter.preStep())
      this.game.world.step(dt * this.game.config.timeScale)
      this.game.fighters.forEach(fighter => fighter.postStep())
      this.updateScores(dt)
    } else {
      this.game.waited += dt / this.game.timeToWait
    }
    this.game.summary = new GameSummary(this.game)
    if (this.game.waited > 1) this.restart()
  }

  restart (): void {
    this.game.score1 = 0
    this.game.score2 = 0
    this.game.waited = 0
    this.game.fighters.forEach(fighter => { fighter.team = 0 })
    this.game.players.forEach(player => player.joinTeam())
    this.game.bots.forEach(fighter => fighter.joinTeam())
    this.game.fighters.forEach(fighter => fighter.respawn())
  }

  updateScores (dt: number): void {
    let count1 = 0
    let count2 = 0
    this.game.fighters.forEach(fighter => {
      if (fighter.position.length() < Arena.criticalRadius + Torso.radius) {
        if (fighter.team === 1) count1 += 1
        if (fighter.team === 2) count2 += 1
      }
    })
    if (count1 > count2) this.game.score1 += dt / this.game.timeToWin
    if (count2 > count1) this.game.score2 += dt / this.game.timeToWin
  }
}
