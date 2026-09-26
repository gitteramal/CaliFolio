# CaliFolio — Application Knowledge

CaliFolio is a product showcase and review platform for founders, guests, and admins. The frontend is a Vite + React app with role-based protected routes, while the backend is a FastAPI application that serves authentication, product workflows, guest access control, password reset, and AI-assisted product queries. The stack includes React 19, React Router, Tailwind CSS, FastAPI, SQLAlchemy, PostgreSQL-compatible SQLAlchemy configuration, and JWT-based authentication.

## Access & Credentials

### Sign-in URL

| Item | Value |
| --- | --- |
| Human login page | http://localhost:5173/ |
| Route in app | / |
| Route alias | /login |
| Source | `src/App.jsx`; `src/pages/auth/AuthLoginpage.jsx`; Vite default frontend port in `package.json` and `vite.config.js` |

### Authentication procedure

1. Open the browser to the login page at http://localhost:5173/.
2. Enter the email and password in the login form.
3. Submit the form to `POST /auth/login` using the frontend fetch call in `src/pages/auth/AuthLoginpage.jsx`.
4. The API validates the email and password against the `users` table via `backend/app/api/auth.py`.
5. On success, the frontend stores:
   - `sessionStorage.access_token`
   - `sessionStorage.token_type`
   - `sessionStorage.role`
   - `sessionStorage.full_name`
6. The frontend redirects by role:
   - `admin` → `/admin/overview`
   - `founder` → `/founder/overview`
   - `guest` → `/guest/showcase`
7. Every protected route checks session storage in `src/pages/ProtectedRoute.jsx` and redirects to `/login` if no token or wrong role is present.
8. For API calls, the frontend sends the token in the `Authorization: Bearer <token>` header as shown in `src/pages/admin/OverviewPage.jsx`, `src/pages/founder/FounderOverviewPage.jsx`, and `src/pages/guest/GuestShowcasePage.jsx`.

### API token/session details

| Field | Value |
| --- | --- |
| Token issuer | `POST /auth/login` |
| Token type | `bearer` |
| Token payload keys | `sub`, `user_id`, `role`, `exp` |
| JWT algorithm | `HS256` |
| Token expiration | 60 minutes (`ACCESS_TOKEN_EXPIRE_MINUTES = 60`) |
| Secret key value | `CHANGE_THIS_TO_A_LONG_RANDOM_SECRET_KEY` |
| Header format | `Authorization: Bearer <access_token>` |
| Validation source | `backend/app/core/security.py`; `backend/app/core/dependencies.py` |

### Test accounts

| Email | Password | Role | Environment |
| --- | --- | --- | --- |
| founder@jos.com | founder1234 | founder | local/dev seed in repo |
| guest2@gmail.com | guest12345 | guest | local/dev seed in repo |

Notes:
- No verified seeded admin account was found in repo files inspected.
- The app allows creating additional users through the admin UI, but the repository does not include a seeded admin login credential.
- The user creation endpoint accepts `admin`, `founder`, and `guest` roles in `backend/app/api/users.py`.
- The scripts `backend/create_founder.py` and `backend/create_guest.py` create the founder and guest credentials shown in the table.

## Modules / Functional Areas

| Module | Purpose | Key entities | Primary actions |
| --- | --- | --- | --- |
| Authentication | Login, JWT issuance, protected route checks | `User`, JWT token | `POST /auth/login`, route guarding |
| Admin console | Product review, draft creation, founder assignment, guest access management | `Product`, `User`, `GuestProductAccess` | create draft, assign founder, approve, request changes, assign guest access |
| Founder workspace | Product editing and submission | `Product` | edit product, save draft, submit for review |
| Guest experience | Browse published products and ask questions | `Product`, `ProductQuestion` | view showcase, view product detail, ask Q&A |
| Password reset | Email-based reset flow | `PasswordResetToken`, `User` | `POST /auth/forgot-password` |
| AI assistant | Role-aware product queries | `User`, `Product`, `GuestProductAccess` | answer natural-language admin/founder/guest product questions |

## Actions Reference

| Module | Action / Route / Command / Code | Human name | What it does | Creates or changes | Expected result (how to tell it passed) | Auth / role |
| --- | --- | --- | --- | --- | --- | --- |
| Authentication | `POST /auth/login` | Log in | Validates email/password and returns JWT | `access_token`, sessionStorage data | Frontend redirects to role dashboard and stores token | Public |
| Authentication | `GET /` | Landing page | Root route serves app entry | N/A | Browser loads login page | Public |
| Users | `POST /users/` | Create user | Creates a new `User` record | `users` row | Returns created user JSON with `id`, `full_name`, `email`, `role`, `is_active` | Admin |
| Users | `GET /users/founders` | List founders | Returns active founders | N/A | JSON list of `{id, full_name, email}` | Public (no explicit auth check in route) |
| Users | `GET /users/guests` | List guests | Returns guest directory and assigned products | N/A | JSON list includes `is_active`, `products` | Admin |
| Users | `PATCH /users/guests/{guest_id}/status` | Toggle guest status | Updates `User.is_active` | guest status | Response includes updated `is_active` | Admin |
| Products | `POST /products/admin/` | Create product draft | Creates a product with default status `draft` and `founder_id=None` | `products` row | Returns product JSON with `status="draft"` | Admin |
| Products | `GET /products/admin/drafts` | List draft products | Lists products with status `draft` | N/A | Array of `ProductResponse` records | Admin |
| Products | `GET /products/admin/pending-review` | List products pending review | Lists products with status `pending_review` | N/A | Array of pending products | Admin |
| Products | `GET /products/admin/published` | List published products | Lists products with status `published` | N/A | Array of published products | Admin |
| Products | `GET /products/admin/published/{product_id}` | View published product | Returns a specific published product | N/A | Product JSON or 404 | Admin |
| Products | `GET /products/admin/{product_id}/review` | Get product for review | Returns full product including pending changes | N/A | Product JSON or 404 | Admin |
| Products | `PATCH /products/admin/{product_id}/approve` | Approve product | Moves `pending_review` to `published`; applies pending edits if present | product `status`, `pending_edits`, `is_edited` | Product status becomes `published`; `review_note` cleared | Admin |
| Products | `PATCH /products/admin/{product_id}/request-changes` | Request changes | Sets `review_note` and returns product to `draft` | product `review_note`, `status` | Product status becomes `draft` | Admin |
| Products | `PATCH /products/admin/{product_id}/assign-founder` | Assign founder | Sets `Product.founder_id` and status `draft` | `Product.founder_id`, `status` | Founder assigned and response includes founder id | Admin |
| Products | `GET /products/admin/{product_id}/guests` | List guests assigned to product | Returns guests with access to a product | N/A | Array of guest objects | Admin |
| Products | `POST /products/admin/{product_id}/assign-guest/{guest_id}` | Assign guest access | Creates `GuestProductAccess` row | `guest_product_access` row | Response returns updated product | Admin |
| Products | `DELETE /products/admin/{product_id}/assign-guest/{guest_id}` | Remove guest access | Deletes `GuestProductAccess` row | row removed | Response message says access removed | Admin |
| Products | `GET /products/founder/my-products` | List founder products | Returns founder-owned products | N/A | Array of products | Founder |
| Products | `GET /products/founder/{product_id}` | View founder product | Returns product only if founder owns it | N/A | Product JSON or 404 | Founder |
| Products | `PATCH /products/founder/{product_id}/details` | Save founder details | Updates product details; if `status == published`, stores pending edits and sets `is_edited` | product description fields or `pending_edits` | Product saved or pending edits stored | Founder |
| Products | `PATCH /products/founder/{product_id}/submit-review` | Submit for review | Moves draft or published product to `pending_review` | `status` | Product status becomes `pending_review` | Founder |
| Products | `GET /products/guest/published` | List guest-accessible products | Returns published products assigned to current guest | N/A | Array of accessible product records | Guest |
| Products | `GET /products/guest/published/{product_id}` | View guest product detail | Returns one published product only if assigned | N/A | Product JSON or 404 | Guest |
| Product questions | `POST /product-questions` | Ask product question | Creates product question for current guest | `product_questions` row | Returns created question with status `pending` | Guest |
| Product questions | `GET /product-questions/my` | List my questions | Returns guest’s own questions and admin answers | N/A | Array of question records with answer fields | Guest |
| Product questions | `POST /product-questions/{question_id}/answer` | Answer question | Saves answer and sets question status to `answered` | `product_question_answers` row and `ProductQuestion.status` | Response returns answer record | Admin |
| Product questions | `GET /product-questions/admin` | Admin list all questions | Returns all questions with answer details | N/A | Array of questions with statuses | Admin |
| Password reset | `POST /auth/forgot-password` | Forgot password | Creates reset token and sends email if user exists | `password_reset_tokens` row | Generic success message prevents email enumeration | Public |
| AI assistant | `POST /ai/chat` | Ask AI question | Routes user natural-language question to a permission-checked database tool | N/A | Returns `success: true` and `response` object | Authenticated user |

## End-to-End Flows (Golden Paths)

| Flow | Preconditions (state that must exist first) | Ordered steps (A → B → C …) | Expected outcome (final pass criteria) | Roles involved |
| --- | --- | --- | --- | --- |
| Admin login to product review | App is running; a valid admin user exists in the database; the user must have a working `access_token` | Log in (Log in) → Admin Overview (Open Admin Overview) → Create Product Draft (Create product draft) → Assign Founder (Assign founder) → Approve product (Approve product) | Admin sees the product in published catalog and the product is `status="published"` with no pending review | Admin |
| Founder login to product submission | App is running; founder account exists; founder is assigned to a product | Log in (Log in) → Founder Overview (Open founder overview) → Edit product details (Save founder details) → Submit for review (Submit for review) → Admin review (Approve product) | Product moves from `draft` or `published` to `pending_review`, then `published` after admin approval | Founder, Admin |
| Guest login to product showcase | App is running; guest account exists; product is assigned via `GuestProductAccess` and published | Log in (Log in) → Guest Showcase (Open guest showcase) → Open product detail (View guest product detail) → Ask question (Ask product question) → Wait for admin answer | Guest sees only assigned published products; question status moves from `pending` to `answered` | Guest, Admin |
| Password reset | User exists with valid email; SMTP configuration is present | Forgot password (Forgot password) → reset link emailed → use reset token in frontend → create new password | Email is sent and response is the generic success message when a user exists; API returns 500 if SMTP is misconfigured | Public |

## Entities / Data Model

| Entity | Key fields | Created by (action) | Related to |
| --- | --- | --- | --- |
| `User` | `id`, `full_name`, `email`, `password_hash`, `role`, `is_active` | `POST /users/`, `backend/create_founder.py`, `backend/create_guest.py`, admin UI | `GuestProductAccess`, `ProductQuestion`, `PasswordResetToken` |
| `Product` | `id`, `name`, `version`, `one_liner`, `stage`, `origin`, `status`, `founder_id`, `review_note`, `guest_visibility`, many detail fields | `POST /products/admin/`, founder saves details | `User`, `GuestProductAccess`, `ProductQuestion` |
| `GuestProductAccess` | `id`, `guest_id`, `product_id`, `assigned_at` | `POST /products/admin/{product_id}/assign-guest/{guest_id}` | `User`, `Product` |
| `ProductQuestion` | `id`, `product_id`, `guest_id`, `question`, `status`, `created_at`, `updated_at` | `POST /product-questions` | `User`, `Product`, `ProductQuestionAnswer` |
| `ProductQuestionAnswer` | `id`, `question_id`, `admin_id`, `answer`, `created_at`, `updated_at` | `POST /product-questions/{question_id}/answer` | `ProductQuestion`, `User` |
| `PasswordResetToken` | `id`, `user_id`, `token_hash`, `expires_at`, `used` | `POST /auth/forgot-password` | `User` |

## Status Lifecycles / State Machines

| Entity | Status value | Meaning | Transitions to | Triggered by (action) |
| --- | --- | --- | --- | --- |
| `Product` | `draft` | Draft product created by admin or founder editing | `pending_review`, `published` | `POST /products/admin/`, founder save, `PATCH /products/founder/{id}/submit-review`, admin approval |
| `Product` | `pending_review` | Product is awaiting admin review | `published`, `draft` | founder submit, admin approve, admin request changes |
| `Product` | `published` | Live product visible to guests | `draft`, `pending_review` | founder edits published product with pending edits, admin request changes, admin approval flow |
| `Product` | `changes_requested` | Not directly set in the backend, but UI references it as a status label | `draft` | UI formatting only, no explicit backend state switch found in API |
| `ProductQuestion` | `pending` | Guest question awaiting answer | `answered` | `POST /product-questions/{question_id}/answer` |
| `ProductQuestion` | `answered` | Admin answered the question | N/A | answer creation route |
| `PasswordResetToken` | `False` / `True` for `used` | Reset token validity | Used tokens are not deleted instantly; code deletes unused tokens before creating a new one | `POST /auth/forgot-password` |

## Roles & Permissions

| Role | Can do | Cannot do (and denial behavior) | Owner / tenant scope |
| --- | --- | --- | --- |
| `admin` | Create users; create product drafts; approve/reject review; assign founders; assign guest access; list all products, users, and guest access; answer questions | Cannot access founder-only or guest-only data beyond the allowed endpoints; backend enforces role checks in dependencies and database tools. Denial is a 403 `Admin access required.` or `You are not authorized...` from permission checks. | No owner scope is enforced in `Product` queries; admin sees all users/products |
| `founder` | View their own products; edit product details; submit for review; ask the AI assistant about owned products | Cannot modify other founders’ products; or access guest-only products not assigned to them. Denial is 404 `Product not found or you do not have access to it.` or `You are not authorized to access this product.` | Product access is limited to `Product.founder_id == current_user.id` |
| `guest` | View published products assigned to them; ask product questions; view their own product questions; access assigned products in AI helper | Cannot ask for other guests’ questions or unassigned products. Denial is 403 `Guest access required.` for route protection and 404 or `PermissionError` for product access checks. | Access is limited via `GuestProductAccess.guest_id == current_user.id` |

## Interface Surface (Screens / Endpoints / Commands)

### Login page

| Field / Param / Flag | Required? | Type / validation | Example valid value | Example invalid value (and the error it triggers) | Stable selector / test id | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Email | Yes | `EmailStr` via Pydantic | `founder@jos.com` | `not-an-email` triggers schema validation before the request is accepted | (not found in code) | Form field uses state `email` |
| Password | Yes | `str` | `founder1234` | Empty string or wrong password triggers `Invalid email or password` with 401 | (not found in code) | Value stored in `password` state |
| Submit | Yes | button click | form submit | Invalid credentials show `err.message` from API response | (not found in code) | Redirects to dashboard after login |

### Admin overview

| Field / Param / Flag | Required? | Type / validation | Example valid value | Example invalid value (and the error it triggers) | Stable selector / test id | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Product Name | Yes | free text | `CaliFolio` | empty string still allowed by frontend, but backend may reject if required fields are missing at API validation level | (not found in code) | `name` in product create form |
| Version | No | free text or null | `1.0.0` | (not found in code) | (not found in code) | API allows `None` |
| Founder selection | Yes for draft creation | founder id select | `1` | no founder selected yields `Please select a founder.` | (not found in code) | Handled in `handleCreateDraft` |
| User role | Yes when creating user | `admin`, `founder`, `guest` | `founder` | invalid roles return `Invalid role. Must be 'admin', 'founder', or 'guest'.` | (not found in code) | `backend/app/api/users.py` |
| User email | Yes | unique `EmailStr` | `newfounder@example.com` | duplicate email yields `A user with this email already exists.` | (not found in code) | Enforced by unique DB constraint and app validation |

### Founder product editor

| Field / Param / Flag | Required? | Type / validation | Example valid value | Example invalid value (and the error it triggers) | Stable selector / test id | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Media URLs | No | must use `http://` or `https://`; empty values allowed | `https://example.com/demo.mp4` | `ftp://example.com` triggers `URL must use http:// or https://` | (not found in code) | `FounderProductUpdate` validators |
| Product status | Derived | `draft`, `published`, `pending_review` | `draft` | invalid statuses are not handled by validation; backend enforces allowed transitions | (not found in code) | Status logic in `backend/app/api/products.py` |
| Save action | N/A | button action | Save founder details | invalid URL triggers `Please fix the invalid URL fields before saving.` | (not found in code) | Client-side guard |

### Guest Q&A page

| Field / Param / Flag | Required? | Type / validation | Example valid value | Example invalid value (and the error it triggers) | Stable selector / test id | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Question | Yes | trimmed string, must not be empty | `What is the product roadmap?` | empty string triggers `Please enter a question.` | (not found in code) | `GuestProductQAPage.jsx` |
| Product question POST | Yes | `product_id`, `question` | `product_id: 7`, `question: "..."` | invalid product id returns 404 `Product not found.` | (not found in code) | `POST /product-questions` |

## API Endpoint Reference

| Method + Path | Auth required | Request params/body | Success response | Error responses / status codes |
| --- | --- | --- | --- | --- |
| `GET /` | No | N/A | `{"message": "Califolio API is running"}` | N/A |
| `POST /auth/login` | No | `{"email": "...", "password": "..."}` | `{"access_token": "...", "token_type": "bearer", "role": "...", "full_name": "..."}` | `401 Invalid email or password`; `403 User account is disabled.` |
| `POST /auth/forgot-password` | No | `{"email": "..."}` | generic success message | `500 Unable to send password reset email.` if SMTP config is invalid |
| `POST /users/` | Yes, admin | `UserCreate` | created user JSON | `400 Invalid role...`; `400 A user with this email already exists.` |
| `GET /users/founders` | No route auth | N/A | list of founder objects | (not found in code) |
| `GET /users/guests` | Admin | N/A | guest directory with products | 403 `Admin access required.` |
| `PATCH /users/guests/{guest_id}/status` | Admin | `{"is_active": true|false}` | `{"id": ..., "is_active": ...}` | 404 `Guest not found.` |
| `POST /products/admin/` | Admin | `ProductCreate` | product object | 401/403 role errors |
| `GET /products/admin/published` | Admin | N/A | list of published products | 401/403 |
| `GET /products/admin/{product_id}/review` | Admin | path `product_id` | product object | 404 `Product not found.` |
| `PATCH /products/admin/{product_id}/approve` | Admin | path `product_id` | product object | 404 `Product not found.`; `400 Only products pending review can be approved.` |
| `PATCH /products/admin/{product_id}/request-changes` | Admin | `{"review_note": "..."}` | product object | 404 `Product not found.`; `400 Only products pending review can have changes requested.` |
| `PATCH /products/admin/{product_id}/assign-founder` | Admin | `{"founder_id": 123}` | product object | 404 `Founder not found.` |
| `POST /products/admin/{product_id}/assign-guest/{guest_id}` | Admin | path ids | product object | 400 `Only published products can be assigned to guests.`; `400 This product is already assigned to this guest.` |
| `DELETE /products/admin/{product_id}/assign-guest/{guest_id}` | Admin | path ids | `{"message": "Product access removed from guest.", ...}` | 404 `This product is not assigned to this guest.` |
| `GET /products/founder/my-products` | Founder | N/A | list of founder-owned products | 403 `Founder access required.` |
| `PATCH /products/founder/{product_id}/details` | Founder | `FounderProductUpdate` | product object | 404 `Product not found or you do not have access to it.`; `400 Only draft or published products can be edited.` |
| `PATCH /products/founder/{product_id}/submit-review` | Founder | N/A | product object | 400 `Only draft or published (edited) products can be submitted for review.` |
| `GET /products/guest/published` | Guest | N/A | list of assigned published products | 403 `Guest access required.` |
| `POST /product-questions` | Guest | `{"product_id": 1, "question": "..."}` | question object | 404 `Product not found.` |
| `GET /product-questions/my` | Guest | N/A | question list with answers | 403 `Guest access required.` |
| `POST /product-questions/{question_id}/answer` | Admin | `{"answer": "..."}` | answer object | 404 `Question not found.`; `400 This question has already been answered.` |
| `GET /product-questions/admin` | Admin | N/A | list of all questions | 403 `Admin access required.` |
| `POST /ai/chat` | Authenticated user | query string `question` | `{"success": true, "question": "...", "response": ...}` | PermissionError handled as `{"success": true, "response": {"type": "unauthorized", ...}}` |

## Negative & Edge Cases (what to test beyond the happy path)

| Action / field / flow | Bad input or condition | Expected rejection (message / status / behavior) |
| --- | --- | --- |
| Login with nonexistent email | email not in DB | `401` with detail `Invalid email or password` |
| Login with wrong password | mismatch in `verify_password` | `401` with detail `Invalid email or password` |
| Login with disabled account | user `is_active == False` | `403` with detail `User account is disabled.` |
| Create user invalid role | role outside `admin`, `founder`, `guest` | `400` with detail `Invalid role. Must be 'admin', 'founder', or 'guest'.` |
| Create duplicate user | same `email` already exists | `400` with detail `A user with this email already exists.` |
| Approve non-pending product | status not `pending_review` | `400` with detail `Only products pending review can be approved.` |
| Request changes on non-pending product | status not `pending_review` | `400` with detail `Only products pending review can have changes requested.` |
| Assign guest to non-published product | `Product.status != "published"` | `400` with detail `Only published products can be assigned to guests.` |
| Duplicate guest assignment | same guest-product row already exists | `400` with detail `This product is already assigned to this guest.` |
| Remove access record that does not exist | no `GuestProductAccess` row | `404` with detail `This product is not assigned to this guest.` |
| Founder edits published product in invalid state | `product.status` not in `published`, `draft`, or `changes_requested` | `400` with detail `Only draft or published products can be edited.` |
| Founder submit invalid product state | product status not `draft` or `published` | `400` with detail `Only draft or published (edited) products can be submitted for review.` |
| Invalid URL in founder details | `ftp://...` or missing hostname | Pydantic validation error `URL must use http:// or https://` / `Invalid URL` |
| Ask empty question as guest | trimmed question is empty | client-side error `Please enter a question.` |
| Second answer for same question | `ProductQuestionAnswer` exists for `question_id` | `400` with detail `This question has already been answered.` |
| Password reset email send failure | incomplete SMTP settings or SMTP send error | generic 500 and token record is rolled back by code |

## Integrations & External Systems

| System | Direction (inbound/outbound) | Protocol/Transport | Purpose | Config key |
| --- | --- | --- | --- | --- |
| PostgreSQL database | outbound | SQLAlchemy / SQL | persistence for users, products, access, questions, tokens | `DATABASE_URL` |
| Frontend browser session storage | local/client only | browser `sessionStorage` | stores token and user role | N/A |
| SMTP mail server | outbound | SMTP via `smtplib` | sends password reset emails | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL` |
| Frontend URL for reset link | outbound | HTTP URL string | resets password link in browser | `FRONTEND_URL` |
| AI question pipeline | outbound | Python function calls / backend logic | routes user queries to database tools and permission checks | N/A |
| Azure Static Web App host | outbound | HTTPS | appears in CORS allowlist | `https://lemon-dune-08e2b8e10.6.azurestaticapps.net` |

## Background Jobs & Events

| Job / Event | Trigger (schedule / event / queue) | What it does | Reads / Writes |
| --- | --- | --- | --- |
| Admin question notifications refresh | frontend polling every 15 seconds and browser event | refreshes pending question count for admin and new guest answer counts | reads `product-questions/admin` and `product-questions/my` |
| Guest answer notification refresh | frontend polling every 15 seconds and browser event | marks answered questions as seen and updates badge counters | reads `product-questions/my`, writes `localStorage` `calinova_seen_answer_ids` |
| Password reset token cleanup | before generating a new reset token | deletes old unused reset tokens for that user | writes `PasswordResetToken` row cleanup |
| Database table creation | app startup | creates all SQLAlchemy tables via `Base.metadata.create_all(bind=engine)` | creates tables in database |

## Single-Operation Trace

One representative operation: founder login and product submission.

1. The user opens the login page at http://localhost:5173/ and submits email/password from the login form in `src/pages/auth/AuthLoginpage.jsx`.
2. The browser calls `fetch(`${API_URL}/auth/login`, { method: "POST", ... })` with JSON containing `email` and `password`.
3. `backend/app/api/auth.py` looks up the user by `User.email` and verifies the password via `verify_password` in `backend/app/core/security.py`.
4. On success, the route creates a JWT in `create_access_token` with payload `sub`, `user_id`, `role`, and expiration.
5. The frontend stores `access_token`, `token_type`, `role`, and `full_name` in `sessionStorage` and redirects to `/founder/overview`.
6. `src/pages/ProtectedRoute.jsx` later checks `sessionStorage.access_token` and `sessionStorage.role` for future protected routes.
7. The founder opens their product page and calls `PATCH /products/founder/{product_id}/details` to save details or `PATCH /products/founder/{product_id}/submit-review` to send it to admin review.
8. The backend uses `get_current_founder` from `backend/app/core/dependencies.py` to enforce role access and updates the `Product` row in SQLAlchemy.
9. The product status changes from `draft` or `published` to `pending_review`, which is observable in subsequent admin review lists and guest visibility.

## Terminology / Glossary

| Term | Meaning |
| --- | --- |
| Admin | Role value `admin`; full platform and user management access |
| Founder | Role value `founder`; owns products and manages details |
| Guest | Role value `guest`; views assigned published products and asks product questions |
| Product draft | `Product.status == "draft"` |
| Pending review | `Product.status == "pending_review"` |
| Published | `Product.status == "published"` |
| GuestProductAccess | association table linking a `guest_id` to a `product_id` |
| Product Q&A | guest product questions and admin answers stored in `ProductQuestion` and `ProductQuestionAnswer` |
| JWT | JSON Web Token created by the backend for authenticated API access |
| `full_name` | visible name stored in the `User` model |
| API_URL | frontend environment variable `VITE_API_URL` pointing to the FastAPI backend |

## Configuration / Reference Data

| Key | Value | Meaning |
| --- | --- | --- |
| `VITE_API_URL` | `http://127.0.0.1:8000` in `.env` | Local backend base URL used by React app |
| `VITE_API_URL` | `https://califolio.icymoss-aa1ea086.southindia.azurecontainerapps.io` in `.env.example` | Example production-like URL noted in repo |
| `DATABASE_URL` | (not found in code) | Required env value for database connection; code raises `ValueError` if missing |
| `FRONTEND_URL` | (not found in code) | Password reset email link base, defaults to `http://localhost:5173` if unset |
| `SMTP_HOST` | (not found in code) | SMTP server host; required for reset emails |
| `SMTP_PORT` | default `587` | SMTP port used if not set |
| `SMTP_USERNAME` | (not found in code) | SMTP login |
| `SMTP_PASSWORD` | (not found in code) | SMTP password |
| `SMTP_FROM_EMAIL` | (not found in code) | From email address |
| `Product.stage` | `ideation`, `in_development`, `ready` in UI code | Validated by frontend display mapping rather than strict backend enum |
| `Product.origin` | `in_house`, `acquired`, `whitelabelled`, `whitelabeled`, `hosted` | UI display mapping; backend accepts strings |
| `User.role` | `admin`, `founder`, `guest` | Role values enforced in `backend/app/api/users.py` |
| `guest_visibility` default | JSON dictionary with all major fields set to `True` | Controls which product fields guests can see |

## Test Execution Notes

- Access prerequisites: the app requires a working browser and a backend server started with FastAPI at the `VITE_API_URL` host. The repository does not contain a Docker Compose setup or server bootstrap script beyond backend Python files.
- Destructive actions: creating or deleting guest access and toggling user status are real state changes. The app does not provide a reset script for a shared environment in the repo files inspected.
- Timing / async: the admin and guest dashboards poll for question updates every 15 seconds, and event-driven refreshes are dispatched when new answers are submitted.
- Integrations in the test environment: SMTP is not mocked in code; it is a live outbound SMTP integration when configured. Password reset sends actual email messages through `smtplib`.
- Not testable / gated: there is no feature flag or environment gate found in the inspected code for the login, workflow, or AI routes.

## Environments & Base URLs

| Environment | Base URL / host | Purpose |
| --- | --- | --- |
| Local frontend dev | http://localhost:5173/ | Vite default browser entry point |
| Local backend API | http://127.0.0.1:8000 | Backend base URL from `.env` |
| Example hosted frontend | (not found in code) | No explicit browser host other than the example backend URL in `.env.example` |
| Azure Static Web App CORS target | https://lemon-dune-08e2b8e10.6.azurestaticapps.net | CORS allowlist entry in backend |

## Coverage Notes

The following repository areas were not inspected in detail for this document:

- `public/` — static assets and hosting config were not fully analyzed beyond the file listing and the presence of `staticwebapp.config.json`.
- `src/assets/` — static asset folder not inspected.
- `backend/app/services/` — directory exists in the tree but no concrete files were reviewed in this pass.
- `dist/` — generated build output was not analyzed because it is build output, not source code.
- `backend/venv/` — virtual environment dependencies were not inspected as application source logic.

## Source note

All statements in this document were derived from repository code in the frontend React routes, API handlers, SQLAlchemy models, schemas, and configuration files inspected in this pass. Where a fact could not be established from the code, the wording `(not found in code)` is used.
