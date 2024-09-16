import { ImageService } from "../service/imageservice";
import { Player } from "./player";
import { Tile } from "./tile";

export class Grass extends Tile {
    constructor() {
        super('grass', ImageService.getImage('assets/grass_2.jpg'), null);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    override handlePlayerCollision(tileX: number, tileY: number, player: Player): void {
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    override update(tileX: number, tileY: number, player: Player): void {
        return;
    }
}