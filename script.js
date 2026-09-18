const imageExt = new Set(["jpg","jpeg","png","gif","webp","bmp","svg","avif","ico","tif","tiff","jfif"]);
const videoExt = new Set(["mp4","webm","ogg","ogv","mov","m4v","avi","mkv"]);

function extension(name) {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

async function getMedia() {
  const response = await fetch("media.json", { cache: "no-store" });
  if (!response.ok) throw new Error("media.json: " + response.status);
  const data = await response.json();
  return {
    photos: Array.isArray(data.photos) ? data.photos : [],
    videos: Array.isArray(data.videos) ? data.videos : []
  };
}

function renderPhotos(files) {
  const gallery = document.querySelector("#gallery");
  const valid = files.filter(f => imageExt.has(extension(f)));
  document.querySelector("#photoCount").textContent = valid.length ? valid.length + " файлов" : "";
  document.querySelector("#photoEmpty").classList.toggle("hidden", valid.length !== 0);

  valid.forEach(file => {
    const button = document.createElement("button");
    button.className = "photo-card";
    button.title = file;
    const img = document.createElement("img");
    img.src = "Foto/" + encodeURIComponent(file);
    img.alt = file;
    img.loading = "lazy";
    button.appendChild(img);
    button.onclick = () => openLightbox(img.src, file);
    gallery.appendChild(button);
  });
}

function renderVideos(files) {
  const container = document.querySelector("#videos");
  const valid = files.filter(f => videoExt.has(extension(f)));
  document.querySelector("#videoCount").textContent = valid.length ? valid.length + " файлов" : "";
  document.querySelector("#videoEmpty").classList.toggle("hidden", valid.length !== 0);

  valid.forEach(file => {
    const figure = document.createElement("figure");
    figure.className = "video-card";
    const video = document.createElement("video");
    video.src = "Video/" + encodeURIComponent(file);
    video.controls = true;
    video.preload = "metadata";
    video.playsInline = true;
    const caption = document.createElement("figcaption");
    caption.textContent = file;
    figure.append(video, caption);
    container.append(figure);
  });
}

function openLightbox(src, name) {
  document.querySelector("#lightboxImage").src = src;
  document.querySelector("#lightboxName").textContent = name;
  document.querySelector("#lightbox").classList.remove("hidden");
}
function closeLightbox() {
  document.querySelector("#lightbox").classList.add("hidden");
  document.querySelector("#lightboxImage").src = "";
}
document.querySelector("#closeLightbox").onclick = closeLightbox;
document.querySelector("#lightbox").onclick = e => {
  if (e.target.id === "lightbox") closeLightbox();
};
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeLightbox();
});

(async () => {
  try {
    const media = await getMedia();
    renderPhotos(media.photos);
    renderVideos(media.videos);
  } catch (error) {
    console.error("Не удалось загрузить media.json", error);
    document.querySelector("#photoEmpty").textContent = "Не удалось загрузить список фотографий.";
    document.querySelector("#photoEmpty").classList.remove("hidden");
    document.querySelector("#videoEmpty").textContent = "Не удалось загрузить список видео.";
    document.querySelector("#videoEmpty").classList.remove("hidden");
  }
})();
