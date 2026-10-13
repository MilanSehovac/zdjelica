/**
 * Pravi admin račun (ili postavlja novu lozinku postojećem računu).
 *   npm run admin:create -- ime@domena.ba "Ime Prezime" "lozinka-od-12-znakova"
 * Ako izostavite lozinku, traži se unos u terminalu (ne prikazuje se istorija komandi).
 */
import readline from "node:readline";
import { upsertAdmin } from "../lib/auth";
import { registerSchema } from "../lib/validation";

async function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (a) => { rl.close(); resolve(a); }));
}

async function main() {
  const [emailArg, nameArg, passArg] = process.argv.slice(2);
  const email = emailArg ?? (await ask("E-mail: "));
  const name = nameArg ?? (await ask("Ime: "));
  const password = passArg ?? (await ask("Lozinka (najmanje 8 znakova): "));

  const parsed = registerSchema.omit({ terms: true }).safeParse({ email, name, password });
  if (!parsed.success) {
    console.error("Neispravan unos:", parsed.error.issues.map((i) => i.message).join(" "));
    process.exit(1);
  }
  const { user, created } = upsertAdmin(parsed.data);
  console.log(created ? `Admin račun napravljen: ${user.email}` : `Postojeći račun je postao admin, lozinka je promijenjena: ${user.email}`);
  console.log("Prijavite se na /prijava, pa otvorite /admin.");
}

void main();
