import { Injectable } from "@angular/core";
import { Item } from "../items/Item";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private invSubject: BehaviorSubject<(Item | null)[][]> = new BehaviorSubject<Array<(Item | null)[]>>(Array.from({ length: 9 }, () => Array(4).fill(null)));
  inventory$ = this.invSubject.asObservable();

  private selectedItem: BehaviorSubject<Item | null> = new BehaviorSubject<Item | null>(null);
  selectedItem$ = this.selectedItem.asObservable();

  setSelectedItem(item: Item | null) {
    this.selectedItem.next(item);
  }
  
  updateInventory(col: number, row: number, item: Item | null) {
    const currentInventory = this.invSubject.getValue();
    currentInventory[col][row] = item;
    this.invSubject.next(currentInventory);
  }

  getInventory() {
    return this.invSubject.getValue();
  }

  addItem(item: Item) {
    const currentInventory = this.invSubject.getValue();

    const maxQtyForItem = item.maxStackQty;
    let qtyToMove = item.quantity;
    let slot = this.getNextSlotForItem(item);

    while (qtyToMove > 0 && slot !== null) {
      const targetItem = currentInventory[slot[1]][slot[0]];
      if (targetItem) {
        const qty = Math.min(qtyToMove, (maxQtyForItem - targetItem.quantity));
        targetItem.quantity += qty;
        this.updateInventory(slot[1], slot[0], targetItem);
        qtyToMove -= qty;
        item.quantity -= qty;
        
        if (qtyToMove > 0) {
          slot = this.getNextSlotForItem(item);
        }
        else {
          slot = null;
        }
      }
    }

    if (qtyToMove === 0) {
      return true;
    }

    slot = this.getNextOpenSlot();
    while (qtyToMove > 0 && slot !== null) {
      const qty = Math.min(qtyToMove, maxQtyForItem);
      if (qty < qtyToMove) {
        const newItem = item.clone();
        newItem.quantity = qty;
        this.updateInventory(slot[1], slot[0], newItem);
        qtyToMove -= qty;
        item.quantity -= qty;
        slot = this.getNextOpenSlot();
      }
      else {
        this.updateInventory(slot[1], slot[0], item);
        qtyToMove = 0;
        slot = null;
      }
    }

    if (qtyToMove <= 0) {
      return true;
    }

    console.log("No available slots found in the inventory!!!");
    return false;
  }

  getNextSlotForItem(item: Item) {
    const currentInventory = this.invSubject.getValue();

    let inv_row = 0;
    let inv_col = 0;

    while (inv_row < 4) {
      const targetItem = currentInventory[inv_col][inv_row];
      if (targetItem) {
        const maxQtyForItem = targetItem.maxStackQty;
        if (targetItem.quantity < maxQtyForItem && targetItem.isSameItemType(item)) {
          return [inv_row, inv_col];
        }
      }
      inv_col++;
      if (inv_col > 8) {
        inv_col = 0;
        inv_row++;
      }
    }
    return null;
  }
  
  getNextOpenSlot() {
    const currentInventory = this.invSubject.getValue();

    let inv_row = 0;
    let inv_col = 0;

    while (inv_row < 4) {
      if (currentInventory[inv_col][inv_row] === null)  {
        return [inv_row, inv_col];
      }
      inv_col++;
      if (inv_col > 8) {
        inv_col = 0;
        inv_row++;
      }
    }
    return null;
  }
}