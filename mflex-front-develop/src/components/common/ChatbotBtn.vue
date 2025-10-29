<template>
  <div class="chat-button" @click="onOpenChatbot()">
    <svg
      class="chat-icon"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
      />
    </svg>
  </div>
</template>

<script setup>
  import { defineEmits } from 'vue';

  const emits = defineEmits(['open-chatbot-window']);

  const onOpenChatbot = () => {
    emits('open-chatbot-window');
  };
</script>

<style scoped>
  .chat-button {
    position: fixed;
    top: 100px;
    right: 50px;
    width: 40px;
    height: 40px;
    background-color: #46b968;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    transition: background-color 0.3s;
  }

  .chat-button:hover {
    background-color: #34a054;
  }

  .chat-icon {
    width: 20px;
    height: 20px;
    color: white;
  }

  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1001;
  }

  .popup-content {
    background-color: white;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }

  .popup-header {
    padding: 16px;
    background-color: #3b82f6;
    color: white;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .popup-header h3 {
    margin: 0;
    font-size: 16px;
  }

  .close-button {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    padding: 0 4px;
  }

  .close-button:hover {
    opacity: 0.8;
  }

  .popup-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
  }
</style>
