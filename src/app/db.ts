import { DocumentReference } from '@angular/fire/firestore';
import { Timestamp } from '@firebase/firestore-types';

export interface IRentalPoint {
  readonly address: string;
  readonly latitude: number;
  readonly longitude: number;
}

export interface IBicycle {
  readonly name: string;
}

export interface IClient {
  readonly phone: number;
}

export interface IActiveBicycle {
  readonly client: DocumentReference;
  readonly rentalStart: Timestamp;
  readonly mileage: number;
}
