import {
  supabase,
} from "../lib/supabase";


/* ==========================================================
   WORKSPACE 001
   Workspace result types
   ========================================================== */

export type WorkspaceOrganization = {

  id: string;

  name: string;

  slug: string;

  is_public: boolean;

  otles_workspaces: Array<{

    id: string;

    name: string;

    slug: string;

  }>;

};


export type WorkspaceRole = {

  code: string;

  display_name: string;

};


export type CurrentWorkspace = {

  organization:
    WorkspaceOrganization | null;

  role:
    WorkspaceRole | null;

  user: {

    name: string;

    email: string;

  };

};


/* ==========================================================
   WORKSPACE 002
   Load current authenticated user's organization membership
   ========================================================== */

export async function getCurrentWorkspace():
  Promise<CurrentWorkspace | null> {


  /* ========================================================
     AUTHENTICATED USER 003
     ======================================================== */

  const {
    data: {
      user,
    },
    error: userError,
  } =
    await supabase.auth.getUser();


  if (
    userError ||
    !user
  ) {

    return null;

  }


  /* ========================================================
     PLATFORM USER 004
     Resolve auth user to OneTime Labs platform identity
     ======================================================== */

  const {
    data: platformUser,
    error: platformUserError,
  } =
    await supabase
      .from("platform_users")
      .select("id")
      .eq(
        "auth_user_id",
        user.id,
      )
      .maybeSingle();


  if (platformUserError) {

    throw new Error(
      `Unable to load platform user: ${platformUserError.message}`,
    );

  }


  if (!platformUser) {

    return null;

  }


  /* ========================================================
     ORGANIZATION MEMBERSHIP 005
     Membership determines OTLES application access
     ======================================================== */

  const {
    data: membership,
    error: membershipError,
  } =
    await supabase
      .from("organization_members")
      .select(`
        organizations (
          id,
          name,
          slug,
          is_public,
          otles_workspaces (
            id,
            name,
            slug
          )
        ),
        platform_roles (
          code,
          display_name
        )
      `)
      .eq(
        "platform_user_id",
        platformUser.id,
      )
      .eq(
        "status",
        "active",
      )
      .maybeSingle();


  if (membershipError) {

    throw new Error(
      `Unable to load organization membership: ${membershipError.message}`,
    );

  }


  if (!membership) {

    return null;

  }


  /* ========================================================
     NORMALIZE RELATIONSHIPS 006
     Supabase relation types may return object or array
     ======================================================== */

  const organization =
    Array.isArray(
      membership.organizations,
    )
      ? membership.organizations[0]
      : membership.organizations;


  const role =
    Array.isArray(
      membership.platform_roles,
    )
      ? membership.platform_roles[0]
      : membership.platform_roles;


  if (!organization) {

    return null;

  }


  /* ========================================================
     WORKSPACE RESULT 007
     ======================================================== */

  return {

    organization:
      organization as WorkspaceOrganization,

    role:
      role as WorkspaceRole | null,

    user: {

      name:
        user.user_metadata?.full_name ??
        user.email ??
        "Unknown User",

      email:
        user.email ?? "",

    },

  };

}