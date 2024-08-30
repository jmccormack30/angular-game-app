import { Item } from "../items/item";

export class Recipe {
    private crafting: (Item | null)[][] = Array.from({ length: 3 }, () => Array(3).fill(null));
    private output: Item | null = null;

    constructor() {} 

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
        this.crafting[col][row] = item;
    }
}