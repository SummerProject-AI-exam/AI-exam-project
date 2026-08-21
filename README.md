
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
=======
# AI-exam-project
 
> An intelligent examination platform for managing courses, assignments,
> examinations, automated assessment, and examination monitoring.

The **AI Exam Platform** is a web-based examination system designed to
provide teachers and students with a centralized environment for
creating and managing courses, assignments, and exams.

The platform also provides examination monitoring capabilities,
including window focus/blur monitoring, camera and face monitoring,
gaze-related monitoring, and fraud-event reporting. Teachers can review
student submissions, examination results, and historical monitoring
events through dedicated reporting pages.

---

## 🎥 Project Demo

Take a quick look at the AI Exam Platform in action.

[▶️ **Watch the Project Demo**](DEMO_VIDEO_LINK)

---


## Tech Stack
- Frontend: React
- Backend: Node.js
- Database: Supabase
- AI: Face landmarker

## How to Run 
1. ... 
2. ...

## Current Status
- Week 2
- What's done: Research, wireframes, and database
- What's next: CSV import, and the main page for student and teacher

## Key Features
- [ ] Authentication
- [ ] Weekly assignments
- [ ] Exam mode
- [ ] Gaze tracking (POC)
- [ ] Tab tracking
- [ ] Teacher dashboard
>>>>>>> 5d56a91baed69cf49758d2be394331103eedab1f
