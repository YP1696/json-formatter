import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Import the map operator

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private getUrl = 'http://localhost:3000/mocData';
  private postUrl = 'http://localhost:3000/postData';


  constructor(private http: HttpClient) {}

  // getData(): Observable<any> {
  //   return this.http.get(this.getUrl);
  // }

   getData(method : string): Observable<any> {
    if(method === 'get'){
      return this.http.get(this.getUrl);
    }else{
      return this.http.get(this.postUrl);
    }
  }

  postData(data: any): Observable<any> {
    return this.http.post(this.postUrl, data);
  }



  createNewCollection(key: string, postBody: any, method : string): Observable<any> {
    const newCollection = {
      id : key,
      [key]:postBody,
    };
    if(method === 'get'){
      return this.http.post(this.getUrl, newCollection);
    }else{
      return this.http.post(this.postUrl, newCollection);
    }
  }

  // addToExistingCollection(key: string, postBody: any): Observable<any> {
  //   const updateCollection = {
  //     [key]: [postBody],
  //   };
  //   return this.http.post(this.baseUrl, updateCollection);
  // }

  replaceCollection(id: string,key:string, postBody: any, method : string): Observable<any> {
    const replaceCollection = {
      id: key,
      [key]: postBody,
    };
    if(method === 'get'){
      return this.http.put(`${this.getUrl}/${id}`, replaceCollection);
    }else{
      return this.http.put(`${this.postUrl}/${id}`, replaceCollection);

    }
  }


  deleteCollection(id: string): Observable<any> {
    console.log('id: ', id);
    return this.http.delete(`${this.getUrl}/${id}`);
  }
}
