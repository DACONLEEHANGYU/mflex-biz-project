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
      @pane-ready="onPaneReady"
    >
      <div
        v-if="showSearchResults === true || nodes.length != 0"
        style="display: flex; justify-content: center; width: 100%"
      >
        <EtymologySearchPanel
          v-model:search-term="searchTerm"
          v-model:search-type="searchType"
          :is-loading="isLoading"
          :showSearchResults="showSearchResults"
          :is-search-loding="isSearchLoading"
          :etymologyState="nodes.length != 0"
          @etymology="analyzeWord"
          @dictionary-search="handleDictionarySearch"
        />
      </div>
      <!-- 민무늬 배경 -->
      <!-- <div class="plain-background"></div> -->

      <!-- 용어 사전 사이드바 -->
      <EtymologyTermSidebar
        :selected-node="selectedNode"
        :is-open="sidebarOpen"
        @term-selected="openTermDetailModal"
        @toggle-sidebar="toggleSidebar"
      />

      <!-- 중앙 검색 결과 컴포넌트 -->
      <EtymologySearchResults
        :is-visible="showSearchResults"
        :search-data="searchResultData"
        :isSearch="isSearch"
        :searchTerm="searchTerm"
        :is-loading="isSearchLoading"
        @close="closeSearchResults"
        @term-selected="openTermDetailModal"
      />

      <!-- 인트로 화면 - 검색 결과가 없고 노드가 없을 때만 표시 -->
      <div
        v-if="!showSearchResults && nodes.length === 0 && isLoading === false"
        class="intro-overlay"
      >
        <div class="intro-content" :class="{ 'fade-out': isIntroFading }">
          <h1 class="intro-title">Mflex</h1>

          <!-- 검색 패널 컴포넌트 -->
          <div>
            <EtymologySearchPanel
              v-model:search-term="searchTerm"
              v-model:search-type="searchType"
              :is-loading="isLoading"
              :is-search-loding="isSearchLoading"
              @etymology="analyzeWord"
              @dictionary-search="handleDictionarySearch"
            />
          </div>

          <div class="intro-subtitle">메타 검색과 함께 어원을 톺아보세요.</div>
        </div>
      </div>

      <!-- 상태 표시 (로딩/에러/빈 상태) -->
      <div
        class="status-overlay"
        v-if="!showIntro && nodes.length === 0 && !showSearchResults"
      >
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>어원 분석 중...</p>
        </div>
        <div v-else-if="error" class="error-state">
          <div class="error-icon">⚠️</div>
          <p>{{ error }}</p>
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
            <div class="node-definition">
              {{
                nodeProps.data.definition
                  ? nodeProps.data.definition
                  : nodeProps.data.meaning
              }}
            </div>
            <div class="node-eng">{{ nodeProps.data.english }}</div>
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

    <!-- 용어 상세 모달 -->
    <TermDetailModal
      :is-visible="showTermDetailModal"
      :term-data="selectedTermData"
      @close="closeTermDetailModal"
    />
  </div>
</template>

<script setup>
  import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue';
  import { VueFlow, Handle, Position, useVueFlow } from '@vue-flow/core';
  import { Controls } from '@vue-flow/controls';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import {
    etymologyDecompose,
    etymologySearch,
    etymologySearchWord,
  } from '@/utils/mflexApi/etymology/etymology';
  import EtymologySearchPanel from './EtymologySearchPanel.vue';
  import EtymologySearchResults from './EtymologySearchResults.vue';
  import EtymologyTermSidebar from './EtymologyTermSidebar.vue';
  import TermDetailModal from './TermDetailModal.vue';
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

  // 🔥 반응형 레이아웃 상수들
  const BASE_LEVEL_HEIGHT = 220;
  const BASE_MIN_NODE_WIDTH = 180;
  const BASE_MAX_NODE_WIDTH = 350;
  const BASE_MIN_NODE_SPACING = 120;

  // 🔥 동적 레이아웃 계산 상수들
  const getResponsiveConstants = () => {
    const containerWidth = containerSize.value.width;
    const containerHeight = containerSize.value.height;

    // 컨테이너 크기에 따른 스케일 팩터
    const widthScale = Math.min(Math.max(containerWidth / 1200, 0.7), 1.5);
    const heightScale = Math.min(Math.max(containerHeight / 800, 0.7), 1.5);

    return {
      LEVEL_HEIGHT: BASE_LEVEL_HEIGHT * heightScale,
      MIN_NODE_WIDTH: BASE_MIN_NODE_WIDTH * widthScale,
      MAX_NODE_WIDTH: BASE_MAX_NODE_WIDTH * widthScale,
      MIN_NODE_SPACING: BASE_MIN_NODE_SPACING * widthScale,
    };
  };

  // 상태 관리
  const nodes = ref([]);
  const edges = ref([]);
  const searchTerm = ref('');
  const analysisData = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const showIntro = ref(true);
  const isIntroFading = ref(false);
  const containerSize = ref({ width: 1200, height: 800 });
  const searchType = ref('term');

  // 모달 관련 상태
  const showTermDetailModal = ref(false);
  const selectedTermData = ref({});
  const selectedNode = ref(null);
  const sidebarOpen = ref(false);

  // 검색 결과 상태
  const showSearchResults = ref(false);
  const searchResultData = ref(null);
  const isSearchLoading = ref(false);
  const isSearch = ref(false);

  // 🔥 리사이즈 디바운스
  let resizeTimeout = null;
  const debounceResize = (callback, delay = 300) => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(callback, delay);
  };

  // 사이드바 토글 함수
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
  };

  // 노드 클릭 핸들러
  const onNodeClick = (nodeData) => {
    console.log('노드 클릭:', nodeData);
    selectedNode.value = nodeData;
    sidebarOpen.value = true;
  };

  // 용어 상세 모달 열기/닫기
  const openTermDetailModal = (termData) => {
    console.log('용어 상세 모달 열기:', termData);
    selectedTermData.value = termData;
    showTermDetailModal.value = true;
  };

  const closeTermDetailModal = () => {
    showTermDetailModal.value = false;
    selectedTermData.value = {};
  };

  // 🔥 반응형 텍스트 길이에 따른 노드 크기 계산
  const calculateNodeWidth = (text, englishText = '') => {
    const { MIN_NODE_WIDTH, MAX_NODE_WIDTH } = getResponsiveConstants();

    const koreanLength = (text || '').length;
    const englishLength = (englishText || '').length;
    const effectiveLength = Math.max(koreanLength, englishLength * 0.7);

    // 컨테이너 크기에 따른 기본 크기 조정
    const baseWidth = Math.min(containerSize.value.width * 0.15, 120);
    const calculatedWidth = Math.max(
      MIN_NODE_WIDTH,
      Math.min(MAX_NODE_WIDTH, baseWidth + effectiveLength * 12)
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

  // 노드 레벨별 클래스
  const getNodeLevelClass = (data) => {
    if (data.nodeType === 'root') return 'root-node';
    if (data.nodeType === 'domain') return 'domain-node';
    if (data.level === 0) return 'level-3';
    if (data.level === 1) return 'level-2';
    return 'level-1';
  };

  // 🔥 컨테이너 크기 업데이트 (개선된 버전)
  const updateContainerSize = () => {
    if (vueFlowRef.value && vueFlowRef.value.$el) {
      const container = vueFlowRef.value.$el;
      const rect = container.getBoundingClientRect();

      const newSize = {
        width: rect.width || container.clientWidth || 1200,
        height: rect.height || container.clientHeight || 800,
      };

      // 크기가 실제로 변경된 경우만 업데이트
      if (
        Math.abs(newSize.width - containerSize.value.width) > 10 ||
        Math.abs(newSize.height - containerSize.value.height) > 10
      ) {
        console.log('컨테이너 크기 업데이트:', newSize);
        containerSize.value = newSize;

        // 노드가 있는 경우 레이아웃 재계산
        if (nodes.value.length > 0 && analysisData.value) {
          debounceResize(() => {
            recalculateLayout();
          });
        }
      }
    }
  };

  // 🔥 VueFlow Pane 준비 완료 이벤트
  const onPaneReady = () => {
    console.log('VueFlow Pane 준비 완료');
    updateContainerSize();
  };

  // 🔥 레이아웃 재계산 함수
  const recalculateLayout = async () => {
    if (!analysisData.value || nodes.value.length === 0) return;

    console.log('레이아웃 재계산 시작');

    // 기존 노드들의 데이터 보존
    const existingNodes = [...nodes.value];

    // 새로운 레이아웃으로 트리 재생성
    await createPyramidTree(analysisData.value, false); // 애니메이션 없이

    console.log('레이아웃 재계산 완료');
  };

  // 어원 분석 함수
  const analyzeWord = async () => {
    if (!searchTerm.value.trim()) {
      error.value = '분석할 단어를 입력해주세요.';
      return;
    }

    showIntro.value = false;
    showSearchResults.value = false;
    searchResultData.value = null;

    nodes.value = [];
    edges.value = [];
    analysisData.value = null;
    error.value = null;
    isLoading.value = true;

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
      await createPyramidTree(decomposeRes, true); // 애니메이션 포함
    } catch (err) {
      console.error('어원 분석 중 오류:', err);
      error.value = '어원 분석 중 오류가 발생했습니다. 다시 시도해주세요.';
    } finally {
      isLoading.value = false;
    }
  };

  // 사전 검색 핸들러
  const handleDictionarySearch = async (searchData) => {
    console.log('Dictionary search:', searchData);

    showIntro.value = false;
    isSearchLoading.value = true;
    showSearchResults.value = true;

    // 어원 분석 결과 숨기기
    nodes.value = [];
    edges.value = [];

    try {
      const apiData = {
        koreanLable: searchData.term,
        instituteId: useMetaMngInstId,
        dictionaryId: useDctnryId,
      };

      let response;
      console.log('검색 결과:', response);

      searchResultData.value = {
        searchTerm: searchData.term,
        searchType: searchData.type,
        results: response || [],
      };

      isSearch.value = true;
    } catch (err) {
      console.error('사전 검색 중 오류:', err);
      error.value = '사전 검색 중 오류가 발생했습니다. 다시 시도해주세요.';
    } finally {
      isSearchLoading.value = false;
    }
  };

  // 🔥 피라미드 형태의 트리 생성 (반응형 개선)
  const createPyramidTree = async (data, withAnimation = true) => {
    console.log('피라미드 트리 생성 시작:', data);

    // 현재 컨테이너 크기 업데이트
    updateContainerSize();
    const { LEVEL_HEIGHT, MIN_NODE_SPACING } = getResponsiveConstants();

    const { parts, combinations } = data;
    const allItems = new Map();
    const lastPartIndex = parts.length - 1;

    // parts 추가 (모두 레벨 0)
    parts.forEach((part, index) => {
      const isLastPart = index === lastPartIndex;
      allItems.set(part.id, {
        ...part,
        type: 'part',
        children: [],
        parents: [],
        level: 0,
        isLastPart: isLastPart,
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
          description: data.description || '',
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

    // 🔥 각 노드의 크기 재계산 (반응형)
    const nodeSizes = new Map();
    allItems.forEach((item) => {
      const nodeWidth = calculateNodeWidth(item.text, item.english);
      nodeSizes.set(item.id, nodeWidth);
    });

    // 🔥 최적 줌 레벨 계산 (반응형 개선)
    const { width: containerWidth, height: containerHeight } =
      containerSize.value;
    const totalHeight = (maxLevel + 1) * LEVEL_HEIGHT;
    let maxLevelWidth = 0;

    Object.values(nodesByLevel).forEach((levelItems) => {
      if (levelItems.length === 0) return;
      const levelWidth = levelItems.reduce((sum, item, index) => {
        const nodeWidth = nodeSizes.get(item.id) || MIN_NODE_SPACING;
        return sum + nodeWidth + (index > 0 ? MIN_NODE_SPACING : 0);
      }, 0);
      maxLevelWidth = Math.max(maxLevelWidth, levelWidth);
    });

    const requiredWidth = maxLevelWidth * 1.2; // 여백 감소
    const requiredHeight = totalHeight * 1.2;
    const scaleX = containerWidth / requiredWidth;
    const scaleY = containerHeight / requiredHeight;
    const optimalZoom = Math.max(Math.min(scaleX, scaleY, 1.0), 0.2);

    // 뷰포트를 즉시 설정
    if (vueFlowRef.value) {
      await vueFlowRef.value.setViewport(
        {
          x: 0,
          y: 0,
          zoom: optimalZoom,
        },
        { duration: 0 }
      );
      console.log(
        `줌 설정: ${optimalZoom.toFixed(
          2
        )}배 (컨테이너: ${containerWidth}x${containerHeight})`
      );
    }

    // 🔥 노드 위치 계산 (중앙 정렬 개선)
    const allNodes = [];
    const allEdges = [];

    Object.keys(nodesByLevel).forEach((levelStr) => {
      const level = parseInt(levelStr);
      const levelItems = nodesByLevel[level];

      if (levelItems.length === 0) return;

      const y =
        (containerHeight / optimalZoom - totalHeight) / 2 +
        (maxLevel - level) * LEVEL_HEIGHT;

      // X 좌표 계산 (중앙 정렬)
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
        const x = xPositions[index];
        const nodeWidth = nodeSizes.get(item.id);

        let nodeType;
        if (level === maxLevel) {
          nodeType = 'root';
        } else if (item.isLastPart) {
          nodeType = 'domain';
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
            description: item.description,
            nodeType: nodeType,
            level: level,
            hasParent: hasParent,
            hasChildren: hasChildren,
            handleOpacity: withAnimation ? 0 : 1,
            nodeWidth: nodeWidth,
            isLastPart: item.isLastPart,
            inDictionary: true,
            customStyle: withAnimation
              ? {
                  opacity: 0,
                  transform: 'scale(0.9) translateY(20px)',
                }
              : {
                  opacity: 1,
                  transform: 'scale(1) translateY(0)',
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
                opacity: withAnimation ? 0 : 1,
              },
            });
          });
        }
      });
    });

    if (withAnimation) {
      await animateGraphCreation(allNodes, allEdges);
    } else {
      nodes.value = allNodes;
      edges.value = allEdges;
    }
  };

  // 애니메이션 함수 (기존과 동일)
  const animateGraphCreation = async (allNodes, allEdges) => {
    nodes.value = allNodes;
    edges.value = allEdges;

    await nextTick();

    setTimeout(() => {
      // 레벨별로 노드 그룹화
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

      // 노드 애니메이션
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

      // Handle 애니메이션
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

      // 엣지 애니메이션
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
    }, 200);
  };

  const closeSearchResults = () => {
    showSearchResults.value = false;
    searchResultData.value = null;
  };

  // 🔥 컨테이너 크기 변경 감시
  watch(
    () => containerSize.value,
    (newSize, oldSize) => {
      if (
        Math.abs(newSize.width - (oldSize?.width || 0)) > 50 ||
        Math.abs(newSize.height - (oldSize?.height || 0)) > 50
      ) {
        console.log('컨테이너 크기 변경 감지:', newSize);
        // 레이아웃 재계산은 디바운스로 처리
      }
    },
    { deep: true }
  );

  onMounted(() => {
    console.log('EtymologyAnalyzer 컴포넌트 마운트됨');

    // 초기 크기 설정
    setTimeout(() => {
      updateContainerSize();
    }, 100);

    // 🔥 ResizeObserver 사용 (더 정확한 크기 감지)
    if (vueFlowRef.value?.$el) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            debounceResize(() => {
              updateContainerSize();
            });
          }
        }
      });

      resizeObserver.observe(vueFlowRef.value.$el);

      // cleanup function
      onUnmounted(() => {
        resizeObserver.disconnect();
      });
    }

    // 윈도우 리사이즈 이벤트도 유지 (fallback)
    window.addEventListener('resize', () => {
      debounceResize(updateContainerSize);
    });
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateContainerSize);
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
  });
</script>

<style lang="scss" scoped>
  .etymology-container {
    height: 100%;
    width: 100%;
    background: linear-gradient(135deg, #1a1d29 0%, #2d3748 50%, #1a202c 100%);
    position: relative;
    overflow: hidden;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    /* 🔥 Flex 컨테이너로 설정 */
    display: flex;
    flex-direction: column;
  }

  .main-flow {
    /* 🔥 Flex 아이템으로 설정하여 컨테이너에 맞게 확장 */
    flex: 1;
    width: 100%;
    position: relative;
    min-height: 0; /* flex shrink을 위해 필요 */
  }

  .plain-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1a1d29 0%, #2d3748 50%, #1a202c 100%);
    z-index: -1;
  }

  /* 🔥 반응형 인트로 오버레이 */
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
    padding: 20px; /* 모바일에서 여백 추가 */
    bottom: 150px;
  }

  .intro-content {
    text-align: center;
    color: white;
    transition: opacity 1s ease;
    max-width: 90%; /* 반응형 최대 너비 */
    margin-bottom: 100px;

    &.fade-out {
      opacity: 0;
    }
  }

  .intro-title {
    /* 🔥 반응형 폰트 크기 */
    font-size: 90px;
    font-weight: bold;
    margin-bottom: 30px;
    background: linear-gradient(135deg, #66d191, #00a79d);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: slideIn 1s ease-out forwards;
  }

  .intro-subtitle {
    /* 🔥 반응형 폰트 크기 */
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
    animation: fadeIn 1s ease-out 0.5s forwards;
    opacity: 0;
  }

  /* 🔥 반응형 상태 오버레이 */
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
    padding: 20px;
  }

  .loading-state,
  .error-state,
  .empty-state {
    text-align: center;
    // max-width: min(500px, 90%); /* 반응형 최대 너비 */
    padding: clamp(20px, 5vw, 40px); /* 반응형 패딩 */
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(15px);
    border-radius: 15px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    pointer-events: auto;
  }

  .error-icon,
  .empty-icon {
    font-size: clamp(2rem, 6vw, 3rem); /* 반응형 아이콘 크기 */
    margin-bottom: 20px;
  }

  .spinner {
    width: clamp(40px, 8vw, 50px); /* 반응형 스피너 크기 */
    height: clamp(40px, 8vw, 50px);
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

  /* 🔥 반응형 노드 스타일 */
  .node {
    position: relative;
    box-sizing: border-box;
  }

  .node-card {
    position: relative;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: clamp(8px, 2vw, 12px); /* 반응형 border-radius */
    padding: clamp(8px, 2vw, 17px) clamp(10px, 2.5vw, 17px); /* 반응형 패딩 */
    color: white;
    text-align: left;
    transition: all 0.25s ease;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    width: 100%;
    box-sizing: border-box;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      border-color: rgba(255, 255, 255, 0.25);
    }
  }

  /* 루트 노드 */
  .root-node .node-card {
    border-left: 4px solid #34a853;
    border-right: 4px solid #34a853;
    font-weight: 600;

    &:hover {
      border-color: #34a853;
    }
  }

  /* 도메인 노드 */
  .domain-node .node-card {
    border-left: 4px solid #24506d;
    border-right: 4px solid #24506d;
    font-weight: 500;

    &:hover {
      border-color: #24506d;
    }
  }

  /* 레벨 1 노드 */
  .level-1 .node-card {
    border-left: 4px solid #2196f3;
    border-right: 4px solid #2196f3;
    border-color: rgba(33, 150, 243, 0.25);

    &:hover {
      background: linear-gradient(
        135deg,
        rgba(33, 150, 243, 0.18),
        rgba(33, 150, 243, 0.1)
      );
      border-color: rgba(33, 150, 243, 0.35);
    }
  }

  /* 레벨 2 노드 */
  .level-2 .node-card {
    border-left: 4px solid #89bb9e;
    border-right: 4px solid #89bb9e;

    &:hover {
      border-color: #89bb9e;
    }
  }

  /* 레벨 3 노드 */
  .level-3 .node-card {
    border-left: 4px solid #ceeb89a9;
    border-right: 4px solid #ceeb89a9;

    &:hover {
      border-color: #ceeb89a9;
    }
  }

  .node-title {
    font-weight: 500;
    /* 🔥 반응형 폰트 크기 */
    font-size: clamp(16px, 3vw, 20px);
    margin-bottom: 8px;
    color: white;
    word-break: keep-all;
    line-height: 1.3;
    text-align: left;
  }

  .node-definition {
    margin-top: 12px;
    /* 🔥 반응형 폰트 크기 */
    font-size: clamp(13px, 2.5vw, 15px);
    color: rgba(255, 255, 255, 0.8);
    word-break: keep-all;
  }

  .node-eng {
    margin-top: 5px;
    /* 🔥 반응형 폰트 크기 */
    font-size: clamp(13px, 2.5vw, 15px);
    color: rgba(255, 255, 255, 0.541);
    word-break: keep-all;
  }

  /* VueFlow 커스텀 스타일 */
  .flow-controls {
    position: absolute;
    bottom: 20px;
    left: 20px;
    margin: 0;
  }

  :deep(.vue-flow__handle) {
    background: rgba(96, 184, 131, 0.8) !important;
    border: 2px solid rgba(255, 255, 255, 0.8) !important;
    width: clamp(6px, 1.5vw, 8px) !important; /* 반응형 핸들 크기 */
    height: clamp(6px, 1.5vw, 8px) !important;
    position: absolute !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    margin-left: 0 !important;
  }

  :deep(.custom-handle) {
    background: rgba(96, 184, 131, 0.8) !important;
    border: 2px solid rgba(255, 255, 255, 0.8) !important;
    width: clamp(6px, 1.5vw, 8px) !important;
    height: clamp(6px, 1.5vw, 8px) !important;
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
    display: none;
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

  /* 🔥 반응형 미디어 쿼리 추가 */
  @media (max-width: 768px) {
    .etymology-container {
      padding: 0;
    }

    .intro-overlay,
    .status-overlay {
      padding: 10px;
    }

    .node-card {
      padding: 8px 12px;
    }

    .flow-controls {
      bottom: 10px;
      left: 10px;
    }
  }

  @media (max-width: 480px) {
    .node-title {
      font-size: 16px;
    }

    .node-definition,
    .node-eng {
      font-size: 13px;
    }
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

  :deep(.vue-flow__viewport) {
    background-color: #1e1d1c;
  }

  /* 엣지(연결선)가 보이도록 z-index와 스타일 조정 */
  :deep(.vue-flow__edge) {
    z-index: 10 !important;
  }

  :deep(.vue-flow__edge-path) {
    stroke: rgba(255, 255, 255, 0.6) !important;
    stroke-width: 2px !important;
    z-index: 10 !important;
  }
</style>
