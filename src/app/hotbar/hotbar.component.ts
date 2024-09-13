import { Component, Input, ViewChild } from '@angular/core';
import { Item } from '../items/item';
import { InventoryService } from '../service/inventoryservice';
import { ImageService } from '../service/imageservice';

@Component({
  selector: 'app-hotbar',
  templateUrl: './hotbar.component.html',
  styleUrl: './hotbar.component.css'
})
export class HotbarComponent {
  ImageService = ImageService;
  items: (Item | null)[] = []

  constructor(private inventoryService: InventoryService) {
    this.inventoryService.inventory$.subscribe((inventory: (Item | null)[][]) => {
      this.items = inventory.map(row => row[row.length - 1] || null);
    });
  }
}