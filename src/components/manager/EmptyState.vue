<template>
  <div class="empty-state">
    <i :class="`bi bi-${icon}`"></i>
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    icon: {
      type: String,
      default: 'info-circle'
    },
    message: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
}

.empty-state i {
  font-size: 3rem;
  color: #adb5bd;
  margin-bottom: 1rem;
}

.empty-state p {
  font-size: 1.1rem;
  margin: 0;
}
</style>