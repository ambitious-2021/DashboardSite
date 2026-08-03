const image = document.getElementById("dashboardImage");

const youtubeBtn = document.getElementById("youtubeBtn");
const tverBtn = document.getElementById("tverBtn");
const locipoBtn = document.getElementById("locipoBtn");

youtubeBtn.addEventListener("click", () => {
    image.src = "images/youtube_layout.png";

    youtubeBtn.classList.add("active");
    tverBtn.classList.remove("active");
    locipoBtn.classList.remove("active");
});

tverBtn.addEventListener("click", () => {
    image.src = "images/tver_layout.png";

    youtubeBtn.classList.remove("active");
    tverBtn.classList.add("active");
    locipoBtn.classList.remove("active");
});

locipoBtn.addEventListener("click", () => {
    image.src = "images/locipo_layout.png";

    youtubeBtn.classList.remove("active");
    tverBtn.classList.remove("active");
    locipoBtn.classList.add("active");
});

const updateDate = document.getElementById("updateDate");

fetch("data/update.json")
    .then(response => response.json())
    .then(data => {
        document.getElementById("updateDate").textContent =
            data.last_update;
    });