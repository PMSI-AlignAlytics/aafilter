import {NgModule} from '@angular/core';
import {AafilterComponent, DisplayFormatPipe, HideDimmedPipe, IsDatePipe} from './aafilter.component';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CommonModule} from '@angular/common';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {MatGridListModule} from '@angular/material/grid-list';


@NgModule({
  imports: [
    MatProgressSpinnerModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatGridListModule,
    MatListModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule
  ],
  exports: [
    MatProgressSpinnerModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatGridListModule,
    MatListModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule
  ],
})
export class MyOwnCustomMaterialModule {
}

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    MyOwnCustomMaterialModule,
    ScrollingModule
  ],
  declarations: [AafilterComponent, IsDatePipe, DisplayFormatPipe, HideDimmedPipe],
  exports: [AafilterComponent]
})
export class AafilterModule {
}
