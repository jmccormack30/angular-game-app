import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Player } from "../entities/player";
import { GameComponent } from "../game/game.component";
import { Grass } from "../entities/grass";
import { WheatTile } from "../entities/wheat_tile";
import { InventoryService } from "./inventoryservice";
import { Rock } from "../entities/rock";

@Injectable({ providedIn: 'root'})
export class GameStateService {
  public map_cell_width = 52;
  public map_cell_height = 38

  public map: any;

  private canvasXPosSource = new BehaviorSubject<number>(0);
  private canvasYPosSource = new BehaviorSubject<number>(0);

  canvasXPos = this.canvasXPosSource.asObservable();
  canvasYPos = this.canvasYPosSource.asObservable();

  constructor(private inventoryService: InventoryService) {}

  initializeGameMap() {
    const grassTile = new Grass();
    this.map = new Array(this.map_cell_width).fill(null).map(() => new Array(this.map_cell_height).fill(grassTile));

    for (let col = 1; col < 25; col++) {
      for (let row = 1; row < 9; row++) {
        const wheat = new WheatTile(this.inventoryService, this);
        this.map[col][row] = wheat;
      }
    }
  
    const rock1 = new Rock(this);
    const rock2 = new Rock(this);
    const rock3 = new Rock(this);
    const rock4 = new Rock(this);
    const rock5 = new Rock(this);
    this.map[3][12] = rock1;
    this.map[3][11] = rock2;
    this.map[3][10] = rock3;
    this.map[2][11] = rock4;
    this.map[4][11] = rock5;
  }

  getCanvasXPos() {
    return this.canvasXPosSource.getValue();
  }

  getCanvasYPos() {
    return this.canvasYPosSource.getValue();
  }

  updateCanvasXPos(value: number) {
    this.canvasXPosSource.next(value);
  }

  updateCanvasYPos(value: number) {
    this.canvasYPosSource.next(value);
  }

  updateMapPositionForPlayer(xAdjustment: number, yAdjustment: number, player: Player) {
    if (player) {
      const canvasXPos = this.canvasXPosSource.getValue();
      const canvasYPos = this.canvasYPosSource.getValue();

      if (yAdjustment < 0) {
        if (canvasYPos === 0 || player.y > 433) {
          player.updatePlayerPosition('up');
        }
        else {
          const newYPos = Math.max((canvasYPos - player.speed), 0);
          this.updateCanvasYPos(newYPos);
        }
      }
      else if (yAdjustment > 0) {
        if (canvasYPos >= GameComponent.mapPixelHeight - GameComponent.height || player.y < 443) {
          player.updatePlayerPosition('down');
        }
        else {
          const newYPos = Math.min((canvasYPos + player.speed), (GameComponent.mapPixelHeight - GameComponent.height));
          this.updateCanvasYPos(newYPos);
        }
      }

      if (xAdjustment < 0) {
        if (canvasXPos === 0 || player.x > 625) {
          player.updatePlayerPosition('left');
        }
        else {
          const newXPos = Math.max((canvasXPos - player.speed), 0);
          this.updateCanvasXPos(newXPos);
        }
      }
      else if (xAdjustment > 0) {
        if (canvasXPos >= GameComponent.mapPixelWidth - GameComponent.width || player.x < 625) {
          player.updatePlayerPosition('right');
        }
        else {
          const newXPos = Math.min((canvasXPos + player.speed), (GameComponent.mapPixelWidth - GameComponent.width));
          this.updateCanvasXPos(newXPos);
        }
      }
    }
  }
}