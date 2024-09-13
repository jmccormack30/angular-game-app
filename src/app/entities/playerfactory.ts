import { Injectable } from '@angular/core';
import { Player } from './player';
import { KeyService } from '../service/keyservice';

@Injectable({
  providedIn: 'root'
})
export class PlayerFactoryService {
  constructor(private keyService: KeyService) {}

  createPlayer(xPos: number, yPos: number, speed: number, direction: string): Player {
    return new Player(xPos, yPos, speed, direction, this.keyService);
  }
}