// JSON Server module
import { create, router as _router, defaults, rewriter } from "json-server";
const server = create();
const router = _router("db.json");

const middlewares = defaults();

server.use(middlewares);
server.use(
  // rewrite /api/ to /
  rewriter({
    "/api/*":  "/$1",
  })
);

server.use(router);

// Listen to port
server.listen(3000, () => {
  console.log("JSON Server is running");
});

// Export the Server API
export default server;
