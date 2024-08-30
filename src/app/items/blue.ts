import { Item } from "./item";

export class Blue extends Item {
    static override itemName: string = "Blue";

    constructor(quantity: number, image: HTMLImageElement | null = null) {
        super(quantity, image);
    }
}