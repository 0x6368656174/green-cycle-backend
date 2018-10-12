import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as DG from '2gis-maps';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';
import {IRentalPoint} from '../db';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('map') private map: ElementRef<HTMLDivElement>;

  private rentalPointsMarkers = {};

  constructor(private firestore: AngularFirestore) { }

  ngOnInit() {
    const dgMap = DG.map(this.map.nativeElement, {
      'center': [50.257931, 127.531805],
      'zoom': 13,
      'zoomControl': false,
    });

    const rentalPoints$ = this.firestore.collection<IRentalPoint>('rentalPoints').stateChanges();

    rentalPoints$.subscribe(actions => {
      actions.forEach(action => {
        const id = action.payload.doc.id;
        if (action.type === 'added') {
          const dbPoint = action.payload.doc.data();

          this.rentalPointsMarkers[id] = DG.marker([dbPoint.latitude, dbPoint.longitude]).addTo(dgMap).bindPopup(dbPoint.address || '');
        } else if (action.type === 'modified') {
          const dbPoint = action.payload.doc.data();

          const point = this.rentalPointsMarkers[id];
          if (!point) {
            throw new Error(`Not found point with id = ${id}`);
          }

          point.setLatLng(DG.latLng(dbPoint.latitude, dbPoint.longitude));
          point.bindPopup(dbPoint.address || '');
        } else {
          const point = this.rentalPointsMarkers[id];
          if (!point) {
            throw new Error(`Not found point with id = ${id}`);
          }
          point.removeFrom(dgMap);

          delete this.rentalPointsMarkers[id];
        }
      });
    });

  }
}
