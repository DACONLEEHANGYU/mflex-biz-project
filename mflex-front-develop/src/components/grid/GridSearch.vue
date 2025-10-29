<template>
  <div class="grid-search">
    <!-- 표준화 작업용어 표시 -->
    <div v-if="gridDefs.scrnGridId == 'MFGRD200'" class="job-visible-div">
      <div>
        <span>작업용어 : </span>
      </div>
      <div class="job-visible-select">
        <select
          class="input-select"
          v-model="selectActualizingTermJobVisible"
          style="width: 100%"
        >
          <option value="visible">포함</option>
          <option value="noneVisible">미포함</option>
        </select>
      </div>

      <div class="divider-vertical"></div>
    </div>

    <!-- 작업용어 표시 -->
    <div v-if="gridDefs.scrnGridId == 'MFGRD040'" class="job-visible-div">
      <div>
        <span>작업용어 : </span>
      </div>
      <div class="job-visible-select">
        <select
          class="input-select"
          v-model="selectTermJobVisible"
          style="width: 100%"
        >
          <option value="visible">포함</option>
          <option value="noneVisible">미포함</option>
        </select>
      </div>

      <div class="divider-vertical"></div>
    </div>

    <!-- 단어표준화 작업단어 표시 -->
    <div v-if="gridDefs.scrnGridId == 'MFGRD220'" class="job-visible-div">
      <div>
        <span>작업단어 : </span>
      </div>
      <div class="job-visible-select">
        <select
          class="input-select"
          v-model="selectActualizingWordJobVisible"
          style="width: 100%"
        >
          <option value="visible">포함</option>
          <option value="noneVisible">미포함</option>
        </select>
      </div>

      <div class="divider-vertical"></div>
    </div>

    <!-- 단어등록 작업단어 표시 -->
    <div v-if="gridDefs.scrnGridId == 'MFGRD041'" class="job-visible-div">
      <div>
        <span>작업단어 : </span>
      </div>
      <div class="job-visible-select">
        <select
          class="input-select"
          v-model="selectWordJobVisible"
          style="width: 100%"
        >
          <option value="visible">포함</option>
          <option value="noneVisible">미포함</option>
        </select>
      </div>

      <div class="divider-vertical"></div>
    </div>

    <!-- 도메인등록 작업도메인 표시 -->
    <div v-if="gridDefs.scrnGridId == 'MFGRD042'" class="job-visible-div">
      <div>
        <span>작업도메인 : </span>
      </div>
      <div class="job-visible-select">
        <select
          class="input-select"
          v-model="selectDomainJobVisible"
          style="width: 100%"
        >
          <option value="visible">포함</option>
          <option value="nonVisible">미포함</option>
        </select>
      </div>

      <div class="divider-vertical"></div>
    </div>

    <!-- 용어조회 사전선택 표시 -->
    <div v-if="gridDefs.scrnGridId == 'MFGRD017'" class="job-visible-div">
      <!-- <div class="divider-vertical"></div> -->

      <div>
        <!-- <span>사전선택 : </span> -->
      </div>
      <div class="job-visible-select">
        <select
          class="input-select"
          v-model="selectTermDictionarySearchCode"
          style="width: 100%"
        >
          <option value="ALL">전체</option>
          <option value="INDIVIDUAL">내 사전</option>
          <option value="UPPER">상위사전</option>
          <option value="EXTERNAL">공식사전</option>
        </select>
      </div>

      <div class="divider-vertical"></div>
    </div>

    <!-- 단어조회 사전선택 표시 -->
    <div v-if="gridDefs.scrnGridId == 'MFGRD005'" class="job-visible-div">
      <!-- <div class="divider-vertical"></div> -->

      <div>
        <!-- <span>사전선택 : </span> -->
      </div>
      <div class="job-visible-select">
        <select
          class="input-select"
          v-model="selectWordDictionarySearchCode"
          style="width: 100%"
        >
          <option value="ALL">전체</option>
          <option value="INDIVIDUAL">내 사전</option>
          <option value="UPPER">상위사전</option>
          <option value="EXTERNAL">공식사전</option>
        </select>
      </div>

      <div class="divider-vertical"></div>
    </div>

    <!-- 도메인인조회 사전선택 표시 -->
    <div v-if="gridDefs.scrnGridId == 'MFGRD009'" class="job-visible-div">
      <!-- <div class="divider-vertical"></div> -->

      <div>
        <!-- <span>사전선택 : </span> -->
      </div>
      <div class="job-visible-select">
        <select
          class="input-select"
          v-model="selectDomainDictionarySearchCode"
          style="width: 100%"
        >
          <option value="ALL">전체</option>
          <option value="INDIVIDUAL">내 사전</option>
          <option value="UPPER">상위사전</option>
          <option value="EXTERNAL">공식사전</option>
        </select>
      </div>

      <div class="divider-vertical"></div>
    </div>

    <!-- 도메인표준화 작업도메인 표시 -->
    <div v-if="gridDefs.scrnGridId == 'MFGRD240'" class="job-visible-div">
      <div>
        <span>작업도메인 : </span>
      </div>
      <div class="job-visible-select">
        <select
          class="input-select"
          v-model="selectActualizingDomainJobVisible"
          style="width: 100%"
        >
          <option value="visible">포함</option>
          <option value="nonVisible">미포함</option>
        </select>
      </div>

      <div class="divider-vertical"></div>
    </div>

    <div class="search-result" v-if="resultCount.count">
      <!-- <i class="icon"></i> -->
      <span class="result-title">조회결과 :</span>
      <strong>{{ resultCount.count }}</strong
      >건<span class="result-line">/</span
      ><strong>{{ resultCount.total }}</strong
      >건
    </div>
    <div class="search-result" v-else>
      <i class="icon"></i><span class="result-title">조회결과 :</span>
      <strong>{{ resultCount.total }}</strong
      >건
    </div>

    <div class="search-inputs">
      <div class="inputtext__area">
        <template v-if="inputType">
          <AppInput
            class="target-search-area"
            v-model="searchText"
            style="width: 100%"
            @keyup.enter="onEnter"
          />
        </template>
        <template v-else>
          <textarea
            v-model="searchText"
            style="width: 100%; height: auto"
            rows="3"
          ></textarea>
        </template>
        <span class="btn-chInput target-position" @click="changeType"></span>
        <span
          v-if="searchText !== ''"
          class="btn-search"
          @click="onEnter"
          title="확인"
        ></span>
        <span
          v-if="searchText === ''"
          class="btn-reload"
          @click="onEnter"
          title="확인"
        ></span>
      </div>
    </div>
    <div class="search-btns">
      <button
        v-if="searchType === 'query'"
        class="btn-filter__chatbot"
        title="쿼리 생성기"
        @click="onOpenChatBot"
      ></button>
      <!-- <button
        class="btn-header__pinset"
        title="설정한 필터 저장"
        @click="onSave"
      ></button> -->
      <button
        class="btn-filter__save"
        title="그리드 설정 저장"
        @click="onSave"
      ></button>
      <!-- <button
        class="btn-filter__set"
        title="맞춤필터설정"
        @click="requestColumnState"
      ></button> -->
      <button
        class="btn-filter__set"
        title="그리드 컬럼 설정"
        @click="onOpenFilterWindow"
      ></button>
      <button
        class="btn-filter__remove"
        title="필터 및 정렬 삭제"
        @click="onRemove"
      ></button>
    </div>

    <!-- 단어등록 작업단어 표시 -->
    <div v-if="gridDefs.scrnGridId == 'MFGRD041'" class="job-visible-div">
      <div class="divider-vertical"></div>

      <div>
        <span>작업단어 : </span>
      </div>
      <div class="job-visible-select">
        <select
          class="input-select"
          v-model="selectWordJobVisible"
          style="width: 100%"
        >
          <option value="visible">포함</option>
          <option value="noneVisible">미포함</option>
        </select>
      </div>
    </div>

    <div class="divider-vertical"></div>
    <!-- <button class="btn-s" @click="onChangeSearchType">버튼</button> -->

    <!-- 토글 버튼 -->
    <ToggleBtn @change-search-type="onChangeSearchType" />

    <div class="divider-vertical"></div>

    <!-- 🔥 수정된 엑셀 다운로드 드롭다운 -->
    <div class="excel-btn" ref="excelBtnRef">
      <button
        class="btn-excel"
        title="엑셀다운로드"
        @click="toggleExcelDropdown"
      >
        내려받기
        <span class="dropdown-arrow" :class="{ active: isExcelDropdownOpen }"
          >▼</span
        >
      </button>

      <!-- 🔥 드롭다운 메뉴 -->
      <div
        class="excel-dropdown"
        :class="{ show: isExcelDropdownOpen }"
        v-show="isExcelDropdownOpen"
      >
        <button
          class="dropdown-item"
          @click="onExcelDownload('all')"
          title="전체 데이터를 엑셀로 다운로드"
        >
          <!-- <span class="dropdown-icon">📊</span> -->
          전체 건
        </button>
        <button
          class="dropdown-item"
          @click="onExcelDownload('filtered')"
          title="현재 조회된 데이터만 엑셀로 다운로드"
        >
          <!-- <span class="dropdown-icon">📋</span> -->
          조회 건
        </button>
      </div>
    </div>

    <!-- 맞춤 필터 설정 -->
    <AppWindow
      :view="filterWindowView"
      :moveState="true"
      @close="onCloseFilterWindow"
      width="1050px"
      height="auto"
    >
      <FilterSetWindow
        :columnFcDefs="colData"
        :filterGridDefs="paramGridDefs"
        @close="onCloseFilterWindow"
        @filter-set-window-confirm="onFilterConfirm"
      />
    </AppWindow>
  </div>
</template>

<script setup>
  import {
    ref,
    onMounted,
    defineProps,
    watch,
    onActivated,
    onUnmounted,
  } from 'vue';
  import {
    saveIncludeJobTerm,
    saveIncludeJobWord,
    saveIncludeJobDomain,
    saveIncludeJobTermActualizing,
    saveIncludeJobWordActualizing,
    saveIncludeJobDomainActualizing,
  } from '@/utils/cookies';
  import { useActualizingStore } from '@/stores/actualizing';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';
  import { useDictionarySearchStore } from '@/stores/dictionarySearch';

  import AppWindow from '@/components/ui/AppWindow.vue';
  import FilterSetWindow from '@/components/popWindow/filterSet/FilterSetWindow.vue';
  import ToggleBtn from '@/components/common/ToggleBtn.vue';
  import { storeToRefs } from 'pinia';
  const colData = ref([]);
  const paramGridDefs = ref({});

  const props = defineProps({
    modelValue: {
      type: String,
      default: '',
    },
    resultCount: {
      type: Object,
      default: () => {},
    },
    columnFcDefs: Array, // TopComp에서 전달된 columnState를 받기 위한 prop
    gridDefs: {
      type: Object,
      default: () => {},
    },
    dictionaryGridType: {
      type: String,
      default: '',
    },
    gridName: {
      type: String,
      default: '',
    },
  });

  const searchText = ref('');

  const emit = defineEmits([
    'enter',
    'save',
    'setup',
    'remove',
    'search-type',
    'open-filter-window',
    'filter-window-closed',
    'open-chatbot-window',
    'excel-download',
  ]);

  watch(
    () => props.modelValue,
    (newValue) => {
      searchText.value = newValue;
    }
  );

  // 🔥 엑셀 드롭다운 상태 관리
  const isExcelDropdownOpen = ref(false);
  const excelBtnRef = ref(null);

  // 🔥 엑셀 드롭다운 토글
  const toggleExcelDropdown = () => {
    isExcelDropdownOpen.value = !isExcelDropdownOpen.value;
  };

  // 🔥 엑셀 다운로드 실행
  const onExcelDownload = (type) => {
    console.log(`엑셀 다운로드 타입: ${type}`);

    // 드롭다운 닫기
    isExcelDropdownOpen.value = false;

    // 부모 컴포넌트로 이벤트 전달
    if (type === 'all') {
      emit('excel-download', 'all');
    } else if (type === 'filtered') {
      emit('excel-download', 'filtered');
    }
  };

  // 🔥 외부 클릭 시 드롭다운 닫기
  const handleClickOutside = (event) => {
    if (excelBtnRef.value && !excelBtnRef.value.contains(event.target)) {
      isExcelDropdownOpen.value = false;
    }
  };

  // 🔥 ESC 키로 드롭다운 닫기
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      isExcelDropdownOpen.value = false;
    }
  };

  // 사전조회 사전표시 범위 상태
  const {
    termDictionarySearchCode,
    wordDictionarySearchCode,
    domainDictionarySearchCode,
  } = storeToRefs(useDictionarySearchStore());
  // 사전조회 사전표시 범위 설정
  const {
    setTermDictionarySearchCode,
    setWordDictionarySearchCode,
    setDomainDictionarySearchCode,
  } = useDictionarySearchStore();

  // 작업항목 표시 여부 상태
  const { isTermJobVisible, isWordJobVisible, isDomainJobVisible } =
    storeToRefs(useDictionaryMngStore());

  // 작업항목 표시여부 설정
  const { setIsTermJobVisible, setIsWordJobVisible, setIsDomainJobVisible } =
    useDictionaryMngStore();

  // 표준화 작업항목 표시 여부 상태
  const {
    isActualizingTermJobVisible,
    isActualizingWordJobVisible,
    isActualizingDomainJobVisible,
  } = storeToRefs(useActualizingStore());

  // 표준화 작업항목 표시여부 설정
  const {
    setIsActualizingTermJobVisible,
    setIsActualizingWordJobVisible,
    setIsActualizingDomainJobVisible,
  } = useActualizingStore();

  // 작업용어 표시 여부 선택
  const selectTermJobVisible = ref(
    isTermJobVisible.value ? 'visible' : 'noneVisible'
  );
  // 작업단어 표시 여부 선택
  const selectWordJobVisible = ref(
    isWordJobVisible.value ? 'visible' : 'noneVisible'
  );
  // 작업도메인 표시 여부 선택
  const selectDomainJobVisible = ref(
    isDomainJobVisible.value ? 'visible' : 'nonVisible'
  );

  const selectActualizingTermJobVisible = ref(
    isActualizingTermJobVisible.value ? 'visible' : 'noneVisible'
  );
  const selectActualizingWordJobVisible = ref(
    isActualizingWordJobVisible.value ? 'visible' : 'noneVisible'
  );
  const selectActualizingDomainJobVisible = ref(
    isActualizingDomainJobVisible.value ? 'visible' : 'nonVisible'
  );

  // 사전조회 사전표시 범위 감지 및 설정
  const selectTermDictionarySearchCode = ref(termDictionarySearchCode.value);
  const selectWordDictionarySearchCode = ref(wordDictionarySearchCode.value);
  const selectDomainDictionarySearchCode = ref(
    domainDictionarySearchCode.value
  );

  watch(selectTermDictionarySearchCode, (newValue) => {
    console.log('selectTermDictionarySearchCode : ', newValue);
    setTermDictionarySearchCode(newValue);
  });

  watch(selectWordDictionarySearchCode, (newValue) => {
    console.log('selectWordDictionarySearchCode : ', newValue);
    setWordDictionarySearchCode(newValue);
  });

  watch(selectDomainDictionarySearchCode, (newValue) => {
    console.log('selectDomainDictionarySearchCode : ', newValue);
    setDomainDictionarySearchCode(newValue);
  });

  // 작업용어 표시여부 감지 및 설정
  watch(selectTermJobVisible, (newValue) => {
    const isTermJobVisible = newValue === 'visible' ? true : false;
    console.log('isTermJobVisible : ', isTermJobVisible);
    setIsTermJobVisible(isTermJobVisible);
    saveIncludeJobTerm(isTermJobVisible);
  });

  // 작업단어 표시여부 감지 및 설정
  watch(selectWordJobVisible, (newValue) => {
    const isWordJobVisible = newValue === 'visible' ? true : false;
    console.log('isWordJobVisible : ', isWordJobVisible);
    setIsWordJobVisible(isWordJobVisible);
    saveIncludeJobWord(isWordJobVisible);
  });

  // 작업도메인 표시여부 감지 및 설정
  watch(selectDomainJobVisible, (newValue) => {
    const isDomainJobVisible = newValue === 'visible' ? true : false;
    console.log('isDomainJobVisible : ', isDomainJobVisible);
    setIsDomainJobVisible(isDomainJobVisible);
    saveIncludeJobDomain(isDomainJobVisible);
  });

  // 표준화 작업용어 표시여부 감지 및 설정
  watch(selectActualizingTermJobVisible, (newValue) => {
    const isTermJobVisibleActualizing = newValue === 'visible' ? true : false;
    setIsActualizingTermJobVisible(isTermJobVisibleActualizing);
    saveIncludeJobTermActualizing(isTermJobVisibleActualizing);
  });

  // 표준화 작업단어 표시여부 감지 및 설정
  watch(selectActualizingWordJobVisible, (newValue) => {
    const isWordJobVisibleActualizing = newValue === 'visible' ? true : false;

    setIsActualizingWordJobVisible(isWordJobVisibleActualizing);
    saveIncludeJobWordActualizing(isWordJobVisibleActualizing);
  });

  // 표준화 작업도메인 표시여부 감지 및 설정
  watch(selectActualizingDomainJobVisible, (newValue) => {
    const isDomainJobVisibleActualizing = newValue === 'visible' ? true : false;

    setIsActualizingDomainJobVisible(isDomainJobVisibleActualizing);
    saveIncludeJobDomainActualizing(isDomainJobVisibleActualizing);
  });

  const isJobGrid = ref(props.isJobGrid);

  const searchType = ref('query');

  const onChangeSearchType = () => {
    searchType.value = searchType.value === 'query' ? 'natural-query' : 'query';

    emit('search-type', searchType.value);
  };

  const inputType = ref(true);
  const changeType = () => {
    inputType.value = !inputType.value;
  };

  const onEnter = () => {
    emit('enter', searchText.value);
  };
  const onSave = () => {
    emit('save');
  };
  const onRemove = () => {
    emit('remove');
  };

  const filterWindowView = ref(false);

  const onOpenFilterWindow = () => {
    console.log('props.gridDefs : ', props.gridDefs);
    paramGridDefs.value = props.gridDefs;
    colData.value = props.columnFcDefs;
    console.log('paramGridDefs1: ', paramGridDefs);
    console.log('colData: ', colData);
    filterWindowView.value = true;
  };

  const onCloseFilterWindow = () => {
    filterWindowView.value = false;
    emit('filter-window-closed');
  };
  const onFilterConfirm = (filterSet) => {
    filterWindowView.value = false;
    emit('filter-window-closed', filterSet);
  };

  const onOpenChatBot = () => {
    console.log('onOpenChatBot');
    emit('open-chatbot-window');
  };

  onActivated(() => {
    console.log('onActivated');
    emit('search-type', searchType.value);
  });
  onMounted(() => {
    console.log('onMounted');
    emit('search-type', searchType.value);

    // 🔥 이벤트 리스너 추가
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
  });

  // 🔥 컴포넌트 언마운트 시 이벤트 리스너 제거
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', handleKeyDown);
  });
</script>

<style lang="scss" scoped>
  .divider-vertical {
    width: 2px;
    height: 24px;
    background-color: #bebebe;
    margin: 3px 14px 0px 10px;
  }

  .job-visible-div {
    display: flex;
    align-items: center;
  }
  .job-visible-select {
    width: 100px;
    margin-left: 5px;
  }

  /* 🔥 엑셀 다운로드 드롭다운 스타일 */
  .excel-btn {
    position: relative;
    display: inline-block;
  }

  .btn-excel {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    background: #379583;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      background: #2c7a6b;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(55, 149, 131, 0.3);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .dropdown-arrow {
    font-size: 10px;
    transition: transform 0.3s ease;

    &.active {
      transform: rotate(180deg);
    }
  }

  .excel-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    overflow: hidden;

    &.show {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .dropdown-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: white;
    color: #333;
    border: none;
    text-align: left;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s ease;

    &:hover {
      background: #f8f9fa;
      color: #379583;
    }

    &:not(:last-child) {
      border-bottom: 1px solid #eee;
    }
  }

  .dropdown-icon {
    font-size: 16px;
    width: 20px;
    text-align: center;
  }
</style>
