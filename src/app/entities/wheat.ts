import { ImageService } from "../imageservice";
import { Tile } from "./tile";

export class Wheat extends Tile {
    constructor() {
        super('wheat', ImageService.getImage('assets/wheat_dirt.png'));
    }
}