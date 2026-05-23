import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { ENV } from "../config/env";

const OAuthCallback = () => {
  const [statusMessage, setStatusMessage] = useState("Completing sign in");
  const retriesRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const resolveSession = async () => {
      try {
        setStatusMessage("Checking your session");

        const response = await fetch(`${ENV.API_BASE_URL}/auth/session`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        });

        const payload = await response.json().catch(() => ({}));
        const sessionData = payload?.data || {};

        if (cancelled) return;

        if (response.ok && sessionData.authenticated && sessionData.user) {
          localStorage.setItem("user", JSON.stringify(sessionData.user));

          if (sessionData.accessToken) {
            localStorage.setItem("accessToken", sessionData.accessToken);
          } else {
            localStorage.removeItem("accessToken");
          }

          const targetPath =
            sessionData.user.role === "super_admin"
              ? "/admin/dashboard"
              : "/dashboard";

          window.location.replace(targetPath);
          return;
        }

        if (retriesRef.current < 4) {
          retriesRef.current += 1;
          window.setTimeout(() => {
            if (!cancelled) {
              resolveSession();
            }
          }, 500);
          return;
        }

        window.location.replace("/login");
      } catch {
        if (retriesRef.current < 4) {
          retriesRef.current += 1;
          window.setTimeout(() => {
            if (!cancelled) {
              resolveSession();
            }
          }, 500);
          return;
        }

        window.location.replace("/login");
      }
    };

    resolveSession();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600 mx-auto" />
        <h1 className="mt-4 text-xl font-semibold text-slate-900">{statusMessage}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Please wait while we finish your Google login.
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;