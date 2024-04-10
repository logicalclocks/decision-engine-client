export type Options = {
  apiKey: string;
  projectId: number;
  decisionEngineName: string;
  serviceUrl: string;
};

export type EventDetails = {
  id: string | number;
  event_type: string;
  event_value: string | number;
};

export type AppContext = {
  latitude: number;
  longitude: number;
  language: string;
  useragent: typeof navigator.userAgent;
};
