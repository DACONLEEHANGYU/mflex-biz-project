// export default {
//   template: `
//       <div class="cell-box">
//               <template v-if="cellValue === 'SEED' || cellValue === 'SEED_ADMIN'">
//               <span style="font-size: 20px;">🌰</span>
//               </template>
//               <template v-else-if="cellValue === 'SPROUT'">
//               <span style="font-size: 20px;">🌱</span>
//               </template>
//               <template v-else-if="cellValue === 'TREE'">
//               <span style="font-size: 20px;">🌳</span>
//               </template>
//               <template v-else-if="cellValue === 'WILT'">
//               <span style="font-size: 20px;">🍂</span>
//               </template>
//         </div>
//   `,
//   props: ['params'],
//   computed: {
//     cellValue() {
//       return this.params.value;
//     },
//   },
//   methods: {
//     getIndentedIcon(item) {
//       const level = item.unityCodeLevel || 0;

//       const nbsp = '&nbsp;'.repeat(level * 5);

//       return `<span v-pre>${nbsp}</span>`;
//     },
//   },
// };
import { computed } from 'vue';

export default {
  template: `
    <div class="cell-box">
      <span style="font-size: 20px;">{{ cellIcon }}</span>
    </div>
  `,
  props: ['params'],
  setup(props) {
    const cellValue = computed(() => props.params.value);

    const cellIcon = computed(() => {
      switch (cellValue.value) {
        case 'SEED':
        case 'SEED_ADMIN':
          return '🌰';
        case 'SPROUT':
          return '🌱';
        case 'TREE':
          return '🌳';
        case 'WILT':
          return '🍂';
        default:
          return '';
      }
    });

    return {
      cellIcon,
    };
  },
};
