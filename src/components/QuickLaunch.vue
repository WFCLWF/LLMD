<template>
  <nav class="quick-launch" aria-label="快捷启动">
    <div
      v-for="s in shortcuts" :key="s.id"
      class="ql-icon" :title="s.name + '\n' + s.path"
      role="button" tabindex="0"
      :aria-label="'启动 ' + s.name"
      @click="launch(s)" @contextmenu.prevent="remove(s.id)"
      @keydown.enter="launch(s)"
    >
      <el-icon :size="18" aria-hidden="true"><Link /></el-icon>
      <span class="ql-label">{{ s.name }}</span>
    </div>

    <div
      class="ql-icon ql-add-btn" @click="add"
      role="button" tabindex="0"
      title="添加快捷方式" aria-label="添加快捷启动方式"
      @keydown.enter="add"
    >
      <el-icon :size="18" aria-hidden="true"><Plus /></el-icon>
    </div>
  </nav>
</template>

<script setup>
import { Link, Plus } from '@element-plus/icons-vue';
import { useQuickLaunch } from '../composables/useQuickLaunch.js';

const { shortcuts, add, remove, launch } = useQuickLaunch();
</script>

<style scoped>
@import url('../styles/quick-launch.css');
</style>
