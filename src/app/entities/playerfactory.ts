import { Injectable } from '@angular/core';
import { Player } from './player';

@Injectable({
  providedIn: 'root'
})
export class PlayerFactoryService {
  constructor() {}

  createPlayer(xPos: number, yPos: number, speed: number, direction: string): Player {
    return new Player(xPos, yPos, speed, direction);
  }
}