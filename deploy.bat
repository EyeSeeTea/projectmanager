cd "%~dp0"
xcopy /y /s ".\dist" "C:\Program Files (x86)\DHIS2\DHIS\apps\HMIS_Management" /EXCLUDE:files-excluded.txt
