/* Applies a prisma/migrations/<name>/migration.sql by hand.
 *
 * `prisma migrate` cannot run here: .env has no DIRECT_URL and Neon's pooled
 * endpoint won't serve migrations. The migration files are still written so the
 * history exists for when a direct connection is available; this script is what
 * actually puts them into the database.
 *
 *   node scripts/apply-migration.js 20260725120000_partner_recurring_commission
 *
 * Statements run one at a time, outside an explicit transaction — ALTER TYPE ...
 * ADD VALUE cannot run inside one, and the migrations are written to be
 * idempotent so a partial run is fixed by simply running it again.
 */
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const name = process.argv[2];
if (!name) {
  console.error("usage: node scripts/apply-migration.js <migration-folder-name>");
  process.exit(1);
}
const file = path.join(__dirname, "..", "prisma", "migrations", name, "migration.sql");
if (!fs.existsSync(file)) {
  console.error("not found:", file);
  process.exit(1);
}

const url =
  process.env.DATABASE_URL +
  (process.env.DATABASE_URL.includes("?") ? "&" : "?") +
  "connection_limit=1&pool_timeout=60";

/** Split on semicolons at end-of-line, but keep $$ ... $$ blocks whole. */
function splitStatements(sql) {
  const out = [];
  let buf = "";
  let inDollar = false;
  for (const line of sql.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.startsWith("--") && !buf.trim()) continue; // leading comment
    const dollars = (line.match(/\$\$/g) || []).length;
    if (dollars % 2 === 1) inDollar = !inDollar;
    buf += line + "\n";
    if (!inDollar && trimmed.endsWith(";")) {
      if (buf.trim()) out.push(buf.trim());
      buf = "";
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

(async () => {
  const statements = splitStatements(fs.readFileSync(file, "utf8"));
  console.log(`${name}: ${statements.length} statements\n`);

  let ok = 0;
  for (const [i, stmt] of statements.entries()) {
    const label = stmt.split("\n").filter((l) => !l.trim().startsWith("--"))[0]?.slice(0, 78) ?? "";
    for (let attempt = 1; attempt <= 4; attempt++) {
      const db = new PrismaClient({ datasources: { db: { url } } });
      try {
        await db.$executeRawUnsafe(stmt);
        console.log(`  ok   [${i + 1}/${statements.length}] ${label}`);
        ok++;
        break;
      } catch (e) {
        const msg = (e.message || "").split("\n").find((l) => l.trim()) ?? "";
        // Neon's pooler drops connections occasionally — that is worth retrying.
        const transient = /Can't reach database server|connection pool|ECONNRESET/i.test(e.message || "");
        if (transient && attempt < 4) {
          await new Promise((r) => setTimeout(r, 4000));
          continue;
        }
        console.log(`  FAIL [${i + 1}/${statements.length}] ${label}`);
        console.log(`       ${msg}`);
        process.exitCode = 1;
        break;
      } finally {
        await db.$disconnect().catch(() => {});
      }
    }
  }
  console.log(`\n${ok}/${statements.length} applied`);
})();
