async function loadData() {
  const res = await fetch("data/series.json");
  if (!res.ok) throw new Error("Cannot load data/series.json");
  return res.json();
}

function getQueryParam(key){
  const url = new URL(window.location.href);
  return url.searchParams.get(key);
}

function el(html){
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function setActiveNav(seriesId){
  if (seriesId === "food") document.getElementById("navFood")?.classList.add("active");
  if (seriesId === "space") document.getElementById("navSpace")?.classList.add("active");
}

function initLightbox(){
  const box = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImg");
  const cap = document.getElementById("lightboxCaption");
  const closeBtn = document.getElementById("lightboxClose");

  const close = () => {
    box.classList.remove("open");
    box.setAttribute("aria-hidden","true");
    img.src = "";
    cap.textContent = "";
  };

  closeBtn?.addEventListener("click", close);
  box?.addEventListener("click", (e) => {
    if (e.target === box) close();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  return {
    open: (src, caption) => {
      img.src = src;
      cap.textContent = caption || "";
      box.classList.add("open");
      box.setAttribute("aria-hidden","false");
    }
  };
}

async function renderHome(){
  const grid = document.getElementById("seriesGrid");
  if (!grid) return;

  const data = await loadData();
  grid.innerHTML = "";

  data.series.forEach(s => {
    const card = el(`
      <a class="series-card" href="series.html?id=${encodeURIComponent(s.id)}">
        <img src="${s.cover}" alt="${s.name}">
        <div class="pad">
          <h2>${s.name}</h2>
          <p>${s.desc}</p>
          <div class="meta">${s.images.length} 張</div>
        </div>
      </a>
    `);
    grid.appendChild(card);
  });
}

async function renderSeries(){
  const gallery = document.getElementById("gallery");
  if (!gallery) return;

  const seriesId = getQueryParam("id") || "food";
  setActiveNav(seriesId);

  const data = await loadData();
  const s = data.series.find(x => x.id === seriesId) || data.series[0];

  document.getElementById("seriesTitle").textContent = s.name;
  document.getElementById("seriesDesc").textContent = s.desc;

  const lb = initLightbox();

  gallery.innerHTML = "";
  s.images.forEach((imgObj) => {
    const node = el(`
      <div class="thumb" role="button" tabindex="0">
        <img src="${imgObj.src}" alt="${imgObj.caption || s.name}">
        <div class="cap">${imgObj.caption || ""}</div>
      </div>
    `);

    const open = () => lb.open(imgObj.src, imgObj.caption);
    node.addEventListener("click", open);
    node.addEventListener("keydown", (e) => {
      if (e.key === "Enter") open();
    });

    gallery.appendChild(node);
  });
}

(async function main(){
  try{
    await renderHome();
    await renderSeries();
  }catch(err){
    console.error(err);
    const container = document.querySelector("main.container");
    if (container){
      const p = document.createElement("p");
      p.style.color = "#ffb4b4";
      p.textContent = "資料載入失敗：請確認 data/series.json 路徑與 GitHub Pages 是否正常。";
      container.prepend(p);
    }
  }
})();
