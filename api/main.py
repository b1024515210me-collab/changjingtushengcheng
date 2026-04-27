from __future__ import annotations

import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from PIL import Image, ImageDraw, ImageEnhance

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
ASSETS_DIR = DATA_DIR / "assets"
OUTPUTS_DIR = DATA_DIR / "outputs"

for p in (ASSETS_DIR, OUTPUTS_DIR):
    p.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Product Scene Generator API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ASSETS: dict[str, dict[str, Any]] = {}
TASKS: dict[str, dict[str, Any]] = {}
IMAGES: dict[str, dict[str, Any]] = {}


class GenerateRequest(BaseModel):
    productAssetId: str
    sceneRefAssetId: str | None = None
    style: str = Field(default="realistic")
    sceneStyle: str = Field(default="living_room")
    ratio: str = Field(default="1:1")
    numOutputs: int = Field(default=1, ge=1, le=4)


class RemoveWatermarkRequest(BaseModel):
    imageId: str


class EditImageRequest(BaseModel):
    imageId: str
    prompt: str = Field(min_length=2)


def _new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:10]}"


def _ratio_to_size(ratio: str) -> tuple[int, int]:
    presets = {
        "1:1": (1024, 1024),
        "4:5": (1024, 1280),
        "16:9": (1280, 720),
        "9:16": (720, 1280),
    }
    return presets.get(ratio, (1024, 1024))


def _scene_colors(scene_style: str) -> tuple[str, str]:
    palette = {
        "living_room": ("#f7e7d3", "#ddd0bc"),
        "kitchen": ("#e6f2ff", "#c4d9ef"),
        "office_desk": ("#eaeaea", "#c7c7c7"),
        "outdoor": ("#dff4e3", "#b7dfbd"),
        "cafe": ("#f5e2c8", "#d8b78f"),
    }
    return palette.get(scene_style, ("#f0f0f0", "#d3d3d3"))


def _load_rgba(path: Path) -> Image.Image:
    with Image.open(path) as image:
        return image.convert("RGBA")


def _mock_generate_image(
    product_path: Path,
    scene_ref_path: Path | None,
    style: str,
    scene_style: str,
    ratio: str,
) -> Path:
    width, height = _ratio_to_size(ratio)
    bg_a, bg_b = _scene_colors(scene_style)

    canvas = Image.new("RGBA", (width, height), bg_a)
    gradient = Image.new("RGBA", (width, height), bg_b)
    mask = Image.linear_gradient("L").resize((width, height))
    canvas = Image.composite(gradient, canvas, mask)

    if scene_ref_path:
        ref = _load_rgba(scene_ref_path).resize((width, height))
        canvas.alpha_composite(ref, (0, 0))
        canvas = ImageEnhance.Brightness(canvas).enhance(0.8)

    product = _load_rgba(product_path)
    product.thumbnail((int(width * 0.58), int(height * 0.58)))

    x = (width - product.width) // 2
    y = int(height * 0.5 - product.height * 0.5)
    canvas.alpha_composite(product, (x, y))

    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle(
        [(30, height - 140), (width - 30, height - 30)],
        radius=24,
        fill=(20, 20, 20, 80),
    )
    draw.text(
        (48, height - 118),
        f"{style} / {scene_style} / {ratio}",
        fill=(255, 255, 255, 235),
    )

    file_path = OUTPUTS_DIR / f"{_new_id('img')}.png"
    canvas.convert("RGB").save(file_path, format="PNG")
    return file_path


def _mock_remove_watermark(source: Path) -> Path:
    with Image.open(source).convert("RGB") as image:
        cleaned = ImageEnhance.Sharpness(image).enhance(1.15)
        output = OUTPUTS_DIR / f"{_new_id('img')}.png"
        cleaned.save(output, format="PNG")
        return output


def _mock_edit_image(source: Path, prompt: str) -> Path:
    with Image.open(source).convert("RGBA") as image:
        overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        draw.rounded_rectangle(
            [(24, 24), (image.width - 24, 120)],
            radius=18,
            fill=(0, 0, 0, 120),
        )
        draw.text((40, 52), f"EDIT: {prompt[:70]}", fill=(255, 255, 255, 250))
        edited = Image.alpha_composite(image, overlay).convert("RGB")
        output = OUTPUTS_DIR / f"{_new_id('img')}.png"
        edited.save(output, format="PNG")
        return output


def _register_image(task_id: str, file_path: Path, kind: str, parent_id: str | None = None) -> dict[str, str]:
    image_id = _new_id("img")
    IMAGES[image_id] = {
        "id": image_id,
        "taskId": task_id,
        "parentImageId": parent_id,
        "kind": kind,
        "storagePath": str(file_path),
        "url": f"/api/v1/images/{image_id}",
        "createdAt": datetime.utcnow().isoformat(),
    }
    return {"id": image_id, "url": IMAGES[image_id]["url"]}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/v1/assets/upload")
async def upload_asset(file: UploadFile = File(...), assetType: str = "product") -> dict[str, str]:
    ext = Path(file.filename or "upload.png").suffix or ".png"
    asset_id = _new_id("ast")
    file_path = ASSETS_DIR / f"{asset_id}{ext}"

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File exceeds 10MB limit")

    file_path.write_bytes(content)
    ASSETS[asset_id] = {
        "id": asset_id,
        "assetType": assetType,
        "filename": file.filename,
        "storagePath": str(file_path),
        "createdAt": datetime.utcnow().isoformat(),
    }
    return {"assetId": asset_id, "assetType": assetType}


@app.post("/api/v1/tasks/generate")
def create_generate_task(payload: GenerateRequest) -> dict[str, Any]:
    if payload.productAssetId not in ASSETS:
        raise HTTPException(status_code=404, detail="Product asset not found")
    if payload.sceneRefAssetId and payload.sceneRefAssetId not in ASSETS:
        raise HTTPException(status_code=404, detail="Scene reference asset not found")

    task_id = _new_id("tsk")
    TASKS[task_id] = {
        "id": task_id,
        "type": "generate",
        "status": "running",
        "params": payload.model_dump(),
        "images": [],
        "createdAt": datetime.utcnow().isoformat(),
    }

    product_path = Path(ASSETS[payload.productAssetId]["storagePath"])
    scene_ref_path = (
        Path(ASSETS[payload.sceneRefAssetId]["storagePath"]) if payload.sceneRefAssetId else None
    )

    try:
        for _ in range(payload.numOutputs):
            image_path = _mock_generate_image(
                product_path=product_path,
                scene_ref_path=scene_ref_path,
                style=payload.style,
                scene_style=payload.sceneStyle,
                ratio=payload.ratio,
            )
            TASKS[task_id]["images"].append(_register_image(task_id, image_path, "generated"))
        TASKS[task_id]["status"] = "succeeded"
    except Exception as exc:  # noqa: BLE001
        TASKS[task_id]["status"] = "failed"
        TASKS[task_id]["error"] = str(exc)

    return {"taskId": task_id, "status": TASKS[task_id]["status"]}


@app.post("/api/v1/tasks/remove-watermark")
def create_remove_watermark_task(payload: RemoveWatermarkRequest) -> dict[str, str]:
    image = IMAGES.get(payload.imageId)
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    task_id = _new_id("tsk")
    TASKS[task_id] = {
        "id": task_id,
        "type": "remove_watermark",
        "status": "running",
        "params": payload.model_dump(),
        "images": [],
        "createdAt": datetime.utcnow().isoformat(),
    }

    output = _mock_remove_watermark(Path(image["storagePath"]))
    TASKS[task_id]["images"].append(_register_image(task_id, output, "watermark_removed", payload.imageId))
    TASKS[task_id]["status"] = "succeeded"
    return {"taskId": task_id, "status": "succeeded"}


@app.post("/api/v1/tasks/edit")
def create_edit_task(payload: EditImageRequest) -> dict[str, str]:
    image = IMAGES.get(payload.imageId)
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    task_id = _new_id("tsk")
    TASKS[task_id] = {
        "id": task_id,
        "type": "edit",
        "status": "running",
        "params": payload.model_dump(),
        "images": [],
        "createdAt": datetime.utcnow().isoformat(),
    }

    output = _mock_edit_image(Path(image["storagePath"]), payload.prompt)
    TASKS[task_id]["images"].append(_register_image(task_id, output, "edited", payload.imageId))
    TASKS[task_id]["status"] = "succeeded"
    return {"taskId": task_id, "status": "succeeded"}


@app.get("/api/v1/tasks/{task_id}")
def get_task(task_id: str) -> dict[str, Any]:
    task = TASKS.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return {
        "id": task["id"],
        "status": task["status"],
        "type": task["type"],
        "params": task["params"],
        "images": task["images"],
        "error": task.get("error"),
    }


@app.get("/api/v1/images/{image_id}")
def get_image(image_id: str) -> FileResponse:
    image = IMAGES.get(image_id)
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(path=image["storagePath"], media_type="image/png")
