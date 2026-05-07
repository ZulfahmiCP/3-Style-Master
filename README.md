# 3 Style Master

3 Style Master is a modern web application for learning and managing 3-Style letter pairs used in blindfold Rubik’s Cube solving (3BLD).

The application provides an interactive flashcard-based study experience for both corner and edge letter pairs, with support for importing data directly from Google Sheets.

## Features

- Interactive flashcard study mode
- Separate study sessions for corners and edges
- Import letter pairs directly from Google Sheets
- Automatic synchronization and refresh from spreadsheets
- Local progress persistence using browser localStorage
- Search and filter letter pairs
- Track learning progress:
  - New
  - Learning
  - Mastered
- Responsive modern UI
- Smooth animations and transitions

---

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- Motion
- Lucide React
- PapaParse
- Vite

---

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/3-style-master.git
```

Navigate into the project directory:

```bash
cd 3-style-master
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

---

## Build for Production

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## Google Sheets Integration

The application imports data from publicly accessible Google Sheets.

### Required Sheet Tabs

Your spreadsheet should contain one or more of the following tabs:

- `Corner Words`
- `Corner Algs`
- `Edge Algs`

### Spreadsheet Format

The sheet format should follow this structure:

|   | A | B | C | D |
|---|---|---|---|---|
| 1 |   | A | B | C |
| 2 | A |   | Apple | ... |
| 3 | B | Banana |   | ... |

- First row contains the first letter
- First column contains the second letter
- Cell values contain words or algorithms

### Important

Your spreadsheet must be shared with:

> Anyone with the link can view

---

## Study Workflow

### Study Mode

- Flashcards display letter pairs
- Tap or click to reveal:
  - Word mnemonic
  - Algorithm
- Mark cards as:
  - Still Learning
  - Mastered

### Library

The library allows you to:

- Search letter pairs
- Filter by:
  - Type
  - First letter
- Track progress
- Reset learning status

---

## Data Persistence

All study progress and imported data are stored locally using browser `localStorage`.

No authentication or backend server is required.

---

## Project Structure

```text
src/
├── components/
│   ├── ImportView.tsx
│   ├── LibraryView.tsx
│   └── StudyView.tsx
├── App.tsx
├── index.css
├── main.tsx
├── sheetSync.ts
├── types.ts
└── useLocalStorage.ts
```

---

## Main Components

### App.tsx

Application root and navigation management.

### ImportView

Handles Google Sheets importing and validation.

### LibraryView

Displays and manages all imported letter pairs.

### StudyView

Interactive flashcard study interface.

### sheetSync.ts

Fetches and parses Google Sheets CSV data.

### useLocalStorage.ts

Custom React hook for persistent local storage state management.

---

## License

This project is licensed under the MIT License.