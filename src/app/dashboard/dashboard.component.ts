import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as DG from '2gis-maps';
import { AngularFirestore } from '@angular/fire/firestore';
import { combineLatest, of, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { IActiveBicycle, IBicycle, IRentalPoint } from '../db';
import dotIcon from '../../assets/marker--dot.svg';

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

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
