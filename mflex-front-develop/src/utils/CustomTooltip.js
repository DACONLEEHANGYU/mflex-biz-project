// 원본
/* export default {
  template: `
      <div class="custom-tooltip">
          <p><span>{{ tooltipData }}</span></p>
      </div>
    `,
  data: function () {
    return {
      tooltipField: null,
      tooltipData: null,
    };
  },
  beforeMount() {
    this.tooltipField = this.params.colDef.tooltipField;
    this.data = this.params.api.getDisplayedRowAtIndex(
      this.params.rowIndex
    ).data;
    this.tooltipData = this.data[this.tooltipField];

    // this.color = this.params.color || 'white';
  },
}; */

export default {
  template: `
  <div class="custom-tooltip">
  <ul v-if="tooltipData && Array.isArray(tooltipData)" class="cell-state" style="display:block; padding: 0;">
    <li v-for="(item, index) in tooltipData" :key="index" class="tooltip-item">
      <span class="item-pair">
        <span
          class="icon-state"
          :style="{
            backgroundColor: item.bgColor,
            color: item.color,
            width: item.size + 'px',
          }"
          >{{ item.type }}</span
        >
        <span v-if="item.label" class="label">{{ item.label }}</span>
      </span>
    </li>
  </ul>
  <p v-else><span>{{ tooltipData }}</span></p>
</div>
    `,
  data: function () {
    return {
      tooltipField: null,
      tooltipData: null,
    };
  },
  beforeMount() {
    this.tooltipField = this.params.colDef.tooltipField;
    this.data = this.params.api.getDisplayedRowAtIndex(
      this.params.rowIndex
    ).data;
    this.tooltipData = this.data[this.tooltipField];

    // this.color = this.params.color || 'white';
  },
};
