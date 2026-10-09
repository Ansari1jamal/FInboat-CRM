# GitHub Actions deployment

Required repository secrets for production deployment:

- `SERVER_HOST`: VPS hostname or IP address
- `SERVER_USER`: dedicated non-root deployment user
- `SERVER_SSH_KEY`: private Ed25519 key whose public key is in the server user's `authorized_keys`

The production server must contain the repository at `/var/www/finboat` and a private `.env.production` file. `FinBoat Production Deploy` runs only after `FinBoat CI` succeeds for `main`.
