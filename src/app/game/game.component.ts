import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Player } from '../entities/player';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators'
import { InventoryComponent } from '../inventory/inventory.component';
import { PlayerFactoryService } from '../entities/playerfactory';
import { KeyService } from '../service/keyservice';
import { WheatTile } from '../entities/wheat_tile';
import { Grass } from '../entities/grass';
import { ImageService } from '../service/imageservice';
import { HotbarComponent } from '../hotbar/hotbar.component';
import { Rock } from '../entities/rock';
import { InventoryService } from '../service/inventoryservice';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent implements AfterViewInit, OnDestroy {
  ImageService = ImageService;
  @ViewChild('gameCanvas') gameCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  // CANVAS
  static width: number = 1300;
  static height: number = 950;

  private width: number = GameComponent.width;
  private height: number = GameComponent.height;

  private cols = 26;
  private rows = 19;
  private cell_size = 50;
  private grassTile = new Grass();
  private grid = Array.from({ length: 26 }, () => Array(19).fill(this.grassTile));

  public canvas_xPos = 0;
  public canvas_yPos = 0
  //public canvas_yPos = 950;

  // MAP
  private map_pixel_width = 2600;
  private map_pixel_height = 1900;

  private map_cell_width = 52;
  private map_cell_height = 38

  // [col][row]
  private map = new Array(this.map_cell_width).fill(this.grassTile).map(() => new Array(this.map_cell_height).fill(this.grassTile));

  private fps: number = 60;
  private frameInterval: number = 1000 / this.fps; // Interval in milliseconds
  private lastUpdateTime: number = 0;
  private isRunning: boolean = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private timerId: any;

  private enterKeySubject = new Subject<void>();

  public isHotBarOnTop = false;

  @ViewChild('inventoryComponent') inventoryComponent!: InventoryComponent;
  @ViewChild('hotbarComponent') hotbarComponent!: HotbarComponent;
  player: Player | undefined;

  private enterSubscriber: Subscription = new Subscription;
  private escapeSubscriber: Subscription = new Subscription;

  constructor(private playerFactory: PlayerFactoryService, private keyService: KeyService, private inventoryService: InventoryService) {}

  ngAfterViewInit(): void {
    this.enterSubscriber = this.keyService.enterKey$.pipe(debounceTime(250)).subscribe(() => {
      console.log("enter pressed to open inv in game comp!");
      this.inventoryComponent.toggleInventory();
      // if inventory is open, hot bar disabled - if inventory closed, hot bar is enabled
      this.hotbarComponent.enabled = !this.inventoryComponent.isInventoryOpen;
    });
    this.escapeSubscriber = this.keyService.escapeKey$.pipe(debounceTime(250)).subscribe(() => {
      this.inventoryComponent.closeInventory();
      this.hotbarComponent.enabled = true;
    });

    for (let col = 1; col < 25; col++) {
      for (let row = 1; row < 9; row++) {
        const wheat = new WheatTile(this.inventoryService);
        this.map[col][row] = wheat;
      }
    }

    const rock1 = new Rock();
    const rock2 = new Rock();
    const rock3 = new Rock();
    const rock4 = new Rock();
    const rock5 = new Rock();
    this.map[3][12] = rock1;
    this.map[3][11] = rock2;
    this.map[3][10] = rock3;
    this.map[2][11] = rock4;
    this.map[4][11] = rock5;

    const canvas = this.gameCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.player = this.playerFactory.createPlayer(625, 457, 6, "down");

    this.startGameLoop();
  }

  ngOnDestroy(): void {
    this.enterSubscriber.unsubscribe();
    this.escapeSubscriber.unsubscribe();
    this.stopGameLoop();
  }

  startGameLoop() {
    this.isRunning = true;
    this.lastUpdateTime = performance.now();
    requestAnimationFrame(() => this.gameLoop());
  }

  stopGameLoop() {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
  }

  gameLoop() {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const elapsedTime = currentTime - this.lastUpdateTime;

    if (elapsedTime >= this.frameInterval) {
      this.update();
      this.lastUpdateTime = currentTime - (elapsedTime % this.frameInterval);
    }

    requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    if (this.inventoryComponent.isInventoryOpen) {
      return;
    }

    if (this.player) {
      if (!this.inventoryComponent.isInventoryOpen) {
        this.player.update();
        this.updatePlayerPosition();
      }
    }

    const {startCol, startRow, width, height } = this.getVisibleTiles(this.canvas_xPos, this.canvas_yPos);
    this.drawTiles(startCol, startRow, width, height, true);

    if (this.player) {
      // if the player is on the bottom of the screen, hotbar goes to the top
      this.isHotBarOnTop = this.player.yPos >= 575;
      this.player.draw(this.ctx);
    }
  }
  
  onOverlayClick() {
    this.inventoryComponent.removeFloatingItem();
    this.inventoryComponent.returnItemToCell();
  }

  getVisibleTiles(canvasX: number, canvasY: number): { startCol: number, startRow: number, width: number, height: number } {
    // Calculate the positions for the right and bottom edges of the visible area
    const rightSideXPos = canvasX + this.width;
    const bottomSideYPos = canvasY + this.height;

    // Calculate the starting and ending column and row indices based on tile size
    const startCol = Math.floor(canvasX / this.cell_size);
    let endCol = Math.floor(rightSideXPos / this.cell_size);
    const startRow = Math.floor(canvasY / this.cell_size);
    let endRow = Math.floor(bottomSideYPos / this.cell_size);

    if (endCol >= this.map_cell_width) endCol = this.map_cell_width - 1;
    if (endRow >= this.map_cell_height) endRow = this.map_cell_height - 1;

    // Calculate width and height in terms of number of tiles
    const width = endCol - startCol + 1;
    const height = endRow - startRow + 1;

    return { startCol, startRow, width, height };
  }

  getXPos(startCol: number) {
    const mapXPos = startCol * this.cell_size;
    if (mapXPos < this.canvas_xPos) {
      return mapXPos - this.canvas_xPos;
    }
    else {
      return 0;
    }
  }

  getYPos(startRow: number) {
    const mapYPos = startRow * this.cell_size;
    if (mapYPos < this.canvas_yPos) {
      return mapYPos - this.canvas_yPos;
    }
    else {
      return 0;
    }
  }

  drawTiles(startCol: number, startRow: number, width: number, height: number, drawGridlines: boolean) {
    const xPosOriginal = this.getXPos(startCol);
    const yPosOriginal = this.getYPos(startRow);

    let xPos = xPosOriginal;
    let yPos = yPosOriginal;

    this.ctx.strokeStyle = 'black';

    for (let col = startCol; col < startCol + width; col++) {
      const tileX = col * 50;
      yPos = yPosOriginal;
      for (let row = startRow; row < startRow + height; row++) {
          const tileY = row * 50;
          const tile = this.map[col][row];
          if (tile) {
            tile.draw(this.ctx, xPos, yPos);
            if (this.player) {
              const playerMapY = this.canvas_yPos + this.player?.yPos;
              const playerMapX = this.canvas_xPos + this.player?.xPos;
              if (playerMapY >= 0 && playerMapX >= 0) {
                tile.handlePlayerCollision(tileX, tileY, playerMapX, playerMapY)
              }
            }
          }
          if (drawGridlines) {
            this.ctx.strokeRect(xPos, yPos, this.cell_size, this.cell_size);
          }
          yPos += 50;
      }
      xPos += 50;
    }
  }

  updatePlayerPosition() {
    if (this.player) {
      const input = this.keyService.getPlayerDirection();
      if (input === "up") {
        if (this.canvas_yPos === 0 || this.player.yPos > 443) {
          this.player.updatePlayerPosition('up');
        }
        else {
          this.canvas_yPos -= this.player.speed;
        }
        if (this.canvas_yPos < 0) {
          this.canvas_yPos = 0;
        }
      }
      else if (input === "down") {
        if (this.canvas_yPos >= this.map_pixel_height - this.height || this.player.yPos < 443) {
          this.player.updatePlayerPosition('down');
        }
        else {
          this.canvas_yPos += this.player.speed;
        }
        if (this.canvas_yPos > this.map_pixel_height - this.height) {
          this.canvas_yPos = this.map_pixel_height - this.height;
        }
      }
      else if (input === 'left') {
        if (this.canvas_xPos === 0 || this.player.xPos > 625) {
          this.player.updatePlayerPosition('left');
        }
        else {
          this.canvas_xPos -= this.player.speed;
        }
        if (this.canvas_xPos < 0) {
          this.canvas_xPos = 0;
        }
      }
      else if (input === 'right') {
        if (this.canvas_xPos >= this.map_pixel_width - this.width || this.player.xPos < 625) {
          this.player.updatePlayerPosition('right');
        }
        else {
          this.canvas_xPos += this.player.speed;
        }
        if (this.canvas_xPos > this.map_pixel_width - this.width) {
          this.canvas_xPos = this.map_pixel_width - this.width;
        }
      }
    }
  }
}