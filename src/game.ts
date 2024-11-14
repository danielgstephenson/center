import { Vec2, World } from 'planck'
import { Fighter } from './actors/fighter'
import { Actor } from './actors/actor'
import { GameSummary } from './summaries/gameSummary'
import { Player } from './player'
import { Arena } from './actors/arena'
import { Runner } from './runner'
import { Config } from './config'
import { getIo } from './server'
import { InputSummary } from './summaries/inputSummary'
import { PlayerSummary } from './summaries/playerSummary'
import { Collider } from './collider'
import { Bot } from './bot'
import { choose } from './math'

// make swingless

export class Game {
  world = new World()
  actors = new Map<string, Actor>()
  fighters = new Map<string, Fighter>()
  players = new Map<string, Player>()
  bots = new Map<string, Bot>()
  config = new Config()
  runner = new Runner(this)
  summary = new GameSummary(this)
  arena = new Arena(this)
  collider = new Collider(this)

  timeScale = 1
  timeToWin = 40 // 40
  timeToWait = 5 // 5
  waited = 0
  score1 = 0
  score2 = 0
  scoreDiff = 0

  constructor () {
    this.timeScale = this.config.timeScale
    const io = getIo(this.config)
    io.on('connection', socket => {
      console.log('connect:', socket.id)
      socket.emit('connected')
      const player = new Player(this, socket.id)
      socket.on('input', (input: InputSummary) => {
        const move = input.move ?? Vec2(0, 0)
        player.fighter.move.x = move.x ?? 0
        player.fighter.move.y = move.y ?? 0
        const summary = new PlayerSummary(player)
        socket.emit('summary', summary)
      })
      socket.on('click', () => {
        // console.log('click')
      })
      socket.on('disconnect', () => {
        console.log('disconnect:', socket.id)
        player.remove()
      })
    })
  }

  preStep (): void {
    const fighterCount = this.players.size + this.bots.size
    const targetCount = 4
    const count1 = this.getTeamFighterCount(1)
    const count2 = this.getTeamFighterCount(2)
    if (fighterCount < targetCount && this.config.bot) {
      void new Bot(this, `bot${Math.random()}`)
      return
    }
    if (count1 !== count2) {
      const largeTeam = count1 > count2 ? 1 : 2
      const bots = [...this.bots.values()]
      const largeTeamBots = bots.filter(bot => bot.fighter.team === largeTeam)
      if (largeTeamBots.length > 0) largeTeamBots[0].remove()
    }
  }

  getTeamFighterCount (team: number): number {
    let count = 0
    this.fighters.forEach(fighter => {
      if (fighter.team === team) count += 1
    })
    return count
  }

  getTeamPlayerCount (team: number): number {
    let count = 0
    this.players.forEach(player => {
      if (player.fighter.team === team) count += 1
    })
    return count
  }

  getSmallFighterTeam (): number {
    const count1 = this.getTeamFighterCount(1)
    const count2 = this.getTeamFighterCount(2)
    if (count1 === count2) return choose([1, 2])
    return count2 > count1 ? 1 : 2
  }

  getSmallPlayerTeam (): number {
    const count1 = this.getTeamPlayerCount(1)
    const count2 = this.getTeamPlayerCount(2)
    if (count1 === count2) return this.getSmallFighterTeam()
    return count2 > count1 ? 1 : 2
  }
}
