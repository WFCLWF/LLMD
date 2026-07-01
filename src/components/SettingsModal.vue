<template>
  <el-dialog :model-value="visible" @update:model-value="emit('update:visible', $event)"
    title="API 设置" width="400px" append-to-body :close-on-click-modal="true"
    :close-on-press-escape="true" @open="loadConfig" destroy-on-close>
    <el-form label-position="top" :model="form" ref="formRef" :rules="rules">
      <el-form-item label="API Key" prop="api_key">
        <el-input v-model="form.api_key" type="password" show-password placeholder="sk-..." />
      </el-form-item>
      <el-form-item label="Base URL" prop="base_url">
        <el-input v-model="form.base_url" placeholder="https://api.deepseek.com" />
      </el-form-item>
      <el-form-item label="Model" prop="model">
        <el-input v-model="form.model" placeholder="deepseek-v4-flash" />
      </el-form-item>
    </el-form>

    <!-- 主题选择 -->
    <div class="theme-section">
      <span class="theme-label">配色方案</span>
      <div class="theme-options">
        <div v-for="t in themeList" :key="t.key"
          class="theme-chip" :class="{ active: selectedTheme === t.key }"
          @click="switchTheme(t.key)">
          <span class="theme-dot" :style="{ background: t.dot }"></span>
          {{ t.label }}
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="emit('update:visible', false)">取消</el-button>
        <el-button type="primary" @click="saveConfig" :loading="saving">保存配置</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { getConfig, updateConfig } from '../api/index.js';
import { themes, currentThemeKey } from '../themes.js';

const themeList = Object.entries(themes).map(([key, t]) => ({
  key, label: t.label, dot: t.vars['--accent'],
}));
const selectedTheme = ref(currentThemeKey());

function switchTheme(key) {
  selectedTheme.value = key;
  window.__switchTheme?.(key);
}

const props = defineProps({ visible: Boolean });
const emit = defineEmits(['update:visible', 'saved']);

const formRef = ref(null);
const saving = ref(false);
const form = reactive({ api_key: '', base_url: '', model: '' });
const rules = {
  api_key: [{ required: true, message: '请输入 API Key', trigger: 'blur' }],
  base_url: [{ required: true, message: '请输入 Base URL', trigger: 'blur' }],
  model: [{ required: true, message: '请输入 Model', trigger: 'blur' }],
};

async function loadConfig() {
  try {
    const result = await getConfig();
    if (result?.code === 200 && result.data) {
      form.api_key = result.data.api_key || '';
      form.base_url = result.data.base_url || '';
      form.model = result.data.model || '';
    }
  } catch { ElMessage.warning('无法连接后端（端口 8054）'); }
  await nextTick();
  formRef.value?.clearValidate();
}

async function saveConfig() {
  if (!formRef.value) return;
  try { await formRef.value.validate(); } catch { return; }
  saving.value = true;
  try {
    const result = await updateConfig(form.api_key, form.base_url, form.model);
    if (result.code === 200) {
      ElMessage.success('配置保存成功 ✓');
      emit('update:visible', false);
      emit('saved');
    } else { ElMessage.error(`保存失败: ${result.message}`); }
  } catch (e) { ElMessage.error(`保存失败: ${e.message}`); }
  finally { saving.value = false; }
}
</script>

<style scoped>
.dialog-footer { display: flex; gap: 10px; justify-content: flex-end; }

.theme-section {
  border-top: 1px solid var(--border-light);
  padding: 14px 0 0;
  margin: 0 0 4px;
}
.theme-label {
  font-size: 12px; font-weight: 500; color: var(--text-tertiary);
  display: block; margin-bottom: 10px;
}
.theme-options { display: flex; flex-wrap: wrap; gap: 8px; }
.theme-chip {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 6px; cursor: pointer;
  font-size: 12px; color: var(--text-secondary);
  border: 1px solid var(--border-light);
  background: var(--bg-card); transition: all 0.2s;
}
.theme-chip:hover { border-color: var(--accent); }
.theme-chip.active {
  border-color: var(--accent); background: rgba(140,192,235,0.12);
  color: var(--accent-text); font-weight: 600;
}
.theme-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

:deep(.el-dialog) { border-radius: 12px; box-shadow: 0 8px 40px rgba(0,0,0,0.14); }
:deep(.el-dialog__header) { border-bottom: 1px solid var(--border-light); padding: 14px 18px; margin: 0; }
:deep(.el-dialog__title) { font-size: 15px; font-weight: 600; color: var(--text-primary); }
:deep(.el-dialog__body) { padding: 18px; }
:deep(.el-dialog__footer) { border-top: 1px solid var(--border-light); padding: 12px 18px; }

:deep(.el-form-item__label) { font-size: 12px; font-weight: 500; }
:deep(.el-input__wrapper) { border-radius: 7px; }
:deep(.el-input__wrapper.is-focus) { box-shadow: 0 0 0 1px var(--accent), 0 0 0 3px rgba(140,192,235,0.1) !important; }
</style>
