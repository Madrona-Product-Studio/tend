// Local-first storage: Dexie / IndexedDB. No backend in v1 (Supabase syncs at
// v1.5). The schema mirrors the domain entities; indexes cover the foreign keys
// the repository queries by.
import Dexie, { type EntityTable } from 'dexie';
import type {
  Bed, Cover, Garden, IrrigationNode, Observation, Plant, Sensor, Task, Zone,
} from '@/domain';

export interface MetaRow { key: string; value: number }

export class TendDB extends Dexie {
  gardens!: EntityTable<Garden, 'id'>;
  zones!: EntityTable<Zone, 'id'>;
  beds!: EntityTable<Bed, 'id'>;
  plants!: EntityTable<Plant, 'id'>;
  covers!: EntityTable<Cover, 'id'>;
  sensors!: EntityTable<Sensor, 'id'>;
  irrigation!: EntityTable<IrrigationNode, 'id'>;
  tasks!: EntityTable<Task, 'id'>;
  observations!: EntityTable<Observation, 'id'>;
  meta!: EntityTable<MetaRow, 'key'>;

  constructor() {
    super('tend');
    this.version(1).stores({
      gardens: 'id, name',
      zones: 'id, gardenId',
      beds: 'id, zoneId',
      plants: 'id, bedId',
      covers: 'id, gardenId, assignedBedId',
      sensors: 'id, gardenId, assignedBedId',
      irrigation: 'id, gardenId, bedId, order',
      tasks: 'id, gardenId, bedId, done',
    });
    this.version(2).stores({
      observations: 'id, gardenId, bedId, plantId',
      meta: 'key',
    });
  }
}

export const db = new TendDB();
