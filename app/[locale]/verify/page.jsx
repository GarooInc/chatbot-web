import initTranslations from '@/app/i18n';
import TranslationsProvider from '@/components/TranslationsProvider/TranslationsProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher/LanguageSwitcher';
import CodeInputComponent from '@/components/CodeInputComponent/CodeInputComponent';
const i18nNamespaces = ['codeVerification'];

export default async function Register({ params }) {
  const { locale } = await params;
  const { t, resources } = await initTranslations(locale, i18nNamespaces);

    return (
        <TranslationsProvider
            namespaces={i18nNamespaces}
            locale={locale}
            resources={resources}>
            <div className='md:hero h-full w-full bg-gradient-to-r from-[#722201] to-[#CC1D1A]'>
                <div className="hero-content flex flex-col-reverse lg:flex-row lg:h-full w-full p-0 max-w-full gap-0">
                    <CodeInputComponent />
                </div>
                <LanguageSwitcher/>
        </div>
    </TranslationsProvider>
    )
}