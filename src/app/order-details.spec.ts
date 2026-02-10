import { TestBed } from '@angular/core/testing';

import { OrderDetails } from './order-details';

describe('OrderDetails', () => {
  let service: OrderDetails;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderDetails);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
