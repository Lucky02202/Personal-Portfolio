# Power Automate Expressions — Cheat Sheet

A compact reference for the expressions I reach for most often in cloud flows.
Paste them into the expression editor (the `fx` tab) of any dynamic content box.

---

## Reading data from actions

| What | Expression |
| --- | --- |
| Body of a previous action | `body('Get_item')` |
| A field from that body | `body('Get_item')?['Title']` |
| Rows from "Get items" / "List rows" | `outputs('Get_items')?['body/value']` |
| Current item inside Apply to each | `items('Apply_to_each')` |
| A field of the current item | `items('Apply_to_each')?['Status']` |
| Trigger payload | `triggerBody()` |
| A field from the trigger | `triggerBody()?['email']` |

> Use `?[...]` instead of `[...]`. It returns `null` instead of failing the run when a property is missing.

## Dates and time

| What | Expression |
| --- | --- |
| Now (UTC) | `utcNow()` |
| Today as yyyy-MM-dd | `formatDateTime(utcNow(), 'yyyy-MM-dd')` |
| Convert to a local time zone | `convertTimeZone(utcNow(), 'UTC', 'India Standard Time', 'dd MMM yyyy HH:mm')` |
| Add days | `addDays(utcNow(), 7)` |
| Subtract days | `addDays(utcNow(), -30)` |
| Start of the day | `startOfDay(utcNow())` |
| Start of the month | `startOfMonth(utcNow())` |
| Day of the week (0 = Sunday) | `dayOfWeek(utcNow())` |
| Ticks (for comparing dates) | `ticks(utcNow())` |
| Days between two dates | `div(sub(ticks(variables('End')), ticks(variables('Start'))), 864000000000)` |

Time zone names are Windows IDs, e.g. `India Standard Time`, `GMT Standard Time`, `Pacific Standard Time`.

## Text

| What | Expression |
| --- | --- |
| Join text | `concat('Hello, ', triggerBody()?['name'])` |
| Upper / lower | `toUpper('abc')` · `toLower('ABC')` |
| Trim spaces | `trim(variables('Input'))` |
| Replace | `replace(variables('Input'), ' ', '-')` |
| Split into an array | `split('a;b;c', ';')` |
| First / last part | `first(split(variables('Email'), '@'))` · `last(split(variables('Email'), '@'))` |
| Substring | `substring('PowerAutomate', 0, 5)` → `Power` |
| Contains | `contains(variables('Subject'), 'urgent')` |
| Starts / ends with | `startsWith(...)` · `endsWith(...)` |
| Length | `length(variables('Input'))` |
| New line | `decodeUriComponent('%0A')` |

## Logic and null handling

| What | Expression |
| --- | --- |
| If / else | `if(equals(variables('Status'), 'Done'), 'Closed', 'Open')` |
| Fallback for null | `coalesce(triggerBody()?['manager'], 'Unassigned')` |
| Is empty (string, array, object) | `empty(body('Get_items')?['value'])` |
| And / or / not | `and(a, b)` · `or(a, b)` · `not(a)` |
| Greater / less | `greater(x, 10)` · `less(x, 10)` · `greaterOrEquals(...)` |

## Arrays

| What | Expression |
| --- | --- |
| Count items | `length(outputs('Get_items')?['body/value'])` |
| First / last item | `first(...)` · `last(...)` |
| Remove duplicates | `union(variables('List'), variables('List'))` |
| Items in both arrays | `intersection(variables('A'), variables('B'))` |
| Join into text | `join(variables('Names'), ', ')` |
| Take / skip | `take(variables('List'), 5)` · `skip(variables('List'), 5)` |
| Create an array | `createArray('a', 'b', 'c')` |

## Numbers and conversions

| What | Expression |
| --- | --- |
| Text to integer | `int('42')` |
| Text to decimal | `float('3.14')` |
| To text | `string(42)` |
| Format a number | `formatNumber(1234.5, '0,0.00')` |
| Maths | `add(1, 2)` · `sub(5, 3)` · `mul(2, 3)` · `div(10, 2)` · `mod(10, 3)` |
| Text to JSON | `json(variables('Raw'))` |
| Base64 | `base64('text')` · `base64ToString(...)` |

## Workflow information

| What | Expression |
| --- | --- |
| Run ID | `workflow()?['run']?['name']` |
| Link to the current run | `concat('https://make.powerautomate.com/environments/', workflow()?['tags']?['environmentName'], '/flows/', workflow()?['name'], '/runs/', workflow()?['run']?['name'])` |
| Result of a scope (for try/catch) | `result('Try')` |

---

*Tip: build complex expressions inside a Compose action first. You can see each step's output in the run history.*
