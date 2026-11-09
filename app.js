/**
 * ============================================================================
 * LabGuard — Application UI Controller & Interactive Engine (app.js)
 * Designed for LPU UMS Laboratory Maintenance System
 * ============================================================================
 */

(function () {
  'use strict';

  // Global State
  const state = {
    activeTab: 'tab-report',
    tickets: [],
    equipment: [],
    technicians: [],
    selectedTicketId: null,
    selectedEquipmentId: null,
    currentUser: null,
    viewMode: 'list', // 'list' | 'kanban'
    hasSignature: false,
    filters: {
      search: '',
      status: 'All',
      priority: 'All',
      lab: 'All',
      category: 'All',
      quickFilter: 'all'
    }
  };

  // DOM Elements Cache
  const elements = {};

  /**
   * Initializes application once DOM is ready.
   */
  async function initApp() {
    cacheDomElements();
    initTheme();
    attachEventListeners();
    initSignaturePad();
    await LabGuardService.init();
    state.currentUser = await LabGuardService.getCurrentUser();
    await refreshAllData();
    populateDropdowns();
    renderAllViews();
    showToast(`Signed in as ${state.currentUser.name} (${state.currentUser.roleBadge})`, 'info');
  }

  function cacheDomElements() {
    // Navigation Tabs
    elements.tabLinks = document.querySelectorAll('.nav-tab-btn');
    elements.tabPanels = document.querySelectorAll('.tab-panel');

    // KPI Counters
    elements.kpiTotalTickets = document.getElementById('kpi-total-tickets');
    elements.kpiInProgress = document.getElementById('kpi-in-progress');
    elements.kpiCritical = document.getElementById('kpi-critical');
    elements.kpiResolved = document.getElementById('kpi-resolved');
    elements.kpiCompliance = document.getElementById('kpi-compliance');

    // Issue Reporting Form
    elements.reportForm = document.getElementById('issue-report-form');
    elements.inputEquipment = document.getElementById('report-equipment');
    elements.inputLab = document.getElementById('report-lab');
    elements.inputBlock = document.getElementById('report-block');
    elements.inputCategory = document.getElementById('report-category');
    elements.inputTitle = document.getElementById('report-title');
    elements.inputDescription = document.getElementById('report-desc');
    elements.inputReporter = document.getElementById('report-reporter');
    elements.inputReporterEmail = document.getElementById('report-email');
    elements.priorityPills = document.querySelectorAll('.priority-pill-option');

    // Ticket List & Filters
    elements.ticketContainer = document.getElementById('tickets-list-container');
    elements.ticketCountBadge = document.getElementById('tickets-count-badge');
    elements.filterSearch = document.getElementById('filter-search');
    elements.filterStatus = document.getElementById('filter-status');
    elements.filterPriority = document.getElementById('filter-priority');
    elements.filterLab = document.getElementById('filter-lab');
    elements.filterResetBtn = document.getElementById('btn-reset-filters');

    // Equipment Grid
    elements.equipmentContainer = document.getElementById('equipment-grid-container');
    elements.equipmentSearch = document.getElementById('equipment-search-input');

    // History Tab
    elements.historyEquipmentSelect = document.getElementById('history-equipment-select');
    elements.historyTimeline = document.getElementById('history-timeline-container');
    elements.historyMachineInfo = document.getElementById('history-machine-info');

    // Closure Verification Tab
    elements.verificationSelect = document.getElementById('verification-ticket-select');
    elements.verificationDetails = document.getElementById('verification-ticket-details');
    elements.verificationForm = document.getElementById('verification-form');

    // Reports Tab
    elements.reportsKpiGrid = document.getElementById('reports-kpi-grid');
    elements.reportsTableBody = document.getElementById('reports-table-body');
    elements.btnPrintReport = document.getElementById('btn-print-report');
    elements.btnExportCsv = document.getElementById('btn-export-csv');

    // Modals
    elements.assignModal = document.getElementById('modal-assign-tech');
    elements.assignModalForm = document.getElementById('form-assign-tech');
    elements.assignModalTicketId = document.getElementById('assign-modal-ticket-id');
    elements.assignModalTechSelect = document.getElementById('assign-tech-select');

    elements.commentModal = document.getElementById('modal-comments');
    elements.commentList = document.getElementById('modal-comments-list');
    elements.commentForm = document.getElementById('form-add-comment');
    elements.commentTicketTitle = document.getElementById('comment-modal-ticket-title');
    elements.commentInputText = document.getElementById('comment-input-text');
    elements.commentAuthorName = document.getElementById('comment-author-name');

    // Toasts Container
    elements.toastContainer = document.getElementById('toast-container');

    // Floating Action Buttons (Scroll to Top, Scroll to Bottom, Reset)
    elements.fabScrollTop = document.getElementById('fab-scroll-top');
    elements.fabScrollBottom = document.getElementById('fab-scroll-bottom');
    elements.fabResetDemo = document.getElementById('fab-reset-demo');

    // Notification Popover Dropdown
    elements.btnNotifications = document.getElementById('btn-notifications');
    elements.headerNotifCount = document.getElementById('header-notif-count');
    elements.notificationsDropdown = document.getElementById('notifications-dropdown');
    elements.notifDropdownCount = document.getElementById('notif-dropdown-count');
    elements.notifCloseBtn = document.getElementById('notif-close-btn');
    elements.notifItemsList = document.getElementById('notif-items-list');
    elements.btnSeeMoreTickets = document.getElementById('btn-see-more-tickets');

    // User Profile Header & Dynamic Left Hero Card
    elements.headerUserProfileBtn = document.getElementById('header-user-profile-btn');
    elements.headerUserAvatar = document.getElementById('header-user-avatar');
    elements.headerUserName = document.getElementById('header-user-name');
    elements.headerUserRole = document.getElementById('header-user-role');
    elements.userDetailsCard = document.getElementById('user-details-card');
    elements.welcomeUserTitle = document.getElementById('welcome-user-title');
    elements.welcomeUserDesc = document.getElementById('welcome-user-desc');

    // Login & Multi-Role Authentication Modal
    elements.modalAuthLogin = document.getElementById('modal-auth-login');
    elements.roleSelectorGrid = document.getElementById('role-selector-grid');
    elements.formLoginManual = document.getElementById('form-login-manual');
    elements.loginUsername = document.getElementById('login-username');
    elements.loginPassword = document.getElementById('login-password');

    // Simplified UX & Power Controls
    elements.btnThemeToggle = document.getElementById('btn-theme-toggle');
    elements.btnViewList = document.getElementById('btn-view-list');
    elements.btnViewKanban = document.getElementById('btn-view-kanban');
    elements.kanbanContainer = document.getElementById('kanban-board-container');
    elements.quickFilterChipsRow = document.getElementById('quick-filter-chips-row');
    elements.eqCatTilesFilter = document.getElementById('eq-cat-tiles-filter');
    elements.symptomChipsWrapper = document.getElementById('symptom-chips-wrapper');
    elements.sigCanvas = document.getElementById('signature-canvas');
    elements.sigFrame = document.getElementById('sig-canvas-frame');
    elements.sigHint = document.getElementById('sig-hint');
    elements.btnClearSig = document.getElementById('btn-clear-sig');

    // Password & Login Enhancements
    elements.btnTogglePassword = document.getElementById('btn-toggle-password');
    elements.passwordToggleIcon = document.getElementById('password-toggle-icon');

    // Equipment Asset Calibration Sticker Modal
    elements.modalAssetTag = document.getElementById('modal-asset-tag');
    elements.btnPrintAssetSticker = document.getElementById('btn-print-asset-sticker');
    elements.tagEqId = document.getElementById('tag-eq-id');
    elements.tagEqName = document.getElementById('tag-eq-name');
    elements.tagEqSerial = document.getElementById('tag-eq-serial');
    elements.tagEqLab = document.getElementById('tag-eq-lab');
    elements.tagEqDept = document.getElementById('tag-eq-dept');
    elements.tagCalDate = document.getElementById('tag-cal-date');
    elements.tagExpDate = document.getElementById('tag-exp-date');
    elements.tagStatus = document.getElementById('tag-status');
    elements.tagBarcodeText = document.getElementById('tag-barcode-text');
  }

  function attachEventListeners() {
    // Tab Switching
    elements.tabLinks.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        switchTab(targetTab);
      });
    });

    // Priority Pills Selection in Reporting Form
    elements.priorityPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        elements.priorityPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        const radio = pill.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });

    // Auto-fill Lab Location when equipment changes
    if (elements.inputEquipment) {
      elements.inputEquipment.addEventListener('change', (e) => {
        const selectedId = e.target.value;
        const eq = state.equipment.find((item) => item.id === selectedId);
        if (eq) {
          elements.inputLab.value = eq.lab;
          elements.inputBlock.value = eq.block;
          elements.inputCategory.value = eq.category;
        }
      });
    }

    // Submit New Ticket
    if (elements.reportForm) {
      elements.reportForm.addEventListener('submit', handleTicketSubmit);
    }

    // Ticket Search & Filter Listeners
    if (elements.filterSearch) {
      elements.filterSearch.addEventListener('input', debounce((e) => {
        state.filters.search = e.target.value;
        renderTicketsList();
      }, 200));
    }

    if (elements.filterStatus) {
      elements.filterStatus.addEventListener('change', (e) => {
        state.filters.status = e.target.value;
        renderTicketsList();
      });
    }

    if (elements.filterPriority) {
      elements.filterPriority.addEventListener('change', (e) => {
        state.filters.priority = e.target.value;
        renderTicketsList();
      });
    }

    if (elements.filterLab) {
      elements.filterLab.addEventListener('change', (e) => {
        state.filters.lab = e.target.value;
        renderTicketsList();
      });
    }

    if (elements.filterResetBtn) {
      elements.filterResetBtn.addEventListener('click', () => {
        state.filters = { search: '', status: 'All', priority: 'All', lab: 'All', category: 'All', quickFilter: 'all' };
        if (elements.filterSearch) elements.filterSearch.value = '';
        if (elements.filterStatus) elements.filterStatus.value = 'All';
        if (elements.filterPriority) elements.filterPriority.value = 'All';
        if (elements.filterLab) elements.filterLab.value = 'All';

        if (elements.quickFilterChipsRow) {
          elements.quickFilterChipsRow.querySelectorAll('.quick-filter-chip').forEach((c) => {
            c.classList.toggle('active', c.getAttribute('data-filter') === 'all');
          });
        }
        if (elements.eqCatTilesFilter) {
          elements.eqCatTilesFilter.querySelectorAll('.eq-cat-tile').forEach((t) => {
            t.classList.toggle('active', t.getAttribute('data-cat') === 'All');
          });
          filterEquipmentDropdownByCategory('All');
        }

        if (state.viewMode === 'kanban') {
          renderKanbanBoard();
        } else {
          renderTicketsList();
        }
        showToast('Filters reset to default', 'info');
      });
    }

    // 1-Click Quick Filter Chips
    if (elements.quickFilterChipsRow) {
      elements.quickFilterChipsRow.querySelectorAll('.quick-filter-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          elements.quickFilterChipsRow.querySelectorAll('.quick-filter-chip').forEach((c) => c.classList.remove('active'));
          chip.classList.add('active');
          const filterKey = chip.getAttribute('data-filter') || 'all';
          state.filters.quickFilter = filterKey;

          if (filterKey === 'all') {
            state.filters.status = 'All';
            state.filters.priority = 'All';
            if (elements.filterStatus) elements.filterStatus.value = 'All';
            if (elements.filterPriority) elements.filterPriority.value = 'All';
          } else if (filterKey === 'critical') {
            state.filters.priority = 'Critical';
            if (elements.filterPriority) elements.filterPriority.value = 'Critical';
          } else if (filterKey === 'inprogress') {
            state.filters.status = 'In Progress';
            if (elements.filterStatus) elements.filterStatus.value = 'In Progress';
          } else if (filterKey === 'pending-parts') {
            state.filters.status = 'Pending Parts';
            if (elements.filterStatus) elements.filterStatus.value = 'Pending Parts';
          }

          if (state.viewMode === 'kanban') {
            renderKanbanBoard();
          } else {
            renderTicketsList();
          }
          showToast(`Filtered: ${chip.textContent.trim()}`, 'info');
        });
      });
    }

    // Work Orders View Toggle (List View vs Kanban Board)
    if (elements.btnViewList && elements.btnViewKanban) {
      elements.btnViewList.addEventListener('click', () => {
        setViewMode('list');
      });
      elements.btnViewKanban.addEventListener('click', () => {
        setViewMode('kanban');
      });
    }

    // Equipment Category Quick Tiles (Issue Reporting & Registry)
    if (elements.eqCatTilesFilter) {
      elements.eqCatTilesFilter.querySelectorAll('.eq-cat-tile').forEach((tile) => {
        tile.addEventListener('click', () => {
          elements.eqCatTilesFilter.querySelectorAll('.eq-cat-tile').forEach((t) => t.classList.remove('active'));
          tile.classList.add('active');
          const cat = tile.getAttribute('data-cat') || 'All';
          state.filters.category = cat;

          // Filter Equipment dropdown in reporting form
          filterEquipmentDropdownByCategory(cat);

          // Also sync equipment grid
          renderEquipmentGrid('', cat);
          showToast(`Category selected: ${cat}`, 'info');
        });
      });
    }

    // 1-Click Quick Symptom Chips (Auto-Fill Title, Description & Target Equipment)
    if (elements.symptomChipsWrapper) {
      elements.symptomChipsWrapper.querySelectorAll('.symptom-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          const title = chip.getAttribute('data-title');
          const desc = chip.getAttribute('data-desc');

          if (elements.inputTitle) elements.inputTitle.value = title;
          if (elements.inputDescription) elements.inputDescription.value = desc;

          // Auto-match equipment and priority based on symptom
          autoSelectEquipmentForSymptom(title);

          // Visual bounce/feedback
          chip.style.transform = 'scale(0.96)';
          setTimeout(() => { chip.style.transform = ''; }, 150);

          showToast(`Auto-filled: ${title.slice(0, 32)}...`, 'success');
        });
      });
    }

    // Equipment Search
    if (elements.equipmentSearch) {
      elements.equipmentSearch.addEventListener('input', debounce((e) => {
        renderEquipmentGrid(e.target.value);
      }, 200));
    }

    // History Tab Machine Select
    if (elements.historyEquipmentSelect) {
      elements.historyEquipmentSelect.addEventListener('change', (e) => {
        state.selectedEquipmentId = e.target.value;
        renderHistoryTimeline(state.selectedEquipmentId);
      });
    }

    // Verification Tab Ticket Select
    if (elements.verificationSelect) {
      elements.verificationSelect.addEventListener('change', (e) => {
        renderVerificationDetails(e.target.value);
      });
    }

    // Verification Form Submit
    if (elements.verificationForm) {
      elements.verificationForm.addEventListener('submit', handleVerificationSubmit);
    }

    // Modal Close buttons (data-close-modal)
    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        closeAllModals();
      });
    });

    // Close modal on backdrop click
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        closeAllModals();
      }
    });

    // Assign Tech Form Submit
    if (elements.assignModalForm) {
      elements.assignModalForm.addEventListener('submit', handleAssignTechSubmit);
    }

    // Add Comment Form Submit
    if (elements.commentForm) {
      elements.commentForm.addEventListener('submit', handleAddCommentSubmit);
    }

    // Print & Export CSV
    if (elements.btnPrintReport) {
      elements.btnPrintReport.addEventListener('click', () => {
        window.print();
      });
    }

    if (elements.btnExportCsv) {
      elements.btnExportCsv.addEventListener('click', exportReportsToCsv);
    }

    // Floating Action Buttons (Scroll to Top & Bottom)
    if (elements.fabScrollTop) {
      elements.fabScrollTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    if (elements.fabScrollBottom) {
      elements.fabScrollBottom.addEventListener('click', () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      });
    }

    if (elements.fabResetDemo) {
      elements.fabResetDemo.addEventListener('click', handleResetDemoData);
    }

    // Notification Popover Toggle & Actions
    if (elements.btnNotifications && elements.notificationsDropdown) {
      elements.btnNotifications.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = elements.notificationsDropdown.classList.contains('active');
        if (isActive) {
          closeNotificationsDropdown();
        } else {
          openNotificationsDropdown();
        }
      });
    }

    if (elements.notifCloseBtn) {
      elements.notifCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeNotificationsDropdown();
      });
    }

    if (elements.btnSeeMoreTickets) {
      elements.btnSeeMoreTickets.addEventListener('click', (e) => {
        e.stopPropagation();
        closeNotificationsDropdown();
        switchTab('tab-tickets');
        if (elements.ticketContainer) {
          elements.ticketContainer.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Close notification popover on outside click
    document.addEventListener('click', (e) => {
      if (elements.notificationsDropdown && elements.notificationsDropdown.classList.contains('active')) {
        if (!e.target.closest('.notifications-wrapper')) {
          closeNotificationsDropdown();
        }
      }
    });

    // User Profile Trigger -> Open Authentication / Role Switcher Modal
    if (elements.headerUserProfileBtn && elements.modalAuthLogin) {
      elements.headerUserProfileBtn.addEventListener('click', () => {
        openLoginModal();
      });
      elements.headerUserProfileBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLoginModal();
        }
      });
    }

    // Role Card Selection in Modal
    if (elements.roleSelectorGrid) {
      elements.roleSelectorGrid.querySelectorAll('.role-card, .btn-switch-role').forEach((elem) => {
        elem.addEventListener('click', (e) => {
          e.stopPropagation();
          const role = elem.getAttribute('data-role') || (elem.closest('.role-card') && elem.closest('.role-card').getAttribute('data-role'));
          if (role) {
            handleSwitchUserRole(role);
          }
        });
      });
    }

    // Manual Credentials Login Form
    if (elements.formLoginManual) {
      elements.formLoginManual.addEventListener('submit', handleManualLoginSubmit);
    }

    // Toggle Password Visibility
    if (elements.btnTogglePassword) {
      elements.btnTogglePassword.addEventListener('click', togglePasswordVisibility);
    }

    // 1-Click Demo Credential Chips
    attachQuickCredsListeners();

    // Dark Mode Theme Toggle
    if (elements.btnThemeToggle) {
      elements.btnThemeToggle.addEventListener('click', toggleTheme);
    }

    // Print Calibration Asset Tag Sticker
    if (elements.btnPrintAssetSticker) {
      elements.btnPrintAssetSticker.addEventListener('click', printAssetSticker);
    }

    // Interactive Laboratory Sub-Navigation Bar Dropdown Actions
    const subNavContainer = document.getElementById('sub-nav-interactive-list');
    if (subNavContainer) {
      subNavContainer.querySelectorAll('[data-action]').forEach((item) => {
        item.addEventListener('click', (e) => {
          const action = item.getAttribute('data-action');
          if (item.tagName === 'A' && item.getAttribute('href') === '#') {
            e.preventDefault();
          }

          if (action === 'switch-tab') {
            const target = item.getAttribute('data-tab');
            if (target) {
              switchTab(target);
              const panel = document.getElementById(target);
              if (panel) panel.scrollIntoView({ behavior: 'smooth' });
            }
          } else if (action === 'filter-lab') {
            e.preventDefault();
            const labName = item.getAttribute('data-lab');
            state.filters.lab = labName;
            if (elements.filterLab) elements.filterLab.value = labName;
            switchTab('tab-tickets');
            renderTicketsList();
            showToast(`Filtered work orders for: ${labName}`, 'info');
            if (elements.ticketContainer) elements.ticketContainer.scrollIntoView({ behavior: 'smooth' });
          } else if (action === 'filter-priority') {
            e.preventDefault();
            const priority = item.getAttribute('data-priority');
            state.filters.priority = priority;
            if (elements.filterPriority) elements.filterPriority.value = priority;
            switchTab('tab-tickets');
            renderTicketsList();
            showToast(`Showing ${priority} Priority Incidents`, 'warning');
            if (elements.ticketContainer) elements.ticketContainer.scrollIntoView({ behavior: 'smooth' });
          } else if (action === 'filter-status') {
            e.preventDefault();
            const status = item.getAttribute('data-status');
            state.filters.status = status;
            if (elements.filterStatus) elements.filterStatus.value = status;
            switchTab('tab-tickets');
            renderTicketsList();
            showToast(`Showing status: ${status}`, 'info');
            if (elements.ticketContainer) elements.ticketContainer.scrollIntoView({ behavior: 'smooth' });
          } else if (action === 'filter-tech') {
            e.preventDefault();
            const techName = item.getAttribute('data-tech');
            state.filters.search = techName;
            if (elements.filterSearch) elements.filterSearch.value = techName;
            switchTab('tab-tickets');
            renderTicketsList();
            showToast(`Viewing work orders for: ${techName}`, 'info');
            if (elements.ticketContainer) elements.ticketContainer.scrollIntoView({ behavior: 'smooth' });
          } else if (action === 'filter-health') {
            e.preventDefault();
            switchTab('tab-equipment');
            if (elements.equipmentSearch) elements.equipmentSearch.value = 'Maintenance';
            renderEquipmentGrid('Maintenance');
            showToast('Showing instruments requiring maintenance', 'warning');
            if (elements.equipmentContainer) elements.equipmentContainer.scrollIntoView({ behavior: 'smooth' });
          } else if (action === 'export-csv') {
            e.preventDefault();
            exportReportsToCsv();
          } else if (action === 'print-pdf') {
            e.preventDefault();
            window.print();
          }
        });
      });
    }
  }

  /**
   * Refreshes all datasets from DataService.
   */
  async function refreshAllData() {
    state.tickets = await LabGuardService.getTickets();
    state.equipment = await LabGuardService.getEquipmentList();
    state.technicians = await LabGuardService.getTechnicians();
  }

  /**
   * Switches active tab with smooth animation and indicator update.
   */
  function switchTab(tabId) {
    state.activeTab = tabId;

    elements.tabLinks.forEach((btn) => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    elements.tabPanels.forEach((panel) => {
      if (panel.id === tabId) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    // Trigger tab-specific refresh if needed
    if (tabId === 'tab-tickets') {
      if (state.viewMode === 'kanban') {
        renderKanbanBoard();
      } else {
        renderTicketsList();
      }
    } else if (tabId === 'tab-equipment') {
      renderEquipmentGrid();
    } else if (tabId === 'tab-history') {
      renderHistoryTimeline(state.selectedEquipmentId || (state.equipment[0] && state.equipment[0].id));
    } else if (tabId === 'tab-verification') {
      populateVerificationDropdown();
    } else if (tabId === 'tab-reports') {
      renderReportsView();
    }

    // Update KPI Bar
    renderKpiCounters();
  }

  /**
   * Toggle between List View and Kanban Board.
   */
  function setViewMode(mode) {
    state.viewMode = mode;
    if (mode === 'kanban') {
      if (elements.btnViewKanban) elements.btnViewKanban.classList.add('active');
      if (elements.btnViewList) elements.btnViewList.classList.remove('active');
      if (elements.ticketContainer) elements.ticketContainer.style.display = 'none';
      if (elements.kanbanContainer) {
        elements.kanbanContainer.classList.add('active');
        elements.kanbanContainer.style.display = 'grid';
      }
      renderKanbanBoard();
      showToast('Switched to Kanban Pipeline', 'info');
    } else {
      if (elements.btnViewList) elements.btnViewList.classList.add('active');
      if (elements.btnViewKanban) elements.btnViewKanban.classList.remove('active');
      if (elements.kanbanContainer) {
        elements.kanbanContainer.classList.remove('active');
        elements.kanbanContainer.style.display = 'none';
      }
      if (elements.ticketContainer) elements.ticketContainer.style.display = '';
      renderTicketsList();
      showToast('Switched to Detailed List View', 'info');
    }
  }

  /**
   * Filter equipment dropdown options in the Issue Reporting tab by Category.
   */
  function filterEquipmentDropdownByCategory(category = 'All') {
    if (!elements.inputEquipment) return;
    let list = state.equipment;
    if (category && category !== 'All') {
      const catLower = category.toLowerCase();
      list = state.equipment.filter((eq) =>
        (eq.category || '').toLowerCase().includes(catLower) ||
        (eq.name || '').toLowerCase().includes(catLower)
      );
    }

    elements.inputEquipment.innerHTML = '<option value="">-- Choose Equipment / Instrument --</option>' +
      list.map((eq) => `
        <option value="${eq.id}">[${eq.id}] ${eq.name} (${eq.lab})</option>
      `).join('');

    // Pre-select first matching instrument if filtered by specific category
    if (list.length > 0 && category !== 'All') {
      elements.inputEquipment.value = list[0].id;
      const eq = list[0];
      if (elements.inputLab) elements.inputLab.value = eq.lab;
      if (elements.inputBlock) elements.inputBlock.value = eq.block;
      if (elements.inputCategory) elements.inputCategory.value = eq.category;
    }
  }

  /**
   * Auto-selects equipment and priority for 1-Click Fast Symptoms.
   */
  function autoSelectEquipmentForSymptom(title) {
    if (!state.equipment || state.equipment.length === 0) return;
    let target = null;
    const lower = (title || '').toLowerCase();

    if (lower.includes('pressure') || lower.includes('autoclave') || lower.includes('temp')) {
      target = state.equipment.find((e) => e.name.toLowerCase().includes('autoclave') || e.id === 'EQ-38-001');
      selectPriority('Critical');
    } else if (lower.includes('airflow') || lower.includes('velocity') || lower.includes('containment') || lower.includes('hood')) {
      target = state.equipment.find((e) => e.name.toLowerCase().includes('hood') || e.id === 'EQ-38-004');
      selectPriority('High');
    } else if (lower.includes('vibration') || lower.includes('centrifuge') || lower.includes('rotor')) {
      target = state.equipment.find((e) => e.name.toLowerCase().includes('centrifuge') || e.id === 'EQ-34-002');
      selectPriority('Medium');
    } else if (lower.includes('optical') || lower.includes('spectro') || lower.includes('drift')) {
      target = state.equipment.find((e) => e.name.toLowerCase().includes('spectro') || e.id === 'EQ-28-003');
      selectPriority('Medium');
    } else if (lower.includes('axis') || lower.includes('robot') || lower.includes('servo')) {
      target = state.equipment.find((e) => e.name.toLowerCase().includes('robot') || e.id === 'EQ-39-007');
      selectPriority('Medium');
    }

    if (!target) target = state.equipment[0];

    if (target) {
      if (elements.inputEquipment) {
        // Ensure option exists in dropdown
        if (!elements.inputEquipment.querySelector(`option[value="${target.id}"]`)) {
          filterEquipmentDropdownByCategory('All');
        }
        elements.inputEquipment.value = target.id;
      }
      if (elements.inputLab) elements.inputLab.value = target.lab;
      if (elements.inputBlock) elements.inputBlock.value = target.block;
      if (elements.inputCategory) elements.inputCategory.value = target.category;
    }
  }

  function selectPriority(priorityName) {
    if (!elements.priorityPills) return;
    elements.priorityPills.forEach((p) => {
      const pVal = p.getAttribute('data-priority');
      if (pVal === priorityName) {
        p.classList.add('active');
        const radio = p.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      } else {
        p.classList.remove('active');
      }
    });
  }

  /**
   * Populates all form dropdown selects.
   */
  function populateDropdowns() {
    // 1. Equipment select in Issue Reporting
    filterEquipmentDropdownByCategory(state.filters.category || 'All');

    // 2. Lab filter dropdown
    if (elements.filterLab) {
      const labs = Array.from(new Set(state.equipment.map((e) => e.lab)));
      elements.filterLab.innerHTML = '<option value="All">All Laboratories</option>' +
        labs.map((lab) => `<option value="${escapeHtml(lab)}">${escapeHtml(lab)}</option>`).join('');
    }

    // 3. History equipment dropdown
    if (elements.historyEquipmentSelect) {
      elements.historyEquipmentSelect.innerHTML = state.equipment.map((eq) => `
        <option value="${eq.id}">[${eq.id}] ${eq.name} — ${eq.lab}</option>
      `).join('');
    }

    // 4. Technician assign dropdown in modal
    if (elements.assignModalTechSelect) {
      elements.assignModalTechSelect.innerHTML = '<option value="">-- Select Certified Technician --</option>' +
        state.technicians.map((t) => `
          <option value="${escapeHtml(t.name)}">${escapeHtml(t.name)} — ${escapeHtml(t.role)} (${t.status})</option>
        `).join('');
    }
  }

  /**
   * Renders KPI Overview Cards.
   */
  async function renderKpiCounters() {
    const metrics = await LabGuardService.getDashboardMetrics();

    if (elements.kpiTotalTickets) elements.kpiTotalTickets.textContent = metrics.totalTickets;
    if (elements.kpiInProgress) elements.kpiInProgress.textContent = metrics.inProgressTickets;
    if (elements.kpiCritical) elements.kpiCritical.textContent = metrics.criticalPriority;
    if (elements.kpiResolved) elements.kpiResolved.textContent = metrics.resolvedTickets + metrics.closedTickets;
    if (elements.kpiCompliance) elements.kpiCompliance.textContent = `${metrics.complianceRate}%`;
  }

  /**
   * Render Tickets List with filters applied.
   */
  async function renderTicketsList() {
    if (state.viewMode === 'kanban') {
      renderKanbanBoard();
      return;
    }
    if (!elements.ticketContainer) return;

    elements.ticketContainer.innerHTML = `
      <div class="loading-spinner-state">
        <div class="spinner"></div>
        <p>Loading ticket records...</p>
      </div>
    `;

    const filteredTickets = await LabGuardService.getTickets({
      ...state.filters,
      currentUser: state.currentUser
    });
    if (elements.ticketCountBadge) {
      elements.ticketCountBadge.textContent = `${filteredTickets.length} Found`;
    }

    if (filteredTickets.length === 0) {
      elements.ticketContainer.innerHTML = `
        <div class="empty-state-card glass-card">
          <div class="empty-icon">🔍</div>
          <h3>No Maintenance Tickets Match Your Query</h3>
          <p>Try resetting your search query or filters to view all laboratory work orders.</p>
          <button class="btn btn-secondary btn-sm" id="empty-reset-btn">Reset All Filters</button>
        </div>
      `;
      const btn = document.getElementById('empty-reset-btn');
      if (btn) btn.addEventListener('click', () => {
        if (elements.filterResetBtn) elements.filterResetBtn.click();
      });
      return;
    }

    let html = '';
    filteredTickets.forEach((ticket) => {
      const priorityClass = getPriorityBadgeClass(ticket.priority);
      const statusClass = getStatusBadgeClass(ticket.status);
      const commentsCount = (ticket.comments && ticket.comments.length) || 0;
      const isClosed = ticket.status === 'Closed';

      // Plain-English Traffic Light Status Badges
      let trafficBadgeHtml = '';
      if (isClosed || ticket.status === 'Resolved') {
        trafficBadgeHtml = '<span class="traffic-badge traffic-safe">🟢 QA Cleared</span>';
      } else if (ticket.priority === 'Critical') {
        trafficBadgeHtml = '<span class="traffic-badge traffic-danger">🔴 Urgent Stoppage</span>';
      } else if (ticket.status === 'In Progress' || ticket.status === 'Pending Parts') {
        trafficBadgeHtml = '<span class="traffic-badge traffic-limited">🟡 Under Service</span>';
      } else {
        trafficBadgeHtml = '<span class="traffic-badge traffic-limited">🟡 Awaiting Action</span>';
      }

      // Amazon / Swiggy Style Horizontal Step Progress Tracker
      const isAssigned = ticket.assignedTechnician && ticket.assignedTechnician !== 'Unassigned';
      const isInProgress = ticket.status === 'In Progress' || ticket.status === 'Pending Parts' || ticket.status === 'Resolved' || isClosed;

      let step1Class = 'completed';
      let step2Class = isAssigned ? (isInProgress ? 'completed' : 'active') : (ticket.status === 'Open' ? 'active' : '');
      let step3Class = (ticket.status === 'Resolved' || isClosed) ? 'completed' : ((ticket.status === 'In Progress' || ticket.status === 'Pending Parts') ? 'active' : '');
      let step4Class = isClosed ? 'completed' : (ticket.status === 'Resolved' ? 'active' : '');

      let fillWidth = '20%';
      if (isClosed) fillWidth = '100%';
      else if (ticket.status === 'Resolved') fillWidth = '85%';
      else if (ticket.status === 'In Progress' || ticket.status === 'Pending Parts') fillWidth = '65%';
      else if (isAssigned) fillWidth = '45%';

      const progressTrackHtml = `
        <div class="ticket-progress-track">
          <div class="progress-connector-bar">
            <div class="progress-connector-fill" style="width: ${fillWidth};"></div>
          </div>
          <div class="progress-step-item ${step1Class}">
            <div class="progress-step-node">${step1Class === 'completed' ? '✓' : '1'}</div>
            <span class="progress-step-text">Reported</span>
          </div>
          <div class="progress-step-item ${step2Class}">
            <div class="progress-step-node">${step2Class === 'completed' ? '✓' : '2'}</div>
            <span class="progress-step-text">Assigned</span>
          </div>
          <div class="progress-step-item ${step3Class}">
            <div class="progress-step-node">${step3Class === 'completed' ? '✓' : '3'}</div>
            <span class="progress-step-text">${ticket.status === 'Pending Parts' ? 'Parts Order' : 'Repairing'}</span>
          </div>
          <div class="progress-step-item ${step4Class}">
            <div class="progress-step-node">${step4Class === 'completed' ? '✓' : '4'}</div>
            <span class="progress-step-text">Verified</span>
          </div>
        </div>
      `;

      // Spare Parts Logistics Widget
      let sparePartsHtml = '';
      if (ticket.spareParts && (ticket.status === 'Pending Parts' || ticket.status === 'In Progress')) {
        sparePartsHtml = `
          <div class="spare-parts-logistics-box">
            <div class="spare-parts-header">
              <span class="spare-parts-title">📦 Requisitioned Metrology Spare Part</span>
              <span class="badge badge-warning">🚚 ${ticket.spareParts.orderStatus.includes('Transit') ? 'In Transit' : 'Ordered'}</span>
            </div>
            <div class="spare-parts-details">
              <div>
                <strong>${escapeHtml(ticket.spareParts.partName)}</strong>
                <span class="font-mono text-muted">(${escapeHtml(ticket.spareParts.partNumber)})</span>
              </div>
              <div style="font-size: 0.76rem; color: var(--text-secondary); display: flex; flex-wrap: wrap; gap: 12px; margin-top: 4px;">
                <span><strong>Supplier:</strong> ${escapeHtml(ticket.spareParts.supplier)}</span>
                <span><strong>Tracking:</strong> <code class="font-mono">${escapeHtml(ticket.spareParts.trackingNumber)}</code></span>
                <span><strong>Status:</strong> <span style="color: #D97706; font-weight: 700;">${escapeHtml(ticket.spareParts.orderStatus)}</span></span>
              </div>
            </div>
          </div>
        `;
      }

      html += `
        <div class="ticket-card glass-card" data-ticket-id="${ticket.id}">
          <div class="ticket-card-header">
            <div class="ticket-id-meta" style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <span class="ticket-id-pill">${ticket.id}</span>
              <span class="badge ${priorityClass}">${ticket.priority} Priority</span>
              <span class="badge ${statusClass}">${ticket.status}</span>
              ${trafficBadgeHtml}
              ${getSlaBadge(ticket)}
            </div>
            <div class="ticket-date">
              <span class="clock-icon">🕒</span> ${ticket.dateReported}
            </div>
          </div>

          <div class="ticket-card-body">
            <h3 class="ticket-title">${escapeHtml(ticket.title)}</h3>
            <p class="ticket-desc">${escapeHtml(ticket.description)}</p>

            ${progressTrackHtml}
            ${sparePartsHtml}

            <div class="ticket-meta-grid">
              <div class="meta-item">
                <span class="meta-label">Equipment:</span>
                <span class="meta-value highlight-blue">
                  <strong>[${ticket.equipmentId}]</strong> ${escapeHtml(ticket.equipmentName)}
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Lab Location:</span>
                <span class="meta-value">📍 ${escapeHtml(ticket.labLocation)} (${ticket.block})</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Reported By:</span>
                <span class="meta-value">👤 ${escapeHtml(ticket.reportedBy)}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Assigned Technician:</span>
                <span class="meta-value tech-assigned ${ticket.assignedTechnician === 'Unassigned' ? 'unassigned' : ''}">
                  🔧 ${escapeHtml(ticket.assignedTechnician)}
                  ${ticket.technicianPhone && ticket.technicianPhone !== '—' ? `<small>(${ticket.technicianPhone})</small>` : ''}
                </span>
              </div>
            </div>
          </div>

          <div class="ticket-card-footer">
            <div class="ticket-quick-actions">
              <!-- Assign Technician Button -->
              <button class="btn btn-outline btn-sm action-btn-assign" data-id="${ticket.id}" ${isClosed ? 'disabled' : ''}>
                <span>👤</span> Assign Tech
              </button>

              <!-- Inline Status Selector -->
              <div class="status-select-wrapper">
                <label for="status-select-${ticket.id}" class="sr-only">Change Status</label>
                <select class="select-sm action-status-select" data-id="${ticket.id}" id="status-select-${ticket.id}" ${isClosed ? 'disabled' : ''}>
                  <option value="Open" ${ticket.status === 'Open' ? 'selected' : ''}>Open</option>
                  <option value="In Progress" ${ticket.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                  <option value="Pending Parts" ${ticket.status === 'Pending Parts' ? 'selected' : ''}>Pending Parts</option>
                  <option value="Resolved" ${ticket.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                  <option value="Closed" ${ticket.status === 'Closed' ? 'selected' : ''}>Closed</option>
                </select>
              </div>

              <!-- Comments Button -->
              <button class="btn btn-outline btn-sm action-btn-comments" data-id="${ticket.id}">
                <span>💬</span> Comments <span class="counter-bubble">${commentsCount}</span>
              </button>

              <!-- View History Button -->
              <button class="btn btn-outline btn-sm action-btn-history" data-equipment-id="${ticket.equipmentId}">
                <span>📜</span> History
              </button>

              <!-- Closure Verification Sign-off -->
              <button class="btn btn-sm ${isClosed ? 'btn-success' : 'btn-coral'} action-btn-verify" data-id="${ticket.id}">
                ${isClosed ? '✓ Verified Closed' : '✍ Verify Closure'}
              </button>
            </div>
          </div>
        </div>
      `;
    });

    elements.ticketContainer.innerHTML = html;
    bindTicketCardEvents();
  }

  /**
   * Render Interactive Kanban Board Pipeline.
   */
  async function renderKanbanBoard() {
    if (!elements.kanbanContainer) return;

    elements.kanbanContainer.innerHTML = `
      <div class="loading-spinner-state" style="grid-column: 1 / -1; padding: 40px; text-align: center;">
        <div class="spinner"></div>
        <p>Loading Kanban board pipeline...</p>
      </div>
    `;

    const filteredTickets = await LabGuardService.getTickets({
      ...state.filters,
      currentUser: state.currentUser
    });

    if (elements.ticketCountBadge) {
      elements.ticketCountBadge.textContent = `${filteredTickets.length} Found`;
    }

    const columns = [
      {
        id: 'col-open',
        title: 'New Orders / Open',
        icon: '📋',
        status: 'Open',
        filterFn: (t) => t.status === 'Open'
      },
      {
        id: 'col-inprogress',
        title: 'In Progress Repairs',
        icon: '⚡',
        status: 'In Progress',
        filterFn: (t) => t.status === 'In Progress'
      },
      {
        id: 'col-pendingparts',
        title: 'Awaiting Spare Parts',
        icon: '⏳',
        status: 'Pending Parts',
        filterFn: (t) => t.status === 'Pending Parts'
      },
      {
        id: 'col-closed',
        title: 'Resolved & QA Closed',
        icon: '✅',
        status: 'Closed',
        filterFn: (t) => t.status === 'Resolved' || t.status === 'Closed'
      }
    ];

    let kanbanHtml = '';

    columns.forEach((col) => {
      const colTickets = filteredTickets.filter(col.filterFn);
      kanbanHtml += `
        <div class="kanban-column" id="${col.id}" data-col-status="${col.status}">
          <div class="kanban-col-header">
            <div class="kanban-col-title">
              <span>${col.icon}</span>
              <span>${col.title}</span>
            </div>
            <span class="kanban-col-count">${colTickets.length}</span>
          </div>
          <div class="kanban-cards-container">
      `;

      if (colTickets.length === 0) {
        kanbanHtml += `
          <div style="padding: 28px 12px; text-align: center; color: var(--text-muted); font-size: 0.8rem; border: 1px dashed #CBD5E1; border-radius: var(--radius-md); background: #FFFFFF;">
            No tickets in this stage
          </div>
        `;
      } else {
        colTickets.forEach((t) => {
          const priorityClass = getPriorityBadgeClass(t.priority);
          const isClosed = t.status === 'Closed';
          const commentsCount = (t.comments && t.comments.length) || 0;

          let trafficBadge = '<span class="traffic-badge traffic-limited">🟡 In Progress</span>';
          if (t.priority === 'Critical') trafficBadge = '<span class="traffic-badge traffic-danger">🔴 Critical</span>';
          if (t.status === 'Closed' || t.status === 'Resolved') trafficBadge = '<span class="traffic-badge traffic-safe">🟢 Cleared</span>';

          kanbanHtml += `
            <div class="kanban-mini-card" data-ticket-id="${t.id}">
              <div class="kanban-card-top">
                <span class="ticket-id-pill">${t.id}</span>
                <span class="badge ${priorityClass}">${t.priority}</span>
                ${trafficBadge}
                ${getSlaBadge(t)}
              </div>

              <h4 class="kanban-card-title">${escapeHtml(t.title)}</h4>

              <div class="kanban-card-meta">
                <div style="margin-bottom: 4px;">
                  <strong class="highlight-blue">[${t.equipmentId}]</strong> ${escapeHtml(t.equipmentName)}
                </div>
                <div style="margin-bottom: 4px;">
                  📍 ${escapeHtml(t.labLocation)}
                </div>
                ${t.spareParts ? `<div style="font-size: 0.72rem; color: #D97706; font-weight: 700; margin-bottom: 4px; background: rgba(245, 158, 11, 0.1); padding: 2px 6px; border-radius: 4px; display: inline-block;">📦 Parts: ${escapeHtml(t.spareParts.partName.slice(0, 22))}...</div>` : ''}
                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px;">
                  <span>🔧 ${escapeHtml(t.assignedTechnician)}</span>
                  <span class="counter-bubble" title="Comments">💬 ${commentsCount}</span>
                </div>
              </div>

              <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border-light); display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                <select class="select-sm action-kanban-status" data-id="${t.id}" style="font-size: 0.72rem; padding: 2px 4px; max-width: 110px;" ${isClosed ? 'disabled' : ''}>
                  <option value="Open" ${t.status === 'Open' ? 'selected' : ''}>Open</option>
                  <option value="In Progress" ${t.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                  <option value="Pending Parts" ${t.status === 'Pending Parts' ? 'selected' : ''}>Pending Parts</option>
                  <option value="Resolved" ${t.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                  <option value="Closed" ${t.status === 'Closed' ? 'selected' : ''}>Closed</option>
                </select>

                <div style="display: flex; gap: 4px;">
                  <button type="button" class="btn btn-outline btn-sm action-btn-comments" data-id="${t.id}" style="padding: 2px 6px; font-size: 0.75rem;" title="View Comments">💬</button>
                  <button type="button" class="btn btn-sm ${isClosed ? 'btn-success' : 'btn-coral'} action-btn-verify" data-id="${t.id}" style="padding: 2px 6px; font-size: 0.72rem;" title="Closure Verification">
                    ${isClosed ? '✓' : '✍'}
                  </button>
                </div>
              </div>
            </div>
          `;
        });
      }

      kanbanHtml += `
          </div>
        </div>
      `;
    });

    elements.kanbanContainer.innerHTML = kanbanHtml;
    bindKanbanEvents();
  }

  function bindKanbanEvents() {
    if (!elements.kanbanContainer) return;

    elements.kanbanContainer.querySelectorAll('.action-kanban-status').forEach((sel) => {
      sel.addEventListener('change', async (e) => {
        const id = sel.getAttribute('data-id');
        const newStatus = sel.value;
        try {
          const author = state.currentUser ? `${state.currentUser.name} (${state.currentUser.roleBadge})` : 'Harshit Kumar (Admin)';
          await LabGuardService.updateTicketStatus(id, newStatus, author);
          showToast(`Ticket ${id} moved to "${newStatus}"`, 'success');
          await refreshAllData();
          renderKanbanBoard();
          renderKpiCounters();
          updateNotificationsDropdown();
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    });

    elements.kanbanContainer.querySelectorAll('.action-btn-comments').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        openCommentsModal(id);
      });
    });

    elements.kanbanContainer.querySelectorAll('.action-btn-verify').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        switchTab('tab-verification');
        if (elements.verificationSelect) {
          elements.verificationSelect.value = id;
          renderVerificationDetails(id);
        }
      });
    });
  }

  function bindTicketCardEvents() {
    // 1. Assign Tech Click
    document.querySelectorAll('.action-btn-assign').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openAssignModal(id);
      });
    });

    // 2. Status change listener
    document.querySelectorAll('.action-status-select').forEach((sel) => {
      sel.addEventListener('change', async (e) => {
        const id = sel.getAttribute('data-id');
        const newStatus = sel.value;
        try {
          await LabGuardService.updateTicketStatus(id, newStatus, 'Harshit Kumar (Admin)');
          showToast(`Ticket ${id} status updated to "${newStatus}"`, 'success');
          await refreshAllData();
          renderTicketsList();
          renderKpiCounters();
          updateNotificationsDropdown();
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    });

    // 3. Comments Click
    document.querySelectorAll('.action-btn-comments').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openCommentsModal(id);
      });
    });

    // 4. History Click
    document.querySelectorAll('.action-btn-history').forEach((btn) => {
      btn.addEventListener('click', () => {
        const eqId = btn.getAttribute('data-equipment-id');
        state.selectedEquipmentId = eqId;
        switchTab('tab-history');
        if (elements.historyEquipmentSelect) {
          elements.historyEquipmentSelect.value = eqId;
        }
        renderHistoryTimeline(eqId);
      });
    });

    // 5. Verify Closure Click
    document.querySelectorAll('.action-btn-verify').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        switchTab('tab-verification');
        if (elements.verificationSelect) {
          elements.verificationSelect.value = id;
          renderVerificationDetails(id);
        }
      });
    });
  }

  /**
   * Handle Submission of New Maintenance Issue.
   */
  async function handleTicketSubmit(e) {
    e.preventDefault();

    const equipmentId = elements.inputEquipment.value;
    const title = elements.inputTitle.value.trim();
    const description = elements.inputDescription.value.trim();
    const labLocation = elements.inputLab.value.trim();
    const block = elements.inputBlock.value.trim();
    const category = elements.inputCategory.value;
    const reportedBy = elements.inputReporter.value.trim();
    const reporterEmail = elements.inputReporterEmail.value.trim();

    // Selected Priority
    let priority = 'Medium';
    const checkedRadio = document.querySelector('input[name="ticket-priority"]:checked');
    if (checkedRadio) {
      priority = checkedRadio.value;
    }

    if (!equipmentId || !title || !description || !labLocation) {
      showToast('Please fill out all required fields before submitting.', 'warning');
      return;
    }

    const eqObj = state.equipment.find((item) => item.id === equipmentId);
    const equipmentName = eqObj ? eqObj.name : 'Laboratory Equipment';

    const newTicketData = {
      equipmentId,
      equipmentName,
      labLocation,
      block,
      category,
      priority,
      title,
      description,
      reportedBy,
      reporterEmail
    };

    try {
      const created = await LabGuardService.createTicket(newTicketData);
      showToast(`Work Order #${created.id} logged successfully!`, 'success');
      elements.reportForm.reset();

      // Reset priority selection to Medium
      elements.priorityPills.forEach((p) => p.classList.remove('active'));
      const defaultPill = document.querySelector('.priority-pill-option[data-priority="Medium"]');
      if (defaultPill) defaultPill.classList.add('active');

      await refreshAllData();
      updateNotificationsDropdown();
      switchTab('tab-tickets');
    } catch (err) {
      showToast(`Error creating ticket: ${err.message}`, 'error');
    }
  }

  /**
   * Equipment Directory Rendering.
   */
  async function renderEquipmentGrid(filterText = '', category = state.filters.category) {
    if (!elements.equipmentContainer) return;

    const list = await LabGuardService.getEquipmentList(filterText, category);

    if (list.length === 0) {
      elements.equipmentContainer.innerHTML = `
        <div class="empty-state-card glass-card">
          <p>No equipment matching "${escapeHtml(filterText || category)}" found.</p>
        </div>
      `;
      return;
    }

    elements.equipmentContainer.innerHTML = list.map((item) => {
      let statusBadge = 'badge-success';
      if (item.status === 'Maintenance Required') statusBadge = 'badge-warning';
      if (item.status === 'Under Repair') statusBadge = 'badge-danger';

      // Plain-English Traffic Light Status Badges
      let trafficBadge = '<span class="traffic-badge traffic-safe">🟢 Safe to Operate</span>';
      if (item.status === 'Maintenance Required' || (item.healthScore >= 50 && item.healthScore < 80)) {
        trafficBadge = '<span class="traffic-badge traffic-limited">🟡 Limited Use</span>';
      } else if (item.status === 'Under Repair' || item.healthScore < 50) {
        trafficBadge = '<span class="traffic-badge traffic-danger">🔴 Out of Service</span>';
      }

      return `
        <div class="equipment-card glass-card">
          <div class="equipment-card-header">
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <span class="badge ${statusBadge}">${item.status}</span>
              ${trafficBadge}
            </div>
            <span class="eq-id-tag">${item.id}</span>
          </div>

          <h3 class="eq-name">${escapeHtml(item.name)}</h3>
          <p class="eq-cat">🔬 ${escapeHtml(item.category)}</p>

          <div class="eq-specs">
            <div class="eq-spec-row">
              <span class="spec-label">Location:</span>
              <span class="spec-val">📍 ${escapeHtml(item.lab)} (${item.block})</span>
            </div>
            <div class="eq-spec-row">
              <span class="spec-label">Department:</span>
              <span class="spec-val">${escapeHtml(item.department)}</span>
            </div>
            <div class="eq-spec-row">
              <span class="spec-label">Serial No:</span>
              <span class="spec-val font-mono">${escapeHtml(item.serial)}</span>
            </div>
            <div class="eq-spec-row">
              <span class="spec-label">Last Calibrated:</span>
              <span class="spec-val">${escapeHtml(item.lastCalibrated)}</span>
            </div>
          </div>

          <div class="eq-health-bar-container">
            <div class="health-label-row">
              <span>Calibration & Health Index</span>
              <strong>${item.healthScore}%</strong>
            </div>
            <div class="health-progress-track">
              <div class="health-progress-fill ${item.healthScore < 70 ? 'low' : ''}" style="width: ${item.healthScore}%"></div>
            </div>
          </div>

          <div class="eq-card-footer" style="display: flex; gap: 8px;">
            <button class="btn btn-outline btn-sm action-view-eq-history" style="flex: 1;" data-eq-id="${item.id}">
              <span>📜</span> View Log
            </button>
            <button class="btn btn-secondary btn-sm action-btn-asset-tag" data-eq-id="${item.id}" title="Print Official Metrology Calibration Sticker">
              <span>🏷️</span> Asset Tag
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Bind History Click on equipment cards
    document.querySelectorAll('.action-view-eq-history').forEach((btn) => {
      btn.addEventListener('click', () => {
        const eqId = btn.getAttribute('data-eq-id');
        state.selectedEquipmentId = eqId;
        switchTab('tab-history');
        if (elements.historyEquipmentSelect) {
          elements.historyEquipmentSelect.value = eqId;
        }
        renderHistoryTimeline(eqId);
      });
    });

    // Bind Asset Tag Sticker Click
    document.querySelectorAll('.action-btn-asset-tag').forEach((btn) => {
      btn.addEventListener('click', () => {
        const eqId = btn.getAttribute('data-eq-id');
        openAssetTagModal(eqId);
      });
    });
  }

  /**
   * Render History Timeline for Equipment.
   */
  async function renderHistoryTimeline(equipmentId) {
    if (!elements.historyTimeline) return;

    if (!equipmentId) {
      if (state.equipment.length > 0) {
        equipmentId = state.equipment[0].id;
      } else {
        return;
      }
    }

    const eq = state.equipment.find((e) => e.id === equipmentId);
    if (elements.historyMachineInfo && eq) {
      elements.historyMachineInfo.innerHTML = `
        <div class="history-hero-card glass-card">
          <div class="history-hero-content">
            <span class="hero-eq-badge">[${eq.id}]</span>
            <h2>${escapeHtml(eq.name)}</h2>
            <p><strong>Department:</strong> ${escapeHtml(eq.department)} | <strong>Location:</strong> 📍 ${escapeHtml(eq.lab)}</p>
            <p><strong>Serial:</strong> <span class="font-mono">${escapeHtml(eq.serial)}</span> | <strong>Faculty Incharge:</strong> ${escapeHtml(eq.incharge)}</p>
          </div>
          <div class="history-hero-stat">
            <span class="hero-stat-number">${eq.healthScore}%</span>
            <span class="hero-stat-label">Health & Calibration Index</span>
          </div>
        </div>
      `;
    }

    const events = await LabGuardService.getEquipmentHistory(equipmentId);

    if (events.length === 0) {
      elements.historyTimeline.innerHTML = `
        <div class="empty-state-card glass-card">
          <p>No maintenance logs or repair events recorded for this instrument yet.</p>
        </div>
      `;
      return;
    }

    elements.historyTimeline.innerHTML = events.map((ev, index) => {
      return `
        <div class="timeline-item">
          <div class="timeline-marker ${index === 0 ? 'current' : ''}"></div>
          <div class="timeline-content glass-card">
            <div class="timeline-header">
              <span class="timeline-action"><strong>${escapeHtml(ev.action)}</strong></span>
              <span class="timeline-ticket-pill">${ev.ticketId}</span>
              <span class="timeline-date">🕒 ${ev.date}</span>
            </div>
            <p class="timeline-note">${escapeHtml(ev.notes)}</p>
            <div class="timeline-footer">
              <span>Recorded by: <strong>${escapeHtml(ev.by)}</strong></span>
              <span>Work Order: <em>${escapeHtml(ev.ticketTitle)}</em></span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Populate Closure Verification Select & View.
   */
  async function populateVerificationDropdown() {
    if (!elements.verificationSelect) return;

    const tickets = await LabGuardService.getTickets();
    elements.verificationSelect.innerHTML = '<option value="">-- Choose Ticket to Verify / Sign-off --</option>' +
      tickets.map((t) => `
        <option value="${t.id}" ${state.selectedTicketId === t.id ? 'selected' : ''}>
          [${t.id}] ${escapeHtml(t.title)} (${t.status})
        </option>
      `).join('');

    const targetId = state.selectedTicketId || (tickets[0] && tickets[0].id);
    if (targetId) {
      elements.verificationSelect.value = targetId;
      renderVerificationDetails(targetId);
    }
  }

  /**
   * Render Ticket Details into Verification Box.
   */
  async function renderVerificationDetails(ticketId) {
    if (!elements.verificationDetails) return;
    if (!ticketId) {
      elements.verificationDetails.innerHTML = '<p class="text-muted">Select a ticket from the dropdown above to inspect details and complete sign-off.</p>';
      return;
    }

    const ticket = await LabGuardService.getTicketById(ticketId);
    if (!ticket) return;

    state.selectedTicketId = ticket.id;
    const isClosed = ticket.status === 'Closed';
    const isResolved = ticket.status === 'Resolved';
    const v = ticket.closureVerification || {};

    elements.verificationDetails.innerHTML = `
      <div class="verification-card glass-card">
        <div class="verification-card-header">
          <div>
            <span class="ticket-id-pill">${ticket.id}</span>
            <span class="badge ${getStatusBadgeClass(ticket.status)}">${ticket.status}</span>
            <span class="badge ${getPriorityBadgeClass(ticket.priority)}">${ticket.priority} Priority</span>
          </div>
          <div class="verification-date">Date Reported: ${ticket.dateReported}</div>
        </div>

        <h3 class="verify-title">${escapeHtml(ticket.title)}</h3>
        <p class="verify-desc">${escapeHtml(ticket.description)}</p>

        <div class="verify-info-grid">
          <div><strong>Equipment:</strong> [${ticket.equipmentId}] ${escapeHtml(ticket.equipmentName)}</div>
          <div><strong>Lab Room:</strong> 📍 ${escapeHtml(ticket.labLocation)} (${ticket.block})</div>
          <div><strong>Reported By:</strong> ${escapeHtml(ticket.reportedBy)}</div>
          <div><strong>Assigned Tech:</strong> 🔧 ${escapeHtml(ticket.assignedTechnician)}</div>
        </div>

        ${isClosed ? `
          <div class="closure-badge-notice success-notice">
            <div class="notice-icon">✓</div>
            <div>
              <strong>Formally Verified & Signed Off:</strong><br />
              Closed by <em>${escapeHtml(v.signOffBy || 'Dr. Lab Incharge')}</em> on ${v.closureDate || ticket.dateReported}.<br />
              <small><strong>Remarks:</strong> ${escapeHtml(v.remarks || 'Standard QA protocol confirmed.')}</small>
            </div>
          </div>
          ${v.signatureImage ? `
            <div style="margin-top: 14px; padding: 12px 14px; background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 8px; display: flex; align-items: center; gap: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="background: #FAFAFA; border: 1px dashed #94A3B8; border-radius: 6px; padding: 4px; display: inline-flex;">
                <img src="${v.signatureImage}" alt="Authorized Digital Signature" style="max-height: 55px; max-width: 180px; object-fit: contain;" />
              </div>
              <div style="font-size: 0.78rem; line-height: 1.4;">
                <strong style="color: #059669; display: flex; align-items: center; gap: 4px;">
                  <span>🛡️</span> Cryptographic QA Digital Signature Recorded
                </strong>
                <span style="color: #475569;">Signatory: <strong>${escapeHtml(v.signOffBy || 'Dr. Authorized QA Officer')}</strong></span><br />
                <small style="color: #64748B;">Audit Timestamp: ${v.closureDate || ticket.dateReported}</small>
              </div>
            </div>
          ` : ''}
        ` : `
          <div class="closure-badge-notice pending-notice">
            <div class="notice-icon">⚠️</div>
            <div>
              <strong>Awaiting Authorized QA Closure Sign-off</strong><br />
              Complete the verification checklist below and draw digital signature to permanently record ticket closure.
            </div>
          </div>
        `}
      </div>
    `;

    // Clear signature canvas for fresh sign-off when inspecting unclosed ticket
    if (!isClosed) {
      clearSignatureCanvas();
    }

    // Pre-populate or toggle verification form checkboxes
    if (elements.verificationForm) {
      const chk1 = document.getElementById('chk-functional-test');
      const chk2 = document.getElementById('chk-safety-check');
      const chk3 = document.getElementById('chk-calibration-cert');
      const inputSignOff = document.getElementById('verify-officer-name');
      const inputRemarks = document.getElementById('verify-remarks');
      const submitBtn = document.getElementById('btn-submit-verification');

      if (chk1) chk1.checked = v.functionalTestPassed || false;
      if (chk2) chk2.checked = v.safetyCheckPassed || false;
      if (chk3) chk3.checked = v.calibrationCertified || false;
      if (inputSignOff) inputSignOff.value = v.signOffBy || (state.currentUser ? `${state.currentUser.name} (Verified Inspector)` : 'Harshit Kumar (Verified Inspector)');
      if (inputRemarks) inputRemarks.value = v.remarks || '';

      if (submitBtn) {
        if (isClosed) {
          submitBtn.textContent = 'Update Verification Records';
          submitBtn.classList.remove('btn-coral');
          submitBtn.classList.add('btn-secondary');
        } else {
          submitBtn.textContent = 'Sign & Permanently Close Ticket';
          submitBtn.classList.remove('btn-secondary');
          submitBtn.classList.add('btn-coral');
        }
      }
    }
  }

  /**
   * Handle Closure Verification Form Submit.
   */
  async function handleVerificationSubmit(e) {
    e.preventDefault();
    if (!state.selectedTicketId) {
      showToast('No ticket selected for verification', 'warning');
      return;
    }

    const chk1 = document.getElementById('chk-functional-test');
    const chk2 = document.getElementById('chk-safety-check');
    const chk3 = document.getElementById('chk-calibration-cert');
    const inputSignOff = document.getElementById('verify-officer-name');
    const inputRemarks = document.getElementById('verify-remarks');

    if (!chk1.checked || !chk2.checked) {
      showToast('Functional testing and safety checklist must be completed before closure.', 'warning');
      return;
    }

    // Digital Signature Persistence
    let signatureImage = null;
    if (state.hasSignature && elements.sigCanvas) {
      signatureImage = elements.sigCanvas.toDataURL('image/png');
    } else {
      signatureImage = generateSignOffBadgeImage(inputSignOff.value.trim() || 'QA Authorized Officer');
    }

    const verificationData = {
      functionalTestPassed: chk1.checked,
      safetyCheckPassed: chk2.checked,
      calibrationCertified: chk3 ? chk3.checked : true,
      signOffBy: inputSignOff.value.trim() || 'Dr. Authorized Lab Officer',
      remarks: inputRemarks.value.trim() || 'Passed all post-maintenance QA guidelines.',
      signatureImage: signatureImage
    };

    try {
      await LabGuardService.verifyClosure(state.selectedTicketId, verificationData);
      showToast(`Ticket ${state.selectedTicketId} successfully verified, signed, and closed!`, 'success');
      clearSignatureCanvas();
      await refreshAllData();
      renderVerificationDetails(state.selectedTicketId);
      renderKpiCounters();
      updateNotificationsDropdown();
    } catch (err) {
      showToast(`Verification failed: ${err.message}`, 'error');
    }
  }

  /**
   * Digital Canvas Signature Pad Implementation.
   */
  function initSignaturePad() {
    if (!elements.sigCanvas) return;
    const canvas = elements.sigCanvas;
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
    resizeCanvas();
    window.addEventListener('resize', debounce(resizeCanvas, 200));

    function getCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    function startDrawing(e) {
      isDrawing = true;
      const coords = getCoords(e);
      lastX = coords.x;
      lastY = coords.y;
      if (elements.sigHint) elements.sigHint.style.display = 'none';
      if (elements.sigFrame) elements.sigFrame.classList.add('signed');
      state.hasSignature = true;
    }

    function draw(e) {
      if (!isDrawing) return;
      e.preventDefault();
      const coords = getCoords(e);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      lastX = coords.x;
      lastY = coords.y;
    }

    function stopDrawing() {
      isDrawing = false;
    }

    // Mouse Events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Touch Events
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDrawing(e); }, { passive: false });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); }, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    // Clear Button
    if (elements.btnClearSig) {
      elements.btnClearSig.addEventListener('click', (e) => {
        e.preventDefault();
        clearSignatureCanvas();
      });
    }
  }

  function clearSignatureCanvas() {
    if (!elements.sigCanvas) return;
    const ctx = elements.sigCanvas.getContext('2d');
    ctx.clearRect(0, 0, elements.sigCanvas.width, elements.sigCanvas.height);
    if (elements.sigHint) elements.sigHint.style.display = 'block';
    if (elements.sigFrame) elements.sigFrame.classList.remove('signed');
    state.hasSignature = false;
  }

  function generateSignOffBadgeImage(name) {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 70;
    const ctx = canvas.getContext('2d');
    ctx.font = 'italic bold 20px "Segoe Script", "Brush Script MT", cursive, sans-serif';
    ctx.fillStyle = '#0F766E';
    ctx.fillText(name, 12, 38);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#0F766E';
    ctx.beginPath();
    ctx.moveTo(10, 48);
    ctx.lineTo(210, 48);
    ctx.stroke();
    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('Digital QA Stamp — LPU LabGuard ISO 17025', 12, 62);
    return canvas.toDataURL('image/png');
  }

  /**
   * Render Reports & Analytics View.
   */
  async function renderReportsView() {
    const metrics = await LabGuardService.getDashboardMetrics();

    if (elements.reportsKpiGrid) {
      elements.reportsKpiGrid.innerHTML = `
        <div class="report-kpi-card glass-card">
          <span class="report-kpi-label">Total Work Orders</span>
          <span class="report-kpi-val">${metrics.totalTickets}</span>
          <span class="report-kpi-sub">Across All Departments</span>
        </div>
        <div class="report-kpi-card glass-card">
          <span class="report-kpi-label">Active / In Progress</span>
          <span class="report-kpi-val text-warning">${metrics.inProgressTickets + metrics.openTickets}</span>
          <span class="report-kpi-sub">Requiring Engineering Attention</span>
        </div>
        <div class="report-kpi-card glass-card">
          <span class="report-kpi-label">Critical Incidents</span>
          <span class="report-kpi-val text-danger">${metrics.criticalPriority}</span>
          <span class="report-kpi-sub">High Hazard / Safety Alert</span>
        </div>
        <div class="report-kpi-card glass-card">
          <span class="report-kpi-label">Closed & Verified</span>
          <span class="report-kpi-val text-success">${metrics.closedTickets}</span>
          <span class="report-kpi-sub">100% QA Signed Off</span>
        </div>
      `;
    }

    if (elements.reportsTableBody) {
      const tickets = await LabGuardService.getTickets();
      elements.reportsTableBody.innerHTML = tickets.map((t) => `
        <tr>
          <td><strong>${t.id}</strong></td>
          <td>${escapeHtml(t.equipmentName)} <br/><small class="text-muted">[${t.equipmentId}]</small></td>
          <td>📍 ${escapeHtml(t.labLocation)}</td>
          <td><span class="badge ${getPriorityBadgeClass(t.priority)}">${t.priority}</span></td>
          <td><span class="badge ${getStatusBadgeClass(t.status)}">${t.status}</span></td>
          <td>${escapeHtml(t.assignedTechnician)}</td>
          <td>${t.dateReported}</td>
          <td>${t.closureVerification.verified ? '✓ Verified' : 'Pending'}</td>
        </tr>
      `).join('');
    }
  }

  /**
   * Export Reports Table to CSV File.
   */
  async function exportReportsToCsv() {
    const tickets = await LabGuardService.getTickets();
    if (tickets.length === 0) {
      showToast('No ticket records available to export', 'warning');
      return;
    }

    const headers = [
      'Ticket ID',
      'Title',
      'Equipment ID',
      'Equipment Name',
      'Laboratory',
      'Block',
      'Priority',
      'Status',
      'Assigned Technician',
      'Reported By',
      'Date Reported',
      'Closure Verified',
      'Verified By'
    ];

    const rows = tickets.map((t) => [
      t.id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.equipmentId,
      `"${(t.equipmentName || '').replace(/"/g, '""')}"`,
      `"${(t.labLocation || '').replace(/"/g, '""')}"`,
      t.block,
      t.priority,
      t.status,
      `"${(t.assignedTechnician || '').replace(/"/g, '""')}"`,
      `"${(t.reportedBy || '').replace(/"/g, '""')}"`,
      t.dateReported,
      t.closureVerification.verified ? 'YES' : 'NO',
      `"${(t.closureVerification.signOffBy || 'N/A').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LabGuard_Maintenance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Maintenance Compliance CSV Report downloaded!', 'success');
  }

  /**
   * Modals: Assign Technician.
   */
  function openAssignModal(ticketId) {
    const ticket = state.tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    state.selectedTicketId = ticketId;
    if (elements.assignModalTicketId) {
      elements.assignModalTicketId.textContent = `${ticket.id} — ${ticket.equipmentName}`;
    }
    if (elements.assignModalTechSelect) {
      elements.assignModalTechSelect.value = ticket.assignedTechnician !== 'Unassigned' ? ticket.assignedTechnician : '';
    }

    if (elements.assignModal) {
      elements.assignModal.classList.add('active');
    }
  }

  async function handleAssignTechSubmit(e) {
    e.preventDefault();
    const techName = elements.assignModalTechSelect.value;
    if (!techName) {
      showToast('Please select a technician from the list', 'warning');
      return;
    }

    try {
      await LabGuardService.assignTechnician(state.selectedTicketId, techName, 'Harshit Kumar (Admin)');
      showToast(`Assigned ${techName} to Ticket ${state.selectedTicketId}`, 'success');
      closeAllModals();
      await refreshAllData();
      renderTicketsList();
      renderKpiCounters();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  /**
   * Modals: Comments Thread.
   */
  async function openCommentsModal(ticketId) {
    const ticket = await LabGuardService.getTicketById(ticketId);
    if (!ticket) return;

    state.selectedTicketId = ticketId;
    if (elements.commentTicketTitle) {
      elements.commentTicketTitle.textContent = `${ticket.id}: ${ticket.title}`;
    }

    renderCommentsList(ticket.comments || []);
    if (elements.commentModal) {
      elements.commentModal.classList.add('active');
    }
  }

  function renderCommentsList(comments) {
    if (!elements.commentList) return;

    if (comments.length === 0) {
      elements.commentList.innerHTML = `
        <div class="empty-comments-state">
          <p>No maintenance comments yet. Be the first to post a status note!</p>
        </div>
      `;
      return;
    }

    elements.commentList.innerHTML = comments.map((c) => {
      const isTech = c.role === 'Technician';
      return `
        <div class="comment-bubble ${isTech ? 'tech-comment' : 'user-comment'}">
          <div class="comment-bubble-header">
            <strong>${escapeHtml(c.author)}</strong>
            <span class="badge ${isTech ? 'badge-primary' : 'badge-neutral'}">${escapeHtml(c.role || 'User')}</span>
            <span class="comment-time">🕒 ${c.timestamp}</span>
          </div>
          <div class="comment-text">${escapeHtml(c.text)}</div>
        </div>
      `;
    }).join('');

    // Scroll to bottom of comments
    elements.commentList.scrollTop = elements.commentList.scrollHeight;
  }

  async function handleAddCommentSubmit(e) {
    e.preventDefault();
    const text = elements.commentInputText.value.trim();
    const author = (elements.commentAuthorName && elements.commentAuthorName.value.trim()) || 'Harshit Kumar';

    if (!text) return;

    try {
      await LabGuardService.addComment(state.selectedTicketId, author, 'Student / Reporter', text);
      elements.commentInputText.value = '';
      const ticket = await LabGuardService.getTicketById(state.selectedTicketId);
      renderCommentsList(ticket.comments);
      showToast('Comment posted successfully', 'success');
      await refreshAllData();
      renderTicketsList();
    } catch (err) {
      showToast(`Error posting comment: ${err.message}`, 'error');
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach((m) => m.classList.remove('active'));
  }

  /**
   * Reset Demo Data Handler.
   */
  async function handleResetDemoData() {
    if (confirm('Reset all laboratory tickets and equipment to initial factory demo state?')) {
      await LabGuardService.resetToDefaultSeed();
      await refreshAllData();
      populateDropdowns();
      renderAllViews();
      showToast('Demo data successfully reset to factory defaults!', 'info');
    }
  }

  /**
   * Notifications Popover Management
   */
  function openNotificationsDropdown() {
    if (elements.notificationsDropdown) {
      updateNotificationsDropdown();
      elements.notificationsDropdown.classList.add('active');
      elements.notificationsDropdown.setAttribute('aria-hidden', 'false');
      if (elements.btnNotifications) elements.btnNotifications.setAttribute('aria-expanded', 'true');
    }
  }

  function closeNotificationsDropdown() {
    if (elements.notificationsDropdown) {
      elements.notificationsDropdown.classList.remove('active');
      elements.notificationsDropdown.setAttribute('aria-hidden', 'true');
      if (elements.btnNotifications) elements.btnNotifications.setAttribute('aria-expanded', 'false');
    }
  }

  function updateNotificationsDropdown() {
    const activeTickets = state.tickets.filter((t) => t.status !== 'Closed');
    const count = activeTickets.length;

    if (elements.headerNotifCount) elements.headerNotifCount.textContent = count;
    if (elements.notifDropdownCount) elements.notifDropdownCount.textContent = `${count} Active`;

    if (!elements.notifItemsList) return;

    if (count === 0) {
      elements.notifItemsList.innerHTML = `
        <div style="padding: 24px 18px; text-align: center; color: var(--text-muted); font-size: 0.88rem;">
          <div style="font-size: 1.5rem; margin-bottom: 6px;">✅</div>
          <strong>All Equipment Fully Operational</strong>
          <p style="font-size: 0.78rem; margin-top: 4px;">No open maintenance tickets reported.</p>
        </div>
      `;
      return;
    }

    // Display the latest active tickets
    const recentActive = activeTickets.slice(0, 5);
    elements.notifItemsList.innerHTML = recentActive.map((t) => {
      const priorityClass = getPriorityBadgeClass(t.priority);
      const timeStr = t.dateReported.includes(' ') ? t.dateReported.split(' ')[1] : t.dateReported;
      return `
        <div class="notif-item" data-ticket-id="${t.id}" title="Click to inspect work order ${t.id}">
          <div class="notif-item-top">
            <span class="notif-item-id">${t.id}</span>
            <span class="badge ${priorityClass}">${t.priority}</span>
            <span class="notif-item-time">🕒 ${timeStr}</span>
          </div>
          <div class="notif-item-title">${escapeHtml(t.title)}</div>
          <div class="notif-item-sub">📍 ${escapeHtml(t.labLocation)} &bull; <strong>${t.status}</strong></div>
        </div>
      `;
    }).join('');

    // Attach click listeners to individual notification cards
    elements.notifItemsList.querySelectorAll('.notif-item').forEach((item) => {
      item.addEventListener('click', () => {
        const ticketId = item.getAttribute('data-ticket-id');
        closeNotificationsDropdown();
        switchTab('tab-tickets');

        // Scroll to specific ticket card and apply pulse highlight
        setTimeout(() => {
          const card = document.querySelector(`.ticket-card[data-ticket-id="${ticketId}"]`);
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.style.transition = 'all 0.3s ease';
            card.style.outline = '3px solid var(--coral-primary)';
            card.style.boxShadow = '0 0 24px rgba(255, 122, 89, 0.45)';
            setTimeout(() => {
              card.style.outline = '';
              card.style.boxShadow = '';
            }, 2600);
          }
        }, 180);
      });
    });
  }

  /**
   * User Authentication & Role Management (Student, Technician, Management, Administrator)
   */
  function openLoginModal() {
    if (elements.modalAuthLogin) {
      updateRoleModalHighlight(state.currentUser ? state.currentUser.type : 'student');
      elements.modalAuthLogin.classList.add('active');
    }
  }

  function updateRoleModalHighlight(activeRoleType) {
    if (!elements.roleSelectorGrid) return;
    elements.roleSelectorGrid.querySelectorAll('.role-card').forEach((card) => {
      const role = card.getAttribute('data-role');
      const badge = card.querySelector('.role-card-badge');
      const btn = card.querySelector('.btn-switch-role');
      if (role === activeRoleType) {
        card.classList.add('active');
        if (badge) badge.style.display = 'block';
        if (btn) {
          btn.textContent = 'Active';
          btn.className = 'btn btn-sm btn-coral btn-switch-role';
        }
      } else {
        card.classList.remove('active');
        if (badge) badge.style.display = 'none';
        if (btn) {
          btn.textContent = 'Switch';
          btn.className = 'btn btn-sm btn-outline btn-switch-role';
        }
      }
    });
  }

  async function handleSwitchUserRole(roleType) {
    try {
      const user = await LabGuardService.setCurrentUser(roleType);
      state.currentUser = user;
      closeAllModals();
      renderUserDetailsCard(user);
      showToast(`Switched account to ${user.name} (${user.roleBadge})`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleManualLoginSubmit(e) {
    e.preventDefault();
    const query = elements.loginUsername ? elements.loginUsername.value.trim() : '';
    if (!query) {
      showToast('Please enter username, email or ID', 'warning');
      return;
    }

    try {
      const user = await LabGuardService.loginUser(query);
      state.currentUser = user;
      closeAllModals();
      renderUserDetailsCard(user);
      showToast(`Welcome ${user.name}! Authenticated as ${user.roleBadge}.`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  /**
   * Renders the Left Hero Card & Header Profile for the Active User Role
   */
  function renderUserDetailsCard(user) {
    if (!user) return;

    // 1. Update Header User Profile
    if (elements.headerUserAvatar) {
      elements.headerUserAvatar.textContent = user.avatar;
      elements.headerUserAvatar.style.background = user.avatarBg;
    }
    if (elements.headerUserName) elements.headerUserName.textContent = user.name;
    if (elements.headerUserRole) elements.headerUserRole.textContent = user.roleBadge;

    // 2. Update Welcome Banner
    if (elements.welcomeUserTitle) {
      elements.welcomeUserTitle.textContent = `Welcome ${user.name}`;
    }
    if (elements.welcomeUserDesc) {
      if (user.type === 'student') {
        elements.welcomeUserDesc.innerHTML = 'Access LPU\'s Laboratory Database to discover <strong>equipment</strong>, <strong>software</strong>, and report maintenance issues across research facilities.';
      } else if (user.type === 'technician') {
        elements.welcomeUserDesc.innerHTML = 'Review assigned <strong>engineering tickets</strong>, calibrate sensors, update parts orders, and record technician repair logs.';
      } else if (user.type === 'management') {
        elements.welcomeUserDesc.innerHTML = 'Oversee central <strong>laboratory infrastructure</strong>, audit safety protocols, and execute formal <strong>ISO 17025</strong> closure verification sign-offs.';
      } else if (user.type === 'administrator') {
        elements.welcomeUserDesc.innerHTML = 'Master <strong>facility administration</strong>: manage technician duty rosters, dispatch priorities, machine registries, and system compliance.';
      }
    }

    // 3. Render Dynamic Left Hero Card
    if (elements.userDetailsCard) {
      elements.userDetailsCard.innerHTML = `
        <div class="card-title-header">
          <div class="card-title-icon" aria-hidden="true">${user.roleIcon}</div>
          <h2 class="card-title-text">${escapeHtml(user.cardTitle)}</h2>
          <span class="badge ${user.type === 'student' ? 'badge-primary' : (user.type === 'technician' ? 'badge-warning' : (user.type === 'management' ? 'badge-info' : 'badge-danger'))}" style="margin-left: auto;">
            ${escapeHtml(user.roleBadge)}
          </span>
        </div>

        <div class="student-info-grid">
          <div class="info-item">
            <span class="info-icon" aria-hidden="true">👤</span>
            <div>
              <span class="info-label">Full Name</span>
              <span class="info-value">${escapeHtml(user.name)}</span>
            </div>
          </div>

          <div class="info-item">
            <span class="info-icon" aria-hidden="true">🪪</span>
            <div>
              <span class="info-label">${escapeHtml(user.detail1Label)}</span>
              <span class="info-value font-mono">${escapeHtml(user.detail1Val)}</span>
            </div>
          </div>

          <div class="info-item">
            <span class="info-icon" aria-hidden="true">🏛️</span>
            <div>
              <span class="info-label">${escapeHtml(user.detail2Label)}</span>
              <span class="info-value">${escapeHtml(user.detail2Val)}</span>
            </div>
          </div>

          <div class="info-item">
            <span class="info-icon" aria-hidden="true">✉️</span>
            <div>
              <span class="info-label">Contact / Email</span>
              <span class="info-value">${escapeHtml(user.email)}</span>
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border-light);">
          <div style="font-size: 0.82rem; color: var(--text-secondary);">
            <strong>Role Clearance:</strong> ${escapeHtml(user.detail4Val)}
          </div>
          <button class="btn-card-switch-user" id="btn-card-switch-user" type="button">
            <span>🔄</span> Switch Role
          </button>
        </div>
      `;

      // Bind switch button inside card
      const cardSwitchBtn = document.getElementById('btn-card-switch-user');
      if (cardSwitchBtn) {
        cardSwitchBtn.addEventListener('click', openLoginModal);
      }
    }

    // 4. Pre-fill form inputs based on logged in user
    if (elements.inputReporter) {
      elements.inputReporter.value = `${user.name} (${user.id})`;
    }
    if (elements.inputReporterEmail) {
      elements.inputReporterEmail.value = user.email;
    }
    if (elements.commentAuthorName) {
      elements.commentAuthorName.value = `${user.name} (${user.roleBadge})`;
    }

    const verifySignOffInput = document.getElementById('verify-officer-name');
    if (verifySignOffInput && (user.type === 'management' || user.type === 'administrator')) {
      verifySignOffInput.value = `${user.name} (Verified Sign-off Officer)`;
    }
  }

  function renderAllViews() {
    renderUserDetailsCard(state.currentUser);
    renderKpiCounters();
    renderTicketsList();
    renderEquipmentGrid();
    renderHistoryTimeline();
    populateVerificationDropdown();
    renderReportsView();
    updateNotificationsDropdown();
  }

  /**
   * Toast Notification Dispatcher.
   */
  function showToast(message, type = 'info') {
    if (!elements.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} glass-card`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-body">${escapeHtml(message)}</div>
      <button class="toast-close" aria-label="Close notification">&times;</button>
    `;

    elements.toastContainer.appendChild(toast);

    // Fade in animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto remove after 3.5s
    const timeout = setTimeout(() => {
      removeToast(toast);
    }, 3800);

    toast.querySelector('.toast-close').addEventListener('click', () => {
      clearTimeout(timeout);
      removeToast(toast);
    });
  }

  function removeToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 300);
  }

  /**
   * Theme Management (Light / Dark Mode).
   */
  function initTheme() {
    const savedTheme = localStorage.getItem('labguard_theme') || 'light';
    applyTheme(savedTheme);
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      if (elements.btnThemeToggle) {
        elements.btnThemeToggle.innerHTML = '<span>☀️</span>';
        elements.btnThemeToggle.title = 'Switch to Light Mode';
      }
    } else {
      document.body.classList.remove('dark-theme');
      if (elements.btnThemeToggle) {
        elements.btnThemeToggle.innerHTML = '<span>🌙</span>';
        elements.btnThemeToggle.title = 'Switch to Dark Mode';
      }
    }
  }

  function toggleTheme() {
    const isDark = document.body.classList.contains('dark-theme');
    const newTheme = isDark ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('labguard_theme', newTheme);
    showToast(`Switched to ${newTheme === 'dark' ? 'Night / Dark' : 'Day / Light'} theme`, 'info');
  }

  /**
   * Toggle Password Visibility in Manual Login Form.
   */
  function togglePasswordVisibility() {
    if (!elements.loginPassword) return;
    const isPass = elements.loginPassword.type === 'password';
    elements.loginPassword.type = isPass ? 'text' : 'password';
    if (elements.passwordToggleIcon) {
      elements.passwordToggleIcon.textContent = isPass ? '🙈' : '👁️';
    }
    if (elements.btnTogglePassword) {
      elements.btnTogglePassword.title = isPass ? 'Hide password' : 'Show password';
    }
  }

  /**
   * 1-Click Demo Credential Chips in Login Modal.
   */
  function attachQuickCredsListeners() {
    document.querySelectorAll('.btn-cred-chip').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        const user = chip.getAttribute('data-user');
        const role = chip.getAttribute('data-role');
        if (elements.loginUsername) elements.loginUsername.value = user;
        if (elements.loginPassword) elements.loginPassword.value = 'lpu@2026';
        updateRoleModalHighlight(role);
        showToast(`Auto-filled official credentials for ${role} (${user})`, 'info');
      });
    });
  }

  /**
   * Calculate Dynamic ISO SLA Deadline Badge for Tickets.
   */
  function getSlaBadge(ticket) {
    if (ticket.status === 'Closed' || ticket.status === 'Resolved') {
      return '<span class="sla-pill sla-met" title="Resolved within university ISO timeline">⚡ SLA Met</span>';
    }
    if (ticket.priority === 'Critical') {
      return '<span class="sla-pill sla-urgent" title="Urgent: 2-Hour Stoppage Protocol">⚡ SLA: 1h 48m</span>';
    }
    if (ticket.priority === 'High') {
      return '<span class="sla-pill sla-warning" title="24-Hour Containment SLA">⚡ SLA: 18h left</span>';
    }
    if (ticket.priority === 'Medium') {
      return '<span class="sla-pill" title="48-Hour Routine Calibration SLA">⏱️ SLA: 36h</span>';
    }
    return '<span class="sla-pill" title="72-Hour Standard Service SLA">⏱️ SLA: 72h</span>';
  }

  /**
   * Equipment Calibration Asset Tag & QR Passport.
   */
  function openAssetTagModal(eqId) {
    const eq = state.equipment.find((e) => e.id === eqId);
    if (!eq) return;

    if (elements.tagEqId) elements.tagEqId.textContent = eq.id;
    if (elements.tagEqName) elements.tagEqName.textContent = eq.name;
    if (elements.tagEqSerial) elements.tagEqSerial.textContent = eq.serial;
    if (elements.tagEqLab) elements.tagEqLab.textContent = `${eq.lab} (${eq.block})`;
    if (elements.tagEqDept) elements.tagEqDept.textContent = eq.department;
    if (elements.tagCalDate) elements.tagCalDate.textContent = eq.lastCalibrated;

    const nextDate = calculateNextExpiry(eq.lastCalibrated);
    if (elements.tagExpDate) elements.tagExpDate.textContent = nextDate;

    if (elements.tagStatus) {
      if (eq.status === 'Operational') {
        elements.tagStatus.textContent = 'CERTIFIED SAFE';
        elements.tagStatus.className = 'sticker-badge badge-green';
      } else {
        elements.tagStatus.textContent = 'CHECK REQUIRED';
        elements.tagStatus.className = 'sticker-badge badge-warning';
      }
    }
    if (elements.tagBarcodeText) elements.tagBarcodeText.textContent = `*${eq.id}*`;

    if (elements.modalAssetTag) {
      elements.modalAssetTag.classList.add('active');
    }
  }

  function calculateNextExpiry(dateStr) {
    if (!dateStr) return '2027-10-15';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10) + 1;
      return `${year}-${parts[1]}-${parts[2]}`;
    }
    return '2027-10-15';
  }

  function printAssetSticker() {
    const printArea = document.getElementById('asset-tag-printable-area');
    if (!printArea) return;

    const printWin = window.open('', '', 'width=650,height=450');
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Equipment Calibration Asset Tag</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; justify-content: center; align-items: center; padding: 25px; margin: 0; }
          .calibration-asset-sticker { width: 460px; border: 3px solid #000; padding: 14px 16px; border-radius: 8px; box-sizing: border-box; }
          .asset-sticker-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 10px; }
          .sticker-brand { display: flex; align-items: center; gap: 8px; }
          .sticker-iso-badge { background: #000; color: #fff; font-size: 11px; font-weight: 800; padding: 3px 6px; border-radius: 3px; }
          .asset-sticker-body { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 10px; font-size: 12px; }
          .sticker-field { margin-bottom: 4px; display: flex; gap: 6px; }
          .sticker-field .lbl { font-weight: 800; color: #555; width: 95px; }
          .sticker-qr-section { display: flex; flex-direction: column; align-items: center; border-left: 1px dashed #ccc; padding-left: 8px; }
          .asset-sticker-dates { background: #f2f2f2; border: 1px solid #ddd; border-radius: 4px; padding: 6px 10px; display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 10px; }
          .sticker-badge { font-weight: 800; padding: 2px 6px; border-radius: 3px; background: #d1fae5; color: #065f46; }
          .asset-sticker-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #ddd; padding-top: 8px; }
          .stamp-circle { border: 2px solid #059669; color: #059669; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: 800; }
        </style>
      </head>
      <body>
        ${printArea.innerHTML}
      </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
      printWin.close();
    }, 250);
  }

  /**
   * Utilities
   */
  function getPriorityBadgeClass(priority) {
    switch (priority) {
      case 'Critical': return 'badge-danger-glow';
      case 'High': return 'badge-warning';
      case 'Medium': return 'badge-amber';
      case 'Low': return 'badge-info';
      default: return 'badge-neutral';
    }
  }

  function getStatusBadgeClass(status) {
    switch (status) {
      case 'Open': return 'badge-info';
      case 'In Progress': return 'badge-warning';
      case 'Pending Parts': return 'badge-secondary';
      case 'Resolved': return 'badge-primary';
      case 'Closed': return 'badge-success';
      default: return 'badge-neutral';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Start Application on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
