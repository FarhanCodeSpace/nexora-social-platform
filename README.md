<div align="center">

  <!-- FUTURISTIC TYPING HEADER -->
  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.demolab.com?font=Orbitron&weight=800&size=35&duration=2500&pause=750&color=00F3FF&center=true&vCenter=true&repeat=true&width=750&height=70&lines=%E2%9A%A1+PULSENET+v1.0.0;NEON-GLASS+SOCIAL+ECOSYSTEM;POWERED+BY+EXPRESS.JS+%2B+SQLITE;NEXT-GEN+INTERACTION+MATRIX" alt="PulseNet Futuristic Header" />
  </a>

  <p align="center">
    <b>A Hyper-Responsive, Cyberpunk-Inspired Full-Stack Social Experience</b>
  </p>

  <!-- ANIMATED BADGES ROW -->
  <p align="center">
    <a href="#-core-architecture">
      <img src="https://img.shields.io/badge/CORE-EXPRESS.JS-00F3FF?style=for-the-badge&logo=express&logoColor=000&labelColor=080B10" alt="Express.js">
    </a>
    <a href="#-core-architecture">
      <img src="https://img.shields.io/badge/DATABASE-SQLITE3-FF007F?style=for-the-badge&logo=sqlite&logoColor=FFF&labelColor=080B10" alt="SQLite3">
    </a>
    <a href="#-core-architecture">
      <img src="https://img.shields.io/badge/AUTH-JWT%20%2B%20BCRYPT-7000FF?style=for-the-badge&logo=jsonwebtokens&logoColor=FFF&labelColor=080B10" alt="JWT">
    </a>
    <a href="#-core-architecture">
      <img src="https://img.shields.io/badge/UI-GLASSMORPHIC%20CSS-00FF66?style=for-the-badge&logo=css3&logoColor=000&labelColor=080B10" alt="Glassmorphic CSS">
    </a>
    <a href="LICENSE">
      <img src="https://img.shields.io/badge/LICENSE-MIT-FFB700?style=for-the-badge&logo=open-source-initiative&logoColor=000&labelColor=080B10" alt="License">
    </a>
  </p>

  <!-- GLOWING ANIMATED WAVE DIVIDER -->
  <img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%" alt="Glowing Divider">

</div>

<br>

> [!NOTE]
> 🛸 **System Status**: `ONLINE` | **Signal**: `OPTIMAL (100% Cyber-Mesh Integrity)` | **Protocol**: `RESTful v1`
> **PulseNet** is an ultra-modern, high-octane social platform engineered with Node.js, Express, SQLite, and vanilla CSS3 micro-animations. It fuses high-speed data propagation with a sleek glassmorphic HUD layout.

---

## 🔮 Interactive Feature Matrix

```gcode
 [SYSTEM HUD] ───► REAL-TIME FEED INTEGRITY ──────────► [100% ONLINE]
 [MODULE 01]  ───► JWT ZERO-TRUST AUTHENTICATION ──────► [ACTIVE]
 [MODULE 02]  ───► LIVE DEBOUNCED SEARCH MATRIX ───────► [ACTIVE]
 [MODULE 03]  ───► MEDIA PIPELINE (MULTER INFRA) ─────► [ACTIVE]
 [MODULE 04]  ───► SOCIAL GRAPH (FOLLOW/LIKE/MENTION) ─► [ACTIVE]
```

<details open>
<summary><b>✨ 🛰️ Module Breakdown (Click to collapse/expand)</b></summary>

<br>

| Feature Module | Tech Stack / Engine | Visual & Micro-Interaction Status |
| :--- | :--- | :---: |
| 🛡️ **Zero-Trust Auth** | `JWT` + `BcryptJS` (Salt: 10) | `<span style="color:#00FF66">● ENCRYPTED</span>` |
| 📰 **Dynamic Feed** | Async Fetch + DOM Diffing | `<span style="color:#00F3FF">⚡ INSTANT PROPAGATION</span>` |
| ❤️ **Reaction Matrix** | Optimistic UI + Scale Pop | `<span style="color:#FF007F">💖 MICRO-ANIMATED</span>` |
| 👥 **Cyber Graph** | SQLite Cascading FKs | `<span style="color:#7000FF">🔗 REALTIME COUNTERS</span>` |
| 🔍 **Quantum Search** | Debounced Dynamic Filter | `<span style="color:#00F3FF">🎯 LIVE DROPDOWN</span>` |
| 📸 **Media Storage** | `Multer` Direct Stream | `<span style="color:#FFB700">🖼️ IMAGE & VIDEO READY</span>` |

</details>

---

## 🌌 Cyberpunk UI Preview Architecture

```mermaid
graph TD
    %% Node Styles %%
    classDef client fill:#0d1117,stroke:#00f3ff,stroke-width:2px,color:#00f3ff;
    classDef server fill:#0d1117,stroke:#ff007f,stroke-width:2px,color:#ff007f;
    classDef db fill:#0d1117,stroke:#7000ff,stroke-width:2px,color:#7000ff;

    subgraph CLIENT_HUD ["💻 Client HUD Layer (Vanilla JS + Glassmorphic CSS)"]
        UI["📱 Glassmorphic UI Dashboard"]:::client
        SEARCH["🔍 Debounced Live Search Engine"]:::client
        FEED["📰 Optimistic Dynamic Timeline"]:::client
    end

    subgraph BACKEND_NODE ["⚡ Express Core Mesh"]
        API["📡 REST Routing Engine"]:::server
        AUTH["🔒 JWT Auth Middleware"]:::server
        UPLOADER["📦 Multer Media Handler"]:::server
    end

    subgraph DATABASE_CORE ["💾 Relational Storage Vault"]
        DB[(🗄️ SQLite3 Database)]:::db
    end

    UI -->|Async HTTP / JSON| API
    SEARCH -->|Debounced GET /api/search| API
    FEED -->|POST /api/posts| API
    API -->|Validate Token| AUTH
    API -->|Process File| UPLOADER
    API -->|SQL Queries| DB
```

---

## ⚡ Quick Start Protocol

Execute the following terminal sequence to boot up the PulseNet ecosystem:

```bash
# 1. Clone the Cybernet Repository
$ git clone https://github.com/YOUR_USERNAME/pulsenet-social-platform.git

# 2. Navigate into the Core Terminal Directory
$ cd pulsenet-social-platform

# 3. Inject Dependency Modules
$ npm install

# 4. Synthesize Sample Seed Database
$ npm run seed

# 5. Ignite the Futuristic Core Server
$ npm run dev
```

> [!TIP]
> Navigating to `http://localhost:3000` will automatically launch the **PulseNet Glassmorphic Interface**.

---

## 📂 System Directory Topology

```
⚡ PULSENET_CORE
 ├── 📁 data/                  ► [DB Vault] SQLite database instance
 ├── 📁 public/                ► [Client Engine]
 │    ├── 📁 css/              ► Glassmorphism & micro-interaction styles
 │    ├── 📁 js/               ► Single-Page App reactive logic controller
 │    ├── 📁 uploads/          ► Media storage buffer
 │    └── 📄 index.html        ► Futuristic HUD Layout
 ├── 📁 src/                   ► [Core Logic Node]
 │    ├── 📁 db/               ► Schema definition & DB seed routines
 │    ├── 📁 middleware/       ► JWT Security barrier
 │    └── 📁 routes/           ► Auth, Posts, User Graph & Search routes
 ├── 📄 server.js              ► Application Master Server
 ├── 📄 .gitignore             ► Exclusion matrix
 ├── 📄 LICENSE                ► Open Source MIT License
 └── 📄 README.md              ► Cyberpunk Systems Manual
```

---

<div align="center">

  <!-- ANIMATED TYPING FOOTER -->
  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=16&duration=2000&pause=500&color=FF007F&center=true&vCenter=true&width=500&height=30&lines=INITIALIZING+PULSENET...;ALL+SYSTEMS+GO!;THANKS+FOR+VISITING!" alt="PulseNet Futuristic Footer" />
  </a>

  <br>

  <img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%" alt="Glowing Footer Divider">

  <p><b>Crafted with ⚡ for CodeAlpha Task 2</b></p>
  
  [![Star on GitHub](https://img.shields.io/badge/⭐_STAR_THIS_REPO-00F3FF?style=for-the-badge&logo=github&logoColor=000)](https://github.com/)

</div>
