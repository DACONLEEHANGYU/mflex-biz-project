<template>
  <div class="full-contents">
    <div class="content-top pt5">
      <div class="title-s">
        기관 목록
        <AppTooltip :htmlContent="getTooltipById('instituteList')">
        </AppTooltip>
      </div>
    </div>
    <div class="tree-wrap">
      <div class="tree-box__absolute">
        <!-- @selectNewNode="onSelectNewNode" -->
        <AppTree
          v-model="treeData"
          :roots="treeRoots"
          @selectNode="onSelectNode"
          @nodeDrop="handleNodeDrop"
          @nodeDragstart="handelDraggStart"
          @nodeDragend="handelDraggEnd"
        />
      </div>
    </div>
  </div>
  <!-- 기관계층 구조 변경 알림창-->
  <AppDialog
    v-model:view="changeHierachyConfirmState.view"
    :title="changeHierachyConfirmState.title"
    :message="changeHierachyConfirmState.message"
    @confirm="onChangeHierachy(changeHierachyConfirmState.eventObj)"
    @cancel="onChangeHierachyClose"
  >
  </AppDialog>
</template>

<script setup>
  import { ref, watch, nextTick, reactive } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useSystemMngStore } from '@/stores/systemMng';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { useAuthStore } from '@/stores/auth';

  import {
    getInstituteDetails, // 기관 상세정보 조회
    getInfoSystemTree,
    modifyInstitute,
    changeInstituteOrder,
    getInstList, // 기관 목록 조회
  } from '@/utils/mflexApi/systemMng/systemManagementApi';
  import { findParentNode } from '@/utils/mflexApi/dictionarySet';

  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import AppTree from '@/components/ui/AppTree.vue';

  const { getTooltipById } = useHelpToolTipStore();

  // store
  const { setSaveState, setDeleteState, setSelectInstitute } =
    useSystemMngStore();
  const {
    saveState,
    deleteState,
    newInstituteId,
    selectInstitute,
    saveInstState,
  } = storeToRefs(useSystemMngStore());

  const { setSaveInstState } = useSystemMngStore();

  const authStore = useAuthStore();
  const { userMetaMngInstListInfo, userDctnryList, userInfo, userStngInfo } =
    storeToRefs(authStore);

  const instituteList = ref([]);

  const treeRoots = ref({ roots: ['0'] });
  const treeData = ref({});

  const oldTreeData = ref({});

  const fetchTreeData = async (state, newInstituteId) => {
    console.log('fetchTreeData-state: ', state);

    // 트리데이터 조회
    instituteList.value = await getInfoSystemTree();

    console.log('getInstList : ', await getInstList());

    console.log('instituteList.value : ', instituteList.value);

    // 새 트리 데이터 객체 생성
    const newTreeData = {};

    // 기관 ID를 키로 사용하는 맵 생성 (빠른 검색을 위해)
    const instituteMap = {};
    instituteList.value.forEach((institute) => {
      instituteMap[institute.instituteId] = institute;
    });

    // 먼저 모든 기관을 treeData에 추가
    instituteList.value.forEach((institute) => {
      const nodeId = institute.instituteId.toString();

      newTreeData[nodeId] = {
        text: institute.instituteName,
        children: [], // 나중에 채울 예정
        // state: {
        //   opened: institute.level <= 1, // 루트와 레벨 1만 기본 열림
        // },
        state: {
          opened: true, // 모든 노드를 기본 열림 상태로 설정
        },
        level: institute.level,
        size: 52,
        id: institute.instituteId,
        instituteId: institute.instituteId,
        parentInstituteId: institute.parentInstituteId,
        order: institute.order,
      };
    });

    // children 배열을 구성
    instituteList.value.forEach((institute) => {
      const nodeId = institute.instituteId.toString();

      // 자식 노드 ID들을 문자열로 변환하여 추가
      if (institute.children && Array.isArray(institute.children)) {
        newTreeData[nodeId].children = institute.children.map((childId) =>
          childId.toString()
        );
      }
    });

    // 루트 설정 (기관 홈)
    treeRoots.value = { roots: ['0'] }; // 기관 홈의 ID가 0으로 가정

    // treeData 업데이트
    treeData.value = newTreeData;

    console.log('oldTreeData : ', oldTreeData.value);
    console.log('newTreeData : ', newTreeData);
    console.log('treeData.value : ', treeData.value);

    // 신규 등록, 수정, 또는 초기 로드 시 적절한 노드 선택 처리
    if (state === 1 && newInstituteId) {
      // 신규등록 시
      handleNodeSelection(newTreeData, newInstituteId);
    } else if (state === 2 && newInstituteId) {
      // 수정 시
      handleNodeSelection(newTreeData, newInstituteId);
    } else {
      // 첫 번째 기관을 기본 선택 (기관 홈)
      if (instituteList.value.length > 0) {
        setSelectInstitute(newTreeData['0']);
      }

      nextTick(() => {
        // 모든 노드의 data-selected 속성을 0으로 초기화
        const allNodes = document.querySelectorAll('.node-wrapper');
        allNodes.forEach((node) => node.setAttribute('data-selected', 0));
      });
    }
  };

  fetchTreeData();

  // 노드 선택 처리를 위한 별도 함수 (코드 재사용성 높임)
  const handleNodeSelection = (newTreeData, targetInstituteId) => {
    console.log(
      'handleNodeSelection - targetInstituteId : ',
      targetInstituteId
    );

    // treeData에서 해당 newInstituteId를 가진 항목 찾기
    const foundItem = Object.values(newTreeData).find(
      (item) => item.instituteId === targetInstituteId
    );

    console.log('foundItem : ', foundItem);

    if (foundItem) {
      setSelectInstitute(foundItem);
    }

    // 부모 요소 select 효과
    nextTick(() => {
      // 모든 노드의 data-selected 속성을 0으로 초기화
      const allNodes = document.querySelectorAll('.node-wrapper');
      allNodes.forEach((node) => node.setAttribute('data-selected', 0));

      let newNode = document.getElementById(`id${targetInstituteId}`);
      console.log('새 노드 ===========================', newNode);
      if (newNode) {
        let parentElement = newNode.parentNode;
        parentElement.setAttribute('data-selected', 1);
      } else {
        console.warn(`노드 id${targetInstituteId}를 찾을 수 없습니다.`);
      }
    });
  };

  // 노드 선택
  const onSelectNode = (node) => {
    console.log('onSelectNode', node);
    setSelectInstitute(node);
  };

  // 트리 dragStart
  let dragStartObject;

  // 드래그 시작 이벤트 핸들러
  const handelDraggStart = (event) => {
    console.log('drag start =====', event);
    dragStartObject = event.dragged.node;
    console.log(
      '드래그 시작 treeData =========================',
      treeData.value
    );
  };

  // 드래그 종료 이벤트 핸들러
  const handelDraggEnd = (event) => {
    console.log('node End', event);

    let eventObj = event;
    console.log('eventObj =================', eventObj);
    let instituteId = event.dragged.node.id;
    console.log('instituteId =================', instituteId);

    // 문자열로 통일하여 비교
    const newParentId = event.dragged.node.parent;
    const oldParentId =
      event.dragged.node.parentInstituteId !== null
        ? event.dragged.node.parentInstituteId.toString()
        : null;

    console.log('새 부모 ID(문자열):', newParentId);
    console.log('이전 부모 ID(문자열로 변환):', oldParentId);

    // 부모가 변경되었는지 비교 (타입 일치시킴)
    if (newParentId !== oldParentId) {
      onChangeHierachyConfirm(eventObj);
    }
  };

  // drop 시 순서 변경
  const handleNodeDrop = async (event) => {
    console.log('node droped:', event);
    //const data = treeData.value;
    //console.log('TreeData =======================', data);

    const nodes = treeData.value;

    const { target, dragged } = event;
    const targetNode = target.node; // 드롭 대상 노드
    const draggedNode = dragged.node; // 드래그된 노드

    // 드롭 대상 노드의 부모 노드에서 드롭 대상 노드와 드래그된 노드의 인덱스를 구합니다.
    const parentNode = findParentNode(targetNode, nodes); // 부모 노드 찾기 함수

    const targetIndex = parentNode.children.indexOf(targetNode);
    const draggedIndex = parentNode.children.indexOf(draggedNode.id);

    // 인덱스를 비교하여 위쪽 순서인지 아래쪽 순서인지 판단
    if (targetIndex > draggedIndex) {
      console.log('요소가 타겟 요소의 위쪽 순서에 들어갔습니다.');

      console.log('draggedNode', draggedNode);
      console.log('targetNode', targetNode);

      // const details = await getInstituteDetails(draggedNode.instituteId);

      let changeData = {
        instituteId: draggedNode.instituteId,
        order: nodes[targetNode].order - 10,
      };

      await changeInstituteOrder(changeData);
    } else {
      console.log('요소가 타겟 요소의 아래쪽 순서에 들어갔습니다.');

      // const details = await getInstituteDetails(draggedNode.instituteId);

      let changeData = {
        instituteId: draggedNode.instituteId,
        order: nodes[targetNode].order + 10,
      };

      await changeInstituteOrder(changeData);
    }
  };

  // 사전 드래그 -> 계층구조 변경 알림 Dialog
  const changeHierachyConfirmState = reactive({
    view: false,
    message: '<주의> 기관 계층 구조가 변경됩니다.',
    instituteId: '',
    eventObj: '',
  });

  // 계층 구조 변경
  const onChangeHierachy = async (eventObj) => {
    // 사전 계층구조 변경
    console.log('dragStartObject', dragStartObject);
    console.log('eventObj', eventObj);
    console.log(
      '드래그 종료 treeData =========================',
      treeData.value
    );

    let instituteId = eventObj.dragged.node.instituteId;

    // 부모 노드 ID (문자열)
    const parentNodeId = eventObj.dragged.node.parent;
    // console.log('부모 노드 ID:', parentNodeId);

    // // treeData에서 부모 노드의 instituteId 찾기
    let parentInstituteId = null;
    if (parentNodeId && treeData.value[parentNodeId]) {
      parentInstituteId = treeData.value[parentNodeId].instituteId;
      console.log('부모 노드의 parentInstituteId:', parentInstituteId);
    } else {
      // 루트 노드인 경우 또는 부모를 찾을 수 없는 경우
      parentInstituteId = 0; // 기본값으로 0 지정 (기관 홈)
      console.log(
        '부모 노드를 찾을 수 없거나 루트 노드입니다. parentInstituteId를 0으로 설정합니다.'
      );
    }

    const rowInstituteData = await getInstituteDetails(instituteId);
    console.log('기관 상세 조회:', rowInstituteData);

    // // 없는 값은 기존 값 유지하도록

    let changeData = {
      instituteId: instituteId,
      instituteName: rowInstituteData.instituteName,
      parentInstituteId: parentInstituteId, // 찾은 부모 기관 ID 사용
      metaManageYn: rowInstituteData.metaManageYn,
    };

    await modifyInstitute(changeData);

    // let dictionaryData = {
    //   instituteId: selectInstitute.id,
    //   dictionaryName: rowDictionaryData.dictionaryName,
    //   parentDictionaryId: parentDictionaryId, // 찾은 부모 사전 ID 사용
    //   dictionaryTypeCode: rowDictionaryData.dictionaryTypeCode,
    //   dictionaryTypeForegroundColorName:
    //     rowDictionaryData.dictionaryTypeForegroundColorName,
    //   dictionaryTypeBackgroundColorName:
    //     rowDictionaryData.dictionaryTypeBackgroundColorName,
    //   description: rowDictionaryData.description,
    // };

    // console.log('사전 계층구조 변경 데이터:', dictionaryData);

    // let editResult = editDictionary(dictionaryId, dictionaryData);

    // if (editResult) {
    //   setTimeout(async () => {
    //     const dictionaryListData = await getDictionaryTree(selectInstitute.id);
    //     const constructTree = constructDictionaryTree(dictionaryListData);

    //     treeData.value = constructTree;
    //     console.log('사전 계층구조 변경 성공');
    //   }, 100);
    // }
  };

  const onChangeHierachyClose = async () => {
    setTimeout(async () => {
      fetchTreeData();
      changeHierachyConfirmState.view = false;
    }, 50);
  };

  const onChangeHierachyConfirm = (eventObj) => {
    changeHierachyConfirmState.view = true;
    changeHierachyConfirmState.eventObj = eventObj;
  };

  // 저장 상태 확인
  watch(saveState, () => {
    if (saveState.value) {
      fetchTreeData(saveState.value, newInstituteId.value);
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

  watch(newInstituteId, () => {
    console.log('newInstituteId : ', newInstituteId);
  });

  // treeData 변경 감지를 위한 watch 추가
  watch(
    treeData,
    (newValue, oldValue) => {
      console.log('treeData changed', newValue, oldValue);
    },
    { deep: true }
  ); // deep: true 옵션으로 깊은 감시 설정

  watch(saveInstState, (value) => {
    console.log('saveInstState : ', value);
    if (value) {
      fetchTreeData(1, newInstituteId.value);
      setSaveInstState(false);
    }
  });
</script>
