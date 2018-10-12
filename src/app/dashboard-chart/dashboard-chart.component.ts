import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as Chart from 'chart.js';
import * as moment from 'moment';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-chart',
  templateUrl: './dashboard-chart.component.html',
  styleUrls: ['./dashboard-chart.component.scss']
})
export class DashboardChartComponent implements OnInit, OnDestroy {
  @Input() title: string;
  @Input() statistic: string;

  @ViewChild('chart') chartContainer: ElementRef<HTMLCanvasElement>;

  startTime$: BehaviorSubject<moment.Moment> = new BehaviorSubject(moment().add(-1, 'M'));
  endTime$: BehaviorSubject<moment.Moment> = new BehaviorSubject(moment());
  range$: Observable<string>;
  days$: Observable<moment.Moment[]>;
  values$: Observable<number[]>;
  max$: Observable<number>;
  private chart: Chart;
  private ngUnsubscribe = new Subject();

  constructor(private firestore: AngularFirestore) { }

  ngOnInit(): void {
    this.range$ = combineLatest(this.startTime$, this.endTime$).pipe(
      map(([startTime, endTime]) => `${startTime.format('DD MMMM')} - ${endTime.format('DD MMMM')}`),
    );

    this.days$ = combineLatest(this.startTime$, this.endTime$).pipe(
      map(([startTime, endTime]) => {
        const result = [];
        const tomorrow = moment(endTime).add(1, 'd');
        const time = moment(startTime);
        while (tomorrow.diff(time, 'd') > 0) {
          result.push(moment(time));
          time.add(1, 'd');
        }

        return result;
      }),
    );

    this.values$ = this.days$.pipe(
      switchMap(days => {
        const values$ = days.map(day => {
          return this.firestore.collection('statistics').doc(day.format('YYYY-MM-DD')).valueChanges().pipe(
            map(value => value ? value[this.statistic] || 0 : 0),
          );
        });

        return combineLatest(values$);
      }),
      takeUntil(this.ngUnsubscribe),
    );

    this.max$ = this.values$.pipe(
      map(values => {
        let max = values[0];
        values.forEach(value => {
          if (value > max) {
            max = value;
          }
        });

        return max;
      }),
    );

    const chartCtx = this.chartContainer.nativeElement.getContext('2d');
    const gradient = chartCtx.createLinearGradient(0, 0, 0, 80);
    gradient.addColorStop(0, 'rgba(203, 246, 221, 0.65)');
    gradient.addColorStop(1, 'rgba(200, 253, 222, 0.04)');


    this.chart = new Chart(this.chartContainer.nativeElement, {
      type: 'line',
      data: {
        datasets: [{
          label: 'за день',
          borderColor: '#fff',
          pointBackgroundColor: '#219653',
          borderWidth: 3,
          backgroundColor: gradient,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 10,
            bottom: 20,
            right: 20,
          },
        },
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            display: false,
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true,
              display: false,
            },
            gridLines: {
              zeroLineColor: 'transparent',
              borderDash: [2, 2],
              color: '#27AE60',
            }
          }]
        },
      }
    });

    this.days$.subscribe(days => {
      this.chart.data.labels = days.map(day => day.format('DD MMMM'));

      this.chart.update();
    });

    this.values$.subscribe(value => {
      this.chart.data.datasets.forEach(dataset => {
        dataset.data = value;
      });

      this.chart.update();
    });

    this.max$.subscribe(max => {
      (this.chart as any).options.scales.yAxes.forEach(axes => {
        axes.ticks.stepSize = max / 4;
      });

      this.chart.update();
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
