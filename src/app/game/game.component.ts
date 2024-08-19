import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Tile } from '../tile';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent implements OnInit, OnDestroy {
  rows = 10;
  cols = 10;
  tileSize = 50;
  tileMap: Tile[][] = [];

  playerX = 0;
  playerY = 0;

  playerRow = 0;
  playerCol = 0;

  playerMoveSpeed = 1.75;

  isPlayerMoving: boolean = false;
  currentDirection: string = "";
  playerImage = "assets/player_down.png";

  playerDownFrame = -1;

  private fps: number = 60;
  private frameInterval: number = 1000 / this.fps; // Interval in milliseconds
  private nextFrameTime: number = 0;
  private isRunning: boolean = false;
  private timerId: any;

  private keyState: { [key: string]: boolean } = {};

  ngOnInit(): void {
    this.initializeTileMap();
    this.startGameLoop();
  }

  ngOnDestroy(): void {
    this.stopGameLoop();
  }

  startGameLoop() {
    this.isRunning = true;
    this.nextFrameTime = performance.now() + this.frameInterval;
    this.gameLoop();
  }

  stopGameLoop() {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
  }

  initializeTileMap() {
    for (let r = 0; r < this.rows; r++) {
      this.tileMap[r] = [];
      for (let c = 0; c < this.cols; c++) {
        this.tileMap[r][c] = {
          type: Math.random() > 0.82 ? 'water' : 'land'
        };
      }
    }
  }

  gameLoop() {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const timeToNextFrame = this.nextFrameTime - currentTime;

    this.timerId = setTimeout(() => {
      this.update(); // Update game logic
      this.nextFrameTime = currentTime + this.frameInterval;
      this.gameLoop(); // Continue the loop
    }, Math.max(timeToNextFrame, 0));
  }

  update() {
    if (this.isPlayerMoving) {
      this.playerDownFrame++;
      this.updatePlayerImage();
      this.updatePlayerPosition(this.currentDirection);
      this.isPlayerMoving = !this.isPlayerAtPosition();
    }
    else {
      this.playerDownFrame = -1;
      this.updatePlayerImage();
      this.currentDirection = this.getKeyState();

      if (this.currentDirection !== "") {
        this.playerDownFrame = 0;

        this.isPlayerMoving = true;
        this.updatePlayerImage();
        this.updatePlayerTile(this.currentDirection);
        this.updatePlayerPosition(this.currentDirection);
      }
    }
  }

  isPlayerAtPosition() {
    return ((this.playerX === this.playerCol * this.tileSize) && (this.playerY === this.playerRow * this.tileSize));
  }

  updatePlayerTile(direction: string) {
    if (direction === 'up') this.playerRow--;
    if (direction === 'down') this.playerRow++;
    if (direction === 'left') this.playerCol--;
    if (direction === 'right') this.playerCol++

    if (this.playerRow < 0) this.playerRow = 0;
    if (this.playerRow >= this.rows - 1) this.playerRow = (this.rows - 1);
    if (this.playerCol < 0) this.playerCol = 0;
    if (this.playerCol >= this.cols - 1) this.playerCol = (this.cols - 1);
  }

  updatePlayerPosition(direction: string) {
    if (direction === "up") {
      this.playerY -= this.playerMoveSpeed;
      if (this.playerY < this.playerRow * this.tileSize) {
        this.playerY = this.playerRow * this.tileSize;
      }
    }
    else if (direction === "down") {
      this.playerY += this.playerMoveSpeed;
      if (this.playerY > this.playerRow * this.tileSize) {
        this.playerY = this.playerRow * this.tileSize;
      }
    }
    else if (direction === "left") {
      this.playerX -= this.playerMoveSpeed;
      if (this.playerX < this.playerCol * this.tileSize) {
        this.playerX = this.playerCol * this.tileSize;
      }
    }
    else if (direction === "right") {
      this.playerX += this.playerMoveSpeed;
      if (this.playerX > this.playerCol * this.tileSize) {
        this.playerX = this.playerCol * this.tileSize;
      }
    }
  }

  updatePlayerImage() {
    if (this.currentDirection === "up") {
      this.playerImage = "assets/player_up.png";
    }
    else if (this.currentDirection === "down") {
      console.log("update player image")
      if (this.playerDownFrame === -1) {
        this.playerImage = "assets/player_down.png";
      }
      else if (this.playerDownFrame <= 14) {
        //console.log("Frame 1");
        this.playerImage = "assets/player_down_walk_1.png";
      }
      else if (this.playerDownFrame > 14 && this.playerDownFrame <= 29) {
        //console.log("Frame 2");
        this.playerImage = "assets/player_down_walk_2.png";
      }
      else if (this.playerDownFrame > 19 && this.playerDownFrame <= 29) {
        //console.log("Frame 3");
        this.playerImage = "assets/player_down_run_1.png";
      }
      else if (this.playerDownFrame > 29 && this.playerDownFrame <= 39) {
        this.playerImage = "assets/player_down_run_2.png";
      }
      else if (this.playerDownFrame > 39 && this.playerDownFrame <= 49) {
        this.playerImage = "assets/player_down_run_1.png";
      }
      // this.playerImage = "assets/player_down.png";
    }
    else if (this.currentDirection === "left") {
      this.playerImage = "assets/player_left.png";
    }
    else if (this.currentDirection === "right") {
      this.playerImage = "assets/player_right.png";
    }
  }

  getKeyState() {
    let direction = "";
    let total = 0;
    if (this.keyState['ArrowUp']) {
      direction = "up";
      total++;
    }
    if (this.keyState['ArrowDown']) {
      direction = "down";
      total++;
    }
    if (this.keyState['ArrowLeft']) {
      direction = "left";
      total++;
    }
    if (this.keyState['ArrowRight']) {
      direction = "right";
      total++;
    }

    if (total > 1 || total === 0) {
      return "";
    }
    else {
      return direction;
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
}
