<template>
  <div>
    <b-alert :variant="alertType"
             fade
             dismissible
             :show="showAlert"
             @dismissed="showAlert=false">
    {{ message }}</b-alert>
  </div>
</template>
<script>
export default {
  props: {
    message: String,
    alertType: {
      type: String,
      default: 'success',
    },
  },
  data() {
    return {
      showAlert: true,
    };
  },
  watch: {
    message() {
      this.showAlert = true;
    },
  },
};
</script>
