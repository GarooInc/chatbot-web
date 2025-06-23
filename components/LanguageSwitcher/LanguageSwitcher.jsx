'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import i18nConfig from '@/i18nConfig'

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
  const currentLocale = i18n.language;
  const router = useRouter();
  const currentPathname = usePathname();

  const handleChange = e => {
    const newLocale = e.target.value;

    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = date.toUTCString();
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${expires};path=/`;

    if (
      currentLocale === i18nConfig.defaultLocale &&
      !i18nConfig.prefixDefault
    ) {
      router.push('/' + newLocale + currentPathname);
    } else {
      router.push(
        currentPathname.replace(`/${currentLocale}`, `/${newLocale}`)
      );
    }

    router.refresh();
  };


    return (
        <div className='md:p-4 p-2 flex justify-center items-center absolute top-0 right-2'>
          <div className='flex justify-end'>
            <button onClick={handleChange} value='es' className={`md:mx-2 text-black font-certia ${currentLocale === 'es' ? 'font-bold text-black' : 'font-light text-gray-400'}`}>es</button>
            <div className='md:mx-2 mx-[4px]  font-certia font-light text-gray-400'>|</div>
            <button onClick={handleChange} value='en' className={`md:mx-2 text-black font-certia ${currentLocale === 'en' ? 'font-bold text-black' : 'font-light text-gray-400'}`}>en</button>
          </div>
        </div>
    )
}

export default LanguageSwitcher;
