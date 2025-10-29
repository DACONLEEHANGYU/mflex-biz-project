import { io } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { useAlert } from '@/composables/alert';

const { setAlertStatus } = useAlert();
const authStore = useAuthStore();
const { userInfo } = storeToRefs(authStore);

class WebSocketClient {
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl;
    this.socket = null;
    this.options = {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      ...options,
    };
    this.events = {};
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        // 기존 토큰 가져오기
        const token = userInfo.value?.token || localStorage.getItem('x_auth');

        this.socket = io(this.baseUrl, {
          ...this.options,
          auth: { token },
          transports: ['websocket'],
        });

        this.socket.on('connect', () => {
          console.log('WebSocket connected successfully');
          resolve(this.socket);
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          this.handleConnectionError(error);
          reject(error);
        });

        this.setupDefaultEventHandlers();
      } catch (error) {
        console.error('WebSocket setup error:', error);
        reject(error);
      }
    });
  }

  setupDefaultEventHandlers() {
    // 기본 이벤트 핸들러 설정
    this.socket.on('unauthorized', (error) => {
      console.error('WebSocket unauthorized:', error);
      this.handleUnauthorizedError(error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // 서버에 의해 연결이 강제 종료된 경우
        this.connect();
      }
    });
  }

  handleConnectionError(error) {
    setAlertStatus({
      view: true,
      message: 'WebSocket 연결에 실패했습니다. 네트워크를 확인해주세요.',
    });
  }

  // 특정 이벤트에 대한 리스너 등록
  on(eventName, callback) {
    if (!this.socket) {
      throw new Error('WebSocket not connected');
    }
    this.socket.on(eventName, callback);
    return this;
  }

  // 이벤트 송신
  emit(eventName, data) {
    if (!this.socket) {
      throw new Error('WebSocket not connected');
    }
    return new Promise((resolve, reject) => {
      this.socket.emit(eventName, data, (response) => {
        if (response && response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      });
    });
  }

  // 연결 종료
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

// WebSocket 클라이언트 생성 유틸리티
const createWebSocketClient = (baseUrl, options = {}) => {
  const client = new WebSocketClient(baseUrl, options);
  return client;
};

// HTTP API와 유사한 인터페이스 제공
const $vxSocket = {
  // WebSocket 기반 요청 메서드
  request: (eventName, data, options = {}) => {
    // TODO: WebSocket 클라이언트 인스턴스 관리 로직 추가
    const socketClient = createWebSocketClient(
      import.meta.env.VITE_APP_WEBSOCKET_URL
    );

    return new Promise((resolve, reject) => {
      socketClient
        .connect()
        .then(() => {
          return socketClient.emit(eventName, data);
        })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  // HTTP API와 유사한 메서드들
  get: (eventName, params = null, options = {}) => {
    return $vxSocket.request(eventName, params, options);
  },

  post: (eventName, data, options = {}) => {
    return $vxSocket.request(eventName, data, options);
  },

  // 기타 메서드들도 유사하게 구현 가능
};

export { $vxSocket, WebSocketClient, createWebSocketClient };
