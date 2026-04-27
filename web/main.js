const API = "http://127.0.0.1:8000";

let latestImageId = null;

async function uploadAsset(file, assetType) {
  const form = new FormData();
  form.append("file", file);
  const url = `${API}/api/v1/assets/upload?assetType=${assetType}`;
  const response = await fetch(url, { method: "POST", body: form });
  if (!response.ok) {
    throw new Error(`上传失败: ${await response.text()}`);
  }
  return response.json();
}

async function getTask(taskId) {
  const res = await fetch(`${API}/api/v1/tasks/${taskId}`);
  if (!res.ok) throw new Error("查询任务失败");
  return res.json();
}

function renderImages(images) {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";
  images.forEach((img) => {
    const wrapper = document.createElement("div");
    const image = document.createElement("img");
    image.src = `${API}${img.url}`;
    wrapper.appendChild(image);

    const removeBtn = document.createElement("button");
    removeBtn.innerText = "去水印";
    removeBtn.onclick = async () => {
      const res = await fetch(`${API}/api/v1/tasks/remove-watermark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: img.id }),
      });
      const task = await res.json();
      const detail = await getTask(task.taskId);
      renderImages(detail.images);
      latestImageId = detail.images[0]?.id || latestImageId;
    };
    wrapper.appendChild(removeBtn);

    gallery.appendChild(wrapper);
  });
}

async function handleGenerate() {
  const status = document.getElementById("status");
  status.textContent = "上传图片中...";

  const productFile = document.getElementById("productFile").files[0];
  const sceneFile = document.getElementById("sceneFile").files[0];
  if (!productFile) {
    status.textContent = "请先选择产品图";
    return;
  }

  try {
    const product = await uploadAsset(productFile, "product");
    let scene = null;
    if (sceneFile) {
      scene = await uploadAsset(sceneFile, "scene_ref");
    }

    status.textContent = "生成中...";
    const payload = {
      productAssetId: product.assetId,
      sceneRefAssetId: scene?.assetId,
      style: document.getElementById("style").value,
      sceneStyle: document.getElementById("sceneStyle").value,
      ratio: document.getElementById("ratio").value,
      numOutputs: Number(document.getElementById("numOutputs").value),
    };

    const res = await fetch(`${API}/api/v1/tasks/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const task = await res.json();
    const detail = await getTask(task.taskId);
    latestImageId = detail.images[0]?.id || null;
    renderImages(detail.images);
    status.textContent = `完成：${detail.images.length} 张`;
  } catch (error) {
    status.textContent = error.message;
  }
}

async function handleEdit() {
  const prompt = document.getElementById("editPrompt").value.trim();
  const status = document.getElementById("status");
  if (!latestImageId) {
    status.textContent = "请先生成图片";
    return;
  }
  if (!prompt) {
    status.textContent = "请输入编辑指令";
    return;
  }

  const response = await fetch(`${API}/api/v1/tasks/edit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageId: latestImageId, prompt }),
  });
  const task = await response.json();
  const detail = await getTask(task.taskId);
  latestImageId = detail.images[0]?.id || latestImageId;
  renderImages(detail.images);
  status.textContent = "编辑完成";
}

document.getElementById("generateBtn").addEventListener("click", handleGenerate);
document.getElementById("editBtn").addEventListener("click", handleEdit);
