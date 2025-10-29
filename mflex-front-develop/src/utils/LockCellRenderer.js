import { ref, defineComponent, onMounted, reactive } from 'vue';
import AppWindow from '../components/ui/AppWindow.vue';
import AppDialog from '../components/ui/AppDialog.vue'; // 추가 필요
import UserUnlockWindow from '../components/popWindow/UserUnlockWindow.vue';

export default defineComponent({
  components: {
    AppWindow,
    UserUnlockWindow,
    AppDialog,
  },
  props: {
    params: {
      type: Object,
      required: true,
    },
  },

  setup(props) {
    const cellValue = ref(null);
    const userUnlockWindowView = ref(false);
    const userLockWindowView = ref(false);

    const onCloseUserUnlockWindow = () => {
      userUnlockWindowView.value = false;
    };

    const userLockConfirmState = reactive({
      view: false,
      title: '사용자 잠금/잠금해제',
      message: '사용자 계정을 잠금/잠금해제 하시겠습니까?',
    });

    const onCloseUserLockWindow = () => {
      userLockWindowView.value = false;
    };

    const userUnlock = () => {
      console.log('userUnlock', props.params.data);
      userUnlockWindowView.value = true;

      if (props.params.context?.componentParent?.openUserUnlockWindow) {
        props.params.context.componentParent.openUserUnlockWindow(
          props.params.data.userId
        );
      }
    };

    const userLock = () => {
      console.log('userLock', props.params.data);

      console.log('props.params : ', props.params);

      if (props.params.context?.componentParent?.onOpenUserLock) {
        console.log(
          'props.params.context?.componentParent?.onOpenUserLock : ',
          props.params.context?.componentParent?.onOpenUserLock
        );

        props.params.context.componentParent.onOpenUserLock(
          props.params.data.userId
        );
      }
      // Logic for locking the user can be added here
      userLockConfirmState.value = true;
    };

    const onUserLock = () => {
      // 잠금 처리 로직
      userLockConfirmState.view = false;
    };

    const init = () => {
      cellValue.value = props.params.valueFormatted || props.params.value;
    };

    onMounted(init);

    return {
      cellValue,
      userLock,
      userUnlock,
      userUnlockWindowView,
      userLockConfirmState,
      onCloseUserUnlockWindow,
      onUserLock,
    };
  },
  template: `
    <div class="cell-box lock-cell-box">
      <template v-if="cellValue === false">
        <button class="icon-cell__unlock" @click="userLock"></button>
      </template>
      <template v-else>
        <button class="icon-cell__lock" @click="userUnlock"></button>
      </template>
    </div>

    <AppWindow
      :view="userUnlockWindowView"
      @close="onCloseUserUnlockWindow"
      width="630px"
      height="auto"
    >
      <UserUnlockWindow />
    </AppWindow>

  
  `,
});

// export default {
//   template: `
//         <div class="cell-box lock-cell-box">
//           <template v-if="cellValue === false">
//           <i v-else class="icon-cell__unlock"></i>
//           </template>
//           <template v-else><i class="icon-cell__lock"></i></template>
//         </div>
//     `,
//   setup(props) {
//     const cellValue = props.params.valueFormatted
//       ? props.params.valueFormatted
//       : props.params.value;

//     return {
//       cellValue,
//     };
//   },
// };
