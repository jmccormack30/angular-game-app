import { ChangeDetectorRef } from "@angular/core";
import { PlayerWalkAnimation } from "../animations/player-walk-animation";
import { GameComponent } from "../game/game.component";

export class Player {
    xPos: number;
    yPos: number;
    row: number;
    col: number;
    speed: number;
    direction: string | undefined;

    image: HTMLImageElement | undefined;
    playerImages: { [key: string]: string } = {};
    private imageCache: { [key: string]: HTMLImageElement } = {};

    animation : PlayerWalkAnimation | undefined;

    private keyState: { [key: string]: boolean } = {};
  
    constructor(xPos: number, yPos: number, col: number, row: number, speed: number, direction: string, private cdr: ChangeDetectorRef) {
      this.xPos = xPos;
      this.yPos = yPos;
      this.row = row;
      this.col = col;
      this.speed = speed;
      this.direction = direction;

      this.preloadImages(); 
    }

    preloadImages(): Promise<void[]> {
      const imageSources = [
        'assets/player_right.png',
        'assets/player_left.png',
        'assets/player_up.png',
        'assets/player_down.png',
        'assets/player_down_walk_1.png',
        'assets/player_down_walk_2.png',
        'assets/player_up_walk_3.png',
        'assets/player_up_walk_4.png',
        'assets/player_left_walk_1.png',
        'assets/player_left_walk_2.png',
        'assets/player_right_walk_1.png',
        'assets/player_right_walk_2.png'
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
        img.onerror = reject;
        img.src = src;
      });
    }

    update(keyState: {[key: string]: boolean }) {
        const isMoving: boolean = !this.isAtPosition();

        if (isMoving) {
            this.updatePlayerPosition(this.direction);
        }
        else {
            // get the current directional input of the player
            const input = this.getDirection(keyState);

            if (input !== undefined) {
                this.direction = input;

                this.updatePlayerTile(this.direction);
                this.updatePlayerPosition(this.direction);

                if (this.animation === undefined) {
                    this.animation = new PlayerWalkAnimation();
                }
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        console.log("Draw!");
        if (this.animation !== undefined) {
            if (!this.isAtPosition()) {
                const src = this.animation.getImage(this.direction);
                this.image = this.getImage(src);
            }
            else {
                this.animation = undefined;
            }
        }
        else {
            //const imageAction = this.getDefaultImage(this.direction);
            const src = this.getDefaultImageSrc(this.direction);
            this.image = this.getImage(src);

            const isMoving: boolean = !this.isAtPosition();
            if (isMoving) {
                console.log("Draw, direction: " + this.direction);
                console.log("Draw, image: " + this.image);
            }
        }
        
        if (this.image) {
            console.log("Image drawing!");
            ctx.drawImage(this.image, this.xPos, this.yPos);
        }
    }

    isAtPosition() {
        return ((this.xPos === this.col * GameComponent.tileSize) && (this.yPos === this.row * GameComponent.tileSize));
    }

    getDefaultImageSrc(direction: string | undefined) {
        if (direction === "up") {
            return "assets/player_up.png";
        }
        else if (direction === "down") {
            return "assets/player_down.png";
        }
        else if (direction === "left") {
            return "assets/player_left.png";
        }
        else if (direction === "right") {
            return "assets/player_right.png";
        }

        //return "assets/player_down.png";
        throw new Error("Invalid direction set for player");
    }
    
    updatePlayerTile(direction: string) {
        if (direction === 'up') this.row--;
        if (direction === 'down') this.row++;
        if (direction === 'left') this.col--;
        if (direction === 'right') this.col++

        if (this.row < 0) this.row = 0;
        if (this.row >= GameComponent.rows - 1) this.row = (GameComponent.rows - 1);
        if (this.col < 0) this.col = 0;
        if (this.col >= GameComponent.cols - 1) this.col = (GameComponent.cols - 1);
    }
    
    updatePlayerPosition(direction: string | undefined) {
        if (direction === "up") {
            this.yPos -= this.speed;
            if (this.yPos < this.row * GameComponent.tileSize) {
                this.yPos = this.row * GameComponent.tileSize;
            }
        }
        else if (direction === "down") {
            this.yPos += this.speed;
            if (this.yPos > this.row * GameComponent.tileSize) {
                this.yPos = this.row * GameComponent.tileSize;
            }
        }
        else if (direction === "left") {
            this.xPos -= this.speed;
            if (this.xPos < this.col * GameComponent.tileSize) {
                this.xPos = this.col * GameComponent.tileSize;
            }
        }
        else if (direction === "right") {
            this.xPos += this.speed;
            if (this.xPos > this.col * GameComponent.tileSize) {
                this.xPos = this.col * GameComponent.tileSize;
            }
        }
    }

    getDirection(keyState: { [key: string]: boolean }) {
        let direction = "";
        let total = 0;

        if (keyState['ArrowUp']) {
            direction = "up";
            total++;
        }
        if (keyState['ArrowDown']) {
            direction = "down";
            total++;
        }
        if (keyState['ArrowLeft']) {
            direction = "left";
            total++;
        }
        if (keyState['ArrowRight']) {
            direction = "right";
            total++;
        }

        if (total > 1 || total === 0) {
            return undefined;
        }
        else {
            return direction;
        }
    }

    getImage(src: string): HTMLImageElement | undefined {
        return this.imageCache[src];
    }

    // updateImage(url: string) {
    //     const uniqueUrl = `${url}?timestamp=${new Date().getTime()}`;
    //     this.image = uniqueUrl;
    // }
}