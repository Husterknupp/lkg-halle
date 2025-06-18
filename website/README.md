# LKG Halle Website

LKG Halle Website Code Repository. HTML code is built using Astro, a modern static site generator ([Link](https://astro.build)) and tailwindcss for styling ([Link](https://tailwindcss.com/)).

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro
│   └── pages/
│       └── index.astro <-- The main page of the website
│       └── interner-bereich.astro
│       └── ...
├── styles/
│   └── global.css
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from within the /website directory (this directory), from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to Learn More About Astro?

Feel free to check [their documentation](https://docs.astro.build) or jump into their [Discord server](https://astro.build/chat).

## 🖌️ Want to Learn More About Styling With tailwindcss?

Feel free to check [the tailwindcss documentation](https://tailwindcss.com/docs/styling-with-utility-classes).

## A Note on Astro's Image Component And How to Use It

Astro's image component is a powerful tool for optimizing images. It automatically handles responsive images, lazy loading, and more. To use it, you can import the `Image` component from `astro:assets` and use it like this:

```astro
---
import { Image } from 'astro:assets';
---
<Image src="/path/to/image.jpg" alt="Description of image" width={500} height={300} />
```

This will ensure that your images are optimized for performance and accessibility. For more details, refer to the [Astro Image Component documentation](https://docs.astro.build/en/guides/images/).
