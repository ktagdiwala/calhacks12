import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

(async () => {
  const { data, error } = await supabase.from("users").select("*").limit(1);
  console.log({ data, error });
})();