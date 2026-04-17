import { rarity, getColorByRarity } from "./module.js";

async function getCharacter(fullName) {
  WebSocket.send(JSON.stringify({ type: "getCharacter", name: fullName }));
  return new Promise((resolve) => {
    WebSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.success) {
        const waifuData = JSON.parse(data.character);
        resolve({ waifuImg: waifuData.waifuImg, favs: waifuData.favs });
      } else {
        console.error("Failed to get character data:", data.message);
        resolve({ success: false, message: data.message });
      }
    };
  });
}

let list = [];
let currentIndex = 0;

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
  caption.textContent = `${waifu} - ${rarity(favs)} (${favs} favs)`;
  caption.style.backgroundColor = getColorByRarity(rarity(favs));
  listItem.appendChild(caption);
  listElement.appendChild(listItem);
  listItem.classList.add("active");
}

function loadWaifu(index) {
  const carousel = document.getElementById("waifu-carousel");
  const targetItem = carousel.children[index];

  if (targetItem && targetItem.classList.contains("carousel-item")) {
    return;
  }
  const waifuData = getCharacter(list[index]);
  waifuData.then((result) => {
    if (result) {
      console.log(
        `Loading waifu: ${list[index]}, Image: ${result.waifuImg}, Favs: ${result.favs}`,
      );
      appendListItem(list[index], result.waifuImg, result.favs, false);
    } else {
      console.error(`Failed to load waifu: ${list[index]}`);
    }
  });
}

function moveToIndex(index) {
  loadWaifu(index);
  const carousel = document.getElementById("waifu-carousel");
  const activeItem = carousel.querySelector(".carousel-item.active");
  const targetItem = carousel.children[index];
  if (activeItem) activeItem.classList.remove("active");
  if (targetItem) targetItem.classList.add("active");
}

addEventListener("DOMContentLoaded", () => {
  WebSocket = new WebSocket("ws://localhost:3000");

  WebSocket.onopen = async () => {
    const session = (await cookieStore.get("session")).value;
    const userId = (await cookieStore.get("userId")).value;
    WebSocket.send(
      JSON.stringify({ type: "getData", session: session, userId: userId }),
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
    list = data.data.waifus;
    list.forEach((waifu) => {
      const ul = document.getElementById("waifu-name-list");
      const li = document.createElement("li");
      li.textContent = waifu;
      li.id = waifu;
      ul.appendChild(li);
      const listItem = document.getElementById(waifu);
      listItem.addEventListener("click", () => {
        currentIndex = list.indexOf(waifu);
        moveToIndex(currentIndex);
      });
    });
    const waifuData = getCharacter(list[0]);
    waifuData.then((result) => {
      appendListItem(list[0], result.waifuImg, result.favs, true);
    });
  };

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
});
