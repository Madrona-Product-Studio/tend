import { useEffect } from 'react';
import { useGardenStore } from '@/state/gardenStore';
import type { ID } from '@/domain';

/** Loads (and first-run seeds) a garden tree from local storage. */
export function useGarden(gardenId: ID) {
  const tree = useGardenStore((s) => s.tree);
  const status = useGardenStore((s) => s.status);
  const load = useGardenStore((s) => s.load);
  const toggleTask = useGardenStore((s) => s.toggleTask);
  const addTask = useGardenStore((s) => s.addTask);
  const removeTask = useGardenStore((s) => s.removeTask);
  const setPlantArrangement = useGardenStore((s) => s.setPlantArrangement);
  const addPlant = useGardenStore((s) => s.addPlant);
  const removePlant = useGardenStore((s) => s.removePlant);
  const updatePlant = useGardenStore((s) => s.updatePlant);
  const addCover = useGardenStore((s) => s.addCover);
  const addSensor = useGardenStore((s) => s.addSensor);
  const addIrrigation = useGardenStore((s) => s.addIrrigation);
  const removeEquipment = useGardenStore((s) => s.removeEquipment);
  const setBedLayout = useGardenStore((s) => s.setBedLayout);
  const addBed = useGardenStore((s) => s.addBed);
  const addZone = useGardenStore((s) => s.addZone);
  const renameGarden = useGardenStore((s) => s.renameGarden);
  const setBedGeometry = useGardenStore((s) => s.setBedGeometry);
  const renameZone = useGardenStore((s) => s.renameZone);
  const renameBed = useGardenStore((s) => s.renameBed);
  const addObservation = useGardenStore((s) => s.addObservation);
  const removeObservation = useGardenStore((s) => s.removeObservation);
  const reassignEquipment = useGardenStore((s) => s.reassignEquipment);
  const setIrrigationOn = useGardenStore((s) => s.setIrrigationOn);

  useEffect(() => {
    void load(gardenId);
  }, [gardenId, load]);

  return {
    tree, status, toggleTask, addTask, removeTask, setPlantArrangement, addPlant, removePlant, updatePlant, setBedLayout,
    addBed, addZone, renameGarden, setBedGeometry, renameZone, renameBed, addObservation, removeObservation,
    reassignEquipment, setIrrigationOn, addCover, addSensor, addIrrigation, removeEquipment,
  };
}
