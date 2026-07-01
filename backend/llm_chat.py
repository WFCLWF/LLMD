from openai import OpenAI
from config_manager import ConfigManager


class LLMChat:
    def __init__(self):
        # 从配置文件读取配置
        self.config_manager = ConfigManager()
        api_config = self.config_manager.get_api_config()
        
        self.api_key = api_config.get("api_key", "sk-79bd394e57b24b4cb26c8e0d8162529f")
        self.base_url = api_config.get("base_url", "https://api.deepseek.com")
        self.model = api_config.get("model", "deepseek-v4-flash")

        self.client = OpenAI(api_key=self.api_key, base_url=self.base_url)
        self.messages = [
        {"role": "system", "content": (
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
        )},
    ]
        self.messages_length = 30  # 上下文最大长度

    # 新增对话消息，超长自动清理历史
    def add_message(self, role, content):
        self.messages.append({"role": role, "content": content})
        if len(self.messages) > self.messages_length:
            self.messages.pop(0)

    # 对话主逻辑（非流式）
    def chat(self, user_input):
        self.add_message("user", user_input)
        response = self.client.chat.completions.create(
            model=self.model, messages=self.messages, stream=False
        )
        result = response.choices[0].message.content
        self.add_message("assistant", result)
        return result

    # 流式对话
    def chat_stream(self, user_input):
        self.add_message("user", user_input)
        response = self.client.chat.completions.create(
            model=self.model, messages=self.messages, stream=True
        )
        full_content = ""
        for chunk in response:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                full_content += content
                yield content
        self.add_message("assistant", full_content)
