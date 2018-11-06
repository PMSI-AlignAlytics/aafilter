import { NgModule } from '@angular/core';
import {AafilterComponent, IsDatePipe} from './aafilter.component';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatProgressSpinnerModule,
  MatChipsModule,
  MatDialogModule
} from '@angular/material';
import {CommonModule} from '@angular/common';



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
  ],
  declarations: [AafilterComponent,     IsDatePipe],
  exports: [AafilterComponent]
})
export class AafilterModule { }
