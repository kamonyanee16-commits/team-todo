@echo off
chcp 65001 > nul
powershell -Command "[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms') | Out-Null; [System.Windows.Forms.Clipboard]::SetText([System.IO.File]::ReadAllText('%~dp0GoogleSheetsAPI.gs', [System.Text.Encoding]::UTF8))"
echo =========================================================================
echo  [สำเร็จ] คัดลอกโค้ด GoogleSheetsAPI.gs ลง Clipboard เรียบร้อยแล้ว!
echo =========================================================================
echo  วิธีทำ:
echo  1. สลับไปที่หน้า Google Apps Script ใน Google Sheets
echo  2. เลือกไฟล์ Code.gs
echo  3. กด Ctrl + A แล้วกด Ctrl + V (วางทับ) แล้วกดบันทึก Ctrl + S
echo =========================================================================
pause
