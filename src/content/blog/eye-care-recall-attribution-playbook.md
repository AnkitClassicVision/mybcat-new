---
title: Eye Care Recall Attribution Playbook
seoTitle: Eye Care Recall Attribution Playbook
description: Define recall attribution across eye care locations with shared cohort
  rules, channel credit, booking and visit metrics, and accountable handoffs.
seoDescription: Define recall attribution across eye care locations with shared cohort
  rules, channel credit, booking and visit metrics, and accountable handoffs.
publishDate: '2026-11-25'
status: published
author: Ankit Patel
tags:
- eye care recall attribution playbook
- multi-location
- enterprise operations
cluster: patient-recall
featuredImage: /images/blog/eye-care-recall-attribution-playbook.webp
canonical: https://mybcat.com/blog/eye-care-recall-attribution-playbook/
category: "Practice Growth"
targetKeyword: "eye care recall attribution playbook"
seoTopicId: eye-care-recall-attribution-playbook
---
## Table of Contents

- [Define the recall population before assigning credit](#define-the-recall-population-before-assigning-credit)
- [Build a shared record of outreach and appointment events](#build-a-shared-record-of-outreach-and-appointment-events)
- [Choose an attribution rule that teams can apply consistently](#choose-an-attribution-rule-that-teams-can-apply-consistently)
- [Track bookings and completed visits separately](#track-bookings-and-completed-visits-separately)
- [Assign ownership across locations and centralized teams](#assign-ownership-across-locations-and-centralized-teams)
- [Make the executive scorecard interpretable](#make-the-executive-scorecard-interpretable)
- [Put the playbook into operation](#put-the-playbook-into-operation)


An **eye care recall attribution playbook** defines how a group connects an eligible recall need, documented outreach, an appointment booking, and the eventual visit. For COOs, VPs of Operations, and buying committees overseeing multiple locations, it should answer a practical question: what evidence supports the credit assigned to a recall channel or team?

Consider a workflow in which mailed outreach is followed by a callback, a centralized scheduling conversation, and an appointment at another location. Your reporting needs rules for the initiating outreach, the booking interaction, the responsible team, and the destination office. Otherwise, the same booking can appear in several reports under different explanations.

The playbook below proposes an operating framework. Use it to agree on definitions before comparing locations, evaluating an external recall service, or changing your outreach mix.

## Define the recall population before assigning credit

### Separate unscheduled recall from appointment reminders

Define recall as outreach about a due or overdue visit that still needs scheduling. Keep reminders for existing appointments in a separate workflow. Also distinguish routine recall from dormant-patient reactivation, cancellation recovery, and other scheduling work, using definitions approved by your group.

Record the appointment state when the recall episode begins. If an appointment already exists, a later confirmation should not become a new recall booking. If a booking predates the outreach, exclude it from outreach-attributed bookings.

A recall episode should represent a particular scheduling need. Do not treat every outbound attempt as a fresh opportunity. Keep clinical decisions about visit type and follow-up timing with the appropriate clinical team; the attribution framework should record those decisions.

### Establish eligibility and exclusion rules

Write down what qualifies a record for the recall cohort, when eligibility is assessed, and which exclusions apply. Define how to handle existing appointments, completed care, duplicate records, and unresolved eligibility questions. Keep an initial cohort snapshot and a documented reconciliation of later corrections.

The American Dental Association recommends generating “monthly reports of overdue patients” and designating a team member to contact them.

Although this guidance concerns dental recare, its list-and-owner structure is a useful starting point for an eye-care operating procedure. [American Dental Association: Recare Appointments](https://www.ada.org/resources/practice/practice-management/recare-appointments)

For this playbook, retain exclusion reasons alongside aggregate cohort totals. Do not silently remove unsuccessful outreach from the denominator. Treat a confirmed eligibility correction differently from an eligible episode that has not produced a booking.

## Build a shared record of outreach and appointment events

### Use consistent channel definitions

The American Optometric Association outlines mail, telephone, in-office, and computer-assisted recall, along with preappointments. Its “Recall strategies” section provides a foundation for distinguishing the activities that your reporting needs to capture.

[American Optometric Association: Patient Communication](https://www.aoa.org/practice/new-doctors-of-optometry/patient-communication)

Create a group vocabulary for those activities. Where your workflow uses automated calls, personal calls, text, or email, record the specific method instead of combining everything under an ambiguous “digital” category. Treat these as your operating labels; the vocabulary itself does not establish channel effectiveness.

Keep the communication channel separate from the team doing the work. Telephone outreach might originate from a location, a centralized team, or an external service. Also record the booking route separately: an inbound callback is different from the outbound attempt that preceded it.

### Preserve the sequence and the evidence

Within approved operational systems, connect recall episodes to outreach events and appointment records. Preserve event timestamps and distinguish them from the time information was imported into reporting. An imported record should not appear to have occurred after a booking merely because it arrived later.

Use a shared event dictionary:

| Event | Recommended definition | Attribution implication |
| --- | --- | --- |
| Eligible episode opened | A scheduling need meets the agreed inclusion rules | Establishes cohort membership |
| Outreach attempted | An approved recall action is recorded | Shows activity without assuming a response |
| Response documented | A response is linked to the episode | Supports a documented interaction |
| Appointment booked | A corresponding appointment is created | Establishes the booking outcome |
| Visit completed | The linked appointment has a verified completion status | Establishes the completed-visit outcome |
| Episode corrected or closed | A documented exclusion or closure reason applies | Explains the final disposition |

Keep identifying records inside approved systems. Use aggregate operational information in executive reports, and avoid copying patient details into presentation decks or informal reconciliation files.

## Choose an attribution rule that teams can apply consistently

### Define primary credit and supporting interactions

Select a primary attribution rule before launching a campaign. A workable starting point is to assign primary credit to the last documented recall interaction explicitly linked to the booking, provided it falls within the group's agreed attribution window.

Define when that window starts, when it ends, and how a renewed recall episode is handled. Choose a window that fits your workflow and reporting purpose; do not present it as an industry benchmark.

Preserve earlier documented outreach as supporting interactions. A mailed notice may precede a personal call that results in scheduling. Your report can show the mail as an assist and the call as the primary booking interaction, without adding both channel totals together as separate bookings.

This is a proposed accounting convention for operational reporting. A booking after outreach establishes a sequence; that sequence alone does not establish that the outreach caused the booking.

### Keep uncertain credit visible

Define what counts as adequate evidence. Direct linkage in the scheduling workflow can support a different confidence label from a general recollection entered afterward. Keep self-reported source information distinguishable from system-linked events.

When an inbound booking cannot be connected to a recall episode, use an unattributed category. Do not assign it to the most recent campaign solely because the campaign was active.

Specify how to handle overlapping campaigns and simultaneous interactions. If the evidence cannot distinguish between them, retain an unresolved attribution status rather than forcing a channel winner. Publish that unresolved category with the rest of the report so the buying committee can assess the limits of the data.

## Track bookings and completed visits separately

### Maintain distinct outcome measures

The randomized study *Improving Follow-Up Adherence in a Primary Eye Care Setting* compared usual care, automated calls, and personalized calls. It identified adherence to the follow-up appointment as the primary outcome and appointment scheduling as the secondary outcome.

That distinction supports separate reporting for bookings and completed visits. [Study abstract on PubMed](https://pubmed.ncbi.nlm.nih.gov/26656245)

For your operating report, define a booking measure using eligible recall episodes with a qualifying linked appointment. Define a completed-visit measure using episodes with verified completion of the corresponding visit. Name the denominator for each measure explicitly.

When reporting completion among booked episodes, specify which appointments have reached their scheduled date and which remain in the future. Keep pending appointments visible. A recently booked appointment should not be labeled a failed completed visit simply because its date has not arrived.

### Reconcile cancellations, reschedules, and unknown outcomes

The trial comparing mailed letters, phone calls, combined outreach, and usual care excluded patients already screened or already scheduled from the relevant analysis.

The authors also acknowledged that their “primary outcome was booking of an appointment.” These details support explicit eligibility checks and a clear boundary between scheduling evidence and attendance evidence. [Randomized screening-engagement trial on PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC9878360)

Write rules for canceled appointments, reschedules, no-shows, and missing status updates. Link replacement appointments to the original episode where they address the same scheduling need. Do not count an appointment moved to another date as a fresh recall conversion.

If completion data are unavailable, label the outcome unknown. Do not infer a completed visit from the continued presence of an appointment, or infer absence of care from a missing reporting feed. Give unresolved outcomes an owner and a reconciliation process.

## Assign ownership across locations and centralized teams

### Separate responsibility from destination

Maintain distinct fields for the location responsible for the recall need, the team handling outreach, the team creating the booking, and the location scheduled to provide the visit.

For a cross-location booking, preserve each role. The originating office can retain visibility into its recall cohort while the destination office sees the scheduled work. At group level, count the qualifying recall episode according to the agreed deduplication rule, regardless of how many teams participated.

Document how responsibility changes after a transfer. A scheduling handoff should not automatically open a new recall episode or erase the history of the existing one. Apply the same rules to location staff, centralized employees, and external service providers.

### Give exceptions a named owner

Assign operational roles before reporting begins. The recall program owner should maintain definitions and resolve attribution disputes. Location leaders should validate local scheduling rules and appointment dispositions. Reporting owners should maintain the mapping between operational records and group metrics.

Create an exception queue for unmatched bookings, conflicting appointment statuses, duplicate episodes, and incomplete transfers. Each exception needs a responsible role, a next action, and a resolution status.

Treat unavailable appointment capacity as a distinct operational disposition when it is documented. Keep it visible alongside outreach outcomes so leadership can review the scheduling constraint. Do not recategorize it as an eligibility exclusion merely to change the campaign's reported result.

## Make the executive scorecard interpretable

### Publish definitions beside the measures

Build the scorecard around questions leadership needs to answer. Show the cohort period, reporting cutoff, attribution rule, exclusions, and pending outcomes alongside the measures.

| Leadership question | Recommended measure | Interpretation rule |
| --- | --- | --- |
| What work entered the program? | Eligible recall episodes | Use the reconciled cohort definition |
| What work was attempted? | Episodes with documented outreach | Count episodes separately from attempts |
| What scheduling followed? | Episodes with qualifying linked bookings | Apply the published credit rule |
| What care was completed? | Episodes with verified linked completions | Show future and unknown outcomes separately |
| How much credit remains uncertain? | Bookings with unresolved or unattributed sources | Preserve the evidence limitation |

Show counts beside any rates, with clearly named denominators. Do not compare a rate based on attempted episodes with another based on the entire eligible cohort without identifying the difference. Keep channel assists separate from primary booking totals.

### Review costs and operating context

*Optometric Management* describes calculating recall labor costs, comparing internal work with external services, and monitoring recall-system effectiveness. It also discusses monthly recall reports and checking scheduling triggers. [Implement a Patient Recall System](https://optometricmanagement.com/issues/2021/march/implement-a-patient-recall-system)

Use that guidance to define the cost information your group will collect. Record the scope of recall labor, associated outreach expenses, and which activities an external quote includes. Keep cost comparisons aligned with equivalent work and the same outcome definition.

Accompany location comparisons with relevant operating context: cohort eligibility, outreach mix, appointment availability, attribution completeness, and unresolved outcomes.

Ask whether those definitions and conditions are sufficiently comparable before drawing conclusions about a team or channel. Set targets from your approved operating plan without inventing an external benchmark.

## Put the playbook into operation

### Validate the workflow before relying on the dashboard

Begin with a bounded rollout using the agreed definitions. Use synthetic event sequences to check how the reporting handles an existing appointment, overlapping outreach, an inbound callback, a cross-location booking, a reschedule, and a missing completion update.

For each sequence, write the expected cohort status, primary credit, supporting interactions, responsible location, and final outcome. Have operational and reporting owners reconcile disagreements before expanding the workflow.

Require an internal or external recall team to use the same event definitions and exception process. In a buying discussion, request a demonstration of how a reported booking connects to its underlying operational events. Review aggregate examples without sharing patient details.

### Review the rules and record changes

*Optometric Management* advises teams to “note the effectiveness of each recall method” and establish measurable goals. Use that as the basis for a recurring operational review of channel reporting and the definitions behind it.

[Optometric Management: recall-method review](https://www.optometricmanagement.com/issues/2024/novemberdecember/new-year-new-efficiency-reviewing-office-systems-for-a-smooth-start)

Review eligibility corrections, unresolved attribution, appointment-status reconciliation, and cross-location handoffs. Assign actions to specific roles. Keep a version history when definitions change, and state whether historical results were restated.

Before approving a larger rollout or vendor engagement, have the buying committee confirm the cohort definition, credit rule, outcome measures, reporting ownership, and exception responsibilities. These are concrete requirements that can be reviewed in a workflow demonstration and included in the operating agreement.

**For optometry owners and operations leaders at practices of any size:** [Schedule a short MyBCAT discovery call](/contact/) to discuss your recall operating model. Bring your current workflow, location-routing rules, and an aggregate report so the conversation can focus on ownership, attribution requirements, and service scope.

## Related Reading

### Recall ownership and workflow

- [Centralized patient recall across multiple locations](/blog/centralized-patient-recall-multi-location/)
- Cross-location patient recall ownership
- Recall list data hygiene across EHR systems

### Channel planning and operational reporting

- [Patient recall: postcard vs. text vs. phone](/blog/patient-recall-postcard-vs-text-vs-phone/)
- [Recall program KPIs for healthcare operators](/blog/recall-program-kpi-healthcare-operators/)
- [Reporting dashboards for multi-site healthcare operations](/blog/reporting-dashboard-multi-site-healthcare-operations/)

## Sources

### Professional guidance and practice operations

- **American Optometric Association:** [Patient Communication](https://www.aoa.org/practice/new-doctors-of-optometry/patient-communication). Recall approaches and preappointments.
- **American Dental Association:** [Recare Appointments](https://www.ada.org/resources/practice/practice-management/recare-appointments). Dental recare reporting and assigned outreach responsibility.
- **Optometric Management:** [Implement a Patient Recall System](https://optometricmanagement.com/issues/2021/march/implement-a-patient-recall-system). Recall labor costs, scheduling triggers, and monitoring.
- **Optometric Management:** [New Year, New Efficiency: Reviewing Office Systems for a Smooth Start](https://www.optometricmanagement.com/issues/2024/novemberdecember/new-year-new-efficiency-reviewing-office-systems-for-a-smooth-start). Recall-method review and measurable goals.

### Research on scheduling and follow-up outcomes

- **PubMed:** [Improving Follow-Up Adherence in a Primary Eye Care Setting](https://pubmed.ncbi.nlm.nih.gov/26656245). Distinct scheduling and appointment-adherence outcomes.
- **PubMed Central:** [Mailed Letter Versus Phone Call: Randomized Screening-Engagement Trial](https://pmc.ncbi.nlm.nih.gov/articles/PMC9878360). Outreach comparisons, eligibility exclusions, and a booking-based outcome.
