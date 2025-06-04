<template>
  <div class="girls-page">
    <AppHeader />

    <main class="main-content">
      <section class="hero-carousel">
        <Carousel :slides="girlsCarouselSlides" />
      </section>
      <section class="section">
        <div class="container">
          <ProductsGrid 
            title="НОВИНКИ"
            :limit="8"
            view-all-link="/catalog"
            gender="girls"
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

const girlsCarouselSlides = ref([
  {
    id: 1,
    image: new URL('@/assets/images/banner_01.png', import.meta.url).href,
    alt: 'Новая коллекция для девочек',
    title: 'НОВАЯ КОЛЛЕКЦИЯ',
    subtitle: 'Красивая одежда для девочек',
  },
  {
    id: 2,
    image: new URL('@/assets/images/banner_for_girls1.png', import.meta.url).href,
    alt: 'Праздничные платья',
    title: 'ПРАЗДНИЧНАЯ КОЛЛЕКЦИЯ',
    subtitle: 'Нарядные платья и костюмы',
  },
  {
    id: 3,
    image: new URL('@/assets/images/banner_for_girls2.png', import.meta.url).href,
    alt: 'Школьная форма',
    title: 'ШКОЛЬНАЯ ФОРМА',
    subtitle: 'Стильная и удобная форма',
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
