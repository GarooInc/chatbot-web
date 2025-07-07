import React from 'react'
import { RiHomeLine } from "react-icons/ri";
import { IoIosStats } from "react-icons/io";
import { LuUserRound } from "react-icons/lu";
import { RiNotificationLine } from "react-icons/ri";

const MenuLeft = () => {
  return (
    <div className='flex flex-col gap-4 w-full justify-center items-center'>
        <RiHomeLine className='w-10 h-10 text-[#475569] cursor-pointer hover:bg-[#F8FAFC] hover:text-gray-700 rounded-full p-2' />
        <IoIosStats className='w-10 h-10 text-[#475569] cursor-pointer hover:bg-[#F8FAFC] hover:text-gray-700 rounded-full p-2' />
        <LuUserRound className='w-10 h-10 text-[#475569] cursor-pointer hover:bg-[#F8FAFC] hover:text-gray-700 rounded-full p-2' />
        <RiNotificationLine className='w-10 h-10 text-[#475569] cursor-pointer hover:bg-[#F8FAFC] hover:text-gray-700 rounded-full p-2' />
    </div>
  )
}

export default MenuLeft