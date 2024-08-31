import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { Player } from '../entities/player';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators'
import { InventoryComponent } from '../inventory/inventory.component';
import { ImageService } from '../imageservice';
import { PlayerFactoryService } from '../entities/playerfactory';

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

  private keyState: { [key: string]: boolean } = {};
  private enterKeySubject = new Subject<void>();

  @ViewChild('inventoryComponent') inventoryComponent!: InventoryComponent;
  isInventoryOpen = false;
  player: Player | undefined;
  private imageCache: { [key: string]: HTMLImageElement } = {};

  constructor(private imageService: ImageService, private playerFactory: PlayerFactoryService) {}

  ngAfterViewInit(): void {
    console.log("game component init");
    this.enterKeySubject.pipe(debounceTime(250)).subscribe(() => {
      this.inventoryComponent.toggleInventory();
    });

    const canvas = this.gameCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.player = this.playerFactory.createPlayer(625, 457, 6, "down");

    ImageService.preloadImages().subscribe(() => {
      this.isInventoryReady = true;
      this.startGameLoop();
    });
    console.log("game component end");
  }

  ngOnDestroy(): void {
    this.stopGameLoop();
  }

  // preloadImages(): Observable<void[]> {
  //   const imageSources = [
  //     'assets/watermelon.png',
  //     'assets/fence_vertical.png',
  //     'assets/grass_2.jpg',
  //     'assets/wheat_grass.png',
  //     'assets/wheat_dirt.png',
  //     'assets/fence_dirt_grass_1.png',
  //     'assets/fence_dirt_grass_2.png'
  //   ]

  //   const promises = imageSources.map(src => this.loadImage(src));
  //   return Promise.all(promises);
  // }

  // private loadImage(src: string): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     const img = new Image();
  //     img.onload = () => {
  //       this.imageCache[src] = img;
  //       resolve();
  //     };
  //     img.onerror = reject;
  //     img.src = src;
  //   });
  // }

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
      this.player.update(this.keyState);
      this.player.draw(this.ctx);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    this.keyState[event.key] = true;
    if (event.key === 'Enter') {
      this.enterKeySubject.next();
    }
    if (event.key === 'Escape') {
      if (this.inventoryComponent.isInventoryOpen) {
        this.enterKeySubject.next();
      }
    }
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    this.keyState[event.key] = false;
  }

  isKeyPressed(key: string): boolean {
    return !!this.keyState[key];
  }

  getImage(src: string): HTMLImageElement | undefined {
    return this.imageCache[src];
  }
  
  onOverlayClick() {
    console.log("Game Overlay Clicked!");
    this.inventoryComponent.removeFloatingItem();
    this.inventoryComponent.returnItemToCell();
  }
}
