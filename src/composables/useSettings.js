/**
 * 设置弹窗逻辑（API 配置 + 主题选择）
 */
import { ref, reactive, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { getConfig, updateConfig } from '../api/index.js';
import { themes, currentThemeKey } from '../themes.js';

export function useSettings(emit) {
  const formRef = ref(null);
  const saving = ref(false);
  const form = reactive({ api_key: '', base_url: '', model: '' });

  const rules = {
    api_key: [{ required: true, message: '请输入 API Key', trigger: 'blur' }],
    base_url: [{ required: true, message: '请输入 Base URL', trigger: 'blur' }],
    model: [{ required: true, message: '请输入 Model', trigger: 'blur' }],
  };

  // 主题
  const themeList = Object.entries(themes).map(([key, t]) => ({
    key, label: t.label,
    dot: t.vars['--accent'],
    gradient: t.vars['--accent-gradient'],
  }));
  const selectedTheme = ref(currentThemeKey());

  function switchTheme(key) {
    selectedTheme.value = key;
    window.__switchTheme?.(key);
  }

  // API 配置
  async function loadConfig() {
    try {
      const result = await getConfig();
      if (result?.code === 200 && result.data) {
        form.api_key = result.data.api_key || '';
        form.base_url = result.data.base_url || '';
        form.model = result.data.model || '';
      }
    } catch {
      ElMessage.warning('无法连接后端（端口 8054）');
    }
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
      } else {
        ElMessage.error(`保存失败: ${result.message}`);
      }
    } catch (e) {
      ElMessage.error(`保存失败: ${e.message}`);
    } finally {
      saving.value = false;
    }
  }

  return {
    formRef, saving, form, rules,
    themeList, selectedTheme, switchTheme,
    loadConfig, saveConfig,
  };
}
