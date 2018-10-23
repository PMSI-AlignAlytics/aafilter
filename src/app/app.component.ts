import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'AAFilter';
  token = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Im1oYW5uZWNrZUBhbGlnbi1hbHl0aWNzLmNvbSIsImlzcyI6Im9tZWdhIiwic3ViIjoxOS' +
    'widXNlciI6eyJpZCI6MTksInVzZXJfbmFtZSI6Im1oYW5uZWNrZUBhbGlnbi1hbHl0aWNzLmNvbSIsImZ1bGxfbmFtZSI6Ik1hcmNvcyBIYW5uZWNrZSIsImRpc2FibGVkI' +
    'jpmYWxzZSwic3VwZXJfdXNlciI6dHJ1ZSwib3JnYW5pc2F0aW9uIjp7ImlkIjoxLCJuYW1lIjoiQWxpZ25BbHl0aWNzIiwic2V0dGluZ3MiOnt9LCJpc19vd25lciI6ZmF' +
    'sc2V9fSwiaWF0IjoxNTQwMjgzMDk4LCJleHAiOjE1NDAzNjk0OTh9.EAGvJYQTszbLVsvDp_trgmh_RM5eo9ydFjepsGFbyFA';
}
