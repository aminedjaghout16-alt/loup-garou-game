# 🐺 Loup-Garou - Multiplayer Game

A real-time multiplayer Loup-Garou (Werewolf) game with Firebase sync, in-app chat, and multilingual support.

## 🎮 Features

- **Real-time Multiplayer** - 4-12 players synced with Firebase
- **8 Unique Roles** - Werewolf, Seer, Witch, Hunter, Cupid, Little Girl, Thief, Villager
- **Night/Day Phases** - Automatic gameplay with configurable timers
- **In-Game Chat** - Real-time communication
- **Multilingual** - English, French, Arabic with RTL support
- **Room System** - Create or join games with room codes
- **Party Leader Controls** - Customize rules before game starts

## 🚀 Deployment on Vercel

### Option 1: Simple Deployment

1. **Fork/Clone this repository**
   ```bash
   git clone <your-repo-url>
   cd loup-garou
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"
   - Done! Your site is live 🎉

### Option 2: Using Vercel CLI

```bash
npm i -g vercel
vercel
```

## 📖 How to Play

### 1. Create a Room
- Player 1 selects language (EN/FR/AR)
- Enters their name
- Clicks "Create Room"
- Shares room code with other players

### 2. Other Players Join
- Enter their name
- Enter the room code
- Click "Join Game"

### 3. Configure Game (Leader Only)
- Choose number of players (4-12)
- Select roles to include
- Set day/night phase timers
- Click "Start Game"

### 4. Play
- **Night Phase**: Roles perform actions (Werewolf kills, Seer investigates, etc.)
- **Day Phase**: Players vote to eliminate someone
- **Chat**: Communicate and strategize
- Game continues until wolves or villagers win

## 🎭 Roles

| Role | Team | Power |
|------|------|-------|
| 🐺 Werewolf | Evil | Kill one person at night |
| 🔮 Seer | Village | Investigate one player's role |
| 🧪 Witch | Village | Heal or kill one person |
| 🏹 Hunter | Village | Kill someone when dying |
| 💘 Cupid | Village | Link two lovers (both die if one dies) |
| 👧 Little Girl | Village | Spy on werewolves at night |
| 🎭 Thief | Village | Swap roles at game start |
| 🧑‍🌾 Villager | Village | Vote to eliminate (no special power) |

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Firebase Realtime Database
- **Deployment**: Vercel

## 🔧 Configuration

Edit `vercel.json` to customize deployment settings.

## 📱 Requirements

- Modern browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Room code to join

## 🎯 Winning Conditions

- **Village Wins**: All werewolves are eliminated
- **Wolves Win**: Werewolves equal or outnumber villagers

## 🌍 Languages

- 🇬🇧 English
- 🇫🇷 Français (French)
- 🇸🇦 العربية (Arabic)

## 📝 Notes

- Each player needs their own device
- Game is synced real-time via Firebase
- Chat messages are saved during game session
- Room codes are case-insensitive
- Game data is stored in Firebase (Realtime Database)

## 🤝 Contributing

Feel free to fork and contribute!

## 📄 License

MIT License - Feel free to use for personal or commercial projects.

---

Made with 🖤 for Loup-Garou lovers
