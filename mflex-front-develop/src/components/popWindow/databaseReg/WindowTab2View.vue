<template>
  <div class="grid-wrap" style="height: 280px">
    <div class="grid-top"></div>
    <div class="grid-list">2</div>
    <!-- <div class="grid-bottom"></div> -->
  </div>
</template>

<script>
import { reactive } from 'vue';

export default {
  components: {},

  data() {
    return {
      context: null,
      windowView: false,
      selectedRow: {},
    };
  },
  methods: {
    onRowDoubleClicked(value) {
      console.log('onRowDoubleClicked ', value);
      this.selectedRow = value;
      this.windowView = true;
    },
    onCloseWindow() {
      this.windowView = false;
      this.selectedRow = {};
    },
  },
  beforeMount() {
    this.context = { componentParent: this };
  },

  setup(props) {
    const rowData = reactive({});

    const columnDefs = reactive([
      {
        headerName: 'A',
        field: 'a',
        cellClass: 'grid-cell-centered',
        width: 80,
      },
      {
        headerName: 'B',
        field: 'b',
        cellClass: 'grid-cell-centered',
        width: 80,
      },
      {
        headerName: 'C',
        field: 'c',
        cellClass: 'grid-cell-centered',
        width: 80,
      },
      {
        headerName: 'D',
        field: 'd',
        cellClass: 'ag-left-aligned-cell',
        width: 80,
      },
      {
        headerName: 'E',
        field: 'e',
        cellClass: 'grid-cell-centered',
        width: 80,
      },
      {
        headerName: 'F',
        field: 'f',
        cellClass: 'grid-cell-centered',
        width: 90,
      },
      {
        headerName: 'G',
        field: 'g',
        cellClass: 'grid-cell-centered',
        width: 80,
      },
      {
        headerName: 'H',
        field: 'h',
        cellClass: 'grid-cell-centered',
        width: 80,
      },
      {
        headerName: 'I',
        field: 'i',
        cellClass: 'grid-cell-centered',
        width: 80,
      },
      {
        headerName: 'J',
        field: 'j',
        cellClass: 'grid-cell-centered',
        width: 80,
      },
      {
        headerName: 'K',
        field: 'k',
        cellClass: 'grid-cell-centered',
        width: 80,
      },
      {
        headerName: 'L',
        field: 'l',
        cellClass: 'grid-cell-centered',
        width: 80,
      },
      {
        headerName: 'M',
        field: 'm',
        cellClass: 'grid-cell-centered',
        width: 80,
      },
      {
        headerName: 'N',
        field: 'n',
        cellClass: 'grid-cell-centered',
        width: 80,
      },
      {
        headerName: 'O',
        field: 'o',
        cellClass: 'grid-cell-centered',
        width: 80,
      },
      {
        headerName: 'P',
        field: 'p',
        cellClass: 'grid-cell-centered',
        width: 80,
      },
      {
        headerName: 'Q',
        field: 'q',
        cellClass: 'grid-cell-centered',
        width: 80,
      },
      {
        headerName: 'R',
        field: 'r',
        cellClass: 'grid-cell-centered',
        width: 80,
      },
      {
        headerName: 'S',
        field: 's',
        cellClass: 'grid-cell-centered',
        width: 80,
      },
      {
        headerName: 'T',
        field: 't',
        cellClass: 'grid-cell-centered',
        width: 80,
      },
      {
        headerName: 'U',
        field: 'u',
        cellClass: 'grid-cell-centered',
        width: 80,
      },
      {
        headerName: 'V',
        field: 'v',
        cellClass: 'grid-cell-centered',
        width: 80,
      },
      {
        headerName: 'W',
        field: 'w',
        cellClass: 'grid-cell-centered',
        width: 80,
      },
      {
        headerName: 'X',
        field: 'x',
        cellClass: 'grid-cell-centered',
        width: 80,
      },
      {
        headerName: 'Y',
        field: 'y',
        cellClass: 'grid-cell-centered',
        width: 80,
      },
      {
        headerName: 'Z',
        field: 'z',
        cellClass: 'grid-cell-centered',
        width: 80,
      },
    ]);

    const fetchData = async () => {
      // const { data } = await $vxHttp.get('./sampleData/ueMonitoringData.json');
      // rowData.value = data;
      const sampleData = [];
      for (let i = 0; i < 20; i++) {
        sampleData.push({
          id: i,
          a: '-',
          b: '-',
          c: '-',
          d: '-',
          e: '-',
          f: '-',
          g: '-',
          h: '-',
          i: '-',
          j: '-',
          k: '-',
          l: '-',
          m: '-',
          n: '-',
          o: '-',
          p: '-',
          q: '-',
          r: '-',
          s: '-',
          t: '-',
          u: '-',
          v: '-',
          w: '-',
          x: '-',
          y: '-',
          z: '-',
        });
      }
      rowData.value = sampleData;
    };

    fetchData();

    // 리스트 갯수 셀렉트
    return {
      rowData,
      columnDefs,
    };
  },
};
</script>
