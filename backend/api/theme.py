"""主题配置接口"""
import json
from pathlib import Path

from fastapi import APIRouter

from models.schemas import ThemeBody

router = APIRouter()

_THEME_PATH = Path(__file__).parent.parent / "data" / "theme.json"


@router.get("/api/config/theme")
async def load_theme():
    try:
        if _THEME_PATH.exists():
            return {"code": 200, "data": json.loads(_THEME_PATH.read_text(encoding="utf-8"))}
    except Exception:
        pass
    return {"code": 200, "data": {"theme": "warm"}}


@router.put("/api/config/theme")
async def save_theme(req: ThemeBody):
    try:
        _THEME_PATH.parent.mkdir(parents=True, exist_ok=True)
        _THEME_PATH.write_text(json.dumps({"theme": req.theme}), encoding="utf-8")
        return {"code": 200}
    except Exception:
        return {"code": 500}
