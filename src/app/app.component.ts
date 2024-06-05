import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from 'src/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  title = 'demo-json-formatter';
  form: FormGroup;
  currentId: string | null = null;

  @ViewChild('lineNumbers') lineNumbers!: ElementRef;
  @ViewChild('editor') editor!: ElementRef;

  showGeneratedContent: boolean = false;
  dummyJsonObject = null;

  inputValue: string = JSON.stringify(this.dummyJsonObject);
  endPoint: any;

  constructor(private fb: FormBuilder, private dataService: DataService,private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      inputField: ['', Validators.required],
      method: ['', Validators.required],
      inputValue: [this.dummyJsonObject, Validators.required],
    });
  }

  generateJson() {
    this.showGeneratedContent = true;
  }

  stringifyJSON(object: any) {
    return typeof object === 'object'
      ? JSON.stringify(object, null, 2)
      : object;
  }

  private showSnackbar(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type,
    });
  }

  copyData(event: any) {
    event.preventDefault();
    const preElement = document.getElementById('jsonContent');
    if (preElement) {
      const jsonData = preElement.textContent;
      if (jsonData) {
        navigator.clipboard
          .writeText(jsonData)
          .then(() => {
            this.showSnackbar('JSON copied to clipboard successfully', 'success');
          })
          .catch((error) => {
            this.showSnackbar('Failed to copy JSON to clipboard', 'error');
          });
      }
    }
  }

  syncScroll(event: any) {
    const lineNumbersElement: HTMLElement = this.lineNumbers.nativeElement;
    const editorElement: HTMLElement = this.editor.nativeElement;

    if (event.target === lineNumbersElement) {
      editorElement.scrollTop = lineNumbersElement.scrollTop;
    } else {
      lineNumbersElement.scrollTop = editorElement.scrollTop;
    }
  }

  onSubmit(): void {
    const { inputField, method, inputValue } = this.form.value;
    this.endPoint = inputField;
    if (!method) {
      this.handleError('Method selection is required');
      return;
    }

    let postBody: any;
    try {
      postBody = JSON.parse(inputValue);
    } catch (e) {
      this.handleError('Invalid JSON for POST data');
      return;
    }

      this.postData(inputField, postBody, method);


    // if (method === 'get') {
    //   // Store data using the get method logic
    //   this.storeData(inputField, postBody);
    // } else if (method === 'post') {
    //   // Post data using the post method logic
    //   this.postData(inputField, postBody);
    // }
  }

  postData(inputField: string, postBody: any, method : string): void {
    this.dataService.getData(method).subscribe(
      (data) => {
        const existingItem = data.find((item: any) =>
          item.hasOwnProperty(inputField)
        );
        if (existingItem) {
          const id = existingItem.id;
          this.dataService
            .replaceCollection(id, inputField, postBody, method)
            .subscribe(
              (data) => this.handleResponse(data),
              (postError) => this.handleError(postError)
            );
        } else {
          console.log('Key does not exist, creating new collection');
          this.dataService.createNewCollection(inputField, postBody, method).subscribe(
            (data) => this.handleResponse(data),
            (postError) => this.handleError(postError)
          );
        }
      },
      (error) => {
        if (error.status === 404) {
          console.log('Key does not exist, creating new collection');
          this.dataService.createNewCollection(inputField, postBody, method).subscribe(
            (data) => this.handleResponse(data),
            (postError) => this.handleError(postError)
          );
        } else {
          this.handleError(error);
        }
      }
    );
  }


  stopData(inputField : string, method : string): void {
    method = '';
    if (inputField) {
      this.dataService.deleteCollection(inputField).subscribe(
        () => {
          this.showSnackbar('Data deleted successfully', 'success');
          inputField = '';
        },
        (error) => this.handleError(error)
      );
    } else {
      console.error('No ID available for deletion');
    }
  }

  handleResponse(data: any) {
    if (!Array.isArray(data)) {
      console.log('Expected an array but received:', data);
      return;
    }

    const filterByKey = (data: any[], key: string) => {
      return data.filter((item: any) => item.hasOwnProperty(key));
    };

    const newData = filterByKey(data, this.endPoint);

    if (newData.length > 0) {
      const formattedJson = JSON.stringify(newData[0][this.endPoint], null, 2);
      this.form.patchValue({ inputValue: formattedJson });
    } else {
      console.warn(`No data found with key: ${this.endPoint}`);
    }
  }

  handleError(error: any): void {
    this.inputValue = 'Error fetching data';
  }
}
