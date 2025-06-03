import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';

export const useFavoriteStore = defineStore('favorite', () => {
  const favoriteItems = ref([]);
  const loading = ref(false);

  // Создание кэша
  const initializeFromLocalStorage = () => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);
        favoriteItems.value = Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error('Ошибка парсинга:', error);
        favoriteItems.value = [];
      }
    }
  };

  // Сохранение избранного в кэш
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('favorites', JSON.stringify(favoriteItems.value));
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const isFavorite = (productId) => {
    const result = favoriteItems.value.some(item => item.id === productId);
    return result;
  };

  const addToFavorites = (product) => {
    const exists = favoriteItems.value.some(item => item.id === product.id);
    if (!exists) {
      favoriteItems.value.push(product);
      saveToLocalStorage();
      return true;
    }
    return false;
  };

  const removeFromFavorites = (productId) => {
    const index = favoriteItems.value.findIndex(item => item.id === productId);
    if (index > -1) {
      const removed = favoriteItems.value.splice(index, 1)[0];
      saveToLocalStorage();
      console.log('Удаление из избранного:', removed.title);
      return true;
    }
    return false;
  };

  const toggleFavorite = async (product) => {

    let productId;
    let productData;
    
    if (typeof product === 'number' || typeof product === 'string') {
      productId = parseInt(product);
      productData = null;
    } else {
      productId = product.id;
      productData = product;
    }
    
    
    const wasInFavorites = isFavorite(productId);
    console.log('Was in favorites:', wasInFavorites);

    const { useAuthStore } = await import('@/stores/authStore');
    const authStore = useAuthStore();

    if (authStore.isAuthenticated) {
      try {
        const response = await api.toggleFavorite(productId);
        console.log('API response:', response.data);
        
        // соединение кэша с пользователем
        if (response.data.status === 'добавлен') {
          if (productData) {
            addToFavorites(productData);
          }
        } else if (response.data.status === 'удалён') {
          removeFromFavorites(productId);
        }
        
      } catch (error) {
        console.error('Ошибка кэша', error);
        
        if (wasInFavorites) {
          removeFromFavorites(productId);
        } else if (productData) {
          addToFavorites(productData);
        }
      }
    } else {
      if (wasInFavorites) {
        removeFromFavorites(productId);
      } else if (productData) {
        addToFavorites(productData);
      }
    }
  };

  const addFavorite = (product) => {
    addToFavorites(product);
  };

  const removeFavorite = (productId) => {
    removeFromFavorites(productId);
  };

  const clearFavorites = () => {
    favoriteItems.value = [];
    saveToLocalStorage();
  };

  const syncFavorites = (apiProducts) => {
    favoriteItems.value = Array.isArray(apiProducts) ? apiProducts : [];
    saveToLocalStorage();
    console.log('Соединение с API:', favoriteItems.value.length, 'items');
  };

  const loadFavoritesFromAPI = async () => {
    if (loading.value) return; 
    
    loading.value = true;
    try {
      const response = await api.getFavorites();
      const apiFavorites = response.data.results || response.data;
      console.log('Raw API:', apiFavorites);

      const products = apiFavorites.map(fav => fav.product || fav);
      favoriteItems.value = products;
      saveToLocalStorage();

    } catch (error) {
      console.error('Ошибка API:', error);
    } finally {
      loading.value = false;
    }
  };


  const favoriteCount = computed(() => favoriteItems.value.length);
  const hasFavorites = computed(() => favoriteItems.value.length > 0);


  initializeFromLocalStorage();

  return {
    favoriteItems,
    loading,
    favoriteCount,
    hasFavorites,
    
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites,
    syncFavorites,
    loadFavoritesFromAPI
  };
});