<template>
  <div class="full-contents">
    <div class="content-top">
      <div class="title-s">
        기관별 공식사전 상세 정보
        <AppTooltip
          :htmlContent="getTooltipById('externalDictionaryInstitutionDetails')"
        >
        </AppTooltip>
      </div>
    </div>
    <div class="inputs-row">
      <div class="input-top">
        <div class="title-btns__row_btween">
          <div class=""></div>
          <div style="display: flex">
            <button class="btn-s add-reg" @click="onSelectReg(0)" title="추가">
              추가
            </button>
            <button
              class="btn-s change-reg"
              @click="onSelectReg(1)"
              :disabled="dictionaryData.state === 'init' || regType === '추가'"
              title="수정"
            >
              수정
            </button>
            <button
              class="btn-s remove-reg"
              @click="onDeleteConfirm"
              :disabled="dictionaryData.state === 'init' || regType === '추가'"
              title="삭제"
            >
              삭제
            </button>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <button
              class="btn-s save-btn green"
              :disabled="regType === '조회'"
              @click="onSaveConfirm"
              title="저장"
            >
              저장
            </button>
            <button
              class="btn-s delete-btn"
              :disabled="regType === '조회'"
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
                          'regbox-select': regType === '조회',
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
                <th style="color: crimson">*공식사전명</th>
                <td>
                  <div class="td-col">
                    <div style="display: flex">
                      <div
                        style="
                          width: 92%;
                          border: 1px solid #d1c2c2;
                          height: 30px;
                          border-radius: 3px;
                        "
                      >
                        <AppStateText
                          v-model="externalDictionaryData.dictionaryName"
                        />
                      </div>
                      <div
                        class="dictionary_up_name_btn"
                        style="margin-left: 10px"
                      >
                        <button
                          class="btn-s search-btn"
                          @click="onOpenExternalDictionaryWindow"
                          :disabled="regType === '조회' || regType === '수정'"
                        >
                          검색
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <th style="color: crimson">*공식사전유형</th>
                <td>
                  <div class="td-col">
                    <input
                      class="input-text"
                      type="text"
                      v-model="externalDictionaryData.dictionaryTypeName"
                      placeholder="사전유형"
                      style="width: 8%"
                      disabled
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <th>상위공식사전명</th>
                <td>
                  <div class="td-col">
                    <div style="display: flex">
                      <div
                        style="
                          width: 92%;
                          border: 1px solid #d1c2c2;
                          height: 30px;
                          border-radius: 3px;
                        "
                      >
                        <AppStateText
                          v-model="externalDictionaryData.upDictionaryName"
                        />
                      </div>
                      <div
                        class="dictionary_up_name_btn"
                        style="margin-left: 10px"
                      >
                        <button
                          class="btn-s search-btn"
                          @click="onOpenUpExternalDictionaryWindow"
                          :disabled="regType === '조회'"
                        >
                          검색
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <!-- <tr>
                <th style="color: crimson">*공식사전설명</th>
                <td>
                  <div class="td-col">
                    <textarea
                      v-if="regType !== '조회'"
                      id="dictionaryExplain"
                      style="height: 120px; width: 100%"
                      placeholder="공식사전 설명을 입력하세요"
                      v-model="externalDictionaryData.dictionaryExplain"
                    ></textarea>
                    <div v-else style="height: 120px">
                      {{ externalDictionaryData.dictionaryExplain }}
                    </div>
                  </div>
                </td>
              </tr> -->
              <tr>
                <th>최종수정자</th>
                <td>
                  <div class="td-col">
                    {{
                      regType === '조회' ? dictionaryData.userId : writerInfo
                    }}
                  </div>
                </td>
              </tr>
              <tr>
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

    <!-- 저장 알림창 -->
    <AppDialog
      v-model:view="saveConfirmState.view"
      :title="saveConfirmState.title"
      :message="saveConfirmState.message"
      @confirm="onSave"
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
      @confirm="onDelete"
    />
  </div>

  <AppWindow
    v-model:view="externalDictionaryWindowView"
    :title="'공식사전 목록'"
    @close="onCloseExternalDictionaryWindow"
    width="800px"
    height="315px"
  >
    <ExternalDictionaryWindow
      @confirm="onSelectExternalDictionary"
      @close="onCloseExternalDictionaryWindow"
      :externalDictionaryId="
        externalDictionaryData.dictionaryName[0].dictionaryId
      "
      :searchType="searchType"
    />
  </AppWindow>
</template>

<script setup>
  import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue';
  import { useExternalDictionaryStore } from '@/stores/externalDictionary';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';

  import { useAlert } from '@/composables/alert';

  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import AppDialog from '@/components/ui/AppDialog.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';

  import {
    getCommonDictionaryTree,
    getCommonDictionaryList,
    constructCommonDictionaryMapping,
    deleteCommonDictionaryMapping,
  } from '@/utils/mflexApi/systemMng/systemManagementApi';
  import { editCommonDictionaryMapping } from '@/utils/mflexApi/systemMng/systemManagementApi';
  import ExternalDictionaryWindow from '@/components/popWindow/ExternalDictionaryWindow.vue';

  // Props 정의
  const props = defineProps({
    selectedData: {
      type: Object,
      default: () => ({}),
    },
    instituteId: {
      type: [Number, String],
      default: 0,
    },
  });

  // Emit 이벤트 정의
  const emit = defineEmits([
    'save-dictionary',
    'delete-dictionary',
    'cancel',
    'change-mode',
  ]);

  // 사용자 정보 가져오기
  const authStore = useAuthStore();
  const { userInfo } = storeToRefs(authStore);
  const { userId, userNm } = userInfo.value || { userId: '', userNm: '' };

  const { externalDictionaryByInst, selectInstituteId } = storeToRefs(
    useExternalDictionaryStore()
  );
  const { setExternalDictionaryByInstSaveState } = useExternalDictionaryStore();

  const { setAlertStatus } = useAlert();

  const { tooltipList } = storeToRefs(useHelpToolTipStore());
  const { getTooltipById } = useHelpToolTipStore();

  const searchType = ref('basic');

  // 작성자 정보
  const writerInfo = computed(() => `${userNm}(${userId})`);

  // 작업 구분 상태
  const regType = ref('추가');

  // 현재 날짜 및 시간 포맷
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8);
  const formattedDate = ref(`${dateStr} ${timeStr}`);

  const externalDictionaryData = ref({
    dictionaryId: '',
    dictionaryName: [
      {
        type: '',
        label: '',
        color: '',
        bgColor: '',
        size: 60,
      },
    ],
    upDictionaryName: [
      {
        type: '',
        label: '',
        color: '',
        bgColor: '',
        size: 60,
      },
    ],
    dictionaryTypeName: '',
    dictionaryFontColorName: '',
    dictionaryBackGroundColorName: '',
    dictionaryExplain: '',
    userId: userId,
    username: userNm,
  });

  // 사전 데이터
  const dictionaryData = ref({
    dictionaryId: '',
    dictionaryName: '',
    dictionaryTypeCode: '30',
    dictionaryTypeName: '공식사전',
    dictionaryFontColorName: '#FFFFFF',
    dictionaryBackGroundColorName: '#F0823E',
    dictionaryExplain: '',
    userId: userId,
    username: userNm,
    state: 'init',
  });

  // 알림창 상태
  const saveConfirmState = reactive({
    view: false,
    title: '저장 확인',
    message: '작업 내용을 저장하시겠습니까?',
  });

  const cancelConfirmState = reactive({
    view: false,
    title: '취소 확인',
    message: '작업 내용을 취소 하시겠습니까?',
  });

  const deleteConfirmState = reactive({
    view: false,
    title: '삭제 확인',
    message:
      '정말 공식사전을 삭제 하시겠습니까?<br><span style="color:red">(삭제 후 초기 화면으로 돌아갑니다.)</span>',
  });

  // 작업 구분 변경 함수
  const onSelectReg = (value) => {
    switch (value) {
      case 0:
        regType.value = '추가';
        dictionaryData.value.state = 'add';
        initializeFormForAdd();
        break;
      case 1:
        regType.value = '수정';
        dictionaryData.value.state = 'edit';
        dictionaryData.value.action = '수정';
        break;
      case 2:
        regType.value = '삭제';
        break;
      case 3:
        regType.value = '조회';
        dictionaryData.value.state = 'lookup';
        break;
    }

    emit('change-mode', regType.value);
  };

  // 폼 초기화 함수 (추가 모드용)
  const initializeFormForAdd = () => {
    // 현재 조회 중인 사전 정보를 임시 저장
    const currentDictionary = { ...externalDictionaryData.value };

    // 새로운 사전 데이터로 초기화
    externalDictionaryData.value = {
      dictionaryId: '',
      dictionaryName: [
        {
          type: '',
          label: '',
          color: '',
          bgColor: '',
          size: 60,
        },
      ],
      upDictionaryName: [
        {
          type: '',
          label: '',
          color: '',
          bgColor: '',
          size: 60,
        },
      ],
      dictionaryTypeName: '',
      dictionaryExplain: '',
      userId: userId,
      username: userNm,
    };

    // 이전에 조회 중이던 사전이 있고, dictionaryName에 유효한 값이 있으면
    if (
      currentDictionary &&
      currentDictionary.dictionaryName &&
      currentDictionary.dictionaryName[0] &&
      currentDictionary.dictionaryName[0].label
    ) {
      // 상위공식사전명으로 현재 조회 중이던 사전명 설정
      externalDictionaryData.value.upDictionaryName = [
        {
          dictionaryId: currentDictionary.dictionaryName[0].dictionaryId || '',
          type: currentDictionary.dictionaryName[0].type || '',
          label: currentDictionary.dictionaryName[0].label || '',
          color: currentDictionary.dictionaryName[0].color || '',
          bgColor: currentDictionary.dictionaryName[0].bgColor || '',
          size: 60,
        },
      ];

      // 사전유형도 유지
      externalDictionaryData.value.dictionaryTypeName =
        currentDictionary.dictionaryTypeName || '';
    }

    updateFormattedDate();
  };

  // 날짜 업데이트 함수
  const updateFormattedDate = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8);
    formattedDate.value = `${dateStr} ${timeStr}`;
  };

  // 확인 다이얼로그 함수들
  const onSaveConfirm = () => {
    saveConfirmState.view = true;
  };

  const onCancelConfirm = () => {
    cancelConfirmState.view = true;
  };

  const onDeleteConfirm = () => {
    deleteConfirmState.view = true;
  };

  // 액션 처리 함수들
  const onSave = async () => {
    // 저장 데이터 준비

    // 유효성 검증
    if (!externalDictionaryData.value.dictionaryName) {
      setAlertStatus({
        view: true,
        message: '공식사전명은 필수 입력 항목입니다.',
      });
      return;
    }

    const data = {
      instituteId: selectInstituteId.value,
      dictionaryId: externalDictionaryData.value.dictionaryName[0].dictionaryId
        ? externalDictionaryData.value.dictionaryName[0].dictionaryId || null
        : null,
      parentDictionaryId: externalDictionaryData.value.upDictionaryName[0]
        ? externalDictionaryData.value.upDictionaryName[0].dictionaryId || null
        : null,
    };

    if (regType.value === '수정') {
      const data = {
        instituteId: selectInstituteId.value,
        dictionaryId:
          externalDictionaryData.value.dictionaryName[0].dictionaryId,
        originParentDictionaryId:
          externalDictionaryData.value.originParentDictionaryId,
        newParentDictionaryId: externalDictionaryData.value.upDictionaryName[0]
          .dictionaryId
          ? externalDictionaryData.value.upDictionaryName[0].dictionaryId ||
            null
          : null,
      };
      await editCommonDictionaryMapping(data);
      // setExternalDictionaryByInstSaveState(true);
    } else {
      console.log('onSave data:', data);
      await constructCommonDictionaryMapping(data);
    }

    // 부모 컴포넌트에 저장 이벤트 발생
    // emit('save-dictionary', saveData);
    // 작업 완료 후 조회 모드로 변경
    onSelectReg(3);
    setExternalDictionaryByInstSaveState(true);
  };

  const onDelete = async () => {
    const data = {
      instituteId: selectInstituteId.value,
      dictionaryId: externalDictionaryData.value.dictionaryId,
    };

    await deleteCommonDictionaryMapping(data);

    // // 초기화
    initializeFormForAdd();
    onSelectReg(0);

    setExternalDictionaryByInstSaveState(true);
  };

  const onReCancel = () => {
    if (regType.value === '수정' && props.selectedData?.dictionaryId) {
      // 수정 취소 시 원본 데이터로 복원
      loadDictionaryDetails(props.selectedData);
      onSelectReg(3);
    } else {
      // 추가 취소 시 초기화
      initializeFormForAdd();
    }

    emit('cancel');
  };

  // 선택된 사전 데이터가 변경될 때 상세 정보 불러오기
  const loadDictionaryDetails = (data) => {
    if (!data || !data.dictionaryId) return;

    externalDictionaryData.value = {
      dictionaryId: data.dictionaryId,
      dictionaryName: data.dictionaryName || '',
      dictionaryTypeCode: data.dictionaryTypeCode || '30',
      dictionaryTypeName: data.dictionaryTypeName || '공식사전',
      dictionaryFontColorName: data.dictionaryFontColorName || '#FFFFFF',
      dictionaryBackGroundColorName:
        data.dictionaryBackGroundColorName || '#F0823E',
      dictionaryExplain: data.dictionaryExplain || '',
      userId: data.userId || userId,
      username: data.username || userNm,
      state: 'lookup',
    };

    // 수정일 업데이트
    if (data.updateDateTime) {
      formattedDate.value = data.updateDateTime;
    } else {
      updateFormattedDate();
    }

    // 조회 모드로 설정
    onSelectReg(3);
  };

  const bindDetails = (data) => {
    console.log('bindDetails', data);

    externalDictionaryData.value.dictionaryName = [
      {
        dictionaryId: data.dictionaryId,
        type: data.type,
        label: data.text,
        color: data.color,
        bgColor: data.bgColor,
        size: 60,
      },
    ];

    externalDictionaryData.value.originParentDictionaryId = data.parent;
    console.log('commonDictionaryList : ', commonDictionaryList.value);

    const upDictionary = commonDictionaryList.value.find(
      (item) => item.dictionaryId === parseInt(data.parent)
    );

    console.log('upDictionary', upDictionary);

    externalDictionaryData.value.upDictionaryName = [
      {
        dictionaryId: upDictionary ? upDictionary.dictionaryId : '',
        type: upDictionary ? upDictionary.dictionaryTypeName : '',
        label: upDictionary ? upDictionary.dictionaryName : '',
        color: upDictionary
          ? upDictionary.dictionaryTypeForegroundColorName
          : '',
        bgColor: upDictionary
          ? upDictionary.dictionaryTypeBackgroundColorName
          : '',
        size: 60,
      },
    ];
    externalDictionaryData.value.dictionaryTypeName = data.type;
    externalDictionaryData.value.dictionaryId = data.dictionaryId;
    externalDictionaryData.value.dictionaryExplain =
      data.dictionaryExplain || '';

    // 조회 모드로 설정
    onSelectReg(3);
  };

  const externalDictionaryWindowView = ref(false);
  const onOpenExternalDictionaryWindow = () => {
    searchType.value = 'basic';
    externalDictionaryWindowView.value = true;
  };
  const onOpenUpExternalDictionaryWindow = () => {
    searchType.value = 'up';
    externalDictionaryWindowView.value = true;
  };
  const onCloseExternalDictionaryWindow = () => {
    externalDictionaryWindowView.value = false;
  };

  const onSelectExternalDictionary = (data, searchType) => {
    console.log('onSelectExternalDictionary', data);

    if (searchType === 'basic') {
      externalDictionaryData.value.dictionaryName = [
        {
          dictionaryId: data.dictionaryId,
          type: data.dictionaryTypeName,
          label: data.dictionaryName,
          color: data.dictionaryTypeForegroundColorName,
          bgColor: data.dictionaryTypeBackgroundColorName,
          size: 60,
        },
      ];
      externalDictionaryData.value.dictionaryTypeName = data.dictionaryTypeName;
    } else {
      externalDictionaryData.value.upDictionaryName = [
        {
          dictionaryId: data.dictionaryId,
          type: data.dictionaryTypeName,
          label: data.dictionaryName,
          color: data.dictionaryTypeForegroundColorName,
          bgColor: data.dictionaryTypeBackgroundColorName,
          size: 60,
        },
      ];
    }
  };

  const commonDictionaryList = ref([]);

  // 컴포넌트 마운트 시 초기화
  onMounted(async () => {
    commonDictionaryList.value = await getCommonDictionaryList();
    console.log('commonDictionaryList', commonDictionaryList.value);

    if (props.selectedData?.dictionaryId) {
      loadDictionaryDetails(props.selectedData);
    } else {
      initializeFormForAdd();
    }
  });

  // props.selectedData가 변경될 때마다 상세 정보 로드
  watch(
    () => props.selectedData,
    (newData) => {
      if (newData && Object.keys(newData).length > 0) {
        loadDictionaryDetails(newData);
      }
    },
    { deep: true, immediate: true }
  );

  // watch 내부
  watch(
    () => externalDictionaryByInst.value,
    async (newValue) => {
      if (newValue && Object.keys(newValue).length > 0) {
        console.log('externalDictionaryByInst 변경 감지');
        console.log('newValue', newValue);

        if (newValue.id === '1') {
          await onSelectReg(0);
          externalDictionaryData.value.upDictionaryName = [
            {
              dictionaryId: null,
              type: '',
              label: '',
              color: '',
              bgColor: '',
              size: 0,
              state: 'root',
            },
          ];

          return;
        }
        await nextTick(); // DOM 업데이트 보장
        bindDetails(newValue);
      }
    },
    { deep: true, immediate: true }
  );
</script>

<style lang="scss" scoped>
  .full-contents {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding-right: 10px;
    padding-left: 10px;
  }

  .content-top {
    display: flex;
    align-items: center;
    padding: 10px 0;
  }

  .title-s {
    font-size: 16px;
    font-weight: 500;
    display: flex;
    align-items: center;
    margin-right: 15px;
  }

  .inputs-row {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .input-top {
    margin-bottom: 10px;
  }

  .inputs-wrap {
    flex: 1;
    overflow: auto;
  }

  .title-btns__row_btween {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .input-form .input-table {
    width: 100%;
    border-collapse: collapse;

    th {
      background-color: #f7f7f7;
      padding: 10px 13px 10px 1px;
      text-align: right;
      font-size: 13px;
      font-weight: 500;
      line-height: normal;
      width: 120px;
      border: 1px solid #ddd;
    }

    td {
      // padding: 10px;
      border: 1px solid #ddd;
    }
  }

  .td-col {
    display: flex;
    // align-items: center;
  }

  .col-row {
    display: flex;
    align-items: center;
    // gap: 20px;
  }

  .select-pickers {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .application-category__icon-s {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px 12px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    min-width: 80px;
    text-align: center;
  }

  // .regbox {
  //   padding: 5px 15px;
  //   border-radius: 4px;
  //   font-weight: 500;
  //   min-width: 80px;
  //   text-align: center;

  //   &-select {
  //     background-color: #e0e0e0;
  //     color: #333;
  //   }

  //   &-add {
  //     background-color: #4caf50;
  //     color: white;
  //   }

  //   &-change {
  //     background-color: #2196f3;
  //     color: white;
  //   }
  // }

  // .btn-s {
  //   padding: 5px 12px;
  //   margin-left: 5px;
  //   border-radius: 4px;
  //   font-size: 13px;
  //   background-color: #f5f5f5;
  //   border: 1px solid #ddd;
  //   cursor: pointer;

  //   &:hover {
  //     background-color: #e0e0e0;
  //   }

  //   &:disabled {
  //     opacity: 0.5;
  //     cursor: not-allowed;
  //   }

  //   &.green {
  //     background-color: #4caf50;
  //     color: white;
  //     border: none;

  //     &:hover {
  //       background-color: #45a049;
  //     }
  //   }
  // }

  .label {
    font-size: 12px;
    margin-right: 5px;
  }
</style>
