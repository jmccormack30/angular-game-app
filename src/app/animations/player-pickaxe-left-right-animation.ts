import { Animation } from "./animation";

export enum Action {
  PICK_AXE_1,
  PICK_AXE_2,
  PICK_AXE_3,
  PICK_AXE_4
}
  
export class PlayerPickAxeLeftRightAnimation extends Animation<Action>  {

  actionImageMapLeft: Map<Action, string> = new Map<Action, string>();
  actionImageMapRight: Map<Action, string> = new Map<Action, string>();

  actionOffsetMapLeftX: Map<Action, number> = new Map<Action, number>();
  actionOffsetMapLeftY: Map<Action, number> = new Map<Action, number>();

  actionOffsetMapRightX: Map<Action, number> = new Map<Action, number>();
  actionOffsetMapRightY: Map<Action, number> = new Map<Action, number>();

  constructor() {
    super(0, 30);

    this.addFrameActionForRange(0, 3, Action.PICK_AXE_1);
    this.addFrameActionForRange(3, 6, Action.PICK_AXE_2);
    this.addFrameActionForRange(6, 9, Action.PICK_AXE_3);
    this.addFrameActionForRange(9, 30, Action.PICK_AXE_4);

    this.actionImageMapLeft.set(Action.PICK_AXE_1, 'assets/player_left_axe_1.png');
    this.actionImageMapLeft.set(Action.PICK_AXE_2, 'assets/player_left_axe_2.png');
    this.actionImageMapLeft.set(Action.PICK_AXE_3, 'assets/player_left_axe_3.png');
    this.actionImageMapLeft.set(Action.PICK_AXE_4, 'assets/player_left_axe_4.png');

    this.actionImageMapRight.set(Action.PICK_AXE_1, 'assets/player_right_axe_1.png');
    this.actionImageMapRight.set(Action.PICK_AXE_2, 'assets/player_right_axe_2.png');
    this.actionImageMapRight.set(Action.PICK_AXE_3, 'assets/player_right_axe_3.png');
    this.actionImageMapRight.set(Action.PICK_AXE_4, 'assets/player_right_axe_4.png');

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

  getImage(direction: string | undefined): {source: string, xOffset: number, yOffset: number, action: Action} {
    const action: Action = this.getFrameAction(this.frameIndex);

    let xOffset: number;
    let yOffset: number
    let source: string;

    // Can we decouple direction from the caller each time for getImage, and instead have it set in the constructor when the animation first starts?

    if (direction === "left") {
        source = this.actionImageMapLeft.get(action)!;
        xOffset = this.actionOffsetMapLeftX.get(action)!;
        yOffset = this.actionOffsetMapLeftY.get(action)!;
    }
    else {
        // direction === "right"
        source = this.actionImageMapRight.get(action)!;
        xOffset = this.actionOffsetMapRightX.get(action)!;
        yOffset = this.actionOffsetMapRightY.get(action)!;
    }

    this.frameIndex++;
    if (this.frameIndex >= this.totalFrames) this.frameIndex = -1;
    return { source, xOffset, yOffset, action };
  }
}