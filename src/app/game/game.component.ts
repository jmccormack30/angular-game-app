import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { Tile } from '../tile';
import { Player } from '../entities/player';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') gameCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  
  static rows: number = 19;
  static cols: number = 25;
  static tileSize: number = 50;
  tileMap: Tile[][] = [];

  private tileSize: number = GameComponent.tileSize;
  private width: number = GameComponent.tileSize * GameComponent.cols;
  private height: number = GameComponent.tileSize * GameComponent.rows;

  private fps: number = 60;
  private frameInterval: number = 1000 / this.fps; // Interval in milliseconds
  private lastUpdateTime: number = 0;
  private isRunning: boolean = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private timerId: any;

  private keyState: { [key: string]: boolean } = {};
  player: Player | undefined;

  private imageCache: { [key: string]: HTMLImageElement } = {};

  constructor() {}

  ngAfterViewInit(): void {
    const canvas = this.gameCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    this.preloadImages();
    this.initializeTileMap();
    this.player = new Player(600, 450, 12, 9, 1.75, "down");
    this.startGameLoop();
  }

  ngOnDestroy(): void {
    this.stopGameLoop();
  }

  preloadImages(): Promise<void[]> {
    const imageSources = [
      'assets/watermelon.png',
      'assets/fence_vertical.png',
      'assets/grass_2.jpg'
    ]

    const promises = imageSources.map(src => this.loadImage(src));
    return Promise.all(promises);
  }

  private loadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.imageCache[src] = img;
        resolve();
      };
      console.log(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  startGameLoop() {
    this.isRunning = true;
    this.lastUpdateTime = performance.now(); // Track the time of the last frame
    this.gameLoop(); // Start the game loop
  }

  stopGameLoop() {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
  }

  initializeTileMap() {
    for (let r = 0; r < GameComponent.rows; r++) {
      this.tileMap[r] = [];
      for (let c = 0; c < GameComponent.cols; c++) {
        this.tileMap[r][c] = {
          type: 'land'
        };
      }
    }

    this.tileMap[12][12] = {
      type: 'melon'
    }
    this.tileMap[12][11] = {
      type: 'melon'
    }
    this.tileMap[12][13] = {
      type: 'melon'
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
    // Request the next frame
    requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let r = 0; r < this.tileMap.length; r++) {
      const row = this.tileMap[r];
      for (let c = 0; c < row.length; c++) {
        const tile = row[c];
        if (tile.type === 'land') {
          const grass = this.getImage('assets/grass_2.jpg');
          if (grass) {
            this.ctx.drawImage(grass, c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
          }
          // this.ctx.fillStyle = 'green';
          // this.ctx.fillRect(c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
        }
        else if (tile.type === 'melon') {
          this.ctx.fillStyle = 'green';
          this.ctx.fillRect(c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
          const melon = this.getImage('assets/watermelon.png');
          if (melon) {
            this.ctx.drawImage(melon, c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
          }
        }
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
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    this.keyState[event.key] = false;
  }

  getTileSize() {
    return GameComponent.tileSize;
  }

  getImage(src: string): HTMLImageElement | undefined {
    return this.imageCache[src];
  }
}
