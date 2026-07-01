import json
import os
from pathlib import Path


class ConfigManager:
    """配置管理器，负责读取和修改配置文件"""
    
    def __init__(self, config_file=None):
        if config_file is None:
            config_file = Path(__file__).parent / "config.json"
        self.config_file = Path(config_file)
        self.config = self._load_config()
    
    def _load_config(self):
        """从配置文件加载配置"""
        try:
            if self.config_file.exists():
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            print(f"Error loading config: {e}")
        
        # 返回默认配置
        return {
            "api": {
                "api_key": "",
                "base_url": "https://api.deepseek.com",
                "model": "deepseek-v4-flash"
            },
            "chat": {
                "messages_length": 30
            },
            "app": {
                "name": "LLMD Chat",
                "version": "0.1.0"
            }
        }
    
    def save_config(self):
        """保存配置到文件"""
        try:
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Error saving config: {e}")
            return False
    
    def get_api_config(self):
        """获取 API 配置"""
        return self.config.get("api", {})
    
    def get_chat_config(self):
        """获取聊天配置"""
        return self.config.get("chat", {})
    
    def update_api_config(self, api_key=None, base_url=None, model=None):
        """更新 API 配置"""
        if api_key:
            self.config["api"]["api_key"] = api_key
        if base_url:
            self.config["api"]["base_url"] = base_url
        if model:
            self.config["api"]["model"] = model
        return self.save_config()
    
    def update_chat_config(self, messages_length=None):
        """更新聊天配置"""
        if messages_length:
            self.config["chat"]["messages_length"] = messages_length
        return self.save_config()
    
    def get_all_config(self):
        """获取所有配置"""
        return self.config
