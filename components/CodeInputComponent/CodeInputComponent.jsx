"use client";
import { useState, useRef, useEffect } from 'react';
import Toast from '../Toast/Toast';
import { codeVerification } from '@/lib/auth';
import { useRouter } from 'next/navigation';


const CodeInputComponent = () => {
  const [code, setCode] = useState(new Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [email, setEmail] = useState('');
  const inputsRef = useRef([]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('email');
      setEmail(storedEmail || '');
    }
  }, []);

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (index < 5) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === 'Backspace') {
      const newCode = [...code];
      newCode[index] = '';
      setCode(newCode);
      if (index > 0) {
        inputsRef.current[index - 1].focus();
      }
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const codeString = code.join('');
      
      if (!codeString || codeString.length !== 6) {
        showNotification('Por favor ingresa el código completo de 6 dígitos', 'warning');
        setIsLoading(false);
        return;
      }

      if (!email) {
        showNotification('Email no encontrado. Por favor regístrate nuevamente.', 'error');
        setIsLoading(false);
        return;
      }

      const response = await codeVerification({
        email,
        code: codeString,
      });

      if (response.success) {
        showNotification('Verificación exitosa', 'success');
        localStorage.removeItem('email'); 
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        throw new Error(response.message || 'Error al verificar el código');
      }

    } catch (error) {
      console.error("Error en verificación:", error);
      showNotification(error.message || 'Error al verificar el código', 'error');
      setCode(new Array(6).fill(''));
      if (inputsRef.current[0]) {
        inputsRef.current[0].focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {email && (
        <p className="text-white text-sm font-avenir mb-2">
          Código enviado a: {email}
        </p>
      )}

      <div className="flex space-x-2 justify-center items-center">
        {code.map((digit, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            ref={(el) => (inputsRef.current[index] = el)}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleBackspace(e, index)}
            className="w-12 h-12 text-center text-2xl  rounded-lg focus:outline-none border-0 focus:border-none bg-white text-black"
            disabled={isLoading}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2 w-full items-center mt-4">
        <button
          onClick={handleSubmit}
          className="btn bg-black border-none outline-0 shadow-none hover:text-black  hover:bg-white text-white font-gotham w-full"
          disabled={code.includes('') || isLoading}
        >
          {isLoading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            'Verificar'
          )}
        </button>
      </div>

      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      )}
    </div>
  );
};

export default CodeInputComponent;