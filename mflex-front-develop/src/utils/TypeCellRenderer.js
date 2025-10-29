export default {
  template: `
  <div class="cell-state" ref="cellContainer">
    <span v-if="cellValue && cellValue.length" class="cell-item">
      <span
        v-for="(item, index) in cellValue"
        :key="index"
        class="item-pair ellipsis"
      >
        <span v-if="item.unityCodeLevel" v-html="getIndentedIcon(item)"></span>
        <span
          class="icon-state"
          :style="{
            backgroundColor: item.bgColor,
            color: item.color,
            width: item.size + 'px',
          }"
          :data-tooltip="generateTooltipData(item)"
        >{{ item.type }}</span>
        <span v-if="item.label" class="label" :style="{ color: isDiscard ? '#ff4040' : 'inherit', textDecoration: isDiscard ? 'line-through' : 'none' }">{{ item.label }}</span>
        <span v-if="index !== cellValue.length - 1" class="separator">, </span>
      </span>
    </span>
  </div>
  `,
  props: ['params', 'customTooltipClass', 'customTooltipStyle'],
  data() {
    return {
      tooltipElement: null,
    };
  },
  computed: {
    cellValue() {
      return this.params.value;
    },
    isDiscard() {
      // 부모 데이터에서 discardYn 값을 확인
      return this.params.data && this.params.data.discardYn === true;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initializeTooltips();
    });
  },
  beforeUnmount() {
    this.removeEventListeners();
    this.removeTooltip();
  },
  methods: {
    getIndentedIcon(item) {
      const level = item.unityCodeLevel || 0;
      const nbsp = '&nbsp;'.repeat(level * 5);
      return `<span v-pre>${nbsp}</span>`;
    },

    initializeTooltips() {
      if (this.$refs.cellContainer) {
        const iconElements =
          this.$refs.cellContainer.querySelectorAll('.icon-state');
        iconElements.forEach((icon) => {
          icon.addEventListener('mouseenter', (e) => this.showTooltip(e, icon));
          icon.addEventListener('mouseleave', this.hideTooltip);
        });
      }
    },

    removeEventListeners() {
      if (this.$refs.cellContainer) {
        const iconElements =
          this.$refs.cellContainer.querySelectorAll('.icon-state');
        iconElements.forEach((icon) => {
          icon.removeEventListener('mouseenter', (e) =>
            this.showTooltip(e, icon)
          );
          icon.removeEventListener('mouseleave', this.hideTooltip);
        });
      }
    },

    createTooltip() {
      if (!this.tooltipElement) {
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.classList.add(
          this.customTooltipClass || 'custom-tooltip'
        );
        this.tooltipElement.style.cssText = `
          position: fixed;
          display: none;
          background-color: rgba(0, 0, 0);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          max-width: 250px;
          white-space: normal;
          pointer-events: none;
          z-index: 9999;
        `;
        document.body.appendChild(this.tooltipElement);
      }
    },

    removeTooltip() {
      if (this.tooltipElement) {
        document.body.removeChild(this.tooltipElement);
        this.tooltipElement = null;
      }
    },

    showTooltip(event, element) {
      this.createTooltip();

      const tooltipContent = element.getAttribute('data-tooltip');
      if (!tooltipContent) return;

      this.tooltipElement.innerHTML = tooltipContent;
      this.tooltipElement.style.display = 'block';
      this.tooltipElement.style.visibility = 'hidden';

      if (this.customTooltipStyle) {
        Object.assign(this.tooltipElement.style, this.customTooltipStyle);
      }

      const elementRect = element.getBoundingClientRect();
      const tooltipHeight = this.tooltipElement.offsetHeight;
      const tooltipWidth = this.tooltipElement.offsetWidth;

      let top = elementRect.top - tooltipHeight - 10;
      let left = elementRect.left + elementRect.width / 2 - tooltipWidth / 2;

      // Adjust position if tooltip would go off-screen
      if (top < 0) top = elementRect.bottom + 10;
      if (left < 0) left = 10;
      if (left + tooltipWidth > window.innerWidth)
        left = window.innerWidth - tooltipWidth - 10;

      this.tooltipElement.style.top = `${top}px`;
      this.tooltipElement.style.left = `${left}px`;
      this.tooltipElement.style.visibility = 'visible';
    },

    hideTooltip() {
      if (this.tooltipElement) {
        this.tooltipElement.style.display = 'none';
      }
    },

    generateTooltipData(item) {
      // console.log('item ====================', item);
      // You can customize the tooltip content format based on the item properties
      let tooltipHTML = `
        <div style="margin-bottom: 5px;">
          <span style="font-size:14px; font-weight:600;">${item.dictionaryName}</span>
        </div>
      `;

      // Add additional information if available
      if (item.description) {
        tooltipHTML += `<div style="font-size:12px;">${item.description}</div>`;
      }

      // You can add more details from the item object
      if (item.info) {
        tooltipHTML += `<div style="font-size:12px; margin-top: 5px;">${item.info}</div>`;
      }

      return tooltipHTML;
    },
  },
};
