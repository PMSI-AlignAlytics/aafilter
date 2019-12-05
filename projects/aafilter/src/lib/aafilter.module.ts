import {NgModule} from '@angular/core';
import {AafilterComponent, DisplayFormatPipe, HideDimmedPipe, IsDatePipe} from './aafilter.component';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDialogModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatProgressSpinnerModule
} from '@angular/material';
import {CommonModule} from '@angular/common';
import {ScrollingModule} from '@angular/cdk/scrolling';


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
