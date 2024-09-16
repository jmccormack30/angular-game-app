import { Player } from "./player";

export abstract class Tile {
    public tileName: string;
    public image: HTMLImageElement | null = null;
    public backgroundImage: HTMLImageElement | null = null;

    constructor(tileName: string, image: HTMLImageElement | null, backgroundImage: HTMLImageElement | null) {
        this.tileName = tileName;
        this.image = image;
        this.backgroundImage = backgroundImage;
    }

    isPlayerCollision(tileX: number, tileY: number, playerX: number, playerY: number): boolean {
        const playerStartY = playerY + 49;
        const playerEndY = playerY + 96;

        const playerStartX = playerX + 1;
        const playerEndX = playerX + 47;

        // console.log("playerStartX: " + playerStartX + ", playerStartY: " + playerStartY + ", tileX: " + tileX + ", tileY: " + tileY);

        return (this.isXCollision(playerStartX, playerEndX, tileX) && this.isYCollision(playerStartY, playerEndY, tileY));
    }

    isXCollision(playerStartX: number, playerEndX: number, tileX: number): boolean {
        for (let x = tileX; x < tileX + 50; x++) {
            if (x >= playerStartX && x <= playerEndX) {
                return true;
            }
        }
        return false;
    }

    isYCollision(playerStartY: number, playerEndY: number, tileY: number): boolean {
        for (let y = tileY; y < tileY + 50; y++) {
            if (y >= playerStartY && y <= playerEndY) {
                return true;
            }
        }
        return false;
    }

    draw(ctx: CanvasRenderingContext2D, xPos: number, yPos: number): void {
        if (this.backgroundImage !== null) {
            ctx.drawImage(this.backgroundImage, xPos, yPos);
        }
        if (this.image !== null) {
            ctx.drawImage(this.image, xPos, yPos);
        }
    }

    abstract handlePlayerCollision(tileX: number, tileY: number, player: Player): void;

    abstract update(tileX: number, tileY: number, player: Player): void;
}