import { Animation } from "./animation";

enum Action {
  NEUTRAL,
  WALK_7,
  WALK_8,
  WALK_9,
  WALK_10,
}
  
export class PlayerWalkLeftRightAnimation extends Animation<Action> {

  actionImageMapLeft: Map<Action, string> = new Map<Action, string>();
  actionImageMapRight: Map<Action, string> = new Map<Action, string>();

  constructor() {
    super(0, 48);

    this.addFrameActionForRange(0, 6, Action.WALK_7);
    this.addFrameActionForRange(6, 13, Action.WALK_9);
    this.addFrameActionForRange(13, 18, Action.WALK_7);
    this.addFrameActionForRange(18, 24, Action.NEUTRAL);
    this.addFrameActionForRange(24, 30, Action.WALK_10);
    this.addFrameActionForRange(30, 37, Action.WALK_8);
    this.addFrameActionForRange(37, 42, Action.WALK_10);
    this.addFrameActionForRange(42, 48, Action.NEUTRAL);

    this.actionImageMapRight.set(Action.WALK_7, 'assets/player_ps_right_walk_7.png');
    this.actionImageMapRight.set(Action.WALK_8, 'assets/player_ps_right_walk_8.png');
    this.actionImageMapRight.set(Action.WALK_9, 'assets/player_ps_right_walk_9.png');
    this.actionImageMapRight.set(Action.WALK_10, 'assets/player_ps_right_walk_10.png');
    this.actionImageMapRight.set(Action.NEUTRAL, 'assets/player_ps_right.png');

    this.actionImageMapLeft.set(Action.WALK_7, 'assets/player_ps_left_walk_7.png');
    this.actionImageMapLeft.set(Action.WALK_8, 'assets/player_ps_left_walk_8.png');
    this.actionImageMapLeft.set(Action.WALK_9, 'assets/player_ps_left_walk_9.png');
    this.actionImageMapLeft.set(Action.WALK_10, 'assets/player_ps_left_walk_10.png');
    this.actionImageMapLeft.set(Action.NEUTRAL, 'assets/player_ps_left.png');
  }

  getImage(direction: string | undefined): {source: string, xOffset: number, yOffset: number, action: Action} {
    const action: Action = this.getFrameAction(this.frameIndex);
    let source: string;

    // Can we decouple direction from the caller each time for getImage, and instead have it set in the constructor when the animation first starts?

    if (direction === "left") {
        source = this.actionImageMapLeft.get(action)!;
    }
    else {
        // direction === "right"
        source = this.actionImageMapRight.get(action)!;
    }

    this.frameIndex++;
    if (this.frameIndex >= this.totalFrames) this.frameIndex = -1;
    return { source, xOffset: 0, yOffset: 0, action };
  }
}