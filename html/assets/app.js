(() => {
  const currentPage = location.pathname.replace(/\\/g, '/').split('/').slice(-2).join('/');
  const onPage = (page, init) => { if (currentPage === page) init(); };

  window.appGo = (href) => { window.location.href = href; };

  onPage("auth/forgetPassword.html", () => {
    document.addEventListener("DOMContentLoaded", () => {
            const emailInput = document.getElementById("emailInput");
            const sendCodeBtn = document.getElementById("sendCodeBtn");
    
            // Simple regex for basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
            // Progressive enablement logic
            emailInput.addEventListener("input", (e) => {
              const value = e.target.value.trim();
    
              if (emailRegex.test(value)) {
                // Valid email: Enable button
                sendCodeBtn.removeAttribute("disabled");
              } else {
                // Invalid email: Disable button
                sendCodeBtn.setAttribute("disabled", "true");
              }
            });
    
            // Button click simulation
            sendCodeBtn.addEventListener("click", () => {
              // Visual feedback for loading state
              const originalText = sendCodeBtn.textContent;
              sendCodeBtn.innerHTML = `
                <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              `;
              sendCodeBtn.setAttribute("disabled", "true");
              sendCodeBtn.style.opacity = "0.9";
    
              // Simulate API delay, then "navigate" (in a real app, this routes to the OTP page)
              setTimeout(() => {
                alert("Code sent successfully! Routing to OTP Verification page.");
                sendCodeBtn.textContent = originalText;
                sendCodeBtn.removeAttribute("disabled");
                sendCodeBtn.style.opacity = "1";
              }, 1500);
            });
          });
  });

  onPage("auth/login.html", () => {
    // Password Toggle Logic
          window.togglePassword = function togglePassword() {
            const input = document.getElementById("password");
            const icon = document.getElementById("eye-icon");
    
            if (input.type === "password") {
              input.type = "text";
              icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />`;
            } else {
              input.type = "password";
              icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />`;
            }
          }
    
          // Form Validation & Button State
          window.validateForm = function validateForm() {
            const email = document.getElementById("email").value.trim();
            const pass = document.getElementById("password").value.trim();
            const btn = document.getElementById("final-cta");
    
            // Allow submission if email format is loosely valid and password is provided
            const isValid =
              email.includes("@") && email.includes(".") && pass.length > 0;
    
            if (isValid) {
              btn.removeAttribute("disabled");
              // Uses custom theme colors defined in tailwind.config.js
              btn.className =
                "ux-motion flex h-14 w-full items-center justify-center rounded-2xl bg-brand-primary font-bold text-base text-white shadow-md shadow-brand-primary/20 hover:bg-brand-hover focus:outline-[3px] focus:outline-offset-4 focus:outline-brand-accent active:scale-[0.98] cursor-pointer";
            } else {
              btn.setAttribute("disabled", "true");
              btn.className =
                "ux-motion flex h-14 w-full items-center justify-center rounded-2xl bg-[#E5E7EB] font-semibold text-base text-[#9CA3AF] cursor-not-allowed focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-brand-accent";
            }
          }
    
          // Submission Simulation
          window.submitForm = function submitForm() {
            const btn = document.getElementById("final-cta");
    
            btn.innerHTML = `
                    <svg class="animate-spin -ms-1 me-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                `;
    
            setTimeout(() => {
              btn.innerHTML = "Success!";
              btn.classList.add("bg-[#22C55E]", "shadow-[#22C55E]/20");
              btn.classList.remove(
                "bg-brand-primary",
                "hover:bg-brand-hover",
                "shadow-brand-primary/20",
              );
            }, 1200);
          }
    
          // Multi-Language & RTL Engine
          const translations = {
            en: {
              title: "Welcome back",
              sub: "Log in to continue your learning journey.",
              google: "Continue with Google",
              or: "Or log in with email",
              email: "Email address",
              emailPh: "you@example.com",
              pass: "Password",
              passPh: "••••••••",
              forgot: "Forgot password?",
              cta: "Log in",
              account: "Don't have an account?",
              signup: "Sign up",
            },
            ar: {
              title: "مرحباً بعودتك",
              sub: "سجل الدخول لمتابعة رحلة التعلم الخاصة بك.",
              google: "المتابعة باستخدام Google",
              or: "أو سجل الدخول عبر البريد",
              email: "البريد الإلكتروني",
              emailPh: "you@example.com",
              pass: "كلمة المرور",
              passPh: "••••••••",
              forgot: "هل نسيت كلمة المرور؟",
              cta: "تسجيل الدخول",
              account: "ليس لديك حساب؟",
              signup: "إنشاء حساب",
            },
            bn: {
              title: "স্বাগতম",
              sub: "আপনার শেখার যাত্রা চালিয়ে যেতে লগ ইন করুন।",
              google: "Google দিয়ে চালিয়ে যান",
              or: "অথবা ইমেল দিয়ে লগ ইন করুন",
              email: "ইমেইল ঠিকানা",
              emailPh: "you@example.com",
              pass: "পাসওয়ার্ড",
              passPh: "••••••••",
              forgot: "পাসওয়ার্ড ভুলে গেছেন?",
              cta: "লগ ইন করুন",
              account: "অ্যাকাউন্ট নেই?",
              signup: "নিবন্ধন করুন",
            },
          };
    
          window.setLanguage = function setLanguage(lang) {
            const body = document.body;
            const html = document.documentElement;
    
            // Set font class & direction (RTL flip logic)
            body.className = `h-full text-[#111827] antialiased overflow-hidden selection:bg-[#FCE7F3] selection:text-[#DB2777] lang-${lang}`;
            html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    
            // Apply translations
            const t = translations[lang];
            document.getElementById("title-main").innerText = t.title;
            document.getElementById("title-sub").innerText = t.sub;
            document.getElementById("btn-google").innerText = t.google;
            document.getElementById("lbl-or").innerText = t.or;
    
            document.getElementById("lbl-email").innerText = t.email;
            document.getElementById("email").placeholder = t.emailPh;
    
            document.getElementById("lbl-password").innerText = t.pass;
            document.getElementById("password").placeholder = t.passPh;
            document.getElementById("link-forgot").innerText = t.forgot;
    
            document.getElementById("final-cta").innerText = t.cta;
            document.getElementById("lbl-account").innerText = t.account;
            document.getElementById("link-signup").innerText = t.signup;
    
            // Re-validate to fix button text state if fields are filled
            validateForm();
            if (document.getElementById("final-cta").hasAttribute("disabled")) {
              document.getElementById("final-cta").innerText = t.cta;
            }
          }
  });

  onPage("auth/register.html", () => {
    // Password Toggle Logic
          window.togglePassword = function togglePassword() {
            const input = document.getElementById("password");
            const icon = document.getElementById("eye-icon");
    
            if (input.type === "password") {
              input.type = "text";
              icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />`;
            } else {
              input.type = "password";
              icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />`;
            }
          }
    
          // Form Validation & Button State
          window.validateForm = function validateForm() {
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const pass = document.getElementById("password").value.trim();
            const btn = document.getElementById("final-cta");
    
            // Simple validation for demo
            const isValid =
              name.length > 1 && email.includes("@") && pass.length >= 6;
    
            if (isValid) {
              btn.removeAttribute("disabled");
              btn.className =
                "ux-motion flex h-14 w-full items-center justify-center rounded-2xl bg-[#EC4899] font-bold text-base text-white shadow-md shadow-[#EC4899]/20 hover:bg-[#DB2777] focus:outline-[3px] focus:outline-offset-4 focus:outline-[#A855F7] active:scale-[0.98] cursor-pointer";
            } else {
              btn.setAttribute("disabled", "true");
              btn.className =
                "ux-motion flex h-14 w-full items-center justify-center rounded-2xl bg-[#E5E7EB] font-semibold text-base text-[#9CA3AF] cursor-not-allowed focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-[#A855F7]";
            }
          }
    
          // Submission Simulation
          window.submitForm = function submitForm() {
            const btn = document.getElementById("final-cta");
            const originalText = btn.innerText;
    
            btn.innerHTML = `
                    <svg class="animate-spin -ms-1 me-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                `;
    
            setTimeout(() => {
              btn.innerHTML = "Account Created!";
              btn.classList.add("bg-[#22C55E]", "shadow-[#22C55E]/20");
              btn.classList.remove(
                "bg-[#EC4899]",
                "hover:bg-[#DB2777]",
                "shadow-[#EC4899]/20",
              );
            }, 1500);
          }
    
          // Multi-Language & RTL Engine
          const translations = {
            en: {
              title: "Create an account",
              sub: "Start your learning journey today.",
              google: "Continue with Google",
              or: "Or register with email",
              name: "Full Name",
              namePh: "John Doe",
              email: "Email address",
              emailPh: "you@example.com",
              pass: "Password",
              passPh: "••••••••",
              cta: "Create Account",
              account: "Already have an account?",
              login: "Log in",
            },
            ar: {
              title: "إنشاء حساب",
              sub: "ابدأ رحلة التعلم الخاصة بك اليوم.",
              google: "المتابعة باستخدام Google",
              or: "أو سجل عبر البريد الإلكتروني",
              name: "الاسم الكامل",
              namePh: "أحمد محمد",
              email: "البريد الإلكتروني",
              emailPh: "you@example.com",
              pass: "كلمة المرور",
              passPh: "••••••••",
              cta: "إنشاء الحساب",
              account: "لديك حساب بالفعل؟",
              login: "تسجيل الدخول",
            },
            bn: {
              title: "অ্যাকাউন্ট তৈরি করুন",
              sub: "আজই আপনার শেখার যাত্রা শুরু করুন।",
              google: "Google দিয়ে চালিয়ে যান",
              or: "অথবা ইমেল দিয়ে নিবন্ধন করুন",
              name: "পুরো নাম",
              namePh: "রহিম শেখ",
              email: "ইমেইল ঠিকানা",
              emailPh: "you@example.com",
              pass: "পাসওয়ার্ড",
              passPh: "••••••••",
              cta: "অ্যাকাউন্ট তৈরি করুন",
              account: "ইতিমধ্যে একটি অ্যাকাউন্ট আছে?",
              login: "লগ ইন করুন",
            },
          };
    
          window.setLanguage = function setLanguage(lang) {
            const body = document.body;
            const html = document.documentElement;
    
            // Set font class & direction
            body.className = `h-full text-[#111827] antialiased overflow-hidden selection:bg-[#FCE7F3] selection:text-[#DB2777] lang-${lang}`;
            html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    
            // Apply translations
            const t = translations[lang];
            document.getElementById("title-main").innerText = t.title;
            document.getElementById("title-sub").innerText = t.sub;
            document.getElementById("btn-google").innerText = t.google;
            document.getElementById("lbl-or").innerText = t.or;
            document.getElementById("lbl-name").innerText = t.name;
            document.getElementById("name").placeholder = t.namePh;
            document.getElementById("lbl-email").innerText = t.email;
            document.getElementById("email").placeholder = t.emailPh;
            document.getElementById("lbl-password").innerText = t.pass;
            document.getElementById("password").placeholder = t.passPh;
            document.getElementById("final-cta").innerText = t.cta;
            document.getElementById("lbl-account").innerText = t.account;
            document.getElementById("link-login").innerText = t.login;
    
            // Re-validate to fix button text state if fields are filled
            validateForm();
            if (document.getElementById("final-cta").hasAttribute("disabled")) {
              document.getElementById("final-cta").innerText = t.cta;
            }
          }
  });

  onPage("auth/reset.html", () => {
    const pass1 = document.getElementById("pass1");
          const pass2 = document.getElementById("pass2");
          const saveBtn = document.getElementById("saveBtn");
    
          const checkForm = () => {
            const isLong = pass1.value.length >= 8;
            const hasNum = /\d/.test(pass1.value);
            const match = pass1.value === pass2.value && pass1.value !== "";
    
            document.getElementById("req-len").style.color = isLong
              ? "#22c55e"
              : "#6b7280";
            document.getElementById("req-num").style.color = hasNum
              ? "#22c55e"
              : "#6b7280";
    
            if (isLong && hasNum && match) {
              saveBtn.disabled = false;
              saveBtn.className =
                "w-full h-14 bg-primary text-white rounded-2xl font-bold text-[17px] shadow-lg shadow-primary/20 transition-all active:scale-[0.98]";
            } else {
              saveBtn.disabled = true;
              saveBtn.className =
                "w-full h-14 bg-gray-200 text-gray-400 rounded-2xl font-bold text-[17px] transition-all";
            }
          };
    
          [pass1, pass2].forEach((el) => el.addEventListener("input", checkForm));
  });

  onPage("onboarding/page1.html", () => {
    window.selectLanguage = function selectLanguage(langCode) {
            const languages = ["en", "bn", "ar"];
            const containerShell = document.querySelector(".max-w-md");
            const headline = document.querySelector("h1");
            const subhead = document.querySelector("p");
            const submitBtn = document.getElementById("submit-btn");
    
            languages.forEach((lang) => {
              const card = document.getElementById(`lang-${lang}`);
              const circleBorder = card.querySelector(".rounded-full");
              const filledDot = card.querySelector(".rounded-full > div");
    
              if (lang === langCode) {
                // Active States
                card.classList.remove("border-[#E5E7EB]");
                card.classList.add(
                  "border-[#EC4899]",
                  "ring-4",
                  "ring-[#FCE7F3]/50",
                );
                circleBorder.classList.remove("border-[#E5E7EB]");
                circleBorder.classList.add("border-[#EC4899]");
                filledDot.classList.remove("bg-transparent");
                filledDot.classList.add("bg-[#EC4899]");
                card.setAttribute("aria-checked", "true");
              } else {
                // Inactive States
                card.classList.remove(
                  "border-[#EC4899]",
                  "ring-4",
                  "ring-[#FCE7F3]/50",
                );
                card.classList.add("border-[#E5E7EB]");
                circleBorder.classList.remove("border-[#EC4899]");
                circleBorder.classList.add("border-[#E5E7EB]");
                filledDot.classList.remove("bg-[#EC4899]");
                filledDot.classList.add("bg-transparent");
                card.setAttribute("aria-checked", "false");
              }
            });
    
            // Handle Global App Real-Time Mutation Engine (Dynamic Language Switch Examples)
            if (langCode === "ar") {
              containerShell.setAttribute("dir", "rtl");
              headline.className =
                "text-2xl font-bold tracking-tight text-text-main font-ar text-start";
              headline.innerText = "اختر لغتك المفضلة";
              subhead.className =
                "text-base text-[#6B7280] font-ar text-start pt-1";
              subhead.innerText =
                "اختر لغتك المفضلة لبدء رحلة التعلم الخاصة بك معنا.";
              submitBtn.innerText = "متابعة";
              submitBtn.className =
                "card-transition flex h-14 w-full items-center justify-center rounded-2xl bg-[#EC4899] font-bold text-base text-white font-ar shadow-md shadow-[#EC4899]/20 hover:bg-[#DB2777]";
            } else if (langCode === "bn") {
              containerShell.setAttribute("dir", "ltr");
              headline.className =
                "text-2xl font-bold tracking-tight text-text-main font-bn text-start";
              headline.innerText = "আপনার ভাষা চয়ন করুন";
              subhead.className =
                "text-base text-[#6B7280] font-bn text-start pt-1";
              subhead.innerText =
                "আপনার শেখার যাত্রা শুরু করতে আপনার পছন্দের ভাষা নির্বাচন করুন।";
              submitBtn.innerText = "এগিয়ে যান";
              submitBtn.className =
                "card-transition flex h-14 w-full items-center justify-center rounded-2xl bg-[#EC4899] font-bold text-base text-white font-bn shadow-md shadow-[#EC4899]/20 hover:bg-[#DB2777]";
            } else {
              containerShell.setAttribute("dir", "ltr");
              headline.className =
                "text-2xl font-bold tracking-tight text-text-main font-en text-start";
              headline.innerText = "Choose your language";
              subhead.className = "text-base text-[#6B7280] font-en text-start";
              subhead.innerText =
                "Select your preferred language to begin your learning journey.";
              submitBtn.innerText = "Continue";
              submitBtn.className =
                "card-transition flex h-14 w-full items-center justify-center rounded-2xl bg-[#EC4899] font-semibold text-base text-white font-en shadow-md shadow-[#EC4899]/20 hover:bg-[#DB2777]";
            }
          }
  });

  onPage("onboarding/page2.html", () => {
    window.handleMatrixSelection = function handleMatrixSelection(targetId) {
                const structuralOptions = ['opt-1', 'opt-2', 'opt-3', 'opt-4'];
                const submitCta = document.getElementById('cta-btn');
    
                structuralOptions.forEach(id => {
                    const node = document.getElementById(id);
                    const indicatorCircle = node.querySelector('.rounded-full');
                    const centerCore = indicatorCircle.querySelector('div');
    
                    if (id === targetId) {
                        // Activate styles matching guidelines
                        node.classList.remove('border-[#E5E7EB]');
                        node.classList.add('border-[#EC4899]', 'ring-4', 'ring-[#FCE7F3]/50', 'bg-white');
                        indicatorCircle.classList.remove('border-[#E5E7EB]');
                        indicatorCircle.classList.add('border-[#EC4899]');
                        centerCore.classList.remove('bg-transparent');
                        centerCore.classList.add('bg-[#EC4899]');
                        node.setAttribute('aria-checked', 'true');
                    } else {
                        // Normalize standard structural paths
                        node.classList.remove('border-[#EC4899]', 'ring-4', 'ring-[#FCE7F3]/50');
                        node.classList.add('border-[#E5E7EB]');
                        indicatorCircle.classList.remove('border-[#EC4899]');
                        indicatorCircle.classList.add('border-[#E5E7EB]');
                        centerCore.classList.remove('bg-[#EC4899]');
                        centerCore.classList.add('bg-transparent');
                        node.setAttribute('aria-checked', 'false');
                    }
                });
    
                // Unlock and animate primary choice button system
                submitCta.removeAttribute('disabled');
                submitCta.className = "ui-transition flex h-14 w-full items-center justify-center rounded-2xl bg-[#EC4899] font-semibold text-base text-white shadow-md shadow-[#EC4899]/20 hover:bg-[#DB2777] focus:outline-[3px] focus:outline-offset-4 focus:outline-[#A855F7] cursor-pointer active:scale-[0.98]";
            }
  });

  onPage("onboarding/page3.html", () => {
    let currentStep = 4;
          let selectedTime = null;
          let selectedAge = null;
    
          const btnCTA = document.getElementById("main-cta");
          const progressBar = document.getElementById("progress-fill");
          const stepIndicator = document.getElementById("step-indicator");
          const viewStep4 = document.getElementById("step-4");
          const viewStep5 = document.getElementById("step-5");
    
          // Step 4 Selection
          window.selectTime = function selectTime(id) {
            selectedTime = id;
            const options = [
              "time-morning",
              "time-afternoon",
              "time-evening",
              "time-night",
            ];
    
            options.forEach((opt) => {
              const el = document.getElementById(opt);
              if (opt === id) {
                el.className =
                  "ux-motion cursor-pointer rounded-2xl border-2 border-[#EC4899] bg-[#FFFFFF] p-4 shadow-sm ring-4 ring-[#FCE7F3]/50 flex flex-col items-center text-center";
                el.setAttribute("aria-checked", "true");
              } else {
                el.className =
                  "ux-motion cursor-pointer rounded-2xl border-2 border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-sm hover:border-[#EC4899]/60 flex flex-col items-center text-center";
                el.setAttribute("aria-checked", "false");
              }
            });
            unlockCTA("Continue");
          }
    
          // Step 5 Selection
          window.selectAge = function selectAge(id) {
            selectedAge = id;
            const options = ["age-1", "age-2", "age-3", "age-4", "age-5", "age-6"];
    
            options.forEach((opt) => {
              const el = document.getElementById(opt);
              const circle = el.querySelector("div.rounded-full");
              const dot = circle.querySelector("div");
    
              if (opt === id) {
                el.className =
                  "ux-motion flex h-16 cursor-pointer items-center justify-between rounded-2xl border-2 border-[#EC4899] bg-[#FFFFFF] px-5 ring-4 ring-[#FCE7F3]/50";
                circle.className =
                  "h-6 w-6 rounded-full border-2 border-[#EC4899] flex items-center justify-center shrink-0";
                dot.className = "h-3 w-3 rounded-full bg-[#EC4899] ux-motion";
                el.setAttribute("aria-checked", "true");
              } else {
                el.className =
                  "ux-motion flex h-16 cursor-pointer items-center justify-between rounded-2xl border-2 border-[#E5E7EB] bg-[#FFFFFF] px-5 hover:border-[#EC4899]/60";
                circle.className =
                  "h-6 w-6 rounded-full border-2 border-[#E5E7EB] flex items-center justify-center shrink-0";
                dot.className = "h-3 w-3 rounded-full bg-transparent ux-motion";
                el.setAttribute("aria-checked", "false");
              }
            });
            unlockCTA("Complete Setup");
          }
    
          // CTA Control
          window.unlockCTA = function unlockCTA(text) {
            btnCTA.removeAttribute("disabled");
            btnCTA.innerText = text;
            btnCTA.className =
              "ux-motion flex h-14 w-full items-center justify-center rounded-2xl bg-[#EC4899] font-semibold text-base text-white shadow-md shadow-[#EC4899]/20 hover:bg-[#DB2777] focus:outline-[3px] focus:outline-offset-4 focus:outline-[#A855F7] active:scale-[0.98] cursor-pointer";
          }
    
          window.lockCTA = function lockCTA() {
            btnCTA.setAttribute("disabled", "true");
            btnCTA.innerText = "Continue";
            btnCTA.className =
              "ux-motion flex h-14 w-full items-center justify-center rounded-2xl bg-[#E5E7EB] font-semibold text-base text-[#6B7280] cursor-not-allowed";
          }
    
          // Navigation Controller
          window.handleCTA = function handleCTA() {
            if (currentStep === 4 && selectedTime) {
              transitionToStep(5);
            } else if (currentStep === 5 && selectedAge) {
              // Simulate Completion Loading State
              btnCTA.innerHTML = `<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;
              setTimeout(() => {
                alert("Setup Complete! Welcome to the App.");
              }, 800);
            }
          }
    
          window.transitionToStep = function transitionToStep(target) {
            if (target === 5) {
              currentStep = 5;
              progressBar.style.width = "100%";
              stepIndicator.innerText = "5/5";
    
              // Animate Out Step 4
              viewStep4.classList.remove("fade-enter-active");
              viewStep4.classList.add("fade-enter");
    
              setTimeout(() => {
                viewStep4.classList.add("hidden");
                viewStep4.classList.remove("flex");
    
                // Animate In Step 5
                viewStep5.classList.remove("hidden");
                viewStep5.classList.add("flex");
    
                // Trigger reflow for animation
                void viewStep5.offsetWidth;
                viewStep5.classList.add("fade-enter-active");
                viewStep5.classList.remove("fade-enter");
    
                document.getElementById("step-5-h1").focus();
    
                if (selectedAge) unlockCTA("Complete Setup");
                else lockCTA();
              }, 200); // Wait for fade out
            }
          }
    
          window.goBack = function goBack() {
            if (currentStep === 5) {
              currentStep = 4;
              progressBar.style.width = "80%";
              stepIndicator.innerText = "4/5";
    
              viewStep5.classList.remove("fade-enter-active");
              viewStep5.classList.add("fade-enter");
    
              setTimeout(() => {
                viewStep5.classList.add("hidden");
                viewStep5.classList.remove("flex");
    
                viewStep4.classList.remove("hidden");
                viewStep4.classList.add("flex");
    
                void viewStep4.offsetWidth;
                viewStep4.classList.add("fade-enter-active");
                viewStep4.classList.remove("fade-enter");
    
                if (selectedTime) unlockCTA("Continue");
                else lockCTA();
              }, 200);
            }
          }
  });

  onPage("onboarding/page4.html", () => {
    let selectedSourceId = null;
          const ctaBtn = document.getElementById("final-cta");
    
          window.selectSource = function selectSource(id) {
            selectedSourceId = id;
            const allSources = [
              "src-youtube",
              "src-fb",
              "src-ig",
              "src-tiktok",
              "src-ads",
              "src-friends",
            ];
    
            allSources.forEach((src) => {
              const el = document.getElementById(src);
              if (src === id) {
                // Apply Premium Active State (Pink border + Soft Pink Bg)
                el.className =
                  "ux-motion flex h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-[#EC4899] bg-[#FCE7F3]/30 p-4 ring-4 ring-[#FCE7F3]/50 active:scale-95";
                el.setAttribute("aria-checked", "true");
              } else {
                // Restore Base Outline State
                el.className =
                  "ux-motion flex h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-sm hover:border-[#EC4899]/50 active:scale-95";
                el.setAttribute("aria-checked", "false");
              }
            });
    
            // Unlock Final Submission CTA
            ctaBtn.removeAttribute("disabled");
            ctaBtn.className =
              "ux-motion flex h-14 w-full items-center justify-center rounded-2xl bg-[#EC4899] font-bold text-base text-white shadow-md shadow-[#EC4899]/20 hover:bg-[#DB2777] focus:outline-[3px] focus:outline-offset-4 focus:outline-[#A855F7] active:scale-[0.98] cursor-pointer";
          }
    
          // Simulate Network Submission & Routing
          window.submitSetup = function submitSetup() {
            if (!selectedSourceId) return;
    
            // Shift to Loading State
            ctaBtn.innerHTML = `
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                `;
    
            // Artificial delay to simulate network request before redirect
            setTimeout(() => {
              ctaBtn.innerHTML = "Success! Redirecting...";
              ctaBtn.classList.add("bg-[#22C55E]", "shadow-[#22C55E]/20");
              ctaBtn.classList.remove(
                "bg-[#EC4899]",
                "hover:bg-[#DB2777]",
                "shadow-[#EC4899]/20",
              );
            }, 1200);
          }
    
          // --- Multi-Language Framework Logic (Verification Sandbox) ---
          window.setLanguage = function setLanguage(langCode) {
            const shell = document.querySelector(".max-w-md");
            const h1 = document.querySelector("h1");
            const p = document.querySelector("p");
            const spans = document.querySelectorAll(".grid span");
    
            if (langCode === "ar") {
              shell.setAttribute("dir", "rtl");
              h1.className =
                "text-2xl font-bold tracking-tight text-text-main font-ar leading-normal";
              h1.innerText = "من أين سمعت عنا؟";
              p.className = "text-base text-[#6B7280] font-ar pt-1";
              p.innerText =
                "مجرد فضول! هذا يساعدنا في معرفة أين نجد المزيد من المتعلمين مثلك.";
              if (!ctaBtn.hasAttribute("disabled"))
                ctaBtn.innerText = "ابدأ التعلم";
              else ctaBtn.innerText = "ابدأ التعلم";
              ctaBtn.classList.add("font-ar");
            } else if (langCode === "bn") {
              shell.setAttribute("dir", "ltr");
              h1.className =
                "text-2xl font-bold tracking-tight text-text-main font-bn leading-tight";
              h1.innerText = "আপনি আমাদের সম্পর্কে কোথা থেকে শুনেছেন?";
              p.className = "text-base text-[#6B7280] font-bn pt-1";
              p.innerText =
                "শুধুই কৌতূহল! এটি আমাদের সাহায্য করে আপনার মত আরও শিক্ষার্থীদের খুঁজে পেতে।";
              if (!ctaBtn.hasAttribute("disabled"))
                ctaBtn.innerText = "শেখা শুরু করুন";
              else ctaBtn.innerText = "শেখা শুরু করুন";
              ctaBtn.classList.add("font-bn");
            } else {
              shell.setAttribute("dir", "ltr");
              h1.className =
                "text-2xl font-bold tracking-tight text-text-main font-en";
              h1.innerText = "Where did you hear about us?";
              p.className = "text-base text-[#6B7280] font-en";
              p.innerText =
                "Just curious! This helps us know where to find more learners like you.";
              if (!ctaBtn.hasAttribute("disabled"))
                ctaBtn.innerText = "Start Learning";
              else ctaBtn.innerText = "Start Learning";
              ctaBtn.classList.remove("font-ar", "font-bn");
              ctaBtn.classList.add("font-en");
            }
          }
  });

  onPage("public/vervWordExample.html", () => {
    document.addEventListener("DOMContentLoaded", () => {
            // 1. Save Bookmark Toggle
            const saveBtn = document.getElementById("saveWordBtn");
            const saveIcon = saveBtn.querySelector("svg");
            saveBtn.addEventListener("click", () =>
              saveIcon.classList.toggle("bookmark-active"),
            );
    
            // 2. Accordion Logic (Allows independent toggling)
            const triggers = document.querySelectorAll(".accordion-trigger");
            triggers.forEach((trigger) => {
              trigger.addEventListener("click", () => {
                const isExpanded = trigger.getAttribute("aria-expanded") === "true";
                const contentId = trigger.getAttribute("aria-controls");
                const content = document.getElementById(contentId);
    
                if (isExpanded) {
                  trigger.setAttribute("aria-expanded", "false");
                  trigger.classList.remove("is-open");
                  content.classList.remove("is-open");
                } else {
                  trigger.setAttribute("aria-expanded", "true");
                  trigger.classList.add("is-open");
                  content.classList.add("is-open");
                }
              });
            });
    
            // 3. Audio Playback Visual Feedback
            document.querySelectorAll(".audio-btn").forEach((btn) => {
              btn.addEventListener("click", () => {
                btn.style.opacity = "0.6";
                setTimeout(() => (btn.style.opacity = "1"), 600);
              });
            });
    
            // 4. Record Button State Machine
            document.querySelectorAll(".record-btn").forEach((btn) => {
              btn.addEventListener("click", () => {
                const isRecording = btn.classList.contains("is-recording");
                const micIcon = btn.querySelector(".mic-icon");
                const stopIcon = btn.querySelector(".stop-icon");
                const textSpan = btn.querySelector(".btn-text");
    
                if (isRecording) {
                  // Stop
                  btn.classList.remove("is-recording");
                  micIcon.classList.remove("hidden");
                  stopIcon.classList.add("hidden");
                  if (textSpan) textSpan.textContent = "Practice";
                } else {
                  // Start (Stop others first to prevent multiple active mics)
                  document
                    .querySelectorAll(".record-btn.is-recording")
                    .forEach((activeBtn) => {
                      activeBtn.classList.remove("is-recording");
                      activeBtn
                        .querySelector(".mic-icon")
                        .classList.remove("hidden");
                      activeBtn.querySelector(".stop-icon").classList.add("hidden");
                      const tSpan = activeBtn.querySelector(".btn-text");
                      if (tSpan) tSpan.textContent = "Practice";
                    });
    
                  btn.classList.add("is-recording");
                  micIcon.classList.add("hidden");
                  stopIcon.classList.remove("hidden");
                  if (textSpan) textSpan.textContent = "Stop";
                }
              });
            });
          });
  });

  onPage("public/wordExplaination.html", () => {
    document.addEventListener("DOMContentLoaded", () => {
            // Save Word Toggle
            const saveBtn = document.getElementById("saveWordBtn");
            const saveIcon = saveBtn.querySelector("svg");
            saveBtn.addEventListener("click", () => {
              saveIcon.classList.toggle("bookmark-active");
            });
    
            // Audio Playback Simulation
            const audioBtns = document.querySelectorAll(".audio-btn");
            audioBtns.forEach((btn) => {
              btn.addEventListener("click", () => {
                const originalBg = btn.className;
                // Visual feedback for playing
                btn.style.opacity = "0.7";
                setTimeout(() => {
                  btn.style.opacity = "1";
                }, 800);
              });
            });
    
            // Recording State Toggle
            const recordBtns = document.querySelectorAll(".record-btn");
            recordBtns.forEach((btn) => {
              btn.addEventListener("click", () => {
                const isRecording = btn.classList.contains("is-recording");
                const micIcon = btn.querySelector(".mic-icon");
                const stopIcon = btn.querySelector(".stop-icon");
                const btnText = btn.querySelector(".btn-text");
    
                if (isRecording) {
                  // Stop Recording
                  btn.classList.remove("is-recording");
                  micIcon.classList.remove("hidden");
                  stopIcon.classList.add("hidden");
                  btnText.textContent = btn.closest(".bg-white.p-6")
                    ? "Practice"
                    : "Record";
                } else {
                  // Start Recording
                  // Stop all other recordings first
                  recordBtns.forEach((b) => {
                    b.classList.remove("is-recording");
                    b.querySelector(".mic-icon").classList.remove("hidden");
                    b.querySelector(".stop-icon").classList.add("hidden");
                    b.querySelector(".btn-text").textContent = b.closest(
                      ".bg-white.p-6",
                    )
                      ? "Practice"
                      : "Record";
                  });
    
                  btn.classList.add("is-recording");
                  micIcon.classList.add("hidden");
                  stopIcon.classList.remove("hidden");
                  btnText.textContent = "Stop";
                }
              });
            });
          });
  });

  onPage("public/wordList.html", () => {
    document.addEventListener("DOMContentLoaded", () => {
            const triggers = document.querySelectorAll(".accordion-trigger");
    
            triggers.forEach((trigger) => {
              trigger.addEventListener("click", () => {
                const isExpanded = trigger.getAttribute("aria-expanded") === "true";
                const contentId = trigger.getAttribute("aria-controls");
                const content = document.getElementById(contentId);
    
                // Close all others (Optional: comment out if you want multiple open at once)
                triggers.forEach((t) => {
                  if (t !== trigger) {
                    t.setAttribute("aria-expanded", "false");
                    t.classList.remove("is-open");
                    const tContent = document.getElementById(
                      t.getAttribute("aria-controls"),
                    );
                    tContent.classList.remove("is-open");
                  }
                });
    
                // Toggle current
                if (isExpanded) {
                  trigger.setAttribute("aria-expanded", "false");
                  trigger.classList.remove("is-open");
                  content.classList.remove("is-open");
                } else {
                  trigger.setAttribute("aria-expanded", "true");
                  trigger.classList.add("is-open");
                  content.classList.add("is-open");
                }
              });
            });
          });
  });

})();
