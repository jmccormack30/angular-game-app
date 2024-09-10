import { InventoryComponent } from "../inventory/inventory.component";

export abstract class Tile {
    private width = 50;
    private height = 50;

    public tileName: string;
    public image: HTMLImageElement | null = null;
    public isCheckCollision: boolean;

    constructor(tileName: string, image: HTMLImageElement | null, isCheckCollision: boolean) {
        this.tileName = tileName;
        this.image = image;
        this.isCheckCollision = isCheckCollision;
    }

    isPlayerCollision(tileX: number, tileY: number, playerX: number, playerY: number): boolean {
        const playerStartY = playerY + 46;
        const playerEndY = playerY + 96;

        const playerStartX = playerX;
        const playerEndX = playerX + 48;

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

    abstract handlePlayerCollision(inventoryComponent: InventoryComponent): void;

    abstract handlePlayerNoCollision(): void;
}