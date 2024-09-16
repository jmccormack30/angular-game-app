import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Player } from '../entities/player';
import { Subscription } from 'rxjs';
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
import { GameStateService } from '../service/gamestateservice';

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
  public static width: number = 1300;
  public static height: number = 950;

  private width: number = GameComponent.width;
  private height: number = GameComponent.height;

  private cols = 26;
  private rows = 19;
  private cell_size = 50;
  private grassTile = new Grass();
  private grid = Array.from({ length: 26 }, () => Array(19).fill(this.grassTile));

  public canvasXPos = 0;
  public canvasYPos = 0

  // MAP
  public static mapPixelWidth = 2600;
  public static mapPixelHeight = 1900;

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
  public isHotBarOnTop = false;

  @ViewChild('inventoryComponent') inventoryComponent!: InventoryComponent;
  @ViewChild('hotbarComponent') hotbarComponent!: HotbarComponent;
  player: Player | undefined;

  private enterSubscriber: Subscription = new Subscription;
  private escapeSubscriber: Subscription = new Subscription;

  constructor(
    private playerFactory: PlayerFactoryService,
    private keyService: KeyService,
    private inventoryService: InventoryService,
    private gameStateService: GameStateService
  )
  {}

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
    this.gameStateService.canvasXPos.subscribe(value => {
      this.canvasXPos = value;
    });
    this.gameStateService.canvasYPos.subscribe(value => {
      this.canvasYPos = value;
    });

    for (let col = 1; col < 25; col++) {
      for (let row = 1; row < 9; row++) {
        const wheat = new WheatTile(this.inventoryService, this.gameStateService);
        this.map[col][row] = wheat;
      }
    }

    const rock1 = new Rock(this.gameStateService);
    const rock2 = new Rock(this.gameStateService);
    const rock3 = new Rock(this.gameStateService);
    const rock4 = new Rock(this.gameStateService);
    const rock5 = new Rock(this.gameStateService);
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

    // #1 - Determine the position of the map / player
    if (this.player) {
      if (!this.inventoryComponent.isInventoryOpen) {
        // Update player position based on keyboard input
        this.player.update();
        if (this.player.action === null) {
          this.updatePlayerPosition();
        }

        // Handle tile collisions with the player
        // This will handle updating the player position if necessary based on collisions too
        const result = this.getPlayerSurroundingTiles(this.player.xPos, this.player.yPos);
        if (result) {
          const {startCol1, startRow1, width1, height1} = result;
          this.handleTileCollision(startCol1, startRow1, width1, height1);
        }
      }
    }

    // #2 - Update the map tiles
    this.updateMapTiles();

    // #3 - Draw the map tiles
    const {startCol2, startRow2, width2, height2 } = this.getVisibleTiles(this.canvasXPos, this.canvasYPos);
    this.drawTiles(startCol2, startRow2, width2, height2, true);

    // #4 - Finally, draw the player
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

  getPlayerSurroundingTiles(playerX: number, playerY: number): { startCol1: number, startRow1: number, width1: number, height1: number } | undefined {
    const playerTotalX = this.canvasXPos + playerX;
    const playerEndX = playerTotalX + 48;

    const playerTotalY = this.canvasYPos + playerY;
    const playerEndY = playerTotalY + 96;

    const startCol1 = Math.floor(playerTotalX / this.cell_size);
    let endCol = Math.floor(playerEndX / this.cell_size);

    const startRow1 = Math.floor(playerTotalY / this.cell_size);
    let endRow = Math.floor(playerEndY / this.cell_size);

    if (endCol >= this.map_cell_width) endCol = this.map_cell_width - 1;
    if (endRow >= this.map_cell_height) endRow = this.map_cell_height - 1;

    const width1 = endCol - startCol1 + 1;
    const height1 = endRow - startRow1 + 1;

    return { startCol1, startRow1, width1, height1 };
  }

  getVisibleTiles(canvasX: number, canvasY: number): { startCol2: number, startRow2: number, width2: number, height2: number } {
    // Calculate the positions for the right and bottom edges of the visible area
    const rightSideXPos = canvasX + this.width;
    const bottomSideYPos = canvasY + this.height;

    // Calculate the starting and ending column and row indices based on tile size
    const startCol2 = Math.floor(canvasX / this.cell_size);
    let endCol = Math.floor(rightSideXPos / this.cell_size);
    const startRow2 = Math.floor(canvasY / this.cell_size);
    let endRow = Math.floor(bottomSideYPos / this.cell_size);

    if (endCol >= this.map_cell_width) endCol = this.map_cell_width - 1;
    if (endRow >= this.map_cell_height) endRow = this.map_cell_height - 1;

    // Calculate width and height in terms of number of tiles
    const width2 = endCol - startCol2 + 1;
    const height2 = endRow - startRow2 + 1;

    return { startCol2, startRow2, width2, height2 };
  }

  getXPos(startCol: number) {
    const mapXPos = startCol * this.cell_size;
    if (mapXPos < this.canvasXPos) {
      return mapXPos - this.canvasXPos;
    }
    else {
      return 0;
    }
  }

  getYPos(startRow: number) {
    const mapYPos = startRow * this.cell_size;
    if (mapYPos < this.canvasYPos) {
      return mapYPos - this.canvasYPos;
    }
    else {
      return 0;
    }
  }

  updateMapTiles(): void {
    for (let col = 0; col < this.map_cell_width; col++) {
      const tileX = col * 50;
      for (let row = 0; row < this.map_cell_height; row++) {
        const tileY = row * 50;
        const tile = this.map[col][row];
        if (tile) {
          if (this.player) {
            const playerMapY = this.canvasYPos + this.player?.yPos;
            const playerMapX = this.canvasXPos + this.player?.xPos;
            if (playerMapY >= 0 && playerMapX >= 0) {
              tile.update(tileX, tileY, playerMapX, playerMapY)
            }
          }
        }
      }
    }
  }

  handleTileCollision(startCol: number, startRow: number, width: number, height: number) {
    // console.log("startCol: " + startCol + ", startRow: " + startRow + ", width: " + width + ", height: " + height);
    for (let col = startCol; col < startCol + width; col++) {
      const tileX = col * 50;
      for (let row = startRow; row < startRow + height; row++) {
        const tileY = row * 50;
        const tile = this.map[col][row];
        if (tile) {
          if (this.player) {
            tile.handlePlayerCollision(tileX, tileY, this.player)
          }
        }
      }
    }
  }

  drawTiles(startCol: number, startRow: number, width: number, height: number, drawGridlines: boolean) {
    const xPosOriginal = this.getXPos(startCol);
    const yPosOriginal = this.getYPos(startRow);

    let xPos = xPosOriginal;
    let yPos = yPosOriginal;

    this.ctx.strokeStyle = 'black';

    for (let col = startCol; col < startCol + width; col++) {
      yPos = yPosOriginal;
      for (let row = startRow; row < startRow + height; row++) {
          const tile = this.map[col][row];
          if (tile) {
            tile.draw(this.ctx, xPos, yPos);
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
      let xAdjustment = 0;
      let yAdjustment = 0;

      if (input === 'up') {
        yAdjustment = this.player.speed * -1;
      }
      else if (input === 'down') {
        yAdjustment = this.player.speed;
      }
      else if (input === 'left') {
        xAdjustment = this.player.speed * -1;
      }
      else if (input === 'right') {
        xAdjustment = this.player.speed;
      }

      this.gameStateService.updateMapPositionForPlayer(xAdjustment, yAdjustment, this.player);
    }
    // if (this.player) {
    //   const input = this.keyService.getPlayerDirection();
    //   if (input === "up") {
    //     if (this.canvasYPos === 0 || this.player.yPos > 443) {
    //       this.player.updatePlayerPosition('up');
    //     }
    //     else {
    //       this.gameStateService.updateCanvasYPos(this.canvasYPos -= this.player.speed);
    //       //this.canvasYPos -= this.player.speed;
    //     }
    //     if (this.canvasYPos < 0) {
    //       this.gameStateService.updateCanvasYPos(0);
    //       //this.canvasYPos = 0;
    //     }
    //   }
    //   else if (input === "down") {
    //     if (this.canvasYPos >= this.map_pixel_height - this.height || this.player.yPos < 443) {
    //       this.player.updatePlayerPosition('down');
    //     }
    //     else {
    //       this.gameStateService.updateCanvasYPos(this.canvasYPos + this.player.speed);
    //       //this.canvasYPos += this.player.speed;
    //     }
    //     if (this.canvasYPos > this.map_pixel_height - this.height) {
    //       this.gameStateService.updateCanvasYPos(this.map_pixel_height - this.height);
    //       // this.canvasYPos = this.map_pixel_height - this.height;
    //     }
    //   }
    //   else if (input === 'left') {
    //     if (this.canvasXPos === 0 || this.player.xPos > 625) {
    //       this.player.updatePlayerPosition('left');
    //     }
    //     else {
    //       this.gameStateService.updateCanvasXPos(this.canvasXPos - this.player.speed);
    //       //this.canvasXPos -= this.player.speed;
    //     }
    //     if (this.canvasXPos < 0) {
    //       this.gameStateService.updateCanvasXPos(0);
    //       //this.canvasXPos = 0;
    //     }
    //   }
    //   else if (input === 'right') {
    //     if (this.canvasXPos >= this.map_pixel_width - this.width || this.player.xPos < 625) {
    //       this.player.updatePlayerPosition('right');
    //     }
    //     else {
    //       this.gameStateService.updateCanvasXPos(this.canvasXPos + this.player.speed);
    //       //this.canvasXPos += this.player.speed;
    //     }
    //     if (this.canvasXPos > this.map_pixel_width - this.width) {
    //       this.gameStateService.updateCanvasXPos(this.map_pixel_width - this.width);
    //       //this.canvasXPos = this.map_pixel_width - this.width;
    //     }
    //   }
    // }
  }
}