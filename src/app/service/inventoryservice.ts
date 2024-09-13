import { Injectable } from "@angular/core";
import { Item } from "../items/item";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
    private invSubject: BehaviorSubject<(Item | null)[][]> = new BehaviorSubject<Array<(Item | null)[]>>(Array.from({ length: 9 }, () => Array(4).fill(null)));
    inventory$ = this.invSubject.asObservable();
    
    updateInventory(col: number, row: number, item: Item | null) {
        const currentInventory = this.invSubject.getValue();
        currentInventory[col][row] = item;
        this.invSubject.next(currentInventory);
    }

    getInventory() {
        return this.invSubject.getValue();
    }
}