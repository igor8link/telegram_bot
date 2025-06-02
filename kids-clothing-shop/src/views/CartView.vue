<template>
  <div class="cart-page">
    <AppHeader />

    <div class="container">
      <div class="cart-header">
        <h1>Корзина</h1>
        <p v-if="totalQuantity > 0" class="cart-count">
          {{ totalQuantity }} {{ getProductWord(totalQuantity) }} на сумму {{ formattedTotalPrice }}
        </p>
      </div>

      <!-- Loader / Ошибка -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Загрузка корзины...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
        <button @click="fetchCart" class="retry-button">
          Попробовать снова
        </button>
      </div>

      <!-- Пустая корзина -->
      <div v-else-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4"/>
            <circle cx="7" cy="21" r="2"/>
            <circle cx="17" cy="21" r="2"/>
          </svg>
        </div>
        <h2>Корзина пуста</h2>
        <p>Добавляйте товары в корзину, чтобы оформить заказ</p>
        <router-link to="/" class="continue-shopping-button">
          Продолжить покупки
        </router-link>
      </div>

      <!-- Список товаров в корзине -->
      <div v-else class="cart-list">
        <div 
          v-for="item in cartItems" 
          :key="item.id" 
          class="cart-item"
        >
          <!-- Компонент с изображением/названием/ссылкой на товар -->
          <div class="item-info">
            <ProductCard 
              :product="getProductFromCart(item)" 
              :showAddToCartButton="false"
            />
          </div>

          <div class="item-details">
            <!-- Например, отображаем цвет/размер: -->
            <p class="item-variant">
              Цвет: {{ item.product_stock.variant.color.name }}, 
              Размер: {{ item.product_stock.size.name }}
            </p>
            <!-- Цена за единицу и общая цена -->
            <p class="item-price">
              {{ formatPrice(item.product_stock.variant.product.sale_price || item.product_stock.variant.product.price) }} × {{ item.quantity }} = 
              <strong>{{ formatPrice(getItemTotal(item)) }}</strong>
            </p>

            <!-- Управление количеством -->
            <div class="quantity-control">
              <button 
                @click="changeQuantity(item, item.quantity - 1)" 
                :disabled="item.quantity <= 1 || updatingId === item.id"
              >–</button>
              <input 
                type="number" 
                v-model.number="item.quantity" 
                @change="onQuantityInput(item)" 
                min="1" 
                :disabled="updatingId === item.id"
              />
              <button 
                @click="changeQuantity(item, item.quantity + 1)" 
                :disabled="updatingId === item.id"
              >+</button>
            </div>

            <!-- Кнопка удаления -->
            <button 
              @click="removeItem(item.id)" 
              class="remove-button" 
              :disabled="updatingId === item.id"
            >
              {{ updatingId === item.id ? 'Удаляется...' : 'Удалить' }}
            </button>
          </div>
        </div>

        <!-- Подвал корзины: итоговая сумма и кнопка перейти к оформлению -->
        <div class="cart-summary">
          <p>Итого: <strong>{{ formattedTotalPrice }}</strong></p>
          <router-link to="/checkout" class="checkout-button">
            Оформить заказ
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import AppHeader from '@/components/AppHeader.vue';
import ProductCard from '@/components/ProductCart.vue';

const cartStore = useCartStore();
const authStore = useAuthStore();

const loading = computed(() => cartStore.loading);
const cartItems = computed(() => cartStore.items);
const totalPrice = computed(() => cartStore.totalPrice);
const totalQuantity = computed(() =>
  cartStore.items.reduce((sum, item) => sum + item.quantity, 0)
);

const formattedTotalPrice = computed(() => formatPrice(totalPrice.value));

// При загрузке страницы
onMounted(() => {
  cartStore.loadCart();
});

const formatPrice = (value) => {
  if (typeof value !== 'number') return '';
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(value);
};

const getProductWord = (count) => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'товаров';
  if (lastDigit === 1) return 'товар';
  if (lastDigit >= 2 && lastDigit <= 4) return 'товара';
  return 'товаров';
};

const getProductFromCart = (item) => {
  return item.product_stock.variant.product;
};

const changeQuantity = (item, newQty) => {
  if (newQty < 1) return;
  item.quantity = newQty;
  cartStore.updateItem(item.id, newQty);
};

const onQuantityInput = (item) => {
  if (item.quantity < 1) item.quantity = 1;
  cartStore.updateItem(item.id, item.quantity);
};

const removeItem = (itemId) => {
  cartStore.removeItem(itemId);
};

</script>

<style scoped>
.cart-page {
  padding-top: 120px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.cart-header {
  margin-bottom: 2rem;
}

.cart-header h1 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.cart-count {
  color: #666;
  font-size: 1rem;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  color: #ff4b4b;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.retry-button:hover {
  opacity: 0.9;
}

.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  margin-bottom: 2rem;
  color: #e0e0e0;
}

.empty-cart h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.empty-cart p {
  color: #666;
  margin-bottom: 2rem;
}

.continue-shopping-button {
  display: inline-block;
  padding: 0.75rem 2rem;
  background-color: #000;
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.continue-shopping-button:hover {
  opacity: 0.9;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cart-item {
  display: flex;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.item-info {
  flex: 1;
  /* Здесь рендерится <ProductCard> без кнопки "Добавить в корзину" */
}

.item-details {
  width: 300px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-left: 1rem;
}

.item-variant {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 0.5rem;
}

.item-price {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.quantity-control button {
  width: 32px;
  height: 32px;
  border: 1px solid #ccc;
  background: none;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  padding: 0;
}

.quantity-control input {
  width: 50px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.remove-button {
  background-color: #f5f5f5;
  border: none;
  color: #666;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
}

.remove-button:hover {
  background-color: #ff4b4b;
  color: white;
}

.remove-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.cart-summary {
  margin-top: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.checkout-button {
  padding: 0.75rem 1.5rem;
  background-color: #000;
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.checkout-button:hover {
  opacity: 0.9;
}

/* Адаптив */
@media (max-width: 768px) {
  .container { padding: 1rem; }
  .cart-item { flex-direction: column; }
  .item-details { width: 100%; padding-left: 0; margin-top: 1rem; }
}
</style>
