# A Life Worth Celebrating

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646cff.svg)

A vibrant, inclusive website for **A Life Worth Celebrating, Inc.** - a nonprofit organization dedicated to creating inclusive spaces where every life is celebrated. This website showcases community events, volunteer opportunities, and provides resources for LGBTQ+ advocacy and support.

## 🌈 About

A Life Worth Celebrating is committed to:

- Creating inclusive community spaces
- Hosting pride festivals and community events
- Providing volunteer opportunities
- Advocating for equality and acceptance
- Building a community of love, acceptance, and joy

## ✨ Features

- **Responsive Design**: Mobile-first approach with beautiful rainbow-themed branding
- **Accessibility**: WCAG compliant with skip links, ARIA labels, and keyboard navigation
- **Event Listings**: Showcase upcoming and past community events
- **Contact Form**: Easy way for community members to get in touch
- **Social Integration**: Links to Facebook and donation platform (Zeffy)
- **Fast Performance**: Built with Vite for lightning-fast load times

## 🚀 Tech Stack

- **React 19** - Modern UI library
- **Vite** - Next-generation frontend tooling
- **React Router** - Client-side routing
- **CSS3** - Custom styling with CSS variables
- **Google Fonts** - Poppins, Dancing Script, and Pacifico fonts

## 📋 Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager
- Git

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ElleWhiteDev/lwc.git
   cd lwc
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📦 Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

To preview the production build locally:

```bash
npm run preview
```

## 🌐 Deployment

### Deploying to Heroku

This project is configured for easy deployment to Heroku using the static buildpack.

1. **Install the Heroku CLI**

   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku

   # Or download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login to Heroku**

   ```bash
   heroku login
   ```

3. **Create a new Heroku app**

   ```bash
   heroku create your-app-name
   ```

4. **Add the static buildpack**

   ```bash
   heroku buildpacks:add heroku/nodejs
   heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static.git
   ```

5. **Deploy**

   ```bash
   git push heroku main
   ```

6. **Open your deployed site**
   ```bash
   heroku open
   ```

### Alternative Deployment Options

- **Netlify**: Connect your GitHub repo and deploy automatically
- **Vercel**: Import your GitHub repo for instant deployment
- **GitHub Pages**: Use `gh-pages` package for static hosting

## 📁 Project Structure

```
lwc/
├── public/              # Static assets
│   └── vite.svg        # Favicon
├── src/
│   ├── assets/         # Images and SVGs
│   │   └── images/     # Site images
│   ├── components/     # Reusable components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── ScrollToTop.jsx
│   ├── config/         # Configuration files
│   │   └── siteConfig.js
│   ├── pages/          # Page components
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   └── Events.jsx
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html          # HTML template
├── package.json        # Dependencies
├── vite.config.js      # Vite configuration
├── static.json         # Heroku static config
└── README.md           # This file
```

## ⚙️ Configuration

### Site Configuration

Update site-wide settings in `src/config/siteConfig.js`:

```javascript
export const SITE_CONFIG = {
  facebookUrl: "your-facebook-url",
  donateUrl: "your-donation-url",
  contactEmail: "your-email@example.com",
  orgName: "A Life Worth Celebrating, Inc.",
};
```

### Styling

Global CSS variables are defined in `src/index.css`. Customize colors, spacing, and other design tokens:

```css
:root {
  --primary-purple: #7b2d8e;
  --gradient-rainbow: linear-gradient(...);
  /* ... more variables */
}
```

## 🤝 Contributing

We welcome contributions! This is a small community project, so please keep changes simple and focused.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💖 Support

If you'd like to support A Life Worth Celebrating:

- [Donate via Zeffy](https://www.zeffy.com/en-US/ticketing/a-life-worth-celebrating-incs-shop)
- [Follow us on Facebook](https://www.facebook.com/profile.php?id=61576987598719)
- Volunteer at our events
- Spread the word about our mission

## 📧 Contact

For questions or inquiries:

- Email: alifeworthcelebratinginc@gmail.com
- Facebook: [A Life Worth Celebrating](https://www.facebook.com/profile.php?id=61576987598719)

---

Made with 💜 by the A Life Worth Celebrating community
