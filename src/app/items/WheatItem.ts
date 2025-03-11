import { ITEM_IMAGES } from "../../config/constants";
import { ImageService } from "../service/imageservice";
import { Item } from "./Item";

export class WheatItem extends Item {
  override itemName: string = "Wheat";

  constructor(quantity: number) {
    const image = ImageService.getImage(ITEM_IMAGES.WHEAT);
    super(quantity, image);
  }

  override clone(): Item {
    return new WheatItem(this.quantity);
  }
}