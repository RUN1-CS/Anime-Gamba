import { rarity, getColorByRarity, createConnection } from "./module.js";

/**
 * Pain in the...
 *
 * This file is responsible for displaying the user's waifu list and handling interactions with it.
 * It connects to the server via WebSocket to fetch the user's waifu data and updates the UI accordingly.
 * The list is displayed in a carousel format, allowing users to navigate through their waifus and view details such as their name,
 * rarity, and number of favorites.
 * The code also handles sorting the list based on different criteria selected by the user.
 *
 * Overall, this file manages the dynamic display of the user's waifu collection and ensures a smooth user experience
 *  when browsing through it.
 *
 */

let list = [];
let currentIndex = 0;

// Detailed waifu info is fetched on demand to reduce initial load time and bandwidth usage
async function getCharacter(fullName) {
  WebSocket.send(JSON.stringify({ type: "getCharacter", name: fullName }));
  return new Promise((resolve) => {
    WebSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.success && data.character) {
        const waifuData = JSON.parse(data.character);
        resolve({ waifuImg: waifuData.waifuImg, favs: waifuData.favs });
      } else if (data.success && data.data.waifus) {
        // For some reason it captures all the WebSocket messages,
        // so I also handle sorted list updates here
        list = data.data.waifus;
        loadList();
        resolve(null);
      } else {
        console.error("Failed to get character data:", data.message);
        resolve({ success: false, message: data.message });
      }
    };
  });
}

// Appends a new waifu to the carousel list with the provided details
// It's just DOM manipulation, nothing special here
function appendListItem(waifu, img, favs, active = false) {
  const listElement = document.getElementById("waifu-list");
  const listItem = document.createElement("div");
  listItem.className = active ? "carousel-item active" : "carousel-item";
  const imgElement = document.createElement("img");
  imgElement.className = "d-block w-100";
  imgElement.src = img;
  imgElement.alt = "Carousel slide";
  imgElement.style.maxHeight = "50em";
  imgElement.style.objectFit = "contain";
  listItem.appendChild(imgElement);
  const caption = document.createElement("span");
  caption.className = "carousel-caption d-none d-md-block";
  caption.textContent = `${waifu} - ${rarity(favs)} (${favs} favs) \nUnlocked: ${new Date().toLocaleDateString()}`;
  caption.style.backgroundColor = getColorByRarity(rarity(favs));
  listItem.appendChild(caption);
  listElement.appendChild(listItem);
  listItem.classList.add("active");
}

// Loads the waifu at the specified index into the carousel if it's not already loaded
function loadWaifu(index) {
  const carousel = document.getElementById("waifu-carousel");
  const targetItem = carousel.children[index];

  if (targetItem && targetItem.classList.contains("carousel-item")) {
    return;
  }
  const indexedWaifu = JSON.parse(list[index]);
  const waifuData = getCharacter(indexedWaifu.name);
  waifuData.then((result) => {
    if (result) {
      appendListItem(indexedWaifu.name, result.waifuImg, result.favs, false);
    } else {
      console.error(`Failed to load waifu: ${indexedWaifu.name}`);
    }
  });
}

// Index jumping function for list items,
// allows users to click on a waifu in the list and jump directly to it in the carousel
function moveToIndex(index) {
  loadWaifu(index);
  const carousel = document.getElementById("waifu-carousel");
  const activeItem = carousel.querySelector(".carousel-item.active");
  const targetItem = carousel.children[index];
  if (activeItem) activeItem.classList.remove("active");
  if (targetItem) targetItem.classList.add("active");
}

// I had to use it twice so it's a function now,
// it takes the waifu data and populates the list on the left side of the page
function loadList(data) {
  if (list.length === 0) {
    list = data.data.waifus;
  }
  const ul = document.getElementById("waifu-list-simple");
  // Clear existing list items before repopulating
  ul.replaceChildren();
  list.forEach((raw) => {
    const waifu = JSON.parse(raw);
    const rar = rarity(waifu.favs);
    const li = document.createElement("li");
    li.textContent = `${waifu.name} - ${rar} (${waifu.favs} favs) - Unlocked: ${new Date(waifu.unlocked).toLocaleDateString()}`;
    li.classList.add("list-group-item");
    li.style.backgroundColor = getColorByRarity(rar);
    li.id = waifu.name;
    ul.appendChild(li);
    const listItem = document.getElementById(waifu.name);
    listItem.addEventListener("click", () => {
      currentIndex = list.indexOf(raw);
      moveToIndex(currentIndex);
    });
  });
  // Load the first waifu into the carousel by default
  const waifuData = getCharacter(JSON.parse(list[0]).name);
  waifuData.then((result) => {
    appendListItem(
      JSON.parse(list[0]).name,
      result.waifuImg,
      result.favs,
      true,
    );
  });
}

// Main entry point, sets up WebSocket connection and event listeners for user interactions
addEventListener("DOMContentLoaded", async () => {
  WebSocket = await createConnection();

  WebSocket.onopen = async () => {
    // Fetch the user's waifu data as soon as the WebSocket connection is established
    const session = (await cookieStore.get("session")).value;
    const userId = (await cookieStore.get("userId")).value;
    // Request the waifu data sorted by favorites in descending order by default
    WebSocket.send(
      JSON.stringify({
        type: "getData",
        orderby: "FAVOURITES_DESC",
        session: session,
        userId: userId,
      }),
    );
  };

  WebSocket.onclose = () => {
    setTimeout(() => {
      location.reload();
    }, 3000);
  };

  WebSocket.onerror = (error) => {
    setTimeout(() => {
      location.reload();
    }, 3000);
  };

  WebSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (!data.success) {
      console.error("Failed to get user data:", data.message);
      return;
    }
    loadList(data);
  };

  // Set up event listeners for the carousel navigation buttons and the sorting dropdown
  const back = document.getElementById("back");
  const next = document.getElementById("next");

  const carousel = document.getElementById("waifu-carousel");

  back.addEventListener("click", () => {
    const activeItem = carousel.querySelector(".carousel-item.active");
    currentIndex--;
    if (currentIndex < 0) {
      currentIndex = list.length - 1;
    }
    const prevItem =
      activeItem.previousElementSibling || carousel.lastElementChild;
    loadWaifu(currentIndex);
    activeItem.classList.remove("active");
    prevItem.classList.add("active");
  });
  next.addEventListener("click", () => {
    const activeItem = carousel.querySelector(".carousel-item.active");
    currentIndex++;
    if (currentIndex >= list.length) {
      currentIndex = 0;
    }
    const nextItem =
      activeItem.nextElementSibling || carousel.firstElementChild;
    loadWaifu(currentIndex);
    activeItem.classList.remove("active");
    nextItem.classList.add("active");
    setTimeout(() => {
      next.disabled = false;
    }, 3000);
  });

  // Set up event listener for the sorting dropdown,
  // sends a request to the server to fetch the waifu data sorted by the selected criteria
  const orderBySelect = document.getElementById("order-by");
  orderBySelect.addEventListener("change", async () => {
    const session = (await cookieStore.get("session")).value;
    const userId = (await cookieStore.get("userId")).value;
    WebSocket.send(
      JSON.stringify({
        type: "getData",
        orderby: orderBySelect.value,
        session: session,
        userId: userId,
      }),
    );
  });
});
