import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { InventoryComponent } from './inventory/inventory.component';
import { ImageService } from './imageservice';
import { Observable } from 'rxjs';
import { KeyService } from './keyservice';

// Load all images on start
export function initializeApp() {
  return (): Observable<void[]> => {
    // Initialize images or other resources here
    KeyService.initialize();
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
