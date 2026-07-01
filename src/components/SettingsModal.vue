<template>
  <el-dialog :model-value="visible" @update:model-value="emit('update:visible', $event)"
    title="API 设置" width="460px" append-to-body :close-on-click-modal="true"
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

:deep(.el-dialog) { border-radius: 14px; box-shadow: 0 12px 48px rgba(0,0,0,0.12); }
:deep(.el-dialog__header) { border-bottom: 1px solid rgba(0,0,0,0.06); padding: 18px 22px; margin: 0; }
:deep(.el-dialog__title) { font-size: 17px; font-weight: 600; color: var(--text-primary); }
:deep(.el-dialog__body) { padding: 22px; }
:deep(.el-dialog__footer) { border-top: 1px solid rgba(0,0,0,0.06); padding: 14px 22px; }

:deep(.el-form-item__label) { font-size: 13px; font-weight: 500; }
:deep(.el-input__wrapper) { border-radius: 8px; }
:deep(.el-input__wrapper.is-focus) { box-shadow: 0 0 0 1px var(--accent), 0 0 0 3px rgba(79,110,247,0.1) !important; }
</style>
