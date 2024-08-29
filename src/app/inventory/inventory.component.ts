import { Component, Output, EventEmitter, Renderer2, ElementRef } from '@angular/core';
import { Item } from '../items/item';
import { Red } from '../items/red';
import { Observable, from } from 'rxjs';
import { Blue } from '../items/blue';

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
  private isSingleClick = false;

  armor: (Item | null)[];
  items: (Item | null)[][];
  crafting: (Item | null)[][];
  output: Item | null;

  constructor(private renderer: Renderer2, private el: ElementRef) {
    console.log("Creating inventory!");
    this.armor = Array(4).fill(null);
    this.items = Array.from({ length: 10 }, () => Array(3).fill(null));
    this.crafting = Array.from({ length: 3 }, () => Array(3).fill(null));
    this.output = null;

    this.preloadImages().subscribe(
      () => {
        const red = this.getImage('assets/red_item.png');
        console.log(red);
        if (red) {
          const red_item = new Red("Red", 10, red);
          this.items[0][0] = red_item;
        }
        const blue = this.getImage('assets/blue_item.png');
        console.log(blue);
        if (blue) {
          const blue_item = new Blue("Blue", 25, blue);
          this.items[1][0] = blue_item;
        }
      }
    );
    console.log("Finished creating inventory!");
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

  preloadImages(): Observable<void[]> {
    const imageSources = [
      'assets/red_item.png',
      'assets/blue_item.png'
    ]

    const promises = imageSources.map(src => this.loadImage(src));
    return from(Promise.all(promises));
  }

  private loadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.imageCache[src] = img;
        resolve();
      };
      console.log(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  getImage(src: string): HTMLImageElement | undefined {
    return this.imageCache[src];
  }

  getImageHtml(item: Item): string {
    const img = item.image;
    return img ? img.outerHTML : '';
  }

  moveCraftingToInventory(): boolean {
    let inv_row = 0;
    let inv_col = 0;

    const getNextOpenInventorySlot = () => {
      while (inv_row < 3) {
        if (this.items[inv_col][inv_row] === null)  {
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
          if (getNextOpenInventorySlot()) {
            this.items[inv_col][inv_row] = item;
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

  singleClick(item: Item | null, event: MouseEvent, rowIndex: number, colIndex: number) {
    console.log("single click");
    console.log(event);
    this.isSingleClick = true;
    setTimeout(() => {
      if (this.isSingleClick) {
        this.onCellClick(item, event, rowIndex, colIndex);
      }
    }, 250);
  }

  onDoubleClick(event: MouseEvent) {
    console.log("double click");
    this.isSingleClick = false;
  }

  onCellClick(item: Item | null, event: MouseEvent, rowIndex: number, colIndex: number): void {
    console.log("on cell click");
    console.log(event);
    const target = event.currentTarget as HTMLElement;
    console.log(target);
    const targetItemGridType = target.closest('[data-grid]')?.getAttribute('data-grid');

    const targetGrid = targetItemGridType === 'inventory' ? this.items : this.crafting;
    const sourceGrid = this.itemToMoveGridType === 'inventory' ? this.items : this.crafting;

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
          return;
        }
        else if (isMoveSingleQty) {
          this.itemToMove.quantity -= 1;
          this.updateFloatingItemQuantity(this.itemToMove.quantity);
          const splitItem = this.createItem(this.itemToMove);
          splitItem.quantity = 1;
          targetGrid[colIndex][rowIndex] = splitItem;
          return;
        }
        else {
          return;
        }
      }

      if (item) {
        if (this.isSameItem(this.itemToMove, item)) {
          if (isMoveFullQty) {
            const newQty = item.quantity + qtyToMove;
            item.quantity = newQty;
            this.clearItemToMove();
            this.removeFloatingItem();
            return;
          }
          else if (isMoveSingleQty) {
            this.itemToMove.quantity -= 1;
            this.updateFloatingItemQuantity(this.itemToMove.quantity);
            item.quantity += 1;
            return;
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
          return;
        }
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

          const splitItem = this.createItem(item);
          splitItem.quantity = splitQty;
          this.itemToMove = splitItem;
        }
      }
      // left click
      else if (event.button == 0) {
        // clear the item from the cell if we picked it up
        this.itemToMove = item;
        const sourceGrid = this.itemToMoveGridType === 'inventory' ? this.items : this.crafting;
        sourceGrid[colIndex][rowIndex] = null;
      }

      this.createFloatingItem(this.itemToMove, event)
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
      console.log(this.itemToMoveCol);
      console.log(this.itemToMoveRow);
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

  createItem(item: Item) {
    return new Item(item.name, item.quantity, item.image);
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

  isSameItem(item1: Item, item2: Item) {
    return item1.name === item2.name;
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
    this.renderer.setAttribute(imgElement, 'src', item.image.src);
    this.renderer.setAttribute(imgElement, 'alt', item.name);

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
}