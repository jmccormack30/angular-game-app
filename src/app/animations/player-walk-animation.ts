enum Action {
  WALK1 = "down_walk_1",
  WALK2 = "down_walk_2"
}

export class PlayerWalkAnimation {

  frameIndex = 0;
  totalFrames = 30;

  actionFrameMap: Map<number, Action> = new Map<number, Action>();

  actionImageMapUp: Map<Action, string> = new Map<Action, string>();
  actionImageMapDown: Map<Action, string> = new Map<Action, string>();
  actionImageMapLeft: Map<Action, string> = new Map<Action, string>();
  actionImageMapRight: Map<Action, string> = new Map<Action, string>();

  constructor() {
    for (let i = 0; i <= 14; i++) {
      this.actionFrameMap.set(i, Action.WALK1)
    }
    for (let i = 15; i <= 29; i++) {
      this.actionFrameMap.set(i, Action.WALK2);
    }

    this.actionImageMapDown.set(Action.WALK1, "assets/player_down_walk_1.png");
    this.actionImageMapDown.set(Action.WALK2, "assets/player_down_walk_2.png");
  }

  getImage(direction: string | undefined) {
    const defaultAction: Action = Action.WALK1;
    const action: Action = this.actionFrameMap.get(this.frameIndex) ?? defaultAction;
    let image = "assets/player_down.png";

    if (action !== undefined) {
      if (direction === "up") {
        // TODO
      }
      else if (direction === "down") {
        image = this.actionImageMapDown.get(action) as Action;
      }
      else if (direction === "left") {
        // TODO
      }
      else if (direction === "right") {
        // TODO
      }

      this.frameIndex++;
      if (this.frameIndex >= this.totalFrames) this.frameIndex = 0;
      return image;
    }

    throw new Error("Invalid action / frame during animation");
  }
}
