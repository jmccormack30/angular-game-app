import { Item } from "./item";

export class WheatItem extends Item {
    static override itemName: string = "Wheat";
    static override imageSrc = 'assets/wheat_inv.png';
    static override maxStackQty: number = 16;

    constructor(quantity: number, image: HTMLImageElement | null) {
        super(quantity, image);
    }
}