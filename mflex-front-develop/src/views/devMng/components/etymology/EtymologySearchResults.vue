<template>
  <div v-if="isVisible" class="search-results-container" @click.stop>
    <!-- 헤더 -->
    <div class="search-header">
      <div class="search-title">
        <h2>{{ termTitle }}</h2>
        <span class="search-type-badge" :class="searchType">
          {{ searchType === 'term' ? '용어' : '단어' }}
        </span>
      </div>
      <button class="close-btn" @click="closeResults">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 6L6 18M6 6L18 18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <!-- 검색 결과 콘텐츠 -->
    <div class="search-content">
      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="loading-message">
        <div class="loading-spinner"></div>
        <p>{{ searchType === 'term' ? '용어' : '단어' }}를 검색 중입니다...</p>
      </div>

      <!-- 검색 결과 없음 -->
      <div v-else-if="!hasResults" class="no-results-message">
        <div class="message-icon">⚠️</div>
        <h3>검색 결과가 없습니다</h3>
        <p>
          "{{ termTitle }}"에 대한
          {{ searchType === 'term' ? '용어' : '단어' }} 정보를 찾을 수 없습니다.
        </p>
      </div>

      <!-- 검색 결과 - 좌우 분할 레이아웃 -->
      <div v-else class="results-split-container">
        <!-- 왼쪽: 내 사전 + 공식 사전 -->
        <div class="left-panel">
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

            <div v-if="expandedSections.my" class="term-list-vertical">
              <div
                v-for="term in myTerms"
                :key="term.id"
                class="term-item my-term"
                @click="openTermDetail(term)"
              >
                <div class="term-content">
                  <div class="term-name">
                    {{
                      getUnifiedEnglishAbbr(term)
                        ? getUnifiedEnglishAbbr(term) +
                          '(' +
                          getUnifiedTermName(term) +
                          ')'
                        : getUnifiedTermName(term)
                    }}
                  </div>
                  <div class="dictionary-name">
                    {{ getUnifiedDictionaryName(term) }}
                  </div>
                  <div v-if="term.description" class="term-description">
                    {{ term.description }}
                  </div>
                </div>
                <div class="term-type-indicator">
                  {{ getUnifiedTermType(term) }}
                </div>
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

            <div v-if="expandedSections.official" class="term-list-vertical">
              <div
                v-for="term in officialTerms"
                :key="term.id"
                class="term-item official-term"
                @click="openTermDetail(term)"
              >
                <div class="term-content">
                  <div class="term-name">
                    {{
                      getUnifiedEnglishAbbr(term)
                        ? getUnifiedEnglishAbbr(term) +
                          '(' +
                          getUnifiedTermName(term) +
                          ')'
                        : getUnifiedTermName(term)
                    }}
                  </div>
                  <div class="dictionary-name">
                    {{ getUnifiedDictionaryName(term) }}
                  </div>
                  <div v-if="term.description" class="term-description">
                    {{ term.description }}
                  </div>
                </div>
                <div class="term-type-indicator">
                  {{ getUnifiedTermType(term) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 오른쪽: 타 사전 -->
        <div class="right-panel">
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

            <div v-if="expandedSections.other" class="term-list-vertical">
              <div
                v-for="term in otherTerms"
                :key="term.id"
                class="term-item other-term"
                @click="openTermDetail(term)"
              >
                <div class="term-content">
                  <div class="term-name">
                    {{
                      getUnifiedEnglishAbbr(term)
                        ? getUnifiedEnglishAbbr(term) +
                          '(' +
                          getUnifiedTermName(term) +
                          ')'
                        : getUnifiedTermName(term)
                    }}
                  </div>
                  <div class="dictionary-name">
                    {{ getUnifiedDictionaryName(term) }}
                  </div>
                  <div v-if="term.description" class="term-description">
                    {{ term.description }}
                  </div>
                </div>
                <div class="term-type-indicator">
                  {{ getUnifiedTermType(term) }}
                </div>
              </div>
            </div>
          </div>

          <!-- 타 사전이 없을 경우 표시 -->
          <div v-else class="empty-panel">
            <div class="empty-icon">📚</div>
            <p>타 사전 검색 결과가 없습니다</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  // 기존 스크립트 내용과 동일
  import { ref, reactive, computed, watch } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import {
    etymologySearch,
    etymologySearchWord,
  } from '@/utils/mflexApi/etymology/etymology';

  const props = defineProps({
    isVisible: {
      type: Boolean,
      default: false,
    },
    isSearch: {
      type: Boolean,
      default: false,
    },
    searchTerm: {
      type: String,
      default: '',
    },
    searchType: {
      type: String,
      default: 'term',
    },
    searchData: {
      type: Object,
      default: () => ({}),
    },
  });

  const emit = defineEmits(['close', 'term-selected']);

  const authStore = useAuthStore();
  const { userInfo, userStngInfo } = storeToRefs(authStore);
  const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
    userStngInfo.value;

  const expandedSections = reactive({
    my: true,
    official: true,
    other: true,
  });

  const apiTerms = ref([]);
  const isLoading = ref(false);

  // 기존 함수들 동일...
  const getUnifiedTermName = (term) => {
    return term.termName || term.wordName || term.name || '';
  };

  const getUnifiedEnglishAbbr = (term) => {
    return (
      term.englishAbbr ||
      term.termAbbreviationName ||
      term.wordAbbreviationName ||
      term.english ||
      ''
    );
  };

  const getUnifiedDictionaryName = (term) => {
    return (
      term.dictionaryName ||
      term.termDictionaryName ||
      term.wordDictionaryName ||
      ''
    );
  };

  const getUnifiedTermType = (term) => {
    if (term.termType) return term.termType;
    if (term.wordTypeCode === '10') return '일반어';
    if (term.termTypeCode === '10') return '일반어';
    if (term.wordTypeCode !== '10') return '분류어';
    if (term.termTypeCode !== '10') return '이음동의어';
    return term.dictionaryTypeName || '일반어';
  };

  const getDictionaryType = (inOutCode, dictionaryId) => {
    switch (inOutCode) {
      case '기관표준사전':
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

  const transformApiResponse = (apiData) => {
    return apiData.map((item, index) => {
      const itemId =
        item.id ||
        item.dictionaryId ||
        `${item.instituteId}_${item.dictionaryId}_${index}`;

      const termName = getUnifiedTermName(item);
      const englishAbbr = getUnifiedEnglishAbbr(item);
      const dictionaryName = getUnifiedDictionaryName(item);
      const termType = getUnifiedTermType(item);
      const description =
        item.description || item.termExplain || item.wordExplain || '';
      const domainName = item.domainName || '';
      const domainClassName = item.domainClassName || item.domainClass || '';

      return {
        id: itemId,
        termName: termName,
        englishAbbr: englishAbbr,
        dictionaryTypeName: item.dictionaryTypeName || '',
        termType: termType,
        dictionaryType: getDictionaryType(item.inOutCode, item.dictionaryId),
        dictionaryName: dictionaryName,
        domainPath:
          domainName && domainClassName
            ? `${domainName}/${domainClassName}`
            : '',
        description: description,
        establishedDate: item.revisionDate || item.establishedDate || '',
        instituteId: item.instituteId,
        dictionaryId: item.dictionaryId,
        inOutCode: item.inOutCode,
        domainClassName: domainClassName,
        domainName: domainName,
        termStandardYn: item.termStandardYn,
        discardYn: item.discardYn,
        updateDateTime: item.updateDateTime,
        synonymList: item.synonymList,
        dictionaryTypeBackgroundColor: item.dictionaryTypeBackgroundColorName,
        dictionaryTypeForegroundColor: item.dictionaryTypeForegroundColorName,
        ...item,
      };
    });
  };

  const myTerms = computed(() =>
    apiTerms.value.filter((term) => term.dictionaryType === 'my')
  );

  const officialTerms = computed(() =>
    apiTerms.value.filter((term) => term.dictionaryType === 'official')
  );

  const otherTerms = computed(() =>
    apiTerms.value.filter((term) => term.dictionaryType === 'other')
  );

  const hasResults = computed(
    () =>
      myTerms.value.length > 0 ||
      officialTerms.value.length > 0 ||
      otherTerms.value.length > 0
  );

  const searchTerms = async () => {
    if (!props.searchTerm.trim()) {
      apiTerms.value = [];
      return;
    }

    isLoading.value = true;
    try {
      const data = {
        koreanLable: props.searchTerm,
        instituteId: useMetaMngInstId,
        dictionaryId: useDctnryId,
      };

      const response = await etymologySearch(data);

      if (Array.isArray(response)) {
        apiTerms.value = transformApiResponse(response);
      } else {
        apiTerms.value = [];
      }

      props.isSearch = true;
    } catch (error) {
      console.error('검색 중 오류:', error);
      apiTerms.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const toggleSection = (section) => {
    expandedSections[section] = !expandedSections[section];
  };

  const openTermDetail = (term) => {
    console.log('선택된 용어:', term);
    term.searchType = 'term';
    emit('term-selected', term);
  };

  const closeResults = () => {
    emit('close');
  };

  const termTitle = ref('');

  watch(
    [
      () => props.searchType,
      () => props.isSearch,
      () => props.isVisible,
      () => props.searchData,
    ],
    ([newTerm, newType, newVisible]) => {
      if (newVisible && newTerm) {
        termTitle.value = props.searchTerm;
        searchTerms();
      }
    },
    { immediate: true }
  );
</script>

<style lang="scss" scoped>
  .search-results-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(
      135deg,
      rgba(30, 41, 59, 0.95),
      rgba(15, 23, 42, 0.95)
    );
    -webkit-backdrop-filter: blur(20px);
    backdrop-filter: blur(20px);
    border: 3px solid rgb(136 235 149 / 27%);
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    width: 1200px;
    max-width: 800px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 1500;
    pointer-events: auto;
  }

  .search-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 30px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(96, 184, 131, 0.08);
    flex-shrink: 0;

    .search-title {
      display: flex;
      align-items: center;
      gap: 16px;

      h2 {
        margin: 0;
        color: white;
        font-size: 20px;
        font-weight: 600;
      }

      .search-type-badge {
        font-size: 12px;
        padding: 4px 12px;
        border-radius: 16px;
        font-weight: 500;

        &.term {
          background: rgba(96, 184, 131, 0.2);
          border: 1px solid rgba(96, 184, 131, 0.3);
          color: #60b883;
        }

        &.word {
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #3b82f6;
        }
      }
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 4px;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(239, 68, 68, 0.2);
        border-color: rgba(239, 68, 68, 0.3);
        color: #ef4444;
      }
    }
  }

  .search-content {
    flex: 1;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.02);
    min-height: 0; /* flexbox에서 스크롤을 위해 필요 */
  }

  .loading-message,
  .no-results-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    padding: 60px 20px;
    color: rgba(255, 255, 255, 0.7);

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 255, 255, 0.2);
      border-top: 3px solid #60b883;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    .message-icon {
      font-size: 4rem;
      margin-bottom: 20px;
      color: #f59e0b;
    }

    h3 {
      color: white;
      margin-bottom: 12px;
      font-size: 20px;
    }

    p {
      font-size: 16px;
      margin: 0;
    }
  }

  /* 좌우 분할 레이아웃 */
  .results-split-container {
    display: flex;
    height: 100%;
    gap: 1px;
    min-height: 0; /* flexbox에서 스크롤을 위해 필요 */
  }

  .left-panel,
  .right-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden; /* 변경: auto → hidden */
    padding: 20px;
    background: rgba(255, 255, 255, 0.01);
    min-height: 0; /* flexbox에서 스크롤을 위해 필요 */
  }

  .left-panel {
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }

  .dictionary-section {
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    min-height: 0; /* flexbox에서 스크롤을 위해 필요 */

    &:last-child {
      margin-bottom: 0;
      flex: 1; /* 마지막 섹션이 남은 공간을 차지하도록 */
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-bottom: 16px;
      flex-shrink: 0; /* 헤더는 축소되지 않도록 */

      &:hover {
        background: rgba(255, 255, 255, 0.08);
      }

      .section-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: white;
        }

        .term-count {
          background: rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.8);
          font-size: 12px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 12px;
        }
      }

      .expand-icon {
        color: rgba(255, 255, 255, 0.6);
        transition: transform 0.2s ease;

        &.expanded {
          transform: rotate(180deg);
        }
      }
    }
  }

  /* 세로 방향 리스트 - 스크롤 가능하도록 수정 */
  .term-list-vertical {
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto; /* 스크롤 추가 */
    flex: 1; /* 남은 공간을 차지하도록 */
    min-height: 0; /* flexbox에서 스크롤을 위해 필요 */
    max-height: 400px; /* 최대 높이 제한으로 스크롤 강제 */
    padding-right: 11px; /* 스크롤바 공간 확보 */
    padding-left: 11px; /* 스크롤바 공간 확보 */

    /* 스크롤바 스타일링 */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }

  .term-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0; /* 항목들이 축소되지 않도록 */

    &:hover {
      background: rgba(255, 255, 255, 0.06);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    &.my-term {
      border-left: 2px solid #60b883;
      border-right: 2px solid #60b883;
    }

    &.official-term {
      border-left: 2px solid #f59e0b;
      border-right: 2px solid #f59e0b;
    }

    &.other-term {
      border-left: 2px solid #06b6d4;
      border-right: 2px solid #06b6d4;
    }

    .term-content {
      flex: 1;
      margin-right: 12px;

      .term-name {
        font-size: 15px;
        font-weight: 600;
        color: white;
        margin-bottom: 6px;
        line-height: 1.3;
        word-break: break-word;
      }

      .dictionary-name {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        margin-bottom: 6px;
      }

      .term-description {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.8);
        line-height: 1.4;
        word-break: keep-all;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .term-type-indicator {
      font-size: 10px;
      padding: 3px 6px;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.7);
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      flex-shrink: 0;
      align-self: flex-start;
      white-space: nowrap;
    }
  }

  .empty-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: rgba(255, 255, 255, 0.4);
    text-align: center;

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 16px;
      opacity: 0.6;
    }

    p {
      font-size: 14px;
      margin: 0;
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
    .search-results-container {
      width: 70vw;
    }

    .results-split-container {
      flex-direction: column;
    }

    .left-panel,
    .right-panel {
      flex: none;
      min-height: 100px;
    }

    .left-panel {
      border-right: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .term-list-vertical {
      max-height: 250px; /* 모바일에서는 높이 제한을 줄임 */
    }
  }

  @media (max-width: 768px) {
    .search-results-container {
      max-height: 90vh;
    }

    .search-header {
      padding: 20px;

      .search-title h2 {
        font-size: 18px;
      }
    }

    .left-panel,
    .right-panel {
      padding: 15px;
    }

    .term-item {
      padding: 12px;
    }

    .term-list-vertical {
      max-height: 200px; /* 작은 화면에서는 더 작게 */
    }
  }
</style>
