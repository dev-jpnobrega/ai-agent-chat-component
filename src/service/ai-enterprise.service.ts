import fetchRequest from '../helpers/fetch-request';

interface SettingsService {
  url: string;
  xApiKey: string;
}

export type Agent = {
  id: string;
  name: string;
  description: string;
  urlImg: string;
};

export interface SendMessageBody {
  id: string;
  agentUid: string;
  userId: string;
  context: string;
  messages: { id: string; content: string }[];
}

export class AIEnterpriseService {
  settings: SettingsService;

  constructor(settings: SettingsService) {
    this.settings = settings;
  }

  async getAgent(agentIdentify: string): Promise<Agent> {
    try {
      const result = await fetchRequest({
        method: `GET`,
        headers: {
          'x-api-key': this.settings.xApiKey,
        },
        uri: `${this.settings.url}/workout/v1/agent/${agentIdentify}`,
      });

      return result.body;
    } catch (error) {
      console.error(error);
    }
  }

  async sendMessage(sendMessageBody: SendMessageBody): Promise<string> {
    try {
      const result = await fetchRequest({
        method: `POST`,
        uri: `${this.settings.url}/workout/v1/chat`,
        body: {
          body: {
            ...sendMessageBody,
          },
        },
      });

      return result.body;
    } catch (error) {
      console.error(error);
    }
  }
}
