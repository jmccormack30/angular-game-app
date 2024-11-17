export class Animation<Action> {

  private _frameIndex: number;
  private _totalFrames: number;
  private frameActionMap: Map<number, Action>;

  constructor(frameIndex: number, totalFrames: number) {
    this._frameIndex = frameIndex;
    this._totalFrames = totalFrames;
    this.frameActionMap = new Map<number, Action>();
  }

  get frameIndex() {
    return this._frameIndex;
  }

  set frameIndex(frameIndex: number) {
    this._frameIndex = frameIndex;
  }

  get totalFrames() {
    return this._totalFrames;
  }

  set totalFrames(totalFrames: number) {
    this._totalFrames = totalFrames;
  }

  protected addFrameAction(index: number, action: Action) {
    this.frameActionMap.set(index, action);
  }

  protected addFrameActionForRange(start: number, end: number, action: Action) {
    for (let i = start; i < end; i++) {
        this.frameActionMap.set(i, action);
    }
  }

  protected getFrameAction(index: number): Action {
    return this.frameActionMap.get(index)!;
  }

  public isAnimationFinished(): boolean {
    return this.frameIndex === -1;
  }
}