LabGuard — Laboratory Maintenance & Calibration Management System

LabGuard is a web-based laboratory management portal built for university and institutional labs. It digitizes the entire maintenance lifecycle of lab equipment — from logging a fault, assigning it to a technician, tracking spare parts, verifying calibration, and closing the work order with a digital signature and audit trail.

The system is designed to replace manual registers and paper-based processes with a structured, role-aware digital workflow that is fast, transparent, and compliance-ready.

What It Does

Labs deal with equipment breakdowns, missed calibration schedules, and no clear visibility into who is working on what. LabGuard solves this by providing:

A structured ticket-based workflow where anyone can log a fault against specific equipment
A Kanban pipeline showing every work order across its full lifecycle — Open, In Progress, Pending Parts, and Closed
SLA countdown timers that automatically escalate tickets based on severity (Critical escalates in 2 hours, High in 24 hours, Medium in 48 hours, Low in 72 hours)
Traffic-light status badges on every equipment entry so lab users instantly know if a machine is safe to use, under limited service, or completely out of operation
A spare parts logistics panel for tracking ordered components and courier status against pending work orders
A digital signature pad using HTML5 Canvas for technician sign-off on ticket closure, with a cryptographic audit stamp
Printable ISO/IEC 17025 calibration asset tags with a QR code and barcode that can be physically attached to equipment
A dark mode that persists across sessions
Role-based access control so each type of user sees and can do only what their role permits
Roles
Role	What They Can Do
Student	Raise new tickets, view equipment status, track ticket progress
Technician	Accept assignments, update ticket status, log repair notes, close tickets with signature
Management	View KPI dashboard, monitor SLA compliance, access escalation reports
Admin	Full access — manage users, equipment registry, calibration schedules, all tickets
Features at a Glance
Kanban board with List View toggle
Quick filter chips — Critical Stoppages, In Progress, Pending Parts, Assigned to Me
Equipment category tiles and fast symptom auto-fill chips for quick ticket creation
SLA timers with colour-coded urgency pills per ticket
Spare parts order tracking and courier status per work order
HTML5 Canvas digital signature with audit timestamp on closure
ISO/IEC 17025 printable calibration sticker with SVG QR code
Dark mode with localStorage persistence
Show/Hide password toggle on login
One-click demo credential chips for all four roles
Tech Stack
HTML5
CSS3 (CSS Custom Properties, Grid, Flexbox)
JavaScript ES6+ (Vanilla — no frameworks or libraries)
HTML5 Canvas API (signature pad)
Browser LocalStorage (data persistence)

No build tools. No npm. No external dependencies of any kind.

How to Run

Clone or download the repository, then open labguard.html directly in any modern browser.

bash
git clone https://github.com/YOUR_USERNAME/labguard.git
cd labguard
# Open labguard.html in Chrome, Edge, or Firefox

Alternatively, use the Live Server extension in VS Code for a local dev server experience.

Demo Credentials
Role	Username	Password
Student	student	student123
Technician	tech	tech123
Management	manager	mgmt123
Admin	admin	admin123
Project Structure
labguard/
├── labguard.html       # Application shell, all tabs and modals
├── styles.css          # All styles including dark mode and print layout
├── app.js              # Rendering engine, event handlers, UI state
└── dataService.js      # Data layer — all CRUD via localStorage

dataService.js is intentionally decoupled from the UI. When a backend is added in the future, only the data layer needs to change — the entire frontend remains untouched.

Roadmap
 Role-based authentication
 Full ticket lifecycle management
 Kanban board with SLA timers
 Digital signature on closure
 Calibration asset tag printing
 Spare parts logistics tracking
 Dark mode
 Node.js + Express REST API backend
 MySQL database integration
 Email and push notifications
 PDF report export
Project Context

Built as a UMS Lab Evaluation Project for Lovely Professional University.
Student: Harshit Kumar | Registration No: 12608404
