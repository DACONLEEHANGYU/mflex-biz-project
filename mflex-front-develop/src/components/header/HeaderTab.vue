<template>
  <div class="tab-navi">
    <swiper
      :freeMode="true"
      :slides-per-view="'auto'"
      :space-between="0"
      :modules="modules"
      :navigation="false"
      @swiper="onSwiper"
      @slideChange="onSlideChange"
    >
      <swiper-slide v-for="(tab, index) in getTabData" :key="tab.title">
        <div class="tab-box" :class="index === getSelectIndex ? 'active' : ''">
          <div class="btn-tab" @click="onSelectTab(index, tab)">
            {{ tab.title }}
          </div>
          <span
            class="btn-remove"
            @click="onRemoveTab(index)"
            v-if="index !== 0"
            ><i class="icon"></i
          ></span>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
  import { storeToRefs } from 'pinia';
  import { useRouter } from 'vue-router';
  import { useTabNaviStore } from '@/stores/tabNavi';

  import { useDictionarySaerchTabStore } from '@/stores/dictionarySearchTab';
  import {
    saveStepStateStorage,
    saveActualizingStepStateStorage,
  } from '@/utils/cookies';

  import { Swiper, SwiperSlide } from 'swiper/vue';
  import { FreeMode, Navigation } from 'swiper/modules';

  const modules = [FreeMode, Navigation];

  const router = useRouter();

  const dictionarySearchTabStore = useDictionarySaerchTabStore();
  const { setSearchTabState } = dictionarySearchTabStore;

  const tabNaviStore = useTabNaviStore();
  const { getTabData, getSelectIndex } = storeToRefs(tabNaviStore);
  const {
    removeTabNavi,
    setSwiper,
    setSelectIndex,
    setDictionaryMngState,
    setActualizingState,
    setIsChangeTab,
  } = tabNaviStore;

  const onSelectTab = (index, tab) => {
    console.log('onSelectTab - index', index);
    console.log('onSelectTab - tab', tab);
    // 사전조회 탭 상태 변경
    if (tab.title === '용어조회') {
      router.push('/dictionarySearch/term/list').then(() => {
        setSearchTabState('term');
      });
    } else if (tab.title === '단어조회') {
      router.push('/dictionarySearch/word/list').then(() => {
        setSearchTabState('word');
      });
    } else if (tab.title === '도메인조회') {
      router.push('/dictionarySearch/domain/list').then(() => {
        setSearchTabState('domain');
      });
    } else if (tab.title === '코드조회') {
      router.push('/dictionarySearch/code/list').then(() => {
        setSearchTabState('code');
      });
    }

    // 사전관리
    if (tab.title === '용어등록') {
      setDictionaryMngState('term');
      saveStepStateStorage('term');
    } else if (tab.title === '단어등록') {
      setDictionaryMngState('word');
      saveStepStateStorage('word');
    } else if (tab.title === '도메인등록') {
      setDictionaryMngState('domain');
      saveStepStateStorage('domain');
    } else if (tab.title === '코드등록') {
      setDictionaryMngState('code');
      saveStepStateStorage('code');
    }

    // 사전표준화
    if (tab.title === '테이블정제') {
      setActualizingState('table');
      saveActualizingStepStateStorage('table');
    } else if (tab.title === '컬럼정제') {
      setActualizingState('column');
      saveActualizingStepStateStorage('column');
    } else if (tab.title === '용어사전표준화') {
      setActualizingState('term');
      saveActualizingStepStateStorage('term');
    } else if (tab.title === '단어사전표준화') {
      setActualizingState('word');
      saveActualizingStepStateStorage('word');
    } else if (tab.title === '도메인사전표준화') {
      setActualizingState('domain');
      saveActualizingStepStateStorage('domain');
    }
    setSelectIndex(index);
  };
  const onRemoveTab = (index) => {
    const removedTab = getTabData.value[index];

    console.log('onRemoveTab - removedTab : ', removedTab);

    removeTabNavi(index);
    setIsChangeTab(true);
  };
  const onSwiper = (swiper) => {
    setSwiper(swiper);
  };
  const onSlideChange = (swiper) => {
    console.log('slide change', swiper, swiper.activeIndex);
  };
</script>
