import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer, throwError } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { map, catchError } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class BackendServiceService {
  constructor(private http: HttpClient) { }

  getStringFromBackend(url: string): Observable<string> {
    return this.http.get<string>(url, { responseType: 'text' as 'json' });
  }


}
