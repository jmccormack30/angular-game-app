export class Tile {
    private width = 50;
    private height = 50;

    public tileName: string;
    public image: HTMLImageElement | null = null;

    constructor(tileName: string, image: HTMLImageElement | null) {
        this.tileName = tileName;
        this.image = image;
    }

    isPlayerCollision(tileX: number, tileY: number, playerX: number, playerY: number): boolean {
        const playerStartY = playerY + 46;
        const playerEndY = playerY + 96;

        const playerStartX = playerX;
        const playerEndX = playerX + 48;

        return (this.isXCollision() && this.isYCollision());
    }

    isXCollision(): boolean {
        return true;
    }

    isYCollision(): boolean {
        return true;
    }
}