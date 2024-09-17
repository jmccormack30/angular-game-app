import { Subscription } from "rxjs";
import { Action, PlayerPickAxeLeftRightAnimation } from "../animations/player-pickaxe-left-right-animation";
import { PlayerWalkLeftRightAnimation } from "../animations/player-walk-left-right-animation";
import { PlayerWalkUpDownAnimation } from "../animations/player-walk-up-down-animation";
import { GameComponent } from "../game/game.component";
import { ImageService } from "../service/imageservice";
import { KeyService } from "../service/keyservice";
import { InventoryService } from "../service/inventoryservice";
import { Item } from "../items/item";
import { PickAxe } from "../items/pickaxe";
import { GameStateService } from "../service/gamestateservice";

enum PlayerAction {
    PICK_AXE_SWING
}

export class Player {
    xPos: number;
    yPos: number;
    speed: number;
    direction: string | undefined;

    image: HTMLImageElement | null = null;
    playerImages: { [key: string]: string } = {};
    private imageCache: { [key: string]: HTMLImageElement } = {};

    animation : PlayerWalkUpDownAnimation | PlayerWalkLeftRightAnimation | PlayerPickAxeLeftRightAnimation | undefined;
    action: PlayerAction | null = null;

    private keyState: { [key: string]: boolean } = {};
    private selectedItemSubscriber: Subscription = new Subscription;
    private selectedItem: Item | null = null;

    constructor(xPos: number, yPos: number, speed: number, direction: string, private keyService: KeyService, private inventoryService: InventoryService, private gameStateService: GameStateService) {
      this.xPos = xPos;
      this.yPos = yPos;
      this.speed = speed;
      this.direction = direction;

      this.selectedItemSubscriber = this.inventoryService.selectedItem$.subscribe((item: Item | null) => {
        this.selectedItem = item;
    });
    }

    update() {
        const isXPressed = this.keyService.isKeyPressed('x');
        if (isXPressed && this.action === null && this.selectedItem instanceof PickAxe) {
            this.action = PlayerAction.PICK_AXE_SWING;
            this.animation = new PlayerPickAxeLeftRightAnimation();
            return;
        }
        if (this.action === PlayerAction.PICK_AXE_SWING) {
            return;
        }

        const input = this.keyService.getPlayerDirection();
        
        if (input === undefined) {
            this.animation = undefined;
            return;
        }

        if (this.direction !== input) {
            this.animation = undefined;
        }

        const shift = this.keyService.isKeyPressed('shift');

        this.direction = input;
        this.updateSpeed(shift);

        if (this.animation === undefined) {
            if (this.direction === "up" || this.direction === "down") {
                this.animation = new PlayerWalkUpDownAnimation();
                return;
            }
            else if (this.direction === "left" || this.direction === "right") {
                this.animation = new PlayerWalkLeftRightAnimation();
                return;
            }
            
            if (this.keyService.isKeyPressed('x')) {
                console.log("X pressed!");
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.animation !== undefined) {
            const { src, xOffset, yOffset, action } = this.animation.getImage(this.direction);

            if (this.animation instanceof PlayerPickAxeLeftRightAnimation && action === Action.PICK_AXE_4) {
                const tile = this.getPickAxeTile();
            }

            const isAnimationFinished = this.animation.isAnimationFinished();
            if (isAnimationFinished) {
                this.animation = undefined;
                this.action = null;
            }

            this.image = ImageService.getImage(src);

            const newXPos = this.xPos + xOffset;
            const newYPos = this.yPos + yOffset;

            if (this.image) {
                ctx.drawImage(this.image, newXPos, newYPos);
            }
        }
        else {
            const src = this.getDefaultImageSrc(this.direction);
            this.image = ImageService.getImage(src);

            if (this.image) {
                ctx.drawImage(this.image, this.xPos, this.yPos);
            }
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
            if (this.yPos > GameComponent.height - 96) {
                this.yPos = GameComponent.height - 96;
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

    getPickAxeTile(): {col: number, row: number} {
        const canvasXPos = this.gameStateService.getCanvasXPos();
        const canvasYPos = this.gameStateService.getCanvasYPos();

        const playerMapXPos = this.xPos + canvasXPos;
        const playerMapYPos = this.yPos + canvasYPos;

        if (this.direction === 'left') {
            const pickAxeXPos = playerMapXPos - 35;
            const pickAxeYPos = playerMapYPos + 65;

            const tileCol = Math.floor(pickAxeXPos / 50);
            const tileRow = Math.floor(pickAxeYPos / 50);

            // console.log("col: " + tileCol + ", row: " + tileRow);
            return {col: tileCol, row: tileRow};
        }
        else if (this.direction === 'right') {
            const pickAxeXPos = playerMapXPos + 79;
            const pickAxeYPos = playerMapYPos + 65;

            const tileCol = Math.floor(pickAxeXPos / 50);
            const tileRow = Math.floor(pickAxeYPos / 50);

            // console.log("col: " + tileCol + ", row: " + tileRow);
            return {col: tileCol, row: tileRow};
        }
        return {col: 0, row: 0};
    }
}