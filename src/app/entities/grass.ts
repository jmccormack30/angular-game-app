import { ImageService } from "../imageservice";
import { Tile } from "./tile";

export class Grass extends Tile {
    constructor() {
        super('grass', ImageService.getImage('assets/grass_2.jpg'));
    }
}