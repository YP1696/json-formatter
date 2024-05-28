import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Import the map operator

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private baseUrl = 'http://localhost:3000/mocData';

  constructor(private http: HttpClient) {}

  getData(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  createNewCollection(key: string, postBody: any): Observable<any> {
    const newCollection = {
      id : key,
      [key]:postBody,
    };
    return this.http.post(this.baseUrl, newCollection);
  }

  // addToExistingCollection(key: string, postBody: any): Observable<any> {
  //   const updateCollection = {
  //     [key]: [postBody],
  //   };
  //   return this.http.post(this.baseUrl, updateCollection);
  // }

  replaceCollection(id: string,key:string, postBody: any): Observable<any> {
    const replaceCollection = {
      id: key,
      [key]: postBody,
    };
    return this.http.put(`${this.baseUrl}/${id}`, replaceCollection);
  }


  // deleteCollection(key: string): Observable<any> {
  //   return this.http.delete(`${this.baseUrl}/${key}`);
  // }
}
