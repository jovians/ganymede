import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

interface RoutePathHeader {
  name: string;
  path: string;
  active?: boolean;
}

export const headerNavigation: RoutePathHeader[] = [
  { path: 'project', name: 'Project' },
  { path: 'dashboard', name: 'Dashboard' },
  { path: 'cicd', name: 'CI/CD' },
  { path: 'infra', name: 'Infra' },
  { path: 'dev', name: 'Dev Env' },
  { path: 'toolbox', name: 'Toolbox' },
  { path: 'docs', name: 'Docs' },
];

const routes: Routes = [];

// [{
//   path: '', redirectTo: 'about', pathMatch: 'full'
// }, {
//   path: 'login', component: LoginComponent, data: { layout: 'nothing', scrollbar: 'hide' }
//   // canActivate: [AuthenticatedGuard],
// }, {
//   path: 'about', component: AboutComponent, data: { layout: 'header-only', scrollbar: 'hide' }
//   // canActivate: [AuthenticatedGuard],
// }, {
//   path: 'dashboard', component: DashboardComponent,
//   // canActivate: [AuthenticatedGuard],
// }, {
//   path: 'env-config',
//   component: ConfigComponent,
//   // canActivate: [AuthenticatedGuard],
// }, {
//   path: 'settings',
//   component: ConfigComponent
//   // canActivate: [AuthenticatedGuard],
// }, {
//   path: 'experiments', children: [
//     { path: '', component: AboutComponent, pathMatch: 'full', data: { layout: 'full' } },
//     { path: 'yoyo', component: ConfigComponent, data: { layout: 'full' } },
//   ]
//   // canActivate: [AuthenticatedGuard],
// }, {
//   path: 'settings',
//   component: ConfigComponent,
//   // canActivate: [AuthenticatedGuard],
// }, {
//   path: 'error',
//   component: ErrorComponent, data: { layout: 'header-only' },
//   // canActivate: [AuthenticatedGuard],
// }, {
//   path: '**',
//   component: RouteHandlerComponent, data: { layout: 'full' },
// }
// ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
