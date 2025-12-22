import initTranslations from '@/app/i18n';
import TranslationsProvider from '@/components/TranslationsProvider/TranslationsProvider';
import MenuLeft from '@/components/MenuLeft/MenuLeft';
import Dashboard from '@/components/Dashboard/Dashboard';

const i18nNamespaces = ['stats'];

export default async function Stats({ params }) {
  const { locale } = await params;
  const { t, resources } = await initTranslations(locale, i18nNamespaces);

    return (
        <TranslationsProvider
            namespaces={i18nNamespaces}
            locale={locale}
            resources={resources}>
            <div className='flex w-full bg-[#F8FAFC] md:flex-row flex-col h-full max-h-screen'>
                <div className='flex md:flex-col bg-white justify-between p-4'>
                    <div className='flex md:flex-col items-center h-screen'>
                        <img
                        src="/assets/images/logos/logo_v2.png"
                        alt="Logo"
                        className="md:w-8 w-4 h-4 md:h-auto mb-4 mx-auto md:mx-0"
                        /> 
                        <MenuLeft />
                    </div>
                </div>
                <div className='flex-1 p-6 overflow-y-auto'>
                    <Dashboard />
                </div>
            </div>
    </TranslationsProvider>
    )
}