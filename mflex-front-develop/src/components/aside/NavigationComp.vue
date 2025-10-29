<template>
  <div class="navigation">
    <ul class="depth1">
      <li v-for="(navi, index) in naviData" :key="navi.title" class="lv1">
        <span
          class="btn-route"
          :class="{
            'active-parent': hasActiveChild(navi.lv2),
            'active-direct': isDirectlyActive(navi),
          }"
          @click="onLv1Click(index)"
        >
          <!-- 대메뉴에 녹색바 적용 -->
          <div
            class="green-bar"
            v-if="hasActiveChild(navi.lv2) || isDirectlyActive(navi)"
          ></div>
          <div class="title">
            <i class="icon" :class="navi.icon"></i>
            <span class="title-text">{{ navi.title }}</span>
          </div>
          <i class="icon-arrow" v-if="navi.lv2.length > 0"></i>
        </span>
        <div class="lv2" :style="{ height: `${navi.lv2Height}px` }">
          <div class="lv1-title">
            {{ navi.title }}
          </div>
          <ul v-if="navi.lv2.length > 0">
            <li v-for="lv2 in navi.lv2" :key="lv2.title">
              <router-link
                :to="`${lv2.link}`"
                :class="[
                  'btn-route',
                  { 'active-menu': isActiveMenu(lv2.link) },
                ]"
                @click="onlv2Click({ title: lv2.title, link: lv2.link })"
                replace
              >
                <!-- 하위메뉴에서는 녹색바 제거 -->
                <div class="title">{{ lv2.title }}</div>
              </router-link>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
  import { onMounted, reactive } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useTabNaviStore } from '@/stores/tabNavi';
  import { useDictionarySaerchTabStore } from '@/stores/dictionarySearchTab';
  import {
    saveStepStateStorage,
    saveActualizingStepStateStorage,
  } from '@/utils/cookies';

  const tabNaviStore = useTabNaviStore();
  const { setTabNaviData, setDictionaryMngState, setActualizingState } =
    tabNaviStore;

  const dictionarySearchTabStore = useDictionarySaerchTabStore();
  const { setSearchTabState } = dictionarySearchTabStore;

  const route = useRoute();
  const router = useRouter();

  const props = defineProps({
    navis: {
      type: Array,
      default: () => [],
    },
  });

  const naviData = reactive(props.navis);

  // 현재 활성 메뉴인지 확인하는 함수
  const isActiveMenu = (link) => {
    return route.path === link || route.path.startsWith(link);
  };

  // 하위 메뉴 중에 활성화된 메뉴가 있는지 확인하는 함수
  const hasActiveChild = (lv2Items) => {
    return lv2Items.some((item) => isActiveMenu(item.link));
  };

  // 대메뉴가 직접 활성화되었는지 확인하는 함수 (하위 메뉴가 없거나 redirect 경로와 일치)
  const isDirectlyActive = (navi) => {
    // 하위 메뉴가 없는 경우 redirect 경로로 직접 비교
    if (navi.lv2.length === 0 && navi.redirect) {
      return isActiveMenu(navi.redirect);
    }
    // 하위 메뉴가 있지만 현재 경로가 대메뉴의 기본 경로와 일치하는 경우
    if (navi.redirect && route.path === navi.redirect) {
      return true;
    }
    return false;
  };

  console.log('naviData : ', { naviData });

  const onLv1Click = (index) => {
    console.log('메뉴이동 ---');
    console.log('naviData[index] : ', naviData[index]);

    // 하위 메뉴가 있는 경우, 메뉴만 펼치거나 접기
    if (naviData[index].lv2.length > 0) {
      // 단순히 하위 메뉴 펼치기/접기 토글
      naviData[index].active = !naviData[index].active;

      if (naviData[index].active) {
        const lv2H = 32; // 하위 메뉴 항목 높이
        const tbSpace = 10; // 추가 여백
        naviData[index].lv2Height = naviData[index].lv2.length * lv2H + tbSpace;
      } else {
        naviData[index].lv2Height = 0;
      }
    }

    // 하위 메뉴가 없는 경우, 해당 페이지로 직접 이동
    else {
      const link = naviData[index].redirect;
      setTabNaviData({ title: naviData[index].title, path: link });
      router.replace(link);
    }
  };

  const onlv2Click = ({ title, link }) => {
    console.log('lv2Title : ', title);
    console.log('lv2link : ', link);

    let searchType = 1; // 기본값 설정

    // title에 따라 searchType 값 결정
    switch (title) {
      case '용어조회':
        // store 저장
        setSearchTabState('term');
        break;
      case '단어조회':
        setSearchTabState('word');
        break;
      case '도메인조회':
        // searchType = 3;
        setSearchTabState('domain');
        break;
      case '코드조회':
        setSearchTabState('code');
        // searchType = 4;
        break;
      default:
        // searchType = 1; // 기본값
        setSearchTabState('term');
    }

    // 사전등록 탭 내비게이션 데이터 설정
    switch (title) {
      case '용어등록':
        // store 저장
        setDictionaryMngState('term');
        saveStepStateStorage('term');
        break;
      case '단어등록':
        setDictionaryMngState('word');
        saveStepStateStorage('word');
        break;
      case '도메인등록':
        // searchType = 3;
        setDictionaryMngState('domain');
        saveStepStateStorage('domain');
        break;
      case '코드등록':
        setDictionaryMngState('code');
        saveStepStateStorage('code');
        // searchType = 4;
        break;
      default:
        // searchType = 1; // 기본값
        setDictionaryMngState('term');
        saveStepStateStorage('term');
    }

    switch (title) {
      case '테이블정제':
        setActualizingState('table');
        saveActualizingStepStateStorage('table');
        break;
      case '컬럼정제':
        setActualizingState('column');
        saveActualizingStepStateStorage('column');
        break;
      case '용어사전표준화':
        setActualizingState('term');
        saveActualizingStepStateStorage('term');
        break;
      case '단어사전표준화':
        setActualizingState('word');
        saveActualizingStepStateStorage('word');
        break;
      case '도메인사전표준화':
        setActualizingState('domain');
        saveActualizingStepStateStorage('domain');
    }

    // 탭 내비게이션 데이터 설정 (예시)
    setTabNaviData({ title: title, path: link });
  };

  onMounted(() => {
    console.log('[route.matched] ', route, route.path, route.fullPath);
    console.log('tabNaviStore ', tabNaviStore);
  });
</script>

<style lang="scss" scoped>
  .lv1 {
    transition: height 1s ease;
  }

  .special-active-mng {
    height: 350px;
    background-color: #3b4742;
  }
  .special-active-actual {
    height: 430px;
    background-color: #3b4742;
  }

  /* 사전등록가 active 상태일 때 hover 효과 제거 */
  .btn-route.no-hover:hover {
    // cursor: default;
    background-color: transparent;
  }

  .lv2.no-hover-lv2 {
    display: none !important;
  }

  /* 기존 hover 효과 유지를 위한 스타일 */
  .btn-route:not(.no-hover):hover {
    cursor: pointer;
    background-color: rgba(255, 255, 255, 0.1);
  }

  /* 활성화된 하위 메뉴가 있는 대메뉴 스타일 */
  .btn-route.active-parent {
    position: relative;
    background-color: rgba(55, 149, 131, 0.1); /* 아주 연한 녹색 배경 */
    color: #52e692; /* 녹색 텍스트 */
  }

  .btn-route.active-parent .title-text {
    color: #52e692; /* 대메뉴 텍스트도 녹색 */
    font-weight: 500; /* 약간 굵게 */
  }

  /* 직접 활성화된 대메뉴 스타일 */
  .btn-route.active-direct {
    position: relative;
    background-color: rgba(55, 149, 131, 0.15); /* 약간 더 진한 녹색 배경 */
    color: #52e692; /* 녹색 텍스트 */
  }

  .btn-route.active-direct .title-text {
    color: #52e692; /* 대메뉴 텍스트도 녹색 */
    font-weight: 600; /* 더 굵게 */
  }

  /* 활성화된 하위 메뉴 스타일 (녹색바 제거, 색상만) */
  .btn-route.active-menu {
    background-color: rgba(55, 149, 131, 0.2); /* 연한 녹색 배경 */
    color: #52e692; /* 녹색 텍스트 */
    font-weight: bold;
  }

  /* 녹색바 스타일 - 완전히 오버레이로 처리 */
  .green-bar {
    position: absolute;
    left: -1px; /* 버튼 바깥쪽으로 완전히 이동 */
    top: 0;
    width: 4px;
    height: 100%;
    background-color: #52e692; /* 녹색 */
    // border-radius: 0 2px 2px 0;
    z-index: 999; /* 높은 z-index로 오버레이 */
    pointer-events: none; /* 클릭 이벤트 무시 */
  }

  /* 활성화된 대메뉴 - 패딩 제거하여 밀림 현상 방지 */
  .btn-route.active-parent .title,
  .btn-route.active-direct .title {
    /* 패딩 제거 - 기본 레이아웃 유지 */
  }

  /* 네비게이션 전체 컨테이너에 오버플로우 허용 */
  .navigation {
    position: relative;
    overflow: visible;
  }

  /* 대메뉴 버튼에 오버플로우 허용 */
  .btn-route {
    position: relative;
    overflow: visible;
  }

  /* lv1 li 요소에도 오버플로우 허용 */
  .lv1 {
    position: relative;
    overflow: visible;
  }
</style>
