import { ITEM_IMAGES } from "../../config/constants";
import { ImageService } from "../service/imageservice";
import { Item } from "./Item";

export class PickAxeItem extends Item {
  override itemName = "PickAxe";
  override maxStackQty: number = 1;

  constructor(quantity?: number) {
    quantity = (quantity !== undefined) ? quantity : 1;
    const image = ImageService.getImage(ITEM_IMAGES.PICKAXE);

    super(quantity, image);
  }

  override clone(): Item {
    return new PickAxeItem();
  }
}