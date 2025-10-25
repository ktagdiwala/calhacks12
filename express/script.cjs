// script.ts
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({"path": "../.env"});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

(async () => {
  const { data, error } = await supabase.from("users").select("*").limit(1);
  console.log("Data:", data);
  console.log("Error:", error);
})();
