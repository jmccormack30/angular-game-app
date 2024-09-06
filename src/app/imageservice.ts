import { Observable, from } from "rxjs";

export class ImageService {
    public static imageCache: { [key: string]: HTMLImageElement } = {};

    public static preloadImages(): Observable<void[]> {
        const imageSources = [
            'assets/grass_2.jpg',
            'assets/wheat_dirt.png',
            'assets/red_item.png',
            'assets/blue_item.png',
            'assets/player_right.png',
            'assets/player_right_2.png',
            'assets/player_left.png',
            'assets/player_left_2.png',
            'assets/player_up.png',
            'assets/player_up_2.png',
            'assets/player_down.png',
            'assets/player_down_2.png',
            'assets/player_down_walk_1.png',
            'assets/player_down_walk_2.png',
            'assets/player_down_walk_3.png',
            'assets/player_down_walk_4.png',
            'assets/player_up_walk_3.png',
            'assets/player_up_walk_4.png',
            'assets/player_up_walk_5.png',
            'assets/player_up_walk_6.png',
            'assets/player_up_walk_7.png',
            'assets/player_up_walk_8.png',
            'assets/player_left_walk_1.png',
            'assets/player_left_walk_2.png',
            'assets/player_left_walk_3.png',
            'assets/player_right_walk_1.png',
            'assets/player_right_walk_2.png',
            'assets/player_right_walk_3.png',
            'assets/player_sd_down.png',
            'assets/player_ps_left.png',
            'assets/player_ps_right.png',
            'assets/player_ps_up.png',
            'assets/player_ps_down_run_2.png',
            'assets/player_ps_down_run_3.png',
            'assets/player_ps_down_run_4.png',
            'assets/player_ps_down_run_5.png',
            'assets/player_ps_up_run_2.png',
            'assets/player_ps_up_run_3.png',
            'assets/player_ps_up_run_4.png',
            'assets/player_ps_up_run_5.png'
        ]

        const promises = imageSources.map(src => this.loadImage(src));
        return from(Promise.all(promises));
    }
    
    private static loadImage(src: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
            this.imageCache[src] = img;
            resolve();
            };
            img.onerror = reject;
            img.src = src;
        });
    }

    public static getImage(src: string): HTMLImageElement | null {
        return this.imageCache[src];
    }
}