# SWADE Bot

1. Install `pnpm`: https://pnpm.io/installation
2. Install dependencies with `pnpm i`
3. Create a `config.json` file in the project root (it will be ignored by git), and copy and paste the content of this file into it: https://docs.google.com/document/d/1RouyCn4Zu9IqTkKHtdGydsy3zTYV_d1PlIApYMnMyP4
4. Start local bot (points to our discord server as the `guild`) with `npm start`
5. Deploy commands with `npm deploy-commands`
6. Interactions are logged to the `console`
7. Development commands will have a `-dev` suffix (in our discord server)