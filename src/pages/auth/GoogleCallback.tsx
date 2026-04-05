import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

export default function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken  = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken && refreshToken) {
      // Save token
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);

      // Fetch user
      api.get("/auth/me")
        .then((res) => {
          const user = res.data.data;
          localStorage.setItem("user", JSON.stringify(user));

          if (user.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/dashboard");
          }
        })
        .catch(() => {
          navigate("/dashboard");
        });
    } else {
      navigate("/login?error=google_failed");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground animate-pulse">Memproses login Google...</p>
    </div>
  );
}