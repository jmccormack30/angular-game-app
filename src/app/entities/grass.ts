import { ImageService } from "../service/imageservice";
import { Tile } from "./tile";

export class Grass extends Tile {
    constructor() {
        super('grass', ImageService.getImage('assets/grass_2.jpg'), null);
    }

    override handlePlayerCollision(): void {
        return;
    }
}