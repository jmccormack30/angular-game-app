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

  public draggedItem: any = null;
  private draggedRowIndex: number = -1;
  private draggedColIndex: number = -1;
  private draggedItemGridType: string | null | undefined;

  private floatingItem: HTMLElement | null = null;
  private originalX: number = 0;
  private originalY: number = 0;
  public itemToMove: any = null;

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

  onDragStart(event: DragEvent, item: any, rowIndex: number, colIndex: number) {
    const target = event.currentTarget as HTMLElement;
    const gridType = target.closest('[data-grid]')?.getAttribute('data-grid');

    this.draggedItem = item;
    this.draggedRowIndex = rowIndex;
    this.draggedColIndex = colIndex;
    this.draggedItemGridType = gridType;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragEnd(event: DragEvent, rowIndex: number, colIndex: number) {
    console.log("onDragEnd()!");
  }

  onDrop(event: DragEvent, rowIndex: number, colIndex: number) {
    console.log("onDrop()!");
  
    event.preventDefault();

    const target = event.currentTarget as HTMLElement;
    const targetItemGridType = target.closest('[data-grid]')?.getAttribute('data-grid');

    let targetGrid = targetItemGridType === 'inventory' ? this.items : this.crafting;
    let sourceGrid = this.draggedItemGridType === 'inventory' ? this.items : this.crafting;

    // console.log("SOURCE: Row = " + this.draggedRowIndex + ", Col = " + this.draggedColIndex + ", Grid = " + this.draggedItemGridType);
    // console.log("TARGET: Row = " + rowIndex + ", Col = " + colIndex + ", Grid = " + targetItemGridType);

    if (this.draggedItem && this.draggedRowIndex !== -1 && this.draggedColIndex !== -1) {
      let targetItem = targetGrid[colIndex][rowIndex];
      targetGrid[colIndex][rowIndex] = this.draggedItem;

      if (targetItem) {
        sourceGrid[this.draggedColIndex][this.draggedRowIndex] = targetItem;
      }
      else {
        sourceGrid[this.draggedColIndex][this.draggedRowIndex] = null;
      }

      this.clearDraggedItem();
    }
  }

  clearDraggedItem() {
    this.draggedItem = null;
    this.draggedRowIndex = -1;
    this.draggedColIndex = -1;
    this.draggedItemGridType = null;
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

  onOverlayDragOver(event: DragEvent): void {
    event.preventDefault(); // Necessary for allowing drop
  }

  onOverlayDrop(event: DragEvent): void {
    this.clearDraggedItem();
  }

  onCellClick(item: any, event: MouseEvent, rowIndex: number, colIndex: number): void {
    console.log("onCellClick!");

    if (!item) {
      return;
    }

    this.itemToMove = item;

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
    this.renderer.listen('window', 'mouseup', (e) => this.onMouseUp(e, rowIndex, colIndex));
  }

  private onMouseMove(event: MouseEvent): void {
    if (this.floatingItem) {
      this.updateFloatingItemPosition(event);
    }
  }

  private onMouseUp(event: MouseEvent, rowIndex: number, colIndex: number): void {
    console.log("onMouseUp()!");
    console.log("Row = " + rowIndex + ", Col = " + colIndex);
    this.removeFloatingItem();
  }

  private updateFloatingItemPosition(event: MouseEvent): void {
    if (this.floatingItem) {
      let x = event.clientX - 23;
      let y = event.clientY - 20;
      this.renderer.setStyle(this.floatingItem, 'left', `${x}px`);
      this.renderer.setStyle(this.floatingItem, 'top', `${y}px`);
    }
  }

  private removeFloatingItem(): void {
    if (this.floatingItem) {
      this.renderer.removeChild(document.body, this.floatingItem);
      this.floatingItem = null;
      this.itemToMove = null;
    }
  }
}