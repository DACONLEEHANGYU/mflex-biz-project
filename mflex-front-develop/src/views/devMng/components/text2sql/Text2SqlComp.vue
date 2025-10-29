<template>
  <div class="sql-generator-container">
    <div class="card">
      <div class="card-body">
        <div class="sql-comparison-grid">
          <div class="workflow-progress">
            <div class="sql-header">
              <div class="header-content">
                <h3>진행상태</h3>
                <div class="spinner-container">
                  <div v-if="isLoading" class="spinner"></div>
                </div>
              </div>
            </div>
            <div class="chat-container" ref="messageContainer">
              <div
                v-for="(message, index) in progressMessages"
                :key="index"
                class="message-wrapper"
              >
                <div class="message-time">{{ message.timestamp }}</div>
                <div class="message-container">
                  <div class="message" :class="message.type">
                    {{ message.text }}
                  </div>
                  <button
                    v-if="message.additional_message"
                    @click="showAdditionalMessage(message.additional_message)"
                    class="info-button"
                    title="추가 정보 보기"
                  >
                    <i class="icon-info"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="sql-column" :class="{ 'has-sql': metadataSQL }">
            <div class="sql-header">
              <div class="header-content">
                <h3>SQL 결과</h3>
                <div>
                  <button class="copy-btn" @click="onCopySql">
                    <i v-if="copyState" class="icon-success"></i>
                    <i v-else class="icon-copy"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="sql-content">
              <pre class="sql-preview">{{
                metadataSQL || '생성된 SQL이 없습니다.'
              }}</pre>
            </div>
          </div>
        </div>

        <div class="input-section">
          <textarea
            v-model="userInput"
            placeholder="질문을 입력해주세요. (예: '사용자 정보를 조회해주세요.')"
            class="input-textarea"
            @keypress.enter.prevent="handleEnterPress"
          ></textarea>
          <div class="btn-area">
            <button
              @click="initWebSocket"
              class="icon-btn generate-btn"
              :disabled="isLoading"
              :title="'SQL 생성'"
            >
              <i class="icon-arrow"></i>
            </button>
            <button
              @click="onReset"
              class="icon-btn reset-btn"
              :title="'초기화'"
            >
              <i class="icon-reset"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Message Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>추가 정보</h3>
          <button class="modal-close" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <pre class="json-viewer">{{ formattedAdditionalMessage }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onUnmounted, nextTick, computed } from 'vue';
  import { format } from 'sql-formatter';
  import {
    getInitWebSocket,
    generateSql,
  } from '@/utils/mflexApi/llm/text2sqlApi';

  // nodeData 배열 수정 (type을 status로 변경)
  const nodeData = ref([
    {
      nodeName: 'intro',
      status: 'intro',
      message: 'Text2SQL 생성 시작',
    },
    {
      nodeName: 'refine_query',
      status: 'info',
      message: '사용자 질의 정리를 시작했어요.',
    },
    {
      nodeName: 'refine_query',
      status: 'failure',
      message: '사용자 질의 정리를 다시 진행중이에요.',
    },
    {
      nodeName: 'refine_query',
      status: 'success',
      message: '사용자 질의가 깔끔하게 정리되었어요 !',
    },
    {
      nodeName: 'gather_description_metadata',
      status: 'info',
      message: '사용자 질의에서 설명 메타데이터를 추출 중 이에요.',
    },
    {
      nodeName: 'gather_description_metadata',
      status: 'failure',
      message: '사용자 질의에서 설명 메타데이터를 다시 추출하고 있어요.',
    },
    {
      nodeName: 'gather_description_metadata',
      status: 'success',
      message: '사용자 질의에서 설명 메타데이터를 잘 추출했어요 !',
    },
    {
      nodeName: 'gather_metadata',
      status: 'info',
      message: '메타데이터 수집을 시작해요.',
    },
    {
      nodeName: 'gather_metadata',
      status: 'failure',
      message: '메타데이터 수집을 다시 진행중이에요.',
    },
    {
      nodeName: 'gather_metadata',
      status: 'success',
      message: '메타데이터 수집이 완료되었어요 !',
    },
    {
      nodeName: 'generate_sql',
      status: 'info',
      message: 'SQL 생성을 시작해요.',
    },
    {
      nodeName: 'generate_sql',
      status: 'failure',
      message: 'SQL 생성을 다시 진행중이에요.',
    },
    {
      nodeName: 'generate_sql',
      status: 'success',
      message: 'SQL 생성이 마무리 되었습니다 !',
    },
    {
      nodeName: 'validate_sql',
      status: 'info',
      message: 'SQL 문법 검증을 시작해요.',
    },
    {
      nodeName: 'validate_sql',
      status: 'failure',
      message: 'SQL 문법을을 다시 검증하고 있어요.',
    },
    {
      nodeName: 'fix_sql',
      status: 'info',
      message: '생성된 SQL 수정을 시작해요',
    },
    {
      nodeName: 'fix_sql',
      status: 'success',
      message: 'SQL 수정이 완료되었어요 !',
    },
    {
      nodeName: 'validate_sql',
      status: 'success',
      message: 'SQL 문법과 컬럼 참조를 꼼꼼히 검증했어요 !',
    },
  ]);

  const userInput = ref('');
  const metadataSQL = ref('');
  const isLoading = ref(false);
  const isConnected = ref(false);
  const progressMessages = ref([]);
  const messageContainer = ref(null);
  const ws = ref(null);
  const showModal = ref(false);
  const currentAdditionalMessage = ref(null);

  const formattedAdditionalMessage = computed(() => {
    if (!currentAdditionalMessage.value) return '';
    try {
      // 문자열로 된 배열을 실제 배열로 파싱
      const parsedData = JSON.parse(currentAdditionalMessage.value);

      // 단순한 키워드 설명인 경우
      if (parsedData.length === 1 && parsedData[0].keyword_description) {
        return JSON.stringify(parsedData, null, 2);
      }

      // 테이블 메타데이터인 경우
      const formattedTables = parsedData.map((tableStr) => {
        // TableMetadata 문자열 파싱
        const match = tableStr.match(
          /TableMetadata\(name='([^']+)',\s*description='([^']+)',\s*columns=\[(.*?)\],\s*pkColumns=(?:{(.*?)}|set\(\))\)/
        );
        if (!match) return tableStr;

        const [_, tableName, description, columnsStr, pkColumnsStr] = match;

        // 컬럼 정보 파싱
        const columns = columnsStr
          .split('), ')
          .map((colStr) => {
            const colMatch = colStr.match(
              /ColumnMetadata\(name='([^']+)',\s*tableName='[^']+',\s*dataType='([^']+)',\s*description='([^']+)',\s*isPrimaryKey='([^']+)'/
            );
            if (!colMatch) return null;
            return {
              name: colMatch[1],
              dataType: colMatch[2],
              description: colMatch[3],
              isPrimaryKey: colMatch[4] === 'Y',
            };
          })
          .filter(Boolean);

        return {
          tableName,
          description,
          columns,
        };
      });

      return JSON.stringify(formattedTables, null, 2);
    } catch (e) {
      // 파싱에 실패한 경우 원본 데이터 반환
      return currentAdditionalMessage.value;
    }
  });

  const showAdditionalMessage = (message) => {
    currentAdditionalMessage.value = message;
    showModal.value = true;
  };
  const closeModal = () => {
    showModal.value = false;
    currentAdditionalMessage.value = null;
  };

  const closeWebSocket = () => {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.close();
      isConnected.value = false;
      isLoading.value = false;
    }
  };

  const initWebSocket = async () => {
    try {
      const initResponse = await getInitWebSocket();
      console.log('WebSocket 연결 channelId:', initResponse.data);

      const wsUrl = `wss://rnd.dacon.kr:443/api/v1/sql/ws/${initResponse.data.channel}`;
      ws.value = new WebSocket(wsUrl);
      isLoading.value = true;

      ws.value.onopen = () => {
        isConnected.value = true;
        addProgressMessage(
          '질문해주신 내용으로 SQL 생성을 시작 할게요! 😊',
          'intro'
        );

        const querys = {
          channelId: initResponse.data.channel,
          query: userInput.value,
          dbtype: 'PostgreSQL',
        };

        generateSql(querys);
      };

      ws.value.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket 메시지 수신:', data);
        handleWebSocketMessage(data);
      };

      ws.value.onclose = () => {
        isConnected.value = false;
        isLoading.value = false;
        // addProgressMessage('WebSocket 연결이 종료되었습니다.', 'error');
      };

      ws.value.onerror = (error) => {
        console.error('WebSocket 오류:', error);
        isLoading.value = false;
        addProgressMessage('WebSocket 연결 중 오류가 발생했습니다.', 'error');
      };
    } catch (error) {
      console.error('WebSocket 초기화 오류:', error);
      isLoading.value = false;
      addProgressMessage('WebSocket 초기화 중 오류가 발생했습니다.', 'error');
    }
  };

  // 실패 횟수를 추적하기 위한 변수 추가
  let failureCount = 0;
  const MAX_FAILURES = 3;

  const handleWebSocketMessage = (data) => {
    console.log('handleWebSocketMessage:', data);

    // data.additional_message = 'edit';

    const currentNodeMessages = nodeData.value.filter(
      (node) => node.nodeName === data.nodeName && node.status === data.status
    );

    if (currentNodeMessages.length > 0) {
      currentNodeMessages.forEach((node) => {
        addProgressMessage(node.message, data.status, data.additional_message);
      });
    } else {
      if (data.status === 'intro') {
        addProgressMessage(
          data.message || 'Text2SQL 생성을 시작합니다.',
          'intro',
          data.additional_message
        );
      } else if (data.status === 'success' && data.nodeName !== 'end') {
        addProgressMessage(
          data.message || '처리가 완료되었습니다.',
          'success',
          data.additional_message
        );
      } else if (data.status === 'failure') {
        if (data.nodeName === 'end') {
          addProgressMessage(
            '연속된 오류로 인해 처리를 중단합니다.',
            'failure',
            data.additional_message
          );
          closeWebSocket();
          return;
        }
        addProgressMessage(
          data.message || '오류가 발생했습니다.',
          'failure',
          data.additional_message
        );
      } else if (data.nodeName === 'end') {
        metadataSQL.value = formatSQL(data.message);
        addProgressMessage(
          'SQL 생성이 완료되었어요 ! 😊',
          'end',
          data.additional_message
        );
        closeWebSocket();
      }
    }
  };

  const addProgressMessage = (text, type, additional_message) => {
    const timestamp = new Date().toLocaleTimeString();
    progressMessages.value.push({ text, type, timestamp, additional_message });

    nextTick(() => {
      if (messageContainer.value) {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
      }
    });
  };

  const formatSQL = (rawSQL) => {
    try {
      // Remove ```sql from the start and end
      const cleanedSQL = rawSQL
        .replace(/^```sql\s*/, '')
        .replace(/\s*```$/, '');
      return format(cleanedSQL, {
        language: 'sql',
        keywordCase: 'upper',
        linesBetweenQueries: 2,
      });
    } catch (error) {
      console.error('SQL 포매팅 오류:', error);
      return rawSQL;
    }
  };

  const onReset = () => {
    userInput.value = '';
    metadataSQL.value = '';
    progressMessages.value = [];
    closeWebSocket();
  };

  const handleEnterPress = (event) => {
    if (event.shiftKey) return;

    if (userInput.value.trim() && !isLoading.value) {
      initWebSocket();
    }
  };

  onUnmounted(() => {
    closeWebSocket();
  });

  const copyState = ref(false);

  const onCopySql = () => {
    if (metadataSQL.value) {
      navigator.clipboard.writeText(metadataSQL.value);

      onCopySuccess();
    }
  };

  const onCopySuccess = () => {
    copyState.value = true;

    setTimeout(() => {
      copyState.value = false;
    }, 2000); // 2초 후 원래 상태로 복귀
  };
</script>

<style scoped>
  .icon-btn {
    position: absolute;
    bottom: 25px;
    width: 40px;
    height: 40px;
    padding: 8px;
    background-color: #379583;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-btn:hover {
    background-color: #2d7e6f;
  }

  .generate-btn {
    right: 80px;
    width: 50px;
    height: 50px;
  }

  .reset-btn {
    right: 20px;
    width: 50px;
    height: 50px;
  }

  .workflow-progress {
    border: 1px solid #d5d4d4;
    border-radius: 3px;
    position: relative;
  }

  .sql-generator-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
  }

  .card {
    width: 100%;
    /* max-width: 1200px; */
    min-width: 320px;
    /* margin: 0 20px; */
    /* border: 1px solid #525151;
    border-radius: 8px; */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .card-header {
    padding: 15px;
    border-bottom: 1px solid #e0e0e0;
    background-color: #2d7e6f;
  }

  .card-header h2 {
    margin: 0;
    font-size: 1.5em;
    color: white;
  }

  .card-body {
    padding: 10px 10px 0px 10px;
  }

  .input-section {
    margin-top: 20px;
    /* margin-bottom: 20px; */
  }

  .input-textarea {
    width: 100%;
    min-height: 100px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: vertical;
  }

  .btn-area {
    position: relative;
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
    gap: 10px;
  }

  .generate-btn {
    position: absolute;
    bottom: 25px;
    right: 100px;
    padding: 10px 15px;
    background-color: #379583;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .generate-btn:hover {
    background-color: #2d7e6f;
  }

  .generate-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  .reset-btn {
    position: absolute;
    bottom: 25px;
    right: 20px;
    padding: 10px 15px;
    background-color: #379583;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .reset-btn:hover {
    background-color: #2d7e6f;
  }

  .sql-comparison-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    height: 645px;
  }

  .sql-header {
    background-color: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
    padding: 0; /* 패딩 제거 */
    height: 50px; /* 고정 높이 설정 */
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    padding: 0 15px; /* 내부 여백 추가 */
  }
  .header-content h3 {
    margin: 0; /* 마진 제거 */
    font-size: 1.1rem;
  }

  .spinner-container {
    width: 24px; /* 스피너 컨테이너 고정 너비 */
    height: 24px; /* 스피너 컨테이너 고정 높이 */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #379583;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  .chat-container {
    height: 560px;
    overflow-y: auto;
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
  }

  .message-wrapper {
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
  }

  .message-time {
    font-size: 0.75rem;
    color: #6c757d;
    margin-bottom: 4px;
    padding-left: 4px;
  }

  .message {
    max-width: 85%;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 0.95rem;
    line-height: 1.4;
    word-wrap: break-word;
    white-space: pre-wrap;
    animation: fadeIn 0.3s ease-in-out;
  }

  .message.intro {
    background-color: #e3f2fd;
    color: #0d47a1;
    border-radius: 12px 12px 12px 0;
    align-self: flex-start;
  }

  .message.info {
    background-color: #d4edda;
    color: #155724;
    border-radius: 12px 12px 12px 0;
    align-self: flex-start;
  }

  .message.success {
    background-color: #d4edda;
    color: #155724;
    border-radius: 12px 12px 12px 0;
    align-self: flex-start;
  }

  .message.end {
    background-color: #e3f2fd;
    color: #856404;
    border-radius: 12px 12px 12px 0;
    align-self: flex-start;
  }

  .message.failure {
    background-color: #e6c5ce;
    color: #721c24;
    border-radius: 12px 12px 12px 0;
    align-self: flex-start;
  }

  .sql-column {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    transition: all 0.3s ease;
    background-color: #ffffff;
  }

  .sql-column.has-sql {
    border: 2px solid #4caf50;
    background-color: #e8f5e9;
    animation: highlightSql 0.5s ease-in-out;
  }

  @keyframes highlightSql {
    0% {
      border-color: #e0e0e0;
      background-color: #ffffff;
    }
    100% {
      border-color: #4caf50;
      background-color: #e8f5e9;
    }
  }

  .metadata-column {
    border: 2px solid #4caf50;
    background-color: #e8f5e9;
  }

  .sql-content {
    padding: 15px 15px 0px 15px;
  }

  .sql-preview {
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 10px;
    height: 540px;
    overflow-y: auto;
    /* margin-bottom: 15px; */
    line-height: normal;
    white-space: pre-wrap;
    font-family: monospace;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    .sql-comparison-grid {
      grid-template-columns: 1fr;
    }

    .card {
      margin: 0 10px;
    }
  }

  .copy-btn {
    color: white;
    border: none;
    border-radius: 10%;
    height: 30px;
    cursor: pointer;
    transition: background-color 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .copy-btn:hover {
    background-color: #d8d5d5;
  }

  .icon-arrow {
    width: 50px;
    height: 50px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='5' y1='12' x2='19' y2='12'%3E%3C/line%3E%3Cpolyline points='12 5 19 12 12 19'%3E%3C/polyline%3E%3C/svg%3E")
      no-repeat center center;
    background-size: contain;
  }

  .icon-reset {
    width: 20px;
    height: 20px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 2v6h6'%3E%3C/path%3E%3Cpath d='M3 13a9 9 0 1 0 3-7.7L3 8'%3E%3C/path%3E%3C/svg%3E")
      no-repeat center center;
    background-size: contain;
  }

  .icon-copy {
    width: 20px;
    height: 20px;
    background: url('/src/assets/images/copy-btn.svg') no-repeat center center;
    background-size: contain;
  }

  .icon-success {
    width: 20px;
    height: 20px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234CAF50' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E")
      no-repeat center center;
    background-size: contain;
  }

  .message-container {
    display: flex;
    align-items: flex-start;
    gap: 3px;
  }

  .info-button {
    background: none;
    border: none;
    padding: 4px;
    /* padding-top: 18px; */
    margin-top: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10%;
    transition: background-color 0.2s;
  }

  .info-button:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .icon-info {
    width: 24px;
    height: 22px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%23379583' class='size-6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25'%3E%3C/path%3E%3C/svg%3E")
      no-repeat center center;
    background-size: contain;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: white;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    padding: 16px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-header h3 {
    margin: 0;
    color: #333;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 0 8px;
    color: #666;
  }

  .modal-close:hover {
    color: #333;
  }

  .modal-body {
    padding: 16px;
    overflow-y: auto;
  }

  .json-viewer {
    background-color: #f5f5f5;
    padding: 16px;
    border-radius: 4px;
    font-family: monospace;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 0;
  }
</style>
