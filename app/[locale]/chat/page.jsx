import initTranslations from '@/app/i18n';
import TranslationsProvider from '@/components/TranslationsProvider/TranslationsProvider';
import ChatUI from '@/components/ChatUI/ChatUI';

const i18nNamespaces = ['chat'];

export default async function Chat({ params }) {
  const { locale } = await params;
  const { t, resources } = await initTranslations(locale, i18nNamespaces);

    return (
        <TranslationsProvider
            namespaces={i18nNamespaces}
            locale={locale}
            resources={resources}>
            <div className='h-full w-full'>
                <ChatUI />
            </div>
    </TranslationsProvider>
    )
}