# Hercycle Documentation

This folder contains documentation for the Hercycle Educational Platform project.

## 📊 Use Case Diagram

The use case diagram shows all the functionalities and interactions in the Hercycle platform.

### Files Available:

1. **use-case-diagram.md** - Comprehensive markdown document with:
   - Mermaid diagram (renders in GitHub, VS Code, many markdown viewers)
   - Detailed use case descriptions
   - Actor descriptions
   - System boundaries
   - Implementation status

2. **use-case-diagram.puml** - PlantUML diagram file
   - Can be rendered using PlantUML tools
   - High-quality visual diagram

---

## 🎯 How to View the Diagrams

### Option 1: View Markdown in GitHub/VS Code
1. Open `use-case-diagram.md` in VS Code or GitHub
2. The Mermaid diagram will render automatically
3. Scroll down for detailed descriptions

### Option 2: Use PlantUML
1. **Online**:
   - Go to http://www.plantuml.com/plantuml/uml/
   - Paste contents of `use-case-diagram.puml`
   - View rendered diagram

2. **VS Code Extension**:
   - Install "PlantUML" extension
   - Open `use-case-diagram.puml`
   - Press `Alt+D` to preview

3. **Command Line**:
   ```bash
   # Install PlantUML
   npm install -g node-plantuml

   # Generate diagram
   puml generate use-case-diagram.puml -o use-case-diagram.png
   ```

### Option 3: Mermaid Live Editor
1. Go to https://mermaid.live/
2. Copy the Mermaid code from `use-case-diagram.md`
3. Paste and view the rendered diagram
4. Export as SVG/PNG if needed

---

## 📋 Quick Reference

### Actors
- **Student/Child (10-18 years)**: Primary user learning about health education
- **System**: Automated processes for points, levels, badges

### Main Use Case Categories

#### ✅ Implemented (Phases 1-2)
- **Authentication**: Sign Up, Login, Logout
- **Profile Management**: View/Update Profile, Statistics
- **Module System**: Browse, Filter, View, Complete 12 educational modules
- **Dashboard**: Progress tracking, stats, recent activity
- **Basic Gamification**: Points (50 per module), 7-level system

#### ⏳ Planned (Phases 3-6)
- **Quiz System**: 8-10 questions per module, multiple choice
- **Badge System**: 5 categories (Milestone, Perfect Score, Streak, Points, Special)
- **Streak Tracking**: Daily login rewards
- **Enhanced UI**: Animations, illustrations, celebrations

### Key Numbers
- **12 Educational Modules** covering:
  - Body changes and puberty
  - Periods and menstruation
  - Hygiene and self-care
  - Emotions and mental health
  - Relationships and safety
  - Nutrition and exercise

- **Points System**:
  - 50 points per module completion
  - 10 points per quiz question
  - Bonus points for perfect scores and first attempts

- **7 Levels**:
  1. Beginner (0-199 points)
  2. Explorer (200-499)
  3. Learner (500-999)
  4. Scholar (1000-1999)
  5. Expert (2000-3499)
  6. Master (3500-5499)
  7. Champion (5500+)

---

## 🔗 Related Documentation

- **API Documentation**: (To be added)
- **Database Schema**: See `/server/models/` directory
- **Frontend Components**: See `/client/src/components/` directory
- **Implementation Plan**: See `~/.claude/plans/starry-doodling-firefly.md`

---

## 📝 Notes for Developers

### Use Case Priorities

**High Priority** (Phase 1-2: Completed ✅):
- UC1-UC4: Authentication
- UC5-UC7: Profile Management
- UC8-UC14: Module System
- UC21-UC24: Dashboard
- UC25-UC27: Basic Gamification

**Medium Priority** (Phase 3-4: Next):
- UC15-UC20: Quiz System
- UC28-UC30: Badge/Achievement System

**Lower Priority** (Phase 5-6: Polish):
- Enhanced animations
- Content expansion
- Advanced features

### Testing Checklist
- [ ] Age verification (reject <10 or >18)
- [ ] JWT authentication on all protected routes
- [ ] Module completion awards points correctly
- [ ] Level progression calculates accurately
- [ ] Progress tracking updates in real-time
- [ ] Dashboard displays correct statistics
- [ ] Category filtering works for all 8 categories

---

## 🎨 Design Guidelines

### Child-Friendly UI (Age 10-18)
- **Colors**: Pink (#FF69B4), Purple (#9B59B6), Teal (#1ABC9C)
- **Fonts**: Quicksand/Poppins (headers), Nunito (body)
- **Style**: Rounded corners, soft gradients, emoji icons
- **Animations**: Smooth transitions, celebration effects
- **Tone**: Encouraging, positive, educational

---

Last Updated: 2025-12-29
