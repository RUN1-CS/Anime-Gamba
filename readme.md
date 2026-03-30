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

## Roadmap

- **DONE** Basic gambling mechanics
- Multiple waifus fetching (randomized in single API call)
- Spin The Wheel game mode
- Additional game variations
- Leaderboard system
- Rate limiting for packages
- Public and private account types
- Account sharing via links and QR codes

## Technologies

- **PHP**
  - For back-end calls (not yet implemented, QR code generation planned)
- **JavaScript/CSS/HTML**
  - Front-end implementation
- **Node.js**
  - Fast backend server
  - Core modules:
    - bcrypt: Password hashing
    - pg: PostgreSQL queries
    - ws: WebSocket communication
- **PostgreSQL**
  - Primary database

## License

GNU General Public License v3.0 - feel free to use this project as you wish.

## Support

For issues and questions, please open an issue on GitHub.

---

**Enjoy the game!**
