import { Item } from "./item";

export type ItemConstructor<T extends Item> = new (quantity: number, image: HTMLImageElement | null) => T;

export class ItemFactory {
    private static constructors: Map<string, ItemConstructor<Item>> = new Map();

    static register<T extends Item>(name: string, constructor: ItemConstructor<T>): void {
        this.constructors.set(name, constructor);
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