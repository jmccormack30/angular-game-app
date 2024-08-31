import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { InventoryComponent } from './inventory/inventory.component';
import { PlayerFactoryService } from './entities/playerfactory';
import { ImageService } from './imageservice';
import { ItemFactory } from './items/itemfactory';
import { Observable } from 'rxjs';

// Load all images on start
export function initializeApp(imageService: ImageService) {
  return (): Observable<void[]> => {
    // Initialize images or other resources here
    return ImageService.preloadImages();
  };
}

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    InventoryComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    ItemFactory,
    ImageService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ImageService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
