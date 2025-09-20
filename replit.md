# Drip Campaign - Next.js Application

## Overview
This is a Next.js 15 application with TypeScript, Tailwind CSS 4, and using Bun as the package manager. The project was successfully imported from GitHub and configured for the Replit environment.

## Project Structure
- **Frontend**: Next.js application with App Router
- **Styling**: Tailwind CSS 4 with custom themes
- **Package Manager**: Bun
- **Port**: 5000 (configured for Replit)

## Recent Changes
- **2025-09-20**: Initial import and Replit setup
  - Installed dependencies with bun
  - Disabled Turbopack due to compatibility issues in Replit environment
  - Configured Next.js to run on 0.0.0.0:5000
  - Set up development workflow
  - Configured deployment for autoscale with build and start commands
  - Added cache control headers to prevent caching issues

## Development Setup
- Development server runs on port 5000
- Uses regular Next.js compiler (not Turbopack)
- Configured for cross-origin requests in Replit environment
- Hot reloading and Fast Refresh are working correctly

## Deployment Configuration
- **Type**: Autoscale (stateless web application)
- **Build Command**: `bun run build`
- **Start Command**: `bun run start`

## User Preferences
- Uses Bun as preferred package manager
- Tailwind CSS 4 for styling
- TypeScript for type safety
- Biome for linting and formatting

## Notes
- Turbopack was disabled due to symlink issues in Replit environment
- Application successfully compiles and runs without errors
- All dependencies are properly installed and configured