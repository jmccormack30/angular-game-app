import { ITEM_IMAGES } from "../../config/constants";
import { ImageService } from "../service/imageservice";
import { Item } from "./Item";

export class RockItem extends Item {
  override itemName = "Rock";

  constructor(quantity: number) {
    const image = ImageService.getImage(ITEM_IMAGES.ROCK);
    super(quantity, image);
  }

  override clone(): Item {
    return new RockItem(this.quantity);
  }
}