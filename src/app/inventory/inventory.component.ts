import { Component, Output, EventEmitter, Renderer2, ElementRef } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Item } from '../items/item';
import { Red } from '../items/red';
import { Blue } from '../items/blue'
import { Recipe } from '../crafting/recipe';
import { Recipes } from '../crafting/recipes';
import { ImageService } from '../imageservice';
import { ItemFactory } from '../items/itemfactory';


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

  private imageCache: { [key: string]: HTMLImageElement } = {};
  public isInventoryOpen = false;

  lastItemPickUpTime: number | null = null;
  pickUpThreshold: number = 250; // Time window in milliseconds

  armor: (Item | null)[];
  items: (Item | null)[][];
  crafting: (Item | null)[][];
  output: Item | null;

  constructor(private renderer: Renderer2, private el: ElementRef, private imageService: ImageService) {
    console.log("inventory component init");

    this.armor = Array(4).fill(null);
    this.items = Array.from({ length: 10 }, () => Array(3).fill(null));
    this.crafting = Array.from({ length: 3 }, () => Array(3).fill(null));
    this.output = null;

    const red = ItemFactory.createItem(Red, 10);
    const blue = ItemFactory.createItem(Blue, 25);
    this.items[0][0] = red;
    this.items[1][0] = blue;

    console.log("inventory component end");
  }

  toggleInventory() {
    if (this.isInventoryOpen) {
      this.returnItemToCell();
      this.clearItemToMove();
      if (this.floatingItem) {
        this.renderer.removeChild(document.body, this.floatingItem);
      }
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
    if (this.moveCraftingToInventory()) {
      this.isInventoryOpen = false;
      this.close.emit();
    }
    else {
      console.log("Failed to move crafting to inventory!!!!!");
    }
  }

  // preloadImages(): Observable<void[]> {
  //   const imageSources = [
  //     'assets/red_item.png',
  //     'assets/blue_item.png'
  //   ]

  //   const promises = imageSources.map(src => this.loadImage(src));
  //   return from(Promise.all(promises));
  // }

  // private loadImage(src: string): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     const img = new Image();
  //     img.onload = () => {
  //       this.imageCache[src] = img;
  //       resolve();
  //     };
  //     img.onerror = reject;
  //     img.src = src;
  //   });
  // }

  // getImage(src: string): HTMLImageElement | undefined {
  //   return this.imageCache[src];
  // }

  getImageHtml(item: Item): string {
    const img = item.image;
    return img ? img.outerHTML : '';
  }

  moveCraftingToInventory(): boolean {
    let inv_target_row = 0;
    let inv_target_col = 0;

    const getNextSlotForItem = (item: Item) => {
      let inv_row = 0;
      let inv_col = 0;

      while (inv_row < 3) {
        let targetItem = this.items[inv_col][inv_row];
        if (targetItem && targetItem.isSameItemType(item)) {
          inv_target_row = inv_row;
          inv_target_col = inv_col;
          return true;
        }
        inv_col++;
        if (inv_col > 9) {
          inv_col = 0;
          inv_row++;
        }
      }
      return false;
    }

    const getNextOpenSlot = () => {
      let inv_row = 0;
      let inv_col = 0;

      while (inv_row < 3) {
        if (this.items[inv_col][inv_row] === null)  {
          inv_target_row = inv_row;
          inv_target_col = inv_col;
          return true;
        }
        inv_col++;
        if (inv_col > 9) {
          inv_col = 0;
          inv_row++;
        }
      }
      return false;
    }

    for (let c_row = 0; c_row < 3; c_row++) {
      for (let c_col = 0; c_col < 3; c_col++) {
        const item = this.crafting[c_col][c_row];
        if (item) {
          if (getNextSlotForItem(item)) {
            let targetItem = this.items[inv_target_col][inv_target_row];
            if (targetItem) {
              targetItem.quantity += item.quantity;
              this.crafting[c_col][c_row] = null;
            }
          }
          else if (getNextOpenSlot()) {
            this.items[inv_target_col][inv_target_row] = item;
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
    const isTargetOutput = targetItemGridType === 'output';

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
        let item = grid[this.itemToMoveCol][this.itemToMoveRow];
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

    if (item.quantity > 1) {
      // Create quantity text element
      const quantityText = this.renderer.createElement('p');
      this.renderer.addClass(quantityText, 'quantity-text');
      const text = this.renderer.createText(item.quantity.toString());
      this.renderer.appendChild(quantityText, text);

      // Append quantity text to the floating item
      this.renderer.appendChild(this.floatingItem, quantityText);
    }

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

    let inv_row = 0;
    let inv_col = 0;

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
    console.log("item placed in crafting grid");
    const crafting_items: Item[] = [];
    for (let c_row = 0; c_row < 3; c_row++) {
      for (let c_col = 0; c_col < 3; c_col++) {
        const item = this.crafting[c_col][c_row];
        if (item) {
          crafting_items.push(item);
        }
      }
    }

    // console.log(crafting_items);

    let allRecipes = Array.from(Recipes.recipeList.values()).filter(recipe => 
      crafting_items.every(item => recipe.getRequiredItems().some(requiredItem => requiredItem.equals(item))));

    // console.log(allRecipes);
    if (allRecipes.length == 0) {
      this.output = null;
      return;
    }

    allRecipes.forEach((recipe) => {
      let recipe_crafting = recipe.getCrafting();

      let validItem = true;
      let output_qty = Number.MAX_SAFE_INTEGER;

      outerLoop:
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const recipe_item = recipe_crafting[col][row];
          const crafting_item = this.crafting[col][row];

          console.log("Row = " + row + ", Col = " + col + ", C: " + crafting_item + ", R: " + recipe_item);

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
                let crafting_item_qty = crafting_item.quantity;
                let recipe_item_qty = recipe_item.quantity;

                let allowed_qty = Math.floor(crafting_item_qty / recipe_item_qty);
                console.log(allowed_qty);
                if (output_qty > allowed_qty) {
                  output_qty = allowed_qty;
                }
                if (output_qty <= 0) {
                  break outerLoop;
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
        const ItemClass = recipe.getOutput()?.constructor as typeof Item;
        let output_item = ItemFactory.createItem(ItemClass, output_qty);
        if (output_item) {
          this.output = output_item;
        }
      }
      else {
        this.output = null;
      }
    });
  }

  onOutputClick(item: Item | null, event: MouseEvent) {
    console.log("output clicked!");
  }
}