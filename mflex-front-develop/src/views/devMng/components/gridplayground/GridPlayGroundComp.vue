<template>
  <div class="grid-playground">
    <h2>GridPlayGround - Vue Flow Parent-Child Example</h2>

    <LanguageSwitcher />

    <!-- 🔥 Vue Flow 컨테이너 - key와 v-if로 완전 초기화 -->
    <div class="vue-flow-wrapper">
      <VueFlow
        v-if="isFlowReady"
        :key="flowKey"
        v-model:nodes="nodes"
        v-model:edges="edges"
        :fit-view-on-init="true"
        :nodes-draggable="true"
        :nodes-connectable="true"
        :elements-selectable="true"
        elevate-edges-on-select
        @pane-ready="onPaneReady"
      >
        <!-- 미니맵 -->
        <MiniMap />

        <!-- 컨트롤 버튼 -->
        <Controls />

        <!-- 배경 그리드 -->
        <Background pattern-color="#aaa" :gap="16" />
      </VueFlow>
    </div>

    <!-- 테스트 버튼 -->
    <div class="control-panel">
      <button class="btn-s" @click="onNestCall">nest호출</button>
      <button class="btn-s" @click="addChildNode">자식 노드 추가</button>
      <button class="btn-s" @click="resetFlow">초기화</button>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, nextTick } from 'vue';
  import { VueFlow, useVueFlow } from '@vue-flow/core';
  import { Background } from '@vue-flow/background';
  import { Controls } from '@vue-flow/controls';
  import { MiniMap } from '@vue-flow/minimap';
  import LanguageSwitcher from '@/views/devMng/components/LanguageSwitcher.vue';

  // 🔥 Flow 초기화 상태 관리
  const isFlowReady = ref(false);
  const flowKey = ref(0);

  // 🔥 useVueFlow 훅
  const { fitView } = useVueFlow();

  // 🔥 초기 노드 데이터를 함수로 분리 (재사용 가능)
  const getInitialNodes = () => [
    // 일반 노드
    {
      id: '1',
      type: 'input',
      data: { label: '시작 노드' },
      position: { x: 250, y: 50 },
    },

    // 부모 노드 1 (일반 그룹)
    {
      id: '2',
      data: { label: '부모 노드 1' },
      position: { x: 100, y: 200 },
      style: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        border: '2px solid #10b981',
        width: '250px',
        height: '250px',
        borderRadius: '12px',
        padding: '20px',
      },
    },

    // 부모 노드 1의 자식 노드들
    {
      id: '2a',
      data: { label: '자식 노드 1-1' },
      position: { x: 20, y: 60 },
      parentNode: '2',
      extent: 'parent',
      draggable: true,
      style: {
        backgroundColor: 'white',
        border: '2px solid #10b981',
        borderRadius: '8px',
        padding: '10px',
      },
    },
    {
      id: '2b',
      data: { label: '자식 노드 1-2' },
      position: { x: 20, y: 140 },
      parentNode: '2',
      extent: 'parent',
      draggable: true,
      style: {
        backgroundColor: 'white',
        border: '2px solid #10b981',
        borderRadius: '8px',
        padding: '10px',
      },
    },

    // 부모 노드 2 (복잡한 중첩 구조)
    {
      id: '3',
      data: { label: '부모 노드 2' },
      position: { x: 450, y: 200 },
      style: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        border: '2px solid #3b82f6',
        width: '400px',
        height: '350px',
        borderRadius: '12px',
        padding: '20px',
      },
    },

    // 부모 노드 2의 자식 노드
    {
      id: '3a',
      data: { label: '자식 노드 2-1' },
      position: { x: 20, y: 60 },
      parentNode: '3',
      extent: 'parent',
      draggable: true,
      style: {
        backgroundColor: 'white',
        border: '2px solid #3b82f6',
        borderRadius: '8px',
        padding: '10px',
      },
    },

    // 중첩된 부모 노드 (부모 노드 2 내부)
    {
      id: '3b',
      data: { label: '중첩 부모 노드' },
      position: { x: 20, y: 140 },
      parentNode: '3',
      extent: 'parent',
      draggable: true,
      style: {
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        border: '2px solid #8b5cf6',
        width: '280px',
        height: '150px',
        borderRadius: '8px',
        padding: '15px',
      },
    },

    // 중첩된 부모 노드의 자식들
    {
      id: '3b1',
      data: { label: '중첩 자식 1' },
      position: { x: 15, y: 50 },
      parentNode: '3b',
      extent: 'parent',
      draggable: true,
      style: {
        backgroundColor: 'white',
        border: '2px solid #8b5cf6',
        borderRadius: '6px',
        padding: '8px',
        fontSize: '12px',
      },
    },
    {
      id: '3b2',
      data: { label: '중첩 자식 2' },
      position: { x: 150, y: 50 },
      parentNode: '3b',
      extent: 'parent',
      draggable: true,
      style: {
        backgroundColor: 'white',
        border: '2px solid #8b5cf6',
        borderRadius: '6px',
        padding: '8px',
        fontSize: '12px',
      },
    },

    // 추가 자식 노드
    {
      id: '3c',
      data: { label: '자식 노드 2-2' },
      position: { x: 220, y: 60 },
      parentNode: '3',
      extent: 'parent',
      draggable: true,
      style: {
        backgroundColor: 'white',
        border: '2px solid #3b82f6',
        borderRadius: '8px',
        padding: '10px',
      },
    },

    // 출력 노드
    {
      id: '4',
      type: 'output',
      data: { label: '종료 노드' },
      position: { x: 500, y: 600 },
    },
  ];

  // 🔥 초기 엣지 데이터를 함수로 분리
  const getInitialEdges = () => [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      animated: true,
      style: { stroke: '#10b981', strokeWidth: 2 },
    },
    {
      id: 'e1-3',
      source: '1',
      target: '3',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    },
    {
      id: 'e2a-2b',
      source: '2a',
      target: '2b',
      animated: false,
      style: { stroke: '#10b981', strokeWidth: 2 },
      label: '형제 관계',
    },
    {
      id: 'e3a-3b',
      source: '3a',
      target: '3b',
      animated: false,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    },
    {
      id: 'e3a-3c',
      source: '3a',
      target: '3c',
      animated: false,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    },
    {
      id: 'e3b1-3b2',
      source: '3b1',
      target: '3b2',
      animated: false,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
      label: '중첩 관계',
    },
    {
      id: 'e2-3',
      source: '2b',
      target: '3a',
      animated: true,
      style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' },
      label: '그룹 간 연결',
    },
    {
      id: 'e3c-4',
      source: '3c',
      target: '4',
      animated: true,
      style: { stroke: '#ef4444', strokeWidth: 2 },
    },
  ];

  // 🔥 노드와 엣지 초기화
  const nodes = ref(getInitialNodes());
  const edges = ref(getInitialEdges());

  // 🔥 Pane이 준비되었을 때 호출
  const onPaneReady = () => {
    // Pane이 완전히 준비되면 fitView 실행
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 200 });
    }, 100);
  };

  // 🔥 컴포넌트 마운트 시 초기화
  onMounted(async () => {
    // Flow를 일단 숨김
    isFlowReady.value = false;

    // DOM 업데이트 대기
    await nextTick();

    // 두 프레임 대기 후 렌더링 (완전한 초기화)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        flowKey.value = Date.now(); // 고유한 key 생성
        isFlowReady.value = true;
      });
    });
  });

  // 🔥 자식 노드 추가 함수
  let childCounter = 0;
  const addChildNode = () => {
    childCounter++;
    const newChild = {
      id: `dynamic-child-${childCounter}`,
      data: { label: `동적 자식 ${childCounter}` },
      position: { x: 20, y: 60 + childCounter * 80 },
      parentNode: '2',
      extent: 'parent',
      draggable: true,
      style: {
        backgroundColor: 'white',
        border: '2px solid #f59e0b',
        borderRadius: '8px',
        padding: '10px',
      },
    };

    nodes.value.push(newChild);

    // 이전 자식과 연결
    if (childCounter > 1) {
      const newEdge = {
        id: `e-dynamic-${childCounter - 1}-${childCounter}`,
        source: `dynamic-child-${childCounter - 1}`,
        target: `dynamic-child-${childCounter}`,
        animated: false,
        style: { stroke: '#f59e0b', strokeWidth: 2 },
      };
      edges.value.push(newEdge);
    }
  };

  // 🔥 초기화 함수 - 완전히 재생성
  const resetFlow = async () => {
    childCounter = 0;

    // Flow 숨김
    isFlowReady.value = false;

    await nextTick();

    // 초기 데이터로 리셋
    nodes.value = getInitialNodes();
    edges.value = getInitialEdges();

    // Flow 재생성
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        flowKey.value = Date.now();
        isFlowReady.value = true;
      });
    });
  };

  // 🔥 nest 호출 함수
  const onNestCall = () => {
    fetch('http://localhost:3000/biz-terms')
      .then((response) => response.text())
      .then((data) => {
        console.log(data);
        alert(data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  onMounted(() => {
    console.log('GridPlayGroundComp 컴포넌트 마운트됨');
  });
</script>

<style scoped lang="scss">
  .grid-playground {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f8fafc;
  }

  h2 {
    margin: 20px;
    color: #1e293b;
    font-size: 24px;
    font-weight: 700;
  }

  .vue-flow-wrapper {
    flex: 1;
    width: 100%;
    height: calc(100vh - 200px);
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    margin: 0 20px 20px 20px;
    background: white;
    overflow: hidden;
  }

  .control-panel {
    display: flex;
    gap: 12px;
    padding: 0 20px 20px 20px;

    .btn-s {
      padding: 10px 20px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #2563eb;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      }

      &:active {
        transform: translateY(0);
      }

      &:nth-child(2) {
        background: #10b981;

        &:hover {
          background: #059669;
        }
      }

      &:nth-child(3) {
        background: #ef4444;

        &:hover {
          background: #dc2626;
        }
      }
    }
  }

  // 🔥 Vue Flow 스타일 커스터마이징
  :deep(.vue-flow__node) {
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.selected {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
    }
  }

  :deep(.vue-flow__edge) {
    &.selected {
      .vue-flow__edge-path {
        stroke: #10b981 !important;
        stroke-width: 3 !important;
        filter: drop-shadow(0 0 4px rgba(16, 185, 129, 0.6));
      }
    }

    &:hover {
      .vue-flow__edge-path {
        stroke-width: 3 !important;
      }
    }
  }

  :deep(.vue-flow__edge-label) {
    background: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  :deep(.vue-flow__handle) {
    width: 10px;
    height: 10px;
    background: #3b82f6;
    border: 2px solid white;
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.3);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
    }
  }

  :deep(.vue-flow__controls) {
    button {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      transition: all 0.2s ease;

      &:hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
      }
    }
  }

  :deep(.vue-flow__minimap) {
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  :deep(.vue-flow__background) {
    background-color: #f8fafc;
  }
</style>
