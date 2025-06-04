<template>
  <div class="carousel-container">
    <div 
      class="carousel" 
      :style="{ transform: `translateX(-${activeIndex * 100}%)` }"
    >
      <div 
        v-for="slide in slides" 
        :key="slide.id" 
        class="carousel-slide"
      >
        <div 
          class="carousel-image" 
          :style="{ backgroundImage: `url(${slide.image})` }" 
          :aria-label="slide.alt" 
          role="img"
        ></div>
        <div class="carousel-content" v-if="slide.title || slide.subtitle || slide.buttonText">
          <h2 v-if="slide.title" class="carousel-title">{{ slide.title }}</h2>
          <p v-if="slide.subtitle" class="carousel-subtitle">{{ slide.subtitle }}</p>
        </div>
      </div>
    </div>
    
    <div class="carousel-click-zone left" @click="prevSlide" aria-label="Previous slide"></div>
    <div class="carousel-click-zone right" @click="nextSlide" aria-label="Next slide"></div>

    <div class="carousel-controls" v-if="slides.length > 1">
      <div class="carousel-dots">
        <button 
          v-for="(slide, index) in slides" 
          :key="slide.id"
          class="carousel-dot"
          :class="{ active: index === activeIndex }"
          @click="goToSlide(index)"
          :aria-label="`Go to slide ${index + 1}`"
        ></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  slides: {
    type: Array,
    required: true,
    default: () => []
  },
  autoplay: {
    type: Boolean,
    default: true
  },
  interval: {
    type: Number,
    default: 5000
  }
});

const activeIndex = ref(0);
let autoplayInterval = null;

const nextSlide = () => {
  activeIndex.value = (activeIndex.value + 1) % props.slides.length;
};

const prevSlide = () => {
  activeIndex.value = (activeIndex.value - 1 + props.slides.length) % props.slides.length;
};

const goToSlide = (index) => {
  activeIndex.value = index;
};

const startAutoplay = () => {
  if (props.autoplay && props.slides.length > 1) {
    autoplayInterval = setInterval(() => {
      nextSlide();
    }, props.interval);
  }
};

const stopAutoplay = () => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval);
  }
};

// Мобильная адаптация поворотов карусели
let touchStartX = 0;
let touchEndX = 0;

const handleTouchStart = (e) => {
  touchStartX = e.changedTouches[0].screenX;
};

const handleTouchEnd = (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
};

// функционал влево и вправо
const handleSwipe = () => {
  const swipeThreshold = 50;
  if (touchEndX < touchStartX - swipeThreshold) {
    nextSlide();
  } else if (touchEndX > touchStartX + swipeThreshold) {
    prevSlide();
  }
};

onMounted(() => {
  startAutoplay();
  
  // Add touch event listeners
  const carouselElement = document.querySelector('.carousel-container');
  if (carouselElement) {
    carouselElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    carouselElement.addEventListener('touchend', handleTouchEnd, { passive: true });
  }
});

onUnmounted(() => {
  stopAutoplay();
  
  const carouselElement = document.querySelector('.carousel-container');
  if (carouselElement) {
    carouselElement.removeEventListener('touchstart', handleTouchStart);
    carouselElement.removeEventListener('touchend', handleTouchEnd);
  }
});

watch(() => props.slides, () => {
  activeIndex.value = 0;
  stopAutoplay();
  startAutoplay();
}, { deep: true });
</script>

<style scoped>
.carousel-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.carousel {
  display: flex;
  transition: transform 0.5s ease;
}

.carousel-slide {
  flex: 0 0 100%;
  position: relative;
}

.carousel-image {
  width: 100%;
  height: 100vh; 
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.carousel-click-zone {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 20%;
  z-index: 2;
  cursor: pointer;
  background: rgba(0, 0, 0, 0); 
}

.carousel-click-zone.left {
  left: 0;
}

.carousel-click-zone.right {
  right: 0;
}

.carousel-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #fff;
  width: 80%;
}

.carousel-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-transform: uppercase;
}

.carousel-subtitle {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.carousel-button {
  display: inline-block;
  background-color: #000;
  color: #fff;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.carousel-button:hover {
  background-color: #333;
}

.carousel-controls {
  position: absolute;
  bottom: 20px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.carousel-dots {
  display: flex;
  gap: 8px;
}

.carousel-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.carousel-dot.active {
  background: #fff;
}

@media (min-width: 768px) {
  .carousel-title {
    font-size: 3rem;
  }
  
  .carousel-subtitle {
    font-size: 1.5rem;
  }

  .carousel-image {
    height: 600px;
  }
}

@media (max-width: 767px) {
  .carousel-image {
    height: 70vh;
  }
}
</style>