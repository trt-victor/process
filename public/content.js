// All session content lives here: stages, cases, games. Edit this file to change the exercise.
// Sample cases are fictional; the workshop structure follows the reference board in input/.

export const COLORS = ['yellow', 'orange', 'green', 'pink', 'purple', 'white'];

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
  { id: 'own', name: 'My own process', sub: 'Blank board', brief: '', quotes: [], probe: null, steps: ['Step 1', 'Step 2', 'Step 3', 'Step 4'] },
];

// Probing questions with what a strong answer and a red flag sound like.
export const CHALLENGES = [
  { q: 'What must be true before this step can run without human review?', why: 'Defines the touchless conditions.', strong: 'A concrete set of data, evidence, policy and risk conditions.', flag: '"A person always needs to check it."' },
  { q: 'Which review steps genuinely prevent financial or customer risk?', why: 'Separates controls from inherited habits.', strong: 'Names the risk, the decision right and the evidence each review creates.', flag: '"That is how we have always done it."' },
  { q: 'If an agent assembled the full case and explained every discrepancy, what judgement would still need a person?', why: 'Reveals the future human role.', strong: 'Material judgement, non-standard terms, customer sensitivity, policy exceptions.', flag: 'Describing data gathering, copying or comparison as human judgement.' },
  { q: 'What would first-time-right mean from the customer\'s perspective?', why: 'Prevents an internally optimised but customer-rejected result.', strong: 'Correct content, references, evidence, format, channel and timing.', flag: '"It posted successfully in the system."' },
];

const deepDive = {
  id: 'deep', title: 'Deep Dive & Prototype', mins: 20,
  objective: 'Bring the selected scenario to life: define how it works, who it serves and the value it creates. Then build a tangible prototype you can explore, test and refine.',
  steps: [
    { t: 'Fill the canvas', mins: 10, d: 'One or two sentences per row. Keep the solution simple and realistic as a first prototype.' },
    { t: 'Build the prototype', mins: 5, d: 'Generate a working, clickable prototype from your canvas.' },
    { t: 'Test and refine', mins: 5, d: 'Click through it as the primary user. What is missing? Ask for a change and rebuild.' },
  ],
  ask: ['Who touches this first on a normal day, and what do they type or click?', 'Which data must exist before this works at all?', 'What is the one screen that proves the value?'],
  ideas: ['Start with one user and one happy path', 'Show the exception queue: where does a person step in?', 'Put the one number that matters on the first screen'],
  widgets: [
    { type: 'fields', title: 'Solution canvas', fields: [
      { id: 'usecase', label: 'Use case', ph: 'We want to design a solution for…' },
      { id: 'context', label: 'Process context', ph: 'This improves the following part of the process…' },
      { id: 'outcome', label: 'Outcome', ph: 'The goal is to… Success looks like…' },
      { id: 'user', label: 'User', ph: 'The primary user is… They interact by: input → system action → output' },
      { id: 'value', label: 'Value', ph: 'This creates value by…' },
      { id: 'tech', label: 'Tech stack', ph: 'Integration (if relevant)' },
      { id: 'data', label: 'Data requirements', ph: 'Input data · Output data · Source (if known)' },
    ] },
    { type: 'prototype' },
  ],
};

const full = [
  {
    id: 'today', title: "Today's Reality", mins: 30,
    objective: 'Build a shared understanding of the current process by exploring its key activities, decision points, stakeholders and friction points. Use these insights as the foundation to reimagine a better, smarter way of working.',
    steps: [
      { t: 'Understand the process', mins: 5, d: 'Review the steps and align on how it works today. Rename, add or remove steps until it is right.' },
      { t: 'Capture context and friction', mins: 15, d: 'Note context, constraints and dependencies. Then mark where time, effort, information or quality is lost.' },
      { t: 'Choose the focus', mins: 10, d: 'Pick the step or challenge with the greatest opportunity. It becomes the focus of the next exercises.' },
    ],
    ask: ['What exactly triggers this process, and who can declare it ready?', 'What share of work is standard flow versus exception handling?', 'Which exceptions start here, and which arrive from upstream?', 'Which fields or documents are most often missing or inconsistent?', 'Which approvals are legally or financially required, and which exist out of habit?', 'Does the system hold the real logic, or do teams rely on extra files, inboxes and knowledge?'],
    ideas: ['We learn about changes too late', 'Manual re-keying between systems', 'One person holds the knowledge', 'Nobody monitors the control that exists'],
    widgets: [
      { type: 'game', game: 'signals', label: 'Warm-up: Signal Hunt' },
      { type: 'brief' },
      { type: 'process', title: 'Process overview and friction mapping' },
      { type: 'fields', title: 'Important context', cols: true, fields: [
        { id: 'scope', label: 'Process scope', ph: 'What is in / out of scope?' },
        { id: 'start', label: 'Start trigger', ph: 'What starts the process?' },
        { id: 'end', label: 'End trigger', ph: 'When is it done?' },
        { id: 'systems', label: 'Systems involved', ph: 'e.g. ERP, CRM, ticketing' },
        { id: 'stakeholders', label: 'Stakeholders', ph: 'Who touches it?' },
      ] },
    ],
  },
  {
    id: 'jobs', title: 'Current State · Jobs-to-be-Done', mins: 30,
    objective: 'Identify the most important drivers for change and the key jobs-to-be-done. Explore what needs to be achieved, whether it is best suited for humans, AI or both, and why it matters for better outcomes.',
    steps: [
      { t: 'Identify the jobs', mins: 5, d: 'For your focus step: what needs to be achieved for a successful outcome? Focus on what, not how it is done today.' },
      { t: 'Cluster', mins: 5, d: 'Merge duplicates and name the themes.' },
      { t: 'Prioritise', mins: 5, d: 'Keep the jobs that would create the greatest value if they were fulfilled more effectively.' },
      { t: 'Human, AI or both?', mins: 15, d: 'Decide who should do each job and explain why. Consider the strengths each brings.' },
    ],
    ask: ['What are we actually trying to achieve here, regardless of today\'s tools?', 'Is this job judgement, or is it gathering and comparing?', 'What would a person still decide if everything were prepared for them?'],
    ideas: ['First time right at entry', 'Predict peaks to plan capacity', 'Clear governance on who may change what', 'Deliver on time'],
    widgets: [
      { type: 'game', game: 'sorter', label: 'Warm-up: Judgement or legwork?' },
      { type: 'rows', id: 'jtbd', title: 'Jobs-to-be-done', min: 4, cols: [
        { id: 'job', label: 'What are we trying to achieve?', type: 'text' },
        { id: 'who', label: 'Who should do the work?', type: 'who' },
        { id: 'why', label: 'Why?', type: 'text' },
      ] },
      { type: 'challenges' },
    ],
  },
  {
    id: 'dream', title: 'Dream State · Reimagine the Process', mins: 20,
    objective: 'Imagine a dream state where the most important jobs-to-be-done are fulfilled seamlessly. Define what success looks like and the value it could create at each level.',
    steps: [
      { t: 'Imagine the ideal future', mins: 3, d: 'Forget today\'s constraints, systems and ways of working. "How amazing would it be if…"' },
      { t: 'Build on it', mins: 5, d: 'Read your notes back. Which elements are most compelling? Push them one step further.' },
      { t: 'Define the dream state', mins: 12, d: 'Place each idea at the level where the value lands: the team, the organisation, the customer.' },
    ],
    ask: ['How amazing would it be if…?', 'What would the customer notice first?', 'What would your team stop doing entirely?'],
    ideas: ['First time right means less work', 'The customer receives exactly what they ordered', 'Fewer changes downstream, more compliance', 'Trust: we are a reliable partner'],
    widgets: [{ type: 'notes', title: 'How amazing would it be if…', layout: 'arcs', zones: [
      { id: 'dream_ext', label: 'External customer level' },
      { id: 'dream_org', label: 'Organisation & internal customer level' },
      { id: 'dream_ops', label: 'Operations team level' },
    ] }],
  },
  {
    id: 'scenario', title: 'Reimagined AI-Powered Scenario', mins: 30,
    objective: 'Turn your jobs and dream state into one AI-powered scenario, then make it your own before taking it into prototyping.',
    steps: [
      { t: 'Draft and read the scenario', mins: 3, d: 'Generate the scenario from your board and read it in silence.' },
      { t: 'Reflect', mins: 7, d: 'How well does it support your future vision, the value it creates and its potential impact?' },
      { t: 'Refine the scenario', mins: 20, d: 'Explore dependencies, customer communication, exceptions, process impact, risks and feedback loops.' },
    ],
    ask: ['What must be true upstream for this flow to start cleanly?', 'What happens when the agent is not confident?', 'Who is told what, and when?'],
    ideas: ['Master data must be accessible and current', 'Policy violations are blocked and escalated', 'Reviewer edits improve the rules over time', 'Customer gets one consolidated status update'],
    widgets: [
      { type: 'scenario' },
      { type: 'notes', title: 'Make it your own', zones: [
        { id: 'r_dep', label: 'Dependencies & assumptions' }, { id: 'r_comm', label: 'Customer communication' },
        { id: 'r_exc', label: 'Exception handling' }, { id: 'r_imp', label: 'Process impact' },
        { id: 'r_risk', label: 'Risks & controls' }, { id: 'r_learn', label: 'Learning & feedback loops' },
      ] },
    ],
  },
  {
    id: 'prioritize', title: 'Prioritize', mins: 20,
    objective: 'Select and refine the most relevant use case to move forward into prototyping.',
    steps: [
      { t: 'Review the use cases', mins: 5, d: 'List the candidate use cases from your scenario. Consider value, problems solved and impact.' },
      { t: 'Vote', mins: 5, d: 'You have 2 votes. Vote for what creates the greatest value, best supports the vision and can significantly improve the process.' },
      { t: 'Review the chosen one', mins: 10, d: 'Test the winner against the design questions.' },
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
        { id: 'p_challenge', label: '1. The Challenge', hint: 'The biggest friction we wanted to solve was…', color: 'yellow' },
        { id: 'p_principles', label: '2. Design Principles', hint: 'What choices did we make when redesigning the process?', color: 'orange' },
        { id: 'p_process', label: '3. Our Reimagined Process', hint: 'In our future state, stakeholders can… AI helps by…', color: 'green' },
        { id: 'p_insights', label: '4. Insights and Next Steps', hint: 'This taught us… We would recommend… The first step should be…', color: 'pink' },
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
  full: { tag: 'Full exercise', name: 'Full Reimagination', sub: 'Seven stages, about 2¾ hours. From today\'s reality to a working prototype and report-out.', stages: full },
  quick: { tag: 'Simplified', name: 'Quick Spot & Rethink', sub: 'Three stages, under an hour. Two rounds from the group template, then a prototype.', stages: quick },
  spot: { tag: 'Game', name: 'SPOT Lab', sub: 'Five rounds, 90 minutes. Play S-P-O-T on a client case: hunt signals, probe without pitching, write a Spot card, tell.', stages: spot },
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
