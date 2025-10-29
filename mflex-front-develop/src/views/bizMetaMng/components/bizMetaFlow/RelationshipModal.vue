<!-- src/views/bizMetaMng/components/bizMetaFlow/RelationshipModal.vue -->
<template>
  <div
    v-if="isVisible"
    class="relationship-modal-overlay"
    @click="handleOverlayClick"
  >
    <div class="relationship-modal" @click.stop>
      <div class="modal-header">
        <h3>관계 정보 입력</h3>
        <button class="close-button" @click="closeModal">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
            />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="relationship-info">
          <div class="node-info">
            <span class="node-label">출발 노드:</span>
            <span class="node-name">{{ sourceNode?.termName }}</span>
          </div>
          <div class="arrow">→</div>
          <div class="node-info">
            <span class="node-label">도착 노드:</span>
            <span class="node-name">{{ targetNode?.termName }}</span>
          </div>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="relationshipName">관계명</label>
            <input
              id="relationshipName"
              v-model="formData.relationshipName"
              type="text"
              placeholder="관계명을 입력하세요"
              required
            />
          </div>

          <div class="form-group">
            <label for="relationshipType">관계 유형</label>
            <select
              id="relationshipType"
              v-model="formData.relationshipType"
              required
            >
              <option value="">선택하세요</option>
              <option value="SIMILAR">유사관계</option>
              <option value="ASSOCIATION">동등관계</option>
              <option value="COMPOSITION">소속 관계</option>
              <option value="ADDITION">더하기</option>
              <option value="SUBTRACTION">빼기</option>
              <option value="MULTIPLICATION">곱하기</option>
              <option value="DIVISION">나누기</option>
            </select>
          </div>

          <div class="form-group">
            <label for="description">설명</label>
            <textarea
              id="description"
              v-model="formData.description"
              placeholder="관계에 대한 설명을 입력하세요"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.isBidirectional" />
              양방향 관계
            </label>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button type="button" class="cancel-button" @click="closeModal">
          취소
        </button>
        <button type="button" class="submit-button" @click="handleSubmit">
          등록
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue';

  const props = defineProps({
    isVisible: {
      type: Boolean,
      default: false,
    },
    sourceNode: {
      type: Object,
      default: null,
    },
    targetNode: {
      type: Object,
      default: null,
    },
  });

  const emit = defineEmits(['close', 'submit']);

  const formData = ref({
    relationshipName: '',
    relationshipType: '',
    description: '',
    isBidirectional: false,
  });

  const resetForm = () => {
    formData.value = {
      relationshipName: '',
      relationshipType: '',
      description: '',
      isBidirectional: false,
    };
  };

  const handleSubmit = () => {
    if (
      !formData.value.relationshipName.trim() ||
      !formData.value.relationshipType
    ) {
      alert('관계명과 관계 유형은 필수 입력 항목입니다.');
      return;
    }

    emit('submit', {
      ...formData.value,
      sourceNode: props.sourceNode,
      targetNode: props.targetNode,
    });

    resetForm();
  };

  const closeModal = () => {
    resetForm();
    emit('close');
  };

  const handleOverlayClick = () => {
    closeModal();
  };

  watch(
    () => props.isVisible,
    (newVal) => {
      if (!newVal) {
        resetForm();
      }
    }
  );
</script>

<style scoped>
  .relationship-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .relationship-modal {
    background: white;
    border-radius: 12px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    width: 500px;
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid #e2e8f0;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
  }

  .close-button {
    width: 32px;
    height: 32px;
    border: none;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 6px;
    color: #64748b;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #1e293b;
  }

  .close-button svg {
    width: 16px;
    height: 16px;
  }

  .modal-body {
    padding: 24px;
  }

  .relationship-info {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
  }

  .node-info {
    flex: 1;
    text-align: center;
  }

  .node-label {
    display: block;
    font-size: 12px;
    color: #64748b;
    margin-bottom: 4px;
  }

  .node-name {
    font-weight: 600;
    color: #1e293b;
  }

  .arrow {
    font-size: 20px;
    color: #3b82f6;
    font-weight: bold;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #374151;
    font-size: 14px;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s ease;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .checkbox-group {
    display: flex;
    align-items: center;
  }

  .checkbox-label {
    display: flex !important;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    margin-bottom: 0 !important;
  }

  .checkbox-label input[type='checkbox'] {
    width: auto !important;
    margin: 0;
  }

  .modal-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 20px 24px;
    border-top: 1px solid #e2e8f0;
  }

  .cancel-button,
  .submit-button {
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-button {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #64748b;
  }

  .cancel-button:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  .submit-button {
    background: #3b82f6;
    border: 1px solid #3b82f6;
    color: white;
  }

  .submit-button:hover {
    background: #2563eb;
    border-color: #2563eb;
  }
</style>
