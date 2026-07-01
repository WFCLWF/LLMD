"""
LLM 直调服务 —— 保留 /api/chat 接口使用
"""
from openai import OpenAI

from managers.config import ConfigManager
from services.prompt import SYSTEM_PROMPT


class LLMChat:
    def __init__(self):
        cfg = ConfigManager().get_api_config()
        self.client = OpenAI(
            api_key=cfg.get("api_key"),
            base_url=cfg.get("base_url"),
        )
        self.model = cfg.get("model", "deepseek-v4-flash")
        self.messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        self.max_messages = 30

    def add_message(self, role, content):
        self.messages.append({"role": role, "content": content})
        if len(self.messages) > self.max_messages:
            self.messages.pop(0)

    def _build_messages(self, user_input, history=None):
        if history and len(history) > 0:
            msgs = [{"role": m["role"], "content": m["content"]} for m in history]
            msgs.insert(0, {"role": "system", "content": self.messages[0]["content"]})
        else:
            msgs = list(self.messages)
        msgs.append({"role": "user", "content": user_input})
        return msgs

    def chat(self, user_input, history=None):
        msgs = self._build_messages(user_input, history)
        resp = self.client.chat.completions.create(
            model=self.model, messages=msgs, stream=False
        )
        return resp.choices[0].message.content

    def chat_stream(self, user_input, history=None):
        msgs = self._build_messages(user_input, history)
        resp = self.client.chat.completions.create(
            model=self.model, messages=msgs, stream=True
        )
        for chunk in resp:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
