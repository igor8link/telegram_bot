<template>
  <div class="orders-page">
    <AppHeader />

    <div class="container">
      <h1 class="page-title">Мои заказы</h1>

      <div v-if="loading" class="orders-loading">
        <div class="spinner"></div>
        <p>Загрузка заказов...</p>
      </div>
      <div v-else-if="orders.length === 0" class="orders-empty">
        <p>У вас пока нет заказов.</p>
        <router-link to="/catalog" class="back-to-shop">Вернуться в каталог</router-link>
      </div>
      <div v-else class="orders-list">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-header-left">
              <h2 class="order-number">Заказ №{{ order.id }}</h2>
              <span class="order-date">{{ formatDate(order.created_at) }}</span>
            </div>
            <div class="order-status" :class="statusClass(order.status)">
              {{ statusLabel(order.status) }}
            </div>
          </div>

          <hr class="order-separator" />

          <div class="order-items">
            <div 
              v-for="item in order.items" 
              :key="item.id" 
              class="order-item"
            >
              <div class="item-info">
                <p class="item-title">{{ item.product.title }}</p>
                <p class="item-variant">
                  Цвет: {{ item.variant.color.name }},  
                  Размер: {{ item.size.name }}
                </p>
              </div>
            </div>
          </div>

          <hr class="order-separator" />
          <div class="order-footer">
            <span class="order-total-label">Всего:</span>
            <span class="order-total-price">{{ order.total_price }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';       
import AppHeader from '@/components/AppHeader.vue';

const orders = ref([]);
const loading = ref(false);
const router = useRouter();

const fetchOrders = async () => {
  loading.value = true;
  try {
    // Предполагаем, что api.getOrders() делает GET /api/orders/
    const response = await api.getOrders();
    // Ждём, что сервер вернёт { results: [...] } или просто [...], проверите у себя
    orders.value = response.data.results || response.data;
  } catch (err) {
    console.error('Ошибка при загрузке заказов:', err);
    // Если не авторизованы, редирект на логин
    if (err.response && err.response.status === 401) {
      router.push('/login');
    }
  } finally {
    loading.value = false;
  }
};

// Вспомогательная функция форматирования даты в «ДД.ММ.ГГГГ ЧЧ:ММ»
const formatDate = (isoString) => {
  const date = new Date(isoString);
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${d}.${m}.${y} ${hh}:${mm}`;
};

// Отображаемое имя статуса (пример перевода)
const statusLabel = (status) => {
  switch (status) {
    case 'pending':    return 'Создан';
    case 'processing': return 'В обработке';
    case 'shipped':    return 'Отправлен';
    case 'delivered':  return 'Доставлен';
    case 'cancelled':  return 'Отменён';
    default:           return status;
  }
};
// CSS-класс для статуса (чтобы можно было подчёркивать цветом)
const statusClass = (status) => {
  switch (status) {
    case 'pending':    return 'status-pending';
    case 'processing': return 'status-processing';
    case 'shipped':    return 'status-shipped';
    case 'delivered':  return 'status-delivered';
    case 'cancelled':  return 'status-cancelled';
    default:           return '';
  }
};

// Форматирование цены в рублях
const formatPrice = (value) => {
  if (typeof value !== 'number') return '';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(value);
};

onMounted(fetchOrders);
</script>

<style scoped>
.orders-page {
  padding-bottom: 40px;
  padding-top: 88px;
  background-color: var(--color-background);
  min-height: 100vh;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 16px;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  margin: 24px 0;
  color: var(--color-text);
  text-align: center;
}

/* Состояние загрузки */
.orders-loading {
  text-align: center;
  padding: 4rem 0;
  color: var(--color-text-light);
}
.orders-loading .spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Пустой список заказов */
.orders-empty {
  text-align: center;
  padding: 4rem 0;
  color: var(--color-text-light);
}
.orders-empty .back-to-shop {
  display: inline-block;
  margin-top: 16px;
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: var(--color-secondary);
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
}
.orders-empty .back-to-shop:hover {
  opacity: 0.9;
}

/* ---------- СТИЛИ КАРТОЧКИ ЗАКАЗА ---------- */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.order-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  padding: 16px;
}

/* Заголовок заказа: номер/дата слева + статус справа */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-header-left {
  display: flex;
  flex-direction: column;
}

.order-number {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--color-text);
}

.order-date {
  font-size: 0.875rem;
  color: var(--color-text-light);
  margin-top: 4px;
}

.order-status {
  font-size: 0.875rem;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 12px;
  text-transform: uppercase;
}
/* Разные цвета для статусов */
.status-pending    { background: #FFF8E1; color: #9C6B00; }
.status-processing { background: #E3F2FD; color: #0D47A1; }
.status-shipped    { background: #E8F5E9; color: #1B5E20; }
.status-delivered  { background: #F1F8E9; color: #33691E; }
.status-cancelled  { background: #FFEBEE; color: #B71C1C; }

/* Разделительная линия */
.order-separator {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 8px 0;
}

/* Блок с товарами внутри заказа */
.order-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Каждый элемент (товар) */
.order-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Изображение товара */
.item-image {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
  background-color: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
}
.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.item-image .no-image {
  font-size: 0.75rem;
  color: var(--color-text-light);
  text-align: center;
  line-height: 1.2;
}

/* Информация о товаре: название + вариант */
.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.item-title {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 4px;
  color: var(--color-text);
}
.item-variant {
  font-size: 0.875rem;
  color: var(--color-text-light);
  margin: 0;
}

/* Количество × цена */
.item-qty-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.item-qty {
  font-size: 0.875rem;
  color: var(--color-text-light);
  margin: 0;
}
.item-price {
  font-size: 0.875rem;
  margin: 0;
  color: var(--color-text);
}
.item-price strong {
  font-weight: 600;
}

/* Футер заказа: общий итог */
.order-footer {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}
.order-total-label {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text);
}
.order-total-price {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-primary);
}

/* ---------- АДАПТИВ ---------- */
@media (max-width: 768px) {
  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .item-qty-price {
    align-items: flex-start;
  }
  .order-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
