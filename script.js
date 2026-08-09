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

const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const memberFilter = document.getElementById("memberFilter");
const videoCount = document.getElementById("videoCount");
const clearSearchBtn = document.getElementById("clearSearchBtn");

let currentVideos = [];
let currentService = "";

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

            ${options.service === "youtube" && video.views_history?.length
                ? `
                    <div class="video-views">

                        <span class="label">
                            📊 再生回数推移（万回）
                        </span>

                        <span class="count youtube-history">
                            ${video.views_history
                                .map(value => (value / 10000).toFixed(1).replace(".0", ""))
                                .join(" → ")}
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

            currentVideos = data;
            currentService = options.service;

            updateSortOptions(currentService);
            updateMemberFilter();


            if (data.length === 0) {

                videoCards.innerHTML = `
                    <p style="text-align:center; color:#777;">
                        データはまだありません。
                    </p>
                `;

                return;
            }

            renderVideos();

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

function updateSortOptions(service) {

    if (service === "youtube") {

        sortSelect.innerHTML = `
            <option value="newest">新しい順</option>
            <option value="oldest">古い順</option>
            <option value="views-desc">再生回数が多い順</option>
            <option value="views-asc">再生回数が少ない順</option>
        `;

    } else if (service === "itadakishasu") {

        sortSelect.innerHTML = `
            <option value="newest">新しい順</option>
            <option value="oldest">古い順</option>
            <option value="likes-desc">高評価が多い順</option>
            <option value="likes-asc">高評価が少ない順</option>
            <option value="ranking-asc">順位が良い順</option>
        `;

    } else if (service === "locipo") {

        sortSelect.innerHTML = `
            <option value="newest">新しい順</option>
            <option value="oldest">古い順</option>
            <option value="comments-desc">コメント数が多い順</option>
            <option value="comments-asc">コメント数が少ない順</option>
            <option value="ranking-asc">順位が良い順</option>
        `;

    }

    // サービスを切り替えたら新しい順に戻す
    sortSelect.value = "newest";
}

function updateMemberFilter() {

    const values = [];

    currentVideos.forEach(video => {

        if (video.members) {

            video.members
                .split(/[|・、,]/)
                .forEach(member => {
                    const name = member.trim();

                    if (name) {
                        values.push(name);
                    }
                });

        }

    });

    const memberOrder = [
        "真弓孟之",
        "岡佑吏",
        "永岡蓮王",
        "井上一太",
        "浦陸斗",
        "大内リオン",
        "山中一輝"
    ];

    const uniqueValues = [...new Set(values)].sort(
        (a, b) => memberOrder.indexOf(a) - memberOrder.indexOf(b)
    );

    memberFilter.innerHTML = `
        <option value="">すべて</option>
        ${uniqueValues.map(value => `
            <option value="${value}">
                ${value}
            </option>
        `).join("")}
    `;
}

function renderVideos() {

    const keyword = searchInput.value
        .trim()
        .toLowerCase();

    let filteredVideos = currentVideos.filter(video => {

        const title = video.title || "";
        const members = video.members || "";
        const school = video.school || "";

        const text = `
            ${title}
            ${members}
            ${school}
        `.toLowerCase();

        const matchesKeyword =
            keyword === "" ||
            text.includes(keyword);

        const filterValue = memberFilter.value;

        const matchesFilter =
            filterValue === "" ||
            members
                .split(/[|・、,]/)
                .map(member => member.trim())
                .includes(filterValue);

        return matchesKeyword && matchesFilter;
    });

    // -------------------------
    // 並べ替え
    // -------------------------

    filteredVideos.sort((a, b) => {

        const sortType = sortSelect.value;

        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        switch (sortType) {

            // -------------------------
            // 日付
            // -------------------------

            case "oldest":
                return dateA - dateB;

            case "newest":
                return dateB - dateA;

            // -------------------------
            // YouTube：再生回数
            // -------------------------

            case "views-desc":
                return (b.views ?? -1) - (a.views ?? -1);

            case "views-asc":
                return (a.views ?? Infinity) - (b.views ?? Infinity);

            // -------------------------
            // いただきシャス：高評価
            // -------------------------

            case "likes-desc":
                return (b.likes ?? -1) - (a.likes ?? -1);

            case "likes-asc":
                return (a.likes ?? Infinity) - (b.likes ?? Infinity);

            // -------------------------
            // コメント数
            // -------------------------

            case "comments-desc":
                return (b.comments ?? -1) - (a.comments ?? -1);

            case "comments-asc":
                return (a.comments ?? Infinity) - (b.comments ?? Infinity);

            // -------------------------
            // 順位
            // -------------------------

            case "ranking-asc":

                const getBestRanking = video => {

                    // いただきシャス
                    if (video.best_ranking !== undefined) {
                        return video.best_ranking === ""
                            ? Infinity
                            : Number(video.best_ranking);
                    }

                    // Locipo
                    if (Array.isArray(video.ranking_history)) {

                        const rankings = video.ranking_history
                            .map(value => parseInt(value))
                            .filter(value => !isNaN(value));

                        return rankings.length > 0
                            ? Math.min(...rankings)
                            : Infinity;
                    }

                    return Infinity;
                };

                return getBestRanking(a) - getBestRanking(b);

            default:
                return dateB - dateA;
        }
    });

    videoCount.textContent =
        keyword === ""
            ? `${filteredVideos.length}件の動画`
            : `検索結果：${filteredVideos.length}件`;

    // -------------------------
    // 表示
    // -------------------------

    if (filteredVideos.length === 0) {

        videoCards.innerHTML = `
            <p style="text-align:center; color:#777;">
                該当する動画はありません。
            </p>
        `;

        return;
    }

    let html = "";

    filteredVideos.forEach(video => {

        html += createVideoCard(video, {
            service: currentService
        });

    });

    videoCards.innerHTML = html;
}

searchInput.addEventListener("input", renderVideos);

sortSelect.addEventListener("change", renderVideos);

memberFilter.addEventListener("change", renderVideos);

clearSearchBtn.addEventListener("click", () => {

    searchInput.value = "";
    memberFilter.value = "";
    sortSelect.value = "newest";

    renderVideos();
});

loadVideos("data/youtube.json", {
    service: "youtube"
});