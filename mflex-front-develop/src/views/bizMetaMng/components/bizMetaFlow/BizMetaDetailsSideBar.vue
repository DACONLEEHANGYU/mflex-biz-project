<template>
  <div class="biz-meta-sidebar" :class="{ 'is-open': isOpen }">
    <!-- 토글 버튼 -->
    <button
      class="sidebar-toggle"
      @click="toggleSidebar"
      :title="isOpen ? '닫기' : '열기'"
    >
      <svg v-if="isOpen" viewBox="0 0 20 20" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
          clip-rule="evenodd"
        />
      </svg>
      <svg v-else viewBox="0 0 20 20" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <!-- 사이드바 콘텐츠 -->
    <div class="sidebar-content">
      <!-- 헤더 -->
      <div class="sidebar-header">
        <h3 class="sidebar-title">
          <svg viewBox="0 0 20 20" fill="currentColor" class="title-icon">
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
              clip-rule="evenodd"
            />
          </svg>
          상세 정보
        </h3>
        <button class="close-button" @click="closeSidebar" title="닫기">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
            />
          </svg>
        </button>
      </div>

      <!-- 콘텐츠 영역 -->
      <div class="sidebar-body">
        <!-- 선택된 항목이 없을 때 -->
        <div v-if="!selectedItem" class="empty-state">
          <svg viewBox="0 0 20 20" fill="currentColor" class="empty-icon">
            <path
              fill-rule="evenodd"
              d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
              clip-rule="evenodd"
            />
          </svg>
          <p class="empty-message">노드 또는 관계를 선택하세요</p>
          <p class="empty-description">
            선택한 항목의 상세 정보가 여기에 표시됩니다
          </p>
        </div>

        <!-- 노드 상세 정보 -->
        <div v-else-if="selectedItem.type === 'node'" class="detail-content">
          <div class="detail-section">
            <div class="section-header">
              <h4 class="section-title">기본 정보</h4>
              <span
                v-if="selectedItem.data?.termType"
                class="item-type-badge"
                :class="getTermTypeClass(selectedItem.data.termType)"
              >
                {{ getTermTypeText(selectedItem.data.termType) }}
              </span>
            </div>

            <div class="info-grid">
              <div class="info-item full-width">
                <span class="info-label">용어명</span>
                <span class="info-value">{{
                  selectedItem.data?.termName || '-'
                }}</span>
              </div>

              <div class="info-item" v-if="selectedItem.data?.owner">
                <span class="info-label">소유자</span>
                <span class="info-value">{{ selectedItem.data.owner }}</span>
              </div>

              <div class="info-item" v-if="selectedItem.data?.domain">
                <span class="info-label">도메인</span>
                <span class="info-value">{{ selectedItem.data.domain }}</span>
              </div>

              <div
                class="info-item full-width"
                v-if="selectedItem.data?.termExplain"
              >
                <span class="info-label">설명</span>
                <span class="info-value">{{
                  selectedItem.data.termExplain
                }}</span>
              </div>
            </div>
          </div>

          <!-- 🔥 관계 정보 (삭제 버튼 추가) -->
          <div class="detail-section" v-if="nodeRelationships.length > 0">
            <div class="section-header">
              <h4 class="section-title">관계 정보</h4>
              <span class="count-badge">{{ nodeRelationships.length }}</span>
            </div>

            <div class="relationships-list">
              <div
                v-for="rel in nodeRelationships"
                :key="rel.id"
                class="relationship-item"
              >
                <div
                  class="relationship-content"
                  @click="selectRelationship(rel)"
                >
                  <div class="relationship-type">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      class="rel-icon"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span>{{
                      getRelationshipTypeText(rel.data?.relationshipType)
                    }}</span>
                  </div>
                  <div class="relationship-nodes">
                    <span class="node-name">{{ getNodeName(rel.source) }}</span>
                    <span class="arrow">→</span>
                    <span class="node-name">{{ getNodeName(rel.target) }}</span>
                  </div>
                </div>

                <!-- 🔥 관계 삭제 버튼 -->
                <button
                  class="delete-relation-button"
                  @click.stop="deleteRelationship(rel)"
                  title="관계 삭제"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 자식 노드 정보 -->
          <div class="detail-section" v-if="selectedItem.data?.isParent">
            <div class="section-header">
              <h4 class="section-title">하위 항목</h4>
              <span class="count-badge">{{
                selectedItem.data.childrenCount || 0
              }}</span>
            </div>

            <div class="children-info">
              <div class="info-row">
                <span class="info-label">보이는 자식</span>
                <span class="info-value"
                  >{{ selectedItem.data.childrenCount || 0 }}개</span
                >
              </div>
              <div
                class="info-row"
                v-if="selectedItem.data.hiddenChildrenCount > 0"
              >
                <span class="info-label">숨겨진 자식</span>
                <span class="info-value warning"
                  >{{ selectedItem.data.hiddenChildrenCount }}개</span
                >
              </div>
              <div class="info-row" v-if="selectedItem.data.totalChildrenCount">
                <span class="info-label">전체</span>
                <span class="info-value"
                  >{{ selectedItem.data.totalChildrenCount }}개</span
                >
              </div>
            </div>
          </div>

          <!-- 메타 정보 -->
          <div class="detail-section meta-section">
            <h4 class="section-title">메타 정보</h4>
            <div class="meta-grid">
              <div class="meta-item">
                <span class="meta-label">노드 ID</span>
                <span class="meta-value">{{ selectedItem.id }}</span>
              </div>
              <div class="meta-item" v-if="selectedItem.data?.createdAt">
                <span class="meta-label">생성일시</span>
                <span class="meta-value">{{
                  formatDate(selectedItem.data.createdAt)
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 🔥 관계 상세 정보 (삭제 버튼 추가) -->
        <div v-else-if="selectedItem.type === 'edge'" class="detail-content">
          <div class="detail-section">
            <div class="section-header">
              <h4 class="section-title">관계 정보</h4>
              <div class="section-actions">
                <span class="item-type-badge relationship">
                  {{
                    getRelationshipTypeText(selectedItem.data?.relationshipType)
                  }}
                </span>

                <!-- 🔥 관계 삭제 버튼 (큰 버튼) -->
                <button
                  class="delete-edge-button"
                  @click="deleteCurrentEdge"
                  title="이 관계 삭제"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  삭제
                </button>
              </div>
            </div>

            <div class="info-grid">
              <div
                class="info-item full-width"
                v-if="selectedItem.data?.relationshipName"
              >
                <span class="info-label">관계명</span>
                <span class="info-value">{{
                  selectedItem.data.relationshipName
                }}</span>
              </div>

              <div class="info-item full-width">
                <span class="info-label">출발 노드</span>
                <span class="info-value">{{
                  getNodeName(selectedItem.source)
                }}</span>
              </div>

              <div class="info-item full-width">
                <span class="info-label">도착 노드</span>
                <span class="info-value">{{
                  getNodeName(selectedItem.target)
                }}</span>
              </div>

              <div
                class="info-item full-width"
                v-if="selectedItem.data?.description"
              >
                <span class="info-label">설명</span>
                <span class="info-value">{{
                  selectedItem.data.description
                }}</span>
              </div>

              <div
                class="info-item"
                v-if="selectedItem.data?.isBidirectional !== undefined"
              >
                <span class="info-label">방향성</span>
                <span class="info-value">
                  {{ selectedItem.data.isBidirectional ? '양방향' : '단방향' }}
                </span>
              </div>
            </div>
          </div>

          <!-- 메타 정보 -->
          <div class="detail-section meta-section">
            <h4 class="section-title">메타 정보</h4>
            <div class="meta-grid">
              <div class="meta-item">
                <span class="meta-label">관계 ID</span>
                <span class="meta-value">{{ selectedItem.id }}</span>
              </div>
              <div class="meta-item" v-if="selectedItem.data?.createdAt">
                <span class="meta-label">생성일시</span>
                <span class="meta-value">{{
                  formatDate(selectedItem.data.createdAt)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';
  import { deleteBizTermRelation } from '@/utils/mflexApi/bizMeta/bizMetaApi';
  import { useBizMetaStore } from '@/stores/bizMeta';

  const props = defineProps({
    selectedItem: {
      type: Object,
      default: null,
    },
    nodes: {
      type: Array,
      default: () => [],
    },
    edges: {
      type: Array,
      default: () => [],
    },
  });

  const emit = defineEmits([
    'close',
    'select-relationship',
    'delete-relationship',
    'delete-edge',
  ]);

  const bizMetaStore = useBizMetaStore();

  const { setIsUpdate } = bizMetaStore;

  const isOpen = ref(false);

  watch(
    () => props.selectedItem,
    (newVal) => {
      console.log('사이드바 - selectedItem 변경:', newVal);
      if (newVal) {
        isOpen.value = true;
      }
    },
    { immediate: true, deep: true }
  );

  const nodeRelationships = computed(() => {
    if (!props.selectedItem || props.selectedItem.type !== 'node') {
      return [];
    }

    const nodeId = props.selectedItem.id;
    const nodeData = props.selectedItem.data;

    // 🔥 해당 노드와 연결된 모든 엣지 필터링
    let relationships = props.edges.filter(
      (edge) => edge.source === nodeId || edge.target === nodeId
    );

    // 🔥 복합구성용어 자식 노드인 경우: 순차적 소속관계만 제외
    if (nodeData?.isCompositeChild) {
      relationships = relationships.filter((edge) => {
        // 🔥 순차적 소속관계인지 확인
        const isSequentialComposition =
          edge.data?.currentRelation?.relType === 'COMPOSITION' &&
          edge.data?.currentRelation?.rel_expln?.includes('순차적 소속관계');

        // 🔥 순차적 소속관계만 제외 (실제 비즈니스 관계는 유지)
        if (isSequentialComposition) {
          return false;
        }

        return true;
      });
    }

    console.log('사이드바 - 노드 관계 (필터링 후):', relationships);
    return relationships;
  });

  const toggleSidebar = () => {
    isOpen.value = !isOpen.value;
  };

  const closeSidebar = () => {
    isOpen.value = false;
    emit('close');
  };

  const selectRelationship = (rel) => {
    console.log('관계 선택:', rel);
    emit('select-relationship', rel);
  };

  // 🔥 관계 삭제 함수 (노드 상세에서)
  const deleteRelationship = (rel) => {
    const sourceNodeName = getNodeName(rel.source);
    const targetNodeName = getNodeName(rel.target);
    const relType = getRelationshipTypeText(rel.data?.relationshipType);

    console.log('삭제할 관계:', rel);

    if (
      confirm(
        `"${sourceNodeName} → ${targetNodeName}" 관계(${relType})를 삭제하시겠습니까?`
      )
    ) {
      deleteBizTermRelation(rel.data.relationshipId)
        .then(() => {
          console.log('관계 삭제 성공:', rel);
          emit('delete-relationship', rel);
          setIsUpdate(true);
        })
        .catch((error) => {
          console.error('관계 삭제 실패:', error);
          alert('관계 삭제에 실패했습니다. 다시 시도해주세요.');
        });
      // console.log('관계 삭제:', rel);
      // emit('delete-relationship', rel);
    }
  };

  // 🔥 현재 선택된 엣지 삭제 함수 (엣지 상세에서)
  const deleteCurrentEdge = () => {
    if (!props.selectedItem || props.selectedItem.type !== 'edge') return;

    const sourceNodeName = getNodeName(props.selectedItem.source);
    const targetNodeName = getNodeName(props.selectedItem.target);
    const relType = getRelationshipTypeText(
      props.selectedItem.data?.relationshipType
    );

    console.log('삭제할 엣지:', props.selectedItem);

    if (
      confirm(
        `"${sourceNodeName} → ${targetNodeName}" 관계(${relType})를 삭제하시겠습니까?`
      )
    ) {
      deleteBizTermRelation(props.selectedItem.data.relationshipId)
        .then(() => {
          console.log('엣지 삭제 성공:', props.selectedItem);
          emit('delete-edge', props.selectedItem);
          setIsUpdate(true);
        })
        .catch((error) => {
          console.error('엣지 삭제 실패:', error);
          alert('엣지 삭제에 실패했습니다. 다시 시도해주세요.');
        });
      // console.log('엣지 삭제:', props.selectedItem);
      // emit('delete-edge', props.selectedItem);
    }
  };

  const getNodeName = (nodeId) => {
    const node = props.nodes.find((n) => n.id === nodeId);
    return node?.data?.termName || nodeId;
  };

  const getTermTypeText = (type) => {
    const types = {
      GENERAL: '일반용어',
      COMPOSITE: '복합구성용어',
      STANDARD: '표준용어',
      NON_STANDARD: '비표준용어',
    };
    return types[type] || type;
  };

  const getTermTypeClass = (type) => {
    const classes = {
      GENERAL: 'general',
      COMPOSITE: 'composite',
      STANDARD: 'standard',
      NON_STANDARD: 'non-standard',
    };
    return classes[type] || 'general';
  };

  const getRelationshipTypeText = (type) => {
    const types = {
      SIMILAR: '유사 관계',
      ASSOCIATION: '동등 관계',
      COMPOSITION: '소속 관계',
      ADDITION: '더하기 관계',
      SUBTRACTION: '빼기 관계',
      MULTIPLICATION: '곱하기 관계',
      DIVISION: '나누기 관계',
    };
    return types[type] || type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('날짜 포맷 오류:', error);
      return '-';
    }
  };

  const openSidebar = () => {
    isOpen.value = true;
  };

  defineExpose({
    openSidebar,
    closeSidebar,
    isOpen,
  });
</script>

<style lang="scss" scoped>
  .biz-meta-sidebar {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 400px;
    background: white;
    border-left: 1px solid #e2e8f0;
    box-shadow: -4px 0 12px rgba(0, 0, 0, 0.05);
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 50;
    display: flex;
    flex-direction: column;

    &.is-open {
      transform: translateX(0);
    }
  }

  .sidebar-toggle {
    position: absolute;
    left: -40px;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 80px;
    background: white;
    border: 1px solid #e2e8f0;
    border-right: none;
    border-radius: 8px 0 0 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);

    svg {
      width: 20px;
      height: 20px;
      color: #64748b;
      transition: color 0.2s ease;
    }

    &:hover {
      background: #f8fafc;

      svg {
        color: #3b82f6;
      }
    }
  }

  .sidebar-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid #e2e8f0;
    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  }

  .sidebar-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;

    .title-icon {
      width: 20px;
      height: 20px;
      color: #3b82f6;
    }
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
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
  }

  .sidebar-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
  }

  // Empty State
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;

    .empty-icon {
      width: 64px;
      height: 64px;
      color: #cbd5e1;
      margin-bottom: 16px;
    }

    .empty-message {
      font-size: 16px;
      font-weight: 600;
      color: #475569;
      margin: 0 0 8px 0;
    }

    .empty-description {
      font-size: 13px;
      color: #94a3b8;
      margin: 0;
    }
  }

  // Detail Content
  .detail-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .detail-section {
    background: #f8fafc;
    border-radius: 12px;
    padding: 16px;

    &.meta-section {
      background: #f1f5f9;
    }
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    gap: 8px; // 🔥 추가
  }

  // 🔥 섹션 액션 컨테이너 추가
  .section-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-title {
    font-size: 14px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .count-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 8px;
    background: #3b82f6;
    color: white;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }

  .item-type-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    border: 1px solid;

    &.general {
      background: #f1f5f9;
      color: #475569;
      border-color: #e2e8f0;
    }

    &.composite {
      background: #fef3c7;
      color: #92400e;
      border-color: #fbbf24;
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

    &.relationship {
      background: #e0e7ff;
      color: #3730a3;
      border-color: #818cf8;
    }
  }

  // Info Grid
  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    &.full-width {
      grid-column: 1 / -1;
    }

    .info-label {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 13px;
      color: #1e293b;
      font-weight: 500;
      word-break: break-word;

      &.warning {
        color: #ea580c;
      }
    }
  }

  // Relationships List
  .relationships-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .relationship-item {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px;
    display: flex; // 🔥 추가
    align-items: center; // 🔥 추가
    justify-content: space-between; // 🔥 추가
    gap: 8px; // 🔥 추가
    transition: all 0.2s ease;

    &:hover {
      border-color: #3b82f6;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
    }

    // 🔥 관계 콘텐츠 영역 추가
    .relationship-content {
      flex: 1;
      cursor: pointer;
    }

    .relationship-type {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #3b82f6;
      margin-bottom: 6px;

      .rel-icon {
        width: 14px;
        height: 14px;
      }
    }

    // 🔥 관계 삭제 버튼 (작은 버튼 - 관계 목록용)
    .delete-relation-button {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      padding: 0;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 6px;
      color: #ef4444;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      svg {
        width: 14px;
        height: 14px;
      }

      &:hover {
        background: #ef4444;
        border-color: #ef4444;
        color: white;
        transform: scale(1.1);
      }

      &:active {
        transform: scale(0.95);
      }
    }

    // 🔥 엣지 삭제 버튼 (큰 버튼 - 엣지 상세용)
    .delete-edge-button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 6px;
      color: #ef4444;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      svg {
        width: 14px;
        height: 14px;
      }

      &:hover {
        background: #ef4444;
        border-color: #ef4444;
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
      }

      &:active {
        transform: translateY(0);
      }
    }

    .relationship-nodes {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #64748b;

      .node-name {
        font-weight: 500;
        color: #1e293b;
      }

      .arrow {
        color: #94a3b8;
      }
    }
  }

  // Children Info
  .children-info {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: white;
      border-radius: 6px;

      .info-label {
        font-size: 12px;
        color: #64748b;
        font-weight: 500;
      }

      .info-value {
        font-size: 13px;
        color: #1e293b;
        font-weight: 600;

        &.warning {
          color: #ea580c;
        }
      }
    }
  }

  // Meta Grid
  .meta-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .meta-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #e2e8f0;

    &:last-child {
      border-bottom: none;
    }

    .meta-label {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }

    .meta-value {
      font-size: 11px;
      color: #475569;
      font-family: 'Courier New', monospace;
    }
  }

  // Scrollbar
  .sidebar-body::-webkit-scrollbar {
    width: 6px;
  }

  .sidebar-body::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  .sidebar-body::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;

    &:hover {
      background: #94a3b8;
    }
  }

  // Responsive
  @media (max-width: 768px) {
    .biz-meta-sidebar {
      width: 100%;
      max-width: 320px;
    }
  }
</style>
