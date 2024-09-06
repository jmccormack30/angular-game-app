import { PlayerWalkAnimation } from "../animations/player-walk-animation";
import { GameComponent } from "../game/game.component";
import { ImageService } from "../imageservice";
import { KeyService } from "../keyservice";

export class Player {
    xPos: number;
    yPos: number;
    speed: number;
    direction: string | undefined;

    image: HTMLImageElement | null = null;
    playerImages: { [key: string]: string } = {};
    private imageCache: { [key: string]: HTMLImageElement } = {};

    animation : PlayerWalkAnimation | undefined;

    private keyState: { [key: string]: boolean } = {};
  
    constructor(xPos: number, yPos: number, speed: number, direction: string) {
      this.xPos = xPos;
      this.yPos = yPos;
      this.speed = speed;
      this.direction = direction;
    }

    update() {
        const input = KeyService.getPlayerDirection();
        
        if (input === undefined) {
            this.animation = undefined;
            return;
        }

        if (this.direction !== input) {
            this.animation = undefined;
        }

        const shift = KeyService.isKeyPressed('Shift');

        this.direction = input;
        this.updateSpeed(shift);
        //this.updatePlayerPosition(this.direction);

        if (this.animation === undefined) {
            this.animation = new PlayerWalkAnimation();
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.animation !== undefined) {
            const src = this.animation.getImage(this.direction);
            this.image = ImageService.getImage(src);
        }
        else {
            const src = this.getDefaultImageSrc(this.direction);
            this.image = ImageService.getImage(src);
        }
        
        if (this.image) {
            ctx.drawImage(this.image, this.xPos, this.yPos);
        }
    }

    getDefaultImageSrc(direction: string | undefined) {
        if (direction === "up") {
            return "assets/player_ps_up.png";
        }
        else if (direction === "down") {
            return "assets/player_sd_down.png";
        }
        else if (direction === "left") {
            return "assets/player_ps_left.png";
        }
        else if (direction === "right") {
            return "assets/player_ps_right.png";
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

    updateSpeed(shift: boolean) {
        this.speed = shift ? 5 : 3;
    }
}