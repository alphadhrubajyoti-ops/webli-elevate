import { createServerFn } from "@tanstack/react-start";

const ADMIN_EMAIL = "alpha.dhrubajyoti@gmail.com";
const ADMIN_PASSWORD = "WB9609022523";

// Idempotently ensure the fixed admin account exists with the expected
// password and admin role. Called only when the admin login form is submitted
// with the exact expected credentials.
export const ensureFixedAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Look up by email.
  const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) throw listErr;

  let userId: string | undefined = list.users.find(
    (u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
  )?.id;

  if (!userId) {
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Webli Admin" },
    });
    if (createErr) throw createErr;
    userId = created.user?.id;
  } else {
    // Ensure the password matches and the account is confirmed.
    const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (updErr) throw updErr;
  }

  if (!userId) throw new Error("Failed to resolve admin user");

  // Ensure admin role.
  const { error: roleErr } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
  if (roleErr) throw roleErr;

  return { ok: true as const };
});
