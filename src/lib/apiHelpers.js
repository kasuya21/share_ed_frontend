/** Normalize API responses — backend mixes wrapped and raw payloads. */
export function unwrapData(response) {
  const body = response?.data;
  if (body && typeof body === 'object' && 'data' in body && body.data !== undefined) {
    return body.data;
  }
  return body;
}

export const EDUCATION_LEVELS = [
  { value: '', label: 'All levels' },
  { value: 'MIDDLE_SCHOOL', label: 'Middle School' },
  { value: 'HIGH_SCHOOL', label: 'High School' },
  { value: 'UNIVERSITY', label: 'University' },
];

export const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Popular' },
  { value: 'likes', label: 'Most liked' },
];
