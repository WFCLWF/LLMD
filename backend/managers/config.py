"""
配置管理器 —— 从 config_manager.py 重构
负责读取和修改 API 配置文件
"""
import json
from pathlib import Path


class ConfigManager:
    """配置管理器，负责读取和修改配置文件"""

    def __init__(self, config_file=None):
        if config_file is None:
            config_file = Path(__file__).parent.parent / "config" / "config.json"
        self.config_file = Path(config_file)
        self.config = self._load_config()

    def _load_config(self):
        try:
            if self.config_file.exists():
                with open(self.config_file, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            print(f"Error loading config: {e}")

        return {
            "api": {
                "api_key": "",
                "base_url": "https://api.deepseek.com",
                "model": "deepseek-v4-flash",
            },
            "chat": {"messages_length": 30},
            "app": {"name": "LLMD Chat", "version": "0.1.0"},
        }

    def save_config(self):
        try:
            self.config_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self.config_file, "w", encoding="utf-8") as f:
                json.dump(self.config, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Error saving config: {e}")
            return False

    def get_api_config(self):
        return self.config.get("api", {})

    def get_chat_config(self):
        return self.config.get("chat", {})

    def update_api_config(self, api_key=None, base_url=None, model=None):
        if api_key:
            self.config["api"]["api_key"] = api_key
        if base_url:
            self.config["api"]["base_url"] = base_url
        if model:
            self.config["api"]["model"] = model
        return self.save_config()

    def update_chat_config(self, messages_length=None):
        if messages_length:
            self.config["chat"]["messages_length"] = messages_length
        return self.save_config()

    def get_all_config(self):
        return self.config
