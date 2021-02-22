import { ganymedeAppData } from './ganymede.app';
import { BasicContentsComponent } from './src/app/ganymede/components/pages/basic-contents/basic-contents.component';
import { i18n } from './src/app/ganymede/components/util/i18n-helper';

ganymedeAppData.routes = [
  { path: '', component: BasicContentsComponent, data: { templateData: { layout: 'full' } }, },
  BasicContentsComponent.asRoute('ganymede-app', {
    templateData: { layout: 'full', scrollbar: 'hide' },
    pageData: {
      type: 'basic-contents',
      children:  []
    }
  }),
  { path: '**', component: BasicContentsComponent, data: { templateData: { layout: 'full' } }, }
];

export const appRoutes = ganymedeAppData.routes;

Object.defineProperty(window, 'ganymedeAppData', { get: () => ganymedeAppData });
