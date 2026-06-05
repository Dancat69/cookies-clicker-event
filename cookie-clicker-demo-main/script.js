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
    new Upgrade("worm", "Wrinkler", "Scary worm does cool stuff", "res/upgrade_icons/wrinkler.png", 100, 0),
];

const cookieButton = document.getElementById("cookie_button");
const counterText = document.getElementById("counter_text");
const rateText = document.querySelector(".rate_text");
const cookieContainer = document.querySelector(".cookie_container");

let cookieCount = 0;
let cookiesPerSecond = 0;
let clickMultiplier = 1;

// Tracks how many farm images each upgrade has spawned
const farmCounts = {};

function updateUI() {
    counterText.textContent = cookieCount + " Cookie(s)";
    rateText.textContent = cookiesPerSecond + " cookie(s) per second | " + clickMultiplier + " cookie(s) per click";
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

// Adds a hand image orbiting the cookie
function addHandAroundCookie() {
    const totalHands = cookieContainer.querySelectorAll(".orbit_hand").length;
    const angle = (totalHands * 360) / (totalHands + 1);

    // Re-distribute all hands evenly
    const hands = cookieContainer.querySelectorAll(".orbit_hand");
    hands.forEach((hand, i) => {
        const newAngle = (i * 360) / (totalHands + 1);
        hand.style.setProperty("--angle", newAngle + "deg");
    });

    const hand = document.createElement("img");
    hand.src = "res/upgrade_icons/clicker.png";
    hand.classList.add("orbit_hand");
    hand.style.setProperty("--angle", angle + "deg");
    cookieContainer.appendChild(hand);
}

// Adds or updates a farm panel for the given upgrade
function addFarmImage(upgrade) {
    const farmsSection = document.getElementById("farms_section");
    let panel = document.getElementById("farm_panel_" + upgrade.name);

    if (!panel) {
        // Create a new panel for this upgrade
        panel = document.createElement("div");
        panel.classList.add("farm_panel");
        panel.id = "farm_panel_" + upgrade.name;
        farmsSection.appendChild(panel);
    }

    // Add one more image to the panel
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

    if (upgrade.name === "worm") {
        cookiesPerSecond++;
    }

    // Add image to farms for every upgrade
    addFarmImage(upgrade);

    upgrade.price = Math.ceil(upgrade.price * 1.15);
    counterEl.textContent = "x" + upgrade.count;
    counterEl.closest(".upgrade").querySelector(".upgrade_price").textContent = upgrade.price + "$";

    updateUI();
}

const upgradesWindow = document.getElementById("upgrades_window");

for (const upgrade of upgrades) {
    const el = create(`
        <div class="upgrade">
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