enum Action {
    NEUTRAL = "NEUTRAL",
    ROCK_1 = "rock_1",
    ROCK_2 = "rock_2",
    ROCK_3 = "rock_3",
    ROCK_4 = "rock_4"
}
  
export class RockHitAnimation {
    frameIndex = 0;
    totalFrames = 16;

    actionFrameMap: Map<number, Action> = new Map<number, Action>();
    actionImageMap: Map<Action, string> = new Map<Action, string>();

    actionOffsetMapX: Map<Action, number> = new Map<Action, number>();
    actionOffsetMapY: Map<Action, number> = new Map<Action, number>();

    constructor() {
        for (let i = 0; i < 8; i++) {
            this.actionFrameMap.set(i, Action.ROCK_1)
        }
        for (let i = 8; i < 16; i++) {
            this.actionFrameMap.set(i, Action.ROCK_2)
        }

        this.actionImageMap.set(Action.ROCK_1, 'assets/rock.png');
        this.actionImageMap.set(Action.ROCK_2, 'assets/rock.png');

        this.actionOffsetMapX.set(Action.ROCK_1, 0);
        this.actionOffsetMapY.set(Action.ROCK_1, 2);

        this.actionOffsetMapX.set(Action.ROCK_2, 0);
        this.actionOffsetMapY.set(Action.ROCK_2, 0);
    }

    getImage(): {src: string, xOffset: number, yOffset: number, action: Action} {
        const defaultAction: Action = Action.NEUTRAL;
        const action: Action = this.actionFrameMap.get(this.frameIndex) ?? defaultAction;
        let src = "assets/player_left.png";
    
        if (action !== undefined) {
          const xOffset = this.actionOffsetMapX.get(action) ?? 0;
          const yOffset = this.actionOffsetMapY.get(action) ?? 0;
          src = this.actionImageMap.get(action) as Action;
    
          this.frameIndex++;
          if (this.frameIndex >= this.totalFrames) this.frameIndex = -1;
          return { src, xOffset, yOffset, action };
        }
    
        throw new Error("Invalid action / frame during animation");
    }

    isAnimationFinished(): boolean {
        return this.frameIndex === -1;
    }
}