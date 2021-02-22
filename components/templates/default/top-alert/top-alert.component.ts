import { Component, OnInit } from '@angular/core';
import { Components } from '../../../../../ui.components';

@Component({
  selector: 'app-top-alert',
  templateUrl: './top-alert.component.html',
  styleUrls: ['./top-alert.component.scss']
})
export class TopAlertComponent implements OnInit {
  static registration = Components.register(TopAlertComponent, () => require('./top-alert.component.json'));

  constructor() { }

  ngOnInit() {
  }

}
