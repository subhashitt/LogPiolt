# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a React TypeScript application for a Secure Log Analysis Tool. The application allows users to upload or input logs, mask sensitive data locally, and get AI-powered analysis while protecting user privacy.

## Key Technologies
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Lucide React for icons
- React Table for data handling
- Lodash for data manipulation
- Fuse.js for search functionality

## Architecture Guidelines
- All sensitive data masking happens locally in the frontend before any AI interaction
- Components are organized in a modular structure under `/src/components/`
- Types are centralized in `/src/types.ts`
- The application follows React best practices with functional components and hooks

## Code Style Preferences
- Use TypeScript interfaces for all prop types
- Prefer functional components with hooks over class components
- Use Tailwind CSS classes for styling
- Follow React naming conventions (PascalCase for components, camelCase for variables)
- Use semantic HTML elements where appropriate
- Implement proper accessibility features

## Security Considerations
- Never send raw logs to external APIs - always mask sensitive data first
- Implement proper input validation and sanitization
- Use secure patterns for file handling and data processing
- Follow OWASP guidelines for frontend security

## Component Structure
- Each component should have a clear single responsibility
- Props should be typed with TypeScript interfaces
- Use proper error boundaries and loading states
- Implement proper keyboard navigation and screen reader support
