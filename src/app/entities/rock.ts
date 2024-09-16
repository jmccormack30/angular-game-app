import { GameStateService } from "../service/gamestateservice";
import { ImageService } from "../service/imageservice";
import { Player } from "./player";
import { Tile } from "./tile";

export class Rock extends Tile {
    constructor(private gameStateService: GameStateService) {
        super('rock', ImageService.getImage('assets/rock.png'), ImageService.getImage('assets/grass_2.jpg'));
    }

    override handlePlayerCollision(tileX: number, tileY: number, player: Player): void {
        const playerY = this.gameStateService.getCanvasYPos() + player.yPos;
        const playerX = this.gameStateService.getCanvasXPos() + player.xPos;
        
        if (this.isPlayerCollision(tileX, tileY, playerX, playerY)) {
            console.log("Colliding with rock!");
            if (player.direction === 'up') {
                const yAdjustment = playerY + 49 - tileY + 50;
                this.gameStateService.updateMapPositionForPlayer(0, yAdjustment, player);
            }
            else if (player.direction === 'left') {
                const xAdjustment = playerX - tileX;
                this.gameStateService.updateMapPositionForPlayer(xAdjustment, 0, player);
            }
            else if (player.direction === 'down') {
                const yAdjustment = playerY - tileY;
                this.gameStateService.updateMapPositionForPlayer(0, yAdjustment, player);
            }
            else if (player.direction === 'right') {
                const xAdjustment = playerX + 47 - tileX - 50;
                this.gameStateService.updateMapPositionForPlayer(xAdjustment, 0, player);
            }
            return;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    override update(tileX: number, tileY: number, player: Player): void {
        return;
    }
}