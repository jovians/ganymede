import { Component, OnInit } from '@angular/core';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    return from(
      fetch('http://localhost:5836/test.json').then( (response) => {
        return response.json();
      })
    ).pipe(
      map((config) => {
      console.log(config);
    })).toPromise();
  }

}
