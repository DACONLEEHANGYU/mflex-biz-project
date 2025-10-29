<template>
  <div class="full-contents">
    <div class="content-top pt5">
      <div class="title-s">
        업무 목록
        <AppTooltip :htmlContent="getTooltipById('informationSystemList')">
        </AppTooltip>
      </div>
      <div class="input-form" style="flex: 1">
        <table class="input-table">
          <colgroup>
            <col width="15%" />
            <col width="" />
          </colgroup>
          <tbody>
            <tr>
              <th>기관명</th>
              <td class="manage-input-form-td">
                <div class="td-col">
                  <div>
                    <select
                      class="input-select"
                      style="width: 100%"
                      v-model="selectInstitute.id"
                    >
                      <option
                        v-for="option in metaMngInstList"
                        :key="option.instituteId"
                        :value="option.instituteId"
                      >
                        {{ option.instituteName }}
                      </option>
                    </select>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="tree-wrap">
      <div class="tree-box__absolute">
        <!-- @selectNewNode="onSelectNewNode" -->
        <AppTree
          v-model="treeData"
          :roots="treeRoots"
          :drag="false"
          @selectNode="onSelectNode"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, ref, watch, nextTick, onBeforeMount, reactive } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useSystemMngStore } from '@/stores/systemMng';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { useAuthStore } from '@/stores/auth';

  import {
    getInfoSystemList, // 정보시스템 조회 by 기관
  } from '@/utils/mflexApi/systemMng/systemManagementApi';

  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import AppTree from '@/components/ui/AppTree.vue';

  // store
  const {
    setSelectSystem,
    setSaveState,
    setDeleteState,
    setSelectSystemInstituteId,
  } = useSystemMngStore();
  const { saveState, deleteState, newSystemId } = storeToRefs(
    useSystemMngStore()
  );

  const authStore = useAuthStore();
  const {
    userMetaMngInstListInfo,
    userDctnryList,
    userInfo,
    userStngInfo,
    userMetaMngInstList,
    userInstituteAdminList,
  } = storeToRefs(authStore);

  const { tooltipList } = storeToRefs(useHelpToolTipStore());
  const { getTooltipById } = useHelpToolTipStore();

  const { useMetaMngInstId } = userStngInfo.value;
  const metaMngInstList = userInstituteAdminList.value;

  const selectInstituted = computed(() => {
    return userMetaMngInstListInfo.value.find((item) => item.selected === true);
  });

  // selectInstitute를 ref 대신 reactive로 초기화
  const selectInstitute = reactive({
    id: useMetaMngInstId, // 초기값으로 현재 사용자의 기관 ID 설정
    name: '',
  });

  console.log('selectInstituted :  ', selectInstituted.value);

  const systemList = ref([]);

  // 정보시스템 목록 조회 by 기관
  const getSystemList = async () => {
    systemList.value = await getInfoSystemList(selectInstitute.id);
    console.log('systemList :  ', systemList.value);
  };

  const treeRoots = ref({ roots: ['0'] });
  const treeData = ref({});

  const oldTreeData = ref({});

  const fetchTreeData = async (state, newSystemId) => {
    console.log('fetchTreeData-state: ', state);

    console.log('fetchTreeData ===');

    if (treeData.value) {
      oldTreeData.value = treeData.value;
    }

    // 초기 root 노드 설정
    const rootNode = {
      text: '업무 홈',
      children: [], // 동적으로 채워질 children
      state: { opened: true },
      level: 1,
      order: 0,
      id: '0',
      size: 52,
    };

    await getSystemList();

    // 삭제되지 않은 항목만 필터링 (delYn이 true인 항목 제외)
    const filteredSystemList = systemList.value.filter(
      (system) => system.delYn !== true
    );
    console.log(
      '필터링된 정보시스템 목록 (삭제항목 제외):',
      filteredSystemList.length
    );

    // systemList의 각 항목에 대한 ID 배열 생성
    const childrenIds = filteredSystemList.map((_, index) =>
      (index + 1).toString()
    );
    rootNode.children = childrenIds;

    console.log('childrenIds : ', childrenIds);

    // treeData 객체 초기화
    const newTreeData = {
      0: rootNode,
    };

    // systemList의 각 항목을 treeData에 추가
    filteredSystemList.forEach((system, index) => {
      newTreeData[(index + 1).toString()] = {
        text: system.informationSystemName,
        children: [],
        state: { opened: true },
        level: 2,
        order: systemList.value.length - index, // 역순으로 order 부여
        size: 52,
        id: system.informationSystemId,
        informationSystemId: system.informationSystemId,
        standardApplicationYn: system.standardApplicationYn,
        delYn: system.delYn,
        dbmsKindCode: system.dbmsKindCode,
        instituteId: system.instituteId,
        constructDate: system.constructDate,
      };
    });

    console.log('newTreeData : ', newTreeData);

    // treeData 업데이트
    treeData.value = newTreeData;

    console.log('oldTreeData : ', oldTreeData.value);
    console.log('newTreeData : ', newTreeData);

    if (state === 1 && newSystemId) {
      // 신규등록 시
      console.log('fetchTree - newSystemId : ', newSystemId);
      // treeData에서 해당 newSystemId를 가진 항목 찾기
      const foundItem = Object.values(newTreeData).find(
        (item) => item.informationSystemId === newSystemId
      );

      console.log('foundItem : ', foundItem);

      if (foundItem) {
        setSelectSystem(foundItem);
      }

      // 부모 요소 select 효과
      nextTick(() => {
        // 모든 노드의 data-selected 속성을 0으로 초기화
        const allNodes = document.querySelectorAll('.node-wrapper');
        allNodes.forEach((node) => node.setAttribute('data-selected', 0));

        let newNode = document.getElementById(`id${newSystemId}`);
        console.log('새 노드 ===========================', newNode);
        let parentElement = newNode.parentNode;
        parentElement.setAttribute('data-selected', 1);
      });
    } else if (state === 2 && newSystemId) {
      // 수정 시
      console.log('fetchTree - newSystemId : ', newSystemId);
      // treeData에서 해당 newSystemId를 가진 항목 찾기
      const foundItem = Object.values(newTreeData).find(
        (item) => item.systemId === newSystemId
      );

      console.log('foundItem : ', foundItem);

      if (foundItem) {
        setSelectSystem(foundItem);
      }

      nextTick(() => {
        // 모든 노드의 data-selected 속성을 0으로 초기화
        const allNodes = document.querySelectorAll('.node-wrapper');
        allNodes.forEach((node) => node.setAttribute('data-selected', 0));

        let newNode = document.getElementById(`id${newSystemId}`);
        console.log('새 노드 ===========================', newNode);
        let parentElement = newNode.parentNode;
        parentElement.setAttribute('data-selected', 1);
      });
    } else {
      // 첫 번째 시스템을 기본 선택
      if (systemList.value.length > 0) {
        setSelectSystem(newTreeData['0']);
      }

      nextTick(() => {
        // 모든 노드의 data-selected 속성을 0으로 초기화
        const allNodes = document.querySelectorAll('.node-wrapper');
        allNodes.forEach((node) => node.setAttribute('data-selected', 0));
      });
    }
  };

  fetchTreeData();

  // 노드 선택
  const onSelectNode = (node) => {
    console.log('onSelectNode', node);
    setSelectSystem(node);
  };

  // onBeforeMount(() => {
  //   const selectedInst = metaMngInstList.find(
  //     (items) => items.id === selectInstitute.id
  //   );
  //   if (selectedInst) {
  //     selectInstitute.id = selectedInst.id;
  //     selectInstitute.name = selectedInst.name;

  //     setSelectSystemInstituteId(selectedInst.id); // 선택된 기관 ID 저장
  //   }
  // });

  onBeforeMount(() => {
    // useMetaMngInstId와 일치하는 항목이 있는지 찾기
    if (metaMngInstList && metaMngInstList.length > 0) {
      const matchedInstitute = metaMngInstList.find(
        (institute) => institute.instituteId === useMetaMngInstId
      );

      if (matchedInstitute) {
        // 일치하는 항목이 있으면 해당 항목 선택
        selectInstitute.id = matchedInstitute.instituteId;
        selectInstitute.name = matchedInstitute.instituteName;
        console.log('useMetaMngInstId와 일치하는 기관으로 설정됨:', {
          id: selectInstitute.id,
          name: selectInstitute.name,
        });
      } else {
        // 일치하는 항목이 없으면 첫 번째 항목 선택
        const firstInstitute = metaMngInstList[0];
        selectInstitute.id = firstInstitute.instituteId;
        selectInstitute.name = firstInstitute.instituteName;
        console.log('일치하는 항목이 없어 첫 번째 기관으로 설정됨:', {
          id: selectInstitute.id,
          name: selectInstitute.name,
          originalId: useMetaMngInstId,
        });
      }

      setSelectSystemInstituteId(selectInstitute.id); // 선택된 기관 ID 저장
    } else {
      // 리스트가 비어있을 경우 기본값 사용
      selectInstitute.id = useMetaMngInstId;
      console.log('기본 기관 ID 사용 (리스트 없음):', selectInstitute.id);
      setSelectSystemInstituteId(useMetaMngInstId);
    }
  });

  watch(
    () => selectInstitute.id,
    async (newValue) => {
      console.log('기관 변경됨', newValue);

      // setSelectSystemInstituteId(newValue); // 선택된 기관 ID 저장

      // // 1. computed 속성 직접 수정 대신 원본 데이터 수정
      // const index = userMetaMngInstListInfo.value.findIndex(
      //   (item) => item.selected === true
      // );
      // if (index !== -1) {
      //   // 이전에 선택된 기관의 selected를 false로 설정
      //   userMetaMngInstListInfo.value[index].selected = false;
      // }

      // // 새로 선택한 기관을 찾아 selected를 true로 설정
      // const newSelectedIndex = userMetaMngInstListInfo.value.findIndex(
      //   (item) => item.id === newValue
      // );
      // if (newSelectedIndex !== -1) {
      //   userMetaMngInstListInfo.value[newSelectedIndex].selected = true;
      // }

      // 3. fetchTreeData 호출 시 상태 초기화 파라미터 추가
      await fetchTreeData(0, null); // 상태를 0으로 초기화하면서 트리 다시 불러오기
    },
    { immediate: true } // 즉시 실행
  );

  // 저장 상태 확인
  watch(saveState, () => {
    if (saveState.value) {
      fetchTreeData(saveState.value, newSystemId.value);
      setSaveState(0);
    }
  });
  // 삭제 상태 확인
  watch(deleteState, () => {
    console.log('deleteState : ', deleteState);
    if (deleteState) {
      fetchTreeData();
      setDeleteState(false);
    }
  });

  watch(newSystemId, () => {
    console.log('newSystemId : ', newSystemId);
  });

  // treeData 변경 감지를 위한 watch 추가
  watch(
    treeData,
    (newValue, oldValue) => {
      console.log('treeData changed', newValue, oldValue);
    },
    { deep: true }
  ); // deep: true 옵션으로 깊은 감시 설정
</script>
