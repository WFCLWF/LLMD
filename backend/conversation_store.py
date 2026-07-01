import json
from pathlib import Path


class ConversationStore:
    """会话持久化：读写 backend/conversations.txt"""

    def __init__(self, file_path=None):
        if file_path is None:
            file_path = Path(__file__).parent / "conversations.txt"
        self.file_path = Path(file_path)

    def load(self):
        """加载全量会话数据"""
        try:
            if self.file_path.exists():
                with open(self.file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            print(f"[ConversationStore] Load error: {e}")
        return {"conversations": [], "currentConvId": None}

    def save(self, conversations, current_conv_id=None):
        """全量覆写会话数据（新增/删除均走此方法）"""
        try:
            data = {
                "conversations": conversations,
                "currentConvId": current_conv_id,
            }
            with open(self.file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"[ConversationStore] Save error: {e}")
            return False
