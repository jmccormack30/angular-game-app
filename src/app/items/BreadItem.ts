import { ITEM_IMAGES } from "../../config/constants";
import { ImageService } from "../service/imageservice";
import { Item } from "./Item";

export class BreadItem extends Item {
  override itemName = "Bread";

  constructor(quantity: number) {
    const image = ImageService.getImage(ITEM_IMAGES.BREAD);
    super(quantity, image);
  }

  override clone(): Item {
    return new BreadItem(this.quantity);
  }
}