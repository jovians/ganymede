import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AppService } from '../../../services/app.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form: {[name: string] : FormControl} = {};
  imageSource = '/assets/img/hfam_landing1.jpg';

  constructor(
    public app: AppService
  ) {
    this.form.type = new FormControl();
    this.form.username = new FormControl();
    this.form.password = new FormControl();
    this.form.rememberMe = new FormControl();
  }

  ngOnInit() {
  }

}
