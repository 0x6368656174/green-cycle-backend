import * as moment from 'moment';

export function calculateAmount(rentalStart: moment.Moment, rentalEnd: moment.Moment): number {
  const duration = moment.duration(rentalEnd.diff(rentalStart));

  if (duration.asDays() > 1) {
    return 1600;
  }

  if (duration.asHours() > 6) {
    return 1000;
  }

  if (duration.asMinutes() > 90) {
    return 300;
  }

  if (duration.asMinutes() > 60) {
    return 30;
  }

  if (duration.asMinutes() > 30) {
    return 20;
  }

  return 10;
}
