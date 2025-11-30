import ngeohash from 'ngeohash';

export const encodeGeohash = (lat: number, lng: number, precision: number = 7): string => {
  return ngeohash.encode(lat, lng, precision);
};

export const generateGeohashesForRoute = (
  polyline: string,
  precision: number = 6
): string[] => {
  const geohashes = new Set<string>();

  const coordinates = decodePolyline(polyline);

  for (const [lat, lng] of coordinates) {
    const hash = encodeGeohash(lat, lng, precision);
    geohashes.add(hash);

    const neighbors = ngeohash.neighbors(hash);
    Object.values(neighbors).forEach(neighbor => geohashes.add(neighbor));
  }

  return Array.from(geohashes);
};

export const decodePolyline = (encoded: string): [number, number][] => {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += deltaLat;

    result = 0;
    shift = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += deltaLng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
};

export const getGeohashesInRadius = (
  lat: number,
  lng: number,
  radiusKm: number
): string[] => {
  const geohashes = new Set<string>();
  const centerHash = encodeGeohash(lat, lng, 6);

  geohashes.add(centerHash);

  const neighbors = ngeohash.neighbors(centerHash);
  Object.values(neighbors).forEach(neighbor => geohashes.add(neighbor));

  return Array.from(geohashes);
};
