<!-- filepath: c:\Users\dacon008\workspace\mflex-project\mflex-front\src\views\bizMetaMng\components\bizMetaFlow\CompositeChildrenContainer.vue -->

<template>
  <div class="composite-children-container">
    <!-- 헤더 -->
    <div class="composite-header">
      <h3 class="composite-title">{{ parentData.termName }}</h3>
      <div class="composite-badge">{{ children.length }}개 하위 항목</div>
      <div class="composite-type-badge">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path
            d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"
          />
        </svg>
        복합구성용어
      </div>

      <!-- 삭제/연결 버튼 -->
      <button
        class="header-button delete-button"
        @click.stop="handleDeleteParent"
        title="복합구성용어 삭제"
      >
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path
            d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
          />
        </svg>
      </button>

      <button
        class="header-button connect-button"
        @click.stop="handleConnectParent"
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
    </div>

    <!-- 자식 리스트 -->
    <div class="children-list" ref="childrenListRef">
      <div
        v-for="(child, index) in sortedChildren"
        :key="child.id"
        class="child-item"
        :class="{ dragging: draggingChildId === child.id }"
        :data-child-id="child.id"
        draggable="true"
        @dragstart="handleDragStart($event, child, index)"
        @dragover="handleDragOver($event, index)"
        @drop="handleDrop($event, index)"
        @dragend="handleDragEnd"
        @click="handleChildClick(child)"
      >
        <!-- 순번 -->
        <div class="child-order">{{ index + 1 }}</div>

        <!-- 내용 -->
        <div class="child-content">
          <h4 class="child-name">{{ child.termName }}</h4>
          <div class="child-type">
            <span class="type-label">{{
              getTermTypeText(child.termType)
            }}</span>
          </div>
        </div>

        <!-- 버튼 -->
        <button
          class="child-delete-button"
          @click.stop="handleDeleteChild(child)"
          title="항목 제거"
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
            />
          </svg>
        </button>

        <!-- 연결점 (상단) -->
        <div
          class="child-handle child-handle-top"
          :data-child-id="child.id"
          @mousedown="handleHandleMouseDown($event, child, 'top')"
        ></div>

        <!-- 연결점 (하단) -->
        <div
          class="child-handle child-handle-bottom"
          :data-child-id="child.id"
          @mousedown="handleHandleMouseDown($event, child, 'bottom')"
        ></div>
      </div>
    </div>

    <!-- 드래그 플레이스홀더 -->
    <div
      v-if="draggingChildId"
      class="drag-placeholder"
      :style="placeholderStyle"
    ></div>
  </div>
</template>

<script setup>
  import { ref, computed, inject } from 'vue';

  const props = defineProps({
    parentData: {
      type: Object,
      required: true,
    },
    parentNodeId: {
      type: String,
      required: true,
    },
    children: {
      type: Array,
      default: () => [],
    },
    isConnectingMode: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits([
    'delete-parent',
    'connect-parent',
    'delete-child',
    'reorder-children',
    'child-click',
    'handle-connect-start',
  ]);

  const draggingChildId = ref(null);
  const draggingIndex = ref(null);
  const targetIndex = ref(null);
  const childrenListRef = ref(null);

  const sortedChildren = computed(() => {
    return [...props.children].sort((a, b) => (a.order || 0) - (b.order || 0));
  });

  const placeholderStyle = computed(() => {
    if (targetIndex.value === null) return {};
    return {
      top: `${80 + targetIndex.value * 180}px`,
    };
  });

  const getTermTypeText = (termType) => {
    const typeMap = {
      GENERAL: '일반용어',
      COMPOSITE: '복합구성',
    };
    return typeMap[termType] || '일반용어';
  };

  const handleDeleteParent = () => {
    emit('delete-parent', props.parentNodeId);
  };

  const handleConnectParent = () => {
    emit('connect-parent', props.parentNodeId);
  };

  const handleDeleteChild = (child) => {
    if (confirm(`'${child.termName}' 항목을 제거하시겠습니까?`)) {
      emit('delete-child', child);
    }
  };

  const handleChildClick = (child) => {
    emit('child-click', child);
  };

  // 🔥 드래그 앤 드롭 (순서 변경)
  const handleDragStart = (event, child, index) => {
    draggingChildId.value = child.id;
    draggingIndex.value = index;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', child.id);
  };

  const handleDragOver = (event, index) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    targetIndex.value = index;
  };

  const handleDrop = (event, index) => {
    event.preventDefault();

    if (draggingIndex.value !== null && draggingIndex.value !== index) {
      emit('reorder-children', {
        fromIndex: draggingIndex.value,
        toIndex: index,
      });
    }

    draggingChildId.value = null;
    draggingIndex.value = null;
    targetIndex.value = null;
  };

  const handleDragEnd = () => {
    draggingChildId.value = null;
    draggingIndex.value = null;
    targetIndex.value = null;
  };

  // 🔥 Handle 연결 시작
  const handleHandleMouseDown = (event, child, position) => {
    event.stopPropagation();
    emit('handle-connect-start', {
      childId: child.id,
      childData: child,
      position: position,
    });
  };
</script>

<style lang="scss" scoped>
  .composite-children-container {
    width: 400px;
    background: rgba(250, 245, 255, 0.6);
    border: 3px solid #8b5cf6;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.15);
    position: relative;
    background-image: linear-gradient(
        rgba(255, 255, 255, 0.1) 1px,
        transparent 1px
      ),
      linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
  }

  .composite-header {
    height: 70px;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    border-radius: 13px 13px 0 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 20px;
    position: relative;
  }

  .composite-title {
    color: white;
    font-size: 20px;
    font-weight: 700;
    margin: 0;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .composite-badge {
    position: absolute;
    top: 50%;
    right: 60px;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.9);
    color: #8b5cf6;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .composite-type-badge {
    position: absolute;
    top: 50%;
    left: 20px;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 4px;
    color: white;
    font-size: 11px;
    font-weight: 600;

    svg {
      width: 14px;
      height: 14px;
    }
  }

  .header-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    opacity: 1;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      transform: translateY(-50%) scale(1.1);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    &.delete-button {
      right: 15px;
      color: #ef4444;

      &:hover {
        background: #fef2f2;
        border-color: #ef4444;
      }
    }

    &.connect-button {
      right: 50px;
      color: #3b82f6;

      &:hover {
        background: #eff6ff;
        border-color: #3b82f6;
      }

      &.active {
        background: #3b82f6;
        color: white;
        border-color: #3b82f6;
      }
    }
  }

  .children-list {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: relative;
  }

  .child-item {
    position: relative;
    background: white;
    border: 2px solid #cbd5e1;
    border-left: 4px solid #a78bfa;
    border-radius: 10px;
    padding: 15px;
    cursor: grab;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 12px;

    &:hover {
      border-color: #94a3b8;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      transform: translateX(2px);

      .child-delete-button,
      .child-handle {
        opacity: 1;
      }
    }

    &.dragging {
      opacity: 0.5;
      cursor: grabbing;
    }
  }

  .child-order {
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    box-shadow: 0 3px 8px rgba(139, 92, 246, 0.4);
    flex-shrink: 0;
  }

  .child-content {
    flex: 1;
    overflow: hidden;
  }

  .child-name {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 4px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .child-type {
    .type-label {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 500;
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
    }
  }

  .child-delete-button {
    width: 24px;
    height: 24px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 4px;
    color: #ef4444;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    opacity: 0;
    flex-shrink: 0;

    svg {
      width: 12px;
      height: 12px;
    }

    &:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: #ef4444;
      transform: scale(1.1);
    }
  }

  .child-handle {
    position: absolute;
    width: 12px;
    height: 12px;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(139, 92, 246, 0.4);
    cursor: crosshair;
    opacity: 0;
    transition: all 0.2s ease;
    z-index: 10;

    &:hover {
      transform: scale(1.4);
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.6);
    }

    &.child-handle-top {
      top: -6px;
      left: 50%;
      transform: translateX(-50%);

      &:hover {
        transform: translateX(-50%) scale(1.4);
      }
    }

    &.child-handle-bottom {
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);

      &:hover {
        transform: translateX(-50%) scale(1.4);
      }
    }
  }

  .drag-placeholder {
    position: absolute;
    left: 20px;
    right: 20px;
    height: 120px;
    background: rgba(139, 92, 246, 0.1);
    border: 2px dashed #8b5cf6;
    border-radius: 10px;
    pointer-events: none;
    transition: top 0.2s ease;
  }
</style>
