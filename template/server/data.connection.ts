/**
 * Define abstract layer for 
 * 1) Store definitions (tables & collections)
 * 2) Standard index operations
 * 3) CRUD operations on stores
 * 4) Data store scaling & governance operations
 */

import * as MongoDB from 'mongodb';
const MongoDBObjectId = MongoDB.ObjectId;

export enum DataStoreType {
  MongoDB = 'mongodb',
}

export function dataStoreEndpointUID(config: DataStoreEndpointConfig): string {
  return `${config.type}|${config.protocol}|${config.host}|${config.port}`;
}

export interface DataStoreEndpointConfig {
  /** Database endpoint type (e.g. MySQL, MongoDB, Redis, etc.) */
  type?: DataStoreType;
  /** Database endpoint host */
  host?: string;
  /** Database endpoint port */
  port?: string;
  /** Database endpoint connection protocol (e.g. {mongodb}://) */
  protocol?: string;
  /** Database endpoint credentials */
  credentials?: any;
  /** Database endpoint unique hash  */
  hash?: string;

  /** Database name */
  name?: string; 
  /** Collection (table) name */
  recordSet?: string;
  
  /** Endpoint URL factory */
  endpointFactory?: () => string;
  /** Connection factory */
  connectionFactory?: () => any;
}

export interface DataStoreDefinition {

}

export interface DataStoreScaleData {
  /** RW size from which IOPS are measured */
  iopsSize?: number;
  /** Read performance */
  iopsRead?: number;
  /** Write performance */
  iopsWrite?: number;
  /** RW 50/50 performance */
  iopsRW?: number; 
  /** RW 70/30 performance */
  iopsRW73?: number;
  /** Total instances dedicated for this data store cluster */
  instanceCount?: number;
  /** Total physical instances dedicated for this data store cluster */
  instanceCountPhysical?: number;
  /** Total CPU (GHz) allocated for this cluster */
  computePower?: number;
  /** Total RAM (GB) allocated for this cluster */
  memoryAllocated?: number;
  /** Other misc. information about the cluster topology */
  topology?: any;
}

export class ActiveDataStoreEndpoints {
  private static registry = new Map<string, DataStoreConnector[]>();
  public static get(index: string): DataStoreConnector[] {
    return ActiveDataStoreEndpoints.registry.get(index);
  }
  public static add(index: string, handler: DataStoreConnector): void {
    let list = ActiveDataStoreEndpoints.registry.get(index); if (!list) { list = []; }
    if (list.indexOf(handler) === -1) { list.push(handler); }
    ActiveDataStoreEndpoints.registry.set(index, list);
  }
  public static remove(index: string, handler: DataStoreConnector): void {
    let list = ActiveDataStoreEndpoints.registry.get(index); if (!list) { list = []; }
    const pos = list.indexOf(handler); if(pos >= 0) { list.splice(pos, 1); }
    ActiveDataStoreEndpoints.registry.set(index, list);
  }
}

/** Individual data record */
export interface DataTarget {
  getDataStoreType: () => DataStoreType;
}

interface DataStoreInsertEvent { id?: string; version?: string; }
interface DataStoreUpdateEvent { good?: boolean; id?: string; version?: string; }
interface DataStoreDeleteEvent { good?: boolean; id?: string; version?: string; }

/** Collection level */
export interface DataStore {

  connection: any;

  addIndex?: () => Promise<boolean>;
  getIndex?: () => Promise<any>;

  insert?: <T>(a:T) => Promise<DataStoreInsertEvent>;
  get?: <T>(id:string) => Promise<T>;
  set?: <T>(id:string, data:T) => Promise<DataStoreUpdateEvent>;
  delete?: <T>(id:string) => Promise<DataStoreDeleteEvent>;

  find?: <T>(cond:any) => Promise<T[]>;
  update?: <T>(filter:any, data:T) => Promise<DataStoreUpdateEvent>;
  deleteMatching?: (filter:any) => Promise<DataStoreDeleteEvent>;

  insertMany?: <T>(a:T[]) => Promise<T[]>;
  getMany?: <T>(ids:string[]) => Promise<T[]>;
  setMany?: <T>(ids:string[], data:T[]) => Promise<DataStoreUpdateEvent[]>;
  deleteMany?: <T>(ids:string[]) => Promise<DataStoreDeleteEvent[]>;
}

/** Endpoint level */
export interface DataStoreConnector {
  getScale: () => DataStoreScaleData;
  validate: (config:DataStoreEndpointConfig) => void;
  open: (config:DataStoreEndpointConfig) => Promise<DataStore>;
  close: () => void;
}




/**
 * MongoDB-specific implementation
 */
class DataStore_MongoDB implements DataStore {
  connection: any;
  constructor(dsRaw) { this.connection = dsRaw; }

  insert<T>(a:T) {
    return new Promise<DataStoreInsertEvent>((resolve, reject) => {
      if(a['_id'] && typeof a['_id'] === 'string') {
        a['_id'] = MongoDBObjectId(a['_id']);
      }
      this.connection.insertOne(a, (e, result) => {
        if (e) { return reject(e); } resolve({id: result.insertedId});
      });
    });
  }
  get<T>(id:string) {
    return new Promise<T>((resolve, reject) => {
      this.connection.find({_id: MongoDBObjectId(id) }).toArray((e, result) => {
        if (e) { return reject(e); } resolve(result as T);
      });
    });
  }
  set<T>(id:string, data:T) {
    return new Promise<DataStoreUpdateEvent>((resolve, reject) => {
      this.connection.updateOne({_id: MongoDBObjectId(id) }, { $set: data }, (e, result) => {
        if (e) { return reject(e); } resolve({good: result.modifiedCount > 0});
      });
    });
  }
  delete<T>(id:string) {
    return new Promise<DataStoreDeleteEvent>((resolve, reject) => {
      this.connection.deleteOne({_id: MongoDBObjectId(id) }, (e, result) => {
        if (e) { return reject(e); } resolve({good: result.deletedCount > 0});
      });
    });
  }
}


export class DataStoreConnector_MongoDB implements DataStoreConnector {

  private endpointHash: string;
  private connection: any;

  open(config?:DataStoreEndpointConfig): Promise<DataStore> {
    config = this.validate(config);
    const name = config.name;
    const recordSet = config.recordSet;
    return new Promise<DataStore>((resolve, reject) => {
      if (config.connectionFactory) {
        const client = config.connectionFactory();
        client.connect((e) => {
          if (e) { console.log(e);  reject(e); return; }
          this.connection = client;
          this.endpointHash = config.hash;
          ActiveDataStoreEndpoints.add(this.endpointHash, this);
          const db = client.db(name);
          const dsRaw = db.collection(recordSet);
          const ds = new DataStore_MongoDB(dsRaw);
          resolve(ds);
        });
      } else {
        const e = new Error('Connetion factory definition is not provided.');
        reject(e);
      }
    });
  }

  close(): void {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
      ActiveDataStoreEndpoints.remove(this.endpointHash, this);
      this.endpointHash = null;
    }
  }

  validate(config: DataStoreEndpointConfig): DataStoreEndpointConfig {
    if (!config) { config = {}; }
    config.type = DataStoreType.MongoDB;
    if (!config.host) { config.host = 'localhost'; }
    if (!config.port) { config.port = '27017'; }
    if (!config.protocol) { config.protocol = 'mongodb'; }
    
    if (!config.name) { config.name = 'default'; }
    if (!config.recordSet) { config.recordSet = 'default'; }

    config.hash = dataStoreEndpointUID(config);
    if (!config.endpointFactory) {
      config.endpointFactory = function(){
        return `${this.protocol}://${this.host}:${this.port}`;
      };
    }
    if (!config.connectionFactory) {
      config.connectionFactory = function(){
        const endpointString = this.endpointFactory();
        const connectionOptions = { useUnifiedTopology: true };
        return new MongoDB.MongoClient(endpointString, connectionOptions);
      };
    }
    return config;
  }

  getScale() { return null;}
}