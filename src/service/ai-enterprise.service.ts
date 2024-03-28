import fetchRequest from '../utils/fetch-request';

interface SettingsService {
	url: string;
	key: string;
}

class AIEnterpriseService {
	settings: SettingsService;

	constructor(settings: SettingsService) {
		this.settings = settings;
	}

	async send(message: { content: string }, chatUid: string, agentUid: string): Promise<string> {
		try {
			const result = await fetchRequest({
				method: `POST`,
				uri: `${this.settings.url}/workout/v1/chat`,
				body: {
					body: {
						id: chatUid,
						agentUid: agentUid,
						userId: 'currentUser',
						messages: [message],
					}
				}
			});

			return result.body;
		} catch (error) {
			console.error(error);
		}
	}
}

export default AIEnterpriseService;