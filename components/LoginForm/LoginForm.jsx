"use client";
import React, { useState, useEffect } from 'react';
import { IoEye } from "react-icons/io5";
import { IoMdEyeOff } from "react-icons/io";
import { useRouter } from 'next/navigation';
import Toast from '../Toast/Toast';
import { useTranslation } from 'react-i18next';


const LoginForm = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const navigate =  useRouter();


  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    if (!username.trim() || !password.trim()) {
      showNotification('Por favor complete todos los campos', 'warning');
      setIsLoading(false);
      return;
    }
  
    try {
      navigate.push('/chat');
    } catch (error) {
      showNotification(error.message, 'error');
      setPassword('');
    } finally {
      setIsLoading(false);
      
    }
  };

  return (
    <>
      <div className="card bg-white w-full max-w-sm shrink-0 shadow-2xl">
        <form className="card-body" onSubmit={handleSubmit}>
          <div className="form-control">
            <label className="label font-gotham">
              <span className="text-black">{t('user')}</span>
            </label>
            <input 
              type="text" 
              placeholder="Usuario" 
              className="input input-bordered bg-gray-200 text-black shadow-md w-full" 
              required 
              value={username}
              onChange={handleUsernameChange}
              disabled={isLoading}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="text-black">{t('password')}</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                className="input input-bordered w-full pr-10 bg-gray-200 text-black shadow-md"
                required
                value={password}
                onChange={handlePasswordChange}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute top-1/2 right-2 transform -translate-y-1/2"
                disabled={isLoading}
              >
                {showPassword ? (
                  <IoMdEyeOff className="h-5 w-5 text-black cursor-pointer" />
                ) : (
                  <IoEye className="h-5 w-5 text-black cursor-pointer" />
                )}
              </button>
            </div>
            <label className="label font-gotham">
              <a href="#" className="label-text-alt link link-hover text-gray-600">
                {t('forgot_password')}
              </a>
            </label>
          </div>

          <div className="form-control mt-6">
            <button 
              type="submit"
              className="btn w-full bg-[#E65F2B] text-white hover:bg-[#E65F2B] border-none font-gotham"
              disabled={isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                t('login')
              )}
            </button>
          </div>

          <div className="form-control mt-4 text-center">
            <p className="text-sm font-gotham text-[#E65F2B]">
              {t('no_acc')}
              {' '}
              <a 
                href="/register" 
                className="link link-hover text-black"
                tabIndex={isLoading ? -1 : 0}
              >
                {t('register_here')}
              </a>
            </p>
          </div>
        </form>
      </div>

      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      )}
    </>
  );
};

export default LoginForm;