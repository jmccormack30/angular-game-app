import { Item } from "./item";

export class Bread extends Item {
    static override itemName: string = "Bread";
    static override imageSrc = 'assets/bread.png';

    constructor(quantity: number, image: HTMLImageElement | null) {
        super(quantity, image);
    }
}