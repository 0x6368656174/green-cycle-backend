import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { CdkTableModule } from '@angular/cdk/table';

import { AppComponent } from './app.component';
import { LayoutComponent } from './layout/layout.component';
import { LeftMenuComponent } from './left-menu/left-menu.component';
import { HeaderComponent } from './header/header.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardChartComponent } from './dashboard-chart/dashboard-chart.component';
import { IconButtonComponent } from './icon-button/icon-button.component';
import { DashboardPipesComponent } from './dashboard-pipes/dashboard-pipes.component';
import { DashboardTableComponent } from './dashboard-table/dashboard-table.component';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    LeftMenuComponent,
    HeaderComponent,
    DashboardComponent,
    DashboardChartComponent,
    IconButtonComponent,
    DashboardPipesComponent,
    DashboardTableComponent,
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AppRoutingModule,
    CdkTableModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
