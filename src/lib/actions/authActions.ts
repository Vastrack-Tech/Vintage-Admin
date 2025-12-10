// src/lib/actions/authActions.ts
"use server"; // Ensure this runs on the server

import { createSupabaseAdmin } from "../supabase";

export const signInAction = async (data: FormData) => {
  const supabase = createSupabaseAdmin();
  const email = data.get("email") as string;
  const password = data.get("password") as string;

  try {
    const { data: authData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) throw signInError;

    // Return the session so we can grab the token on the client
    return { success: true, session: authData.session };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' };
  }
};

export const signUpAction = async (data: FormData) => {
  const supabase = createSupabaseAdmin();
  const email = data.get("email") as string;
  const password = data.get("password") as string;

  // We extract these but don't use them in Supabase Auth directly.
  // We return them to the client to send to our API.
  const firstName = data.get("firstName") as string;
  const lastName = data.get("lastName") as string;

  try {
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) throw signUpError;

    // Return success AND the user data needed for the profile creation
    return {
      success: true,
      user: authData.user,
      session: authData.session,
      profileData: { firstName, lastName, email },
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' };
  }
};
