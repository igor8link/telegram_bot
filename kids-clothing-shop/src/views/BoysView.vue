<template>
  <div class="boys-page">
    <AppHeader />
    <main class="main-content">
      <section class="hero-carousel">
        <Carousel :slides="boysCarouselSlides" />
      </section>
      <section class="section">
        <div class="container">
          <ProductsGrid 
            title="НОВИНКИ"
            :limit="8"
            view-all-link="/catalog"
            gender="boys"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AppHeader from '@/components/AppHeader.vue';
import Carousel from '@/components/Carousel.vue';
import ProductsGrid from '@/components/ProductsGrid.vue';

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
</script>

<style scoped>
.main-content {
  padding-top: 120px;
  background-color: #f5f5f5;
  min-height: 100vh;
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
</style>
