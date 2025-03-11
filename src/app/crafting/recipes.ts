/* eslint-disable @typescript-eslint/no-unused-vars */
import { BreadItem } from "../items/BreadItem";
import { WheatItem } from "../items/WheatItem";
import { Recipe } from "./recipe";

export class Recipes {
  static recipeList: Map<string, Recipe> = new Map();

  // Static initializer block to create and add Recipe objects when the class is loaded
  static {
    const WHEAT = new WheatItem(1);
    const BREAD = new BreadItem(1);

    const BREAD_01 = new Recipe("BREAD_01");
    BREAD_01.setItem(1, 0, WHEAT);
    BREAD_01.setItem(1, 1, WHEAT);
    BREAD_01.setItem(1, 2, WHEAT);
    BREAD_01.setRequiredItems([WHEAT]);
    BREAD_01.setOutput(BREAD);

    this.recipeList.set(BREAD_01.getRecipeName(), BREAD_01);
  }
}