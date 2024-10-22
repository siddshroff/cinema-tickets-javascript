import * as prom from "prom-client";
import { Metrics } from "../../utils/constants.js";
const failedEventsCounter = new prom.Counter({
  name: `${Metrics.METRICS_PREFIX}failure_events_total`,
  help: 'Total count of failures',
});
const failedBusinessEventsCounter = new prom.Counter({
  name: `${Metrics.METRICS_PREFIX}business_failure_events_total`,
  help: 'Total count of business rule failures',
});
export { prom, failedBusinessEventsCounter, failedEventsCounter };