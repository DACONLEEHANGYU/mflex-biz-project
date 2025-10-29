<template>
  <!-- filepath: c:\Users\dacon008\workspace\mflex-project\mflex-front\src\views\bizMetaMng\components\bizMetaFlow\RelationSelectionPopup.vue -->
  <div
    v-if="modelValue"
    class="relation-popup-overlay"
    @click="handleOverlayClick"
  >
    <div class="relation-popup" @click.stop>
      <div class="popup-header">
        <h3>활성 관계 선택</h3>
        <button class="close-button" @click="closePopup" type="button">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
            />
          </svg>
        </button>
      </div>

      <div class="popup-body">
        <div class="relation-info">
          <div class="info-item">
            <span class="label">소스 노드:</span>
            <span class="value">{{ sourceNodeName }}</span>
          </div>
          <div class="arrow-icon">→</div>
          <div class="info-item">
            <span class="label">타겟 노드:</span>
            <span class="value">{{ targetNodeName }}</span>
          </div>
        </div>

        <div class="relations-list">
          <div
            v-for="(rel, index) in availableRelations"
            :key="rel.termRelId"
            class="relation-item"
            :class="{ active: rel.termRelId === currentRelationId }"
            @click.stop="selectRelation(rel)"
          >
            <div class="item-left">
              <span class="relation-number">{{ index + 1 }}</span>
              <div class="item-content">
                <div class="item-title">
                  <span class="relation-type">{{
                    getRelationTypeLabel(rel.relType)
                  }}</span>
                  <span
                    v-if="rel.isReversed"
                    class="relation-direction reversed"
                    >(← 역방향)</span
                  >
                </div>
                <div v-if="rel.rel_expln" class="item-description">
                  {{ rel.rel_expln }}
                </div>
              </div>
            </div>
            <svg
              v-if="rel.termRelId === currentRelationId"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="check-icon"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { updateCompositeRelations } from '@/utils/mflexApi/bizMeta/bizMetaApi.js';

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    sourceNodeName: {
      type: String,
      default: '',
    },
    targetNodeName: {
      type: String,
      default: '',
    },
    availableRelations: {
      type: Array,
      default: () => [],
    },
    currentRelationId: {
      type: [String, Number],
      default: null,
    },
    selectRelToolTip: {
      type: Object,
      default: null,
    },
  });

  const emit = defineEmits(['update:modelValue', 'select-composite-relation']);

  // 🔥 관계 유형 라벨
  const getRelationTypeLabel = (type) => {
    const labels = {
      COMPOSITION: '소속',
      SIMILAR: '유사',
      ASSOCIATION: '동등',
      ADDITION: '더하기',
      SUBTRACTION: '빼기',
      MULTIPLICATION: '곱하기',
      DIVISION: '나누기',
    };
    return labels[type] || type;
  };

  // 🔥 팝업 닫기
  const closePopup = () => {
    emit('update:modelValue', false);
  };

  // 🔥 오버레이 클릭
  const handleOverlayClick = () => {
    closePopup();
  };

  // 🔥 관계 선택
  const selectRelation = async (relation) => {
    console.log('🔄 RelationSelectionPopup 관계 선택:', relation);
    console.log('🔄 selectRelToolTip:', props.selectRelToolTip);

    const data = {
      compositeId: props.selectRelToolTip.compositeRelations[0].compositeId,
      compositeTermOrder:
        props.selectRelToolTip.compositeRelations[0].compositeTermOrder,
      compositeRelId: relation.termRelId,
    };

    const response = await updateCompositeRelations(data);
    console.log(
      '🔄 RelationSelectionPopup - 복합구성간 관계 변경 응답:',
      response
    );
    const responseForm = [response];
    emit('select-composite-relation', responseForm);
    closePopup();
  };
</script>

<style scoped>
  /* 🔥 팝업 오버레이 */
  .relation-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(4px);
  }

  /* 🔥 팝업 */
  .relation-popup {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    width: 500px;
    max-width: 90vw;
    max-height: 80vh;
    overflow: hidden;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
  }

  .popup-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
  }

  .close-button {
    width: 32px;
    height: 32px;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }

  .close-button svg {
    width: 16px;
    height: 16px;
  }

  .popup-body {
    padding: 24px;
    max-height: 60vh;
    overflow-y: auto;
  }

  .popup-body::-webkit-scrollbar {
    width: 6px;
  }

  .popup-body::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  .popup-body::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  .popup-body::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  .relation-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    margin-bottom: 20px;
  }

  .info-item {
    flex: 1;
    text-align: center;
  }

  .info-item .label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 4px;
  }

  .info-item .value {
    display: block;
    font-size: 14px;
    font-weight: 700;
    color: #1e293b;
  }

  .arrow-icon {
    font-size: 24px;
    font-weight: 700;
    color: #8b5cf6;
    flex-shrink: 0;
  }

  .relations-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .relation-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .relation-item:hover {
    border-color: #8b5cf6;
    background: #faf5ff;
    transform: translateX(4px);
  }

  .relation-item.active {
    border-color: #8b5cf6;
    background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
  }

  .item-left {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex: 1;
  }

  .relation-number {
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .item-content {
    flex: 1;
  }

  .item-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .relation-type {
    font-size: 14px;
    font-weight: 700;
    color: #1e293b;
  }

  .relation-direction {
    font-size: 11px;
    font-weight: 600;
    color: #8b5cf6;
    background: rgba(139, 92, 246, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .relation-direction.reversed {
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
  }

  .item-description {
    font-size: 12px;
    color: #64748b;
    line-height: 1.5;
  }

  .check-icon {
    width: 24px;
    height: 24px;
    color: #8b5cf6;
    flex-shrink: 0;
  }
</style>
