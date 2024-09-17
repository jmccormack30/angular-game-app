enum Action {
    NEUTRAL = "NEUTRAL",
    WALK7 = "walk_7",
    WALK9 = "walk_9",
    WALK8 = "walk_8",
    WALK10 = "walk10"
}
  
export class PlayerWalkLeftRightAnimation {
    frameIndex = 0;
    totalFrames = 48;

    actionFrameMap: Map<number, Action> = new Map<number, Action>();

    actionImageMapLeft: Map<Action, string> = new Map<Action, string>();
    actionImageMapRight: Map<Action, string> = new Map<Action, string>();

    constructor() {
        for (let i = 0; i < 6; i++) {
            this.actionFrameMap.set(i, Action.WALK7)
        }
        for (let i = 6; i < 13; i++) {
            this.actionFrameMap.set(i, Action.WALK9);
        }
        for (let i = 13; i < 18; i++) {
            this.actionFrameMap.set(i, Action.WALK7)
        }
        for (let i = 18; i < 24; i++) {
            this.actionFrameMap.set(i, Action.NEUTRAL);
        }
        for (let i = 24; i < 30; i++) {
            this.actionFrameMap.set(i, Action.WALK10);
        }
        for (let i = 30; i < 37; i++) {
            this.actionFrameMap.set(i, Action.WALK8);
        }
        for (let i = 37; i < 42; i++) {
            this.actionFrameMap.set(i, Action.WALK10);
        }
        for (let i = 42; i < 48; i++) {
            this.actionFrameMap.set(i, Action.NEUTRAL);
        }

        this.actionImageMapRight.set(Action.WALK7, 'assets/player_ps_right_walk_7.png');
        this.actionImageMapRight.set(Action.WALK8, 'assets/player_ps_right_walk_8.png');
        this.actionImageMapRight.set(Action.WALK9, 'assets/player_ps_right_walk_9.png');
        this.actionImageMapRight.set(Action.WALK10, 'assets/player_ps_right_walk_10.png');
        this.actionImageMapRight.set(Action.NEUTRAL, 'assets/player_ps_right.png');

        this.actionImageMapLeft.set(Action.WALK7, 'assets/player_ps_left_walk_7.png');
        this.actionImageMapLeft.set(Action.WALK8, 'assets/player_ps_left_walk_8.png');
        this.actionImageMapLeft.set(Action.WALK9, 'assets/player_ps_left_walk_9.png');
        this.actionImageMapLeft.set(Action.WALK10, 'assets/player_ps_left_walk_10.png');
        this.actionImageMapLeft.set(Action.NEUTRAL, 'assets/player_ps_left.png');
    }

    getImage(direction: string | undefined): {src: string, xOffset: number, yOffset: number, action: Action} {
        const defaultAction: Action = Action.WALK7;
        const action: Action = this.actionFrameMap.get(this.frameIndex) ?? defaultAction;
        let src = "assets/player_left.png";
    
        if (action !== undefined) {
          if (direction === "left") {
            src = this.actionImageMapLeft.get(action) as Action;
          }
          else if (direction === "right") {
            src = this.actionImageMapRight.get(action) as Action;
          }
    
          this.frameIndex++;
          if (this.frameIndex >= this.totalFrames) this.frameIndex = -1;
          return {src: src, xOffset: 0, yOffset: 0, action};
        }
    
        throw new Error("Invalid action / frame during animation");
    }

    isAnimationFinished(): boolean {
        return this.frameIndex === -1;
    }
}