import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { Player } from '../entities/player';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') gameCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  
  static width: number = 1250;
  static height: number = 900;

  private width: number = GameComponent.width;
  private height: number = GameComponent.height;

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
    this.player = new Player(600, 450, 1.75, "down");
    this.startGameLoop();
  }

  ngOnDestroy(): void {
    this.stopGameLoop();
  }

  preloadImages(): Promise<void[]> {
    const imageSources = [
      'assets/watermelon.png',
      'assets/fence_vertical.png',
      'assets/grass_2.jpg',
      'assets/wheat_grass.png',
      'assets/wheat_dirt.png',
      'assets/fence_dirt_grass_1.png',
      'assets/fence_dirt_grass_2.png'
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
    this.lastUpdateTime = performance.now();
    this.gameLoop();
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
    this.ctx.clearRect(0, 0, this.width, this.height);

    const grass = this.getImage('assets/grass_2.jpg');
    if (grass) {
      const pattern = this.ctx.createPattern(grass, 'repeat');
      if (pattern) {
        this.ctx.fillStyle = pattern;
        this.ctx.fillRect(0, 0, 1250, 900);
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

  getImage(src: string): HTMLImageElement | undefined {
    return this.imageCache[src];
  }
}
