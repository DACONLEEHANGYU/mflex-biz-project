import { ref } from 'vue';
import { io } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth'; // 인증 스토어 import
import { storeToRefs } from 'pinia'; // Pinia 상태 참조를 위한 유틸리티

export function useWebSocket(url) {
  const authStore = useAuthStore();
  const { userInfo } = storeToRefs(authStore);

  const socket = ref(null);
  const isConnected = ref(false);
  const messages = ref([]);
  const error = ref(null);

  function connect() {
    try {
      // 토큰 가져오기 (여러 방식으로 토큰 획득 가능)
      const token =
        userInfo.value?.token ||
        localStorage.getItem('x_auth') ||
        sessionStorage.getItem('token');

      socket.value = io(url, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.value.on('connect', () => {
        isConnected.value = true;
        console.log('WebSocket connected successfully');
      });

      socket.value.on('disconnect', () => {
        isConnected.value = false;
        console.log('WebSocket disconnected');
      });

      socket.value.on('message', (data) => {
        messages.value.push(data);
        console.log('Received message:', data);
      });

      socket.value.on('connect_error', (err) => {
        error.value = err;
        console.error('Connection error:', err);
      });

      // 인증 실패 시 핸들링
      socket.value.on('unauthorized', (err) => {
        console.error('WebSocket authorization failed:', err);
        disconnect(); // 연결 종료
      });
    } catch (err) {
      error.value = err;
      console.error('WebSocket connection failed', err);
    }
  }

  function sendMessage(message) {
    if (socket.value && isConnected.value) {
      // 토큰을 메시지와 함께 전송 가능
      const token = userInfo.value?.token || localStorage.getItem('x_auth');

      socket.value.emit('send_message', {
        ...message,
        token: token, // 필요시 토큰을 메시지에 포함
      });
    } else {
      console.warn('WebSocket not connected');
    }
  }

  function disconnect() {
    if (socket.value) {
      socket.value.disconnect();
    }
  }

  return {
    socket,
    isConnected,
    messages,
    error,
    connect,
    sendMessage,
    disconnect,
  };
}
