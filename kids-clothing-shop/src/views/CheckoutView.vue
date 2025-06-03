<template>
  <div class="checkout-page">
    <AppHeader />

    <div class="container">
      <h1 class="page-title">Оформление заказа</h1>

      <div v-if="cartItems.length === 0" class="empty-cart">
        <p>
          Ваша корзина пуста. 
          <router-link to="/cart" class="link-underlined">Перейти в корзину</router-link>
        </p>
      </div>

      <div v-else class="checkout-content">
        <!-- БЛОК ФОРМЫ ЗАКАЗА -->
        <div class="section-block">
          <h2 class="section-header">Ваши данные</h2>
          <form @submit.prevent="submitOrder" class="checkout-form">
            <div class="form-group">
              <label for="full_name" class="form-label">ФИО</label>
              <input
                id="full_name"
                v-model="form.full_name"
                type="text"
                placeholder="Иван Иванов"
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="mail@example.com"
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="phone" class="form-label">Телефон</label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                placeholder="+7 999 123-45-67"
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="address" class="form-label">Адрес доставки</label>
              <textarea
                id="address"
                v-model="form.address"
                placeholder="Улица, дом, квартира, индекс"
                rows="3"
                required
                class="form-input form-textarea"
              ></textarea>
            </div>

            <div v-if="error" class="error-message">
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
        </div>

        <!-- БЛОК ИТОГОВ ЗАКАЗА -->
        <div class="section-block">
          <h2 class="section-header">Ваш заказ</h2>
          <div class="order-summary">
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
                    Цвет: {{ item.product_info.color }}, 
                    Размер: {{ item.product_info.size }}
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
      </div>

      <!-- СОБЩЕНИЕ ОБ УСПЕШНОМ ЗАКАЗЕ -->
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
import AppHeader from '@/components/AppHeader.vue';

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
  if (
    !form.value.full_name ||
    !form.value.email ||
    !form.value.phone ||
    !form.value.address
  ) {
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
/* --- Общая обёртка и отступ под шапку --- */
.checkout-page {
  padding-top: 120px;        /* точно так же, как в account-page */
  min-height: 100vh;
  background-color: #f5f5f5; /* светло-серый фон */
}

/* --- Контейнер по центру --- */
.container {
  max-width: 1200px;  /* как в account-page */
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Заголовок страницы */
.page-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
}

/* Сообщение об пустой корзине */
.empty-cart {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}
.empty-cart p {
  color: #666;
  font-size: 1rem;
}
.empty-cart .link-underlined {
  color: #2980b9;
  text-decoration: underline;
  margin-left: 4px;
}

/* --- Общий класс для блоков (как в account-section) --- */
.section-block {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

/* Заголовки внутри блоков */
.section-header {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

/* --- Стили формы --- */
.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-input:focus {
  outline: none;
  border-color: #000;
}

.error-message {
  background-color: #fee;
  color: #c0392b;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

/* Кнопка «Подтвердить заказ» */
.submit-button {
  background-color: #000;
  color: #fff;
  border: none;
  padding: 1rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease;
  margin-top: 1rem;
  align-self: flex-start;
}
.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.submit-button:hover:not(:disabled) {
  opacity: 0.9;
}

/* --- Стили итогового блока (order-summary) --- */
.order-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Каждый товар в сводке */
.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
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
  margin-right: 1rem;
}

.summary-text {
  display: flex;
  flex-direction: column;
}

.product-title {
  font-weight: 500;
  margin: 0;
}

.product-variant {
  margin: 0;
  color: #555;
  font-size: 0.875rem;
}

.summary-details {
  text-align: right;
}

.unit-price,
.total-item-price {
  margin: 0;
  font-size: 0.9rem;
  color: #333;
}

.summary-total {
  margin-top: 1rem;
  text-align: right;
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
}

/* --- Сообщение об успешном заказе --- */
.success-message {
  text-align: center;
  margin-top: 2rem;
}
.success-message h2 {
  color: #27ae60;
  margin-bottom: 0.5rem;
}
.success-message p {
  margin-bottom: 1.5rem;
  color: #333;
}
.button-link {
  display: inline-block;
  margin: 0 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #2980b9;
  color: white;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s ease;
}
.button-link:hover {
  background: #1c5980;
}

/* --- Адаптивные правила (как в account-page) --- */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  .section-block {
    padding: 1rem;
  }
  .page-title {
    font-size: 1.5rem;
  }
  .summary-image {
    width: 50px;
    height: 50px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.25rem;
  }
}
</style>
