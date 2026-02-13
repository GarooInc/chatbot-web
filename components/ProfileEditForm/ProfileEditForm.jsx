"use client";
import React, { useState, useEffect } from 'react';
import { IoCamera, IoPencil } from "react-icons/io5";
import Toast from '../Toast/Toast';
import { useTranslation } from 'react-i18next';
import { fetchProfile, updateProfile, uploadProfileImage } from '@/lib/api';

const ProfileView = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [tempDisplayName, setTempDisplayName] = useState('');
  const [tempBio, setTempBio] = useState('');
  const [tempImagePreview, setTempImagePreview] = useState('');

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      // API
      setIsLoading(true);
      const response = await fetchProfile();
      const data = response;

      setEmail(data.email);
      setDisplayName(data.display_name);
      setBio(data.bio);
      setProfileImageUrl(data.profile_image_url);
      setImagePreview(data.profile_image_url);
      setIsLoading(false);
    } catch (error) {
      showNotification('Error al cargar el perfil', 'error');
    }
  };

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTempDisplayName(displayName);
    setTempBio(bio);
    setTempImagePreview(imagePreview);
    setImageFile(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempDisplayName('');
    setTempBio('');
    setTempImagePreview('');
    setImageFile(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification('La imagen no debe superar 5MB', 'warning');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!tempDisplayName.trim()) {
      showNotification('El nombre es requerido', 'warning');
      setIsLoading(false);
      return;
    }

    try {
      // API UPDATE
        const profileData = {
            full_name: tempDisplayName.trim(),
            display_name: tempDisplayName.trim(),
            bio: tempBio.trim(),
        };

        await updateProfile(profileData);

        if (imageFile) {
            const imageUrl = await uploadProfileImage(imageFile);
            setProfileImageUrl(imageUrl);
        }

      setDisplayName(tempDisplayName);
      setBio(tempBio);
      setImagePreview(tempImagePreview);

      showNotification('Perfil actualizado exitosamente', 'success');
      setIsEditing(false);
    } catch (error) {
      showNotification('Error al actualizar el perfil', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex w-full bg-[#F8FAFC] flex-row h-screen overflow-hidden justify-center items-center'>
      <div className="w-full shrink-0 mx-auto p-4 rounded-xl max-w-md">
        {!isEditing ? (
          // VIEW MODE
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-gotham font-bold text-black">Mi Perfil</h2>
              <button
                onClick={handleEdit}
                className="btn btn-sm  bg-[#CC1D1A] text-white hover:bg-[#d54f1b] border-none font-gotham rounded-lg"
              >
                <IoPencil className="h-4 w-4 mr-1" />
                Editar
              </button>
            </div>
            <div className="flex flex-col items-center mb-6">
            {
                !isLoading ? (
              <>
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 shadow-md">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <IoCamera className="h-12 w-12" />
                    </div>
                  )}
                </div>

                <div className="space-y-4 w-full">
                  <div>
                    <label className="text-sm font-gotham text-gray-600">Email</label>
                    <p className="text-base font-gotham text-black mt-1">{email}</p>
                  </div>

                  <div>
                    <label className="text-sm font-gotham text-gray-600">Nombre</label>
                    <p className="text-base font-gotham text-black mt-1">{displayName}</p>
                  </div>

                  <div>
                    <label className="text-sm font-gotham text-gray-600">Biografía</label>
                    <p className="text-base font-gotham text-black mt-1">
                      {bio || 'Sin biografía'}
                    </p>
                  </div>
                </div>
              </>
                ):(
                <div className="flex w-full flex-col gap-4">
                <div className="flex flex-col items-center gap-4 w-full">
                    <div className="skeleton bg-gray-200 h-32 w-32 shrink-0 rounded-full"></div>
                    <div className="flex flex-col gap-4 w-full">
                        <div className="skeleton  bg-gray-200 h-4"></div>
                        <div className="skeleton bg-gray-200 h-4"></div>
                        <div className="skeleton bg-gray-200 h-4"></div>
                    </div>
                </div>
                </div>
                )
            }
            </div>
        </div>

            
        ) : (
          // EDIT MODE
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-gotham font-bold text-black mb-6">Editar Perfil</h2>
            
            <form onSubmit={handleSaveChanges}>
              <div className="form-control">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 shadow-md">
                      {tempImagePreview ? (
                        <img
                          src={tempImagePreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <IoCamera className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor="profile-image"
                      className="absolute bottom-0 right-0 bg-[#CC1D1A] text-white p-2 rounded-full cursor-pointer hover:bg-[#d54f1b] shadow-lg"
                    >
                      <IoCamera className="h-5 w-5" />
                      <input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        disabled={isLoading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className='flex flex-col justify-center items-center w-full gap-4'>
                <div className="form-control w-full">
                  <label className="label font-gotham">
                    <span className="text-black">Email</span>
                  </label>
                  <input
                    type="email"
                    className="  text-gray-500 w-full rounded-xl cursor-not-allowed"
                    value={email}
                    disabled
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label font-gotham">
                    <span className="text-black">Nombre</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    className="input input-bordered bg-gray-200 text-black shadow-md w-full rounded-xl"
                    required
                    value={tempDisplayName}
                    onChange={(e) => setTempDisplayName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label font-gotham">
                    <span className="text-black">Biografía</span>
                  </label>
                  <textarea
                    placeholder="Cuéntanos sobre ti..."
                    className="textarea textarea-bordered bg-gray-200 text-black shadow-md w-full rounded-xl resize-none h-24"
                    value={tempBio}
                    onChange={(e) => setTempBio(e.target.value)}
                    disabled={isLoading}
                    maxLength={200}
                  />
                  <label className="label">
                    <span className="label-text-alt text-gray-500 font-gotham">
                      {tempBio.length}/200 caracteres
                    </span>
                  </label>
                </div>
              </div>

              <div className="form-control mt-6">
                <button
                  type="submit"
                  className="btn w-full bg-[#b43a14] text-white hover:bg-[#d54f1b] border-none font-gotham rounded-xl"
                >
                  {isLoading ? (
                    <span className="loading loading-spinner text-white"></span>
                  ) : (
                    'Guardar cambios'
                  )}
                </button>
              </div>

              <div className="form-control mt-2">
                <button
                  type="button"
                  className="btn w-full bg-gray-200 text-black hover:bg-gray-300 border-none font-gotham rounded-xl"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
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

export default ProfileView;