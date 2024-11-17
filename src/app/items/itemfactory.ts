import { Injectable } from "@angular/core";
import { ImageService } from "../service/imageservice";
import { Item } from "./item";

export type ItemConstructor<T extends Item> = new (quantity: number, image: HTMLImageElement | null) => T;

@Injectable({
  providedIn: 'root'
})
export class ItemFactory {
  constructor() {}

  static constructors: Map<string, ItemConstructor<Item>> = new Map();

  static register<T extends Item>(name: string, constructor: ItemConstructor<T>): void {
    this.constructors.set(name, constructor);
  }

  static createItem(ItemClass: typeof Item, quantity: number) {
    const Constructor = this.constructors.get(ItemClass.itemName);
    if (!Constructor) {
      throw new Error(`No constructor registered for item name: ${name}`);
    }
    const img = ImageService.getImage(ItemClass.imageSrc);
    return new Constructor(quantity, img);
  }

  static clone(item: Item): Item {
    const name = item.getItemName();
    const Constructor = this.constructors.get(name);
    if (!Constructor) {
      throw new Error(`No constructor registered for item name: ${name}`);
    }
    return new Constructor(item.quantity, item.image);
  }
}