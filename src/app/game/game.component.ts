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
  static height: number = 975;

  private width: number = GameComponent.width;
  private height: number = GameComponent.height;

  private fps: number = 60;
  private frameInterval: number = 1000 / this.fps; // Interval in milliseconds
  private lastUpdateTime: number = 0;
  private isRunning: boolean = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private timerId: any;

  public isInventoryReady = false;
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

    const canvas = this.gameCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.player = this.playerFactory.createPlayer(625, 457, 6, "down");

    ImageService.preloadImages().subscribe(() => {
      this.isInventoryReady = true;
      this.startGameLoop();
    });
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