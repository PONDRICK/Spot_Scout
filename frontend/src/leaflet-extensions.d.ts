// leaflet-extensions.d.ts

import 'leaflet';

declare module 'leaflet' {
  interface Layer {
    isUserDrawn?: boolean;
    isOutputLayer?: boolean;
  }
}
