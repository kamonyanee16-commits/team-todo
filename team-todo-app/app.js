/**
 * TeamTask Hub - Main Application Logic
 * Supports Supervisor Overview & Member Personal Kanban Boards
 */

// ==========================================================================
// Storage Keys & Initial Demo Data
// ==========================================================================
// (ตัวเลือกแนะนำ) นำ Web App URL ของ Google Sheets มาวางที่นี่
// เพื่อให้ทุกคนที่เปิดเว็บผ่านลิงก์ (เช่น GitHub Pages) เชื่อมต่อชีตอัตโนมัติทันทีโดยไม่ต้องตั้งค่าเอง
const DEFAULT_SHEETS_URL = '';

const STORAGE_KEY_TASKS = 'team_tasks_data_v1';
const STORAGE_KEY_MEMBERS = 'team_members_data_v1';
const STORAGE_KEY_LOGGED_USER = 'team_logged_user_v2';
const STORAGE_KEY_VIEWING_BOARD = 'team_viewing_board_v2';
const STORAGE_KEY_SHEETS_URL = 'team_sheets_api_url_v1';
const STORAGE_KEY_AUTO_SYNC = 'team_auto_sync_enabled_v1';

// Initial Team Members
const DEFAULT_MEMBERS = [
  { id: 'mem1', name: 'สมชาย สายลุย', role: 'ช่างเทคนิคงานเชื่อม', avatarColor: '#2563eb' },
  { id: 'mem2', name: 'สมศรี มีสุข', role: 'วิศวกรโครงสร้าง', avatarColor: '#7c3aed' },
  { id: 'mem3', name: 'วรวิทย์ จิตดี', role: 'เจ้าหน้าที่จัดซื้อ', avatarColor: '#059669' },
  { id: 'mem4', name: 'กิตติพงษ์ มั่นคง', role: 'ผู้ตรวจสอบคุณภาพ (QC)', avatarColor: '#ea580c' }
];

// Helper to format dates
function getTodayString(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

// Initial Tasks covering different statuses and deadlines
const DEFAULT_TASKS = [
  {
    id: 'task_001',
    title: 'ตรวจสอบรอยเชื่อมคานเหล็ก H-Beam โครงการเสา C3-C4',
    description: 'ใช้เครื่องมือ Ultrasonic ตรวจสอบแนวเชื่อมโครงทรัสและคานเหล็กความยาว 12 เมตร พร้อมบันทึกผลลงรายงาน QC',
    createdDate: getTodayString(-3),
    deadline: getTodayString(-1), // Overdue
    status: 'in_progress',
    assigneeId: 'mem1',
    priority: 'urgent',
    blockedReason: '',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task_002',
    title: 'รอผลทดสอบพ่นละอองเกลือ (Salt Spray Test) ชิ้นงานชุบกัลวาไนซ์',
    description: 'ติดตามผลการทดสอบการกัดกร่อนของตัวอย่างเหล็กชุบสังกะสีตามมาตรฐาน ASTM B117 จากห้องปฏิบัติการภายนอก',
    createdDate: getTodayString(-4),
    deadline: getTodayString(1), // Due soon
    status: 'blocked',
    assigneeId: 'mem2',
    priority: 'high',
    blockedReason: 'ห้องแล็บภายนอกแจ้งว่าเครื่องทดสอบอยู่ระหว่างการสอบเทียบ (Calibration) คาดว่าจะได้ผลตรวจวันศุกร์นี้',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task_003',
    title: 'คำนวณและสั่งซื้อเหล็กแผ่นหนา 12mm จำนวน 40 ตัน',
    description: 'ประสานงานกับฝ่ายผลิตเพื่อยืนยันสเปกเหล็ก SS400 และส่งใบขอราคา (RFQ) ไปยังผู้ค้าเหล็ก 3 ราย',
    createdDate: getTodayString(-2),
    deadline: getTodayString(3),
    status: 'todo',
    assigneeId: 'mem3',
    priority: 'normal',
    blockedReason: '',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task_004',
    title: 'ตรวจรับงานพ่นสีกันสนิมโครงหลังคาโรงงาน 2',
    description: 'วัดความหนาของฟิล์มสี (DFT) และตรวจเช็คความสม่ำเสมอของชั้นเคลือบสีรองพื้น Epoxy Zinc Rich',
    createdDate: getTodayString(-5),
    deadline: getTodayString(0), // Today
    status: 'review',
    assigneeId: 'mem4',
    priority: 'high',
    blockedReason: '',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task_005',
    title: 'เตรียมชุดเครื่องมือดัดเหล็กและเปลี่ยนหัวเชื่อม TIG',
    description: 'ตรวจเช็คความพร้อมของสายส่งแก๊สอาร์กอน และเปลี่ยนหัวทังสเตนใหม่สำหรับการประกอบชิ้นส่วนท่อ',
    createdDate: getTodayString(-6),
    deadline: getTodayString(-2),
    status: 'done',
    assigneeId: 'mem1',
    priority: 'normal',
    blockedReason: '',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task_006',
    title: 'ทบทวนแบบขยายโครงสร้างบันไดหนีไฟ (Shop Drawing)',
    description: 'ตรวจสอบจุดเชื่อมต่อเสากับตัวอาคารตามข้อกำหนดทางวิศวกรรมโครงสร้าง ก่อนส่งต่อให้ฝ่ายผลิตตัดเหล็ก',
    createdDate: getTodayString(-1),
    deadline: getTodayString(2),
    status: 'todo',
    assigneeId: 'mem2',
    priority: 'normal',
    blockedReason: '',
    updatedAt: new Date().toISOString()
  }
];

// ==========================================================================
// Application State
// ==========================================================================
const state = {
  loggedUser: 'supervisor', // ตัวตนของผู้ใช้งาน: 'supervisor' หรือ memberId ('mem1', 'mem2'...)
  viewingBoard: 'supervisor', // บอร์ดที่กำลังเปิดดู: 'supervisor' หรือ memberId
  members: [],
  tasks: [],
  activeView: 'kanban', // 'kanban' or 'table'
  filters: {
    search: '',
    assignee: 'all',
    priority: 'all',
    deadline: 'all'
  },
  draggedTaskId: null,
  pendingBlockedTask: null,
  // Google Sheets Cloud Sync State
  sheetsUrl: '',
  autoSync: true,
  syncStatus: 'offline', // 'offline' | 'connected' | 'syncing' | 'error'
  lastSyncTime: null
};

// Variable holding attachments currently in task form
let currentFormAttachments = [];

// ==========================================================================
// Initialization & Storage
// ==========================================================================
function initApp() {
  loadStoredData();
  bindEvents();
  renderApp();
  initCloudSync();
}

function loadStoredData() {
  try {
    const storedMembers = localStorage.getItem(STORAGE_KEY_MEMBERS);
    state.members = storedMembers ? JSON.parse(storedMembers) : [...DEFAULT_MEMBERS];

    const storedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
    state.tasks = storedTasks ? JSON.parse(storedTasks) : [...DEFAULT_TASKS];

    const storedLogged = localStorage.getItem(STORAGE_KEY_LOGGED_USER);
    if (storedLogged) {
      state.loggedUser = storedLogged;
    } else {
      const oldRole = localStorage.getItem('team_current_role_v1');
      if (oldRole) state.loggedUser = oldRole;
    }

    const storedViewing = localStorage.getItem(STORAGE_KEY_VIEWING_BOARD);
    if (storedViewing) {
      state.viewingBoard = storedViewing;
    } else {
      state.viewingBoard = state.loggedUser;
    }

    // Check if sheetsUrl was passed in URL query param (e.g. ?sheetsUrl=https://script.google.com/...)
    const urlParams = new URLSearchParams(window.location.search);
    const querySheetsUrl = urlParams.get('sheetsUrl') || urlParams.get('api');
    if (querySheetsUrl && querySheetsUrl.startsWith('https://script.google.com/')) {
      localStorage.setItem(STORAGE_KEY_SHEETS_URL, querySheetsUrl);
      state.sheetsUrl = querySheetsUrl;
      state.syncStatus = 'connected';
    } else {
      const storedSheetsUrl = localStorage.getItem(STORAGE_KEY_SHEETS_URL) || DEFAULT_SHEETS_URL;
      if (storedSheetsUrl) {
        state.sheetsUrl = storedSheetsUrl;
        state.syncStatus = 'connected';
      }
    }

    const storedAutoSync = localStorage.getItem(STORAGE_KEY_AUTO_SYNC);
    if (storedAutoSync !== null) {
      state.autoSync = storedAutoSync === 'true';
    }
  } catch (err) {
    console.error('Error loading stored data:', err);
    state.members = [...DEFAULT_MEMBERS];
    state.tasks = [...DEFAULT_TASKS];
    state.loggedUser = 'supervisor';
    state.viewingBoard = 'supervisor';
  }
}

function saveUserIdentity(userId) {
  state.loggedUser = userId;
  state.viewingBoard = userId; // When changing identity, default viewing board to own board
  localStorage.setItem(STORAGE_KEY_LOGGED_USER, userId);
  localStorage.setItem(STORAGE_KEY_VIEWING_BOARD, userId);
}

function saveViewingBoard(boardId) {
  state.viewingBoard = boardId;
  localStorage.setItem(STORAGE_KEY_VIEWING_BOARD, boardId);
}

// ==========================================================================
// File & Photo Attachment Handling
// ==========================================================================
function getTaskAttachments(task) {
  if (!task || !task.attachments) return [];
  if (Array.isArray(task.attachments)) return task.attachments;
  if (typeof task.attachments === 'string') {
    try {
      let parsed = JSON.parse(task.attachments);
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  return [];
}

function compressImageFile(file, maxWidth = 1000, quality = 0.75) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({
          id: 'att_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          name: file.name,
          size: Math.round((dataUrl.length * 3) / 4),
          type: 'image/jpeg',
          data: dataUrl
        });
      };
      img.onerror = () => {
        // Fallback: if canvas fails to render, return raw data URL
        resolve({
          id: 'att_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          name: file.name,
          size: file.size,
          type: file.type || 'image/jpeg',
          data: e.target.result
        });
      };
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

function readDocumentFile(file) {
  return new Promise((resolve) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast(`ไฟล์ "${file.name}" มีขนาดเกิน 5MB ไม่สามารถแนบได้`, 'warning');
      return resolve(null);
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        id: 'att_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        data: e.target.result
      });
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

async function handleFilesSelected(files) {
  if (!files || files.length === 0) return;
  const fileArray = Array.from(files);

  showToast(`กำลังแนบไฟล์ ${fileArray.length} ไฟล์...`, 'info');

  for (const file of fileArray) {
    try {
      if (file.type.startsWith('image/')) {
        const compressed = await compressImageFile(file);
        if (compressed) currentFormAttachments.push(compressed);
      } else {
        const doc = await readDocumentFile(file);
        if (doc) currentFormAttachments.push(doc);
      }
    } catch (err) {
      console.error('File process error:', err);
    }
  }

  renderFormAttachmentPreviews();
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function renderFormAttachmentPreviews() {
  const container = document.getElementById('taskAttachmentPreviews');
  const countLabel = document.getElementById('lblAttachmentCount');
  if (!container) return;

  if (countLabel) {
    countLabel.textContent = currentFormAttachments.length > 0 
      ? `แนบแล้ว ${currentFormAttachments.length} ไฟล์` 
      : 'ยังไม่มีไฟล์แนบ';
  }

  if (currentFormAttachments.length === 0) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  currentFormAttachments.forEach((att, idx) => {
    const isImg = (att.type && att.type.startsWith('image/')) || (att.url && att.url.match(/\.(jpeg|jpg|gif|png|webp)/i));
    const src = att.url || att.data;

    html += `
      <div class="attachment-chip">
        <button type="button" class="btn-remove-attachment" onclick="removeFormAttachment(${idx})" title="ลบไฟล์นี้">&times;</button>
        ${isImg ? `
          <img src="${src}" class="attachment-thumb" alt="${escapeHTML(att.name)}" onclick="openLightbox('${src}')" style="cursor:pointer;">
        ` : `
          <div class="attachment-doc-icon">📄</div>
        `}
        <div class="attachment-name" title="${escapeHTML(att.name)}">${escapeHTML(att.name)}</div>
        <div class="attachment-size">${formatFileSize(att.size)}</div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function removeFormAttachment(index) {
  currentFormAttachments.splice(index, 1);
  renderFormAttachmentPreviews();
}

function openLightbox(imgSrc) {
  const modal = document.getElementById('imageLightboxModal');
  const img = document.getElementById('lightboxImg');
  if (modal && img) {
    img.src = imgSrc;
    modal.classList.add('active');
  }
}

function closeLightbox() {
  const modal = document.getElementById('imageLightboxModal');
  if (modal) modal.classList.remove('active');
}


function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(state.tasks));
  } catch (err) {
    console.error('Error saving tasks:', err);
    showToast('ไม่สามารถบันทึกข้อมูลลงเครื่องได้', 'error');
  }
}

function saveMembers() {
  try {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(state.members));
  } catch (err) {
    console.error('Error saving members:', err);
  }
}

function saveRole(role) {
  state.currentRole = role;
  try {
    localStorage.setItem(STORAGE_KEY_ROLE, role);
  } catch (err) {
    console.error('Error saving role:', err);
  }
}

// ==========================================================================
// Deadline & Status Calculation Helpers
// ==========================================================================
function getDeadlineInfo(deadlineStr, status) {
  if (status === 'done') {
    return { type: 'done', label: 'เสร็จเรียบร้อย', badgeClass: 'done' };
  }

  if (!deadlineStr) {
    return { type: 'normal', label: 'ไม่ระบุ', badgeClass: 'normal' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(deadlineStr);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      type: 'overdue',
      label: `เกินกำหนด ${Math.abs(diffDays)} วัน`,
      badgeClass: 'overdue',
      diffDays
    };
  } else if (diffDays === 0) {
    return {
      type: 'due_soon',
      label: 'ครบกำหนดวันนี้!',
      badgeClass: 'soon',
      diffDays
    };
  } else if (diffDays <= 2) {
    return {
      type: 'due_soon',
      label: `อีก ${diffDays} วัน`,
      badgeClass: 'soon',
      diffDays
    };
  } else {
    return {
      type: 'normal',
      label: `อีก ${diffDays} วัน`,
      badgeClass: 'normal',
      diffDays
    };
  }
}

function getMemberById(id) {
  return state.members.find(m => m.id === id) || {
    id: 'unknown',
    name: 'ยังไม่ระบุ',
    role: 'ทีมงาน',
    avatarColor: '#64748b'
  };
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getStatusTitle(status) {
  switch (status) {
    case 'todo': return '📝 รอดำเนินการ';
    case 'in_progress': return '⚙️ กำลังทำ';
    case 'blocked': return '⚠️ ติดปัญหา / ระงับ';
    case 'review': return '🔍 รอตรวจรับ';
    case 'done': return '✅ เสร็จสิ้น';
    default: return status;
  }
}

function getPriorityBadge(priority) {
  switch (priority) {
    case 'urgent':
      return `<span class="priority-tag urgent">🔥 ด่วนมาก</span>`;
    case 'high':
      return `<span class="priority-tag high">สูง</span>`;
    case 'normal':
      return `<span class="priority-tag normal">ปกติ</span>`;
    case 'low':
      return `<span class="priority-tag low">ต่ำ</span>`;
    default:
      return `<span class="priority-tag normal">ปกติ</span>`;
  }
}

// Format Thai Date string (e.g. 20 พ.ย. 2026)
function formatThaiDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  return `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
}

// ==========================================================================
// Filtering & Scope Logic
// ==========================================================================
function getScopedTasks() {
  // If viewing a specific member's board (either member viewing self/friend, or supervisor viewing member)
  if (state.viewingBoard !== 'supervisor') {
    return state.tasks.filter(t => t.assigneeId === state.viewingBoard);
  }
  return state.tasks;
}

function getFilteredTasks() {
  const scoped = getScopedTasks();
  const { search, assignee, priority, deadline } = state.filters;

  return scoped.filter(task => {
    // Search filter (title, description, assignee name)
    if (search) {
      const q = search.toLowerCase();
      const member = getMemberById(task.assigneeId);
      const titleMatch = (task.title || '').toLowerCase().includes(q);
      const descMatch = (task.description || '').toLowerCase().includes(q);
      const memberMatch = (member.name || '').toLowerCase().includes(q);
      if (!titleMatch && !descMatch && !memberMatch) return false;
    }

    // Assignee filter (in supervisor master view)
    if (state.loggedUser === 'supervisor' && state.viewingBoard === 'supervisor' && assignee !== 'all') {
      if (task.assigneeId !== assignee) return false;
    }

    // Priority filter
    if (priority !== 'all') {
      if (task.priority !== priority) return false;
    }

    // Deadline filter
    if (deadline !== 'all') {
      const deadlineInfo = getDeadlineInfo(task.deadline, task.status);
      if (deadline === 'overdue' && deadlineInfo.type !== 'overdue') return false;
      if (deadline === 'due_soon' && deadlineInfo.type !== 'due_soon') return false;
      if (deadline === 'on_track' && deadlineInfo.type !== 'normal' && deadlineInfo.type !== 'done') return false;
    }

    return true;
  });
}

// ==========================================================================
// Main Render Pipeline
// ==========================================================================
function renderApp() {
  renderProfileSwitcher();
  renderRoleBanner();
  renderKPIs();
  renderAssigneeFilterOptions();

  // Supervisor team workload cards only visible when supervisor is viewing master board
  if (state.loggedUser === 'supervisor' && state.viewingBoard === 'supervisor') {
    document.getElementById('supervisorSection').style.display = 'block';
    renderWorkloadSection();
  } else {
    document.getElementById('supervisorSection').style.display = 'none';
  }

  if (state.activeView === 'kanban') {
    document.getElementById('kanbanBoardView').style.display = 'grid';
    document.getElementById('tableViewSection').style.display = 'none';
    renderKanbanBoard();
  } else {
    document.getElementById('kanbanBoardView').style.display = 'none';
    document.getElementById('tableViewSection').style.display = 'block';
    renderTableView();
  }
}

// ==========================================================================
// Profile Switcher & Header UI
// ==========================================================================
function renderProfileSwitcher() {
  const currentAvatar = document.getElementById('currentAvatar');
  const currentName = document.getElementById('currentName');
  const currentRoleTag = document.getElementById('currentRoleTag');
  const memberMenuList = document.getElementById('memberMenuList');

  if (state.loggedUser === 'supervisor') {
    currentAvatar.className = 'profile-avatar supervisor';
    currentAvatar.style.background = '#1e293b';
    currentAvatar.textContent = 'ผบ';
    currentName.textContent = 'หัวหน้าทีม (Supervisor)';
    currentRoleTag.textContent = state.viewingBoard === 'supervisor' ? 'ภาพรวมทีมงานทั้งหมด' : `กำลังดูบอร์ดของ ${getMemberById(state.viewingBoard).name}`;
  } else {
    const member = getMemberById(state.loggedUser);
    currentAvatar.className = 'profile-avatar';
    currentAvatar.style.background = member.avatarColor || '#4f46e5';
    currentAvatar.textContent = getInitials(member.name);
    currentName.textContent = member.name;
    currentRoleTag.textContent = state.viewingBoard === state.loggedUser ? (member.role || 'ทีมงาน') : `ดูบอร์ดของ ${getMemberById(state.viewingBoard).name}`;
  }

  // Populate Member Switcher List
  let html = '';
  state.members.forEach(m => {
    const isActive = state.loggedUser === m.id ? 'active' : '';
    const taskCount = state.tasks.filter(t => t.assigneeId === m.id && t.status !== 'done').length;
    html += `
      <div class="menu-item ${isActive}" data-user-id="${m.id}">
        <div class="avatar-circle" style="background: ${m.avatarColor || '#4f46e5'};">
          ${getInitials(m.name)}
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 600;">${escapeHTML(m.name)}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${escapeHTML(m.role || 'ทีมงาน')} • งานค้าง ${taskCount} รายการ</div>
        </div>
      </div>
    `;
  });
  memberMenuList.innerHTML = html;
}

// ==========================================================================
// Role Banner Rendering
// ==========================================================================
function renderRoleBanner() {
  const badge = document.getElementById('bannerBadge');
  const title = document.getElementById('bannerTitle');
  const desc = document.getElementById('bannerDesc');
  const lblBtnQuickAdd = document.getElementById('lblBtnQuickAdd');
  const btnQuickAddTask = document.getElementById('btnQuickAddTask');
  const filterAssignee = document.getElementById('filterAssignee');
  const readonlyBanner = document.getElementById('readonlyNoticeBanner');
  const readonlyText = document.getElementById('readonlyNoticeText');

  if (state.loggedUser === 'supervisor') {
    if (readonlyBanner) readonlyBanner.style.display = 'none';
    if (btnQuickAddTask) btnQuickAddTask.style.display = 'inline-flex';

    if (state.viewingBoard === 'supervisor') {
      badge.className = 'role-banner-badge supervisor';
      badge.innerHTML = '👔';
      title.textContent = 'หน้าหัวหน้างาน - ภาพรวมของทีมงานทั้งหมด';
      desc.textContent = 'ติดตามสถานะงาน มอบหมายงาน และตรวจสอบความคืบหน้าของลูกทีมทุกคนแบบเรียลไทม์';
      lblBtnQuickAdd.textContent = '+ มอบหมายงานใหม่';
      if (filterAssignee) filterAssignee.style.display = 'inline-block';
    } else {
      const member = getMemberById(state.viewingBoard);
      badge.className = 'role-banner-badge';
      badge.style.background = member.avatarColor ? `${member.avatarColor}20` : '#e0e7ff';
      badge.style.color = member.avatarColor || '#4f46e5';
      badge.innerHTML = '👤';
      title.textContent = `หัวหน้างานกำลังดูบอร์ดของ: ${member.name} (${member.role || 'ทีมงาน'})`;
      desc.textContent = `คุณสามารถมอบหมายงานใหม่หรือแก้ไขงานให้ ${member.name} ได้`;
      lblBtnQuickAdd.textContent = `+ มอบหมายงานให้ ${member.name.split(' ')[0]}`;
      if (filterAssignee) filterAssignee.style.display = 'none';
    }
  } else {
    // Current user is a Team Member
    if (filterAssignee) filterAssignee.style.display = 'none';

    if (state.viewingBoard === state.loggedUser) {
      // Viewing own board
      if (readonlyBanner) readonlyBanner.style.display = 'none';
      if (btnQuickAddTask) btnQuickAddTask.style.display = 'inline-flex';

      const myMember = getMemberById(state.loggedUser);
      badge.className = 'role-banner-badge';
      badge.style.background = myMember.avatarColor ? `${myMember.avatarColor}20` : '#e0e7ff';
      badge.style.color = myMember.avatarColor || '#4f46e5';
      badge.innerHTML = '👤';
      title.textContent = `บอร์ดงานของฉัน: ${myMember.name} (${myMember.role || 'ทีมงาน'})`;
      desc.textContent = 'จัดการรายการงานของคุณ ลากวางเพื่อปรับสถานะ หรือแนบรูปภาพ/ไฟล์งานได้ทันที';
      lblBtnQuickAdd.textContent = '+ เพิ่มงานของฉัน';
    } else {
      // Viewing another team member's board (READ-ONLY)
      const targetMember = getMemberById(state.viewingBoard);
      const myMember = getMemberById(state.loggedUser);

      if (readonlyBanner) readonlyBanner.style.display = 'flex';
      if (readonlyText) {
        readonlyText.textContent = `คุณ (${myMember.name}) กำลังดูบอร์ดของ ${targetMember.name} สามารถดูรายละเอียดงานได้ แต่อ่านได้อย่างเดียว ไม่สามารถเพิ่มงานแทนได้`;
      }
      
      if (btnQuickAddTask) btnQuickAddTask.style.display = 'none';

      badge.className = 'role-banner-badge';
      badge.style.background = '#f1f5f9';
      badge.style.color = '#64748b';
      badge.innerHTML = '👁️';
      title.textContent = `ดูบอร์ดเพื่อนร่วมทีม: ${targetMember.name} (${targetMember.role || 'ทีมงาน'})`;
      desc.textContent = `โหมดอ่านอย่างเดียว - ดูเพื่อรับทราบความคืบหน้างานของเพื่อนร่วมทีม`;
    }
  }
}

// ==========================================================================
// KPIs Rendering
// ==========================================================================
function renderKPIs() {
  const scoped = getScopedTasks();

  const total = scoped.length;
  const todo = scoped.filter(t => t.status === 'todo').length;
  const progress = scoped.filter(t => t.status === 'in_progress').length;
  const blocked = scoped.filter(t => t.status === 'blocked').length;
  const review = scoped.filter(t => t.status === 'review').length;
  const done = scoped.filter(t => t.status === 'done').length;

  // Overdue count
  const overdue = scoped.filter(t => {
    return getDeadlineInfo(t.deadline, t.status).type === 'overdue';
  }).length;

  document.getElementById('kpiTotal').textContent = total;
  document.getElementById('kpiTodo').textContent = todo;
  document.getElementById('kpiProgress').textContent = progress;
  document.getElementById('kpiBlocked').textContent = blocked;
  document.getElementById('kpiReview').textContent = review;
  document.getElementById('kpiDone').textContent = done;
  document.getElementById('kpiOverdue').textContent = overdue;

  // Visual pulse on blocked or overdue cards if > 0
  const blockedCard = document.getElementById('kpiBlockedCard');
  if (blocked > 0) {
    blockedCard.classList.add('pulse-badge');
  } else {
    blockedCard.classList.remove('pulse-badge');
  }

  const overdueCard = document.getElementById('kpiOverdueCard');
  if (overdue > 0) {
    overdueCard.classList.add('pulse-badge');
  } else {
    overdueCard.classList.remove('pulse-badge');
  }
}

// ==========================================================================
// Team Workload Breakdown Section (Supervisor View)
// ==========================================================================
function renderWorkloadSection() {
  const grid = document.getElementById('workloadGrid');
  let html = '';

  state.members.forEach(member => {
    const memberTasks = state.tasks.filter(t => t.assigneeId === member.id);
    const total = memberTasks.length;
    const done = memberTasks.filter(t => t.status === 'done').length;
    const progress = memberTasks.filter(t => t.status === 'in_progress').length;
    const blocked = memberTasks.filter(t => t.status === 'blocked').length;
    const review = memberTasks.filter(t => t.status === 'review').length;
    const todo = memberTasks.filter(t => t.status === 'todo').length;
    const overdue = memberTasks.filter(t => getDeadlineInfo(t.deadline, t.status).type === 'overdue').length;

    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    html += `
      <div class="member-card" data-member-id="${member.id}" title="คลิกเพื่อสลับไปดูบอร์ดของ ${escapeHTML(member.name)}">
        <div class="member-card-header">
          <div class="member-card-user">
            <div class="member-avatar-lg" style="background: ${member.avatarColor || '#4f46e5'};">
              ${getInitials(member.name)}
            </div>
            <div class="member-card-details">
              <h4>${escapeHTML(member.name)}</h4>
              <span>${escapeHTML(member.role || 'ทีมงาน')}</span>
            </div>
          </div>
          <div class="member-task-count">
            ${done}/${total} เสร็จสิ้น
          </div>
        </div>

        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${percent}%;"></div>
        </div>

        <div class="member-status-pills">
          <span class="status-chip todo">รอดำเนินการ: ${todo}</span>
          <span class="status-chip progress">กำลังทำ: ${progress}</span>
          ${blocked > 0 ? `<span class="status-chip blocked">⚠️ ติดปัญหา: ${blocked}</span>` : ''}
          ${review > 0 ? `<span class="status-chip review">รอตรวจ: ${review}</span>` : ''}
          ${overdue > 0 ? `<span class="status-chip overdue">🚨 เกินกำหนด: ${overdue}</span>` : ''}
        </div>
      </div>
    `;
  });

  grid.innerHTML = html;

  // Add click to switch viewing board to that member
  grid.querySelectorAll('.member-card').forEach(card => {
    card.addEventListener('click', () => {
      const mId = card.getAttribute('data-member-id');
      saveViewingBoard(mId);
      renderApp();
      showToast(`เปิดดูบอร์ดของ ${getMemberById(mId).name}`, 'success');
    });
  });
}

// ==========================================================================
// Kanban Board Rendering (5 Columns)
// ==========================================================================
function renderKanbanBoard() {
  const filteredTasks = getFilteredTasks();

  const columns = {
    todo: { countEl: document.getElementById('countTodo'), listEl: document.getElementById('cardsTodo'), tasks: [] },
    in_progress: { countEl: document.getElementById('countProgress'), listEl: document.getElementById('cardsProgress'), tasks: [] },
    blocked: { countEl: document.getElementById('countBlocked'), listEl: document.getElementById('cardsBlocked'), tasks: [] },
    review: { countEl: document.getElementById('countReview'), listEl: document.getElementById('cardsReview'), tasks: [] },
    done: { countEl: document.getElementById('countDone'), listEl: document.getElementById('cardsDone'), tasks: [] }
  };

  // Group tasks into status columns
  filteredTasks.forEach(task => {
    const colKey = columns[task.status] ? task.status : 'todo';
    columns[colKey].tasks.push(task);
  });

  // Render cards in each column
  Object.keys(columns).forEach(status => {
    const col = columns[status];
    col.countEl.textContent = col.tasks.length;

    if (col.tasks.length === 0) {
      col.listEl.innerHTML = `
        <div class="empty-column-placeholder">
          <span>ยังไม่มีงานในช่องนี้</span>
        </div>
      `;
      return;
    }

    let html = '';
    col.tasks.forEach(task => {
      const member = getMemberById(task.assigneeId);
      const deadlineInfo = getDeadlineInfo(task.deadline, task.status);
      const canManage = state.loggedUser === 'supervisor' || task.assigneeId === state.loggedUser;

      // Attachment cover image & count badge
      let coverImgHtml = '';
      let attBadgeHtml = '';
      const attachments = getTaskAttachments(task);
      if (attachments.length > 0) {
        const img = attachments.find(a => {
          const type = (a.type || '').toLowerCase();
          const url = (a.url || a.data || '').toLowerCase();
          return type.startsWith('image/') || url.startsWith('data:image/') || url.match(/\.(jpeg|jpg|gif|png|webp)/i) || (a.name && a.name.match(/\.(jpeg|jpg|gif|png|webp)$/i));
        });
        if (img) {
          const src = img.url || img.data;
          coverImgHtml = `<div class="card-cover-image" style="background-image: url('${src}'); background-size: cover; background-position: center;" onclick="event.stopPropagation(); openLightbox('${src}')" title="คลิกดูภาพขยาย"></div>`;
        }
        attBadgeHtml = `<span class="card-attachment-badge" title="มีไฟล์แนบ ${attachments.length} รายการ">📎 ${attachments.length}</span>`;
      }

      html += `
        <div class="task-card ${canManage ? '' : 'readonly-card'}" draggable="${canManage ? 'true' : 'false'}" data-task-id="${task.id}" style="${canManage ? '' : 'cursor: default;'}">
          ${coverImgHtml}
          <div class="card-header-meta">
            ${getPriorityBadge(task.priority)}
            <div style="display: flex; align-items: center; gap: 0.35rem;">
              ${attBadgeHtml}
              <span style="font-size: 0.72rem; color: var(--text-light);">
                มอบหมาย: ${formatThaiDate(task.createdDate)}
              </span>
            </div>
          </div>

          <div class="card-title">${escapeHTML(task.title)}</div>

          ${task.description ? `<div class="card-description">${escapeHTML(task.description)}</div>` : ''}

          ${task.status === 'blocked' && task.blockedReason ? `
            <div class="blocked-reason-box">
              <span>⚠️ <strong>สาเหตุ:</strong> ${escapeHTML(task.blockedReason)}</span>
            </div>
          ` : ''}

          <div class="card-footer">
            <div class="card-dates">
              <span class="deadline-badge ${deadlineInfo.badgeClass}">
                ${deadlineInfo.type === 'overdue' ? '🚨' : deadlineInfo.type === 'due_soon' ? '⏰' : deadlineInfo.type === 'done' ? '✅' : '📅'}
                ${formatThaiDate(task.deadline)} (${deadlineInfo.label})
              </span>
            </div>

            <div class="card-assignee" title="ผู้รับผิดชอบ: ${escapeHTML(member.name)}">
              <div class="assignee-avatar-sm" style="background: ${member.avatarColor || '#4f46e5'};">
                ${getInitials(member.name)}
              </div>
              <span style="font-size: 0.74rem; font-weight: 500;">${escapeHTML(member.name.split(' ')[0])}</span>
            </div>
          </div>

          <div class="card-actions-row">
            <button class="btn-card-action btn-quick-view" data-id="${task.id}" title="เปิดดูรายละเอียด">
              👁️ ดูงาน
            </button>
            ${canManage ? `
              <button class="btn-card-action btn-quick-move" data-id="${task.id}" title="เปลี่ยนสถานะ">
                🔄 เลื่อนสถานะ
              </button>
            ` : ''}
          </div>
        </div>
      `;
    });

    col.listEl.innerHTML = html;
  });

  attachKanbanCardEvents();
}

// ==========================================================================
// Kanban Drag & Drop and Card Actions
// ==========================================================================
function attachKanbanCardEvents() {
  const cards = document.querySelectorAll('.task-card');
  const columns = document.querySelectorAll('.kanban-column');

  // Dragstart / Dragend (only allowed for permitted cards)
  cards.forEach(card => {
    card.addEventListener('dragstart', (e) => {
      const taskId = card.getAttribute('data-task-id');
      const task = state.tasks.find(t => t.id === taskId);
      const canManage = state.loggedUser === 'supervisor' || (task && task.assigneeId === state.loggedUser);
      if (!canManage) {
        e.preventDefault();
        return;
      }
      state.draggedTaskId = taskId;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', state.draggedTaskId);
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      state.draggedTaskId = null;
      columns.forEach(col => col.classList.remove('drag-over'));
    });
  });

  // Quick Action Buttons on Cards
  document.querySelectorAll('.btn-quick-view').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      openTaskDetailModal(id);
    });
  });

  document.querySelectorAll('.btn-quick-move').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      showQuickStatusPicker(id, btn);
    });
  });

  // Double click card to open details
  cards.forEach(card => {
    card.addEventListener('dblclick', () => {
      const id = card.getAttribute('data-task-id');
      openTaskDetailModal(id);
    });
  });
}

function attachKanbanColumnDropEvents() {
  const columns = document.querySelectorAll('.kanban-column');

  columns.forEach(column => {
    column.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      column.classList.add('drag-over');
    });

    column.addEventListener('dragleave', (e) => {
      if (!column.contains(e.relatedTarget)) {
        column.classList.remove('drag-over');
      }
    });

    column.addEventListener('drop', (e) => {
      e.preventDefault();
      column.classList.remove('drag-over');

      const taskId = e.dataTransfer.getData('text/plain') || state.draggedTaskId;
      const newStatus = column.getAttribute('data-status');

      if (taskId && newStatus) {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
          const canManage = state.loggedUser === 'supervisor' || task.assigneeId === state.loggedUser;
          if (!canManage) {
            showToast('คุณสามารถเลื่อนสถานะงานของตนเองเท่านั้น', 'warning');
            return;
          }
          handleTaskStatusChange(taskId, newStatus);
        }
      }
    });
  });
}

// Quick status selector popover or cycle
function showQuickStatusPicker(taskId, targetElement) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  const statuses = [
    { key: 'todo', label: '📝 รอดำเนินการ' },
    { key: 'in_progress', label: '⚙️ กำลังทำ' },
    { key: 'blocked', label: '⚠️ ติดปัญหา / ระงับ' },
    { key: 'review', label: '🔍 รอตรวจรับ' },
    { key: 'done', label: '✅ เสร็จสิ้น' }
  ];

  // Simple next-status prompt or alert
  const currentIdx = statuses.findIndex(s => s.key === task.status);
  const nextStatus = statuses[(currentIdx + 1) % statuses.length];

  handleTaskStatusChange(taskId, nextStatus.key);
}

function handleTaskStatusChange(taskId, newStatus) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  if (task.status === newStatus) return;

  // If moving to "blocked", ask for reason!
  if (newStatus === 'blocked') {
    state.pendingBlockedTask = { taskId, newStatus };
    openBlockedPromptModal(task.blockedReason || '');
    return;
  }

  // Update status directly
  task.status = newStatus;
  task.updatedAt = new Date().toISOString();
  saveTasks();
  renderApp();
  showToast(`อัปเดตสถานะเป็น "${getStatusTitle(newStatus)}" แล้ว`, 'success');
  autoSyncTask(task);
}

// ==========================================================================
// Table View Rendering
// ==========================================================================
function renderTableView() {
  const tbody = document.getElementById('tableBody');
  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 3rem 1rem; color: var(--text-light);">
          ไม่พบรายการงานที่ตรงกับเงื่อนไขการค้นหา
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  filteredTasks.forEach(task => {
    const member = getMemberById(task.assigneeId);
    const deadlineInfo = getDeadlineInfo(task.deadline, task.status);
    const canManage = state.loggedUser === 'supervisor' || task.assigneeId === state.loggedUser;

    let attBadge = '';
    const attachments = getTaskAttachments(task);
    if (attachments.length > 0) {
      attBadge = `<span class="card-attachment-badge" style="margin-left:0.35rem;" title="แนบ ${attachments.length} ไฟล์">📎 ${attachments.length}</span>`;
    }

    html += `
      <tr>
        <td>
          <div style="font-weight: 600; color: var(--text-main); margin-bottom: 0.2rem; display: flex; align-items: center;">
            <span>${escapeHTML(task.title)}</span>
            ${attBadge}
          </div>
          <div style="font-size: 0.76rem; color: var(--text-muted); max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${escapeHTML(task.description || '-')}
          </div>
          ${task.status === 'blocked' && task.blockedReason ? `
            <div style="font-size: 0.72rem; color: #dc2626; margin-top: 0.2rem;">
              ⚠️ ปัญหา: ${escapeHTML(task.blockedReason)}
            </div>
          ` : ''}
        </td>

        <td>
          <div style="display: flex; align-items: center; gap: 0.4rem;">
            <div class="assignee-avatar-sm" style="background: ${member.avatarColor || '#4f46e5'};">
              ${getInitials(member.name)}
            </div>
            <div>
              <div style="font-weight: 500;">${escapeHTML(member.name)}</div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">${escapeHTML(member.role || '')}</div>
            </div>
          </div>
        </td>

        <td>
          <select class="form-select table-status-select" data-id="${task.id}" ${canManage ? '' : 'disabled'} style="font-size: 0.8rem; padding: 0.25rem 0.5rem; ${canManage ? '' : 'background:#f1f5f9; cursor:not-allowed; opacity:0.8;'}">
            <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>📝 รอดำเนินการ</option>
            <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>⚙️ กำลังทำ</option>
            <option value="blocked" ${task.status === 'blocked' ? 'selected' : ''}>⚠️ ติดปัญหา</option>
            <option value="review" ${task.status === 'review' ? 'selected' : ''}>🔍 รอตรวจรับ</option>
            <option value="done" ${task.status === 'done' ? 'selected' : ''}>✅ เสร็จสิ้น</option>
          </select>
        </td>

        <td>
          ${getPriorityBadge(task.priority)}
        </td>

        <td style="font-size: 0.8rem; color: var(--text-muted);">
          ${formatThaiDate(task.createdDate)}
        </td>

        <td>
          <span class="deadline-badge ${deadlineInfo.badgeClass}">
            ${deadlineInfo.type === 'overdue' ? '🚨' : deadlineInfo.type === 'due_soon' ? '⏰' : deadlineInfo.type === 'done' ? '✅' : '📅'}
            ${formatThaiDate(task.deadline)}
          </span>
        </td>

        <td style="text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
            <button class="btn btn-secondary btn-sm btn-icon" onclick="openTaskDetailModal('${task.id}')" title="ดูรายละเอียด">
              👁️
            </button>
            ${canManage ? `
              <button class="btn btn-secondary btn-sm btn-icon" onclick="openTaskFormModal('${task.id}')" title="แก้ไข">
                ✏️
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  // Attach status change on table selects
  tbody.querySelectorAll('.table-status-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const taskId = select.getAttribute('data-id');
      const newStatus = select.value;
      handleTaskStatusChange(taskId, newStatus);
    });
  });
}

// ==========================================================================
// Modals: Task Create / Edit
// ==========================================================================
function openTaskFormModal(taskId = null) {
  const modal = document.getElementById('taskModal');
  const modalTitle = document.getElementById('taskModalTitle');
  const form = document.getElementById('taskForm');
  const assigneeSelect = document.getElementById('taskFormAssignee');
  const blockedGroup = document.getElementById('groupBlockedReason');
  const lockedNotice = document.getElementById('lockedAssigneeNotice');
  const lockedName = document.getElementById('lockedAssigneeName');

  // Populate Assignee Select
  let assigneeHtml = '';
  state.members.forEach(m => {
    assigneeHtml += `<option value="${m.id}">${escapeHTML(m.name)} (${escapeHTML(m.role || 'ทีมงาน')})</option>`;
  });
  assigneeSelect.innerHTML = assigneeHtml;

  // Toggle blocked reason field visibility on status change
  const statusSelect = document.getElementById('taskFormStatus');
  statusSelect.onchange = () => {
    blockedGroup.style.display = statusSelect.value === 'blocked' ? 'block' : 'none';
  };

  if (taskId) {
    // Edit existing task
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Check permission to edit:
    if (state.loggedUser !== 'supervisor' && task.assigneeId !== state.loggedUser) {
      showToast('คุณสามารถแก้ไขได้เฉพาะงานของตัวเองเท่านั้น', 'warning');
      return;
    }

    modalTitle.innerHTML = `<span>แก้ไขข้อมูลงาน</span>`;
    document.getElementById('taskFormId').value = task.id;
    document.getElementById('taskFormTitle').value = task.title;
    document.getElementById('taskFormDesc').value = task.description || '';
    document.getElementById('taskFormAssignee').value = task.assigneeId;
    document.getElementById('taskFormPriority').value = task.priority || 'normal';
    document.getElementById('taskFormCreatedDate').value = task.createdDate || getTodayString();
    document.getElementById('taskFormDeadline').value = task.deadline || getTodayString(3);
    document.getElementById('taskFormStatus').value = task.status;
    document.getElementById('taskFormBlockedReason').value = task.blockedReason || '';

    // If supervisor, can change assignee; if member, lock assignee to self
    if (state.loggedUser === 'supervisor') {
      assigneeSelect.disabled = false;
      if (lockedNotice) lockedNotice.style.display = 'none';
    } else {
      assigneeSelect.value = state.loggedUser;
      assigneeSelect.disabled = true;
      if (lockedNotice) {
        lockedNotice.style.display = 'block';
        if (lockedName) lockedName.textContent = getMemberById(state.loggedUser).name;
      }
    }

    // Load attachments
    currentFormAttachments = getTaskAttachments(task);
    renderFormAttachmentPreviews();

    blockedGroup.style.display = task.status === 'blocked' ? 'block' : 'none';
  } else {
    // Create new task
    modalTitle.innerHTML = `<span>สร้างงานใหม่</span>`;
    form.reset();
    document.getElementById('taskFormId').value = '';
    document.getElementById('taskFormCreatedDate').value = getTodayString();
    document.getElementById('taskFormDeadline').value = getTodayString(3);

    if (state.loggedUser !== 'supervisor') {
      // Locked to current member's own account!
      assigneeSelect.value = state.loggedUser;
      assigneeSelect.disabled = true;
      if (lockedNotice) {
        lockedNotice.style.display = 'block';
        if (lockedName) lockedName.textContent = getMemberById(state.loggedUser).name;
      }
    } else {
      // Supervisor can assign to anyone
      assigneeSelect.disabled = false;
      if (lockedNotice) lockedNotice.style.display = 'none';
      if (state.viewingBoard !== 'supervisor') {
        assigneeSelect.value = state.viewingBoard;
      }
    }

    currentFormAttachments = [];
    renderFormAttachmentPreviews();

    document.getElementById('taskFormStatus').value = 'todo';
    blockedGroup.style.display = 'none';
  }

  modal.classList.add('active');
}

function closeTaskFormModal() {
  document.getElementById('taskModal').classList.remove('active');
}

function handleSaveTaskForm(e) {
  e.preventDefault();

  const taskId = document.getElementById('taskFormId').value;
  const title = document.getElementById('taskFormTitle').value.trim();
  const description = document.getElementById('taskFormDesc').value.trim();
  let assigneeId = document.getElementById('taskFormAssignee').value;
  const priority = document.getElementById('taskFormPriority').value;
  const createdDate = document.getElementById('taskFormCreatedDate').value;
  const deadline = document.getElementById('taskFormDeadline').value;
  const status = document.getElementById('taskFormStatus').value;
  const blockedReason = document.getElementById('taskFormBlockedReason').value.trim();

  // If member, strictly enforce assigneeId to loggedUser!
  if (state.loggedUser !== 'supervisor') {
    assigneeId = state.loggedUser;
  }

  if (!title) {
    showToast('กรุณาระบุชื่องาน', 'warning');
    return;
  }

  if (status === 'blocked' && !blockedReason) {
    showToast('กรุณาระบุสาเหตุที่ติดปัญหา', 'warning');
    return;
  }

  if (taskId) {
    // Update
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      task.title = title;
      task.description = description;
      task.assigneeId = assigneeId;
      task.priority = priority;
      task.createdDate = createdDate;
      task.deadline = deadline;
      task.status = status;
      task.blockedReason = status === 'blocked' ? blockedReason : '';
      task.attachments = [...currentFormAttachments];
      task.updatedAt = new Date().toISOString();
      showToast('แก้ไขข้อมูลงานเรียบร้อยแล้ว', 'success');
      autoSyncTask(task);
    }
  } else {
    // Create new
    const newTask = {
      id: 'task_' + Date.now(),
      title,
      description,
      assigneeId,
      priority,
      createdDate,
      deadline,
      status,
      blockedReason: status === 'blocked' ? blockedReason : '',
      attachments: [...currentFormAttachments],
      updatedAt: new Date().toISOString()
    };
    state.tasks.unshift(newTask);
    showToast('สร้างงานใหม่เรียบร้อยแล้ว', 'success');
    autoSyncTask(newTask);
  }

  saveTasks();
  closeTaskFormModal();
  renderApp();
}

// ==========================================================================
// Modals: Task Detail View
// ==========================================================================
function openTaskDetailModal(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  const modal = document.getElementById('taskDetailModal');
  const member = getMemberById(task.assigneeId);
  const deadlineInfo = getDeadlineInfo(task.deadline, task.status);
  const canManage = state.loggedUser === 'supervisor' || task.assigneeId === state.loggedUser;

  document.getElementById('detailFullTitle').textContent = task.title;
  document.getElementById('detailDescription').textContent = task.description || '(ไม่มีรายละเอียดเพิ่มเติม)';

  // Blocked Alert
  const blockedAlert = document.getElementById('detailBlockedAlert');
  if (task.status === 'blocked' && task.blockedReason) {
    blockedAlert.style.display = 'flex';
    document.getElementById('detailBlockedReasonText').textContent = task.blockedReason;
  } else {
    blockedAlert.style.display = 'none';
  }

  // Meta Info
  document.getElementById('detailAssignee').innerHTML = `
    <div class="assignee-avatar-sm" style="background: ${member.avatarColor || '#4f46e5'};">
      ${getInitials(member.name)}
    </div>
    <span>${escapeHTML(member.name)} (${escapeHTML(member.role || 'ทีมงาน')})</span>
  `;

  document.getElementById('detailStatus').innerHTML = `
    <strong>${getStatusTitle(task.status)}</strong>
  `;

  document.getElementById('detailCreatedDate').textContent = formatThaiDate(task.createdDate);

  document.getElementById('detailDeadline').innerHTML = `
    <span class="deadline-badge ${deadlineInfo.badgeClass}">
      ${formatThaiDate(task.deadline)} (${deadlineInfo.label})
    </span>
  `;

  document.getElementById('detailPriority').innerHTML = getPriorityBadge(task.priority);

  // Attachments in Detail Modal
  const attGroup = document.getElementById('detailAttachmentsGroup');
  const attContainer = document.getElementById('detailAttachmentsContainer');
  const attachments = getTaskAttachments(task);

  if (attGroup && attContainer) {
    if (attachments.length > 0) {
      attGroup.style.display = 'block';
      const images = attachments.filter(a => {
        const type = (a.type || '').toLowerCase();
        const url = (a.url || a.data || '').toLowerCase();
        return type.startsWith('image/') || url.startsWith('data:image/') || url.match(/\.(jpeg|jpg|gif|png|webp)/i) || (a.name && a.name.match(/\.(jpeg|jpg|gif|png|webp)$/i));
      });
      const docs = attachments.filter(a => !images.includes(a));

      let html = '';
      if (images.length > 0) {
        html += '<div class="detail-image-gallery">';
        images.forEach(img => {
          const src = img.url || img.data;
          html += `<div style="display: flex; flex-direction: column; align-items: center; gap: 0.25rem;">
            <img src="${src}" class="detail-image-item" alt="${escapeHTML(img.name)}" onclick="openLightbox('${src}')" title="คลิกเพื่อดูรูปขนาดเต็ม (${escapeHTML(img.name)})">
            <span style="font-size: 0.7rem; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 110px;">${escapeHTML(img.name || 'รูปภาพ')}</span>
          </div>`;
        });
        html += '</div>';
      }

      if (docs.length > 0) {
        html += '<div class="detail-file-list" style="margin-top: 0.5rem;">';
        docs.forEach(doc => {
          const href = doc.url || doc.data;
          html += `
            <div class="detail-file-item">
              <span style="display:flex; align-items:center; gap:0.4rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                📄 <strong>${escapeHTML(doc.name)}</strong> (${formatFileSize(doc.size)})
              </span>
              <a href="${href}" download="${escapeHTML(doc.name)}" target="_blank" class="btn btn-secondary btn-sm" style="padding:0.2rem 0.5rem; font-size:0.75rem;">
                ⬇️ ดาวน์โหลด
              </a>
            </div>
          `;
        });
        html += '</div>';
      }
      attContainer.innerHTML = html;
    } else {
      attGroup.style.display = 'none';
      attContainer.innerHTML = '';
    }
  }

  // Edit & Delete & Quick Status button visibility based on permission
  const btnDelete = document.getElementById('btnDeleteTask');
  const btnEdit = document.getElementById('btnEditTaskFromDetail');
  const btnChange = document.getElementById('btnChangeStatusQuick');

  if (btnDelete) btnDelete.style.display = canManage ? 'inline-flex' : 'none';
  if (btnEdit) btnEdit.style.display = canManage ? 'inline-flex' : 'none';
  if (btnChange) btnChange.style.display = canManage ? 'inline-flex' : 'none';

  btnEdit.onclick = () => {
    closeTaskDetailModal();
    openTaskFormModal(task.id);
  };

  btnChange.onclick = (e) => {
    showQuickStatusPicker(task.id, e.target);
    closeTaskDetailModal();
  };

  btnDelete.onclick = () => {
    if (confirm(`คุณต้องการลบงาน "${task.title}" ใช่หรือไม่?`)) {
      const deletedId = task.id;
      state.tasks = state.tasks.filter(t => t.id !== deletedId);
      saveTasks();
      closeTaskDetailModal();
      renderApp();
      showToast('ลบรายการงานเรียบร้อยแล้ว', 'success');
      autoSyncDeleteTask(deletedId);
    }
  };

  modal.classList.add('active');
}

function closeTaskDetailModal() {
  document.getElementById('taskDetailModal').classList.remove('active');
}

// ==========================================================================
// Modals: Blocked Reason Prompt
// ==========================================================================
function openBlockedPromptModal(existingReason = '') {
  const modal = document.getElementById('blockedReasonModal');
  const input = document.getElementById('promptBlockedReasonInput');
  input.value = existingReason;
  modal.classList.add('active');
  setTimeout(() => input.focus(), 50);
}

function closeBlockedPromptModal() {
  document.getElementById('blockedReasonModal').classList.remove('active');
  state.pendingBlockedTask = null;
}

function confirmBlockedPrompt() {
  if (!state.pendingBlockedTask) return;

  const reason = document.getElementById('promptBlockedReasonInput').value.trim();
  if (!reason) {
    showToast('กรุณาระบุสาเหตุที่ติดปัญหา', 'warning');
    return;
  }

  const { taskId, newStatus } = state.pendingBlockedTask;
  const task = state.tasks.find(t => t.id === taskId);
  if (task) {
    task.status = newStatus;
    task.blockedReason = reason;
    task.updatedAt = new Date().toISOString();
    saveTasks();
    renderApp();
    showToast('บันทึกสถานะติดปัญหาเรียบร้อยแล้ว', 'success');
    autoSyncTask(task);
  }

  closeBlockedPromptModal();
}

// ==========================================================================
// Modals: Team Management
// ==========================================================================
function openTeamModal() {
  renderTeamMemberList();
  document.getElementById('teamModal').classList.add('active');
}

function closeTeamModal() {
  document.getElementById('teamModal').classList.remove('active');
}

function renderTeamMemberList() {
  const list = document.getElementById('teamMemberList');
  let html = '';

  state.members.forEach(member => {
    const taskCount = state.tasks.filter(t => t.assigneeId === member.id).length;
    html += `
      <div class="member-manage-item">
        <div style="display:flex; align-items:center; gap:0.6rem;">
          <div class="assignee-avatar-sm" style="background:${member.avatarColor || '#4f46e5'};">
            ${getInitials(member.name)}
          </div>
          <div>
            <div style="font-weight:600; font-size:0.88rem;">${escapeHTML(member.name)}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHTML(member.role || 'ทีมงาน')} • งานทั้งหมด: ${taskCount}</div>
          </div>
        </div>
        <div>
          ${state.members.length > 1 ? `
            <button class="btn btn-secondary btn-sm" style="color:#dc2626; padding:0.2rem 0.5rem;" onclick="deleteMember('${member.id}')">
              ลบ
            </button>
          ` : '<span style="font-size:0.7rem; color:var(--text-light);">อย่างน้อย 1 คน</span>'}
        </div>
      </div>
    `;
  });

  list.innerHTML = html;
}

function handleAddMember(e) {
  e.preventDefault();
  const name = document.getElementById('newMemberName').value.trim();
  const role = document.getElementById('newMemberRole').value.trim();

  if (!name || !role) {
    showToast('กรุณากรอกชื่อและตำแหน่งให้ครบถ้วน', 'warning');
    return;
  }

  const colors = ['#2563eb', '#7c3aed', '#059669', '#ea580c', '#d97706', '#0891b2', '#e11d48'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const newMember = {
    id: 'mem_' + Date.now(),
    name,
    role,
    avatarColor: randomColor
  };

  state.members.push(newMember);
  saveMembers();
  renderTeamMemberList();
  renderApp();
  document.getElementById('addMemberForm').reset();
  showToast(`เพิ่มสมาชิก "${name}" สำเร็จ`, 'success');
  autoSyncMember(newMember);
}

function deleteMember(memberId) {
  const member = getMemberById(memberId);
  const taskCount = state.tasks.filter(t => t.assigneeId === memberId).length;

  if (taskCount > 0) {
    if (!confirm(`คุณ ${member.name} ยังมีงานค้างอยู่ ${taskCount} งาน คุณแน่ใจหรือไม่ที่จะลบ? งานจะถูกโอนไปให้สมาชิกคนแรกแทน`)) {
      return;
    }
    // Reassign tasks to first remaining member
    const targetMember = state.members.find(m => m.id !== memberId);
    if (targetMember) {
      state.tasks.forEach(t => {
        if (t.assigneeId === memberId) {
          t.assigneeId = targetMember.id;
          autoSyncTask(t);
        }
      });
      saveTasks();
    }
  } else {
    if (!confirm(`คุณต้องการลบคุณ "${member.name}" ออกจากทีมใช่หรือไม่?`)) {
      return;
    }
  }

  state.members = state.members.filter(m => m.id !== memberId);
  if (state.currentRole === memberId) {
    saveRole('supervisor');
  }

  saveMembers();
  renderTeamMemberList();
  renderApp();
  showToast(`ลบคุณ ${member.name} แล้ว`, 'success');
  autoSyncDeleteMember(memberId);
}

// ==========================================================================
// Modals: Export & Backup (CSV & JSON)
// ==========================================================================
function openExportModal() {
  document.getElementById('exportImportModal').classList.add('active');
}

function closeExportModal() {
  document.getElementById('exportImportModal').classList.remove('active');
}

function exportToCSV() {
  const rows = [
    ['รหัสงาน', 'ชื่องาน', 'รายละเอียด', 'ผู้รับผิดชอบ', 'ตำแหน่ง', 'ระดับความสำคัญ', 'วันที่มอบหมาย', 'กำหนดส่ง (Deadline)', 'สถานะ', 'สาเหตุที่ติดปัญหา (ถ้ามี)']
  ];

  state.tasks.forEach(task => {
    const member = getMemberById(task.assigneeId);
    rows.push([
      task.id,
      task.title,
      task.description || '',
      member.name,
      member.role || '',
      task.priority || 'normal',
      task.createdDate || '',
      task.deadline || '',
      getStatusTitle(task.status),
      task.blockedReason || ''
    ]);
  });

  // Convert array to CSV string
  const csvContent = rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\r\n');

  // Add UTF-8 BOM so Thai characters open cleanly in Microsoft Excel!
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `รายงานรายการงาน_${getTodayString()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('ส่งออกไฟล์ Excel (CSV) สำเร็จแล้ว', 'success');
}

function exportToJSON() {
  const data = {
    appName: 'TeamTask Hub',
    exportedAt: new Date().toISOString(),
    members: state.members,
    tasks: state.tasks
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_team_tasks_${getTodayString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('ส่งออกไฟล์สำรอง (JSON) สำเร็จแล้ว', 'success');
}

function handleImportJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (Array.isArray(data.members) && Array.isArray(data.tasks)) {
        state.members = data.members;
        state.tasks = data.tasks;
        saveMembers();
        saveTasks();
        renderApp();
        showToast('นำเข้าข้อมูลสำรองสำเร็จแล้ว!', 'success');
        closeExportModal();
      } else {
        showToast('รูปแบบไฟล์สำรองไม่ถูกต้อง', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการอ่านไฟล์', 'error');
    }
  };
  reader.readAsText(file);
}

function resetToDemo() {
  if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นชุดตัวอย่างเริ่มต้นใช่หรือไม่? (ข้อมูลที่บันทึกไว้จะถูกเขียนทับ)')) {
    state.members = [...DEFAULT_MEMBERS];
    state.tasks = [...DEFAULT_TASKS];
    saveMembers();
    saveTasks();
    saveRole('supervisor');
    renderApp();
    closeExportModal();
    showToast('รีเซ็ตข้อมูลเป็นชุดตัวอย่างเรียบร้อยแล้ว', 'success');
  }
}

// ==========================================================================
// Filter Options Helper
// ==========================================================================
function renderAssigneeFilterOptions() {
  const select = document.getElementById('filterAssignee');
  const currentVal = state.filters.assignee;

  let html = `<option value="all">ทีมงานทั้งหมด (ทุกคน)</option>`;
  state.members.forEach(m => {
    html += `<option value="${m.id}" ${currentVal === m.id ? 'selected' : ''}>👤 ${escapeHTML(m.name)}</option>`;
  });

  select.innerHTML = html;
}

// ==========================================================================
// Toast Notification System
// ==========================================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span> <span>${escapeHTML(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}

// Utility HTML escape
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ==========================================================================
// Google Sheets Cloud Sync Implementation
// ==========================================================================
let isFetchingFromSheets = false;

function initCloudSync() {
  updateCloudStatusUI();
  if (state.sheetsUrl) {
    // Initial fetch from sheets
    fetchFromSheets(true);
  }

  // Periodic polling every 3.5 seconds for instant real-time synchronization
  setInterval(() => {
    if (state.sheetsUrl && state.autoSync) {
      fetchFromSheets(true);
    }
  }, 3500);

  // Auto-sync when switching back to tab
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && state.sheetsUrl && state.autoSync) {
      fetchFromSheets(true);
    }
  });

  window.addEventListener('focus', () => {
    if (state.sheetsUrl && state.autoSync) {
      fetchFromSheets(true);
    }
  });
}

function updateCloudStatusUI() {
  const pill = document.getElementById('cloudStatusPill');
  const text = document.getElementById('cloudStatusText');
  const label = document.getElementById('sheetsStatusLabel');
  const badge = document.getElementById('sheetsStatusBadge');
  const details = document.getElementById('sheetsStatusDetails');
  const input = document.getElementById('sheetsUrlInput');
  const chkAutoSync = document.getElementById('chkAutoSync');

  if (input && document.activeElement !== input) {
    input.value = state.sheetsUrl || '';
  }
  if (chkAutoSync) {
    chkAutoSync.checked = state.autoSync;
  }

  if (pill) {
    pill.className = `cloud-status-pill ${state.syncStatus}`;
  }

  if (state.syncStatus === 'connected') {
    if (text) text.innerHTML = `🟢 Google Sheets`;
    if (label) {
      label.style.color = '#059669';
      label.textContent = '🟢 เชื่อมต่อกับ Google Sheets เรียบร้อยแล้ว';
    }
    if (badge) badge.style.background = '#10b981';
    if (details) {
      const timeStr = state.lastSyncTime ? new Date(state.lastSyncTime).toLocaleTimeString('th-TH') : 'ล่าสุด';
      details.textContent = `ข้อมูลซิงค์กับ Google Sheets อัตโนมัติ (อัปเดตล่าสุด: ${timeStr})`;
    }
  } else if (state.syncStatus === 'syncing') {
    if (text) text.innerHTML = `🔄 กำลังซิงค์...`;
    if (label) {
      label.style.color = '#2563eb';
      label.textContent = '🔄 กำลังซิงค์ข้อมูลกับ Google Sheets...';
    }
    if (badge) badge.style.background = '#3b82f6';
  } else if (state.syncStatus === 'error') {
    if (text) text.innerHTML = `⚠️ เชื่อมต่อไม่สำเร็จ`;
    if (label) {
      label.style.color = '#dc2626';
      label.textContent = '⚠️ ไม่สามารถเชื่อมต่อกับ Google Sheets ได้';
    }
    if (badge) badge.style.background = '#ef4444';
  } else {
    if (text) text.innerHTML = `☁️ Google Sheets`;
    if (label) {
      label.style.color = '#475569';
      label.textContent = '☁️ ยังไม่ได้เชื่อมต่อ (ทำงานแบบบันทึกเฉพาะในเครื่องนี้)';
    }
    if (badge) badge.style.background = '#94a3b8';
    if (details) {
      details.textContent = 'เมื่อเชื่อมต่อแล้ว ข้อมูลงานจะถูกเก็บลง Google Sheets บน Google Drive และแชร์ให้ทุกคนในทีมใช้งานร่วมกันได้ทันที';
    }
  }
}

async function callSheetsAPI(payload) {
  if (!state.sheetsUrl) return null;

  try {
    // If running embedded inside Google Apps Script:
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      return new Promise((resolve, reject) => {
        if (payload.action === 'getAll') {
          google.script.run
            .withSuccessHandler(resolve)
            .withFailureHandler(reject)
            .getAllData();
        } else if (payload.action === 'saveTask') {
          google.script.run
            .withSuccessHandler(resolve)
            .withFailureHandler(reject)
            .saveTaskToSheet(payload.task);
        } else if (payload.action === 'deleteTask') {
          google.script.run
            .withSuccessHandler(resolve)
            .withFailureHandler(reject)
            .deleteRowById('Tasks', payload.id);
        } else if (payload.action === 'saveMember') {
          google.script.run
            .withSuccessHandler(resolve)
            .withFailureHandler(reject)
            .saveMemberToSheet(payload.member);
        } else if (payload.action === 'deleteMember') {
          google.script.run
            .withSuccessHandler(resolve)
            .withFailureHandler(reject)
            .deleteRowById('Members', payload.id);
        } else if (payload.action === 'syncAll') {
          google.script.run
            .withSuccessHandler(resolve)
            .withFailureHandler(reject)
            .syncAllToSheets(payload);
        } else {
          resolve({ ok: true });
        }
      });
    }

    // Standard HTTP fetch to Google Apps Script Web App
    const response = await fetch(state.sheetsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Call Sheets API Error:', err);
    throw err;
  }
}

async function fetchFromSheets(silent = false) {
  if (!state.sheetsUrl || isFetchingFromSheets) return;

  isFetchingFromSheets = true;
  const syncIcon = document.getElementById('syncIcon');
  if (syncIcon && !silent) syncIcon.classList.add('spinning');

  if (!silent) {
    state.syncStatus = 'syncing';
    updateCloudStatusUI();
  }

  try {
    let result = null;
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      result = await new Promise((res, rej) => {
        google.script.run.withSuccessHandler(res).withFailureHandler(rej).getAllData();
      });
    } else {
      // Add timestamp and cache-control headers to completely bypass browser & proxy caching
      const fetchUrl = state.sheetsUrl + (state.sheetsUrl.includes('?') ? '&' : '?') + 'action=getAll&_t=' + Date.now();
      const res = await fetch(fetchUrl, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      result = await res.json();
    }

    if (result && result.ok) {
      let hasChanges = false;

      if (Array.isArray(result.members) && result.members.length > 0) {
        if (JSON.stringify(state.members) !== JSON.stringify(result.members)) {
          state.members = result.members;
          saveMembers();
          hasChanges = true;
        }
      }

      if (Array.isArray(result.tasks)) {
        // Smart merge: if local task has attachments, but cloud task returned empty attachments, don't wipe local attachments!
        const mergedTasks = result.tasks.map(cloudTask => {
          const localTask = state.tasks.find(t => t.id === cloudTask.id);
          const cloudAtts = getTaskAttachments(cloudTask);
          const localAtts = getTaskAttachments(localTask);

          if (cloudAtts.length === 0 && localAtts.length > 0) {
            cloudTask.attachments = localAtts;
          } else {
            cloudTask.attachments = cloudAtts;
          }
          return cloudTask;
        });

        // Also keep any local task that hasn't synced to cloud yet
        state.tasks.forEach(localTask => {
          if (!mergedTasks.find(ct => ct.id === localTask.id)) {
            mergedTasks.unshift(localTask);
          }
        });

        if (JSON.stringify(state.tasks) !== JSON.stringify(mergedTasks)) {
          state.tasks = mergedTasks;
          saveTasks();
          hasChanges = true;
        }
      }

      state.syncStatus = 'connected';
      state.lastSyncTime = new Date().toISOString();
      updateCloudStatusUI();

      if (hasChanges) {
        renderApp();
        if (silent) {
          showToast('🔄 อัปเดตข้อมูลล่าสุดจากทีมงานเรียบร้อยแล้ว', 'info');
        }
      }

      if (!silent) {
        showToast('ดึงข้อมูลล่าสุดจาก Google Sheets สำเร็จ!', 'success');
      }
    } else {
      throw new Error(result?.error || 'ข้อมูลไม่สมบูรณ์');
    }
  } catch (err) {
    console.warn('Fetch from sheets error:', err);
    state.syncStatus = 'error';
    updateCloudStatusUI();
    if (!silent) {
      showToast('ไม่สามารถเชื่อมต่อ Google Sheets ได้ ตรวจสอบ URL อีกครั้ง', 'error');
    }
  } finally {
    isFetchingFromSheets = false;
    if (syncIcon) syncIcon.classList.remove('spinning');
  }
}

async function pushToSheets() {
  if (!state.sheetsUrl) {
    showToast('กรุณาระบุ Web App URL ของ Google Sheets ก่อน', 'warning');
    return;
  }

  const syncIcon = document.getElementById('syncIcon');
  if (syncIcon) syncIcon.classList.add('spinning');
  state.syncStatus = 'syncing';
  updateCloudStatusUI();

  try {
    const payload = {
      action: 'syncAll',
      tasks: state.tasks,
      members: state.members
    };

    const res = await callSheetsAPI(payload);
    if (res && res.ok) {
      state.syncStatus = 'connected';
      state.lastSyncTime = new Date().toISOString();
      updateCloudStatusUI();
      showToast('อัปโหลดข้อมูลทั้งหมดขึ้น Google Sheets สำเร็จแล้ว!', 'success');
    } else {
      throw new Error(res?.error || 'เกิดข้อผิดพลาดในการบันทึก');
    }
  } catch (err) {
    console.error(err);
    state.syncStatus = 'error';
    updateCloudStatusUI();
    showToast('บันทึกขึ้น Google Sheets ล้มเหลว ตรวจสอบสิทธิ์การเข้าถึง', 'error');
  } finally {
    if (syncIcon) syncIcon.classList.remove('spinning');
  }
}

function autoSyncTask(task) {
  if (!state.sheetsUrl) {
    showToast(`⚠️ บันทึกงานในเครื่องแล้ว แต่ยังไม่ได้เชื่อมต่อ Google Sheets`, 'warning');
    return;
  }
  if (!state.autoSync) return;

  const syncIcon = document.getElementById('syncIcon');
  if (syncIcon) syncIcon.classList.add('spinning');

  callSheetsAPI({ action: 'saveTask', task }).then(() => {
    state.syncStatus = 'connected';
    state.lastSyncTime = new Date().toISOString();
    updateCloudStatusUI();
    // Promptly verify sync with cloud
    setTimeout(() => fetchFromSheets(true), 1200);
  }).catch(err => {
    console.warn('AutoSync task failed:', err);
    state.syncStatus = 'error';
    updateCloudStatusUI();
  }).finally(() => {
    if (syncIcon) syncIcon.classList.remove('spinning');
  });
}

function autoSyncDeleteTask(taskId) {
  if (!state.sheetsUrl || !state.autoSync) return;
  callSheetsAPI({ action: 'deleteTask', id: taskId }).then(() => {
    setTimeout(() => fetchFromSheets(true), 1200);
  }).catch(err => {
    console.warn('AutoSync delete task failed:', err);
  });
}

function autoSyncMember(member) {
  if (!state.sheetsUrl) {
    showToast(`⚠️ เพิ่ม "${member.name}" ในเครื่องแล้ว แต่ยังไม่ได้เชื่อมต่อ Google Sheets (กดปุ่ม ☁️ เพื่อเชื่อมต่อ)`, 'warning');
    return;
  }
  if (!state.autoSync) return;

  const syncIcon = document.getElementById('syncIcon');
  if (syncIcon) syncIcon.classList.add('spinning');
  state.syncStatus = 'syncing';
  updateCloudStatusUI();

  callSheetsAPI({ action: 'saveMember', member }).then((res) => {
    state.syncStatus = 'connected';
    state.lastSyncTime = new Date().toISOString();
    updateCloudStatusUI();
    showToast(`🟢 ซิงค์สมาชิก "${member.name}" ขึ้น Google Sheets เรียบร้อยแล้ว`, 'success');
  }).catch(err => {
    console.error('AutoSync member failed:', err);
    state.syncStatus = 'error';
    updateCloudStatusUI();
    showToast('⚠️ ไม่สามารถซิงค์สมาชิกขึ้น Google Sheets ได้ ตรวจสอบการเชื่อมต่อ', 'error');
  }).finally(() => {
    if (syncIcon) syncIcon.classList.remove('spinning');
  });
}

function autoSyncDeleteMember(memberId) {
  if (!state.sheetsUrl || !state.autoSync) return;
  callSheetsAPI({ action: 'deleteMember', id: memberId }).then(() => {
    state.syncStatus = 'connected';
    state.lastSyncTime = new Date().toISOString();
    updateCloudStatusUI();
    showToast('ลบสมาชิกออกจาก Google Sheets เรียบร้อยแล้ว', 'info');
  }).catch(err => {
    console.error('AutoSync delete member failed:', err);
  });
}

async function testAndSaveSheetsUrl() {
  const input = document.getElementById('sheetsUrlInput');
  const url = input.value.trim();

  if (!url) {
    state.sheetsUrl = '';
    state.syncStatus = 'offline';
    localStorage.removeItem(STORAGE_KEY_SHEETS_URL);
    updateCloudStatusUI();
    showToast('ปิดการเชื่อมต่อ Google Sheets แล้ว (กลับสู่โหมดบันทึกในเครื่อง)', 'info');
    return;
  }

  if (!url.startsWith('https://script.google.com/macros/s/')) {
    showToast('URL ไม่ถูกต้อง ต้องขึ้นต้นด้วย https://script.google.com/macros/s/...', 'warning');
    return;
  }

  showToast('กำลังทดสอบการเชื่อมต่อไปยัง Google Sheets...', 'info');

  try {
    const testUrl = url + (url.includes('?') ? '&' : '?') + 'action=ping';
    const res = await fetch(testUrl);
    const data = await res.json();

    if (data && data.ok) {
      state.sheetsUrl = url;
      state.syncStatus = 'connected';
      state.lastSyncTime = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY_SHEETS_URL, url);
      updateCloudStatusUI();
      showToast(`เชื่อมต่อสำเร็จกับ: "${data.spreadsheet || 'Google Sheets'}"`, 'success');
      fetchFromSheets(true);
    } else {
      throw new Error('ไม่ได้รับการตอบกลับที่ถูกต้อง');
    }
  } catch (err) {
    console.error('Test connection error:', err);
    if (confirm('ไม่สามารถทดสอบ ping อัตโนมัติได้ (อาจเกิดจากข้อจำกัด CORS ของเบราว์เซอร์) ต้องการบันทึก URL นี้ไว้หรือไม่?')) {
      state.sheetsUrl = url;
      state.syncStatus = 'connected';
      localStorage.setItem(STORAGE_KEY_SHEETS_URL, url);
      updateCloudStatusUI();
      showToast('บันทึก URL เรียบร้อยแล้ว', 'success');
    }
  }
}

// ==========================================================================
// Event Listeners Binding
// ==========================================================================
function bindEvents() {
  // Brand Click -> Return to Supervisor Master View or Own Board
  document.getElementById('btnGoHome').addEventListener('click', () => {
    if (state.loggedUser === 'supervisor') {
      saveViewingBoard('supervisor');
    } else {
      saveViewingBoard(state.loggedUser);
    }
    renderApp();
  });

  // Profile Switcher Menu Toggle
  const profilePill = document.getElementById('profilePill');
  const profileMenu = document.getElementById('profileMenu');

  profilePill.addEventListener('click', (e) => {
    e.stopPropagation();
    profileMenu.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    profileMenu.classList.remove('show');
  });

  // Profile Menu Selection
  profileMenu.addEventListener('click', (e) => {
    const item = e.target.closest('.menu-item');
    if (!item) return;

    const userId = item.getAttribute('data-user-id') || item.getAttribute('data-role');
    if (userId) {
      saveUserIdentity(userId);
      renderApp();
      profileMenu.classList.remove('show');
      const name = userId === 'supervisor' ? 'หัวหน้างาน (Supervisor)' : getMemberById(userId).name;
      showToast(`เข้าสู่ระบบเป็น: ${name}`, 'success');
    }
  });

  // Return to my board button
  const btnReturn = document.getElementById('btnReturnToMyBoard');
  if (btnReturn) {
    btnReturn.addEventListener('click', () => {
      saveViewingBoard(state.loggedUser);
      renderApp();
      showToast('กลับสู่บอร์ดงานของคุณแล้ว', 'info');
    });
  }

  // Lightbox Close Events
  const btnCloseLightbox = document.getElementById('btnCloseLightbox');
  const lightboxModal = document.getElementById('imageLightboxModal');
  if (btnCloseLightbox) {
    btnCloseLightbox.addEventListener('click', closeLightbox);
  }
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  // File Upload Dropzone Events
  const fileDropzone = document.getElementById('fileUploadDropzone');
  const fileInput = document.getElementById('taskFileInput');
  if (fileDropzone && fileInput) {
    fileDropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      handleFilesSelected(e.target.files);
      fileInput.value = '';
    });
    fileDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileDropzone.classList.add('drag-over');
    });
    fileDropzone.addEventListener('dragleave', () => {
      fileDropzone.classList.remove('drag-over');
    });
    fileDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      fileDropzone.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFilesSelected(e.dataTransfer.files);
      }
    });
  }

  // Search Input with Debounce
  let searchTimeout = null;
  document.getElementById('searchInput').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.filters.search = e.target.value.trim();
      updateFilterResetBtn();
      renderApp();
    }, 200);
  });

  // Filter Selects
  document.getElementById('filterAssignee').addEventListener('change', (e) => {
    state.filters.assignee = e.target.value;
    updateFilterResetBtn();
    renderApp();
  });

  document.getElementById('filterPriority').addEventListener('change', (e) => {
    state.filters.priority = e.target.value;
    updateFilterResetBtn();
    renderApp();
  });

  document.getElementById('filterDeadline').addEventListener('change', (e) => {
    state.filters.deadline = e.target.value;
    updateFilterResetBtn();
    renderApp();
  });

  document.getElementById('btnResetFilters').addEventListener('click', () => {
    state.filters.search = '';
    state.filters.assignee = 'all';
    state.filters.priority = 'all';
    state.filters.deadline = 'all';

    document.getElementById('searchInput').value = '';
    document.getElementById('filterAssignee').value = 'all';
    document.getElementById('filterPriority').value = 'all';
    document.getElementById('filterDeadline').value = 'all';

    updateFilterResetBtn();
    renderApp();
  });

  function updateFilterResetBtn() {
    const hasFilter = state.filters.search || state.filters.assignee !== 'all' || state.filters.priority !== 'all' || state.filters.deadline !== 'all';
    document.getElementById('btnResetFilters').style.display = hasFilter ? 'inline-block' : 'none';
  }

  // View Switcher Tabs (Kanban vs Table)
  document.getElementById('tabKanban').addEventListener('click', () => {
    state.activeView = 'kanban';
    document.getElementById('tabKanban').classList.add('active');
    document.getElementById('tabTable').classList.remove('active');
    renderApp();
  });

  document.getElementById('tabTable').addEventListener('click', () => {
    state.activeView = 'table';
    document.getElementById('tabTable').classList.add('active');
    document.getElementById('tabKanban').classList.remove('active');
    renderApp();
  });

  // Task Creation Buttons
  document.getElementById('btnNewTask').addEventListener('click', () => openTaskFormModal());
  document.getElementById('btnQuickAddTask').addEventListener('click', () => openTaskFormModal());

  // Task Form Modal Events
  document.getElementById('btnCloseTaskModal').addEventListener('click', closeTaskFormModal);
  document.getElementById('btnCancelTaskForm').addEventListener('click', closeTaskFormModal);
  document.getElementById('taskForm').addEventListener('submit', handleSaveTaskForm);

  // Task Detail Modal Events
  document.getElementById('btnCloseDetailModal').addEventListener('click', closeTaskDetailModal);

  // Blocked Prompt Modal Events
  document.getElementById('btnCloseBlockedPrompt').addEventListener('click', closeBlockedPromptModal);
  document.getElementById('btnCancelBlockedPrompt').addEventListener('click', closeBlockedPromptModal);
  document.getElementById('btnConfirmBlockedPrompt').addEventListener('click', confirmBlockedPrompt);

  // Team Modal Events
  document.getElementById('btnManageTeam').addEventListener('click', openTeamModal);
  document.getElementById('btnCloseTeamModal').addEventListener('click', closeTeamModal);
  document.getElementById('btnCloseTeamModalBtn').addEventListener('click', closeTeamModal);
  document.getElementById('addMemberForm').addEventListener('submit', handleAddMember);

  // Export / Backup Modal Events
  document.getElementById('btnExportImport').addEventListener('click', openExportModal);
  document.getElementById('btnCloseExportModal').addEventListener('click', closeExportModal);
  document.getElementById('btnCloseExportModalBtn').addEventListener('click', closeExportModal);
  document.getElementById('btnExportCSV').addEventListener('click', exportToCSV);
  document.getElementById('btnExportJSON').addEventListener('click', exportToJSON);
  document.getElementById('importFileInput').addEventListener('change', handleImportJSON);
  document.getElementById('btnResetDemo').addEventListener('click', resetToDemo);

  // Google Sheets Cloud Integration Events
  const cloudPill = document.getElementById('cloudStatusPill');
  const sheetsModal = document.getElementById('sheetsModal');
  if (cloudPill && sheetsModal) {
    cloudPill.addEventListener('click', () => {
      document.getElementById('sheetsUrlInput').value = state.sheetsUrl || '';
      updateCloudStatusUI();
      sheetsModal.classList.add('active');
    });
    document.getElementById('btnCloseSheetsModal').addEventListener('click', () => sheetsModal.classList.remove('active'));
    document.getElementById('btnCloseSheetsModalBtn').addEventListener('click', () => sheetsModal.classList.remove('active'));
  }

  const btnQuickSync = document.getElementById('btnQuickSync');
  if (btnQuickSync) {
    btnQuickSync.addEventListener('click', () => {
      if (!state.sheetsUrl) {
        sheetsModal.classList.add('active');
        showToast('กรุณาตั้งค่าเชื่อมต่อ Google Sheets ก่อนใช้งานการซิงค์', 'info');
      } else {
        fetchFromSheets(false);
      }
    });
  }

  const btnTestAndSave = document.getElementById('btnTestAndSaveSheets');
  if (btnTestAndSave) {
    btnTestAndSave.addEventListener('click', testAndSaveSheetsUrl);
  }

  const btnPull = document.getElementById('btnPullFromSheets');
  if (btnPull) {
    btnPull.addEventListener('click', () => fetchFromSheets(false));
  }

  const btnPush = document.getElementById('btnPushToSheets');
  if (btnPush) {
    btnPush.addEventListener('click', pushToSheets);
  }

  const chkAutoSync = document.getElementById('chkAutoSync');
  if (chkAutoSync) {
    chkAutoSync.addEventListener('change', (e) => {
      state.autoSync = e.target.checked;
      localStorage.setItem(STORAGE_KEY_AUTO_SYNC, state.autoSync);
      showToast(state.autoSync ? 'เปิดระบบซิงค์อัตโนมัติแล้ว' : 'ปิดระบบซิงค์อัตโนมัติแล้ว', 'info');
    });
  }

  // Close modals on clicking overlay background
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // Attach drag & drop events to columns
  attachKanbanColumnDropEvents();
}

// Expose helper functions globally for inline HTML event handlers
window.openTaskDetailModal = openTaskDetailModal;
window.openTaskFormModal = openTaskFormModal;
window.deleteMember = deleteMember;
window.removeFormAttachment = removeFormAttachment;
window.openLightbox = openLightbox;

// Start app on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initApp);
