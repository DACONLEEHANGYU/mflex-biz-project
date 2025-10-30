<template>
  <!-- filepath: c:\Users\dacon008\workspace\mflex-project\mflex-front\src\views\bizMetaMng\components\bizMetaFlow\BizMetaPanel.vue -->
  <div class="vue-flow-panel">
    <!-- 🔥 상단 컨트롤 버튼들 (사이드바 상태에 따라 이동) -->
    <div class="flow-controls" :class="{ 'sidebar-open': sidebarRef?.isOpen }">
      <button
        class="control-button add-term"
        @click="toggleAddTermMode"
        :class="{ active: isAddTermMode }"
        title="용어 추가"
      >
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path
            d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"
          />
        </svg>
        용어추가
      </button>

      <button
        class="control-button clear-panel"
        @click="clearPanel"
        title="전체 비우기"
      >
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
            clip-rule="evenodd"
          />
        </svg>
        비우기
      </button>
    </div>

    <!-- Vue Flow Container -->
    <div
      ref="vueFlowContainer"
      class="vue-flow-container"
      :class="{ 'add-term-mode': isAddTermMode }"
      @click="handleContainerClick"
    >
      <VueFlow
        v-if="isFlowReady"
        :key="flowKey"
        ref="vueFlowRef"
        v-model:nodes="nodes"
        v-model:edges="edges"
        @drop="handleDrop"
        @dragover.prevent
        @dragenter.prevent
        @connect="handleConnect"
        @connect-start="handleConnectStart"
        @connect-end="handleConnectEnd"
        @node-drag="handleNodeDrag"
        @node-drag-start="handleNodeDragStart"
        @node-drag-stop="handleNodeDragStop"
        @node-click="handleNodeClick"
        @edge-click="handleEdgeClick"
        :fit-view-on-init="false"
        :nodes-draggable="true"
        :nodes-connectable="true"
        :elements-selectable="true"
        :connection-line-style="connectionLineStyle"
        :connection-mode="ConnectionMode.Loose"
        :default-viewport="defaultViewport"
        :min-zoom="0.2"
        :max-zoom="2"
        :snap-to-grid="false"
        :snap-grid="[15, 15]"
        elevate-edges-on-select
        @pane-ready="onPaneReady"
      >
        <!-- 커스텀 연결 라인 -->
        <template #connection-line="{ sourceX, sourceY, targetX, targetY }">
          <g>
            <path
              :d="`M${sourceX},${sourceY} C${sourceX + 50},${sourceY} ${
                targetX - 50
              },${targetY} ${targetX},${targetY}`"
              stroke="#3b82f6"
              stroke-width="2"
              fill="none"
              stroke-dasharray="5,5"
              class="connection-line"
            />
            <circle
              :cx="targetX"
              :cy="targetY"
              r="4"
              fill="#3b82f6"
              class="connection-target"
            />
          </g>
        </template>

        <!-- 노드 타입 정의 -->
        <template #node-termNode="{ data, id }">
          <TermNode
            :data="data"
            :id="id"
            @delete="deleteNode"
            @connect-start="handleNodeConnectStart"
            @connect-end="handleNodeConnectEnd"
          />
        </template>

        <!-- 커스텀 엣지 타입 정의 -->
        <template #edge-relationshipEdge="edgeProps">
          <RelationshipEdge
            v-bind="edgeProps"
            @edge-click="handleEdgeClick"
            @relation-changed="handleEdgeRelationChanged"
          />
        </template>
        <!-- 기본 마커 정의 -->
        <svg>
          <defs>
            <marker
              id="vue-flow__arrowclosed"
              viewBox="-10 -10 20 20"
              refX="0"
              refY="0"
              markerWidth="20"
              markerHeight="20"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1"
                fill="#64748b"
                stroke="#64748b"
                points="-5,-4 0,0 -5,4 -5,-4"
              />
            </marker>
          </defs>
        </svg>
      </VueFlow>

      <!-- 🔥 사이드바 추가 -->
      <BizMetaDetailsSideBar
        ref="sidebarRef"
        :selected-item="selectedItem"
        :nodes="nodes"
        :edges="edges"
        @close="handleSidebarClose"
        @select-relationship="handleSelectRelationship"
        @delete-relationship="handleDeleteRelationship"
        @delete-edge="handleDeleteEdge"
      />
    </div>

    <!-- 🔥 드래그 안내 메시지 (중첩 노드용) -->
    <div v-if="isDraggingForNesting" class="drag-indicator">
      다른 노드 위에 놓으면 부모-자식 관계가 형성됩니다
    </div>

    <!-- 용어 정보 입력 팝업 -->
    <div
      v-if="showTermPopup"
      class="term-popup-overlay"
      @click="closeTermPopup"
    >
      <div
        class="term-popup"
        @click.stop
        :style="{ left: popupPosition.x + 'px', top: popupPosition.y + 'px' }"
      >
        <div class="popup-header">
          <h3>비즈니스용어 등록</h3>
          <button class="close-button" @click="closeTermPopup">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
              />
            </svg>
          </button>
        </div>

        <form @submit.prevent="createTerm" class="popup-form">
          <div class="form-group">
            <label for="termName" style="color: red">*비즈니스용어명</label>
            <input
              id="termName"
              v-model="newTerm.termName"
              type="text"
              placeholder="용어명을 입력하세요"
              required
              ref="termNameInput"
            />
          </div>

          <!-- <div class="form-group">
            <label for="termType">용어 타입</label>
            <select id="termType" v-model="newTerm.termType">
              <option value="GENERAL">일반용어</option>
              <option value="COMPOSITE">복합구성용어</option>
              <option value="STANDARD">표준용어</option>
              <option value="NON_STANDARD">비표준용어</option>
            </select>
          </div> -->

          <div class="form-group">
            <label for="description" style="color: red"
              >*비즈니스용어설명</label
            >
            <textarea
              id="description"
              v-model="newTerm.termExplain"
              placeholder="용어 설명을 입력하세요"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="owner" style="color: red">*소유자</label>
            <input
              id="owner"
              v-model="newTerm.owner"
              type="text"
              placeholder="소유자를 입력하세요"
              disabled
            />
          </div>

          <div class="form-actions">
            <button type="button" @click="closeTermPopup" class="cancel-button">
              취소
            </button>
            <button type="submit" class="create-button">생성</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 관계 정보 입력 팝업 -->
    <div
      v-if="showRelationshipPopup"
      class="relationship-popup-overlay"
      @click="closeRelationshipPopup"
    >
      <div class="relationship-popup" @click.stop>
        <div class="popup-header">
          <h3>관계 정보 입력</h3>
          <button class="close-button" @click="closeRelationshipPopup">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
              />
            </svg>
          </button>
        </div>

        <div class="popup-body">
          <div class="relationship-info">
            <div class="node-info">
              <!-- <span class="node-label">출발 노드:</span> -->
              <span class="node-name">{{
                pendingConnection.sourceNodeData?.termName
              }}</span>
            </div>
            <div class="arrow">→</div>
            <div class="node-info">
              <!-- <span class="node-label">도착 노드:</span> -->
              <span class="node-name">{{
                pendingConnection.targetNodeData?.termName
              }}</span>
            </div>
          </div>

          <form @submit.prevent="createRelationship" class="popup-form">
            <!-- <div class="form-group">
              <label for="relationshipName">관계명</label>
              <input
                id="relationshipName"
                v-model="newRelationship.relationshipName"
                type="text"
                placeholder="관계명을 입력하세요"
                required
              />
            </div> -->

            <div class="form-group">
              <label for="description" style="color: red"
                >*비즈니스용어 관계설명</label
              >
              <textarea
                id="description"
                v-model="newRelationship.description"
                placeholder="관계에 대한 설명을 입력하세요"
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="relationshipType" style="color: red"
                >*비즈니스용어 관계유형</label
              >
              <select
                id="relationshipType"
                v-model="newRelationship.relationshipType"
                required
                @change="onChangeBizRelType(newRelationship.relationshipType)"
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

            <!-- <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="newRelationship.isBidirectional"
                />
                양방향 관계
              </label>
            </div> -->

            <div class="form-actions">
              <button
                type="button"
                @click="closeRelationshipPopup"
                class="cancel-button"
              >
                취소
              </button>
              <button type="submit" class="create-button">등록</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 안내 메시지 -->
    <div v-if="isAddTermMode && !showTermPopup" class="instruction-message">
      <div class="instruction-content">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.53 10.53a.75.75 0 00-1.06 1.061l1.5 1.5a.75.75 0 001.137-.089l4-5.5z"
            clip-rule="evenodd"
          />
        </svg>
        <span>패널을 클릭하여 용어를 추가하세요</span>
      </div>
    </div>
  </div>

  <!-- 🔥 관계 선택 팝업 -->
  <RelationSelectionPopup
    v-model="showRelationSelectionPopup"
    :selectRelToolTip="selectRelToolTip"
    :source-node-name="relationSelectionData.sourceNodeName"
    :target-node-name="relationSelectionData.targetNodeName"
    :available-relations="relationSelectionData.availableRelations"
    :current-relation-id="relationSelectionData.currentRelationId"
    @select-composite-relation="handleSelectCompositeRelation"
    @select-relation="handleSelectRelation"
  />
</template>

<script setup>
  import {
    ref,
    reactive,
    nextTick,
    onMounted,
    onBeforeUnmount,
    provide,
    watch,
    onActivated,
  } from 'vue';
  import {
    VueFlow,
    MarkerType,
    ConnectionMode,
    useVueFlow,
  } from '@vue-flow/core';
  import TermNode from './TermNode.vue';
  import RelationshipEdge from './RelationshipEdge.vue';
  import BizMetaDetailsSideBar from './BizMetaDetailsSideBar.vue'; // 🔥 수정된 import
  // ...existing imports...
  import RelationSelectionPopup from './RelationSelectionPopup.vue';
  import { useBizMetaStore } from '@/stores/bizMeta';
  import {
    addBizTerm, // 비즈니스 용어 추가
    addBizTermRelation, // 비즈니스용어 관계 추가
    addBizTermComposite, // 복합 비즈니스 용어 추가
    deleteBizTermCompositeChild, // 복합 비즈니스 용어 자식 삭제
    getNewCompositeRelations, // 복합구성간 관계 조회
    updateChildrenOrder, // 복합구성요소 자식요소 순서 변경
  } from '@/utils/mflexApi/bizMeta/bizMetaApi';

  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';

  const authStore = useAuthStore();
  const { userInfo, userStngInfo } = storeToRefs(authStore);

  const { fitView, updateNodeInternals } = useVueFlow();

  const emit = defineEmits([
    'term-created',
    'panel-cleared',
    'relationship-created',
    'parent-child-created',
  ]);

  const bizMetaStore = useBizMetaStore();
  const { setIsUpdate } = bizMetaStore;

  // 🔥 RelationshipEdge를 위한 함수 제공
  provide('getAllEdges', () => edges.value);
  provide('getNodeById', (id) => nodes.value.find((n) => n.id === id));

  // 🔥 기본 뷰포트 설정
  const defaultViewport = ref({
    x: 0,
    y: 0,
    zoom: 0.8, // 🔥 초기 zoom 레벨 (0.8 = 80% 크기)
  });

  // 🔥 Pane이 준비되었을 때 호출
  const onPaneReady = () => {
    console.log('🎨 [onPaneReady] VueFlow Pane 준비 완료');

    // 🔥 Pane이 완전히 준비되면 노드 업데이트 및 fitView 실행
    setTimeout(async () => {
      if (nodes.value.length > 0) {
        console.log('🔄 [onPaneReady] 노드 dimension 업데이트 시작');
        nodes.value.forEach((node) => {
          updateNodeInternals(node.id);
        });
        console.log('✅ [onPaneReady] 노드 dimension 업데이트 완료');

        // 🔥 모든 노드가 보이도록 뷰 조정
        await nextTick();
        fitView({ padding: 0.2, duration: 200 });
        console.log('✅ [onPaneReady] fitView 완료');
      }
    }, 100);
  };

  // 🔥 Flow 초기화 상태 관리
  const isFlowReady = ref(false);
  const flowKey = ref(0);

  // 상태 관리
  const nodes = ref([]);
  const edges = ref([]);
  const isAddTermMode = ref(false);
  const showTermPopup = ref(false);
  const showRelationshipPopup = ref(false);
  const isDraggingForNesting = ref(false);
  const popupPosition = reactive({ x: 0, y: 0 });
  const termNameInput = ref(null);
  const vueFlowContainer = ref(null);
  const vueFlowRef = ref(null);

  // 🔥 사이드바 상태
  const sidebarRef = ref(null);
  const selectedItem = ref(null);

  // 🔥 자식 노드 드래그 상태 관리
  const draggingChildState = reactive({
    isDragging: false,
    childId: null,
    parentId: null,
    originalOrder: null,
  });

  // 관계 연결 상태 관리
  const connectingState = reactive({
    isConnecting: false,
    sourceNodeId: null,
    sourceNodeData: null,
  });

  const pendingConnection = reactive({
    sourceNodeId: null,
    sourceNodeData: null,
    targetNodeId: null,
    targetNodeData: null,
    sourceHandle: null,
    targetHandle: null,
  });

  // 새 용어 및 관계 데이터
  const newTerm = reactive({
    termName: '',
    termType: 'GENERAL',
    termExplain: '',
    owner: userInfo.value.ogdpDeptNm || '',
    nodePosition: null,
  });

  const newRelationship = reactive({
    relationshipName: '',
    relationshipType: '',
    description: '',
    isBidirectional: false,
  });

  // 카운터
  let nodeIdCounter = 1;
  let edgeIdCounter = 1;

  // 연결 라인 스타일
  const connectionLineStyle = {
    stroke: '#3b82f6',
    strokeWidth: 2,
    strokeDasharray: '5,5',
  };

  // Provider 함수들
  const getNodeRelationships = (nodeId) => {
    const node = nodes.value.find((n) => n.id === nodeId);

    console.log('🔍 [getNodeRelationships] 관계 필터링 시작:', {
      nodeId,
      termName: node?.data?.termName,
      isCompositeChild: node?.data?.isCompositeChild,
    });

    // 🔥 해당 노드와 연결된 모든 엣지 필터링
    let relationships = edges.value.filter(
      (edge) => edge.source === nodeId || edge.target === nodeId
    );

    console.log(
      `📊 [getNodeRelationships] 전체 연결된 엣지: ${relationships.length}개`
    );

    // 🔥 복합구성용어 자식 노드인 경우: 내부 자식 간 관계 제외
    if (node?.data?.isCompositeChild) {
      const parentNodeId = node.parentNode;

      console.log('🔥 [getNodeRelationships] 복합구성용어 자식 - 필터링 적용');
      console.log(`   부모 노드 ID: ${parentNodeId}`);

      relationships = relationships.filter((edge) => {
        const sourceNode = nodes.value.find((n) => n.id === edge.source);
        const targetNode = nodes.value.find((n) => n.id === edge.target);

        // 🔥 소스/타겟이 모두 같은 부모의 자식인지 확인
        const isBothCompositeChildren =
          sourceNode?.data.isCompositeChild &&
          targetNode?.data.isCompositeChild &&
          sourceNode?.parentNode === parentNodeId &&
          targetNode?.parentNode === parentNodeId;

        if (isBothCompositeChildren) {
          console.log(`   ⏭️ 내부 자식 간 엣지 제외: ${edge.id}`);
          return false; // 같은 복합구성용어 내부 자식 간 관계 제외
        }

        return true;
      });

      console.log(
        `✅ [getNodeRelationships] 필터링 후: ${relationships.length}개`
      );
    }

    return relationships;
  };

  provide('connectingState', connectingState);
  provide('getNodeRelationships', getNodeRelationships);

  // 🔥 복합구성용어의 내부 자식 노드인지 확인하는 함수
  const isCompositeChildNode = (node) => {
    // 🔥 isCompositeChild 플래그 직접 확인 (명시적으로 설정된 경우)
    if (node.data?.isCompositeChild === true) {
      return true;
    }

    // 부모 노드가 없으면 복합구성용어 자식이 아님
    if (!node.parentNode) return false;

    const parentNode = nodes.value.find((n) => n.id === node.parentNode);

    // 부모가 복합구성용어이면 해당 노드는 복합구성용어의 자식
    return parentNode && parentNode.data.termType === 'COMPOSITE';
  };

  // 🔥 두 노드가 같은 복합구성용어의 자식인지 확인하는 함수
  const areSiblingCompositeChildren = (node1, node2) => {
    if (!node1.parentNode || !node2.parentNode) return false;

    // 같은 부모를 가지고 있는지 확인
    if (node1.parentNode !== node2.parentNode) return false;

    // 부모가 복합구성용어인지 확인
    const parentNode = nodes.value.find((n) => n.id === node1.parentNode);
    return parentNode && parentNode.data.termType === 'COMPOSITE';
  };

  // 🔥 외부 노드와 복합구성용어 내부 자식 간의 관계인지 확인
  const isExternalToInternalRelation = (sourceNode, targetNode) => {
    const sourceIsCompositeChild = isCompositeChildNode(sourceNode);
    const targetIsCompositeChild = isCompositeChildNode(targetNode);

    // 한쪽은 복합구성 내부, 한쪽은 외부인 경우
    return (
      (sourceIsCompositeChild && !targetIsCompositeChild) ||
      (!sourceIsCompositeChild && targetIsCompositeChild)
    );
  };

  // 🔥 최적의 핸들 쌍 선택 함수 추가
  const selectOptimalHandles = (sourceNode, targetNode) => {
    const sourcePos = sourceNode.position;
    const targetPos = targetNode.position;

    // 🔥 복합구성용어 자식인 경우 상하 핸들만 사용
    const sourceIsCompositeChild = isCompositeChildNode(sourceNode);
    const targetIsCompositeChild = isCompositeChildNode(targetNode);

    if (sourceIsCompositeChild && targetIsCompositeChild) {
      // 같은 부모의 자식들은 항상 상하 연결
      return {
        sourceHandle: `${sourceNode.id}-bottom-source`,
        targetHandle: `${targetNode.id}-top-target`,
      };
    }

    // 🔥 일반 노드: 상대 위치 기반 핸들 선택
    const dx = targetPos.x - sourcePos.x;
    const dy = targetPos.y - sourcePos.y;

    // 수평/수직 거리 비율
    const horizontalDominant = Math.abs(dx) > Math.abs(dy);

    let sourceHandle, targetHandle;

    if (horizontalDominant) {
      // 수평 배치가 우세
      if (dx > 0) {
        // 타겟이 오른쪽
        sourceHandle = sourceIsCompositeChild
          ? `${sourceNode.id}-bottom-source`
          : `${sourceNode.id}-right-source`;
        targetHandle = targetIsCompositeChild
          ? `${targetNode.id}-top-target`
          : `${targetNode.id}-left-target`;
      } else {
        // 타겟이 왼쪽
        sourceHandle = sourceIsCompositeChild
          ? `${sourceNode.id}-bottom-source`
          : `${sourceNode.id}-left-source`;
        targetHandle = targetIsCompositeChild
          ? `${targetNode.id}-top-target`
          : `${targetNode.id}-right-target`;
      }
    } else {
      // 수직 배치가 우세
      if (dy > 0) {
        // 타겟이 아래쪽
        sourceHandle = `${sourceNode.id}-bottom-source`;
        targetHandle = `${targetNode.id}-top-target`;
      } else {
        // 타겟이 위쪽
        sourceHandle = `${sourceNode.id}-top-source`;
        targetHandle = `${targetNode.id}-bottom-target`;
      }
    }

    return { sourceHandle, targetHandle };
  };

  // 🔥 createAutoEdgesForNode 함수 수정 (availableRelations 추가)
  const createAutoEdgesForNode = (newNode) => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(
      '🔄 자동 엣지 생성 시작:',
      newNode.data.termName,
      `(nodeId: ${newNode.id}, termId: ${newNode.data.termId})`
    );
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const isCompositeChild = isCompositeChildNode(newNode);
    const isCompositeParent =
      newNode.data.termType === 'COMPOSITE' && !newNode.parentNode;

    const getCompositeRelations = (childNode) => {
      if (!childNode.parentNode) return [];
      const parentNode = nodes.value.find((n) => n.id === childNode.parentNode);
      return parentNode?.data?.compositeRelations || [];
    };

    if (isCompositeChild) {
      console.log(
        '📌 복합구성용어의 자식 노드 - 외부 연결 차단, 내부 순차적 연결만 생성'
      );
    } else if (isCompositeParent) {
      console.log('📌 복합구성용어 부모 노드 - 외부 연결 허용');
    }

    if (!newNode.data.relations) {
      console.warn('⚠️ relations 데이터가 없습니다');
      return;
    }

    const { asParent = [], asPassive = [] } = newNode.data.relations;
    const newEdges = [];
    const processedRelations = new Set();

    const colorMap = {
      SIMILAR: '#8b5cf6',
      ASSOCIATION: '#3b82f6',
      COMPOSITION: '#10b981',
      ADDITION: '#f59e0b',
      SUBTRACTION: '#ef4444',
      MULTIPLICATION: '#ec4899',
      DIVISION: '#6366f1',
    };

    // 🔥 [1단계] asParent 처리
    console.log(`\n🔍 [1단계] asParent 처리 (새 노드가 부모)`);
    asParent.forEach((rel, index) => {
      console.log(`\n  [${index + 1}/${asParent.length}]`);
      console.log(`    관계: ${rel.relType}`);
      console.log(`    부모: ${rel.parentTermId}, 자식: ${rel.passiveTermId}`);

      const relationKey = `${rel.parentTermId}-${rel.passiveTermId}-${rel.relType}-${rel.termRelId}`;

      if (processedRelations.has(relationKey)) {
        console.log(`      ⏭️ 이미 처리된 관계 건너뜀`);
        return;
      }

      if (rel.parentTermId === newNode.data.termId) {
        const candidateNodes = nodes.value.filter(
          (n) => n.data.termId === rel.passiveTermId && n.id !== newNode.id
        );

        let targetNode = null;

        if (isCompositeChild) {
          targetNode = candidateNodes.find((node) =>
            areSiblingCompositeChildren(newNode, node)
          );

          if (!targetNode) {
            console.log(`      ⏭️ 복합구성 내부 자식 - 외부 노드와 연결 불가`);
            processedRelations.add(relationKey);
            return;
          }

          const shouldDisplay = shouldDisplayCompositeChildEdge(
            newNode,
            targetNode,
            newNode.data.order,
            targetNode.data.order
          );

          if (!shouldDisplay) {
            console.log(`      ⏭️ 복합구성 내부 순차 연결 아님`);
            processedRelations.add(relationKey);
            return;
          }

          console.log(`      ✅ 복합구성 내부 순차 연결`);

          // 🔥🔥🔥 모든 관계 수집 (핵심 수정)
          const allRelations = [];

          // 1. newNode의 asParent에서 targetNode로 가는 모든 관계
          if (newNode.data.relations?.asParent) {
            const rels = newNode.data.relations.asParent.filter(
              (r) => r.passiveTermId === targetNode.data.termId
            );
            allRelations.push(...rels);
          }

          // 2. targetNode의 asPassive에서 newNode에서 오는 모든 관계
          if (targetNode.data.relations?.asPassive) {
            const rels = targetNode.data.relations.asPassive.filter(
              (r) =>
                r.parentTermId === newNode.data.termId &&
                !allRelations.find((ar) => ar.termRelId === r.termRelId)
            );
            allRelations.push(...rels);
          }

          console.log(
            `    📊 수집된 모든 관계: ${allRelations.length}개`,
            allRelations
          );

          const compositeRelations = getCompositeRelations(newNode);
          const pairCompositeRelations = compositeRelations.filter(
            (compRel) => {
              const hasParentTermId =
                compRel.relationDetail?.parentTermId === newNode.data.termId;
              const hasPassiveTermId =
                compRel.relationDetail?.passiveTermId ===
                targetNode.data.termId;

              return hasParentTermId && hasPassiveTermId;
            }
          );

          const defaultRelation =
            allRelations.find((r) => r.relType === 'COMPOSITION') ||
            allRelations[0] ||
            rel;

          const sourceHandle = `${newNode.id}-bottom-source`;
          const targetHandle = `${targetNode.id}-top-target`;

          const edge = {
            id: `edge-${edgeIdCounter++}`,
            source: newNode.id,
            target: targetNode.id,
            sourceHandle: sourceHandle,
            targetHandle: targetHandle,
            type: 'relationshipEdge',
            animated: false,
            style: {
              stroke: colorMap[defaultRelation.relType] || '#64748b',
              strokeWidth: 2.5,
            },
            data: {
              relationshipId: defaultRelation.termRelId,
              relationshipType: defaultRelation.relType,
              description: defaultRelation.rel_expln || '',
              isBidirectional: false,
              isAutoGenerated: true,
              isCompositeChild: true,
              createdAt: defaultRelation.regDate || new Date().toISOString(),
              sourceNodeName: newNode.data.termName,
              targetNodeName: targetNode.data.termName,
              availableRelations: allRelations, // 🔥🔥🔥 핵심
              termCompositeRelId: defaultRelation.termCompositeRelId,
              compositeId: defaultRelation.compositeId,
              compositeRelations: pairCompositeRelations,
            },
          };

          newEdges.push(edge);
          processedRelations.add(relationKey);
          console.log(
            `      ✅ 엣지 생성 완료 (availableRelations: ${allRelations.length}개)`
          );
        } else {
          const validCandidates = candidateNodes.filter(
            (node) => !isCompositeChildNode(node)
          );

          if (validCandidates.length === 0) {
            console.log(`      ⏭️ 타겟이 모두 복합구성 내부 자식`);
            processedRelations.add(relationKey);
            return;
          }

          targetNode = validCandidates[0];

          if (targetNode) {
            if (rel.relType === 'COMPOSITION') {
              const isComposite = isCompositeRelationship(newNode, targetNode);
              if (isComposite) {
                console.log(`      ⏭️ 복합구성 소속관계 건너뜀`);
                processedRelations.add(relationKey);
                return;
              }
            }

            if (
              !isDuplicateEdge(
                newNode.id,
                targetNode.id,
                rel.relType,
                rel.termRelId
              )
            ) {
              const { sourceHandle, targetHandle } = selectOptimalHandles(
                newNode,
                targetNode
              );

              // 🔥🔥🔥 모든 관계 수집 (일반 노드도 동일)
              const allRelations = [];
              if (newNode.data.relations?.asParent) {
                const rels = newNode.data.relations.asParent.filter(
                  (r) => r.passiveTermId === targetNode.data.termId
                );
                allRelations.push(...rels);
              }

              const edge = {
                id: `edge-${edgeIdCounter++}`,
                source: newNode.id,
                target: targetNode.id,
                sourceHandle: sourceHandle,
                targetHandle: targetHandle,
                type: 'relationshipEdge',
                animated: false,
                style: {
                  stroke: colorMap[rel.relType] || '#64748b',
                  strokeWidth: 2.5,
                },
                data: {
                  relationshipId: rel.termRelId || Date.now(),
                  relationshipType: rel.relType,
                  description: rel.rel_expln || '',
                  isBidirectional: false,
                  isAutoGenerated: true,
                  isCompositeChild: false,
                  createdAt: rel.regDate || new Date().toISOString(),
                  sourceNodeName: newNode.data.termName,
                  targetNodeName: targetNode.data.termName,
                  availableRelations:
                    allRelations.length > 0 ? allRelations : undefined, // 🔥🔥🔥
                  compositeRelations: [],
                },
              };

              newEdges.push(edge);
              processedRelations.add(relationKey);
              console.log(
                `      ✅ 엣지 생성 (availableRelations: ${allRelations.length}개)`
              );
            }
          }
        }
      }
    });

    // 🔥 [2단계] asPassive 처리 (동일한 로직)
    console.log(`\n🔍 [2단계] asPassive 처리 (새 노드가 자식)`);
    asPassive.forEach((rel, index) => {
      console.log(`\n  [${index + 1}/${asPassive.length}]`);
      console.log(`    관계: ${rel.relType}`);
      console.log(`    부모: ${rel.parentTermId}, 자식: ${rel.passiveTermId}`);

      const relationKey = `${rel.parentTermId}-${rel.passiveTermId}-${rel.relType}-${rel.termRelId}`;

      if (processedRelations.has(relationKey)) {
        console.log(`      ⏭️ 이미 처리된 관계 건너뜀`);
        return;
      }

      if (rel.passiveTermId === newNode.data.termId) {
        const candidateNodes = nodes.value.filter(
          (n) => n.data.termId === rel.parentTermId && n.id !== newNode.id
        );

        let sourceNode = null;

        if (isCompositeChild) {
          sourceNode = candidateNodes.find((node) =>
            areSiblingCompositeChildren(node, newNode)
          );

          if (!sourceNode) {
            console.log(`      ⏭️ 복합구성 내부 자식 - 외부 노드와 연결 불가`);
            processedRelations.add(relationKey);
            return;
          }

          const shouldDisplay = shouldDisplayCompositeChildEdge(
            sourceNode,
            newNode,
            sourceNode.data.order,
            newNode.data.order
          );

          if (!shouldDisplay) {
            console.log(`      ⏭️ 복합구성 내부 순차 연결 아님`);
            processedRelations.add(relationKey);
            return;
          }

          console.log(`      ✅ 복합구성 내부 순차 연결`);

          // 🔥🔥🔥 모든 관계 수집
          const allRelations = [];
          if (sourceNode.data.relations?.asParent) {
            const rels = sourceNode.data.relations.asParent.filter(
              (r) => r.passiveTermId === newNode.data.termId
            );
            allRelations.push(...rels);
          }

          if (newNode.data.relations?.asPassive) {
            const rels = newNode.data.relations.asPassive.filter(
              (r) =>
                r.parentTermId === sourceNode.data.termId &&
                !allRelations.find((ar) => ar.termRelId === r.termRelId)
            );
            allRelations.push(...rels);
          }

          console.log(
            `    📊 수집된 모든 관계: ${allRelations.length}개`,
            allRelations
          );

          const compositeRelations = getCompositeRelations(newNode);
          const pairCompositeRelations = compositeRelations.filter(
            (compRel) => {
              const hasParentTermId =
                compRel.relationDetail?.parentTermId === sourceNode.data.termId;
              const hasPassiveTermId =
                compRel.relationDetail?.passiveTermId === newNode.data.termId;

              return hasParentTermId && hasPassiveTermId;
            }
          );

          const defaultRelation =
            allRelations.find((r) => r.relType === 'COMPOSITION') ||
            allRelations[0] ||
            rel;

          const sourceHandle = `${sourceNode.id}-bottom-source`;
          const targetHandle = `${newNode.id}-top-target`;

          const edge = {
            id: `edge-${edgeIdCounter++}`,
            source: sourceNode.id,
            target: newNode.id,
            sourceHandle: sourceHandle,
            targetHandle: targetHandle,
            type: 'relationshipEdge',
            animated: false,
            style: {
              stroke: colorMap[defaultRelation.relType] || '#64748b',
              strokeWidth: 2.5,
            },
            data: {
              relationshipId: defaultRelation.termRelId,
              relationshipType: defaultRelation.relType,
              description: defaultRelation.rel_expln || '',
              isBidirectional: false,
              isAutoGenerated: true,
              isCompositeChild: true,
              createdAt: defaultRelation.regDate || new Date().toISOString(),
              sourceNodeName: sourceNode.data.termName,
              targetNodeName: newNode.data.termName,
              availableRelations: allRelations, // 🔥🔥🔥 핵심
              termCompositeRelId: defaultRelation.termCompositeRelId,
              compositeId: defaultRelation.compositeId,
              compositeRelations: pairCompositeRelations,
            },
          };

          newEdges.push(edge);
          processedRelations.add(relationKey);
          console.log(
            `      ✅ 엣지 생성 완료 (availableRelations: ${allRelations.length}개)`
          );
        } else {
          const validCandidates = candidateNodes.filter(
            (node) => !isCompositeChildNode(node)
          );

          if (validCandidates.length === 0) {
            console.log(`      ⏭️ 소스가 모두 복합구성 내부 자식`);
            processedRelations.add(relationKey);
            return;
          }

          sourceNode = validCandidates[0];

          if (sourceNode) {
            if (rel.relType === 'COMPOSITION') {
              const isComposite = isCompositeRelationship(sourceNode, newNode);
              if (isComposite) {
                console.log(`      ⏭️ 복합구성 소속관계 건너뜀`);
                processedRelations.add(relationKey);
                return;
              }
            }

            if (
              !isDuplicateEdge(
                sourceNode.id,
                newNode.id,
                rel.relType,
                rel.termRelId
              )
            ) {
              const { sourceHandle, targetHandle } = selectOptimalHandles(
                sourceNode,
                newNode
              );

              // 🔥🔥🔥 모든 관계 수집
              const allRelations = [];
              if (sourceNode.data.relations?.asParent) {
                const rels = sourceNode.data.relations.asParent.filter(
                  (r) => r.passiveTermId === newNode.data.termId
                );
                allRelations.push(...rels);
              }

              const edge = {
                id: `edge-${edgeIdCounter++}`,
                source: sourceNode.id,
                target: newNode.id,
                sourceHandle: sourceHandle,
                targetHandle: targetHandle,
                type: 'relationshipEdge',
                animated: false,
                style: {
                  stroke: colorMap[rel.relType] || '#64748b',
                  strokeWidth: 2.5,
                },
                data: {
                  relationshipId: rel.termRelId || Date.now(),
                  relationshipType: rel.relType,
                  description: rel.rel_expln || '',
                  isBidirectional: false,
                  isAutoGenerated: true,
                  isCompositeChild: false,
                  createdAt: rel.regDate || new Date().toISOString(),
                  sourceNodeName: sourceNode.data.termName,
                  targetNodeName: newNode.data.termName,
                  availableRelations:
                    allRelations.length > 0 ? allRelations : undefined, // 🔥🔥🔥
                  compositeRelations: [],
                },
              };

              newEdges.push(edge);
              processedRelations.add(relationKey);
              console.log(
                `      ✅ 엣지 생성 (availableRelations: ${allRelations.length}개)`
              );
            }
          }
        }
      }
    });

    console.log(`\n📊 [결과] 총 ${newEdges.length}개의 엣지 생성됨`);

    if (newEdges.length > 0) {
      edges.value.push(...newEdges);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  };

  // 🔥 복합구성 관계인지 확인하는 함수 추가
  const isCompositeRelationship = (sourceNode, targetNode) => {
    // 🔥 소스 노드가 복합구성용어이고, 타겟이 그 자식인 경우
    if (
      sourceNode.data.termType === 'COMPOSITE' &&
      targetNode.parentNode === sourceNode.id
    ) {
      return true;
    }

    // 🔥 타겟 노드가 복합구성용어이고, 소스가 그 자식인 경우
    if (
      targetNode.data.termType === 'COMPOSITE' &&
      sourceNode.parentNode === targetNode.id
    ) {
      return true;
    }

    return false;
  };

  // 🔥 관계 삭제 핸들러 추가
  const handleDeleteRelationship = (relationship) => {
    console.log('🗑️ 관계 삭제 요청:', relationship);

    // edges 배열에서 해당 관계 제거
    const index = edges.value.findIndex((edge) => edge.id === relationship.id);

    if (index !== -1) {
      edges.value.splice(index, 1);
      console.log(`✅ 관계 삭제 완료: ${relationship.id}`);

      // 엣지 갱신
      nextTick(() => {
        refreshEdges();
      });

      // 사이드바 업데이트 (선택된 항목이 노드인 경우)
      if (selectedItem.value && selectedItem.value.type === 'node') {
        // 관계 목록이 갱신되도록 강제 업데이트
        const currentNode = selectedItem.value;
        selectedItem.value = null;
        nextTick(() => {
          selectedItem.value = currentNode;
        });
      }
    } else {
      console.warn('⚠️ 삭제할 관계를 찾을 수 없습니다:', relationship.id);
    }
  };

  // 🔥 엣지 삭제 핸들러 추가
  const handleDeleteEdge = (edge) => {
    console.log('🗑️ 엣지 삭제 요청:', edge);

    // edges 배열에서 해당 엣지 제거
    const index = edges.value.findIndex((e) => e.id === edge.id);

    if (index !== -1) {
      edges.value.splice(index, 1);
      console.log(`✅ 엣지 삭제 완료: ${edge.id}`);

      // 엣지 갱신
      nextTick(() => {
        refreshEdges();
      });

      // 선택 해제
      selectedItem.value = null;
    } else {
      console.warn('⚠️ 삭제할 엣지를 찾을 수 없습니다:', edge.id);
    }
  };

  // 🔥 엣지 생성 헬퍼 함수
  const createEdge = (sourceNode, targetNode, relationData, color) => {
    return {
      id: `edge-${edgeIdCounter++}`,
      source: sourceNode.id,
      target: targetNode.id,
      type: 'relationshipEdge',
      animated: false,
      style: {
        stroke: color,
        strokeWidth: 2.5,
      },
      data: {
        relationshipId: relationData.termRelId || Date.now(),
        relationshipType: relationData.relType,
        description: relationData.rel_expln || '',
        isBidirectional: false,
        isAutoGenerated: true,
        createdAt: relationData.regDate || new Date().toISOString(),
        sourceNodeName: sourceNode.data.termName,
        targetNodeName: targetNode.data.termName,
      },
    };
  };

  // 🔥 중복 엣지 체크 함수 개선 (relationshipId도 함께 확인)
  const isDuplicateEdge = (
    sourceId,
    targetId,
    relationType,
    relationshipId = null
  ) => {
    return edges.value.some((edge) => {
      // 동일한 source, target, relationshipType
      const isSameConnection =
        edge.source === sourceId &&
        edge.target === targetId &&
        edge.data.relationshipType === relationType;

      // relationshipId가 있으면 추가 확인
      if (relationshipId) {
        return isSameConnection && edge.data.relationshipId === relationshipId;
      }

      return isSameConnection;
    });
  };

  // 🔥 모든 노드 간 관계 초기화 함수
  const reinitializeAllEdges = () => {
    console.log('\n🔄 전체 엣지 초기화 시작...');

    // 기존 자동 생성된 엣지만 삭제 (수동 생성 엣지는 유지)
    edges.value = edges.value.filter((edge) => !edge.data.isAutoGenerated);

    console.log('✅ 기존 자동 엣지 삭제 완료');

    // 모든 노드에 대해 자동 엣지 재생성
    const allNodes = [...nodes.value];

    allNodes.forEach((node, index) => {
      console.log(
        `\n[${index + 1}/${allNodes.length}] ${node.data.termName} 처리 중...`
      );
      createAutoEdgesForNode(node);
    });

    console.log('\n✅ 전체 엣지 초기화 완료\n');
  };

  // 🔥 노드 클릭 이벤트 (수정)
  const handleNodeClick = (event) => {
    console.log('노드 클릭 이벤트:', event); // 디버깅용

    const clickedNode = nodes.value.find((n) => n.id === event.node.id);

    if (clickedNode) {
      console.log('선택된 노드:', clickedNode); // 디버깅용

      selectedItem.value = {
        type: 'node',
        id: clickedNode.id,
        data: clickedNode.data,
        parentNode: clickedNode.parentNode,
        position: clickedNode.position,
        style: clickedNode.style,
      };

      console.log('selectedItem 설정됨:', selectedItem.value); // 디버깅용

      // 🔥 다음 틱에서 사이드바 열기
      nextTick(() => {
        if (sidebarRef.value) {
          sidebarRef.value.openSidebar();
          console.log('사이드바 열림'); // 디버깅용
        } else {
          console.error('sidebarRef가 없습니다'); // 디버깅용
        }
      });
    }
  };

  const handleEdgeClick = (event) => {
    console.log('🔗 BizMetaPanel 엣지 클릭:', event);

    // 연결 모드 중에는 엣지 클릭 무시
    if (connectingState.isConnecting) {
      console.log('⏭️ 연결 모드 중 - 엣지 클릭 무시');
      return;
    }

    // 🔥 이벤트에서 엣지 정보 추출 (event.edge 우선)
    let clickedEdge = null;

    if (event.edge) {
      // RelationshipEdge에서 전달된 경우
      clickedEdge = event.edge;
    } else {
      // Vue Flow 기본 이벤트인 경우
      const edgeId = event.edge?.id || event.id;
      clickedEdge = edges.value.find((e) => e.id === edgeId);
    }

    if (clickedEdge) {
      console.log('✅ 선택된 엣지:', clickedEdge);

      selectedItem.value = {
        type: 'edge',
        id: clickedEdge.id,
        source: clickedEdge.source,
        target: clickedEdge.target,
        data: clickedEdge.data,
        sourceHandle: clickedEdge.sourceHandle,
        targetHandle: clickedEdge.targetHandle,
        style: clickedEdge.style,
      };

      nextTick(() => {
        if (sidebarRef.value) {
          console.log('📂 사이드바 열기');
          sidebarRef.value.openSidebar();
        } else {
          console.error('❌ sidebarRef 없음');
        }
      });
    } else {
      console.warn('⚠️ 엣지를 찾을 수 없음:', event);
    }
  };

  // 🔥 사이드바 닫기 (수정)
  const handleSidebarClose = () => {
    console.log('사이드바 닫기'); // 디버깅용
    selectedItem.value = null;
  };

  // 🔥 복합구성요소간 관계 변경 핸들러 (수정)
  const handleSelectCompositeRelation = async (updateResult) => {
    console.log('🔄 BizMetaPanel - 복합구성요소간 관계 선택:', updateResult);

    const { compositeId } = updateResult[0];

    const newCompositeRelations = await getNewCompositeRelations(compositeId);

    console.log('🔥 최신 compositeRelations 가져옴:', newCompositeRelations);

    // 🔥 부모 노드 찾기
    const parentNode = nodes.value.find(
      (n) =>
        n.data.termType === 'COMPOSITE' &&
        String(n.data.termId) === String(compositeId)
    );

    if (!parentNode) {
      console.error('❌ 부모 노드를 찾을 수 없습니다:', compositeId);
      return;
    }

    console.log('✅ 부모 노드 찾음:', parentNode.data.termName);

    // 🔥 부모 노드의 compositeRelations 업데이트
    parentNode.data.compositeRelations = updateResult;

    console.log('🔥 업데이트된 compositeRelations:', updateResult);

    // 🔥 순차적 소속관계 재구성 (업데이트된 compositeRelations 전달)
    await reconstructSequentialCompositionEdges(
      parentNode.id,
      newCompositeRelations
    );

    console.log('✅ 관계 변경 완료');
  };

  // 🔥 관계 선택 핸들러
  const handleSelectRelation = (relation) => {
    console.log('🔄 BizMetaPanel - 관계 선택:', relation);

    const { edgeId } = relationSelectionData.value;
    const edge = edges.value.find((e) => e.id === edgeId);

    if (!edge) {
      console.error('❌ 엣지를 찾을 수 없습니다:', edgeId);
      return;
    }

    // 🔥 엣지 데이터 업데이트
    edge.data.relationshipId = relation.termRelId;
    edge.data.relationshipType = relation.relType;
    edge.data.description = relation.rel_expln;

    // 🔥 색상 변경
    const colorMap = {
      COMPOSITION: '#10b981',
      SIMILAR: '#8b5cf6',
      ASSOCIATION: '#3b82f6',
      ADDITION: '#f59e0b',
      SUBTRACTION: '#ef4444',
      MULTIPLICATION: '#ec4899',
      DIVISION: '#6366f1',
    };

    edge.style = {
      ...edge.style,
      stroke: colorMap[relation.relType] || '#64748b',
    };

    console.log('✅ 엣지 업데이트 완료:', edge);

    // 엣지 갱신
    nextTick(() => {
      refreshEdges();
    });

    // 저장 상태 업데이트
    setIsUpdate(true);
  };

  // 🔥 관계 선택 (수정)
  const handleSelectRelationship = (rel) => {
    console.log('관계 선택:', rel); // 디버깅용

    const selectedEdge = edges.value.find((e) => e.id === rel.id);

    if (selectedEdge) {
      selectedItem.value = {
        type: 'edge',
        id: selectedEdge.id,
        source: selectedEdge.source,
        target: selectedEdge.target,
        data: selectedEdge.data,
        sourceHandle: selectedEdge.sourceHandle,
        targetHandle: selectedEdge.targetHandle,
      };

      console.log('관계 선택 - selectedItem:', selectedItem.value); // 디버깅용
    }
  };

  // 🔥 자식 노드 레이아웃 상수 (수정)
  const CHILD_LAYOUT = {
    headerHeight: 150, // 🔥 타이틀 영역 높이
    childHeight: 120,
    childGap: 80,
    rightPadding: 20,
    horizontalPadding: 40,
    childWidth: 360,
    bottomPadding: 20,
  };

  // 🔥 노드 깊이(depth) 계산 함수
  const getNodeDepth = (nodeId) => {
    let depth = 0;
    let currentNode = nodes.value.find((n) => n.id === nodeId);

    while (currentNode && currentNode.parentNode) {
      depth++;
      currentNode = nodes.value.find((n) => n.id === currentNode.parentNode);

      // 무한 루프 방지
      if (depth > 10) break;
    }

    return depth;
  };

  // 🔥 최상위 부모 노드인지 확인
  const isTopLevelParent = (nodeId) => {
    const node = nodes.value.find((n) => n.id === nodeId);
    if (!node) return false;

    // 자식이 있고, 부모가 없으면 최상위 부모
    return node.data.isParent && !node.parentNode;
  };

  // 🔥 중첩된 부모 노드인지 확인 (부모이면서 다른 부모의 자식)
  const isNestedParent = (nodeId) => {
    const node = nodes.value.find((n) => n.id === nodeId);
    if (!node) return false;

    // 자식이 있고, 부모도 있으면 중첩 부모
    return node.data.isParent && !!node.parentNode;
  };

  // 🔥 자식 노드 드래그 시작
  const handleNodeDragStart = (event) => {
    console.log('노드 드래그 시작:', event);
    const draggedNode = event.node;

    if (draggedNode.parentNode) {
      draggingChildState.isDragging = true;
      draggingChildState.childId = draggedNode.id;
      draggingChildState.parentId = draggedNode.parentNode;
      draggingChildState.originalOrder = draggedNode.data.order;
      console.log('자식 노드 순서 변경 모드 시작:', draggingChildState);
    } else {
      isDraggingForNesting.value = true;
    }
  };

  // 🔥 자식 노드 드래그 중
  const handleNodeDrag = (event) => {
    if (!draggingChildState.isDragging) return;

    const draggedNode = event.node;
    const parentNode = nodes.value.find(
      (n) => n.id === draggingChildState.parentId
    );

    if (!parentNode) return;

    const siblings = nodes.value
      .filter(
        (n) =>
          n.parentNode === draggingChildState.parentId &&
          n.id !== draggedNode.id
      )
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0));

    const dragY = draggedNode.position.y;
    const newOrder = Math.max(
      1,
      Math.min(
        siblings.length + 1,
        Math.round(
          (dragY - CHILD_LAYOUT.headerHeight + CHILD_LAYOUT.childHeight / 2) /
            (CHILD_LAYOUT.childHeight + CHILD_LAYOUT.childGap)
        ) + 1
      )
    );

    console.log(`드래그 중 예상 순서: ${newOrder}`);
  };

  // 🔥 노드 순서 변경 데이터 준비 함수
  const prepareOrderChangeData = (
    parentId,
    movedChildId,
    oldOrder,
    newOrder
  ) => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 순서 변경 데이터 준비');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const parentNode = nodes.value.find((n) => n.id === parentId);
    if (!parentNode) {
      console.error('❌ 부모 노드를 찾을 수 없습니다:', parentId);
      return null;
    }

    const children = nodes.value
      .filter((n) => n.parentNode === parentId && !n.hidden)
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0));

    console.log(
      `📋 부모 노드: ${parentNode.data.termName} (termId: ${parentNode.data.termId})`
    );
    console.log(`📋 전체 자식 수: ${children.length}개`);
    console.log(`🔄 이동 노드 ID: ${movedChildId}`);
    console.log(`🔄 기존 순서: ${oldOrder} → 새 순서: ${newOrder}`);

    // 🔥 API 전달 데이터 구조
    const orderChangeData = {
      compositeId: parentNode.data.termId,
      compositeTermName: parentNode.data.termName,
      movedChild: {
        childId: null,
        termId: null,
        termName: null,
        oldOrder: oldOrder,
        newOrder: newOrder,
      },
      affectedChildren: [],
      allChildrenOrder: [],
    };

    // 🔥 이동한 자식 정보
    const movedChild = children.find((c) => c.id === movedChildId);
    if (movedChild) {
      orderChangeData.movedChild.childId = movedChild.id;
      orderChangeData.movedChild.termId = movedChild.data.termId;
      orderChangeData.movedChild.termName = movedChild.data.termName;

      console.log(`\n✅ 이동 노드: ${movedChild.data.termName}`);
      console.log(`   termId: ${movedChild.data.termId}`);
    }

    // 🔥 영향받는 자식들 (순서가 변경된 노드들)
    children.forEach((child) => {
      console.log('검토 중인 자식 노드:', {
        termName: child.data.termName,
        termId: child.data.termId,
        compositeId: child.data.compositeId,
        termRelId: child.data.termRelId,
        order: child.data.order,
      });

      if (child.id === movedChildId) return;

      let isAffected = false;
      let orderChange = null;

      if (oldOrder < newOrder) {
        if (child.data.order > oldOrder && child.data.order <= newOrder) {
          isAffected = true;
          orderChange = {
            from: child.data.order,
            to: child.data.order - 1,
          };
        }
      } else if (oldOrder > newOrder) {
        if (child.data.order >= newOrder && child.data.order < oldOrder) {
          isAffected = true;
          orderChange = {
            from: child.data.order,
            to: child.data.order + 1,
          };
        }
      }

      if (isAffected) {
        orderChangeData.affectedChildren.push({
          childId: child.id,
          termId: child.data.termId,
          termName: child.data.termName,
          compositeId: child.data.compositeId,
          termRelId: child.data.termRelId,
          orderChange: orderChange,
        });
      }

      // 🔥 전체 자식 순서 (compositeId와 termRelId 포함)
      orderChangeData.allChildrenOrder.push({
        childId: child.id,
        termId: child.data.termId,
        termName: child.data.termName,
        compositeId: child.data.compositeId, // 🔥 추가
        termRelId: child.data.termRelId, // 🔥 추가
        sortOrder: child.data.order,
      });
    });

    // 🔥 이동한 노드도 전체 순서에 추가 (compositeId와 termRelId 포함)
    if (movedChild) {
      orderChangeData.allChildrenOrder.push({
        childId: movedChild.id,
        termId: movedChild.data.termId,
        termName: movedChild.data.termName,
        compositeId: movedChild.data.compositeId, // 🔥 추가
        termRelId: movedChild.data.termRelId, // 🔥 추가
        sortOrder: movedChild.data.order,
      });
    }

    // 🔥 sortOrder 기준으로 정렬
    orderChangeData.allChildrenOrder.sort((a, b) => a.sortOrder - b.sortOrder);

    console.log(
      `\n📊 영향받는 자식: ${orderChangeData.affectedChildren.length}개`
    );
    orderChangeData.affectedChildren.forEach((child, idx) => {
      console.log(
        `  ${idx + 1}. ${child.termName}: ${child.orderChange.from} → ${
          child.orderChange.to
        } (compositeId: ${child.compositeId}, termRelId: ${child.termRelId})`
      );
    });

    console.log(
      `\n📊 최종 순서 (${orderChangeData.allChildrenOrder.length}개):`
    );
    orderChangeData.allChildrenOrder.forEach((child, idx) => {
      console.log(
        `  ${idx + 1}. ${child.termName} (sortOrder: ${
          child.sortOrder
        }, compositeId: ${child.compositeId}, termRelId: ${child.termRelId})`
      );
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return orderChangeData;
  };

  // 🔥 API 호출 함수 (예시)
  // const updateChildrenOrder = async (orderChangeData) => {
  //   try {
  //     console.log('📡 순서 변경 API 호출:', orderChangeData);

  //     // 🔥 API 호출 (구현 필요)
  //     // const response = await updateBizTermCompositeOrder(orderChangeData);

  //     // 🔥 임시: 콘솔에 출력
  //     console.log(
  //       '📤 API 전송 데이터:',
  //       JSON.stringify(orderChangeData, null, 2)
  //     );

  //     // setIsUpdate(true);

  //     return {
  //       success: true,
  //       message: '순서가 성공적으로 변경되었습니다.',
  //     };
  //   } catch (error) {
  //     console.error('❌ 순서 변경 API 오류:', error);
  //     throw error;
  //   }
  // };

  // 🔥 노드 드래그 종료
  const handleNodeDragStop = async (event) => {
    console.log('노드 드래그 종료:', event);

    const draggedNode = event.node;
    const draggedNodeId = draggedNode.id;

    // 🔥 자식 노드 순서 변경
    if (draggingChildState.isDragging) {
      const parentNode = nodes.value.find(
        (n) => n.id === draggingChildState.parentId
      );

      if (parentNode) {
        const dragY = draggedNode.position.y;
        const siblings = nodes.value
          .filter(
            (n) =>
              n.parentNode === draggingChildState.parentId &&
              n.id !== draggedNode.id
          )
          .sort((a, b) => (a.data.order || 0) - (b.data.order || 0));

        let newOrder = Math.max(
          1,
          Math.min(
            siblings.length + 1,
            Math.round(
              (dragY -
                CHILD_LAYOUT.headerHeight +
                CHILD_LAYOUT.childHeight / 2) /
                (CHILD_LAYOUT.childHeight + CHILD_LAYOUT.childGap)
            ) + 1
          )
        );

        console.log(
          `자식 노드 순서 변경: ${draggingChildState.originalOrder} → ${newOrder}`
        );

        // 🔥 순서가 변경된 경우에만 재구성
        if (draggingChildState.originalOrder !== newOrder) {
          await reorderChildren(
            draggingChildState.parentId,
            draggedNodeId,
            newOrder
          );
        } else {
          console.log('ℹ️ 순서가 변경되지 않았습니다 - 재구성 생략');
        }
      }

      draggingChildState.isDragging = false;
      draggingChildState.childId = null;
      draggingChildState.parentId = null;
      draggingChildState.originalOrder = null;

      return;
    }

    // 🔥 부모가 있는 노드의 위치 재조정
    if (draggedNode.parentNode) {
      const parentNode = nodes.value.find(
        (n) => n.id === draggedNode.parentNode
      );
      if (parentNode) {
        updateParentStyle(parentNode);
      }
      isDraggingForNesting.value = false;
      return;
    }

    // 🔥 다른 노드 위에 드롭하여 부모-자식 관계 생성
    const elements = document.elementsFromPoint(
      event.event.clientX,
      event.event.clientY
    );

    for (const element of elements) {
      const nodeElement = element.closest('.vue-flow__node');
      if (nodeElement) {
        const targetNodeId = nodeElement.getAttribute('data-id');

        if (targetNodeId && targetNodeId !== draggedNodeId) {
          const targetNode = nodes.value.find((n) => n.id === targetNodeId);

          if (targetNode) {
            // 순환 참조 체크
            if (isDescendant(targetNodeId, draggedNodeId)) {
              alert('순환 참조는 허용되지 않습니다.');
              refreshEdges();
              isDraggingForNesting.value = false;
              return;
            }

            // 🔥 타겟 노드가 자식 노드인 경우 상위 부모로 리다이렉트
            if (targetNode.parentNode) {
              const topLevelParent = findTopLevelParent(targetNodeId);
              if (topLevelParent) {
                console.log(
                  `자식 노드 감지: ${targetNode.data.termName}, 상위 부모로 이동: ${topLevelParent.data.termName}`
                );
                setParentChild(draggedNodeId, topLevelParent.id);
                isDraggingForNesting.value = false;
                return;
              }
            }

            // 🔥 최상위 부모 노드에만 자식 추가 허용
            if (!targetNode.parentNode && !targetNode.data.isParent) {
              // 일반 최상위 노드
              setParentChild(draggedNodeId, targetNodeId);
              isDraggingForNesting.value = false;
              return;
            } else if (
              !targetNode.parentNode &&
              targetNode.data.isTopLevelParent
            ) {
              // 최상위 부모 노드
              setParentChild(draggedNodeId, targetNodeId);
              isDraggingForNesting.value = false;
              return;
            }
          }
        }
      }
    }

    isDraggingForNesting.value = false;
    refreshEdges();
  };

  // 🔥 최상위 부모 노드 찾기
  const findTopLevelParent = (nodeId) => {
    let currentNode = nodes.value.find((n) => n.id === nodeId);
    let depth = 0;

    while (currentNode && currentNode.parentNode) {
      currentNode = nodes.value.find((n) => n.id === currentNode.parentNode);
      depth++;

      // 무한 루프 방지
      if (depth > 10) break;
    }

    return currentNode;
  };

  // 🔥 자식 노드 순서 재정렬 (수정)
  const reorderChildren = async (parentId, movedChildId, newOrder) => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔀 자식 노드 순서 재정렬 시작');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const children = nodes.value
      .filter((n) => n.parentNode === parentId)
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0));

    const movedChild = children.find((c) => c.id === movedChildId);
    const oldOrder = movedChild.data.order;

    console.log(`📋 이동 노드: ${movedChild.data.termName}`);
    console.log(`  기존 순번: ${oldOrder}`);
    console.log(`  새 순번: ${newOrder}`);
    console.log(
      `\n📊 변경 전 순서: ${children
        .map((c) => `${c.data.order}. ${c.data.termName}`)
        .join(' → ')}`
    );

    // 🔥 순서 변경 데이터 준비 (API 전송용)
    const orderChangeData = prepareOrderChangeData(
      parentId,
      movedChildId,
      oldOrder,
      newOrder
    );

    // 순서 변경
    children.forEach((child) => {
      if (child.id === movedChildId) {
        child.data.order = newOrder;
      } else if (oldOrder < newOrder) {
        // 아래로 이동: 중간 노드들을 위로 당김
        if (child.data.order > oldOrder && child.data.order <= newOrder) {
          child.data.order -= 1;
        }
      } else if (oldOrder > newOrder) {
        // 위로 이동: 중간 노드들을 아래로 밀어냄
        if (child.data.order >= newOrder && child.data.order < oldOrder) {
          child.data.order += 1;
        }
      }
    });

    console.log(
      `\n📊 변경 후 순서: ${children
        .sort((a, b) => (a.data.order || 0) - (b.data.order || 0))
        .map((c) => `${c.data.order}. ${c.data.termName}`)
        .join(' → ')}`
    );

    // 부모 스타일 업데이트
    const parentNode = nodes.value.find((n) => n.id === parentId);
    if (parentNode) {
      updateParentStyle(parentNode);
    }

    // 🔥 API 호출
    if (orderChangeData) {
      try {
        await updateChildrenOrder(orderChangeData);
        console.log('✅ 순서 변경 API 호출 완료');
      } catch (error) {
        console.error('❌ 순서 변경 API 호출 실패:', error);
        alert('순서 변경 중 오류가 발생했습니다.');
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 🔥🔥🔥 순서 변경 후 최신 compositeRelations 가져오기
    console.log('\n📡 최신 compositeRelations 조회 중...');

    let latestCompositeRelations = null;

    try {
      latestCompositeRelations = await getNewCompositeRelations(
        parentNode.data.termId
      );

      console.log(
        '✅ 최신 compositeRelations 조회 완료:',
        latestCompositeRelations?.length || 0,
        '개'
      );

      // 🔥 부모 노드의 compositeRelations 업데이트
      if (latestCompositeRelations && latestCompositeRelations.length > 0) {
        parentNode.data.compositeRelations = latestCompositeRelations;
        console.log('✅ 부모 노드 compositeRelations 업데이트 완료');
      }
    } catch (error) {
      console.error('❌ compositeRelations 조회 실패:', error);
      latestCompositeRelations = parentNode.data.compositeRelations || [];
    }

    // 🔥 순차적 소속관계 재구성 (최신 compositeRelations 전달)
    await reconstructSequentialCompositionEdges(
      parentId,
      latestCompositeRelations
    );
  };

  // 🔥 복합구성용어 자식 노드의 순차적 소속관계 재구성
  const reconstructSequentialCompositionEdges = async (
    parentId,
    newCompositeRelations = null // 🔥 newCompositeRelations 매개변수
  ) => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 순차적 소속관계 재구성 시작');
    if (newCompositeRelations) {
      console.log(
        '🔥 newCompositeRelations 전달됨:',
        newCompositeRelations.length,
        '개'
      );
      console.log('🔥 newCompositeRelations 데이터:', newCompositeRelations);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const parentNode = nodes.value.find((n) => n.id === parentId);
    if (!parentNode) {
      console.error('❌ 부모 노드를 찾을 수 없습니다:', parentId);
      return;
    }

    // 🔥 자식 노드들을 order 순으로 정렬 (먼저 가져오기)
    const children = nodes.value
      .filter((n) => n.parentNode === parentId && !n.hidden)
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0));

    if (children.length === 0) {
      console.log('ℹ️ 자식 노드가 없습니다');
      return;
    }

    console.log(
      `📋 부모: ${parentNode.data.termName}, 자식 수: ${children.length}개`
    );
    console.log(
      '📊 현재 순서:',
      children.map((c) => `${c.data.order}. ${c.data.termName}`).join(' → ')
    );

    // 🔥🔥🔥 부모 노드의 compositeRelations 업데이트 (완전한 relationDetail 포함)
    if (newCompositeRelations && newCompositeRelations.length > 0) {
      console.log('\n🔧 compositeRelations 업데이트 시작...');

      // 🔥 relationDetail 완전 바인딩
      const updatedCompositeRelations = newCompositeRelations.map(
        (rel, index) => {
          console.log(
            `\n  [${index + 1}/${
              newCompositeRelations.length
            }] compositeRelId: ${rel.compositeRelId}`
          );

          // 이미 완전한 relationDetail이 있으면 그대로 반환
          if (
            rel.relationDetail?.parentTermId &&
            rel.relationDetail?.passiveTermId
          ) {
            console.log(
              '    ✅ 완전한 relationDetail 존재:',
              rel.relationDetail
            );
            return rel;
          }

          // 🔥 relationDetail이 불완전하거나 없는 경우 재구성
          console.log('    🔧 relationDetail 재구성 필요');

          // 🔥 compositeTermOrder로 자식 노드 쌍 찾기
          const orderIndex = parseInt(rel.compositeTermOrder) - 1;

          if (orderIndex >= 0 && orderIndex < children.length - 1) {
            const sourceChild = children[orderIndex];
            const targetChild = children[orderIndex + 1];

            console.log(`    📍 자식 노드 쌍 찾음:`);
            console.log(
              `      소스: ${sourceChild.data.termName} (termId: ${sourceChild.data.termId})`
            );
            console.log(
              `      타겟: ${targetChild.data.termName} (termId: ${targetChild.data.termId})`
            );

            // 🔥 sourceChild의 relations에서 해당 관계 찾기
            let relDetail = null;

            const foundRelation = sourceChild.data.relations?.asParent?.find(
              (r) =>
                r.passiveTermId === targetChild.data.termId &&
                String(r.termRelId) === String(rel.compositeRelId)
            );

            if (foundRelation) {
              console.log(
                '    ✅ relations에서 관계 정보 찾음:',
                foundRelation
              );
              relDetail = {
                termRelId: foundRelation.termRelId,
                parentTermId: foundRelation.parentTermId,
                passiveTermId: foundRelation.passiveTermId,
                relType: foundRelation.relType,
                rel_expln: foundRelation.rel_expln,
              };
            } else {
              // 🔥 relations에 없으면 기본값 생성
              console.log('    ⚠️ relations에서 찾을 수 없음 - 기본값 생성');
              relDetail = {
                termRelId: rel.compositeRelId,
                parentTermId: sourceChild.data.termId,
                passiveTermId: targetChild.data.termId,
                relType: 'COMPOSITION',
                rel_expln: `${sourceChild.data.termName}과 ${targetChild.data.termName}는 순차적 소속관계입니다.`,
              };
            }

            console.log('    ✅ 최종 relationDetail:', relDetail);

            return {
              ...rel,
              relationDetail: relDetail,
            };
          } else {
            console.warn(
              `    ⚠️ compositeTermOrder(${rel.compositeTermOrder})에 해당하는 자식 쌍을 찾을 수 없습니다`
            );

            // 기본 relationDetail 생성
            return {
              ...rel,
              relationDetail: {
                termRelId: rel.compositeRelId,
                parentTermId: null,
                passiveTermId: null,
                relType: 'COMPOSITION',
              },
            };
          }
        }
      );

      console.log(
        '\n🔥 부모 노드 compositeRelations 업데이트 전:',
        parentNode.data.compositeRelations
      );

      parentNode.data.compositeRelations = updatedCompositeRelations;

      console.log(
        '🔥 부모 노드 compositeRelations 업데이트 완료:',
        updatedCompositeRelations
      );
      console.log('\n✅ compositeRelations 업데이트 완료\n');
    }

    // 🔥 부모 노드의 compositeRelations 가져오기
    const getCompositeRelations = (childNode) => {
      // 🔥 1순위: 업데이트된 부모 노드의 compositeRelations
      if (!childNode.parentNode) return [];

      const childParentNode = nodes.value.find(
        (n) => n.id === childNode.parentNode
      );

      return childParentNode?.data?.compositeRelations || [];
    };

    // 🔥 1단계: 기존 복합구성용어 내부 순차 소속관계 엣지만 제거 (UI에서만)
    const edgesToRemove = [];

    children.forEach((child) => {
      const relatedEdges = edges.value.filter(
        (edge) =>
          (edge.source === child.id || edge.target === child.id) &&
          edge.data.isCompositeChild === true &&
          edge.data.isAutoGenerated === true &&
          (() => {
            const sourceNode = nodes.value.find((n) => n.id === edge.source);
            const targetNode = nodes.value.find((n) => n.id === edge.target);
            return (
              sourceNode &&
              targetNode &&
              sourceNode.parentNode === parentId &&
              targetNode.parentNode === parentId
            );
          })()
      );

      edgesToRemove.push(...relatedEdges);
    });

    // 중복 제거
    const uniqueEdgesToRemove = [
      ...new Map(edgesToRemove.map((e) => [e.id, e])).values(),
    ];

    console.log(
      `\n🗑️ 기존 순차 소속관계 엣지 제거: ${uniqueEdgesToRemove.length}개`
    );

    // UI에서 엣지 제거
    edges.value = edges.value.filter(
      (edge) => !uniqueEdgesToRemove.find((e) => e.id === edge.id)
    );

    // 🔥 2단계: 기존 관계 데이터는 유지 (relations 객체에 보존)
    console.log(
      '\nℹ️ 기존 관계 데이터는 각 노드의 relations 객체에 보존됩니다'
    );

    // 🔥 3단계: 새로운 순차적 소속관계 생성
    console.log('\n➕ 새로운 순차적 소속관계 생성 시작');

    const colorMap = {
      COMPOSITION: '#10b981',
      SIMILAR: '#8b5cf6',
      ASSOCIATION: '#3b82f6',
      ADDITION: '#f59e0b',
      SUBTRACTION: '#ef4444',
      MULTIPLICATION: '#ec4899',
      DIVISION: '#6366f1',
    };

    for (let i = 0; i < children.length - 1; i++) {
      const sourceChild = children[i];
      const targetChild = children[i + 1];

      console.log(
        `\n  [${i + 1}/${children.length - 1}] ${
          sourceChild.data.termName
        } (순번 ${sourceChild.data.order}) → ${
          targetChild.data.termName
        } (순번 ${targetChild.data.order})`
      );

      // 🔥 두 노드 간 모든 관계 수집
      const allRelations = [];

      // sourceChild가 부모인 관계
      if (sourceChild.data.relations?.asParent) {
        const rels = sourceChild.data.relations.asParent.filter(
          (r) => r.passiveTermId === targetChild.data.termId
        );
        allRelations.push(...rels);
      }

      console.log(`    📊 기존 관계 수: ${allRelations.length}개`);

      // 🔥 compositeRelations 가져오기 (업데이트된 것 우선 사용)
      const compositeRelations = getCompositeRelations(sourceChild);

      console.log('📋 사용할 compositeRelations:', compositeRelations);

      // 🔥 이 source-target 쌍의 compositeRelations 필터링
      const pairCompositeRelations = compositeRelations.filter((compRel) => {
        const hasParentTermId =
          compRel.relationDetail?.parentTermId === sourceChild.data.termId;
        const hasPassiveTermId =
          compRel.relationDetail?.passiveTermId === targetChild.data.termId;

        console.log(
          `    🔍 필터링 중: compositeRelId=${compRel.compositeRelId}`
        );
        console.log(
          `      parentTermId 일치: ${hasParentTermId} (${compRel.relationDetail?.parentTermId} === ${sourceChild.data.termId})`
        );
        console.log(
          `      passiveTermId 일치: ${hasPassiveTermId} (${compRel.relationDetail?.passiveTermId} === ${targetChild.data.termId})`
        );

        return hasParentTermId && hasPassiveTermId;
      });

      console.log(
        `    🔗 pairCompositeRelations: ${pairCompositeRelations.length}개`,
        pairCompositeRelations
      );

      // 🔥🔥🔥 pairCompositeRelations가 없으면 순서가 바뀐 것 - 재구성 필요
      if (pairCompositeRelations.length === 0) {
        console.log(
          '    ⚠️ pairCompositeRelations 없음 - compositeTermOrder로 재구성'
        );

        const matchedCompRel = compositeRelations.find(
          (compRel) =>
            parseInt(compRel.compositeTermOrder) === sourceChild.data.order
        );

        if (matchedCompRel && matchedCompRel.relationDetail) {
          console.log('    ✅ compositeTermOrder로 관계 찾음:', matchedCompRel);
          pairCompositeRelations.push(matchedCompRel);
        }
      }

      // 🔥 Handle 지정 (복합구성용어 자식은 상하만)
      const sourceHandle = `${sourceChild.id}-bottom-source`;
      const targetHandle = `${targetChild.id}-top-target`;

      // 🔥 기본 선택 관계: pairCompositeRelations의 첫 번째 항목과 일치하는 관계
      let defaultRelation = null;

      if (pairCompositeRelations.length > 0) {
        const activeCompositeRel = pairCompositeRelations[0];
        defaultRelation = allRelations.find(
          (r) =>
            String(r.termRelId) === String(activeCompositeRel.compositeRelId)
        );
        console.log(
          '    🔥 pairCompositeRelations 기반 기본 관계 선택:',
          defaultRelation
        );
      }

      // 기본값 설정
      if (!defaultRelation) {
        defaultRelation =
          allRelations.find((r) => r.relType === 'COMPOSITION') ||
          allRelations[0];
        console.log('    🔥 기본 COMPOSITION 관계 사용:', defaultRelation);
      }

      // 🔥 현재 활성화된 compositeRelation
      const activeCompositeRel = pairCompositeRelations[0];

      // 🔥 엣지 생성 (availableRelations 및 compositeRelations 포함)
      const sequentialEdge = {
        id: `edge-${edgeIdCounter++}`,
        source: sourceChild.id,
        target: targetChild.id,
        sourceHandle: sourceHandle,
        targetHandle: targetHandle,
        type: 'relationshipEdge',
        animated: false,
        style: {
          stroke:
            colorMap[defaultRelation?.relType || 'COMPOSITION'] || '#10b981',
          strokeWidth: 2.5,
        },
        data: {
          relationshipId: defaultRelation?.termRelId || Date.now(),
          relationshipType: defaultRelation?.relType || 'COMPOSITION',
          description: defaultRelation?.rel_expln || '',
          isBidirectional: false,
          isAutoGenerated: true,
          isSequential: true,
          isCompositeChild: true,
          availableRelations: allRelations, // 🔥 모든 관계 저장
          compositeRelations: pairCompositeRelations, // 🔥🔥🔥 핵심: 업데이트된 compositeRelations 포함
          termCompositeRelId: activeCompositeRel?.termCompositerRelId,
          compositeId: activeCompositeRel?.compositeId,
          compositeTermOrder: activeCompositeRel?.compositeTermOrder,
          createdAt: new Date().toISOString(),
          sourceNodeName: sourceChild.data.termName,
          targetNodeName: targetChild.data.termName,
        },
      };

      edges.value.push(sequentialEdge);
      console.log(`    ✅ 엣지 생성 완료: ${sequentialEdge.id}`);
      console.log(
        `    📋 사용 가능한 관계: ${allRelations
          .map((r, idx) => `${idx + 1}. ${r.relType}`)
          .join(', ')}`
      );
      console.log(
        `    📋 compositeRelations: ${pairCompositeRelations.length}개 포함됨`
      );
      console.log(
        `    🔥 기본 선택된 관계: ${
          defaultRelation?.relType || 'COMPOSITION'
        } (termRelId: ${defaultRelation?.termRelId || 'N/A'})`
      );
    }

    // 🔥 엣지 갱신
    await nextTick();
    refreshEdges();

    console.log('\n✅ 순차적 소속관계 재구성 완료');
    console.log(
      `📊 최종 순서: ${children
        .map((c) => `${c.data.order}. ${c.data.termName}`)
        .join(' → ')}`
    );
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 저장 상태 업데이트
    setIsUpdate(true);
  };

  const selectRelToolTip = ref(null);

  // 🔥 엣지 관계 변경 핸들러
  const handleEdgeRelationChanged = (data) => {
    console.log('🔥 BizMetaPanel - 관계 변경 데이터:', data);

    selectRelToolTip.value = data;

    // 🔥 팝업 데이터 설정
    relationSelectionData.value = {
      edgeId: data.edgeId,
      sourceNodeName: data.sourceNodeName || '',
      targetNodeName: data.targetNodeName || '',
      availableRelations: data.availableRelations || [],
      currentRelationId: data.currentRelationId,
      compositeRelations: data.compositeRelations || [], // 🔥 추가
    };

    console.log('🔥 relationSelectionData:', relationSelectionData.value);

    // 🔥 팝업 열기
    showRelationSelectionPopup.value = true;
  };

  const isDescendant = (ancestorId, nodeId) => {
    const node = nodes.value.find((n) => n.id === nodeId);
    if (!node || !node.parentNode) return false;
    if (node.parentNode === ancestorId) return true;
    return isDescendant(ancestorId, node.parentNode);
  };

  // 🔥 부모-자식 관계 설정 함수 (isCompositeChild 플래그 추가)
  const setParentChild = async (childId, parentId) => {
    const childNode = nodes.value.find((n) => n.id === childId);
    const parentNode = nodes.value.find((n) => n.id === parentId);

    if (!childNode || !parentNode) return;

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔗 부모-자식 관계 설정');
    console.log(`   부모: ${parentNode.data.termName} (${parentId})`);
    console.log(`   자식: ${childNode.data.termName} (${childId})`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 🔥 부모 노드 배경 너비
    const parentBackgroundWidth = 440;
    const childStartX = (parentBackgroundWidth - CHILD_LAYOUT.childWidth) / 2;

    // 🔥 중첩 부모 노드에는 자식 추가 불가
    if (parentNode.data.isNestedParent && parentNode.parentNode) {
      alert('이미 다른 그룹에 속한 부모 노드에는 자식을 추가할 수 없습니다.');
      refreshEdges();
      return;
    }

    // 🔥 자식 노드에는 하위 추가 불가
    if (parentNode.parentNode) {
      alert(
        '자식 노드에는 하위 항목을 추가할 수 없습니다.\n최상위 부모 그룹에 추가됩니다.'
      );

      const topLevelParent = findTopLevelParent(parentId);
      if (topLevelParent && topLevelParent.id !== parentId) {
        setParentChild(childId, topLevelParent.id);
        return;
      }

      refreshEdges();
      return;
    }

    // 기존 부모가 있다면 제거
    if (childNode.parentNode) {
      const oldParent = nodes.value.find((n) => n.id === childNode.parentNode);
      if (oldParent) {
        childNode.parentNode = null;
        updateParentStyle(oldParent);
      }
    }

    // 🔥 복합구성용어가 자식으로 들어갈 때 처리
    const isChildComposite = childNode.data.termType === 'COMPOSITE';
    const hasCompositeChildren = childNode.data.compositeChildrenCount > 0;

    if (isChildComposite && hasCompositeChildren) {
      console.log(
        `\n🔄 복합구성용어 "${childNode.data.termName}"를 일반 자식 노드로 변환 중...`
      );

      const compositeChildren = nodes.value.filter(
        (n) => n.parentNode === childId
      );

      compositeChildren.forEach((grandChild) => {
        grandChild.hidden = true;
        grandChild.data = {
          ...grandChild.data,
          isHidden: true,
        };
      });

      console.log(
        `  ✅ ${compositeChildren.length}개의 하위 노드를 숨김 처리 완료`
      );
    }

    // 🔥 기존 자식 노드 목록 가져오기 (order 기준 정렬)
    const existingChildren = nodes.value
      .filter((n) => n.parentNode === parentId && !n.hidden)
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0));

    console.log(`📊 기존 자식 수: ${existingChildren.length}개`);

    // 부모 설정
    childNode.parentNode = parentId;
    childNode.extent = 'parent';
    childNode.hidden = false;

    const childIndex = existingChildren.length;
    const newOrder = childIndex + 1;

    console.log(`📍 새 자식 순번: ${newOrder}`);

    // 🔥🔥🔥 1단계: 위치 설정
    childNode.position = {
      x: CHILD_LAYOUT.horizontalPadding,
      y:
        CHILD_LAYOUT.headerHeight +
        childIndex * (CHILD_LAYOUT.childHeight + CHILD_LAYOUT.childGap),
    };

    childNode.style = {
      width: `${CHILD_LAYOUT.childWidth}px`,
      minWidth: `${CHILD_LAYOUT.childWidth}px`,
      maxWidth: `${CHILD_LAYOUT.childWidth}px`,
      height: `${CHILD_LAYOUT.childHeight}px`,
      minHeight: `${CHILD_LAYOUT.childHeight}px`,
    };

    // 🔥🔥🔥 데이터 업데이트 (isCompositeChild 플래그 추가)
    childNode.data = {
      ...childNode.data,
      order: newOrder,
      parentNode: parentId,
      isNestedParent: isChildComposite && hasCompositeChildren,
      hasHiddenChildren: isChildComposite && hasCompositeChildren,
      isHidden: false,
      isCompositeChild: true, // 🔥🔥🔥 핵심 플래그 추가
      isTopLevelParent: false,
      originalCompositeChildrenCount: hasCompositeChildren
        ? childNode.data.compositeChildrenCount
        : 0,
      totalChildrenCount: hasCompositeChildren
        ? childNode.data.compositeChildrenCount
        : 0,
    };

    console.log('✅ 자식 노드 데이터 업데이트 완료 (isCompositeChild: true)');

    // 🔥🔥🔥 2단계: 부모 스타일 업데이트 (위치 재계산)
    updateParentStyle(parentNode);

    // 🔥 DOM 렌더링 완료 대기
    await nextTick();
    await nextTick();

    console.log('✅ 위치 설정 완료');

    // 🔥🔥🔥 3단계: 복합구성용어 관계 생성 API 호출
    const compositeData = {
      compositeTermId: parentNode.data.termId,
      compositeTermName: parentNode.data.termName,
      compositeTermChildId: childNode.data.termId,
      compositeTermChildName: childNode.data.termName,
    };

    let response;

    try {
      response = await addBizTermComposite(compositeData);
      console.log('✅ 복합구성용어 관계 생성 API 완료');
      console.log('📊 [복합구성용어] 생성된 관계:', response);

      // 🔥 API 응답에서 compositeId와 termRelId 저장
      if (response && response.composites && response.composites.length > 0) {
        const latestComposite =
          response.composites[response.composites.length - 1];

        // 🔥 자식 노드 데이터에 compositeId와 termRelId 저장
        childNode.data = {
          ...childNode.data,
          compositeId: latestComposite.compositeId,
          termRelId: latestComposite.termRelId,
        };

        console.log('✅ 자식 노드에 compositeId와 termRelId 저장:', {
          compositeId: latestComposite.compositeId,
          termRelId: latestComposite.termRelId,
        });
      }
    } catch (error) {
      console.error('❌ 복합구성용어 관계 생성 실패:', error);
    }

    // 🔥🔥🔥 4단계: 순차적 소속관계 생성 (이전 자식과의 엣지 연결)
    if (existingChildren.length > 0) {
      const previousChild = existingChildren[existingChildren.length - 1];

      console.log(
        `\n🔗 순차적 소속관계 생성: ${previousChild.data.termName} (하단) → ${childNode.data.termName} (상단)`
      );

      const sequentialRelationData = {
        parentTermId: previousChild.data.termId,
        passiveTermId: childNode.data.termId,
        relType: 'COMPOSITION',
        rel_expln: `${previousChild.data.termName}과 ${childNode.data.termName}는 순차적 소속관계입니다. (순번: ${previousChild.data.order} → ${newOrder})`,
        owner: userInfo.value.ogdpDeptNm || '',
      };

      try {
        const response = await addBizTermRelation(sequentialRelationData);
        console.log('✅ 순차적 소속관계 API 호출 완료:', response);

        // colorMap 정의
        const colorMap = {
          SIMILAR: '#8b5cf6',
          ASSOCIATION: '#3b82f6',
          COMPOSITION: '#10b981',
          ADDITION: '#f59e0b',
          SUBTRACTION: '#ef4444',
          MULTIPLICATION: '#ec4899',
          DIVISION: '#6366f1',
        };

        // 🔥 새로 생성된 관계 데이터
        const newRelation = {
          termRelId: response?.termRelId || Date.now(),
          parentTermId: previousChild.data.termId,
          passiveTermId: childNode.data.termId,
          relType: 'COMPOSITION',
          rel_expln: sequentialRelationData.rel_expln,
          regDate: new Date().toISOString(),
        };

        // 🔥 이전 자식과 새 자식 간 모든 관계 수집
        const allRelations = [newRelation];

        if (previousChild.data.relations?.asParent) {
          const existingRels = previousChild.data.relations.asParent.filter(
            (r) =>
              r.passiveTermId === childNode.data.termId &&
              r.termRelId !== newRelation.termRelId
          );
          allRelations.push(...existingRels);
        }

        console.log(`📊 총 관계 수: ${allRelations.length}개`, allRelations);

        // 🔥 부모 노드의 compositeRelations 가져오기
        const compositeRelations = parentNode.data.compositeRelations || [];

        const pairCompositeRelations = compositeRelations.filter((compRel) => {
          const hasParentTermId =
            compRel.relationDetail?.parentTermId === previousChild.data.termId;
          const hasPassiveTermId =
            compRel.relationDetail?.passiveTermId === childNode.data.termId;

          return hasParentTermId && hasPassiveTermId;
        });

        console.log(
          `🔗 pairCompositeRelations: ${pairCompositeRelations.length}개`,
          pairCompositeRelations
        );

        // 🔥 Handle ID 생성 (이전 자식의 하단 → 새 자식의 상단)
        const sourceHandle = `${previousChild.id}-bottom-source`;
        const targetHandle = `${childNode.id}-top-target`;

        console.log(`📍 엣지 핸들 정보:`, {
          previousChild: {
            id: previousChild.id,
            termName: previousChild.data.termName,
            order: previousChild.data.order,
          },
          newChild: {
            id: childNode.id,
            termName: childNode.data.termName,
            order: newOrder,
          },
          sourceHandle: sourceHandle,
          targetHandle: targetHandle,
        });

        // 🔥 엣지 생성 (복합구성용어 자식 전용)
        const sequentialEdge = {
          id: `edge-${edgeIdCounter++}`,
          source: previousChild.id,
          target: childNode.id,
          sourceHandle: sourceHandle,
          targetHandle: targetHandle,
          type: 'relationshipEdge',
          animated: false,
          style: {
            stroke: colorMap['COMPOSITION'],
            strokeWidth: 2.5,
          },
          data: {
            relationshipId: newRelation.termRelId,
            relationshipType: newRelation.relType,
            description: newRelation.rel_expln,
            isBidirectional: false,
            isAutoGenerated: true,
            isSequential: true,
            isCompositeChild: true, // 🔥 복합구성용어 자식 플래그
            availableRelations: allRelations, // 🔥 모든 관계 저장
            compositeRelations: pairCompositeRelations,
            termCompositeRelId:
              pairCompositeRelations[0]?.termCompositerRelId || null,
            compositeId: pairCompositeRelations[0]?.compositeId || null,
            compositeTermOrder:
              pairCompositeRelations[0]?.compositeTermOrder || null,
            createdAt: new Date().toISOString(),
            sourceNodeName: previousChild.data.termName,
            targetNodeName: childNode.data.termName,
          },
        };

        edges.value.push(sequentialEdge);

        console.log(`✅ 엣지 생성 완료:`);
        console.log(
          `   소스: ${previousChild.data.termName} (${sourceHandle})`
        );
        console.log(`   타겟: ${childNode.data.termName} (${targetHandle})`);
        console.log(
          `   사용 가능한 관계: ${allRelations.length}개`,
          allRelations
        );

        // 🔥 relations 데이터 업데이트
        if (!previousChild.data.relations) {
          previousChild.data.relations = { asParent: [], asPassive: [] };
        }
        if (!childNode.data.relations) {
          childNode.data.relations = { asParent: [], asPassive: [] };
        }

        const existingAsParent = previousChild.data.relations.asParent.find(
          (rel) =>
            rel.parentTermId === newRelation.parentTermId &&
            rel.passiveTermId === newRelation.passiveTermId &&
            rel.relType === newRelation.relType
        );

        if (!existingAsParent) {
          previousChild.data.relations.asParent.push(newRelation);
        }

        const existingAsPassive = childNode.data.relations.asPassive.find(
          (rel) =>
            rel.parentTermId === newRelation.parentTermId &&
            rel.passiveTermId === newRelation.passiveTermId &&
            rel.relType === newRelation.relType
        );

        if (!existingAsPassive) {
          childNode.data.relations.asPassive.push(newRelation);
        }

        // 🔥 엣지 갱신
        await nextTick();
        await refreshEdges();

        console.log('✅ 엣지 UI 갱신 완료');
      } catch (error) {
        console.error('❌ 순차적 소속관계 생성 실패:', error);
      }
    } else {
      console.log(
        `\nℹ️ 첫 번째 자식 노드이므로 순차적 관계를 생성하지 않습니다.`
      );
    }

    setIsUpdate(true);

    const childType = isChildComposite
      ? `복합구성용어 (${childNode.data.totalChildrenCount}개 하위 숨김)`
      : '일반 노드';

    console.log(
      `\n✅ ${childNode.data.termName}(${childType})이(가) ${parentNode.data.termName}의 자식이 되었습니다 (순번: ${newOrder}, isCompositeChild: true)`
    );
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 🔥 복합구성용어 자식으로 추가된 후 관계선 리프레시
    console.log('\n🔄 관계선 리프레시 시작...');

    // 1️⃣ 자식 노드와 연결된 모든 엣지에서 관련 노드 ID 수집
    const relatedNodeIds = new Set();
    edges.value.forEach((edge) => {
      if (edge.source === childId || edge.target === childId) {
        if (edge.source !== childId) relatedNodeIds.add(edge.source);
        if (edge.target !== childId) relatedNodeIds.add(edge.target);
      }
    });

    console.log(`📊 관련된 노드 수: ${relatedNodeIds.size}개`);

    // 2️⃣ 자식 노드의 자동 생성 엣지 제거
    edges.value = edges.value.filter(
      (edge) =>
        !(
          (edge.source === childId || edge.target === childId) &&
          edge.data.isAutoGenerated
        )
    );

    console.log(`✅ 자식 노드(${childNode.data.termName})의 자동 엣지 제거 완료`);

    // 3️⃣ DOM 렌더링 완료 대기 후 엣지 재생성
    await nextTick();
    await nextTick();

    // 4️⃣ 자식 노드의 엣지 재생성
    createAutoEdgesForNode(childNode);
    console.log(`✅ 자식 노드(${childNode.data.termName})의 엣지 재생성 완료`);

    // 5️⃣ 관련된 다른 노드들의 엣지도 재생성
    relatedNodeIds.forEach((nodeId) => {
      const relatedNode = nodes.value.find((n) => n.id === nodeId);
      if (relatedNode && !relatedNode.data.isCompositeChild) {
        // 기존 자동 엣지 제거
        edges.value = edges.value.filter(
          (edge) =>
            !(
              (edge.source === nodeId || edge.target === nodeId) &&
              edge.data.isAutoGenerated
            )
        );
        // 엣지 재생성
        createAutoEdgesForNode(relatedNode);
        console.log(`✅ 관련 노드(${relatedNode.data.termName})의 엣지 재생성 완료`);
      }
    });

    // 6️⃣ 모든 비동기 작업 완료 대기 및 최종 엣지 리프레시
    await nextTick();
    await nextTick();
    await refreshEdges();

    console.log('✅ 관계선 리프레시 완료\n');

    emit('parent-child-created', {
      childId,
      parentId,
      childNode,
      parentNode,
      order: newOrder,
      isNestedParent: isChildComposite && hasCompositeChildren,
      hasHiddenChildren: isChildComposite && hasCompositeChildren,
    });
  };

  // 🔥 부모 노드 스타일 업데이트 (숨겨진 자식 제외)
  const updateParentStyle = (parentNode) => {
    const children = nodes.value
      .filter((n) => n.parentNode === parentNode.id && !n.hidden)
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0));

    if (children.length > 0) {
      const calculatedHeight =
        CHILD_LAYOUT.headerHeight +
        children.length * CHILD_LAYOUT.childHeight +
        (children.length - 1) * CHILD_LAYOUT.childGap +
        CHILD_LAYOUT.bottomPadding +
        50;

      // 🔥 최상위 부모인 경우에만 그룹 스타일 적용
      const isTopLevel = !parentNode.parentNode;

      // 🔥 부모 노드 배경 너비
      const parentBackgroundWidth = 400; // 🔥 400 → 440으로 증가 (좌우 여백 추가)

      // 🔥 자식 노드를 중앙에 배치하기 위한 시작 x 위치 계산
      const childStartX = (parentBackgroundWidth - CHILD_LAYOUT.childWidth) / 2;

      if (isTopLevel) {
        parentNode.style = {
          backgroundColor: 'rgba(239, 246, 255, 0.6)',
          border: '2px solid #3b82f6',
          borderRadius: '16px',
          width: `${parentBackgroundWidth}px`,
          minWidth: `${parentBackgroundWidth}px`,
          maxWidth: `${parentBackgroundWidth}px`,
          height: `${calculatedHeight}px`,
          minHeight: `${calculatedHeight}px`,
          padding: '0',
          boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)',
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          // 🔥 CSS 변수로 배경 너비 전달
          '--background-width': `${parentBackgroundWidth}px`,
        };
      } else {
        // 🔥 중첩 부모는 자식 노드 크기 유지
        parentNode.style = {
          width: `${CHILD_LAYOUT.childWidth}px`,
          minWidth: `${CHILD_LAYOUT.childWidth}px`,
          maxWidth: `${CHILD_LAYOUT.childWidth}px`,
          height: `${CHILD_LAYOUT.childHeight}px`,
          minHeight: `${CHILD_LAYOUT.childHeight}px`,
        };
      }

      // 🔥 실제 보이는 자식 수와 전체 자식 수 구분
      const totalChildren = nodes.value.filter(
        (n) => n.parentNode === parentNode.id
      );
      const visibleChildren = children.length;
      const hiddenChildren = totalChildren.length - visibleChildren;

      parentNode.data = {
        ...parentNode.data,
        isParent: true,
        childrenCount: visibleChildren, // 보이는 자식 수
        totalChildrenCount: totalChildren.length, // 전체 자식 수
        hiddenChildrenCount: hiddenChildren, // 숨겨진 자식 수
        isTopLevelParent: isTopLevel,
        isNestedParent: !isTopLevel && totalChildren.length > 0,
      };

      // 🔥 자식 노드 위치 및 스타일 재조정 (보이는 자식만, 중앙 정렬)
      children.forEach((child, index) => {
        const hasHiddenChildren =
          child.data.isParent &&
          nodes.value.some((n) => n.parentNode === child.id);

        child.data = {
          ...child.data,
          order: index + 1,
          parentNode: parentNode.id,
          isNestedParent: hasHiddenChildren,
          hasHiddenChildren: hasHiddenChildren,
          isHidden: false,
        };

        child.position = {
          x: CHILD_LAYOUT.horizontalPadding,
          y:
            CHILD_LAYOUT.headerHeight +
            index * (CHILD_LAYOUT.childHeight + CHILD_LAYOUT.childGap),
        };

        child.style = {
          width: `${CHILD_LAYOUT.childWidth}px`,
          minWidth: `${CHILD_LAYOUT.childWidth}px`,
          maxWidth: `${CHILD_LAYOUT.childWidth}px`,
          height: `${CHILD_LAYOUT.childHeight}px`,
          minHeight: `${CHILD_LAYOUT.childHeight}px`,
        };

        child.extent = 'parent';
        child.hidden = false;
      });

      nextTick(() => {
        refreshEdges();
      });
    } else {
      // 자식이 없으면 일반 노드로 복원
      parentNode.style = {
        backgroundColor: 'white',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        width: 'auto',
        minWidth: '280px',
        height: 'auto',
        minHeight: '120px',
      };

      parentNode.data = {
        ...parentNode.data,
        isParent: false,
        childrenCount: 0,
        totalChildrenCount: 0,
        hiddenChildrenCount: 0,
        isTopLevelParent: false,
        isNestedParent: false,
      };
    }
  };

  const refreshEdges = async () => {
    const currentEdges = [...edges.value];
    edges.value = [];
    await nextTick();
    edges.value = currentEdges;
  };

  const handleConnect = (connection) => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔗 Vue Flow Handle 연결:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 🔥 원본 데이터 출력
    console.log('📦 connection 객체:', {
      source: connection.source,
      sourceHandle: connection.sourceHandle,
      target: connection.target,
      targetHandle: connection.targetHandle,
    });

    const dragStartNode = nodes.value.find(
      (node) => node.id === connection.source
    );
    const dragEndNode = nodes.value.find(
      (node) => node.id === connection.target
    );

    if (!dragStartNode || !dragEndNode) {
      console.error('❌ 노드를 찾을 수 없습니다');
      return;
    }

    console.log('\n📋 노드 정보:');
    console.log(
      `  드래그 시작: ${dragStartNode.data.termName} (${connection.source})`
    );
    console.log(
      `  드래그 종료: ${dragEndNode.data.termName} (${connection.target})`
    );

    // 🔥 Handle 타입 추출
    const sourceHandleType = connection.sourceHandle?.endsWith('-source')
      ? 'source'
      : connection.sourceHandle?.endsWith('-target')
      ? 'target'
      : 'unknown';

    const targetHandleType = connection.targetHandle?.endsWith('-source')
      ? 'source'
      : connection.targetHandle?.endsWith('-target')
      ? 'target'
      : 'unknown';

    console.log('\n🔍 Handle 타입:');
    console.log(`  ${connection.sourceHandle} → ${sourceHandleType}`);
    console.log(`  ${connection.targetHandle} → ${targetHandleType}`);

    // 🔥 연결 방향 결정
    let actualSource, actualTarget, actualSourceHandle, actualTargetHandle;

    if (sourceHandleType === 'source' && targetHandleType === 'target') {
      // ✅ 정상: source Handle → target Handle
      actualSource = dragStartNode;
      actualTarget = dragEndNode;
      actualSourceHandle = connection.sourceHandle;
      actualTargetHandle = connection.targetHandle;
      console.log('\n✅ 정상 연결: source → target');
    } else if (sourceHandleType === 'target' && targetHandleType === 'source') {
      // 🔄 역방향: target Handle → source Handle (교정 필요)
      actualSource = dragEndNode;
      actualTarget = dragStartNode;
      actualSourceHandle = connection.targetHandle;
      actualTargetHandle = connection.sourceHandle;
      console.log('\n🔄 역방향 감지 - 소스/타겟 교정');
      console.log(`  교정 전: ${connection.source} → ${connection.target}`);
      console.log(`  교정 후: ${actualSource.id} → ${actualTarget.id}`);
    } else if (sourceHandleType === 'source' && targetHandleType === 'source') {
      // ✅ 정상: source Handle → target Handle
      actualSource = dragStartNode;
      actualTarget = dragEndNode;
      actualSourceHandle = connection.sourceHandle;
      actualTargetHandle = connection.targetHandle;
      console.log('\n✅ 정상 연결: source → target');
      // console.error('\n❌ source → source 연결 불가');
      // alert('출발점끼리는 연결할 수 없습니다.');
      // return;
    } else if (sourceHandleType === 'target' && targetHandleType === 'target') {
      // console.error('\n❌ target → target 연결 불가');
      // alert('도착점끼리는 연결할 수 없습니다.');
      return;
    } else {
      console.error('\n❌ 알 수 없는 연결 타입:', {
        sourceHandleType,
        targetHandleType,
      });
      alert('연결 방향을 확인할 수 없습니다.');
      return;
    }

    console.log('\n📌 최종 연결:');
    console.log(`  소스: ${actualSource.data.termName} (${actualSource.id})`);
    console.log(`  타겟: ${actualTarget.data.termName} (${actualTarget.id})`);
    console.log(`  소스 Handle: ${actualSourceHandle}`);
    console.log(`  타겟 Handle: ${actualTargetHandle}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 🔥 pendingConnection에 교정된 정보 저장
    pendingConnection.sourceNodeId = actualSource.id;
    pendingConnection.sourceNodeData = actualSource.data;
    pendingConnection.sourceNodeTermId = actualSource.data.termId;

    pendingConnection.targetNodeId = actualTarget.id;
    pendingConnection.targetNodeData = actualTarget.data;
    pendingConnection.targetNodeTermId = actualTarget.data.termId;

    pendingConnection.sourceHandle = actualSourceHandle;
    pendingConnection.targetHandle = actualTargetHandle;

    showRelationshipPopup.value = true;
  };

  const handleConnectStart = (event, connection) => {
    console.log('연결 시작:', connection);
    if (vueFlowRef.value) {
      const flowElement = vueFlowRef.value.$el || vueFlowRef.value;
      if (flowElement) {
        flowElement.classList.add('connecting-mode');
      }
    }
  };

  const handleConnectEnd = (event) => {
    console.log('연결 종료');
    if (vueFlowRef.value) {
      const flowElement = vueFlowRef.value.$el || vueFlowRef.value;
      if (flowElement) {
        flowElement.classList.remove('connecting-mode');
      }
    }
  };

  const handleNodeConnectStart = (data) => {
    console.log('노드 연결 시작:', data);
    connectingState.isConnecting = true;
    connectingState.sourceNodeId = data.sourceNodeId;
    connectingState.sourceNodeData = data.sourceNodeData;
  };

  const handleNodeConnectEnd = (data) => {
    console.log('노드 연결 종료:', data);

    if (data.cancelled) {
      connectingState.isConnecting = false;
      connectingState.sourceNodeId = null;
      connectingState.sourceNodeData = null;
      return;
    }

    pendingConnection.sourceNodeId = data.sourceNodeId;
    pendingConnection.sourceNodeData = data.sourceNodeData;
    pendingConnection.targetNodeId = data.targetNodeId;
    pendingConnection.targetNodeData = data.targetNodeData;

    showRelationshipPopup.value = true;

    connectingState.isConnecting = false;
    connectingState.sourceNodeId = null;
    connectingState.sourceNodeData = null;
  };

  // 🔥 관계 생성 함수 (엣지 재구성 추가)
  const createRelationship = async () => {
    if (!newRelationship.relationshipType) {
      alert('비즈니스 관계유형은 필수 입력 항목입니다.');
      return;
    }

    console.log('새 관계 생성 데이터:', newRelationship);
    console.log('Pending Connection 데이터:', pendingConnection);

    const addTermRelationParams = {
      parentTermId: pendingConnection.sourceNodeData.termId,
      passiveTermId: pendingConnection.targetNodeData.termId,
      relType: newRelationship.relationshipType,
      rel_expln: newRelationship.description,
      owner: userInfo.value.ogdpDeptNm || '',
    };

    console.log('addTermRelationParams:', addTermRelationParams);
    const response = await addBizTermRelation(addTermRelationParams);

    console.log('관계 생성 API 응답:', response);
    if (response.status !== 200) {
      if (response.data.code === 1400) {
        alert('이미 존재하는 관계입니다.');
        closeRelationshipPopup();
        return;
      }
    }

    // 저장 상태 업데이트
    setIsUpdate(true);

    // 🔥 소스/타겟 노드 정보
    const sourceNode = nodes.value.find(
      (n) => n.id === pendingConnection.sourceNodeId
    );
    const targetNode = nodes.value.find(
      (n) => n.id === pendingConnection.targetNodeId
    );

    // 🔥 복합구성용어 자식 간 관계인지 확인
    const isCompositeChildRelation =
      sourceNode?.data?.isCompositeChild === true &&
      targetNode?.data?.isCompositeChild === true &&
      sourceNode?.parentNode === targetNode?.parentNode;

    console.log('🔥 복합구성용어 자식 간 관계:', isCompositeChildRelation);

    // 🔥 관계 유형별 색상 매핑
    const colorMap = {
      SIMILAR: '#8b5cf6',
      ASSOCIATION: '#3b82f6',
      COMPOSITION: '#10b981',
      ADDITION: '#f59e0b',
      SUBTRACTION: '#ef4444',
      MULTIPLICATION: '#ec4899',
      DIVISION: '#6366f1',
    };

    const edgeColor = colorMap[newRelationship.relationshipType] || '#64748b';

    // 🔥 새 관계 데이터
    const newRelation = {
      termRelId: response.data?.termRelId,
      parentTermId: pendingConnection.sourceNodeData.termId,
      passiveTermId: pendingConnection.targetNodeData.termId,
      relType: newRelationship.relationshipType,
      rel_expln: newRelationship.description,
      regDate: new Date().toISOString(),
    };

    // 🔥 복합구성용어 자식 간 관계인 경우
    if (isCompositeChildRelation) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔥 복합구성용어 자식 간 새 관계 추가');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // 🔥🔥🔥 1단계: 노드의 relations 데이터 업데이트
      if (!sourceNode.data.relations) {
        sourceNode.data.relations = { asParent: [], asPassive: [] };
      }
      if (!targetNode.data.relations) {
        targetNode.data.relations = { asParent: [], asPassive: [] };
      }

      // sourceNode.relations.asParent 업데이트
      const existingAsParent = sourceNode.data.relations.asParent.find(
        (rel) => String(rel.termRelId) === String(newRelation.termRelId)
      );

      if (!existingAsParent) {
        sourceNode.data.relations.asParent.push(newRelation);
        console.log('✅ sourceNode.relations.asParent 업데이트:', newRelation);
      }

      // targetNode.relations.asPassive 업데이트
      const existingAsPassive = targetNode.data.relations.asPassive.find(
        (rel) => String(rel.termRelId) === String(newRelation.termRelId)
      );

      if (!existingAsPassive) {
        targetNode.data.relations.asPassive.push(newRelation);
        console.log('✅ targetNode.relations.asPassive 업데이트:', newRelation);
      }

      console.log('\n✅ 노드 relations 업데이트 완료');

      // 🔥🔥🔥 2단계: 부모 노드 찾기
      const parentNodeId = sourceNode.parentNode;
      const parentNode = nodes.value.find((n) => n.id === parentNodeId);

      if (!parentNode) {
        console.error('❌ 부모 노드를 찾을 수 없습니다:', parentNodeId);
        closeRelationshipPopup();
        return;
      }

      console.log(
        `\n📋 부모 노드: ${parentNode.data.termName} (termId: ${parentNode.data.termId})`
      );

      // 🔥🔥🔥 3단계: 최신 compositeRelations 가져오기
      console.log('\n📡 최신 compositeRelations 조회 중...');

      let latestCompositeRelations = null;

      try {
        latestCompositeRelations = await getNewCompositeRelations(
          parentNode.data.termId
        );

        console.log(
          '✅ 최신 compositeRelations 조회 완료:',
          latestCompositeRelations?.length || 0,
          '개'
        );
      } catch (error) {
        console.error('❌ compositeRelations 조회 실패:', error);
        latestCompositeRelations = parentNode.data.compositeRelations || [];
      }

      // 🔥🔥🔥 4단계: 엣지 재구성 (순서 변경과 동일한 로직)
      console.log('\n🔄 순차적 소속관계 재구성 시작 (관계 추가 후)...');

      await reconstructSequentialCompositionEdges(
        parentNodeId,
        latestCompositeRelations
      );

      console.log('\n✅ 순차적 소속관계 재구성 완료');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      emit('relationship-created', {
        edge: edges.value.find(
          (e) => e.source === sourceNode.id && e.target === targetNode.id
        ),
        sourceNode: sourceNode.data,
        targetNode: targetNode.data,
        relationshipData: newRelationship,
        isCompositeChild: true,
      });
    } else {
      // 🔥 일반 노드 간 관계 (기존 로직 유지)
      const newEdge = {
        id: `edge-${edgeIdCounter++}`,
        source: pendingConnection.sourceNodeId,
        target: pendingConnection.targetNodeId,
        sourceHandle: pendingConnection.sourceHandle,
        targetHandle: pendingConnection.targetHandle,
        type: 'relationshipEdge',
        animated: false,
        style: {
          stroke: edgeColor,
          strokeWidth: newRelationship.isBidirectional ? 3 : 2.5,
        },
        data: {
          relationshipId: response.data?.termRelId || Date.now(),
          relationshipName: newRelationship.relationshipName?.trim() || '',
          relationshipType: newRelationship.relationshipType,
          description: newRelationship.description?.trim() || '',
          isBidirectional: newRelationship.isBidirectional,
          isAutoGenerated: false,
          isCompositeChild: false,
          createdAt: new Date().toISOString(),
          sourceNodeName: pendingConnection.sourceNodeData?.termName,
          targetNodeName: pendingConnection.targetNodeData?.termName,
        },
      };

      edges.value.push(newEdge);

      console.log('새 일반 관계 생성:', {
        edge: newEdge,
        sourceHandle: pendingConnection.sourceHandle,
        targetHandle: pendingConnection.targetHandle,
        relationshipType: newRelationship.relationshipType,
      });

      emit('relationship-created', {
        edge: newEdge,
        sourceNode: pendingConnection.sourceNodeData,
        targetNode: pendingConnection.targetNodeData,
        relationshipData: newRelationship,
      });
    }

    closeRelationshipPopup();
  };

  // 기존 함수들...
  const toggleAddTermMode = () => {
    isAddTermMode.value = !isAddTermMode.value;
    if (!isAddTermMode.value) {
      closeTermPopup();
    }
  };

  const clearPanel = () => {
    if (nodes.value.length === 0) return;

    if (confirm('모든 노드를 삭제하시겠습니까?')) {
      nodes.value = [];
      edges.value = [];
      nodeIdCounter = 1;
      edgeIdCounter = 1;
      emit('panel-cleared');
    }
  };

  const handleContainerClick = (event) => {
    if (!isAddTermMode.value) return;

    if (
      event.target.closest('.control-button') ||
      event.target.closest('.vue-flow__node') ||
      event.target.closest('.vue-flow__controls') ||
      event.target.closest('.vue-flow__minimap')
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const containerRect = vueFlowContainer.value.getBoundingClientRect();
    const x = event.clientX - containerRect.left;
    const y = event.clientY - containerRect.top;

    const popupWidth = 320;
    const popupHeight = 450;

    popupPosition.x = Math.min(
      event.clientX,
      window.innerWidth - popupWidth - 20
    );
    popupPosition.y = Math.min(
      event.clientY,
      window.innerHeight - popupHeight - 20
    );

    newTerm.nodePosition = { x, y };
    showTermPopup.value = true;

    nextTick(() => {
      if (termNameInput.value) {
        termNameInput.value.focus();
      }
    });
  };

  const closeTermPopup = () => {
    showTermPopup.value = false;
    resetNewTerm();
  };

  const closeRelationshipPopup = () => {
    showRelationshipPopup.value = false;
    resetNewRelationship();
    resetPendingConnection();
  };

  const resetNewTerm = () => {
    newTerm.termName = '';
    newTerm.termType = 'GENERAL';
    newTerm.description = '';
    newTerm.domain = '';
    newTerm.nodePosition = null;
  };

  const resetNewRelationship = () => {
    newRelationship.relationshipName = '';
    newRelationship.relationshipType = '';
    newRelationship.description = '';
    newRelationship.isBidirectional = false;
  };

  const resetPendingConnection = () => {
    pendingConnection.sourceNodeId = null;
    pendingConnection.sourceNodeData = null;
    pendingConnection.targetNodeId = null;
    pendingConnection.targetNodeData = null;
    pendingConnection.sourceHandle = null;
    pendingConnection.targetHandle = null;
  };

  const createTerm = async () => {
    if (!newTerm.termName.trim()) {
      alert('용어명은 필수입니다.');
      return;
    }

    // 🔥 동일한 용어명이 존재하는지 확인
    const isDuplicate = nodes.value.some(
      (node) => node.data.termName === newTerm.termName.trim()
    );

    if (isDuplicate) {
      alert(`'${newTerm.termName.trim()}' 용어는 이미 존재합니다.`);
      return;
    }

    console.log('새 용어 생성:', newTerm);
    console.log('userInfo : ', userInfo);

    const response = await addBizTerm(newTerm);

    if (response.data?.code === 1401) {
      alert('중복된 용어가 존재합니다.');
      // return;
    } else {
      console.log('용어 생성 API 응답:', response);

      const newNode = {
        id: `term-${nodeIdCounter++}`,
        type: 'termNode',
        position: newTerm.nodePosition || { x: 100, y: 100 },
        draggable: true,
        data: {
          termId: response?.termId,
          termName: newTerm.termName.trim(),
          termExplain: newTerm.termExplain.trim(),
          owner: newTerm.owner,
          createDateTime: new Date().toISOString(),
        },
      };

      console.log('생성된 노드:', newNode);

      nodes.value.push(newNode);

      setIsUpdate(true);

      // 초기화
      newTerm.termExplain = '';

      emit('term-created', newNode);
    }
    closeTermPopup();
  };

  // 🔥 노드 삭제 시 복합구성용어 자식인지 판별하여 API 호출
  const deleteNode = async (nodeId) => {
    const node = nodes.value.find((n) => n.id === nodeId);
    if (!node) return;

    console.log('노드 삭제:', node);

    // 🔥 복합구성용어의 자식 노드인지 확인
    const isCompositeChild = node.data.isCompositeChild === true;
    const parentNode = isCompositeChild
      ? nodes.value.find((n) => n.id === node.parentNode)
      : null;

    // 🔥 삭제 확인 메시지
    const confirmMessage = isCompositeChild
      ? `'${node.data.termName}' 노드를 복합구성용어에서 제거하시겠습니까?\n(복합구성 관계가 삭제됩니다)`
      : `'${node.data.termName}' 노드를 삭제하시겠습니까?`;

    if (!confirm(confirmMessage)) return;

    try {
      // 🔥 복합구성용어 자식 노드인 경우 API 호출
      if (isCompositeChild) {
        console.log('📡 복합구성용어 자식 삭제 API 호출:', {
          termRelId: node.data.termRelId,
          compositeId: node.data.compositeId,
          parentTermId: parentNode?.data.termId,
          childTermId: node.data.termId,
          parentTermName: parentNode?.data.termName,
          childTermName: node.data.termName,
        });

        // 🔥 API 호출: 복합구성용어 자식 삭제
        await deleteBizTermCompositeChild(
          parentNode?.data.termId,
          node.data.termId
        );

        console.log('✅ 복합구성용어 자식 삭제 API 완료');

        // 저장 상태 업데이트
        setIsUpdate(true);
      }

      // 🔥 모든 자손 노드 재귀적으로 삭제 (숨겨진 것 포함)
      const deleteNodeAndDescendants = async (id) => {
        const currentNode = nodes.value.find((n) => n.id === id);
        const childNodes = nodes.value.filter((n) => n.parentNode === id);

        // 자손 노드들도 복합구성용어 자식인 경우 API 호출
        for (const child of childNodes) {
          await deleteNodeAndDescendants(child.id);
        }

        // 노드 제거
        const nodeIndex = nodes.value.findIndex((n) => n.id === id);
        if (nodeIndex > -1) {
          nodes.value.splice(nodeIndex, 1);

          // 연결된 엣지 제거
          edges.value = edges.value.filter(
            (edge) => edge.source !== id && edge.target !== id
          );
        }
      };

      await deleteNodeAndDescendants(nodeId);

      // 🔥 부모 노드 업데이트 (복합구성용어 자식인 경우)
      if (isCompositeChild && parentNode) {
        console.log(
          `📐 부모 노드 업데이트: ${parentNode.data.termName} (자식 제거 후)`
        );
        updateParentStyle(parentNode);
      }

      // 🔥 일반 부모-자식 관계인 경우
      if (node.parentNode && !isCompositeChild) {
        const parent = nodes.value.find((n) => n.id === node.parentNode);
        if (parent) {
          updateParentStyle(parent);
        }
      }

      console.log('✅ 노드 삭제 완료');
    } catch (error) {
      console.error('❌ 노드 삭제 실패:', error);
      alert('노드 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();

    try {
      const dragData = JSON.parse(
        event.dataTransfer.getData('application/json')
      );

      if (dragData.type === 'business-term') {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📦 새 노드 드롭:', dragData.termData);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // 🔥 동일한 termId를 가진 모든 노드 찾기
        const existingNodes = nodes.value.filter(
          (node) => node.data.termId === dragData.termData.termId
        );

        console.log(
          `🔍 동일한 termId를 가진 노드 수: ${existingNodes.length}개`
        );

        if (existingNodes.length > 0) {
          // 🔥 복합구성용어 자식 노드 확인
          const compositeChildNodes = existingNodes.filter(
            (node) => node.data.isCompositeChild === true
          );

          // 🔥 일반 노드 확인
          const generalNodes = existingNodes.filter(
            (node) => node.data.isCompositeChild !== true
          );

          console.log(`   복합구성용어 자식: ${compositeChildNodes.length}개`);
          console.log(`   일반 노드: ${generalNodes.length}개`);

          // 🔥 복합구성용어 자식이 있고, 일반 노드도 1개 이상 존재하면 차단
          if (compositeChildNodes.length > 0 && generalNodes.length >= 1) {
            alert(
              `'${dragData.termData.termName}' 노드는 이미 복합구성용어 자식과 일반 노드로 존재합니다.\n추가로 배치할 수 없습니다.`
            );
            console.log(
              `⚠️ 중복 차단: 복합구성용어 자식 ${compositeChildNodes.length}개 + 일반 노드 ${generalNodes.length}개 존재`
            );
            return;
          }

          // 🔥 복합구성용어 자식이 없고, 일반 노드만 존재하면 차단
          if (compositeChildNodes.length === 0 && generalNodes.length >= 1) {
            alert(
              `'${dragData.termData.termName}' 노드는 이미 패널에 존재합니다.`
            );
            console.log(
              `⚠️ 중복 차단: 일반 노드 ${generalNodes.length}개 존재`
            );
            return;
          }

          // 🔥 복합구성용어 자식만 있고, 일반 노드가 없으면 허용
          if (compositeChildNodes.length > 0 && generalNodes.length === 0) {
            console.log('✅ 복합구성용어 자식만 존재 - 일반 노드로 추가 허용');
          }
        }

        const containerRect = vueFlowContainer.value.getBoundingClientRect();
        const position = {
          x: event.clientX - containerRect.left,
          y: event.clientY - containerRect.top,
        };

        // 🔥 relations 데이터 확인
        const relations = dragData.termData.relations || {
          asParent: [],
          asPassive: [],
        };

        const compositeChildren = dragData.termData.compositeChildren || [];
        const isComposite =
          dragData.termData.termType === 'COMPOSITE' &&
          compositeChildren.length > 0;

        console.log('📊 노드 데이터:', {
          termName: dragData.termData.termName,
          termId: dragData.termData.termId,
          termType: dragData.termData.termType,
          isComposite: isComposite,
          compositeChildrenCount: compositeChildren.length,
          relations: {
            asParent: relations.asParent?.length || 0,
            asPassive: relations.asPassive?.length || 0,
          },
        });

        // 🔥 부모 노드 생성 (일반 노드로 생성 - isCompositeChild: false)
        const parentNode = {
          id: `term-${nodeIdCounter++}`,
          type: 'termNode',
          position: position,
          draggable: true,
          data: {
            id: dragData.termData.id,
            termId: dragData.termData.termId,
            termName: dragData.termData.termName,
            termType: dragData.termData.termType,
            termExplain: dragData.termData.termExplain,
            domain: dragData.termData.domain,
            relations: relations,
            compositeChildren: compositeChildren,
            compositeRelations: dragData.termData.compositeRelations || [],
            compositeRelationsCount:
              dragData.termData.compositeRelationsCount || 0,
            compositeChildrenCount: compositeChildren.length,
            owner: dragData.termData.owner,
            createdAt: new Date().toISOString(),
            isFromSidebar: true,
            isParent: isComposite,
            isTopLevelParent: isComposite,
            isCompositeChild: false, // 🔥 일반 노드로 생성
          },
        };

        // 🔥 복합구성용어인 경우 초기 배경 크기 설정
        if (isComposite) {
          const parentBackgroundWidth = 400;
          const calculatedHeight =
            CHILD_LAYOUT.headerHeight +
            compositeChildren.length * CHILD_LAYOUT.childHeight +
            (compositeChildren.length - 1) * CHILD_LAYOUT.childGap +
            CHILD_LAYOUT.bottomPadding +
            50;

          parentNode.style = {
            backgroundColor: 'rgba(239, 246, 255, 0.6)',
            border: '2px solid #3b82f6',
            borderRadius: '16px',
            width: `${parentBackgroundWidth}px`,
            minWidth: `${parentBackgroundWidth}px`,
            maxWidth: `${parentBackgroundWidth}px`,
            height: `${calculatedHeight}px`,
            minHeight: `${calculatedHeight}px`,
            padding: '0',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)',
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            '--background-width': `${parentBackgroundWidth}px`,
          };

          console.log('🎨 복합구성용어 초기 스타일 설정:', {
            width: parentBackgroundWidth,
            height: calculatedHeight,
          });
        }

        console.log('➕ 부모 노드 추가:', {
          nodeId: parentNode.id,
          termId: parentNode.data.termId,
          termName: parentNode.data.termName,
          isComposite: isComposite,
          isCompositeChild: false,
          style: parentNode.style,
        });

        nodes.value.push(parentNode);

        // 🔥 복합구성용어인 경우 자식 노드들 자동 생성
        if (isComposite) {
          console.log(
            `\n🔧 복합구성용어 자식 노드 생성 시작 (${compositeChildren.length}개)`
          );

          const sortedChildren = [...compositeChildren].sort(
            (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
          );

          const childNodes = [];
          const parentBackgroundWidth = 400;

          for (let index = 0; index < sortedChildren.length; index++) {
            const compositeChild = sortedChildren[index];
            const childTermData = compositeChild.childTerm;

            if (!childTermData) {
              console.warn(`⚠️ 자식 용어 데이터가 없습니다:`, compositeChild);
              continue;
            }

            console.log(
              `  [${index + 1}/${sortedChildren.length}] ${
                childTermData.termName
              } 생성 중...`
            );

            const childNode = {
              id: `term-${nodeIdCounter++}`,
              type: 'termNode',
              parentNode: parentNode.id,
              extent: 'parent',
              draggable: true,
              position: {
                x: CHILD_LAYOUT.horizontalPadding,
                y:
                  CHILD_LAYOUT.headerHeight +
                  index * (CHILD_LAYOUT.childHeight + CHILD_LAYOUT.childGap),
              },
              style: {
                width: `${CHILD_LAYOUT.childWidth}px`,
                minWidth: `${CHILD_LAYOUT.childWidth}px`,
                maxWidth: `${CHILD_LAYOUT.childWidth}px`,
                height: `${CHILD_LAYOUT.childHeight}px`,
                minHeight: `${CHILD_LAYOUT.childHeight}px`,
              },
              data: {
                id: childTermData.id,
                termId: childTermData.termId,
                termName: childTermData.termName,
                termType: childTermData.termType,
                termExplain: childTermData.termExplain,
                domain: childTermData.domain,
                relations: childTermData.relations || {
                  asParent: [],
                  asPassive: [],
                },
                owner: childTermData.owner,
                createdAt: childTermData.createdAt || new Date().toISOString(),
                isFromSidebar: false,
                isChildNode: true,
                isCompositeChild: true,
                order: compositeChild.sortOrder || index + 1,
                parentNode: parentNode.id,
                compositeId: compositeChild.compositeId,
                termRelId: compositeChild.termRelId,
              },
            };

            childNodes.push(childNode);
            nodes.value.push(childNode);

            console.log(
              `    ✅ 자식 노드 생성: ${childTermData.termName} (순번: ${childNode.data.order}, compositeId: ${childNode.data.compositeId}, termRelId: ${childNode.data.termRelId})`
            );
          }

          // 🔥 부모 노드 데이터 업데이트
          parentNode.data = {
            ...parentNode.data,
            childrenCount: childNodes.length,
            totalChildrenCount: childNodes.length,
            hiddenChildrenCount: 0,
          };

          console.log(
            `\n✅ 복합구성용어 자식 노드 생성 완료 (총 ${childNodes.length}개)`
          );

          // 🔥 DOM 업데이트 대기 후 부모 스타일 즉시 업데이트
          await nextTick();

          console.log('🎨 부모 스타일 업데이트 시작');
          updateParentStyle(parentNode);

          // 🔥 다시 한번 nextTick으로 렌더링 완료 대기
          await nextTick();

          console.log('✅ 부모 스타일 업데이트 완료');

          // 🔥 자식 노드들의 자동 엣지 연결
          setTimeout(() => {
            childNodes.forEach((childNode) => {
              createAutoEdgesForNode(childNode);
            });
            console.log('✅ 자식 노드들의 관계 엣지 생성 완료');
          }, 200);
        }

        // 🔥 부모 노드의 자동 엣지 연결
        await nextTick();
        setTimeout(() => {
          createAutoEdgesForNode(parentNode);
        }, 100);

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      }
    } catch (error) {
      console.error('❌ 드롭 데이터 파싱 실패:', error);
    }
  };

  // 🔥 ResizeObserver 인스턴스 저장
  let resizeObserver = null;

  // 🔥 컴포넌트 마운트 시 초기화 (GridPlayGroundComp 방식 적용)
  onMounted(async () => {
    console.log('🌊 [onMounted] Vue Flow 초기화 시작');

    // 🔥 Flow를 일단 숨김
    isFlowReady.value = false;

    // 🔥 DOM 업데이트 대기
    await nextTick();

    // 🔥 두 프레임 대기 후 렌더링 (완전한 초기화)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        flowKey.value = Date.now(); // 고유한 key 생성
        isFlowReady.value = true;
        console.log(
          '✅ [onMounted] VueFlow 렌더링 완료, flowKey:',
          flowKey.value
        );

        // 🔥 추가 지연 후 window resize 이벤트 발생 (keep-alive 캐싱 문제 해결)
        setTimeout(() => {
          console.log('🔄 [onMounted] window resize 이벤트 발생');
          window.dispatchEvent(new Event('resize'));

          // 🔥 resize 이벤트 후 추가로 fitView 강제 호출
          setTimeout(() => {
            if (nodes.value.length > 0) {
              console.log('🔄 [onMounted] 강제 fitView 호출');
              nodes.value.forEach((node) => {
                updateNodeInternals(node.id);
              });
              fitView({ padding: 0.2, duration: 300 });
              console.log('✅ [onMounted] 패널 완전 초기화 완료');
            }
          }, 200);
        }, 300);
      });
    });

    // 🔥 ResizeObserver 설정: 컨테이너 크기 변화 감지
    setTimeout(() => {
      if (vueFlowContainer.value) {
        resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            console.log('📏 [ResizeObserver] 컨테이너 크기 변경 감지:', {
              width: entry.contentRect.width,
              height: entry.contentRect.height,
            });

            // 크기가 변경되면 잠시 후 fitView 호출
            setTimeout(() => {
              if (nodes.value.length > 0 && isFlowReady.value) {
                nodes.value.forEach((node) => {
                  updateNodeInternals(node.id);
                });
                fitView({ padding: 0.2, duration: 200 });
                console.log('✅ [ResizeObserver] fitView로 뷰 재조정 완료');
              }
            }, 100);
          }
        });

        resizeObserver.observe(vueFlowContainer.value);
        console.log('✅ [onMounted] ResizeObserver 설정 완료');
      }
    }, 700);
  });

  // 🔥 컴포넌트 언마운트 시 ResizeObserver 정리
  onBeforeUnmount(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
      console.log('🧹 [onBeforeUnmount] ResizeObserver 정리 완료');
    }
  });

  onActivated(async () => {
    console.log('🌊 [onActivated] Vue Flow 재활성화 시작');

    // 🔥 Flow를 일단 숨김
    isFlowReady.value = false;

    // 🔥 DOM 업데이트 대기
    await nextTick();

    // 🔥 두 프레임 대기 후 렌더링 (완전한 초기화)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        flowKey.value = Date.now(); // 고유한 key 생성
        isFlowReady.value = true;
        console.log(
          '✅ [onActivated] VueFlow 재렌더링 완료, flowKey:',
          flowKey.value
        );

        // 🔥 추가 지연 후 window resize 이벤트 발생 (keep-alive 캐싱 문제 해결)
        setTimeout(() => {
          console.log('🔄 [onActivated] window resize 이벤트 발생');
          window.dispatchEvent(new Event('resize'));

          // 🔥 resize 이벤트 후 추가로 fitView 강제 호출
          setTimeout(() => {
            if (nodes.value.length > 0) {
              console.log('🔄 [onActivated] 강제 fitView 호출');
              nodes.value.forEach((node) => {
                updateNodeInternals(node.id);
              });
              fitView({ padding: 0.2, duration: 300 });
              console.log('✅ [onActivated] 패널 완전 초기화 완료');
            }
          }, 200);
        }, 300);
      });
    });
  });

  // 🔥 노드가 추가될 때마다 dimension 업데이트
  watch(
    () => nodes.value.length,
    async (newLength, oldLength) => {
      // 노드가 추가된 경우에만 실행 (Flow가 준비된 상태에서만)
      if (newLength > oldLength && isFlowReady.value) {
        await nextTick();
        // 새로 추가된 노드들의 dimension 업데이트
        nodes.value.forEach((node) => {
          updateNodeInternals(node.id);
        });
        console.log('✅ [watch] 새 노드 dimension 업데이트 완료');
      }
    }
  );

  // 🔥 복합구성용어 내부 자식 노드 간 연결만 표시하는 필터 함수
  const shouldDisplayCompositeChildEdge = (
    sourceNode,
    targetNode,
    sourceOrder,
    targetOrder
  ) => {
    // 같은 부모를 가진 자식인지 확인
    if (!sourceNode.parentNode || !targetNode.parentNode) return true;
    if (sourceNode.parentNode !== targetNode.parentNode) return true;

    // 부모가 복합구성용어인지 확인
    const parentNode = nodes.value.find((n) => n.id === sourceNode.parentNode);
    if (!parentNode || parentNode.data.termType !== 'COMPOSITE') return true;

    // 🔥 복합구성용어 내부 자식인 경우: 순차적 연결만 표시 (order + 1)
    const sourceNodeOrder = sourceNode.data.order || 0;
    const targetNodeOrder = targetNode.data.order || 0;

    // 바로 다음 순번(+1)인 경우만 true
    return targetNodeOrder === sourceNodeOrder + 1;
  };

  // 🔥 addNode 함수 수정 (복합구성용어 처리 추가)
  defineExpose({
    clearPanel,
    addNode: async (nodeData) => {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📦 addNode 호출:', nodeData.termName);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      const relations = nodeData.relations || { asParent: [], asPassive: [] };
      const compositeChildren = nodeData.compositeChildren || [];
      const isComposite =
        nodeData.termType === 'COMPOSITE' && compositeChildren.length > 0;

      console.log('📊 노드 데이터:', {
        termName: nodeData.termName,
        termId: nodeData.termId,
        termType: nodeData.termType,
        isComposite: isComposite,
        compositeChildrenCount: compositeChildren.length,
        relations: {
          asParent: relations.asParent?.length || 0,
          asPassive: relations.asPassive?.length || 0,
        },
      });

      // 🔥 부모 노드 생성
      const parentNode = {
        id: `term-${nodeIdCounter++}`,
        type: 'termNode',
        position: {
          x: Math.random() * 300 + 100,
          y: Math.random() * 200 + 100,
        },
        draggable: true,
        data: {
          ...nodeData,
          termId: nodeData.termId,
          relations: relations,
          compositeChildren: compositeChildren,
          compositeChildrenCount: compositeChildren.length,
          isParent: isComposite,
          isTopLevelParent: isComposite,
        },
      };

      console.log('➕ 부모 노드 추가:', {
        nodeId: parentNode.id,
        termId: parentNode.data.termId,
        termName: parentNode.data.termName,
        isComposite: isComposite,
      });

      nodes.value.push(parentNode);

      // 🔥 복합구성용어인 경우 자식 노드들 자동 생성
      if (isComposite) {
        console.log(
          `\n🔧 복합구성용어 자식 노드 생성 시작 (${compositeChildren.length}개)`
        );

        // sortOrder 기준으로 정렬
        const sortedChildren = [...compositeChildren].sort(
          (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
        );

        const childNodes = [];

        for (let index = 0; index < sortedChildren.length; index++) {
          const compositeChild = sortedChildren[index];
          const childTermData = compositeChild.childTerm;

          // 🔥 자식 노드 위치 설정 (headerHeight 포함)
          const childNode = {
            id: `term-${nodeIdCounter++}`,
            type: 'termNode',
            parentNode: parentNode.id,
            extent: 'parent',
            draggable: true,
            position: {
              x: CHILD_LAYOUT.horizontalPadding,
              y:
                CHILD_LAYOUT.headerHeight +
                index * (CHILD_LAYOUT.childHeight + CHILD_LAYOUT.childGap),
            },
            style: {
              width: `${CHILD_LAYOUT.childWidth}px`,
              minWidth: `${CHILD_LAYOUT.childWidth}px`,
              maxWidth: `${CHILD_LAYOUT.childWidth}px`,
              height: `${CHILD_LAYOUT.childHeight}px`,
              minHeight: `${CHILD_LAYOUT.childHeight}px`,
            },
            data: {
              // ...existing data...
            },
          };

          childNodes.push(childNode);
          nodes.value.push(childNode);
        }

        // 🔥 부모 노드 스타일 업데이트
        await nextTick();
        updateParentStyle(parentNode);

        console.log(
          `\n✅ 복합구성용어 자식 노드 생성 완료 (총 ${childNodes.length}개)`
        );

        // 🔥 자식 노드들의 자동 엣지 연결
        await nextTick();
        setTimeout(() => {
          childNodes.forEach((childNode) => {
            createAutoEdgesForNode(childNode);
          });
          console.log('✅ 자식 노드들의 관계 엣지 생성 완료');
        }, 150);
      }

      // 🔥 부모 노드의 자동 엣지 연결
      await nextTick();
      setTimeout(() => {
        createAutoEdgesForNode(parentNode);
      }, 100);

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return parentNode;
    },
    getNodes: () => nodes.value,
    getEdges: () => edges.value,
    reinitializeAllEdges,
    recreateNodeEdges: (nodeId) => {
      const node = nodes.value.find((n) => n.id === nodeId);
      if (node) {
        edges.value = edges.value.filter(
          (edge) =>
            !(
              (edge.source === nodeId || edge.target === nodeId) &&
              edge.data.isAutoGenerated
            )
        );

        nextTick(() => {
          createAutoEdgesForNode(node);
        });
      }
    },
  });
  // 추가 코드
  // 비즈니스 관계유형 변경 핸들러
  const onChangeBizRelType = (bizRelType) => {
    console.log('Selected Business Relationship Type:', bizRelType);

    switch (bizRelType) {
      case '':
        newRelationship.relationshipType = '';
        newRelationship.description = '';
        break;
      case 'SIMILAR':
        newRelationship.relationshipType = 'SIMILAR';
        newRelationship.description = `${pendingConnection.sourceNodeData.termName} 과 ${pendingConnection.targetNodeData.termName} 는 유사관계 입니다.`;
        break;
      case 'ASSOCIATION':
        newRelationship.relationshipType = 'ASSOCIATION';
        newRelationship.description = `${pendingConnection.sourceNodeData.termName} 과 ${pendingConnection.targetNodeData.termName} 는 동등관계 입니다.`;
        break;
      case 'COMPOSITION':
        newRelationship.relationshipType = 'COMPOSITION';
        newRelationship.description = `${pendingConnection.sourceNodeData.termName} 과 ${pendingConnection.targetNodeData.termName} 는 소속관계 입니다.`;
        break;
      case 'ADDITION':
        newRelationship.relationshipType = 'ADDITION';
        newRelationship.description = `${pendingConnection.sourceNodeData.termName} 과 ${pendingConnection.targetNodeData.termName} 는 더하기 관계 입니다.`;
        break;
      case 'SUBTRACTION':
        newRelationship.relationshipType = 'SUBTRACTION';
        newRelationship.description = `${pendingConnection.sourceNodeData.termName} 과 ${pendingConnection.targetNodeData.termName} 는 뺄셈 관계 입니다.`;
        break;
      case 'MULTIPLICATION':
        newRelationship.relationshipType = 'MULTIPLICATION';
        newRelationship.description = `${pendingConnection.sourceNodeData.termName} 과 ${pendingConnection.targetNodeData.termName} 는 곱셈 관계 입니다.`;
        break;
      case 'DIVISION':
        newRelationship.relationshipType = 'DIVISION';
        newRelationship.description = `${pendingConnection.sourceNodeData.termName} 과 ${pendingConnection.targetNodeData.termName} 는 나눗셈 관계 입니다.`;
        break;
      default:
        newRelationship.relationshipType = '';
    }
  };

  // 🔥 관계 선택 팝업 상태
  const showRelationSelectionPopup = ref(false);
  const relationSelectionData = ref({
    edgeId: null,
    sourceNodeName: '',
    targetNodeName: '',
    availableRelations: [],
    currentRelationId: null,
  });
</script>

<style lang="scss" scoped>
  .vue-flow-panel {
    width: 100%;
    height: 100%;
    position: relative;
    background: #f8fafc;
    overflow: hidden;
  }

  // 🔥 컨트롤 버튼 (사이드바 상태에 따라 이동)
  .flow-controls {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    gap: 8px;
    z-index: 10;
    transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &.sidebar-open {
      right: 416px;
    }
  }

  .control-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    color: #374151;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      background: #f9fafb;
      border-color: #9ca3af;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    &.add-term.active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }

    &.clear-panel:hover {
      background: #fef2f2;
      border-color: #fca5a5;
      color: #dc2626;
    }
  }

  .vue-flow-container {
    width: 100%;
    height: 100%;
    position: relative;

    &.add-term-mode {
      cursor: crosshair;
    }
  }

  // 🔥 드래그 안내 메시지
  .drag-indicator {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    font-size: 13px;
    z-index: 100;
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  // 팝업 오버레이
  .term-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 1000;
    backdrop-filter: blur(2px);
  }

  .term-popup {
    position: fixed;
    width: 320px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    z-index: 1001;
    max-height: 90vh;
    overflow-y: auto;
  }

  .relationship-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .relationship-popup {
    background: white;
    border-radius: 12px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    width: 500px;
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
  }

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid #e2e8f0;

    h3 {
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

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover {
        background: rgba(0, 0, 0, 0.1);
        color: #1e293b;
      }
    }
  }

  .popup-body {
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

    .node-info {
      flex: 1;
      text-align: center;

      .node-name {
        font-weight: 600;
        color: #1e293b;
      }
    }

    .arrow {
      font-size: 20px;
      color: #3b82f6;
      font-weight: bold;
    }
  }

  .popup-form {
    padding: 20px;
  }

  .form-group {
    margin-bottom: 16px;

    label {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 500;
      color: #374151;
    }

    input,
    select,
    textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 13px;
      background: white;
      transition: all 0.2s ease;
      box-sizing: border-box;

      &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      &::placeholder {
        color: #9ca3af;
      }
    }

    textarea {
      resize: vertical;
      min-height: 60px;
    }
  }

  .form-actions {
    display: flex;
    gap: 8px;
    margin-top: 20px;

    button {
      flex: 1;
      padding: 10px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &.cancel-button {
        background: white;
        border: 1px solid #d1d5db;
        color: #374151;

        &:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }
      }

      &.create-button {
        background: #3b82f6;
        border: 1px solid #3b82f6;
        color: white;

        &:hover {
          background: #2563eb;
          border-color: #2563eb;
        }
      }
    }
  }

  // 🔥 안내 메시지
  .instruction-message {
    position: absolute;
    top: 70px;
    right: 16px;
    z-index: 5;
    pointer-events: none;
    transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    .flow-controls.sidebar-open ~ & {
      right: 416px;
    }
  }

  .instruction-content {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: rgba(59, 130, 246, 0.95);
    color: white;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    animation: pulse 2s infinite;

    svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.95;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.02);
    }
  }

  // 🔥 Vue Flow 기본 스타일
  :deep(.vue-flow__pane) {
    cursor: inherit;
  }

  :deep(.vue-flow__background) {
    background-color: #f8fafc;
  }

  :deep(.vue-flow__controls) {
    bottom: 16px;
    left: 16px;
  }

  :deep(.vue-flow__minimap) {
    bottom: 16px;
    right: 16px;
  }

  // 🔥 부모 노드 그룹 배경 (Vue Flow의 기본 레이어 활용)
  :deep(.vue-flow__node-termNode.parent-group) {
    position: relative;
    width: 280px !important;
    min-width: 280px !important;
    max-width: 280px !important;
    height: 120px !important;
    min-height: 120px !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;

    // 🔥 배경 패널 (::before 사용)
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: var(--background-width, 440px); // 🔥 CSS 변수 사용
      height: var(--group-height, 790px);
      background: rgba(239, 246, 255, 0.6);
      border: 2px solid #3b82f6;
      border-radius: 16px;
      z-index: -1;
      pointer-events: none;
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
      background-image: linear-gradient(
          rgba(255, 255, 255, 0.1) 1px,
          transparent 1px
        ),
        linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
      background-size: 20px 20px;
    }

    // 🔥 헤더 영역
    .term-name {
      color: white;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      padding-top: 10px;
    }

    .children-count {
      position: absolute;
      top: 15px;
      right: 15px;
      background: rgba(255, 255, 255, 0.9);
      color: #3b82f6;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  // 🔥 복합구성용어 배경 스타일
  :deep(.vue-flow__node-termNode.parent-group.composite-parent) {
    &::before {
      border-color: #8b5cf6;
      background: rgba(250, 245, 255, 0.6);
      box-shadow: 0 8px 24px rgba(139, 92, 246, 0.15);
    }

    .children-count {
      background: rgba(255, 255, 255, 0.95);
      color: #8b5cf6;
      border: 2px solid #8b5cf6;
    }
  }

  // 🔥 Handle 기본 스타일
  :deep(.vue-flow__handle) {
    width: 10px;
    height: 10px;
    background: #3b82f6;
    border: 2px solid white;
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.3);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
    }
  }

  // 🔥 복합구성용어 자식 노드의 Handle
  :deep(.vue-flow__node.composite-child) {
    // 좌우 Handle 숨김
    .vue-flow__handle-left,
    .vue-flow__handle-right {
      display: none !important;
    }

    // 상하 Handle 스타일링
    .vue-flow__handle-top,
    .vue-flow__handle-bottom {
      width: 12px;
      height: 12px;
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      border: 2px solid white;
      box-shadow: 0 3px 8px rgba(139, 92, 246, 0.5);

      &:hover {
        transform: scale(1.5) translateX(-50%);
        box-shadow: 0 5px 15px rgba(139, 92, 246, 0.7);
        background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      }
    }
  }

  // 🔥 연결 모드
  :deep(.vue-flow.connecting-mode) {
    .vue-flow__handle {
      opacity: 1 !important;
      transform: scale(1.2);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
    }
  }

  // 🔥 드래그 중인 노드
  :deep(.vue-flow__node.dragging) {
    opacity: 0.8;
    z-index: 100;
  }

  // 🔥 자식 노드 드래그 스타일
  :deep(.vue-flow__node[data-parent].dragging) {
    opacity: 0.8;
    transform: scale(0.98);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
  }

  // 🔥 Vue Flow 엣지 기본 스타일만 유지
  :deep(.vue-flow__edge) {
    cursor: pointer;

    &.selected {
      .vue-flow__edge-path {
        stroke: #10b981 !important;
        stroke-width: 3.5 !important;
        filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.6));
      }
    }

    &:hover {
      .vue-flow__edge-path {
        stroke-width: 4 !important;
      }
    }
  }

  // 🔥 부모 노드 그룹 배경
  :deep(.vue-flow__node-termNode.parent-group) {
    position: relative;
    width: 280px !important;
    min-width: 280px !important;
    max-width: 280px !important;
    height: 120px !important;
    min-height: 120px !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 400px;
      height: var(--group-height, 790px);
      background: rgba(239, 246, 255, 0.6);
      border: 2px solid #3b82f6;
      border-radius: 16px;
      z-index: -1;
      pointer-events: none; // 🔥 클릭 이벤트 통과
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
    }
  }

  // 🔥 반응형
  @media (max-width: 768px) {
    .flow-controls {
      top: 8px;
      right: 8px;
      flex-direction: column;

      &.sidebar-open {
        right: 8px;
      }
    }

    .term-popup {
      width: 280px;
      left: 50% !important;
      top: 50% !important;
      transform: translate(-50%, -50%);
    }

    .instruction-message {
      top: 60px;
      right: 8px;

      .flow-controls.sidebar-open ~ & {
        right: 8px;
      }
    }

    .drag-indicator {
      max-width: 280px;
      padding: 12px 16px;
    }
  }
</style>
