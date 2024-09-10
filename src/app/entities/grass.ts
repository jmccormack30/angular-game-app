import { ImageService } from "../imageservice";
import { Tile } from "./tile";

export class Grass extends Tile {
    constructor() {
        super('grass', ImageService.getImage('assets/grass_2.jpg'), false);
    }

    override handlePlayerCollision(): void {
        // No implementation
        return;
    }

    override handlePlayerNoCollision(): void {
        // No implementation
        return;
    }
}