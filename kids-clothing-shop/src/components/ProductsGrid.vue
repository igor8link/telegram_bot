<template>
  <div class="products-grid-section">
    <div class="section-header">
      <h2 class="section-title">{{ title }}</h2>
      <router-link v-if="viewAllLink" :to="viewAllLink" class="view-all">
        смотреть все <span class="arrow">→</span>
      </router-link>
    </div>
    
    <div v-if="loading" class="loading-container">
      <p>Загрузка товаров...</p>
    </div>
    
    <div v-else-if="products.length > 0" class="product-slider-wrapper">
      <!-- Кнопки-стрелки для ПК -->
       <div class="container">
      <button class="slider-button left" @click="scrollLeft" aria-label="Scroll left">
        ←
      </button>
      <button class="slider-button right" @click="scrollRight" aria-label="Scroll right">
        →
      </button>
      
      <!-- Сам слайдер -->
      <div 
        ref="slider" 
        class="product-slider" 
        @touchstart="onTouchStart" 
        @touchend="onTouchEnd"
      >
        <ProductCard 
          v-for="product in products" 
          :key="product.id" 
          :product="product" 
          class="slider-item"
        />
      </div>
    </div>
    </div>
    <div v-else class="no-products">
      <p>Товары не найдены</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ProductCard from '@/components/ProductCart.vue';
import api from '@/services/api';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  limit: {
    type: Number,
    default: 8
  },
  viewAllLink: {
    type: String,
    default: null
  },
  gender: {
    type: String,
    default: null,
    validator: (value) => ['boys', 'girls', null].includes(value)
  }
});

const loading = ref(true);
const products = ref([]);
const slider = ref(null);

// Для свайпа
let touchStartX = 0;
let touchEndX = 0;

const onTouchStart = (e) => {
  touchStartX = e.changedTouches[0].screenX;
};

const onTouchEnd = (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
};

const handleSwipe = () => {
  const threshold = 50;
  if (!slider.value) return;
  if (touchEndX < touchStartX - threshold) {
    // свайп влево -> листаем вправо
    scrollRight();
  } else if (touchEndX > touchStartX + threshold) {
    // свайп вправо -> листаем влево
    scrollLeft();
  }
};

// Прокрутка на ширину одного элемента
const scrollLeft = () => {
  if (!slider.value) return;
  const container = slider.value;
  const cardWidth = container.querySelector('.slider-item')?.offsetWidth || 0;
  container.scrollBy({ left: -cardWidth - 16, behavior: 'smooth' });
};

const scrollRight = () => {
  if (!slider.value) return;
  const container = slider.value;
  const cardWidth = container.querySelector('.slider-item')?.offsetWidth || 0;
  container.scrollBy({ left: cardWidth + 16, behavior: 'smooth' });
};

onMounted(async () => {
  try {
    loading.value = true;
    let response;
    if (props.gender === 'boys') {
      response = await api.getBoysProducts({ limit: props.limit });
    } else if (props.gender === 'girls') {
      response = await api.getGirlsProducts({ limit: props.limit });
    } else {
      response = await api.getProducts({ limit: props.limit });
    }
    products.value = response.data.results || response.data;
  } catch (error) {
    console.error('Failed to load products:', error);
    products.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.products-grid-section {
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0 1rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  text-transform: uppercase;
  margin: 0;
}

.view-all {
  color: #000;
  font-size: 0.9rem;
  text-decoration: none;
  display: flex;
  align-items: center;
  transition: opacity 0.2s;
}

.view-all:hover {
  opacity: 0.7;
}

.arrow {
  margin-left: 4px;
}

.loading-container {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.no-products {
  text-align: center;
  padding: 2rem;
  color: #666;
}

/* Обёртка для слайдера */
.product-slider-wrapper {
  position: relative;
  margin-bottom: 2rem;
}

.container {
  max-width: 1140px;   /* или тот же max-width, что у вас в main.css */
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

/* Сама область прокрутки */
.product-slider {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 10px; 
}

/* Скрыть скроллбар в Webkit-браузерах */
.product-slider::-webkit-scrollbar {
  display: none;
}

/* Каждый товар внутри слайдера */
.slider-item {
  flex: 0 0 auto;
  scroll-snap-align: start;
  width: 200px; /* фиксированная ширина карточки */
}

/* Кнопки-стрелки */
.slider-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.8);
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 2;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.slider-button:hover {
  background: rgba(255, 255, 255, 1);
}

/* Левая стрелка */
.slider-button.left {
  left: 1rem; /* ровно “отступ .container” от левого края */
}

/* Правая стрелка */
.slider-button.right {
  right: 1rem; /* ровно “отступ .container” от правого края */
}

/* Скрываем стрелки на мобильных */
@media (max-width: 768px) {
  .slider-button {
    display: none;
  }
}

@media (max-width: 480px) {
  .slider-item {
    width: 160px;
  }
}
</style>
