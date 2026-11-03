// All session content lives here: stages, cases, games. Edit this file to change the exercise.
// Sample cases are fictional; the workshop structure follows the reference board in input/.

export const COLORS = ['yellow', 'orange', 'green', 'pink', 'purple', 'white'];

// Pilot-session visibility switches. ponytail: hide, don't delete — flip a value back to true/false to re-enable for a future session.
export const PILOT = {
  hideWarmup: true,          // warm-up game widgets/steps at the top of each tab
  hideSignalsArcade: true,   // the "Signals" and "Arcade" buttons in the stage toolbar
  hideDesignQuestions: true, // the "Design questions for the chosen use case" box in Prioritize
  hidePrioritize: true,      // the whole Prioritize stage (its use-case voting now lives on the Scenario tab)
  stepFocusStar: false,      // the ☆ star-to-focus control in the process overview box
  hideScenarioOptions: true, // the ready-made scenario options on the Scenario stage; the team builds one from its own board
  hideDeepDiveCanvas: true,  // the original Deep Dive & Prototype page (prompt canvas + build button); its duplicate shows only the build prompt, pre-filled from the earlier pages
};

// The same switches as people see them in the "Hidden" menu (top right). hides: the value that hides the piece.
export const PILOT_PIECES = [
  { key: 'hidePrioritize', hides: true, label: 'Prioritize stage', note: 'The whole stage. Its use-case voting also lives on the Scenario stage.' },
  { key: 'hideDeepDiveCanvas', hides: true, label: 'Original Deep Dive page', note: 'The page with the solution-prompt canvas and the build button. Showing it replaces the prompt-only Deep Dive page.' },
  { key: 'hideScenarioOptions', hides: true, label: 'Ready-made scenario options', note: 'On the Scenario stage: three example scenarios to start from, instead of only the one built from your board.' },
  { key: 'hideWarmup', hides: true, label: 'Warm-up games', note: 'The warm-up game and its step at the top of a stage.' },
  { key: 'hideSignalsArcade', hides: true, label: 'Signals and Arcade buttons', note: 'In this top bar: the six signals and the games.' },
  { key: 'hideDesignQuestions', hides: true, label: 'Design questions box', note: 'On the Prioritize stage: nine questions about the chosen use case. They are always under the coach on the Scenario stage.' },
  { key: 'stepFocusStar', hides: false, label: 'Focus star on process steps', note: 'On Today\'s Reality: the ☆ to pick one step as the focus.' },
];

// Breakout format shown next to each stage's explanation. Keyed by stage id (deepDive id is 'deep').
export const BREAKOUT = {
  today: 'Groups', jobs: 'Groups', dream: 'Groups', scenario: 'Pairs', prioritize: 'Groups', deep: 'Pairs', deepProto: 'Pairs', present: 'Groups',
  spot: 'Pairs', rethink: 'Pairs',
  why: 'Plenary', hunt: 'Individual', probe: 'Pairs', card: 'Individual', tell: 'Individual',
};

export const SIGNALS = [
  { n: 1, name: 'A goal without a how', listen: '"We have to show that…, but nobody says how"', ask: 'Who has decided how you\'ll meet this?' },
  { n: 2, name: 'Lots of measuring, no single answer', listen: '"It depends which report you look at"', ask: 'How many systems does it take to answer this one question?' },
  { n: 3, name: 'People joining things up by hand', listen: '"Every Monday we pull this together in Excel"', ask: 'Who builds this overview, and how long does it take?' },
  { n: 4, name: 'An outcome nobody can steer', listen: '"Most people just take the default"', ask: 'What happens to the people who don\'t act?' },
  { n: 5, name: 'Volume must grow, headcount can\'t', listen: '"We\'re not moving fast enough"', ask: 'What breaks if volume doubles?' },
  { n: 6, name: 'Peers are moving, or leaders ask a 10-year question', listen: '"Competitor X already does this"', ask: 'Who in your sector already has this?' },
];

export const BLUEPRINT = ['What should it deliver?', 'What does the human do, what does AI do?', 'What must be in place to trust it?'];

// quotes: q = what the client says, s = the signal(s) it shows ([] = a fact with no signal).
// probe: the client's secret brief for Round P (opening line, then answers to who / how long / which systems / what if volume grows / who owns it).
const C = (id, name, sub, brief, steps, quotes, probe) => ({ id, name, sub, brief, steps, quotes: quotes.map(([q, ...s]) => ({ q, s })), probe: probe && { open: probe[0], who: probe[1], time: probe[2], sys: probe[3], vol: probe[4], owner: probe[5] } });

// AI Foundry briefs: steps as [name, owner, tools, where it slows]; quote = [client quote, ...signals]; scenarios as [title, tagline, steps, opportunity, value] with steps [name, does, agent, human].
const T = (does) => ['Trigger', does, 'Intake agent', null];
const W = (does) => ['Watch', does, 'Monitoring agent', null];
const END = (does = 'Outcome confirmed, audit trail stored') => ['Finish', does, null, null];
const F = (id, name, sub, who, role, brief, steps, quote, goal, tension, fun, scenarios) => ({
  ...C(id, name, sub, `${brief} Your client is ${who}, ${role}. Their goal: ${goal}`,
    steps.map(([n, owner, tools, slow]) => ({ name: n, desc: `${owner} · ${tools} · where it slows: ${slow}` })),
    [quote, ...tension.map((x) => [x]), ...fun.map((x) => [x])]),
  scenarios: scenarios.map(([title, tagline, st, opportunity, value]) => ({ title, tagline, steps: st.map(([n, does, agent, human]) => ({ name: n, does, agent, human })), opportunity, value })),
});
export const CASES = [
  C('orders', 'Order changes', 'Order-to-cash', 'A manufacturer of complex equipment takes large, configurable orders. After an order is entered it keeps changing: dates, configuration, terms. Every change ripples into fulfilment, billing and revenue recognition.',
    ['Customer request / quote', 'Purchase order received', 'Approval & exception handling', 'Order validation', 'Order entry', 'Fulfilment coordination', 'Completion & handover to invoicing', 'After: changes post-invoice'],
    [['We hear about a lot of changes too late. If we knew earlier, the impact would be much smaller.', 4], ['There is too much to remember when you create an order; the system has no boundaries for humans.', 3], ['An overview of monthly changes is semi-available. The controls exist, but nobody actively monitors them.', 2, 4], ['Customer-specific peaks hit one team at a time, and colleagues cannot easily step in.', 5], ['Orders are confirmed to the customer by e-mail.']],
    ['Honestly, orders keep changing after we have entered them.', 'The order desk re-enters each change by hand, and finance corrects afterwards.', 'A change takes about forty minutes to work through, and we see hundreds a month.', 'Three: the order system, the CRM and a shared mailbox.', 'Then the peaks break us. One customer team is already at its limit.', 'The head of customer operations. She has to report on it this quarter.']),
  C('billing', 'Billing & invoicing', 'Order-to-cash', 'A B2B company issues several invoice types (systems, upgrades, service, vendor). Before an invoice goes out, a small team compares order data with documents by hand, and redoes the check whenever something changes.',
    ['Billing trigger received', 'Invoice preparation', 'Invoice creation', 'Invoice delivery', 'Acceptance & dispute management', 'Handover to collections'],
    [['Creating and posting one invoice takes 30 to 45 minutes of manual work.', 3], ['The information is not always available, clear and up to date for every type of invoice.', 2], ['When something is changed, we redo the whole pre-check.', 3], ['We invoice four types and volumes rise each year, with the same three people.', 5], ['Invoices are sent by e-mail as a PDF.']],
    ['When something changes, we start the pre-check all over again.', 'Three people compare the order with the documents, line by line.', 'Thirty to forty-five minutes per invoice.', 'The ERP, an Excel checklist and an internal mailbox.', 'We would not get the invoices out before month-end.', 'The billing manager. Customers have started rejecting invoices, so it is urgent.']),
  C('cash', 'Cash application & collections', 'Order-to-cash', 'Payments arrive daily and must be matched to open invoices. Remittance advice is searched for by hand, disputes are not registered consistently, and follow-up on overdue invoices is not prioritised.',
    ['Customer payment due', 'Collections & follow-up', 'Dispute management', 'Cash receipt & application', 'Clearing / case closure', 'Reporting'],
    [['It is all manual, and there is no prioritisation of who we chase first.', 4], ['A missing match means we have to call. We spend the time searching for remittances.', 3], ['Disputes are not registered, so we have no insight into why customers pay late.', 2], ['The monthly reconciliation is done by hand, in ledgers.', 3], ['Bank statements are loaded every morning.']],
    ['We spend our days searching for which payment belongs to which invoice.', 'Four analysts match payments by hand and phone customers when it does not fit.', 'Several hundred receipts a day, and a missing match can take half an hour.', 'The bank portal, the ERP and customer e-mails.', 'Unapplied cash piles up and collections chases the wrong customers.', 'The credit manager. The overdue balance is on the CFO\'s agenda.']),
  C('p2p', 'Purchase-to-pay', 'Finance operations', 'A shared service centre processes supplier invoices for several business units. Many invoices arrive without a reference, and nobody has a full view of spend outside contracts.',
    ['Purchase request', 'Approval', 'Purchase order', 'Goods receipt', 'Invoice matching', 'Payment'],
    [['Half of the invoices arrive without a purchase order number, so someone has to find the buyer.', 3], ['We do not know how much we spend outside contracts.', 2], ['Invoice volume grew by a third; the team did not.', 5], ['Payment runs are on Tuesdays and Thursdays.']],
    ['Half of what comes in, we first have to work out who ordered it.', 'Six accounts-payable clerks, chasing buyers by e-mail.', 'On average nine days from receipt to approval.', 'The purchasing tool, the ERP and a scanning mailbox.', 'We would pay late and lose the early-payment discounts.', 'The head of the shared service centre. Suppliers are complaining to the board.']),
  C('close', 'Month-end close', 'Record-to-report', 'A group with several entities closes its books every month. Intercompany differences, manual journals and different charts of accounts make the close long and the numbers hard to explain.',
    ['Sub-ledger close', 'Accruals & journals', 'Intercompany reconciliation', 'Consolidation', 'Variance analysis', 'Management report'],
    [['Intercompany differences are chased by e-mail every single month.', 3], ['The group wants a five-day close; nobody has said what we stop doing.', 1], ['Three entities, three charts of accounts; the same margin comes out differently.', 2], ['The close calendar is shared on the first working day.']],
    ['Month-end is ten days of chasing each other.', 'Each entity controller, plus two people at group who reconcile by hand.', 'Ten working days. The target is five.', 'Three ERPs and one consolidation tool, glued together with spreadsheets.', 'Two acquisitions are coming. With this process we cannot absorb them.', 'The group controller. The CFO promised the board a faster close this year.']),
  C('reporting', 'Management reporting', 'Public sector', 'A public organisation must show its board and supervisor that programmes deliver results. Each month controllers collect figures from several systems, explain variances and build the steering report.',
    ['Collect figures', 'Consolidate & reconcile', 'Explain variances', 'Report to the board'],
    [['We have to show the programme is effective, but nobody has said how.', 1], ['It depends which report you look at; the numbers never quite agree.', 2], ['Every month two controllers pull this together in Excel.', 3], ['Next year we report on twice as many programmes with the same team.', 5], ['The board meets on the last Thursday of the month.']],
    ['Honestly? Every month-end we are chasing numbers until the last evening.', 'Two controllers build it, mostly by hand in Excel.', 'About six working days, every single month.', 'Four systems, and they rarely agree with each other.', 'If volume doubles we miss the deadline. No extra headcount is coming.', 'The finance director owns it. She wants it fixed before the next budget cycle.']),
  C('grants', 'Grants & subsidies', 'Public sector', 'A ministry agency awards and settles grants. A new scheme doubled the applications, the effectiveness requirement is undefined, and final accountability often never arrives.',
    ['Application received', 'Completeness check', 'Eligibility assessment', 'Decision', 'Payment', 'Accountability & settlement'],
    [['The law says the grant must be "effective"; no one has defined what that means.', 1], ['Applications doubled after the new scheme; the assessors did not.', 5], ['Most applicants never submit the final accountability, and nothing happens.', 4], ['Assessors copy data from the PDF form into the case system.', 3], ['Decisions are sent by post and through the portal.']],
    ['Since the new scheme, we are drowning in applications.', 'Twelve assessors, and they re-type every application form.', 'Thirteen weeks on average; the legal term is eight.', 'The application portal, the case system and the finance system.', 'It already doubled. The backlog grows every week.', 'The director of implementation. Parliament has asked questions about the delays.']),
  C('permits', 'Permits & licences', 'Public sector', 'A municipality handles permit applications that need advice from several departments. Deadlines are statutory, and each department keeps its own files.',
    ['Intake', 'Completeness check', 'Substantive review', 'Advice from other departments', 'Decision', 'Objection handling'],
    [['The statutory deadline is eight weeks; we find out we missed it afterwards.', 4], ['Each department keeps its advice in its own system.', 2], ['Neighbouring municipalities already offer a digital pre-check.', 6], ['The front desk is open on weekdays.']],
    ['We usually find out a permit is late when the applicant calls.', 'Case handlers collect the advice from each department by e-mail.', 'Eleven weeks on average, against a term of eight.', 'Five: every department has its own.', 'The housing programme will bring far more applications. We cannot keep up now.', 'The head of licensing. The alderman reports on lead times to the council.']),
  C('audit', 'Audit evidence requests', 'Assurance', 'An audit team requests evidence from the client through a request list. Items come back incomplete, status lives in a tracker, and scope grows faster than the team.',
    ['Request list issued', 'Client collects evidence', 'Evidence received & checked', 'Follow-up questions', 'Testing', 'Conclusion documented'],
    [['We send the same request list three times before it is complete.', 3], ['Nobody can say which requests are overdue without opening the tracker line by line.', 2, 4], ['More entities are in scope this year, with the same team.', 5], ['Fieldwork starts in the second week of January.']],
    ['Every year we lose the first weeks to chasing documents.', 'Two people on our side gather everything from the business, by e-mail.', 'About three weeks before the list is complete.', 'The tracker, e-mail and three source systems.', 'Four more entities are in scope next year. That will not fit.', 'The financial controller. The audit committee wants an earlier sign-off.']),
  C('onboard', 'Hire to onboard', 'People', 'A fast-growing organisation hires hundreds of people a year. Getting a new starter ready takes many requests to many teams, and problems only surface on day one.',
    ['Vacancy approved', 'Recruitment', 'Contract', 'Pre-boarding', 'Day-one setup', 'Probation review'],
    [['A new starter needs eleven requests to nine teams, all by e-mail.', 3], ['We must grow by two hundred people next year with the same HR team.', 5], ['Some people have no laptop on day one, and we only hear it from them.', 4], ['New starters begin on the first Monday of the month.']],
    ['A new colleague without a laptop on day one: it still happens every month.', 'HR advisers send the requests one by one to IT, facilities and payroll.', 'About four hours of coordination per new starter.', 'The HR system, the IT ticket tool and a lot of e-mail.', 'Two hundred hires next year. That is double.', 'The HR director. The growth plan depends on it.']),
  C('service', 'Customer service & complaints', 'Customer', 'A service organisation answers questions and complaints across channels. Agents search several screens for one answer, and nobody sees whether root causes are fixed.',
    ['Contact received', 'Classification', 'Investigation', 'Resolution', 'Reply to customer', 'Root-cause feedback'],
    [['Agents look in five screens to answer one question.', 2, 3], ['The board asked where our service will be in 2035.', 6], ['Complaints get closed, but we never see whether the cause is fixed.', 4], ['The contact centre is open until eight in the evening.']],
    ['Our agents spend more time searching than talking to the customer.', 'About sixty agents; the senior ones know where to look.', 'Twelve minutes per contact, most of it searching.', 'Five screens: CRM, billing, orders, knowledge base and e-mail.', 'Peak season means queues of forty minutes.', 'The customer service director. Satisfaction is a board KPI this year.']),
  C('claims', 'Claims handling', 'Insurance', 'An insurer handles claims from notification to settlement. Stuck claims are found by hand, the regulator asks for proof of fair outcomes, and competitors are speeding up.',
    ['Claim notification', 'Coverage check', 'Assessment', 'Fraud check', 'Settlement', 'Recovery'],
    [['Every Monday we pull numbers from three systems to see which claims are stuck.', 2, 3], ['The regulator wants proof of fair outcomes, but has not said how.', 1], ['A competitor now settles simple claims the same day.', 6], ['Claims can be reported by phone or online.']],
    ['Every Monday starts with finding out which claims are stuck.', 'A team lead and two analysts build the list by hand.', 'Half a day every week, and simple claims still take nine days.', 'Three: the policy system, the claims system and the payment system.', 'A storm doubles the volume overnight. Then everything waits.', 'The claims director. The regulator visits in the autumn.']),
  // AI Foundry client briefs: playful, fictional clients. Steps carry owner · tools · where it slows; each case has its own ready-made reimagined scenarios.
  F('dragon', 'The Royal Dragon Insurance Company', 'Claims & fraud', 'Beatrice Emberton', 'Chief Claims Officer',
    'Improve the claims journey so genuine dragon-damage claims are settled quickly, damage estimates are reliable and suspicious cases receive proportionate review. Villagers need timely help, the ombuds-dragon needs clear reasons, and claimants need a fair appeal route. Owning matches is not grounds for rejection.',
    [['Notify', 'Claimant', 'Portal, parchment scan', 'Missing incident details'], ['Validate cover', 'Intake clerk', 'Policy system', 'Ancient endorsements'], ['Assess evidence', 'Dragon surveyor', 'Photos, site visit', 'Heat destroys evidence'], ['Estimate loss', 'Loss adjuster', 'Rate book, spreadsheet', 'Rare materials lack prices'], ['Fraud review', 'Investigator', 'Rules, case history', 'False positives'], ['Decide & pay', 'Claims manager', 'Claims platform', 'Appeals restart work']],
    ['I want genuine claims settled before the next dragon arrives. I do not want every claimant treated as a medieval fraudster.', 1], 'Settle genuine dragon-damage claims in 48 hours while reducing avoidable leakage and preserving a fair appeal route.',
    ['Judgement: accidental blaze or staged scorching?', 'Constraint: reasons must be legible to claimant and regulator.', 'Exception: phoenix-related damage looks fraudulent but is cyclical.'],
    ['Claim DR-884: barn scorched in a perfect circle', 'Policy note: "dragons excluded unless domesticated"', 'Complaint: assessor classified a salamander as a dragon'],
    [['Royal Dragon: genuine claims in 48 hours', 'Agents assemble each claim; people decide only the hard ones.', [T('A villager reports dragon damage'), ['Guided notification', 'A guided form and photo capture ask for exactly the missing incident details.', 'Notification agent', null], ['Cover check', 'Reads the policy and ancient endorsements and explains what is covered.', 'Cover agent', null], ['Evidence & estimate', 'Builds the evidence pack and prices rare materials from a living rate book.', 'Loss estimate agent', 'Surveyor visits only when heat destroyed the evidence'], ['Proportionate review', 'Scores risk with reasons; phoenix damage is recognised as cyclical, not suspicious.', 'Fraud triage agent', 'Investigator reviews flagged cases only'], ['Decide & pay', 'Genuine claims are paid within 48 hours, with reasons the claimant can read.', 'Payment agent', 'Claims manager approves'], END('Outcome, reasons and appeal route stored for the ombuds-dragon')],
      'Missing incident details, ancient endorsements and false fraud positives slow every genuine claim.', 'Genuine claims settled in 48 hours, less leakage, and reasons the ombuds-dragon can follow.'],
     ['Royal Dragon: fair-by-design fraud review', 'Suspicion is proportionate, explained and appealable.', [T('A claim is flagged by rules or history'), ['Explain the flag', 'Turns each rule hit into a plain-language reason; owning matches is never a reason.', 'Reasoning agent', null], ['Check known exceptions', 'Compares phoenix cycles, salamanders and perfect-circle scorches with past cases.', 'Pattern agent', null], ['Proportionate review', 'Low-risk flags are cleared; the rest get one targeted question, not a full investigation.', 'Triage agent', 'Investigator decides'], ['Appeal route', 'The claimant sees the reasons and can contest them in one step.', 'Appeal agent', 'Independent reviewer'], END()],
      'False positives treat honest villagers as medieval fraudsters and restart work on appeal.', 'Fewer wrongful delays, legible reasons for the regulator and a fair appeal route.'],
     ['Royal Dragon: help before the claims arrive', 'Help reaches the village before the paperwork does.', [W('Monitors dragon sightings and fires for affected villages.'), ['Pre-notify', 'Invites likely affected policyholders to report, with a pre-filled form.', 'Outreach agent', null], ['Batch survey', 'Plans one surveyor route per village instead of one visit per claim.', 'Route agent', 'Surveyor visits'], ['Fast-track', 'Clear, low-value claims are paid on a simple estimate.', 'Payment agent', null], ['Control tower', 'One view of the event: claims in, paid, waiting and disputed.', null, 'Claims manager steers'], END()],
      'Claims arrive in a wave after each attack, and evidence burns before the surveyor arrives.', 'Villagers get timely help and surveyors spend their time where it counts.']]),
  F('socks', 'Department of Lost Socks', 'Public case management', 'Milo Pindle', 'Director-General of Textile Reunification',
    'Improve sock reunification from the first report to the final return. Clear the backlog, reduce duplicate records and wrong matches, and make the reunification KPI defensible. Citizens need their own socks sent to their current address, without exposing personal data or giving expensive argyle preferential treatment.',
    [['Report loss', 'Citizen', 'Web form, phone', 'Vague descriptions'], ['Register find', 'Depot officer', 'Case system', 'Duplicate records'], ['Classify sock', 'Textile analyst', 'Image tool, taxonomy', 'Patterns defy taxonomy'], ['Propose match', 'Caseworker', 'Search, spreadsheet', 'Low-quality photos'], ['Verify owner', 'Citizen & clerk', 'Questions, receipt', 'No proof for old socks'], ['Return & close', 'Mailroom', 'Postal system', 'Address changes']],
    ['I need a national single-sock view, preferably before the minister discovers pairs are being counted twice.', 2], 'Match lost socks to citizens, clear the backlog and publish a defensible reunification KPI by Friday.',
    ['Judgement: when is a match good enough to contact both parties?', 'Constraint: personal data cannot become a public sock register.', 'Exception: ceremonial socks are intentionally non-matching.'],
    ['Blue sock, one rocket, smell "neutral"', '17 reports from the same hotel laundry', 'Complaint: returned sock was emotionally similar but physically wrong'],
    [['Lost Socks: one national sock view', 'Every report and every find in one de-duplicated register.', [T('A citizen reports a lost sock'), ['Describe the sock', 'Guides the citizen from "blue, one rocket" to a structured description and photo.', 'Description agent', null], ['De-duplicate finds', 'Merges duplicate depot records, such as 17 reports from one hotel laundry.', 'Record agent', null], ['Classify', 'Places the pattern in the taxonomy and learns new ones.', 'Classification agent', 'Analyst handles new patterns'], ['Propose match', 'Ranks candidate matches with a confidence and the reason.', 'Matching agent', 'Caseworker contacts both parties'], ['Verify & return', 'Asks proportionate ownership questions and posts to the current address.', 'Return agent', 'Clerk verifies doubts'], END('Pair reunited and counted once')],
      'Duplicate records and vague descriptions make pairs count twice and matches go wrong.', 'A defensible reunification KPI by Friday, and fewer emotionally similar but physically wrong returns.'],
     ['Lost Socks: confident matches only', 'People contact citizens only when the match is good enough.', [T('A new find is registered'), ['Photo check', 'Asks for a better photo when quality is too low to match.', 'Photo agent', null], ['Score the match', 'Combines pattern, size, place and date into one score.', 'Matching agent', null], ['Threshold', 'Above the bar: contact both parties. Below it: keep searching.', 'Triage agent', 'Caseworker sets the bar'], ['Ceremonial exception', 'Intentionally non-matching ceremonial socks go to a specialist.', null, 'Textile analyst decides'], END()],
      'Low-quality photos and gut-feel matching cause wrong returns and complaints.', 'Fewer wrong matches, a clear rule for when to contact, and less wasted postage.'],
     ['Lost Socks: privacy-safe reunification', 'Match the socks, never publish the people.', [T('A report or find arrives'), ['Separate identity', 'Keeps personal data apart from the sock register.', 'Privacy agent', null], ['Match on the sock', 'Matches on sock features only; argyle gets no priority.', 'Matching agent', null], ['Verify owner', 'Asks questions only the owner can answer; no receipt needed for old socks.', 'Verification agent', 'Clerk resolves doubts'], ['Return', 'Checks the current address before posting.', 'Return agent', null], ['Publish the KPI', 'Reports reunifications without personal data.', null, 'Director-General signs off'], END()],
      'Personal data risks turning into a public sock register.', 'Citizens trust the service and the minister gets a number that holds.']]),
  F('haunted', 'Haunted Property Lettings Ltd', 'Matching & onboarding', 'Saira Graves', 'Managing Director',
    'Improve the lettings journey so tenants, properties and resident ghosts are compatible and all disclosure, consent and safety checks are completed before move-in. Reduce unsuitable matches, unread disclosures and avoidable complaints. Occupancy alone is not success if nobody sleeps; both tenants and ghosts need informed consent.',
    [['List property', 'Landlord', 'CRM, survey', 'Ghost omitted'], ['Profile haunting', 'Medium assessor', 'Interview, checklist', 'Ghosts change behaviour'], ['Register tenant', 'Lettings agent', 'Portal, ID check', 'Preferences euphemistic'], ['Recommend match', 'Agent', 'CRM, spreadsheet', 'Compatibility subjective'], ['Disclose & consent', 'Compliance officer', 'Disclosure pack', 'Long unread documents'], ['Move in & review', 'Manager', 'Tickets, inspections', 'Nocturnal complaints']],
    ['I want tenants to find the perfect home. The perfect home may whisper at night, but it must disclose that upfront.', 1], 'Match tenants, properties and resident ghosts while completing disclosure, consent and safety checks before move-in.',
    ['Judgement: is "occasional wailing" a feature or a material defect?', 'Constraint: ghosts and tenants both require informed consent.', 'Exception: hauntings intensify on anniversaries.'],
    ['Flat 4B: excellent light, corridor loops after midnight', 'Tenant asks for "quiet ghost, no chains"', 'Complaint: apparition entered kitchen without notice'],
    [['Haunted Lettings: honest match-making', 'Tenants, homes and ghosts matched on what actually matters.', [T('A landlord lists a property'), ['Ghost disclosure', 'Asks the landlord about resident ghosts before the listing goes live.', 'Listing agent', 'Landlord confirms'], ['Haunting profile', "Turns the medium's interview into a behaviour profile, anniversaries included.", 'Profiling agent', 'Medium assessor validates'], ['Tenant preferences', 'Translates euphemisms like "quiet ghost, no chains" into clear criteria.', 'Preference agent', null], ['Recommend match', 'Scores compatibility for tenant and ghost, and explains it.', 'Matching agent', 'Lettings agent recommends'], ['Move-in check', 'Follows up after the first nights and spots nocturnal complaints early.', 'Aftercare agent', 'Manager reviews'], END()],
      'Ghosts left out of listings and subjective compatibility lead to sleepless tenants.', 'Fewer unsuitable matches and complaints; homes where people actually sleep.'],
     ['Haunted Lettings: consent that is read', 'Short, personal disclosures that tenant and ghost both understand.', [T('A match is accepted'), ['Personal disclosure', 'Turns the long pack into one page about this home and this ghost.', 'Disclosure agent', null], ['Questions answered', "Answers the tenant's questions and logs them.", 'Q&A agent', null], ['Ghost consent', "Records the resident ghost's informed consent.", null, 'Medium records consent'], ['Compliance check', 'Checks every disclosure and consent is complete before the keys are released.', 'Compliance agent', 'Compliance officer approves'], END()],
      'Long disclosure packs go unread and ghosts are never asked.', 'Informed consent on both sides and fewer "apparition in the kitchen" complaints.'],
     ['Haunted Lettings: anniversary early warning', 'Predict the haunting before the tenant does.', [W('Tracks haunting anniversaries and behaviour changes per property.'), ['Warn the tenant', 'Gives tenants notice of intense nights, with practical tips.', 'Notice agent', null], ['Log incidents', 'Links nocturnal complaints to the haunting profile.', 'Ticket agent', null], ['Review the match', 'Flags matches that no longer work and proposes options.', 'Matching agent', 'Manager decides'], ['Regulator view', 'One record for the housing inspector.', null, 'Manager reports'], END()],
      'Hauntings intensify on anniversaries and nobody sees it coming.', 'Fewer surprises for tenants and a clean record for the regulator.']]),
  F('customs', 'Interplanetary Customs & Excise', 'Trade compliance', 'Commander Lio Vega', 'Commissioner of Planetary Clearance',
    'Improve customs clearance so low-risk cargo moves quickly and prohibited, dangerous or ambiguous consignments receive appropriate attention. Reduce document queries, translation delays and avoidable inspections without compromising biosecurity. Decisions must be traceable across planetary laws, and sentient goods must retain representation and appeal rights, even when cargo changes biological state in transit.',
    [['Declare cargo', 'Importer', 'Trade portal', 'Alien descriptions'], ['Validate documents', 'Clearance officer', 'Registry, translator', 'Conflicting laws'], ['Score risk', 'Risk analyst', 'Rules, watchlists', 'Sparse route history'], ['Query importer', 'Officer', 'Secure messaging', 'Time-zone delays'], ['Inspect', 'Biosecurity team', 'Scanner, lab', 'Living cargo moves'], ['Release or hold', 'Duty manager', 'Customs platform', 'Appeals at dock']],
    ['I want frictionless trade. I also want the container that is breathing to receive slightly more friction.', 1], 'Clear low-risk cargo quickly while identifying prohibited, dangerous or legally self-representing consignments.',
    ['Judgement: harmless organism, invasive species or passenger?', 'Constraint: sentient goods have representation and appeal rights.', 'Exception: cargo changes biological state in transit.'],
    ['Crate 71: "legal counsel", consumes sunlight', 'Invoice unit: three moons, currency unspecified', 'Alert: importer declared 900 litres of silence'],
    [['Interplanetary Customs: green lane for low risk', 'Low-risk cargo clears itself; officers focus on what breathes.', [T('A declaration arrives'), ['Understand the declaration', 'Translates alien descriptions and units like "three moons" into standard terms.', 'Translation agent', null], ['Validate documents', 'Checks documents against the laws of every planet on the route and lists conflicts.', 'Legal check agent', null], ['Score risk', 'Scores risk with reasons, even on sparse route history.', 'Risk agent', null], ['Green lane', 'Low-risk cargo is released automatically with a full trace.', 'Release agent', null], ['Targeted inspection', 'High-risk or living cargo goes to biosecurity with a briefing.', 'Inspection agent', 'Biosecurity team inspects'], END('Release or hold recorded with reasons')],
      'Translation delays, conflicting laws and avoidable inspections slow all trade.', 'Frictionless trade for low-risk cargo, and more friction for the container that breathes.'],
     ['Interplanetary Customs: sentient-goods rights', 'Every possibly sentient consignment gets representation and appeal.', [T('Cargo shows signs of sentience'), ['Classify status', 'Assesses harmless organism, invasive species or passenger, with reasons.', 'Classification agent', null], ['Assign representation', 'Notifies an advocate and records it in the case.', 'Case agent', 'Advocate represents'], ['Decide', 'Presents evidence and options to the duty manager.', 'Decision support agent', 'Duty manager decides'], ['Appeal', 'Opens an appeal before the cargo leaves the dock.', 'Appeal agent', 'Magistrate hears appeals'], END()],
      'Sentient goods are treated as cargo and appeals happen at the dock.', 'Traceable decisions that respect representation and appeal rights.'],
     ['Interplanetary Customs: queries without waiting', 'Questions answered across time zones without stopping the queue.', [T('A document gap is found'), ['Draft the query', "Writes one precise question per gap, in the importer's language.", 'Query agent', null], ['Follow up', 'Chases answers across time zones and updates the file.', 'Follow-up agent', null], ['Track state changes', 'Watches cargo that changes biological state in transit and updates the risk.', 'Monitoring agent', null], ['Officer review', 'The officer sees the complete file and decides.', null, 'Clearance officer decides'], END()],
      'Queries wait days for replies while cargo changes state in the hold.', 'Fewer document queries, faster clearance and no surprises in the hold.']]),
  F('northpole', 'North Pole Logistics BV', 'Eligibility & appeals', 'Ingrid Frost', 'Chief Ethics & Eligibility Officer',
    'Improve naughty-or-nice eligibility decisions so families receive consistent outcomes, clear reasons and a meaningful review before the annual dispatch freeze. Reduce missing context, identity errors and late appeals. Decisions must account for cultural variation and ordinary childhood mischief while minimising children\'s data; surveillance must not become the product.',
    [['Receive signals', 'Regional office', 'Reports, letters', 'Biased reporting'], ['Verify identity', 'Elf clerk', 'Household registry', 'Shared names'], ['Review conduct', 'Eligibility analyst', 'Case file', 'Context missing'], ['Propose category', 'Decision support', 'Rules, scoring', 'Threshold disputes'], ['Human decision', 'Senior elf', 'Review screen', 'Peak workload'], ['Appeal & dispatch', 'Appeals team', 'Portal, logistics', 'Late evidence']],
    ['I want consistent decisions. "An elf had a feeling" is not an auditable control, however charming the elf.', 2], 'Modernise naughty-or-nice eligibility decisions, provide reasons and handle appeals before the annual dispatch freeze.',
    ['Judgement: one serious incident or a year of ordinary kindness?', 'Constraint: minimise data about children and explain every outcome.', 'Exception: siblings deliberately swap identities.'],
    ['Case N-122: returned wallet, stole biscuit', 'Appeal: "the cat submitted the report"', 'Regional note: sarcasm misclassified as hostility'],
    [['North Pole: explainable eligibility', 'Consistent categories, with reasons a family can read.', [T('Signals arrive from regional offices'), ['Filter bias', 'Flags biased or misread reports, such as sarcasm, before they count.', 'Signal quality agent', null], ['Verify identity', 'Resolves shared names and swapped siblings against the household registry.', 'Identity agent', 'Elf clerk confirms doubts'], ['Weigh the year', 'Balances one serious incident against a year of ordinary kindness, in context.', 'Conduct agent', null], ['Propose category', 'Proposes a category with the reasons and the threshold.', 'Decision support agent', null], ['Human decision', 'A senior elf decides and the reasons are recorded.', null, 'Senior elf decides'], END('Reasons shared with the family')],
      '"An elf had a feeling" is not an auditable control, and context goes missing.', 'Consistent decisions, clear reasons and fewer late appeals.'],
     ['North Pole: appeals before the freeze', 'Every family gets a meaningful review before dispatch.', [T('A decision is shared with a family'), ['Explain the outcome', 'Sends a child-friendly explanation and how to appeal.', 'Explanation agent', null], ['Collect evidence', 'Gathers late evidence in a structured way ("the cat submitted the report").', 'Evidence agent', null], ['Prioritise appeals', 'Orders appeals by dispatch deadline.', 'Triage agent', null], ['Review', 'The appeals team reviews with the full file.', null, 'Appeals team decides'], ['Dispatch', 'Updates logistics in time for the freeze.', 'Logistics agent', null], END()],
      'Late evidence and peak workload make appeals miss the dispatch freeze.', 'Every family gets a fair review, on time.'],
     ['North Pole: minimal data by design', "Decide well with as little data about children as possible.", [T('A signal is received'), ['Minimise', 'Keeps only what the decision needs and deletes the rest.', 'Privacy agent', null], ['Cultural context', 'Adds regional context so ordinary mischief is not misread.', 'Context agent', null], ['Category & check', 'Proposes a category; a second elf checks a sample.', 'Decision support agent', 'Evidence gatekeeper samples'], ['Audit', 'Reports outcomes per region for the child-rights inspector.', 'Reporting agent', 'Ethics officer reviews'], END()],
      'Surveillance risks becoming the product.', "Fair outcomes with minimal children's data, and an audit the inspector accepts."]]),
  F('timetravel', 'Time Travel Tours', 'Risk assessment & approval', 'Dr Felix Now', 'Director of Temporal Operations',
    'Improve trip approval and booking so safe journeys are approved promptly and high-impact timeline risks receive a clear human decision. Reduce ambiguous dates, duplicate customers and ignored warnings. Travellers need understandable reasons and safer alternatives when a trip cannot proceed. No booking may create an unreviewable identity paradox.',
    [['Choose era', 'Traveller', 'Booking site', 'Dates ambiguous'], ['Build itinerary', 'Travel designer', 'Catalogue', 'Events move'], ['Screen traveller', 'Risk officer', 'ID, history', 'Future records exist'], ['Model interactions', 'Temporal analyst', 'Timeline engine', 'Cascading effects'], ['Approve & brief', 'Duty director', 'Case portal', 'Warnings ignored'], ['Monitor return', 'Chronology desk', 'Beacon, incident log', 'Traveller returns early']],
    ['I want booking to be simple, provided the holiday does not prevent the invention of holidays.', 1], 'Approve safe, profitable trips quickly while preventing paradox, historical contamination and duplicate customers.',
    ['Judgement: acceptable cultural contact or timeline interference?', 'Constraint: no trip may create an unreviewable identity paradox.', 'Exception: travellers meet earlier versions of their guide.'],
    ['Request: "Renaissance, avoid plague, meet accountant"', 'Alert: traveller is own emergency contact', 'Complaint filed three days before the trip was booked'],
    [['Time Travel Tours: safe trips approved fast', 'Low-impact trips approved in minutes; paradox risks get a human.', [T('A traveller requests a trip'), ['Clarify dates', 'Turns "Renaissance, avoid plague" into exact dates and places.', 'Itinerary agent', null], ['Screen the traveller', 'Checks identity and future records, and spots duplicate customers.', 'Screening agent', null], ['Model the impact', 'Runs the timeline engine and summarises cascading effects.', 'Timeline agent', null], ['Fast approval', 'Low-impact trips are approved automatically, with a briefing.', 'Approval agent', null], ['Director review', 'High-impact trips get a clear decision, with safer alternatives.', null, 'Duty director decides'], END()],
      'Ambiguous dates, duplicate customers and ignored warnings.', 'Faster bookings, no unreviewable paradoxes, and clear reasons when a trip cannot go.'],
     ['Time Travel Tours: always a safer alternative', 'Never just "no": always a safer trip to choose.', [T('A trip is flagged as high-risk'), ['Explain the risk', 'Explains in plain words why the trip is risky.', 'Explanation agent', null], ['Offer alternatives', 'Proposes nearby eras or itineraries with lower impact.', 'Alternatives agent', null], ['Choose', 'The traveller picks an alternative or asks for a review.', null, 'Traveller chooses'], ['Approve & brief', 'A briefing the traveller actually reads, with checkpoints.', 'Briefing agent', 'Duty director approves'], END()],
      'Refusals frustrate travellers and warnings are ignored.', 'Happier travellers and fewer timeline incidents.'],
     ['Time Travel Tours: watch every return', 'Watch the beacon, not the calendar.', [W('Monitors traveller beacons and the incident log in real time.'), ['Detect anomalies', 'Flags early returns, own-emergency-contact loops and meetings with earlier guides.', 'Anomaly agent', null], ['Respond', 'Prepares a recovery plan.', 'Response agent', 'Chronology desk acts'], ['Learn', 'Feeds incidents back into the timeline model.', 'Learning agent', null], ['Control tower', 'One view of everyone currently in the past.', null, 'Duty director steers'], END()],
      'Travellers return early, and complaints arrive before trips are booked.', 'Incidents caught early, and every trip safer than the last.']]),
  F('heroes', 'Superhero Staffing Agency', 'Scheduling & dispatch', 'Amara Flint', 'Director of Crisis Deployment',
    'Improve incident response so suitable, available teams reach crises faster without compromising civilian safety. Reduce outdated capability records, fatigue conflicts and avoidable collateral damage. Dispatchers need clear trade-offs and retain authority; capability, location, fatigue and employment rules matter more than popularity.',
    [['Receive alert', 'Call handler', 'Phone, alert feed', 'Chaotic descriptions'], ['Classify incident', 'Dispatcher', 'Playbook', 'Multiple hazards'], ['Check capability', 'Roster planner', 'Skills database', 'Profiles outdated'], ['Build team', 'Scheduler', 'Roster, maps', 'Fatigue conflicts'], ['Authorise dispatch', 'Duty commander', 'Command screen', 'Collateral concerns'], ['Review outcome', 'Operations analyst', 'Reports, telemetry', 'Heroic narratives']],
    ['I want the right team at the right crisis. I do not want our ocean specialist sent to another sandstorm.', 4], 'Dispatch suitable teams faster while balancing capability, location, fatigue, collateral risk and employment rules.',
    ['Judgement: fastest individual or slower balanced team?', 'Constraint: fatigue limits and civilian safety override popularity.', 'Exception: powers interact unpredictably in wet weather.'],
    ['Incident: giant pigeon obstructing tram line', 'Skill record: flight, allergic to feathers', 'Review: "technically successful, four fountains relocated"'],
    [['Superhero Staffing: right team, right crisis', 'AI proposes balanced teams; the commander decides.', [T('An alert comes in'), ['Structure the alert', 'Turns chaotic calls into incident type, location and hazards.', 'Intake agent', null], ['Classify hazards', 'Detects multiple hazards and the matching playbook.', 'Classification agent', null], ['Live capability', 'Keeps skill profiles current from recent missions.', 'Capability agent', null], ['Propose teams', 'Proposes two or three teams with the trade-offs: speed, fatigue and collateral risk.', 'Team builder agent', 'Scheduler adjusts'], ['Authorise', 'The duty commander chooses and dispatches.', null, 'Duty commander authorises'], END()],
      'Outdated profiles and nickname-based allocation send the ocean specialist to a sandstorm.', 'Faster, safer dispatch with clear trade-offs, and the dispatcher keeps authority.'],
     ['Superhero Staffing: fatigue and safety first', 'The rules that protect heroes and civilians are built in.', [T('A team is proposed'), ['Check fatigue', 'Checks hours and recovery against employment rules.', 'Fatigue agent', null], ['Collateral check', 'Estimates collateral risk, including wet-weather power interactions.', 'Safety agent', 'Safety gatekeeper reviews'], ['Log overrides', 'Every override of a rule is recorded with a reason.', 'Audit agent', 'Commander overrides if needed'], END()],
      'Fatigue conflicts and collateral damage are found too late.', 'Fewer relocated fountains and a defensible record for the regulator.'],
     ['Superhero Staffing: honest outcome reviews', 'Learn from telemetry, not heroic narratives.', [T('A mission is closed'), ['Gather facts', 'Collects telemetry, reports and civilian feedback.', 'Evidence agent', null], ['Compare with the plan', 'Compares the outcome with the plan and flags gaps.', 'Review agent', null], ['Update profiles', 'Updates skills and allergies (flight, allergic to feathers).', 'Capability agent', 'Roster planner confirms'], ['Share lessons', 'Brings two lessons to the next dispatch.', null, 'Operations analyst presents'], END()],
      'Reviews are heroic stories, so profiles never improve.', 'Better data for every future dispatch.']]),
  F('wizards', 'The Municipal Wizard Licensing Office', 'Licensing & intake', 'Petra Quill', 'Director of Arcane Licensing',
    'Improve licensing so routine renewals are completed promptly and the owl backlog falls without weakening safety checks. Reduce illegible files, missing attachments, copied conditions and avoidable rework. Unusual spells, public objections and identity transformations need expert attention; reasons, objections and conditions must remain part of the legal record.',
    [['Submit renewal', 'Wizard', 'Owl, portal', 'Illegible runes'], ['Digitise file', 'Intake clerk', 'Scanner, OCR', 'Feathers jam scanner'], ['Check complete', 'Licensing officer', 'Checklist', 'Attachments enchanted'], ['Assess risk', 'Arcane specialist', 'Rules, precedents', 'New spell classes'], ['Decide & issue', 'Registrar', 'Licence system', 'Conditions copied'], ['Appeal / inspect', 'Tribunal & inspector', 'Case file', 'Applicant shape-shifts']],
    ['I want routine renewals completed before the next owl arrives. "Routine" ends when the applicant has accidentally become a goose.', 5], 'Reduce a 40,000-owl backlog while maintaining safety checks, public objections and lawful renewal decisions.',
    ['Judgement: minor variation or materially new spell?', 'Constraint: reasons, objections and conditions form a legal record.', 'Exception: applicant changes species during assessment.'],
    ['Form 12B signed in invisible ink', 'Renewal: indoor thunder, weekdays only', "Complaint: neighbour's hedge now offers financial advice"],
    [['Wizard Licensing: routine renewals in a day', 'Clear the 40,000-owl backlog without weakening safety.', [T('A renewal arrives by owl or portal'), ['Digitise', 'Reads runes and invisible ink, without feather jams.', 'Digitisation agent', null], ['Check completeness', 'Checks attachments, enchanted ones included, and asks for what is missing.', 'Completeness agent', null], ['Routine or not', 'Separates routine renewals from new spell classes.', 'Risk agent', null], ['Issue routine licences', 'Drafts the licence with tailored, not copied, conditions.', 'Licence agent', 'Registrar signs'], ['Expert route', 'Unusual spells and objections go to an arcane specialist.', null, 'Arcane specialist assesses'], END('Licence and reasons in the legal record')],
      'Illegible runes, missing attachments and copied conditions build the owl backlog.', 'Routine renewals done promptly; experts focus on the dangerous ones.'],
     ['Wizard Licensing: objections that count', 'Public objections and reasons become part of the legal record.', [T('An objection is received'), ['Link the objection', 'Links each objection to the right application and condition.', 'Case agent', null], ['Summarise', "Summarises the objections and the applicant's answer.", 'Summary agent', null], ['Decide', 'The registrar decides with the full record.', null, 'Registrar decides'], ['Write reasons', 'Drafts reasons that answer each objection.', 'Drafting agent', 'Registrar approves'], END()],
      'Objections and reasons get lost between files.', 'Lawful, traceable decisions that survive the tribunal.'],
     ['Wizard Licensing: shape-shift-safe inspections', 'Identity holds, even when the applicant becomes a goose.', [T('An inspection or appeal is opened'), ['Confirm identity', 'Checks identity across transformations using magical signatures.', 'Identity agent', null], ['Plan inspections', 'Prioritises inspections by risk (indoor thunder, talkative hedges).', 'Planning agent', null], ['Inspect', 'The inspector visits with a briefing.', null, 'Inspector inspects'], ['Update the licence', 'Updates the conditions and records the outcome.', 'Licence agent', null], END()],
      'Applicants shape-shift and inspections lose track of them.', 'Safer streets and fewer hedges offering financial advice.']]),
  F('zombie', 'Zombie Apocalypse Preparedness Insurance', 'Underwriting uncertainty', 'Marcus Vale', 'Chief Underwriting Officer',
    'Improve underwriting so customers receive useful preparedness cover and defensible terms despite the absence of credible loss history. Make uncertainty and assumptions explicit, reduce cosmetic compliance and recognise genuine resilience rather than wealth. Access must not depend on protected traits or wealth proxies, and unfamiliar risks need appropriate referral.',
    [['Apply', 'Customer', 'Broker portal', 'Hypothetical answers'], ['Verify exposure', 'Underwriter', 'Property data', 'Unknown household plans'], ['Assess readiness', 'Risk engineer', 'Survey, checklist', 'Cosmetic compliance'], ['Run scenarios', 'Catastrophe analyst', 'Simulation', 'No historical baseline'], ['Set terms', 'Underwriter', 'Pricing workbook', 'Capital uncertainty'], ['Bind & monitor', 'Operations', 'Policy platform', 'Risk changes rapidly']],
    ['I want a price we can defend. "It felt apocalyptic" will not survive committee.', 1], 'Offer useful preparedness cover without pretending the probability model knows when, where or whether the event occurs.',
    ['Judgement: genuine resilience or expensive theatre?', 'Constraint: protected traits and wealth proxies cannot drive access.', 'Exception: neighbourhood cooperation reduces risk but is uncontracted.'],
    ['Applicant owns 800 tins, no can opener', 'Building has a moat, shared with ducks', 'Broker note: "client refuses to discuss stairs"'],
    [['Zombie Insurance: a price we can defend', 'Assumptions and uncertainty on the table, not hidden in the workbook.', [T('An application arrives'), ['Structure the answers', 'Turns hypothetical answers into structured, comparable facts.', 'Application agent', null], ['Verify exposure', 'Enriches property data and asks about household plans.', 'Exposure agent', null], ['Run scenarios', 'Runs scenarios and shows a range, not one number.', 'Scenario agent', null], ['List assumptions', 'Lists every assumption behind the price.', 'Assumptions agent', null], ['Set terms', 'The underwriter sets terms and records why.', null, 'Underwriter decides'], END()],
      'There is no loss history, so prices feel apocalyptic and do not survive committee.', 'Defensible terms and an explicit view of the uncertainty.'],
     ['Zombie Insurance: real resilience, not theatre', 'Reward preparedness, not wealth.', [T('A readiness survey is submitted'), ['Check the evidence', 'Checks claims against evidence (800 tins, no can opener).', 'Readiness agent', null], ['Fairness check', 'Stops protected traits and wealth proxies from driving access.', 'Fairness agent', null], ['Recognise cooperation', 'Gives credit for neighbourhood cooperation where it is evidenced.', 'Community agent', 'Risk engineer validates'], ['Refer the unusual', 'Unfamiliar risks (a moat shared with ducks) go to a specialist.', null, 'Specialist underwriter'], END()],
      'Cosmetic compliance and wealth proxies drive access today.', 'Fair access and terms that reward genuine resilience.'],
     ['Zombie Insurance: keep up with the risk', 'Terms that keep up when the risk moves.', [W('Monitors risk signals after the policy is bound.'), ['Flag changes', 'Flags material changes for the customer and the underwriter.', 'Change agent', null], ['Adjust terms', 'Proposes adjusted terms with reasons.', 'Pricing agent', 'Underwriter approves'], ['Inform', 'Explains the change to the customer.', 'Communication agent', null], END()],
      'Risk changes rapidly after binding and nobody sees it.', 'Capital protected and customers kept informed.']]),
  F('toothfairy', 'The Tooth Fairy Treasury', 'Procure-to-pay controls', 'Celeste Molar', 'Treasury Controller',
    'Improve tooth valuation and nightly payments so families are paid promptly and correctly while treasury retains proper control. Reduce unclear identities, duplicate claims, valuation inconsistencies and reconciliation exceptions. Preserve segregation of duties, audit evidence and sensible limits: no fairy may collect, approve and pay the same claim. The experience should remain magical for families.',
    [['Lodge tooth', 'Child / guardian', 'Pillow, app', 'Identity unclear'], ['Collect evidence', 'Field fairy', 'Photo, route log', 'Low light'], ['Value tooth', 'Valuation clerk', 'Rate card', 'Regional inflation'], ['Check controls', 'Treasury analyst', 'Rules, duplicate search', 'Two fairies claim same tooth'], ['Approve & pay', 'Payment officer', 'Wallet, bank rail', 'Nightly cut-off'], ['Reconcile', 'Finance team', 'Ledger, exception queue', 'Coins under furniture']],
    ['I want instant payment with proper controls. Glitter is not, by itself, evidence of approval.', 1], 'Control tooth valuation and nightly payments as inflation, exchange rates and unusual submissions increase.',
    ['Judgement: ordinary tooth, rare specimen or suspicious substitute?', 'Constraint: no fairy may collect, approve and pay the same claim.', 'Exception: twins exchange teeth before collection.'],
    ['Claim T-009: tooth appears to be polished rice', 'Rate note: molars +12%, glitter surcharge removed', 'Complaint: payment made in obsolete moon coins'],
    [['Tooth Fairy Treasury: instant payment, proper control', 'Paid by morning, with segregation of duties built in.', [T('A tooth is lodged'), ['Confirm identity', 'Links the tooth to the right child and guardian.', 'Identity agent', null], ['Collect evidence', 'Enhances low-light photos and checks the route log.', 'Evidence agent', 'Field fairy collects'], ['Value the tooth', 'Values the tooth with regional inflation and rare-specimen rules.', 'Valuation agent', null], ['Check controls', 'Checks duplicates (twins swapping teeth) and limits.', 'Control agent', null], ['Approve & pay', 'A different fairy approves; paid before the nightly cut-off.', 'Payment agent', 'Payment officer approves'], END()],
      'Unclear identities, duplicate claims and valuation drift.', 'Families paid promptly and correctly, and treasury keeps control.'],
     ['Tooth Fairy Treasury: spot the substitutes', 'Spot polished rice without spoiling the magic.', [T('A valuation is flagged as unusual'), ['Compare', 'Compares with known specimens and past claims.', 'Specimen agent', null], ['Explain the doubt', 'Explains the doubt to the valuation clerk.', 'Explanation agent', null], ['Decide', 'The clerk decides: ordinary, rare or substitute.', null, 'Valuation clerk decides'], ['Gentle reply', 'Sends a kind note to the family, never an accusation.', 'Communication agent', null], END()],
      'Suspicious substitutes and rare specimens are valued inconsistently.', 'Consistent valuations, and the magic stays intact.'],
     ['Tooth Fairy Treasury: reconcile every night', 'Every coin traced, every night.', [W('Matches payments to claims as they happen.'), ['Route exceptions', 'Sends coins under furniture and moon-coin payments to the exception queue.', 'Exception agent', 'Finance team resolves'], ['Check duties', 'Checks no fairy collected, approved and paid the same claim.', 'Audit agent', null], ['Report', 'A daily ledger and evidence for the monetary regulator.', null, 'Treasury Controller signs off'], END()],
      'Reconciliation exceptions pile up and audit evidence is thin.', 'A clean ledger, and audit evidence on demand.']]),
  { id: 'own', name: 'My own process', sub: 'Blank board', brief: '', quotes: [], probe: null, steps: ['Step 1', 'Step 2', 'Step 3', 'Step 4'] },
];

// Probing questions with what a strong answer and a red flag sound like.
export const CHALLENGES = [
  { q: 'What must be true before this step can run without human review?', why: 'Defines the touchless conditions.', strong: 'A concrete set of data, evidence, policy and risk conditions.', flag: '"A person always needs to check it."' },
  { q: 'Which review steps genuinely prevent financial or customer risk?', why: 'Separates controls from inherited habits.', strong: 'Names the risk, the decision right and the evidence each review creates.', flag: '"That is how we have always done it."' },
  { q: 'If an agent assembled the full case and explained every discrepancy, what judgement would still need a person?', why: 'Reveals the future human role.', strong: 'Material judgement, non-standard terms, customer sensitivity, policy exceptions.', flag: 'Describing data gathering, copying or comparison as human judgement.' },
  { q: 'What would first-time-right mean from the customer\'s perspective?', why: 'Prevents an internally optimised but customer-rejected result.', strong: 'Correct content, references, evidence, format, channel and timing.', flag: '"It posted successfully in the system."' },
];

// Reusable design principles the team can select on the Present Back board.
export const PRINCIPLES = [
  'Start from the outcome, not today\'s steps',
  'Automate the standard flow; reserve people for judgement',
  'Prepare the full case before a person is asked to decide',
  'Make every AI action explainable and reversible',
  'Keep a named human accountable for each decision',
  'Fail safe: block and escalate when confidence is low',
  'Embed the control in the system, not in a checklist',
  'Design for the exception, not only the happy path',
  'Show the one number that proves the value',
  'Capture feedback so the process keeps improving',
  'Use data already in the systems before asking people again',
  'Give the customer one clear, consolidated status',
];

const deepDive = {
  id: 'deep', title: 'Deep Dive & Prototype', mins: 25,
  objective: 'Bring the selected scenario to life: define how it works, who it serves and the value it creates. Then build a tangible prototype you can explore, test and refine.',
  steps: [
    { t: 'Fill the canvas', mins: 10, d: 'One or two sentences per row. Keep the solution simple and realistic as a first prototype.' },
    { t: 'Build the prototype', mins: 10, d: 'Generate a working, clickable prototype from your canvas.' },
    { t: 'Test and refine', mins: 5, d: 'Click through it as the primary user. What is missing? Ask for a change and rebuild.' },
  ],
  ask: ['Who touches this first on a normal day, and what do they type or click?', 'Which data must exist before this works at all?', 'What is the one screen that proves the value?'],
  ideas: ['Start with one user and one happy path', 'Show the exception queue: where does a person step in?', 'Put the one number that matters on the first screen'],
  widgets: [
    { type: 'promptcanvas', title: 'Build your solution prompt', intro: 'You are writing one prompt. The structure is already here — fill the blanks in your own words, then assemble it into a full prompt you can use to build.', fields: [
      { id: 'usecase', label: 'Use case', lead: 'Build a working prototype for', ph: 'e.g. capturing and standardising incoming order changes' },
      { id: 'context', label: 'Process context', lead: 'It improves this part of the process', ph: 'e.g. the order-change intake, before fulfilment' },
      { id: 'outcome', label: 'Outcome', lead: 'The goal is to', ph: 'e.g. …; success looks like changes handled first-time-right' },
      { id: 'user', label: 'User', lead: 'The primary user is', ph: 'e.g. an order-desk agent. They: input → system action → output' },
      { id: 'value', label: 'Value', lead: 'This creates value by', ph: 'e.g. removing manual re-keying and catching errors early' },
      { id: 'tech', label: 'Tech stack', lead: 'Integration (if relevant)', ph: 'e.g. reads from the ERP; otherwise standalone' },
      { id: 'data', label: 'Data requirements', lead: 'Data', ph: 'input data · output data · source (if known)' },
    ] },
    { type: 'prototype' },
  ],
};

// Duplicate of the Deep Dive page without the prompt canvas: the prototype is built automatically from everything filled in on the earlier pages.
const deepProto = {
  ...deepDive, id: 'deepProto', mins: 10, // the Replit step is a group moment without a time
  objective: 'Bring the selected scenario to life. Your prototype prompt is already written from everything you filled in on the earlier pages: read it, sharpen it and take it to Replit.',
  steps: [
    { t: 'Read the prompt', mins: 10, bk: 'Individual', d: 'It is pre-filled from your process, jobs, dream state and scenario. Does it describe what you want to build?' },
    { t: 'Take it to Replit', bk: 'Groups', d: 'Copy or download the prompt and paste it into Replit AI.' },
  ],
  widgets: [{ type: 'promptproto' }],
};

const full = [
  {
    id: 'today', title: "Today's Reality", mins: 25,
    objective: 'Build a shared understanding of the current process by exploring its key activities, decision points, stakeholders and friction points. Use these insights as the foundation to reimagine a better, smarter way of working.',
    steps: [
      { t: 'Understand the process', mins: 10, bk: 'Groups', d: 'Review the process together and align on how it works today. Ensure everyone has a shared understanding before moving on.' },
      { t: 'Capture context and identify friction points', mins: 15, bk: 'Groups', d: 'Identify any important context, constraints, assumptions or dependencies that influence the process today. Then discuss where time, effort, information or quality is lost, and capture the most important friction points on the board. Agree on the process step or challenge that offers the greatest opportunity for improvement — this becomes the focus for the next exercises.' },
    ],
    ask: ['What exactly triggers this process, and who can declare it ready?', 'What share of work is standard flow versus exception handling?', 'Which exceptions start here, and which arrive from upstream?', 'Which fields or documents are most often missing or inconsistent?', 'Which approvals are legally or financially required, and which exist out of habit?', 'Does the system hold the real logic, or do teams rely on extra files, inboxes and knowledge?'],
    ideas: ['We learn about changes too late', 'Manual re-keying between systems', 'One person holds the knowledge', 'Nobody monitors the control that exists'],
    widgets: [
      { type: 'game', game: 'signals', label: 'Warm-up: Signal Hunt' },
      { type: 'brief' },
      { type: 'process', title: 'Process overview and friction mapping', tip: 'Walk the steps as they really happen today. Under each step, note the friction — where time, effort, information or quality is lost.' },
      { type: 'fields', title: 'Important context', tip: 'The facts that frame the process: what it covers, what starts and ends it, which systems and people are involved.', cols: true, fields: [
        { id: 'scope', label: 'Process scope', ph: 'What is in / out of scope?', tip: 'Where this process begins and ends, and what is deliberately left out of it.' },
        { id: 'start', label: 'Start trigger', ph: 'What starts the process?', tip: 'The event that kicks it off — a request, an order, a date, a message.' },
        { id: 'end', label: 'End trigger', ph: 'When is it done?', tip: 'The point at which the outcome is delivered and the process is complete.' },
        { id: 'systems', label: 'Systems involved', ph: 'e.g. ERP, CRM, ticketing', tip: 'The tools and data sources people rely on to do the work today.' },
        { id: 'stakeholders', label: 'Stakeholders', ph: 'Who touches it?', tip: 'Everyone who performs, approves, depends on or is affected by the process.' },
        { id: 'other', label: 'Other', ph: 'Anything important that does not fit above', tip: 'Anything else that matters — regulations, risks, exceptions, deadlines or dependencies that do not fit scope, trigger, systems or stakeholders.' },
      ] },
    ],
  },
  {
    id: 'jobs', title: 'Current State · Jobs-to-be-Done', mins: 25,
    objective: 'Identify the most important drivers for change and the key jobs-to-be-done. Explore what needs to be achieved, whether it is best suited for humans, AI or both, and why it matters for better outcomes.',
    steps: [
      { t: 'Identify the Jobs-to-be-Done', mins: 5, bk: 'Individual', d: 'Reflect on the selected process challenge and identify the most important jobs that need to be accomplished to achieve a successful outcome. Focus on what needs to be achieved, not how it is done today. Capture your ideas on sticky notes.' },
      { t: 'Share and Cluster', mins: 5, bk: 'Pairs', d: 'Share your ideas with a partner and discuss similarities, differences and emerging themes. Together, identify the jobs-to-be-done that are most critical to success.' },
      { t: 'Prioritize as a Group', mins: 5, bk: 'Groups', d: 'Review the identified jobs-to-be-done and agree on the most important ones. Focus on the jobs that would create the greatest value if they could be fulfilled more effectively.' },
      { t: 'Human, AI, or Both?', mins: 10, bk: 'Groups', d: 'For each prioritized job-to-be-done, discuss whether you would hand these jobs to humans, AI, or both. Capture your choices and explain why. Consider the strengths each brings to achieving the desired outcome.' },
    ],
    ask: ['What are we actually trying to achieve here, regardless of today\'s tools?', 'Is this job judgement, or is it gathering and comparing?', 'What would a person still decide if everything were prepared for them?'],
    ideas: ['First time right at entry', 'Predict peaks to plan capacity', 'Clear governance on who may change what', 'Deliver on time'],
    widgets: [
      { type: 'game', game: 'sorter', label: 'Warm-up: Judgement or legwork?' },
      { type: 'rows', id: 'jtbd', title: 'Jobs-to-be-done', tip: 'A job-to-be-done is what must be achieved for a good outcome, described independently of today\'s tools or steps.', min: 4, cols: [
        { id: 'job', label: 'What are we trying to achieve?', type: 'text', tip: 'The result that matters, stated as an outcome — not the activity or the current way of doing it.' },
        { id: 'who', label: 'Who should do the work?', type: 'who', tip: 'Human for judgement and relationships; AI for gathering, comparing and drafting; Both when AI prepares and a person decides.' },
        { id: 'why', label: 'Why?', type: 'text', tip: 'Why that split is right — the strength each side brings to this job.' },
      ] },
      { type: 'challenges' },
    ],
  },
  {
    id: 'dream', title: 'Dream State · Reimagine the Process', mins: 25,
    objective: 'Imagine a dream state where the most important jobs-to-be-done are fulfilled seamlessly. Define what success looks like and the value it could create at each level.',
    steps: [
      { t: 'Imagine the Ideal Future', mins: 5, bk: 'Individual', d: 'Forget today\'s constraints, systems and ways of working. Imagine a dream state where the most important jobs-to-be-done are fulfilled seamlessly. "How amazing would it be if…"' },
      { t: 'Share and Build', mins: 5, bk: 'Pairs', d: 'Share your ideas with a partner and build on each other\'s thinking. Which elements are most compelling? Push them one step further.' },
      { t: 'Define the Dream State', mins: 15, bk: 'Groups', d: 'As a group, define what success looks like and the value it could create at each level. Place each idea at the level where the value lands: the team, the organisation, the customer.' },
    ],
    ask: ['How amazing would it be if…?', 'What would the customer notice first?', 'What would your team stop doing entirely?'],
    ideas: ['First time right means less work', 'The customer receives exactly what they ordered', 'Fewer changes downstream, more compliance', 'Trust: we are a reliable partner'],
    widgets: [{ type: 'notes', title: 'How amazing would it be if…', layout: 'arcs', tip: 'Place each idea where the value lands. The rings adapt to your process: the inner ring is your own team, the outer ring is the people you ultimately serve.', zones: [
      { id: 'dream_ext', label: 'External / stakeholder client' },
      { id: 'dream_org', label: 'Internal / direct client' },
      { id: 'dream_ops', label: 'Internal' },
    ] }],
  },
  {
    id: 'scenario', title: 'Reimagined AI-Powered Scenario', mins: 25,
    objective: 'Turn your jobs and dream state into AI-powered scenarios, reflect on them as a group, vote on the opportunities that matter most, and select the scenario to take into prototyping.',
    steps: [
      { t: 'Review and Reflect on the Reimagined Scenarios', mins: 15, bk: 'Groups', d: 'Generate the scenario from your board and read it together. Reflect as a group on how well it supports your future vision, the value it creates and its potential impact. Explore dependencies, customer communication, exceptions, process impact, risks and feedback loops.' },
      { t: 'Prioritize Opportunities', mins: 2, bk: 'Individual', d: 'You have 2 votes. Vote for the use cases that create the greatest value, best support the vision and can significantly improve the process.' },
      { t: 'Select a Scenario', mins: 8, bk: 'Groups', d: 'Review the most-voted opportunities as a group and select the scenario to move forward into prototyping. Make it your own before taking it further.' },
    ],
    ask: ['What must be true upstream for this flow to start cleanly?', 'What happens when the agent is not confident?', 'Who is told what, and when?'],
    ideas: ['Master data must be accessible and current', 'Policy violations are blocked and escalated', 'Reviewer edits improve the rules over time', 'Customer gets one consolidated status update'],
    widgets: [
      { type: 'scenario' },
      { type: 'vote' },
      { type: 'notes', title: 'Make it your own', zones: [
        { id: 'r_dep', label: 'Dependencies & assumptions', color: 'yellow' }, { id: 'r_comm', label: 'Customer communication', color: 'orange' },
        { id: 'r_exc', label: 'Exception handling', color: 'pink' }, { id: 'r_imp', label: 'Process impact', color: 'green' },
        { id: 'r_risk', label: 'Risks & controls', color: 'purple' }, { id: 'r_learn', label: 'Learning & feedback loops', color: 'white' },
      ] },
    ],
  },
  {
    id: 'prioritize', title: 'Prioritize', mins: 25,
    objective: 'Select and refine the most relevant use case to move forward into prototyping.',
    steps: [
      { t: 'Review the use cases', mins: 5, d: 'List the candidate use cases from your scenario. Consider value, problems solved and impact.' },
      { t: 'Vote', mins: 5, d: 'You have 2 votes. Vote for what creates the greatest value, best supports the vision and can significantly improve the process.' },
      { t: 'Review the chosen one', mins: 15, d: 'Test the winner against the design questions.' },
    ],
    ask: ['Which one would the team miss most if it disappeared after a month?', 'Which is small enough to prototype this week?'],
    ideas: ['Capture and standardise incoming changes', 'Detect and explain inconsistencies', 'Recommend a resolution and route to the right expert', 'Reporting at the end of the month'],
    widgets: [
      { type: 'vote' },
      { type: 'fields', title: 'Design questions for the chosen use case', fields: [
        { id: 'd1', label: 'In this specific moment, what would the user actually welcome AI to help with?' },
        { id: 'd2', label: 'What does this user truly need, beyond completing the task?' },
        { id: 'd3', label: 'What small, immediate value could AI provide to earn trust here?' },
        { id: 'd4', label: 'How much decision-making or action should AI take in this situation?' },
        { id: 'd5', label: 'How should the user, AI and a human expert work together in this moment?' },
        { id: 'd6', label: 'If something goes wrong, is it clear who is responsible?' },
        { id: 'd7', label: 'Can the user easily understand, influence and control what AI is doing?' },
        { id: 'd8', label: 'What is stopping this user from engaging, and how can we remove that barrier?' },
        { id: 'd9', label: 'How does this help the user move from trying AI to truly benefiting from it?' },
      ] },
    ],
  },
  deepDive,
  deepProto,
  {
    id: 'present', title: 'Present Back', mins: 15,
    objective: 'Prepare a 5-minute report-out that tells the story of your journey from challenge to solution: your reimagined process, key insights, recommendations and future opportunities.',
    steps: [
      { t: 'Tell the story', mins: 10, d: 'Fill the four quadrants. One idea per sticky note.' },
      { t: 'Export', mins: 5, d: 'Download the summary and your prototype to share.' },
    ],
    ask: ['If you had 30 seconds, which single note would you read out?', 'What is the first step someone could take on Monday?'],
    ideas: ['Roles and responsibilities: who is accountable?', 'We embed controls in the system', 'All the data is there; now we can get the insights', 'First step: prepare the knowledge base, policies and metrics'],
    widgets: [
      { type: 'notes', title: 'Report-out', zones: [
        { id: 'p_challenge', label: '1. The Challenge', hint: 'The biggest friction we wanted to solve was…', color: 'yellow', tip: 'The single biggest friction or problem you set out to solve.' },
        { id: 'p_principles', label: '2. Design Principles', hint: 'What choices did we make when redesigning the process?', color: 'orange', tip: 'The rules you chose when redesigning — the trade-offs and non-negotiables. Pick from the common list below or add your own.' },
        { id: 'p_process', label: '3. Our Reimagined Process', hint: 'In our future state, stakeholders can… AI helps by…', color: 'green', tip: 'Your future-state flow and where AI helps. Auto-extracted from your scenario, jobs and dream state — edit as needed.' },
        { id: 'p_insights', label: '4. Insights and Next Steps', hint: 'This taught us… We would recommend… The first step should be…', color: 'pink', tip: 'What you learned, what you would recommend, and the first concrete step to take.' },
      ] },
      { type: 'summary' },
    ],
  },
];

const quick = [
  {
    id: 'spot', title: 'Round 1 · Spot', mins: 20,
    objective: 'What does the client want to achieve, and why now? Notice the signals, then pick exactly one process and find where it hurts.',
    steps: [
      { t: 'Goal, why now, owner', mins: 5, d: 'The outcome, not the steps. A deadline, a decision, a programme? Which role decides?' },
      { t: 'Which signals do we see?', mins: 8, d: 'Pick 2 or 3 statements or facts from the case. Which signal (1–6) is it? What does it tell us?' },
      { t: 'One process', mins: 7, d: 'How does it go today, in three steps? Where does it hurt? Which number do we want to know?' },
    ],
    ask: ['What should be different afterwards? Not the steps, the outcome.', 'Where is time lost, work done twice, or ownership unclear?', 'Which number would make this concrete: a volume, a lead time, a percentage?'],
    ideas: ['Use the client\'s exact words', 'If you do not know the number yet, write the question you will ask'],
    widgets: [
      { type: 'game', game: 'signals', label: 'Warm-up: Signal Hunt' },
      { type: 'brief' },
      { type: 'fields', title: 'What does the client want to achieve, and why now?', cols: true, fields: [
        { id: 'q_goal', label: 'The goal in one sentence', ph: 'What should be different afterwards?' },
        { id: 'q_why', label: 'Why now?', ph: 'A deadline, a decision, a programme?' },
        { id: 'q_owner', label: 'Who owns this at the client?', ph: 'Which role decides?' },
      ] },
      { type: 'rows', id: 'signals', title: 'Which signals do we see?', min: 3, cols: [
        { id: 'quote', label: 'What the client says or what we see', type: 'text' },
        { id: 'signal', label: 'Signal', type: 'signal' },
        { id: 'tells', label: 'What does this tell us?', type: 'text' },
      ] },
      { type: 'fields', title: 'Pick one process', cols: true, fields: [
        { id: 'q_process', label: 'The process (exactly one)', ph: 'e.g. how steering information is produced' },
        { id: 'q_now', label: 'How it goes today', ph: 'In 3 steps, one per line. Who does what?' },
        { id: 'q_pain', label: 'Where it hurts', ph: 'Time lost, done twice, unclear?' },
        { id: 'q_number', label: 'Which number do we want to know?', ph: 'A volume, lead time, percentage — or the question we will ask' },
      ] },
    ],
  },
  {
    id: 'rethink', title: 'Round 2 · Rethink and Tell', mins: 20,
    objective: 'Start from the outcome. Imagine you redesign the process today, then prepare the three questions you will ask the client.',
    steps: [
      { t: 'Value Blueprint', mins: 10, d: 'Three questions: what it delivers, who does what, and what makes it trustworthy.' },
      { t: 'Three client questions', mins: 10, d: 'Open and curious. No pitching: no "AI" and no tool names in the client conversation.' },
    ],
    ask: ['Where is human judgement really needed?', 'What would have to be arranged before the client trusts the result?', 'Is your question open, or can the client answer it with yes or no?'],
    ideas: ['Who builds this overview, and how long does it take?', 'What breaks if volume doubles?', 'Who has decided how you will meet this?'],
    widgets: [
      { type: 'fields', title: 'Value Blueprint', fields: [
        { id: 'vb1', label: '1 · What should it deliver?', ph: 'The value for the client and their customers. Preferably with a number.' },
        { id: 'vb2', label: '2 · What does the human do, what does AI do?', ph: 'Where is judgement needed? What can AI prepare or take over?' },
        { id: 'vb3', label: '3 · What must be in place to trust it?', ph: 'Ownership, controls, accountability, confidentiality.' },
      ] },
      { type: 'game', game: 'probe', label: 'Practise: Probe without pitching' },
      { type: 'fields', title: 'Three questions we ask the client', fields: [
        { id: 'cq1', label: 'Question 1', lint: true }, { id: 'cq2', label: 'Question 2', lint: true }, { id: 'cq3', label: 'Question 3', lint: true },
        { id: 'cq_number', label: 'The number we want to hear' },
      ] },
      { type: 'mail' },
    ],
  },
  deepDive,
  deepProto,
];

const debrief = (id, a, b) => ({ type: 'fields', title: 'Debrief: play first, then reflect', fields: [{ id: id + '1', label: a }, { id: id + '2', label: b }] });
const spot = [
  {
    id: 'why', title: 'Why Spot · the six signals', mins: 30, badge: 'Warm-up',
    objective: 'One routine (S-P-O-T), one lens (six signals), one tool (the Spot card) and one rule: notice and tell. Don\'t pitch.',
    steps: [
      { t: 'Why Spot', mins: 10, d: 'What Spot is and is not, and where a spot leads: from Spot to Transform.' },
      { t: 'The six signals', mins: 10, d: 'Read each signal. Before you look, guess which question you would ask.' },
      { t: 'Warm-up quiz', mins: 10, d: 'Play Signal Hunt on the practice quotes.' },
    ],
    ask: ['Where in your current project does a clear goal meet a messy "how"?', 'Which of the six signals have you already heard this month?'],
    ideas: ['Spot happens before anyone says "AI"', 'A Spot card takes minutes; others lead what follows'],
    widgets: [
      { type: 'info', title: 'What Spot is, and what it isn\'t', items: [
        ['Spot is', 'Noticing during work you are already doing · asking one curious question · writing down the client\'s words and one number · telling your partner and the EY.ai Lab.'],
        ['Spot is not', 'An AI pitch or a sales conversation · designing a solution · promising anything to the client · something only AI experts can do.'],
      ] },
      { type: 'info', title: 'Where Spot leads', numbered: true, items: [
        ['Spot', 'Notice a signal, ask one question, write it down. Any team member. Output: a Spot card.'],
        ['Shape', 'Narrow it to one process and one number. Partner + EY.ai Lab. Output: an agreed use case.'],
        ['Show', 'Map the process, split work between people and AI, prototype on real data. Output: prototype + storyline.'],
        ['Scope', 'Client decisions, sequencing, commercial path. Output: a proposal.'],
        ['Transform', 'Build, govern, adopt and keep improving. Output: a process running with measurable value.'],
      ] },
      { type: 'info', title: 'The S-P-O-T routine', items: [
        ['S · Signal', 'Notice one of the six signals: in what people say, what documents show, or how the work gets done.'],
        ['P · Probe', 'Ask the matching question. Be curious, don\'t sell. Capture the client\'s exact words and one number.'],
        ['O · Opportunity note', 'Fill in a Spot card. About five minutes.'],
        ['T · Tell', 'Share it with your partner and the EY.ai Lab within a week. They decide on Shape and come back to you.'],
      ] },
      { type: 'info', title: 'The six signals', numbered: true, items: SIGNALS.map((s) => [s.name, `Listen for ${s.listen}. Ask: "${s.ask}"`]) },
      { type: 'game', game: 'signals', label: 'Warm-up quiz: Signal Hunt on the practice quotes' },
      { type: 'info', title: 'Guardrails', items: [
        ['Don\'t pitch', 'No AI and no tool names during Spot. Ask, listen, note.'], ['Stay in scope', 'Stay within your engagement and promise nothing.'],
        ['Independence', 'At an audit client, check with your engagement partner before any follow-up.'], ['Confidential', 'Record facts and quotes, not judgements about people.'],
      ] },
    ],
  },
  {
    id: 'hunt', title: 'Round S · Signal Hunt', mins: 25, badge: 'Round S',
    objective: 'Tag each evidence card from the case with the signal(s) it shows. Some cards show no signal at all.',
    steps: [
      { t: 'Read the scene', mins: 5, d: 'You are in a process walkthrough at the client. This is what you hear and see.' },
      { t: 'Tag the evidence', mins: 12, d: 'Pick the signal(s) per card, then check your round. Scores are per round, never a judgement of you.' },
      { t: 'Debrief', mins: 8, d: 'What did you notice? Then connect it to the method: the signal tells you which question to ask.' },
    ],
    ask: ['Is this a fact, or a signal that a clear goal meets a messy how?', 'Which question matches this signal?', 'Where in a project would you normally hear this?'],
    ideas: ['Hard-to-get data is itself signal 2', 'Delays in a steering committee point to signal 5', 'Manual consolidation at closing is signal 3'],
    widgets: [
      { type: 'brief', noQuotes: true },
      { type: 'info', title: 'Where to spot in a project', items: [['Kick-off and interviews', 'Goals without a how.'], ['Walkthroughs and as-is mapping', 'People joining things up by hand.'], ['Data requests', 'Hard-to-get data is signal 2.'], ['Status meetings and steering committees', 'Delays point to signal 5.'], ['Reporting and closing cycles', 'Manual consolidation is signal 3.'], ['Regulatory or board deadlines', 'Signals 1 and 6.']] },
      { type: 'evidence' },
      debrief('db_s', 'What did you notice?', 'Which card was hardest to place, and why?'),
    ],
  },
  {
    id: 'probe', title: 'Round P · Probe without pitching', mins: 20, badge: 'Round P',
    objective: 'Ask the matching question. Be curious, don\'t sell. Capture the client\'s exact words and one number.',
    steps: [
      { t: 'Prepare three questions', mins: 5, d: 'Open questions that match the signals you found. No "AI", no tool names.' },
      { t: 'Play the conversation', mins: 8, d: 'The client holds a secret brief and only reveals facts when asked the right open question. A pitch costs 2 points.' },
      { t: 'Debrief', mins: 7, d: 'What made the client open up? Where were you tempted to pitch?' },
    ],
    ask: ['Can the client answer your question with yes or no? Then reopen it.', 'Which number would make this concrete?', 'Did you agree a next step?'],
    ideas: ['Who builds this overview, and how long does it take?', 'What breaks if volume doubles?', 'May I share this with our partner?'],
    widgets: [
      { type: 'info', title: 'Observer checklist', items: [['Open question?', 'What, how, who, which.'], ['Client\'s words captured?', 'Verbatim, not your summary.'], ['A number?', 'Volume, time, %, error rate.'], ['No AI pitch?', 'A pitch is a yellow card.'], ['Next step agreed?', '"May I share this with our partner?"']] },
      { type: 'fields', title: 'My three questions', fields: [{ id: 'cq1', label: 'Question 1', lint: true }, { id: 'cq2', label: 'Question 2', lint: true }, { id: 'cq3', label: 'Question 3', lint: true }] },
      { type: 'game', game: 'probe', label: 'Play Round P with the client' },
      debrief('db_p', 'What made the client open up?', 'Where were you tempted to pitch?'),
    ],
  },
  {
    id: 'card', title: 'Round O · Opportunity note', mins: 10, badge: 'Round O',
    objective: 'Fill in a Spot card for the case. A strong spot is one process, two or more signals, a quote, a number and an owner.',
    steps: [
      { t: 'Fill in the Spot card', mins: 7, d: 'Facts and quotes only. No solution ideas: a Spot card is not a design.' },
      { t: 'Check the strong-spot bar', mins: 3, d: '+1 per element met. Gaps are fine: mark what you still need to ask.' },
    ],
    ask: ['Is this exactly one process?', 'Are these the client\'s words, or yours?', 'Who decides about this at the client, by role?'],
    ideas: ['Use the exact phrase the client used', 'If the number is unknown, write the question you will ask'],
    widgets: [
      { type: 'fields', title: 'Spot card', cols: true, fields: [
        { id: 'mail_client', label: 'Client / project', ph: 'Anonymise if needed' },
        { id: 'q_process', label: 'Process (just one)' },
        { id: 'sc_signals', label: 'Signal(s)', ph: 'e.g. 2 and 3' },
        { id: 'sc_words', label: 'Client\'s own words', ph: '"…"' },
        { id: 'q_number', label: 'One number', ph: 'Volume, time, %, error rate' },
        { id: 'q_owner', label: 'Who owns this at the client', ph: 'Role' },
        { id: 'q_why', label: 'Why now', ph: 'Regulation, deadline, board question, competitor move' },
        { id: 'sc_q', label: 'Question asked → answer' },
        { id: 'sc_shared', label: 'Shared with / date', ph: 'Partner · EY.ai Lab' },
      ] },
      { type: 'spotbar' },
    ],
  },
  {
    id: 'tell', title: 'Round T · Tell', mins: 5, badge: 'Round T',
    objective: 'Tell it in 60 seconds, send it to your engagement partner and the EY.ai Lab within a week, and launch your own Spot Sprint.',
    steps: [
      { t: 'Tell it in 60 seconds', mins: 2, d: 'Process, signals, the client\'s words, the number, the owner, why now. No solution.' },
      { t: 'Send and commit', mins: 3, d: 'Check the guardrails, copy the mail, and commit to two Spot cards from your own project.' },
    ],
    ask: ['Would a partner take this card to Shape? What is missing?', 'Which moment in your own project this week is a good place to spot?'],
    ideas: ['Lead with the client\'s own words', 'End with the ask, not a solution'],
    widgets: [
      { type: 'tell' },
      { type: 'mail' },
      { type: 'fields', title: 'Spot Sprint: my commitment', fields: [
        { id: 'sprint1', label: 'My first Spot card from my own work', ph: 'Which project, which moment?' },
        { id: 'sprint2', label: 'I will tell by', ph: 'Who and when (within a week)' },
      ] },
      { type: 'summary' },
    ],
  },
];

export const FLOWS = {
  full: { tag: 'Full exercise', name: 'Full Reimagination', sub: 'Seven stages. From today\'s reality to a working prototype and report-out.', stages: full },
  quick: { tag: 'Simplified', name: 'Quick Spot & Rethink', sub: 'Three stages. Two rounds from the group template, then a prototype.', stages: quick },
  spot: { tag: 'Game', name: 'SPOT Lab', sub: 'Five rounds. Play S-P-O-T on a client case: hunt signals, probe without pitching, write a Spot card, tell.', stages: spot },
};

export const GAMES = {
  signals: {
    title: 'Signal Hunt', intro: 'Which of the six signals does each statement show? Some show two. +1 per correct signal, −1 per wrong one.',
    cards: [
      { q: 'Every Monday our team pulls numbers from three systems to see which claims are stuck.', a: [2, 3] },
      { q: 'The regulator wants us to show customers get a fair outcome, but hasn\'t said how.', a: [1] },
      { q: 'Next year we need to onboard twice as many suppliers with the same team.', a: [5] },
      { q: 'Most customers just stick with the standard option; we don\'t know if they understand it.', a: [4] },
      { q: 'Our competitor launched a digital advisor last month, and the board asked what our plan is.', a: [6] },
      { q: 'Finance says 4%, operations says 7%. It depends whose dashboard you open.', a: [2] },
      { q: 'The backlog grows every quarter, and the hiring freeze stays.', a: [5] },
      { q: 'We re-type the order from the PDF into the system, then e-mail it round for a check.', a: [3] },
    ],
  },
  sorter: {
    title: 'Judgement or legwork?', intro: 'For each task: does it need a person\'s judgement, can an agent do the legwork, or both?',
    cards: [
      { q: 'Compare the purchase order with the quote and list every difference.', a: 'ai', why: 'Gathering and comparing is legwork, however careful it feels.' },
      { q: 'Decide whether to accept a customer\'s non-standard payment terms.', a: 'human', why: 'Non-standard terms are a material judgement with commercial risk.' },
      { q: 'Collect the contract, order and delivery proof into one case file.', a: 'ai', why: 'Assembling evidence is exactly what an agent prepares.' },
      { q: 'Explain a discrepancy and propose a fix; a specialist approves it.', a: 'both', why: 'The agent prepares and explains; the person owns the decision.' },
      { q: 'Tell a sensitive key customer their delivery will slip.', a: 'human', why: 'Customer sensitivity and relationship stay with a person.' },
      { q: 'Group forty related change requests into one change set.', a: 'ai', why: 'Clustering at volume is pattern work.' },
      { q: 'Grant an exception to a credit policy.', a: 'human', why: 'Policy exceptions need a named, accountable decision-maker.' },
      { q: 'Flag orders that deviate from pricing rules and route them to the right expert.', a: 'both', why: 'Detection and routing by the agent; resolution by the expert.' },
    ],
  },
  probe: {
    title: 'Probe without pitching', intro: 'You are in a walkthrough with the client\'s finance lead. Ask open questions and capture their words and one number. Mention "AI" or a tool and you get a yellow card (−2). Close with: "May I share this with our partner?"',
    opening: 'Honestly? Every month-end we are chasing numbers until the last evening.',
    facts: [
      { k: ['share', 'partner'], a: 'Sure, please share it with your partner.', share: true },
      { k: ['who', 'build', 'make', 'team', 'people'], a: 'Two controllers build it, mostly by hand in Excel.' },
      { k: ['long', 'time', 'hours', 'days', 'much'], a: 'About six working days, every single month.', number: true },
      { k: ['system', 'source', 'data', 'where'], a: 'Four systems, and they rarely agree with each other.', number: true },
      { k: ['double', 'grow', 'volume', 'break', 'more'], a: 'If volume doubles we miss the deadline. No extra headcount is coming.' },
      { k: ['decide', 'owner', 'responsible', 'why now', 'deadline'], a: 'The finance director owns it. She wants it fixed before the next budget cycle.' },
    ],
  },
};
