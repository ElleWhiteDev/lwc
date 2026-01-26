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

## 🚀 Local Development Setup

This project is now a **full-stack application** with a Node.js/Express backend, PostgreSQL database, and React frontend.

### Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **PostgreSQL** (optional for local development - you can use the Heroku Postgres database)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ElleWhiteDev/lwc.git
   cd lwc
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env` and update the values:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   # Database - Use your Heroku Postgres URL or local PostgreSQL
   DATABASE_URL=postgres://username:password@host:port/database

   # JWT Secret - Generate a secure random string
   JWT_SECRET=your-secret-key-here

   # Admin User - This account will be created automatically on first server start
   ADMIN_EMAIL=your-email@example.com
   ADMIN_PASSWORD=your-secure-password
   ADMIN_NAME=Your Name

   # Environment
   NODE_ENV=development
   PORT=3000
   ```

   **Note**: The `.env` file in this repo is already configured to use the Heroku Postgres database for local development. You can use it as-is or set up a local PostgreSQL instance.

4. **Start the development servers**

   You need **two terminal windows**:

   **Terminal 1 - Backend Server:**
   ```bash
   npm start
   ```
   This starts the Express server on `http://localhost:3000`

   **Terminal 2 - Frontend Dev Server:**
   ```bash
   npm run dev
   ```
   This starts the Vite dev server on `http://localhost:5173`

5. **Access the application**

   Open your browser to `http://localhost:5173`

   - Public pages: `/`, `/about`, `/events`
   - Admin login: `/login`
   - Admin panel: `/admin` (requires authentication)

6. **Login as admin**

   Use the credentials you set in your `.env` file:
   - Email: `ADMIN_EMAIL`
   - Password: `ADMIN_PASSWORD`

### Database Initialization

The database tables are created automatically when you start the backend server for the first time. The admin user specified in your `.env` file will also be seeded automatically.

## 🌐 Deploying to Heroku

This application is configured to run as a single Node.js app on Heroku, serving both the API and the built frontend.

### Prerequisites

- Heroku CLI installed ([download here](https://devcenter.heroku.com/articles/heroku-cli))
- Heroku account
- Git repository

### Deployment Steps

1. **Login to Heroku**

   ```bash
   heroku login
   ```

2. **Verify your Heroku app and Postgres addon**

   Your app: `a-life-worth-celebrating`
   Postgres addon: `postgresql-clean-40515`

   Verify the addon is attached:
   ```bash
   heroku addons --app a-life-worth-celebrating
   ```

3. **Set environment variables on Heroku**

   ```bash
   # JWT Secret - Generate a secure random string (e.g., openssl rand -base64 32)
   heroku config:set JWT_SECRET="your-production-secret-key" --app a-life-worth-celebrating

   # Admin account credentials
   heroku config:set ADMIN_EMAIL="your-email@example.com" --app a-life-worth-celebrating
   heroku config:set ADMIN_PASSWORD="your-secure-password" --app a-life-worth-celebrating
   heroku config:set ADMIN_NAME="Your Name" --app a-life-worth-celebrating

   # Environment
   heroku config:set NODE_ENV="production" --app a-life-worth-celebrating
   ```

   **Note**: `DATABASE_URL` is automatically set by the Heroku Postgres addon, so you don't need to set it manually.

4. **Verify buildpack is set to Node.js**

   ```bash
   heroku buildpacks --app a-life-worth-celebrating
   ```

   If it's not set or shows the static buildpack, update it:
   ```bash
   heroku buildpacks:clear --app a-life-worth-celebrating
   heroku buildpacks:set heroku/nodejs --app a-life-worth-celebrating
   ```

5. **Deploy your code**

   ```bash
   git add .
   git commit -m "Add full-stack CMS backend"
   git push heroku main
   ```

   Heroku will automatically:
   - Install dependencies
   - Run `npm run build` (via the `heroku-postbuild` script)
   - Start the server with `npm start`

6. **Monitor the deployment**

   ```bash
   heroku logs --tail --app a-life-worth-celebrating
   ```

7. **Open your deployed application**

   ```bash
   heroku open --app a-life-worth-celebrating
   ```

   Or visit: `https://a-life-worth-celebrating.herokuapp.com`

8. **Test the admin panel**

   - Navigate to `/login`
   - Login with your `ADMIN_EMAIL` and `ADMIN_PASSWORD`
   - Access the admin panel at `/admin`

### Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes (auto-set by Heroku) |
| `JWT_SECRET` | Secret key for signing JWT tokens | Yes |
| `ADMIN_EMAIL` | Email for the main admin account | Yes |
| `ADMIN_PASSWORD` | Password for the main admin account | Yes |
| `ADMIN_NAME` | Display name for the main admin | Yes |
| `NODE_ENV` | Environment (`development` or `production`) | Yes |
| `PORT` | Server port (auto-set by Heroku) | No |

## 📝 Content Management

### Admin Panel Features

Once logged in to `/admin`, you can:

1. **Content Tab**: Edit JSON content for:
   - `home` - Homepage content (hero subtitle, highlights, CTA text)
   - `about` - About page content (mission paragraphs, CTA text)
   - `siteConfig` - Site-wide configuration (site name, tagline, contact email, social links)

2. **Events Tab**: Create, edit, publish/unpublish, and delete events
   - Events marked as "published" appear on the public `/events` page
   - Unpublished events are only visible in the admin panel

3. **Users Tab** (main admin only): Create, edit, and delete editor accounts
   - Only the main admin (matching `ADMIN_EMAIL`) can manage users
   - Other editors can only edit content and events

4. **Audit Log Tab**: View all changes made by all users
   - Tracks who made what changes and when
   - Shows before/after data for all modifications

5. **My Profile Tab**: Update your own name, email, and password

### Example Content JSON Structures

**Home Content (`/api/content/home`):**
```json
{
  "heroSubtitle": "A nonprofit creating inclusive spaces where everyone feels valued and celebrated.",
  "highlightTitle": "What We Do",
  "highlightBody": "We create inclusive spaces and events...",
  "ctaHeading": "Join Our Community",
  "ctaBody": "Be part of something bigger..."
}
```

**About Content (`/api/content/about`):**
```json
{
  "heroSubtitle": "Learn more about our mission...",
  "missionHeading": "Our Mission",
  "missionParagraph1": "A Life Worth Celebrating is a nonprofit...",
  "missionParagraph2": "Through events, volunteer programs...",
  "ctaHeading": "Get Involved",
  "ctaBody": "Ready to make a difference?"
}
```

**Site Config (`/api/content/siteConfig`):**
```json
{
  "siteName": "A Life Worth Celebrating",
  "siteTagline": "Creating inclusive spaces for everyone",
  "contactEmail": "hello@alifeworthcelebrating.org",
  "socialLinks": {
    "facebook": "https://facebook.com/yourpage",
    "instagram": "https://instagram.com/yourpage",
    "twitter": "https://twitter.com/yourpage"
  },
  "donateUrl": "https://donate.stripe.com/your-link"
}
```

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
