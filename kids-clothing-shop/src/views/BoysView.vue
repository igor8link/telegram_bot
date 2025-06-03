<template>
      <AppHeader />
  <div class="boys-page">
    <main class="main-content">
      <section class="hero-carousel">
        <Carousel :slides="boysCarouselSlides" />
      </section>

      <section class="section">
        <div class="container">
          <ProductsGrid 
            title="НОВИНКИ"
            :limit="8"
            view-all-link="/products/new"
            gender="boys"
          />
        </div>
      </section>

      <section class="section categories-section">
        <div class="container">
          <h2 class="section-title">КАТЕГОРИИ ДЛЯ МАЛЬЧИКОВ</h2>

          <div v-if="loading" class="loading-container">
            <p>Загрузка категорий...</p>
          </div>

          <div v-else-if="boysCategories.length > 0" class="categories-grid">
            <router-link 
              v-for="category in boysCategories" 
              :key="category.id"
              :to="`/categories/boys/${category.slug}`" 
              class="category-card"
            >
              <div class="category-image">
                <img 
                  v-if="category.image" 
                  :src="category.image" 
                  :alt="category.name"
                  class="category-img"
                >
                <div v-else class="image-placeholder" :class="getPlaceholderClass(category.slug)">
                  <div class="placeholder-content">
                    <div class="placeholder-icon">{{ getCategoryIcon(category.slug) }}</div>
                    <p>{{ category.description || 'Коллекция для мальчиков' }}</p>
                  </div>
                </div>
              </div>
              <div class="category-info">
                <h3 class="category-name">{{ category.name }}</h3>
                <p class="category-count">{{ getCategoryCount(category) }}</p>
              </div>
            </router-link>
          </div>
          
          <div v-else class="no-categories">
            <p>Категории для мальчиков пока не добавлены</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AppHeader from '@/components/AppHeader.vue';
import Carousel from '@/components/Carousel.vue';
import ProductsGrid from '@/components/ProductsGrid.vue';
import api from '@/services/api';


const loading = ref(true);


const boysCarouselSlides = ref([
  {
    id: 1,
    image: new URL('@/assets/images/banner_01.png', import.meta.url).href,
    alt: 'Новая коллекция для мальчиков',
    title: 'НОВАЯ КОЛЛЕКЦИЯ',
    subtitle: 'Стильная одежда для мальчиков',
  },
  {
    id: 2,
    image: new URL('@/assets/images/banner_01.png', import.meta.url).href,
    alt: 'Спортивная одежда',
    title: 'СПОРТ И АКТИВНОСТЬ',
  },
  {
    id: 3,
    image: new URL('@/assets/images/banner_01.png', import.meta.url).href,
    alt: 'Школьная форма',
    title: 'К ШКОЛЕ ГОТОВ',
    subtitle: 'Школьная и деловая одежда',
  }
]);

const boysCategories = ref([]);

const categoryIcons = {
  'futbolki-i-majki': '👕',
  'rubashki': '👔',
  'bryuki-i-dzhinsy': '👖',
  'hudi-i-svitshoty': '🧥',
  'sportivnaya-odezhda': '⚽',
  'obuv': '👟',
  'aksessuary': '🎒',
  'nizhnee-bele': '🩲',
  'verhnyaya-odezhda': '🧥',
  'kostyumy': '🤵'
};

const placeholderClasses = {
  'futbolki-i-majki': 'tshirts-placeholder',
  'rubashki': 'shirts-placeholder',
  'bryuki-i-dzhinsy': 'pants-placeholder',
  'hudi-i-svitshoty': 'hoodies-placeholder',
  'sportivnaya-odezhda': 'sport-placeholder',
  'obuv': 'shoes-placeholder',
  'aksessuary': 'accessories-placeholder',
  'nizhnee-bele': 'underwear-placeholder',
  'verhnyaya-odezhda': 'outerwear-placeholder',
  'kostyumy': 'suits-placeholder'
};

const getCategoryIcon = (slug) => {
  return categoryIcons[slug] || '👕';
};

const getPlaceholderClass = (slug) => {
  return placeholderClasses[slug] || 'default-placeholder';
};

const getCategoryCount = (category) => {
  return 'Новая коллекция';
};

onMounted(async () => {
  try {
    loading.value = true;
    const response = await api.getBoysCategories();
    boysCategories.value = response.data;
    console.log('Boys categories loaded:', boysCategories.value);
  } catch (error) {
    console.error('Failed to load boys categories:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.main-content {
  padding-top: 120px;
}

.loading-container {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.no-categories {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.hero-carousel {
  margin-bottom: 2rem;
}

.section {
  margin: 3rem 0;
  padding: 2rem 0;
}

.container {
  max-width: 1280px;
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

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.category-card {
  text-decoration: none;
  color: inherit;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.category-image {
  width: 100%;
  height: 280px; 
  overflow: hidden;
  position: relative;
}

.category-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.category-card:hover .category-img {
  transform: scale(1.05);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: transform 0.3s ease;
}

.category-card:hover .image-placeholder {
  transform: scale(1.05);
}

.placeholder-content {
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  z-index: 2;
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.placeholder-content p {
  font-size: 0.9rem;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.default-placeholder {
  background: linear-gradient(135deg, #9E9E9E, #616161);
}

.tshirts-placeholder {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
}

.shirts-placeholder {
  background: linear-gradient(135deg, #2196F3, #1565C0);
}

.pants-placeholder {
  background: linear-gradient(135deg, #FF9800, #F57C00);
}

.hoodies-placeholder {
  background: linear-gradient(135deg, #9C27B0, #7B1FA2);
}

.sport-placeholder {
  background: linear-gradient(135deg, #F44336, #D32F2F);
}

.shoes-placeholder {
  background: linear-gradient(135deg, #795548, #5D4037);
}

.accessories-placeholder {
  background: linear-gradient(135deg, #607D8B, #455A64);
}

.underwear-placeholder {
  background: linear-gradient(135deg, #00BCD4, #0097A7);
}

.outerwear-placeholder {
  background: linear-gradient(135deg, #FFC107, #F57F17);
}

.suits-placeholder {
  background: linear-gradient(135deg, #424242, #212121);
}

.category-info {
  padding: 1rem; 
  text-align: center;
}

.category-name {
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #000;
  margin: 0 0 0.5rem 0;
  letter-spacing: 0.5px;
}

.category-count {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.featured-section {
  background: #f8f9fa;
  border-radius: 20px;
  margin: 4rem 0;
}

.featured-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 2rem;
  height: 400px;
}

.featured-item {
  border-radius: 12px;
  overflow: hidden;
}

.featured-link {
  display: block;
  width: 100%;
  height: 100%;
  text-decoration: none;
  color: inherit;
}

.featured-image {
  width: 100%;
  height: 100%;
  position: relative;
}

.featured-item.large .placeholder-content h3 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-transform: uppercase;
}

.featured-item.large .placeholder-content p {
  font-size: 1.1rem;
}

.featured-item:not(.large) .placeholder-content h4 {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  text-transform: uppercase;
}

.casual-placeholder {
  background: linear-gradient(135deg, #3F51B5, #303F9F);
}

.formal-placeholder {
  background: linear-gradient(135deg, #212121, #424242);
}

@media (max-width: 1024px) {
  .featured-grid {
    grid-template-columns: 1fr;
    height: auto;
  }
  
  .featured-item {
    height: 200px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding-top: 120px;
  }
  
  .categories-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .category-image {
    height: 220px; 
  }
  
  .placeholder-icon {
    font-size: 2.5rem;
  }
  
  .featured-item {
    height: 180px;
  }
}

@media (max-width: 480px) {
  .categories-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .container {
    padding: 0 0.5rem;
  }
  
  .section {
    margin: 2rem 0;
    padding: 1rem 0;
  }
}
</style>