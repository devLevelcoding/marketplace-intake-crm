# Marketplace Intake CRM

Type 1 (Pure SassFactory) from the [mini-CRM catalog](../../sassdesk/project.html) — `#22`.
Two-sided deals: an asset owner lists a space or piece of equipment, a requester asks to book it.
Generalized past real estate — same shape works for event-space or equipment rental.

## Lineage

Forked from `F:\SassFactory\crm3-micro`, same porting approach as every other CRM in this catalog.
What's different here is the two-sided-ness the catalog card calls out:

- `Owner` — ported from `ProposalOwner` (`prisma/schema.prisma:1422`), but promoted from an
  embedded 1:1-per-proposal sub-table to a standalone entity with its own list of `Listing`s. In
  crm3-micro an owner only ever exists attached to one proposal; a real marketplace has the same
  owner listing several assets, so this needed to be a first-class table, not a sub-record.
- `Listing` — ported from `ProposalSpace` (`schema.prisma:1436`), generalized: dropped the
  real-estate-only fields (`streetFront`, `floor`, `streetType`, `grade`, `bathroom`,
  `shopBrandTypeId`) in favor of `category`/`location`/`capacity`, and folded in `ProposalRent`'s
  `price`/`currency` (`dailyRate`/`currency` here) directly rather than keeping it as a separate
  1:1 sub-table — one less join for a listing that's just "here's the asset and what it costs."
- `Requester` — **not** ported from `Client` directly; same shape, renamed. Every other CRM in
  this catalog has one generic `Client`; this one needed the demand side named distinctly from the
  supply side (`Owner`) to make the "two-sided" pitch actually visible in the data model, not just
  in the marketing copy.
- `BookingRequest` — the deal itself, equivalent to crm3-micro's `Proposal` but connecting
  `Requester` → `Listing` explicitly instead of implicitly through a shared `Client`. `POST
  /booking-requests/:id/book` is the one meaningful cross-entity transition: booking a request also
  flips its `Listing.status` to `booked`, taking it off the market — the actual point of modeling
  these as two separate entities instead of reusing `Client` a fifth time.

## Run it locally

```
npm install
npm run prisma:migrate
npm run dev
```

API listens on `:3307` — `/owners`, `/listings`, `/requesters`, `/booking-requests`.

```
cd frontend
npm install
npm run dev
```

UI listens on `:5181`.

## Deploying to Vercel

Same two-project pattern as every other deployed CRM in this catalog — see
`F:\go\v4\goAdmin\VercelCrmDeployManual.md` for the exact steps, the Turso setup, and the
`PrismaLibSQL` adapter gotcha (already avoided here — `src/prisma.service.ts` passes the config
object directly, not a pre-built client).
