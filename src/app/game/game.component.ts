import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Player } from '../entities/player';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators'
import { InventoryComponent } from '../inventory/inventory.component';
import { ImageService } from '../imageservice';
import { PlayerFactoryService } from '../entities/playerfactory';
import { KeyService } from '../keyservice';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') gameCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  
  static width: number = 1300;
  static height: number = 950;

  private cols = 26;
  private rows = 19;
  private cell_size = 50;
  private grid = Array.from({ length: 26 }, () => Array(19).fill(null));

  private width: number = GameComponent.width;
  private height: number = GameComponent.height;

  private fps: number = 60;
  private frameInterval: number = 1000 / this.fps; // Interval in milliseconds
  private lastUpdateTime: number = 0;
  private isRunning: boolean = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private timerId: any;

  private enterKeySubject = new Subject<void>();

  @ViewChild('inventoryComponent') inventoryComponent!: InventoryComponent;
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

    this.grid[15][7] = 'wheat';
    this.grid[15][8] = 'wheat';
    this.grid[15][9] = 'wheat';
    this.grid[15][10] = 'wheat';
    this.grid[15][11] = 'wheat';
    this.grid[15][12] = 'wheat';
    this.grid[16][7] = 'wheat';
    this.grid[16][8] = 'wheat';
    this.grid[16][9] = 'wheat';
    this.grid[16][10] = 'wheat';
    this.grid[16][11] = 'wheat';
    this.grid[16][12] = 'wheat';
    this.grid[17][7] = 'wheat';
    this.grid[17][8] = 'wheat';
    this.grid[17][9] = 'wheat';
    this.grid[17][10] = 'wheat';
    this.grid[17][11] = 'wheat';
    this.grid[17][12] = 'wheat';
    this.grid[18][7] = 'wheat';
    this.grid[18][8] = 'wheat';
    this.grid[18][9] = 'wheat';
    this.grid[18][10] = 'wheat';  
    this.grid[18][11] = 'wheat';
    this.grid[18][12] = 'wheat';
    this.grid[19][7] = 'wheat';
    this.grid[19][8] = 'wheat';
    this.grid[19][9] = 'wheat';
    this.grid[19][10] = 'wheat';
    this.grid[19][11] = 'wheat';
    this.grid[19][12] = 'wheat';
    this.grid[20][7] = 'wheat';
    this.grid[20][8] = 'wheat';
    this.grid[20][9] = 'wheat';
    this.grid[20][10] = 'wheat';
    this.grid[20][11] = 'wheat';
    this.grid[20][12] = 'wheat';
    this.grid[21][7] = 'wheat';
    this.grid[21][8] = 'wheat';
    this.grid[21][9] = 'wheat';
    this.grid[21][10] = 'wheat';
    this.grid[21][11] = 'wheat';
    this.grid[21][12] = 'wheat';

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
    if (this.inventoryComponent.isInventoryOpen) {
      return;
    }
    this.ctx.clearRect(0, 0, this.width, this.height);
    const grass = ImageService.getImage('assets/grass_2.jpg');
    if (grass) {
      const pattern = this.ctx.createPattern(grass, 'repeat');
      if (pattern) {
        this.ctx.fillStyle = pattern;
        this.ctx.fillRect(0, 0, this.width, this.height);
      }
    }

    // Draw the grid lines
    this.ctx.strokeStyle = 'black'; // Set line color for grid outlines

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const x = col * this.cell_size;
        const y = row * this.cell_size;
        this.ctx.strokeRect(x, y, this.cell_size, this.cell_size);  // Draw the outline of each cell
      } 
    }

    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row < this.rows; row++) {
        const cell = this.grid[col][row];
        if (cell !== null && cell === 'wheat') {
          const wheat = ImageService.getImage('assets/wheat_dirt.png');
          if (wheat) {
            this.ctx.drawImage(wheat, col * 50, row * 50  );
          }
        }
      }
    }

    if (this.player !== undefined) {
      this.player.update();
      this.player.draw(this.ctx);
    }
  }
  
  onOverlayClick() {
    this.inventoryComponent.removeFloatingItem();
    this.inventoryComponent.returnItemToCell();
  }
}