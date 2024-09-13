import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Player } from '../entities/player';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators'
import { InventoryComponent } from '../inventory/inventory.component';
import { PlayerFactoryService } from '../entities/playerfactory';
import { KeyService } from '../service/keyservice';
import { WheatTile } from '../entities/wheat_tile';
import { Grass } from '../entities/grass';
import { ImageService } from '../service/imageservice';
import { HotbarComponent } from '../hotbar/hotbar.component';

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

  @ViewChild('inventoryComponent') inventoryComponent!: InventoryComponent;
  @ViewChild('hotbarComponent') hotbarComponent!: HotbarComponent;
  isInventoryOpen = false;
  player: Player | undefined;

  constructor(private playerFactory: PlayerFactoryService) {}

  ngAfterViewInit(): void {
    KeyService.enterKey$.pipe(debounceTime(250)).subscribe(() => {
      this.inventoryComponent.toggleInventory();
    });
    KeyService.escapeKey$.pipe(debounceTime(250)).subscribe(() => {
      this.inventoryComponent.closeInventory();
    });

    for (let col = 1; col < 25; col++) {
      for (let row = 1; row < 9; row++) {
        const wheat = new WheatTile();
        this.map[col][row] = wheat;
      }
    }

    const canvas = this.gameCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.player = this.playerFactory.createPlayer(625, 457, 6, "down");

    this.startGameLoop();
  }

  ngOnDestroy(): void {
    this.stopGameLoop();
  }

  startGameLoop() {
    this.isRunning = true;
    this.lastUpdateTime = performance.now();
    this.gameLoop();
  }

  stopGameLoop() {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
  }

  toggleInventory() {
    this.isInventoryOpen = !this.isInventoryOpen;
  }

  onInventoryClose() {
    this.isInventoryOpen = false;
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
    // if (this.inventoryComponent.isInventoryOpen) {
    //   return;
    // }
    this.ctx.clearRect(0, 0, this.width, this.height);
    // if (this.player !== undefined) {
    //   this.renderMap(this.player.xPos, this.player.yPos);
    // }
    // const grass = ImageService.getImage('assets/grass_2.jpg');
    // if (grass) {
    //   this.ctx.drawImage(grass, -25, 450);
    //   const pattern = this.ctx.createPattern(grass, 'repeat');
    //   if (pattern) {
    //     this.ctx.fillStyle = pattern;
    //     this.ctx.fillRect(0, 0, this.width, this.height);
    //   }
    // }

    const {startCol, startRow, width, height } = this.getVisibleTiles(this.canvas_xPos, this.canvas_yPos);

    const xPosOriginal = this.getXPos(startCol);
    const yPosOriginal = this.getYPos(startRow);

    let xPos = xPosOriginal;
    let yPos = yPosOriginal;

    // console.log("startCol: " + startCol + ", startRow: " + startRow + ", width: " + width + ", height: " + height);
    // console.log("xPos: " + xPos + ", yPos: " + yPos); 

    this.ctx.strokeStyle = 'black';

    for (let col = startCol; col < startCol + width; col++) {
      yPos = yPosOriginal;
      for (let row = startRow; row < startRow + height; row++) {
          const tile = this.map[col][row];
          if (tile) {
            const image = tile.image;
            if (image) {
              this.ctx.drawImage(image, xPos, yPos);
            }
            if (this.player) {
              const playerMapY = this.canvas_yPos + this.player?.yPos;
              const playerMapX = this.canvas_xPos + this.player?.xPos;
              if (playerMapY && playerMapX) {
                if (tile.isCheckCollision) {
                  if (tile.isPlayerCollision(col * 50, row * 50, playerMapX, playerMapY)) {
                    tile.handlePlayerCollision(this.inventoryComponent);
                  }
                  else {
                    tile.handlePlayerNoCollision();
                  }
                }
              }
            }
          }
          //this.ctx.strokeRect(xPos, yPos, this.cell_size, this.cell_size);
          yPos += 50;
      }
      xPos += 50;
    }

    //Draw the grid lines
    // this.ctx.strokeStyle = 'black'; // Set line color for grid outlines

    // for (let row = 0; row < this.rows; row++) {
    //   for (let col = 0; col < this.cols; col++) {
    //     const x = col * this.cell_size;
    //     const y = row * this.cell_size;
    //     this.ctx.strokeRect(x, y, this.cell_size, this.cell_size);  // Draw the outline of each cell
    //   } 
    // }

    if (this.player !== undefined) {
      if (!this.inventoryComponent.isInventoryOpen) {
        this.player.update();
      }
      this.player.draw(this.ctx);
      if (!this.inventoryComponent.isInventoryOpen) {
        const input = KeyService.getPlayerDirection();
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
}