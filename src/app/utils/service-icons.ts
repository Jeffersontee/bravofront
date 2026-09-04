import { addIcons } from 'ionicons';
import { 
  keyOutline, flashOutline, waterOutline, buildOutline, 
  constructOutline, hardwareChipOutline, shieldCheckmarkOutline, 
  hammerOutline, cogOutline, carOutline, bulbOutline,
  homeOutline, briefcaseOutline, layersOutline, settingsOutline,
  wifiOutline, addCircleOutline, refreshOutline, checkmarkCircleOutline,
  closeCircleOutline, snowOutline, thermometerOutline, flameOutline,
  videocamOutline, cameraOutline, tvOutline, desktopOutline,
  lockClosedOutline, lockOpenOutline, powerOutline, pencilOutline,
  trashOutline, cubeOutline, colorPaletteOutline, brushOutline,
  gridOutline, pricetagOutline, pricetagsOutline, businessOutline,
  personOutline, peopleOutline, personCircleOutline, searchOutline,
  arrowForwardOutline, chevronForwardOutline, calendarOutline,
  statsChartOutline, cashOutline, receiptOutline, alertCircleOutline,
  informationCircleOutline, helpCircleOutline
} from 'ionicons/icons';

export interface ServiceIconOption {
  name: string;
  label: string;
}

export const SERVICE_AVAILABLE_ICONS: ServiceIconOption[] = [
  { name: 'bulb-outline', label: 'Iluminação / LED' },
  { name: 'flash-outline', label: 'Elétrica / Força' },
  { name: 'water-outline', label: 'Hidráulica / Encanamento' },
  { name: 'construct-outline', label: 'Construção / Serralheria' },
  { name: 'hammer-outline', label: 'Reparos / Ferramentas' },
  { name: 'key-outline', label: 'Chaveiro / Fechaduras' },
  { name: 'snow-outline', label: 'Climatização / Ar Condicionado' },
  { name: 'thermometer-outline', label: 'Refrigeração' },
  { name: 'videocam-outline', label: 'CFTV / Câmeras' },
  { name: 'lock-closed-outline', label: 'Segurança / Alarmes' },
  { name: 'hardware-chip-outline', label: 'Tecnologia / Redes' },
  { name: 'wifi-outline', label: 'Internet / Conectividade' },
  { name: 'shield-checkmark-outline', label: 'Manutenção Preventiva' },
  { name: 'build-outline', label: 'Manutenção Geral' },
  { name: 'cog-outline', label: 'Mecânica / Motores' },
  { name: 'brush-outline', label: 'Pintura / Acabamento' }
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
    bulbOutline,
    homeOutline,
    briefcaseOutline,
    layersOutline,
    settingsOutline,
    wifiOutline,
    addCircleOutline,
    refreshOutline,
    checkmarkCircleOutline,
    closeCircleOutline,
    snowOutline,
    thermometerOutline,
    flameOutline,
    videocamOutline,
    cameraOutline,
    tvOutline,
    desktopOutline,
    lockClosedOutline,
    lockOpenOutline,
    powerOutline,
    pencilOutline,
    trashOutline,
    cubeOutline,
    colorPaletteOutline,
    brushOutline,
    gridOutline,
    pricetagOutline,
    pricetagsOutline,
    businessOutline,
    personOutline,
    peopleOutline,
    personCircleOutline,
    searchOutline,
    arrowForwardOutline,
    chevronForwardOutline,
    calendarOutline,
    statsChartOutline,
    cashOutline,
    receiptOutline,
    alertCircleOutline,
    informationCircleOutline,
    helpCircleOutline
  });
}
