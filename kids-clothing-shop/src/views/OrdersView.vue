<!-- src/views/OrdersView.vue -->
<template>
  <div class="orders-page">
    <!-- Шапка сайта -->
    <AppHeader />

    <div class="container">
      <h1 class="page-title">Мои заказы</h1>

      <!-- Если идёт загрузка: спиннер -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Загрузка заказов...</p>
      </div>

      <!-- Если произошла ошибка при загрузке -->
      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
        <button @click="fetchOrders" class="retry-button">
          Попробовать снова
        </button>
      </div>

      <!-- Если заказов нет -->
      <div v-else-if="orders.length === 0" class="empty-orders">
        <p>У вас ещё нет заказов.</p>
        <router-link to="/" class="continue-shopping-button">
          Вернуться в магазин
        </router-link>
      </div>

      <!-- Список заказов -->
      <div v-else class="orders-list">
        <div
          v-for="order in orders"
          :key="order.id"
          class="order-card"
        >
          <!-- Заголовок карточки заказа: номер и дата -->
          <div class="order-header">
            <h2>Заказ №{{ order.id }}</h2>
            <span class="order-date">
              {{ formatDate(order.created_at) }}
            </span>
            <span class="order-status">
              {{ statusLabel(order.status) }}
            </span>
          </div>

          <!-- Список товаров внутри заказа -->
          <div class="order-items">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="order-item"
            >
              <img
                :src="getImageUrl(item)"
                alt="Изображение товара"
                class="item-image"
              />
              <div class="item-info">
                <p class="item-title">{{ item.product.title }}</p>
                <p class="item-variant">
                  Цвет: {{ item.variant.color.name }}, 
                  Размер: {{ item.size.name }}
                </p>
              </div>
              <div class="item-prices">
                <p class="item-unit-price">
                  {{ formatPrice(item.price) }} × {{ item.quantity }}
                </p>
                <p class="item-total-price">
                  = <strong>{{ formatPrice(item.price * item.quantity) }}</strong>
                </p>
              </div>
            </div>
          </div>

          <!-- Итоговая сумма заказа -->
          <div class="order-summary">
            <p>Всего: <strong>{{ formatPrice(order.total_price) }}</strong></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import api from '@/services/api';
import AppHeader from '@/components/AppHeader.vue';

// Состояния компонента
const loading = ref(false);
const error = ref('');
const orders = ref([]);

// Если требуется проверить авторизацию, можно использовать authStore:
// const authStore = useAuthStore();
// onMounted(() => {
//   if (!authStore.isAuthenticated) {
//     router.push('/'); // или какая у вас логика редиректа
//     return;
//   }
//   fetchOrders();
// });

async function fetchOrders() {
  loading.value = true;
  error.value = '';
  try {
    const response = await api.getOrders();
    // Если пришёл объект с пагинацией (есть поле `results`), берём его,
    // иначе — считаем, что `response.data` уже просто массив.
    if (Array.isArray(response.data)) {
      orders.value = response.data;
    } else if (response.data.results) {
      orders.value = response.data.results;
    } else {
      orders.value = [];
    }
  } catch (e) {
    console.error('Ошибка загрузки заказов:', e);
    error.value = 'Не удалось загрузить заказы. Попробуйте позже.';
  } finally {
    loading.value = false;
  }
}

// При монтировании компонента загружаем заказы
onMounted(() => {
  fetchOrders();
});

// Помогает форматировать дату (ISO → DD.MM.YYYY HH:mm)
function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

// Преобразуем статус из сериализатора в читаемую метку
function statusLabel(code) {
  switch (code) {
    case 'pending': return 'Создано';
    case 'processing': return 'В процессе';
    case 'shipped': return 'Отправлено';
    case 'delivered': return 'Доставлено';
    case 'cancelled': return 'Отменено';
    default: return code;
  }
}

// Если у товара нет картинки в заказе, можно взять любую заглушку.
function getImageUrl(item) {
  // Предполагаем, что item.product у нас – объект продукта.
  // Если у вас есть в API ссылка на картинку (например, в product.image),
  // замените на корректное поле. Здесь разберём случай, что 
  // продукт хранит хотя бы одно изображение:
  if (item.product.image) {
    return item.product.image;
  }
  // Иначе – пустая строка или статичная заглушка:
  return '';
}

// Вспомогательная функция форматирования цены в ₽
function formatPrice(value) {
  if (typeof value !== 'number') return '';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(value);
}
</script>

<style scoped>
/* --- Общие отступы и фон под шапку --- */
.orders-page {
  padding-top: 120px;        /* так же, как в других страницах */
  min-height: 100vh;
  background-color: #f5f5f5; /* светло-серый фон, как в account-page */
}

/* --- Контейнер по центру (аналогично AccountView.vue / CheckoutView.vue) --- */
.container {
  max-width: 1200px;
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

/* Спиннер при загрузке */
.loading-container {
  text-align: center;
  padding: 3rem;
  color: #666;
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

/* Блок ошибки */
.error-container {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  color: #c0392b;
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

/* Пустой список заказов */
.empty-orders {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}
.empty-orders p {
  color: #666;
  font-size: 1rem;
}
.continue-shopping-button {
  display: inline-block;
  margin-top: 1rem;
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

/* --- Список карточек заказов --- */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Каждая карточка заказа */
.order-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Шапка заказа: номер, дата и статус */
.order-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.order-header h2 {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}
.order-date {
  font-size: 0.9rem;
  color: #666;
}
.order-status {
  margin-left: auto;
  font-size: 0.9rem;
  font-weight: 500;
  color: #2980b9;
}

/* Блок с товарами внутри заказа */
.order-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid #eceeef;
  padding-bottom: 0.75rem;
}
.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}
.item-info {
  flex: 1;
}
.item-title {
  font-weight: 500;
  margin: 0 0 0.25rem 0;
  color: #333;
}
.item-variant {
  margin: 0;
  font-size: 0.875rem;
  color: #555;
}

/* Цены для каждой позиции */
.item-prices {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.item-unit-price,
.item-total-price {
  margin: 0;
  font-size: 0.9rem;
  color: #333;
}

/* Итоговая сумма заказа */
.order-summary {
  text-align: right;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

/* --- Адаптив для мобильных --- */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  .order-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .order-status {
    margin-left: 0;
    margin-top: 0.5rem;
  }
  .order-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .item-prices {
    width: 100%;
    text-align: right;
  }
}
</style>
