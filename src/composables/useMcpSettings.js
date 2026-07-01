/**
 * MCP 配置管理 —— 直接编辑 JSON
 */
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { getMcpConfig, saveMcpConfig } from '../api/index.js';

export function useMcpSettings() {
  const jsonText = ref('');
  const savedText = ref('');
  const loading = ref(false);
  const saving = ref(false);
  const jsonError = ref('');

  const isModified = () => jsonText.value !== savedText.value;

  async function loadConfig() {
    loading.value = true;
    jsonError.value = '';
    try {
      const result = await getMcpConfig();
      const cfg = result?.data || { mcpServers: {} };
      const text = JSON.stringify(cfg, null, 2);
      jsonText.value = text;
      savedText.value = text;
    } catch {
      jsonError.value = '加载 MCP 配置失败';
    } finally {
      loading.value = false;
    }
  }

  // 去掉行注释 + 尾部逗号
  function stripComments(text) {
    text = text.split('\n').map(line => {
      let inString = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"' && (i === 0 || line[i - 1] !== '\\')) inString = !inString;
        else if (!inString) {
          if (line[i] === '#') return line.slice(0, i).trimEnd();
          if (line[i] === '/' && line[i + 1] === '/') return line.slice(0, i).trimEnd();
        }
      }
      return line;
    }).join('\n');
    // 去掉 }, 和 ], 等尾部逗号
    return text.replace(/,\s*(?=[}\]])/g, '');
  }

  function validate() {
    const text = stripComments(jsonText.value).trim();
    if (!text) {
      jsonError.value = '';
      return true;
    }
    try {
      JSON.parse(text);
      jsonError.value = '';
      return true;
    } catch (e) {
      jsonError.value = `JSON 格式错误: ${e.message}`;
      return false;
    }
  }

  // 实时校验（仅当内容与已保存值不同时）
  watch(jsonText, () => {
    if (jsonText.value !== savedText.value) validate();
    else jsonError.value = '';
  });

  async function saveConfig() {
    if (!validate()) return;
    saving.value = true;
    try {
      const config = JSON.parse(stripComments(jsonText.value));
      const result = await saveMcpConfig(config);
      if (result.code === 200) {
        savedText.value = jsonText.value;
        ElMessage.success('MCP 配置已保存 ✓');
      } else {
        ElMessage.error(result.message || '保存失败');
      }
    } catch (e) {
      ElMessage.error(`保存失败: ${e.message}`);
    } finally {
      saving.value = false;
    }
  }

  function formatJson() {
    try {
      const obj = JSON.parse(stripComments(jsonText.value));
      const text = JSON.stringify(obj, null, 2);
      jsonText.value = text;
      jsonError.value = '';
    } catch (e) {
      jsonError.value = `无法格式化: ${e.message}`;
    }
  }

  return {
    jsonText, savedText, loading, saving, jsonError,
    isModified, loadConfig, saveConfig, formatJson, validate,
  };
}
