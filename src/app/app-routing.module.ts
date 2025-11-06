import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// project import
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: GuestComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./demo/pages/authentication/auth-signin/auth-signin.component').then((c) => c.AuthSigninComponent)
      }
    ]
  },
  {
    path: 'register',
    component: GuestComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./demo/pages/authentication/auth-signup/auth-signup.component').then((c) => c.AuthSignupComponent)
      }
    ]
  },
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./demo/dashboard/dashboard.component').then((c) => c.DashboardComponent)
      },
      {
        path: 'basic',
        loadChildren: () => import('./demo/ui-elements/ui-basic/ui-basic.module').then((m) => m.UiBasicModule)
      },
      {
        path: 'forms',
        loadComponent: () => import('./demo/pages/form-element/form-element').then((c) => c.FormElement)
      },
      {
        path: 'tables',
        loadComponent: () => import('./demo/pages/tables/tbl-bootstrap/tbl-bootstrap.component').then((c) => c.TblBootstrapComponent)
      },
      {
        path: 'apexchart',
        loadComponent: () => import('./demo/pages/core-chart/apex-chart/apex-chart.component').then((c) => c.ApexChartComponent)
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/extra/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes),HttpClientModule],
  exports: [RouterModule]
})
export class AppRoutingModule {}
