import { ImageService } from "../imageservice";
import { Item } from "./item";

export class Blue extends Item {
    static override itemName: string = "Blue";
    static override imageSrc = 'assets/blue_item.png';

    constructor(quantity: number, image: HTMLImageElement | null) {
        super(quantity, image);
    }
}