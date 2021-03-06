import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as Chart from 'chart.js';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-pipes',
  templateUrl: './dashboard-pipes.component.html',
  styleUrls: ['./dashboard-pipes.component.scss'],
})
export class DashboardPipesComponent implements OnInit, OnDestroy {
  @Input()
  firstTitle: string;
  @Input()
  secondTitle: string;
  @Input()
  firstStatisticValue: string;
  @Input()
  secondStatisticValue: string;

  @ViewChild('firstChart')
  private firstChartElement: ElementRef<HTMLCanvasElement>;
  @ViewChild('secondChart')
  private secondChartElement: ElementRef<HTMLCanvasElement>;

  firstValue$: Observable<number>;
  secondValue$: Observable<number>;
  private firstChart: Chart;
  private secondChart: Chart;
  private ngUnsubscribe = new Subject();

  constructor(private firestore: AngularFirestore) {}

  ngOnInit(): void {
    this.firstValue$ = this.firestore
      .collection('statisticValues')
      .doc(this.firstStatisticValue)
      .valueChanges()
      .pipe(
        map(({ max, current }) => {
          return Math.round((max / 100) * current);
        }),
        takeUntil(this.ngUnsubscribe),
      );
    this.secondValue$ = this.firestore
      .collection('statisticValues')
      .doc(this.secondStatisticValue)
      .valueChanges()
      .pipe(
        map(({ max, current }) => {
          return Math.round((max / 100) * current);
        }),
        takeUntil(this.ngUnsubscribe),
      );

    const options: Chart.ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['', ''],
        datasets: [
          {
            borderColor: ['#fff', '#27AE60'],
            backgroundColor: ['#fff', '#27AE60'],
          },
        ],
      },
      options: {
        cutoutPercentage: 99,
        tooltips: {
          enabled: false,
        },
        legend: {
          display: false,
        },
        scales: {
          xAxes: [
            {
              display: false,
            },
          ],
          yAxes: [
            {
              display: false,
            },
          ],
        },
      },
    };

    this.firstChart = new Chart(this.firstChartElement.nativeElement, options);
    this.secondChart = new Chart(this.secondChartElement.nativeElement, options);

    this.firstValue$.subscribe(value => {
      this.firstChart.data.datasets.forEach(dataset => {
        dataset.data = [value, 100 - value];
      });

      this.firstChart.update();
    });

    this.secondValue$.subscribe(value => {
      this.secondChart.data.datasets.forEach(dataset => {
        dataset.data = [value, 100 - value];
      });

      this.secondChart.update();
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
