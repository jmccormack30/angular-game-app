import { Animation } from "./animation";

enum Action {
  ROCK_1,
  ROCK_2,
}
  
export class RockHitAnimation extends Animation<Action> {

  actionImageMap: Map<Action, string> = new Map<Action, string>();
  actionOffsetMapX: Map<Action, number> = new Map<Action, number>();
  actionOffsetMapY: Map<Action, number> = new Map<Action, number>();

  constructor() {
    super(0, 16);

    this.addFrameActionForRange(0, 8, Action.ROCK_1);
    this.addFrameActionForRange(8, 16, Action.ROCK_2);

    this.actionImageMap.set(Action.ROCK_1, 'assets/rock.png');
    this.actionImageMap.set(Action.ROCK_2, 'assets/rock.png');

    this.actionOffsetMapX.set(Action.ROCK_1, 0);
    this.actionOffsetMapY.set(Action.ROCK_1, 2);

    this.actionOffsetMapX.set(Action.ROCK_2, 0);
    this.actionOffsetMapY.set(Action.ROCK_2, 0);
  }

  getImage(): {source: string, xOffset: number, yOffset: number, action: Action} {
    const action: Action = this.getFrameAction(this.frameIndex);

    // Can we decouple direction from the caller each time for getImage, and instead have it set in the constructor when the animation first starts?

    const xOffset = this.actionOffsetMapX.get(action)!;
    const yOffset = this.actionOffsetMapY.get(action)!;
    
    const source = this.actionImageMap.get(action)!;

    this.frameIndex++;
    if (this.frameIndex >= this.totalFrames) this.frameIndex = -1;
    return { source, xOffset, yOffset, action };
  }
}