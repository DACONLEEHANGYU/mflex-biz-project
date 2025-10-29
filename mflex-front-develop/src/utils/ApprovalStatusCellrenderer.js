// import { ref, defineComponent } from 'vue';

// export default {
//   template: `
//       <div class="cell-state" style="justify-content: center; margin-top: -3.6px;">
//         <span class="item-pair ellipsis" style="margin-top: 5px;">
//           <span  v-if="cellValue === '미승인'" class="cell-item">
//               <button class="btn-s dark-blue" style="height: 25px;line-height: 10px;" @click="getUserApproval">승인</button>
//           </span>
//             <span  class="cell-item" v-else
//                 class="icon-state"
//                 style="
//                   backgroundColor: gray;
//                   color: white;
//                   width: 60px;
//                   font-size: 13px;"
//                 >승인됨</span>
//               </div>
//           </div>
//         </span>
//         <span>
//       </div>
//     `,
//   setup(props) {
//     const cellValue = props.params.valueFormatted
//       ? props.params.valueFormatted
//       : props.params.value;

//     const getUserApproval = () => {
//       console.log('getUserApproval : ', props);
//       console.log('userAppropval-props : ', props);

//       const userId = props.params.data.userId;
//       props.params.context.componentParent.onUserApproval(userId);
//     };

//     return {
//       cellValue,
//       getUserApproval,
//     };
//   },
// };
import { defineComponent } from 'vue';

export default defineComponent({
  template: `
    <div class="cell-state" style="justify-content: center; margin-top: -3.6px;">
      <span class="item-pair ellipsis" style="margin-top: 5px;">  
        <span v-if="cellValue === '미승인'" class="cell-item">                                        
          <button class="btn-s dark-blue" style="height: 25px; line-height: 10px;" @click="getUserApproval">승인</button>                        
        </span>            
        <span v-else
          class="cell-item icon-state"
          :style="{
            backgroundColor: 'gray',
            color: 'white',
            width: '60px',            
            fontSize: '13px'
          }"
        >
          승인됨
        </span>
      </span>
    </div>
  `,
  props: ['params'],
  setup(props) {
    const cellValue = props.params.valueFormatted
      ? props.params.valueFormatted
      : props.params.value;

    const getUserApproval = () => {
      console.log('getUserApproval : ', props);
      console.log('userAppropval-props : ', props);

      const userId = props.params.data.userId;
      props.params.context.componentParent.onUserApproval(
        userId,
        props.params.data
      );
    };

    return {
      cellValue,
      getUserApproval,
    };
  },
});
