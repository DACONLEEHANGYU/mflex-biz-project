<template>
  <section class="contents-wrap">
    <div class="content-box">
      <div class="content-area">
        <div class="search-row"></div>

        <div class="content-row">
          <div class="bg-box approval-layout">
            <ApprovalSideMenuComp
              :selected-menu="selectedMenu"
              @menu-selected="onMenuSelected"
            />
            <ApprovalContentsComp :selected-menu="selectedMenu" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { ref, onActivated, onBeforeMount, watch } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import { useApprovalStore } from '@/stores/approval';
  import {
    getApprovalRequestList,
    getPendingApprovalRequests,
    getCompleteApprovalList,
  } from '@/utils/mflexApi/approval/ApprovalApi.js';
  import ApprovalSideMenuComp from '@/views/approvalMng/components/ApprovalSideMenuComp.vue';
  import ApprovalContentsComp from '@/views/approvalMng/components/ApprovalContentsComp.vue';

  defineOptions({ name: 'ApprovalMngView' });

  // 선택된 메뉴 상태 관리
  const selectedMenu = ref('dashboard'); // 기본값: 대시보드

  // 메뉴 선택 핸들러
  const onMenuSelected = (menuKey) => {
    selectedMenu.value = menuKey;
  };

  const authStore = useAuthStore();
  const { userStngInfo } = storeToRefs(authStore);

  const { useDctnryId, useMetaMngInstId } = userStngInfo.value;

  const approvalStore = useApprovalStore();

  const {
    setRequestCount,
    setPendingCount,
    setCompleteCount,
    setRequestDetailsCount,
    setPendingDetailsCount,
    setCompleteDetailsCount,
    setIsUpdate,
  } = approvalStore;

  const { isUpdate } = storeToRefs(approvalStore);

  // 🔥 targetType별 건수를 계산하는 함수
  const calculateTargetTypeCounts = (approvalList) => {
    const counts = {
      TRM: 0, // 용어
      WRD: 0, // 단어
      DMN: 0, // 도메인
      total: 0,
    };

    if (!Array.isArray(approvalList)) {
      console.warn('approvalList가 배열이 아닙니다:', approvalList);
      return counts;
    }

    approvalList.forEach((item) => {
      if (item.targetType) {
        switch (item.targetType) {
          case 'TRM':
            counts.TRM++;
            break;
          case 'WRD':
            counts.WRD++;
            break;
          case 'DMN':
            counts.DMN++;
            break;
          default:
            console.warn('알 수 없는 targetType:', item.targetType);
        }
        counts.total++;
      }
    });
    return counts;
  };

  const getApprovalData = async () => {
    const requestParams = {
      instituteId: useMetaMngInstId,
      dictionaryId: useDctnryId,
    };

    const approvalRequestList = await getApprovalRequestList(requestParams);
    const requestDetailsCount = calculateTargetTypeCounts(approvalRequestList);
    console.log('Request Details Count:', requestDetailsCount);

    console.log('Approval Request List:', approvalRequestList);
    setRequestCount(approvalRequestList.length);
    setRequestDetailsCount(requestDetailsCount);

    const pendingParams = {
      instituteId: useMetaMngInstId,
      dictionaryId: useDctnryId,
    };

    const pendingApprovalList = await getPendingApprovalRequests(pendingParams);
    const pendingDetailsCount = calculateTargetTypeCounts(pendingApprovalList);
    console.log('Pending Details Count:', pendingDetailsCount);

    console.log('Pending Approval List:', pendingApprovalList);
    setPendingCount(pendingApprovalList.length);
    setPendingDetailsCount(pendingDetailsCount);

    const completeParams = {
      instituteId: useMetaMngInstId,
      dictionaryId: useDctnryId,
      size: 100,
    };

    const completeApprovalList = await getCompleteApprovalList(completeParams);
    const completeDetailsCount = calculateTargetTypeCounts(
      completeApprovalList.content
    );

    setCompleteCount(completeApprovalList.totalElements);
    setCompleteDetailsCount(completeDetailsCount);
  };

  onBeforeMount(async () => {
    await getApprovalData();
  });

  watch(isUpdate, async (newValue) => {
    if (newValue) {
      // 업데이트가 필요할 때의 로직
      await getApprovalData();
      setIsUpdate(false);
    }
  });

  onActivated(async () => {
    await getApprovalData();
  });
</script>

<style lang="scss" scoped>
  .approval-layout {
    display: flex;
    // height: calc(100vh - 200px); // 적절한 높이 설정
    min-height: 600px;
    gap: 0;
  }
</style>
