<template>
  <div class="checkout-page">
    <AppHeader />

    <div class="container">
      <h1>Оформление заказа</h1>


      <div v-if="cartItems.length === 0" class="empty-cart">
        <p>Ваша корзина пуста. <router-link to="/cart">Перейти в корзину</router-link></p>
      </div>


      <div v-else class="checkout-content">
        <form @submit.prevent="submitOrder" class="checkout-form">
          <div class="form-group">
            <label for="full_name">ФИО</label>
            <input
              id="full_name"
              v-model="form.full_name"
              type="text"
              placeholder="Иван Иванов"
              required
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="mail@example.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="phone">Телефон</label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              placeholder="+7 999 123-45-67"
              required
            />
          </div>

          <div class="form-group">
            <label for="address">Адрес доставки</label>
            <textarea
              id="address"
              v-model="form.address"
              placeholder="Улица, дом, квартира, индекс"
              rows="3"
              required
            ></textarea>
          </div>

          <div class="error-message" v-if="error">
            <p>{{ error }}</p>
          </div>

          <button
            type="submit"
            class="submit-button"
            :disabled="submitting"
          >
            {{ submitting ? 'Отправляем...' : 'Подтвердить заказ' }}
          </button>
        </form>

        <div class="order-summary">
          <h2>Ваш заказ</h2>
          <div
            v-for="item in cartItems"
            :key="item.id"
            class="summary-item"
          >
            <div class="summary-info">
              <img
                :src="item.product_info.image"
                alt="Изображение товара"
                class="summary-image"
              />
              <div class="summary-text">
                <p class="product-title">{{ item.product_info.title }}</p>
                <p class="product-variant">
                  Цвет: {{ item.product_info.color }}, Размер: {{ item.product_info.size }}
                </p>
              </div>
            </div>
            <div class="summary-details">
              <p class="unit-price">
                {{ formatPrice(item.product_info.price) }} × {{ item.quantity }}
              </p>
              <p class="total-item-price">
                = <strong>{{ formatPrice(item.product_info.total_price) }}</strong>
              </p>
            </div>
          </div>

          <div class="summary-total">
            <p>Итого: <strong>{{ formattedTotalPrice }}</strong></p>
          </div>
        </div>
      </div>

      <div v-if="orderSuccess" class="success-message">
        <h2>Спасибо за ваш заказ!</h2>
        <p>Ваш заказ №{{ createdOrderId }} успешно создан.</p>
        <router-link to="/" class="button-link">Вернуться на главную</router-link>
        <router-link to="/orders" class="button-link">Мои заказы</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cartStore';
import api from '@/services/api';


const form = ref({
  full_name: '',
  email: '',
  phone: '',
  address: ''
});

const error = ref('');
const submitting = ref(false);
const orderSuccess = ref(false);
const createdOrderId = ref(null);

const cartStore = useCartStore();
const router = useRouter();

onMounted(async () => {
  await cartStore.loadCart();
});

const cartItems = computed(() => cartStore.items);
const formattedTotalPrice = computed(() => formatPrice(cartStore.totalPrice));

function formatPrice(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(value);
}

async function submitOrder() {
  error.value = '';
  if (!form.value.full_name || !form.value.email || !form.value.phone || !form.value.address) {
    error.value = 'Пожалуйста, заполните все поля.';
    return;
  }

  submitting.value = true;
  try {

    const orderPayload = {
      full_name: form.value.full_name,
      email: form.value.email,
      phone: form.value.phone,
      address: form.value.address
    };

    const response = await api.createOrder(orderPayload);

    createdOrderId.value = response.data.id;
    orderSuccess.value = true;

    cartStore.clearCart();
  } catch (e) {

    if (e.response && e.response.data && e.response.data.error) {
      error.value = e.response.data.error;
    } else {
      error.value = 'Не удалось создать заказ. Попробуйте ещё раз.';
    }
    console.error('Ошибка при создании заказа:', e);
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.checkout-page {
  padding-bottom: 40px;
}
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
h1 {
  margin-bottom: 20px;
}

.checkout-form {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 40px;
}
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}
.form-group label {
  margin-bottom: 5px;
  font-weight: 500;
}
.form-group input,
.form-group textarea {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.error-message p {
  color: #c0392b;
  margin-bottom: 10px;
}
.submit-button {
  background: #27ae60;
  color: white;
  border: none;
  padding: 12px 20px;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
}
.submit-button:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.order-summary {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eceeef;
}
.summary-item:last-child {
  border-bottom: none;
}
.summary-info {
  display: flex;
  align-items: center;
}
.summary-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 15px;
}
.summary-text p {
  margin: 0;
}
.product-title {
  font-weight: 500;
}
.product-variant {
  color: #555;
  font-size: 14px;
}
.summary-details {
  text-align: right;
}
.unit-price,
.total-item-price {
  margin: 0;
}
.summary-total {
  margin-top: 15px;
  text-align: right;
  font-size: 18px;
}

.success-message {
  text-align: center;
  margin-top: 40px;
}
.success-message h2 {
  color: #27ae60;
}
.success-message p {
  margin-bottom: 15px;
}
.button-link {
  display: inline-block;
  margin: 0 10px;
  padding: 10px 20px;
  background: #2980b9;
  color: white;
  border-radius: 6px;
  text-decoration: none;
}
.button-link:hover {
  background: #1c5980;
}
</style>
