import { Item } from "./item";

export class WheatItem extends Item {
    static override itemName: string = "Wheat";
    static override imageSrc = 'assets/wheat_inv.png';

    constructor(quantity: number, image: HTMLImageElement | null) {
        super(quantity, image);
    }
}