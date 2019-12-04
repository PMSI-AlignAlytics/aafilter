import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  token = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Im1oYW5uZWNrZUBhbGlnbi1hbHl0aWNzLmNvbSIsImlzcyI6Im9tZWdhIiwic3ViIjoxNTEwLCJ1c2VyIjp7ImlkIjoxNTEwLCJ1c2VyX25hbWUiOiJtaGFubmVja2VAYWxpZ24tYWx5dGljcy5jb20iLCJmdWxsX25hbWUiOiJNYXJjb3MgSGFubmVja2UiLCJkaXNhYmxlZCI6ZmFsc2UsInN1cGVyX3VzZXIiOnRydWUsIm9yZ2FuaXNhdGlvbiI6eyJpZCI6MSwibmFtZSI6IkFsaWduQWx5dGljcyIsInNldHRpbmdzIjp7ImNyZWF0ZV9zb3VyY2VfcHJvdmlkZXJzIjpbImdvb2dsZXNoZWV0cyIsImVsYXN0aWNzZWFyY2giLCJtc3NxbCIsInBnIiwiZWxhc3RpY3NlYXJjaDUiLCJlbGFzdGljc2VhcmNoNiIsImJpZ3F1ZXJ5Il0sImdvb2dsZW1hcHNfY29uZmlnIjp7ImtleSI6IkFJemFTeUJvZ3hRYXFyNzVJcnJKaE84dFlOUmc4VlEwM0hiUm40TSJ9fSwiaXNfb3duZXIiOmZhbHNlfX0sImlhdCI6MTU3NTQ3NjAwOCwiZXhwIjoxNTc1NTYyNDA4fQ.NSUS5Eu8SZEDv6HIAiJEtTpPyLHJF5JZjeDQLNQOO8w';
  event = '';
  conditions: any;
  externalConditions: any;

  constructor() {
    this.externalConditions = [
      {'name': 'Bottle Size', value: 'Bottle Size', 'in': ['1.5L']},
      {'name': 'Spirit Category', 'in': ['Whisky']},
      {'name': 'Month', 'format': '%b %y', 'in': ['2011-09-01T00:00:00.000Z']}
    ];
  }

  log(e) {
    this.conditions = e;
    console.log(e);
  }


}

