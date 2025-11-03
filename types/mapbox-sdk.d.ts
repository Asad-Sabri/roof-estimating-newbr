declare module '@mapbox/mapbox-sdk/services/geocoding' {
  import type { AxiosRequestConfig } from 'axios';
  type GeocodingService = (config?: { accessToken?: string } & AxiosRequestConfig) => any;
  const mbxGeocoding: GeocodingService;
  export default mbxGeocoding;
}


