<template>
  <div class="sub-router__inner">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <keep-alive :include="cacheTab">
          <component :is="Component" />
        </keep-alive>
      </transition>
    </router-view>
  </div>
</template>

<script>
  import { ref, watch } from 'vue';
  import { useTabNaviStore } from '@/stores/tabNavi';
  import { storeToRefs } from 'pinia';

  export default {
    setup() {
      const tabNaviStore = useTabNaviStore();
      const { getTabData, tabData, ischangeTab } = storeToRefs(tabNaviStore);
      const { setIsChangeTab } = tabNaviStore;

      console.log('SubRouterInnerView - getTabData', getTabData.value);

      const cacheTab = ref([]);

      // 🔥 경로를 컴포넌트명으로 매핑하는 함수
      const getComponentNameByPath = (path) => {
        const pathComponentMap = {
          '/dashboard': 'DashboardView', // 대시보드
          '/dictionaryMng/search': 'DictionarySearchView', // 사전조회
          '/dictionaryMng/term': 'TermMngView', // 용어관리
          '/dictionaryMng/word': 'WordMngView', // 단어관리
          // 추가 경로가 있다면 여기에 계속 추가
          '/dictionaryMng/domain': 'DomainMngView', // 도메인관리
          '/dictionaryMng/code': 'CodeMngView', // 코드관리
          '/dataMng/schema/view': 'SchemaSearchView', // 스키마조회
          '/dataMng/schemacollection/view': 'SchemaCollectionView', // 스키마수집
          '/dataMng/schemaoption/view': 'SchemaOptionView', // 스키마부가정보
          '/actualizing/table': 'ActualizingTable', // 테이블정제
          '/actualizing/column': 'ActualizingColumn', // 컬럼정제
          '/actualizing/term': 'ActualizingTerm', // 용어표준화
          '/actualizing/word': 'ActualizingWord', // 단어표준화
          '/actualizing/domain': 'ActualizingDomain', // 도메인표준화
          '/diagnosis/standard/view': 'DiagnosisStandardView', // 진단기준
          '/diagnosis/statistics/view': 'DiagnosisStatisticsView', // 진단통계
          '/approval/view': 'ApprovalMngView', // 전자결재
          '/systemMng/institute': 'InstituteSetView', // 기관설정
          '/systemMng/externaldict': 'ExternalDictionaryListView', // 공식사전관리
          '/systemMng/externaldictversion': 'ExternalDictionaryVersionView', // 공식사전버전관리
          '/systemMng/institueadminset': 'InstituteAdminSetView', // 기관관리자설정
          '/systemMng/user': 'UserStatusView', // 사용자현황
          '/systemMng/instadmin/view': 'InstAdminView', // 기관 시스템 관리
          '/bizMetaMng/mng': 'BizMetaMngView', // 비즈메타관리
        };

        return pathComponentMap[path] || null;
      };

      // 🔥 tabData를 컴포넌트명으로 변환하여 cacheTab 업데이트
      const updateCacheTab = (tabDataArray) => {
        console.log('🔄 cacheTab 업데이트 시작:', tabDataArray);

        const componentNames = tabDataArray
          .map((tab) => {
            const componentName = getComponentNameByPath(tab.path);
            console.log(
              `경로 "${tab.path}" (${tab.title}) → 컴포넌트명: ${componentName}`
            );
            return componentName;
          })
          .filter((name) => name !== null); // null 값 제거

        cacheTab.value = componentNames;

        console.log('✅ cacheTab 업데이트 완료:', cacheTab.value);
      };

      // 🔥 ischangeTab 감시
      watch(ischangeTab, (newVal) => {
        console.log('SubRouterInnerView - ischangeTab changed : ', newVal);

        if (newVal === true) {
          // 히스토리바 생성 시 - 현재 tabData 기반으로 캐시 업데이트
          console.log('히스토리바 생성 - tabData 기반 캐시 업데이트');
          updateCacheTab(getTabData.value);
        } else {
          // 히스토리바 삭제 시 - 캐시 비우기 또는 현재 탭만 유지
          console.log('히스토리바 삭제');
          // 필요에 따라 캐시를 완전히 비우거나 현재 탭만 유지
          cacheTab.value = [];
        }
        console.log('현재 getTabData.value : ', getTabData.value);
      });

      // 🔥 tabData 감시 - 탭 데이터가 변경될 때마다 캐시 업데이트
      watch(
        () => tabData.value,
        (newTabData) => {
          console.log('📊 tabData 변경 감지:', newTabData);

          // tabData가 유효한 배열일 때만 업데이트
          if (Array.isArray(newTabData) && newTabData.length > 0) {
            updateCacheTab(newTabData);
          } else {
            console.log('⚠️ tabData가 비어있거나 유효하지 않음');
            cacheTab.value = [];
          }
        },
        {
          deep: true,
          immediate: true, // 컴포넌트 마운트 시에도 즉시 실행
        }
      );

      // 🔥 디버깅용 - cacheTab 변경 감시
      watch(
        () => cacheTab.value,
        (newCacheTab, oldCacheTab) => {
          console.log('🎯 cacheTab 변경:', {
            이전: oldCacheTab,
            현재: newCacheTab,
            변경시간: new Date().toLocaleTimeString(),
          });
        },
        { deep: true }
      );

      return {
        cacheTab,
      };
    },
  };
</script>

<style>
  .sub-router__inner {
    height: 100%;
  }

  /* 🔥 페이드 트랜지션 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
