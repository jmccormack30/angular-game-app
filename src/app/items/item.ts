import { ItemConstructor, ItemFactory } from "./itemfactory";

export class Item {
    quantity: number;
    image: HTMLImageElement | null;
    static maxStackQty: number = 64;
    static itemName: string;
    static imageSrc: string;

    constructor(quantity: number, image: HTMLImageElement | null) {
        this.quantity = quantity;
        this.image = image;
        ItemFactory.register(this.getItemName(), this.constructor as ItemConstructor<Item>);
    }

    // Static method to get the item name of the class
    static getItemName(): string {
        return this.itemName;
    }

    // Instance method to get the item name of the class
    getItemName(): string {
        return (this.constructor as typeof Item).getItemName();
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

    equals(other: Item): boolean {
        return other !== null && other instanceof Item && this.getItemName() === other.getItemName();
    }

    clone(): Item {
        return ItemFactory.clone(this);
    }
}