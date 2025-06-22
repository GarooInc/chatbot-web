import TranslationsProvider from '@/components/TranslationsProvider/TranslationsProvider';
import initTranslations from '../i18n';

const i18nNamespaces = ['test'];

export default async function Home({ params: { locale } }) {
  const { t, resources } = await initTranslations(locale, i18nNamespaces);

  return (
    <TranslationsProvider
      namespaces={i18nNamespaces}
      locale={locale}
      resources={resources}>
      <main className="text-2xl">
        <h1>{t('test')}</h1>
      </main>
    </TranslationsProvider>
  );
}

