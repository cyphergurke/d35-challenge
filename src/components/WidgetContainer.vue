<template>
  <section class="widget-container">
    <slot />
  </section>
</template>

<style scoped>
.widget-container {
  width: min(480px, 100%);
  padding: 1.5rem;
  border: 1px solid #d9dfeb;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}
</style>
