"use client";
import React, {useState} from 'react';
import { RiHomeLine } from "react-icons/ri";
import { IoIosStats } from "react-icons/io";
import { LuUserRound } from "react-icons/lu";
import { RiNotificationLine } from "react-icons/ri";
import { BsGear } from "react-icons/bs";
import { IoExitOutline } from "react-icons/io5";
import { signOut } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';


const MenuLeft = () => {

  const navigate = useRouter();
  const pathname = usePathname();

  const [showMenuLeft, setShowMenuLeft] = useState(false);

  const handleLogout = () => {
    signOut();
    navigate.push('/');
  };

  const isActive = (path) => pathname?.includes(path);
  
  return (
    <div className='flex flex-col gap-4 w-full justify-between items-cente h-full'>

      <div className='flex flex-col items-center gap-6'>
        <a href='/chat'>
        <RiHomeLine className={`w-10 h-10 cursor-pointer hover:bg-[#F8FAFC] hover:text-gray-700 rounded-full p-2 ${isActive('/chat') ? 'bg-[#475569] text-white' : 'text-[#475569]'}`} />
        </a>
        <a href='/stats'>
            <IoIosStats className={`w-10 h-10 cursor-pointer hover:bg-[#F8FAFC] hover:text-gray-700 rounded-full p-2 ${isActive('/stats') ? 'bg-[#475569] text-white' : 'text-[#475569]'}`} />
        </a>

        <RiNotificationLine className='w-10 h-10 text-[#475569] cursor-pointer hover:bg-[#F8FAFC] hover:text-gray-700 rounded-full p-2' />
      </div>

        <div className='flex flex-col items-center gap-6'>
            <BsGear className='w-10 h-10 text-[#475569] cursor-pointer hover:bg-[#F8FAFC] hover:text-gray-700 rounded-full p-2' />
            <button 
                className='cursor-pointer text-[#475569] hover:bg-[#F8FAFC] hover:text-gray-700 rounded-full p-2'
                    onClick={
                        handleLogout
                    }
                >
                    <IoExitOutline className='w-6 h-6' />
            </button>
            <a href='/profile'>
              <img 
                src="/assets/images/chat/avatar.png"
                alt="Avatar"
                className="w-10 h-10 rounded-full mb-4"
              />
            </a>
        </div>
    </div>
  )
}

export default MenuLeft