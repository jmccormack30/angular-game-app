import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
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
  
  static rows: number = 10;
  static cols: number = 10;
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

  constructor(private cdr: ChangeDetectorRef) {
    
  }

  ngAfterViewInit(): void {
    const canvas = this.gameCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    this.preloadImages();
    this.initializeTileMap();
    this.player = new Player(50, 250, 1, 5, 1.75, "down", this.cdr);
    this.startGameLoop();
  }

  ngOnDestroy(): void {
    this.stopGameLoop();
  }

  preloadImages(): Promise<void[]> {
    const imageSources = [
      'assets/watermelon.png',
      'assets/fence_vertical.png'
    ]

    const promises = imageSources.map(src => this.loadImage(src));
    return Promise.all(promises);
  }

  private loadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        console.log(img);
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
    this.tileMap[1][9] = {
      type: 'fence'
    }
    this.tileMap[1][8] = {
      type: 'fence'
    }
    this.tileMap[1][7] = {
      type: 'fence'
    }
    this.tileMap[8][9] = {
      type: 'fence'
    }
    this.tileMap[8][8] = {
      type: 'fence'
    }
    this.tileMap[8][7] = {
      type: 'fence'
    }

    this.tileMap[2][9] = {
      type: 'melon'
    }
    this.tileMap[3][9] = {
      type: 'melon'
    }
    this.tileMap[4][9] = {
      type: 'melon'
    }
    this.tileMap[5][9] = {
      type: 'melon'
    }
    this.tileMap[6][9] = {
      type: 'melon'
    }
    this.tileMap[7][9] = {
      type: 'melon'
    }

    this.tileMap[2][8] = {
      type: 'melon'
    }
    this.tileMap[3][8] = {
      type: 'melon'
    }
    this.tileMap[4][8] = {
      type: 'melon'
    }
    this.tileMap[5][8] = {
      type: 'melon'
    }
    this.tileMap[6][8] = {
      type: 'melon'
    }
    this.tileMap[7][8] = {
      type: 'melon'
    }

    this.tileMap[2][7] = {
      type: 'melon'
    }
    this.tileMap[3][7] = {
      type: 'melon'
    }
    this.tileMap[4][7] = {
      type: 'melon'
    }
    this.tileMap[5][7] = {
      type: 'melon'
    }
    this.tileMap[6][7] = {
      type: 'melon'
    }
    this.tileMap[7][7] = {
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
          this.ctx.fillStyle = 'green';
          this.ctx.fillRect(r * this.tileSize, c * this.tileSize, this.tileSize, this.tileSize);
        }
        else if (tile.type === 'melon') {
          const melonImg = this.getImage('assets/watermelon.png');
          this.ctx.fillStyle = 'green';
          this.ctx.fillRect(r * this.tileSize, c * this.tileSize, this.tileSize, this.tileSize);
          if (melonImg) {
            this.ctx.drawImage(melonImg, r * this.tileSize, c * this.tileSize);
          }
        }
        else if (tile.type === 'fence') {
          const fenceImg = this.getImage('assets/fence_vertical.png');
          this.ctx.fillStyle = 'green';
          this.ctx.fillRect(r * this.tileSize, c * this.tileSize, this.tileSize, this.tileSize);
          if (fenceImg) {
            this.ctx.drawImage(fenceImg, r * this.tileSize, c * this.tileSize);
          }
        }
        else {
          this.ctx.fillStyle = 'black';
          this.ctx.fillRect(r * this.tileSize, c * this.tileSize, this.tileSize, this.tileSize);
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
