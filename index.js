import app from "./app.js";
import { API_PORT } from "./config.js";

app.listen(API_PORT || 8080, () => {
  console.log(`Server running on port ${API_PORT || 8080}`);
});
