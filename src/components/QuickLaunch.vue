<template>
  <div class="quick-launch">
    <div
      v-for="s in shortcuts" :key="s.id"
      class="ql-icon" :title="s.name + '\n' + s.path"
      @click="launch(s)" @contextmenu.prevent="remove(s.id)"
    >
      <el-icon :size="18"><Link /></el-icon>
      <span class="ql-label">{{ s.name }}</span>
    </div>

    <div class="ql-icon ql-add-btn" @click="add" title="添加快捷方式">
      <el-icon :size="18"><Plus /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { Link, Plus } from '@element-plus/icons-vue';
import { useQuickLaunch } from '../composables/useQuickLaunch.js';

const { shortcuts, add, remove, launch } = useQuickLaunch();
</script>

<style scoped>
@import url('../styles/quick-launch.css');
</style>
