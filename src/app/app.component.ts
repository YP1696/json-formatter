import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  @ViewChild('lineNumbers') lineNumbers!: ElementRef;
  @ViewChild('editor') editor!: ElementRef;

  showGeneratedContent: boolean = false;
  dummyJsonObject = null;

  inputValue: string = JSON.stringify(this.dummyJsonObject);
  endPoint: any;

  constructor(private fb: FormBuilder, private dataService: DataService) {
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

  copyData(event: any) {
    event.preventDefault();
    const preElement = document.getElementById('jsonContent');
    if (preElement) {
      const jsonData = preElement.textContent;
      if (jsonData) {
        navigator.clipboard
          .writeText(jsonData)
          .then(() => {
            console.log('JSON copied to clipboard successfully');
          })
          .catch((error) => {
            console.error('Failed to copy JSON to clipboard:', error);
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

    if (method === 'get') {
      this.dataService.getData().subscribe(
        (data) => this.handleResponse(data),
        (error) => this.handleError(error)
      );
    } else if (method === 'post') {
      let postBody: any;
      try {
        postBody = JSON.parse(inputValue);
      } catch (e) {
        this.handleError('Invalid JSON for POST data');
        return;
      }

      this.dataService.getData().subscribe(
        (data) => {
          const existingItem = data.find((item: any) =>
            item.hasOwnProperty(inputField)
          );

          if (existingItem) {
 console.log("existingItem ", existingItem.id);

            // this.dataService
            //   .findParentObjectByKey('id', existingItem.id)
            //   .subscribe((v) => console.log(v));
const id  = existingItem.id
            this.dataService.replaceCollection(id,inputField, postBody).subscribe(
              (data) => this.handleResponse(data),
              (postError) => this.handleError(postError)
            );
          } else {
            console.log('Key does not exist, creating new collection');
            this.dataService
              .createNewCollection(inputField, postBody)
              .subscribe(
                (data) => this.handleResponse(data),
                (postError) => this.handleError(postError)
              );
          }
        },
        (error) => {
          if (error.status === 404) {
            console.log('Key does not exist, creating new collection');
            this.dataService
              .createNewCollection(inputField, postBody)
              .subscribe(
                (data) => this.handleResponse(data),
                (postError) => this.handleError(postError)
              );
          } else {
            this.handleError(error);
          }
        }
      );
    }
  }

  handleResponse(data: any) {
    if (!Array.isArray(data)) {
      console.error('Expected an array but received:', data);
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
