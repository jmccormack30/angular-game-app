import { Component, Output, EventEmitter, Renderer2, ElementRef } from '@angular/core';
import { Item } from '../items/item';
import { Red } from '../items/red';
import { Blue } from '../items/blue'
import { Recipe } from '../crafting/recipe';
import { Recipes } from '../crafting/recipes';
import { ItemFactory } from '../items/itemfactory';
import { KeyService } from '../keyservice';


@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent {
  @Output() close = new EventEmitter<void>();

  private floatingItem: HTMLElement | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public itemToMove: any = null;
  private itemToMoveGridType: string | null | undefined;
  private itemToMoveCol: number = -1;
  private itemToMoveRow: number = -1;
  public isInventoryOpen = false;

  lastItemPickUpTime: number | null = null;
  pickUpThreshold: number = 250; // Time window in milliseconds

  armor: (Item | null)[];
  items: (Item | null)[][];
  crafting: (Item | null)[][];
  output: Item | null;

  currentRecipe: Recipe | null = null;
  current_qty_craftable = 0;

  constructor(private renderer: Renderer2, private el: ElementRef) {
    this.armor = Array(4).fill(null);
    this.items = Array.from({ length: 10 }, () => Array(3).fill(null));
    this.crafting = Array.from({ length: 3 }, () => Array(3).fill(null));
    this.output = null;

    const red = ItemFactory.createItem(Red, 10);
    const blue = ItemFactory.createItem(Blue, 25);
    this.items[0][0] = red;
    this.items[1][0] = blue;
  }

  toggleInventory() {
    if (this.isInventoryOpen) {
      this.closeInventory();
    }
    else {
      this.openInventory();
    }
  }

  openInventory() {
    this.isInventoryOpen = true;
  }

  closeInventory() {
    if (this.isInventoryOpen) {
      this.returnItemToCell();
      this.clearItemToMove();
      this.output = null;
      if (this.floatingItem) {
        this.renderer.removeChild(document.body, this.floatingItem);
      }
      if (this.moveCraftingToInventory()) {
        this.isInventoryOpen = false;
        this.close.emit();
      }
      else {
        console.log("Failed to move crafting to inventory!!!!!");
      }
    }
  }

  getImageHtml(item: Item): string {
    const img = item.image;
    return img ? img.outerHTML : '';
  }

  moveCraftingToInventory(): boolean {
    for (let c_row = 0; c_row < 3; c_row++) {
      for (let c_col = 0; c_col < 3; c_col++) {
        const item = this.crafting[c_col][c_row];
        if (item) {
          if (this.moveItemToInventory(item)) {
            this.crafting[c_col][c_row] = null;
          }
          else {
            console.log("Too many items in crafting grid to fit in inventory!!!!");
            return false;
          }
        }
      }
    }
    return true;
  }

  getNextSlotForItem = (item: Item) => {
    let inv_row = 0;
    let inv_col = 0;

    while (inv_row < 3) {
      const targetItem = this.items[inv_col][inv_row];
      if (targetItem && targetItem.isSameItemType(item)) {
        return [inv_row, inv_col];
      }
      inv_col++;
      if (inv_col > 9) {
        inv_col = 0;
        inv_row++;
      }
    }
    return null;
  }

  getNextOpenSlot = () => {
    let inv_row = 0;
    let inv_col = 0;

    while (inv_row < 3) {
      if (this.items[inv_col][inv_row] === null)  {
        return [inv_row, inv_col];
      }
      inv_col++;
      if (inv_col > 9) {
        inv_col = 0;
        inv_row++;
      }
    }
    return null;
  }

  moveItemToInventory(item: Item) {
    let slot = this.getNextSlotForItem(item);
    if (slot !== null) {
      const targetItem = this.items[slot[1]][slot[0]];
      if (targetItem) {
        targetItem.quantity += item.quantity;
        return true;
      }
    }
    slot = this.getNextOpenSlot();
    if (slot !== null) {
      this.items[slot[1]][slot[0]] = item;
      return true;
    }
    console.log("No available slots found in the inventory!!!");
    return false;
  }

  onOutputClick(item: Item | null, event: MouseEvent) {
    if (!item || event.button !== 0 || item.quantity === 0) {
      return;
    }

    if (KeyService.isKeyPressed('Shift')) {
      item.quantity = this.current_qty_craftable * item.quantity;
      this.moveItemToInventory(item);
      this.output = null;
      this.useCraftingItems(this.current_qty_craftable);
      this.updateCraftingOutput();
      return;
    }

    if (!this.itemToMove) {
      this.itemToMove = item;
      this.output = null;
      this.createFloatingItem(this.itemToMove, event)
      this.useCraftingItems(1);
      this.updateCraftingOutput();
    }
    else {
      if (!this.itemToMove.equals(item)) {
        return;
      }
      this.itemToMove.quantity += this.output?.quantity;
      this.output = null;
      this.updateFloatingItemQuantity(this.itemToMove.quantity);
      this.useCraftingItems(1);
      this.updateCraftingOutput();
    }
  }

  onCellClick(item: Item | null, event: MouseEvent, rowIndex: number, colIndex: number): void {
    const currentTime = Date.now();

    if (this.lastItemPickUpTime && this.lastItemPickUpTime > -1) {
      const time_spent = currentTime - this.lastItemPickUpTime;
      this.lastItemPickUpTime = -1;

      if (time_spent < this.pickUpThreshold && this.itemToMove) {
        this.itemToMove = this.combineAllForSameItem(this.itemToMove);
        this.createFloatingItem(this.itemToMove, event)
        return;
      }
    }

    const target = event.target as HTMLElement;
    const inventoryItem = target.closest('.inventory-item') as HTMLElement;

    if (!inventoryItem) {
      console.error("Could not find inventory item");
      return;
    }

    const targetItemGridType = inventoryItem.closest('[data-grid]')?.getAttribute('data-grid');
    const targetGrid = targetItemGridType === 'inventory' ? this.items : this.crafting;
    const isTargetCrafting = targetItemGridType === 'crafting';

    if (this.itemToMove) {
      const qtyToMove = this.getQuantityToMove(event);

      if (qtyToMove === -1) {
        return;
      }

      const isMoveFullQty = (this.itemToMove.quantity === qtyToMove);
      const isMoveSingleQty = (qtyToMove === 1)

      if (!item) {
        if (isMoveFullQty) {
          targetGrid[colIndex][rowIndex] = this.itemToMove;
          this.clearItemToMove();
          this.removeFloatingItem();
        }
        else if (isMoveSingleQty) {
          this.itemToMove.quantity -= 1;
          this.updateFloatingItemQuantity(this.itemToMove.quantity);
          const splitItem = this.itemToMove.clone();
          splitItem.quantity = 1;
          targetGrid[colIndex][rowIndex] = splitItem;
        }
        else {
          return;
        }
        if (isTargetCrafting) {
          this.updateCraftingOutput();
        }
        return;
      }

      if (item) {
        if (item.isSameItemType(this.itemToMove)) {
          if (isMoveFullQty) {
            const newQty = item.quantity + qtyToMove;
            item.quantity = newQty;
            this.clearItemToMove();
            this.removeFloatingItem();
          }
          else if (isMoveSingleQty) {
            this.itemToMove.quantity -= 1;
            this.updateFloatingItemQuantity(this.itemToMove.quantity);
            item.quantity += 1;
          }
          else {
            return;
          }
        }
        else {
          // swap floating item with item in cell
          targetGrid[colIndex][rowIndex] = this.itemToMove
          this.clearItemToMove();
          this.removeFloatingItem();
          this.createFloatingItem(item, event);
          this.itemToMove = item;
        }
        if (isTargetCrafting) {
          this.updateCraftingOutput();
        }
        return;
      }
    }

    if (!this.itemToMove) {
      if (!item) {
        return;
      }

      this.itemToMoveGridType = targetItemGridType;
      this.itemToMoveCol = colIndex;
      this.itemToMoveRow = rowIndex;

      // right click
      if (event.button == 2) {
        event.preventDefault();
        if (item.quantity < 1) {
          return;
        }
        else if (item.quantity === 1) {
          this.itemToMove = item;
          targetGrid[colIndex][rowIndex] = null;
        }
        else {
          const splitQty = Math.floor(item.quantity / 2);
          const remQty = item.quantity - splitQty;
          item.quantity = remQty;
          const splitItem = item.clone();
          splitItem.quantity = splitQty;
          this.itemToMove = splitItem;
        }
      }
      // left click
      else if (event.button == 0) {
        this.lastItemPickUpTime = Date.now();
        // clear the item from the cell if we picked it up
        this.itemToMove = item;
        targetGrid[colIndex][rowIndex] = null;
      }

      if (isTargetCrafting) {
        this.updateCraftingOutput();
      }
      this.createFloatingItem(this.itemToMove, event);
    }
  }

  clearItemToMove() {
    this.itemToMove = null;
    this.itemToMoveGridType = null;
    this.itemToMoveCol = -1;
    this.itemToMoveRow = -1;
  }

  private onMouseMove(event: MouseEvent): void {
    if (this.floatingItem) {
      this.updateFloatingItemPosition(event);
    }
  }

  private updateFloatingItemPosition(event: MouseEvent): void {
    if (this.floatingItem) {
      const x = event.clientX - 23;
      const y = event.clientY - 20;
      this.renderer.setStyle(this.floatingItem, 'left', `${x}px`);
      this.renderer.setStyle(this.floatingItem, 'top', `${y}px`);
    }
  }

  public removeFloatingItem(): void {
    if (this.floatingItem) {
      this.renderer.removeChild(document.body, this.floatingItem);
      this.floatingItem = null;
    }
  }

  public returnItemToCell(): void {
    if (this.itemToMove) {
      if (this.itemToMoveCol !== -1 && this.itemToMoveRow !== -1) {
        const grid = this.itemToMoveGridType === 'inventory' ? this.items : this.crafting;
        const item = grid[this.itemToMoveCol][this.itemToMoveRow];
        if (item) {
          item.quantity = item.quantity + this.itemToMove.quantity;
        }
        else {
          grid[this.itemToMoveCol][this.itemToMoveRow] = this.itemToMove;
        }
        this.clearItemToMove();
      } 
    }
  }

  getQuantityToMove(event: MouseEvent) {
    switch (event.button) {
      case 2: // Right click
        return 1;
      case 0: // Left click
        return this.itemToMove.quantity;
      default:
        return -1;
    }
  }

  createFloatingItem(item: Item, event: MouseEvent) {
    if (this.floatingItem) {
      this.renderer.removeChild(document.body, this.floatingItem);
    }

    // Create a floating item element
    this.floatingItem = this.renderer.createElement('div');
    this.renderer.addClass(this.floatingItem, 'floating-item');

    // Create image element
    const imgElement = this.renderer.createElement('img');
    this.renderer.setAttribute(imgElement, 'src', item.image?.src ?? '');
    this.renderer.setAttribute(imgElement, 'alt', item.getItemName());

    // Append image to the floating item
    this.renderer.appendChild(this.floatingItem, imgElement);

    const quantityText = this.renderer.createElement('p');
    if (item.quantity === 1) {
      quantityText.style.display = 'none';
    }
    else {
      quantityText.style.display = 'block';
    }
    this.renderer.addClass(quantityText, 'quantity-text');
    const text = this.renderer.createText(item.quantity.toString());
    this.renderer.appendChild(quantityText, text);

    // Append quantity text to the floating item
    this.renderer.appendChild(this.floatingItem, quantityText);

    // Set the content and position
    if (this.floatingItem) {
      this.renderer.appendChild(document.body, this.floatingItem);
    }

    this.updateFloatingItemPosition(event);

    // Start listening for mouse move and mouse up events
    this.renderer.listen('window', 'mousemove', (e) => this.onMouseMove(e));
  }

  updateFloatingItemQuantity(quantity: number) {
    if (this.floatingItem) {
      const quantityTextElement = this.floatingItem.querySelector('.quantity-text') as HTMLElement;;
      if (quantityTextElement) {
        if (quantity === 1) {
          // Hide the quantity text element
          quantityTextElement.style.display = 'none'; // Or use 'visibility: hidden;'
        } else {
          // Show and update the quantity text
          quantityTextElement.style.display = 'block'; // Ensure it's visible
          this.updateQuantityText(quantityTextElement, quantity);
        }
      }
    }
  }

  updateQuantityText(element: HTMLElement, quantity: number) {
    this.renderer.setProperty(element, 'textContent', quantity.toString());
  }

  combineAllForSameItem(itemToMove: Item): Item | null {
    // TODO: Consider a single cell max quantity if implemented later
    // TODO: Also pick up items from crafting inventory

    let total_qty = 0;
    let crafting_updated = false;

    for (let i_row = 0; i_row < 3; i_row++) {
      for (let i_col = 0; i_col < 10; i_col++) {
        const item = this.items[i_col][i_row];
        if (item && item.isSameItemType(itemToMove)) {
          total_qty += item.quantity;
          this.items[i_col][i_row] = null;
        }
      }
    }

    for (let c_row = 0; c_row < 3; c_row++) {
      for (let c_col = 0; c_col < 3; c_col++) {
        const item = this.crafting[c_col][c_row];
        if (item && item.isSameItemType(itemToMove)) {
          total_qty += item.quantity;
          crafting_updated = true;
          // TODO: check for exceeding max quantity
          this.crafting[c_col][c_row] = null;
        }
      }
    }

    if (crafting_updated) {
      this.updateCraftingOutput();
    }

    itemToMove.quantity += total_qty;
    return itemToMove;
  }

  updateCraftingOutput() {
    this.output = null;
    this.currentRecipe = null;
    this.current_qty_craftable = 0;

    const crafting_items: Item[] = [];
    for (let c_row = 0; c_row < 3; c_row++) {
      for (let c_col = 0; c_col < 3; c_col++) {
        const item = this.crafting[c_col][c_row];
        if (item) {
          crafting_items.push(item);
        }
      }
    }

    const allRecipes = Array.from(Recipes.recipeList.values()).filter(recipe => 
      crafting_items.every(item => recipe.getRequiredItems().some(requiredItem => requiredItem.equals(item))));

    if (allRecipes.length == 0) {
      this.output = null;
      return;
    }

    let cur_recipe = null;
    let qty = Number.MAX_SAFE_INTEGER;

    allRecipes.forEach((recipe) => {
      cur_recipe = recipe;
      const recipe_crafting = recipe.getCrafting();
      let validItem = true;

      outerLoop:
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const recipe_item = recipe_crafting[col][row];
          const crafting_item = this.crafting[col][row];

          // console.log("Row = " + row + ", Col = " + col + ", C: " + crafting_item + ", R: " + recipe_item);

          if (recipe_item === null && crafting_item === null) {
            continue;
          }
          else if (recipe_item === null && crafting_item !== null) {
            validItem = false;
            break outerLoop;
          }
          else if (recipe_item !== null && crafting_item === null) {
            validItem = false;
            break outerLoop;
          }
          else if (recipe_item !== null && crafting_item !== null && !recipe_item.equals(crafting_item)) {
            validItem = false;
            break outerLoop;
          }
          else {
            if (recipe_item !== null && crafting_item !== null && recipe_item.equals(crafting_item)) {
                const crafting_item_qty = crafting_item.quantity;
                const recipe_item_qty = recipe_item.quantity;

                const allowed_qty = Math.floor(crafting_item_qty / recipe_item_qty);
                if (allowed_qty <= 0) {
                  validItem = false;
                  break outerLoop;
                }
                if (allowed_qty < qty) {
                  qty = allowed_qty;
                }
            }
            else {
              validItem = false;
              break outerLoop;
            }
          }
        }
      }

      if (validItem) {
        const outputItem = recipe.getOutput();
        if (outputItem) {
          const ItemClass = outputItem.constructor as typeof Item;
          const newItem = ItemFactory.createItem(ItemClass, outputItem.quantity);
          if (newItem) {
            this.output = newItem;
            this.currentRecipe = cur_recipe;
            this.current_qty_craftable = qty;
          }
        }
      }
      else {
        this.output = null;
        this.currentRecipe = null;
      }
    });
  }

  useCraftingItems(qty: number) {
    // console.log("in useCraftingItems!");
    if (!this.currentRecipe) {
      return;
    }
    const recipe_crafting = this.currentRecipe.getCrafting();

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const recipe_item = recipe_crafting[col][row];
        const crafting_item = this.crafting[col][row];

        // console.log("Row = " + row + ", Col = " + col + ", C: " + crafting_item + ", R: " + recipe_item);

        if (recipe_item === null && crafting_item === null) {
          continue;
        }
        else if (recipe_item === null && crafting_item !== null) {
          console.log("Error: Trying to use crafting items but does not match with recipe");
          this.output = null;
          this.currentRecipe = null;
          return;
        }
        else if (recipe_item !== null && crafting_item === null) {
          console.log("Error: Trying to use crafting items but does not match with recipe");
          this.output = null;
          this.currentRecipe = null;
          return;
        }
        else if (recipe_item !== null && crafting_item !== null && !recipe_item.equals(crafting_item)) {
          console.log("Error: Trying to use crafting items but does not match with recipe");
          this.output = null;
          this.currentRecipe = null;
          return;
        }
        else {
          if (recipe_item !== null && crafting_item !== null && recipe_item.equals(crafting_item)) {
            if (crafting_item.quantity < recipe_item.quantity * qty) {
              console.log("Error: Not enough quantity for recipe");
              this.output = null;
              this.currentRecipe = null;
              return;
            }
            else {
              crafting_item.quantity -= (recipe_item.quantity * qty);
              if (crafting_item.quantity <= 0) {
                this.crafting[col][row] = null;
              }
            }
          }
          else {
            console.log("Error: Trying to use crafting items but does not match with recipe");
            this.output = null;
            this.currentRecipe = null;
            this.current_qty_craftable = 0;
            return;
          }
        }
      }
    }
  }
}