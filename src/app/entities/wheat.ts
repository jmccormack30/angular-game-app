import { ImageService } from "../imageservice";
import { Tile } from "./tile";

export class Wheat extends Tile {
    private lastTime = -1;
    private active: boolean = true;
    private respawnRate = 0.05;
    private respawnIncreaseRate = 0.01;

    constructor() {
        super('wheat', ImageService.getImage('assets/wheat_dirt.png'), true);
    }

    override handlePlayerCollision(): void {
        this.image = ImageService.getImage('assets/dirt.png');
        this.lastTime = Date.now();
        this.active = false;
    }

    override handlePlayerNoCollision(): void {
        if (!this.active) {
            const current = Date.now();
            // Every one second, randomly decide if we should respawn or not
            if (current - this.lastTime >= 5000) {
                this.lastTime = current;
                const randomFloat = Math.random();
                if (randomFloat < this.respawnRate) {
                    this.active = true;
                    this.respawnRate = 0.03;
                    this.respawnIncreaseRate = 0.01;
                    this.image = ImageService.getImage('assets/wheat_dirt.png');
                }
                else {
                    this.respawnRate += this.respawnIncreaseRate;
                    this.respawnIncreaseRate += 0.003
                }
            }
        }
    }
}