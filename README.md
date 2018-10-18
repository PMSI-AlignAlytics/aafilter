[![N|Solid](https://travelytic.io/wp-content/uploads/2018/08/AlignAlytics_Logo_Transparent-Background-0112.png)](https://align-alytics.com/)
# Filter Module
Filter module built with Angular 6 and angular material

## Requirements
* **[Angular material](https://material.angular.io)** 
  * **Alternative 1:** Install with Angular CLI  `ng add @angular/material`
  * **Alternative 2:** Install with NPM / Yarn  `https://material.angular.io/guide/getting-started`

## Getting started

1. In your application `npm i aafilter`
2. Add FilterModule to the imports in app.module.ts  
    **e.g. app.module.ts**
   ```  
    import { BrowserModule } from '@angular/platform-browser';  
    import { NgModule } from '@angular/core';  
    import { BrowserAnimationsModule } from '@angular/platform-browser/animations';  
    import { AppComponent } from './app.component';  
    import {AafilterModule} from 'aafilter2';
   
    @NgModule({  
     declarations: [  
       AppComponent,  
     ],  
     imports: [  
       BrowserModule,  
       BrowserAnimationsModule,  
       AafilterModule,  
     ],  
     providers: [],  
     bootstrap: [AppComponent]  
   })  
   export class AppModule { }
   ```

3. Add directive `<aa-filter></aa-filter>` to the component template where you want to use the filter

## Directive properties  
| Name                                | Description |
|-------------------------------------|-------------|
| @Input() <br> endpoint: string      |  Endpoint to make queries            |
| @Input() <br> cardEndpoint: string  |  Endpoint to get card dimensions         |
| @Input() <br> dimensions: string    |  Card dimensions            |


## Debug and Publish library on NPM
https://github.com/AAMarcosHannecke/aafilter/wiki/Debug-and-Publish-library-to-NPM
