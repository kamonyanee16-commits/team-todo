@echo off
chcp 65001 > nul
powershell -Command "[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms') | Out-Null; [System.Windows.Forms.Clipboard]::SetText([System.IO.File]::ReadAllText('%~dp0Index_for_AppsScript.html', [System.Text.Encoding]::UTF8))"
echo =========================================================================
echo  [สำเร็จ] คัดลอกโค้ด Index_for_AppsScript.html ลง Clipboard เรียบร้อยแล้ว!
echo =========================================================================
echo  วิธีทำ:
echo  1. ในหน้า Apps Script ให้กดปุ่ม [+] ข้างคำว่า "ไฟล์" ➔ เลือก "HTML"
echo  2. ตั้งชื่อไฟล์ว่า: Index
echo  3. กด Ctrl + A แล้วกด Ctrl + V (วางทับ) แล้วกดบันทึก Ctrl + S
echo =========================================================================
pause
