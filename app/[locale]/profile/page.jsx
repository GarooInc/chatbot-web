import initTranslations from '@/app/i18n';
import TranslationsProvider from '@/components/TranslationsProvider/TranslationsProvider';
import MenuLeft from '@/components/MenuLeft/MenuLeft';
import ProfileEditForm from '@/components/ProfileEditForm/ProfileEditForm';

const i18nNamespaces = ['profile'];

export default async function Profile({ params }) {
  const { locale } = await params;
  const { t, resources } = await initTranslations(locale, i18nNamespaces);

    return (
        <TranslationsProvider
            namespaces={i18nNamespaces}
            locale={locale}
            resources={resources}>
            <div className='h-full w-full'>
            <div className='flex w-full bg-[#F8FAFC] h-screen'>
                <div className='flex  bg-white justify-between p-4'>
                <div className='flex flex-col items-center '>
                    <button
                        className={`mb-4 focus:outline-none `}
                    >
                        <img
                        src="/assets/images/logos/logo_v2.png"
                        alt="Logo"
                        className="w-8 h-8 md:h-auto mb-4 mx-auto md:mx-0"
                    /> 
                    </button>
                    <MenuLeft />
                    </div>
                </div>
                <div className='flex-1 h-full w-full'>
                    <ProfileEditForm />
                </div>
            </div>
            </div>

    </TranslationsProvider>
    )
}