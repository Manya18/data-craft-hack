import en from './trans/en.json';
import ru from './trans/ru.json';

import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';

const resources = {
    en: {
        translation: en,
    },
    ru: {
        translation: ru
    }
}

// i18n.use(initReactI18next).init({
//     resources,
//     lng: JSON.parse(localStorage.getItem('language') ?? ''),
//     fallBackLng: 'ru'
// })

i18n
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: 'ru',
    resources
  });

export default i18n;