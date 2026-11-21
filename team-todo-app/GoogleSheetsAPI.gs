/**
 * =========================================================================
 * TeamTask Hub - GoogleSheetsAPI.gs
 * Backend API & Web App บน Google Apps Script
 * เชื่อมต่อระบบติดตามงาน (Todo & Kanban) เข้ากับ Google Sheets บน Google Drive
 * =========================================================================
 * 
 * วิธีติดตั้งใช้งาน (ใช้เวลาประมาณ 2 นาที):
 * 1. สร้าง Google Sheets ใหม่บน Google Drive ของคุณ (ตั้งชื่อเช่น "TeamTask_Database")
 * 2. ไปที่เมนู "ส่วนขยาย" (Extensions) ➔ "Apps Script"
 * 3. ลบโค้ดเดิมใน Code.gs ออก แล้วคัดลอกโค้ดในไฟล์นี้ทั้งหมดไปวางแทน กดบันทึก (Ctrl+S)
 * 4. ที่แถบด้านบน เลือกฟังก์ชัน "setupDatabase" แล้วกดปุ่ม "เรียกใช้" (Run) 1 ครั้ง
 *    (กดยินยอมสิทธิ์การเข้าถึง Google Sheets ตามที่ระบบแจ้ง)
 * 5. กดปุ่มสีน้ำเงิน "การทำให้ใช้งานได้" (Deploy) ➔ "รายการใหม่" (New deployment)
 *    - เลือกประเภท: "เว็บแอป" (Web app)
 *    - ดำเนินการในฐานะ: "ฉัน" (Me)
 *    - ผู้ที่มีสิทธิ์เข้าถึง: "ทุกคน" (Anyone)
 * 6. คัดลอก "URL เว็บแอป" (Web App URL) ที่ได้:
 *    - นำลิงก์นี้ส่งเข้ากลุ่ม LINE ให้ทีมงานเปิดใช้งานผ่านมือถือ/คอมฯ ได้ทันที!
 *    - หรือนำไปวางในช่อง "เชื่อมต่อ Google Sheets" บนหน้าเว็บ TeamTask Hub
 * =========================================================================
 */

// (ตัวเลือก) หากสร้าง Apps Script แยกต่างหากโดยไม่ได้เปิดจากใน Google Sheets ให้ใส่ Spreadsheet ID ที่นี่
const SPREADSHEET_ID = '';

// ชื่อโฟลเดอร์สำหรับจัดเก็บรูปภาพและไฟล์แนบบน Google Drive
const FILE_FOLDER_NAME = 'TeamTask_Files';

// โครงสร้างคอลัมน์ของแต่ละตาราง (Schemas)
const SHEET_SCHEMAS = {
  Tasks: [
    'id', 'title', 'description', 'assigneeId', 'assigneeName',
    'priority', 'createdDate', 'deadline', 'status', 'blockedReason', 'attachments', 'updatedAt'
  ],
  Members: [
    'id', 'name', 'role', 'avatarColor'
  ],
  Settings: [
    'key', 'value'
  ]
};

// ข้อมูลเริ่มต้นสำหรับสร้างฐานข้อมูลครั้งแรก
const INITIAL_MEMBERS = [
  { id: 'mem1', name: 'สมชาย สายลุย', role: 'ช่างเทคนิคงานเชื่อม', avatarColor: '#2563eb' },
  { id: 'mem2', name: 'สมศรี มีสุข', role: 'วิศวกรโครงสร้าง', avatarColor: '#7c3aed' },
  { id: 'mem3', name: 'วรวิทย์ จิตดี', role: 'เจ้าหน้าที่จัดซื้อ', avatarColor: '#059669' },
  { id: 'mem4', name: 'กิตติพงษ์ มั่นคง', role: 'ผู้ตรวจสอบคุณภาพ (QC)', avatarColor: '#ea580c' }
];

const INITIAL_TASKS = [
  {
    id: 'task_001',
    title: 'ตรวจสอบรอยเชื่อมคานเหล็ก H-Beam โครงการเสา C3-C4',
    description: 'ใช้เครื่องมือ Ultrasonic ตรวจสอบแนวเชื่อมโครงทรัสและคานเหล็กความยาว 12 เมตร พร้อมบันทึกผลลงรายงาน QC',
    assigneeId: 'mem1',
    assigneeName: 'สมชาย สายลุย',
    priority: 'urgent',
    createdDate: getOffsetDateString(-3),
    deadline: getOffsetDateString(-1),
    status: 'in_progress',
    blockedReason: '',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task_002',
    title: 'รอผลทดสอบพ่นละอองเกลือ (Salt Spray Test) ชิ้นงานชุบกัลวาไนซ์',
    description: 'ติดตามผลการทดสอบการกัดกร่อนของตัวอย่างเหล็กชุบสังกะสีตามมาตรฐาน ASTM B117 จากห้องปฏิบัติการภายนอก',
    assigneeId: 'mem2',
    assigneeName: 'สมศรี มีสุข',
    priority: 'high',
    createdDate: getOffsetDateString(-4),
    deadline: getOffsetDateString(1),
    status: 'blocked',
    blockedReason: 'ห้องแล็บภายนอกแจ้งว่าเครื่องทดสอบอยู่ระหว่างการสอบเทียบ (Calibration) คาดว่าจะได้ผลตรวจวันศุกร์นี้',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task_003',
    title: 'คำนวณและสั่งซื้อเหล็กแผ่นหนา 12mm จำนวน 40 ตัน',
    description: 'ประสานงานกับฝ่ายผลิตเพื่อยืนยันสเปกเหล็ก SS400 และส่งใบขอราคา (RFQ) ไปยังผู้ค้าเหล็ก 3 ราย',
    assigneeId: 'mem3',
    assigneeName: 'วรวิทย์ จิตดี',
    priority: 'normal',
    createdDate: getOffsetDateString(-2),
    deadline: getOffsetDateString(3),
    status: 'todo',
    blockedReason: '',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task_004',
    title: 'ตรวจรับงานพ่นสีกันสนิมโครงหลังคาโรงงาน 2',
    description: 'วัดความหนาของฟิล์มสี (DFT) และตรวจเช็คความสม่ำเสมอของชั้นเคลือบสีรองพื้น Epoxy Zinc Rich',
    assigneeId: 'mem4',
    assigneeName: 'กิตติพงษ์ มั่นคง',
    priority: 'high',
    createdDate: getOffsetDateString(-5),
    deadline: getOffsetDateString(0),
    status: 'review',
    blockedReason: '',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task_005',
    title: 'เตรียมชุดเครื่องมือดัดเหล็กและเปลี่ยนหัวเชื่อม TIG',
    description: 'ตรวจเช็คความพร้อมของสายส่งแก๊สอาร์กอน และเปลี่ยนหัวทังสเตนใหม่สำหรับการประกอบชิ้นส่วนท่อ',
    assigneeId: 'mem1',
    assigneeName: 'สมชาย สายลุย',
    priority: 'normal',
    createdDate: getOffsetDateString(-6),
    deadline: getOffsetDateString(-2),
    status: 'done',
    blockedReason: '',
    updatedAt: new Date().toISOString()
  }
];

function getOffsetDateString(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return Utilities.formatDate(d, Session.getScriptTimeZone() || 'Asia/Bangkok', 'yyyy-MM-dd');
}

/* =========================================================================
   DATABASE CORE & SETUP
   ========================================================================= */
function getSpreadsheet() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) {
    throw new Error('ไม่พบไฟล์ Google Sheets กรุณาสร้างสคริปต์จากเมนู ส่วนขยาย > Apps Script ใน Google Sheets หรือระบุ SPREADSHEET_ID');
  }
  return active;
}

function getOrCreateFileFolder() {
  const folders = DriveApp.getFoldersByName(FILE_FOLDER_NAME);
  let folder;
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder(FILE_FOLDER_NAME);
  }
  try {
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {}
  return folder;
}

function uploadAttachmentToDrive(att, taskPrefix) {
  if (!att) return null;
  // If already uploaded and has URL without raw base64 data
  if (att.url && (!att.data || !att.data.startsWith('data:'))) {
    return {
      id: att.id || ('file_' + Date.now()),
      name: att.name || 'file',
      type: att.type || 'application/octet-stream',
      size: att.size || 0,
      url: att.url
    };
  }

  if (!att.data || typeof att.data !== 'string' || !att.data.startsWith('data:')) {
    return att;
  }

  try {
    const match = att.data.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return att;

    const mimeType = match[1];
    const base64Data = match[2];
    const bytes = Utilities.base64Decode(base64Data);
    const fileName = att.name || `${taskPrefix}_file_${Date.now()}`;
    const blob = Utilities.newBlob(bytes, mimeType, fileName);

    const folder = getOrCreateFileFolder();
    const file = folder.createFile(blob);
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (e) {}

    let viewUrl = '';
    if (mimeType.startsWith('image/')) {
      viewUrl = `https://lh3.googleusercontent.com/d/${file.getId()}=w1200`;
    } else {
      viewUrl = `https://drive.google.com/file/d/${file.getId()}/view?usp=sharing`;
    }

    return {
      id: att.id || ('file_' + Date.now()),
      name: fileName,
      type: mimeType,
      size: att.size || bytes.length,
      url: viewUrl,
      driveFileId: file.getId()
    };
  } catch (err) {
    console.error('Error uploading to drive:', err);
    return att;
  }
}

function safeJsonParse(str, fallback) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}

/**
 * เรียกใช้ฟังก์ชันนี้เพื่อสร้างตารางทั้งหมด และเตรียมข้อมูลเริ่มต้น
 */
function setupDatabase() {
  const ss = getSpreadsheet();

  // สร้างและจัดรูปแบบแต่ละชีต
  Object.keys(SHEET_SCHEMAS).forEach(name => {
    let sh = ss.getSheetByName(name);
    if (!sh) {
      sh = ss.insertSheet(name);
    }
    const headers = SHEET_SCHEMAS[name];
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]);
      sh.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#4f46e5')
        .setFontColor('#ffffff')
        .setHorizontalAlignment('center');
      sh.setFrozenRows(1);
    } else {
      // ตรวจสอบคอลัมน์เดิม ถ้ายังไม่มี attachments ให้เพิ่มที่หัวตาราง
      const currentHeaders = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
      if (name === 'Tasks' && !currentHeaders.includes('attachments')) {
        sh.getRange(1, 1, 1, headers.length).setValues([headers]);
      }
    }
  });

  // เติมข้อมูลสมาชิกเริ่มต้นถ้าชีตยังว่าง
  const memberSheet = ss.getSheetByName('Members');
  if (memberSheet.getLastRow() <= 1) {
    const memberRows = INITIAL_MEMBERS.map(m => [m.id, m.name, m.role, m.avatarColor]);
    memberSheet.getRange(2, 1, memberRows.length, 4).setValues(memberRows);
  }

  // เติมข้อมูลงานเริ่มต้นถ้าชีตยังว่าง
  const taskSheet = ss.getSheetByName('Tasks');
  if (taskSheet.getLastRow() <= 1) {
    const taskRows = INITIAL_TASKS.map(t => [
      t.id, t.title, t.description, t.assigneeId, t.assigneeName,
      t.priority, t.createdDate, t.deadline, t.status, t.blockedReason, '[]', t.updatedAt
    ]);
    taskSheet.getRange(2, 1, taskRows.length, 12).setValues(taskRows);
  }

  // ปรับขนาดคอลัมน์ให้อ่านง่าย
  try {
    taskSheet.autoResizeColumns(1, 12);
    memberSheet.autoResizeColumns(1, 4);
  } catch (e) {}

  getOrCreateFileFolder();
  return { ok: true, message: 'ตั้งค่าระบบฐานข้อมูล Google Sheets และโฟลเดอร์ไฟล์แนบเรียบร้อยแล้ว' };
}

function ensureSheet(name) {
  const ss = getSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh || sh.getLastRow() === 0) {
    setupDatabase();
    sh = ss.getSheetByName(name);
  } else if (name === 'Tasks') {
    // Auto-migrate: check if 'attachments' header column exists in Tasks
    try {
      const lastCol = Math.max(sh.getLastColumn(), 1);
      const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
      if (!headers.includes('attachments')) {
        const updatedIdx = headers.indexOf('updatedAt');
        if (updatedIdx !== -1) {
          sh.insertColumnBefore(updatedIdx + 1);
          sh.getRange(1, updatedIdx + 1).setValue('attachments')
            .setFontWeight('bold').setBackground('#4f46e5').setFontColor('#ffffff').setHorizontalAlignment('center');
        } else {
          sh.getRange(1, headers.length + 1).setValue('attachments')
            .setFontWeight('bold').setBackground('#4f46e5').setFontColor('#ffffff').setHorizontalAlignment('center');
        }
      }
    } catch (e) {
      console.warn('Auto-migrate error:', e);
    }
  }
  return sh;
}

/* =========================================================================
   READ OPERATIONS
   ========================================================================= */
function readSheetAsObjects(sheetName) {
  const sh = ensureSheet(sheetName);
  const data = sh.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    // ข้ามแถวที่คอลัมน์แรกว่างเปล่า
    if (!row[0] && row[0] !== 0) continue;
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = row[idx];
    });
    rows.push(obj);
  }
  return rows;
}

function getAllData() {
  const members = readSheetAsObjects('Members').map(m => ({
    id: String(m.id || ''),
    name: String(m.name || ''),
    role: String(m.role || ''),
    avatarColor: String(m.avatarColor || '#4f46e5')
  }));

  const tasks = readSheetAsObjects('Tasks').map(t => ({
    id: String(t.id || ''),
    title: String(t.title || ''),
    description: String(t.description || ''),
    assigneeId: String(t.assigneeId || ''),
    priority: String(t.priority || 'normal'),
    createdDate: formatCellDate(t.createdDate),
    deadline: formatCellDate(t.deadline),
    status: String(t.status || 'todo'),
    blockedReason: String(t.blockedReason || ''),
    attachments: safeJsonParse(t.attachments, []),
    updatedAt: formatCellIso(t.updatedAt)
  }));

  const settingsRows = readSheetAsObjects('Settings');
  const settings = {};
  settingsRows.forEach(r => {
    if (r.key) settings[r.key] = r.value;
  });

  return { ok: true, members, tasks, settings, timestamp: new Date().toISOString() };
}

function formatCellDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone() || 'Asia/Bangkok', 'yyyy-MM-dd');
  }
  return String(val).slice(0, 10);
}

function formatCellIso(val) {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString();
  return String(val);
}

/* =========================================================================
   WRITE OPERATIONS
   ========================================================================= */
function upsertRowById(sheetName, headers, rowObj) {
  const sh = ensureSheet(sheetName);
  const values = sh.getDataRange().getValues();
  const currentHeaders = values[0] || headers;
  const useHeaders = (currentHeaders && currentHeaders.includes('attachments')) ? currentHeaders : headers;
  const rowArray = useHeaders.map(h => rowObj[h] !== undefined ? rowObj[h] : '');

  const idCol = 0; // id อยู่คอลัมน์แรกเสมอ
  const targetId = String(rowObj.id);

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === targetId) {
      sh.getRange(i + 1, 1, 1, useHeaders.length).setValues([rowArray]);
      return { ok: true, action: 'updated', id: targetId };
    }
  }

  // ไม่พบ ID เดิม ให้เพิ่มแถวใหม่
  sh.appendRow(rowArray);
  return { ok: true, action: 'inserted', id: targetId };
}

function deleteRowById(sheetName, targetId) {
  const sh = ensureSheet(sheetName);
  const values = sh.getDataRange().getValues();
  const idStr = String(targetId);

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === idStr) {
      sh.deleteRow(i + 1);
      return { ok: true, deletedId: idStr };
    }
  }
  return { ok: false, error: 'ID not found: ' + targetId };
}

function saveTaskToSheet(task) {
  if (!task || !task.id) {
    return { ok: false, error: 'Task data or ID missing' };
  }

  // หาชื่อผู้รับผิดชอบมาบันทึกลงชีตด้วย เพื่อให้อ่านง่ายเมื่อเปิดดูบน Google Sheets
  const members = readSheetAsObjects('Members');
  const member = members.find(m => String(m.id) === String(task.assigneeId));
  task.assigneeName = member ? member.name : '';

  // จัดการอัปโหลดไฟล์และรูปภาพขึ้น Google Drive
  if (Array.isArray(task.attachments)) {
    const processed = task.attachments.map((att, idx) => uploadAttachmentToDrive(att, `${task.id}_${idx + 1}`)).filter(Boolean);
    task.attachments = JSON.stringify(processed);
  } else if (typeof task.attachments !== 'string') {
    task.attachments = '[]';
  }

  if (!task.updatedAt) task.updatedAt = new Date().toISOString();

  return upsertRowById('Tasks', SHEET_SCHEMAS.Tasks, task);
}

function saveMemberToSheet(member) {
  if (!member || !member.id) {
    return { ok: false, error: 'Member data or ID missing' };
  }
  return upsertRowById('Members', SHEET_SCHEMAS.Members, member);
}

function syncAllToSheets(data) {
  const ss = getSpreadsheet();
  let updatedTasks = 0;
  let updatedMembers = 0;

  if (Array.isArray(data.members)) {
    data.members.forEach(m => {
      saveMemberToSheet(m);
      updatedMembers++;
    });
  }

  if (Array.isArray(data.tasks)) {
    data.tasks.forEach(t => {
      saveTaskToSheet(t);
      updatedTasks++;
    });
  }

  return {
    ok: true,
    updatedTasks,
    updatedMembers,
    timestamp: new Date().toISOString()
  };
}

/* =========================================================================
   HTTP ENTRY POINTS (doGet & doPost)
   ========================================================================= */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || '';

    // ถ้ามีการเรียก Action แบบ API
    if (action === 'ping') {
      setupDatabase();
      return jsonResponse({
        ok: true,
        status: 'connected',
        spreadsheet: getSpreadsheet().getName(),
        time: new Date().toISOString()
      });
    }

    if (action === 'getAll') {
      return jsonResponse(getAllData());
    }

    if (action === 'saveMember') {
      const member = {
        id: e.parameter.id,
        name: e.parameter.name,
        role: e.parameter.role,
        avatarColor: e.parameter.avatarColor || '#4f46e5'
      };
      return jsonResponse(saveMemberToSheet(member));
    }

    if (action === 'deleteMember') {
      return jsonResponse(deleteRowById('Members', e.parameter.id));
    }

    if (action === 'saveTask' && e.parameter.task) {
      try {
        const task = JSON.parse(e.parameter.task);
        return jsonResponse(saveTaskToSheet(task));
      } catch (err) {
        return jsonResponse({ ok: false, error: 'JSON parse error: ' + err });
      }
    }

    if (action === 'deleteTask' && e.parameter.id) {
      return jsonResponse(deleteRowById('Tasks', e.parameter.id));
    }

    // หากเปิดผ่าน Web App URL โดยตรงบนเบราว์เซอร์ (ทั้งคอมพิวเตอร์และมือถือ)
    // ให้แสดงหน้าเว็บแอปพลิเคชัน TeamTask Hub ทันที
    return HtmlService
      .createHtmlOutputFromFile('Index')
      .setTitle('TeamTask Hub - ระบบติดตามงานทีมงาน')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');

  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(raw);
    const action = data.action || '';

    if (action === 'getAll') {
      return jsonResponse(getAllData());
    }

    if (action === 'saveTask') {
      const res = saveTaskToSheet(data.task);
      return jsonResponse(res);
    }

    if (action === 'deleteTask') {
      const res = deleteRowById('Tasks', data.id);
      return jsonResponse(res);
    }

    if (action === 'saveMember') {
      const res = saveMemberToSheet(data.member);
      return jsonResponse(res);
    }

    if (action === 'deleteMember') {
      const res = deleteRowById('Members', data.id);
      return jsonResponse(res);
    }

    if (action === 'syncAll') {
      const res = syncAllToSheets(data);
      return jsonResponse(res);
    }

    return jsonResponse({ ok: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}
