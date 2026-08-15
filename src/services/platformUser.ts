import {
  supabase,
} from "../lib/supabase";


/* ==========================================================
   PLATFORM USER 001
   Get the authenticated OTLES platform user
   ========================================================== */


export async function getCurrentPlatformUser() {

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();


  if (!user) {

    return null;

  }


  const {
    data,
    error,
  } =
    await supabase
      .from("platform_users")
      .select("*")
      .eq(
        "auth_user_id",
        user.id,
      )
      .maybeSingle();


  if (error) {

    throw new Error(
      `Unable to load platform user: ${error.message}`,
    );

  }


  return data;

}


/* ==========================================================
   PLATFORM USER 002
   Provision authenticated user if required
   ========================================================== */


export async function provisionPlatformUser() {

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();


  if (!user) {

    return null;

  }


  const existing =
    await getCurrentPlatformUser();


  if (existing) {

    return existing;

  }


  const {
    data,
    error,
  } =
    await supabase
      .from("platform_users")
      .insert({
        auth_user_id: user.id,
        email: user.email,
        display_name:
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          user.email,
        avatar_url:
          user.user_metadata?.avatar_url ??
          user.user_metadata?.picture ??
          null,
        active: true,
        is_employee: false,
        is_platform_admin: false,
      })
      .select()
      .single();


  if (error) {

    throw new Error(
      `Unable to provision platform user: ${error.message}`,
    );

  }


  return data;

}
