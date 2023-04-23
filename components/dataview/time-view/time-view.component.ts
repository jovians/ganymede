import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'gany-time-view',
  templateUrl: './time-view.component.html',
  styleUrls: ['./time-view.component.scss']
})
export class TimeViewComponent implements OnInit, OnChanges, OnDestroy {
  @Input() time: number | string = 0;
  @Input() format: 'datetime' | 'time' | 'date' = 'datetime';
  @Input() mode: 'iso' | 'utc' | 'local' | 'ts' = 'local';
  @Input() timePrecision: 'hr' | 'min' | 'sec' = 'min';
  @Input() copyIcon = false;
  @Input() ampm = true;
  @Input() showDelta = false;
  @Input() deltaUpdateInterval = 5000;
  timeObj: Date = null;
  timeString = '';
  deltaString = '';
  uuid = uuidv4();
  selectId = `select-${this.uuid}`;
  shadowSelectId = `shadow-select-${this.uuid}`;
  deltaUpdateLast = 0;
  deltaChecker = this.startDeltaCheck();
  constructor() { }

  ngOnInit() {
    setTimeout(() => this.updateMode(), 10);
    setTimeout(() => this.updateTime(), 30);
    this.startDeltaCheck();
  }

  ngOnChanges() {
    if (typeof this.time === 'string') {
      if (this.time.endsWith('Z')) {
        this.time = new Date(this.time).getTime();
      } else if (!isNaN(parseInt(this.time, 10))) {
        this.time = parseInt(this.time, 10);
      } else {
        this.time = 0;
      }
    }
    this.updateTime();
  }

  ngOnDestroy() {
    clearInterval(this.deltaChecker);
  }

  startDeltaCheck(checkerInterval = 250) {
    if (this.deltaChecker) { clearInterval(this.deltaChecker); }
    this.deltaChecker = setInterval(() => {
      if (Date.now() - this.deltaUpdateLast > this.deltaUpdateInterval) {
        this.deltaUpdateLast = Date.now();
        this.deltaUpdate();
      }
    }, checkerInterval);
    return this.deltaChecker;
  }

  deltaUpdate() {
    if (this.time as number <= 0) { return; }
    this.deltaString = this.showDelta ? ` (${this.getDelta()})` : '';
    this.updateTime();
  }

  updateMode() {
    const selectElem = document.getElementById(this.selectId) as HTMLSelectElement;
    if (selectElem) { selectElem.value = this.mode; }
  }

  autoResize() {
    const selectElem = document.getElementById(this.selectId) as HTMLSelectElement;
    if (!selectElem) { return; }
    const selectedOption = selectElem.options[selectElem.options.selectedIndex];
    const shadowSelect = document.getElementById(this.shadowSelectId);
    const shadowOpt = document.getElementById(`${this.shadowSelectId}-option`);
    if (!shadowSelect || !shadowOpt) { return; }
    shadowOpt.innerText = selectedOption.innerText;
    selectElem.style.width = `${shadowSelect.offsetWidth}px`;
  }

  updateTime() {
    this.timeObj = new Date(this.time);
    switch (this.format) {
      case 'datetime':
        switch (this.mode) {
          case 'local': this.timeString = `${this.timeObj.toLocaleDateString()} ${this.getTimeString()}`; break;
          case 'utc': this.timeString = `${this.timeObj.toLocaleDateString('UTC')} ${this.getTimeStringUTC()}`; break;
          case 'iso': this.timeString = this.timeObj.toISOString(); break;
          case 'ts': this.timeString = this.timeObj.getTime().toFixed(0); break;
        }
      break;
    }
    this.autoResize();
  }

  getDelta() {
    const delta = Math.floor((Date.now() - (this.time as number)) / 1000);
    if (delta < 60) { return `${delta}s`; }
    else if (delta < 3600) { return `${Math.floor(delta / 60)}m`; }
    else if (delta < 86400) { return `${Math.floor(delta / 3600)}h`; }
    else if (delta < 2592000) { return `${Math.floor(delta / 86400)}d`; }
    else if (delta < 31536000) { return `${Math.floor(delta / 2592000)}mo`; }
    else {
      const yrNum = (delta / 31536000);
      let yr;
      if (yrNum < 10) {
        yr = (delta / 31536000).toFixed(1);
        if (yr.endsWith('.0')) { yr = yr.split('.0')[0]; }
        return `${yr}y`;
      } else {
        return `${Math.floor(yr)}y`;
      }
    }
  }

  getAMPM() { return this.timeObj.getHours() < 12 ? 'AM' : 'PM'; }

  getTimeString() {
    let hr = this.ampm ? this.timeObj.getHours() % 12 : this.timeObj.getHours(); if (hr === 0) { hr = 12; }
    let min = `${this.timeObj.getMinutes()}`; if (min.length < 2) { min = `0${min}`; }
    let sec = `${this.timeObj.getSeconds()}`; if (sec.length < 2) { sec = `0${sec}`; }
    const ampm = this.getAMPM();
    switch (this.timePrecision) {
      case 'hr': return this.ampm ? `${hr} ${ampm}` : `${hr}`; break;
      case 'min': return this.ampm ? `${hr}:${min} ${ampm}` : `${hr}:${min}`; break;
      case 'min': return this.ampm ? `${hr}:${min}:${sec} ${ampm}` : `${hr}:${min}:${sec}`; break;
    }
  }

  getTimeStringUTC() {
    let hr = this.ampm ? this.timeObj.getUTCHours() % 12 : this.timeObj.getUTCHours(); if (hr === 0) { hr = 12; }
    let min = `${this.timeObj.getUTCMinutes()}`; if (min.length < 2) { min = `0${min}`; }
    let sec = `${this.timeObj.getUTCSeconds()}`; if (sec.length < 2) { sec = `0${sec}`; }
    const ampm = this.getAMPM();
    switch (this.timePrecision) {
      case 'hr': return this.ampm ? `${hr} ${ampm}` : `${hr}`; break;
      case 'min': return this.ampm ? `${hr}:${min} ${ampm}` : `${hr}:${min}`; break;
      case 'min': return this.ampm ? `${hr}:${min}:${sec} ${ampm}` : `${hr}:${min}:${sec}`; break;
    }
  }

  onViewOptionChange(e) {
    this.mode = e.target.value;
    this.updateTime();
  }

}
