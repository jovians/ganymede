import { Modules } from '../ui.modules';
import { NgModule } from '@angular/core';
import { GanymedeCoreModule } from '../ganymede/components/ganymede.core.module';

@NgModule({
  imports: [
    GanymedeCoreModule
  ],
  declarations: [
    // USER CUSTOM ROUTE COMPONENTS DECLARATIONS START

    // USER CUSTOM ROUTE COMPONENTS DECLARATIONS END
  ],
  exports: [
    // USER CUSTOM ROUTE COMPONENTS EXPORT START

    // USER CUSTOM ROUTE COMPONENTS EXPORT END
  ],
})
export class UserRoutesModule {
  static registration = Modules.register(UserRoutesModule, () => require('./routes.module.json'));
}
