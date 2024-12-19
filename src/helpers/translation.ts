import enTranslations from '../assets/translate/en';
import ptBrTranslations from '../assets/translate/pt-br';

const translations = {
  'en': enTranslations,
  'pt-br': ptBrTranslations,
};

class TranslationUtils {
  static async fetchTranslations(lang: string = `pt-br`): Promise<any> {
    const existingTranslations = JSON.parse(sessionStorage.getItem(`i18n.${lang.toLowerCase()}`));

    if (existingTranslations && Object.keys(existingTranslations).length > 0) {
      return existingTranslations;
    }

    try {
      let translateSelected = translations[lang.toLowerCase()];

      if (!translateSelected) {
        translateSelected = translations[`pt-br`];
        sessionStorage.setItem(`i18n.pt-br`, JSON.stringify(translateSelected));
        return translateSelected;
      }

      sessionStorage.setItem(`i18n.${lang.toLowerCase()}`, JSON.stringify(translateSelected));
      return translateSelected;
    } catch (exception) {
      console.error(`Error loading locale: ${lang}`, exception);

      return undefined;
    }
  }
}

export default TranslationUtils;
