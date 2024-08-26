export class Item {
    name: string;
    quantity: number;
    image: HTMLImageElement;

    constructor(name: string, quantity: number, image: HTMLImageElement) {
        this.name = name;
        this.quantity = quantity;
        this.image = image;
    };

    toString(): string {
        return "Name: " + this.name + ", Quantity = " + this.quantity;
    }
}