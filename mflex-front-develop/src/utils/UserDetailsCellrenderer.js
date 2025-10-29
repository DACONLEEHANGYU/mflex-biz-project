// // import { h, defineComponent } from 'vue';

// // export default defineComponent({
// //   setup() {
// //     const openUserDetails = (params) => {
// //       if (
// //         params.context &&
// //         params.context.componentParent &&
// //         params.context.componentParent.openUserDetailsPopup
// //       ) {
// //         params.context.componentParent.openUserDetailsPopup(params.data);
// //       }
// //     };

// //     return {
// //       openUserDetails,
// //     };
// //   },
// //   render() {
// //     return h(
// //       'button',
// //       {
// //         class: 'btn-s',
// //         onClick: () => this.openUserDetails(this.params),
// //       },
// //       '상세보기'
// //     );
// //   },
// // });

// import { ref, defineComponent } from 'vue';
// import AppWindow from '../components/ui/AppWindow.vue';
// import UserDetailsWindow from '../components/popWindow/UserDetailsWindow.vue';

// export default defineComponent({
//   components: {
//     AppWindow,
//     UserDetailsWindow,
//   },
//   setup() {
//     const userDetailsWindowView = ref(false);

//     const onCloseUserDetailsWindow = () => {
//       userDetailsWindowView.value = false;
//     };

//     return {
//       userDetailsWindowView,
//       onCloseUserDetailsWindow,
//     };
//   },
//   data() {
//     return {
//       cellValue: null,
//     };
//   },
//   methods: {
//     init(params) {
//       this.cellValue = params.valueFormatted || params.value;
//       this.params = params;
//     },
//     getUserDetails() {
//       this.userDetailsWindowView = true;
//       // 상위 컴포넌트의 메서드 호출 (옵션)
//       if (
//         this.params &&
//         this.params.context &&
//         this.params.context.componentParent
//       ) {
//         this.params.context.componentParent.openUserDetailsPopup(
//           this.params.data
//         );
//       }
//     },
//   },
//   template: `
//     <AppWindow
//       :view="userDetailsWindowView"
//       @close="onCloseUserDetailsWindow"
//       width="630px"
//       height="auto"
//     >
//       <UserDetailsWindow />
//     </AppWindow>

//     <div class="cell-box">
//       <button @click="getUserDetails" class="icon-cell__details"></button>
//     </div>
//   `,
// });

// // import { ref, defineComponent } from 'vue';
// // import AppWindow from '../components/ui/AppWindow.vue';
// // import UserDetailsWindow from '../components/popWindow/UserDetailsWindow.vue';

// // export default defineComponent({
// //   components: {
// //     AppWindow,
// //     UserDetailsWindow,
// //   },
// //   setup() {
// //     const userDetailsWindowView = ref(false);

// //     const onCloseUserDetailsWindow = () => {
// //       userDetailsWindowView.value = false;
// //     };

// //     return {
// //       userDetailsWindowView,
// //       onCloseUserDetailsWindow,
// //     };
// //   },
// //   data() {
// //     return {
// //       cellValue: null,
// //     };
// //   },
// //   methods: {
// //     init(params) {
// //       this.cellValue = params.valueFormatted || params.value;
// //     },
// //     getUserDetails() {
// //       this.userDetailsWindowView = true;
// //     },
// //   },
// //   template: `
// //    <AppWindow
// //       :view="userDetailsWindowView"
// //       @close="onCloseUserDetailsWindow"
// //       width="630px"
// //       height="auto"
// //     >
// //      <h2>User Details</h2>
// //     </AppWindow>

// //   <div class="cell-box">
// //       <button @click="getUserDetails" class="icon-cell__details"></button>

// //     </div>

// //   `,
// // });

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

    <div class="cell-box">
      <button @click="getUserDetails" class="icon-cell__details"></button>
    </div>
  `,
});
