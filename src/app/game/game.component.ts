import { Component, HostListener, OnInit } from '@angular/core';
import { Tile } from '../tile';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent implements OnInit {
  rows = 10;
  cols = 10;
  tileSize = 50;

  tileMap: Tile[][] = [];

  playerRow = 0;
  playerCol = 0;

  ngOnInit(): void {
    this.initializeTileMap();
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

  movePlayer(direction: string) {
    if (direction === 'up') this.playerRow--;
    if (direction === 'down') this.playerRow++;
    if (direction === 'left') this.playerCol--;
    if (direction === 'right') this.playerCol++;

    if (this.playerRow < 0) this.playerRow = 0;
    if (this.playerRow >= this.rows) this.playerRow = this.rows - 1;
    if (this.playerCol < 0) this.playerCol = 0;
    if (this.playerCol >= this.cols) this.playerCol = this.cols - 1;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.movePlayer('up');
        break;
      case 'ArrowDown':
        this.movePlayer('down');
        break;
      case 'ArrowLeft':
        this.movePlayer('left');
        break;
      case 'ArrowRight':
        this.movePlayer('right');
        break;
    }
  }
}
