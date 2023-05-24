import { ServingStatus } from './serving-status.enum.js';

export interface HealthCheckResponse {
  status: ServingStatus;
}
