import { app } from "./app";
import logger from "./utils/logger";

app.listen(process.env.PORT || 3000, () => {
  logger.info(`Server is running on port http://localhost:3000`);
});
