import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecommendationPanelComponent } from './recommendation-panel.component';

describe('RecommendationPanelComponent', () => {
  let component: RecommendationPanelComponent;
  let fixture: ComponentFixture<RecommendationPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecommendationPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecommendationPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
