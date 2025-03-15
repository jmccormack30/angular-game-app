import { TILE_IMAGES } from "../../config/constants";
import { RockHitAnimation } from "../animations/rock-hit-animation";
import { RockItem } from "../items/RockItem";
import { GameStateService } from "../service/gamestateservice";
import { ImageService } from "../service/imageservice";
import { InventoryService } from "../service/inventoryservice";
import { Player } from "./player";
import { Tile } from "./tile";

export class Rock extends Tile {

  animation : RockHitAnimation | null = null;

  constructor(private inventoryService: InventoryService, private gameStateService: GameStateService) {
    super('rock', ImageService.getImage(TILE_IMAGES.ROCK), ImageService.getImage(TILE_IMAGES.GRASS));
  }

  override handlePlayerCollision(tileX: number, tileY: number, player: Player): void {
    const playerY = this.gameStateService.getCanvasYPos() + player.y;
    const playerX = this.gameStateService.getCanvasXPos() + player.x;
    
    if (this.isPlayerCollision(tileX, tileY, playerX, playerY)) {
      if (player.direction === 'up') {
        const yAdjustment = playerY + 54 - tileY + 50;
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

  mine() {
    this.addRockToInventory();
  }

  private addRockToInventory() {
    const randomFloat = Math.random();
    const qty = (randomFloat <= 0.20) ? 2 : 1;
    
    this.inventoryService.addItem(new RockItem(qty));
  }

  override draw(ctx: CanvasRenderingContext2D, xPos: number, yPos: number): void {
    if (this.backgroundImage !== null) {
      ctx.drawImage(this.backgroundImage, xPos, yPos);
    }
    //console.log(this.animation);
    if (this.animation !== null) {
      if (this.animation.isAnimationFinished()) {
        this.animation = null;
        if (this.image !== null) {
          ctx.drawImage(this.image, xPos, yPos);
        }
        return;
      }
      const {source, xOffset, yOffset}= this.animation.getImage();
      const animationImage = ImageService.getImage(source);
      //console.log("xOffset: " + xOffset + ", yOffset: " + yOffset + " yPos: " + yPos);
      if (animationImage) {
        ctx.drawImage(animationImage, xPos + xOffset, yPos + yOffset);
      }
      return;
    }
    if (this.image !== null) {
      ctx.drawImage(this.image, xPos, yPos);
    }
  }
}