const imageExt = new Set(["jpg","jpeg","png","gif","webp","bmp","svg","avif","ico","tif","tiff","jfif"]);
const videoExt = new Set(["mp4","webm","ogg","ogv","mov","m4v","avi","mkv"]);

function extension(name) {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

async function getFolderFiles(folder) {
  try {
    const response = await fetch(folder + "/");
    if (!response.ok) return [];
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    return [...doc.querySelectorAll("a")]
      .map(a => decodeURIComponent(a.getAttribute("href") || ""))
      .filter(href => href && !href.endsWith("/") && !href.startsWith("?"))
      .map(href => href.split("/").pop())
      .filter(Boolean);
  } catch {
    return [];
  }
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
    container.appendChild(figure);
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
  const [photos, videos] = await Promise.all([getFolderFiles("Foto"), getFolderFiles("Video")]);
  renderPhotos(photos);
  renderVideos(videos);
})();