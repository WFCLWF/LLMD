<template>
  <el-dialog :model-value="visible" @update:model-value="emit('update:visible', $event)"
    title="设置" width="520px" append-to-body :close-on-click-modal="true"
    :close-on-press-escape="true" @open="onOpen" destroy-on-close
    aria-label="设置对话框">
    <el-tabs v-model="activeTab">
      <!-- ===== API 设置 ===== -->
      <el-tab-pane label="API 设置" name="api">
        <el-form label-position="top" :model="form" ref="formRef" :rules="rules" class="settings-form">
          <el-form-item label="API Key" prop="api_key">
            <el-input v-model="form.api_key" type="password" show-password placeholder="sk-..." autocomplete="off" />
          </el-form-item>
          <el-form-item label="Base URL" prop="base_url">
            <el-input v-model="form.base_url" placeholder="https://api.deepseek.com" autocomplete="off" />
          </el-form-item>
          <el-form-item label="Model" prop="model">
            <el-input v-model="form.model" placeholder="deepseek-v4-flash" autocomplete="off" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- ===== 系统配色 ===== -->
      <el-tab-pane label="系统配色" name="theme">
        <div class="theme-grid" role="radiogroup" aria-label="选择主题配色">
          <div v-for="t in themeList" :key="t.key"
            class="theme-card" :class="{ active: selectedTheme === t.key }"
            role="radio" :aria-checked="selectedTheme === t.key"
            tabindex="0"
            @click="switchTheme(t.key)"
            @keydown.enter="switchTheme(t.key)"
            @keydown.space.prevent="switchTheme(t.key)"
          >
            <span class="theme-dot" :style="{ background: t.gradient }" aria-hidden="true"></span>
            <span class="theme-name">{{ t.label }}</span>
            <span v-if="selectedTheme === t.key" class="theme-check" aria-hidden="true">✓</span>
          </div>
        </div>
      </el-tab-pane>

      <!-- ===== MCP 设置 ===== -->
      <el-tab-pane label="MCP 设置" name="mcp">
        <div class="mcp-panel">
          <div class="mcp-toolbar">
            <span class="mcp-hint">直接编辑 MCP 服务器配置 (JSON)</span>
            <div class="mcp-actions">
              <el-button size="small" text @click="loadMcpConfig" :loading="loading">重置</el-button>
              <el-button size="small" text @click="formatJson" :disabled="!!jsonError">格式化</el-button>
            </div>
          </div>
          <el-input
            v-model="jsonText"
            type="textarea"
            :rows="14"
            :disabled="loading"
            class="mcp-editor"
            :class="{ 'has-error': jsonError }"
            placeholder='{ "mcpServers": { ... } }'
            aria-label="MCP 配置 JSON 编辑器"
            @blur="validate"
          />
          <p v-if="jsonError" class="mcp-error" role="alert">{{ jsonError }}</p>
        </div>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="emit('update:visible', false)">取消</el-button>
        <el-button
          v-if="activeTab === 'api'"
          type="primary"
          @click="saveConfig"
          :loading="saving"
        >保存配置</el-button>
        <el-button
          v-if="activeTab === 'mcp'"
          type="primary"
          @click="saveMcpConfig"
          :loading="savingMcp"
          :disabled="!!jsonError"
        >保存配置</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useSettings } from '../composables/useSettings.js';
import { useMcpSettings } from '../composables/useMcpSettings.js';

const props = defineProps({ visible: Boolean });
const emit = defineEmits(['update:visible', 'saved']);

const activeTab = ref('api');

const {
  formRef, saving, form, rules,
  themeList, selectedTheme, switchTheme,
  loadConfig, saveConfig,
} = useSettings(emit);

const {
  jsonText, loading, saving: savingMcp, jsonError,
  loadConfig: loadMcpConfig, saveConfig: saveMcpConfig, formatJson, validate,
} = useMcpSettings();

watch(activeTab, (tab) => {
  if (tab === 'mcp') loadMcpConfig();
});

function onOpen() {
  activeTab.value = 'api';
  loadConfig();
  loadMcpConfig();
}
</script>

<style scoped>
@import url('../styles/settings.css');
</style>
