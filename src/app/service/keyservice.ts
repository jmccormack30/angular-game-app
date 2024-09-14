import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class KeyService {
    private keyState: { [key: string]: boolean } = {};

    public enterKeySubject = new Subject<void>();
    public escapeKeySubject = new Subject<void>();

    public hotbarSubject = new Subject<string>();
    public hotbarKey$ = this.hotbarSubject.asObservable();

    public oneKeySubject = new Subject<void>();
    public twoKeySubject = new Subject<void>();
    public threeKeySubject = new Subject<void>();
    public fourKeySubject = new Subject<void>();
    public fiveKeySubject = new Subject<void>();
    public sixKeySubject = new Subject<void>();
    public sevenKeySubject = new Subject<void>();
    public eightKeySubject = new Subject<void>();
    public nineKeySubject = new Subject<void>();

    public enterKey$ = this.enterKeySubject.asObservable();
    public escapeKey$ = this.escapeKeySubject.asObservable();

    public oneKey$ = this.escapeKeySubject.asObservable();
    public twoKey$ = this.escapeKeySubject.asObservable();
    public threeKey$ = this.escapeKeySubject.asObservable();
    public fourKey$ = this.escapeKeySubject.asObservable();
    public fiveKey$ = this.escapeKeySubject.asObservable();
    public sixKey$ = this.escapeKeySubject.asObservable();
    public sevenKey$ = this.escapeKeySubject.asObservable();
    public eightKey$ = this.escapeKeySubject.asObservable();
    public nineKey$ = this.escapeKeySubject.asObservable();

    constructor() {
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    private handleKeyDown(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (key === 'shift') return;

        this.keyState[key] = true;
        this.keyState['shift'] = event.shiftKey;

        if (key === 'enter') {
            this.enterKeySubject.next();
        }
        else if (key === 'escape') {
            this.escapeKeySubject.next();
        }
        else if (this.isHotbarNumber(key)) {
            this.hotbarSubject.next(key);
        }
    }

    private handleKeyUp(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (key === 'shift') return;

        this.keyState[key] = false;
        this.keyState['shift'] = event.shiftKey;
    }

    public isKeyPressed(key: string): boolean {
        key = key.toLowerCase();
        return !!this.keyState[key];
      }

    public getPlayerDirection() {
        let direction = "";
        let total = 0;

        if (!!this.keyState['arrowup'] || !!this.keyState['w']) {
            direction = "up";
            total++;
        }
        if (!!this.keyState['arrowdown'] || !!this.keyState['s']) {
            direction = "down";
            total++;
        }
        if (!!this.keyState['arrowleft'] || !!this.keyState['a']) {
            direction = "left";
            total++;
        }
        if (!!this.keyState['arrowright'] || !!this.keyState['d']) {
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

    private isHotbarNumber(key: string) {
        const num = Number(key);
        return !isNaN(num) && Number.isInteger(num) && num >= 1 && num < 10;
    }
}