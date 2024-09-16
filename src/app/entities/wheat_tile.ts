import { ImageService } from "../service/imageservice";
import { Tile } from "./tile";
import { InventoryService } from "../service/inventoryservice";
import { ItemFactory } from "../items/itemfactory";
import { WheatItem } from "../items/wheat_item";
import { Player } from "./player";
import { GameStateService } from "../service/gamestateservice";

export class WheatTile extends Tile {
    private lastTime = -1;
    private active: boolean = true;
    private respawnRate = 0.025;
    private respawnIncreaseRate = 0.06;

    constructor(private inventoryService: InventoryService, private gameStateService: GameStateService) {
        super('wheat', ImageService.getImage('assets/wheat_dirt.png'), ImageService.getImage('assets/dirt.png'));
    }

    override handlePlayerCollision(tileX: number, tileY: number, player: Player): void {
        const playerY = this.gameStateService.getCanvasYPos() + player.yPos;
        const playerX = this.gameStateService.getCanvasXPos() + player.xPos;

        const isCollision = this.isPlayerCollision(tileX, tileY, playerX, playerY);

        if (isCollision) {
            if (this.active) {
                this.image = ImageService.getImage('assets/dirt.png');
                this.lastTime = Date.now();
                this.active = false;
                this.addWheatToInventory();
            }
        }
    }

    override update(tileX: number, tileY: number, player: Player): void {
        const playerY = this.gameStateService.getCanvasYPos() + player.yPos;
        const playerX = this.gameStateService.getCanvasXPos() + player.xPos;
        
        const isCollision = this.isPlayerCollision(tileX, tileY, playerX, playerY);

        if (!isCollision && !this.active) {
            const current = Date.now();
            if (current - this.lastTime >= 11000) {
                this.lastTime = current;
                const randomFloat = Math.random();
                if (randomFloat < this.respawnRate) {
                    this.active = true;
                    this.respawnRate = 0.023;
                    this.respawnIncreaseRate = 0.007;
                    this.image = ImageService.getImage('assets/wheat_dirt.png');
                }
                else {
                    this.respawnRate += this.respawnIncreaseRate;
                    this.respawnIncreaseRate += 0.004;
                }
            }
        }
    }

    private addWheatToInventory() {
        const randomFloat = Math.random();
        const qty = (randomFloat <= 0.20) ? 2 : 1;
        
        this.inventoryService.addItem(ItemFactory.createItem(WheatItem, qty));
    }
}