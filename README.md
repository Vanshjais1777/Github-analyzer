# GitHub Profile Analyzer

A React application that analyzes GitHub profiles and displays repository information and commit activity.

## Features

- Search for GitHub users by username
- Display list of public repositories with details
- Visualize daily commit activity with a line chart
- Responsive design with a clean UI
- Dark mode support

## Technologies Used

- React
- TypeScript
- ShadcnUI (Built on Tailwind CSS)
- Recharts for data visualization
- GitHub REST API

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`

## Building for Production

1. Build the project:
   ```bash
   npm run build
   ```
2. The built files will be in the `dist` directory

## Deployment

You can deploy this application to any static hosting service. Here are some popular options:

- Netlify
- Vercel
- GitHub Pages

### Deploying to Netlify

1. Create a new site on Netlify
2. Connect your GitHub repository
3. Set the build command to `npm run build`
4. Set the publish directory to `dist`

## Notes

- The application uses the GitHub REST API without authentication, which has a rate limit of 60 requests per hour
- For higher rate limits, you can add GitHub authentication

## License

MIT