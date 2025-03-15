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
  
export class PlayerPickAxeUpAnimation extends Animation<Action>  {

  tile: Rock | undefined;

  actionImageMapUp: Map<Action, string> = new Map<Action, string>();

  actionOffsetMapUpX: Map<Action, number> = new Map<Action, number>();
  actionOffsetMapUpY: Map<Action, number> = new Map<Action, number>();

  constructor(tile: Rock | undefined) {
    super(0, 8);
    this.tile = tile;

    this.addFrameActionForRange(0, 4, Action.PICK_AXE_1);
    this.addFrameActionForRange(4, 8, Action.PICK_AXE_2);

    this.actionImageMapUp.set(Action.PICK_AXE_1, PICK_AXE_ANIMATION.UP_1);
    this.actionImageMapUp.set(Action.PICK_AXE_2, PICK_AXE_ANIMATION.UP_2);
    // this.actionImageMapUp.set(Action.PICK_AXE_3, PICK_AXE_ANIMATION.UP_1);
    // this.actionImageMapUp.set(Action.PICK_AXE_4, PICK_AXE_ANIMATION.UP_1);

    this.actionOffsetMapUpX.set(Action.PICK_AXE_1, 1);
    this.actionOffsetMapUpX.set(Action.PICK_AXE_2, 1);
    // this.actionOffsetMapUpX.set(Action.PICK_AXE_3, -38);
    // this.actionOffsetMapUpX.set(Action.PICK_AXE_4, -44);

    this.actionOffsetMapUpY.set(Action.PICK_AXE_1, -54);
    this.actionOffsetMapUpY.set(Action.PICK_AXE_2, -18);
    // this.actionOffsetMapUpY.set(Action.PICK_AXE_3, -13);
    // this.actionOffsetMapUpY.set(Action.PICK_AXE_4, 0);
  }

  getImage(direction: string | undefined): {source: string, xOffset: number, yOffset: number, action: Action} {
    const action: Action = this.getFrameAction(this.frameIndex);

    let xOffset: number = 0;
    let yOffset: number = 0;
    let source: string;

    // Can we decouple direction from the caller each time for getImage, and instead have it set in the constructor when the animation first starts?

    if (direction === "up") {
        source = this.actionImageMapUp.get(action)!;
        xOffset = this.actionOffsetMapUpX.get(action)!;
        yOffset = this.actionOffsetMapUpY.get(action)!;
    }
    else {
        source = PICK_AXE_ANIMATION.UP_2;
    }

    this.frameIndex++;
    if (this.frameIndex >= this.totalFrames) this.frameIndex = -1;
    return { source, xOffset, yOffset, action };
  }
}