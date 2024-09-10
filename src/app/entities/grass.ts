import { ImageService } from "../imageservice";
import { InventoryComponent } from "../inventory/inventory.component";
import { Tile } from "./tile";

export class Grass extends Tile {
    constructor() {
        super('grass', ImageService.getImage('assets/grass_2.jpg'), false);
    }

    override handlePlayerCollision(inventoryComponent: InventoryComponent): void {
        // No implementation
        return;
    }

    override handlePlayerNoCollision(): void {
        // No implementation
        return;
    }
}