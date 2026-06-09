class Upgrade {
    constructor(name, title, description, iconUrl, price, count) {
        this.name = name;
        this.title = title;
        this.description = description;
        this.iconUrl = iconUrl;
        this.price = price;
        this.count = count;
    }
}

const upgrades = [
    new Upgrade("clicker", "Clicker", "Multiplies cookies per click", "res/upgrade_icons/clicker.png", 15, 0),
    new Upgrade("flower", "VictorFlower", "Nice flower does cool stuff", "res/upgrade_icons/flower.png", 45, 0),
    new Upgrade("kid", "VictorKid", "Clicks 4x automatically but weakens your click by 1", "res/upgrade_icons/kid-victor.png", 125, 0),
];

upgrades.forEach(u => u.originalPrice = u.price);

const cookieButton = document.getElementById("cookie_button");
const counterText = document.getElementById("counter_text");
const rateText = document.querySelector(".rate_text");
const cookieContainer = document.querySelector(".cookie_container");

let cookieCount = 0;
let cookiesPerSecond = 0;
let clickMultiplier = 1;

// Achievements
const achievements = [
    { id: "vic_100",    name: "Baby Victor",    desc: "Reach 100 Victors",     icon: "🍪", unlocked: false, check: () => cookieCount >= 100 },
    { id: "vic_1000",   name: "Victor Enjoyer", desc: "Reach 1,000 Victors",   icon: "⭐", unlocked: false, check: () => cookieCount >= 1000 },
    { id: "vic_10000",  name: "Victor Master",  desc: "Reach 10,000 Victors",  icon: "🏆", unlocked: false, check: () => cookieCount >= 10000 },
    { id: "vic_100000", name: "Victor God",     desc: "Reach 100,000 Victors", icon: "👑", unlocked: false, check: () => cookieCount >= 100000 },
];

let popupQueue = [];
let popupShowing = false;

function showNextPopup() {
    if (popupQueue.length === 0) {
        popupShowing = false;
        return;
    }

    popupShowing = true;
    const achievement = popupQueue.shift();

    const popup = document.createElement("div");
    popup.classList.add("achievement_popup");
    popup.innerHTML = `
        <div class="achievement_popup_icon">${achievement.icon}</div>
        <div class="achievement_popup_body">
            <span class="achievement_popup_title">🏅 Achievement Unlocked!</span>
            <span class="achievement_popup_name">${achievement.name}</span>
            <span class="achievement_popup_desc">${achievement.desc}</span>
        </div>
    `;
    document.body.appendChild(popup);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => popup.classList.add("show"));
    });

    setTimeout(() => {
        popup.classList.remove("show");
        setTimeout(() => {
            popup.remove();
            showNextPopup();
        }, 500);
    }, 3000);
}

function checkAchievements() {
    for (const achievement of achievements) {
        if (!achievement.unlocked && achievement.check()) {
            achievement.unlocked = true;
            popupQueue.push(achievement);
            if (!popupShowing) showNextPopup();
        }
    }
}

function toggleAchievements() {
    const panel = document.getElementById("achievements_panel");
    panel.classList.toggle("open");

    panel.innerHTML = "";
    for (const achievement of achievements) {
        const row = document.createElement("div");
        row.classList.add("achievement_row");
        if (!achievement.unlocked) row.classList.add("locked");

        row.innerHTML = `
            <div class="achievement_row_icon">${achievement.icon}</div>
            <div class="achievement_row_body">
                <span class="achievement_row_name">${achievement.name}</span>
                <span class="achievement_row_desc">${achievement.unlocked ? achievement.desc : "???"}</span>
            </div>
        `;
        panel.appendChild(row);
    }
}

function updateUI() {
    counterText.textContent = cookieCount + " Victor(s)";
    rateText.textContent = cookiesPerSecond + " victor(s) per second | " + clickMultiplier + " victor(s) per click";
    checkAchievements();
}

updateUI();

cookieButton.addEventListener("click", () => {
    cookieCount += clickMultiplier;
    updateUI();
});

setInterval(() => {
    if (cookiesPerSecond > 0) {
        cookieCount += cookiesPerSecond;
        updateUI();
    }
}, 1000);

function create(htmlStr) {
    const temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    return temp.firstElementChild;
}

function addHandAroundCookie() {
    const hands = cookieContainer.querySelectorAll(".orbit_hand");
    const totalHands = hands.length;
    const newTotal = totalHands + 1;

    hands.forEach((hand, i) => {
        const newAngle = (i * 360) / newTotal;
        hand.style.setProperty("--angle", newAngle + "deg");
    });

    const hand = document.createElement("img");
    hand.src = "res/upgrade_icons/clicker.png";
    hand.classList.add("orbit_hand");
    hand.style.setProperty("--angle", ((totalHands * 360) / newTotal) + "deg");
    cookieContainer.appendChild(hand);
}

function addFarmImage(upgrade) {
    if (upgrade.name === "clicker") return;

    const farmsSection = document.getElementById("farms_section");
    let panel = document.getElementById("farm_panel_" + upgrade.name);

    if (!panel) {
        panel = document.createElement("div");
        panel.classList.add("farm_panel");
        panel.id = "farm_panel_" + upgrade.name;
        farmsSection.appendChild(panel);
    }

    const img = document.createElement("img");
    img.src = upgrade.iconUrl;
    img.classList.add("farm_img");
    panel.appendChild(img);
}

function buyUpgrade(upgrade, counterEl) {
    console.log("buying", upgrade.name, "| cookies:", cookieCount, "| price:", upgrade.price);
    if (cookieCount < upgrade.price) return;

    cookieCount -= upgrade.price;
    upgrade.count++;

    if (upgrade.name === "clicker") {
        clickMultiplier++;
        addHandAroundCookie();
    }

    if (upgrade.name === "flower") {
        cookiesPerSecond++;
    }

    if (upgrade.name === "kid") {
        if (clickMultiplier > 1) clickMultiplier--;
        cookiesPerSecond += 4;
    }

    addFarmImage(upgrade);

    upgrade.price = Math.ceil(upgrade.price * 1.55);
    counterEl.textContent = "x" + upgrade.count;
    counterEl.closest(".upgrade").querySelector(".upgrade_price").textContent = upgrade.price + "$";

    updateUI();
}

const upgradesWindow = document.getElementById("upgrades_window");

for (const upgrade of upgrades) {
    const el = create(`
        <div class="upgrade" id="upgrade_${upgrade.name}">
            <div class="upgrade_icon_container">
                <img class="upgrade_icon" src="">
                <a class="upgrade_price">100$</a>
            </div>
            <div class="upgrade_body">
                <a class="upgrade_title">Upgrade Text</a>
                <a class="upgrade_description">This is a really cool upgrade</a>
            </div>
            <a class="upgrade_counter">x0</a>
        </div>
    `);

    el.querySelector(".upgrade_title").textContent = upgrade.title;
    el.querySelector(".upgrade_description").textContent = upgrade.description;
    el.querySelector(".upgrade_price").textContent = upgrade.price + "$";
    el.querySelector(".upgrade_counter").textContent = "x" + upgrade.count;
    el.querySelector(".upgrade_icon").setAttribute("src", upgrade.iconUrl);

    const counterEl = el.querySelector(".upgrade_counter");
    el.addEventListener("click", () => buyUpgrade(upgrade, counterEl));

    upgradesWindow.appendChild(el);
}

// Rain effect
const canvas = document.getElementById("rain_canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const rainImage = new Image();
rainImage.src = "res/cookie.png";

const drops = Array.from({ length: 60 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    speed: 2 + Math.random() * 4,
    size: 20 + Math.random() * 30,
    opacity: 0.4 + Math.random() * 0.6,
    wobble: Math.random() * Math.PI * 2,
}));

function drawRain() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drops.forEach(drop => {
        ctx.save();
        ctx.globalAlpha = drop.opacity;
        ctx.drawImage(rainImage, drop.x, drop.y, drop.size, drop.size);
        ctx.restore();

        drop.y += drop.speed;
        drop.x += Math.sin(drop.wobble) * 0.5;
        drop.wobble += 0.02;

        if (drop.y > canvas.height) {
            drop.y = -drop.size;
            drop.x = Math.random() * canvas.width;
        }
    });

    requestAnimationFrame(drawRain);
}

rainImage.onload = () => drawRain();

// Custom coin face
const COIN_FACE_KEY    = "siwatko_coin_face";
const COIN_FACE_SIZE   = 512;
const COIN_FACE_RADIUS = 0.34;
const COIN_FACE_OPAQUE = 0.90;
const coinUploadInput  = document.getElementById("coin_upload_input");
const coinResetButton  = document.getElementById("coin_reset");

const coinFrame = new Image();
coinFrame.src = "res/coin.png";

function applyCoinFace(dataUrl) {
    cookieButton.style.backgroundImage = `url("${dataUrl}")`;
    cookieButton.classList.add("custom_face");
    coinResetButton.hidden = false;
}

function resetCoinFace() {
    cookieButton.style.backgroundImage = "";
    cookieButton.classList.remove("custom_face");
    coinResetButton.hidden = true;
    localStorage.removeItem(COIN_FACE_KEY);
}

function buildCoinFace(image) {
    const S = COIN_FACE_SIZE;
    const cx = S / 2, cy = S / 2;
    const r = S * COIN_FACE_RADIUS;
    const box = r * 2;

    const side = Math.min(image.width, image.height);
    const sx = (image.width - side) / 2;
    const sy = (image.height - side) / 2;

    const face = document.createElement("canvas");
    face.width = face.height = S;
    const f = face.getContext("2d");

    f.drawImage(image, sx, sy, side, side, cx - r, cy - r, box, box);

    f.globalCompositeOperation = "overlay";
    f.globalAlpha = 0.5;
    f.fillStyle = "#f4c20d";
    f.fillRect(cx - r, cy - r, box, box);

    f.globalCompositeOperation = "soft-light";
    f.globalAlpha = 0.4;
    f.fillRect(cx - r, cy - r, box, box);

    f.globalCompositeOperation = "source-over";
    f.globalAlpha = 1;
    const bevel = f.createRadialGradient(cx, cy, r * 0.6, cx, cy, r);
    bevel.addColorStop(0, "rgba(80,48,0,0)");
    bevel.addColorStop(1, "rgba(60,35,0,0.5)");
    f.fillStyle = bevel;
    f.fillRect(cx - r, cy - r, box, box);

    f.globalCompositeOperation = "destination-in";
    const mask = f.createRadialGradient(cx, cy, r * COIN_FACE_OPAQUE, cx, cy, r);
    mask.addColorStop(0, "rgba(0,0,0,1)");
    mask.addColorStop(1, "rgba(0,0,0,0)");
    f.fillStyle = mask;
    f.fillRect(0, 0, S, S);

    const out = document.createElement("canvas");
    out.width = out.height = S;
    const o = out.getContext("2d");
    o.drawImage(coinFrame, 0, 0, S, S);
    o.drawImage(face, 0, 0);

    return out.toDataURL("image/webp", 0.92);
}

coinUploadInput.addEventListener("change", () => {
    const file = coinUploadInput.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
        const finish = () => {
            const dataUrl = buildCoinFace(image);
            URL.revokeObjectURL(objectUrl);
            applyCoinFace(dataUrl);
            try {
                localStorage.setItem(COIN_FACE_KEY, dataUrl);
            } catch (e) {
                console.warn("Could not save coin face:", e);
            }
        };
        if (coinFrame.complete && coinFrame.naturalWidth) finish();
        else coinFrame.addEventListener("load", finish, { once: true });
    };
    image.onerror = () => URL.revokeObjectURL(objectUrl);
    image.src = objectUrl;
    coinUploadInput.value = "";
});

coinResetButton.addEventListener("click", resetCoinFace);

const savedCoinFace = localStorage.getItem(COIN_FACE_KEY);
if (savedCoinFace) applyCoinFace(savedCoinFace);