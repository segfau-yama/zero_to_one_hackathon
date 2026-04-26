import { serve } from "bun";
import index from "./index.html";
import { db } from "./db/database";

// === ヘルパー ===

function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

function error(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

/**
 * リクエストヘッダーからユーザー情報を取得し、指定ロールを持つか確認する。
 * フロントエンドは X-User-Id と X-User-Role ヘッダーを送信すること。
 * ロールが一致しない場合は null を返す。
 */
function requireRole(
  req: Request,
  role: string,
): { id: number; role: string } | null {
  const userId = req.headers.get("X-User-Id");
  const userRole = req.headers.get("X-User-Role");
  if (!userId || !userRole) return null;
  if (userRole !== role) return null;
  return { id: Number(userId), role: userRole };
}

// === サーバー ===

const server = serve({
  hostname: "0.0.0.0",
  // tls: {
  //   key: Bun.file("key.pem"),
  //   cert: Bun.file("cert.pem"),
  // },
  routes: {
    "/service-worker.js": {
      GET() {
        return new Response(Bun.file("./src/service-worker.js"), {
          headers: { "Content-Type": "application/javascript" },
        });
      },
    },
    "/*": index,

    // --- USER ---

    // POST /api/user/login
    "/api/user/login": {
      async POST(req) {
        const body = (await req.json()) as {
          username: string;
          password: string;
        };
        const user = db
          .query(
            "SELECT id, username, role FROM user WHERE username = ? AND password = ?",
          )
          .get(body.username, body.password) as {
          id: number;
          username: string;
          role: string;
        } | null;

        if (!user) return error("ユーザー名またはパスワードが違います", 401);
        return json(user);
      },
    },

    // --- SNOWREMOVAL ---

    // GET /api/snowremoval  - 座標・id・iscleared のみ返す
    // POST /api/snowremoval - 新規登録
    "/api/snowremoval": {
      async GET() {
        const list = db
          .query(
            "SELECT id, latitude, longitude, iscleared, user_id FROM snowremoval",
          )
          .all() as {
          id: number;
          latitude: number;
          longitude: number;
          iscleared: number;
          user_id: number;
        }[];
        // SQLite の iscleared は 0/1 なので boolean に変換
        return json(list.map((r) => ({ ...r, iscleared: r.iscleared === 1 })));
      },

      async POST(req) {
        // user のみ除雪報告可能
        const caller = requireRole(req, "user");
        if (!caller) return error("権限がありません", 403);

        const body = (await req.json()) as {
          latitude: number;
          longitude: number;
          comment: string;
          photo: string;
          user_id: number;
        };
        const reg_date = new Date().toISOString();
        const result = db
          .query(
            `INSERT INTO snowremoval (latitude, longitude, comment, reg_date, iscleared, photo, user_id)
             VALUES (?, ?, ?, ?, 0, ?, ?)
             RETURNING *`,
          )
          .get(
            body.latitude,
            body.longitude,
            body.comment,
            reg_date,
            body.photo,
            body.user_id,
          ) as {
          id: number;
          latitude: number;
          longitude: number;
          comment: string;
          reg_date: string;
          iscleared: number;
          photo: string;
          user_id: number;
        };
        return json({ ...result, iscleared: result.iscleared === 1 }, 201);
      },
    },

    // GET /api/snowremoval/:id  - 詳細（登録日・写真・コメント）
    // DELETE /api/snowremoval/:id
    "/api/snowremoval/:id": {
      async GET(req) {
        const id = Number(req.params.id);
        const record = db
          .query(
            `
            SELECT s.*, u.username
            FROM snowremoval s
            JOIN user u ON s.user_id = u.id
            WHERE s.id = ?
          `,
          )
          .get(id) as {
          id: number;
          latitude: number;
          longitude: number;
          comment: string;
          reg_date: string;
          iscleared: number;
          photo: string;
          user_id: number;
          username: string;
        } | null;
        if (!record) return error("Not found", 404);
        return json({ ...record, iscleared: record.iscleared === 1 });
      },

      async DELETE(req) {
        const id = Number(req.params.id);
        const record = db
          .query("SELECT id FROM snowremoval WHERE id = ?")
          .get(id);
        if (!record) return error("Not found", 404);
        db.query("DELETE FROM snowremoval WHERE id = ?").run(id);
        return json({ success: true });
      },
    },

    // PUT /api/snowremoval/:id/clear  - 除雪完了
    "/api/snowremoval/:id/clear": {
      async PUT(req) {
        const id = Number(req.params.id);
        const record = db
          .query("SELECT id FROM snowremoval WHERE id = ?")
          .get(id);
        if (!record) return error("Not found", 404);
        const updated = db
          .query(
            "UPDATE snowremoval SET iscleared = 1 WHERE id = ? RETURNING *",
          )
          .get(id) as {
          id: number;
          latitude: number;
          longitude: number;
          comment: string;
          reg_date: string;
          iscleared: number;
          photo: string;
          user_id: number;
        };
        return json({ ...updated, iscleared: updated.iscleared === 1 });
      },
    },

    // --- POINT ---

    // GET /api/point/user/:userId
    "/api/point/user/:userId": {
      async GET(req) {
        // user のみポイント取得可能
        const caller = requireRole(req, "user");
        if (!caller) return error("権限がありません", 403);

        const userId = Number(req.params.userId);
        const list = db
          .query("SELECT * FROM point WHERE user_id = ? ORDER BY add_date DESC")
          .all(userId) as {
          id: number;
          point: number;
          add_date: string;
          user_id: number;
        }[];
        return json(list);
      },
    },

    // POST /api/point
    "/api/point": {
      async POST(req) {
        const body = (await req.json()) as { point: number; user_id: number };
        const add_date = new Date().toISOString();
        const record = db
          .query(
            "INSERT INTO point (point, add_date, user_id) VALUES (?, ?, ?) RETURNING *",
          )
          .get(body.point, add_date, body.user_id) as {
          id: number;
          point: number;
          add_date: string;
          user_id: number;
        };
        return json(record, 201);
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
