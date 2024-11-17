import { Item } from "./item";

export class Blue extends Item {
  static override itemName: string = "Blue";
  static override imageSrc = 'assets/wheat_inv.png';

  constructor(quantity: number, image: HTMLImageElement | null) {
    super(quantity, image);
  }
}