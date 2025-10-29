<template>
  <div class="tab-inner pb0">
    <DragCol width="100%" height="100%" :leftPercent="35" :sliderWidth="10">
      <template #left>
        <div class="full-contents">
          <div class="content-top pt5">
            <div class="title-s">
              메뉴그룹
              <AppTooltip>
                <div>테스트 메세지입니다.<br />메세지를 입력하세요.</div>
              </AppTooltip>
            </div>
          </div>
          <div class="grid-wrap">
            <div class="grid-top"></div>
            <div class="grid-list">
              <AppGrid
                :rowData="rowDataMenuGroup"
                :columnDefs="columnDefsMenuGroup"
                :context="context"
                rowSelection="single"
                @rowDoubleClicked="onRowDoubleClicked"
                ref="agGrid"
              />
            </div>
          </div>
        </div>
      </template>
      <template #right>
        <div class="full-contents pl10">
          <div class="content-top pt5">
            <div class="title-s">
              메뉴그룹 상세정보
              <AppTooltip>
                <div>테스트 메세지입니다.<br />메세지를 입력하세요.</div>
              </AppTooltip>
            </div>
          </div>
          <div class="inputs-row">
            <div class="input-top">
              <div class="title-btns__row_btween">
                <div class="btns">
                  <button class="btn-s add-reg" title="신규">신규등록</button>
                  <button class="btn-s change-reg" title="수정">
                    변경등록
                  </button>
                  <button class="btn-s remove-reg" title="삭제">
                    삭제등록
                  </button>
                </div>
                <div class="btns">
                  <button class="btn-s green" @click="onSaveConfirm">
                    저장
                  </button>
                  <button class="btn-s" @click="onResetConfirm">취소</button>
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
                        <div class="td-col">조회</div>
                      </td>
                    </tr>
                    <tr>
                      <th>메뉴그룹ID</th>
                      <td>
                        <div class="td-col">
                          <input
                            class="input-text"
                            type="text"
                            placeholder=""
                            style="width: 150px"
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>메뉴그룹명</th>
                      <td>
                        <div class="td-col">
                          <input
                            class="input-text"
                            type="text"
                            placeholder=""
                            style="width: 100%"
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>메뉴그룹 설명</th>
                      <td>
                        <div class="td-col">
                          <textarea
                            style="height: 120px"
                            placeholder="설명을 입력하세요"
                          ></textarea>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>최종 수정자</th>
                      <td>
                        <div class="td-col">관리자(admin)</div>
                      </td>
                    </tr>
                    <tr>
                      <th>최종 수정일시</th>
                      <td>
                        <div class="td-col">2024-03-27 09:33:40</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="menugroup-bottom">
            <div class="grid-move__data pt20">
              <div class="grid-l">
                <div class="grid-wrap">
                  <div class="grid-top"></div>
                  <div class="grid-list">
                    <AppGrid
                      :rowData="rowDataLeft"
                      :columnDefs="columnDefsLeft"
                      :context="context"
                      rowSelection="single"
                      @rowDoubleClicked="onRowDoubleClicked"
                      ref="agGrid"
                    />
                  </div>
                </div>
              </div>
              <div class="grid-c">
                <div class="data-move__btns">
                  <button class="btn-s arrow-right">
                    <i class="icon"></i>
                  </button>
                  <button class="btn-s arrow-left"><i class="icon"></i></button>
                </div>
              </div>
              <div class="grid-r">
                <div class="grid-wrap">
                  <div class="grid-top"></div>
                  <div class="grid-list">
                    <AppGrid
                      :rowData="rowDataRight"
                      :columnDefs="columnDefsRight"
                      :context="context"
                      rowSelection="single"
                      @rowDoubleClicked="onRowDoubleClicked"
                      ref="agGrid"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </DragCol>
    <!-- 저장 알림창 -->
    <AppDialog
      v-model:view="saveConfirmState.view"
      :title="saveConfirmState.title"
      :message="saveConfirmState.message"
      @confirm="onSave"
      @cancel="onCancel"
    />
    <!-- 취소 확인창 -->
    <AppDialog
      v-model:view="cancelConfirmState.view"
      :title="cancelConfirmState.title"
      :message="cancelConfirmState.message"
      @confirm="onReCancel"
    />
  </div>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import {
    reactive,
    ref,
    onActivated,
    onDeactivated,
    onUnmounted,
    onMounted,
  } from 'vue';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import { DragCol } from 'vue-resizer';

  export default {
    components: {
      TypeCellRenderer,
      GridSearch,
      AppTooltip,
      DragCol,
    },

    data() {
      return {
        context: null,
        selectedRow: {},
      };
    },
    methods: {
      onRowDoubleClicked(value) {
        console.log('onRowDoubleClicked ', value);
        this.selectedRow = value;
      },
      onSearchEnter(value) {
        console.log('onSearchEnter', value);
      },
      onSearchSave() {
        console.log('onSearchSave');
      },
      onSearchSetup() {
        console.log('onSearchSetup');
      },
      onSearchRemove() {
        console.log('onSearchRemove');
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },

    setup(props) {
      const rowDataMenuGroup = reactive({});
      const columnDefsMenuGroup = reactive([
        {
          headerName: '메뉴 그룹명',
          field: 'menuGroupName',
          cellClass: 'ag-left-aligned-cell',
          width: 335,
        },
        {
          headerName: '메뉴 그룹ID',
          field: 'menuGroupId',
          cellClass: 'grid-cell-centered',
          width: 180,
        },
      ]);

      const rowDataLeft = reactive({});
      const columnDefsLeft = reactive([
        {
          headerName: '전체 메뉴명',
          field: 'allMenuName',
          cellClass: 'grid-cell-centered',
          width: 455,
        },
      ]);

      const rowDataRight = reactive({});
      const columnDefsRight = reactive([
        {
          headerName: '구성 메뉴명',
          field: 'compositionMenuName',
          cellClass: 'grid-cell-centered',
          width: 455,
        },
      ]);

      const fetchData = async () => {
        const sampleData = [];
        for (let i = 0; i < 50; i++) {
          sampleData.push({
            id: i,
            menuGroupName: '메타데이터 관리그룹',
            menuGroupId: 'MG01000000',
          });
        }
        rowDataMenuGroup.value = sampleData;

        rowDataLeft.value = [{ id: 0, allMenuName: '홈' }];

        rowDataRight.value = [
          { id: 0, compositionMenuName: '용어' },
          { id: 1, compositionMenuName: '단어' },
          { id: 2, compositionMenuName: '도메인' },
          { id: 3, compositionMenuName: '코드' },
        ];
      };

      fetchData();

      //저장
      const saveConfirmState = reactive({
        view: false,
        message: '작업 내용을 저장하시겠습니까?',
      });
      const onSaveConfirm = () => {
        saveConfirmState.view = true;
      };
      const onSave = () => {
        console.log('저장 실행');
      };
      const onCancel = () => {
        console.log('취소 실행 확인');
        setTimeout(() => {
          onCancelConfirm();
        }, 300);
      };

      //취소 확인
      const cancelConfirmState = reactive({
        view: false,
        message: '작업 내용을 취소하시겠습니까?',
      });
      const onCancelConfirm = () => {
        cancelConfirmState.view = true;
      };
      const onReCancel = () => {
        console.log('취소 실행');
      };

      // const mountedActive = ref(false);
      // onMounted(() => {
      //   console.log('그리드 onMounted 실행?');
      //   mountedActive.value = true;
      //   setTimeout(() => {
      //     setGridApis2([agGrid.value.gridApi]);
      //   }, 200);
      // });
      // onActivated(() => {
      //   if (!mountedActive.value) {
      //     console.log('그리드 onActivated 실행?');
      //     setTimeout(() => {
      //       setGridApis2([agGrid.value.gridApi]);
      //     }, 200);
      //   }
      // });

      // onDeactivated(() => {
      //   console.log('그리드 onDeactivated 실행?');
      //   setGridApis2(null);
      //   mountedActive.value = false;
      // });
      // onUnmounted(() => {
      //   console.log('그리드 onUnmounted 실행?');
      //   setGridApis2(null);
      //   mountedActive.value = false;
      // });

      return {
        rowDataMenuGroup,
        columnDefsMenuGroup,
        rowDataLeft,
        columnDefsLeft,
        rowDataRight,
        columnDefsRight,
        saveConfirmState,
        cancelConfirmState,
        onSaveConfirm,
        onSave,
        onCancel,
        onReCancel,
      };
    },
  };
</script>
