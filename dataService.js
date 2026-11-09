/**
 * ============================================================================
 * LabGuard — Data Service & Repository Layer (dataService.js)
 * Designed for LPU UMS Laboratory Maintenance System
 * ============================================================================
 * 
 * ARCHITECTURE NOTE FOR DATABASE INTEGRATION:
 * -------------------------------------------
 * This service encapsulates all CRUD and data management operations behind
 * asynchronous methods (Promises / async-await).
 * 
 * Currently, data is persisted in browser localStorage with realistic seed data
 * (featuring LPU labs, equipment, certified technicians, and repair histories).
 * 
 * TO ATTACH A REAL DATABASE LATER (e.g., MySQL, MongoDB, Node.js, PHP):
 * - Keep the method signatures identical (e.g., `getTickets()`, `createTicket()`).
 * - Simply replace the `localStorage` read/write blocks inside each method with
 *   standard `await fetch('/api/tickets', { ... })` REST calls.
 * - The frontend UI (`labguard.html` and `app.js`) will continue working with
 *   ZERO modifications!
 * ============================================================================
 */

(function (window) {
  'use strict';

  const STORAGE_KEYS = {
    TICKETS: 'labguard_tickets_v1',
    EQUIPMENT: 'labguard_equipment_v1',
    TECHNICIANS: 'labguard_technicians_v1',
    AUDIT_LOGS: 'labguard_audit_logs_v1',
    CURRENT_USER: 'labguard_current_user_v1'
  };

  // 4 Realistic LabGuard User Roles (Student, Technician/Engineer, Management, Administrator)
  const DEFAULT_USERS = {
    student: {
      type: 'student',
      roleBadge: 'Student Researcher',
      roleIcon: '🎓',
      name: 'Harshit Kumar',
      username: 'harshit.student',
      id: '12608404',
      email: 'harshitkochas0123@gmail.com',
      cardTitle: 'Student Details',
      detail1Label: 'Registration No.',
      detail1Val: '12608404',
      detail2Label: 'Program',
      detail2Val: 'B.Tech. (Computer Science & Engineering) (P132)',
      detail3Label: 'Department / School',
      detail3Val: 'School of Computer Science & Engineering',
      detail4Label: 'Facility Access',
      detail4Val: 'Academic & Project Laboratory Clearance',
      avatar: 'HK',
      avatarBg: 'linear-gradient(135deg, #F97316 0%, #3B82F6 100%)'
    },
    technician: {
      type: 'technician',
      roleBadge: 'Technician / Bio-Med Engineer',
      roleIcon: '🔧',
      name: 'Er. Rajesh Sharma',
      username: 'rajesh.tech',
      id: 'EMP-ENG-402',
      email: 'rajesh.sharma@lpu.co.in',
      cardTitle: 'Technician / Engineer Details',
      detail1Label: 'Staff Employee ID',
      detail1Val: 'EMP-ENG-402',
      detail2Label: 'Specialization',
      detail2Val: 'Lead Bio-Medical & Precision Metrology',
      detail3Label: 'Dispatch Hotline',
      detail3Val: '+91 98765-43210 (Ext. 204)',
      detail4Label: 'Shift & Active Tasks',
      detail4Val: 'General Day Shift (2 Active Work Orders)',
      avatar: 'RS',
      avatarBg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
    },
    management: {
      type: 'management',
      roleBadge: 'Laboratory Management / Director',
      roleIcon: '📋',
      name: 'Dr. Neha Verma',
      username: 'neha.management',
      id: 'FAC-BIO-819',
      email: 'neha.verma@lpu.co.in',
      cardTitle: 'Laboratory Management Details',
      detail1Label: 'Faculty Employee ID',
      detail1Val: 'FAC-BIO-819',
      detail2Label: 'Administrative Role',
      detail2Val: 'Director of Central Laboratory Infrastructure',
      detail3Label: 'Audit Authority',
      detail3Val: 'Lead ISO 17025 Compliance Sign-off Officer',
      detail4Label: 'Governed Facilities',
      detail4Val: 'Bio-Tech, Chemistry, Robotics & Physics Labs',
      avatar: 'NV',
      avatarBg: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)'
    },
    administrator: {
      type: 'administrator',
      roleBadge: 'System Administrator',
      roleIcon: '🛡️',
      name: 'Er. Vikramaditya Sen',
      username: 'admin.sen',
      id: 'ADM-SYS-001',
      email: 'admin.labguard@lpu.co.in',
      cardTitle: 'System Administrator Details',
      detail1Label: 'Administrator ID',
      detail1Val: 'ADM-SYS-001',
      detail2Label: 'System Privileges',
      detail2Val: 'Root Dispatcher & Access Controller',
      detail3Label: 'Central Security Clearance',
      detail3Val: 'Level-5 Infrastructure Master Admin',
      detail4Label: 'Database & Portal Status',
      detail4Val: 'Online • All Cluster Services Active',
      avatar: 'VS',
      avatarBg: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)'
    }
  };

  // Seed Data: Realistic LPU Academic and Research Laboratories
  const DEFAULT_EQUIPMENT = [
    {
      id: 'EQ-AUT-01',
      name: 'Systec Vertical Autoclave VX-95',
      category: 'Sterilization & Bio-Containment',
      lab: 'Bio-Tech Lab 38-204',
      block: 'Block 38',
      department: 'Biotechnology & Bioengineering',
      status: 'Maintenance Required',
      serial: 'SN-AUT-9921',
      lastCalibrated: '2026-08-15',
      healthScore: 68,
      incharge: 'Dr. Neha Verma'
    },
    {
      id: 'EQ-CEN-04',
      name: 'Beckman High-Speed Centrifuge Avanti J-E',
      category: 'Rotational & Centrifugal Separator',
      lab: 'Life Sciences Lab 34-102',
      block: 'Block 34',
      department: 'Biochemistry',
      status: 'Operational',
      serial: 'SN-CEN-5510',
      lastCalibrated: '2026-10-02',
      healthScore: 94,
      incharge: 'Dr. Amit Sood'
    },
    {
      id: 'EQ-SPC-02',
      name: 'Shimadzu UV-1900i Spectrophotometer',
      category: 'Optical & Spectroscopy',
      lab: 'Nanotech Research Lab 28-301',
      block: 'Block 28',
      department: 'Physics & Materials Science',
      status: 'Operational',
      serial: 'SN-SPC-1102',
      lastCalibrated: '2026-09-18',
      healthScore: 98,
      incharge: 'Prof. K. Raman'
    },
    {
      id: 'EQ-FUM-07',
      name: 'Hamilton CleanAir Laminar Fume Hood FH-12',
      category: 'Chemical Safety & Containment',
      lab: 'Organic Chemistry Lab 38-105',
      block: 'Block 38',
      department: 'Chemical Sciences',
      status: 'Under Repair',
      serial: 'SN-FUM-8834',
      lastCalibrated: '2026-07-22',
      healthScore: 52,
      incharge: 'Dr. Sunita Kapoor'
    },
    {
      id: 'EQ-MIC-11',
      name: 'Olympus BX53 Fluorescence Microscope',
      category: 'Precision Microscopy',
      lab: 'Pathology & Histology Lab 34-405',
      block: 'Block 34',
      department: 'Medical Sciences',
      status: 'Operational',
      serial: 'SN-MIC-3390',
      lastCalibrated: '2026-10-20',
      healthScore: 96,
      incharge: 'Dr. R. K. Mukherjee'
    },
    {
      id: 'EQ-OSC-09',
      name: 'Tektronix 4-Channel Mixed Signal Oscilloscope',
      category: 'Electronics & Test Instrumentation',
      lab: 'VLSI & Embedded Systems Lab 37-202',
      block: 'Block 37',
      department: 'Computer Science & ECE',
      status: 'Operational',
      serial: 'SN-OSC-7714',
      lastCalibrated: '2026-09-05',
      healthScore: 91,
      incharge: 'Er. Sandeep Mittal'
    },
    {
      id: 'EQ-ROB-03',
      name: 'KUKA KR 6 6-Axis Industrial Robotic Arm',
      category: 'Robotics & Automation',
      lab: 'Advanced Robotics & Mechatronics 39-001',
      block: 'Block 39',
      department: 'Robotics & AI',
      status: 'Maintenance Required',
      serial: 'SN-KUKA-4419',
      lastCalibrated: '2026-06-10',
      healthScore: 71,
      incharge: 'Er. Gurpreet Singh'
    },
    {
      id: 'EQ-3DP-05',
      name: 'UltiMaker S5 Dual Extrusion 3D Printer',
      category: 'Additive Manufacturing & Prototyping',
      lab: 'Design Innovation & Fabrication 38-002',
      block: 'Block 38',
      department: 'Mechanical Engineering',
      status: 'Operational',
      serial: 'SN-3DP-2091',
      lastCalibrated: '2026-10-12',
      healthScore: 88,
      incharge: 'Dr. Vivek Anand'
    }
  ];

  const DEFAULT_TECHNICIANS = [
    {
      id: 'TECH-01',
      name: 'Er. Rajesh Sharma',
      role: 'Lead Bio-Medical Engineer',
      specialty: 'Autoclaves, Centrifuges & Incubators',
      phone: '+91 98765-43210',
      email: 'rajesh.sharma@lpu.co.in',
      activeTickets: 2,
      status: 'Available'
    },
    {
      id: 'TECH-02',
      name: 'Er. Anita Rao',
      role: 'Senior Metrology & Optical Specialist',
      specialty: 'Spectrophotometers & Microscopes',
      phone: '+91 98765-43211',
      email: 'anita.rao@lpu.co.in',
      activeTickets: 1,
      status: 'Available'
    },
    {
      id: 'TECH-03',
      name: 'Er. Vikram Singh',
      role: 'Industrial Mechatronics Specialist',
      specialty: 'Robotics, Servo Actuators & PLCs',
      phone: '+91 98765-43212',
      email: 'vikram.singh@lpu.co.in',
      activeTickets: 2,
      status: 'Busy'
    },
    {
      id: 'TECH-04',
      name: 'Er. Pooja Verma',
      role: 'Lab Safety & HVAC Infrastructure Specialist',
      specialty: 'Fume Hoods, Cleanrooms & Gas Lines',
      phone: '+91 98765-43213',
      email: 'pooja.verma@lpu.co.in',
      activeTickets: 1,
      status: 'Available'
    },
    {
      id: 'TECH-05',
      name: 'Er. Deepanshu Mehra',
      role: 'Embedded Systems & Instrumentation Tech',
      specialty: 'Oscilloscopes, Sensors & Embedded Boards',
      phone: '+91 98765-43214',
      email: 'deepanshu.m@lpu.co.in',
      activeTickets: 0,
      status: 'Available'
    }
  ];

  const DEFAULT_TICKETS = [
    {
      id: 'TKT-1001',
      title: 'Autoclave Chamber Pressure Sensor Fluctuating',
      equipmentId: 'EQ-AUT-01',
      equipmentName: 'Systec Vertical Autoclave VX-95',
      labLocation: 'Bio-Tech Lab 38-204',
      block: 'Block 38',
      category: 'Calibration & Sensor',
      priority: 'Critical',
      status: 'In Progress',
      reportedBy: 'Harshit Kumar (12608404)',
      reporterRole: 'Student Researcher',
      reporterEmail: 'harshitkochas0123@gmail.com',
      dateReported: '2026-11-08 09:30',
      description: 'Chamber pressure reading oscillates erratically between 1.8 and 2.4 bar during standard 121°C sterilization cycle. Over-temp alarm triggered twice during post-grad session.',
      assignedTechnician: 'Er. Rajesh Sharma',
      technicianPhone: '+91 98765-43210',
      comments: [
        {
          id: 1,
          author: 'Er. Rajesh Sharma',
          role: 'Technician',
          text: 'Inspected steam release solenoid valve and sensor terminal block. Found resistance drift on transducer PT-400. Replacement ordered from store.',
          timestamp: '2026-11-08 14:15'
        },
        {
          id: 2,
          author: 'Harshit Kumar',
          role: 'Student',
          text: 'Thank you Er. Rajesh. Third-year microbiology lab practical is scheduled for Thursday, hope it is resolved before then.',
          timestamp: '2026-11-08 16:30'
        }
      ],
      repairHistory: [
        {
          action: 'Ticket Created',
          by: 'Harshit Kumar',
          date: '2026-11-08 09:30',
          notes: 'Maintenance ticket submitted through LPU UMS Laboratory Portal.'
        },
        {
          action: 'Technician Assigned',
          by: 'Admin Dispatcher',
          date: '2026-11-08 10:15',
          notes: 'Assigned to Er. Rajesh Sharma (Lead Bio-Medical Engineer).'
        },
        {
          action: 'Status Updated to In Progress',
          by: 'Er. Rajesh Sharma',
          date: '2026-11-08 14:00',
          notes: 'Disassembled pressure sensor coupling for bench calibration check.'
        }
      ],
      closureVerification: {
        verified: false,
        signOffBy: null,
        closureDate: null,
        functionalTestPassed: false,
        safetyCheckPassed: false,
        calibrationCertified: false,
        remarks: ''
      }
    },
    {
      id: 'TKT-1002',
      title: 'Exhaust Face Velocity Sub-Standard (<0.35 m/s)',
      equipmentId: 'EQ-FUM-07',
      equipmentName: 'Hamilton CleanAir Laminar Fume Hood FH-12',
      labLocation: 'Organic Chemistry Lab 38-105',
      block: 'Block 38',
      category: 'Chemical Safety & Containment',
      priority: 'High',
      status: 'Open',
      reportedBy: 'Dr. Sunita Kapoor',
      reporterRole: 'Lab Incharge / Faculty',
      reporterEmail: 'sunita.chem@lpu.co.in',
      dateReported: '2026-11-07 11:20',
      description: 'Face velocity dropped below OSHA safe threshold during solvent distillation experiment. Airflow warning alarm sounding intermittently.',
      assignedTechnician: 'Unassigned',
      technicianPhone: '—',
      comments: [
        {
          id: 1,
          author: 'Dr. Sunita Kapoor',
          role: 'Faculty',
          text: 'Hood marked Out-Of-Service on door. Immediate containment maintenance required.',
          timestamp: '2026-11-07 11:25'
        }
      ],
      repairHistory: [
        {
          action: 'Ticket Created',
          by: 'Dr. Sunita Kapoor',
          date: '2026-11-07 11:20',
          notes: 'High-priority fume hood safety report logged.'
        }
      ],
      closureVerification: {
        verified: false,
        signOffBy: null,
        closureDate: null,
        functionalTestPassed: false,
        safetyCheckPassed: false,
        calibrationCertified: false,
        remarks: ''
      }
    },
    {
      id: 'TKT-1003',
      title: 'Axis-4 Servo Motor Backlash Exceeds Tolerance',
      equipmentId: 'EQ-ROB-03',
      equipmentName: 'KUKA KR 6 6-Axis Industrial Robotic Arm',
      labLocation: 'Advanced Robotics & Mechatronics 39-001',
      block: 'Block 39',
      category: 'Robotics & Automation',
      priority: 'Medium',
      status: 'Pending Parts',
      reportedBy: 'Er. Gurpreet Singh',
      reporterRole: 'Lab Technical Officer',
      reporterEmail: 'gurpreet.mechatronics@lpu.co.in',
      dateReported: '2026-11-05 15:40',
      description: 'Repeatability deviation of +/- 0.45mm detected on wrist rotation axis during automated welding path routine.',
      assignedTechnician: 'Er. Vikram Singh',
      technicianPhone: '+91 98765-43212',
      spareParts: {
        partName: 'Precision Harmonic Drive Gearbox Axis-4 Kit',
        partNumber: 'KUKA-HD-44-PKG',
        supplier: 'KUKA Robotics India Depot / Pune Hub',
        orderStatus: 'In Transit — Expected Delivery in 2 Days',
        trackingNumber: 'LPU-LOG-8492041-IN',
        quantity: 1,
        allocatedCost: '₹34,500'
      },
      comments: [
        {
          id: 1,
          author: 'Er. Vikram Singh',
          role: 'Technician',
          text: 'Inspected planetary harmonic gearbox. Harmonic ring teeth show localized micro-pitting. Harmonic drive kit #HD-44 ordered from KUKA India.',
          timestamp: '2026-11-06 10:20'
        }
      ],
      repairHistory: [
        {
          action: 'Ticket Created',
          by: 'Er. Gurpreet Singh',
          date: '2026-11-05 15:40',
          notes: 'Automated test deviation reported.'
        },
        {
          action: 'Technician Assigned',
          by: 'System Admin',
          date: '2026-11-05 16:10',
          notes: 'Assigned to Er. Vikram Singh.'
        },
        {
          action: 'Status Changed to Pending Parts',
          by: 'Er. Vikram Singh',
          date: '2026-11-06 10:30',
          notes: 'Awaiting OEM harmonic gear set delivery.'
        }
      ],
      closureVerification: {
        verified: false,
        signOffBy: null,
        closureDate: null,
        functionalTestPassed: false,
        safetyCheckPassed: false,
        calibrationCertified: false,
        remarks: ''
      }
    },
    {
      id: 'TKT-1004',
      title: 'Rotor Imbalance Vibration at >10,000 RPM',
      equipmentId: 'EQ-CEN-04',
      equipmentName: 'Beckman High-Speed Centrifuge Avanti J-E',
      labLocation: 'Life Sciences Lab 34-102',
      block: 'Block 34',
      category: 'Rotational & Centrifugal Separator',
      priority: 'Low',
      status: 'Closed',
      reportedBy: 'Harshit Kumar (12608404)',
      reporterRole: 'Student Researcher',
      reporterEmail: 'harshitkochas0123@gmail.com',
      dateReported: '2026-10-25 10:00',
      description: 'Minor vibration rumble observed when running JA-20 rotor past 10k RPM.',
      assignedTechnician: 'Er. Rajesh Sharma',
      technicianPhone: '+91 98765-43210',
      comments: [
        {
          id: 1,
          author: 'Er. Rajesh Sharma',
          role: 'Technician',
          text: 'Tachometer calibrated and rotor hub spindle re-torqued to 35 Nm. Dynamic balance test passed at 14,000 RPM.',
          timestamp: '2026-10-26 13:00'
        },
        {
          id: 2,
          author: 'Dr. Amit Sood',
          role: 'Faculty Incharge',
          text: 'Verified calibration run with water blanks. Vibration index is well within ISO 10816 limits.',
          timestamp: '2026-10-26 16:30'
        }
      ],
      repairHistory: [
        {
          action: 'Ticket Created',
          by: 'Harshit Kumar',
          date: '2026-10-25 10:00',
          notes: 'Vibration notice submitted.'
        },
        {
          action: 'Repairs Completed',
          by: 'Er. Rajesh Sharma',
          date: '2026-10-26 13:00',
          notes: 'Dynamic balancing and spindle alignment completed.'
        },
        {
          action: 'Closure Verified & Signed Off',
          by: 'Dr. Amit Sood',
          date: '2026-10-26 17:00',
          notes: 'All 3 QA verification tests passed. Ticket formally marked Closed.'
        }
      ],
      closureVerification: {
        verified: true,
        signOffBy: 'Dr. Amit Sood (Faculty Incharge)',
        closureDate: '2026-10-26 17:00',
        functionalTestPassed: true,
        safetyCheckPassed: true,
        calibrationCertified: true,
        remarks: 'Centrifuge passed dynamic sweep up to 14,000 RPM. Certified for academic laboratory sessions.'
      }
    }
  ];

  // Helper: Persist and retrieve from LocalStorage
  function getStorage(key, defaultData) {
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        localStorage.setItem(key, JSON.stringify(defaultData));
        return defaultData;
      }
      return JSON.parse(data);
    } catch (e) {
      console.warn('LocalStorage access warning, using in-memory default:', e);
      return defaultData;
    }
  }

  function setStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('LocalStorage write failed:', e);
    }
  }

  // Format Current Timestamp: YYYY-MM-DD HH:MM
  function getFormattedTimestamp() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  /**
   * ========================================================================
   * LabGuardService Public API (Async / Promise-based Repository)
   * ========================================================================
   */
  const LabGuardService = {
    /**
     * Initializes storage with default seeds if empty.
     */
    async init() {
      getStorage(STORAGE_KEYS.EQUIPMENT, DEFAULT_EQUIPMENT);
      getStorage(STORAGE_KEYS.TECHNICIANS, DEFAULT_TECHNICIANS);
      getStorage(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS);
      return true;
    },

    /**
     * Fetch all tickets with optional filtering.
     * @param {Object} filters - { status, priority, search, lab }
     */
    async getTickets(filters = {}) {
      // Simulation of async network latency for smooth UI feel
      await new Promise((res) => setTimeout(res, 40));
      let tickets = getStorage(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS);

      if (filters.status && filters.status !== 'All') {
        tickets = tickets.filter((t) => t.status.toLowerCase() === filters.status.toLowerCase());
      }
      if (filters.priority && filters.priority !== 'All') {
        tickets = tickets.filter((t) => t.priority.toLowerCase() === filters.priority.toLowerCase());
      }
      if (filters.lab && filters.lab !== 'All') {
        tickets = tickets.filter((t) => t.labLocation.toLowerCase().includes(filters.lab.toLowerCase()));
      }
      if (filters.category && filters.category !== 'All') {
        const cat = filters.category.toLowerCase();
        tickets = tickets.filter((t) => (t.category || '').toLowerCase().includes(cat));
      }
      if (filters.quickFilter && filters.quickFilter !== 'all') {
        const qf = filters.quickFilter;
        if (qf === 'critical') {
          tickets = tickets.filter((t) => t.priority.toLowerCase() === 'critical');
        } else if (qf === 'inprogress') {
          tickets = tickets.filter((t) => t.status.toLowerCase() === 'in progress');
        } else if (qf === 'pending-parts') {
          tickets = tickets.filter((t) => t.status.toLowerCase() === 'pending parts');
        } else if (qf === 'my-tasks') {
          const userStr = filters.currentUser ? (filters.currentUser.name || '').toLowerCase() : '';
          if (userStr) {
            tickets = tickets.filter((t) =>
              (t.assignedTechnician || '').toLowerCase().includes(userStr) ||
              (t.reportedBy || '').toLowerCase().includes(userStr)
            );
          }
        }
      }
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        tickets = tickets.filter((t) =>
          t.id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.equipmentName.toLowerCase().includes(q) ||
          t.equipmentId.toLowerCase().includes(q) ||
          t.reportedBy.toLowerCase().includes(q)
        );
      }

      return tickets;
    },

    /**
     * Fetch single ticket details by ID.
     */
    async getTicketById(ticketId) {
      await new Promise((res) => setTimeout(res, 20));
      const tickets = getStorage(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS);
      return tickets.find((t) => t.id === ticketId) || null;
    },

    /**
     * Create and record a new maintenance ticket.
     * @param {Object} newTicketData
     */
    async createTicket(newTicketData) {
      await new Promise((res) => setTimeout(res, 60));
      const tickets = getStorage(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS);

      // Auto-generate ticket ID (e.g., TKT-1005)
      const numericIds = tickets.map((t) => parseInt(t.id.replace('TKT-', ''), 10)).filter(Number.isFinite);
      const nextNum = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1001;
      const newId = `TKT-${nextNum}`;

      const timestamp = getFormattedTimestamp();

      const ticket = {
        id: newId,
        title: newTicketData.title || 'Laboratory Maintenance Request',
        equipmentId: newTicketData.equipmentId || 'EQ-GEN-00',
        equipmentName: newTicketData.equipmentName || 'General Laboratory Utility',
        labLocation: newTicketData.labLocation || 'Main Laboratory Block',
        block: newTicketData.block || 'Block 38',
        category: newTicketData.category || 'Mechanical',
        priority: newTicketData.priority || 'Medium',
        status: 'Open',
        reportedBy: newTicketData.reportedBy || 'Harshit Kumar (12608404)',
        reporterRole: newTicketData.reporterRole || 'Student',
        reporterEmail: newTicketData.reporterEmail || 'harshitkochas0123@gmail.com',
        dateReported: timestamp,
        description: newTicketData.description || 'No description provided.',
        assignedTechnician: 'Unassigned',
        technicianPhone: '—',
        comments: [],
        repairHistory: [
          {
            action: 'Ticket Created',
            by: newTicketData.reportedBy || 'Harshit Kumar',
            date: timestamp,
            notes: 'Issue reported through LabGuard UMS portal.'
          }
        ],
        closureVerification: {
          verified: false,
          signOffBy: null,
          closureDate: null,
          functionalTestPassed: false,
          safetyCheckPassed: false,
          calibrationCertified: false,
          remarks: ''
        }
      };

      tickets.unshift(ticket); // Prepend to top
      setStorage(STORAGE_KEYS.TICKETS, tickets);

      // Update equipment status if critical/high
      if (['Critical', 'High'].includes(ticket.priority)) {
        await this.updateEquipmentStatus(ticket.equipmentId, 'Maintenance Required');
      }

      return ticket;
    },

    /**
     * Update the workflow status of a ticket.
     * @param {string} ticketId 
     * @param {string} newStatus - Open, In Progress, Pending Parts, Resolved, Closed
     * @param {string} updatedBy - Name of updater
     * @param {string} notes - Audit notes
     */
    async updateTicketStatus(ticketId, newStatus, updatedBy = 'Harshit Kumar', notes = '') {
      await new Promise((res) => setTimeout(res, 40));
      const tickets = getStorage(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS);
      const ticket = tickets.find((t) => t.id === ticketId);

      if (!ticket) throw new Error(`Ticket ${ticketId} not found.`);

      const oldStatus = ticket.status;
      ticket.status = newStatus;

      const timestamp = getFormattedTimestamp();
      ticket.repairHistory.push({
        action: `Status Changed: ${oldStatus} → ${newStatus}`,
        by: updatedBy,
        date: timestamp,
        notes: notes || `Ticket status transitioned to ${newStatus}.`
      });

      // If closed, verify equipment status returns to Operational
      if (newStatus === 'Closed') {
        await this.updateEquipmentStatus(ticket.equipmentId, 'Operational');
      }

      setStorage(STORAGE_KEYS.TICKETS, tickets);
      return ticket;
    },

    /**
     * Assign a certified technician to a ticket.
     * @param {string} ticketId 
     * @param {string} technicianName 
     * @param {string} assignedBy 
     */
    async assignTechnician(ticketId, technicianName, assignedBy = 'Harshit Kumar (Admin)') {
      await new Promise((res) => setTimeout(res, 40));
      const tickets = getStorage(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS);
      const technicians = getStorage(STORAGE_KEYS.TECHNICIANS, DEFAULT_TECHNICIANS);
      const ticket = tickets.find((t) => t.id === ticketId);

      if (!ticket) throw new Error(`Ticket ${ticketId} not found.`);

      const techObj = technicians.find((tech) => tech.name === technicianName);
      ticket.assignedTechnician = technicianName;
      ticket.technicianPhone = techObj ? techObj.phone : '—';

      // Auto advance status to 'In Progress' if currently 'Open'
      if (ticket.status === 'Open') {
        ticket.status = 'In Progress';
      }

      const timestamp = getFormattedTimestamp();
      ticket.repairHistory.push({
        action: 'Technician Assigned',
        by: assignedBy,
        date: timestamp,
        notes: `Assigned to ${technicianName} (${techObj ? techObj.role : 'Specialist'}).`
      });

      setStorage(STORAGE_KEYS.TICKETS, tickets);
      return ticket;
    },

    /**
     * Append a comment to a ticket thread.
     * @param {string} ticketId 
     * @param {string} author 
     * @param {string} role 
     * @param {string} text 
     */
    async addComment(ticketId, author, role, text) {
      await new Promise((res) => setTimeout(res, 30));
      const tickets = getStorage(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS);
      const ticket = tickets.find((t) => t.id === ticketId);

      if (!ticket) throw new Error(`Ticket ${ticketId} not found.`);

      const newComment = {
        id: (ticket.comments.length || 0) + 1,
        author: author || 'Harshit Kumar',
        role: role || 'Student / Reporter',
        text: text,
        timestamp: getFormattedTimestamp()
      };

      ticket.comments.push(newComment);
      setStorage(STORAGE_KEYS.TICKETS, tickets);
      return newComment;
    },

    /**
     * Record closure verification sign-off.
     * @param {string} ticketId 
     * @param {Object} verificationData - { signOffBy, functionalTestPassed, safetyCheckPassed, calibrationCertified, remarks, signatureImage }
     */
    async verifyClosure(ticketId, verificationData) {
      await new Promise((res) => setTimeout(res, 50));
      const tickets = getStorage(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS);
      const ticket = tickets.find((t) => t.id === ticketId);

      if (!ticket) throw new Error(`Ticket ${ticketId} not found.`);

      const timestamp = getFormattedTimestamp();
      ticket.closureVerification = {
        verified: true,
        signOffBy: verificationData.signOffBy || 'Dr. Laboratory Director',
        closureDate: timestamp,
        functionalTestPassed: Boolean(verificationData.functionalTestPassed),
        safetyCheckPassed: Boolean(verificationData.safetyCheckPassed),
        calibrationCertified: Boolean(verificationData.calibrationCertified),
        remarks: verificationData.remarks || 'Standard QA sign-off completed.',
        signatureImage: verificationData.signatureImage || null
      };

      ticket.status = 'Closed';

      ticket.repairHistory.push({
        action: 'Closure Verified & Signed Off',
        by: verificationData.signOffBy || 'Dr. Laboratory Director',
        date: timestamp,
        notes: `All QA verification checkpoints confirmed. ${ticket.closureVerification.remarks}`
      });

      // Set equipment back to Operational
      await this.updateEquipmentStatus(ticket.equipmentId, 'Operational');

      setStorage(STORAGE_KEYS.TICKETS, tickets);
      return ticket;
    },

    /**
     * Get list of all lab equipment.
     * @param {string} searchTerm
     * @param {string} category
     */
    async getEquipmentList(searchTerm = '', category = 'All') {
      await new Promise((res) => setTimeout(res, 30));
      let equipment = getStorage(STORAGE_KEYS.EQUIPMENT, DEFAULT_EQUIPMENT);
      if (category && category !== 'All') {
        const cat = category.toLowerCase();
        equipment = equipment.filter((eq) => (eq.category || '').toLowerCase().includes(cat));
      }
      if (searchTerm && searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        equipment = equipment.filter((eq) =>
          eq.name.toLowerCase().includes(q) ||
          eq.id.toLowerCase().includes(q) ||
          eq.lab.toLowerCase().includes(q) ||
          eq.serial.toLowerCase().includes(q) ||
          (eq.category && eq.category.toLowerCase().includes(q))
        );
      }
      return equipment;
    },

    /**
     * Update equipment operational status.
     */
    async updateEquipmentStatus(equipmentId, newStatus) {
      const equipment = getStorage(STORAGE_KEYS.EQUIPMENT, DEFAULT_EQUIPMENT);
      const item = equipment.find((e) => e.id === equipmentId);
      if (item) {
        item.status = newStatus;
        setStorage(STORAGE_KEYS.EQUIPMENT, equipment);
      }
      return item;
    },

    /**
     * Get complete maintenance history for a specific machine.
     * @param {string} equipmentId 
     */
    async getEquipmentHistory(equipmentId) {
      await new Promise((res) => setTimeout(res, 30));
      const tickets = getStorage(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS);
      const relatedTickets = tickets.filter((t) => t.equipmentId === equipmentId);

      const allEvents = [];
      relatedTickets.forEach((t) => {
        t.repairHistory.forEach((h) => {
          allEvents.push({
            ticketId: t.id,
            ticketTitle: t.title,
            priority: t.priority,
            action: h.action,
            by: h.by,
            date: h.date,
            notes: h.notes
          });
        });
      });

      // Sort chronological descending
      allEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
      return allEvents;
    },

    /**
     * Get list of certified technicians.
     */
    async getTechnicians() {
      await new Promise((res) => setTimeout(res, 20));
      return getStorage(STORAGE_KEYS.TECHNICIANS, DEFAULT_TECHNICIANS);
    },

    /**
     * Calculate comprehensive dashboard metrics for reports.
     */
    async getDashboardMetrics() {
      await new Promise((res) => setTimeout(res, 30));
      const tickets = getStorage(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS);
      const equipment = getStorage(STORAGE_KEYS.EQUIPMENT, DEFAULT_EQUIPMENT);

      const totalTickets = tickets.length;
      const openTickets = tickets.filter((t) => t.status === 'Open').length;
      const inProgressTickets = tickets.filter((t) => t.status === 'In Progress').length;
      const pendingPartsTickets = tickets.filter((t) => t.status === 'Pending Parts').length;
      const resolvedTickets = tickets.filter((t) => t.status === 'Resolved').length;
      const closedTickets = tickets.filter((t) => t.status === 'Closed').length;

      const criticalPriority = tickets.filter((t) => t.priority === 'Critical').length;
      const highPriority = tickets.filter((t) => t.priority === 'High').length;
      const mediumPriority = tickets.filter((t) => t.priority === 'Medium').length;
      const lowPriority = tickets.filter((t) => t.priority === 'Low').length;

      const totalEquipment = equipment.length;
      const operationalEquipment = equipment.filter((e) => e.status === 'Operational').length;
      const faultyEquipment = totalEquipment - operationalEquipment;

      const complianceRate = totalEquipment > 0 ? Math.round((operationalEquipment / totalEquipment) * 100) : 100;

      return {
        totalTickets,
        openTickets,
        inProgressTickets,
        pendingPartsTickets,
        resolvedTickets,
        closedTickets,
        criticalPriority,
        highPriority,
        mediumPriority,
        lowPriority,
        totalEquipment,
        operationalEquipment,
        faultyEquipment,
        complianceRate
      };
    },

    /**
     * User Authentication & Multi-Role Management (Student, Technician, Management, Administrator)
     */
    async getAllUsers() {
      return DEFAULT_USERS;
    },

    async getCurrentUser() {
      const savedType = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'student';
      return DEFAULT_USERS[savedType] || DEFAULT_USERS.student;
    },

    async setCurrentUser(roleType) {
      if (!DEFAULT_USERS[roleType]) {
        throw new Error(`Invalid role: ${roleType}`);
      }
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, roleType);
      return DEFAULT_USERS[roleType];
    },

    async loginUser(identifier, password) {
      await new Promise((res) => setTimeout(res, 50));
      const clean = (identifier || '').toLowerCase().trim();

      // Check direct type match (student, technician, management, administrator)
      if (DEFAULT_USERS[clean]) {
        return this.setCurrentUser(clean);
      }

      // Check username match
      for (const [key, user] of Object.entries(DEFAULT_USERS)) {
        if (user.username.toLowerCase() === clean || user.email.toLowerCase() === clean || user.id.toLowerCase() === clean) {
          return this.setCurrentUser(key);
        }
      }

      // Default fallback if input was custom
      return this.getCurrentUser();
    },

    /**
     * Reset demo data back to factory defaults.
     */
    async resetToDefaultSeed() {
      setStorage(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS);
      setStorage(STORAGE_KEYS.EQUIPMENT, DEFAULT_EQUIPMENT);
      setStorage(STORAGE_KEYS.TECHNICIANS, DEFAULT_TECHNICIANS);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, 'student');
      return true;
    }
  };

  // Expose to window object for global availability
  window.LabGuardService = LabGuardService;
})(window);
