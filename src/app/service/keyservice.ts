import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class KeyService {
    private keyState: { [key: string]: boolean } = {};
    // private static modifierKeyState: { [key: string]: boolean } = {};

    public enterKeySubject = new Subject<void>();
    public escapeKeySubject = new Subject<void>();

    public enterKey$ = this.enterKeySubject.asObservable();
    public escapeKey$ = this.escapeKeySubject.asObservable();

    constructor() {
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        // window.addEventListener('keypress', this.handleKeyPress.bind(this));
    }

    private handleKeyPress(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (key === 'Shift') return;
        console.log("Key DOWN: " + key + ", isShift = " + event.shiftKey);

        this.keyState[key] = true;
        this.keyState['Shift'] = event.shiftKey;

        if (event.key === 'Enter') {
            this.enterKeySubject.next();
        }
        if (event.key === 'Escape') {
            this.escapeKeySubject.next();
        }
    }

    private handleKeyDown(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (key === 'Shift') return;
        console.log("Key DOWN: " + key + ", isShift = " + event.shiftKey);

        this.keyState[key] = true;
        this.keyState['Shift'] = event.shiftKey;

        if (event.key === 'Enter') {
            this.enterKeySubject.next();
        }
        if (event.key === 'Escape') {
            this.escapeKeySubject.next();
        }
    }

    private handleKeyUp(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (key === 'Shift') return;

        console.log("Key UP: " + key);
        console.log(this.keyState[key]);

        this.keyState[key] = false;
        this.keyState['Shift'] = event.shiftKey;

        console.log(this.keyState[event.key]);
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
            console.log('ArrowRight = ' + !!this.keyState['ArrowRight'] + ", d = " + !!this.keyState['d']);
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