import { Item } from "../items/item";

export class Recipe {
    private recipeName: string;
    private crafting: (Item | null)[][] = Array.from({ length: 3 }, () => Array(3).fill(null));
    private requiredItems: Item[] = [];
    private output: Item | null = null;

    constructor(recipeName: string) {
        this.recipeName = recipeName;
    } 

    public getCrafting(): (Item | null)[][] {
        return this.crafting;
    }

    public setOutput(output: Item | null) : void {
        this.output = output;
    }

    public getOutput(): Item | null {
        return this.output;
    }

    public setItem(col: number, row: number, item: Item | null) {
        this.crafting[row][col] = item;
    }

    public setRequiredItems(requiredItems: Item[]) {
        this.requiredItems = requiredItems;
    }

    public getRequiredItems(): Item[] {
        return this.requiredItems;
    }

    public getRecipeName() {
        return this.recipeName;
    }

    public toString(): string {
        return this.recipeName;
    }
}