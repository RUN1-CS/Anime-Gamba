import { rarity, getColorByRarity, createConnection } from "./module.js";

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

function moveToIndex(index) {
  loadWaifu(index);
  const carousel = document.getElementById("waifu-carousel");
  const activeItem = carousel.querySelector(".carousel-item.active");
  const targetItem = carousel.children[index];
  if (activeItem) activeItem.classList.remove("active");
  if (targetItem) targetItem.classList.add("active");
}

addEventListener("DOMContentLoaded", async () => {
  WebSocket = await createConnection();

  WebSocket.onopen = async () => {
    const session = (await cookieStore.get("session")).value;
    const userId = (await cookieStore.get("userId")).value;
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
    list = data.data.waifus;
    list.forEach((raw) => {
      const waifu = JSON.parse(raw);
      const rar = rarity(waifu.favs);
      const ul = document.getElementById("waifu-list-simple");
      const li = document.createElement("li");
      li.textContent = `${waifu.name} - ${rar} (${waifu.favs} favs)`;
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
    const waifuData = getCharacter(JSON.parse(list[0]).name);
    waifuData.then((result) => {
      appendListItem(
        JSON.parse(list[0]).name,
        result.waifuImg,
        result.favs,
        true,
      );
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

  const orderBySelect = document.getElementById("order-by");
  orderBySelect.addEventListener("change", () => {
    const session = cookieStore.get("session").value;
    const userId = cookieStore.get("userId").value;
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
