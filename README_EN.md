# Celestial Path Simulator

[中文文档](README.md) | English

An AI-powered cultivation simulation game where players act as the celestial system guiding cultivators' growth.

## Project Overview

This is a unique text-based adventure game where players take on the role of a celestial system, guiding cultivators in their journey through a mystical world. The game uses AI generation technology to create a rich cultivation world and provide an immersive gaming experience.

### Key Features

- 🎮 **System Role-Playing**: Players act as the celestial system, assigning tasks and providing opportunities
- 🌍 **Rich World Setting**: Combines various cultivation novel elements to build a complete mystical world
- 🤖 **AI-Driven**: Uses advanced AI models to generate plots, dialogues, and tasks
- 📝 **Dynamic Storyline**: Real-time story generation based on player choices
- 💾 **Progress Saving**: Auto-saves game progress, supports character import/export
- 🎨 **Customization**: Supports custom cultivation systems and world styles

### Game Features

1. **Various System Types**
   - Traditional Cultivation System
   - Artifact Nurturing System
   - Alchemy System
   - Formation System
   - Custom System

2. **Rich Cultivation Features**
   - Five Elements Dao
   - Sword Cultivation
   - Body Cultivation
   - Talisman Arts
   - Beast Taming
   - Medical Arts
   - Illusion Arts

3. **Diverse World Styles**
   - Orthodox Cultivation
   - Dark Mystery
   - Casual Daily Life
   - Competitive Cultivation
   - Mysterious Exploration

## Installation Guide

### Requirements
- Node.js (v14.0.0 or higher recommended)
- Modern browser (Chrome, Firefox, Edge, etc.)
- AI API key (obtain from https://api.siliconflow.cn)

### Installation Steps

1. Clone repository
```bash
git clone https://github.com/yourusername/celestial-path-simulator.git
cd celestial-path-simulator
```

2. Install dependencies
```bash
npm install
```

3. Start server
```bash
node server.js
```

4. Access game
Open browser and visit http://localhost:3000/story_config.html

## Usage Guide

1. **Initial Configuration**
   - Enter API key
   - Select world background setting
   - Configure protagonist gender and system type
   - Choose cultivation features and world style

2. **Game Operations**
   - View protagonist status and world information
   - Assign tasks to protagonist
   - Observe protagonist behavior and dialogue
   - Intervene in cultivation progress

3. **Data Management**
   - Automatic game progress saving
   - Support story content export
   - Import existing characters to continue game

## Project Structure

```
celestial-path-simulator/
├── src/                  # Source code directory
│   ├── config/          # Configuration files
│   ├── services/        # Service classes
│   └── ui/             # User interface components
├── public/              # Static resources
│   ├── css/            # Style files
│   └── js/             # Client scripts
├── data/                # Data storage
│   ├── characters/     # Character archives
│   └── stories/        # Story archives
├── game.html            # Game main page
├── story_config.html    # Story configuration page
├── server.js           # Server entry
└── package.json        # Project configuration
```

## Development Plans

- [ ] Add more world background options
- [ ] Add NPC interaction system
- [ ] Implement multi-character cultivation
- [ ] Add achievement system
- [ ] Support custom story templates
- [ ] Introduce combat system
- [ ] Add sect management features

## Contributing Guide

Issues and Pull Requests are welcome to help improve the project. Please ensure:
1. Code has been tested before submission
2. Follow existing code style
3. Provide clear commit messages
4. Update relevant documentation

## License

This project is licensed under the MIT License 