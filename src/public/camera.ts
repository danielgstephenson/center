import { Vec2 } from 'planck'
import { clamp } from '../math'

export class Camera {
  position = Vec2(0, 0)
  zoom = -2
  maxZoom = 15
  minZoom = -15

  adjustZoom (change: number): void {
    this.zoom = clamp(this.minZoom, this.maxZoom, this.zoom + change)
  }
}
