// Manual mock for Leaflet in vitest — stubs all Leaflet APIs used by MapComponent

const noop = () => {};

function createMockMap() {
  const map = {
    setView: vi.fn().mockReturnThis(),
    addLayer: vi.fn().mockReturnThis(),
    removeLayer: vi.fn().mockReturnThis(),
    panTo: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    remove: vi.fn(),
    getZoom: vi.fn().mockReturnValue(10),
    flyTo: vi.fn().mockReturnThis(),
    invalidateSize: vi.fn().mockReturnThis(),
    _targets: {} as Record<string, any>,
  };
  return map;
}

function createMockTileLayer() {
  return {
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
    setUrl: vi.fn().mockReturnThis(),
  };
}

function createMockMarker(latlng: [number, number]) {
  const marker = {
    latlng,
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
    bindPopup: vi.fn().mockReturnThis(),
    openPopup: vi.fn().mockReturnThis(),
    closePopup: vi.fn().mockReturnThis(),
    setLatLng: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    getLatLng: vi.fn().mockReturnValue({ lat: latlng[0], lng: latlng[1] }),
    isPopupOpen: vi.fn().mockReturnValue(false),
    removeFrom: vi.fn(),
    _popup: null as any,
  };
  return marker;
}

function createMockPopup() {
  const popup = {
    setContent: vi.fn().mockReturnThis(),
    setLatLng: vi.fn().mockReturnThis(),
    openOn: vi.fn().mockReturnThis(),
    openPopup: vi.fn().mockReturnThis(),
    remove: vi.fn(),
    addTo: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
  };
  return popup;
}

function createMockDivIcon(options?: any) {
  return { options, iconSize: [25, 41] as [number, number] };
}

// Track all created maps so tests can inspect them
const _maps = new Set<any>();

const L = {
  _maps,

  map(id: string | HTMLElement, options?: any) {
    const m = createMockMap();
    (m as any)._id = id;
    (m as any)._options = options;
    _maps.add(m);
    return m;
  },

  tileLayer(url: string, options?: any) {
    const tl = createMockTileLayer();
    (tl as any)._url = url;
    (tl as any)._options = options;
    return tl;
  },

  marker(latlng: [number, number], options?: any) {
    const m = createMockMarker(latlng);
    (m as any)._options = options;
    return m;
  },

  icon(options: any) {
    return createMockDivIcon(options);
  },

  divIcon(options: any) {
    return createMockDivIcon(options);
  },

  popup(options?: any) {
    const p = createMockPopup();
    (p as any)._options = options;
    return p;
  },

  // Utility classes
  control: { zoom: vi.fn().mockReturnValue({ addTo: vi.fn().mockReturnThis() }) } as any,

  // LayerGroup stub
  layerGroup: vi.fn().mockImplementation(() => ({
    addLayer: vi.fn().mockReturnThis(),
    removeLayer: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    clearLayers: vi.fn().mockReturnThis(),
    remove: vi.fn(),
    getLayers: vi.fn().mockReturnValue([]),
  })),

  // FeatureGroup stub
  featureGroup: vi.fn().mockImplementation(() => ({
    addLayer: vi.fn().mockReturnThis(),
    removeLayer: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    clearLayers: vi.fn().mockReturnThis(),
    remove: vi.fn(),
    getLayers: vi.fn().mockReturnValue([]),
    on: vi.fn().mockReturnThis(),
    closePopup: vi.fn().mockReturnThis(),
  })),

  // Event util
  Util: {
    extend: vi.fn().mockImplementation((...args: any[]) => Object.assign({}, ...args)),
  },

  // Class system
  Class: { extend: vi.fn(), include: vi.fn() },

  // LatLng
  latLng: vi.fn().mockImplementation((lat: number, lng: number) => ({ lat, lng })),

  // LatLngBounds
  latLngBounds: vi.fn().mockImplementation(() => ({
    extend: vi.fn().mockReturnThis(),
    getCenter: vi.fn().mockReturnValue({ lat: -8.28, lng: -35.0 }),
  })),

  // Point
  point: vi.fn().mockImplementation((x: number, y: number) => ({ x, y })),

  // Bounds
  bounds: vi.fn().mockImplementation(() => ({
    getCenter: vi.fn().mockReturnValue({ x: 0, y: 0 }),
  })),

  // Transformation
  Transformation: { transform: vi.fn() },

  // Projection
  Projection: {
    SphericalMercator: {
      project: vi.fn(),
      unproject: vi.fn(),
    },
  },

  // CRS
  CRS: {
    EPSG3857: {
      project: vi.fn(),
      unproject: vi.fn(),
      latLngToPoint: vi.fn(),
      pointToLatLng: vi.fn(),
      transformation: { transform: vi.fn() },
      code: 'EPSG:3857',
      wrapLng: [-180, 180] as [number, number],
      wrapLat: [-85.06, 85.06] as [number, number],
    },
    EPSG4326: {
      project: vi.fn(),
      unproject: vi.fn(),
      code: 'EPSG:4326',
      wrapLng: [-180, 180] as [number, number],
      wrapLat: [-90, 90] as [number, number],
    },
  },

  // Zoom animation
  zoomStart: 0,
  zoomEnd: 18,

  // Reset mock helper — call in afterEach
  _reset() {
    _maps.clear();
  },
};

export default L;
export const map = L.map;
export const tileLayer = L.tileLayer;
export const marker = L.marker;
export const icon = L.icon;
export const divIcon = L.divIcon;
export const popup = L.popup;
export const control = L.control;
export const layerGroup = L.layerGroup;
export const featureGroup = L.featureGroup;
export const latLng = L.latLng;
export const latLngBounds = L.latLngBounds;
export const point = L.point;
export const Util = L.Util;
export const Class = L.Class;
export const CRS = L.CRS;
export const Projection = L.Projection;
export const Transformation = L.Transformation;
