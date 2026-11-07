# Watson Recipes

A small, local-first recipe app for planning shared meals with vegetarian and protein-focused options.

## Run it

For development, open `index.html` in a browser. No build step or dependencies are required. For install/share features, use the HTTPS deployment: install Watson Recipes from your browser menu, then share a post, video, or link to it from another app. The shared title, text, and URL are saved as an import draft for review.

Cooking history, ratings, household tags, saved recipes, and imported links are stored in that browser's local storage. Data does not currently sync between family members or devices. WhatsApp's share action can send individual messages or links into the app; reading or syncing a whole group thread and AI extraction of videos/social posts need a backend integration.

The app includes 15 starter ideas, the 30 dinners and 10 standalone lunches from the Confluence planner, and the 30 dinners from the Google Docs plan. Its two featured Google Docs recipes include full ingredients and methods. Planner entries link back to their source pages; starter ideas use a web search for recipe examples. Search covers titles, summaries, protein swaps, and available ingredient/method text, with title matches ranked first. Recipe photos are illustrative images loaded from Unsplash, not verified photos of each exact dish.
