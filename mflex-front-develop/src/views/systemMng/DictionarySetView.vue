<template>
  <section
    :class="{
      'contents-wrap': swipper === true,
      'contents-wrap-none-history': swipper === false,
    }"
  >
    <div class="content-box">
      <div class="content-area">
        <div class="search-row"></div>
        <div class="content-row">
          <div class="bg-box">
            <div class="tab-inner pb0">
              <DragCol
                width="100%"
                height="100%"
                :leftPercent="50"
                :sliderWidth="10"
              >
                <template #left>
                  <div class="full-contents">
                    <div class="content-top">
                      <div class="title-s">
                        사전 목록
                        <AppTooltip
                          :htmlContent="getTooltipById('dictionaryList')"
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
                        >메뉴를 Drag & Drop 으로 원하는 위치로 이동하거나 순서를
                        수정할 수 있습니다.</span
                      >
                    </div>
                  </div>
                </template>
                <template #right>
                  <div class="full-contents pl10">
                    <div class="content-top">
                      <div class="title-s">
                        사전 상세 정보
                        <AppTooltip
                          :htmlContent="getTooltipById('dictionaryItemDetails')"
                        >
                        </AppTooltip>
                      </div>
                    </div>
                    <div class="inputs-row">
                      <div class="input-top">
                        <div class="title-btns__row_btween">
                          <div class=""></div>
                          <div style="display: flex">
                            <button
                              class="btn-s add-reg"
                              @click="onSelectReg(0)"
                              title="추가"
                            >
                              추가
                            </button>
                            <button
                              class="btn-s change-reg"
                              @click="onSelectReg(1)"
                              :disabled="
                                selectedData.dictionaryId == 'id' ||
                                dctnryData.state == 'init' ||
                                regType == '추가'
                              "
                              title="수정"
                            >
                              수정
                            </button>
                            <button
                              class="btn-s remove-reg"
                              @click="onDeleteConfirm"
                              :disabled="
                                selectedData.dictionaryId == 'id' ||
                                dctnryData.state == 'init' ||
                                regType == '추가'
                              "
                              title="삭제"
                            >
                              삭제
                            </button>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            <button
                              class="btn-s save-btn green"
                              :disabled="regType == '조회'"
                              @click="onSaveConfirm"
                              title="저장"
                            >
                              저장
                            </button>
                            <button
                              class="btn-s delete-btn"
                              :disabled="regType == '조회'"
                              @click="onCancelConfirm"
                              title="취소"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="inputs-wrap">
                        <div class="input-form">
                          <table class="input-table">
                            <colgroup>
                              <col width="20%" />
                              <col width="" />
                            </colgroup>
                            <tbody>
                              <tr>
                                <th>작업구분</th>
                                <td>
                                  <div class="td-col">
                                    <div
                                      :class="[
                                        'regbox',
                                        {
                                          'regbox-select': regType == '조회',
                                          'regbox-add': regType === '추가',
                                          'regbox-change': regType === '수정',
                                        },
                                      ]"
                                    >
                                      <span v-text="regType"></span>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <th style="color: crimson">*사전명</th>
                                <td>
                                  <div class="td-col">
                                    <input
                                      v-if="regType !== '조회'"
                                      id="dictionaryName"
                                      class="input-text"
                                      type="text"
                                      v-model="dctnryData.dictionaryName"
                                      placeholder=""
                                      style="width: 100%"
                                    />
                                    <div v-if="regType == '조회'">
                                      {{ dctnryData.dictionaryName }}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <th style="color: crimson">*사전유형</th>
                                <td>
                                  <div class="td-col">
                                    <select
                                      v-if="regType !== '조회'"
                                      class="input-select"
                                      v-model="wordTypeSelected"
                                      style="width: 150px"
                                    >
                                      <option
                                        v-for="option in wordTypeOptions"
                                        :value="option.code"
                                        :key="option.code"
                                      >
                                        {{ option.name }}
                                      </option>
                                    </select>
                                    <span v-if="regType == '조회'">{{
                                      dctnryData.dictionaryTypeName
                                    }}</span>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <th style="color: crimson">*사전아이콘</th>
                                <td>
                                  <div class="td-col">
                                    <div class="col-row">
                                      <div
                                        class="application-category__icon-s"
                                        :style="{
                                          color:
                                            dctnryData.dictionaryFontColorName,
                                          backgroundColor:
                                            dctnryData.dictionaryBackGroundColorName,
                                        }"
                                        @click="iconTest"
                                      >
                                        <span
                                          v-if="
                                            dctnryData.state == 'init' ||
                                            dctnryData.state == 'lookup' ||
                                            regType == '추가' ||
                                            regType == '수정'
                                          "
                                          v-text="wordTypeText"
                                        ></span>
                                        <span
                                          v-else-if="
                                            regType == '조회' ||
                                            selectedData.type != ''
                                          "
                                          v-text="dctnryData.dictionaryTypeName"
                                        ></span>
                                      </div>
                                      <div
                                        v-if="regType !== '조회'"
                                        class="select-pickers"
                                      >
                                        <span class="label">글자색</span>
                                        <color-picker
                                          v-model:pureColor="
                                            dctnryData.dictionaryFontColorName
                                          "
                                          format="hex"
                                          :disableHistory="true"
                                          :disableAlpha="true"
                                          pickerType="chrome"
                                        />
                                        <span class="label">배경색</span>
                                        <color-picker
                                          v-model:pureColor="
                                            dctnryData.dictionaryBackGroundColorName
                                          "
                                          format="hex"
                                          :disableHistory="true"
                                          :disableAlpha="true"
                                          pickerType="chrome"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <th>상위사전명</th>
                                <td>
                                  <div class="td-col">
                                    <div class="col-row dictionary_up_div">
                                      <div :class="dictionaryUpNameDivClass()">
                                        <div
                                          class="application-category__icon-s"
                                          :style="{
                                            color:
                                              selectUpDictionaryData.dictionaryFontColorName,
                                            backgroundColor:
                                              selectUpDictionaryData.dictionaryBackGroundColorName,
                                            display:
                                              dctnryData.state == 'kpl' ||
                                              (dctnryData.state == 'select' &&
                                                dctnryData.dictionaryParent ==
                                                  0) ||
                                              dctnryData.state == 'select' ||
                                              (globalParentDictionaryData &&
                                                globalParentDictionaryData.id ==
                                                  0) ||
                                              (dctnryData.state == 'edit' &&
                                                dctnryData.dictionaryParent ==
                                                  0) ||
                                              selectUpDictionaryData.dictionaryParentName ==
                                                '사전 홈'
                                                ? 'none'
                                                : '',
                                          }"
                                        >
                                          {{
                                            selectUpDictionaryData.parentType
                                          }}
                                        </div>
                                        <!-- 상위사전명 출력 -->
                                        <span class="dictionary_up_name_span">
                                          {{
                                            selectUpDictionaryData.dictionaryParentName
                                          }}
                                        </span>
                                      </div>
                                      <div class="dictionary_up_name_btn">
                                        <button
                                          class="btn-s search-btn"
                                          v-if="
                                            regType == '추가' ||
                                            regType == '수정'
                                          "
                                          @click="
                                            onOpenSearchUpDictionary(
                                              $event,
                                              selectedDictionaryId
                                            )
                                          "
                                        >
                                          검색
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <th style="color: crimson">*사전설명</th>
                                <td>
                                  <div class="td-col">
                                    <textarea
                                      v-if="regType !== '조회'"
                                      id="dictionaryExplain"
                                      style="height: 120px"
                                      placeholder="설명을 입력하세요"
                                      v-model="dctnryData.dictionaryExplain"
                                    ></textarea>
                                    <div
                                      v-else-if="regType == '조회'"
                                      style="height: 120px"
                                    >
                                      {{ dctnryData.dictionaryExplain }}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <th style="color: crimson">*사전등록기관명</th>
                                <td>
                                  <div class="td-col">
                                    <span>
                                      {{
                                        selectedInstName
                                          ? selectedInstName.instituteName
                                          : ''
                                      }}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <th>최종수정자</th>
                                <td>
                                  <div
                                    v-if="
                                      regType == '추가' || regType == '수정'
                                    "
                                    class="td-col"
                                  >
                                    {{ writerInfo }}
                                  </div>
                                  <div v-if="regType == '조회'" class="td-col">
                                    {{ dctnryData.userId }}
                                  </div>
                                </td>
                              </tr>
                              <tr v-if="regType == '수정' || regType == '조회'">
                                <th>최종수정일시</th>
                                <td>
                                  <div class="td-col">{{ formattedDate }}</div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </DragCol>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 저장 알림창 -->
    <AppDialog
      v-model:view="saveConfirmState.view"
      :title="saveConfirmState.title"
      :message="saveConfirmState.message"
      @confirm="onSave(selectedDictionaryId)"
    />
    <!-- 취소 확인창 -->
    <AppDialog
      v-model:view="cancelConfirmState.view"
      :title="cancelConfirmState.title"
      :message="cancelConfirmState.message"
      @confirm="onReCancel"
    />
    <!-- 삭제 알림창 -->
    <AppDialog
      v-model:view="deleteConfirmState.view"
      :title="deleteConfirmState.title"
      :message="deleteConfirmState.message"
      @confirm="onDelete(selectedDictionaryId)"
    />
    <!-- 사전계층 구조 변경 알림창-->
    <AppDialog
      v-model:view="changeHierachyConfirmState.view"
      :title="changeHierachyConfirmState.title"
      :message="changeHierachyConfirmState.message"
      @confirm="onChangeHierachy(changeHierachyConfirmState.eventObj)"
      @cancel="onChangeHierachyClose"
    >
    </AppDialog>

    <Alert />

    <!--상위사전 검색 팝업-->
    <AppWindow
      :view="searchUpDictionary"
      :left="searchUpDictionaryLeft"
      :top="searchUpDictionaryTop"
      @close="onCloseSearchUpDictionary"
      width="800px"
      height="315px"
    >
      <SearchUpDictionaryWindow
        :list="parentDictionaryList"
        @confirm="onSelectParentDictionary"
        @close="onCloseSearchUpDictionary"
      >
      </SearchUpDictionaryWindow>
    </AppWindow>
  </section>
</template>

<script setup>
  import { onBeforeMount, reactive, ref, computed, nextTick, watch } from 'vue';
  import { DragCol } from 'vue-resizer';
  import Alert from '@/components/ui/AppAlert.vue';
  import AppTree from '@/components/ui/AppTree.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import { useSwipperStore } from '@/stores/swipper';
  import { ColorPicker } from 'vue3-colorpicker';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import SearchUpDictionaryWindow from '@/components/popWindow/SearchUpDictionaryWindow.vue';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import {
    insertValidation, // 검증체크
    addDictionary, // 사전 등록 API
    removeDictionary, // 사전 삭제 API
    dictionaryDetail, // 사전 상세 조회 API
    setDctnryData, // dctnryData 할당 함수
    editDictionary, // 사전 수정  API
    dictionaryChangeLevel, // 사전 단순 순서 변경 API
    findParentNode, //부모요소 찾기 API
    getDictionaryTypeList, // 사전 유형 조회 API
    getLowerInstituteList, // 하위 사전등록기관 목록 조회 API
    getParentDictionaryList, // 상위 사전 목록 조회 API
  } from '../../utils/mflexApi/dictionarySet';

  import {
    getDictionaryTree, // 사전 트리 조회
    constructDictionaryTree, // 사전 트리 생성
    getInstituteAdminListByUser, // 사용자별 기관 관리자 목록 조회
  } from '@/utils/mflexApi/systemMng/systemManagementApi';

  defineOptions({ name: 'DictionarySetView' });

  const { swipper } = storeToRefs(useSwipperStore());

  const { tooltipList } = storeToRefs(useHelpToolTipStore());
  const { getTooltipById } = useHelpToolTipStore();

  let searchUpDictionaryLeft;
  let searchUpDictionaryTop;

  let parentDictionaryList; // 상위 사전 목록 리스트

  // 상위사전 팝업 출력
  const searchUpDictionary = ref(false);
  const onOpenSearchUpDictionary = async (event, dictionaryId) => {
    parentDictionaryList = await getParentDictionaryList(
      selectInstitute.id,
      dictionaryId
    );

    const buttonRect = event.target.getBoundingClientRect();
    const left = 430.0625;
    const top = 50.96875;

    // AppWindow 컴포넌트에 left, top 값 전달
    searchUpDictionaryLeft = left;
    searchUpDictionaryTop = top;

    searchUpDictionary.value = true;
  };

  const treeRoots = ref({ roots: ['1'] });
  const treeData = ref({});

  // 상위사전 전역저장 객체
  let globalParentDictionaryData;

  const onSelectParentDictionary = (SelectParentDictionary) => {
    globalParentDictionaryData = SelectParentDictionary;

    // 상위사전 id 설정
    // 추가 시
    selectUpDictionaryData.value.dictionaryParent =
      SelectParentDictionary.dictionaryId;
    dctnryData.value.dictionaryId = SelectParentDictionary.dictionaryId;
    dctnryData.value.dictionaryParent = SelectParentDictionary.dictionaryId;
    // 상위사전 배경색 설정
    selectUpDictionaryData.value.dictionaryBackGroundColorName =
      SelectParentDictionary.wordName[0].bgColor;
    // 상위사전 폰트색 설정
    selectUpDictionaryData.value.dictionaryFontColorName =
      SelectParentDictionary.wordName[0].color;
    // 상위사전 사전유형 설정
    selectUpDictionaryData.value.parentType =
      SelectParentDictionary.wordName[0].type;
    // 상위사전명 설정
    selectUpDictionaryData.value.dictionaryParentName =
      SelectParentDictionary.wordName[0].label;
  };
  const onCloseSearchUpDictionary = () => {
    searchUpDictionary.value = false;
  };

  // 상위사전 input 스타일 바인딩
  const dictionaryUpNameDivClass = () => {
    return regType.value === '추가' || regType.value === '수정'
      ? 'dictionary_up_name_div'
      : '';
  };

  const handelDraggStart = (event) => {
    console.log('drag start =====', event);
    dragStartObject = event.dragged.node;
    console.log(
      '드래그 시작 treeData =========================',
      treeData.value
    );
  };

  // 트리 dragStart
  let dragStartObject;
  // 트리 DragEnd
  const handelDraggEnd = (event) => {
    //event.preventDefault(); // 기본 동작 중지
    //event.stopPropagation(); // 이벤트 전파 중지

    console.log('node End', event);

    let eventObj = event;
    console.log('eventObj =================');
    let dictionaryId = event.dragged.node.id;
    console.log('dictionaryId =================', dictionaryId);

    if (event.dragged.node.parent != event.dragged.node.dictionaryParent) {
      onChangeHierachyConfirm(eventObj);
    }
  };

  // drop 시 순서 변경
  const handleNodeDrop = (event) => {
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

      let changeData = {
        instituteId: selectInstitute.id,
        dictionaryId: nodes[draggedNode.id].dictionaryId,
        order: nodes[targetNode].order - 5,
      };

      dictionaryChangeLevel(changeData);
    } else {
      console.log('요소가 타겟 요소의 아래쪽 순서에 들어갔습니다.');

      let changeData = {
        instituteId: selectInstitute.id,
        dictionaryId: nodes[draggedNode.id].dictionaryId,
        order: nodes[targetNode].order + 5,
      };

      dictionaryChangeLevel(changeData);
    }
  };

  let dictionaryTypeList; // 사전 유형 리스트
  const instituteList = ref([]); // 사전 관리 기관 리스트

  let initWordTypeText = ref('');
  // 데이터 리스트 조회
  // 트리 구조 데이터 삽입
  onBeforeMount(async () => {
    const instituteAdminList = await getInstituteAdminListByUser();
    console.log(
      'instituteAdminList ============================',
      instituteAdminList
    );
    metaMngInstList.value = [];
    metaMngInstList.value = instituteAdminList;

    // 메타데이터 리스트의 첫 번째 항목으로 기관 ID 설정
    if (instituteAdminList && instituteAdminList.length > 0) {
      // useMetaMngInstId와 일치하는 항목을 찾거나, 없으면 첫 번째 항목 선택
      const selectedInstitute =
        instituteAdminList.find(
          (institute) => institute.instituteId === useMetaMngInstId
        ) || instituteAdminList[0];

      selectInstitute.id = selectedInstitute.instituteId;
      console.log('선택된 기관:', {
        id: selectInstitute.id,
        name: selectedInstitute.instituteName,
        isMatched: selectedInstitute.instituteId === useMetaMngInstId,
      });
    } else {
      // 리스트가 비어있을 경우 기본값 사용
      selectInstitute.id = useMetaMngInstId;
      console.log('기본 기관 ID 사용 (리스트 없음):', selectInstitute.id);
    }
    // console.log(
    //   'instituteAdminList ============================',
    //   instituteAdminList
    // );
    // // 선택된 기관 이름 설정
    // const selectedInst = metaMngInstList.find(
    //   (items) => items.instituteId === selectInstitute.id
    // );

    // console.log('selectedInst ============================', selectedInst);

    // if (selectedInst) {
    //   selectInstitute.id = selectedInst.instituteId;
    //   selectInstitute.name = selectedInst.instituteName;
    // }

    //let dictionaryListData = await getDictionaryList();

    // 사전유형 목록 조회 API 호출
    dictionaryTypeList = await getDictionaryTypeList();

    // 사전등록 기관 목록 조회 API 호출
    // instituteList.value = await getinstituteList();

    initWordTypeText.value = dictionaryTypeList[0].name;

    wordTypeOptions = [...dictionaryTypeList];
    // 초기 사전 유형 설정

    console.log(
      'wordTypeOptions ============================',
      wordTypeOptions
    );
    console.log(
      'wordTypeSelected.value =====================',
      wordTypeSelected.value
    );
    console.log('instituteList ============================', instituteList);

    // 사전 조회 API 호출
    let dictinaryListDt = await getDictionaryTree(selectInstitute.id);
    // 최초 상위사전 명 설정
    dctnryData.value.dictionaryParent = dictinaryListDt[0].dictionaryId;
    selectUpDictionaryData.value.parentId = dictinaryListDt[0].dictionaryId;
    selectUpDictionaryData.value.parentChild = dictinaryListDt[0].children;
    selectUpDictionaryData.value.dictionaryParentName =
      dictinaryListDt[0].dictionaryName;
    selectUpDictionaryData.value.dictionaryFontColorName =
      dictinaryListDt[0].dictionaryTypeForegroundColorName;
    selectUpDictionaryData.value.dictionaryBackGroundColorName =
      dictinaryListDt[0].dictionaryTypeBackgroundColorName;
    selectUpDictionaryData.value.dictionaryTypeCode =
      dictinaryListDt[0].dictionaryTypeName;

    // API 사전조회 트리생성
    const constructTree = constructDictionaryTree(dictinaryListDt);

    treeData.value = constructTree;
    console.log('treeData.value : ', treeData.value);
  });

  // store username 가져오기
  const authStore = useAuthStore();
  const {
    userMetaMngInstList,
    userInfo,
    userStngInfo,
    userInstituteAdminList,
  } = storeToRefs(authStore);
  const { userId, userNm } = userInfo.value;

  console.log('userInstitute-기관어드민 : ', userInstituteAdminList.value);
  const metaMngInstList = userInstituteAdminList.value;
  const { useMetaMngInstId } = userStngInfo.value;
  // selectInstitute를 ref 대신 reactive로 초기화
  const selectInstitute = reactive({
    id: useMetaMngInstId, // 초기값으로 현재 사용자의 기관 ID 설정
    name: '',
  });

  const selectedInstName = computed(() => {
    const selectedInst = metaMngInstList.find(
      (items) => items.instituteId === selectInstitute.id
    );
    return selectedInst;
  });

  console.log(
    'selectedInstName ============================',
    selectedInstName.value
  );

  // 상위사전 저장
  let selectUpDictionaryData = ref({
    parentId: 0,
    parentChild: [],
    dictionaryParentName: '',
    dictionaryParent: 0,
    parentType: '',
    dictionaryFontColorName: '#ffffff',
    dictionaryBackGroundColorName: '#ffffff',
    dictionaryTypeCode: '',
    dictionaryTypeName: '',
    dictionaryExplain: '', // 사전설명
    userId: userId, // 사용자Id
    username: userNm, // 사용자이름
  });

  // 상위사전데이터 분할저장
  let parentNodeNmaeSet = ref({
    dictionaryFontColorName: '#ffffff',
    dictionaryBackGroundColorName: '#ffffff',
    parentType: '',
    dictionaryParentName: '',
    dictionaryTypeCode: '',
    dictionaryTypeName: '',
  });

  // 선택된 데이터 전역 저장
  let selectedData = ref({});

  const selectNode = ref(null);

  // 생성, 수정 시 항목
  const onSelectNewNode = (newNode) => {
    if (selectNode.value) {
      selectNode.value.setAttribute('data-selected', 0);
    }
    newNode.setAttribute('data-selected', 1);
    selectNode.value = newNode;
  };

  //트리 항목 선택
  const onSelectNode = async (selected) => {
    selectedData.value = selected;
    selectedDictionaryId = selectedData.value.dictionaryId;

    console.log('selectedData ==========================', selectedData.value);
    console.log(
      'selectedDictionaryId ==========================',
      selectedDictionaryId
    );

    if (!selectedDictionaryId) {
      console.log('사전 홈 선택 시 ==========================');

      console.log('userId : ', userId);
      console.log('username : ', userNm);
      onSelectReg(0);
      dctnryData.value = {
        action: regType.value, // 작업구분
        dictionaryId: '',
        dictionaryName: '', //사전명
        dictionaryChild: [],
        dictionaryParent: 0,
        dictionaryParentName: '',
        dictionaryTypeCode: wordTypeSelected.value, //사전유형코드
        dictionaryTypeName: '', // <<<<< 변경 필요
        dictionaryFontColorName: dicIconColor.color, //사전폰트색상
        dictionaryBackGroundColorName: dicIconColor.bgColor, //사전배경색상
        dictionaryExplain: '', // 사전설명
        /* userId: userId, // 사용자Id
        username: userNm, // 사용자이름 */
        regdate: selected.regdate, // 등록일자
        state: 'init',
      };
      selectUpDictionaryData.value.dictionaryBackGroundColorName = '';
      selectUpDictionaryData.value.dictionaryParent = 0;
      writerInfo = `${userNm}(${userId})`;
      formattedDate.value = `${dateStr} ${timeStr}`;

      // 기관 목록 재조회
      // instituteList.value = await getinstituteList();
    } else {
      // instituteList.value = await getinstituteList();
      // 사전 상세조회 API 호출
      const dictionaryDetailData = await dictionaryDetail(
        selectedDictionaryId,
        selectInstitute.id
      );
      console.log(
        '사전 상세조회 데이터 ===================',
        dictionaryDetailData
      );

      // 상세조회 시 데이터 초기화
      dctnryData.value = setDctnryData(dictionaryDetailData);

      console.log('dctnryData.value ====================', dctnryData.value);

      // 기관명 select 값 설정
      instituteSelected.value = dctnryData.value.managementInstituteId;
      // 기관명 설정 managementInstituteName
      const managementInstituteName = instituteList.value.find(
        (institute) => institute.id === dctnryData.value.managementInstituteId
      );

      // 기관 id 가 없을때, 기관명 컬럼 공백
      if (managementInstituteName == null) {
        dctnryData.value.managementInstituteName = '';
      } else {
        dctnryData.value.managementInstituteName = managementInstituteName.name;
      }

      console.log(
        '항목 선택 시 dctnryData.value ========================',
        dctnryData.value
      );

      //wordTypeText.value = dctnryData.value.dictionaryTypeName;

      selectUpDictionaryData.value.dictionaryParent =
        dctnryData.value.dictionaryParent;
      selectUpDictionaryData.value.dictionaryParentName =
        dctnryData.value.dictionaryParentName;
      selectUpDictionaryData.value.parentType = dctnryData.value.parentTypeName;

      //let dictionaryParentName;
      if (dctnryData.value.dictionaryParent == 0) {
        dctnryData.value.dictionaryParentName = '사전 홈';

        selectUpDictionaryData.value.dictionaryParentName =
          dctnryData.value.dictionaryParentName;

        dctnryData.value.state = 'select';
      } else {
        selectUpDictionaryData.value.dictionaryBackGroundColorName =
          dctnryData.value.parentBackgroundColor;
        selectUpDictionaryData.value.dictionaryFontColorName =
          dctnryData.value.parentFontColor;
        selectUpDictionaryData.value.dictionaryTypeCode =
          dctnryData.value.parentTypeCode;
        selectUpDictionaryData.value.dictionaryTypeName =
          dctnryData.value.parentTypeName;

        parentNodeNmaeSet.value.dictionaryParent =
          dctnryData.value.dictionaryParent;
        parentNodeNmaeSet.value.dictionaryParentName =
          dctnryData.value.dictionaryParentName;
        parentNodeNmaeSet.value.parentType = dctnryData.value.parentTypeName;
      }
      // 신청구분 조회
      onSelectReg(3);
    }
  };

  // 사전등록기관명 value
  let instituteSelected = ref(1);

  //사전유형
  let wordTypeSelected = ref('10');
  let wordTypeOptions = reactive([]);

  const wordTypeText = computed(() => {
    const selectedOption = wordTypeOptions.find(
      (option) => option.code === wordTypeSelected.value
    );
    return selectedOption ? selectedOption.name : `${initWordTypeText.value}`;
  });

  //사전 아이콘
  const dicIconColor = reactive({
    color: '#ffffff',
    bgColor: '#f0823e',
  });

  //저장
  const saveConfirmState = reactive({
    view: false,
    message: '작업 내용을 저장하시겠습니까?',
  });
  const onSaveConfirm = () => {
    saveConfirmState.view = true;
  };

  // 최근 등록 데이터
  let recentUpdataDictionaryData;

  // 저장버튼 클릭 시 input box 의 데이터를 json 형식으로 console 에 출력
  const onSave = async (selectId) => {
    // 등록할 데이터
    let dictionaryData;
    // 등록 후 등록된 데이터를 담을 객체
    let updatedDictionaryData;

    // 신규 등록 시
    if (regType.value == '추가') {
      console.log('추가 함수 실행 ============================');

      if (dctnryData.value.dictinaryId == null) {
        dctnryData.value.dictinaryId = 0;
      }

      dictionaryData = {
        instituteId: selectInstitute.id,
        dictionaryName: dctnryData.value.dictionaryName,
        parentDictionaryId: dctnryData.value.dictionaryId,
        dictionaryTypeCode: wordTypeSelected.value,
        dictionaryTypeForegroundColorName:
          dctnryData.value.dictionaryFontColorName,
        dictionaryTypeBackgroundColorName:
          dctnryData.value.dictionaryBackGroundColorName,
        // type: {
        //   code: wordTypeSelected.value,
        //   name: wordTypeText.value,
        //   fontColor: dctnryData.value.dictionaryFontColorName,
        //   backgroundColor: dctnryData.value.dictionaryBackGroundColorName,
        // },
        description: dctnryData.value.dictionaryExplain,
        order: 10,
      };
      // 사전명 입력 검증
      const result = insertValidation(dictionaryData);
      if (!result) {
        return;
      }

      let addResult = await addDictionary(dictionaryData);

      if (addResult) {
        // 재조회 시간차
        setTimeout(async () => {
          const dictionaryListData = await getDictionaryTree(
            selectInstitute.id
          );
          const constructTree = constructDictionaryTree(dictionaryListData);
          treeData.value = constructTree;

          console.log('사전 등록 성공 ==========================');

          updatedDictionaryData = await dictionaryDetail(
            addResult.returnId,
            selectInstitute.id
          );

          dctnryData.value = setDctnryData(updatedDictionaryData);

          // const managementInstituteName = instituteList.value.find(
          //   (institute) =>
          //     institute.id === updatedDictionaryData.managementInstituteId
          // );

          // // 기관 id 가 없을때, 기관명 컬럼 공백
          // if (managementInstituteName == null) {
          //   dctnryData.value.managementInstituteName = '';
          // } else {
          //   dctnryData.value.managementInstituteName =
          //     managementInstituteName.name;
          // }

          // dctnryData.value.dictionaryTypeName = `${updatedDictionaryData.type.name}`;
          // dctnryData.value.userId = updatedDictionaryData.modifier;
          // console.log('wordTypeText ========================', wordTypeText);

          // // 추가 후 선택된 사전 id 등록된 사전 id로 변경
          // selectedDictionaryId = updatedDictionaryData.id;
          // console.log(
          //   '등록 후 선택된 id ============================',
          //   selectId
          // );
          // dctnryData.value.dictionaryId = updatedDictionaryData.id;

          // // 추가 후 상위사전폰트 초기화
          // selectUpDictionaryData.value.dictionaryFontColorName =
          //   updatedDictionaryData.parent.type.fontColor;
          // // 추가 후 상위사전배경 초기화
          // selectUpDictionaryData.value.dictionaryBackGroundColorName =
          //   updatedDictionaryData.parent.type.backgroundColor;
          // // 추가 후 상위사전타입 초기화
          // selectUpDictionaryData.value.parentType =
          //   updatedDictionaryData.parent.type.name;

          // // 등록 시 선택 데이터
          // selectedData.value.bgColor =
          //   updatedDictionaryData.type.backgroundColor;
          // selectedData.value.text = updatedDictionaryData.name;
          // selectedData.value.type = updatedDictionaryData.type.name;
          // selectedData.value.dictionaryParent = updatedDictionaryData.parent.id;
          // 부모 요소 select 효과
          nextTick(() => {
            // 모든 노드의 data-selected 속성을 0으로 초기화
            const allNodes = document.querySelectorAll('.node-wrapper');
            allNodes.forEach((node) => node.setAttribute('data-selected', 0));

            let newNode = document.getElementById(`id${addResult.returnId}`);
            console.log('새 노드 ===========================', newNode);
            let parentElement = newNode.parentNode;
            parentElement.setAttribute('data-selected', 1);

            /* // 사전유형명 설정
            dctnryData.value.dictionaryTypeName =
              updatedDictionaryData.type.name; */
          });
        }, 100);

        // 사전 등록 시 select 효과
      } else {
        console.error(error);
      }
    } else if (regType.value == '수정') {
      console.log('수정 함수 호출 ===================');

      dictionaryData = {
        instituteId: selectInstitute.id,
        dictionaryName: dctnryData.value.dictionaryName,
        parentDictionaryId: dctnryData.value.dictionaryParent,
        dictionaryTypeCode: wordTypeSelected.value,
        dictionaryTypeForegroundColorName:
          dctnryData.value.dictionaryFontColorName,
        dictionaryTypeBackgroundColorName:
          dctnryData.value.dictionaryBackGroundColorName,
        description: dctnryData.value.dictionaryExplain,
      };

      // 수정 함수 실행
      let editResult = await editDictionary(selectId, dictionaryData);

      // 사전명 입력 검증
      const result = insertValidation(dictionaryData);

      if (!result) {
        return;
      }

      if (editResult) {
        setTimeout(async () => {
          const dictionaryListData = await getDictionaryTree(
            selectInstitute.id
          );
          const constructTree = constructDictionaryTree(dictionaryListData);
          treeData.value = constructTree;
          console.log('사전 수정 성공 ==========================');
          updatedDictionaryData = await dictionaryDetail(
            editResult.returnId,
            selectInstitute.id
          );

          dctnryData.value = setDctnryData(updatedDictionaryData);

          // 부모 요소 select 효과
          nextTick(() => {
            // 모든 노드의 data-selected 속성을 0으로 초기화
            const allNodes = document.querySelectorAll('.node-wrapper');
            allNodes.forEach((node) => node.setAttribute('data-selected', 0));

            console.log(
              'editResult.returnId =====================',
              editResult.returnId
            );
            let newNode = document.getElementById(`id${editResult.returnId}`);
            console.log('새 노드 ===========================', newNode);
            let parentElement = newNode.parentNode;
            parentElement.setAttribute('data-selected', 1);
          });
        }, 50);
      } else {
        console.error(error);
        console.error('사전 수정 API 오류 =======');
      }
    }

    console.log('onSave 실행 ===');
    console.log('onSave dctnryData 출력 ===', dctnryData.value);
    dctnryData.value.dictionaryTypeCode = wordTypeSelected.value;

    dctnryData.value.state = 'lookup';

    // let savedDictionary = dictionaryListObject[dictionaryListObject.length - 1];
    // console.log('저장 된 객체 출력 savedDictionary : ', savedDictionary);

    onSelectReg(3);
    console.log(dctnryData.value.dictionaryId);
  };

  // 계층 구조 변경
  const onChangeHierachy = async (eventObj) => {
    // 사전 계층구조 변경
    console.log('dragStartObject', dragStartObject);
    console.log('eventObj', eventObj);
    console.log(
      '드래그 종료 treeData =========================',
      treeData.value
    );

    let dictionaryId = eventObj.dragged.node.dictionaryId;

    // 부모 노드 ID (문자열)
    const parentNodeId = eventObj.dragged.node.parent;
    console.log('부모 노드 ID:', parentNodeId);

    // treeData에서 부모 노드의 dictionaryId 찾기
    let parentDictionaryId = null;
    if (parentNodeId && treeData.value[parentNodeId]) {
      parentDictionaryId = treeData.value[parentNodeId].dictionaryId;
      console.log('부모 노드의 dictionaryId:', parentDictionaryId);
    } else {
      // 루트 노드인 경우 또는 부모를 찾을 수 없는 경우
      parentDictionaryId = 0; // 기본값으로 0 지정 (사전 홈)
      console.log(
        '부모 노드를 찾을 수 없거나 루트 노드입니다. dictionaryId를 0으로 설정합니다.'
      );
    }

    const rowDictionaryData = await dictionaryDetail(
      dictionaryId,
      selectInstitute.id
    );
    console.log('사전 상세 조회:', rowDictionaryData);

    // 없는 값은 기존 값 유지하도록
    let dictionaryData = {
      instituteId: selectInstitute.id,
      dictionaryName: rowDictionaryData.dictionaryName,
      parentDictionaryId: parentDictionaryId, // 찾은 부모 사전 ID 사용
      dictionaryTypeCode: rowDictionaryData.dictionaryTypeCode,
      dictionaryTypeForegroundColorName:
        rowDictionaryData.dictionaryTypeForegroundColorName,
      dictionaryTypeBackgroundColorName:
        rowDictionaryData.dictionaryTypeBackgroundColorName,
      description: rowDictionaryData.description,
    };

    console.log('사전 계층구조 변경 데이터:', dictionaryData);

    let editResult = editDictionary(dictionaryId, dictionaryData);

    if (editResult) {
      setTimeout(async () => {
        const dictionaryListData = await getDictionaryTree(selectInstitute.id);
        const constructTree = constructDictionaryTree(dictionaryListData);

        treeData.value = constructTree;
        console.log('사전 계층구조 변경 성공');
      }, 100);
    }
  };

  const onChangeHierachyClose = async () => {
    setTimeout(async () => {
      const dictionaryListData = await getDictionaryTree(selectInstitute.id);
      const constructTree = constructDictionaryTree(dictionaryListData);
      treeData.value = constructTree;
      changeHierachyConfirmState.view = false;
    }, 50);
  };

  const onChangeHierachyConfirm = (eventObj) => {
    changeHierachyConfirmState.view = true;
    changeHierachyConfirmState.eventObj = eventObj;
  };

  const onCancel = () => {
    console.log('취소 실행 확인');
    setTimeout(() => {
      onCancelConfirm();
    }, 300);
  };

  //초기화 확인
  const cancelConfirmState = reactive({
    view: false,
    message: '작업 내용을 취소 하시겠습니까?',
  });
  const onCancelConfirm = () => {
    cancelConfirmState.view = true;
  };
  //
  const onReCancel = async () => {
    console.log('초기화 실행');

    // 수정 상태일 때 초기화
    if (regType.value == '수정') {
      // 현재 id 로 재조회, 후 해당 항목에 맞게 수정 초기화 세팅
      console.log('selecet id', selectedData.value);
      const dictionaryDetailData = await dictionaryDetail(
        selectedDictionaryId,
        selectInstitute.id
      );
      console.log(
        '사전 상세조회 데이터 ===================',
        dictionaryDetailData
      );
      dctnryData.value = {
        action: regType.value,
        dictionaryName: dictionaryDetailData.name,
        dictionaryTypeCode: dictionaryDetailData.type.code,
        dictionaryFontColorName: dictionaryDetailData.type.fontColor,
        dictionaryBackGroundColorName:
          dictionaryDetailData.type.backgroundColor,
        dictionaryExplain: dictionaryDetailData.description, // 사전설명
        userId: dictionaryDetailData.modifier,
        managementInstituteId: dictionaryDetailData.managementInstituteId,
        parentBackgroundColor: dictionaryDetailData.parent.type.backgroundColor,
        parentFontColor: dictionaryDetailData.parent.type.fontColor,
      };

      /* if (dctnryData.value.dictionaryParentName != '사전 홈') {
        dctnryData.value.dictionaryParentName =
          dictionaryDetailData.parent.name;
      } */

      // 사전 유형 설정
      wordTypeSelected.value = dictionaryDetailData.type.code;

      if (dictionaryDetailData.parent.name == null) {
        selectUpDictionaryData.value.dictionaryParentName = '사전 홈';
      } else {
        selectUpDictionaryData.value.dictionaryFontColorName =
          dictionaryDetailData.parent.type.fontColor;
        selectUpDictionaryData.value.dictionaryBackGroundColorName =
          dictionaryDetailData.parent.type.backgroundColor;
        selectUpDictionaryData.value.dictionaryTypeCode =
          dictionaryDetailData.parent.type.code;
        selectUpDictionaryData.value.dictionaryParentName =
          dictionaryDetailData.parent.name;
        selectUpDictionaryData.value.parentType =
          dictionaryDetailData.parent.type.name;
      }
      instituteSelected.value = dictionaryDetailData.managementInstituteId;

      // 기관명 설정 managementInstituteName

      console.log('instituteList.value ======================', instituteList);
      const managementInstituteName = instituteList.value.find(
        (institute) => institute.id === dctnryData.value.managementInstituteId
      );

      // 기관 id 가 없을때, 기관명 컬럼 공백
      if (managementInstituteName == null) {
        dctnryData.value.managementInstituteName = '';
      } else {
        dctnryData.value.managementInstituteName = managementInstituteName.name;
      }

      console.log(
        'managementInstituteName =======================',
        managementInstituteName
      );
    } else if (dctnryData.value.state != 'init') {
      const dictionaryDetailData = await dictionaryDetail(
        selectedDictionaryId,
        selectInstitute.id
      );
      console.log(
        '사전 상세조회 데이터 ===================',
        dictionaryDetailData
      );

      dctnryData.value = {
        action: regType.value,
        dictionaryName: '', //사전명,
        dictionaryChild: [],
        dictionaryTypeCode: (wordTypeSelected.value = '10'), //사전유형코드
        dictionaryId: dictionaryDetailData.id,
        dictionaryFontColorName: '#ffffff', //사전폰트색상
        dictionaryBackGroundColorName: '#f0823e', //사전배경색상
        userId: userId, // 사용자Id
        username: userNm, // 사용자이름
        regdate: formattedDate.value, // 등록일자
      };
    } else {
      // 추가 상태일 때 초기화
      dctnryData.value = {
        action: regType.value,
        //action: (regType.value = '추가'), // 작업구분
        dictionaryName: '', //사전명
        dictionaryChild: [],
        dictionaryParent: null,
        dictionaryTypeCode: (wordTypeSelected.value = '10'), //사전유형코드
        dictionaryTypeName: '',
        dictionaryFontColorName: '#ffffff', //사전폰트색상
        dictionaryBackGroundColorName: '#f0823e', //사전배경색상
        dictionaryExplain: '', // 사전설명
        userId: userId, // 사용자Id
        username: userNm, // 사용자이름
        regdate: formattedDate.value, // 등록일자
        //state: 'init',
      };
    }
  };

  // 삭제 버튼 클릭시 알림창
  const deleteConfirmState = reactive({
    view: false,
    message:
      '정말 사전을 삭제 하시겠습니까?<br><span style="color:red">(삭제 후 초기 화면으로 돌아갑니다.)</span>',
  });

  // 사전 드래그 -> 계층구조 변경 알림 Dialog
  const changeHierachyConfirmState = reactive({
    view: false,
    message: '<주의>사전 계층 구조가 변경됩니다.',
    dictionaryId: '',
    eventObj: '',
  });

  const onDeleteConfirm = () => {
    deleteConfirmState.view = true;
  };

  // 선택한 항목 ID
  let selectedDictionaryId;

  const onDelete = async (deleteId) => {
    // 삭제 API
    let removeResult = removeDictionary(
      deleteId,
      selectInstitute.id,
      treeData.value
    );

    if (removeResult) {
      setTimeout(async () => {
        let dictionaryListData = await getDictionaryTree(selectInstitute.id);
        const constructTree = constructDictionaryTree(dictionaryListData);

        treeData.value = constructTree;
      }, 100);
    } else {
      console.error(error);
    }

    //let data = deleteDictionary(deleteId);

    // 삭제 후 초기화
    onSelectReg(0);
    selectUpDictionaryData.value.dictionaryParentName = '';
    selectUpDictionaryData.value.dictionaryParent = 0;
    selectUpDictionaryData.value.dictionaryFontColorName = '#ffffff';
    selectUpDictionaryData.value.dictionaryBackGroundColorName = '#ffffff';
    selectUpDictionaryData.value.parentType = '';

    dctnryData.value = {
      action: regType.value, // 작업구분
      dictionaryId: 0,
      dictionaryName: '', //사전명
      dictionaryChild: [],
      dictionaryParent: 0,
      dictionaryParentName: '',
      dictionaryTypeCode: wordTypeSelected.value, //사전유형코드
      dictionaryTypeName: '정부표준',
      dictionaryFontColorName: dicIconColor.color, //사전폰트색상
      dictionaryBackGroundColorName: dicIconColor.bgColor, //사전배경색상
      dictionaryExplain: '', // 사전설명
      userId: userId, // 사용자ID
      username: userNm, // 사용자이름
      regdate: formattedDate.value, // 등록일자
      state: 'init',
    };
    writerInfo = `${userId}(${userNm})`;
    formattedDate.value = `${dateStr} ${timeStr}`;

    // 선택했던 항목 데이터(배경색) 초기화
    selectedData.value = {
      bgColor: '#ffffff',
    };

    console.log('selectedData =============================', selectedData);
  };

  // 기능 상태값 구분
  let regType = ref('추가');

  // 버튼 클릭 시 신청 구분 수정 함수
  const onSelectReg = async (value) => {
    console.log('dctnryData ==================', dctnryData.value);
    console.log('상태값 : ', value);
    if (value == 0) {
      regType.value = '추가';
      console.log('상태값 : ', regType.value);
      dctnryData.value.state = 'add';

      console.log;
      const instituteParams = {
        instituteId: dctnryData.value.managementInstituteId,
      };
      const lowerInstituteList = await getLowerInstituteList(instituteParams);
      console.log('lowerInstituteList : ', lowerInstituteList);

      instituteList.value = lowerInstituteList;

      // 항목 선택 후 입력 폼 초기화 세팅
      // 초기화면 상위사전명 검색 issue
      if (dctnryData.value.dictionaryId == null) {
        selectUpDictionaryData.value.parentType = '사전 홈';
      } else {
        /* selectUpDictionaryData.value.dictionaryFontColorName =
          dctnryData.value.dictionaryFontColorName; */
        selectUpDictionaryData.value.dictionaryFontColorName =
          selectedData.value.color;

        console.log('selectedData ========================== ', selectedData);

        selectUpDictionaryData.value.dictionaryBackGroundColorName =
          selectedData.value.bgColor;
        selectUpDictionaryData.value.dictionaryParentName =
          selectedData.value.text;
        selectUpDictionaryData.value.parentType = selectedData.value.type;
      }

      dctnryData.value.action = '추가';
      dctnryData.value.dictionaryName = '';
      dctnryData.value.dictionaryExplain = '';
      //dctnryData.value.dictionaryTypeName = wordTypeText.value;
      dctnryData.value.dictionaryTypeCode = wordTypeSelected.value = '10';
      dctnryData.value.dictionaryBackGroundColorName = '#F0823E';
      dctnryData.value.dictionaryFontColorName = '#ffffff';
      instituteSelected.value = 0;
    } else if (value == 1) {
      console.log('selectedData ========================== ', selectedData);

      if (dctnryData.value.dictionaryParent == 0) {
        // 사전 홈 하위 노드 선택 후 수정 버튼 클릭 시
        dctnryData.value.state = 'edit';
        regType.value = '수정';
        selectUpDictionaryData.value.dictionaryBackGroundColorName = '#e00909';
        wordTypeSelected.value = selectedData.value.typeCode;
        selectUpDictionaryData.value.dictionaryParentName =
          dctnryData.value.dictionaryParentName;
        selectUpDictionaryData.value.parentType =
          parentNodeNmaeSet.value.parentType;
        dctnryData.value.action = '수정';
      } else {
        // 수정 클릭 시 일반
        if (dctnryData.value.dictionaryParentName == '사전 홈') {
          dctnryData.value.state = 'kpl';
          selectUpDictionaryData.value.dictionaryParentName = '사전 홈';
        } else {
          dctnryData.value.state = '';
        }
        regType.value = '수정';
        // 상태값 수정일 사전유형 수정될 수 있도록
        console.log('dctnryData ==================', dctnryData);

        wordTypeSelected.value = selectedData.value.typeCode;
        console.log('상태값 : ', regType.value);
        dctnryData.value.action = '수정';

        selectUpDictionaryData.value.dictionaryBackGroundColorName =
          dctnryData.value.parentBackgroundColor;
        selectUpDictionaryData.value.dictionaryFontColorName =
          dctnryData.value.parentFontColor;

        console.log(
          'parentNodeNmaeSet.value.dictionaryParentName ======',
          parentNodeNmaeSet.value.dictionaryParentName
        );
        selectUpDictionaryData.value.parentType =
          parentNodeNmaeSet.value.parentType;
      }
    } else if (value == 2) {
      regType.value = '삭제';
    } else if (value == 3) {
      regType.value = '조회';
    }
  };

  // 등록시간
  const regdate = new Date();

  // yyyy-mm-dd 형식
  const year = regdate.getFullYear();
  const month = String(regdate.getMonth() + 1).padStart(2, '0');
  const day = String(regdate.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  // hh:mm:ss.ms 형식
  const hours = String(regdate.getHours()).padStart(2, '0');
  const minutes = String(regdate.getMinutes()).padStart(2, '0');
  const seconds = String(regdate.getSeconds()).padStart(2, '0');
  const milliseconds = String(regdate.getMilliseconds()).padStart(3, '0');
  const timeStr = `${hours}:${minutes}:${seconds}.${milliseconds}`;

  // 최종 형식: yyyy-mm-dd hh:mm:ss.ms
  const formattedDate = ref(`${dateStr} ${timeStr}`);

  // 추가등록
  // (기본 미선택)입력된 데이터 객체
  const dctnryData = ref({
    action: regType.value, // 작업구분
    dictionaryName: '', //사전명
    dictionaryChild: [],
    dictionaryParent: 0,
    dictionaryParentName: '',
    dictionaryTypeCode: wordTypeSelected.value, //사전유형코드
    dictionaryTypeName: wordTypeText.value,
    dictionaryFontColorName: dicIconColor.color, //사전폰트색상
    dictionaryBackGroundColorName: dicIconColor.bgColor, //사전배경색상
    dictionaryExplain: '', // 사전설명
    userId: userId, // 사용자Id
    username: userNm, // 사용자이름
    regdate: formattedDate.value, // 등록일자
    managementInstituteId: '',
    managementInstituteName: '',
    state: 'init',
  });

  // 작성자명
  let writerInfo = `${userNm}(${userId})`;

  // 기관 변경 감지 및 데이터 새로 불러오기
  watch(
    () => selectInstitute.id,
    async (newInstId) => {
      if (newInstId) {
        console.log('기관 변경됨:', newInstId);
        try {
          // 변경된 기관 ID로 사전 트리 데이터 새로 불러오기
          const dictionaryListData = await getDictionaryTree(newInstId);
          const constructTree = constructDictionaryTree(dictionaryListData);
          treeData.value = constructTree;

          // 선택 초기화
          dctnryData.value = {
            action: (regType.value = '추가'), // 작업구분
            dictionaryId: 0,
            dictionaryName: '', //사전명
            dictionaryChild: [],
            dictionaryParent: 0,
            dictionaryParentName: '',
            dictionaryTypeCode: wordTypeSelected.value, //사전유형코드
            dictionaryTypeName: '정부표준',
            dictionaryFontColorName: dicIconColor.color, //사전폰트색상
            dictionaryBackGroundColorName: dicIconColor.bgColor, //사전배경색상
            dictionaryExplain: '', // 사전설명
            userId: userId, // 사용자ID
            username: userNm, // 사용자이름
            regdate: formattedDate.value, // 등록일자
            state: 'init',
          };

          // 상위 사전 정보 초기화
          selectUpDictionaryData.value.dictionaryParentName = '사전 홈';
          selectUpDictionaryData.value.dictionaryParent = 0;
          selectUpDictionaryData.value.dictionaryFontColorName = '#ffffff';
          selectUpDictionaryData.value.dictionaryBackGroundColorName =
            '#ffffff';
          selectUpDictionaryData.value.parentType = '';

          console.log('기관 변경에 따른 데이터 로드 완료');
        } catch (error) {
          console.error('기관 변경 후 데이터 로드 오류:', error);
        }
      }
    },
    { immediate: false }
  );
</script>

<style scoped>
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
