# Watson Recipes

A small, local-first recipe app for planning shared meals with vegetarian and protein-focused options.

## Run it

For development, open `index.html` in a browser. No build step or dependencies are required. For install/share features, use the HTTPS deployment: install Watson Recipes from your browser menu, then share a post, video, or link to it from another app. The shared title, text, and URL are saved as an import draft for review.

Cooking history, ratings, household tags, saved recipes, and imported links are stored in that browser's local storage. Data does not currently sync between family members or devices. WhatsApp exports can be processed locally into the app's recipe data; social links without readable captions remain in the Import inbox for review.

The app includes starter ideas, the Confluence and Google Docs meal plans, and recipes collected from the Watson family WhatsApp export. Where the chat provided a recipe page or screenshot, recipes link to the source and may include its image; unresolved social posts are kept as review links. Search covers titles, summaries, protein swaps, and available ingredient/method text, with title matches ranked first.
