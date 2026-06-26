-- Focus Flow Protect — one-click deactivator (self-contained escape hatch).
-- Runs the bundled uninstaller from this app's Contents/Resources.

set resDir to (POSIX path of (path to me)) & "Contents/Resources/"

set theAnswer to button returned of (display dialog "Desativar a proteção do Focus Flow Blocker?

Vais ver a caixa do macOS a pedir a palavra-passe de administrador. Depois disto poderás remover a extensão normalmente em chrome://extensions." buttons {"Cancelar", "Desativar"} default button "Cancelar" cancel button "Cancelar" with title "Focus Flow Protect" with icon caution)
if theAnswer is not "Desativar" then return

try
	do shell script "/bin/bash " & quoted form of (resDir & "uninstall-bundled.sh") with administrator privileges
on error errMsg number errNum
	if errNum is -128 then return -- user cancelled the password dialog
	display dialog "Falha ao desativar:

" & errMsg buttons {"OK"} default button "OK" with title "Focus Flow Protect" with icon stop
	return
end try

display dialog "Proteção desativada.

Fecha e reabre o Chrome — a extensão volta a ser removível." buttons {"OK"} default button "OK" with title "Focus Flow Protect" with icon note
