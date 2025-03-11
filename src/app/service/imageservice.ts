import { Observable, from } from "rxjs";
import { Item } from "../items/Item";
import { ITEM_IMAGES, PICK_AXE_ANIMATION, PLAYER_DEFAULT_IMAGES, PLAYER_WALK_ANIMATION, TILE_IMAGES } from "../../config/constants";

export class ImageService {
  public static imageCache: { [key: string]: HTMLImageElement } = {};

  public static preloadImages(): Observable<void[]> {
    const imageSources = [
      TILE_IMAGES.DIRT,
      TILE_IMAGES.GRASS,
      TILE_IMAGES.WHEAT_DIRT,
      TILE_IMAGES.ROCK,
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
      PLAYER_DEFAULT_IMAGES.UP,
      PLAYER_DEFAULT_IMAGES.DOWN,
      PLAYER_DEFAULT_IMAGES.LEFT,
      PLAYER_DEFAULT_IMAGES.RIGHT,

      PLAYER_WALK_ANIMATION.DOWN_1,
      PLAYER_WALK_ANIMATION.DOWN_2,
      PLAYER_WALK_ANIMATION.DOWN_3,
      PLAYER_WALK_ANIMATION.DOWN_4,

      PLAYER_WALK_ANIMATION.UP_1,
      PLAYER_WALK_ANIMATION.UP_2,
      PLAYER_WALK_ANIMATION.UP_3,
      PLAYER_WALK_ANIMATION.UP_4,
      'assets/player_ps_right_incline.png',
      'assets/player_ps_right_run_2.png',
      'assets/player_ps_right_run_3.png',
      'assets/player_ps_right_run_4.png',
      'assets/player_ps_right_run_5.png',
      PLAYER_WALK_ANIMATION.RIGHT_1,
      PLAYER_WALK_ANIMATION.RIGHT_2,
      PLAYER_WALK_ANIMATION.RIGHT_3,
      PLAYER_WALK_ANIMATION.RIGHT_4,

      PLAYER_WALK_ANIMATION.LEFT_1,
      PLAYER_WALK_ANIMATION.LEFT_2,
      PLAYER_WALK_ANIMATION.LEFT_3,
      PLAYER_WALK_ANIMATION.LEFT_4,

      PICK_AXE_ANIMATION.LEFT_1,
      PICK_AXE_ANIMATION.LEFT_2,
      PICK_AXE_ANIMATION.LEFT_3,
      PICK_AXE_ANIMATION.LEFT_4,

      PICK_AXE_ANIMATION.RIGHT_1,
      PICK_AXE_ANIMATION.RIGHT_2,
      PICK_AXE_ANIMATION.RIGHT_3,
      PICK_AXE_ANIMATION.RIGHT_4,

      ITEM_IMAGES.WHEAT,
      ITEM_IMAGES.BREAD,
      ITEM_IMAGES.PICKAXE,
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

  public static getImageHtml(item: Item | null): string {
    let img = null;
    if (item) {
      img = item.image;
    }
    return img ? img.outerHTML : '';
  }
}