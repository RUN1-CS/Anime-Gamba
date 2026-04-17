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
cp ./server/src/config.json.example ./server/src/config.json
# Don't forget to change the info inside
docker compose up --build
```

## AniList API

API is free for everyone but rate limited, so watch out.

## Commands

```bash
    # Add a waifu
    docker exec -it animegamba-server-1 node -e "require('/usr/src/app/src/data/utils.js').addSpecificWaifuToUser(10,'waifu')"

    # Remove a waifu
    docker exec -it animegamba-server-1 node -e "require('/usr/src/app/src/data/utils.js').removeWaifuFromUser(10,'waifu')"
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
  - For back-end calls (QR code generation planned)
- **JavaScript/CSS/HTML**
  - Front-end implementation
- **Node.js**
  - Fast backend server
  - Core modules:
    - bcrypt: Password hashing
    - pg: PostgreSQL queries
    - ws: WebSocket communication
    - crypto: Encryption
- **PostgreSQL**
  - Primary database

## Project Structure

```
AnimeGamba/
├── server/                          # Node.js backend server
│   ├── src/
│   │   ├── index.js                # Main server entry point
│   │   ├── config.json.example     # Configuration template
│   │   ├── data/
│   │   │   └── utils.js            # Database utilities (addSpecificWaifuToUser, removeWaifuFromUser)
│   │   ├── routes/                 # API endpoints
│   │   └── middleware/             # Express middleware (auth, validation)
│   └── Dockerfile                  # Server containerization
├── client/                          # Front-end application
│   ├── index.html                  # Main HTML file
│   ├── style.css                   # Styling
│   ├── script.js                   # Client-side logic
│   └── assets/                     # Images and anime-themed graphics
├── php/                             # PHP utilities
│   └── qr-generator.php            # QR code generation (planned)
├── docker-compose.yml              # Docker orchestration
├── .env.example                    # Environment variables template
└── readme.md                       # This file
```

### Key Directories

- **server/** - Node.js backend with PostgreSQL integration, WebSocket support, and user management
- **client/** - Interactive front-end with anime-inspired UI and gambling mechanics
- **php/** - Supporting PHP utilities for QR code and special features
- **data/** - Database utilities and user management functions

## License

GNU General Public License v3.0 - feel free to use this project as you wish.

## Support

For issues and questions, please open an issue on GitHub.

---

**Enjoy the game!**
