import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatePickerService {
  private dateSource = new BehaviorSubject<Date | null>(null);
  currentDate = this.dateSource.asObservable();

  specialDatesBuy: Date[] = [];
  specialDatesSell: Date[] = [];

  constructor() {}

  changeDate(date: Date | null) {
    this.dateSource.next(date);
  }


  isDateSpecialSell(date: Date): boolean {
    return this.specialDatesSell.some(d => d.getTime() === date.getTime());
  }


  isDateSpecialBuy(date: Date): boolean {
    return this.specialDatesBuy.some(d => d.getTime() === date.getTime());
  }

}