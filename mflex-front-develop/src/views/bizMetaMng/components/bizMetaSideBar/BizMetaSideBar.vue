<template>
  <!-- filepath: c:\Users\dacon008\workspace\mflex-project\mflex-front\src\views\bizMetaMng\components\bizMetaSideBar\BizMetaSideBar.vue -->
  <div class="biz-meta-sidebar">
    <!-- 헤더 -->
    <div class="sidebar-header">
      <!-- 제목과 추가 버튼 -->
      <div class="header-top">
        <h2 class="sidebar-title">비즈니스용어 목록</h2>
        <!-- <button
          class="add-term-button"
          @click="showAddTermModal"
          title="새 용어 추가"
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"
            />
          </svg>
        </button> -->
      </div>

      <!-- 검색바 -->
      <div class="search-container">
        <div class="search-input-wrapper">
          <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clip-rule="evenodd"
            />
          </svg>
          <input
            v-model="searchTerm"
            type="text"
            class="search-input"
            placeholder="용어명을 입력하세요..."
            @input="handleSearch"
            @keyup.enter="performSearch"
          />
          <button v-if="searchTerm" class="clear-button" @click="clearSearch">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 카드 목록 -->
    <div class="cards-container">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>용어 목록을 불러오는 중...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <p>{{ error }}</p>
        <button class="retry-button" @click="loadTerms">다시 시도</button>
      </div>

      <div v-else-if="filteredTerms.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <p>
          {{ searchTerm ? '검색 결과가 없습니다.' : '등록된 용어가 없습니다.' }}
        </p>
      </div>

      <div v-else class="cards-list">
        <div
          v-for="term in paginatedTerms"
          :key="term.id"
          class="term-card"
          :class="{
            active: selectedTermId === term.id,
          }"
          :draggable="true"
          @click="selectTerm(term)"
          @dragstart="handleDragStart($event, term)"
          @dragend="handleDragEnd"
          @dragover.prevent
          @mouseenter="showTooltip($event, term)"
          @mouseleave="hideTooltip"
          @mousemove="updateTooltipPosition"
        >
          <!-- 드래그 인디케이터 -->
          <div class="drag-indicator">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11.5 15.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z"
              />
            </svg>
          </div>

          <!-- 카드 콘텐츠 -->
          <div class="card-content">
            <!-- 카드 헤더 -->
            <div class="card-header">
              <div class="card-title-section">
                <h3 class="term-name">{{ term.termName }}</h3>
                <div class="card-meta">
                  <span
                    class="term-type-label"
                    :class="getTermTypeClass(term.termType)"
                  >
                    {{ getTermTypeText(term.termType) }}
                  </span>
                  <span class="registration-date">{{
                    formatDate(term.registrationDate)
                  }}</span>
                </div>
              </div>

              <div class="card-actions">
                <button
                  class="delete-button"
                  @click.stop="deleteTerm(term.termId)"
                  :disabled="isDeleting"
                  title="삭제"
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

            <!-- 용어 설명 -->
            <p class="term-description">
              {{ term.termExplain || '설명이 없습니다.' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 페이징 -->
    <div v-if="totalPages > 1" class="pagination-container">
      <div class="pagination-info">
        <span
          >총 {{ filteredTerms.length }}개 중 {{ startItem }}-{{ endItem }}개
          표시</span
        >
      </div>
      <div class="pagination">
        <button
          class="page-button prev"
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              clip-rule="evenodd"
            />
          </svg>
        </button>

        <button
          v-for="page in visiblePages"
          :key="page"
          class="page-button"
          :class="{ active: page === currentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>

        <button
          class="page-button next"
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- 숨겨진 드래그 이미지 생성용 요소 -->
    <div ref="dragImageContainer" class="drag-image-container">
      <div v-if="dragState.draggedTerm" class="drag-image-card">
        <div class="drag-image-content">
          <h4 class="drag-term-name">{{ dragState.draggedTerm.termName }}</h4>
          <span
            class="drag-term-type"
            :class="getTermTypeClass(dragState.draggedTerm.termType)"
          >
            {{ getTermTypeText(dragState.draggedTerm.termType) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 🔥 툴팁 팝업 -->
    <Teleport to="body">
      <div
        v-if="tooltip.visible"
        class="term-tooltip"
        :style="{
          left: tooltip.x + 'px',
          top: tooltip.y + 'px',
        }"
      >
        <div class="tooltip-header">
          <h4 class="tooltip-title">{{ tooltip.term?.termName }}</h4>
          <span
            class="tooltip-type-badge"
            :class="getTermTypeClass(tooltip.term?.termType)"
          >
            {{ getTermTypeText(tooltip.term?.termType) }}
          </span>
        </div>

        <div class="tooltip-body">
          <!-- 기본 정보 -->
          <div class="tooltip-section">
            <div class="tooltip-row">
              <span class="tooltip-label">도메인</span>
              <span class="tooltip-value">{{
                tooltip.term?.domain || '-'
              }}</span>
            </div>
            <div class="tooltip-row">
              <span class="tooltip-label">상태</span>
              <span
                class="tooltip-value status"
                :class="tooltip.term?.status?.toLowerCase()"
              >
                {{ tooltip.term?.status === 'ACTIVE' ? '활성' : '비활성' }}
              </span>
            </div>
            <div class="tooltip-row">
              <span class="tooltip-label">등록자</span>
              <span class="tooltip-value">{{
                tooltip.term?.registeredBy || '-'
              }}</span>
            </div>
            <div class="tooltip-row">
              <span class="tooltip-label">등록일</span>
              <span class="tooltip-value">{{
                formatDate(tooltip.term?.registrationDate)
              }}</span>
            </div>
          </div>

          <!-- 설명 -->
          <div class="tooltip-section" v-if="tooltip.term?.description">
            <div class="tooltip-description-label">설명</div>
            <p class="tooltip-description">{{ tooltip.term.description }}</p>
          </div>

          <!-- 동의어 -->
          <div
            class="tooltip-section"
            v-if="tooltip.term?.synonyms && tooltip.term.synonyms.length > 0"
          >
            <div class="tooltip-description-label">동의어</div>
            <div class="tooltip-synonyms">
              <span
                v-for="(synonym, idx) in tooltip.term.synonyms"
                :key="idx"
                class="synonym-tag"
              >
                {{ synonym }}
              </span>
            </div>
          </div>

          <!-- 통계 정보 -->
          <div class="tooltip-section tooltip-stats">
            <div class="stat-item">
              <svg viewBox="0 0 20 20" fill="currentColor" class="stat-icon">
                <path
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z"
                />
              </svg>
              <div class="stat-content">
                <div class="stat-label">사용 횟수</div>
                <div class="stat-value">
                  {{ tooltip.term?.usageCount || 0 }}
                </div>
              </div>
            </div>
            <div class="stat-item">
              <svg viewBox="0 0 20 20" fill="currentColor" class="stat-icon">
                <path
                  fill-rule="evenodd"
                  d="M4.25 2A2.25 2.25 0 002 4.25v11.5A2.25 2.25 0 004.25 18h11.5A2.25 2.25 0 0018 15.75V4.25A2.25 2.25 0 0015.75 2H4.25zm4.03 6.28a.75.75 0 00-1.06-1.06L4.97 9.47a.75.75 0 000 1.06l2.25 2.25a.75.75 0 001.06-1.06L7.06 10.5h4.19l-1.22 1.22a.75.75 0 101.06 1.06l2.25-2.25a.75.75 0 000-1.06l-2.25-2.25a.75.75 0 10-1.06 1.06l1.22 1.22H7.06l1.22-1.22z"
                  clip-rule="evenodd"
                />
              </svg>
              <div class="stat-content">
                <div class="stat-label">버전</div>
                <div class="stat-value">v{{ tooltip.term?.version || 1 }}</div>
              </div>
            </div>
          </div>

          <!-- 마지막 수정 정보 -->
          <div class="tooltip-footer">
            <svg viewBox="0 0 20 20" fill="currentColor" class="footer-icon">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="footer-text"
              >최종 수정: {{ formatDateTime(tooltip.term?.lastModified) }}</span
            >
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
  // filepath: c:\Users\dacon008\workspace\mflex-project\mflex-front\src\views\bizMetaMng\components\bizMetaSideBar\BizMetaSideBar.vue
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

  import {
    getBizTerms, // 비즈니스 용어 조회
    deleteBizTerm, // 비즈니스 용어 삭제
  } from '@/utils/mflexApi/bizMeta/bizMetaApi';

  import { useBizMetaStore } from '@/stores/bizMeta';
  import { storeToRefs } from 'pinia';

  const bizMetaStore = useBizMetaStore();

  const { setIsUpdate } = bizMetaStore;
  const { isUpdate } = storeToRefs(bizMetaStore);

  // Emits - 선택된 용어와 드래그 이벤트를 외부로 전달
  const emit = defineEmits(['term-selected', 'term-dragged']);

  // 🔥 내부 상태 관리
  const terms = ref([]);
  const searchTerm = ref('');
  const currentPage = ref(1);
  const itemsPerPage = ref(15);
  const selectedTermId = ref(null);
  const isLoading = ref(false);
  const isDeleting = ref(false);
  const error = ref(null);

  // 🔥 드래그 상태 관리
  const dragState = ref({
    isDragging: false,
    draggedTermId: null,
    draggedTerm: null,
  });

  // 드래그 이미지 컨테이너 참조
  const dragImageContainer = ref(null);

  // 🔥 툴팁 상태 관리
  const tooltip = ref({
    visible: false,
    x: 0,
    y: 0,
    term: null,
  });

  let tooltipTimeout = null;
  let hideTooltipTimeout = null;

  // 🔥 툴팁 표시 함수 (수정)
  const showTooltip = (event, term) => {
    // console.log('🔍 showTooltip 호출됨:', term.termName);

    // 이전 타이머들 클리어
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      tooltipTimeout = null;
    }
    if (hideTooltipTimeout) {
      clearTimeout(hideTooltipTimeout);
      hideTooltipTimeout = null;
    }

    // 약간의 딜레이 후 툴팁 표시
    tooltipTimeout = setTimeout(() => {
      try {
        const card = event.currentTarget;
        const rect = card.getBoundingClientRect();

        console.log('📍 카드 위치:', rect);

        // 툴팁 위치 계산
        const tooltipWidth = 320;
        const tooltipHeight = 500;
        const margin = 10;

        // 기본 위치: 카드 우측
        let x = rect.right + margin;
        let y = rect.top;

        console.log('📍 초기 툴팁 위치:', { x, y });

        // 우측 공간 확인
        if (x + tooltipWidth > window.innerWidth) {
          // 우측 공간 부족 시 좌측에 표시
          x = rect.left - tooltipWidth - margin;
          console.log('📍 좌측으로 이동:', x);
        }

        // 좌측도 공간 부족하면 화면 내로 조정
        if (x < margin) {
          x = margin;
          console.log('📍 화면 내로 조정:', x);
        }

        // 하단 공간 확인
        if (y + tooltipHeight > window.innerHeight) {
          y = Math.max(margin, window.innerHeight - tooltipHeight - margin);
          console.log('📍 상단으로 조정:', y);
        }

        // 툴팁 데이터 설정
        tooltip.value = {
          visible: true,
          x,
          y,
          term: { ...term },
        };

        // console.log('✅ 툴팁 표시됨:', tooltip.value);
      } catch (error) {
        console.error('❌ 툴팁 표시 에러:', error);
      }
    }, 300);
  };

  // 🔥 툴팁 숨김 함수 (수정)
  const hideTooltip = () => {
    // console.log('🔍 hideTooltip 호출됨');

    // 표시 타이머 클리어
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      tooltipTimeout = null;
    }

    // 약간의 딜레이 후 숨김 (마우스가 빠르게 이동할 때 깜빡임 방지)
    hideTooltipTimeout = setTimeout(() => {
      tooltip.value.visible = false;
      // console.log('✅ 툴팁 숨김');
    }, 100);
  };

  // 🔥 컴포넌트 언마운트 시 타이머 정리
  onUnmounted(() => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
    }
    if (hideTooltipTimeout) {
      clearTimeout(hideTooltipTimeout);
    }
  });

  // 🔥 툴팁 위치 업데이트 (제거 - 고정 위치 사용)
  const updateTooltipPosition = (event) => {
    // 툴팁 위치는 고정
  };
  // 🔥 날짜/시간 포맷 함수
  const formatDateTime = (dateString) => {
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
      console.error('날짜 포맷 에러:', error);
      return '-';
    }
  };

  // 🔥 더미 데이터 생성 함수
  const generateDummyTerms = () => {
    const domains = [
      '고객관리',
      '주문관리',
      '재고관리',
      '인사관리',
      '회계관리',
      '마케팅',
      '시스템관리',
    ];
    const termTypes = ['GENERAL', 'COMPOSITE', 'STANDARD', 'NON_STANDARD'];
    const statuses = ['ACTIVE', 'INACTIVE'];
    const users = [
      '김철수',
      '이영희',
      '박민수',
      '최지영',
      '정현우',
      '한미영',
      '오세훈',
    ];

    const dummyTerms = [];

    for (let i = 1; i <= 127; i++) {
      const termType = termTypes[Math.floor(Math.random() * termTypes.length)];
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const user = users[Math.floor(Math.random() * users.length)];

      let termName;
      if (termType === 'COMPOSITE') {
        termName = `${domain}`;
      } else {
        const baseTerms = [
          '고객정보',
          '주문번호',
          '상품코드',
          '재고수량',
          '사용자ID',
          '결제금액',
          '배송주소',
          '할인율',
          '세금',
          '수수료',
          '포인트',
          '쿠폰',
          '카테고리',
          '브랜드',
          '모델명',
          '가격',
          '중량',
          '크기',
          '색상',
          '옵션',
          '등급',
          '상태',
          '날짜',
          '시간',
          '연락처',
          '이메일',
          '주소',
          '우편번호',
          '지역코드',
          '국가코드',
        ];
        termName = baseTerms[Math.floor(Math.random() * baseTerms.length)];
      }

      const descriptions = [
        `${termName}에 대한 상세한 설명입니다. 이 용어는 ${domain} 도메인에서 사용되며, 비즈니스 프로세스의 핵심 요소입니다.`,
        `${domain} 영역에서 중요하게 다뤄지는 ${termName} 항목으로, 데이터 품질 관리의 기준이 되는 용어입니다.`,
        `시스템 전반에서 공통적으로 사용되는 ${termName}로, 표준화된 정의에 따라 관리됩니다.`,
        `업무 프로세스 효율화를 위해 정의된 ${termName}으로, 관련 시스템 간 데이터 연계에 활용됩니다.`,
        `${domain} 업무 영역의 핵심 개념인 ${termName}으로, 정확한 이해와 적용이 필요합니다.`,
      ];

      const description =
        descriptions[Math.floor(Math.random() * descriptions.length)];

      let synonyms = [];
      if (Math.random() > 0.6) {
        const synonymCount = Math.floor(Math.random() * 3) + 1;
        synonyms = Array.from(
          { length: synonymCount },
          (_, idx) => `${termName}_동의어${idx + 1}`
        );
      }

      const registrationDate = new Date();
      registrationDate.setDate(
        registrationDate.getDate() - Math.floor(Math.random() * 365)
      );

      dummyTerms.push({
        id: i,
        termName,
        description,
        termType,
        domain,
        status,
        registrationDate: registrationDate.toISOString(),
        registeredBy: user,
        synonyms,
        lastModified: new Date().toISOString(),
        version: Math.floor(Math.random() * 10) + 1,
        usageCount: Math.floor(Math.random() * 1000),
        relatedTerms: [],
      });
    }

    return dummyTerms;
  };

  const bindingTermData = function (bizTerms) {
    const terms = bizTerms.items;
    let tempData = [];

    for (let i = 0; i < terms.length; i++) {
      const term = terms[i];
      tempData.push({
        id: i,
        termId: term.termId,
        termName: term.termName,
        termType: term.termType,
        termExplain: term.termExplain,
        compositeChildren: term.compositeChildren,
        compositeRelations: term.compositeRelations,
        compositeRelationsCount: term.compositeRelationsCount,
        compositeChildrenCount: term.compositeChildrenCount,
        relations: term.relations,
        owner: term.owner,
        createDateTime: term.createDateTime,
      });
    }
    return tempData;
  };

  const loadTerms = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const bizTerms = await getBizTerms();
      console.log('API 응답:', bizTerms);

      const termData = bindingTermData(bizTerms);

      // terms.value = generateDummyTerms();

      terms.value = termData;
      console.log('용어 목록 로딩 완료:', terms.value.length + '개');
    } catch (err) {
      error.value = '용어 목록을 불러오는데 실패했습니다.';
      console.error('용어 목록 로딩 실패:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const saveNewTerm = async (termData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newTerm = {
        ...termData,
        id: Date.now(),
        registrationDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: 1,
        usageCount: 0,
        synonyms: [],
        relatedTerms: [],
      };

      terms.value.unshift(newTerm);
      console.log('새 용어 추가 완료:', newTerm);
      return newTerm;
    } catch (err) {
      console.error('용어 추가 실패:', err);
      throw new Error('용어 추가에 실패했습니다.');
    }
  };

  const updateTerm = async (termId, updateData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const termIndex = terms.value.findIndex((term) => term.id === termId);
      if (termIndex !== -1) {
        terms.value[termIndex] = {
          ...terms.value[termIndex],
          ...updateData,
          lastModified: new Date().toISOString(),
          version: terms.value[termIndex].version + 1,
        };
        console.log('용어 수정 완료:', terms.value[termIndex]);
        return terms.value[termIndex];
      }
      throw new Error('용어를 찾을 수 없습니다.');
    } catch (err) {
      console.error('용어 수정 실패:', err);
      throw new Error('용어 수정에 실패했습니다.');
    }
  };

  const deleteTermById = async (termId) => {
    try {
      console.log('용어 삭제 요청:', termId);

      // const deletedTerm = terms.value.splice(termIndex, 1)[0];
      await deleteBizTerm(termId);

      // console.log('용어 삭제 완료:', deletedTerm);
      return true;
    } catch (err) {
      console.error('용어 삭제 실패:', err);
      throw new Error('용어 삭제에 실패했습니다.');
    }
  };

  const createDragImage = (term) => {
    dragState.value.draggedTerm = { ...term };

    return new Promise((resolve) => {
      setTimeout(() => {
        const dragImageEl =
          dragImageContainer.value?.querySelector('.drag-image-card');
        if (dragImageEl) {
          resolve(dragImageEl);
        } else {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 200;
          canvas.height = 60;

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2;
          ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

          ctx.fillStyle = '#111827';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(term.termName, canvas.width / 2, 25);

          ctx.fillStyle = '#6b7280';
          ctx.font = '12px sans-serif';
          ctx.fillText(getTermTypeText(term.termType), canvas.width / 2, 45);

          resolve(canvas);
        }
      }, 10);
    });
  };

  const handleDragStart = async (event, term) => {
    console.log('드래그 시작:', term);

    dragState.value = {
      isDragging: true,
      draggedTermId: term.id,
      draggedTerm: { ...term },
    };

    const dragData = {
      type: 'business-term',
      termId: term.id,
      termData: term,
    };

    event.dataTransfer.setData('application/json', JSON.stringify(dragData));
    event.dataTransfer.setData('text/plain', term.termName);
    event.dataTransfer.effectAllowed = 'copy';

    try {
      const dragImage = await createDragImage(term);
      if (dragImage) {
        event.dataTransfer.setDragImage(dragImage, 100, 30);
      }
    } catch (error) {
      console.warn('드래그 이미지 설정 실패:', error);
    }

    emit('term-dragged', {
      action: 'dragstart',
      term: term,
      event: event,
    });
  };

  const handleDragEnd = (event) => {
    console.log('드래그 종료');

    const draggedTerm = dragState.value.draggedTerm;

    dragState.value = {
      isDragging: false,
      draggedTermId: null,
      draggedTerm: null,
    };

    emit('term-dragged', {
      action: 'dragend',
      term: draggedTerm,
      event: event,
    });
  };

  const filteredTerms = computed(() => {
    if (!searchTerm.value.trim()) {
      return terms.value;
    }

    const query = searchTerm.value.toLowerCase().trim();
    return terms.value.filter(
      (term) =>
        term.termName.toLowerCase().includes(query) ||
        (term.description && term.description.toLowerCase().includes(query)) ||
        (term.domain && term.domain.toLowerCase().includes(query)) ||
        (term.registeredBy && term.registeredBy.toLowerCase().includes(query))
    );
  });

  const totalPages = computed(() =>
    Math.ceil(filteredTerms.value.length / itemsPerPage.value)
  );

  const paginatedTerms = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredTerms.value.slice(start, end);
  });

  const startItem = computed(() => {
    return Math.min(
      (currentPage.value - 1) * itemsPerPage.value + 1,
      filteredTerms.value.length
    );
  });

  const endItem = computed(() => {
    return Math.min(
      currentPage.value * itemsPerPage.value,
      filteredTerms.value.length
    );
  });

  const visiblePages = computed(() => {
    const total = totalPages.value;
    const current = currentPage.value;
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  // 🔥 이벤트 핸들러
  const handleSearch = () => {
    currentPage.value = 1;
  };

  const performSearch = () => {
    console.log('검색 실행:', searchTerm.value);
  };

  const clearSearch = () => {
    searchTerm.value = '';
    currentPage.value = 1;
  };

  const selectTerm = (term) => {
    selectedTermId.value = term.id;
    emit('term-selected', term);
    console.log('용어 선택됨:', term);
  };

  const showAddTermModal = () => {
    console.log('새 용어 추가 모달 표시');
  };

  const editTerm = (term) => {
    console.log('용어 수정:', term);
  };

  const deleteTerm = async (termId) => {
    if (isDeleting.value) return;

    console.log('용어 삭제 요청:', termId);

    const term = terms.value.find((t) => t.id === termId);
    if (!confirm(`'${term?.termName}' 용어를 정말로 삭제하시겠습니까?`)) {
      return;
    }

    try {
      isDeleting.value = true;
      await deleteTermById(termId);

      await loadTerms();

      if (selectedTermId.value === termId) {
        selectedTermId.value = null;
      }

      const maxPage = Math.ceil(
        filteredTerms.value.length / itemsPerPage.value
      );
      if (currentPage.value > maxPage && maxPage > 0) {
        currentPage.value = maxPage;
      }
    } catch (err) {
      alert(err.message);
    } finally {
      isDeleting.value = false;
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  };

  // 🔥 유틸리티 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getTermTypeText = (termType) => {
    const typeMap = {
      GENERAL: '일반',
      COMPOSITE: '복합',
    };
    return typeMap[termType] || '일반';
  };

  const getTermTypeClass = (termType) => {
    const classMap = {
      GENERAL: 'general',
      COMPOSITE: 'composite',
    };
    return classMap[termType] || 'general';
  };

  watch(isUpdate, (newVal) => {
    if (newVal) {
      loadTerms();
      setIsUpdate(false);
    }
  });

  // 🔥 반응형 데이터 감시
  watch(searchTerm, () => {
    currentPage.value = 1;
  });

  watch(filteredTerms, (newTerms) => {
    const maxPage = Math.ceil(newTerms.length / itemsPerPage.value);
    if (currentPage.value > maxPage && maxPage > 0) {
      currentPage.value = maxPage;
    }
  });

  // 🔥 컴포넌트 마운트 시 데이터 로딩
  onMounted(() => {
    loadTerms();
  });
</script>

<style lang="scss" scoped>
  .biz-meta-sidebar {
    width: 330px;
    min-width: 330px;
    max-width: 500px;
    height: 100%;
    background: white;
    border-right: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
    position: relative;
  }

  .sidebar-header {
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
    flex-shrink: 0;
  }

  .header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .sidebar-title {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin: 0;
    flex: 1;
  }

  .add-term-button {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      background: linear-gradient(135deg, #1d4ed8, #1e40af);
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .search-container {
    position: relative;
  }

  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 10px;
    width: 14px;
    height: 14px;
    color: #6b7280;
    z-index: 1;
  }

  .search-input {
    width: 100%;
    padding: 8px 32px 8px 30px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 13px;
    background: #f9fafb;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: #3b82f6;
      background: white;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }

    &::placeholder {
      color: #9ca3af;
    }
  }

  .clear-button {
    position: absolute;
    right: 6px;
    width: 20px;
    height: 20px;
    border: none;
    background: none;
    color: #6b7280;
    cursor: pointer;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    svg {
      width: 12px;
      height: 12px;
    }

    &:hover {
      background: #f3f4f6;
      color: #374151;
    }
  }

  .cards-container {
    flex: 1;
    overflow-y: auto;
    padding: 0 12px;
    margin: 8px 0;
  }

  .loading-state,
  .empty-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 15px;
    text-align: center;
    color: #6b7280;
  }

  .spinner {
    width: 28px;
    height: 28px;
    border: 2px solid #f3f4f6;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 10px;
  }

  .empty-icon,
  .error-icon {
    font-size: 28px;
    margin-bottom: 10px;
  }

  .retry-button {
    margin-top: 10px;
    padding: 6px 12px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s ease;

    &:hover {
      background: #2563eb;
    }
  }

  .cards-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .term-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 0;
    cursor: grab;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    display: flex;
    position: relative;

    &:hover {
      border-color: #d1d5db;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    &.active {
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }

    &:active {
      cursor: grabbing;
    }

    &[draggable='true'] {
      cursor: grab;

      &:active {
        cursor: grabbing;
      }
    }
  }

  .drag-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    background: #f9fafb;
    border-right: 1px solid #e5e7eb;
    flex-shrink: 0;
    cursor: grab;

    svg {
      width: 12px;
      height: 12px;
      color: #9ca3af;
    }

    &:active {
      cursor: grabbing;
    }
  }

  .card-content {
    flex: 1;
    padding: 8px 10px;
    min-width: 0;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 6px;
  }

  .card-title-section {
    display: flex;
    flex: 1;
    min-width: 0;
    //flex-direction: column;
  }

  .term-name {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin: 0 5px 4px 0;
    word-break: break-word;
    line-height: 1.3;
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .registration-date {
    font-size: 11px;
    color: #6b7280;
  }

  .card-actions {
    display: flex;
    gap: 3px;
    flex-shrink: 0;
  }

  .delete-button {
    width: 24px;
    height: 24px;
    border: none;
    background: none;
    color: #6b7280;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    svg {
      width: 12px;
      height: 12px;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:hover {
      background: #fef2f2;
      color: #dc2626;
    }
  }

  .term-description {
    font-size: 12px;
    color: #4b5563;
    line-height: 1.4;
    margin: 0;
    word-break: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .term-type-label {
    font-size: 10px;
    font-weight: 500;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.025em;

    &.general {
      background: #dbeafe;
      color: #1d4ed8;
    }

    &.composite {
      background: #d1fae5;
      color: #065f46;
    }

    &.standard {
      background: #fef3c7;
      color: #92400e;
    }

    &.non-standard {
      background: #fee2e2;
      color: #991b1b;
    }
  }

  .pagination-container {
    padding: 10px 16px;
    border-top: 1px solid #e5e7eb;
    flex-shrink: 0;
  }

  .pagination-info {
    text-align: center;
    font-size: 11px;
    color: #6b7280;
    margin-bottom: 8px;
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 3px;
  }

  .page-button {
    min-width: 28px;
    height: 28px;
    border: 1px solid #d1d5db;
    background: white;
    color: #374151;
    font-size: 12px;
    font-weight: 500;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 12px;
      height: 12px;
    }

    &:hover:not(:disabled) {
      background: #f9fafb;
      border-color: #9ca3af;
    }

    &.active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: #f9fafb;
    }

    &.prev,
    &.next {
      padding: 0 5px;
    }
  }

  .drag-image-container {
    position: absolute;
    top: -1000px;
    left: -1000px;
    pointer-events: none;
    z-index: -1;
  }

  .drag-image-card {
    width: 200px;
    height: 60px;
    background: white;
    border: 2px solid #3b82f6;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 12px;
  }

  .drag-image-content {
    text-align: center;
  }

  .drag-term-name {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 4px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 160px;
  }

  .drag-term-type {
    font-size: 10px;
    font-weight: 500;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.025em;

    &.general {
      background: #dbeafe;
      color: #1d4ed8;
    }

    &.composite {
      background: #d1fae5;
      color: #065f46;
    }

    &.standard {
      background: #fef3c7;
      color: #92400e;
    }

    &.non-standard {
      background: #fee2e2;
      color: #991b1b;
    }
  }

  // 🔥 툴팁 스타일
  .term-tooltip {
    position: fixed;
    width: 320px;
    max-height: 500px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
    z-index: 10000;
    pointer-events: none;
    overflow: hidden;
    animation: tooltipFadeIn 0.2s ease-out;
  }

  @keyframes tooltipFadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .tooltip-header {
    padding: 16px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .tooltip-title {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.4;
    flex: 1;
    word-break: break-word;
  }

  .tooltip-type-badge {
    font-size: 10px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 5px;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    flex-shrink: 0;

    &.general {
      background: #dbeafe;
      color: #1d4ed8;
    }

    &.composite {
      background: #d1fae5;
      color: #065f46;
    }

    &.standard {
      background: #fef3c7;
      color: #92400e;
    }

    &.non-standard {
      background: #fee2e2;
      color: #991b1b;
    }
  }

  .tooltip-body {
    padding: 16px;
    max-height: 420px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;

      &:hover {
        background: #94a3b8;
      }
    }
  }

  .tooltip-section {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .tooltip-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f1f5f9;

    &:last-child {
      border-bottom: none;
    }
  }

  .tooltip-label {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .tooltip-value {
    font-size: 13px;
    color: #1e293b;
    font-weight: 500;
    text-align: right;

    &.status {
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;

      &.active {
        background: #dcfce7;
        color: #166534;
      }

      &.inactive {
        background: #fee2e2;
        color: #991b1b;
      }
    }
  }

  .tooltip-description-label {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    margin-bottom: 8px;
  }

  .tooltip-description {
    font-size: 13px;
    color: #475569;
    line-height: 1.6;
    margin: 0;
    word-break: break-word;
  }

  .tooltip-synonyms {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .synonym-tag {
    display: inline-block;
    padding: 4px 10px;
    background: #f1f5f9;
    color: #475569;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    border: 1px solid #e2e8f0;
  }

  .tooltip-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .stat-icon {
    width: 24px;
    height: 24px;
    color: #3b82f6;
    flex-shrink: 0;
  }

  .stat-content {
    flex: 1;
    min-width: 0;
  }

  .stat-label {
    font-size: 11px;
    color: #64748b;
    font-weight: 500;
    margin-bottom: 2px;
  }

  .stat-value {
    font-size: 15px;
    font-weight: 700;
    color: #1e293b;
  }

  .tooltip-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    margin: 16px -16px -16px -16px;
  }

  .footer-icon {
    width: 16px;
    height: 16px;
    color: #64748b;
    flex-shrink: 0;
  }

  .footer-text {
    font-size: 11px;
    color: #64748b;
    font-weight: 500;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .cards-container {
    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 2px;

      &:hover {
        background: #94a3b8;
      }
    }
  }

  @media (max-width: 1024px) {
    .biz-meta-sidebar {
      width: 100%;
      max-width: none;
      height: 40vh;
      border-right: none;
      border-bottom: 1px solid #e5e7eb;
    }
  }

  @media (max-width: 768px) {
    .biz-meta-sidebar {
      height: 50vh;
    }

    .sidebar-header {
      padding: 10px 12px;
    }

    .cards-container {
      padding: 0 12px;
    }

    .pagination-container {
      padding: 8px 12px;
    }

    .card-actions {
      flex-direction: column;
      gap: 1px;
    }

    .delete-button {
      width: 20px;
      height: 20px;

      svg {
        width: 10px;
        height: 10px;
      }
    }
  }
</style>
