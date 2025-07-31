# 🌌 CosmoMind - 3D Mind Mapping Galaxy

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Three.js](https://img.shields.io/badge/Three.js-r160+-green.svg)](https://threejs.org/)
[![WebGL](https://img.shields.io/badge/WebGL-Supported-blue.svg)](https://get.webgl.org/)

> Transform your ideas into a living universe with this revolutionary 3D mind mapping application built with Three.js and WebGL.

## 🚀 Live Demo

**[Experience CosmoMind Live](https://yourusername.github.io/cosmo-mind)**

## ✨ Features

### 🧠 **Hierarchical Mind Mapping**
- **Central Idea (Sun)**: Your main concept radiates at the center
- **Primary Ideas (Planets)**: Major concepts orbit around your central thought  
- **Secondary Ideas (Moons)**: Supporting concepts orbit each primary idea
- **Tertiary Details (Asteroids)**: Specific details orbit their parent moons

### 🚀 **Interactive 3D Navigation**
- **Spaceship Control**: Pilot a futuristic spaceship through your mind galaxy
- **Auto-Travel Mode**: Click any node to automatically navigate there
- **Manual Control**: Use keyboard controls for hands-on exploration
- **Communication Lines**: Visual data transfer with animated communication balls
- **Real-time Animation**: Smooth orbital movements and spaceship navigation

### 💾 **Smart Data Management**
- **Auto-Save**: Your work is automatically saved every 3 seconds
- **Local Storage**: Data persists between sessions in your browser
- **Export Options**: Save projects as JSON files for backup and sharing
- **Screenshot Export**: Capture beautiful images of your mind maps
- **Import Support**: Load and continue working on saved projects

### 🎨 **Customizable Experience**
- **Orbit Speed Control**: Adjust how fast celestial objects move
- **Spaceship Modes**: Choose between auto-travel and manual control
- **Visual Themes**: Multiple galaxy themes to match your mood
- **Light Trail Effects**: Add visual flair to your spaceship

## 🛠️ Technologies

- **Three.js** - 3D graphics and WebGL rendering
- **GSAP** - Smooth animations and transitions
- **HTML5/CSS3** - Modern, responsive interface
- **JavaScript ES6+** - Core application logic
- **Local Storage API** - Data persistence
- **WebGL** - Hardware-accelerated 3D graphics

## 📁 Project Structure

```
cosmo-mind/
├── index.html          # Main HTML file with UI structure
├── styles.css          # CSS styling, animations, and responsive design
├── script.js           # Core application logic and 3D rendering
└── README.md           # Project documentation (this file)
```

## 🚀 Quick Start

### Option 1: Direct Browser Access
1. **Download** the project files
2. **Open** `index.html` in a modern web browser
3. **Start mapping** your ideas immediately!

### Option 2: Local Development Server
```bash
# Clone the repository
git clone https://github.com/yourusername/cosmo-mind.git
cd cosmo-mind

# Start a local server (choose one)
python -m http.server 8000    # Python 3
python -m SimpleHTTPServer 8000  # Python 2
npx serve .                   # Node.js
php -S localhost:8000         # PHP

# Open in browser
open http://localhost:8000
```

## 🎮 How to Use

### Creating Your Mind Universe

1. **Start with Your Central Idea**
   - Click the sun (central node) to edit your main concept
   - This becomes the foundation of your mind map

2. **Add Primary Thoughts (Planets)**
   - Click "Add Node" button
   - Enter title and content for your major ideas
   - These become planets orbiting your central concept

3. **Develop Supporting Ideas (Moons)**
   - Click "Add Sub/Tertiary Node" button
   - Select "Moon" type and choose a parent planet
   - Add secondary ideas that support your primary concepts

4. **Include Details (Asteroids)**
   - Click "Add Sub/Tertiary Node" button
   - Select "Asteroid" type and choose a parent moon
   - Add specific details and information

### Navigation and Interaction

- **Click Nodes**: Navigate spaceship to any celestial object
- **Edit Content**: Click nodes to edit titles and descriptions
- **View Full Content**: Use "View Full Content" to see complete information
- **Toggle Asteroids**: Click moons to show/hide their asteroid details
- **Manual Control**: Use arrow keys or WASD for manual spaceship control

### Data Management

- **Auto-Save**: Changes are automatically saved every 3 seconds
- **Manual Save**: Click the save button for immediate backup
- **Export Project**: Download your mind map as a JSON file
- **Import Project**: Load previously saved projects
- **Screenshot**: Capture current view as an image

## 🎨 Customization

### Settings Panel
Access settings via the gear icon to customize:
- **Galaxy Theme**: Choose from different visual themes
- **Orbit Speed**: Adjust how fast objects move (0.1x to 2.0x)
- **Spaceship Mode**: Auto-travel or manual control
- **Light Trail**: Enable/disable visual effects

### Visual Hierarchy
- **Size Hierarchy**: Planets > Moons > Asteroids
- **Color Coding**: Each node type has distinct colors
- **Orbital Patterns**: Different speeds for each level
- **Communication Lines**: Visual data transfer between ship and nodes

## 📱 Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 80+ | ✅ Full Support |
| Firefox | 75+ | ✅ Full Support |
| Safari | 13+ | ✅ Full Support |
| Edge | 80+ | ✅ Full Support |
| Mobile Browsers | Latest | ⚠️ Limited Support |

## 🔧 Development

### Prerequisites
- Modern web browser with WebGL support
- Basic knowledge of HTML, CSS, and JavaScript (for modifications)

### Local Development Setup
```bash
# Clone repository
git clone https://github.com/yourusername/cosmo-mind.git
cd cosmo-mind

# Install dependencies (if using npm)
npm install

# Start development server
npm start
```

### Project Architecture

#### Core Components
- **Scene Management**: Three.js scene setup and rendering
- **Node System**: Hierarchical data structure for mind map nodes
- **Navigation System**: Spaceship control and camera management
- **UI System**: Interactive panels and controls
- **Data Persistence**: Local storage and file import/export

#### Key Functions
- `init()` - Application initialization
- `createCentralNode()` - Creates the main idea (sun)
- `createMindMapNode()` - Creates primary ideas (planets)
- `createSubNode()` - Creates secondary/tertiary ideas (moons/asteroids)
- `saveToLocalStorage()` - Data persistence
- `exportToFile()` - Project export functionality

## 🚀 Deployment

### GitHub Pages
1. **Fork** this repository
2. **Enable GitHub Pages** in repository settings
3. **Select source branch** (main/master)
4. **Access** your live site at `https://username.github.io/cosmo-mind`

### Other Hosting Options
- **Netlify**: Drag and drop the project folder
- **Vercel**: Connect your GitHub repository
- **Firebase Hosting**: Use Firebase CLI to deploy
- **Any Static Hosting**: Upload files to any web server

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add comments for complex logic
- Test changes across different browsers
- Update documentation for new features

## 🐛 Known Issues

- **Mobile Performance**: Limited optimization for mobile devices
- **Large Mind Maps**: Performance may degrade with 100+ nodes
- **Browser Compatibility**: Some features may not work in older browsers

## 🔮 Roadmap

### Planned Features
- [ ] **Cloud Storage**: Save projects to cloud services
- [ ] **Collaboration**: Real-time multi-user editing
- [ ] **Advanced Export**: PDF and video export options
- [ ] **Mobile App**: Native mobile application
- [ ] **Templates**: Pre-built mind map templates
- [ ] **Advanced Analytics**: Usage statistics and insights

### Enhancement Ideas
- **Voice Commands**: Control via speech recognition
- **AI Integration**: Smart suggestions and auto-organization
- **3D Models**: Custom 3D models for different node types
- **Animation Presets**: Pre-built animation sequences
- **Plugin System**: Extensible architecture for custom features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 CosmoMind

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- **Three.js Community** - For the amazing 3D graphics library
- **GSAP Team** - For smooth animation capabilities
- **Font Awesome** - For beautiful icons
- **WebGL Community** - For hardware-accelerated graphics
- **Open Source Contributors** - For inspiration and support

## 📞 Support

- **Issues**: Report bugs and request features on [GitHub Issues](https://github.com/yourusername/cosmo-mind/issues)
- **Discussions**: Join the conversation on [GitHub Discussions](https://github.com/yourusername/cosmo-mind/discussions)
- **Email**: Contact us at your-email@example.com

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/cosmo-mind&type=Date)](https://star-history.com/#yourusername/cosmo-mind&Date)

---

<div align="center">

**Made with ❤️ by the CosmoMind Team**

*Transform your ideas into a universe. Navigate your thoughts like a space explorer.*

[🚀 Get Started](#quick-start) • [📖 Documentation](#how-to-use) • [🤝 Contribute](#contributing)

</div> 