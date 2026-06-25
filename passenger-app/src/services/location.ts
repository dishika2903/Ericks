import * as Location from 'expo-location';

export interface ILocationCoords {
  latitude: number;
  longitude: number;
}

export const requestLocationPermissions = async (): Promise<boolean> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
};

export const getCurrentLocation = async (): Promise<ILocationCoords> => {
  const hasPermission = await requestLocationPermissions();
  if (!hasPermission) {
    throw new Error('Location permission denied');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const addresses = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lng,
    });

    if (addresses && addresses.length > 0) {
      const addr = addresses[0];
      const parts = [
        addr.name,
        addr.street,
        addr.district,
        addr.city,
        addr.region,
      ].filter(Boolean);
      
      return parts.join(', ') || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    }
  } catch (error) {
    console.error('Error reverse geocoding location:', error);
  }

  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
};
