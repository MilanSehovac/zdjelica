// Mora se importovati prvi: koristimo bazu u memoriji, bez diranja prave.
process.env.DATABASE_PATH = ":memory:";
delete process.env.SMTP_HOST;
