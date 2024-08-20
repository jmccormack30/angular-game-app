import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Tile } from '../tile';
import { Player } from '../entities/player';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent implements OnInit, OnDestroy {
  static rows: number = 10;
  static cols: number = 10;
  static tileSize: number = 50;
  tileMap: Tile[][] = [];

  private fps: number = 60;
  private frameInterval: number = 1000 / this.fps; // Interval in milliseconds
  private lastUpdateTime: number = 0;
  private isRunning: boolean = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private timerId: any;

  private keyState: { [key: string]: boolean } = {};
  player: Player | undefined;

  constructor(private cdr: ChangeDetectorRef) {
    
  }

  ngOnInit(): void {
    this.initializeTileMap();
    this.player = new Player(0, 0, 0, 0, 1.75, "down", this.cdr);
    this.startGameLoop();
  }

  ngOnDestroy(): void {
    this.stopGameLoop();
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
          type: Math.random() > 0.82 ? 'water' : 'land'
        };
      }
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
    if (this.player !== undefined) {
      this.player.update(this.keyState);
      this.player.draw();
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
}
