export const COMMON_PROPAGATION_HEADERS = [
  // [IMPORTANT] common, envoy
  'x-request-id',
  // zipkin, jaeger, opencensus
  'x-b3-traceid',
  'x-b3-spanid',
  'x-b3-parentspanid',
  'x-b3-sampled',
  'x-b3-flags',
  // open trace
  'x-ot-span-context',
  // grpc standard
  'grpc-trace-bin',
  // [IMPORTANT] w3c trace standard
  'traceparent',
  // google cloud
  'x-cloud-trace-context',
];
