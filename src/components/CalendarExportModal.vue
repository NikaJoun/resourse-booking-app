<template>
    <div v-if="show" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Экспорт бронирований в календарь</h3>
          <button @click="close" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="export-section">
            <button @click="downloadICS" class="btn btn-primary">
              <i class="bi bi-download"></i> Скачать файл .ics
            </button>
            <p class="help-text">Файл содержит все ваши текущие бронирования</p>
          </div>
          
          <div class="instructions">
            <h4>Как импортировать в календарь:</h4>
            
            <div class="os-tabs">
              <button 
                @click="activeOS = 'windows'" 
                :class="{ active: activeOS === 'windows' }"
                class="os-tab"
              >
                Windows
              </button>
              <button 
                @click="activeOS = 'mac'" 
                :class="{ active: activeOS === 'mac' }"
                class="os-tab"
              >
                macOS
              </button>
            </div>
            
            <div v-if="activeOS === 'windows'" class="os-instructions">
              <h5>Для Outlook и других календарей Windows:</h5>
              <ol>
                <li>Откройте Outlook</li>
                <li>Перейдите в "Файл" → "Открыть и экспортировать" → "Импорт/экспорт"</li>
                <li>Выберите "Импорт файла iCalendar (.ics)"</li>
                <li>Найдите скачанный файл my-bookings.ics</li>
                <li>Нажмите "Открыть" для импорта</li>
              </ol>
              <p class="note">Для других календарных приложений процесс аналогичен.</p>
            </div>
            
            <div v-if="activeOS === 'mac'" class="os-instructions">
              <h5>Для Календаря macOS:</h5>
              <ol>
                <li>Откройте приложение "Календарь"</li>
                <li>Перейдите в "Файл" → "Импорт"</li>
                <li>Выберите скачанный файл my-bookings.ics</li>
                <li>Укажите, в какой календарь импортировать события</li>
                <li>Нажмите "Импортировать"</li>
              </ol>
              <h5>Для Microsoft Outlook на Mac:</h5>
              <ol>
                <li>Откройте Outlook</li>
                <li>Перейдите в "Файл" → "Импорт"</li>
                <li>Выберите "iCalendar файл (.ics)"</li>
                <li>Найдите и откройте скачанный файл</li>
              </ol>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="close" class="btn btn-secondary">Закрыть</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  
  export default {
    props: {
      show: Boolean
    },
    emits: ['close'],
    setup(props, { emit }) {
      const activeOS = ref('windows');
      
      const generateICS = () => {
        // Эта функция из родительского компонента (не забыть!!!)
        return '';
      };
      
      const downloadICS = () => {
        emit('download');
      };
      
      const close = () => {
        emit('close');
      };
      
      return {
        activeOS,
        downloadICS,
        close
      };
    }
  };
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: white;
    border-radius: 8px;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  
  .modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-header h3 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .export-section {
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .help-text {
    color: #666;
    margin-top: 0.5rem;
  }
  
  .instructions {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
  }
  
  .instructions h4 {
    margin-top: 0;
    margin-bottom: 1rem;
  }
  
  .os-tabs {
    display: flex;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #ddd;
  }
  
  .os-tab {
    padding: 0.5rem 1rem;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-weight: 500;
    color: #555;
  }
  
  .os-tab.active {
    border-bottom-color: #007bff;
    color: #007bff;
  }
  
  .os-instructions {
    background: white;
    padding: 1rem;
    border-radius: 6px;
  }
  
  .os-instructions h5 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    color: #333;
  }
  
  .os-instructions ol {
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .os-instructions li {
    margin-bottom: 0.5rem;
  }
  
  .note {
    font-style: italic;
    color: #666;
    font-size: 0.9rem;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
  }
  
  .btn-primary {
    background-color: #007bff;
    color: white;
    border: none;
  }
  
  .btn-secondary {
    background-color: #6c757d;
    color: white;
    border: none;
  }
  
  .btn-primary:hover {
    background-color: #0069d9;
  }
  
  .btn-secondary:hover {
    background-color: #5a6268;
  }
  </style>