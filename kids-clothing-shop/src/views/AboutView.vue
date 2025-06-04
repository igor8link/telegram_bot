<template>
  <div class="about-page">
    <AppHeader />

    <div class="container">
      <h1 class="page-title">О нас</h1>

      <section class="section-block">
        <h2 class="section-title">Наша миссия</h2>
        <p>
          Мы верим, что дети должны расти в яркой, удобной и безопасной одежде, 
          которая помогает им проявлять себя, учиться новому и весело проводить время.
          Поэтому мы тщательно отбираем ткани, проверяем каждую модель на прочность и комфорт,
          а также регулярно обновляем коллекции в соответствии с мировыми тенденциями детской моды.
        </p>
      </section>

      <section class="section-block">
        <h2 class="section-title">Почему выбирают нас</h2>
        <ul class="features-list">
          <li>
            <strong>Качество и безопасность:</strong> сертифицированные ткани, экологичные
            красители и строгий контроль качества на каждом этапе производства.
          </li>
          <li>
            <strong>Удобство онлайн-шопинга:</strong> простой каталог, удобная навигация.
          </li>
          <li>
            <strong>Быстрая доставка:</strong> курьерские службы по всей России с возможностью
            трекинга заказа и выбора удобного времени доставки.
          </li>
          <li>
            <strong>Личный подход:</strong> наша команда поддержки всегда готова помочь
            выбрать правильный размер, ответить на вопросы по уходу за вещами и оформить возврат,
            если что-то пошло не так.
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue';
</script>

<style scoped>
.about-page {
  padding-top: 88px; 
  background-color: #f9f9f9;
  min-height: 100vh;
  margin-top: 88px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 16px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #222;
}

.section-block {
  margin-bottom: 2rem;
}
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111;
}
.section-block p {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: #444;
}

.features-list {
  padding-left: 1.2rem;
  list-style-type: disc;
}
.features-list li {
  margin-bottom: 0.6rem;
  color: #444;
}

.contact-list {
  padding-left: 1.2rem;
  list-style-type: none;
}
.contact-list li {
  margin-bottom: 0.5rem;
  color: #444;
}
.contact-list a {
  color: #c7213b;
  text-decoration: none;
}
.contact-list a:hover {
  color: #8a0e23;
}
</style>
