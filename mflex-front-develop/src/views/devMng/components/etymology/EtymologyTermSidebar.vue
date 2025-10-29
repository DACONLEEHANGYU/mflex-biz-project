<!-- EtymologyTermSidebar.vue -->
<template>
  <div class="term-sidebar" :class="{ 'sidebar-open': isOpen }">
    <!-- 토글 버튼 -->
    <div class="sidebar-toggle" @click="toggleSidebar">
      <span class="toggle-icon" :class="{ rotated: isOpen }">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </div>

    <!-- 사이드바 헤더 -->
    <div class="sidebar-header" v-if="isOpen">
      <h3 class="sidebar-title">
        {{ selectedNodeLabel ? `${selectedNodeLabel}` : '사전' }}
      </h3>
    </div>

    <!-- 사이드바 콘텐츠 -->
    <div class="sidebar-content" v-if="isOpen">
      <!-- 선택된 노드가 없는 경우 -->
      <div v-if="!hasSelectedNode" class="no-selection-message">
        <div class="message-icon">🔍</div>
        <p>노드를 클릭하여 관련 사전 정보를 확인하세요</p>
      </div>

      <!-- 로딩 상태 -->
      <div v-else-if="isLoadingTerms" class="loading-message">
        <div class="loading-spinner"></div>
        <p>
          {{
            selectedNode.nodeType === 'search'
              ? '사전을 조회 중입니다...'
              : '어원 정보를 검색 중입니다...'
          }}
        </p>
      </div>

      <!-- 선택된 노드가 있는 경우 사전 정보 표시 -->
      <div v-else>
        <div
          v-if="
            selectedNode.nodeType === 'search-term' ||
            selectedNode.nodeType === 'search-word'
          "
        ></div>
        <!-- <div
          v-if="selectedNode.nodeType === 'search'"
          style="color: white; height: 40px; font-size: 20px; font-weight: 700"
        >
          📗사전조회
        </div> -->
        <div v-else class="popup-body">
          <!-- 기본 정보 섹션 -->
          <div class="basic-info-section">
            <div v-if="selectedNode.definition" class="popup-item">
              <strong>정의:</strong> {{ selectedNode.definition }}
            </div>
            <div v-if="selectedNode.meaning" class="popup-item">
              <strong>의미:</strong> {{ selectedNode.meaning }}
            </div>
            <div v-if="selectedNode.domainClass" class="popup-item">
              <strong>도메인:</strong> {{ selectedNode.domainGroup }} /
              {{ selectedNode.domainClass }}
            </div>
          </div>
        </div>

        <!-- 내 사전 섹션 -->
        <div v-if="myTerms.length > 0" class="dictionary-section">
          <div class="section-header" @click="toggleSection('my')">
            <div class="section-info">
              <span class="section-title">내 사전</span>
              <span class="term-count">{{ myTerms.length }}</span>
            </div>
            <span
              class="expand-icon"
              :class="{ expanded: expandedSections.my }"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </div>

          <div v-if="expandedSections.my" class="term-list">
            <div
              v-for="term in myTerms"
              :key="term.id"
              class="term-item my-term"
              @click="openTermDetail(term)"
            >
              <div class="term-content">
                <div class="term-name">
                  {{
                    term.englishAbbr
                      ? term.englishAbbr + '(' + term.termName + ')'
                      : term.termName
                  }}
                </div>
                <div class="dictionary-name">{{ term.dictionaryName }}</div>
              </div>
              <div class="term-type-indicator">{{ term.termType }}</div>
            </div>
          </div>
        </div>

        <!-- 공식 사전 섹션 -->
        <div v-if="officialTerms.length > 0" class="dictionary-section">
          <div class="section-header" @click="toggleSection('official')">
            <div class="section-info">
              <span class="section-title">공식 사전</span>
              <span class="term-count">{{ officialTerms.length }}</span>
            </div>
            <span
              class="expand-icon"
              :class="{ expanded: expandedSections.official }"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </div>

          <div v-if="expandedSections.official" class="term-list">
            <div
              v-for="term in officialTerms"
              :key="term.id"
              class="term-item official-term"
              @click="openTermDetail(term)"
            >
              <div class="term-content">
                <div class="term-name">
                  {{
                    term.englishAbbr
                      ? term.englishAbbr + '(' + term.termName + ')'
                      : term.termName
                  }}
                </div>
                <div class="dictionary-name">{{ term.dictionaryName }}</div>
              </div>
              <div class="term-type-indicator">{{ term.termType }}</div>
            </div>
          </div>
        </div>

        <!-- 타 사전 섹션 -->
        <div v-if="otherTerms.length > 0" class="dictionary-section">
          <div class="section-header" @click="toggleSection('other')">
            <div class="section-info">
              <span class="section-title">타 사전</span>
              <span class="term-count">{{ otherTerms.length }}</span>
            </div>
            <span
              class="expand-icon"
              :class="{ expanded: expandedSections.other }"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </div>

          <div v-if="expandedSections.other" class="term-list">
            <div
              v-for="term in otherTerms"
              :key="term.id"
              class="term-item other-term"
              @click="openTermDetail(term)"
            >
              <div class="term-content">
                <div class="term-name">
                  {{
                    term.englishAbbr
                      ? term.englishAbbr + '(' + term.termName + ')'
                      : term.termName
                  }}
                </div>
                <div class="dictionary-name">{{ term.dictionaryName }}</div>
              </div>
              <div class="term-type-indicator">{{ term.termType }}</div>
            </div>
          </div>
        </div>

        <!-- 사전에 없는 경우 -->
        <div
          v-if="!hasAnyTerms && !isLoadingTerms"
          class="no-dictionary-message"
        >
          <div class="message-icon">⚠️</div>
          <p>"{{ selectedNodeLabel }}"에 대한 사전 정보가 없습니다</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { storeToRefs } from 'pinia';
  import { ref, reactive, computed, watch } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import {
    etymologySearch,
    etymologySearchWord,
  } from '@/utils/mflexApi/etymology/etymology';

  const props = defineProps({
    selectedNode: {
      type: Object,
      default: null,
    },
    isOpen: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['term-selected', 'toggle-sidebar']);

  const expandedSections = reactive({
    my: true,
    official: true,
    other: true,
  });

  const authStore = useAuthStore();
  const { userInfo, userStngInfo } = storeToRefs(authStore);
  const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
    userStngInfo.value;

  // 선택된 노드 관련 computed
  const hasSelectedNode = computed(() => !!props.selectedNode);
  const selectedNodeLabel = computed(() => props.selectedNode?.label || '');

  // API 응답 데이터를 저장할 ref
  const apiTerms = ref([]);
  const isLoadingTerms = ref(false);

  // inOutCode에 따른 사전 타입 분류 (수정된 로직)
  const getDictionaryType = (inOutCode, dictionaryId) => {
    switch (inOutCode) {
      case '기관표준사전':
        // dictionaryId가 사용자의 dictionaryId와 같으면 내사전, 다르면 타사전
        return dictionaryId === useDctnryId ? 'my' : 'other';
      case '내사전':
      case '개인사전':
        return 'my';
      case '공식사전':
      case '표준사전':
        return 'official';
      default:
        return 'other';
    }
  };

  // API 응답을 내부 형식으로 변환하는 함수
  const transformApiResponse = (apiData) => {
    console.log('transformApiResponse : ', apiData);

    if (apiData[0].wordName) {
      return apiData.map((item, index) => ({
        id: `${item.instituteId}_${item.dictionaryId}_${index}`,
        termName: item.wordName,
        englishAbbr: item.wordAbbreviationName,
        dictionaryTypeName: item.dictionaryTypeName,
        termType: item.wordTypeCode === `10` ? '일반어' : '분류어',
        dictionaryType: getDictionaryType(item.inOutCode, item.dictionaryId), // dictionaryId 추가 전달
        dictionaryName: item.wordDictionaryName,
        domainPath: `${item.domainName}/${item.domainClassName}`,
        description: item.wordExplain,
        establishedDate: item.revisionDate,
        // 추가 정보
        instituteId: item.instituteId,
        dictionaryId: item.dictionaryId,
        inOutCode: item.inOutCode,
        domainClassName: item.domainClassName,
        domainName: item.domainName,
        termStandardYn: item.termStandardYn,
        discardYn: item.discardYn,
        updateDateTime: item.updateDateTime,
        synonymList: item.synonymList,
        dictionaryTypeBackgroundColor: item.dictionaryTypeBackgroundColorName,
        dictionaryTypeForegroundColor: item.dictionaryTypeForegroundColorName,
        searchType: 'word', // 단어 조회 타입 추가
      }));
    } else {
      return apiData.map((item, index) => ({
        id: `${item.instituteId}_${item.dictionaryId}_${index}`,
        termName: item.termName,
        englishAbbr: item.termAbbreviationName,
        dictionaryTypeName: item.dictionaryTypeName,
        // termType: item.dictionaryTypeName || '일반어',
        termType: item.termTypeCode === `10` ? '일반어' : '이음동의어',
        dictionaryType: getDictionaryType(item.inOutCode, item.dictionaryId), // dictionaryId 추가 전달
        dictionaryName: item.termDictionaryName,
        domainPath: `${item.domainName}/${item.domainClassName}`,
        description: item.termExplain,
        establishedDate: item.revisionDate,
        // 추가 정보
        instituteId: item.instituteId,
        dictionaryId: item.dictionaryId,
        inOutCode: item.inOutCode,
        domainClassName: item.domainClassName,
        domainName: item.domainName,
        termStandardYn: item.termStandardYn,
        discardYn: item.discardYn,
        updateDateTime: item.updateDateTime,
        synonymList: item.synonymList,
        dictionaryTypeBackgroundColor: item.dictionaryTypeBackgroundColorName,
        dictionaryTypeForegroundColor: item.dictionaryTypeForegroundColorName,
        searchType: 'term', // 단어 조회 타입 추가
      }));
    }
  };

  // 현재 선택된 노드에 대한 용어들 (API 데이터 기반)
  const currentTerms = computed(() => {
    return apiTerms.value;
  });

  // 사전 타입별로 용어 분류
  const myTerms = computed(() =>
    currentTerms.value.filter((term) => term.dictionaryType === 'my')
  );

  const officialTerms = computed(() =>
    currentTerms.value.filter((term) => term.dictionaryType === 'official')
  );

  const otherTerms = computed(() =>
    currentTerms.value.filter((term) => term.dictionaryType === 'other')
  );

  const hasAnyTerms = computed(
    () =>
      myTerms.value.length > 0 ||
      officialTerms.value.length > 0 ||
      otherTerms.value.length > 0
  );

  // 용어 검색 함수
  const searchTerms = async (nodeLabel) => {
    console.log('searchTerms 호출:', nodeLabel);
    console.log('선택된 노드:', props.selectedNode);

    if (!nodeLabel) {
      apiTerms.value = [];
      return;
    }

    console.log('nodeLabel:', nodeLabel);
    console.log('props.selecteNode:', props.selectedNode);

    isLoadingTerms.value = true;
    try {
      const data = {
        koreanLable: nodeLabel,
        description:
          props.selectedNode?.description || props.selectedNode?.meaning,
        instituteId: useMetaMngInstId,
        dictionaryId: useDctnryId,
      };

      console.log('검색 요청 데이터:', data);
      console.log('사용자 dictionaryId:', useDctnryId);

      let response;

      if (
        props.selectedNode.nodeType === 'root' ||
        props.selectedNode.nodeType === 'search-term'
      ) {
        // root -> 용어 조회
        response = await etymologySearch(data);
      } else if (props.selectedNode.nodeType === 'combination') {
        // combination -> 용어 조회 선행 후 데이터 없는 경우 단어조회
        response = await etymologySearch(data);
        if (response.length === 0) {
          response = await etymologySearchWord(data);
        }
      } else if (props.selectedNode.nodeType === 'search-word') {
        response = await etymologySearchWord(data);
      } else {
        // parts -> 용어 조회 선행 후 데이터 없는 경우 단어조회
        response = await etymologySearchWord(data);
      }

      console.log('etymologySearch 응답:', response);

      if (Array.isArray(response)) {
        apiTerms.value = transformApiResponse(response);
        console.log('변환된 데이터:', apiTerms.value);

        // 분류 결과 로그
        console.log('내사전:', myTerms.value.length);
        console.log('공식사전:', officialTerms.value.length);
        console.log('타사전:', otherTerms.value.length);
      } else {
        console.warn('예상하지 못한 응답 형식:', response);
        apiTerms.value = [];
      }
    } catch (error) {
      console.error('용어 검색 중 오류:', error);
      apiTerms.value = [];
    } finally {
      isLoadingTerms.value = false;
    }
  };

  const toggleSidebar = () => {
    emit('toggle-sidebar');
  };

  const toggleSection = (section) => {
    expandedSections[section] = !expandedSections[section];
  };

  const openTermDetail = (term) => {
    emit('term-selected', term);
  };

  // 선택된 노드가 변경될 때마다 용어 검색
  watch(
    () => props.selectedNode,
    async (newNode) => {
      if (newNode) {
        console.log('Selected Node:', newNode);
        await searchTerms(newNode.label);
      } else {
        apiTerms.value = [];
      }
    },
    { immediate: true }
  );
</script>

<style lang="scss" scoped>
  .term-sidebar {
    position: absolute; /* fixed에서 absolute로 변경 */
    top: 0; /* Vue Flow 컨테이너 기준 상단 */
    right: 0; /* Vue Flow 컨테이너 기준 우측 */
    bottom: 0; /* Vue Flow 컨테이너 기준 하단 */
    width: 400px;
    background: linear-gradient(135deg, rgb(9 3 0 / 95%), rgb(20 5 4 / 95%));
    backdrop-filter: blur(20px);
    border-left: 1px solid rgba(255, 255, 255, 0.15);
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    display: flex;
    flex-direction: column;
    box-shadow: -5px 0 20px rgba(0, 0, 0, 0.3);
    pointer-events: auto; /* 중요: 사이드바 클릭 가능하도록 */

    &.sidebar-open {
      transform: translateX(0);
    }
  }

  .sidebar-toggle {
    position: absolute;
    left: -42px;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 80px;
    background: linear-gradient(120deg, rgb(42 35 32 / 97%), rgb(19 13 2));
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-right: none;
    border-radius: 10px 0 0 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: -3px 0 10px rgba(0, 0, 0, 0.2);
    z-index: 1001; /* 토글 버튼이 다른 요소보다 위에 있도록 */

    &:hover {
      background: linear-gradient(
        135deg,
        rgba(96, 184, 131, 0.2),
        rgba(30, 41, 59, 0.95)
      );
      border-color: rgba(96, 184, 131, 0.3);
    }

    .toggle-icon {
      color: rgba(255, 255, 255, 0.7);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;

      &.rotated {
        transform: rotate(180deg);
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }

    &:hover .toggle-icon {
      color: white;
    }
  }

  .sidebar-header {
    padding: 24px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(80, 68, 49, 0.1);
    flex-shrink: 0;

    .sidebar-title {
      margin: 0;
      color: white;
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      line-height: 1.4;

      .title-icon {
        margin-right: 8px;
        font-size: 18px;
        flex-shrink: 0;
      }
    }
  }

  .sidebar-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* 메시지 스타일 */
  .no-selection-message,
  .no-dictionary-message {
    text-align: center;
    padding: 40px 20px;
    color: rgba(255, 255, 255, 0.7);

    .message-icon {
      font-size: 3rem;
      margin-bottom: 16px;
    }

    p {
      font-size: 14px;
      line-height: 1.5;
      margin: 0;
      word-break: keep-all;
    }
  }

  .no-dictionary-message {
    .message-icon {
      color: #f59e0b;
    }

    p {
      color: rgba(245, 158, 11, 0.8);
    }
  }

  .dictionary-section {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 12px;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .section-info {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      overflow: hidden;

      .section-icon {
        font-size: 16px;
        flex-shrink: 0;
      }

      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: white;
        white-space: nowrap;
      }

      .term-count {
        background: rgba(255, 255, 255, 0.15);
        color: rgba(255, 255, 255, 0.8);
        font-size: 11px;
        font-weight: 500;
        padding: 2px 6px;
        border-radius: 10px;
        flex-shrink: 0;
      }
    }

    .expand-icon {
      color: rgba(255, 255, 255, 0.6);
      transition: transform 0.2s ease;
      flex-shrink: 0;

      &.expanded {
        transform: rotate(180deg);
      }
    }
  }

  .term-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-left: 20px;
  }

  .term-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.06);
      transform: translateY(-1px);
    }

    &.my-term {
      border-left: 3px solid #60b883;
    }

    &.official-term {
      border-left: 3px solid #f59e0b;
    }

    &.other-term {
      border-left: 3px solid #06b6d4;
    }

    .term-content {
      flex: 1;
      overflow: hidden;
      margin-right: 8px;

      .term-name {
        font-size: 14px;
        font-weight: 600;
        color: white;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .dictionary-name {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.6);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .term-type-indicator {
      font-size: 10px;
      padding: 2px 6px;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.7);
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      flex-shrink: 0;
    }
  }

  /* 스크롤바 */
  .sidebar-content::-webkit-scrollbar {
    width: 6px;
  }

  .sidebar-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  .sidebar-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }

  .popup-body {
    // padding: 24px;
    color: rgba(255, 255, 255, 0.9);
    overflow-y: auto; /* 세로 스크롤 활성화 */
    overflow-x: hidden; /* 가로 스크롤 숨김 */
    flex: 1; /* 남은 공간을 모두 차지 */

    /* 스크롤 영역의 최소/최대 높이 설정 */
    min-height: 90px;
    max-height: calc(100vh - 200px); /* 헤더와 여백을 제외한 최대 높이 */

    .popup-item {
      margin-bottom: 16px;
      font-size: 14px;
      line-height: 1.5;
      word-break: keep-all;

      strong {
        color: #60b883;
        margin-right: 8px;
        font-weight: 600;
        display: inline-block;
        min-width: 60px;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .popup-body {
    // padding: 20px;
    max-height: calc(100vh - 160px);

    .popup-item {
      font-size: 13px;

      strong {
        min-width: 50px;
      }
    }
  }

  /* 로딩 메시지 스타일 */
  .loading-message {
    text-align: center;
    padding: 40px 20px;
    color: rgba(255, 255, 255, 0.7);

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 255, 255, 0.2);
      border-top: 3px solid #60b883;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    p {
      font-size: 14px;
      line-height: 1.5;
      margin: 0;
      word-break: keep-all;
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* 반응형 */
  @media (max-width: 1024px) {
    .term-sidebar {
      width: 350px;
    }
  }

  @media (max-width: 768px) {
    .term-sidebar {
      width: 300px;
    }
  }

  @media (max-width: 480px) {
    .term-sidebar {
      width: 100vw;

      .sidebar-toggle {
        left: -45px;
        width: 35px;
        height: 70px;
      }
    }
  }
</style>
