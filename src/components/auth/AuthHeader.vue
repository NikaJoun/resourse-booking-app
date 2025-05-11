<template>
  <div class="auth-header">
    <h1>Добро пожаловать</h1>
    <p>Пожалуйста, войдите в свой аккаунт</p>
  </div>
</template>

<script>
export default {
  // Логика не требуется, только представление
};
</script>

<style lang="scss" scoped>
.auth-header {
  text-align: center;
  margin-bottom: 32px;
  
  h1 {
    font-size: 24px;
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
    letter-spacing: 0.5px;
  }
  
  p {
    font-size: 14px;
    color: #777;
    margin: 0;
  }
}

@media (max-width: 480px) {
  .auth-header h1 {
    font-size: 20px;
  }
}
</style>