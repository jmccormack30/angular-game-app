import { Component, Input, Output, EventEmitter } from '@angular/core';

interface InventoryItem {
  name: string;
  image: string;
  position: { x: number; y: number };
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  // items: InventoryItem[] = [];

  isDragging = false;
  draggedItem?: InventoryItem;
  dragStartPosition?: { x: number, y: number };

  openInventory() {
    this.isOpen = true;
  }

  closeInventory() {
    this.isOpen = false;
    this.close.emit();
  }

  startDragging(event: MouseEvent, item: InventoryItem) {
    this.isDragging = true;
    this.draggedItem = item;
    this.dragStartPosition = { x: event.clientX, y: event.clientY };
  }

  stopDragging() {
    this.isDragging = false;
    this.draggedItem = undefined;
    this.dragStartPosition = undefined;
  }

  onDragging(event: MouseEvent) {
    if (this.isDragging && this.draggedItem && this.dragStartPosition) {
      const dx = event.clientX - this.dragStartPosition.x;
      const dy = event.clientY - this.dragStartPosition.y;

      this.draggedItem.position.x += dx;
      this.draggedItem.position.y += dy;

      this.dragStartPosition = { x: event.clientX, y: event.clientY };
    }
  }
}