import path from "path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { apiRouter } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimit";

export const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        // The app loads Google Fonts and relies on React's inline style={}
        // throughout (animations, computed positions) - both need an
        // explicit allowance, or the default 'self'-only policy silently
        // breaks fonts and layout once this server also serves the built
        // frontend (in dev, Vite serves it separately and never hits this
        // CSP at all, which is why this wasn't needed before).
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "data:"],
      },
    },
  })
);
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(morgan(env.isProd ? "combined" : "dev"));
app.use("/api", apiLimiter, apiRouter);

// In production this server also serves the built frontend (single Render
// web service, one origin - no CORS/cookie cross-site complications). In
// dev, Vite serves the frontend itself on its own port, so this is a no-op.
if (env.isProd) {
  const frontendDist = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(frontendDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);
