import { ref, defineComponent } from 'vue';
import AppWindow from '../components/ui/AppWindow.vue';
import UserDetailsWindow from '../components/popWindow/UserDetailsWindow.vue';

export default defineComponent({
  components: {
    AppWindow,
    UserDetailsWindow,
  },
  props: {
    params: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const userDetailsWindowView = ref(false);
    const cellValue = ref(null);

    const onCloseUserDetailsWindow = () => {
      userDetailsWindowView.value = false;
    };

    const getUserDetails = () => {
      userDetailsWindowView.value = true;
      console.log('getUserDetails', props.params.data);
      // 상위 컴포넌트의 메서드 호출 (옵션)
      if (props.params.context?.componentParent?.openUserDetailsPopup) {
        props.params.context.componentParent.openUserDetailsPopup(
          props.params.data
        );
      }
    };

    const onRemoveConfirm = () => {
      console.log('삭제 버튼 클릭', props.params.data);
      // 상위 컴포넌트의 삭제 메서드 호출
      if (
        props.params.context?.componentParent?.onOpenDeleteApprovalLineWindow
      ) {
        props.params.context.componentParent.onOpenDeleteApprovalLineWindow(
          props.params.data
        );
      }
    };

    const onCancelAction = () => {
      console.log('취소 버튼 클릭', props.params.data);
      // 상위 컴포넌트의 취소 메서드 호출
      if (props.params.context?.componentParent?.onCancelRow) {
        props.params.context.componentParent.onCancelRow(props.params.data);
      }
    };

    const init = () => {
      cellValue.value = props.params.valueFormatted || props.params.value;
    };

    // 컴포넌트 마운트 시 init 호출
    init();

    return {
      userDetailsWindowView,
      onCloseUserDetailsWindow,
      getUserDetails,
      cellValue,
      onRemoveConfirm,
      onCancelAction,
    };
  },
  template: `
    <AppWindow
      :view="userDetailsWindowView"
      @close="onCloseUserDetailsWindow"
      width="630px"
      height="auto"
    >
      <UserDetailsWindow />
    </AppWindow>

    <div class="cell-action-box">
      <button
        class="delete-x-btn"
        title="삭제"
        @click="onRemoveConfirm"
        :disabled="params.data.regType === 1"
      >
        ×
      </button>
    </div>

    <style scoped>
      .cell-action-box {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        padding: 2px;
        box-sizing: border-box;
      }

      .delete-x-btn {
        width: 24px;
        height: 24px;
        background-color: #ff4757;
        border: 1px solid #e74c3c;
        border-radius: 4px;
        color: white;
        font-size: 16px;
        font-weight: bold;
        line-height: 1;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }

      .delete-x-btn:hover:not(:disabled) {
        background-color: #e74c3c;
        border-color: #c0392b;
        transform: scale(1.1);
        box-shadow: 0 2px 8px rgba(231, 76, 60, 0.4);
      }

      .delete-x-btn:active:not(:disabled) {
        transform: scale(0.95);
        box-shadow: 0 1px 3px rgba(231, 76, 60, 0.6);
      }

      .delete-x-btn:disabled {
        background-color: #bdc3c7;
        border-color: #95a5a6;
        color: #7f8c8d;
        cursor: not-allowed;
        opacity: 0.6;
        transform: none;
        box-shadow: none;
      }

      /* 반응형 디자인 */
      @media (max-width: 768px) {
        .delete-x-btn {
          width: 20px;
          height: 20px;
          font-size: 14px;
        }
      }
    </style>
  `,
});
