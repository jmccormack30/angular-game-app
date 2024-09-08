export class Tile {
    public tileName: string;
    public image: HTMLImageElement | null = null;

    constructor(tileName: string, image: HTMLImageElement | null) {
        this.tileName = tileName;
        this.image = image;
    }
}