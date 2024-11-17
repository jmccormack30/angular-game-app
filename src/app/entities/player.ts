import { Subscription } from "rxjs";
import { PlayerPickAxeLeftRightAnimation } from "../animations/player-pickaxe-left-right-animation";
import { PlayerWalkLeftRightAnimation } from "../animations/player-walk-left-right-animation";
import { PlayerWalkUpDownAnimation } from "../animations/player-walk-up-down-animation";
import { GameComponent } from "../game/game.component";
import { ImageService } from "../service/imageservice";
import { KeyService } from "../service/keyservice";
import { InventoryService } from "../service/inventoryservice";
import { Item } from "../items/item";
import { PickAxe } from "../items/pickaxe";
import { GameStateService } from "../service/gamestateservice";

enum PlayerAction {
  PICK_AXE_SWING
}

export class Player {
  private _x: number;
  private _y: number;
  private _speed: number;
  private _direction: string;

  private _action: PlayerAction | null = null;
  private image: HTMLImageElement | null = null;
  private selectedItem: Item | null = null;
  private animation : PlayerWalkUpDownAnimation | PlayerWalkLeftRightAnimation | PlayerPickAxeLeftRightAnimation | undefined;

  private playerImages: { [key: string]: string } = {};
  private imageCache: { [key: string]: HTMLImageElement } = {};

  private keyState: { [key: string]: boolean } = {};
  private selectedItemSubscriber: Subscription = new Subscription;

  constructor(x: number, y: number, speed: number, direction: string, private keyService: KeyService, private inventoryService: InventoryService, private gameStateService: GameStateService) {
    this._x = x; 
    this._y = y;
    this._speed = speed;
    this._direction = direction;

    this.selectedItemSubscriber = this.inventoryService.selectedItem$.subscribe((item: Item | null) => {
      this.selectedItem = item;
    });
  }

  get x() {
    return this._x;
  }

  set x(x: number) {
    this._x = x;
  }

  get y() {
    return this._y;
  }

  set y(y: number) {
    this._y = y;
  }

  get speed() {
    return this._speed;
  }

  set speed(speed: number) {
    this._speed = speed;
  }

  get direction() {
    return this._direction;
  }

  set direction(direction: string) {
    this._direction = direction;
  }

  get action() : PlayerAction | null {
    return this._action;
  }

  set action(action: PlayerAction | null) {
    this._action = action;
  }

  update() {
    const isXPressed = this.keyService.isKeyPressed('x');
    if (isXPressed && this.action === null && this.selectedItem instanceof PickAxe) {
      this.action = PlayerAction.PICK_AXE_SWING;
      const {col, row} = this.getPickAxeTile();
      const tile = 
      this.animation = new PlayerPickAxeLeftRightAnimation();
      return;
    }
    if (this.action === PlayerAction.PICK_AXE_SWING) {
      return;
    }

    const input = this.keyService.getPlayerDirection();
    
    if (input === undefined) {
      this.animation = undefined;
      return;
    }

    if (this.direction !== input) {
      this.animation = undefined;
    }

    const shift = this.keyService.isKeyPressed('shift');

    this.direction = input;
    this.updateSpeed(shift);

    if (this.animation === undefined) {
      if (this.direction === "up" || this.direction === "down") {
        this.animation = new PlayerWalkUpDownAnimation();
        return;
      }
      else if (this.direction === "left" || this.direction === "right") {
        this.animation = new PlayerWalkLeftRightAnimation();
        return;
      }
      
      if (this.keyService.isKeyPressed('x')) {
        console.log("X pressed!");
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.animation !== undefined) {
      const { source, xOffset, yOffset, action } = this.animation.getImage(this.direction);

      const isAnimationFinished = this.animation.isAnimationFinished();
      if (isAnimationFinished) {
        this.animation = undefined;
        this.action = null;
      }

      this.image = ImageService.getImage(source);

      const newXPos = this.x + xOffset;
      const newYPos = this.y + yOffset;

      if (this.image) {
        ctx.drawImage(this.image, newXPos, newYPos);
      }
    }
    else {
      const src = this.getDefaultImageSrc(this.direction);
      this.image = ImageService.getImage(src);

      if (this.image) {
        ctx.drawImage(this.image, this.x, this.y);
      }
    }
  }

  getDefaultImageSrc(direction: string | undefined) {
    if (direction === "up") {
        return "assets/player_ps_up.png";
    }
    else if (direction === "down") {
        return "assets/player_sd_down.png";
    }
    else if (direction === "left") {
        return "assets/player_ps_left.png";
    }
    else if (direction === "right") {
        return "assets/player_ps_right.png";
    }

    throw new Error("Invalid direction set for player");
  }
  
  updatePlayerPosition(direction: string | undefined) {
    if (direction === "up") {
      this.y -= this.speed;
      if (this.y < 0) {
        this.y = 0;
      }
    }
    else if (direction === "down") {
      this.y += this.speed;
      // TODO - replace 50 with height variable for if I change the player height in the future
      if (this.y > GameComponent.height - 96) {
        this.y = GameComponent.height - 96;
      }
    }
    else if (direction === "left") {
      this.x -= this.speed;
      if (this.x < 0) {
        this.x = 0;
      }
    }
    else if (direction === "right") {
      this.x += this.speed;
      // TODO - replace 50 with width variable for if I change the player width in the future
      if (this.x > GameComponent.width - 50) {
        this.x = GameComponent.width - 50;
      }
    }
  }

  updateSpeed(shift: boolean) {
    this.speed = shift ? 5 : 3;
  }

  getPickAxeTile(): {col: number, row: number} {
    const canvasXPos = this.gameStateService.getCanvasXPos();
    const canvasYPos = this.gameStateService.getCanvasYPos();

    const playerMapXPos = this.x + canvasXPos;
    const playerMapYPos = this.y + canvasYPos;

    if (this.direction === 'left') {
      const pickAxeXPos = playerMapXPos - 35;
      const pickAxeYPos = playerMapYPos + 65;

      const tileCol = Math.floor(pickAxeXPos / 50);
      const tileRow = Math.floor(pickAxeYPos / 50);

      // console.log("col: " + tileCol + ", row: " + tileRow);
      return {col: tileCol, row: tileRow};
    }
    else if (this.direction === 'right') {
      const pickAxeXPos = playerMapXPos + 79;
      const pickAxeYPos = playerMapYPos + 65;

      const tileCol = Math.floor(pickAxeXPos / 50);
      const tileRow = Math.floor(pickAxeYPos / 50);

      // console.log("col: " + tileCol + ", row: " + tileRow);
      return {col: tileCol, row: tileRow};
    }
    return {col: 0, row: 0};
  }
}