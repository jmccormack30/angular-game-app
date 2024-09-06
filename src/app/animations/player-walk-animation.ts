enum Action {
  NEUTRAL = "NEUTRAL",
  WALK1 = "down_walk_1",
  WALK2 = "down_walk_2",
  WALK3 = "down_walk_3",
  WALK4 = "down_walk_4"
}

export class PlayerWalkAnimation {

  frameIndex = 0;
  totalFrames = 56;

  actionFrameMap: Map<number, Action> = new Map<number, Action>();

  actionImageMapUp: Map<Action, string> = new Map<Action, string>();
  actionImageMapDown: Map<Action, string> = new Map<Action, string>();
  actionImageMapLeft: Map<Action, string> = new Map<Action, string>();
  actionImageMapRight: Map<Action, string> = new Map<Action, string>();

  constructor() {
    for (let i = 0; i < 7; i++) {
      this.actionFrameMap.set(i, Action.WALK1)
    }
    for (let i = 7; i < 15; i++) {
      this.actionFrameMap.set(i, Action.WALK2);
    }
    for (let i = 15; i < 21; i++) {
      this.actionFrameMap.set(i, Action.WALK1)
    }
    for (let i = 21; i < 28; i++) {
      this.actionFrameMap.set(i, Action.NEUTRAL);
    }
    for (let i = 28; i < 35; i++) {
      this.actionFrameMap.set(i, Action.WALK3);
    }
    for (let i = 35; i < 43; i++) {
      this.actionFrameMap.set(i, Action.WALK4);
    }
    for (let i = 43; i < 49; i++) {
      this.actionFrameMap.set(i, Action.WALK3);
    }
    for (let i = 49; i < 56; i++) {
      this.actionFrameMap.set(i, Action.NEUTRAL);
    }

    this.actionImageMapDown.set(Action.WALK1, 'assets/player_ps_down_run_2.png');
    this.actionImageMapDown.set(Action.WALK2, 'assets/player_ps_down_run_3.png');
    this.actionImageMapDown.set(Action.WALK3, "assets/player_ps_down_run_4.png");
    this.actionImageMapDown.set(Action.WALK4, 'assets/player_ps_down_run_5.png');
    this.actionImageMapDown.set(Action.NEUTRAL, 'assets/player_sd_down.png');

    this.actionImageMapUp.set(Action.WALK1, 'assets/player_ps_up_run_2.png');
    this.actionImageMapUp.set(Action.WALK2, 'assets/player_ps_up_run_3.png');
    this.actionImageMapUp.set(Action.WALK3, 'assets/player_ps_up_run_4.png');
    this.actionImageMapUp.set(Action.WALK4, 'assets/player_ps_up_run_5.png');
    this.actionImageMapUp.set(Action.NEUTRAL,'assets/player_ps_up.png');

    this.actionImageMapLeft.set(Action.WALK1, "assets/player_left_walk_3.png");
    this.actionImageMapLeft.set(Action.WALK2, "assets/player_left_2.png");

    this.actionImageMapRight.set(Action.WALK1, "assets/player_right_walk_3.png");
    this.actionImageMapRight.set(Action.WALK2, "assets/player_right_2.png");
  }

  getImage(direction: string | undefined) {
    const defaultAction: Action = Action.WALK1;
    const action: Action = this.actionFrameMap.get(this.frameIndex) ?? defaultAction;
    let image = "assets/player_down.png";

    if (action !== undefined) {
      if (direction === "up") {
        image = this.actionImageMapUp.get(action) as Action;
      }
      else if (direction === "down") {
        image = this.actionImageMapDown.get(action) as Action;
      }
      else if (direction === "left") {
        image = this.actionImageMapLeft.get(action) as Action;
      }
      else if (direction === "right") {
        image = this.actionImageMapRight.get(action) as Action;
      }

      this.frameIndex++;
      if (this.frameIndex >= this.totalFrames) this.frameIndex = 0;
      return image;
    }

    throw new Error("Invalid action / frame during animation");
  }
}
