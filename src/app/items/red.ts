import { Item } from "./item";

export class Red extends Item {

    constructor(name: string, quantity: number, image: HTMLImageElement) {
        super(name, quantity, image);
    };
}