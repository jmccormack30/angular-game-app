import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Player } from '../entities/player';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators'
import { InventoryComponent } from '../inventory/inventory.component';
import { PlayerFactoryService } from '../entities/playerfactory';
import { KeyService } from '../service/keyservice';
import { Grass } from '../entities/grass';
import { ImageService } from '../service/imageservice';
import { HotbarComponent } from '../hotbar/hotbar.component';
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

  private fps: number = 60;
  private frameInterval: number = 1000 / this.fps; // Interval in milliseconds
  private lastUpdateTime: number = 0;
  private isRunning: boolean = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private timerId: any;
  public isHotBarOnTop = false;

  @ViewChild('inventoryComponent') inventoryComponent!: InventoryComponent;
  @ViewChild('hotbarComponent') hotbarComponent!: HotbarComponent;
  private player: Player;

  private enterSubscriber: Subscription = new Subscription;
  private escapeSubscriber: Subscription = new Subscription;

  constructor(
    private playerFactory: PlayerFactoryService,
    private keyService: KeyService,
    private gameStateService: GameStateService
  )
  {
    this.player = this.playerFactory.createPlayer(625, 457, 6, "down");
  }

  ngAfterViewInit(): void {
    this.enterSubscriber = this.keyService.enterKey$.pipe(debounceTime(250)).subscribe(() => {
      this.inventoryComponent.toggleInventory();
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

    this.gameStateService.initializeGameMap();

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
      if (!this.inventoryComponent.isInventoryOpen) {
        // Update player position based on keyboard input
        this.player.update();
        if (this.player.action === null) {
          this.updatePlayerPosition();
        }

        // Handle tile collisions with the player
        // This will handle updating the player position if necessary based on collisions too
        const result = this.getPlayerSurroundingTiles(this.player.x, this.player.y);
        if (result) {
          const {startCol1, startRow1, width1, height1} = result;
          this.handleTileCollision(startCol1, startRow1, width1, height1);
        }
      }

    // #2 - Update the map tiles
    this.updateMapTiles();

    // #3 - Draw the map tiles
    const {startCol2, startRow2, width2, height2 } = this.getVisibleTiles(this.canvasXPos, this.canvasYPos);
    this.drawTiles(startCol2, startRow2, width2, height2, true);
    this.drawPlayerActionTile();

    // #4 - Finally, draw the player
    if (this.player) {
      // if the player is on the bottom of the screen, hotbar goes to the top
      this.isHotBarOnTop = this.player.y >= 575;
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

    if (endCol >= this.gameStateService.map_cell_width) endCol = this.gameStateService.map_cell_width - 1;
    if (endRow >= this.gameStateService.map_cell_height) endRow = this.gameStateService.map_cell_height - 1;

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

    if (endCol >= this.gameStateService.map_cell_width) endCol = this.gameStateService.map_cell_width - 1;
    if (endRow >= this.gameStateService.map_cell_height) endRow = this.gameStateService.map_cell_height - 1;

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
    for (let col = 0; col < this.gameStateService.map_cell_width; col++) {
      const tileX = col * 50;
      for (let row = 0; row < this.gameStateService.map_cell_height; row++) {
        const tileY = row * 50;
        const tile = this.gameStateService.map[col][row];
        if (tile) {
          const playerMapY = this.canvasYPos + this.player.y;
          const playerMapX = this.canvasXPos + this.player.x;
          if (playerMapY >= 0 && playerMapX >= 0) {
            tile.update(tileX, tileY, playerMapX, playerMapY)
          }
        }
      }
    }
  }

  handleTileCollision(startCol: number, startRow: number, width: number, height: number) {
    for (let col = startCol; col < startCol + width; col++) {
      const tileX = col * 50;
      for (let row = startRow; row < startRow + height; row++) {
        const tileY = row * 50;
        const tile = this.gameStateService.map[col][row];
        if (tile) {
          if (this.player) {
            tile.handlePlayerCollision(tileX, tileY, this.player)
          }
        }
      }
    }
  }

  drawPlayerActionTile() {
    if (this.player) {
      const {col, row} = this.player.getPickAxeTile();
      this.ctx.strokeStyle = 'red';
      const x = (col * 50) - this.canvasXPos;
      const y = (row * 50) - this.canvasYPos;
      this.ctx.strokeRect(x, y, this.cell_size, this.cell_size);
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
          const tile = this.gameStateService.map[col][row];
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
  }
}