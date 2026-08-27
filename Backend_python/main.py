"""
Python OCR API Server sử dụng FastAPI + PaddleOCR
Hỗ trợ 2 chế độ:
  1. Local PaddleOCR (PP-OCRv5) - chạy trực tiếp trên máy
  2. BanduStudio API (PP-OCRv6) - gọi qua cloud API

Trả về JSON gồm: texts, full_text, và ocr_image (base64 ảnh có bounding box)
"""

import json
import os
import time
import tempfile
import requests
import sys
import base64
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
import uvicorn

# ─────────────────────────────────────────────
# Nạp biến môi trường từ .env
# ─────────────────────────────────────────────
def _load_dotenv():
    env_paths = [
        Path(__file__).parent / ".env",
        Path(__file__).parent.parent / ".env"
    ]
    for env_file in env_paths:
        if env_file.exists():
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        v = v.strip().strip('"').strip("'")
                        os.environ.setdefault(k.strip(), v)

_load_dotenv()

# ─────────────────────────────────────────────
# Cấu hình
# ─────────────────────────────────────────────
BANDAI_JOB_URL = os.getenv("BANDAI_JOB_URL", "https://paddleocr.aistudio-app.com/api/v2/ocr/jobs")
BANDAI_TOKEN   = os.getenv("BANDAI_TOKEN", "")
BANDAI_MODEL   = os.getenv("BANDAI_MODEL", "PP-OCRv6")

OCR_MODE = os.getenv("OCR_MODE", "api")          # "local" | "api"
PORT     = int(os.getenv("PORT", 8001))
DEFAULT_GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")

# ─────────────────────────────────────────────
# Khởi tạo FastAPI
# ─────────────────────────────────────────────
app = FastAPI(
    title="Study Quiz - OCR API Server",
    description="OCR API sử dụng PaddleOCR để trích xuất văn bản từ ảnh / PDF",
    version="1.0.0",
)

# Cho phép Frontend React gọi (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # production: đổi thành domain cụ thể
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Lazy-load PaddleOCR chỉ khi dùng chế độ local
# ─────────────────────────────────────────────
_local_ocr = None

def get_local_ocr():
    global _local_ocr
    if _local_ocr is None:
        try:
            from paddleocr import PaddleOCR
            _local_ocr = PaddleOCR(
                ocr_version="PP-OCRv5",
                use_doc_orientation_classify=False,
                use_doc_unwarping=False,
                use_textline_orientation=False,
                device="cpu",
                enable_mkldnn=False,
                lang="en",
            )
        except ImportError:
            raise HTTPException(
                status_code=500,
                detail="PaddleOCR chưa được cài. Chạy: pip install paddleocr paddlepaddle"
            )
    return _local_ocr


def file_to_base64(file_path: str) -> str:
    """Đọc file ảnh và chuyển thành chuỗi base64 data URI."""
    with open(file_path, "rb") as f:
        img_bytes = f.read()

    # Xác định MIME type dựa vào extension
    ext = Path(file_path).suffix.lower()
    mime_map = {
        ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
        ".png": "image/png", ".webp": "image/webp",
        ".bmp": "image/bmp", ".tiff": "image/tiff",
    }
    mime = mime_map.get(ext, "image/png")

    b64 = base64.b64encode(img_bytes).decode("utf-8")
    return f"data:{mime};base64,{b64}"


def bytes_to_base64(img_bytes: bytes, mime: str = "image/jpeg") -> str:
    """Chuyển bytes ảnh thành chuỗi base64 data URI."""
    b64 = base64.b64encode(img_bytes).decode("utf-8")
    return f"data:{mime};base64,{b64}"


# ─────────────────────────────────────────────
# Hàm OCR LOCAL (PaddleOCR chạy trực tiếp)
# ─────────────────────────────────────────────
def ocr_local(file_bytes: bytes, filename: str) -> dict:
    ocr_engine = get_local_ocr()

    suffix = Path(filename).suffix or ".jpg"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        t0 = time.perf_counter()
        result = ocr_engine.predict(tmp_path)
        elapsed = round(time.perf_counter() - t0, 3)

        texts = []
        pages = {}
        ocr_image_base64 = None

        for idx, res in enumerate(result):
            page_num = str(idx + 1)
            page_texts = []
            if res and "rec_texts" in res:
                for txt in res["rec_texts"]:
                    if txt.strip():
                        page_texts.append(txt.strip())
            pages[page_num] = page_texts
            texts.extend(page_texts)

            # Lưu ảnh có bounding box ra file tạm và chuyển sang base64
            if ocr_image_base64 is None:
                try:
                    output_img_path = tmp_path + f"_ocr_output_{page_num}.png"
                    res.save_to_img(output_img_path)
                    if os.path.exists(output_img_path):
                        ocr_image_base64 = file_to_base64(output_img_path)
                        os.unlink(output_img_path)
                except Exception:
                    pass  # Nếu không tạo được ảnh thì bỏ qua

        return {
            "mode": "local",
            "elapsed_seconds": elapsed,
            "texts": texts,
            "pages": pages,
            "full_text": "\n".join(texts),
            "ocr_image": ocr_image_base64,
        }
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


# ─────────────────────────────────────────────
# Hàm OCR API (BanduStudio cloud)
# ─────────────────────────────────────────────
def ocr_via_api(file_bytes: bytes, filename: str) -> dict:
    headers = {"Authorization": f"bearer {BANDAI_TOKEN}"}
    optional_payload = {
        "useDocOrientationClassify": False,
        "useDocUnwarping": False,
        "useTextlineOrientation": False,
    }

    # Submit job
    data  = {"model": BANDAI_MODEL, "optionalPayload": json.dumps(optional_payload)}
    files = {"file": (filename, file_bytes)}

    t0 = time.perf_counter()
    resp = requests.post(BANDAI_JOB_URL, headers=headers, data=data, files=files, timeout=30)
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"BanduStudio job submit thất bại: {resp.text}")

    job_id = resp.json()["data"]["jobId"]

    # Polling kết quả
    jsonl_url = ""
    for _ in range(60):          # tối đa ~5 phút (60 × 5s)
        time.sleep(5)
        poll = requests.get(f"{BANDAI_JOB_URL}/{job_id}", headers=headers, timeout=15)
        state = poll.json()["data"]["state"]
        if state == "done":
            jsonl_url = poll.json()["data"]["resultUrl"]["jsonUrl"]
            break
        elif state == "failed":
            err = poll.json()["data"].get("errorMsg", "unknown")
            raise HTTPException(status_code=502, detail=f"BanduStudio job thất bại: {err}")

    if not jsonl_url:
        raise HTTPException(status_code=504, detail="OCR job timeout sau 5 phút")

    # Parse kết quả JSONL
    jsonl_resp = requests.get(jsonl_url, timeout=30)
    jsonl_resp.raise_for_status()

    texts = []
    pages = {}
    ocr_images_base64 = []
    page_counter = 0  # Đếm trang thực tế (mỗi ocrResult = 1 trang)

    for line in jsonl_resp.text.strip().split("\n"):
        line = line.strip()
        if not line:
            continue
        result_data = json.loads(line)["result"]

        for ocr_res in result_data.get("ocrResults", []):
            page_counter += 1
            page_num = str(page_counter)
            page_texts = []

            # Trích xuất text cho trang này
            for txt in ocr_res.get("prunedResult", {}).get("rec_texts", []):
                if txt.strip():
                    page_texts.append(txt.strip())

            pages[page_num] = page_texts
            texts.extend(page_texts)

            # Tải ảnh có bounding box từ BanduStudio và chuyển sang base64
            image_url = ocr_res.get("ocrImage")
            if image_url:
                try:
                    img_resp = requests.get(image_url, timeout=30)
                    if img_resp.status_code == 200:
                        content_type = img_resp.headers.get("Content-Type", "image/jpeg")
                        ocr_images_base64.append(bytes_to_base64(img_resp.content, content_type))
                except Exception:
                    pass  # Nếu tải ảnh thất bại thì bỏ qua

    elapsed = round(time.perf_counter() - t0, 3)

    # Trả về ảnh đầu tiên (hoặc tất cả nếu nhiều trang)
    ocr_image = ocr_images_base64[0] if ocr_images_base64 else None

    return {
        "mode": "api",
        "elapsed_seconds": elapsed,
        "texts": texts,
        "pages": pages,
        "full_text": "\n".join(texts),
        "ocr_image": ocr_image,
        "ocr_images": ocr_images_base64 if len(ocr_images_base64) > 1 else None,
    }


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "service": "Study Quiz OCR API",
        "status": "running",
        "mode": OCR_MODE,
        "endpoints": {
            "POST /ocr/scan": "Upload ảnh hoặc PDF, nhận về văn bản + ảnh bounding box (base64)",
            "GET  /health":   "Kiểm tra trạng thái server",
        }
    }


@app.get("/health")
def health():
    return {"status": "ok", "ocr_mode": OCR_MODE}


@app.post("/ocr/scan")
async def scan_document(
    file: UploadFile = File(..., description="Ảnh (jpg/png/webp) hoặc PDF"),
    mode: Optional[str] = Form(None, description="'local' hoặc 'api'. Bỏ trống để dùng cấu hình mặc định")
):
    """
    Nhận ảnh hoặc PDF từ frontend, chạy OCR và trả về văn bản + ảnh có bounding box.

    Response JSON:
    ```json
    {
      "mode": "local | api",
      "elapsed_seconds": 1.23,
      "texts": ["Dòng 1", "Dòng 2", ...],
      "full_text": "Dòng 1\\nDòng 2\\n...",
      "ocr_image": "data:image/jpeg;base64,/9j/4AAQ...",
      "ocr_images": ["data:image/jpeg;base64,...", ...] // chỉ có khi PDF nhiều trang
    }
    ```
    """
    # Kiểm tra loại file
    allowed_types = {
        "image/jpeg", "image/jpg", "image/png", "image/webp",
        "image/bmp", "image/tiff", "application/pdf",
    }
    content_type = file.content_type or ""
    filename     = file.filename or "upload.jpg"

    if content_type not in allowed_types and not filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".pdf", ".bmp")):
        raise HTTPException(
            status_code=400,
            detail=f"Loại file không hỗ trợ: {content_type}. Chỉ hỗ trợ ảnh và PDF."
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="File rỗng")

    # Chọn chế độ OCR
    selected_mode = (mode or OCR_MODE).strip().lower()

    try:
        if selected_mode == "local":
            result = ocr_local(file_bytes, filename)
        else:
            result = ocr_via_api(file_bytes, filename)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()  # In chi tiết lỗi ra console của server để debug
        raise HTTPException(status_code=500, detail=f"OCR thất bại: {str(e)}")

    return JSONResponse(content=result)


# ─────────────────────────────────────────────
# Helper & Schema cho Extract Vocabulary
# ─────────────────────────────────────────────
class ExtractVocabRequest(BaseModel):
    texts: Optional[List[str]] = None
    pages: Optional[dict] = None
    google_api_key: Optional[str] = None


def clean_and_repair_json(raw_text: str) -> str:
    """
    Làm sạch và sửa chữa chuỗi JSON trả về từ Gemini.
    Xử lý: markdown code block, comments, trailing commas, ellipsis, 
    văn bản dư thừa, backtick, thiếu dấu đóng ngoặc.
    """
    import re

    s = raw_text.strip()

    # 1. Loại bỏ markdown code block
    s = re.sub(r"^```(?:json)?\s*\n?", "", s)
    s = re.sub(r"\n?```\s*$", "", s)
    s = s.strip()

    # 2. Loại bỏ mọi backtick còn sót
    s = s.replace("`", "")

    # 3. Cắt bỏ văn bản trước dấu { hoặc [ đầu tiên
    first_brace = -1
    for i, ch in enumerate(s):
        if ch in "{[":
            first_brace = i
            break
    if first_brace > 0:
        s = s[first_brace:]

    # 4. Cắt bỏ văn bản sau dấu } hoặc ] cuối cùng
    last_brace = -1
    for i in range(len(s) - 1, -1, -1):
        if s[i] in "}]":
            last_brace = i
            break
    if last_brace >= 0 and last_brace < len(s) - 1:
        s = s[:last_brace + 1]

    # 5. Loại bỏ C-style comments /* ... */
    s = re.sub(r'/\*.*?\*/', '', s, flags=re.DOTALL)

    # 6. Loại bỏ single-line comments // ... (không chạm http:// https://)
    s = re.sub(r'(?<!:)//.*$', '', s, flags=re.MULTILINE)

    # 7. Loại bỏ # comments (chỉ ngoài chuỗi - xử lý đơn giản)
    s = re.sub(r'^\s*#.*$', '', s, flags=re.MULTILINE)

    # 8. Thay thế dấu ba chấm ... bằng giá trị hợp lệ
    s = re.sub(r'\[\s*\.\.\.\s*\]', '[]', s)
    s = re.sub(r'\{\s*\.\.\.\s*\}', '{}', s)
    s = re.sub(r',\s*\.\.\.', '', s)
    s = re.sub(r'\.\.\.\s*,', '', s)
    s = re.sub(r':\s*\.\.\.', ': null', s)
    # Dấu ... đứng một mình trong mảng (ví dụ: [..., {...}, ...])
    s = re.sub(r'(?<=[\[,])\s*\.\.\.\s*(?=[,\]])', '', s)

    # 9. Loại bỏ trailing commas
    s = re.sub(r',\s*([\]}])', r'\1', s)

    # 10. Cân bằng ngoặc: thêm } hoặc ] nếu thiếu
    open_braces = s.count('{') - s.count('}')
    open_brackets = s.count('[') - s.count(']')
    if open_brackets > 0:
        s += ']' * open_brackets
    if open_braces > 0:
        s += '}' * open_braces

    return s


async def run_gemini_extraction(texts: Optional[List[str]], pages: Optional[dict], api_key: str) -> dict:
    """Gọi Gemini API đúng 1 lần duy nhất với toàn bộ các trang để tránh Rate Limit 429."""
    # Nếu pages rỗng nhưng texts có dữ liệu, chuyển texts thành page "1"
    if pages is not None and len(pages) == 0 and texts:
        pages = {"1": texts}

    # Nếu pages không có trang nào có nội dung, fallback sang texts
    if pages:
        all_empty = all(len(v) == 0 for v in pages.values())
        if all_empty and texts:
            pages = {"1": texts}

    if not texts and (not pages or all(len(v) == 0 for v in pages.values())):
        return {"vocabulary_list": [], "vocabulary_by_page": {}}

    # Nếu chỉ có texts (flat list), ta coi đó là trang "1" để đồng bộ cách xử lý
    if not pages:
        pages = {"1": texts}

    from google import genai
    import asyncio

    client = genai.Client(api_key=api_key)
    # print("BAAAA")
    # for m in client.models.list():
    #   print(m.name)
    SYSTEM_PROMPT = """
Bạn là chuyên gia ngôn ngữ học. Trích xuất từ vựng tiếng Anh quan trọng từ văn bản OCR theo từng trang.

YÊU CẦU:
1. Với mỗi trang (key "1", "2", ...), trích xuất khoảng 25-30 từ vựng mỗi trang  và tối thiểu phải 25 từ.
2. Ưu tiên: từ vựng đáp án, từ học thuật, collocations, idioms, phrasal verbs.
3. Trả về JSON hợp lệ, key trong "vocabulary_by_page" khớp với số trang đầu vào.
4. Mỗi entry gồm: term, base_form, ipa, pos, meaning (tiếng Việt), hint, level.
5. KHÔNG dùng "...", placeholder, markdown. Chỉ JSON thuần.
6. Không lấy tiêu đề để làm từ vựng , chữ như (A, B, C ,... ,Y , Z) , ưu tiên các chữ trong phân loại đáp án ví dụ A. xyz thì lấy xyz
7. Lưu ý : Mỗi trang chỉ tối đa 35 từ , tuyệt đối không quá 35 từ và các từ không được trùng lặp
Ví dụ:
{"vocabulary_by_page":{"1":[{"term":"attract","base_form":"attract","ipa":"/əˈtrækt/","pos":"verb","meaning":"thu hút","hint":"Her ideas attracted attention.","level":"B1"}]}}
"""

    prompt = f"{SYSTEM_PROMPT}\n\nDữ liệu OCR phân theo trang:\n{json.dumps(pages, ensure_ascii=False)}"
    print("prompt" , prompt)
    # GỌI 1 REQUEST DUY NHẤT LÊN GEMINI
    loop = asyncio.get_event_loop()
    response = None
    
    print(f"[Gemini] Gửi 1 request duy nhất cho {len(pages)} trang...")
    
    for attempt in range(3):
        try:
            response = await loop.run_in_executor(
                None,
                lambda: client.models.generate_content(
                    # model="gemini-3.5-flash",
                    model="gemini-3.6-flash",
                    contents=prompt,
                    config=genai.types.GenerateContentConfig(
                        temperature=0.2,
                        response_mime_type="application/json",
                    ),
                )
            )
            break
        except Exception as err:
            err_str = str(err).lower()
            if "429" in err_str or "quota" in err_str or "rate" in err_str:
                wait = 10 * (attempt + 1)
                print(f"[Rate limit] Gặp lỗi 429 khi gọi Gemini, thử lại sau {wait}s...")
                await asyncio.sleep(wait)
            else:
                raise err
    else:
        raise Exception("Không thể kết nối đến Gemini API sau nhiều lần thử do Rate Limit.")

    raw_text = response.text.strip()
    
    try:
        result_json = json.loads(raw_text)
    except json.JSONDecodeError:
        try:
            result_json = json.loads(clean_and_repair_json(raw_text))
        except json.JSONDecodeError:
            # Fallback: Trích xuất các object JSON riêng lẻ nếu output bị cắt (do vượt giới hạn token)
            import re
            objects = re.findall(r'\{[^{}]*\}', raw_text)
            vocab_by_page = {}
            for obj in objects:
                try:
                    entry = json.loads(obj)
                    if "term" in entry:
                        vocab_by_page.setdefault("1", []).append(entry)
                except Exception:
                    continue
            result_json = {
                "vocabulary_by_page": vocab_by_page,
                "vocabulary_list": [],
            }
            print(f"Fallback: thu thập được {len(vocab_by_page.get('1', []))} từ vựng hợp lệ.")

    vocab_by_page = result_json.get("vocabulary_by_page", {})

    if not vocab_by_page:
        old_list = result_json.get("vocabulary_list", [])
        if old_list:
            vocab_by_page = {"1": old_list}
            result_json["vocabulary_by_page"] = vocab_by_page

    flat_list = []
    for page_num, items in vocab_by_page.items():
        if isinstance(items, list):
            for item in items:
                if isinstance(item, dict):
                    enriched = dict(item)
                    enriched["page"] = str(page_num)
                    flat_list.append(enriched)

    result_json["vocabulary_list"] = flat_list
    result_json["vocabulary_by_page"] = vocab_by_page

    return result_json


@app.post("/ocr/extract-vocabulary")
async def extract_vocabulary(req: ExtractVocabRequest):
    """
    Nhận mảng OCR texts hoặc dictionary pages và dùng Google Gemini API để trích xuất từ vựng theo chuẩn JSON.
    """
    if not req.texts and not req.pages:
        raise HTTPException(status_code=400, detail="Cần truyền texts hoặc pages")

    api_key = req.google_api_key or os.getenv("GOOGLE_API_KEY") or DEFAULT_GOOGLE_API_KEY
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="Thiếu Google API Key. Truyền trong body hoặc đặt biến môi trường GOOGLE_API_KEY."
        )

    try:
        result_json = await run_gemini_extraction(req.texts, req.pages, api_key)
        return JSONResponse(content=result_json)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Lỗi parse JSON từ Gemini")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Lỗi khi gọi Gemini API: {str(e)}")


@app.post("/ocr/scan-and-extract")
async def scan_and_extract(
    file: UploadFile = File(..., description="Ảnh (jpg/png/webp) hoặc PDF"),
    mode: Optional[str] = Form(None, description="'local' hoặc 'api'"),
    google_api_key: Optional[str] = Form(None, description="Google API Key")
):
    """
    1. Chạy OCR (local hoặc API) để lấy văn bản.
    2. Gọi luôn Google Gemini API (async) để trích xuất từ vựng phân chia theo trang.
    3. Trả về Frontend: ảnh, texts, pages, vocabulary_list và vocabulary_by_page.
    """
    allowed_types = {
        "image/jpeg", "image/jpg", "image/png", "image/webp",
        "image/bmp", "image/tiff", "application/pdf",
    }
    content_type = file.content_type or ""
    filename     = file.filename or "upload.jpg"

    if content_type not in allowed_types and not filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".pdf", ".bmp")):
        raise HTTPException(
            status_code=400,
            detail=f"Loại file không hỗ trợ: {content_type}. Chỉ hỗ trợ ảnh và PDF."
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="File rỗng")

    api_key = google_api_key or os.getenv("GOOGLE_API_KEY") or DEFAULT_GOOGLE_API_KEY
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="Thiếu Google API Key."
        )

    selected_mode = (mode or OCR_MODE).strip().lower()

    # Bước 1: Gọi OCR
    try:
        if selected_mode == "local":
            ocr_result = ocr_local(file_bytes, filename)
        else:
            ocr_result = ocr_via_api(file_bytes, filename)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"OCR thất bại: {str(e)}")

    texts = ocr_result.get("texts", [])
    pages = ocr_result.get("pages", {})
    ocr_image = ocr_result.get("ocr_image")
    ocr_images = ocr_result.get("ocr_images")

    # Bước 2: Trích xuất từ vựng qua Google API (async)
    try:
        # Nếu pages rỗng, fallback dùng texts
        extraction_pages = pages if pages else ({"1": texts} if texts else {})
        gemini_result = await run_gemini_extraction(texts=None, pages=extraction_pages, api_key=api_key)
        vocabulary_list = gemini_result.get("vocabulary_list", [])
        vocabulary_by_page = gemini_result.get("vocabulary_by_page", {})
    except json.JSONDecodeError as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Gemini trả về JSON không hợp lệ: {str(e)}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Google API Extract thất bại: {str(e)}")

    # Trả kết quả ghép chung (ảnh, text sau khi extract, vocabulary_list, vocabulary_by_page)
    return JSONResponse(content={
        "mode": ocr_result.get("mode"),
        "elapsed_seconds": ocr_result.get("elapsed_seconds"),
        "ocr_image": ocr_image,
        "ocr_images": ocr_images,
        "texts": texts,
        "pages": pages,
        "vocabulary_list": vocabulary_list,
        "vocabulary_by_page": vocabulary_by_page
    })


# ─────────────────────────────────────────────
# Schema & Endpoint: Trích xuất từ vựng 1 trang đơn lẻ
# ─────────────────────────────────────────────
class ExtractSinglePageRequest(BaseModel):
    page_number: str                    # Số trang, ví dụ "29"
    texts: List[str]                    # Danh sách các dòng OCR của trang đó
    google_api_key: Optional[str] = None


async def run_gemini_single_page(page_number: str, texts: List[str], api_key: str) -> List[dict]:
    """
    Gọi Gemini 1 lần duy nhất cho đúng 1 trang.
    Trả về danh sách từ vựng (list) của trang đó.
    """
    from google import genai
    import asyncio

    if not texts:
        return []

    client = genai.Client(api_key=api_key)

    SINGLE_PAGE_PROMPT = f"""
Bạn là chuyên gia ngôn ngữ học. Hãy trích xuất từ vựng tiếng Anh từ văn bản OCR dưới đây.

YÊU CẦU BẮT BUỘC:
1. Trích xuất tối thiểu 40 từ với trường hợp văn bản trên 40 từ , tối đa 50 từ/cụm từ quan trọng từ văn bản.
2. Ưu tiên: từ vựng đáp án chính xác, từ học thuật, collocations, idioms, phrasal verbs.
3. Mỗi entry gồm: term, base_form, ipa, pos, meaning (tiếng Việt), hint (câu ví dụ tiếng Anh), level (A1-C2).
4. Trả về MỘT MẢNG JSON thuần, KHÔNG có wrapper object, KHÔNG dùng markdown.
5. Trường hợp nếu văn bản dưới 40 từ thì có thể chỉ lấy những từ có trong văn bản đó và không cần phải đủ 40 từ
6. Không lấy tiêu đề để làm từ vựng , chữ như (A, B, C ,... ,Y , Z) , ưu tiên các chữ trong phân loại đáp án ví dụ A. xyz thì lấy xyz
Ví dụ định dạng trả về (đây là 1 phần tử mẫu):
[
  {{
    "term": "acquire",
    "base_form": "acquire",
    "ipa": "/əˈkwaɪər/",
    "pos": "verb",
    "meaning": "đạt được, thu được",
    "hint": "She acquired new skills during the course.",
    "level": "B2"
  }}
]

Văn bản OCR của trang {page_number}:
{json.dumps(texts, ensure_ascii=False)}
"""

    loop = asyncio.get_event_loop()
    response = None
    print("promt",SINGLE_PAGE_PROMPT)    
    for attempt in range(4):
        try:
            response = await loop.run_in_executor(
                None,
                lambda p=SINGLE_PAGE_PROMPT: client.models.generate_content(
                    model="gemini-3.5-flash",
                    contents=p,
                    config=genai.types.GenerateContentConfig(
                        temperature=0.3,
                        response_mime_type="application/json",
                    ),
                )
            )
            break
        except Exception as err:
            err_str = str(err).lower()
            if "429" in err_str or "quota" in err_str or "rate" in err_str:
                wait = 10 * (attempt + 1)
                print(f"[Rate limit] Trang {page_number} bị 429, thử lại sau {wait}s ({attempt+1}/4)...")
                await asyncio.sleep(wait)
            else:
                print(f"[Gemini Error] Trang {page_number}: {err}")
                raise

    if response is None:
        raise Exception(f"Không thể kết nối Gemini cho trang {page_number} sau nhiều lần thử.")

    raw_text = response.text.strip()

    # Parse JSON array
    vocab_list = []
    try:
        parsed = json.loads(raw_text)
        if isinstance(parsed, list):
            vocab_list = parsed
        elif isinstance(parsed, dict):
            # Gemini trả về object thay vì array → tìm mảng con
            for v in parsed.values():
                if isinstance(v, list):
                    vocab_list = v
                    break
    except json.JSONDecodeError:
        try:
            cleaned = clean_and_repair_json(raw_text)
            parsed = json.loads(cleaned)
            if isinstance(parsed, list):
                vocab_list = parsed
            elif isinstance(parsed, dict):
                for v in parsed.values():
                    if isinstance(v, list):
                        vocab_list = v
                        break
        except json.JSONDecodeError:
            import re
            print(f"[Parse Error] Trang {page_number}: JSON lỗi, dùng fallback regex...")
            objects = re.findall(r'\{[^{}]*\}', raw_text)
            for obj_str in objects:
                try:
                    entry = json.loads(obj_str)
                    if "term" in entry:
                        vocab_list.append(entry)
                except Exception:
                    continue

    # Thêm trường page vào mỗi entry
    for item in vocab_list:
        if isinstance(item, dict):
            item["page"] = str(page_number)

    print(f"[Gemini SinglePage] Trang {page_number}: trích xuất được {len(vocab_list)} từ vựng.")
    return vocab_list


@app.post("/ocr/extract-single-page")
async def extract_single_page(req: ExtractSinglePageRequest):
    """
    Trích xuất từ vựng cho MỘT trang đơn lẻ.

    Request body:
    ```json
    {
      "page_number": "29",
      "texts": ["sentence one", "sentence two", "..."],
      "google_api_key": "AIza..."   // tuỳ chọn
    }
    ```

    Response:
    ```json
    {
      "page_number": "29",
      "count": 27,
      "vocabulary": [
        {
          "term": "acquire",
          "base_form": "acquire",
          "ipa": "/əˈkwaɪər/",
          "pos": "verb",
          "meaning": "đạt được",
          "hint": "She acquired new skills.",
          "level": "B2",
          "page": "29"
        }
      ]
    }
    ```
    """
    if not req.texts:
        raise HTTPException(status_code=400, detail="Trường 'texts' không được rỗng")

    page_number = str(req.page_number).strip()
    if not page_number:
        raise HTTPException(status_code=400, detail="Trường 'page_number' không được rỗng")

    api_key = req.google_api_key or os.getenv("GOOGLE_API_KEY") or DEFAULT_GOOGLE_API_KEY
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="Thiếu Google API Key. Truyền trong body (google_api_key) hoặc đặt biến môi trường GOOGLE_API_KEY."
        )

    try:
        vocabulary = await run_gemini_single_page(page_number, req.texts, api_key)
        return JSONResponse(content={
            "page_number": page_number,
            "count": len(vocabulary),
            "vocabulary": vocabulary,
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Lỗi khi trích xuất trang {page_number}: {str(e)}")


# ─────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────
if __name__ == "__main__":
    # Tránh dùng emoji hoặc ký tự Unicode đặc biệt có thể gây lỗi mã hóa trên Windows console
    print(f"OCR Server khoi dong - che do: {OCR_MODE} - port: {PORT}")
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
