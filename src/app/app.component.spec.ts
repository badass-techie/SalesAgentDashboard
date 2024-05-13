import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {ActivatedRoute} from "@angular/router";
import {of} from "rxjs";

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule, NoopAnimationsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: 1 })
          }
        }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
