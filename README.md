# Vertex Collaboration Demo

 Collaborate on 3D models in real-time using the Vertex Platform.

## Run locally in Docker

1. Copy `.env.local.template` to `.env.local` and optionally edit values
1. Run `docker-compose --file ./docker-compose.yml up` to start the app locally
1. Browse to http://localhost:3000

If you pull down changes, you'll need to run `docker-compose --file ./docker-compose.yml build` to build them and then `docker-compose --file ./docker-compose.yml up` again.

## Local development

1. Copy `.env.local.template` to `.env.local` and optionally edit values
1. Install dependencies, `yarn install`
1. Run `yarn dev` to start the local development server
1. Browse to http://localhost:3000

### Project organization

```text
public/       // Static assets
src/
  components/ // Components used in pages
  lib/        // Shared libraries and utilities
  pages/      // Pages served by NextJS
    api/      // API endpoints served by NextJS
```

### Deployment

A few options for deployment,

- [Vercel](https://nextjs.org/docs/deployment)
- [Netlify](https://www.netlify.com/blog/2020/11/30/how-to-deploy-next.js-sites-to-netlify/)
- [AWS CDK](https://github.com/serverless-nextjs/serverless-next.js#readme)
