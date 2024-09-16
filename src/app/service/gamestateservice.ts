import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Player } from "../entities/player";
import { GameComponent } from "../game/game.component";

@Injectable({ providedIn: 'root'})
export class GameStateService {
    private canvasXPosSource = new BehaviorSubject<number>(0);
    private canvasYPosSource = new BehaviorSubject<number>(0);

    canvasXPos = this.canvasXPosSource.asObservable();
    canvasYPos = this.canvasYPosSource.asObservable();

    getCanvasXPos() {
        return this.canvasXPosSource.getValue();
    }

    getCanvasYPos() {
        return this.canvasYPosSource.getValue();
    }

    updateCanvasXPos(value: number) {
        this.canvasXPosSource.next(value);
    }

    updateCanvasYPos(value: number) {
        this.canvasYPosSource.next(value);
    }

    updateMapPositionForPlayer(xAdjustment: number, yAdjustment: number, player: Player) {
        if (player) {
            const canvasXPos = this.canvasXPosSource.getValue();
            const canvasYPos = this.canvasYPosSource.getValue();

            if (yAdjustment < 0) {
                if (canvasYPos === 0 || player.yPos > 433) {
                    player.updatePlayerPosition('up');
                }
                else {
                    const newYPos = Math.max((canvasYPos - player.speed), 0);
                    this.updateCanvasYPos(newYPos);
                }
            }
            else if (yAdjustment > 0) {
                if (canvasYPos >= GameComponent.mapPixelHeight - GameComponent.height || player.yPos < 443) {
                    player.updatePlayerPosition('down');
                }
                else {
                    const newYPos = Math.min((canvasYPos + player.speed), (GameComponent.mapPixelHeight - GameComponent.height));
                    this.updateCanvasYPos(newYPos);
                }
            }

            if (xAdjustment < 0) {
                if (canvasXPos === 0 || player.xPos > 625) {
                    player.updatePlayerPosition('left');
                }
                else {
                    const newXPos = Math.max((canvasXPos - player.speed), 0);
                    this.updateCanvasXPos(newXPos);
                }
            }
            else if (xAdjustment > 0) {
                if (canvasXPos >= GameComponent.mapPixelWidth - GameComponent.width || player.xPos < 625) {
                    player.updatePlayerPosition('right');
                }
                else {
                    const newXPos = Math.min((canvasXPos + player.speed), (GameComponent.mapPixelWidth - GameComponent.width));
                    this.updateCanvasXPos(newXPos);
                }
            }
        }
    }
}