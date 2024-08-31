import { Blue } from "../items/blue";
import { Red } from "../items/red";
import { Recipe } from "./recipe";

export class Recipes {
    static recipeList: Map<string, Recipe> = new Map();

    // Static initializer block to create and add Recipe objects when the class is loaded
    static {
        const BLUE_01 = new Recipe("BLUE_01");

        const RED = new Red(1, null);
        const BLUE = new Blue(1, null);
        BLUE_01.setItem(1, 0, RED)
        BLUE_01.setItem(1, 1, RED);
        BLUE_01.setItem(1, 2, RED);
        BLUE_01.setRequiredItems([RED]);
        BLUE_01.setOutput(BLUE);

        const RED_01 = new Recipe("RED_01");

        const RED_OUTPUT = new Red(3, null);
        RED_01.setItem(1, 1, BLUE);
        RED_01.setRequiredItems([BLUE]);
        RED_01.setOutput(RED_OUTPUT);

        this.recipeList.set(BLUE_01.getRecipeName(), BLUE_01);
        this.recipeList.set(RED_01.getRecipeName(), RED_01);
    }
}