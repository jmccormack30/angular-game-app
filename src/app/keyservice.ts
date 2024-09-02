import { Subject } from "rxjs";

export class KeyService {
    private static keyState: { [key: string]: boolean } = {};

    private static enterKeySubject = new Subject<void>();
    private static escapeKeySubject = new Subject<void>();

    public static enterKey$ = KeyService.enterKeySubject.asObservable();
    public static escapeKey$ = KeyService.escapeKeySubject.asObservable();

    private static initialized = false;

    static initialize() {
        if (this.initialized) return;
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        this.initialized = true;
      }

    private static handleKeyDown(event: KeyboardEvent) {
        KeyService.keyState[event.key] = true;

        if (event.key === 'Enter') {
            KeyService.enterKeySubject.next();
        }

        if (event.key === 'Escape') {
            KeyService.escapeKeySubject.next();
        }
    }

    private static handleKeyUp(event: KeyboardEvent) {
        KeyService.keyState[event.key] = false;
    }

    public static isKeyPressed(key: string): boolean {
        return !!KeyService.keyState[key];
      }

    public static getPlayerDirection() {
        let direction = "";
        let total = 0;

        if (KeyService.keyState['ArrowUp'] || KeyService.keyState['W'] || KeyService.keyState['w']) {
            direction = "up";
            total++;
        }
        if (KeyService.keyState['ArrowDown'] || KeyService.keyState['S'] || KeyService.keyState['s']) {
            direction = "down";
            total++;
        }
        if (KeyService.keyState['ArrowLeft'] || KeyService.keyState['A'] || KeyService.keyState['a']) {
            direction = "left";
            total++;
        }
        if (KeyService.keyState['ArrowRight'] || KeyService.keyState['D'] || KeyService.keyState['d']) {
            direction = "right";
            total++;
        }

        if (total > 1 || total === 0) {
            return undefined;
        }
        else {
            return direction;
        }
    }
}