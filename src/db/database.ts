import { Database } from "bun:sqlite";

export const db = new Database("zero_to_one.db", { create: true });

// テーブル初期化
db.exec(`
  CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS snowremoval (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    comment TEXT NOT NULL DEFAULT '',
    reg_date TEXT NOT NULL,
    iscleared INTEGER NOT NULL DEFAULT 0,
    photo TEXT NOT NULL DEFAULT '',
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
  );

  CREATE TABLE IF NOT EXISTS point (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    point INTEGER NOT NULL,
    add_date TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
  );
`);

// 初期ユーザーの挿入 (存在しない場合のみ)
const existingUsers = db.query("SELECT COUNT(*) as count FROM user").get() as {
  count: number;
};
if (existingUsers.count === 0) {
  db.exec(`
    INSERT INTO user (username, password, role) VALUES ('admin', 'password', 'admin');
    INSERT INTO user (username, password, role) VALUES ('worker', 'password', 'worker');
    INSERT INTO user (username, password, role) VALUES ('Obara', 'password', 'worker');
    INSERT INTO user (username, password, role) VALUES ('Yasuda', 'password', 'worker');
    INSERT INTO user (username, password, role) VALUES ('Yamamoto', 'password', 'worker');
    INSERT INTO user (username, password, role) VALUES ('Moteki', 'password', 'worker');
  `);
}
