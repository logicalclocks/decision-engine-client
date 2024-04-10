import { DecisionEngineClient } from "../src";

const client = new DecisionEngineClient({
  apiKey: "some-api-key",
  projectId: 137,
  decisionEngineName: "h_and_m",
  serviceUrl: "http://localhost:8080/hopsworks-api/api/project",
});

client.handleProductClick({
  id: "test-id",
  event_type: "click",
  event_value: 1,
});
