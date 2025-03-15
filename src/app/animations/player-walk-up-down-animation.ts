import { PLAYER_DEFAULT_IMAGES, PLAYER_WALK_ANIMATION } from "../../config/constants";
import { Animation } from "./animation";

enum Action {
  NEUTRAL,
  WALK_1,
  WALK_2,
  WALK_3,
  WALK_4,
}

export class PlayerWalkUpDownAnimation extends Animation<Action> {

  actionImageMapUp: Map<Action, string> = new Map<Action, string>();
  actionImageMapDown: Map<Action, string> = new Map<Action, string>();

  constructor() {
    super(0, 56);

    this.addFrameActionForRange(0, 7, Action.WALK_1);
    this.addFrameActionForRange(7, 15, Action.WALK_2);
    this.addFrameActionForRange(15, 21, Action.WALK_1);
    this.addFrameActionForRange(21, 28, Action.NEUTRAL);
    this.addFrameActionForRange(28, 35, Action.WALK_3);
    this.addFrameActionForRange(35, 43, Action.WALK_4);
    this.addFrameActionForRange(43, 49, Action.WALK_3);
    this.addFrameActionForRange(49, 56, Action.NEUTRAL);

    this.actionImageMapDown.set(Action.WALK_1, PLAYER_WALK_ANIMATION.UP_1);
    this.actionImageMapDown.set(Action.WALK_2, PLAYER_WALK_ANIMATION.UP_2);
    this.actionImageMapDown.set(Action.WALK_3, PLAYER_WALK_ANIMATION.UP_3);
    this.actionImageMapDown.set(Action.WALK_4, PLAYER_WALK_ANIMATION.UP_4);
    this.actionImageMapDown.set(Action.NEUTRAL, PLAYER_DEFAULT_IMAGES.DOWN);

    this.actionImageMapUp.set(Action.WALK_1, PLAYER_WALK_ANIMATION.DOWN_1);
    this.actionImageMapUp.set(Action.WALK_2, PLAYER_WALK_ANIMATION.DOWN_1);
    this.actionImageMapUp.set(Action.WALK_3, PLAYER_WALK_ANIMATION.DOWN_1);
    this.actionImageMapUp.set(Action.WALK_4, PLAYER_WALK_ANIMATION.DOWN_1);
    this.actionImageMapUp.set(Action.NEUTRAL, PLAYER_DEFAULT_IMAGES.UP);
  }

  getImage(direction: string | undefined): {source: string, xOffset: number, yOffset: number, action: Action} {
    const action: Action = this.getFrameAction(this.frameIndex);
    let source: string;

    // Can we decouple direction from the caller each time for getImage, and instead have it set in the constructor when the animation first starts?

    if (direction === "up") {
        source = this.actionImageMapUp.get(action)!;
    }
    else {
        // direction === "down"
        source = this.actionImageMapDown.get(action)!;
    }

    this.frameIndex++;
    if (this.frameIndex >= this.totalFrames) this.frameIndex = -1;
    return { source, xOffset: 0, yOffset: 0, action };
  }
}