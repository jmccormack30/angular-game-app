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

    this.actionImageMapDown.set(Action.WALK_1, 'assets/player_ps_down_run_2.png');
    this.actionImageMapDown.set(Action.WALK_2, 'assets/player_ps_down_run_3.png');
    this.actionImageMapDown.set(Action.WALK_3, "assets/player_ps_down_run_4.png");
    this.actionImageMapDown.set(Action.WALK_4, 'assets/player_ps_down_run_5.png');
    this.actionImageMapDown.set(Action.NEUTRAL, 'assets/player_sd_down.png');

    this.actionImageMapUp.set(Action.WALK_1, 'assets/player_ps_up_run_2.png');
    this.actionImageMapUp.set(Action.WALK_2, 'assets/player_ps_up_run_3.png');
    this.actionImageMapUp.set(Action.WALK_3, 'assets/player_ps_up_run_4.png');
    this.actionImageMapUp.set(Action.WALK_4, 'assets/player_ps_up_run_5.png');
    this.actionImageMapUp.set(Action.NEUTRAL,'assets/player_ps_up.png');
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