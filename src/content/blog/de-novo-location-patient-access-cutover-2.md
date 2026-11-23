---
title: De Novo Location Patient Access Cutover Playbook
seoTitle: De Novo Location Patient Access Cutover Playbook
description: A de novo location patient access cutover playbook for multi-location
  groups standardizing scheduling, intake, QA, and reporting before go-live.
seoDescription: Use this de novo location patient access cutover guide to centralize
  scheduling, PMS readiness, QA, and rollout governance across sites.
publishDate: '2026-10-17'
status: draft
seoTopicId: de-novo-location-patient-access-cutover-2
scheduledDate: '2026-10-17'
author: Ankit Patel
category: Business
tags:
- de novo location patient access cutover
- multi-location
- enterprise operations
- healthcare scale
cluster: enterprise
featuredImage: /images/blog/de-novo-location-patient-access-cutover-2.webp
canonical: https://mybcat.com/blog/de-novo-location-patient-access-cutover-2/
targetKeyword: "de novo location patient access cutover"
---
## Table of Contents

- [What Is A De Novo Location Patient Access Cutover?](#what-is-a-de-novo-location-patient-access-cutover)
- [Why Does Cutover Planning Change At Enterprise Scale?](#why-does-cutover-planning-change-at-enterprise-scale)
- [How Should Leaders Build The Cutover Runbook?](#how-should-leaders-build-the-cutover-runbook)
- [What Must Be Tested Before Go-Live?](#what-must-be-tested-before-go-live)
- [How Should Go-Live Be Governed Across Locations?](#how-should-go-live-be-governed-across-locations)
- [What Should The Buying Committee Review Before Scaling?](#what-should-the-buying-committee-review-before-scaling)


A de novo location patient access cutover is not just a go-live task. For COOs, VPs of Operations, and buying committees, it is the operating handoff between site launch planning and the centralized access model that will carry demand after opening.

The work covers calls, scheduling, registration, insurance-related intake, routing rules, PMS readiness, patient communication, QA calibration, and enterprise reporting, which aligns with implementation guidance covering workflow redesign, training, testing, patient registration, scheduling, preregistration, and reporting ([S2: ONC](https://healthit.gov/clinical-quality-and-safety/safer-guides/implementing-health-it); [S3: Health IT Playbook](https://playbook.healthit.gov/playbook/electronic-health-records/); [S6: AMA](https://www.ama-assn.org/practice-management/claims-processing/how-select-practice-management-system)).

At scale, the risk is not that one person forgets a checklist item. The bigger risk is that every new location learns access operations differently, creates its own workarounds, and adds another variant to the platform. A group that is already investing in an [enterprise operating model](/enterprise/) needs every de novo cutover to strengthen standardization, not create another exception layer.

The cutover plan should connect the physical opening, the practice management system, the [patient access center](/enterprise/patient-access-center/), and the [centralized scheduling model](/enterprise/centralized-scheduling/) before go-live.

UCSF Health provides a useful patient access cutover example: its dry-run planning has patient access staff practice creating test patients and working admission workflows before the live transition ([S1: UCSF Health](https://sfch.ucsfhealth.org/cutover-and-cutover-dry-runs)).

That kind of rehearsal mindset matters for enterprise groups because the go-live is not the time to discover that scheduling rules, registration fields, or escalation paths are unclear.

The federal Health IT Playbook also frames EHR adoption as a broader implementation journey involving workflow redesign, training, testing, mock go-lives, and data migration ([S3: Health IT Playbook](https://playbook.healthit.gov/playbook/electronic-health-records/)).

The enterprise lesson is straightforward: patient access cutover should be managed as a repeatable deployment system, not as a one-off opening task.

## What Is A De Novo Location Patient Access Cutover?

A de novo location patient access cutover is the planned transition from pre-opening preparation to live patient access operations. It defines how callers, web requests, scheduling queues, registration tasks, and access escalations move through the group once the location is ready to receive demand.

The cutover is successful only if the centralized team, site team, revenue cycle stakeholders, and technology owners share the same operating script.

In a multi-location group, that script needs to survive beyond launch week. The same model should be usable when the group opens another site, integrates a new service line, or expands centralized intake coverage.

That is why de novo cutover should be documented as part of a broader [enterprise patient access implementation plan](/blog/enterprise-patient-access-center-implementation/), not stored as a launch checklist that disappears after the opening.

### The Scope Is Broader Than Phone Coverage

Patient access includes the first operational touchpoints that turn demand into a usable next step. That can include inbound calls, online appointment requests, preregistration, patient record lookup, location routing, scheduling rule application, reminder responses, recall handoffs, and unresolved request management.

The cutover should define which of those workflows are live at launch and which remain out of scope until leadership approves expansion.

The scope should also define what the access team may complete directly and what requires escalation. For example, a centralized scheduler may be able to book approved appointment types, route insurance-related questions to revenue cycle, and create a task for site review when a rule is unclear. The cutover plan should not ask agents to infer clinical judgment or site policy from incomplete launch notes.

### The Enterprise Risk Is Operational Variation

De novo locations often create variation because everything feels urgent before opening. Site leaders want callers served, providers want schedules filled, marketing wants demand captured, and operations wants the launch to look controlled. Without a governed cutover, each stakeholder may solve the immediate problem in a different system, document, queue, or side process.

That variation can affect operating visibility because it makes the access model harder to compare, manage, and scale. Leaders cannot calibrate SLAs, QA, staffing, or schedule utilization cleanly if every de novo location uses different definitions for the same patient access work.

The cutover should therefore treat variation as an explicit governance issue, not as a training detail to be cleaned up later.

## Why Does Cutover Planning Change At Enterprise Scale?

Enterprise cutover planning changes because the new location is joining an existing operating system. The group is not merely opening a site; it is adding another demand point to a shared access model. That means the plan must account for centralized reporting, standard call dispositions, common routing logic, role-based system access, and consistent QA review.

For a buying committee, the right question is not whether the team can make the launch work. It is whether the cutover process creates a template that can be repeated without increasing management drag. A repeatable template lets the group compare locations, identify access friction, and determine which launch issues are training issues, system issues, capacity issues, or site-specific exceptions.

### Demand, Supply, And Templates Need Shared Definitions

AHRQ guidance on open access scheduling emphasizes measuring supply and demand, reducing appointment backlog, and redesigning templates to improve timely access ([S4: AHRQ](https://www.ahrq.gov/cahps/quality-improvement/improvement-guide/6-strategies-for-improving/access/strategy6a-openaccess.html)).

In a de novo cutover, that means the access team needs more than a list of open slots. It needs approved appointment categories, provider rules, template constraints, and escalation paths for requests the schedule cannot absorb.

These definitions should be enterprise-owned. If each location defines appointment types differently, the access center cannot reliably classify demand or compare schedule friction across the group. The same logic applies to online requests, overflow calls, and recall-driven scheduling. The de novo site may be new, but its demand definitions should fit the group’s shared reporting language.

### PMS Readiness Is A Front-Office Control Point

The practice management system is a central cutover dependency because it houses much of the administrative workflow.

The AMA describes PMS capabilities such as capturing patient demographics, scheduling appointments, preregistering patients with eligibility and benefit checks, maintaining payer lists, performing billing, and generating reports ([S6: AMA](https://www.ama-assn.org/practice-management/claims-processing/how-select-practice-management-system)).

If those capabilities are not configured and tested before access work goes live, agents may be forced into manual workarounds.

The cutover plan should confirm that users can find the right location, appointment type, provider template, patient record, payer field, and reporting category. It should also specify how to handle incomplete PMS data during launch. The goal is not to make every edge case disappear. The goal is to give the access team approved choices when the system returns an incomplete answer.

## How Should Leaders Build The Cutover Runbook?

The cutover runbook should be the operational source of truth for opening patient access at the de novo site. It should be written for the people who will run the workflow, not only for executives reviewing the launch. A practical runbook tells agents what to do, supervisors what to monitor, site leaders what to expect, and executives how readiness will be judged.

This is also where centralization becomes tangible. The runbook should connect the de novo launch to the group’s location routing rules, [front desk outsourcing model](/solutions/front-desk-outsourcing/), integration requirements, and reporting cadence.

If the runbook only describes site opening tasks, it will miss the enterprise patient access layer that determines whether the location is absorbed into the platform.

### Assign Ownership Before Go-Live

Every workflow in the runbook should have an owner. Scheduling rules may belong to operations. PMS access may belong to IT or system administration. Insurance-related intake may require revenue cycle input. Script language and escalation categories may require review from patient access leadership and site operations.

Ownership also needs change control. If a provider template changes, if the location adjusts hours, if a payer rule becomes unclear, or if the access team identifies a recurring caller issue, the team needs a way to update the rulebook without creating side instructions. The runbook should define who approves the change, where it is documented, and how agents are notified.

### Define Fallback Paths Instead Of Workarounds

Cutovers fail operationally when agents are left to invent fallback paths. A caller wants a visit type that is not available. An online request lacks required information. A patient appears to have a duplicate record. A payer field is unclear. A schedule template does not match the approved launch plan. Each of these moments needs an approved route.

Fallback paths should be explicit: book, route, task, escalate, or hold for review. They should also define the receiving owner and required documentation. This protects the access team from guessing and protects the site team from receiving incomplete handoffs. It also gives leadership better visibility into which launch issues are temporary and which point to a deeper workflow design problem.

## What Must Be Tested Before Go-Live?

Testing should prove that the patient access workflow can run from first contact to completed next step. That means testing more than phone scripts. The group should test scheduling logic, PMS permissions, patient lookup, new patient record creation rules, location routing, web request handling, escalation paths, reporting categories, and supervisor review.

ONC guidance connects implementation work with workflow process mapping, patient registration, new patient record creation, and patient identification risks ([S2: ONC](https://healthit.gov/clinical-quality-and-safety/safer-guides/implementing-health-it)).

For de novo launches, that creates a clear planning principle: test the workflow where patient information enters the system, not only where the phone is answered.

### Dry-Run The Access Workflow

A dry run should mimic the live work agents will perform. The team can practice answering launch-related calls, creating approved tasks, selecting appointment types, identifying the correct location, applying routing rules, documenting outcomes, and escalating cases that fall outside the playbook.

The UCSF Health cutover example is useful because it treats patient access dry runs as operational practice, including test patients and admission workflow rehearsal before go-live ([S1: UCSF Health](https://sfch.ucsfhealth.org/cutover-and-cutover-dry-runs)).

Dry runs should include supervisors and receiving site contacts. Agents need to know how to act, but site teams also need to see what will arrive in their queues. If a routed task lacks the needed detail, the issue should be corrected before launch. If a location-specific exception is unclear, it should be resolved through governance rather than left as verbal guidance.

### Test Identity, Routing, And PMS Tasks

Patient identity and record creation deserve particular attention. ONC guidance includes patient identification considerations focused on patient registration, new patient record creation, retrieval of existing records, and risks such as duplicate or mixed records ([S2: ONC](https://healthit.gov/clinical-quality-and-safety/safer-guides/implementing-health-it)).

A de novo access plan should therefore define how agents search before creating, what fields are required, and when uncertainty moves to a review path.

PMS testing should also cover the administrative tasks that support patient access. That includes demographics capture, appointment scheduling, preregistration, eligibility-related fields, payer lists, billing handoffs, and reporting categories as described in AMA PMS guidance ([S6: AMA](https://www.ama-assn.org/practice-management/claims-processing/how-select-practice-management-system)).

When these steps are tested together, the group learns whether the cutover can support real work rather than isolated system access.

## How Should Go-Live Be Governed Across Locations?

Go-live governance should create a visible operating rhythm for the launch. The group needs a central owner, site contacts, access supervisors, system support, and a process for triaging issues. This does not require heavy bureaucracy. It requires a shared way to separate launch noise from material workflow risk.

Governance also keeps the de novo site from becoming an exception factory. The new location will have legitimate launch conditions, but those conditions should be reviewed against enterprise standards. If the group approves a temporary exception, the exception should have an owner and review path. If the exception reflects a better enterprise rule, the group should update the shared model.

### Use A Command Structure For Decisions

A command structure gives the access team a place to take unresolved issues. It should identify who answers scheduling rule questions, who handles PMS access issues, who approves script changes, who manages site escalations, and who reviews reporting defects. The structure should be clear enough that supervisors can make decisions without waiting for informal consensus.

The command structure should also define what gets escalated to executives. Not every issue needs the COO, but recurring access blockers, unresolved technology defects, patient communication confusion, and material staffing gaps deserve leadership visibility. The goal is disciplined decision-making, not more meetings.

### Calibrate QA And SLAs Against The Launch Model

QA calibration should begin during cutover, not after the location is fully normalized. Supervisors should review whether agents used the approved greeting, selected the correct workflow, applied routing rules, documented outcomes, and escalated correctly. For an enterprise group, this is the moment when training quality becomes observable.

SLA calibration should be treated as a management exercise rather than a borrowed benchmark. The group should define service expectations that fit its access model, staffing approach, channels, and launch conditions. A [multi-location intake dashboard](/blog/kpi-dashboard-multi-location-intake/) can then track whether the de novo location is entering the operating cadence in a comparable way.

## What Should The Buying Committee Review Before Scaling?

The buying committee should review cutover readiness as a scalability question. If the de novo location cannot be launched into the centralized access model cleanly, adding more sites will magnify the same friction. The review should focus on repeatability, governance, data quality, escalation clarity, and reporting usefulness.

This is also the right time to connect patient access cutover to vendor evaluation. A partner that supports [healthcare software integrations](/solutions/integrations/) should be able to explain how scheduling rules, PMS access, reporting, QA, and issue management are handled during launch. A partner that only promises coverage may not be prepared to operate inside an enterprise cutover model.

### Review Readiness Evidence

Readiness evidence should come from completed dry runs, training signoff, system access validation, routing-rule review, PMS task testing, issue logs, QA findings, and site feedback. The review should ask whether the access team can complete the approved workflows and whether unresolved gaps have named owners. It should also ask whether reporting categories are ready for executive review.

MGMA’s patient access and scheduling research overview focuses on appointment scheduling, patient portal adoption, wait times, staffing, and tactics for improving access in medical groups ([S5: MGMA](https://www.mgma.com/deep-dives/maximizing-patient-access-and-scheduling)).

That reinforces the need to treat de novo cutover as an operating model decision. Scheduling, staffing, digital access, and reporting are connected, so readiness evidence should cover the full access pathway.

### Decide What Is Ready To Scale

A location is ready to scale into the enterprise model when the workflows are documented, tested, governed, and reportable. That does not mean every condition is perfect. It means leaders know which issues are controlled, which need monitoring, and which should block expansion until resolved.

The final scale decision should produce a short list of approved standards, open issues, temporary exceptions, and lessons for the next de novo launch. That record is valuable because it turns each opening into operational learning. Over time, the group builds a more repeatable playbook for expansion, centralization, and patient access governance.

## Related Reading

Related reading should help the buying committee connect this cutover plan to the larger operating model. The links below are for navigation inside the MyBCAT site, not factual source support. Use them to compare adjacent decisions around patient access implementation, routing, reporting, and procurement.

For enterprise groups, the most useful related content is usually the content that clarifies ownership. A cutover problem may look like a staffing issue, a routing issue, a PMS issue, or a vendor issue depending on where it appears. These companion articles help separate those questions before the next launch wave.

### Implementation Planning

These resources are useful when a COO or VP of Operations is defining the shared model before a de novo site enters the access center. They focus on implementation structure, centralized scheduling rollout, and patient access procurement. That makes them relevant before the launch plan reaches the training stage.

- [Enterprise Patient Access Center Implementation](/blog/enterprise-patient-access-center-implementation/)
- [Centralized Scheduling Rollout for Multi-Location Practices](/blog/centralized-scheduling-rollout-multi-location-practices/)
- [Patient Access Center RFP Vendor Checklist](/blog/patient-access-center-rfp-vendor-checklist-enterprise/)

### Reporting And Governance

These resources are useful after the workflow is defined and leadership needs to govern performance across locations. They focus on routing rules and dashboard design. That makes them relevant for post-launch calibration and enterprise operating reviews.

- Location Routing Rules for Centralized Patient Access
- [KPI Dashboard for Multi-Location Intake](/blog/kpi-dashboard-multi-location-intake/)

## Sources

1. [UCSF Health, Cutover and Cutover Dry Runs](https://sfch.ucsfhealth.org/cutover-and-cutover-dry-runs)
2. [ONC, Implementing Health IT](https://healthit.gov/clinical-quality-and-safety/safer-guides/implementing-health-it)
3. [Health IT Playbook, Electronic Health Records](https://playbook.healthit.gov/playbook/electronic-health-records/)
4. [AHRQ, Open Access Scheduling for Routine and Urgent Appointments](https://www.ahrq.gov/cahps/quality-improvement/improvement-guide/6-strategies-for-improving/access/strategy6a-openaccess.html)
5. [MGMA, Maximizing Patient Access and Scheduling](https://www.mgma.com/deep-dives/maximizing-patient-access-and-scheduling)
6. [AMA, How to Select a Practice Management System](https://www.ama-assn.org/practice-management/claims-processing/how-select-practice-management-system)

*Managing de novo location patient access cutover across 3+ locations? [Request an Enterprise Assessment for your group.](/contact/)*