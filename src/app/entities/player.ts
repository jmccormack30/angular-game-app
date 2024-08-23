import { PlayerWalkAnimation } from "../animations/player-walk-animation";
import { GameComponent } from "../game/game.component";

export class Player {
    xPos: number;
    yPos: number;
    speed: number;
    direction: string | undefined;

    image: HTMLImageElement | undefined;
    playerImages: { [key: string]: string } = {};
    private imageCache: { [key: string]: HTMLImageElement } = {};

    animation : PlayerWalkAnimation | undefined;

    private keyState: { [key: string]: boolean } = {};
  
    constructor(xPos: number, yPos: number, speed: number, direction: string) {
      this.xPos = xPos;
      this.yPos = yPos;
      this.speed = speed;
      this.direction = direction;
      this.preloadImages(); 
    }

    preloadImages(): Promise<void[]> {
      const imageSources = [
        'assets/player_right.png',
        'assets/player_right_2.png',
        'assets/player_left.png',
        'assets/player_left_2.png',
        'assets/player_up.png',
        'assets/player_up_2.png',
        'assets/player_down.png',
        'assets/player_down_2.png',
        'assets/player_down_walk_1.png',
        'assets/player_down_walk_2.png',
        'assets/player_down_walk_3.png',
        'assets/player_down_walk_4.png',
        'assets/player_up_walk_3.png',
        'assets/player_up_walk_4.png',
        'assets/player_up_walk_5.png',
        'assets/player_up_walk_6.png',
        'assets/player_up_walk_7.png',
        'assets/player_up_walk_8.png',
        'assets/player_left_walk_1.png',
        'assets/player_left_walk_2.png',
        'assets/player_left_walk_3.png',
        'assets/player_right_walk_1.png',
        'assets/player_right_walk_2.png',
        'assets/player_right_walk_3.png'
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
        const input = this.getDirection(keyState);
        
        if (input === undefined) {
            this.animation = undefined;
            return;
        }

        if (this.direction !== input) {
            this.animation = undefined;
        }

        this.direction = input;
        this.updateSpeed(keyState);
        this.updatePlayerPosition(this.direction);

        if (this.animation === undefined) {
            this.animation = new PlayerWalkAnimation();
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.animation !== undefined) {
            const src = this.animation.getImage(this.direction);
            this.image = this.getImage(src);
        }
        else {
            const src = this.getDefaultImageSrc(this.direction);
            this.image = this.getImage(src);
        }
        
        if (this.image) {
            ctx.drawImage(this.image, this.xPos, this.yPos);
        }
    }

    getDefaultImageSrc(direction: string | undefined) {
        if (direction === "up") {
            return "assets/player_up_2.png";
        }
        else if (direction === "down") {
            return "assets/player_down_2.png";
        }
        else if (direction === "left") {
            return "assets/player_left_2.png";
        }
        else if (direction === "right") {
            return "assets/player_right_2.png";
        }

        throw new Error("Invalid direction set for player");
    }
    
    updatePlayerPosition(direction: string | undefined) {
        if (direction === "up") {
            this.yPos -= this.speed;
            if (this.yPos < 0) {
                this.yPos = 0;
            }
        }
        else if (direction === "down") {
            this.yPos += this.speed;
            // TODO - replace 50 with height variable for if I change the player height in the future
            if (this.yPos > GameComponent.height - 63) {
                this.yPos = GameComponent.height - 63;
            }
        }
        else if (direction === "left") {
            this.xPos -= this.speed;
            if (this.xPos < 0) {
                this.xPos = 0;
            }
        }
        else if (direction === "right") {
            this.xPos += this.speed;
            // TODO - replace 50 with width variable for if I change the player width in the future
            if (this.xPos > GameComponent.width - 50) {
                this.xPos = GameComponent.width - 50;
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

    isRunning(keyState: {[key: string]: boolean }) {
        return keyState['Shift'];
    }

    updateSpeed(keyState: {[key: string]: boolean }) {
        if (this.isRunning(keyState)) {
            this.speed = 5;
        }
        else {
            this.speed = 3;
        }
    }
}