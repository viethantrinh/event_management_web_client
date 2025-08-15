import {Component, OnInit, signal} from '@angular/core';

@Component({
  selector: 'app-signal',
  imports: [],
  templateUrl: './signal.component.html',
  styleUrl: './signal.component.css'
})
export class SignalComponent implements OnInit {
  firstName = signal<string>('Morgan')

  ngOnInit() {

  }

}
