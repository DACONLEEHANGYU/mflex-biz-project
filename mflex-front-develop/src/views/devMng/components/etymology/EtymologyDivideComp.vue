<template>
  <div class="etymology-container">
    <!-- VueFlow를 전체 화면으로 사용 -->
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :default-zoom="1.0"
      :fit-view-on-init="false"
      :min-zoom="0.1"
      :max-zoom="3"
      class="main-flow"
      ref="vueFlowRef"
    >
      <!-- 민무늬 배경 -->
      <div class="plain-background"></div>

      <!-- 왼쪽 상단 고정 입력폼 -->
      <div class="fixed-header">
        <div class="search-container">
          <input
            v-model="searchTerm"
            type="text"
            class="search-input"
            placeholder="어원 분석 검색..."
            @keyup.enter="analyzeWord"
          />
          <button class="search-btn" @click="analyzeWord" :disabled="isLoading">
            {{ isLoading ? '분석 중...' : '분석' }}
          </button>
        </div>
      </div>

      <!-- 컨트롤 패널 -->
      <Controls class="flow-controls" />

      <!-- 인트로 화면 (VueFlow 내부) -->
      <div v-if="showIntro" class="intro-overlay">
        <div class="intro-content" :class="{ 'fade-out': isIntroFading }">
          <h1 class="intro-title">Mflex 어원기반분석</h1>
          <div class="intro-subtitle">용어의 어원을 시각적으로 분석합니다</div>
        </div>
      </div>

      <!-- 상태 표시 (로딩/에러/빈 상태) - VueFlow 내부 -->
      <div class="status-overlay" v-if="!showIntro && nodes.length === 0">
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>어원 분석 중...</p>
        </div>
        <div v-else-if="error" class="error-state">
          <div class="error-icon">⚠️</div>
          <p>{{ error }}</p>
        </div>
        <div v-else class="empty-state">
          <div class="empty-icon">🔍</div>
          <p>용어를 입력하고 분석 버튼을 클릭하세요</p>
        </div>
      </div>

      <!-- 어원 노드 템플릿 -->
      <template #node-etymology="nodeProps">
        <div
          class="node"
          :class="getNodeLevelClass(nodeProps.data)"
          :style="{ width: `${nodeProps.data.nodeWidth}px` }"
        >
          <div
            class="node-card"
            :style="nodeProps.data.customStyle"
            @click="onNodeClick(nodeProps.data)"
          >
            <div class="node-title">{{ nodeProps.data.label }}</div>
            <!-- <div v-if="nodeProps.data.english" class="node-subtitle">
              {{ nodeProps.data.english }}
            </div> -->
            <!-- <div v-if="nodeProps.data.definition" class="node-description">
              {{ nodeProps.data.definition }}
            </div> -->
            <!-- <div v-if="nodeProps.data.meaning" class="node-meaning">
              {{ nodeProps.data.meaning }}
            </div> -->
          </div>
          <!-- 조건부 Handle 렌더링 -->
          <Handle
            v-if="nodeProps.data.hasParent"
            type="target"
            :position="Position.Top"
            class="custom-handle custom-handle-top"
            :style="getHandleStyle(nodeProps.data)"
          />
          <Handle
            v-if="nodeProps.data.hasChildren"
            type="source"
            :position="Position.Bottom"
            class="custom-handle custom-handle-bottom"
            :style="getHandleStyle(nodeProps.data)"
          />
        </div>
      </template>

      <!-- 어원 엣지 템플릿 (직선) -->
      <template #edge-etymology="edgeProps">
        <GlowingEdge
          :id="edgeProps.id"
          :source-x="edgeProps.sourceX"
          :source-y="edgeProps.sourceY"
          :target-x="edgeProps.targetX"
          :target-y="edgeProps.targetY"
          :style="edgeProps.style"
        />
      </template>
    </VueFlow>

    <!-- 노드 클릭 팝업 (VueFlow 외부) -->
    <div v-if="selectedNode" class="node-detail-popup" @click.stop>
      <div class="popup-content">
        <div class="popup-header">
          <h4>{{ selectedNode.label }}</h4>
          <button class="close-btn" @click="closePopup">×</button>
        </div>
        <div class="popup-body">
          <div v-if="selectedNode.english" class="popup-item">
            <strong>영어:</strong> {{ selectedNode.english }}
          </div>
          <div v-if="selectedNode.definition" class="popup-item">
            <strong>정의:</strong> {{ selectedNode.definition }}
          </div>
          <div v-if="selectedNode.meaning" class="popup-item">
            <strong>의미:</strong> {{ selectedNode.meaning }}
          </div>
          <div v-if="selectedNode.origin" class="popup-item">
            <strong>어원:</strong> {{ selectedNode.origin }}
          </div>
          <div v-if="selectedNode.domainClass" class="popup-item">
            <strong>도메인:</strong> {{ selectedNode.domainGroup }} /
            {{ selectedNode.domainClass }}
          </div>
        </div>
      </div>
    </div>

    <!-- 팝업 배경 (VueFlow 외부) -->
    <div v-if="selectedNode" class="popup-overlay" @click="closePopup"></div>
  </div>
</template>

<script setup>
  import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
  import { VueFlow, Handle, Position, useVueFlow } from '@vue-flow/core';
  import { Controls } from '@vue-flow/controls';

  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import { etymologyDecompose } from '@/utils/mflexApi/etymology/etymology';
  import '@vue-flow/core/dist/style.css';
  import '@vue-flow/core/dist/theme-default.css';

  const authStore = useAuthStore();
  const { userInfo, userStngInfo } = storeToRefs(authStore);
  const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
    userStngInfo.value;

  // VueFlow 인스턴스 참조
  const vueFlowRef = ref();

  // 발광 엣지 컴포넌트
  const GlowingEdge = {
    props: ['id', 'sourceX', 'sourceY', 'targetX', 'targetY', 'style'],
    template: `
      <g>
        <path
          :d="'M' + sourceX + ',' + sourceY + ' L' + targetX + ',' + targetY"
          class="vue-flow__edge-path glowing-edge"
          stroke="url(#edgeGradient)"
          stroke-width="2"
          :style="style"
        />
        <defs>
          <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(96, 184, 131, 0.8)" />
            <stop offset="100%" stop-color="rgba(76, 175, 80, 0.6)" />
          </linearGradient>
        </defs>
      </g>
    `,
  };

  // 레이아웃 상수들
  const LEVEL_HEIGHT = 220;
  const MIN_NODE_WIDTH = 180;
  const MAX_NODE_WIDTH = 350;
  const MIN_NODE_SPACING = 120;

  // 상태 관리
  const nodes = ref([]);
  const edges = ref([]);
  const searchTerm = ref('');
  const analysisData = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const showIntro = ref(true);
  const isIntroFading = ref(false);

  // 팝업 관련 상태
  const selectedNode = ref(null);

  // 컨테이너 크기를 위한 ref
  const containerSize = ref({ width: 1200, height: 800 });

  // 텍스트 길이에 따른 노드 크기 계산
  const calculateNodeWidth = (text, englishText = '') => {
    const koreanLength = (text || '').length;
    const englishLength = (englishText || '').length;
    const effectiveLength = Math.max(koreanLength, englishLength * 0.7);
    const calculatedWidth = Math.max(
      MIN_NODE_WIDTH,
      Math.min(MAX_NODE_WIDTH, 120 + effectiveLength * 12)
    );
    return calculatedWidth;
  };

  // Handle 스타일 계산
  const getHandleStyle = (nodeData) => {
    return {
      left: '50%',
      transform: 'translateX(-50%)',
      opacity: nodeData.handleOpacity || 0,
      transition: 'opacity 0.5s ease-in-out',
      position: 'absolute',
    };
  };

  // 노드 레벨별 클래스 - 도메인 노드 추가
  const getNodeLevelClass = (data) => {
    if (data.nodeType === 'root') return 'root-node';
    if (data.nodeType === 'domain') return 'domain-node'; // 새로운 도메인 노드 클래스
    if (data.level === 0) return 'level-3';
    if (data.level === 1) return 'level-2';
    return 'level-1';
  };

  // 컨테이너 크기 업데이트
  const updateContainerSize = () => {
    if (vueFlowRef.value && vueFlowRef.value.$el) {
      const container = vueFlowRef.value.$el;
      containerSize.value = {
        width: container.clientWidth || 1200,
        height: container.clientHeight || 800,
      };
    }
  };

  // 트리 크기 분석 및 적절한 줌 계산
  const calculateOptimalZoom = (nodesByLevel, maxLevel, nodeSizes) => {
    updateContainerSize();
    const { width: containerWidth, height: containerHeight } =
      containerSize.value;

    // 전체 트리의 예상 크기 계산
    const totalHeight = (maxLevel + 1) * LEVEL_HEIGHT;

    // 각 레벨의 최대 너비 계산
    let maxLevelWidth = 0;
    Object.values(nodesByLevel).forEach((levelItems) => {
      if (levelItems.length === 0) return;

      const levelWidth = levelItems.reduce((sum, item, index) => {
        const nodeWidth = nodeSizes.get(item.id) || MIN_NODE_WIDTH;
        return sum + nodeWidth + (index > 0 ? MIN_NODE_SPACING : 0);
      }, 0);

      maxLevelWidth = Math.max(maxLevelWidth, levelWidth);
    });

    // 여백을 고려한 필요 공간 계산 (30% 여백)
    const requiredWidth = maxLevelWidth * 1.3;
    const requiredHeight = totalHeight * 1.3;

    // 화면에 맞는 줌 레벨 계산
    const scaleX = containerWidth / requiredWidth;
    const scaleY = containerHeight / requiredHeight;
    const optimalZoom = Math.min(scaleX, scaleY, 1.0);

    // 너무 작아지는 것을 방지 (최소 0.3배)
    return Math.max(optimalZoom, 0.3);
  };

  // 노드들의 경계 박스 계산
  const calculateNodesBounds = () => {
    if (nodes.value.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.value.forEach((node) => {
      const x = node.position.x;
      const y = node.position.y;
      const width = node.data.nodeWidth || MIN_NODE_WIDTH;
      const height = 120;

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  };

  // 뷰포트 중앙으로 트리 이동
  const centerTreeInViewport = async (shouldAnimate = true) => {
    if (!vueFlowRef.value || nodes.value.length === 0) return;

    await nextTick();
    if (shouldAnimate) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    try {
      const bounds = calculateNodesBounds();
      if (!bounds) return;

      updateContainerSize();
      const { width: containerWidth, height: containerHeight } =
        containerSize.value;

      // 현재 줌 레벨 가져오기
      const currentViewport = vueFlowRef.value.getViewport();
      const currentZoom = currentViewport.zoom;

      // 트리의 중심점 계산
      const treeCenterX = bounds.x + bounds.width / 2;
      const treeCenterY = bounds.y + bounds.height / 2;

      // 뷰포트 중심으로 이동할 좌표 계산
      const x = containerWidth / 2 - treeCenterX * currentZoom;
      const y = containerHeight / 2 - treeCenterY * currentZoom;

      // 뷰포트 이동
      await vueFlowRef.value.setViewport(
        { x, y, zoom: currentZoom },
        { duration: shouldAnimate ? 800 : 0 }
      );

      console.log('트리를 화면 중앙으로 이동');
    } catch (error) {
      console.warn('centerTreeInViewport 실행 중 오류:', error);
    }
  };

  // 인트로 애니메이션
  onMounted(() => {
    setTimeout(() => {
      updateContainerSize();
    }, 100);

    setTimeout(() => {
      isIntroFading.value = true;
      setTimeout(() => {
        showIntro.value = false;
      }, 1000);
    }, 2000);

    window.addEventListener('resize', updateContainerSize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateContainerSize);
  });

  // 노드 클릭 핸들러
  const onNodeClick = (nodeData) => {
    selectedNode.value = nodeData;
    console.log('노드 클릭:', nodeData);
  };

  // 팝업 닫기
  const closePopup = () => {
    selectedNode.value = null;
  };

  // 어원 분석 함수
  const analyzeWord = async () => {
    if (!searchTerm.value.trim()) {
      error.value = '분석할 단어를 입력해주세요.';
      return;
    }

    nodes.value = [];
    edges.value = [];
    analysisData.value = null;
    error.value = null;
    isLoading.value = true;
    selectedNode.value = null;
    showIntro.value = false;

    try {
      const term = {
        term: searchTerm.value,
        instituteId: useMetaMngInstId,
        dictionaryId: useDctnryId,
      };
      const decomposeRes = await etymologyDecompose(term);
      console.log('어원 분석 결과:', decomposeRes);

      if (!decomposeRes || !decomposeRes.parts) {
        throw new Error('분석 결과가 올바르지 않습니다.');
      }

      analysisData.value = decomposeRes;
      await createPyramidTree(decomposeRes);
    } catch (err) {
      console.error('어원 분석 중 오류:', err);
      error.value = '어원 분석 중 오류가 발생했습니다. 다시 시도해주세요.';
    } finally {
      isLoading.value = false;
    }
  };

  // 피라미드 형태의 트리 생성
  const createPyramidTree = async (data) => {
    console.log('피라미드 트리 생성 시작:', data);

    const { parts, combinations } = data;

    // 데이터 구조 준비
    const allItems = new Map();

    console.log('parts.length : ', parts.length);

    const lastPartIndex = parts.length - 1;

    // parts 추가 (모두 레벨 0)
    parts.forEach((part, index) => {
      // 마지막 part인지 확인
      const isLastPart = index === lastPartIndex;

      allItems.set(part.id, {
        ...part,
        type: 'part',
        children: [],
        parents: [],
        level: 0,
        isLastPart: isLastPart, // 마지막 part 표시
        domainClass: isLastPart ? data.domainClass || '' : '',
        domainGroup: isLastPart ? data.domainGroup || '' : '',
      });
    });

    // combinations 평면화 및 추가
    const flatCombinations = [];
    combinations.forEach((group) => {
      group.forEach((combination) => {
        flatCombinations.push(combination);
        allItems.set(combination.id, {
          ...combination,
          type: 'combination',
          children: [],
          parents: [],
          level: 0,
          isLastPart: false,
          domainClass: '',
          domainGroup: '',
        });
      });
    });

    // 부모-자식 관계 설정
    allItems.forEach((item) => {
      if (item.sourceIds && item.sourceIds.length > 0) {
        item.sourceIds.forEach((sourceId) => {
          const childItem = allItems.get(sourceId);
          if (childItem) {
            item.children.push(sourceId);
            childItem.parents.push(item.id);
          }
        });
      }
    });

    // 계층적 레벨 계산
    const calculateHierarchicalLevels = () => {
      parts.forEach((part) => {
        allItems.get(part.id).level = 0;
      });

      let maxLevel = 0;
      let changed = true;

      while (changed) {
        changed = false;

        flatCombinations.forEach((combination) => {
          const item = allItems.get(combination.id);
          if (item.children.length > 0) {
            const maxChildLevel = Math.max(
              ...item.children.map((childId) => allItems.get(childId).level)
            );
            const newLevel = maxChildLevel + 1;

            if (newLevel !== item.level) {
              item.level = newLevel;
              maxLevel = Math.max(maxLevel, newLevel);
              changed = true;
            }
          }
        });
      }

      return maxLevel;
    };

    const maxLevel = calculateHierarchicalLevels();

    // 레벨별 노드 그룹화
    const nodesByLevel = {};
    for (let i = 0; i <= maxLevel; i++) {
      nodesByLevel[i] = [];
    }

    allItems.forEach((item) => {
      nodesByLevel[item.level].push(item);
    });

    console.log('레벨별 노드 분포:', nodesByLevel);

    // 각 노드의 크기 미리 계산
    const nodeSizes = new Map();
    allItems.forEach((item) => {
      const nodeWidth = calculateNodeWidth(item.text, item.english);
      nodeSizes.set(item.id, nodeWidth);
    });

    // 1단계: 최적 줌 레벨 계산 및 설정
    updateContainerSize();
    const { width: containerWidth, height: containerHeight } =
      containerSize.value;
    const optimalZoom = calculateOptimalZoom(nodesByLevel, maxLevel, nodeSizes);

    // 뷰포트를 즉시 설정 (애니메이션 없이)
    if (vueFlowRef.value) {
      await vueFlowRef.value.setViewport(
        {
          x: 0,
          y: 0,
          zoom: optimalZoom,
        },
        { duration: 0 }
      );
      console.log(`초기 줌 설정: ${optimalZoom.toFixed(2)}배`);
    }

    // 2단계: 노드 위치 계산 (화면 중앙 기준)
    const allNodes = [];
    const allEdges = [];

    // 전체 트리 크기 계산
    const totalHeight = (maxLevel + 1) * LEVEL_HEIGHT;
    let maxLevelWidth = 0;

    Object.values(nodesByLevel).forEach((levelItems) => {
      if (levelItems.length === 0) return;
      const levelWidth = levelItems.reduce((sum, item, index) => {
        const nodeWidth = nodeSizes.get(item.id) || MIN_NODE_WIDTH;
        return sum + nodeWidth + (index > 0 ? MIN_NODE_SPACING : 0);
      }, 0);
      maxLevelWidth = Math.max(maxLevelWidth, levelWidth);
    });

    // 트리 시작 위치 (화면 중앙 기준, 현재 줌 고려)
    const startX = (containerWidth / optimalZoom - maxLevelWidth) / 2;
    const startY = (containerHeight / optimalZoom - totalHeight) / 2;

    console.log('트리 시작 위치:', { startX, startY, optimalZoom });

    Object.keys(nodesByLevel).forEach((levelStr) => {
      const level = parseInt(levelStr);
      const levelItems = nodesByLevel[level];

      if (levelItems.length === 0) return;

      // Y 좌표: 높은 레벨일수록 위에 위치
      const y = startY + (maxLevel - level) * LEVEL_HEIGHT;

      // X 좌표 계산 - 각 레벨의 중앙 정렬
      const calculateXPositions = (items) => {
        const count = items.length;
        if (count === 1) {
          const nodeWidth = nodeSizes.get(items[0].id);
          return [containerWidth / optimalZoom / 2 - nodeWidth / 2];
        }

        const totalWidth = items.reduce((sum, item, index) => {
          const nodeWidth = nodeSizes.get(item.id);
          return sum + nodeWidth + (index > 0 ? MIN_NODE_SPACING : 0);
        }, 0);

        let currentX = (containerWidth / optimalZoom - totalWidth) / 2;

        return items.map((item) => {
          const nodeWidth = nodeSizes.get(item.id);
          const nodeStartX = currentX;
          currentX += nodeWidth + MIN_NODE_SPACING;
          return nodeStartX;
        });
      };

      const xPositions = calculateXPositions(levelItems);

      // 노드 생성
      levelItems.forEach((item, index) => {
        console.log(
          'index : ',
          index,
          'item : ',
          item.text,
          'isLastPart:',
          item.isLastPart
        );

        const x = xPositions[index];
        const nodeWidth = nodeSizes.get(item.id);

        // 노드 타입 결정 - 마지막 part는 'domain' 타입
        let nodeType;
        if (level === maxLevel) {
          nodeType = 'root';
        } else if (item.isLastPart) {
          nodeType = 'domain'; // 새로운 도메인 타입
        } else if (item.type === 'combination') {
          nodeType = 'combination';
        } else {
          nodeType = 'part';
        }

        const hasParent = item.parents.length > 0;
        const hasChildren = item.children.length > 0;

        allNodes.push({
          id: item.id,
          position: { x, y },
          data: {
            label: item.text,
            definition: item.definition,
            english: item.english,
            meaning: item.meaning,
            origin: item.origin,
            domainClass: item.domainClass,
            domainGroup: item.domainGroup,
            nodeType: nodeType,
            level: level,
            hasParent: hasParent,
            hasChildren: hasChildren,
            handleOpacity: 0,
            nodeWidth: nodeWidth,
            isLastPart: item.isLastPart,
            customStyle: {
              opacity: 0,
              transform: 'scale(0.9) translateY(20px)',
            },
          },
          type: 'etymology',
        });

        // 엣지 생성
        if (item.children && item.children.length > 0) {
          item.children.forEach((childId) => {
            allEdges.push({
              id: `e-${item.id}-${childId}`,
              source: item.id,
              target: childId,
              type: 'etymology',
              animated: true,
              style: {
                strokeWidth: 2,
                opacity: 0,
              },
            });
          });
        }
      });
    });

    await animateGraphCreation(allNodes, allEdges);
  };

  const animateGraphCreation = async (allNodes, allEdges) => {
    nodes.value = allNodes;
    edges.value = allEdges;

    await nextTick();

    // 레벨별로 위에서 아래로 순차 애니메이션
    setTimeout(() => {
      // 레벨별로 노드 그룹화 (높은 레벨부터)
      const nodesByLevel = {};
      nodes.value.forEach((node) => {
        const level = node.data.level;
        if (!nodesByLevel[level]) nodesByLevel[level] = [];
        nodesByLevel[level].push(node);
      });

      const sortedLevels = Object.keys(nodesByLevel)
        .map(Number)
        .sort((a, b) => b - a);

      let delay = 0;

      // 1단계: 노드 애니메이션 (레벨별 순차)
      sortedLevels.forEach((level, levelIndex) => {
        const levelNodes = nodesByLevel[level];

        levelNodes.forEach((node, nodeIndex) => {
          setTimeout(() => {
            const nodeIndex = nodes.value.findIndex((n) => n.id === node.id);
            if (nodeIndex !== -1) {
              nodes.value[nodeIndex].data.customStyle = {
                opacity: 1,
                transform: 'scale(1) translateY(0)',
                transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              };
            }
          }, delay + nodeIndex * 100);
        });

        delay += levelNodes.length * 100 + 200;
      });

      // 2단계: Handle 애니메이션
      setTimeout(() => {
        nodes.value.forEach((node, index) => {
          setTimeout(() => {
            const nodeIndex = nodes.value.findIndex((n) => n.id === node.id);
            if (nodeIndex !== -1) {
              nodes.value[nodeIndex].data.handleOpacity = 1;
            }
          }, index * 30);
        });
      }, delay + 200);

      // 3단계: 엣지 애니메이션
      setTimeout(() => {
        edges.value.forEach((edge, index) => {
          setTimeout(() => {
            const edgeIndex = edges.value.findIndex((e) => e.id === edge.id);
            if (edgeIndex !== -1) {
              edges.value[edgeIndex].style = {
                ...edges.value[edgeIndex].style,
                opacity: 1,
                transition: 'opacity 0.6s ease-in-out',
              };
            }
          }, index * 50);
        });
      }, delay + 500);

      // 4단계: 중앙 정렬 확인 (모든 애니메이션 완료 후)
      setTimeout(() => {
        centerTreeInViewport(true);
      }, delay + 1000);
    }, 200);
  };
</script>

<style lang="scss" scoped>
  .etymology-container {
    height: 100%;
    background: linear-gradient(135deg, #1a1d29 0%, #2d3748 50%, #1a202c 100%);
    position: relative;
    overflow: hidden;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .main-flow {
    height: 100%;
    width: 100%;
  }

  /* 민무늬 배경 */
  .plain-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1a1d29 0%, #2d3748 50%, #1a202c 100%);
    z-index: -1;
  }

  /* 왼쪽 상단 고정 헤더 */
  .fixed-header {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    pointer-events: auto;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(15px);
    padding: 10px;
    border-radius: 15px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .search-container {
    display: flex;
    gap: 10px;
    min-width: 400px;
  }

  .search-input {
    flex: 1;
    padding: 12px 16px;
    border: none;
    border-radius: 25px;
    background: rgba(255, 255, 255, 0.08);
    color: white;
    font-size: 14px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);

    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(96, 184, 131, 0.4);
      border-color: rgba(96, 184, 131, 0.5);
      background: rgba(255, 255, 255, 0.12);
    }
  }

  .search-btn {
    padding: 12px 24px;
    background: linear-gradient(45deg, #60b883, #4caf50);
    border: none;
    border-radius: 25px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    box-shadow: 0 4px 15px rgba(96, 184, 131, 0.3);

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(96, 184, 131, 0.4);
      background: linear-gradient(45deg, #66c389, #52b556);
    }

    &:disabled {
      background: linear-gradient(45deg, #64748b, #94a3b8);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  }

  /* 인트로 오버레이 */
  .intro-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 500;
    pointer-events: none;
  }

  .intro-content {
    text-align: center;
    color: white;
    transition: opacity 1s ease;

    &.fade-out {
      opacity: 0;
    }
  }

  .intro-title {
    font-size: 4rem;
    font-weight: bold;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #60b883, #4facfe);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: slideIn 1s ease-out forwards;
  }

  .intro-subtitle {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.7);
    animation: fadeIn 1s ease-out 0.5s forwards;
    opacity: 0;
  }

  /* 상태 오버레이 */
  .status-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    z-index: 500;
    pointer-events: none;
  }

  .loading-state,
  .error-state,
  .empty-state {
    text-align: center;
    max-width: 500px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(15px);
    border-radius: 15px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    pointer-events: auto;
  }

  .error-icon,
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 20px;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 255, 255, 0.2);
    border-top: 4px solid #60b883;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  .error-state {
    border-color: rgba(239, 68, 68, 0.3);
    background: rgba(239, 68, 68, 0.05);
    color: rgba(252, 165, 165, 0.9);
  }

  /* 노드 스타일 */
  .node {
    position: relative;
    box-sizing: border-box;
  }

  .node-card {
    position: relative;
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.12),
      rgba(255, 255, 255, 0.05)
    );
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 15px;
    padding: 20px;
    color: white;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    width: 100%;
    box-sizing: border-box;

    &:hover {
      transform: translateY(-5px) scale(1.02) !important;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
      border-color: rgba(96, 184, 131, 0.5);
      background: linear-gradient(
        145deg,
        rgba(96, 184, 131, 0.15),
        rgba(96, 184, 131, 0.08)
      );
    }
  }

  .root-node .node-card {
    background: linear-gradient(145deg, #60b883, #4caf50);
    border-color: rgba(255, 255, 255, 0.3);
    font-size: 18px;
    font-weight: 700;
    box-shadow: 0 12px 40px rgba(96, 184, 131, 0.3);

    &:hover {
      background: linear-gradient(145deg, #66c389, #52b556) !important;
      box-shadow: 0 20px 50px rgba(96, 184, 131, 0.4);
    }
  }

  /* 도메인 노드 스타일 - 골드/오렌지 색상 */
  .domain-node .node-card {
    background: linear-gradient(145deg, #f59e0b, #d97706);
    border-color: rgba(245, 158, 11, 0.5);
    font-size: 16px;
    font-weight: 600;
    box-shadow: 0 12px 40px rgba(245, 158, 11, 0.3);
    position: relative;

    /* 도메인 표시 아이콘 */
    &::before {
      content: '🏛️';
      position: absolute;
      top: -5px;
      right: -5px;
      font-size: 16px;
      background: rgba(245, 158, 11, 0.9);
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(255, 255, 255, 0.8);
    }

    &:hover {
      background: linear-gradient(145deg, #fbbf24, #f59e0b) !important;
      box-shadow: 0 20px 50px rgba(245, 158, 11, 0.4);
      border-color: rgba(251, 191, 36, 0.6);
    }
  }

  .level-1 .node-card {
    background: linear-gradient(
      145deg,
      rgba(79, 172, 254, 0.2),
      rgba(59, 130, 246, 0.15)
    );
    border-color: rgba(79, 172, 254, 0.3);

    &:hover {
      border-color: rgba(79, 172, 254, 0.5);
      background: linear-gradient(
        145deg,
        rgba(79, 172, 254, 0.25),
        rgba(59, 130, 246, 0.18)
      );
    }
  }

  .level-2 .node-card {
    background: linear-gradient(
      145deg,
      rgba(168, 85, 247, 0.2),
      rgba(147, 51, 234, 0.15)
    );
    border-color: rgba(168, 85, 247, 0.3);

    &:hover {
      border-color: rgba(168, 85, 247, 0.5);
      background: linear-gradient(
        145deg,
        rgba(168, 85, 247, 0.25),
        rgba(147, 51, 234, 0.18)
      );
    }
  }

  .level-3 .node-card {
    background: linear-gradient(
      145deg,
      rgba(236, 72, 153, 0.2),
      rgba(219, 39, 119, 0.15)
    );
    border-color: rgba(236, 72, 153, 0.3);

    &:hover {
      border-color: rgba(236, 72, 153, 0.5);
      background: linear-gradient(
        145deg,
        rgba(236, 72, 153, 0.25),
        rgba(219, 39, 119, 0.18)
      );
    }
  }

  .node-title {
    font-weight: 600;
    font-size: 24px;
    margin-bottom: 8px;
    color: white;
    word-break: keep-all;
  }

  .node-subtitle {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 400;
    margin-bottom: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .node-description {
    font-size: 20px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.3;
    margin-bottom: 4px;
  }

  .node-meaning {
    font-size: 20px;
    color: rgba(96, 184, 131, 0.9);
    line-height: 1.3;
    font-style: italic;
    font-weight: 500;
  }

  /* 팝업 스타일 */
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    z-index: 1999;
  }

  .node-detail-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2000;
    width: 90%;
    max-width: 500px;
    animation: popIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  .popup-content {
    background: linear-gradient(
      135deg,
      rgba(30, 41, 59, 0.95),
      rgba(15, 23, 42, 0.95)
    );
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 15px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    overflow: hidden;
  }

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(96, 184, 131, 0.1);

    h4 {
      margin: 0;
      color: white;
      font-size: 18px;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      border-radius: 50%;

      &:hover {
        color: white;
        background: rgba(255, 255, 255, 0.1);
        transform: scale(1.1);
      }
    }
  }

  .popup-body {
    padding: 24px;
    color: rgba(255, 255, 255, 0.9);

    .popup-item {
      margin-bottom: 16px;
      font-size: 14px;
      line-height: 1.5;

      strong {
        color: #60b883;
        margin-right: 8px;
        font-weight: 600;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  /* VueFlow 커스텀 스타일 */
  .flow-controls {
    position: absolute;
    bottom: 20px;
    left: 20px;
    margin: 0;
  }

  /* Handle 스타일 */
  :deep(.vue-flow__handle) {
    background: rgba(96, 184, 131, 0.8) !important;
    border: 2px solid rgba(255, 255, 255, 0.8) !important;
    width: 8px !important;
    height: 8px !important;
    position: absolute !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    margin-left: 0 !important;
  }

  :deep(.custom-handle) {
    background: rgba(96, 184, 131, 0.8) !important;
    border: 2px solid rgba(255, 255, 255, 0.8) !important;
    width: 8px !important;
    height: 8px !important;
    position: absolute !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    margin-left: 0 !important;

    &.custom-handle-top {
      top: -4px !important;
    }

    &.custom-handle-bottom {
      bottom: -4px !important;
    }
  }

  :deep(.vue-flow__controls) {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

    button {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      margin-bottom: 8px;
      color: white;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(96, 184, 131, 0.2);
        border-color: rgba(96, 184, 131, 0.3);
      }

      svg {
        fill: white;
      }
    }
  }

  :deep(.glowing-edge) {
    filter: drop-shadow(0 0 3px rgba(96, 184, 131, 0.4));
  }

  :deep(.vue-flow__background) {
    display: none !important;
  }

  :deep(.vue-flow__pane) {
    background: transparent !important;
  }

  /* 애니메이션 */
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes slideIn {
    0% {
      transform: translateY(30px);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes popIn {
    0% {
      transform: translate(-50%, -50%) scale(0.9);
      opacity: 0;
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
  }
</style>
