# Deploying with Docker Compose

> [!NOTE]
> These instructions assume you're running `docker compose` and not the legacy `docker-compose`. Some things may not work as expected if you are not.

1. Create a new Discord application
    - Attach a bot to it and make note of the bot's token
    - In the OAuth2 settings:
        - Make note of the client ID and secret
        - Add as a permitted redirect for `SHOPKEEPER_URL/auth/callback`, where `SHOPKEEPER_URL` is the URL that Shopkeeper's web UI will be accessible at. This will vary based on your exact setup, but by default will be `http://YOUR_IP:8000`
        - Generate an OAuth2 URL with the `bot` scopes, and the "Manage Threads" permission granted
        - Use the generated URL to invite the bot to your server
2. Create the following channels in your server:
    - A channel for the listing threads to be posted in (eg. `#marketplace`)
        - Configure the permission overrides to deny `@everyone` the following permissions:
            - Send Messages
            - Create Public Threads
            - Create Private Threads
        - Configure the permission overrides to grant the role of your bot the following permissions:
            - Send Messages
            - Create Public Threads
    - (Optional) A channel for shopkeeper events to be posted in (eg. `#marketplace-events`). Copy the above permissions
3. Copy `.env.example` to `.env`, and fill it out with the respective values:
    - `SHOPKEEPER_TOKEN`: The bot token from earlier
    - `SHOPKEEPER_CLIENT_ID`: The client ID from earlier
    - `SHOPKEEPER_CLIENT_SECRET`: The client secret from earlier
    - `SHOPKEEPER_GUILD_ID`: The ID of your server
    - `SHOPKEEPER_CHANNEL_ID`: The ID of the listings channel
    - `SHOPKEEPER_OWNER_ID`: ID of your Discord user. User provided here will be granted permission to manage other people's listings.
    - `SHOPKEEPER_EVENTS_CHANNEL_ID`: The ID of the events channel
    - `SHOPKEEPER_SESSION_SECRET`: A randomly-generated secret value to be used to sign sessions
4. Run `docker compose up -d`

Once done, the web UI should be accessible at `http://YOUR_IP:8000` (unless you put a reverse proxy in front), and the bot should be usable in your server.
