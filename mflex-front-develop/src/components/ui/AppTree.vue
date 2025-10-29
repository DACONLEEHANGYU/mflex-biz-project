<template>
  <div class="tree-area">
    <Tree
      :nodes="modelValue"
      :config="treeConfig"
      @nodeFocus="onFocus($event)"
      @nodeChecked="onCheck($event)"
      @nodeUnchecked="onUnCheck($event)"
      @nodeDragstart="onDragStart($event)"
      @nodeOver="onDragOver($event)"
      @nodeDrop="onDragDrop($event)"
      @node="onDragStart($event)"
      @nodeDragend="onDragEnd($event)"
      @nodeDragenter="onDragEnter($event)"
      @nodeDragleave="onDragLeave($event)"
    >
      <template #before-input="props">
        <i
          class="icon"
          :id="`id${props.node.dictionaryId}`"
          :style="{
            backgroundColor: props.node.bgColor,
            color: props.node.color,
            width: props.node.size + 'px',
          }"
          v-if="props.node.type"
          >{{ props.node.type }}
        </i>
        <!-- 시스템아이디가 있는 경우 -->
        <i
          v-else-if="props.node.informationSystemId"
          :id="`id${props.node.informationSystemId}`"
        ></i>
        <i
          v-else-if="props.node.instituteId"
          :id="`id${props.node.instituteId}`"
        ></i>
      </template>
    </Tree>
  </div>
</template>

<script setup>
  import { reactive, ref, watch, nextTick } from 'vue';
  import Tree from 'vue3-treeview';

  const props = defineProps({
    modelValue: {
      type: Object,
      default: () => {},
    },
    roots: {
      type: Object,
      default: () => {},
    },
    target: {
      type: String,
      default: '',
    },
    drag: {
      type: Boolean,
      default: true,
    },
    useSelected: {
      type: Boolean,
      default: true,
    },
    useCheckboxe: {
      type: Boolean,
      default: false,
    },
    clickOnlyCamera: {
      type: Boolean,
      default: false,
    },
  });

  const defaultConfig = reactive({
    roots: [],
    editable: false,
    checkboxes: props.useCheckboxe,
    checkMode: 0, //0, 1
    dragAndDrop: props.drag,
    disabled: false,
    openedIcon: {
      type: 'class',
      class: 'tree-minus',
    },
    closedIcon: {
      type: 'class',
      class: 'tree-plus',
    },
  });

  const treeConfig = reactive({ ...defaultConfig, ...props.roots });

  const emit = defineEmits([
    'selectNode',
    'checkNode',
    'unCheckNode',
    'selectNewNode',
    'nodeDragstart',
    'nodeOver',
    'nodeDrop',
    'nodeDragend',
    'nodeDragenter',
    'nodeDragleave',
  ]);

  const resetTreeSelect = () => {
    var allNode = document.querySelectorAll(`${props.target} .node-wrapper`);
    allNode.forEach((node) => {
      node.setAttribute('data-selected', 0);
    });
  };

  const focusRoot = () => {
    console.log('focusRoot 실행 ============================= ');
    nextTick(() => {
      const rootNode = document.querySelector(
        `${props.target} .tree-content > .node-wrapper`
      );
      console.log('rootNode ============================= ', rootNode);
      console.log('props.roots ============================= ', props.roots);
      const root = document.querySelector('.node-wrapper');
      console.log('root ============================= ', root);
      resetAll();
      if (root) {
        resetTreeSelect();
        root.setAttribute('data-selected', 1);
        selectNode.value = root;
        emit('selectNode', root);
      }
    });
  };

  //DragStart
  const onDragStart = (event) => {
    emit('nodeDragstart', event);
  };

  const onDragOver = (event) => {
    //emit('nodeOver', event);
  };

  const onDragEnd = (event) => {
    console.log('===================');
    emit('nodeDragend', event);
  };

  const onDragDrop = (event) => {
    emit('nodeDrop', event);
  };

  const onDragEnter = (event) => {
    //console.log('node Enter', event);
    emit('nodeDragenter', event);
  };

  const onDragLeave = (event) => {
    emit('nodeDragleave', event);
  };

  // Updated
  const updateNode = ref(null);

  // Selected (Click)
  const selectNode = ref(null);
  const onFocus = (value) => {
    console.log('onFocus', value);
    if (props.useSelected) {
      if (props.clickOnlyCamera) {
        const { type, disabled } = value;
        if (disabled) return;
        if (type === 'root' || type === 'group' || type === 'cameraGroup')
          return;
      }
      setTimeout(() => {
        resetTreeSelect();
        setTimeout(() => {
          console.log('props.target : ', props.target);
          const matchNode = document.querySelectorAll(
            `${props.target} .node-wrapper.focused`
          )[0];
          selectNode.value = matchNode;
          console.log('matchNode : ', matchNode);
          selectNode.value.setAttribute('data-selected', 1);
          //selectNode.value.setAttribute('id');
        });
      });
      emit('selectNode', value);
    }
  };

  // 새로 생성된 노드 선택
  const selectNewNode = (newNode) => {
    if (selectNode.value) {
      selectNode.value.setAttribute('data-selected', 0);
    }
    newNode.setAttribute('data-selected', 1);

    selectNode.value = newNode;

    emit('selectNewNode', newNode);
  };

  const onCheck = (value) => {
    emit('checkNode', value);
  };

  const onUnCheck = (value) => {
    emit('unCheckNode', value);
  };

  const reset = () => {
    if (selectNode.value) {
      selectNode.value.setAttribute('data-selected', -1);
    }
  };

  const resetAll = () => {
    let allNode = document.querySelectorAll(`.node-wrapper `);
    allNode.forEach((node) => {
      node.setAttribute('data-selected', -1);
    });
  };

  defineExpose({ reset, resetAll, focusRoot });

  // 기존 watch 함수 수정
  watch(
    () => props.roots,
    () => {
      treeConfig.roots = props.roots.roots;
      resetTreeSelect();
    }
  );
</script>

<style lang="scss" scoped>
  .tree-area {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    overflow-y: auto;
    overflow-x: hidden;

    :deep(.tree) {
      .tree-content {
        padding: 0;
      }

      .node-wrapper {
        position: relative;
        transition: all 0.2s ease;
        padding-left: 0;

        &:hover {
          background: #f8fafc;
        }

        // 선택된 상태
        &[data-selected='1'] {
          background: linear-gradient(90deg, #37958338, transparent);
          border-left: 3px solid #379583;

          .node-input {
            color: #1d4ed8;
            font-weight: 600;
          }
        }

        // 루트 레벨 (레벨 0)
        &[data-level='0'] {
          .node-input {
            padding: 12px 16px;
            font-weight: 600;
            color: #1e293b;
          }
        }

        // 레벨 1 이상의 모든 노드에 대해 연결선 적용
        // 단, +/- 버튼이 있는 노드는 제외하고, tabindex="0"인 노드도 제외
        &:not([data-level='0']):not(:has(.tree-plus, .tree-minus)):not(
            [tabindex='0']
          ) {
          position: relative;

          // 기본 들여쓰기 - 레벨마다 20px씩
          margin-left: calc(var(--level, 1) * 20px);

          .node-input {
            padding: 8px 12px 8px 24px;
            color: #475569;
            position: relative;
          }

          // 수직선 (부모로부터 내려오는 선)
          &::before {
            content: '';
            position: absolute;
            left: 8px;
            top: 0;
            bottom: 50%;
            width: 2px;
            background: #cbd5e1;
            z-index: 1;
          }

          // 수평선 (노드로 향하는 선)
          &::after {
            content: '';
            position: absolute;
            left: 8px;
            top: 50%;
            width: 12px;
            height: 2px;
            background: #cbd5e1;
            z-index: 1;
          }

          // 마지막 자식 노드의 경우 수직선을 중간까지만
          &:last-child::before {
            bottom: 50%;
          }
        }

        // tabindex="0"인 노드는 꺾은선 없이 들여쓰기만
        &:not([data-level='0'])[tabindex='0'] {
          margin-left: calc(var(--level, 1) * 20px);

          .node-input {
            padding: 8px 12px 8px 24px;
            color: #475569;
            position: relative;
          }

          // 꺾은선 강제 제거
          &::before,
          &::after {
            display: none !important;
          }

          // 작은 점도 제거
          .node-input::before {
            display: none !important;
          }
        }

        // +/- 버튼이 있는 노드는 기본 들여쓰기만 적용
        &:not([data-level='0']):has(.tree-plus, .tree-minus) {
          margin-left: calc(var(--level, 1) * 20px);

          .node-input {
            padding: 8px 12px 8px 24px;
            color: #475569;
            position: relative;
          }

          // 연결선 제거
          &::before,
          &::after {
            display: none;
          }
        }

        // 레벨별 스타일 조정 (리프 노드만 - tabindex="0" 제외)
        &[data-level='1']:not(:has(.tree-plus, .tree-minus)):not(
            [tabindex='0']
          ) {
          --level: 1;

          .node-input {
            color: #475569;
            font-size: 14px;
          }

          &::before,
          &::after {
            background: #94a3b8;
          }
        }

        &[data-level='2']:not(:has(.tree-plus, .tree-minus)):not(
            [tabindex='0']
          ) {
          --level: 2;

          .node-input {
            color: #64748b;
            font-size: 14px;
          }

          &::before,
          &::after {
            background: #94a3b8;
          }
        }

        &[data-level='3']:not(:has(.tree-plus, .tree-minus)):not(
            [tabindex='0']
          ) {
          --level: 3;

          .node-input {
            color: #94a3b8;
            font-size: 13px;
          }

          &::before,
          &::after {
            background: #94a3b8;
          }
        }

        // tabindex="0"인 노드의 레벨별 스타일
        &[data-level='1'][tabindex='0'] {
          --level: 1;
          .node-input {
            color: #475569;
            font-size: 14px;
          }
        }

        &[data-level='2'][tabindex='0'] {
          --level: 2;
          .node-input {
            color: #64748b;
            font-size: 14px;
          }
        }

        &[data-level='3'][tabindex='0'] {
          --level: 3;
          .node-input {
            color: #94a3b8;
            font-size: 13px;
          }
        }

        // +/- 버튼이 있는 노드의 레벨별 스타일
        &[data-level='1']:has(.tree-plus, .tree-minus) {
          --level: 1;

          .node-input {
            color: #475569;
            font-size: 14px;
            font-weight: 500;
          }
        }

        &[data-level='2']:has(.tree-plus, .tree-minus) {
          --level: 2;

          .node-input {
            color: #64748b;
            font-size: 14px;
            font-weight: 500;
          }
        }

        &[data-level='3']:has(.tree-plus, .tree-minus) {
          --level: 3;

          .node-input {
            color: #94a3b8;
            font-size: 13px;
            font-weight: 500;
          }
        }

        // 더 깊은 레벨들도 지원
        &[data-level='4'] {
          --level: 4;
        }
        &[data-level='5'] {
          --level: 5;
        }
        &[data-level='6'] {
          --level: 6;
        }
        &[data-level='7'] {
          --level: 7;
        }
        &[data-level='8'] {
          --level: 8;
        }
        &[data-level='9'] {
          --level: 9;
        }

        // 입력 필드 스타일
        .node-input {
          border: none;
          background: transparent;
          cursor: pointer;
          width: 100%;
          transition: all 0.2s ease;
          position: relative;

          &:focus {
            outline: none;
            background: #f1f5f9;
          }
        }

        // 라이브러리 기본 +/- 버튼 색상만 변경
        .tree-plus,
        .tree-minus {
          color: #64748b !important;
          border-color: #94a3b8 !important;

          &:hover {
            color: white !important;
            border-color: #64748b !important;
            transform: scale(1.05);
          }
        }

        .tree-minus {
          border-color: #64748b !important;
          color: white !important;

          &:hover {
            border-color: #475569 !important;
            color: white !important;
          }
        }

        // 리프 노드에만 작은 점 표시 (tabindex="0" 제외)
        &:not(:has(.tree-plus, .tree-minus)):not([tabindex='0'])
          .node-input::before {
          content: '●';
          display: inline-block;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: currentColor;
          margin-right: 8px;
          opacity: 0.6;
          position: relative;
          top: -1px;
        }
      }

      // 부모 노드의 수직선이 리프 노드의 자식들만 관통하도록 하는 스타일 (tabindex="0" 제외)
      .node-wrapper:not([data-level='0']):not(
          :has(.tree-plus, .tree-minus)
        ):not([tabindex='0']) {
        &:not(:last-child) {
          &::before {
            bottom: 0;
          }
        }
      }
    }
  }

  // 아이콘 스타일
  .icon {
    display: inline-flex;
    width: 52px;
    align-items: center;
    justify-content: center;
    height: 20px;
    border-radius: 4px;
    font-weight: bold;
    margin-right: 8px;
    color: white;
  }
</style>
