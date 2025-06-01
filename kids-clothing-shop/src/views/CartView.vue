<script setup>
import { useCartStore } from '@/stores/cart';
import AppHeader from '@/components/AppHeader.vue';
import { computed } from 'vue';

const cartStore = useCartStore();

const cartItems = computed(() => cartStore.items);
const total = computed(() => cartStore.totalPrice);

const removeItem = (id) => cartStore.removeFromCart(id);
const clearCart = () => cartStore.clearCart();
const updateQuantity = (id, quantity) => {
  if (quantity > 0) {
    cartStore.updateQuantity(id, quantity);
  }
};
</script>

<template>
  <AppHeader />
  <div class="cart-page">
    <main class="main-content">
      <section class="section">
        <div class="container">
          <h1 class="section-title">Корзина</h1>

          <!-- Пустая корзина -->
          <div v-if="cartItems.length === 0" class="empty-cart">
            <p>Ваша корзина пуста.</p>
          </div>

          <!-- Содержимое корзины -->
          <div v-else class="cart-grid space-y-6">
            <div
              v-for="item in cartItems"
              :key="item.id"
              class="cart-item-card"
            >
              <div class="cart-item-content">
                <div class="cart-item-info">
                  <h2 class="item-title">{{ item.title }}</h2>
                  <p class="item-price">
                    Цена: {{ item.price }} × {{ item.quantity }} =
                    <strong>{{ item.price * item.quantity }}</strong>
                  </p>
                </div>

                <div class="cart-item-controls">
                  <input
                    type="number"
                    min="1"
                    :value="item.quantity"
                    @input="updateQuantity(item.id, parseInt($event.target.value))"
                    class="quantity-input"
                  />
                  <button @click="removeItem(item.id)" class="remove-btn">
                    Удалить
                  </button>
                </div>
              </div>
            </div>

            <div class="cart-total">
              <p class="total-label">Итого: <span class="total-price">{{ total }}</span></p>
              <button @click="clearCart" class="clear-cart-btn">
                Очистить корзину
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.main-content {
  padding-top: 120px;
}

.section {
  margin: 3rem 0;
  padding: 2rem 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #000;
  margin-bottom: 2rem;
  text-align: center;
}

.empty-cart {
  text-align: center;
  padding: 3rem;
  color: #666;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.cart-item-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.cart-item-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.cart-item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.cart-item-info {
  flex: 1;
}

.item-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.item-price {
  font-size: 0.95rem;
  color: #555;
}

.cart-item-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-input {
  width: 60px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 0.25rem 0.5rem;
}

.remove-btn {
  color: #e53935;
  font-size: 0.9rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.remove-btn:hover {
  text-decoration: underline;
  color: #c62828;
}

.cart-total {
  text-align: right;
  margin-top: 2rem;
}

.total-label {
  font-size: 1.3rem;
  font-weight: 600;
}

.total-price {
  color: #000;
  margin-left: 0.5rem;
}

.clear-cart-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #6C63FF;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.clear-cart-btn:hover {
  background-color: #584ee0;
}

/* Responsive */
@media (max-width: 640px) {
  .cart-item-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .cart-total {
    text-align: left;
  }
}
</style>
