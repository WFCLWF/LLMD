"""
MCP 配置管理器 —— 从 mcp_config_manager.py 重构
"""
import json
from pathlib import Path


class McpConfigManager:
    """MCP 配置管理器，支持配置文件形式管理 MCP 服务器"""

    def __init__(self, config_file=None):
        if config_file is None:
            config_file = Path(__file__).parent.parent / "config" / "mcp_config.json"
        self.config_file = Path(config_file)
        self.config = self._load_config()

    @staticmethod
    def _sanitize_json(text: str) -> str:
        """预处理：去掉注释、尾部逗号，输出合法 JSON"""
        # 1. 去掉行注释（仅在引号外生效）
        result = []
        for line in text.split("\n"):
            in_string = False
            for i, ch in enumerate(line):
                if ch == '"' and (i == 0 or line[i - 1] != '\\'):
                    in_string = not in_string
                elif not in_string:
                    if ch == '#':
                        line = line[:i].rstrip()
                        break
                    if ch == '/' and i + 1 < len(line) and line[i + 1] == '/':
                        line = line[:i].rstrip()
                        break
            result.append(line)
        text = "\n".join(result)
        # 2. 去掉 }, 和 ], 后的尾部逗号
        import re
        text = re.sub(r',\s*(?=[}\]])', '', text)
        return text

    def _load_config(self):
        try:
            if self.config_file.exists():
                with open(self.config_file, "r", encoding="utf-8") as f:
                    raw = f.read()
                return json.loads(self._sanitize_json(raw))
        except Exception as e:
            print(f"[McpConfigManager] 加载配置失败: {e}")
        return {"mcpServers": {}}

    def save_config(self):
        try:
            self.config_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self.config_file, "w", encoding="utf-8") as f:
                json.dump(self.config, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"[McpConfigManager] 保存配置失败: {e}")
            return False

    def get_mcp_servers(self):
        """获取 MultiServerMCPClient 所需格式的服务器配置"""
        servers = self.config.get("mcpServers", {})
        result = {}
        for name, server_cfg in servers.items():
            entry = {}
            transport = server_cfg.get("transport", "streamable_http")
            if transport == "stdio":
                entry["command"] = server_cfg.get("command", "python")
                entry["args"] = server_cfg.get("args", [])
                entry["transport"] = "stdio"
            elif transport == "streamable_http":
                entry["url"] = server_cfg.get("url", "")
                entry["transport"] = "streamable_http"
                if "headers" in server_cfg:
                    entry["headers"] = server_cfg["headers"]
            if entry:
                result[name] = entry
        return result

    def get_server_list(self):
        return [
            {"name": name, **cfg}
            for name, cfg in self.config.get("mcpServers", {}).items()
        ]

    def add_server(self, name, config):
        if "mcpServers" not in self.config:
            self.config["mcpServers"] = {}
        self.config["mcpServers"][name] = config
        return self.save_config()

    def remove_server(self, name):
        if name in self.config.get("mcpServers", {}):
            del self.config["mcpServers"][name]
            return self.save_config()
        return False

    def update_server(self, name, config):
        if name in self.config.get("mcpServers", {}):
            self.config["mcpServers"][name] = config
            return self.save_config()
        return False
