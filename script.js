const image = document.getElementById("dashboardImage");

const youtubeBtn = document.getElementById("youtubeBtn");
const itadakishasuBtn = document.getElementById("itadakishasuBtn");
const locipoBtn = document.getElementById("locipoBtn");

const SERVICES = {

    youtube: {
        button: "YouTubeで見る",
        thumbnail: true,
        available: true
    },

    itadakishasu: {
        button: "TVerで見る",
        thumbnail: false,
        available: false
    },

    locipo: {
        button: "Locipoで見る",
        thumbnail: false,
        available: false
    }

};

youtubeBtn.addEventListener("click", () => {
    image.src = "images/youtube_layout.png?t=" + Date.now();

    loadVideos("data/youtube.json", {
        service: "youtube"
    });

    youtubeBtn.classList.add("active");
    itadakishasuBtn.classList.remove("active");
    locipoBtn.classList.remove("active");
});

itadakishasuBtn.addEventListener("click", () => {
    image.src = "images/tver_layout.png?t=" + Date.now();

    loadVideos("data/itadakishasu.json", {
        service: "itadakishasu"
    });

    youtubeBtn.classList.remove("active");
    itadakishasuBtn.classList.add("active");
    locipoBtn.classList.remove("active");
});

locipoBtn.addEventListener("click", () => {
    image.src = "images/locipo_layout.png?t=" + Date.now();

    loadVideos("data/locipo.json", {
        service: "locipo"
    });

    youtubeBtn.classList.remove("active");
    itadakishasuBtn.classList.remove("active");
    locipoBtn.classList.add("active");
});

const updateDate = document.getElementById("updateDate");

fetch("data/update.json?t=" + Date.now())
    .then(response => response.json())
    .then(data => {
        updateDate.textContent = data.last_update;
    });

const videoCards = document.getElementById("videoCards");

function formatViews(views) {

    if (views >= 10000) {
        return (views / 10000).toFixed(1).replace(".0", "") + "万回";
    }

    return views.toLocaleString() + "回";

}

function formatDate(date) {

    return date.replaceAll("-", "/");

}

function getMetric(video) {

    if ("views" in video) {
        return {
            label: "▶ 再生回数",
            value: formatViews(video.views)
        };
    }

    if ("likes" in video) {
        return {
            label: "👍 高評価",
            value: video.likes.toLocaleString()
        };
    }

    if ("comments" in video) {
        return {
            label: "💬 コメント",
            value: video.comments.toLocaleString() + "件"
        };
    }

    return {
        label: "",
        value: ""
    };

}

function getThumbnailUrl(video, service) {

    if (!service.thumbnail) {
        return "images/no_thumbnail.png";
    }

    const videoId = video.url.split("/").pop();

    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

}

function createVideoCard(video, options) {

    const service = SERVICES[options.service];

    const available = video.available ?? service.available;

    const metric = getMetric(video);

    return `
        <div class="video-card">

            <img
                class="video-thumbnail"
                src="${getThumbnailUrl(video, service)}"
                alt="${video.title}"
            >

            <div class="video-info">

                <div class="video-week">
                    ${video.week}
                </div>

                <h3 class="video-title">
                    ${video.title}
                </h3>

                <p>📅 ${formatDate(video.date)}</p>

                <div class="video-views">

                    <span class="label">
                        ${metric.label}
                    </span>

                    <span class="count">
                        ${metric.value}
                    </span>

                </div>

                ${options.service === "itadakishasu"
                    ? `
                        <div class="video-views">

                            <span class="label">
                                🏆 最高順位
                            </span>

                            <span class="count">
                                ${video.best_ranking === null || video.best_ranking === ""
                                    ? "圏外"
                                    : video.best_ranking + "位"
                                }
                            </span>

                        </div>
                    `
                    : ""
                }

            ${options.service === "locipo" && video.ranking_history?.length
                ? `
                    <div class="video-views">

                        <span class="label">
                            📊 順位推移
                        </span>

                        <span class="count ranking-history">
                            ${video.ranking_history.join(" → ")}
                        </span>

                    </div>
                `
                : ""
            }

                <div class="video-members">

                    <span class="label">
                        ${options.service === "locipo" ? "🏫 学校" : "👤 出演者"}
                    </span>

                    <span class="members">
                        ${options.service === "locipo"
                            ? video.school
                            : video.members.replaceAll("|", "・")
                        }
                    </span>

                </div>

                ${available
                    ? `<a href="${video.url}" target="_blank">
                            ${service.button}
                    </a>`
                    : `<span class="video-ended">
                            配信終了
                    </span>`
                }

            </div>

        </div>
    `;

}

function loadVideos(jsonFile, options) {

    fetch(jsonFile + "?t=" + Date.now())
        .then(response => {
            if (!response.ok) {
                throw new Error("JSONが見つかりません");
            }
            return response.json();
        })
        .then(data => {

            if (data.length === 0) {

                videoCards.innerHTML = `
                    <p style="text-align:center; color:#777;">
                        データはまだありません。
                    </p>
                `;

                return;
            }

            let html = "";

            data.forEach(video => {
                html += createVideoCard(video, options);
            });

            videoCards.innerHTML = html;

        })
        .catch(error => {

            console.error(error);

            videoCards.innerHTML = `
                <p style="text-align:center; color:#777;">
                    データはまだありません。
                </p>
            `;

        });

}

loadVideos("data/youtube.json", {
    service: "youtube"
});