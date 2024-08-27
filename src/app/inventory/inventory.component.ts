import { Component, Input, Output, EventEmitter, Renderer2, ElementRef } from '@angular/core';
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
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  private floatingItem: HTMLElement | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public itemToMove: any = null;
  private itemToMoveGridType: string | null | undefined;
  private itemToMoveCol: number = -1;
  private itemToMoveRow: number = -1;

  private imageCache: { [key: string]: HTMLImageElement } = {};
  public isInventoryOpen = false;

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
      this.clearItemToMove();
      this.renderer.removeChild(document.body, this.floatingItem);
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
      this.isOpen = false;
      this.close.emit();
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

  onCellClick(item: Item | null, event: MouseEvent, rowIndex: number, colIndex: number): void {
    const target = event.currentTarget as HTMLElement;
    const targetItemGridType = target.closest('[data-grid]')?.getAttribute('data-grid');

    const targetGrid = targetItemGridType === 'inventory' ? this.items : this.crafting;
    const sourceGrid = this.itemToMoveGridType === 'inventory' ? this.items : this.crafting;

    if (this.itemToMove) {
      if (!item) {
        sourceGrid[this.itemToMoveCol][this.itemToMoveRow] = null;
      }
      else {
        sourceGrid[this.itemToMoveCol][this.itemToMoveRow] = item;
      }
      targetGrid[colIndex][rowIndex] = this.itemToMove;
      this.clearItemToMove();
      this.renderer.removeChild(document.body, this.floatingItem);
      this.floatingItem = null;
    }
    else {
      if (!item) {
        return;
      }

      this.itemToMove = item;
      this.itemToMoveGridType = targetItemGridType;
      this.itemToMoveCol = colIndex;
      this.itemToMoveRow = rowIndex;

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
      
      // Create quantity text element
      const quantityText = this.renderer.createElement('p');
      this.renderer.addClass(quantityText, 'quantity-text');
      const text = this.renderer.createText(item.quantity.toString());
      this.renderer.appendChild(quantityText, text);

      // Append image and quantity text to the floating item
      this.renderer.appendChild(this.floatingItem, imgElement);
      this.renderer.appendChild(this.floatingItem, quantityText);

      // Set the content and position
      if (this.floatingItem) {
        //this.floatingItem.innerHTML = `<img src="${item.image.src}" alt="${item.name}">`;
        this.renderer.appendChild(document.body, this.floatingItem);
      }

      this.updateFloatingItemPosition(event);

      // Start listening for mouse move and mouse up events
      this.renderer.listen('window', 'mousemove', (e) => this.onMouseMove(e));
      // this.renderer.listen('window', 'mouseup', (e) => this.onMouseUp(e, rowIndex, colIndex));

      console.log(this.itemToMove);
    }
  }

  clearItemToMove() {
    console.log("Clearing itemToMove!!!");
    this.itemToMove = null;
    this.itemToMoveGridType = null;
    this.itemToMoveCol = -1;
    this.itemToMoveRow = -1;
  }

  onOverlayClick() {
    console.log("Inv Overlay Clicked!");
    // this.removeFloatingItem();
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
      this.itemToMove = null;
    }
  }
}