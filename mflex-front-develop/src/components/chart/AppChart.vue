<template>
  <apexchart
    :type="type"
    :options="chartOptions"
    :series="series"
    :height="height"
  ></apexchart>
</template>

<script setup>
import { ref, toRefs, watch } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'line',
  },
  series: {
    type: Array,
    default: () => [],
  },
  categories: {
    type: Array,
    default: () => [],
  },
  dataType: {
    type: String,
    default: 'category',
  },
  chartRange: {
    type: [Number],
    default: undefined,
  },
  chartColor: {
    type: Array,
    default: () => ['#F7A21B', '#A532FF', '#0071FF', '#AAFA45'],
  },
  format: {
    type: String,
    default: 'HH:mm', //'yyyy-MM-dd HH:mm'
  },
  height: {
    type: [Number, String],
    defalut: 248,
  },
});

const chartOptions = ref({
  chart: {
    type: props.type,
    animations: {
      enabled: true,
      easing: 'linear',
      speed: 800,
      // dynamicAnimation: {
      //   intervalTime: props.intervalTime,
      // },
    },
    zoom: {
      enabled: false,
    },
    toolbar: {
      show: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 0,
  },
  colors: props.chartColor,
  stroke: {
    width: 1,
    // curve: 'straight',
    curve: 'smooth',
  },
  grid: {
    show: true,
    borderColor: '#2a3035',
    strokeDashArray: 0,
    position: 'back',
    xaxis: {
      lines: {
        show: false,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
    column: {
      colors: undefined,
      opacity: 0.5,
    },
    // padding: {
    //   top: 0,
    //   right: 0,
    //   bottom: 0,
    //   left: 0,
    // },
    row: {},
    // row: {
    //   colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
    //   opacity: 0.5,
    // },
  },
  yaxis: {
    show: true,
    labels: {
      show: true,
      align: 'right',
      // minWidth: 0,
      // maxWidth: 160,
      style: {
        colors: 'rgba(255, 255, 255, 0.6)',
        fontSize: '11px',
        fontFamily: 'Noto Sans KR',
        fontWeight: 400,
        cssClass: 'apexcharts-yaxis-label',
      },
      // formatter: value => {
      //   return val;
      // },
    },
    // title: {
    //   text: 'Temperature',
    // },
    // min: 0,
    // max: 100,
  },
  xaxis: {
    type: props.dataType,
    range: props.chartRange,
    // range: 777600000,
    // type: 'time',
    // range: 777600000,
    axisBorder: {
      show: true,
      color: '#606468',
      height: 1,
      width: '100%',
      offsetX: 0,
      offsetY: 0,
    },
    axisTicks: {
      show: false,
      borderType: 'solid',
      color: '#606468',
      height: 6,
      offsetX: 0,
      offsetY: 0,
    },
    // title: {
    //   text: 'Month',
    // },
    labels: {
      show: true,
      rotate: 0,
      style: {
        colors: 'rgba(255, 255, 255, 0.6)',
        fontSize: '11px',
        fontFamily: 'Noto Sans KR',
        fontWeight: 400,
        cssClass: 'apexcharts-xaxis-label',
      },
      offsetY: -3,
      // format: undefined,
      // formatter: undefined,
      datetimeUTC: false,
      // datetimeFormatter: {
      //   year: 'yyyy',
      //   month: "MMM 'yy",
      //   day: 'dd MMM',
      //   hour: props.format,
      // },
      format: props.format,
    },
    categories: props.categories,
  },
  legend: {
    position: 'bottom',
    horizontalAlign: 'center',
    labels: {
      colors: 'rgba(255, 255, 255, 0.7)',
    },
    // floating: true,
    offsetY: 5,
    offsetX: 0,
    onItemClick: {
      toggleDataSeries: false,
    },
    onItemHover: {
      highlightDataSeries: true,
    },
  },
  tooltip: {
    enabled: true,
    theme: 'dark', //light, dark
    x: {
      format: props.format,
    },
  },
  /* annotations: {
    xaxis: [
      {
        x: props.centerLine,  //category 수치
        strokeDashArray: 3,
        borderColor: '#ff0000',
        opacity: 1,
        label: {
          borderColor: '#ff0000',
          borderWidth: 2,
          style: {
            color: '#fff',
            background: '#ff0000',
          },
          text: '',
        },
      },
    ],
  }, */
  /* title: {
    text: 'Product Trends by Month',
    align: 'left',
  }, */
});

/* const { series } = toRefs(props);

watch(series, () => {
  console.log('series 변경~');
}); */
</script>

<style lang="scss" scoped></style>
