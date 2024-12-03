import enTranslations from '../assets/translate/en';
import ptBrTranslations from '../assets/translate/pt-br';

const translations = {
  'en': enTranslations,
  'pt-br': ptBrTranslations,
};

class TranslationUtils {
  static async fetchTranslations(lang: string = `en`): Promise<any> {
    const existingTranslations = JSON.parse(sessionStorage.getItem(`i18n.${lang}`));

    if (existingTranslations && Object.keys(existingTranslations).length > 0) {
      return existingTranslations;
    }

    try {
      const translateSelected = translations[lang];
      sessionStorage.setItem(`i18n.${lang}`, JSON.stringify(translateSelected));
      return translateSelected;
    } catch (exception) {
      console.error(`Error loading locale: ${lang}`, exception);

      return undefined;
    }
  }
}

export default TranslationUtils;
