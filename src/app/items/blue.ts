import { Item } from "./item";

export class Blue extends Item {

    constructor(name: string, quantity: number, image: HTMLImageElement) {
        super(name, quantity, image);
    };
}