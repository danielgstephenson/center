import { Vec2 } from 'planck'
import { Renderer } from './renderer'
import { Socket } from 'socket.io-client'

export class Input {
  keyboard = new Map<string, boolean>()
  mousePosition = Vec2(0, 0)
  mouseButtons = new Map<number, boolean>()
  renderer: Renderer
  socket: Socket

  constructor (renderer: Renderer, socket: Socket) {
    this.renderer = renderer
    this.socket = socket
    window.onkeydown = (event: KeyboardEvent) => this.onkeydown(event)
    window.onkeyup = (event: KeyboardEvent) => this.onkeyup(event)
    window.onwheel = (event: WheelEvent) => this.onwheel(event)
    window.onmousemove = (event: MouseEvent) => this.onmousemove(event)
    window.onmousedown = (event: MouseEvent) => this.onmousedown(event)
    window.onmouseup = (event: MouseEvent) => this.onmouseup(event)
    window.ontouchmove = (event: TouchEvent) => this.ontouchmove(event)
    window.ontouchstart = (event: TouchEvent) => this.ontouchstart(event)
    window.ontouchend = (event: TouchEvent) => this.ontouchend(event)
    window.oncontextmenu = () => {}
  }

  onkeydown (event: KeyboardEvent): void {
    this.keyboard.set(event.code, true)
  }

  onkeyup (event: KeyboardEvent): void {
    this.keyboard.set(event.code, false)
  }

  isKeyDown (key: string): boolean {
    return this.keyboard.get(key) ?? false
  }

  onwheel (event: WheelEvent): void {
    // this.renderer.camera.adjustZoom(-0.01 * event.deltaY)
    // console.log('zoom', this.renderer.camera.zoom)
  }

  onmousemove (event: MouseEvent): void {
    const scale = this.renderer.mainCanvas.width * this.renderer.camera.scale
    this.mousePosition.x = (event.clientX - 0.5 * window.innerWidth) / scale
    this.mousePosition.y = (0.5 * window.innerHeight - event.clientY) / scale
  }

  onmousedown (event: MouseEvent): void {
    this.mouseButtons.set(event.button, true)
    const scale = this.renderer.mainCanvas.width * this.renderer.camera.scale
    this.mousePosition.x = (event.clientX - 0.5 * window.innerWidth) / scale
    this.mousePosition.y = (0.5 * window.innerHeight - event.clientY) / scale
    this.socket.emit('mouseDown', this.mousePosition)
  }

  onmouseup (event: MouseEvent): void {
    this.mouseButtons.set(event.button, false)
  }

  ontouchmove (event: TouchEvent): void {
    const scale = this.renderer.mainCanvas.width * this.renderer.camera.scale
    this.mousePosition.x = (event.touches[0].clientX - 0.5 * window.innerWidth) / scale
    this.mousePosition.y = (0.5 * window.innerHeight - event.touches[0].clientY) / scale
  }

  ontouchstart (event: TouchEvent): void {
    this.mouseButtons.set(0, true)
    const scale = this.renderer.mainCanvas.width * this.renderer.camera.scale
    this.mousePosition.x = (event.touches[0].clientX - 0.5 * window.innerWidth) / scale
    this.mousePosition.y = (0.5 * window.innerHeight - event.touches[0].clientY) / scale
    this.socket.emit('mouseDown', this.mousePosition)
  }

  ontouchend (event: TouchEvent): void {
    this.mouseButtons.set(0, false)
  }

  isMouseButtonDown (button: number): boolean {
    return this.mouseButtons.get(button) ?? false
  }
}
