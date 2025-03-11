export abstract class Item {
  quantity: number;
  image: HTMLImageElement | null;
  maxStackQty: number = 100;
  abstract itemName: string;

  constructor(quantity: number, image: HTMLImageElement | null) {
    if (quantity > this.maxStackQty) {
      throw new Error(`Can't create ${this.getItemName()} with quantity ${quantity}, max is ${this.maxStackQty}.`)
    }
    this.quantity = quantity;
    this.image = image;
  }

  getItemName(): string {
    return this.itemName;
  }

  // Method to convert to string
  toString(): string {
    return `${this.getItemName()} - Quantity: ${this.quantity}`;
  }

  // Method to check if they are the same item name
  isSameItemType(other: Item): boolean {
    return other !== null && other instanceof Item &&
          this.getItemName() === other.getItemName();
  }

  abstract clone(): Item
}