# decisionEngineClient

client library for decision engine integration

# Installation

```sh
npm install decision-engine-client
```

# Usage

```ts
import { DecisionEngineClient } from "../src";

const client = new DecisionEngineClient({
  apiKey: "your-api-key",
  projectId: 1,
  decisionEngineName: "Decision-engine-name",
  serviceUrl: "http://localhost:8080/hopsworks-api/api/project",
});

...
client.handleProductClick({
  id: "test-id",
  event_type: "click",
  event_value: 1,
});

```
