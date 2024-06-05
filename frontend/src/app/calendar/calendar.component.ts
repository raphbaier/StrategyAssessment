import { Component } from '@angular/core';

import { FormControl } from '@angular/forms';
import { DatePickerService } from '../date-picker.service';
import { MatCalendarCellCssClasses } from '@angular/material/datepicker';



@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent {
  
  date = new FormControl(new Date(2022, 7, 5));
  minDate = new Date(2020, 8, 1);
  maxDate = new Date(2022, 7, 30);

  constructor(private datePickerService: DatePickerService) {
    // Set the initial date in the service
    this.setDate(this.date.value);

    // Subscribe to changes
    this.date.valueChanges.subscribe(newDate => {
      this.setDate(newDate);
    });
  }

  private setDate(newDate: Date | null) {
    if (newDate) {
      this.datePickerService.changeDate(newDate);
    } else {
      //console.log("no date")
    }
  }


  
  //dateClass = (d: Date) => {
  //  const date = d.getDate();
  //  return (date % 2 === 0) ? 'even-date' : 'odd-date';
 // }

  dateClassBuy = (d: Date) => {
    return this.datePickerService.isDateSpecialBuy(d) ? 'special-date-buy' : '';
  }

  dateClassSell = (d: Date) => {
    return this.datePickerService.isDateSpecialSell(d) ? 'special-date-sell' : '';
  }

  dateClass = (d: Date): MatCalendarCellCssClasses => {
  
    // Assume you have some logic to determine if a date is a buy or sell date
    if (this.datePickerService.isDateSpecialBuy(d)) {
      return 'special-date-buy'; // A CSS class to apply for buy dates
    } else if (this.datePickerService.isDateSpecialSell(d)) {
      return 'special-date-sell'; // A CSS class to apply for sell dates
    }
  
    return ''; // Return an empty string if no special class should be applied
  };

}