# Campus Lost & Found UX review

This review records the usability findings and changes made to the standalone demo. The demo is available at `http://localhost:5174/` while the development server is running.

## User goal

Help a student find a matching notice for a lost item, understand whether a found item is actually held at a campus collection point, and take the next step toward recovery. A second student should be able to report an item they found without uncertainty about what to do with it.

## Findings, alternatives, and chosen direction

### 1. “Apply” suggests filtering is pending when it is already live

**Evidence:** On the board, changing the search immediately changed “Latest notices” from 13 to 2, before Apply was clicked. Apply only displayed a “2 reports shown” message. This makes the filter model unclear and adds an unnecessary action.

**Alternatives considered:**

- Keep live filtering and remove Apply. This matches what the controls already do and gives immediate feedback, but may feel jumpy while a user is still entering a query.
- Make Apply commit draft filter values. This gives deliberate control and supports combining several filters before refreshing, but requires separate draft state and a clear indication of unapplied changes.
- Keep both live updates and Apply as a redundant confirmation. This preserves the present layout, but still leaves the button without a useful job.

**Implemented:** Kept live filtering, removed Apply, clarified that results update as filters change, and renamed Clear to “Clear filters.” The “Latest notices” count continues to update with the results.

**Why it hurts:** Users cannot tell whether their results are current, and may press Apply expecting it to change the results.

### 2. Duplicate prevention hides the actionable reason

**Evidence:** Submitting “Black backpack,” Lost, Accessories, at “Library - second floor” displayed only “Please review your entries.” It did not tell the user which existing notice caused the collision. The matching rule also did not account for the location marker shown on the card.

**Alternatives considered:**

- Show the validation message beside the title/location fields. This gives a direct correction path but needs careful placement when more than one field contributes to the duplicate match.
- Show a generic error and a list of all validation requirements. This is easy to implement but makes the user diagnose the collision themselves.
- Link the matching existing notice in the error. This helps the user decide whether to use or edit the existing report, but needs a useful presentation for a found/lost pair and may expose too much report detail if expanded later.

**Implemented:** Duplicate matching now normalizes case, spacing around hyphens/dashes, Unicode form, and the `⌖` marker copied from a card. On collision, the form identifies the existing title and location and tells the user to check the noticeboard. The existing same-title-and-location rule is preserved.

**Why it hurts:** The user is blocked without being told what collided or what to do next. The form’s validation is technically working, but the recovery path is not.

### 3. Found-item cards do not make recovery or handover steps clear

**Evidence:** Found cards showed either “Received at [collection point]” or “Reported found - not confirmed at a collection point.” The distinction was low-emphasis card copy and did not explain the recovery or handover step.

**Alternatives considered:**

- Add a prominent collection-point callout to each received card, with a short instruction to visit that desk and verify ownership. This is direct and does not need a new contact system, but lengthens cards.
- Add a full claim/contact workflow. This offers more direct coordination, but is substantially larger, changes product behavior, and is not supported by the current demo data or interface.
- Add a single general help panel on the page. This is compact but easy to miss when a user is focused on a particular item.

**Implemented:** Received found-items now say where to ask for recovery and that staff verify ownership. Reported-only items clarify that staff are not confirmed to be holding the item and tell the finder to hand it to a designated campus collection point. The two states remain distinct.

**Why it hurts:** A student can find a relevant notice but still not know where to go, whether the item is physically held, or how ownership is checked. A finder may assume reporting alone completes handover.

## AI suggestion refined

An initial AI direction was to replace the three Lost / Found / Claimed columns with one chronological feed. I rejected that as the primary redesign because it would weaken the existing status scan and make it harder to tell whether an item is still missing or has been found. I refined it into making the existing search behavior clear and preserving the status columns: searching “backpack” surfaces the Lost “Black backpack” and Found “Dark backpack” notices together in the results, each still labeled by status. This avoids a new match score or an unverified claim that the items are the same.

## Demonstration notes

- **Main action:** Search for “backpack.” The board immediately showed two relevant notices: Lost “Black backpack” and Found “Dark backpack,” including their different locations and the Campus Security Desk receipt note.
- **Unsuccessful action:** Attempted to publish “Black backpack” at “library-second floor.” The updated form rejected it and named the existing “Black backpack” report at “Library - second floor.” This checks capitalization and spacing around the hyphen.
- **Reset:** The duplicate was rejected without changing the data; the board still has the 13 example reports.

## Evidence and remaining implementation-stage deliverables

The updated board was inspected in the running browser at a desktop viewport. The production build completed successfully with `npm run build`. The successful search and the improved duplicate rejection were exercised in the browser. Save before/after screenshots at the same desktop viewport and a mobile view of the match and recovery guidance before submission. Report creation, editing only an owned report, and reset behavior were not retested in this implementation pass.
