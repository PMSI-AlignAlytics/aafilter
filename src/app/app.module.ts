import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {AafilterModule} from '../../projects/aafilter/src/lib/aafilter.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AafilterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
