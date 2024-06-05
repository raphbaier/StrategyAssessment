import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CytoscapeGraphComponent } from './cytoscape-graph.component';

describe('CytoscapeGraphComponent', () => {
  let component: CytoscapeGraphComponent;
  let fixture: ComponentFixture<CytoscapeGraphComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CytoscapeGraphComponent]
    });
    fixture = TestBed.createComponent(CytoscapeGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
