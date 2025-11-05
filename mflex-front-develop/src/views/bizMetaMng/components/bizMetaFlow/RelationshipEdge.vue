<template>
  <g
    class="relationship-edge"
    :class="{ selected: selected }"
    @click.stop="handleEdgeClick"
  >
    <!-- 🔥 1. 투명한 클릭 영역 -->
    <path
      :d="edgePath"
      stroke="transparent"
      :stroke-width="20"
      fill="none"
      class="edge-click-area"
      @click.stop="handleEdgeClick"
    />

    <!-- 🔥 2. 실제 보이는 선 -->
    <path
      :d="edgePath"
      :style="edgeStyle"
      class="vue-flow__edge-path edge-visual"
      stroke-linecap="round"
      fill="none"
    />

    <!-- 🔥🔥🔥 3. 복합구성 내부 자식: 관계 선택 버튼 -->
    <foreignObject
      v-if="isCompositeChildEdge"
      :x="targetButtonPosition.x"
      :y="targetButtonPosition.y"
      width="140"
      height="36"
      class="edge-label-wrapper"
      style="pointer-events: all; overflow: visible"
    >
      <div
        class="edge-relation-selector near-target"
        :class="{
          'single-relation': !hasMultipleRelations,
        }"
        @click.stop.prevent="openRelationPopup"
        @mousedown.stop
        @mouseup.stop
        :title="`현재: ${currentRelationLabel} (총 ${totalRelations}개 관계)`"
      >
        <span class="relation-label">
          {{ currentRelationLabel }}
        </span>
        <span v-if="hasMultipleRelations" class="relation-count">{{
          totalRelations
        }}</span>
        <svg
          v-if="hasMultipleRelations"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="popup-icon"
        >
          <path
            fill-rule="evenodd"
            d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </foreignObject>

    <!-- 🔥 4. 단일 관계 라벨 (일반 노드 전용 - 복합구성 자식 제외) -->
    <foreignObject
      v-if="
        !isCompositeChildEdge &&
        !hasMultipleSourceTargetRelationships &&
        relationshipLabel
      "
      :x="labelTargetHandlePosition.x"
      :y="labelTargetHandlePosition.y"
      width="140"
      height="32"
      class="relationship-label-container side-label"
      style="overflow: visible; pointer-events: all"
    >
      <div
        class="relationship-label"
        :class="{
          'left-side': labelTargetHandlePosition.side === 'left',
          'right-side': labelTargetHandlePosition.side === 'right',
        }"
        :title="props.data?.description"
        @click.stop="handleEdgeClick"
      >
        <div class="label-icon">
          <svg
            v-if="relationshipIcon"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="icon"
          >
            <path :d="relationshipIcon" />
          </svg>
        </div>
        <span class="label-text">{{ relationshipLabel }}</span>
      </div>
    </foreignObject>

    <!-- 🔥 5. 여러 관계 마름모 마커 (일반 노드만) -->
    <g
      v-if="!isCompositeChildEdge && hasMultipleSourceTargetRelationships"
      :transform="`translate(${targetHandleDiamondPosition.x}, ${targetHandleDiamondPosition.y})`"
      class="multi-relationship-diamond"
      @click.stop="toggleTooltipOnClick"
      @mouseenter="showRelationshipsTooltip"
      @mouseleave="hideRelationshipsTooltip"
    >
      <path
        d="M0,-14 L14,0 L0,14 L-14,0 Z"
        :fill="showTooltip ? '#3b82f6' : edgeColor"
        class="diamond-marker"
      />
      <text
        x="0"
        y="5"
        text-anchor="middle"
        fill="white"
        font-size="12"
        font-weight="700"
        class="count-text"
        pointer-events="none"
      >
        {{ sourceTargetRelationshipCount }}
      </text>
    </g>

    <!-- 🔥 6. 관계 목록 툴팁 (일반 노드만) -->
    <foreignObject
      v-if="
        !isCompositeChildEdge &&
        hasMultipleSourceTargetRelationships &&
        showTooltip
      "
      :x="tooltipTargetHandlePosition.x"
      :y="tooltipTargetHandlePosition.y"
      width="320"
      :height="Math.min(80 + sourceTargetRelationships.length * 80, 500)"
      class="relationships-tooltip-container side-tooltip"
    >
      <div
        class="relationships-tooltip"
        :class="{
          'left-side': tooltipTargetHandlePosition.side === 'left',
          'right-side': tooltipTargetHandlePosition.side === 'right',
        }"
        @mouseenter="handleTooltipMouseEnter"
        @mouseleave="handleTooltipMouseLeave"
        @click.stop
      >
        <div class="tooltip-header">
          <div class="header-left">
            <span class="node-name">{{ sourceNodeName }}</span>
            <span class="arrow">→</span>
            <span class="node-name">{{ targetNodeName }}</span>
          </div>
          <span class="label"
            >({{ sourceTargetRelationshipCount }}개 관계)</span
          >
          <button class="close-tooltip-btn" @click.stop="closeTooltip">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
              />
            </svg>
          </button>
        </div>
        <div class="tooltip-divider"></div>
        <div class="relationships-list">
          <div
            v-for="(rel, index) in sourceTargetRelationships"
            :key="rel.termRelId || index"
            class="relationship-item"
            :class="{
              active:
                rel.termRelId === currentDisplayRelation?.termRelId ||
                rel.relType === currentDisplayRelation?.relType,
            }"
            @click.stop="handleRelationshipItemClick(rel)"
          >
            <div class="item-number">{{ index + 1 }}</div>
            <div
              class="rel-icon"
              :style="{
                background: getRelationshipColor(rel.relType),
              }"
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path :d="getRelationshipIcon(rel.relType)" />
              </svg>
            </div>
            <div class="rel-content">
              <div class="rel-header">
                <span class="rel-type">{{
                  getRelationshipLabel(rel.relType)
                }}</span>
                <span
                  v-if="
                    rel.termRelId === currentDisplayRelation?.termRelId ||
                    rel.relType === currentDisplayRelation?.relType
                  "
                  class="current-badge"
                  >현재</span
                >
              </div>
              <div v-if="rel.rel_expln" class="rel-description">
                {{ rel.rel_expln }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </foreignObject>

    <!-- 🔥 마커 정의 -->
    <defs>
      <!-- 기본 화살표 마커 (단일 관계용) -->
      <marker
        v-if="!hasMultipleSourceTargetRelationships"
        :id="`arrow-${id}`"
        viewBox="0 0 20 20"
        refX="18"
        refY="10"
        markerWidth="12"
        markerHeight="12"
        orient="auto-start-reverse"
        markerUnits="strokeWidth"
      >
        <path d="M0,0 L0,20 L20,10 z" :fill="edgeColor" stroke="none" />
      </marker>

      <!-- 다이아몬드 마커 (여러 관계용) -->
      <marker
        v-if="hasMultipleSourceTargetRelationships"
        :id="`diamond-multi-${id}`"
        viewBox="0 0 20 20"
        refX="10"
        refY="10"
        markerWidth="12"
        markerHeight="12"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <polygon
          points="10,2 18,10 10,18 2,10"
          :fill="edgeColor"
          :stroke="edgeColor"
          stroke-width="1"
        />
      </marker>

      <!-- 양방향 관계용 다이아몬드 마커 -->
      <marker
        v-if="isBidirectional"
        :id="`diamond-${id}`"
        viewBox="0 0 20 20"
        refX="10"
        refY="10"
        markerWidth="10"
        markerHeight="10"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <polygon
          points="10,2 18,10 10,18 2,10"
          :fill="edgeColor"
          :stroke="edgeColor"
          stroke-width="1"
        />
      </marker>
    </defs>
  </g>

  <!-- 🔥 관계 선택 팝업 컴포넌트 -->
  <RelationSelectionPopup
    v-model="showRelationPopup"
    :source-node-name="sourceNodeName"
    :target-node-name="targetNodeName"
    :available-relations="availableRelations"
    :current-relation-id="currentRelationId"
    @select-relation="handleSelectRelation"
  />
</template>

<script setup>
  import { computed, ref, inject } from 'vue';
  import { getBezierPath, Position } from '@vue-flow/core';
  import RelationSelectionPopup from './RelationSelectionPopup.vue';

  const props = defineProps([
    'id',
    'sourceX',
    'sourceY',
    'targetX',
    'targetY',
    'sourcePosition',
    'targetPosition',
    'data',
    'markerEnd',
    'style',
    'selected',
    'source',
    'target',
    'sourceNode',
    'targetNode',
  ]);

  const emit = defineEmits(['edge-click', 'relation-changed']);

  // 🔥 툴팁 클릭 고정 상태
  const isTooltipPinned = ref(false);

  // 🔥 타겟 핸들 위치 파악 함수
  const getTargetHandlePosition = () => {
    const targetPos = props.targetPosition;
    // Position enum: 'top', 'bottom', 'left', 'right'
    return targetPos || 'top';
  };

  // 🔥 소스 핸들 위치 파악 함수
  const getSourceHandlePosition = () => {
    const sourcePos = props.sourcePosition;
    return sourcePos || 'bottom';
  };

  // 🔥 타겟 핸들 근처 버튼 위치 계산 (일반 노드용 - 핸들 위치별로 다르게)
  const targetHandleButtonPosition = computed(() => {
    const targetX = props.targetX;
    const targetY = props.targetY;
    const targetHandlePos = getTargetHandlePosition();

    let offsetX = 0;
    let offsetY = 0;
    let side = 'right';

    switch (targetHandlePos) {
      case 'top':
        offsetX = -70;
        offsetY = -60;
        side = 'top';
        break;
      case 'bottom':
        offsetX = -70;
        offsetY = 25;
        side = 'bottom';
        break;
      case 'left':
        offsetX = -160;
        offsetY = -18;
        side = 'left';
        break;
      case 'right':
        offsetX = 20;
        offsetY = -18;
        side = 'right';
        break;
    }

    return {
      x: targetX + offsetX,
      y: targetY + offsetY,
      side: side,
    };
  });

  // 🔥 타겟 핸들 근처 라벨 위치 (핸들 위치별로 다르게)
  const labelTargetHandlePosition = computed(() => {
    const targetX = props.targetX;
    const targetY = props.targetY;
    const sourceX = props.sourceX;
    const sourceY = props.sourceY;
    const targetHandlePos = getTargetHandlePosition();

    // 엣지 방향 벡터 계산
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) {
      return {
        x: targetX - 70,
        y: targetY - 16,
        side: 'left',
      };
    }

    // 노드 핸들 위치 (타겟에서 30px 떨어진 지점)
    const handleDistance = 30;
    const handleRatio = (length - handleDistance) / length;
    const handleX = sourceX + dx * handleRatio;
    const handleY = sourceY + dy * handleRatio;

    let offsetX = 0;
    let offsetY = 0;
    let side = 'right';

    switch (targetHandlePos) {
      case 'top':
        // 타겟이 위쪽 핸들 -> 라벨을 위쪽에 배치
        offsetX = -70;
        offsetY = -50;
        side = 'top';
        break;
      case 'bottom':
        // 타겟이 아래쪽 핸들 -> 라벨을 아래쪽에 배치
        offsetX = -70;
        offsetY = 20;
        side = 'bottom';
        break;
      case 'left':
        // 타겟이 왼쪽 핸들 -> 라벨을 왼쪽에 배치
        offsetX = -155;
        offsetY = -16;
        side = 'left';
        break;
      case 'right':
        // 타겟이 오른쪽 핸들 -> 라벨을 오른쪽에 배치
        offsetX = 15;
        offsetY = -16;
        side = 'right';
        break;
    }

    return {
      x: handleX + offsetX,
      y: handleY + offsetY,
      side: side,
    };
  });

  // 🔥 타겟 핸들 근처 다이아몬드 위치 (핸들 위치별로 다르게)
  const targetHandleDiamondPosition = computed(() => {
    const targetX = props.targetX;
    const targetY = props.targetY;
    const sourceX = props.sourceX;
    const sourceY = props.sourceY;
    const targetHandlePos = getTargetHandlePosition();

    // 타겟 핸들로부터의 거리
    const distance = 35;
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) return { x: targetX, y: targetY };

    const ratio = (length - distance) / length;

    return {
      x: sourceX + dx * ratio,
      y: sourceY + dy * ratio,
    };
  });

  // 🔥 툴팁 타겟 핸들 근처 위치 (핸들 위치별로 다르게)
  const tooltipTargetHandlePosition = computed(() => {
    const diamondPos = targetHandleDiamondPosition.value;
    const targetHandlePos = getTargetHandlePosition();
    const sourceX = props.sourceX;
    const sourceY = props.sourceY;

    let offsetX = 0;
    let offsetY = 0;
    let side = 'right';

    switch (targetHandlePos) {
      case 'top':
        // 타겟이 위쪽 핸들 -> 툴팁을 위쪽에 배치
        offsetX = -160;
        offsetY =
          -Math.min(80 + sourceTargetRelationships.value.length * 80, 500) - 20;
        side = 'top';
        break;
      case 'bottom':
        // 타겟이 아래쪽 핸들 -> 툴팁을 아래쪽에 배치
        offsetX = -160;
        offsetY = 30;
        side = 'bottom';
        break;
      case 'left':
        // 타겟이 왼쪽 핸들 -> 툴팁을 왼쪽에 배치
        offsetX = -340;
        offsetY = -120;
        side = 'left';
        break;
      case 'right':
        // 타겟이 오른쪽 핸들 -> 툴팁을 오른쪽에 배치
        offsetX = 20;
        offsetY = -120;
        side = 'right';
        break;
    }

    return {
      x: diamondPos.x + offsetX,
      y: diamondPos.y + offsetY,
      side: side,
    };
  });

  // 🔥 툴팁 클릭으로 토글
  const toggleTooltipOnClick = (event) => {
    event.stopPropagation();

    if (showTooltip.value) {
      // 이미 열려있으면 핀 상태 토글
      isTooltipPinned.value = !isTooltipPinned.value;
      if (!isTooltipPinned.value) {
        showTooltip.value = false;
      }
    } else {
      // 닫혀있으면 열고 핀 고정
      showTooltip.value = true;
      isTooltipPinned.value = true;
    }
  };

  // 🔥 툴팁 닫기
  const closeTooltip = () => {
    isTooltipPinned.value = false;
    showTooltip.value = false;
  };

  // 🔥 툴팁 표시 (수정)
  const showRelationshipsTooltip = () => {
    if (isTooltipPinned.value) return; // 핀 고정된 경우 무시

    if (hideTooltipTimeout) {
      clearTimeout(hideTooltipTimeout);
      hideTooltipTimeout = null;
    }
    showTooltip.value = true;
  };

  // 🔥 모든 엣지와 노드 정보 가져오기
  const getAllEdges = inject('getAllEdges', () => []);
  const getNodeById = inject('getNodeById', (id) => null);

  // 🔥 상태
  const showTooltip = ref(false);
  const showRelationPopup = ref(false);
  const isMouseOverTooltip = ref(false);
  let hideTooltipTimeout = null;

  // 🔥 타겟 노드 근처 버튼 위치 계산 (복합구성용 - 관계선 왼쪽으로만 이동)
  const targetButtonPosition = computed(() => {
    const targetX = props.targetX;
    const targetY = props.targetY;
    const sourceX = props.sourceX;
    const sourceY = props.sourceY;

    // 엣지 중간 지점 계산
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;

    // 엣지 방향 벡터
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const angle = Math.atan2(dy, dx);

    // 왼쪽 수직 방향
    const perpAngle = angle + Math.PI / 2;
    const offsetDistance = 85;

    const perpX = Math.cos(perpAngle) * offsetDistance;
    const perpY = Math.sin(perpAngle) * offsetDistance;

    return {
      x: midX + perpX - 70,
      y: midY + perpY - 18,
      side: 'left',
    };
  });

  // 🔥 엣지 좌우 라벨 위치 계산
  const labelSidePosition = computed(() => {
    const midX = (props.sourceX + props.targetX) / 2;
    const midY = (props.sourceY + props.targetY) / 2;

    const dx = props.targetX - props.sourceX;
    const dy = props.targetY - props.sourceY;
    const angle = Math.atan2(dy, dx);

    const perpAngle = angle + Math.PI / 2;
    const offset = 25;

    const offsetX = Math.cos(perpAngle) * offset;
    const offsetY = Math.sin(perpAngle) * offset;

    const side = offsetY < 0 ? 'left' : 'right';

    return {
      x: midX + offsetX - 70,
      y: midY + offsetY - 16,
      side: side,
    };
  });

  // 🔥 타겟 근처 다이아몬드 위치 계산
  const targetDiamondPosition = computed(() => {
    const targetX = props.targetX;
    const targetY = props.targetY;
    const sourceX = props.sourceX;
    const sourceY = props.sourceY;

    const distance = 50;
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const length = Math.sqrt(dx * dx + dy * dy);

    const ratio = (length - distance) / length;

    return {
      x: sourceX + dx * ratio,
      y: sourceY + dy * ratio,
    };
  });

  // 🔥 툴팁 좌우 위치 계산
  const tooltipSidePosition = computed(() => {
    const diamondPos = targetDiamondPosition.value;
    const sourceX = props.sourceX;

    const isRightSide = diamondPos.x > sourceX;
    const offsetX = isRightSide ? -320 : 20;
    const offsetY = -100;

    return {
      x: diamondPos.x + offsetX,
      y: diamondPos.y + offsetY,
      side: isRightSide ? 'left' : 'right',
    };
  });

  // 🔥 복합구성 자식 엣지 확인
  const isCompositeChildEdge = computed(() => {
    return props.data?.isCompositeChild === true;
  });

  // 🔥 compositeRelations 데이터
  const compositeRelations = computed(() => {
    return props.data?.compositeRelations || [];
  });

  // 🔥 사용 가능한 관계 목록
  const availableRelations = computed(() => {
    return props.data?.availableRelations || [];
  });

  // 🔥 현재 활성 관계 찾기
  const currentActiveRelation = computed(() => {
    if (compositeRelations.value.length === 0) {
      return availableRelations.value[0];
    }

    const activeCompositeRel = compositeRelations.value[0];

    if (!activeCompositeRel) {
      return availableRelations.value[0];
    }

    const matchedRel = availableRelations.value.find(
      (rel) =>
        String(rel.termRelId) === String(activeCompositeRel.compositeRelId)
    );

    console.log(
      '🎯 currentActiveRelation:',
      matchedRel,
      'activeCompositeRel:',
      activeCompositeRel,
      'availableRelations:',
      availableRelations.value
    );

    return matchedRel || availableRelations.value[0];
  });

  // 🔥 여러 관계 존재 여부
  const hasMultipleRelations = computed(() => {
    return availableRelations.value.length > 1;
  });

  // 🔥 현재 선택된 관계 ID
  const currentRelationId = computed(() => {
    return currentActiveRelation.value?.termRelId || props.data?.relationshipId;
  });

  // 🔥 전체 관계 개수
  const totalRelations = computed(() => {
    return availableRelations.value.length;
  });

  // 🔥🔥🔥 현재 관계 라벨 (수정: currentActiveRelation 기반)
  const currentRelationLabel = computed(() => {
    // 복합구성 자식 엣지인 경우 currentActiveRelation 사용
    if (isCompositeChildEdge.value && currentActiveRelation.value) {
      const label = getRelationshipLabel(currentActiveRelation.value.relType);
      console.log(
        '🏷️ currentRelationLabel (복합구성):',
        label,
        currentActiveRelation.value.relType
      );
      return label;
    }

    // 일반 엣지인 경우 props.data.relationshipType 사용
    const label = getRelationshipLabel(props.data?.relationshipType);
    console.log(
      '🏷️ currentRelationLabel (일반):',
      label,
      props.data?.relationshipType
    );
    return label;
  });

  // 🔥🔥🔥 단일 엣지의 관계 배열 (일반 노드 + 복합구성 자식 통합)
  const edgeRelationships = computed(() => {
    // 복합구성용어 자식 엣지: availableRelations 사용
    if (isCompositeChildEdge.value) {
      const relations = (props.data?.availableRelations || []).filter(
        (rel) => rel && rel.relType
      );
      console.log(
        `🔍 [edgeRelationships] 복합구성 자식 - availableRelations:`,
        relations.length,
        '개'
      );
      return relations;
    }

    // 일반 노드 엣지: relationships 배열 사용
    // relationships가 없으면 기존 단일 관계 데이터로 배열 생성 (하위 호환)
    if (props.data?.relationships && props.data.relationships.length > 0) {
      // 🔥 undefined 또는 유효하지 않은 관계 필터링
      const validRelationships = props.data.relationships.filter(
        (rel) => rel && rel.relType
      );
      console.log(
        `🔍 [edgeRelationships] 일반 노드 - relationships:`,
        validRelationships.length,
        '개 (원본:',
        props.data.relationships.length,
        '개)'
      );
      return validRelationships;
    }

    // 🔥 하위 호환: relationships 배열이 없는 구 엣지는 단일 관계로 처리
    if (!props.data?.relationshipType) {
      console.warn('⚠️ [edgeRelationships] relationshipType 없음:', props.data);
      return [];
    }

    const fallbackRelation = {
      termRelId: props.data?.relationshipId,
      relType: props.data?.relationshipType,
      rel_expln: props.data?.description || '',
      regDate: props.data?.createdAt,
    };
    console.log(
      `🔍 [edgeRelationships] 하위 호환 - 단일 관계:`,
      fallbackRelation.relType
    );
    return [fallbackRelation];
  });

  // 🔥 관계 개수
  const relationshipCount = computed(() => {
    const count = edgeRelationships.value.length;
    console.log(`🔍 [relationshipCount] ${count}개`);
    return count;
  });

  // 🔥 여러 관계 존재 여부
  const hasMultipleRelationships = computed(() => {
    const hasMultiple = relationshipCount.value > 1;
    console.log(
      `🔍 [hasMultipleRelationships] ${hasMultiple} (count: ${relationshipCount.value})`
    );
    return hasMultiple;
  });

  // 🔥 현재 표시 중인 관계 (기본: 첫 번째 또는 COMPOSITION)
  const currentDisplayRelation = computed(() => {
    if (isCompositeChildEdge.value && compositeRelations.value.length > 0) {
      // 복합구성용어는 기존 로직 사용
      const activeCompositeRel = compositeRelations.value[0];
      return (
        edgeRelationships.value.find(
          (rel) =>
            String(rel.termRelId) === String(activeCompositeRel.compositeRelId)
        ) || edgeRelationships.value[0]
      );
    }

    // 일반 노드: COMPOSITION 우선, 없으면 첫 번째
    return (
      edgeRelationships.value.find((r) => r.relType === 'COMPOSITION') ||
      edgeRelationships.value[0]
    );
  });

  // 🔥 하위 호환: sourceTargetRelationships (기존 코드 호환용)
  const sourceTargetRelationships = computed(() => {
    return edgeRelationships.value;
  });

  const sourceTargetRelationshipCount = computed(() => {
    return relationshipCount.value;
  });

  const hasMultipleSourceTargetRelationships = computed(() => {
    return hasMultipleRelationships.value;
  });

  // 🔥 소스에서 시작하는 모든 관계
  const sourceRelationships = computed(() => {
    const allEdges = getAllEdges();
    return allEdges.filter((edge) => edge.source === props.source);
  });

  // 🔥 여러 소스 관계 존재 여부
  const hasMultipleSourceRelationships = computed(() => {
    return sourceRelationships.value.length > 1;
  });

  // 🔥 노드 이름
  const sourceNodeName = computed(() => {
    const node = getNodeById(props.source);
    return node?.data?.termName || props.source;
  });

  const targetNodeName = computed(() => {
    const node = getNodeById(props.target);
    return node?.data?.termName || props.target;
  });

  // 🔥 양방향 관계 확인
  const isBidirectional = computed(() => {
    return props.data?.isBidirectional === true;
  });

  // 🔥 관계 라벨 (현재 표시 중인 관계 기준)
  const relationshipLabel = computed(() => {
    if (hasMultipleRelationships.value) {
      // 여러 관계가 있으면 마름모만 표시 (라벨 숨김)
      return null;
    }
    return getRelationshipLabel(currentDisplayRelation.value?.relType);
  });

  // 🔥 관계 아이콘 (현재 표시 중인 관계 기준)
  const relationshipIcon = computed(() => {
    return getRelationshipIcon(currentDisplayRelation.value?.relType);
  });

  // 🔥 엣지 경로
  const edgePath = computed(() => {
    const [path] = getBezierPath({
      sourceX: props.sourceX,
      sourceY: props.sourceY,
      sourcePosition: props.sourcePosition,
      targetX: props.targetX,
      targetY: props.targetY,
      targetPosition: props.targetPosition,
    });
    return path;
  });

  // 🔥 통일된 색상 (현재 표시 중인 관계 기준)
  const edgeColor = computed(() => {
    if (props.selected) return '#10b981';

    // 현재 표시 중인 관계의 색상
    const relType = currentDisplayRelation.value?.relType;
    return getRelationshipColor(relType);
  });

  // 🔥 통일된 엣지 스타일
  const edgeStyle = computed(() => {
    const baseColor = edgeColor.value;

    let style = {
      stroke: baseColor,
      strokeWidth: 2.5,
    };

    // 여러 관계가 있으면 마름모 마커, 없으면 화살표 마커
    if (hasMultipleSourceTargetRelationships.value) {
      style.markerEnd = `url(#diamond-multi-${props.id})`;
    } else {
      style.markerEnd = `url(#arrow-${props.id})`;
    }

    if (props.data?.isBidirectional) {
      style.markerStart = `url(#diamond-${props.id})`;
    }

    return style;
  });

  // 🔥 관계 유형 라벨 매핑
  const getRelationshipLabel = (type) => {
    const typeMap = {
      SIMILAR: '유사',
      ASSOCIATION: '동등',
      COMPOSITION: '소속',
      ADDITION: '더하기',
      SUBTRACTION: '빼기',
      MULTIPLICATION: '곱하기',
      DIVISION: '나누기',
    };
    return typeMap[type] || type;
  };

  // 🔥 관계 유형별 아이콘
  const getRelationshipIcon = (type) => {
    const iconMap = {
      SIMILAR:
        'M10 3a7 7 0 100 14 7 7 0 000-14zm0 2a5 5 0 110 10 5 5 0 010-10z',
      ASSOCIATION:
        'M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z',
      COMPOSITION:
        'M3 7.5A2.5 2.5 0 015.5 5h9A2.5 2.5 0 0117 7.5v5a2.5 2.5 0 01-2.5 2.5h-9A2.5 2.5 0 013 12.5v-5z',
      ADDITION:
        'M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z',
      SUBTRACTION: 'M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z',
      MULTIPLICATION:
        'M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z',
      DIVISION:
        'M10 6a2 2 0 100-4 2 2 0 000 4zM10 18a2 2 0 100-4 2 2 0 000 4zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z',
    };
    return iconMap[type] || iconMap.COMPOSITION;
  };

  // 🔥 관계 유형별 색상
  const getRelationshipColor = (type) => {
    // const colorMap = {
    //   COMPOSITION: '#10b981',
    //   SIMILAR: '#8b5cf6',
    //   ASSOCIATION: '#3b82f6',
    //   ADDITION: '#f59e0b',
    //   SUBTRACTION: '#ef4444',
    //   MULTIPLICATION: '#ec4899',
    //   DIVISION: '#6366f1',
    // };
    // return colorMap[type] || '#64748b';
    return '#64748b';
  };

  // 🔥 팝업 열기
  const openRelationPopup = (event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    emit('relation-changed', {
      edgeId: props.id,
      source: props.source,
      target: props.target,
      sourceNodeName: sourceNodeName.value,
      targetNodeName: targetNodeName.value,
      availableRelations: availableRelations.value,
      currentRelationId: currentRelationId.value,
      compositeRelations: compositeRelations.value,
    });
  };

  // 🔥 관계 선택
  const handleSelectRelation = (relation) => {
    emit('relation-changed', {
      edgeId: props.id,
      source: props.source,
      target: props.target,
      relationshipId: relation.termRelId,
      relationType: relation.relType,
      description: relation.rel_expln,
    });
  };

  // 🔥 엣지 클릭
  const handleEdgeClick = (event) => {
    event.stopPropagation();
    event.preventDefault();

    const edgeData = {
      id: props.id,
      source: props.source,
      target: props.target,
      data: props.data,
      sourceHandle: props.sourceHandle,
      targetHandle: props.targetHandle,
      style: props.style,
      type: 'relationshipEdge',
    };

    emit('edge-click', { edge: edgeData });
  };

  // 🔥 관계 항목 클릭 (현재 엣지 정보와 선택된 관계 정보 전달)
  const handleRelationshipItemClick = (rel) => {
    // 현재 엣지 정보 전체 전달 (rel은 관계 데이터만 포함)
    const edgeData = {
      id: props.id,
      source: props.source,
      target: props.target,
      data: props.data,
      sourceHandle: props.sourceHandle,
      targetHandle: props.targetHandle,
      style: props.style,
      type: 'relationshipEdge',
      selectedRelation: rel, // 선택된 관계 정보 추가
    };

    emit('edge-click', { edge: edgeData });
    closeTooltip();
  };

  // 🔥 툴팁 숨김 (수정)
  const hideRelationshipsTooltip = () => {
    if (isTooltipPinned.value) return; // 핀 고정된 경우 무시

    hideTooltipTimeout = setTimeout(() => {
      showTooltip.value = false;
    }, 300);
  };

  // 🔥 툴팁 마우스 이벤트 (수정)
  const handleTooltipMouseEnter = () => {
    if (hideTooltipTimeout) {
      clearTimeout(hideTooltipTimeout);
      hideTooltipTimeout = null;
    }
    showTooltip.value = true;
  };

  const handleTooltipMouseLeave = () => {
    if (isTooltipPinned.value) return; // 핀 고정된 경우 무시
    hideRelationshipsTooltip();
  };

  // 🔥🔥🔥 새로 추가된 관계인지 확인
  const isNewlyCreatedEdge = computed(() => {
    return props.data?.isNewlyCreated === true;
  });
</script>

<style scoped lang="scss">
  // 🔥 foreignObject 스타일 수정
  .edge-label-wrapper {
    pointer-events: all !important;
    overflow: visible !important;
  }

  .relationship-edge {
    pointer-events: all !important;
    cursor: pointer;
    transition: all 0.2s ease;

    &.selected {
      .edge-visual {
        stroke: #10b981 !important;
        stroke-width: 3.5 !important;
        filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.6));
      }

      .relationship-label {
        border-color: #10b981 !important;
        color: #10b981 !important;
        background: rgba(16, 185, 129, 0.1);

        .label-icon {
          background: #10b981 !important;
        }
      }

      .diamond-marker {
        fill: #10b981 !important;
        stroke: white !important;
      }
    }
  }

  .edge-click-area {
    pointer-events: stroke !important;
    cursor: pointer;

    &:hover {
      stroke-width: 24 !important;
    }
  }

  .edge-visual {
    pointer-events: none !important;
    transition: all 0.2s ease;
  }

  .relationship-edge:hover {
    .edge-visual {
      stroke-width: 4 !important;
      filter: drop-shadow(0 0 6px currentColor);
    }
  }

  .vue-flow__edge-path {
    transition: none;
    pointer-events: stroke;
  }

  // 🔥 관계 선택 버튼 (수정)
  .edge-relation-selector {
    display: flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
    padding: 6px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
    transition: all 0.2s ease;
    user-select: none;
    pointer-events: all !important;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.6);
    }

    &:active {
      transform: scale(0.98);
    }

    // 🔥 단일 관계일 때 스타일
    &.single-relation {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);

      &:hover {
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.6);
      }

      .popup-icon {
        display: none;
      }
    }

    // 🔥🔥🔥 새로 추가된 관계 강조 스타일
    &.newly-created {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
      animation: pulseGlow 2s ease-in-out infinite;

      &:hover {
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.6);
      }
    }

    &.left-side::before {
      content: '◄';
      margin-right: 4px;
      font-size: 10px;
      opacity: 0.7;
    }

    &.right-side::after {
      content: '►';
      margin-left: 4px;
      font-size: 10px;
      opacity: 0.7;
    }

    &.top-side::before {
      content: '▲';
      margin-right: 4px;
      font-size: 10px;
      opacity: 0.7;
    }

    &.bottom-side::after {
      content: '▼';
      margin-left: 4px;
      font-size: 10px;
      opacity: 0.7;
    }

    .relation-label {
      flex: 1;
      white-space: nowrap;
    }

    .relation-count {
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 6px;
      border-radius: 8px;
      font-size: 10px;
    }

    .popup-icon {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }
  }

  // 🔥 마름모 마커 (일반 노드)
  .multi-relationship-diamond {
    pointer-events: all;
    cursor: pointer;

    .diamond-marker {
      transition: fill 0.2s ease;
      stroke: white;
      stroke-width: 2;
      filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2));
      pointer-events: all;

      &:hover {
        filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.4));
        transform: scale(1.1);
      }
    }

    .count-text {
      pointer-events: none;
      user-select: none;
    }
  }

  // 🔥 관계 목록 툴팁 (일반 노드)
  .relationships-tooltip-container {
    pointer-events: all;
    z-index: 999999 !important;
  }

  .relationships-tooltip {
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    padding: 0;
    max-height: 400px;
    overflow-y: auto;
    pointer-events: auto;

    &.left-side {
      border-left: 4px solid #3b82f6;
    }

    &.right-side {
      border-right: 4px solid #3b82f6;
    }

    // 🔥 상단/하단 핸들용 스타일 추가
    &.top-side {
      border-top: 4px solid #3b82f6;
    }

    &.bottom-side {
      border-bottom: 4px solid #3b82f6;
    }

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 0 10px 10px 0;
    }

    &::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;

      &:hover {
        background: #94a3b8;
      }
    }

    .tooltip-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: #f8fafc;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      border-radius: 10px 10px 0 0;

      .header-left {
        display: flex;
        align-items: center;
        gap: 8px;

        .node-name {
          color: #1e293b;
          font-weight: 700;
        }

        .arrow {
          color: #64748b;
          font-size: 14px;
        }

        .label {
          color: #3b82f6;
          font-weight: 600;
        }
      }
    }

    .tooltip-divider {
      height: 1px;
      background: #e2e8f0;
    }

    .relationships-list {
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .relationship-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      transition: all 0.2s ease;
      cursor: pointer;

      &:hover {
        background: #e0f2fe;
        border-color: #3b82f6;
        transform: translateX(4px);
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
      }

      .rel-icon {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        svg {
          width: 16px;
          height: 16px;
          color: white;
        }
      }

      .rel-content {
        flex: 1;
        min-width: 0;

        .rel-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
          flex-wrap: wrap;

          .rel-type {
            font-size: 13px;
            font-weight: 700;
            color: #1e293b;
          }

          .rel-arrow {
            font-size: 12px;
            color: #94a3b8;
          }

          .rel-target {
            font-size: 12px;
            color: #3b82f6;
            font-weight: 600;
          }
        }

        .rel-description {
          font-size: 11px;
          color: #64748b;
          line-height: 1.4;
          word-break: break-word;
        }
      }
    }
  }

  // 🔥 단일 관계 라벨
  .relationship-label-container {
    pointer-events: none;
    z-index: 1000;
  }

  .relationship-label {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.98);
    border: 2px solid #64748b;
    border-radius: 12px;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 700;
    text-align: center;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    backdrop-filter: blur(4px);
    width: fit-content;
    margin: 0 auto;
    color: #64748b;

    .label-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #64748b;
      flex-shrink: 0;

      .icon {
        width: 12px;
        height: 12px;
        color: white;
      }
    }

    .label-text {
      line-height: 1;
    }
  }

  // 🔥 핸들 위치별 라벨 스타일 추가
  .relationship-label {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.98);
    border: 2px solid #64748b;
    border-radius: 12px;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 700;
    text-align: center;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    backdrop-filter: blur(4px);
    width: fit-content;
    margin: 0 auto;
    color: #64748b;

    &.left-side {
      border-left: 3px solid currentColor;
    }

    &.right-side {
      border-right: 3px solid currentColor;
    }

    // 🔥 상단/하단 핸들용 스타일 추가
    &.top-side {
      border-top: 3px solid currentColor;
    }

    &.bottom-side {
      border-bottom: 3px solid currentColor;
    }

    .label-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #64748b;
      flex-shrink: 0;

      .icon {
        width: 12px;
        height: 12px;
        color: white;
      }
    }

    .label-text {
      line-height: 1;
    }
  }

  .relationship-edge:hover .relationship-label {
    transform: scale(1.15) translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
    z-index: 9999;
  }

  // 🔥 팝업 오버레이
  .relation-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  // 🔥 팝업
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

    h3 {
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

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }
    }
  }

  .popup-body {
    padding: 24px;
    max-height: 60vh;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f5f9;
    }

    &::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;

      &:hover {
        background: #94a3b8;
      }
    }
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

    .info-item {
      flex: 1;
      text-align: center;

      .label {
        display: block;
        font-size: 11px;
        font-weight: 600;
        color: #64748b;
        margin-bottom: 4px;
      }

      .value {
        display: block;
        font-size: 14px;
        font-weight: 700;
        color: #1e293b;
      }
    }

    .arrow-icon {
      font-size: 24px;
      font-weight: 700;
      color: #8b5cf6;
      flex-shrink: 0;
    }
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

    &:hover {
      border-color: #8b5cf6;
      background: #faf5ff;
      transform: translateX(4px);
    }

    &.active {
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

      .item-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;

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

          &.reversed {
            color: #f59e0b;
            background: rgba(245, 158, 11, 0.1);
          }
        }
      }

      .item-description {
        font-size: 12px;
        color: #64748b;
        line-height: 1.5;
      }
    }

    .check-icon {
      width: 24px;
      height: 24px;
      color: #8b5cf6;
      flex-shrink: 0;
    }
  }

  // 🔥 팝업 애니메이션
  .popup-fade-enter-active,
  .popup-fade-leave-active {
    transition: opacity 0.2s ease;

    .relation-popup {
      transition: transform 0.3s ease, opacity 0.2s ease;
    }
  }

  .popup-fade-enter-from {
    opacity: 0;

    .relation-popup {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
  }

  .popup-fade-leave-to {
    opacity: 0;

    .relation-popup {
      opacity: 0;
      transform: translateY(-10px) scale(0.98);
    }
  }

  // 🔥 팝업 오버레이
  .relation-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999 !important;
    backdrop-filter: blur(4px);
    pointer-events: all !important;
  }

  // 🔥 팝업
  .relation-popup {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    width: 500px;
    max-width: 90vw;
    max-height: 80vh;
    overflow: hidden;
    pointer-events: all !important;
    position: relative;
    z-index: 100000 !important;
  }

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;

    h3 {
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
      pointer-events: all !important;

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }

  .popup-body {
    padding: 24px;
    max-height: 60vh;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f5f9;
    }

    &::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;

      &:hover {
        background: #94a3b8;
      }
    }
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

    .info-item {
      flex: 1;
      text-align: center;

      .label {
        display: block;
        font-size: 11px;
        font-weight: 600;
        color: #64748b;
        margin-bottom: 4px;
      }

      .value {
        display: block;
        font-size: 14px;
        font-weight: 700;
        color: #1e293b;
      }
    }

    .arrow-icon {
      font-size: 24px;
      font-weight: 700;
      color: #8b5cf6;
      flex-shrink: 0;
    }
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

    &:hover {
      border-color: #8b5cf6;
      background: #faf5ff;
      transform: translateX(4px);
    }

    &.active {
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

      .item-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;

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

          &.reversed {
            color: #f59e0b;
            background: rgba(245, 158, 11, 0.1);
          }
        }
      }

      .item-description {
        font-size: 12px;
        color: #64748b;
        line-height: 1.5;
      }
    }

    .check-icon {
      width: 24px;
      height: 24px;
      color: #8b5cf6;
      flex-shrink: 0;
    }
  }

  // 🔥 다이아몬드 마커 크기 증가 (클릭 영역 확대)
  .multi-relationship-diamond {
    pointer-events: all !important;
    cursor: pointer;

    .diamond-marker {
      transition: all 0.2s ease;
      stroke: white;
      stroke-width: 2;
      filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.3));
      pointer-events: all !important;

      &:hover {
        filter: drop-shadow(0 5px 15px rgba(59, 130, 246, 0.5));
        transform: scale(1.15);
      }
    }

    .count-text {
      pointer-events: none;
      user-select: none;
    }
  }

  // 🔥 툴팁 헤더에 닫기 버튼 추가
  .tooltip-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #f8fafc;
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    border-radius: 10px 10px 0 0;
    gap: 12px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;

      .node-name {
        color: #1e293b;
        font-weight: 700;
        font-size: 11px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .arrow {
        color: #64748b;
        font-size: 14px;
        flex-shrink: 0;
      }
    }

    .label {
      font-size: 10px;
      color: #3b82f6;
      font-weight: 600;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .close-tooltip-btn {
      width: 24px;
      height: 24px;
      padding: 0;
      border: none;
      background: #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;

      svg {
        width: 14px;
        height: 14px;
        color: #64748b;
      }

      &:hover {
        background: #cbd5e1;
        transform: scale(1.1);

        svg {
          color: #1e293b;
        }
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }

  // 🔥 관계 항목에 번호 및 현재 표시 추가
  .relationship-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    transition: all 0.2s ease;
    cursor: pointer;

    &.active {
      background: #e0f2fe;
      border-color: #3b82f6;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
    }

    &:hover {
      background: #e0f2fe;
      border-color: #3b82f6;
      transform: translateX(4px);
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
    }

    .item-number {
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .rel-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      svg {
        width: 16px;
        height: 16px;
        color: white;
      }
    }

    .rel-content {
      flex: 1;
      min-width: 0;

      .rel-header {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
        flex-wrap: wrap;

        .rel-type {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
        }

        .current-badge {
          font-size: 9px;
          font-weight: 700;
          color: white;
          background: #3b82f6;
          padding: 2px 6px;
          border-radius: 4px;
        }
      }

      .rel-description {
        font-size: 11px;
        color: #64748b;
        line-height: 1.4;
        word-break: break-word;
      }
    }
  }
</style>
