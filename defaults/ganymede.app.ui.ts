import { ganymedeAppData } from './ganymede.app';
import { HttpWrap } from './src/app/ganymede/components/util/http.wrapper';
import { NgrxStoreRoot } from './src/app/ganymede/components/util/ngrx.stores';
import { BasicContentsComponent } from './src/app/ganymede/components/pages/basic-contents/basic-contents.component';

ganymedeAppData.routes = [
  { path: '', component: BasicContentsComponent, data: { templateData: { layout: 'full' } }, },
  ...BasicContentsComponent.asRoute('ganymede-app', {
    templateData: { layout: 'full', scrollbar: 'hide' },
    pageData: {
      type: 'basic-contents',
      children:  []
    }
  }),
  { path: '**', component: BasicContentsComponent, data: { templateData: { layout: 'full' } }, }
];

export const appRoutes = ganymedeAppData.routes;

export const ngrxStores = NgrxStoreRoot.getForRoot({

});

export const otherModules = [

];

export const otherDeclarations = [

];

export const otherProviders = [

];

HttpWrap.loadInitialIntercepts(http => {

});
