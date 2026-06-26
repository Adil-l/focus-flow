-- Focus Flow Protect — one-click activator (self-contained).
-- Everything it needs (crx, watchdog, plists, installer) is bundled inside this
-- app's Contents/Resources, so it never reads the project repo and never trips
-- macOS TCC on ~/Documents. Keep this app OUTSIDE Documents/Desktop/Downloads
-- (it's built into ~/Applications).

set resDir to (POSIX path of (path to me)) & "Contents/Resources/"

set theAnswer to button returned of (display dialog "Ativar a proteção do Focus Flow Blocker no navegador?

Vais ver UMA caixa do macOS a pedir a palavra-passe de administrador. Depois disso, a extensão deixa de poder ser removida em chrome://extensions (só sai pela app «Deactivate»)." buttons {"Cancelar", "Ativar"} default button "Ativar" cancel button "Cancelar" with title "Focus Flow Protect" with icon note)
if theAnswer is not "Ativar" then return

try
	do shell script "/bin/bash " & quoted form of (resDir & "install-bundled.sh") with administrator privileges
on error errMsg number errNum
	if errNum is -128 then return -- user cancelled the password dialog
	display dialog "Falha ao ativar a proteção:

" & errMsg buttons {"OK"} default button "OK" with title "Focus Flow Protect" with icon stop
	return
end try

display dialog "Proteção ativada. 🛡️

Agora fecha TOTALMENTE o Chrome (Cmd-Q) e reabre. Em chrome://extensions o botão Remover desaparece e aparece «Installed by enterprise policy»." buttons {"OK"} default button "OK" with title "Focus Flow Protect" with icon note
