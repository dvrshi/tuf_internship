# TUF SDE Internship Application: Code Editor Web Application

This repository contains a submission for the TUF Software Development Engineer (SDE) Internship. The web application is a simple 2-page application built to showcase proficiency in various technologies.

## Overview

The application consists of a front-end built with Next.js and hosted on Vercel. It utilizes the Monaco Editor as the code editor component and Tailwind CSS for styling.

On the backend, Node.js is used to create the server, which is hosted on Heroku. MySQL is employed as the database for storing persistent data.

Additionally, Redis is integrated into the application to cache data retrieved from MySQL temporarily. This caching mechanism helps optimize performance by reducing repeated requests to the MySQL database when users switch between the code editor and table pages. The caching duration is set to 10 minutes but can be adjusted as needed.

## Technologies Used

### Front-end
- Next.js
- Monaco Editor
- Tailwind CSS

### Back-end
- Node.js
- MySQL
- Redis

### Hosting
- Vercel (Front-end)
- Heroku (Back-end)

## Usage

1. Clone the repository: `git clone <repository-url>`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## Configuration

If you are hosting and then making changes, then you will need to enter all the process.env variables in heroku and vercel, vercel requires rapid codejudge api key and heroku requires redis cloud and jawsMySQL variables.
For local changes, please make .env files in both client and server folders, or replace with actual variable values directly in the code.

## Deployment

The front-end is automatically deployed to Vercel, while the back-end is deployed to Heroku. Deployment pipelines can be configured in respective platforms.

