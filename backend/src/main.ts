import { Application, Router } from "https://deno.land/x/oak@v17.1.3/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { Client } from "https://deno.land/x/postgres@v0.19.3/mod.ts";

const PORT = parseInt(Deno.env.get("PORT") || "8000");
const DB_HOST = Deno.env.get("DB_HOST") || "postgres";
const DB_PORT = parseInt(Deno.env.get("DB_PORT") || "5432");
const DB_NAME = Deno.env.get("DB_NAME") || "itportal";
const DB_USER = Deno.env.get("DB_USER") || "postgres";
const DB_PASSWORD = Deno.env.get("DB_PASSWORD") || "postgres";

// Database client
let dbClient: Client | null = null;

async function connectDatabase() {
  try {
    dbClient = new Client({
      hostname: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });
    
    await dbClient.connect();
    console.log(`✅ Connected to PostgreSQL database at ${DB_HOST}:${DB_PORT}`);
    
    // Initialize database schema
    await dbClient.queryArray(`
      CREATE TABLE IF NOT EXISTS portal_items (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Database schema initialized");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}

// Router setup
const router = new Router();

// Health check endpoint
router.get("/health", (ctx) => {
  ctx.response.body = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: dbClient ? "connected" : "disconnected",
  };
});

// Get all portal items
router.get("/api/items", async (ctx) => {
  try {
    if (!dbClient) {
      ctx.response.status = 503;
      ctx.response.body = { error: "Database not connected" };
      return;
    }

    const result = await dbClient.queryObject(
      "SELECT * FROM portal_items ORDER BY created_at DESC"
    );
    
    ctx.response.body = {
      success: true,
      data: result.rows,
      count: result.rows.length,
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  }
});

// Get single portal item
router.get("/api/items/:id", async (ctx) => {
  try {
    if (!dbClient) {
      ctx.response.status = 503;
      ctx.response.body = { error: "Database not connected" };
      return;
    }

    const id = ctx.params.id;
    const result = await dbClient.queryObject(
      "SELECT * FROM portal_items WHERE id = $1",
      [id]
    );
    
    if (result.rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Item not found" };
      return;
    }

    ctx.response.body = {
      success: true,
      data: result.rows[0],
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  }
});

// Create new portal item
router.post("/api/items", async (ctx) => {
  try {
    if (!dbClient) {
      ctx.response.status = 503;
      ctx.response.body = { error: "Database not connected" };
      return;
    }

    const body = await ctx.request.body.json();
    const { title, description, category } = body;

    if (!title) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Title is required" };
      return;
    }

    const result = await dbClient.queryObject(
      `INSERT INTO portal_items (title, description, category) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [title, description, category]
    );

    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      data: result.rows[0],
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  }
});

// Update portal item
router.put("/api/items/:id", async (ctx) => {
  try {
    if (!dbClient) {
      ctx.response.status = 503;
      ctx.response.body = { error: "Database not connected" };
      return;
    }

    const id = ctx.params.id;
    const body = await ctx.request.body.json();
    const { title, description, category } = body;

    const result = await dbClient.queryObject(
      `UPDATE portal_items 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [title, description, category, id]
    );

    if (result.rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Item not found" };
      return;
    }

    ctx.response.body = {
      success: true,
      data: result.rows[0],
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  }
});

// Delete portal item
router.delete("/api/items/:id", async (ctx) => {
  try {
    if (!dbClient) {
      ctx.response.status = 503;
      ctx.response.body = { error: "Database not connected" };
      return;
    }

    const id = ctx.params.id;
    const result = await dbClient.queryObject(
      "DELETE FROM portal_items WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Item not found" };
      return;
    }

    ctx.response.body = {
      success: true,
      message: "Item deleted successfully",
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  }
});

// Application setup
const app = new Application();

// Middleware
app.use(oakCors({
  origin: "*", // In production, specify allowed origins
}));

app.use(router.routes());
app.use(router.allowedMethods());

// Error handling
app.addEventListener("error", (evt) => {
  console.error("❌ Application error:", evt.error);
});

// Start server
async function start() {
  console.log("🚀 Starting IT Portal Backend...");
  
  // Connect to database
  await connectDatabase();
  
  // Start HTTP server
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  await app.listen({ port: PORT });
}

start();
