import {async, TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {AafilterComponent} from '../../projects/aafilter/src/lib/aafilter.component';
import {MyOwnCustomMaterialModule} from '../../projects/aafilter/src/lib/aafilter.module';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        AafilterComponent
      ], imports: [
        MyOwnCustomMaterialModule,
        FormsModule,
        HttpClientModule
      ], providers: [
        HttpClientModule
      ]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it(`should have as title 'AAFilter'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('AAFilter');
  }));
});
