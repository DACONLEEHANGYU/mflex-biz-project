import AppDialog from '@/components/ui/AppDialog.vue';
import vSelect from 'vue-select';
import AppInput from '@/components/ui/AppInput.vue';
import AppFileInput from '@/components/ui/AppFileInput.vue';
import AppGrid from '@/components/grid/AppGrid.vue';
import AppTab from '@/components/ui/AppTab.vue';

import AppDatePicker from '@/components/calendar/AppDatePicker.vue';
import AppStateText from '@/components/ui/AppStateText.vue';

export default {
  install(app) {
    app.component('AppDialog', AppDialog);
    app.component('vSelect', vSelect);
    app.component('AppInput', AppInput);
    app.component('AppFileInput', AppFileInput);
    app.component('AppGrid', AppGrid);
    app.component('AppTab', AppTab);
    app.component('AppDatePicker', AppDatePicker);
    app.component('AppStateText', AppStateText);
  },
};
