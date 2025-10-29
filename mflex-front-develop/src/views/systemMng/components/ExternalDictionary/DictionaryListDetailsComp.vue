<template>
  <div class="full-contents">
    <div class="content-top">
      <div class="title-s">
        공식사전 상세 정보
        <AppTooltip :htmlContent="getTooltipById('externalDictionaryDetails')">
        </AppTooltip>
      </div>
    </div>
    <div class="inputs-row">
      <div class="input-top">
        <div class="title-btns__row_btween">
          <div style="display: flex; justify-content: flex-end">
            <button class="btn-s add-reg" @click="onSelectReg(0)" title="추가">
              추가
            </button>
            <button
              v-if="!dictionaryData.discardYn"
              class="btn-s change-reg"
              @click="onSelectReg(1)"
              :disabled="dictionaryData.state === 'init' || regType === '추가'"
              title="수정"
            >
              수정
            </button>
            <button
              v-if="!dictionaryData.discardYn"
              class="btn-s remove-reg"
              @click="onDiscardConfirm"
              :disabled="dictionaryData.state === 'init' || regType === '추가'"
              title="삭제"
            >
              폐기
            </button>
            <button
              v-if="dictionaryData.discardYn"
              class="btn-s restore-reg"
              @click="onRestoreConfirm"
              title="복구등록"
            >
              복구등록
            </button>
            <button
              v-if="dictionaryData.discardYn"
              class="btn-s delete-reg"
              @click="onDeleteConfirm"
              title="삭제등록"
            >
              삭제등록
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
                    <input
                      v-if="regType !== '조회'"
                      id="dictionaryName"
                      class="input-text"
                      type="text"
                      v-model="dictionaryData.dictionaryName"
                      placeholder="공식사전명을 입력하세요"
                      style="width: 100%"
                    />
                    <div v-else>
                      {{ dictionaryData.dictionaryName }}
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <th style="color: crimson">*공식사전유형</th>
                <td>
                  <input
                    id="dictionaryName"
                    class="input-text"
                    type="text"
                    v-model="dictionaryData.dictionaryTypeName"
                    placeholder="공식사전유형을 입력하세요"
                    style="width: 20%"
                    :disabled="regType === '조회'"
                  />
                </td>
              </tr>
              <tr>
                <th style="color: crimson">*공식사전아이콘</th>
                <td>
                  <div class="td-col">
                    <div class="col-row">
                      <div
                        class="application-category__icon-s"
                        :style="{
                          color: dictionaryData.dictionaryFontColorName,
                          backgroundColor:
                            dictionaryData.dictionaryBackGroundColorName,
                        }"
                      >
                        <span v-text="dictionaryData.dictionaryTypeName"></span>
                      </div>
                      <div v-if="regType !== '조회'" class="select-pickers">
                        <span class="label">글자색</span>
                        <color-picker
                          v-model:pureColor="
                            dictionaryData.dictionaryFontColorName
                          "
                          format="hex"
                          :disableHistory="true"
                          :disableAlpha="true"
                          pickerType="chrome"
                        />
                        <span class="label">배경색</span>
                        <color-picker
                          v-model:pureColor="
                            dictionaryData.dictionaryBackGroundColorName
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
                <th style="color: crimson">*공식사전설명</th>
                <td>
                  <div class="td-col">
                    <textarea
                      v-if="regType !== '조회'"
                      id="dictionaryExplain"
                      style="height: 120px; width: 100%"
                      placeholder="공식사전 설명을 입력하세요"
                      v-model="dictionaryData.dictionaryExplain"
                    ></textarea>
                    <div v-else style="height: 120px">
                      {{ dictionaryData.dictionaryExplain }}
                    </div>
                  </div>
                </td>
              </tr>
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
                  <div class="td-col">{{ dictionaryData.updateDateTime }}</div>
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
      @confirm="handleSaveConfirm"
    />

    <!-- 취소 확인창 -->
    <AppDialog
      v-model:view="cancelConfirmState.view"
      :title="cancelConfirmState.title"
      :message="cancelConfirmState.message"
      @confirm="onReCancel"
    />

    <!-- 폐기 알림창 -->
    <AppDialog
      v-model:view="discardConfirmState.view"
      :title="discardConfirmState.title"
      :message="discardConfirmState.message"
      @confirm="onDiscard"
    />
  </div>

  <!-- 복구 알림창 -->
  <AppDialog
    v-model:view="restoreConfirmState.view"
    :title="restoreConfirmState.title"
    :message="restoreConfirmState.message"
    @confirm="onRestore"
  />

  <!-- 삭제 알림창 -->
  <AppDialog
    v-model:view="deleteConfirmState.view"
    :title="deleteConfirmState.title"
    :message="deleteConfirmState.message"
    @confirm="onDelete"
  />
</template>

<script setup>
  import { ref, reactive, computed, watch } from 'vue';
  import { ColorPicker } from 'vue3-colorpicker';
  import { useAlert } from '@/composables/alert';
  import { useAuthStore } from '@/stores/auth';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { storeToRefs } from 'pinia';

  import { useExternalDictionaryStore } from '@/stores/externalDictionary';
  import {
    addCommonDictionary,
    discardCommonDictionary,
    editCommonDictionary,
    restoreCommonDictionary,
    deleteCommonDictionary,
  } from '@/utils/mflexApi/systemMng/systemManagementApi';

  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import AppDialog from '@/components/ui/AppDialog.vue';
  // 사용자 정보 가져오기
  const authStore = useAuthStore();
  const { userInfo } = storeToRefs(authStore);
  const { userId, userNm } = userInfo.value || { userId: '', userNm: '' };

  const { tooltipList } = storeToRefs(useHelpToolTipStore());
  const { getTooltipById } = useHelpToolTipStore();

  const { setSaveState, setNewDictionaryId } = useExternalDictionaryStore();
  const { selectExternalDictionary } = storeToRefs(
    useExternalDictionaryStore()
  );

  const { setAlertStatus } = useAlert();

  // 작성자 정보
  const writerInfo = computed(() => `${userNm}(${userId})`);

  // 작업 구분 상태
  const regType = ref('추가');

  // 현재 날짜 및 시간 포맷
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8);
  const formattedDate = ref(`${dateStr} ${timeStr}`);

  // 사전 데이터
  const dictionaryData = ref({
    dictionaryId: '',
    dictionaryName: '',
    dictionaryTypeName: '',
    dictionaryFontColorName: '#FFFFFF',
    dictionaryBackGroundColorName: '#F0823E',
    dictionaryExplain: '',
    userId: userId,
    username: userNm,
    updateDateTime: formattedDate.value,
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

  const discardConfirmState = reactive({
    view: false,
    title: '폐기 확인',
    message: '작업 내용을 폐기 하시겠습니까?',
  });

  const restoreConfirmState = reactive({
    view: false,
    title: '복구 확인',
    message: '정말 공식사전을 복구 하시겠습니까?',
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
        break;
      case 4:
        regType.value = '복구';
        break;
      case 5:
        regType.value = '삭제';
        break;
    }
  };

  // 폼 초기화 함수 (추가 모드용)
  const initializeFormForAdd = () => {
    dictionaryData.value = {
      dictionaryId: '',
      dictionaryName: '',
      dictionaryTypeName: '',
      dictionaryFontColorName: '#FFFFFF',
      dictionaryBackGroundColorName: '#F0823E',
      dictionaryExplain: '',
      userId: userId,
      username: userNm,
      state: 'add',
      action: '추가',
      updateDateTime: formattedDate.value,
    };

    // dictionaryTypeSelected.value = '30';
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
    const resultValidation = validationCheck(dictionaryData.value);

    if (resultValidation) {
      saveConfirmState.view = true;
      return;
    } else {
      return;
    }
  };

  const onCancelConfirm = () => {
    cancelConfirmState.view = true;
  };

  const onDeleteConfirm = () => {
    deleteConfirmState.view = true;
  };

  const onRestoreConfirm = () => {
    restoreConfirmState.view = true;
  };

  const onDiscardConfirm = () => {
    discardConfirmState.view = true;
  };

  const onDiscard = async () => {
    await discardCommonDictionary(dictionaryData.value.dictionaryId);

    setSaveState(true);
  };

  const validationCheck = (data) => {
    // 유효성 검증
    if (!data.dictionaryName) {
      setAlertStatus({
        view: true,
        message: '공식사전명은 필수 입력 항목입니다.',
      });

      return;
    }

    if (!data.dictionaryExplain) {
      setAlertStatus({
        view: true,
        message: '공식사전 설명은 필수 입력 항목입니다.',
      });

      return;
    }

    return true;
  };

  // 액션 처리 함수들
  const onSave = async () => {
    console.log('regType: ', regType.value);
    // 저장 데이터 준비
    const saveData = {
      dictionaryName: dictionaryData.value.dictionaryName,
      dictionaryTypeName: dictionaryData.value.dictionaryTypeName,
      dictionaryTypeForegroundColorName:
        dictionaryData.value.dictionaryFontColorName,
      dictionaryTypeBackgroundColorName:
        dictionaryData.value.dictionaryBackGroundColorName,
      dictionaryExplain: dictionaryData.value.dictionaryExplain,
    };

    console.log('saveData:', saveData);

    console.log('유효성검증 실행 후...');

    const newDictionaryId = await addCommonDictionary(saveData);

    setNewDictionaryId(newDictionaryId);

    // 작업 완료 후 조회 모드로 변경
    onSelectReg(3);
    setSaveState(true);
  };

  const onEdit = async () => {
    console.log('regType: ', regType.value);
    // 수정 데이터 준비
    const editData = {
      dictionaryId: dictionaryData.value.dictionaryId,
      dictionaryName: dictionaryData.value.dictionaryName,
      dictionaryTypeName: dictionaryData.value.dictionaryTypeName,
      dictionaryTypeForegroundColorName:
        dictionaryData.value.dictionaryFontColorName,
      dictionaryTypeBackgroundColorName:
        dictionaryData.value.dictionaryBackGroundColorName,
      dictionaryExplain: dictionaryData.value.dictionaryExplain,
    };

    console.log('editData:', editData);

    await editCommonDictionary(editData);
    setNewDictionaryId(dictionaryData.value.dictionaryId);

    setSaveState(true);
  };

  const handleSaveConfirm = () => {
    if (regType.value === '추가') {
      onSave();
    } else if (regType.value === '수정') {
      onEdit();
    }
  };

  const onDelete = async () => {
    // if (dictionaryData.value.dictionaryId) {
    //   emit('delete-dictionary', {
    //     dictionaryId: dictionaryData.value.dictionaryId,
    //   });
    // }
    // 초기화
    await deleteCommonDictionary(dictionaryData.value.dictionaryId);
    setSaveState(true);
    // initializeFormForAdd();
    // onSelectReg(0);
  };

  const onRestore = async () => {
    // 복구 등록 처리
    await restoreCommonDictionary(dictionaryData.value.dictionaryId);
    setSaveState(true);
  };

  const onReCancel = () => {
    if (regType.value === '수정') {
      // 수정 취소 시 원본 데이터로 복원
      // loadDictionaryDetails(props.selectedData);
      onSelectReg(3);
    } else {
      // 추가 취소 시 초기화
      initializeFormForAdd();
    }
  };

  const bindDetailsData = (data) => {
    console.log('bindDetailsData:', data);

    dictionaryData.value = {
      dictionaryId: data.dictionaryId,
      dictionaryName: data.externalDictionaryName[0].label,
      dictionaryTypeName: data.dictionaryType,
      dictionaryFontColorName: data.externalDictionaryName[0].color,
      dictionaryBackGroundColorName: data.externalDictionaryName[0].bgColor,
      dictionaryExplain: data.dictionaryExplain,
      discardYn: data.discardYn,
      userId: data.updateId || userId,
      username: data.updateName || userNm,
      updateDateTime: data.updateDateTime,
    };

    onSelectReg(3);
  };

  watch(
    () => selectExternalDictionary.value, // .value 추가
    (newValue) => {
      // 외부 사전 선택 시 처리
      console.log('selectExternalDictionary:', newValue);

      // 상세조회 API 호출
      bindDetailsData(newValue);

      // console.log('selectExternalDictionary:', newValue);
      // if (newValue && Object.keys(newValue).length > 0) {
      //   loadDictionaryDetails(newValue);
      // }
    },
    { deep: true } // 깊은 감시 옵션 추가
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
    justify-content: flex-end;
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
