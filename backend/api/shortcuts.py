"""快捷启动接口"""
import json
from pathlib import Path

from fastapi import APIRouter

from models.schemas import ShortcutsBody

router = APIRouter()

_SHORTCUTS_PATH = Path(__file__).parent.parent / "data" / "shortcuts.json"


@router.get("/api/shortcuts")
async def get_shortcuts():
    try:
        if _SHORTCUTS_PATH.exists():
            return {"code": 200, "data": json.loads(_SHORTCUTS_PATH.read_text(encoding="utf-8"))}
    except Exception:
        pass
    return {"code": 200, "data": []}


@router.post("/api/shortcuts")
async def save_shortcuts(req: ShortcutsBody):
    try:
        _SHORTCUTS_PATH.parent.mkdir(parents=True, exist_ok=True)
        _SHORTCUTS_PATH.write_text(json.dumps(req.data, indent=2, ensure_ascii=False), encoding="utf-8")
        return {"code": 200}
    except Exception:
        return {"code": 500}
