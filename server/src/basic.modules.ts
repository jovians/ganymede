import { DataStore } from './data.connection';

export namespace BasicModules {

interface AuthenticationRecordHollow {
  email?: string;
  password?: string;
}
interface AuthenticationRecordSkel extends AuthenticationRecordHollow {
  _id?: string;
  _ver?: number;
}
export class Authentication {
  initialize(root, ds: DataStore) {

    root.post('/auth', async (req, res) => {
      res.send('test');
      const r = await ds.insert<AuthenticationRecordSkel>({
        _id: '5dee435e543934819b508422',
        email: 'test',
        password: 'test',
      });
      console.log(r);
    });

    root.post('/auth2', async (req, res) => {
      res.send('test');
      const id = '5dee435e543934819b508422';
      const r = await ds.get<AuthenticationRecordSkel>(id);
      console.log(r);
    });

    root.post('/auth3', async (req, res) => {
      res.send('test');
      const id = '5dee435e543934819b508422';
      const r = await ds.set<AuthenticationRecordSkel>(id, {
        email: 'modified_' + (new Date()).toISOString()
      });
      console.log(r);
    });

    root.post('/auth4', async (req, res) => {
      res.send('test');
      const id = '5dee435e543934819b508422';
      const r = await ds.delete<AuthenticationRecordSkel>(id);
      console.log(r);
    });

  }
}

}