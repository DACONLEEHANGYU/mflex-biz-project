<template>
  <!-- filepath: c:\Users\dacon008\workspace\mflex-project\mflex-front\src\views\bizMetaMng\components\bizMetaFlow\TermNode.vue -->
  <div
    class="term-node"
    :class="{
      'connecting-mode': isConnectingMode,
      selected: isSelected,
      'parent-group': data.isTopLevelParent,
      'nested-parent': data.isNestedParent,
      'composite-parent':
        data.termType === 'COMPOSITE' && data.compositeChildrenCount > 0,
      'composite-child': data.isCompositeChild,
    }"
    :data-parent="data.parentNode || null"
    :data-order="data.order || null"
    @click="handleNodeClick"
  >
    <!-- 🔥 복합구성용어 뱃지 추가 -->
    <div
      v-if="
        data.termType === 'COMPOSITE' &&
        data.compositeChildrenCount > 0 &&
        !data.isTopLevelParent
      "
      class="composite-badge"
    >
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path
          d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"
        />
      </svg>
      복합 {{ data.compositeChildrenCount }}
    </div>

    <!-- 🔥 최상위 부모 노드: 용어명만 표시 -->
    <div v-if="data.isTopLevelParent" class="parent-header-only">
      <h2 class="parent-term-name">{{ data.termName }}</h2>
      <div class="parent-children-badge">
        {{ data.childrenCount }}개 하위 항목
        <span v-if="data.hiddenChildrenCount > 0" class="hidden-count">
          (+{{ data.hiddenChildrenCount }}개 숨김)
        </span>
      </div>
      <!-- 🔥 복합구성용어 표시 추가 -->
      <div v-if="data.termType === 'COMPOSITE'" class="parent-composite-info">
        <svg viewBox="0 0 20 20" fill="currentColor" class="composite-icon">
          <path
            d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"
          />
        </svg>
        복합구성용어
      </div>
    </div>

    <!-- 🔥 중첩 부모 또는 일반 노드: 일반 스타일 + 자식 정보 -->
    <div
      v-else
      class="node-content"
      :class="{ 'child-content': !!data.parentNode }"
    >
      <!-- 자식 노드 순번 표시 -->
      <div v-if="data.order" class="child-order">{{ data.order }}</div>

      <!-- 용어명 -->
      <h3 class="term-name">{{ data.termName }}</h3>

      <!-- 🔥 중첩 부모인 경우 뱃지 표시 (숨겨진 자식 정보 포함) -->
      <div
        v-if="data.isNestedParent && data.hasHiddenChildren"
        class="nested-parent-badge"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" class="badge-icon">
          <path
            d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"
          />
        </svg>
        {{ data.totalChildrenCount || data.childrenCount }}개 하위 (숨김)
      </div>

      <!-- 용어 유형 (중첩 부모가 아닐 때만) -->
      <div v-else-if="!data.isNestedParent" class="term-type">
        <span class="type-label" :class="getTermTypeClass(data.termType)">
          {{ getTermTypeText(data.termType) }}
        </span>
      </div>

      <!-- 관계 연결 상태 표시 -->
      <div v-if="relationshipCount > 0" class="relationship-info">
        {{ relationshipCount }}개 관계
      </div>
    </div>

    <!-- 삭제 버튼 -->
    <button class="delete-button" @click.stop="handleDelete" title="노드 삭제">
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path
          d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
        />
      </svg>
    </button>

    <!-- 🔥 관계 연결 버튼 (복합구성용어의 내부 자식은 숨김) -->
    <button
      v-if="!isCompositeChild"
      class="connect-button"
      @click.stop="handleConnectClick"
      :class="{ active: isConnectingMode }"
      title="관계 연결"
    >
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M9.493 2.853a.75.75 0 00-1.486-.205L7.545 6H4.198a.75.75 0 000 1.5h3.14l-.69 5H3.302a.75.75 0 000 1.5h3.14l-.435 3.148a.75.75 0 001.486.205L7.955 14h2.986l-.434 3.148a.75.75 0 001.486.205L12.455 14h3.346a.75.75 0 000-1.5h-3.14l.69-5h3.346a.75.75 0 000-1.5h-3.14l.435-3.147a.75.75 0 00-1.486-.205L12.045 6H9.059l.434-3.147zM8.852 7.5l-.69 5h2.986l.69-5H8.852z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <!-- 🔥 Handle 설정 (source/target 완전 분리) -->
    <template v-if="!isCompositeChild">
      <!-- ✅ Source Handle만 (출발점) -->
      <Handle
        type="source"
        position="top"
        :id="`${id}-top-source`"
        class="handle-top handle-source"
      />
      <Handle
        type="source"
        position="bottom"
        :id="`${id}-bottom-source`"
        class="handle-bottom handle-source"
      />
      <Handle
        type="source"
        position="left"
        :id="`${id}-left-source`"
        class="handle-left handle-source"
      />
      <Handle
        type="source"
        position="right"
        :id="`${id}-right-source`"
        class="handle-right handle-source"
      />

      <!-- ✅ Target Handle만 (도착점, 투명 처리) -->
      <Handle
        type="target"
        position="top"
        :id="`${id}-top-target`"
        class="handle-top handle-target"
        style="opacity: 0; pointer-events: auto"
      />
      <Handle
        type="target"
        position="bottom"
        :id="`${id}-bottom-target`"
        class="handle-bottom handle-target"
        style="opacity: 0; pointer-events: auto"
      />
      <Handle
        type="target"
        position="left"
        :id="`${id}-left-target`"
        class="handle-left handle-target"
        style="opacity: 0; pointer-events: auto"
      />
      <Handle
        type="target"
        position="right"
        :id="`${id}-right-target`"
        class="handle-right handle-target"
        style="opacity: 0; pointer-events: auto"
      />
    </template>

    <!-- 복합구성용어 자식: 상하만 -->
    <template v-else>
      <Handle
        type="source"
        position="top"
        :id="`${id}-top-source`"
        class="handle-top handle-source handle-composite-child"
      />
      <Handle
        type="source"
        position="bottom"
        :id="`${id}-bottom-source`"
        class="handle-bottom handle-source handle-composite-child"
      />

      <Handle
        type="target"
        position="top"
        :id="`${id}-top-target`"
        class="handle-top handle-target handle-composite-child"
        style="opacity: 0; pointer-events: auto"
      />
      <Handle
        type="target"
        position="bottom"
        :id="`${id}-bottom-target`"
        class="handle-bottom handle-target handle-composite-child"
        style="opacity: 0; pointer-events: auto"
      />
    </template>

    <!-- 연결 모드 표시 -->
    <div v-if="isConnectingMode" class="connecting-indicator">
      <span>연결 대상 선택</span>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, inject, watch } from 'vue';
  import { Handle } from '@vue-flow/core';

  // Props
  const props = defineProps({
    id: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  });

  // Emits
  const emit = defineEmits(['delete', 'connect-start', 'connect-end']);

  // 상태 관리
  const isConnectingMode = ref(false);
  const isSelected = ref(false);

  // 관계 연결 상태 (부모 컴포넌트에서 inject)
  const connectingState = inject('connectingState', {
    isConnecting: false,
    sourceNodeId: null,
    sourceNodeData: null,
  });

  const getNodeRelationships = inject('getNodeRelationships', () => []);

  // Computed
  const relationshipCount = computed(() => {
    const relationships = getNodeRelationships(props.id) || [];
    return relationships.length;
  });

  // 이벤트 핸들러
  const handleDelete = () => {
    // if (confirm(`'${props.data.termName}' 노드를 삭제하시겠습니까?`)) {
    //   emit('delete', props.id);
    // }
    emit('delete', props.id);
  };

  // 🔥 Handle 위치 계산 (수정)
  const handlePositions = computed(() => {
    const nodeWidth = props.data.isCompositeChild ? 360 : 280;
    const nodeHeight = props.data.isCompositeChild ? 120 : 120;

    return {
      top: {
        left: '50%',
        top: '0px',
        transform: 'translate(-50%, -50%)',
      },
      bottom: {
        left: '50%',
        bottom: '0px',
        transform: 'translate(-50%, 50%)',
      },
      left: {
        left: '0px',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      },
      right: {
        right: '0px',
        top: '50%',
        transform: 'translate(50%, -50%)',
      },
    };
  });

  // 🔥 복합구성용어의 내부 자식 노드인지 확인
  const isCompositeChild = computed(() => {
    return props.data.isCompositeChild === true;
  });

  const handleConnectClick = () => {
    console.log('handleConnectClick 호출됨');
    if (
      connectingState.isConnecting &&
      connectingState.sourceNodeId === props.id
    ) {
      emit('connect-end', { cancelled: true });
      isConnectingMode.value = false;
    } else if (
      connectingState.isConnecting &&
      connectingState.sourceNodeId !== props.id
    ) {
      emit('connect-end', {
        sourceNodeId: connectingState.sourceNodeId,
        sourceNodeData: connectingState.sourceNodeData,
        targetNodeId: props.id,
        targetNodeData: props.data,
        cancelled: false,
      });
      isConnectingMode.value = false;
    } else {
      emit('connect-start', {
        sourceNodeId: props.id,
        sourceNodeData: props.data,
      });
      isConnectingMode.value = true;
    }
  };

  const handleNodeClick = () => {
    if (
      connectingState.isConnecting &&
      connectingState.sourceNodeId !== props.id
    ) {
      handleConnectClick();
    }
  };

  watch(
    () => connectingState.isConnecting,
    (newVal) => {
      if (!newVal) {
        isConnectingMode.value = false;
      } else if (connectingState.sourceNodeId === props.id) {
        isConnectingMode.value = true;
      }
    }
  );

  const getTermTypeText = (termType) => {
    const typeMap = {
      GENERAL: '일반용어',
      COMPOSITE: '복합구성', // 🔥 수정
    };
    return typeMap[termType] || '일반용어';
  };

  const getTermTypeClass = (termType) => {
    const classMap = {
      GENERAL: 'general',
      COMPOSITE: 'composite', // 🔥 수정
    };
    return classMap[termType] || 'general';
  };
</script>

<style lang="scss" scoped>
  .term-node {
    min-width: 200px;
    max-width: 400px;
    min-height: 95px;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 20px;

    &:hover {
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
      border-color: #cbd5e1;
    }

    // 🔥 최상위 부모 노드 스타일
    &.parent-group {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border: 3px solid #3b82f6;
      border-radius: 16px;
      padding: 0;
      min-width: 400px;
      min-height: 100px;
      align-items: center;
      justify-content: center;

      &:hover {
        border-color: #2563eb;
        box-shadow: 0 12px 32px rgba(59, 130, 246, 0.25);
        transform: translateY(-3px);
      }
    }

    // 🔥 중첩 부모 노드 스타일
    &.nested-parent {
      background: #fefce8;
      border: 2px solid #facc15;
      width: 360px !important;
      min-width: 360px !important;
      max-width: 360px !important;
      height: 120px !important;
      min-height: 120px !important;
      pointer-events: auto;
      cursor: not-allowed;

      &:hover {
        border-color: #eab308;
        box-shadow: 0 4px 12px rgba(250, 204, 21, 0.3);
      }

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 10px,
          rgba(250, 204, 21, 0.05) 10px,
          rgba(250, 204, 21, 0.05) 20px
        );
        pointer-events: none;
        border-radius: 10px;
      }
    }

    // 🔥 복합구성용어 부모 노드 스타일
    &.composite-parent {
      border-color: #8b5cf6;
      background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);

      &:hover {
        border-color: #7c3aed;
        box-shadow: 0 8px 25px rgba(139, 92, 246, 0.2);
      }

      &.parent-group {
        background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
        border: 3px solid #8b5cf6;
        // margin-left: 18px;

        &:hover {
          border-color: #7c3aed;
          box-shadow: 0 12px 32px rgba(139, 92, 246, 0.25);
        }
      }
    }

    // 🔥 자식 노드 스타일
    &[data-parent] {
      background: white;
      border: 2px solid #cbd5e1;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border-radius: 10px;
      // width: 360px !important;
      min-width: 200x !important;
      max-width: 360px !important;
      height: 120px !important;
      min-height: 120px !important;
      pointer-events: auto;

      &:hover {
        border-color: #94a3b8;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      }

      &.nested-parent {
        background: #fefce8;
        border: 2px solid #facc15;
        width: 360px !important;
        min-width: 360px !important;
        max-width: 360px !important;
        height: 120px !important;
        min-height: 120px !important;
        cursor: not-allowed;

        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(250, 204, 21, 0.05) 10px,
            rgba(250, 204, 21, 0.05) 20px
          );
          pointer-events: none;
          border-radius: 10px;
        }
      }
    }

    // 🔥 복합구성용어의 자식 노드
    &[data-parent].composite-child {
      // border-left: 4px solid #a78bfa;
      // width: 360px !important;
      min-width: 150px !important;
      max-width: 360px !important;
      padding: 0 !important;
      // right: 18px;
      // margin-top: 50px;
      margin .child-order {
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        box-shadow: 0 3px 8px rgba(139, 92, 246, 0.4);
      }
    }

    &.connecting-mode {
      border-color: #3b82f6;
      background: #f0f9ff;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }

    &.selected {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
    }

    &.composite-child {
      // 🔥 상단/하단 Handle 스타일
      .handle-composite-child {
        width: 12px;
        height: 12px;
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(139, 92, 246, 0.4);
        transition: all 0.2s ease;

        &:hover {
          transform: scale(1.4);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.6);
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
        }
      }

      // 🔥 상단 Handle 위치 조정
      :deep(.handle-top) {
        top: -6px;
        left: 50%;
        transform: translateX(-50%);
      }

      // 🔥 하단 Handle 위치 조정
      :deep(.handle-bottom) {
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
      }

      // 연결 모드일 때 Handle 강조
      &.connecting-mode {
        .handle-composite-child {
          animation: pulseComposite 1.5s infinite;
        }
      }
    }
  }

  // 🔥 복합구성용어 자식 Handle 펄스 애니메이션
  @keyframes pulseComposite {
    0%,
    100% {
      box-shadow: 0 2px 6px rgba(139, 92, 246, 0.4);
      transform: scale(1);
    }
    50% {
      box-shadow: 0 4px 16px rgba(139, 92, 246, 0.8);
      transform: scale(1.3);
    }
  }

  // 🔥 최상위 부모 헤더
  .parent-header-only {
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    .parent-term-name {
      font-size: 24px;
      font-weight: 800;
      color: #1e40af;
      margin: 0;
      letter-spacing: -0.5px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .parent-children-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(59, 130, 246, 0.12);
      color: #2563eb;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      border: 1px solid rgba(59, 130, 246, 0.2);

      .hidden-count {
        font-size: 11px;
        opacity: 0.8;
        margin-left: 4px;
        padding: 2px 6px;
        background: rgba(59, 130, 246, 0.15);
        border-radius: 10px;
      }
    }

    .parent-composite-info {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(139, 92, 246, 0.12);
      color: #8b5cf6;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      border: 1px solid rgba(139, 92, 246, 0.2);
      margin-top: 4px;

      .composite-icon {
        width: 14px;
        height: 14px;
      }
    }
  }

  // 🔥 복합구성용어 뱃지
  .composite-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    background: rgba(139, 92, 246, 0.12);
    color: #8b5cf6;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 4px;
    z-index: 10;
    border: 1px solid rgba(139, 92, 246, 0.3);
    box-shadow: 0 1px 3px rgba(139, 92, 246, 0.1);

    svg {
      width: 12px;
      height: 12px;
    }

    .term-node:not(.parent-group) & {
      top: 6px;
      left: 6px;
      padding: 3px 8px;
      font-size: 10px;

      svg {
        width: 10px;
        height: 10px;
      }
    }
  }

  // 자식 노드 순번
  .child-order {
    position: absolute;
    top: -12px;
    left: -12px;
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    z-index: 10;
    box-shadow: 0 3px 8px rgba(59, 130, 246, 0.4);
    border: 2px solid white;
  }

  .node-content {
    text-align: center;
    flex: 1;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    &.child-content {
      // padding-top: 10px;
    }

    .term-name {
      font-size: 16px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 8px 0;
      line-height: 1.3;
      word-break: break-word;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .term-type {
      margin-bottom: 6px;

      .type-label {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 500;
        border: 1px solid;

        &.general {
          background: #f1f5f9;
          color: #475569;
          border-color: #e2e8f0;
        }

        &.composite {
          background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
          color: #7c3aed;
          border-color: #a78bfa;
          font-weight: 600;
        }

        &.standard {
          background: #dcfce7;
          color: #166534;
          border-color: #22c55e;
        }

        &.non-standard {
          background: #fecaca;
          color: #991b1b;
          border-color: #ef4444;
        }
      }
    }

    .relationship-info {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
      padding: 3px 6px;
      background: #f8fafc;
      border-radius: 4px;
      display: inline-block;
    }
  }

  // 🔥 중첩 부모 뱃지
  .nested-parent-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(250, 204, 21, 0.15);
    color: #ca8a04;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    border: 1px solid rgba(250, 204, 21, 0.3);
    margin-bottom: 4px;

    .badge-icon {
      width: 12px;
      height: 12px;
    }
  }

  .delete-button {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 6px;
    color: #ef4444;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    opacity: 0;
    z-index: 20;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: #ef4444;
      transform: scale(1.1);
    }

    .term-node:hover & {
      opacity: 1;
    }

    .term-node.parent-group & {
      top: 12px;
      right: 12px;
      background: rgba(255, 255, 255, 0.9);
      border-color: rgba(239, 68, 68, 0.3);
    }
  }

  .connect-button {
    position: absolute;
    top: 8px;
    right: 44px;
    width: 28px;
    height: 28px;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 6px;
    color: #3b82f6;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    opacity: 0;
    z-index: 20;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      background: rgba(59, 130, 246, 0.2);
      border-color: #3b82f6;
      transform: scale(1.1);
    }

    &.active {
      opacity: 1 !important;
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    .term-node:hover & {
      opacity: 1;
    }
  }

  .connecting-indicator {
    position: absolute;
    bottom: -35px;
    left: 50%;
    transform: translateX(-50%);
    background: #3b82f6;
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
    z-index: 10;

    &::before {
      content: '';
      position: absolute;
      top: -4px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-bottom: 4px solid #3b82f6;
    }
  }

  // 🔥 Handle 스타일 개선
  :deep(.vue-flow__handle) {
    width: 12px;
    height: 12px;
    background: #64748b;
    border: 2px solid white;
    border-radius: 50%;
    transition: all 0.2s ease;
    cursor: crosshair;

    // ✅ Source Handle (보이는 핸들)
    &.handle-source {
      opacity: 0.7;
      pointer-events: auto;
      z-index: 10;

      &:hover {
        opacity: 1 !important;
        transform: scale(1.5);
        background: #3b82f6;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
      }
    }

    // ✅ Target Handle (투명, 같은 위치)
    &.handle-target {
      opacity: 0 !important;
      pointer-events: auto; // 🔥 드래그 종료 감지용
      z-index: 9; // source보다 뒤에
    }
  }

  // 노드 호버 시 source Handle 강조
  .term-node:hover {
    :deep(.handle-source) {
      opacity: 1;
    }
  }

  :deep(.handle-top) {
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
  }

  :deep(.handle-bottom) {
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
  }

  :deep(.handle-left) {
    left: -6px;
    top: 50%;
    transform: translateY(-50%);
  }

  :deep(.handle-right) {
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
  }

  // 연결 모드일 때 source Handle 펄스
  .term-node.connecting-mode {
    :deep(.handle-source) {
      opacity: 1 !important;
      background: #3b82f6;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
      animation: pulse-handle 1.5s ease-in-out infinite;
    }
  }

  // 복합구성용어 자식 Handle
  .term-node.composite-child {
    :deep(.handle-composite-child) {
      &.handle-source {
        width: 12px;
        height: 12px;
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(139, 92, 246, 0.4);
        opacity: 1;

        &:hover {
          transform: scale(1.4);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.6);
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
        }
      }

      &.handle-target {
        opacity: 0 !important;
      }
    }
  }

  @keyframes pulse-handle {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }
</style>
