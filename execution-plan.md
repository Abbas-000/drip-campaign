
Key files I used while making this plan: instructions.docx.&#x20;
Seed guests/properties: str\_past\_guests\_seed\_with\_segments.json.&#x20;
Segmentation rules: segmentation\_rules.json.&#x20;
Tone mapping: tones.json.&#x20;
Outreach templates: outreach\_templates.json.&#x20;
Offer texts: offer\_texts.json.&#x20;
Alt-offer texts: alt\_offer\_texts.json.&#x20;
Promo codes: promo\_codes.json.&#x20;

---

# 1) High-level objective (one sentence)

Take the provided seed guest data → assign each guest exactly one rule-based segment → compute 5 outbound outreach items (dates + channels) per consent → fill templates with segment-specific tone, offer, promo and booking URL → export three JSONL files for CRM (contacts.json, custom\_fields.json, actions.json) and provide a lightweight preview UI.&#x20;

---

# 2) Core workflow steps (ordered, deterministic)

## Step A — Ingest data

* Load these inputs:

  * Guests & properties: `str_past_guests_seed_with_segments.json`.&#x20;
  * `segmentation_rules.json` — deterministic rule set.&#x20;
  * `tones.json` — tone choice per segment (email + sms).&#x20;
  * `outreach_templates.json` — templates for Outreach1..Outreach5 and tone variants.&#x20;
  * `offer_texts.json` and `alt_offer_texts.json` — segment offers.&#x20;
  * `promo_codes.json` — per-segment codes by outreach.&#x20;

Record the property list (id, property\_name, city, timezone) from the seed file for URL generation and timezone-aware date handling.&#x20;

---

## Step B — Deterministic segmentation (single segment per guest)

Follow a deterministic, *priority-ordered* evaluation of rules as in `segmentation_rules.json`. Evaluate rules top-to-bottom and assign the first matching segment. Use only the listed inputs (no heuristics):

Inputs used:

* `recency_days` (from guest.derived or compute from last\_check\_out),
* `lifetime_spend`,
* `avg_review_score`,
* `last_property`,
* `guest_communications` sentiment (any negative message triggers negative sentiment flag).&#x20;

Implementation details:

* Implement evaluation operators exactly as shown in rules (>, >=, <=). Example: `Promoter_VIP` = lifetime\_spend > 2000 AND avg\_review\_score >= 4.8 AND recency\_days <= 180. If true, assign `Promoter_VIP`. Otherwise evaluate next rule.&#x20;
* `AtRisk` includes an OR: `recency_days > 365 OR guest_communications.sentiment == 'negative'`. If any message in `guest_communications` has `sentiment: "negative"` treat it as negative.&#x20;
* If no rule matches, assign `Neutral` (default rule).&#x20;
* After assignment, write the segment into the guest object as `derived.segment` and into the `custom_fields.json` output. (Use assigned segment to validate any existing `derived.segment` in the seed file.)

Why priority matters: rules may overlap (e.g., high spend + high reviews + recent → VIP) — first-match ensures exactly one segment.

---

## Step C — Choose tone & offer/promo mapping

* Map segment → tone using `tones.json`: choose the email tone and SMS tone for every guest.&#x20;
* Choose offer\_text / alt\_offer\_text and promo\_code:

  * **NOTE (small inconsistency in instructions):** the doc lists `Use the output segment to pick offer_text from alt_offer_texts.json` and *then* to pick alt\_offer\_text from offer\_texts.json — that looks like a flip/typo. I will follow the natural mapping:

    * `{offer_text}` ← `offer_texts.json` for the chosen segment.&#x20;
    * `{alt_offer_text}` ← `alt_offer_texts.json` for the chosen segment.&#x20;
  * Rationale: placeholders in templates read more naturally with that mapping (offer\_text used in Outreach3 templates, alt\_offer\_text used in Outreach4). If you prefer the literal swap from the doc, swap the two sources.&#x20;
* Promo codes come from `promo_codes.json` keyed by segment and outreach only for Outreach3/4/5 (where the promo exists). If an outreach has no code for that segment, set `promo_code` to empty/null.&#x20;

---

## Step D — Compute send dates and cadence (timezone-aware)

* Base date: each outreach is triggered relative to `last_check_out` (guest field). Use the property timezone (from the `properties` list) to compute local dates. Example offsets: Outreach1 = last\_check\_out + 3 days; Outreach2 = +14 days; Outreach3 = +30 days; Outreach4 = +60 days; Outreach5 = +110 days.&#x20;
* Choose send time (recommended): 09:00 local time for email; SMS optionally at 10:00 local. (This is a pragmatic default; can be changed.)
* Respect local date boundaries: if last\_check\_out is 2025-08-31 and property timezone yields DST boundary, compute local 09:00 accordingly.
* If the computed `planned_send_date` falls on a property-specific blackout (if you have a seasonal blackout list), optionally push earlier/later — but instructions do not require blackout calculation, so deliver as computed.

---

## Step E — Channel & consent rules

* For each guest and each outreach:

  * If `consent_email == true` → schedule email action.
  * If `consent_sms == true` → schedule SMS action.
  * If neither consent is true → include guest in `custom_fields.json` with `consent_missing: true` and do not create actions.&#x20;
* If a channel is missing required contact info (email or phone), log a validation error and skip that channel; still create other available channels.

---

## Step F — Template selection & placeholder filling

* Pick template by outreach id (Outreach1..Outreach5) and by tone (email tone from tones.json for email, sms tone for sms). Templates are in `outreach_templates.json`.&#x20;
* Replace placeholders with deterministic values:

  * `{first_name}` → guest.first\_name
  * `{last_property}` → guest.last\_property
  * `{city}` → property's city field (lookup by property\_name).&#x20;
  * `{promo_code}` → promo code selected for that segment+outreach (may be null)
  * `{offer_text}` → from `offer_texts.json` (per segment).&#x20;
  * `{alt_offer_text}` → from `alt_offer_texts.json` (per segment).&#x20;
  * `{booking_url}` → computed using property slug + guest id + promo (see Step G).
  * `{date}` in the templates (where present) → fill with the date cutoff for timeboxed offers: set to the send date + 7 days (or you can set a consistent expiration of send\_date + 7). (This makes the template’s `{date}` explicit.)
* For previews, include both subject, preview line, body (email) and SMS text with all placeholders replaced.&#x20;

---

## Step G — Booking URL & property slugging

* Booking URL format required:
  `https://yourstrplatform.com/bookings/{property_slug}?guest_id={guest_id}&promo={promo_code}`.&#x20;
* Slug generation algorithm (deterministic, safe for URLs):

  * Lowercase the full `last_property` string.
  * Replace `#` with nothing or a dash; remove any non-alphanumeric characters except spaces and `-`.
  * Replace spaces with `-`.
  * Collapse multiple dashes to a single dash.
  * Example: `"WhiteSmoke Bungalow #14"` → `"whitesmoke-bungalow-14"`.
* If `promo_code` is null, omit `&promo=` parameter or include `promo=` empty string (pick one and be consistent — recommended: include `promo=` with empty value).

---

# 3) Output formats (exact contents & examples)

All three outputs are **JSONL** (newline-delimited JSON objects).

## a) contacts.json (one object per guest)

Fields:

* `guest_id`, `first_name`, `last_name`, `email`, `phone`

Example line:

```
{"guest_id":"g_2005","first_name":"Bianca","last_name":"Atkinson","email":"bianca.atkinson@example.com","phone":"+12894206204"}
```

Seed guests are in `str_past_guests_seed_with_segments.json`.&#x20;

## b) custom\_fields.json (one object per guest — tracks workflow state)

Fields (suggested):

* `guest_id`
* `segment` (assigned by rule)
* `current_outreach` (next outreach to send; e.g., "Outreach1" if no outreach sent)
* `next_outreach` (e.g., "Outreach2")
* `planned_send_date` (local ISO date string for next\_outreach)
* `consent_email` / `consent_sms`
* `validation_errors` (array, optional)
* `notes` (optional)

Example:

```
{"guest_id":"g_2005","segment":"Promoter","current_outreach":"Outreach1","next_outreach":"Outreach2","planned_send_date":"2025-08-24T09:00:00-07:00","consent_email":true,"consent_sms":true}
```

## c) actions.json (one object per scheduled channel action)

Fields (suggested):

* `guest_id`
* `outreach` (Outreach1..Outreach5)
* `send_date` (ISO8601 local time)
* `channel` ("email" or "sms")
* `template_id` (e.g., "Outreach3")
* `dedupeKey` (unique idempotency key)
* `subject` (for email)
* `body` (email body after placeholder filling)
* `sms_body` (for SMS channel; or use `body` generically)
* `promo_code`
* `offer_text`
* `alt_offer_text`
* `booking_url`

DedupeKey rule:

* Use `"{guest_id}-{outreach}"` (matches instructions example: dedupeKey = "g\_2076-Outreach3"). This prevents duplicate enrollments per outreach.&#x20;

Example single action (email):

```
{"guest_id":"g_2005","outreach":"Outreach3","send_date":"2025-09-20T09:00:00-07:00","channel":"email","template_id":"Outreach3","dedupeKey":"g_2005-Outreach3","subject":"Bianca, a little gift for you 🎁","body":"Hey Bianca, we’d *love* to see you back at SeaShell Loft #11. Book by 2025-09-27 and enjoy 15% off your next stay!","promo_code":"PROMO10","offer_text":"15% off your next stay","booking_url":"https://yourstrplatform.com/bookings/seashell-loft-11?guest_id=g_2005&promo=PROMO10"}
```

(Example uses natural mapping of offer\_texts → {offer\_text}.)&#x20;

---

# 4) Lightweight Web UI preview (spec + features)

Even though the workflow is offline, a small UI is very helpful. Minimal design:

The application: Next.js + Tailwind (single-page). 

UI features:

* Top bar: import/export buttons (upload JSON or download the three JSONL outputs).
* Left filter panel:

  * Filter by `last_property`, `segment`, `recency range`, `consent_email`, `consent_sms`, `month of stay`.
* Main area: three tabs (Contacts, Custom Fields, Actions) showing data tables (paginated).

  * Actions table: shows `planned_send_date`, `channel`, `subject/preview`, dedupeKey, and quick "preview message" modal showing the fully rendered email body or SMS.
* Row click opens full preview with placeholders resolved and booking\_url clickable.
* Bulk controls: select rows → export only selections to JSONL.

Why: this mirrors the deliverable spec: tabbed preview of Contacts, Custom Fields, Actions.&#x20;

---

# 5) Mock CRM integration notes

* Provide JSONL exports; document how the CRM should map fields.
* Enforce idempotency via `dedupeKey` to avoid double enrolling same guest + outreach across re-runs.&#x20;
* Optionally provide lightweight webhook spec (POST `/crm/enqueue`) that accepts the `actions.json` items to queue messages in production.

---

# 6) Data validation & QA checks (test cases)

Run this checklist before exporting:

**Segmentation tests**

* Unit test each rule in `segmentation_rules.json` with boundary values (e.g., lifetime\_spend = 2000, >2000).&#x20;

**Consent & contact**

* Guests with `consent_email: false` should not have email actions.
* Missing phone number → no SMS action; write a validation error to `custom_fields.json`.

**Template substitution**

* All placeholders present in chosen template must be replaced (no `{first_name}` left).
* `{date}` fields must be populated (we use send\_date + 7 days for offer expiry).

**Promo selection**

* For Outreach3/4/5 check that promo code chosen matches `promo_codes.json` for that segment.&#x20;
* If promo missing for Outreach1/2, leave blank.

**Dedupe**

* Running the workflow twice should not create duplicate actions if the dedupeKey exists.

**Timezone**

* Verify planned\_send\_date is converted to ISO with property timezone offset.

---

# 7) Edge cases & how to handle them

* **Guest with negative sentiment** → `AtRisk` rule matches; ensure we use `urgent`/`direct` tones per `tones.json`.&#x20;
* **Overlapping rules** → first-match priority will prevent multiple segments.
* **Multiple `guest_communications` with mixed sentiment** → any negative message sets negative flag for `AtRisk`.
* **Property lookup fails** → fallback city = "your area", property\_slug = slugify of last\_property string anyway.
* **Promo collision / invalid promo** → mark `validation_errors` and export action with `promo_code: null`.
* **No consent** → include guest in `custom_fields.json` but do not schedule actions.

---

# 8) Example run-through (concise)

1. Load guest `g_2005` from seed; recency\_days = 11, lifetime\_spend = 2599.56, avg\_review\_score = 4.9 → matches `Promoter` (per rules/tier priority) → assign segment `Promoter`.&#x20;
2. Map tone: email → `friendly`, sms → `neutral`.&#x20;
3. Outreach3 (T+30) send date = last\_check\_out + 30 days at 09:00 local. Select `offer_text` = from offer\_texts for `Promoter` (e.g., "10% off your next booking"), `promo_code` = promo\_codes\["Promoter"]\["Outreach3"] = `PROMO10`.
4. Render `Outreach3` template (friendly) with placeholders replaced and compute `booking_url`.&#x20;
5. Write contact line to `contacts.json`, workflow state to `custom_fields.json`, and one action line for email + one for sms in `actions.json` (only if consent flags true).&#x20;

---

# 9) Deliverables (what to include in repo / handoff)

* `README.md` describing inputs, how segments are computed (copy rules), how dates are computed, slugging algorithm, and export formats. (Instructions asked for README.)&#x20;
* `exports/contacts.jsonl`, `exports/custom_fields.jsonl`, `exports/actions.jsonl` — the generated outputs for the seed.&#x20;
* Small UI preview app (optional but recommended) with three tabs: Contacts, Custom Fields, Actions (React + Tailwind).&#x20;
* Unit test descriptions (not code) for segmentation, consent, template filling, promo mapping, dedupeKey idempotency.

---

# 10) Implementation notes for an engineer (concise checklist)

* Parse JSON inputs robustly, validate schema.
* Implement rule-evaluator that supports `and`, `or`, comparison ops (>, >=, <=).
* Use property timezone from `properties` to compute local ISO datetimes.
* Template rendering: safe replace of placeholders + fallback values.
* Exports: write newline-delimited JSON; ensure each object is a single JSON object per line.
* Logging: write validation\_errors per guest into `custom_fields.json`.
* Idempotency: use dedupeKey = `guest_id-outreach`.&#x20;

---

# Final notes / decisions I made for clarity

1. I followed the intent of the doc and resolved the `offer_text` / `alt_offer_text` swap in the doc by mapping `{offer_text}` → `offer_texts.json` and `{alt_offer_text}` → `alt_offer_texts.json`. If you want the literal swap, say so and I’ll flip the mapping.
2. I used `dedupeKey = guest_id-outreach` to match the example in instructions (keeps idempotency simple).&#x20;
3. All cadence and placeholders are implemented exactly per `outreach_templates.json` and the instruction offsets T+3, T+14, T+30, T+60, T+110.

---

