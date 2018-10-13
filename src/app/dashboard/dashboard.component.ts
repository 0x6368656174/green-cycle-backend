import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as DG from '2gis-maps';
import { AngularFirestore } from '@angular/fire/firestore';
import { combineLatest, of, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { IActiveBicycle, IBicycle, IRentalPoint } from '../db';
import dotIcon from '../../assets/marker--dot.svg';
import marker1 from '../../assets/markers/1.svg';
import marker2 from '../../assets/markers/2.svg';
import marker3 from '../../assets/markers/3.svg';
import marker4 from '../../assets/markers/4.svg';
import marker5 from '../../assets/markers/5.svg';
import marker6 from '../../assets/markers/6.svg';
import marker7 from '../../assets/markers/7.svg';
import marker8 from '../../assets/markers/8.svg';
import marker9 from '../../assets/markers/9.svg';
import marker10 from '../../assets/markers/10.svg';
import marker11 from '../../assets/markers/11.svg';
import marker12 from '../../assets/markers/12.svg';
import marker13 from '../../assets/markers/13.svg';
import marker14 from '../../assets/markers/14.svg';
import marker15 from '../../assets/markers/15.svg';
import marker16 from '../../assets/markers/16.svg';
import marker17 from '../../assets/markers/17.svg';
import marker18 from '../../assets/markers/18.svg';
import marker19 from '../../assets/markers/19.svg';
import marker20 from '../../assets/markers/20.svg';
import marker21 from '../../assets/markers/21.svg';
import marker22 from '../../assets/markers/22.svg';
import marker23 from '../../assets/markers/23.svg';
import marker24 from '../../assets/markers/24.svg';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('map') private map: ElementRef<HTMLDivElement>;

  private rentalPointsMarkers = {};
  private activeBicyclesMarkers = {};
  private ngUnsubscribe = new Subject();

  constructor(private firestore: AngularFirestore) { }

  ngOnInit(): void {
    const dgMap = DG.map(this.map.nativeElement, {
      'center': [50.263931, 127.531805],
      'zoom': 13,
      'zoomControl': false,
    });

    const rentalPoints$ = this.firestore.collection<IRentalPoint>('rentalPoints').stateChanges().pipe(
      takeUntil(this.ngUnsubscribe),
    );

    rentalPoints$.subscribe(actions => {
      actions.forEach(action => {
        const id = action.payload.doc.id;
        if (action.type === 'added') {
          const dbPoint = action.payload.doc.data();

          this.rentalPointsMarkers[id] = DG.marker([dbPoint.latitude, dbPoint.longitude], {icon: this.getMarker(dbPoint.bicycles.length)})
            .addTo(dgMap).bindPopup(dbPoint.address || '');
        } else if (action.type === 'modified') {
          const dbPoint = action.payload.doc.data();

          const point = this.rentalPointsMarkers[id];
          if (!point) {
            throw new Error(`Not found point with id = ${id}`);
          }

          point.setLatLng(DG.latLng(dbPoint.latitude, dbPoint.longitude));
          point.setIcon(this.getMarker(dbPoint.bicycles.length));
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

    const bikeIcon = DG.icon({
      iconUrl: dotIcon,
      iconRetinaUrl: dotIcon,
      iconSize: [32, 32],
      iconAnchor: [16, 14],
      popupAnchor: [0, 0],
      shadowUrl: undefined,
      shadowRetinaUrl: undefined,
      shadowSize: [68, 95],
      shadowAnchor: [22, 94]
    });


    const activeBikes$ = this.firestore.collection<IActiveBicycle>('activeBicycles').stateChanges().pipe(
      switchMap(actions => {
        const bicycles$ = actions.map(action => {
          const id = action.payload.doc.id;
          const type = action.type;
          switch (type) {
            case 'removed': {
              return of({
                id,
                type: 'removed',
                position: undefined,
                name: undefined,
              });
            }
            default: {
              const activeBicycle: IActiveBicycle = action.payload.doc.data();

              return this.firestore.collection('bicycles').doc<IBicycle>(id).valueChanges().pipe(
                map(bicycle => {
                  return {
                    id,
                    type,
                    position: activeBicycle.position,
                    name: bicycle.name,
                  };
                }),
              );
            }
          }
        });

        return combineLatest(bicycles$);
      }),
      takeUntil(this.ngUnsubscribe),
    );

    activeBikes$.subscribe(actions => {
      actions.forEach(({id, type, position, name}) => {
        if (type === 'added') {
          this.activeBicyclesMarkers[id] = DG.marker([position.latitude, position.longitude], {icon: bikeIcon}).addTo(dgMap)
            .bindPopup(name || '');
        } else if (type === 'modified') {
          const point = this.activeBicyclesMarkers[id];
          if (!point) {
            throw new Error(`Not found point with id = ${id}`);
          }

          point.setLatLng(DG.latLng(position.latitude, position.longitude));
          point.bindPopup(name || '');
        } else {
          const point = this.activeBicyclesMarkers[id];
          if (!point) {
            throw new Error(`Not found point with id = ${id}`);
          }
          point.removeFrom(dgMap);

          delete this.activeBicyclesMarkers[id];
        }
      });
    });
  }

  private getMarker(num: number) {
    let icon;
    switch (num) {
      case 1: icon = marker1; break;
      case 2: icon = marker2; break;
      case 3: icon = marker3; break;
      case 4: icon = marker4; break;
      case 5: icon = marker5; break;
      case 6: icon = marker6; break;
      case 7: icon = marker7; break;
      case 8: icon = marker8; break;
      case 9: icon = marker9; break;
      case 10: icon = marker10; break;
      case 11: icon = marker11; break;
      case 12: icon = marker12; break;
      case 13: icon = marker13; break;
      case 14: icon = marker14; break;
      case 15: icon = marker15; break;
      case 16: icon = marker16; break;
      case 17: icon = marker17; break;
      case 18: icon = marker18; break;
      case 19: icon = marker19; break;
      case 20: icon = marker20; break;
      case 21: icon = marker21; break;
      case 22: icon = marker22; break;
      case 23: icon = marker23; break;
      case 24: icon = marker24; break;
    }

    return DG.icon({
      iconUrl: icon,
      iconRetinaUrl: icon,
      iconSize: [24, 32],
      iconAnchor: [12, 32],
      popupAnchor: [0, 0],
      shadowUrl: undefined,
      shadowRetinaUrl: undefined,
      shadowSize: [68, 95],
      shadowAnchor: [22, 94]
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
