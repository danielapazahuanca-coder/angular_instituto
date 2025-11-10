import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'

// project import
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';

const routes: Routes = [
  {
    path: 'auth',
    component: GuestComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./demo/pages/authentication/auth-signin/auth-signin.component').then((c) => c.AuthSigninComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./demo/pages/authentication/auth-signup/auth-signup.component').then((c) => c.AuthSignupComponent)
      }
    ]
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [], // Aún no usamos guard, pero lo dejamos listo
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
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
        path: 'usuarios',
        loadComponent: () => import('./demo/pages/usuarios/usuario.component').then((c) => c.UsuarioComponent)
      },
     {
        path: 'modalidades',
        loadComponent: () => import('./demo/pages/modalidades/modalidad.component').then((c) => c.ModalidadComponent)
      },
      {
        path: 'carreras',
        loadComponent: () => import('./demo/pages/carreras/carrera.component').then((c) => c.CarreraComponent)
      },
      {
        path: 'materias',
        loadComponent: () => import('./demo/pages/materias/materia.component').then((c) => c.MateriaComponent)
      },
      {
        path: 'periodosAcademicos',
        loadComponent: () => import('./demo/pages/periodosAcademicos/periodo-academico.component').then((c) => c.PeriodoAcademicoComponent)
      },
      {
        path: 'grupos',
        loadComponent: () => import('./demo/pages/grupos/grupo.component').then((c) => c.GrupoComponent)
      },
            {
        path: 'estudiantes',
        loadComponent: () => import('./demo/pages/estudiantes/estudiante.component').then((c) => c.EstudianteComponent)
      },
      {
        path: 'apexchart',
        loadComponent: () => import('./demo/pages/core-chart/apex-chart/apex-chart.component').then((c) => c.ApexChartComponent)
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/extra/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      }
    ]
  },
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes),HttpClientModule,FormsModule],
  exports: [RouterModule]
})
export class AppRoutingModule {}
