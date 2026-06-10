# Payload Admin Migration Audit

This repo is currently replacing the Django project at `C:\Users\user\Downloads\nest\nest`.

The public website is already being moved into Next.js UI code. The next phase is the internal/admin side, with Payload v3 acting as the headless backend and admin system inside this same repo.

## Scope reviewed

The following Django apps were inspected:

- `members`
- `attendance`
- `departments`
- `reports`
- `counseling`
- `messaging`
- `sms`
- public-side models in `web` that affect internal dashboards and reporting

## Core domain findings

### 1. `Member` is the center of the admin data model

The internal system is organized around `members.models.Member`.

Important fields:

- identity: `first_name`, `middle_name`, `last_name`, `nickname`
- contact: `email`, `phone_number`, `whatsapp_number`, `home_address`
- demographics: `nationality`, `tribe`, `marital_status`, `date_of_birth`
- church status: `department`, `is_new_comer`, `date_joined`
- household/attendance context: `number_of_cars`, `number_of_children`
- media: `profile_picture`
- auth relation: `user`

Related models:

- `MemberProfile`
- `ProfileUpdateRequest`
- `Attendance`
- `Booking` from counseling
- `BroadcastMessage` / `MessageLog`

### 2. Attendance is event-like, but currently modeled as one record per member per date

`attendance.models.Attendance`:

- `member`
- `date`
- `present`
- `number_of_cars`
- `number_of_children`

Constraints:

- unique per `member + date`

Current behavior:

- daily attendance marking
- search/filter by date, department, status
- derived absentee reports
- newcomer return tracking

### 3. Departments are simple, but operationally important

`departments.models.Department` is small:

- `name`
- `description`
- `reporting_channel`
- `created_at`

But departments drive:

- member assignment
- attendance grouping
- service report ownership
- messaging segmentation

### 4. Reports is an aggregate app, not a primary source of truth

`reports.models` contains:

- `Service`
- `ServiceReport`
- `ReportInstruction`
- `ServiceReportTemplate`

The `report_overview` view aggregates data from:

- attendance
- members
- departments
- donations
- prayer requests
- prayer responses
- testimonies
- events
- event registrations
- blog posts
- livestreams
- counseling bookings

This means the reporting layer in Payload should mostly query other collections, not duplicate their state.

### 5. Counseling is booking-based

`counseling.models` contains:

- `CounselingSession`
- `Booking`

This is a clean candidate for Payload collections with custom access rules and some dashboard views.

### 6. Messaging is partly templates/settings, partly workflow

`messaging.models` contains:

- `MessageTemplate`
- `MessageLog`
- `BroadcastMessage`
- `MessagingSettings`

`sms` appears to be a parallel channel-specific app and should probably be merged conceptually into one outbound communications model during migration.

## Recommended Payload ownership model

## Auth / admin users

Use a dedicated auth-enabled collection for admin/staff users.

Suggested collection:

- `admins`

Suggested fields:

- `name`
- `email`
- `roles`
- `department`
- `isSuperAdmin`
- `permissions` if needed later

Why:

- Payload admin login should not reuse member records
- internal operators and church members are different concepts

Official basis:

- Payload auth-enabled collections can back the admin panel: https://payloadcms.com/docs/admin/overview

## Recommended collections

### `members`

Primary collection replacing `Member` and `MemberProfile`.

Suggested merge:

- keep one Payload collection instead of splitting `Member` + `MemberProfile`
- flatten the profile fields into one document unless there is a strong reason to separate them

Suggested tabs/groups:

- identity
- contact
- demographics
- church profile
- discipleship / spiritual info
- work & study
- interests / availability

Relationships:

- `department -> departments`
- `preferredDepartment -> departments`

### `departments`

Direct replacement of `Department`.

Suggested fields:

- `name`
- `slug`
- `description`
- `reportingChannel`
- `isActive`

### `services`

Payload collection replacing `reports.models.Service`.

Suggested fields:

- `name`
- `date`
- `startTime`
- `endTime`
- `serviceType`
- `isActive`

Optional:

- derived counters should usually be computed, not manually stored, unless you need snapshotting

### `attendance-records`

Payload collection replacing `Attendance`.

Suggested fields:

- `member -> members`
- `service -> services` or `date`
- `date`
- `present`
- `numberOfCars`
- `numberOfChildren`

Recommendation:

- prefer linking attendance to `service` when applicable
- keep `date` too for filtering/reporting

This gives a cleaner long-term model than plain date-only records.

### `service-reports`

Payload collection replacing `ServiceReport`.

Suggested fields:

- `service -> services`
- `department -> departments`
- `submittedBy -> admins`
- `reportContent`
- `departmentAttendance`
- `volunteersCount`
- `attachmentUrl`
- `isApproved`
- `approvedBy -> admins`
- `approvedAt`

Enforce unique:

- one `service + department` report

Use collection hooks to:

- set `approvedAt`
- set `submittedBy`
- optionally validate department permissions

Official basis:

- collection hooks: https://payloadcms.com/docs/hooks/collections

### `report-instructions`

Payload collection or possibly a one-to-one config pattern.

Suggested fields:

- `department -> departments`
- `instructionTitle`
- `instructionContent`

### `report-templates`

Suggested fields:

- `name`
- `description`
- `templateContent`
- `applicableDepartments -> departments[]`
- `isActive`

### `counseling-sessions`

Suggested fields:

- `dayOfWeek`
- `startTime`
- `endTime`
- `maxAttendees`
- `isActive`

### `counseling-bookings`

Suggested fields:

- `session -> counseling-sessions`
- `member -> members`
- `bookingDate`
- `notes`
- `isConfirmed`

Enforce unique:

- `session + member + bookingDate`

### `message-templates`

Suggested fields:

- `name`
- `messageType`
- `subject`
- `messageBody`
- `isActive`

### `broadcasts`

Suggested fields:

- `sender -> admins`
- `recipients -> members[]`
- `subject`
- `messageBody`
- `messageChannel`
- `status`
- `successCount`
- `failureCount`
- `sentAt`

### `message-logs`

Suggested fields:

- `member -> members`
- `messageType`
- `subject`
- `messageBody`
- `status`
- `sentAt`

## Recommended globals

These Django singleton models are better expressed as Payload globals:

- `notification-settings` from `members.NotificationSetting`
- `messaging-settings` from `messaging.MessagingSettings`
- `absentee-notification-settings` from `attendance.AbsenteeNotificationSetting`
- `site-settings` from `members.SiteSetting` if still needed

Why globals:

- they are true singleton configuration objects
- Payload globals fit that use case directly

## Access-control model

Use Payload collection access to restrict who can read/update what.

Suggested baseline:

- super admins: full access
- staff/admin users: scoped access by role
- department leads: only their department reports and perhaps their department members

Examples:

- `members`: read/update by admin roles, maybe filtered by department
- `service-reports`: submit for own department, approve only by higher role
- `broadcasts`: create only by staff/admin
- `message-templates`: manage only by admin roles

Official basis:

- collection access control: https://payloadcms.com/docs/access-control/collections

## Jobs / automations that should move to Payload

The Django project currently uses management commands and scheduled tasks for:

- birthday emails
- absentee notifications
- checkup emails
- Saturday reminders
- automated member messaging
- report emails

These are good candidates for Payload jobs/tasks.

Recommended task groups:

- `sendBirthdayEmails`
- `sendAbsenteeNotifications`
- `sendCheckupEmails`
- `sendAutomatedMessages`
- `sendAdminReports`

Official basis:

- scheduled tasks / jobs: https://payloadcms.com/docs/jobs-queue/tasks

## What should stay custom UI instead of default Payload screens

Payload should own the data and admin APIs, but these features are likely better as custom Next.js admin screens:

- fast attendance marking grid
- aggregate report overview dashboard
- member search + broadcast compose flow
- newcomer / absentee reports
- counseling day view

Why:

- these are operational workflows, not just CRUD forms
- the current Django app already behaves more like an internal operations dashboard than a plain CMS

Payload still helps because:

- collections store the data
- admin panel covers raw CRUD
- Local API supports custom internal screens in the same repo

Official basis:

- Payload Local API: https://payloadcms.com/docs/local-api/overview

## Recommended implementation order

### Phase 1: foundation

- add Payload v3 into this repo
- create `admins` auth collection
- create `departments`
- create `members`

### Phase 2: attendance + services

- create `services`
- create `attendance-records`
- build custom attendance marking UI in Next.js

### Phase 3: internal reporting

- create `service-reports`
- create `report-instructions`
- create `report-templates`
- build custom service overview dashboard

### Phase 4: communications

- create `message-templates`
- create `message-logs`
- create `broadcasts`
- add Payload jobs for automation

### Phase 5: counseling

- create `counseling-sessions`
- create `counseling-bookings`
- build staff dashboard / daily report screen

## Important migration note

The current Django admin side is not one single “admin panel”. It is a combination of:

- source-of-truth records
- singleton configuration
- operational dashboards
- scheduled automations
- cross-domain reporting

So the right migration is not “replace Django admin with Payload admin screens”.

The right migration is:

1. Payload owns the data model, auth, access control, and background workflows.
2. Custom Next.js admin UI owns the operational screens.
3. Reports are computed from Payload collections using the Local API.

## Immediate next step

The next useful implementation step is to scaffold Payload in this repo and create the first three backend pieces:

- `admins`
- `departments`
- `members`

After that, build `services` and `attendance-records`, because attendance is the operational feature that most strongly shapes the rest of the admin system.
