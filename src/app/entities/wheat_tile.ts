import { ImageService } from "../imageservice";
import { InventoryComponent } from "../inventory/inventory.component";
import { ItemFactory } from "../items/itemfactory";
import { WheatItem } from "../items/wheat_item";
import { Tile } from "./tile";

export class WheatTile extends Tile {
    private lastTime = -1;
    private active: boolean = true;
    private respawnRate = 0.025;
    private respawnIncreaseRate = 0.06;

    constructor() {
        super('wheat', ImageService.getImage('assets/wheat_dirt.png'), true);
    }

    override handlePlayerCollision(inventoryComponent: InventoryComponent): void {
        if (this.active) {
            this.image = ImageService.getImage('assets/dirt.png');
            this.lastTime = Date.now();
            this.active = false;
            this.addWheatToInventory(inventoryComponent);
        }
    }

    override handlePlayerNoCollision(): void {
        if (!this.active) {
            const current = Date.now();
            if (current - this.lastTime >= 12000) {
                this.lastTime = current;
                const randomFloat = Math.random();
                if (randomFloat < this.respawnRate) {
                    this.active = true;
                    this.respawnRate = 0.025;
                    this.respawnIncreaseRate = 0.006;
                    this.image = ImageService.getImage('assets/wheat_dirt.png');
                }
                else {
                    this.respawnRate += this.respawnIncreaseRate;
                    this.respawnIncreaseRate += 0.003
                }
            }
        }
    }

    private addWheatToInventory(inventoryComponent: InventoryComponent) {
        const randomFloat = Math.random();
        const qty = (randomFloat <= 0.20) ? 2 : 1;
        inventoryComponent.moveItemToInventory(ItemFactory.createItem(WheatItem, qty));
    }
}