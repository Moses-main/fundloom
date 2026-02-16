# Contributing

## Setup
1. Install dependencies: `npm install`
2. Copy env template and configure local values.
3. Run app: `npm run dev`

## Quality Checks
- Lint targeted files before commit.
- Ensure `npm run build` succeeds.
- Add/update docs for architecture or operational changes.

## PR Guidelines
- Keep PRs focused and incremental.
- Include motivation, implementation notes, and validation output.
- For UI-visible changes, attach screenshots.

## Security & Secrets
- Never commit `.env` files or secrets.
- Redact sensitive values in logs and PR descriptions.
