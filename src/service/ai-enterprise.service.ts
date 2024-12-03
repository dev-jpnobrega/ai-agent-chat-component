import fetchRequest from '../helpers/fetch-request';

interface SettingsService {
  url: string;
  key: string;
}

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

  async send(sendMessageBody: SendMessageBody): Promise<string> {
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
