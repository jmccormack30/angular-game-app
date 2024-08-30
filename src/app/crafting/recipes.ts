import { Blue } from "../items/blue";
import { Item } from "../items/item";
import { Red } from "../items/red";
import { Recipe } from "./recipe";

export class Recipes {
    static recipeList: Map<string, Recipe> = new Map();

    // Static initializer block to create and add Recipe objects when the class is loaded
    static {
        const BLUE_01 = new Recipe();

        const RED = new Red(1);
        const BLUE = new Blue(1);
        BLUE_01.setItem(1, 0, RED)
        BLUE_01.setItem(1, 1, RED);
        BLUE_01.setItem(1, 2, RED);
        BLUE_01.setOutput(BLUE);

        const RED_01 = new Recipe();

        const RED_OUTPUT = new Red(3);
        RED_01.setItem(1, 1, BLUE);
        RED_01.setOutput(RED_OUTPUT);
    }
}