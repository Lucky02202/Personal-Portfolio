# Power Apps Delegation & Performance Checklist

Run through this before an app goes live, and again when a data source starts to grow.

## 1. Delegation

- [ ] No blue delegation warnings in the formula bar. Each warning is a query that silently stops at the data row limit.
- [ ] I know the data row limit for this app (Settings → General; default **500**, maximum **2,000**). It's a cap, not a fix.
- [ ] Filters use delegable functions for this data source. Check the connector's delegation table in the docs — it differs between SharePoint, Dataverse and SQL.
- [ ] On SharePoint, text search uses `StartsWith()` rather than `Search()` or `in`, which aren't delegable there.
- [ ] I've tested with a copy of the data that is *larger* than the row limit. A test list with 50 items hides every delegation bug.

## 2. SharePoint specifics

- [ ] Columns used in filters and sorts are **indexed** (needed once a list passes 5,000 items).
- [ ] Choice, Lookup and Person columns are filtered by their `.Value` / `.Id` where supported, and checked for delegation.
- [ ] Large lists aren't loaded into collections "just to be safe".

## 3. Loading data

- [ ] `App.OnStart` only does what's needed for the first screen. Everything else loads on the screen that uses it.
- [ ] Named formulas (`App.Formulas`) are used for values that never change during the session.
- [ ] Independent loads run in parallel with `Concurrent()`.
- [ ] Lookup tables that never change are cached in a collection once, not queried per row.
- [ ] Galleries don't call `LookUp()` inside each row on a big data source. Joining in a view or a column is cheaper.

## 4. Screens and controls

- [ ] No screen has hundreds of controls. Repeated UI is a gallery or a component.
- [ ] Hidden controls with heavy formulas are removed rather than just hidden.
- [ ] Images are compressed, and large media is served from a URL rather than embedded.
- [ ] Formulas aren't duplicated across controls. Shared logic sits in one place.

## 5. Writes

- [ ] Bulk updates use `Patch()` with a table, or a flow, rather than `ForAll(..., Patch())` row by row where avoidable.
- [ ] Every `Patch()` and `SubmitForm()` handles errors (`IfError()`, `Errors()`, or the form's `OnFailure`).

## 6. Before shipping

- [ ] Monitor (Advanced tools → Monitor) shows no slow or repeated calls on the main screens.
- [ ] App Checker shows no performance warnings.
- [ ] Tested on the slowest device and network the users actually have.

---

*Review this list whenever the data volume changes significantly. Most performance problems appear months after launch, not on day one.*
