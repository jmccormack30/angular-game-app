import { Injectable } from '@angular/core';
import { Player } from './player';
import { KeyService } from '../service/keyservice';
import { InventoryService } from '../service/inventoryservice';
import { GameStateService } from '../service/gamestateservice';

@Injectable({
  providedIn: 'root'
})
export class PlayerFactoryService {
  constructor(private keyService: KeyService, private inventoryService: InventoryService, private gameStateService: GameStateService) {}

  createPlayer(xPos: number, yPos: number, speed: number, direction: string): Player {
    return new Player(xPos, yPos, speed, direction, this.keyService, this.inventoryService, this.gameStateService);
  }
}