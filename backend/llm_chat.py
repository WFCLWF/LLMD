from openai import OpenAI
from config_manager import ConfigManager

SYSTEM_PROMPT = (
    "你是一个资深程序员助手，能熟练写各种代码。"
    "返回代码时必须严格遵守以下 Markdown 格式：\n"
    "1. 使用三个反引号包裹代码块，开头的 ``` 后紧跟语言名（如 ```python、```bash），然后立刻换行；\n"
    "2. 代码内容多行排列，行与行之间不要空行，每行一条语句，保持标准缩进（Python 用 4 空格）；\n"
    "3. 结尾的 ``` 独占一行；\n"
    "4. 行内代码用单个反引号包裹。\n"
    "示例：\n"
    "```python\n"
    "import numpy as np\n"
    "x = np.array([1, 2, 3])\n"
    "print(x.sum())\n"
    "```"
)


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
        """构建消息列表：优先使用传入的历史上下文，否则用实例缓存"""
        if history and len(history) > 0:
            # 前端传了当前会话的完整历史，直接在此基础上追加新消息
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
        result = resp.choices[0].message.content
        return result

    def chat_stream(self, user_input, history=None):
        msgs = self._build_messages(user_input, history)
        resp = self.client.chat.completions.create(
            model=self.model, messages=msgs, stream=True
        )
        full = ""
        for chunk in resp:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                full += content
                yield content
