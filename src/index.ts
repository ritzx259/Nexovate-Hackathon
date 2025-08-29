import app, { logger } from "./app.js";
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info({ PORT }, "Life Link API running"));
