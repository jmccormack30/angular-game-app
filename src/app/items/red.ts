import { Item } from "./item";

export class Red extends Item {
  static override itemName: string = "Red";
  static override imageSrc = 'assets/red_item.png';

  constructor(quantity: number, image: HTMLImageElement | null) {
    super(quantity, image);
  }
}