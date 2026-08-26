import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();
      console.log("LOGIN RESPONSE:", data);

      if (!res.ok) {
        throw new Error(
          data.detail || "Incorrect email or password."
        );
      }

      // Save authentication
      sessionStorage.setItem(
        "access_token",
        data.access_token
      );

      sessionStorage.setItem(
        "token_type",
        data.token_type
      );

      // Save user information
      sessionStorage.setItem(
        "role",
        data.role
      );

      sessionStorage.setItem(
        "full_name",
        data.full_name
      );

      // Redirect based on role
      if (data.role === "admin") {
        navigate("/admin/overview");
      } else if (data.role === "founder") {
        navigate("/founder/overview");
      } else if (data.role === "guest") {
        navigate("/guest/showcase");
      } else {
        throw new Error(`Unknown user role: ${data.role}`);
      }

    } catch (err) {
      setError(
        err.message ||
        "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-[#F5F7F7] font-sans">

      {/* =====================================================
          LEFT — BRAND / HERO
      ===================================================== */}

      <section
        className="
          hidden
          lg:flex
          lg:w-[52%]
          xl:w-[53%]
          min-h-screen
          relative
          overflow-hidden
          flex-col
          justify-between
          px-12
          xl:px-16
          py-10
          text-white
        "
        style={{
          background:
            "radial-gradient(circle at 75% 22%, rgba(0,151,193,0.38), transparent 34%), radial-gradient(circle at 18% 88%, rgba(24,183,166,0.25), transparent 32%), linear-gradient(135deg, #061116 0%, #071A21 48%, #02080B 100%)",
        }}
      >

        {/* =================================================
            BACKGROUND CIRCUIT PATTERN
        ================================================= */}

        <div className="pointer-events-none absolute inset-0">

          {/* grid */}
          <div
            className="absolute inset-0 opacity-[0.045]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "58px 58px",
            }}
          />

          {/* blue glow */}
          <div
            className="
              absolute
              -right-32
              top-20
              h-[500px]
              w-[500px]
              rounded-full
              blur-[100px]
              opacity-30
            "
            style={{
              background:
                "radial-gradient(circle, #0097C1 0%, transparent 70%)",
            }}
          />

          {/* teal glow */}
          <div
            className="
              absolute
              -left-40
              -bottom-32
              h-[500px]
              w-[500px]
              rounded-full
              blur-[110px]
              opacity-25
            "
            style={{
              background:
                "radial-gradient(circle, #16C7B7 0%, transparent 70%)",
            }}
          />

          {/* decorative lines */}

          <div className="absolute right-[-30px] top-[130px] h-[1px] w-[250px] rotate-[25deg] bg-[#1B5263] opacity-60" />
          <div className="absolute right-[100px] top-[175px] h-3 w-3 rounded-full bg-[#1C7184] opacity-70" />

          <div className="absolute left-[-60px] bottom-[185px] h-[1px] w-[310px] rotate-[0deg] bg-[#1B5263] opacity-60" />
          <div className="absolute left-[170px] bottom-[130px] h-3 w-3 rounded-full bg-[#1C7184] opacity-70" />

          <div className="absolute right-[80px] bottom-[80px] h-[1px] w-[230px] rotate-[12deg] bg-[#1B5263] opacity-50" />
          <div className="absolute right-[280px] bottom-[105px] h-3 w-3 rounded-full bg-[#1C7184] opacity-60" />

        </div>


        {/* =================================================
            BRAND
        ================================================= */}

        <div className="relative z-10">

          <div className="flex items-center">

            <span
              className="
                text-[18px]
                xl:text-[20px]
                font-bold
                tracking-[0.20em]
                text-white
              "
            >
              CALI
              <span className="text-[#0097C1]">
                F
              </span>
              OLIO
            </span>

          </div>

        </div>


        {/* =================================================
            HERO CONTENT
        ================================================= */}

        <div
          className="
            relative
            z-10
            flex-1
            flex
            flex-col
            justify-center
            max-w-[650px]
            py-10
          "
        >

          <p
            className="
              font-mono
              text-[10px]
              xl:text-[11px]
              tracking-[0.28em]
              uppercase
              text-[#48B8D4]
              mb-5
            "
          >
            Software Portfolios, Curated
          </p>


          <h1
            className="
              text-[42px]
              xl:text-[52px]
              2xl:text-[58px]
              leading-[1.04]
              tracking-[-0.035em]
              font-semibold
              text-white
            "
          >
            Where great
            <br />
            engineering finally
            <br />
            gets a stage.
          </h1>


          <p
            className="
              mt-6
              max-w-[500px]
              text-[14px]
              xl:text-[15px]
              leading-7
              text-[#9DB1B8]
            "
          >
            CaliFolio reviews, organizes, and exhibits real
            product work — so the best portfolios get found
            by the people looking for them.
          </p>


          {/* =================================================
              FEATURE BLOCKS
          ================================================= */}

          <div className="mt-9 grid grid-cols-3 gap-3 max-w-[520px]">

            <div
              className="
                rounded-lg
                border
                border-[#23414A]
                bg-white/[0.045]
                backdrop-blur-sm
                px-4
                py-3
              "
            >
              <p className="text-[15px] font-semibold text-white">
                11+
              </p>

              <p className="mt-1 font-mono text-[9px] tracking-[0.14em] uppercase text-[#718A93]">
                Products
              </p>
            </div>


            <div
              className="
                rounded-lg
                border
                border-[#23414A]
                bg-white/[0.045]
                backdrop-blur-sm
                px-4
                py-3
              "
            >
              <p className="text-[15px] font-semibold text-white">
                4
              </p>

              <p className="mt-1 font-mono text-[9px] tracking-[0.14em] uppercase text-[#718A93]">
                Origins
              </p>
            </div>


            <div
              className="
                rounded-lg
                border
                border-[#23414A]
                bg-white/[0.045]
                backdrop-blur-sm
                px-4
                py-3
              "
            >
<p className="text-[15px] font-semibold text-white">
  Secure
</p>

<p className="mt-1 font-mono text-[9px] tracking-[0.14em] uppercase text-[#718A93]">
  Platform
</p>
            </div>

          </div>

        </div>


        {/* =================================================
            FOOTER
        ================================================= */}

        <div
          className="
            relative
            z-10
            flex
            items-center
            justify-between
            gap-5
            font-mono
            text-[9px]
            xl:text-[10px]
            tracking-[0.16em]
            uppercase
            text-[#58717A]
          "
        >

          <span>
            © 2026 CALIFOLIO
          </span>

          <span className="hidden xl:inline">
            Infrastructure meets Innovation
          </span>

          <span>
            EST. 2025
          </span>

        </div>

      </section>


      {/* =====================================================
          RIGHT — LOGIN
      ===================================================== */}

      <section
        className="
          flex-1
          min-h-screen
          flex
          items-center
          justify-center
          bg-[#F5F7F7]
          px-6
          sm:px-10
          xl:px-16
          py-10
          overflow-y-auto
        "
      >

        <div className="w-full max-w-[390px]">


          {/* =================================================
              MOBILE BRAND
          ================================================= */}

          <div className="lg:hidden mb-10">

            <span
              className="
                text-[20px]
                font-bold
                tracking-[0.18em]
                text-[#111B26]
              "
            >
              CALI
              <span className="text-[#0097C1]">
                F
              </span>
              OLIO
            </span>

          </div>


          {/* =================================================
              LOGIN INTRO
          ================================================= */}

          <div>

            <p
              className="
                font-mono
                text-[10px]
                tracking-[0.26em]
                uppercase
                text-[#7E929A]
              "
            >
              Secure Access
            </p>


            <h2
              className="
                mt-3
                text-[31px]
                sm:text-[34px]
                leading-tight
                tracking-[-0.025em]
                font-semibold
                text-[#101A21]
              "
            >
              Welcome back
            </h2>


            <p
              className="
                mt-3
                max-w-[360px]
                text-[14px]
                leading-6
                text-[#718087]
              "
            >
              Sign in to review, curate, and publish
              software portfolios.
            </p>

          </div>


          {/* =================================================
              LOGIN FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="mt-9"
          >

            {/* EMAIL */}

            <div>

              <label
                htmlFor="email"
                className="
                  block
                  mb-2
                  text-[11px]
                  font-medium
                  tracking-[0.12em]
                  uppercase
                  text-[#55656D]
                "
              >
                Work email
              </label>


              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@studio.com"
                className="
                  w-full
                  h-[46px]
                  rounded-lg
                  border
                  border-[#D5DEE1]
                  bg-white
                  px-4
                  text-[14px]
                  text-[#17232A]
                  placeholder:text-[#AAB5BA]
                  outline-none
                  transition
                  focus:border-[#0097C1]
                  focus:ring-4
                  focus:ring-[#0097C1]/10
                "
              />

            </div>


            {/* PASSWORD */}

            <div className="mt-5">

              <div className="flex items-center justify-between mb-2">

                <label
                  htmlFor="password"
                  className="
                    block
                    text-[11px]
                    font-medium
                    tracking-[0.12em]
                    uppercase
                    text-[#55656D]
                  "
                >
                  Password
                </label>


                <a
                  href="/forgot-password"
                  className="
                    text-[11px]
                    text-[#77878E]
                    transition
                    hover:text-[#101A21]
                  "
                >
                  Forgot password?
                </a>
             
              </div>


              <div className="relative">

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="••••••••"
                  className="
                    w-full
                    h-[46px]
                    rounded-lg
                    border
                    border-[#D5DEE1]
                    bg-white
                    px-4
                    pr-12
                    text-[14px]
                    text-[#17232A]
                    placeholder:text-[#AAB5BA]
                    outline-none
                    transition
                    focus:border-[#0097C1]
                    focus:ring-4
                    focus:ring-[#0097C1]/10
                  "
                />


                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (v) => !v
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-md
                    text-[#8A989E]
                    transition
                    hover:bg-[#F1F4F5]
                    hover:text-[#17232A]
                  "
                >

                  {showPassword ? (
                    <EyeOff
                      size={17}
                      strokeWidth={1.7}
                    />
                  ) : (
                    <Eye
                      size={17}
                      strokeWidth={1.7}
                    />
                  )}

                </button>

              </div>

            </div>


            {/* ERROR */}

            {error && (
              <div
                className="
                  mt-5
                  rounded-lg
                  border
                  border-red-200
                  bg-red-50
                  px-3.5
                  py-3
                "
              >
                <p
                  className="
                    text-[13px]
                    leading-5
                    text-red-700
                  "
                  role="alert"
                >
                  {error}
                </p>
              </div>
            )}


            {/* =================================================
                SIGN IN
            ================================================= */}

            <button
              type="submit"
              disabled={loading}
              className="
                mt-6
                w-full
                h-[46px]
                rounded-lg
                bg-gradient-to-r
                from-[#078FC0]
                to-[#25CDBB]
                text-[14px]
                font-semibold
                text-[#071419]
                shadow-[0_8px_22px_rgba(0,151,193,0.18)]
                transition-all
                hover:brightness-105
                hover:shadow-[0_10px_28px_rgba(0,151,193,0.24)]
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading
                ? "Signing in…"
                : "Sign in"}
            </button>

          </form>


        </div>

      </section>

    </div>
  );
}