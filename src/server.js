//This is the main entry point for the project. It acts like a manager, saying the business is open and ready to accept customers.
import { ensureEnv } from '#utils/env';
import { createApp } from '#app';
import { createRepos } from '#repositories/index';

//Checks utilities to ensure that all basic services are available and working.
const env = ensureEnv();
const repos = await createRepos(); // The main app, which ensure that the repos are present and ready to work b4 data comes in.

const app = createApp({  // This uses the createApp file we built and hooks it up to the rest of the app.
  repos,
  config: { JWT_Secret: env.JWT_SECRET }//passing the JWT_Secret into CreateApp, which allows middleware to access it. 
});

// This starts the server and officially tells the internet that the app can be found at this address.
app.listen(env.PORT, () => {
  console.log(`ContentHub API listening on http://localhost:${env.PORT}`);
});
