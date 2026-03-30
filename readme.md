# AnimeGamba

A stylish anime-themed gambling simulation project.

## Features

- Anime-inspired visual design
- Interactive gambling mechanics
- Score (Based on favorites)

## Installation and Usage

```bash
git clone https://github.com/mysterio/AnimeGamba.git
cd AnimeGamba
cp .env.example .env
# Don't forget to change the info inside
docker compose up --build
```

## AniList API

API is free for everyone but rate limited, so watch out.

## Commands

```bash
    # Add a waifu
    docker exec -it animegamba-server-1 node -e "require('/usr/src/app/src/index.js').addSpecificWaifuToUser(10,'waifu')"

    # Remove a waifu
    docker exec -it animegamba-server-1 node -e "require('/usr/src/app/src/index.js').removeWaifuFromUser(10,'waifu')"
```

## License

GNU General Public License v3.0 - feel free to use this project as you wish.

## Support

For issues and questions, please open an issue on GitHub.

---

**Enjoy the game!**
