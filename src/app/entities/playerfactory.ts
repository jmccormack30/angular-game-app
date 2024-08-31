import { Injectable } from '@angular/core';
import { Player } from './player';
import { ImageService } from '../imageservice';

@Injectable({
  providedIn: 'root'
})
export class PlayerFactoryService {
  constructor(private imageService: ImageService) {}

  createPlayer(xPos: number, yPos: number, speed: number, direction: string): Player {
    // Inject ImageService automatically while creating Player instances
    return new Player(this.imageService, xPos, yPos, speed, direction);
  }
}