import { Item } from "./item";

export class Red extends Item {
    static override itemName: string = "Red";

    constructor(quantity: number, image: HTMLImageElement | null = null) {
        super(quantity, image);
    }
}