import {AfterViewInit, Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  token = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Im1oYW5uZWNrZUBhbGlnbi1hbHl0aWNzLmNvbSIsImlzcyI6Im9tZWdhIiwic3ViIjoxOSwidXNlciI6eyJpZCI6MTksInVzZXJfbmFtZSI6Im1oYW5uZWNrZUBhbGlnbi1hbHl0aWNzLmNvbSIsImZ1bGxfbmFtZSI6Ik1hcmNvcyBIYW5uZWNrZSIsImRpc2FibGVkIjpmYWxzZSwic3VwZXJfdXNlciI6dHJ1ZSwib3JnYW5pc2F0aW9uIjp7ImlkIjoxLCJuYW1lIjoiQWxpZ25BbHl0aWNzIiwic2V0dGluZ3MiOnt9LCJpc19vd25lciI6ZmFsc2V9fSwiaWF0IjoxNTQyNzEwNzYxLCJleHAiOjE1NDI3OTcxNjF9.fpHjUkoWGM1BygW4N2CmGJSC2hA19MNfWb20unB-mb8';
  event = '';
  conditions: any;
  currentConditions: any;

  constructor() {
    this.currentConditions = [
      {'name': 'Bottle Size', 'in': ['1.5L']},
      {'name': 'Spirit Category', 'in': ['Whisky']}
    ];
  }

  log(e) {
    this.conditions = e;
    console.log(e);
  }


}

