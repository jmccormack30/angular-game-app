import { PICK_AXE_ANIMATION } from "../../config/constants";
import { Rock } from "../entities/rock";
import { Tile } from "../entities/tile";
import { Animation } from "./animation";

export enum Action {
  PICK_AXE_1,
  PICK_AXE_2,
  PICK_AXE_3,
  PICK_AXE_4
}
  
export class PlayerPickAxeLeftRightAnimation extends Animation<Action>  {

  tile: Rock | undefined;

  actionImageMapLeft: Map<Action, string> = new Map<Action, string>();
  actionImageMapRight: Map<Action, string> = new Map<Action, string>();

  actionOffsetMapLeftX: Map<Action, number> = new Map<Action, number>();
  actionOffsetMapLeftY: Map<Action, number> = new Map<Action, number>();

  actionOffsetMapRightX: Map<Action, number> = new Map<Action, number>();
  actionOffsetMapRightY: Map<Action, number> = new Map<Action, number>();

  constructor(tile: Rock | undefined) {
    super(0, 30);
    this.tile = tile;

    this.addFrameActionForRange(0, 3, Action.PICK_AXE_1);
    this.addFrameActionForRange(3, 6, Action.PICK_AXE_2);
    this.addFrameActionForRange(6, 9, Action.PICK_AXE_3);
    this.addFrameActionForRange(9, 30, Action.PICK_AXE_4);

    this.actionImageMapLeft.set(Action.PICK_AXE_1, PICK_AXE_ANIMATION.LEFT_1);
    this.actionImageMapLeft.set(Action.PICK_AXE_2, PICK_AXE_ANIMATION.LEFT_2);
    this.actionImageMapLeft.set(Action.PICK_AXE_3, PICK_AXE_ANIMATION.LEFT_3);
    this.actionImageMapLeft.set(Action.PICK_AXE_4, PICK_AXE_ANIMATION.LEFT_4);

    this.actionImageMapRight.set(Action.PICK_AXE_1, PICK_AXE_ANIMATION.RIGHT_1);
    this.actionImageMapRight.set(Action.PICK_AXE_2, PICK_AXE_ANIMATION.RIGHT_2);
    this.actionImageMapRight.set(Action.PICK_AXE_3, PICK_AXE_ANIMATION.RIGHT_3);
    this.actionImageMapRight.set(Action.PICK_AXE_4, PICK_AXE_ANIMATION.RIGHT_4);

    this.actionOffsetMapLeftX.set(Action.PICK_AXE_1, 0);
    this.actionOffsetMapLeftX.set(Action.PICK_AXE_2, -5);
    this.actionOffsetMapLeftX.set(Action.PICK_AXE_3, -38);
    this.actionOffsetMapLeftX.set(Action.PICK_AXE_4, -44);

    this.actionOffsetMapLeftY.set(Action.PICK_AXE_1, -22);
    this.actionOffsetMapLeftY.set(Action.PICK_AXE_2, -25);
    this.actionOffsetMapLeftY.set(Action.PICK_AXE_3, -13);
    this.actionOffsetMapLeftY.set(Action.PICK_AXE_4, 0);

    this.actionOffsetMapRightX.set(Action.PICK_AXE_1, -29);
    this.actionOffsetMapRightX.set(Action.PICK_AXE_2, 2);
    this.actionOffsetMapRightX.set(Action.PICK_AXE_3, 3);
    this.actionOffsetMapRightX.set(Action.PICK_AXE_4, 3);

    this.actionOffsetMapRightY.set(Action.PICK_AXE_1, -22);
    this.actionOffsetMapRightY.set(Action.PICK_AXE_2, -25);
    this.actionOffsetMapRightY.set(Action.PICK_AXE_3, -13);
    this.actionOffsetMapRightY.set(Action.PICK_AXE_4, 0);
  }

  getImage(direction: string | undefined): {source: string, xOffset: number, yOffset: number, action: Action} {
    const action: Action = this.getFrameAction(this.frameIndex);

    let xOffset: number;
    let yOffset: number
    let source: string;

    // Can we decouple direction from the caller each time for getImage, and instead have it set in the constructor when the animation first starts?

    if (direction === "left") {
        source = this.actionImageMapLeft.get(action)!;
        xOffset = this.actionOffsetMapLeftX.get(action)!;
        yOffset = this.actionOffsetMapLeftY.get(action)!;
    }
    else {
        // direction === "right"
        source = this.actionImageMapRight.get(action)!;
        xOffset = this.actionOffsetMapRightX.get(action)!;
        yOffset = this.actionOffsetMapRightY.get(action)!;
    }

    if (this.frameIndex === 20 && this.tile !== undefined) {
      this.tile.mine();
    }

    this.frameIndex++;
    if (this.frameIndex >= this.totalFrames) this.frameIndex = -1;
    return { source, xOffset, yOffset, action };
  }
}