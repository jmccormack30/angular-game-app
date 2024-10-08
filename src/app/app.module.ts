import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { InventoryComponent } from './inventory/inventory.component';
import { ImageService } from './service/imageservice';
import { Observable } from 'rxjs';
import { KeyService } from './service/keyservice';
import { HotbarComponent } from './hotbar/hotbar.component';

// Load all images on start
export function initializeApp() {
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
    HotbarComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    ImageService,
    KeyService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ImageService, KeyService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
