import { addIcons } from 'ionicons';
import { 
  keyOutline, flashOutline, waterOutline, buildOutline, 
  constructOutline, hardwareChipOutline, shieldCheckmarkOutline, 
  hammerOutline, cogOutline, carOutline, 
  homeOutline, briefcaseOutline, layersOutline, settingsOutline,
  wifiOutline, addCircleOutline, refreshOutline, checkmarkCircleOutline,
  closeCircleOutline
} from 'ionicons/icons';

export interface ServiceIconOption {
  name: string;
  label: string;
}

export const SERVICE_AVAILABLE_ICONS: ServiceIconOption[] = [
  { name: 'flash-outline', label: 'Elétrica' },
  { name: 'construct-outline', label: 'Civil/Serralheria' },
  { name: 'water-outline', label: 'Hidráulica' },
  { name: 'hardware-chip-outline', label: 'Tecnologia' },
  { name: 'shield-checkmark-outline', label: 'Preventivo' },
  { name: 'key-outline', label: 'Chaveiro / Acesso' },
  { name: 'build-outline', label: 'Manutenção / Reparo' },
  { name: 'hammer-outline', label: 'Ferramenta' },
  { name: 'cog-outline', label: 'Mecânica / Ajuste' }
];

export function registerServiceIcons() {
  addIcons({
    keyOutline,
    flashOutline,
    waterOutline,
    buildOutline,
    constructOutline,
    hardwareChipOutline,
    shieldCheckmarkOutline,
    hammerOutline,
    cogOutline,
    carOutline,
    homeOutline,
    briefcaseOutline,
    layersOutline,
    settingsOutline,
    wifiOutline,
    addCircleOutline,
    refreshOutline,
    checkmarkCircleOutline,
    closeCircleOutline
  });
}
