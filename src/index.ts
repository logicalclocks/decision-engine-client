import { Options, EventDetails, AppContext } from "./types";

export type { Options, EventDetails, AppContext };

export class DecisionEngineClient {
  options: Options;
  clickedItemIds: Set<string | number>;
  sessionId: string;

  constructor(options: Options) {
    if (!options.apiKey || typeof options.apiKey !== "string") {
      throw new Error("API key is a required parameter of type string");
    }
    if (!options.projectId || typeof options.projectId !== "number") {
      throw new Error("Project ID is a required parameter of type number");
    }

    this.options = {
      apiKey: options.apiKey,
      projectId: options.projectId,
      decisionEngineName: options.decisionEngineName,
      serviceUrl: options.serviceUrl,
    };

    this.sessionId = this.generateUUID(); // Generate a session ID that persists for the instance
    // Load clicked item IDs from localStorage or initialize to an empty set
    const savedClickedItemIds =
      JSON.parse(localStorage.getItem("clickedItemIds") || "[]") || [];
    this.clickedItemIds = new Set(savedClickedItemIds);
    this.getRecommendations = this.getRecommendations.bind(this);
    this.getAppContext = this.getAppContext.bind(this);
    this.handleProductClick = this.handleProductClick.bind(this);
    this.saveClickedItemIds = this.saveClickedItemIds.bind(this);
  }

  saveClickedItemIds(): void {
    // Save the current state of clickedItemIds to localStorage
    localStorage.setItem(
      "clickedItemIds",
      JSON.stringify(Array.from(this.clickedItemIds))
    );
  }

  handleProductClick(eventDetails: EventDetails): void {
    // Add item ID to clickedItemIds and save the updated set
    this.clickedItemIds.add(eventDetails.id);
    this.saveClickedItemIds();

    this.sendFeedback(eventDetails);
    console.log("Event details:", eventDetails);
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  getAppContext(): Promise<AppContext> {
    return new Promise((resolve, reject) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              language: navigator.language,
              useragent: navigator.userAgent,
              sessionId: this.sessionId,
            });
          },
          (error) => {
            reject(error);
          }
        );
      } else {
        reject(new Error("Geolocation is not supported by this browser."));
      }
    });
  }
  async sendFeedback(eventDetails: EventDetails): Promise<void> {
    const context = await this.getAppContext();
    const { apiKey, projectId, decisionEngineName, serviceUrl } = this.options;
    const feedbackUrl = `${serviceUrl}/${projectId}/inference/models/de${decisionEngineName.replace(
      /_/g,
      ""
    )}eventsredirectdeployment:predict`;

    const headers = {
      Authorization: `ApiKey ${apiKey}`,
      "Content-Type": "application/json",
    };

    const currentDate = new Date();
    const timestamp = currentDate.toISOString(); // Format as ISO string
    const eventId = Math.floor(Math.random() * 100000); // Generate a random event ID
  
    const body = {
      instances: [
        {
          event_id: eventId,
          session_id: context.sessionId, 
          event_timestamp: timestamp, 
          item_id: eventDetails.id,
          event_type: eventDetails.event_type,
          event_value: eventDetails.event_value,
          event_weight: 1,
          longitude: context.longitude,
          latitude: context.latitude,
          language: context.language,
          useragent: context.useragent,
        },
      ],
    };

    try {
      const response = await fetch(feedbackUrl, {
        keepalive: true,
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Feedback sent successfully:", responseData);
    } catch (error) {
      console.error("Error sending feedback:", error);
    }
  }

  async getRecommendations(): Promise<any> {
    const context = await this.getAppContext();
    const { apiKey, projectId, decisionEngineName, serviceUrl } = this.options;
    const url = `${serviceUrl}/${projectId}/inference/models/de${decisionEngineName.replace(
      /_/g,
      ""
    )}querydeployment:predict`;
    const data = {
      instances: [
        [
          {            
            de_name: this.options.decisionEngineName,
            decision_id: Math.floor(Math.random() * 100000),
            session_id: context.sessionId, 
            context_item_ids: Array.from(this.clickedItemIds),
            longitude: context.longitude,
            latitude: context.latitude,
            language: context.language,
            useragent: context.useragent,
          },
        ],
      ],
    };

    const headers = {
      Authorization: `ApiKey ${apiKey}`,
      "Content-Type": "application/json",
    };

    return fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        return responseData;
      });
  }
}

export default DecisionEngineClient;
