# https://community.adobe.com/t5/download-install-discussions/windows-10-stop-background-services-and-process-on-startup-and-application-exit/td-p/10481868
Get-Process -Name Adobe* | Stop-Process
Get-Process -Name CCLibrary | Stop-Process
Get-Process -Name CCXProcess | Stop-Process
Get-Process -Name CoreSync | Stop-Process
Get-Process -Name AdobeIPCBroker | Stop-Process
Get-Process -Name "Adobe Crash Processor" | Stop-Process
Get-Service -DisplayName Adobe* | Stop-Service
Get-Service -DisplayName Adobe* | Set-Service -StartupType Manual
