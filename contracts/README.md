# contracts

Single source of truth for the request schemas shared by `server` and `client`
(sign-up, sign-in, create-club, update-profile).

Edit the files in `src/`, then run:

```sh
node contracts/sync.mjs          # copies into server/src/contracts and client/src/shared/contracts
node contracts/sync.mjs --check  # fails if a copy has drifted (also run by the server test suite)
```

The copies are committed so each app builds on its own (Nest `dist` layout,
Metro) without a workspace. Never edit the copies by hand.
