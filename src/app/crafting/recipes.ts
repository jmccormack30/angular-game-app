/* eslint-disable @typescript-eslint/no-unused-vars */
import { Blue } from "../items/blue";
import { Bread } from "../items/bread";
import { PickAxe } from "../items/pickaxe";
import { Red } from "../items/red";
import { WheatItem } from "../items/wheat_item";
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

    const WHEAT = new WheatItem(1, null);
    const BREAD = new Bread(1, null);

    const BREAD_01 = new Recipe("BREAD_01");
    BREAD_01.setItem(1, 0, WHEAT);
    BREAD_01.setItem(1, 1, WHEAT);
    BREAD_01.setItem(1, 2, WHEAT);
    BREAD_01.setRequiredItems([WHEAT]);
    BREAD_01.setOutput(BREAD);

    this.recipeList.set(BREAD_01.getRecipeName(), BREAD_01);

    const PICKAXE = new PickAxe(1, null);
  }
}