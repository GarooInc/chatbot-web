import initTranslations from '@/app/i18n';
import TranslationsProvider from '@/components/TranslationsProvider/TranslationsProvider';
import RegisterForm from '@/components/RegisterForm/RegisterForm';
import LanguageSwitcher from '@/components/LanguageSwitcher/LanguageSwitcher';

const i18nNamespaces = ['login'];

export default async function Register({ params }) {
  const { locale } = await params;
  const { t, resources } = await initTranslations(locale, i18nNamespaces);

    return (
        <TranslationsProvider
            namespaces={i18nNamespaces}
            locale={locale}
            resources={resources}>
            <div className='md:hero h-full w-full'>
                <div className="hero-content flex flex-col-reverse lg:flex-row lg:h-full w-full p-0 max-w-full gap-0">
                    <div className='w-full lg:w-1/2'>
                        <div className="relative md:h-screen w-full text-4xl font-bold  bg-gradient-to-r from-[#E65F2B] to-[#CC1D1A]">
                            <div className="md:absolute inset-0 bg-black opacity-40 hidden md:block"></div>
                            <div className="md:absolute -right-10 top-1/2 transform -translate-y-1/2 h-full w-16 bg-white rounded-xl hidden md:block"></div>
                            <h2 className="text-2xl font-bold text-white font-gotham italic text-center hidden md:absolute md:block bottom-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            Red Tec
                            </h2>
                        </div>
                    </div>
                    <div className='w-full lg:w-1/2 h-screen relative z-10'>
                        <div className='w-full md:justify-start justify-center items-center flex absolute top-2 p-2'>
                            <img src="/assets/images/logos/logo_v1.png" className="w-40" alt='logo' />
                        </div>
                        <div className='flex flex-col items-center justify-center w-full gap-4 h-full bg-white p-10'>
                            <div className='flex flex-col items-center justify-center  gap-4 w-full'>
                                <h2 className='text-4xl font-bold bg-clip-text text-[#CC1D1A]'>{t('register')}</h2>
                            </div>
                            <RegisterForm />
                        </div>
                    </div>
                </div>
                <LanguageSwitcher/>
        </div>
    </TranslationsProvider>
    )
}