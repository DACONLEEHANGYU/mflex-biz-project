<template>
  <div class="full-contents">
    <div class="content-top">
      <div class="title-s">
        기관별 공식사전 목록
        <AppTooltip
          :htmlContent="getTooltipById('externalDictionaryInstitutionList')"
        >
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
    <div class="tooltip-box">
      <span
        >메뉴를 Drag & Drop 으로 원하는 위치로 이동하거나 순서를 수정할 수
        있습니다.</span
      >
    </div>
  </div>

  <!-- 게층구조 변경 알림 -->
  <AppWindow
    :view="hierachyChangeView"
    @close="onCloseHierachyChangeWindow"
    width="500px"
    height="auto"
  >
    <ConfirmWindow
      :popInfo="popInfo"
      @confirm="onConfirmHierachyChange"
      @close="onCloseHierachyChangeWindow"
    />
  </AppWindow>
</template>

<script setup>
  import { ref, reactive, onMounted, watch } from 'vue';
  import { useExternalDictionaryStore } from '@/stores/externalDictionary';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { useAuthStore } from '@/stores/auth';

  import {
    getCommonDictionaryTree,
    editCommonDictionaryMapping,
  } from '@/utils/mflexApi/systemMng/systemManagementApi';

  import ConfirmWindow from '@/components/popWindow/ConfirmWindow.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import AppTree from '@/components/ui/AppTree.vue';
  import { storeToRefs } from 'pinia';

  const authStore = useAuthStore();

  const { tooltipList } = storeToRefs(useHelpToolTipStore());
  const { getTooltipById } = useHelpToolTipStore();

  const {
    setExternalDictionaryByInst,
    setSelectInstituteId,
    setExternalDictionaryByInstSaveState,
  } = useExternalDictionaryStore();
  const { externalDictionaryByInstSaveState } = storeToRefs(
    useExternalDictionaryStore()
  );

  const popInfo = ref({
    state: 'confirm',
    popTitle: '에러 제목',
    popMessages: '에러 메시지',
  });

  const props = defineProps({
    // 부모 컴포넌트로부터 필요한 값을 받을 수 있습니다
    initialInstituteId: {
      type: [String, Number],
      default: 1,
    },
  });

  const emit = defineEmits([
    'select-node',
    'node-drop',
    'node-dragstart',
    'node-dragend',
    'change-institute',
  ]);

  const {
    userMetaMngInstListInfo,
    userDctnryList,
    userInfo,
    userStngInfo,
    userMetaMngInstList,
    userInstituteAdminList,
  } = storeToRefs(authStore);

  const { useMetaMngInstId } = userStngInfo.value;
  const metaMngInstList = userInstituteAdminList.value;

  const selectInstitute = reactive({
    id: useMetaMngInstId, // 초기값으로 현재 사용자의 기관 ID 설정
    name: '',
  });

  // 트리 구조를 위한 상태
  const treeRoots = ref({ roots: ['1'] });
  const treeData = ref({});

  // API에서 가져온 데이터를 트리 형식으로 변환하는 함수
  const convertToTreeData = (apiData) => {
    // 결과 객체 초기화 - 공식사전 홈은 항상 루트
    const result = {
      1: {
        id: '1',
        dictionaryId: 'home',
        label: '공식사전 홈',
        children: [],
        parent: null,
        order: 0,
        text: '공식사전 홈',
        state: {
          opened: true,
        },
        expanded: true,
      },
    };

    // API에서 받은 데이터를 순회하며 변환
    if (Array.isArray(apiData)) {
      // 최상위 항목들 먼저 처리 (parentDictionaryId가 null인 항목)
      const topLevelItems = apiData.filter(
        (item) => item.parentDictionaryId === null
      );

      topLevelItems.forEach((item, index) => {
        const nodeId = String(item.dictionaryId);
        result[nodeId] = {
          id: nodeId,
          dictionaryId: item.dictionaryId,
          label: item.dictionaryName,
          type: item.dictionaryTypeName,
          children: [],
          parent: '1', // 공식사전 홈이 부모
          order: item.order || (index + 1) * 10,
          state: {
            opened: true,
          },
          text: item.dictionaryName,
          typeCode: item.dictionaryTypeCode || String(item.dictionaryId % 100),
          color: item.dictionaryTypeForegroundColorName || '#ffffff',
          bgColor: item.dictionaryTypeBackgroundColorName || '#4A6FF3',
          dictionaryExplain: item.dictionaryExplain,
        };

        // 부모의 children 배열에 추가
        result['1'].children.push(nodeId);
      });

      // 하위 항목들 처리 (parentDictionaryId가 있는 항목)
      apiData.forEach((item) => {
        if (item.parentDictionaryId !== null) {
          const nodeId = String(item.dictionaryId);
          const parentId = String(item.parentDictionaryId);

          // 부모가 이미 트리에 있는지 확인
          if (result[parentId]) {
            result[nodeId] = {
              id: nodeId,
              dictionaryId: item.dictionaryId,
              label: item.dictionaryName,
              type: item.dictionaryTypeName,
              children: [],
              parent: parentId,
              order: item.order || 10,
              state: {
                opened: true,
              },
              text: item.dictionaryName,
              typeCode:
                item.dictionaryTypeCode || String(item.dictionaryId % 100),
              color: item.dictionaryTypeForegroundColorName || '#ffffff',
              bgColor: item.dictionaryTypeBackgroundColorName || '#4A6FF3',
              dictionaryExplain: item.dictionaryExplain,
            };

            // 부모의 children 배열에 추가
            if (!result[parentId].children) {
              result[parentId].children = [];
            }
            result[parentId].children.push(nodeId);
          }
        }
      });
    }

    return result;
  };

  // 트리 더미 데이터 생성 함수
  const createDummyTreeData = () => {
    return {
      1: {
        id: '1',
        dictionaryId: 'home',
        label: '공식사전 홈',
        children: ['2', '3', '6'],
        parent: null,
        order: 0,
        text: '공식사전 홈',
        state: {
          opened: true,
        },
        expanded: true,
      },
      2: {
        id: '2',
        dictionaryId: 101,
        label: '표준단어사전',
        type: '정부표준',
        children: ['4', '5'],
        parent: '1',
        order: 10,
        state: {
          opened: true,
        },
        typeCode: '10',
        text: '범정부 공통표준 사전전',
        color: '#ffffff',
        bgColor: '#4A6FF3',
      },
      3: {
        id: '3',
        dictionaryId: 102,
        label: '기본사전',
        type: '기본사전',
        children: [],
        parent: '1',
        order: 20,
        state: {
          opened: true,
        },
        text: '공식사전 홈',
        typeCode: '20',
        color: '#ffffff',
        bgColor: '#F39C4A',
      },
      4: {
        id: '4',
        dictionaryId: 103,
        label: '단어사전',
        type: '단어사전',
        children: [],
        parent: '2',
        order: 10,
        state: {
          opened: true,
        },
        typeCode: '10',
        color: '#ffffff',
        bgColor: '#4A6FF3',
      },
      5: {
        id: '5',
        dictionaryId: 104,
        label: '확장사전',
        type: '확장사전',
        children: [],
        parent: '2',
        order: 20,
        state: {
          opened: true,
        },
        typeCode: '10',
        color: '#ffffff',
        bgColor: '#4A6FF3',
      },
      6: {
        id: '6',
        dictionaryId: 105,
        label: '코드사전',
        type: '코드사전',
        children: [],
        parent: '1',
        order: 30,
        state: {
          opened: true,
        },
        typeCode: '30',
        color: '#ffffff',
        bgColor: '#4AF39C',
      },
    };
  };

  // 부모 요소 찾기
  const findParentNode = (nodeId, nodes) => {
    const node = nodes[nodeId];
    if (!node) return null; // 노드가 존재하지 않으면 null 반환

    const parentId = node.parent;
    if (parentId === null) return null; // 부모 노드가 없으면 null 반환

    return nodes[parentId]; // 부모 노드 반환
  };

  // 트리 데이터 조회 함수 추가
  const fetchTreeData = async (instituteId) => {
    try {
      setSelectInstituteId(instituteId);
      const response = await getCommonDictionaryTree(instituteId);
      console.log('dictionaryTree:', response);

      if (response && Array.isArray(response)) {
        // API 데이터를 트리 데이터로 변환
        treeData.value = convertToTreeData(response);
      } else {
        console.error('API 응답이 예상 형식이 아닙니다:', response);
        // 오류 시 빈 데이터 설정
        treeData.value = [];
      }

      console.log('트리 데이터 업데이트 완료:', treeData.value);
    } catch (error) {
      console.error('공식사전 트리 데이터 로드 실패:', error);
      // 오류 시 빈 데이터 설정
      treeData.value = [];
    }
  };

  // 컴포넌트 마운트 시 실행
  onMounted(() => {
    // useMetaMngInstId와 일치하는 항목을 찾거나, 없으면 첫 번째 항목 선택
    if (metaMngInstList && metaMngInstList.length > 0) {
      const selectedInstitute =
        metaMngInstList.find(
          (institute) => institute.instituteId === useMetaMngInstId
        ) || metaMngInstList[0];

      selectInstitute.id = selectedInstitute.instituteId;
      selectInstitute.name = selectedInstitute.instituteName;

      console.log('선택된 기관:', {
        id: selectInstitute.id,
        name: selectInstitute.name,
        isMatched: selectedInstitute.instituteId === useMetaMngInstId,
      });
    } else {
      // 리스트가 비어있을 경우 기본값 사용
      selectInstitute.id = useMetaMngInstId;
      console.log('기본 기관 ID 사용 (리스트 없음):', selectInstitute.id);
    }

    fetchTreeData(selectInstitute.id);
  });
  // 트리 노드 선택 이벤트
  const onSelectNode = (selected) => {
    console.log('선택된 노드:', selected);

    // 선택 노드 저장
    setExternalDictionaryByInst(selected);
    emit('select-node', selected);
  };

  // 드래그 시작
  let dragStartObject = null;
  const handelDraggStart = (event) => {
    console.log('드래그 시작:', event.dragged.node);
    dragStartObject = event.dragged.node;

    emit('node-dragstart', event);
  };

  const hierachyChangeData = ref({
    instituteId: selectInstitute.id,
    dictionaryId: null,
    originParentDictionaryId: null,
    newParentDictionaryId: null,
  });

  // 드래그 종료
  const handelDraggEnd = (event) => {
    console.log('드래그 종료:', event);

    const externalDictionaryId = event.dragged.node.id;

    if (event.dragged.node.parent != event.dragged.parentId) {
      console.log('계층구조 변경');
    }

    hierachyChangeData.value.instituteId = selectInstitute.id;
    hierachyChangeData.value.dictionaryId = externalDictionaryId;
    hierachyChangeData.value.originParentDictionaryId = event.target.parentId;
    hierachyChangeData.value.newParentDictionaryId = event.dragged.node.parent;
    console.log('계층구조 변경 데이터:', hierachyChangeData.value);

    if (event.target.parentId !== event.dragged.node.parent) {
      // 계층구조 변경 알림 팝업 열기
      onOpenHierachyChangeWindow();
    } else {
      console.log('계층구조 변경 없음');
    }

    // onOpenHierachyChangeWindow();

    emit('node-dragend', event);
  };

  // 드롭 시 처리
  const handleNodeDrop = (event) => {
    console.log('노드 드롭:', event);

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
    } else {
      console.log('요소가 타겟 요소의 아래쪽 순서에 들어갔습니다.');
    }
    emit('node-drop', event);
  };

  const hierachyChangeView = ref(false);

  const onOpenHierachyChangeWindow = () => {
    console.log('계층구조 변경 알림');

    popInfo.value.popTitle = '계층구조 변경 알림';
    popInfo.value.popMessages =
      '공식사전 계층구조가 변경됩니다.<br> 계층구조를 변경하시겠습니까?';
    popInfo.value.confirmBtnText = '계층구조변경';
    (popInfo.value.cancelBtnText = '아니오'), // 기본 취소 버튼 텍스트
      (hierachyChangeView.value = true);
  };

  const onConfirmHierachyChange = async () => {
    console.log('계층구조 변경 확인:', hierachyChangeData.value);
    await editCommonDictionaryMapping(hierachyChangeData.value);
    console.log('계층구조 변경 확인');
    hierachyChangeView.value = false;
    fetchTreeData(selectInstitute.id);
  };

  const onCloseHierachyChangeWindow = () => {
    console.log('계층구조 변경 알림 닫기');
    fetchTreeData(selectInstitute.id);
    hierachyChangeView.value = false;
  };

  // watch 함수 수정 - 기관 변경 시 API 재호출
  watch(
    () => selectInstitute.id,
    async (newInstId) => {
      if (newInstId) {
        console.log('기관 변경됨:', newInstId);
        await fetchTreeData(newInstId);
        // 부모 컴포넌트에 기관 변경 알림
        emit('change-institute', newInstId);
      }
    }
  );

  // 저장상태 확인
  watch(externalDictionaryByInstSaveState, async (newState) => {
    if (newState) {
      console.log('공식사전 저장 상태 변경:', newState);
      // 저장 후 트리 데이터 새로고침
      setTimeout(() => {
        fetchTreeData(selectInstitute.id);
        setExternalDictionaryByInstSaveState(false); // 저장 상태 초기화
      }, 0);
      // setExternalDictionaryByInstSaveState(false); // 저장 상태 초기화
    }
  });
</script>

<style lang="scss" scoped>
  .full-contents {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .title-s {
    font-size: 16px;
    font-weight: 500;
    display: flex;
    align-items: center;
    margin-right: 15px;
  }

  .tree-wrap {
    flex: 1;
    position: relative;
    overflow: auto;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    margin-bottom: 10px;
  }

  .tree-box__absolute {
    position: absolute;
    width: 100%;
    height: calc(100% - 10px);
    overflow: auto;
    padding: 10px;
  }

  .input-form .input-table th {
    background-color: #f7f7f7;
    padding: 10px 13px 10px 1px;
    text-align: right;
    font-size: 13px;
    font-weight: 500;
    line-height: normal;
    width: 120px;
  }
</style>
