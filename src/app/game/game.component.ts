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

  constructor(private cdr: ChangeDetectorRef) {
    
  }

  ngAfterViewInit(): void {
    console.log("ngOnInit!");
    const canvas = this.gameCanvas.nativeElement;
    console.log("1");
    this.ctx = canvas.getContext('2d')!;
    console.log("2");

    this.initializeTileMap();
    console.log("3");
    this.player = new Player(0, 0, 0, 0, 1.75, "down", this.cdr);
    console.log("4");
    this.startGameLoop();
    console.log("end");
  }

  ngOnDestroy(): void {
    this.stopGameLoop();
  }

  startGameLoop() {
    console.log("startGameLoop!");
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
    console.log("gameLoop()!");
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
        }
        else if (tile.type === 'water') {
          this.ctx.fillStyle = 'blue';
        }
        else {
          this.ctx.fillStyle = 'black';
        }
        this.ctx.fillRect(r * this.tileSize, c * this.tileSize, this.tileSize, this.tileSize);
      }
    }
    if (this.player !== undefined) {
      console.log("Update and draw player!");
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
}
