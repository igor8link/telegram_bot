import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);
  const refreshToken = ref(localStorage.getItem('refreshToken') || null);
  const loading = ref(false);

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const userProfile = computed(() => user.value);

  const login = async (credentials) => {
    loading.value = true;
    try {
      console.log('Вход:', { username: credentials.username });
      const response = await api.login(credentials);
      
      console.log('Ответ входа:', response.data);
      
      // Хранение токенов доступа
      token.value = response.data.access;
      refreshToken.value = response.data.refresh;
      
      localStorage.setItem('token', token.value);
      localStorage.setItem('refreshToken', refreshToken.value);

      await fetchUserProfile();
      
      return response.data;
    } catch (error) {
      console.error('Ошибка входа:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Очистка данных при ошибке входа
      logout();
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const register = async (userData) => {
    loading.value = true;
    try {
      console.log('Попытка регистрации:', userData);
      const response = await api.register(userData);
      console.log('Успешная регистрация:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка регистрации:', error.response?.data);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    refreshToken.value = null;
    
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  const fetchUserProfile = async () => {
    if (!token.value) return;
    
    try {
      const response = await api.getUserProfile();
      user.value = response.data;
      console.log('Профиль найден:', response.data);
    } catch (error) {
      console.error('Ошибка загрузки пользователя:', error);

      if (error.response?.status === 401) {
        logout();
      } else if (error.response?.status === 404) {
        console.log('Профиль не найден');
      }
    }
  };

  const refreshAuthToken = async () => {
    if (!refreshToken.value) {
      logout();
      return false;
    }

    try {
      const response = await api.refreshToken(refreshToken.value);
      token.value = response.data.access;
      localStorage.setItem('token', token.value);
      return true;
    } catch (error) {
      console.error('Ошибка обновления токена, refresh token:', error);
      logout();
      return false;
    }
  };

  const updateProfile = async (profileData) => {
    loading.value = true;
    try {
      console.log('Обновление профиля с:', profileData);
      
      // Обновление профиля
      const updatePayload = {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone_number: profileData.phone_number,
        address: profileData.address
      };
      
      const response = await api.updateUserProfile(updatePayload);

      user.value = { ...user.value, ...response.data };
      
      console.log('Профиль обновлён:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка обновления профиля:', error.response?.data);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const initializeAuth = async () => {
    if (token.value) {
      await fetchUserProfile();
    }
  };

  return {
    user,
    token,
    refreshToken,
    loading,

    isAuthenticated,
    userProfile,

    login,
    register,
    logout,
    fetchUserProfile,
    refreshAuthToken,
    updateProfile,
    initializeAuth
  };
});