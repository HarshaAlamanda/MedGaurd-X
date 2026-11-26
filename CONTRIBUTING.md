# Contributing to MedGuard-X

Thanks for helping improve the project. Start with the [quick start](README.md#quick-start) and [architecture](docs/ARCHITECTURE.md).

## Propose a change

Open an issue describing the problem, expected behavior, and a reproducible example. For larger changes, explain the approach before implementation. Use synthetic patient records and redact personal data, credentials, and tokens from reports.

## Development workflow

1. Create a focused branch from the latest `main`.
2. Make a small, coherent change and update affected documentation.
3. Run `npm ci`, `npm run lint`, and `npm run build` from `frontend` for frontend changes.
4. For backend changes, start FastAPI locally and exercise the relevant routes through `/docs`. Record inputs, expected results, and observed results using synthetic data.
5. Open a pull request with the problem, implementation, and validation results.

The repository does not currently provide a comprehensive automated backend test suite. Do not describe the Streamlit demo in `test_app.py` as API coverage.

## Model and document changes

Preserve feature ordering across training and inference. Explain dataset provenance, evaluation methodology, library versions, and limitations when changing model artifacts. Avoid claims of diagnostic accuracy or document authenticity without evidence.

## Commit hygiene

Use clear commit messages. Exclude `.env`, credentials, local databases, patient documents, generated datasets, and dependency folders. Keep unrelated formatting and generated artifacts out of the same change.

## Sensitive reports

For a vulnerability involving credentials, account access, or personal data, contact the maintainer privately at aharsha1587@gmail.com instead of posting exploit details or sensitive records in a public issue.
