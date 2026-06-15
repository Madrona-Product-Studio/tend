// Local-first storage: Dexie / IndexedDB. No backend in v1 (Supabase syncs at
// v1.5). The schema mirrors the domain entities; indexes cover the foreign keys
// the repository queries by.
import Dexie, { type EntityTable } from 'dexie';
import type {
  Bed, Cover, Garden, IrrigationNode, Plant, Sensor, Task, Zone,
} from '@/domain';

export class TendDB extends Dexie {
  gardens!: EntityTable<Garden, 'id'>;
  zones!: EntityTable<Zone, 'id'>;
  beds!: EntityTable<Bed, 'id'>;
  plants!: EntityTable<Plant, 'id'>;
  covers!: EntityTable<Cover, 'id'>;
  sensors!: EntityTable<Sensor, 'id'>;
  irrigation!: EntityTable<IrrigationNode, 'id'>;
  tasks!: EntityTable<Task, 'id'>;

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
  }
}

export const db = new TendDB();
