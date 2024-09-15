import { ImageService } from "../service/imageservice";
import { Tile } from "./tile";

export class Rock extends Tile {
    constructor() {
        super('rock', ImageService.getImage('assets/rock.png'), ImageService.getImage('assets/grass_2.jpg'));
    }

    override handlePlayerCollision(): void {
        return;
    }
}