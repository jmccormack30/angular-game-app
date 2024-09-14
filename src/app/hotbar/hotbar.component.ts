import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { Item } from '../items/item';
import { InventoryService } from '../service/inventoryservice';
import { ImageService } from '../service/imageservice';
import { KeyService } from '../service/keyservice';
import { debounceTime, Subscription } from 'rxjs';

@Component({
  selector: 'app-hotbar',
  templateUrl: './hotbar.component.html',
  styleUrl: './hotbar.component.css'
})
export class HotbarComponent implements AfterViewInit, OnDestroy {
  ImageService = ImageService;
  items: (Item | null)[] = []
  public isHotBarOnTop = false;
  public selectedItemIndex: number = 0;
  public enabled = true;
  
  private inventorySubscriber: Subscription = new Subscription;
  private hotbarSubscriber: Subscription = new Subscription;

  constructor(private inventoryService: InventoryService, private keyService: KeyService) {
    this.inventoryService.inventory$.subscribe((inventory: (Item | null)[][]) => {
      this.items = inventory.map(row => row[row.length - 1] || null);
    });
  }

  ngAfterViewInit(): void {
    this.inventorySubscriber = this.inventoryService.inventory$.subscribe((inventory: (Item | null)[][]) => {
      this.items = inventory.map(row => row[row.length - 1] || null);
    });

    this.hotbarSubscriber = this.keyService.hotbarKey$.pipe(debounceTime(10)).subscribe(data => {
      if (!this.enabled) return;
      const num = parseInt(data, 10) - 1;
      if (num !== this.selectedItemIndex) {
        this.selectedItemIndex = num;
      }
    });
  }

  ngOnDestroy(): void {
    this.inventorySubscriber.unsubscribe();
    this.hotbarSubscriber.unsubscribe();
  }
}