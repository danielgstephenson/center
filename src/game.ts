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
import { Weapon } from './actors/weapon'
import { choose } from './math'

// make swingless

export class Game {
  world = new World()
  actors = new Map<string, Actor>()
  fighters = new Map<string, Fighter>()
  weapons = new Map<string, Weapon>()
  players = new Map<string, Player>()
  config = new Config()
  runner = new Runner(this)
  arena = new Arena(this)
  collider = new Collider(this)
  summary: GameSummary

  timeScale = 1
  timeToWin = 40 // 40
  timeToWait = 5 // 5
  waited = 0
  score1 = 0
  score2 = 0
  scoreDiff = 0
  fighter: Fighter

  constructor () {
    this.timeScale = this.config.timeScale
    this.fighter = new Fighter(this, 1)
    void new Fighter(this, 1)
    void new Fighter(this, 2)
    void new Fighter(this, 2)
    this.summary = new GameSummary(this)
    const io = getIo(this.config)
    io.on('connection', socket => {
      console.log('this.weapons.size', this.weapons.size)
      console.log('connect:', socket.id)
      socket.emit('connected')
      const player = new Player(this, socket.id)
      socket.on('input', (input: InputSummary) => {
        const move = input.move ?? Vec2(0, 0)
        this.fighter.move.x = move.x ?? 0
        this.fighter.move.y = move.y ?? 0
        const summary = new PlayerSummary(player)
        socket.emit('summary', summary)
      })
      socket.on('mouseDown', (mousePosition: Vec2) => {
        const x = Math.abs(mousePosition.x)
        const y = Math.abs(mousePosition.y)
        if (x < Arena.hx && y < Arena.hy) {
          this.fighter.target = mousePosition
        }
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
      if (player.team === team) count += 1
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

  preStep (): void {}
}
