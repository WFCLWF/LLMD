"""搜索引擎建议代理"""
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from state import http_client

router = APIRouter()

SUGGEST_URLS = {
    "google": "https://suggestqueries.google.com/complete/search?client=chrome&q={query}",
    "bing": "https://api.bing.com/osjson.aspx?query={query}",
    "duckduckgo": "https://duckduckgo.com/ac/?q={query}",
}


@router.get("/api/suggest")
async def suggest(q: str = Query(..., min_length=1), engine: str = Query(default="google")):
    url_template = SUGGEST_URLS.get(engine)
    if not url_template:
        return JSONResponse({"error": "unsupported engine"}, status_code=400)
    try:
        resp = await http_client.get(url_template.format(query=q))
        return JSONResponse(resp.json())
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=502)
