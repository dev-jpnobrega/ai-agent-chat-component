class TranslationUtils {
	static async fetchTranslations(lang: string = `en`): Promise<any> {
		const existingTranslations = JSON.parse(sessionStorage.getItem(`i18n.${lang}`));

		if (existingTranslations && Object.keys(existingTranslations).length > 0) {
			return existingTranslations;
		}

		try {
			const response = await fetch(`/assets/translate/${lang}.json`);

			if (response.ok) {
				const data = await response.json();
				sessionStorage.setItem(`i18n.${lang}`, JSON.stringify(data));
				return data;
			}
		} catch (exception) {
			console.error(`Error loading locale: ${lang}`, exception);
		}
	}
}

export default TranslationUtils;