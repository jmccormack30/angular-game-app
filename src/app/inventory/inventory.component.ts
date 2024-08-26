import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Item } from '../items/item';
import { Red } from '../items/red';
import { Observable, from } from 'rxjs';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  private draggedItem: any = null;
  private draggedRowIndex: number = -1;
  private draggedColIndex: number = -1;

  private imageCache: { [key: string]: HTMLImageElement } = {};

  armor: (Item | null)[];
  items: (Item | null)[][];
  crafting: (Item | null)[][];
  output: Item | null;

  constructor() {
    console.log("Creating inventory!");
    this.armor = Array(4).fill(null);
    this.items = Array.from({ length: 10 }, () => Array(3).fill(null));
    this.crafting = Array.from({ length: 3 }, () => Array(3).fill(null));
    this.output = null;

    this.preloadImages().subscribe(
      () => {
        const red = this.getImage('assets/red_item.png');
        if (red) {
          console.log("Red item!");
          const red_item = new Red("Red", 10, red);
          this.items[0][0] = red_item;
        }
      }
    );
  }

  isDragging = false;
  dragStartPosition?: { x: number, y: number };

  openInventory() {
    this.isOpen = true;
  }

  closeInventory() {
    this.isOpen = false;
    this.close.emit();
  }

  preloadImages(): Observable<void[]> {
    const imageSources = [
      'assets/red_item.png'
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
    this.draggedItem = item;
    this.draggedRowIndex = rowIndex;
    this.draggedColIndex = colIndex;

    console.log("On drag start!");
    console.log(this.draggedItem);

    // Optionally set some data to transfer
    event.dataTransfer?.setData('text/plain', `${rowIndex},${colIndex}`);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // Allow drop
  }

  onDrop(event: DragEvent, rowIndex: number, colIndex: number) {
    event.preventDefault();

    // Retrieve the dragged item
    if (this.draggedItem && this.draggedRowIndex !== -1 && this.draggedColIndex !== -1) {
      // Remove item from original position
      this.items[this.draggedRowIndex][this.draggedColIndex] = null;

      // Place item in new position
      this.items[rowIndex][colIndex] = this.draggedItem;

      // Clear dragged item information
      this.draggedItem = null;
      this.draggedRowIndex = -1;
      this.draggedColIndex = -1;
    }
  }
}