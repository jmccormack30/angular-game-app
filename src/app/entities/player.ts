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

    image: string | undefined;
    playerImages: { [key: string]: string } = {};

    animation : PlayerWalkAnimation | undefined;

    private keyState: { [key: string]: boolean } = {};
  
    constructor(xPos: number, yPos: number, row: number, col: number, speed: number, direction: string, private cdr: ChangeDetectorRef) {
      this.xPos = xPos;
      this.yPos = yPos;
      this.row = row;
      this.col = col;
      this.speed = speed;
      this.direction = direction;

      this.preloadImages();
    }

    preloadImages() {
        const imageUrls = {
            'right': 'assets/player_right.png',
            'left': 'assets/player_left.png',
            'up': 'assets/player_up.png',
            'down': 'assets/player_down.png',
            'down_walk_1': 'assets/player_down_walk_1.png',
            'down_walk_2': 'assets/player_down_walk_2.png'
        };
        
        // Preload images
        for (const [key, url] of Object.entries(imageUrls)) {
            const img = new Image();
            img.src = url;
            this.playerImages[key] = url;
        }
    
        // Set initial image
        this.image = this.playerImages['facingRight'];
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
                    this.updateAnimation(this.direction);
                }
            }
        }
    }

    draw() {
        if (this.animation !== undefined) {
            if (!this.isAtPosition()) {
                const imageAction = this.animation.getImage();
                this.updateImage(this.playerImages[imageAction]);
            }
            else {
                this.animation = undefined;
            }
        }
        else {
            //const imageAction = this.getDefaultImage(this.direction);
            const imageAction = this.direction ?? "";
            this.updateImage(this.playerImages[imageAction]);

            const isMoving: boolean = !this.isAtPosition();
            if (isMoving) {
                console.log("Draw, direction: " + this.direction);
                console.log("Draw, image: " + this.image);
            }
        }
        setTimeout(() => {
            this.cdr.markForCheck(); // Marks the component for check
        }, 0);
    }

    isAtPosition() {
        return ((this.xPos === this.col * GameComponent.tileSize) && (this.yPos === this.row * GameComponent.tileSize));
    }

    updateAnimation(direction: string) {
        if (direction === "down") {
            this.animation = new PlayerWalkAnimation();
        }
    }

    getDefaultImage(direction: string | undefined) {
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

    updateImage(url: string) {
        const uniqueUrl = `${url}?timestamp=${new Date().getTime()}`;
        this.image = uniqueUrl;
    }
}