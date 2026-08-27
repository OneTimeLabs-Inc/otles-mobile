import {
  useState,
  type FormEvent,
} from "react";

import {
  LockKeyhole,
  Mail,
} from "lucide-react";

import {
  signIn,
  signInWithGoogle,
} from "../services/auth";


/* ==========================================================
   LOGIN 001
   OTLES Mobile authentication
   ========================================================== */


type Props = {
  message?: string | null;
};


export default function Login({
  message = null,
}: Props) {

  const [
    email,
    setEmail,
  ] =
    useState("");


  const [
    password,
    setPassword,
  ] =
    useState("");


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  async function handleGoogleSignIn() {

    setError("");
    setLoading(true);


    try {

      const {
        error: authError,
      } =
        await signInWithGoogle();


      if (authError) {

        setError(
          authError.message,
        );

        setLoading(false);

      }

    }
    catch {

      setError(
        "Unable to start Google sign in.",
      );

      setLoading(false);

    }

  }


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {

    event.preventDefault();

    setError("");


    if (!email.trim()) {

      setError(
        "Enter your email address.",
      );

      return;

    }


    if (!password) {

      setError(
        "Enter your password.",
      );

      return;

    }


    setLoading(true);


    try {

      const authError =
        await signIn(
          email.trim(),
          password,
        );


      if (authError) {

        setError(
          authError.message,
        );

      }

    }
    catch {

      setError(
        "Unable to sign in. Please try again.",
      );

    }
    finally {

      setLoading(false);

    }

  }


  return (

    <main className="mobile-auth-page">

      <section className="mobile-auth-card">

        <div className="mobile-brand">

          <div className="mobile-brand-mark">
            O
          </div>

          <div>

            <h1>
              OTLES
            </h1>

            <p>
              Mobile Viewer
            </p>

          </div>

        </div>


        <div className="mobile-auth-heading">

          <h2>
            Sign in
          </h2>

          <p>
            {message ??
              "Access your organization's technical documentation."}
          </p>

        </div>


        {/* ==================================================
            GOOGLE OAUTH 002
            ================================================== */}

        <button
          type="button"
          className="mobile-google-button"
          disabled={loading}
          onClick={() => {
            void handleGoogleSignIn();
          }}
        >

          <span
            className="mobile-google-mark"
            aria-hidden="true"
          >
            G
          </span>

          <span>
            Continue with Google
          </span>

        </button>


        <div className="mobile-separator">

          <span>
            OR
          </span>

        </div>


        {/* ==================================================
            EMAIL LOGIN 003
            ================================================== */}

        <form
          onSubmit={
            handleSubmit
          }
        >

          <label
            className="mobile-field"
          >

            <span>
              Email
            </span>

            <div className="mobile-input-wrap">

              <Mail
                size={17}
              />

              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
                disabled={loading}
              />

            </div>

          </label>


          <label
            className="mobile-field"
          >

            <span>
              Password
            </span>

            <div className="mobile-input-wrap">

              <LockKeyhole
                size={17}
              />

              <input
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                disabled={loading}
              />

            </div>

          </label>


          {error && (

            <div
              className="mobile-error"
              role="alert"
            >
              {error}
            </div>

          )}


          <button
            type="submit"
            className="mobile-primary-button"
            disabled={loading}
          >

            {
              loading
                ? "Signing in..."
                : "Sign in with email"
            }

          </button>

        </form>


        <p className="mobile-auth-footer">
          Read-only access to OTLES documentation.
        </p>

      </section>

    </main>

  );

}
