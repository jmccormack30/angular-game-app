import { Item } from "./item";

export class PickAxe extends Item {
    static override itemName: string = "PickAxe";
    static override imageSrc = 'assets/pickaxe.png';
    static override maxStackQty: number = 1;

    constructor(quantity: number, image: HTMLImageElement | null) {
        super(quantity, image);
    }
}