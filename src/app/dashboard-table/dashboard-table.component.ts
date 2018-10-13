import { CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as moment from 'moment';
import { combineLatest, interval, Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { IActiveBicycle, IBicycle, IClient } from '../db';
import { pluralize } from '../pluralize';
import { calculateAmount } from '../price';
import { formatPhone } from '../utils';

interface IActiveBicycleRow {
  phone: string;
  clientId: string;
  bicycle: string;
  bicycleId: string;
  rentalStart: moment.Moment;
  rentalStartString: string;
  mileage: string;
  duration: string;
  amount: string;
}

class ActiveBicyclesDataSource extends DataSource<IActiveBicycleRow> {
  constructor(private firestore: AngularFirestore) {
    super();
  }

  connect(collectionViewer: CollectionViewer): Observable<IActiveBicycleRow[]> {
    const currentTime$ = interval(60000).pipe(
      map(() => moment()),
      startWith(moment()),
    );

    return this.firestore.collection<IActiveBicycle>('activeBicycles').snapshotChanges().pipe(
      map(changes => {
        return changes.map(change => {
          const data = change.payload.doc.data();
          return {
            bicycleId: change.payload.doc.id,
            clientId: data.client.id,
            rentalStart: moment(data.rentalStart.toDate()),
            rentalStartString: moment(data.rentalStart.toDate()).format('HH:mm, DD MMMM'),
            mileage: data.mileage.toFixed(2),
          };
        });
      }),
      switchMap(bicycles => {
        const rows$ = bicycles.map(row => {
          const client$ = this.firestore.collection('clients').doc<IClient>(row.clientId).valueChanges();
          const bicycle$ = this.firestore.collection('bicycles').doc<IBicycle>(row.bicycleId).valueChanges();

          return combineLatest(client$, bicycle$, currentTime$).pipe(
            map(([client, bicycle, currentTime]) => {
              const duration = moment.duration(currentTime.diff(row.rentalStart)).clone();

              let durationString = '';
              if (duration.days() >= 1) {
                durationString += pluralize(duration.days(), 'день', 'дня', 'дней');
              }
              if (duration.hours() >= 1) {
                durationString += ' ' + pluralize(duration.hours(), 'час', 'часа', 'часов');
              }
              if (duration.minutes() >= 1) {
                durationString += ' ' + pluralize(duration.minutes(), 'минута', 'минуты', 'минут');
              }
              return {
                ...row,
                bicycle: bicycle.name,
                phone: formatPhone(client.phone),
                duration: durationString,
                amount: calculateAmount(row.rentalStart, currentTime).toFixed(2),
              };
            })
          );
        });

        return combineLatest(rows$);
      }),
    );
  }

  disconnect(collectionViewer: CollectionViewer): void { }
}

@Component({
  selector: 'app-dashboard-table',
  templateUrl: './dashboard-table.component.html',
  styleUrls: ['./dashboard-table.component.scss']
})
export class DashboardTableComponent implements OnInit {
  bicycles: ActiveBicyclesDataSource;

  constructor(firestore: AngularFirestore) {
    this.bicycles = new ActiveBicyclesDataSource(firestore);
  }

  ngOnInit() {
  }

}
