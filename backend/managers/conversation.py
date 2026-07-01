"""
会话持久化管理器 —— 从 conversation_store.py 重构
"""
import json
from pathlib import Path


class ConversationStore:
    """会话持久化：读写 data/conversations.txt"""

    def __init__(self, file_path=None):
        if file_path is None:
            file_path = Path(__file__).parent.parent / "data" / "conversations.txt"
        self.file_path = Path(file_path)

    def load(self):
        try:
            if self.file_path.exists():
                with open(self.file_path, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            print(f"[ConversationStore] Load error: {e}")
        return {"conversations": [], "currentConvId": None}

    def save(self, conversations, current_conv_id=None):
        try:
            data = {
                "conversations": conversations,
                "currentConvId": current_conv_id,
            }
            self.file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"[ConversationStore] Save error: {e}")
            return False
