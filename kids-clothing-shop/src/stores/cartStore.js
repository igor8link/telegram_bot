import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

export const useCartStore = defineStore('cart', () => {
  const items = ref([]);
  const loading = ref(false);

  const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0));
  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + (item.product_info?.total_price || 0), 0)
  );

  const loadCart = async () => {
    loading.value = true;
    try {
      const response = await api.getCurrentCart();
      items.value = response.data.items || [];
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
    } finally {
      loading.value = false;
    }
  };

  const addItem = async ({ productStockId, quantity = 1 }) => {
    try {
      const response = await api.addToCart({
        product_stock: productStockId,
        quantity
      });

      const existing = items.value.find(i => i.product_stock.id === productStockId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        items.value.push(response.data);
      }
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      throw error;
    }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      await api.updateCartItem(itemId, { quantity });
      const item = items.value.find(i => i.id === itemId);
      if (item) item.quantity = quantity;
    } catch (error) {
      console.error('Ошибка обновления товара в корзине:', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.removeCartItem(itemId);
      items.value = items.value.filter(i => i.id !== itemId);
    } catch (error) {
      console.error('Ошибка удаления товара из корзины:', error);
    }
  };

  const clearCart = () => {
    items.value = [];
  };

  // Автоматическая загрузка корзины при запуске
  const authStore = useAuthStore();
  if (authStore.token || !authStore.token) {
    loadCart();
  }

  return {
    items,
    totalItems,
    totalPrice,
    loading,
    loadCart,
    addItem,
    updateItem,
    removeItem,
    clearCart
  };
});
