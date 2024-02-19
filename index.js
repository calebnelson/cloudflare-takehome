import app from "./app";
import { API_PORT } from "./config";

app.listen(API_PORT || 8080, () => {
  console.log(`Server running on port ${PORT}`);
});
