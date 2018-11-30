import {AfterViewInit, Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  token = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Im1oYW5uZWNrZUBhbGlnbi1hbHl0aWNzLmNvbSIsImlzcyI6Im9tZWdhIiwic3ViIjoxOSwidXNlciI6eyJpZCI6MTksInVzZXJfbmFtZSI6Im1oYW5uZWNrZUBhbGlnbi1hbHl0aWNzLmNvbSIsImZ1bGxfbmFtZSI6Ik1hcmNvcyBIYW5uZWNrZSIsImRpc2FibGVkIjpmYWxzZSwic3VwZXJfdXNlciI6dHJ1ZSwib3JnYW5pc2F0aW9uIjp7ImlkIjoxLCJuYW1lIjoiQWxpZ25BbHl0aWNzIiwic2V0dGluZ3MiOnt9LCJpc19vd25lciI6ZmFsc2V9fSwiaWF0IjoxNTQzNTk0OTg3LCJleHAiOjE1NDM2ODEzODd9.WTZNB82sbS_hlZT9hitH7i83bd3lIKGu7R24hhNGKeg';
  event = '';
  conditions: any;
  externalConditions: any;

  constructor() {
    this.externalConditions = [
      {'name': 'Bottle Size', 'in': ['1.5L']},
      {'name': 'Spirit Category', 'in': ['Whisky']},
      {'name': 'Month', 'format': '%b %y', 'in': ['2011-09-01T00:00:00.000Z']}
    ];
  }

  log(e) {
    this.conditions = e;
    console.log(e);
  }


}

