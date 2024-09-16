enum Action {
    NEUTRAL = "NEUTRAL",
    PICK_AXE_1 = "pickaxe_1",
    PICK_AXE_2 = "pickaxe_2",
    PICK_AXE_3 = "pickaxe_3",
    PICK_AXE_4 = "pickaxe_4"
}
  
export class PlayerPickAxeLeftRightAnimation {
    frameIndex = 0;
    totalFrames = 30;

    actionFrameMap: Map<number, Action> = new Map<number, Action>();

    actionImageMapLeft: Map<Action, string> = new Map<Action, string>();
    actionImageMapRight: Map<Action, string> = new Map<Action, string>();

    actionOffsetMapLeftX: Map<Action, number> = new Map<Action, number>();
    actionOffsetMapLeftY: Map<Action, number> = new Map<Action, number>();

    actionOffsetMapRightX: Map<Action, number> = new Map<Action, number>();
    actionOffsetMapRightY: Map<Action, number> = new Map<Action, number>();

    constructor() {
        for (let i = 0; i < 3; i++) {
            this.actionFrameMap.set(i, Action.PICK_AXE_1)
        }
        for (let i = 3; i < 6; i++) {
            this.actionFrameMap.set(i, Action.PICK_AXE_2);
        }
        for (let i = 6; i < 9; i++) {
            this.actionFrameMap.set(i, Action.PICK_AXE_3)
        }
        for (let i = 9; i < 30; i++) {
            this.actionFrameMap.set(i, Action.PICK_AXE_4);
        }

        this.actionImageMapLeft.set(Action.PICK_AXE_1, 'assets/player_left_axe_1.png');
        this.actionImageMapLeft.set(Action.PICK_AXE_2, 'assets/player_left_axe_2.png');
        this.actionImageMapLeft.set(Action.PICK_AXE_3, 'assets/player_left_axe_3.png');
        this.actionImageMapLeft.set(Action.PICK_AXE_4, 'assets/player_left_axe_4.png');
        this.actionImageMapLeft.set(Action.NEUTRAL, 'assets/player_ps_left.png');

        this.actionImageMapRight.set(Action.PICK_AXE_1, 'assets/player_right_axe_1.png');
        this.actionImageMapRight.set(Action.PICK_AXE_2, 'assets/player_right_axe_2.png');
        this.actionImageMapRight.set(Action.PICK_AXE_3, 'assets/player_right_axe_3.png');
        this.actionImageMapRight.set(Action.PICK_AXE_4, 'assets/player_right_axe_4.png');
        this.actionImageMapRight.set(Action.NEUTRAL, 'assets/player_ps_right.png');

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

    getImage(direction: string | undefined): {src: string, xOffset: number, yOffset: number} {
        const defaultAction: Action = Action.NEUTRAL;
        const action: Action = this.actionFrameMap.get(this.frameIndex) ?? defaultAction;
        let src = "assets/player_left.png";
    
        if (action !== undefined) {
          let xOffset = 0;
          let yOffset = 0;

          if (direction === "left") {
            xOffset = this.actionOffsetMapLeftX.get(action) ?? 0;
            yOffset = this.actionOffsetMapLeftY.get(action) ?? 0;

            src = this.actionImageMapLeft.get(action) as Action;
          }
          else if (direction === 'right') {
            xOffset = this.actionOffsetMapRightX.get(action) ?? 0;
            yOffset = this.actionOffsetMapRightY.get(action) ?? 0;

            src = this.actionImageMapRight.get(action) as Action;
          }
    
          this.frameIndex++;
          if (this.frameIndex >= this.totalFrames) this.frameIndex = -1;
          return { src, xOffset, yOffset };
        }
    
        throw new Error("Invalid action / frame during animation");
    }

    isAnimationFinished(): boolean {
        return this.frameIndex === -1;
    }
}