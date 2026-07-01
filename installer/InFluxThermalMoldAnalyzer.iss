#define MyAppName "InFlux Thermal Mold Analyzer"
#define MyAppVersion "0.1.0"
#define MyAppPublisher "InFlux"
#define MyAppExeName "InFluxThermalMoldAnalyzer.exe"

[Setup]
AppId={{4EC92BC1-06AF-4E76-8845-7A76FD601C6B}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={localappdata}\Programs\InFlux Thermal Mold Analyzer
DefaultGroupName=InFlux Thermal Mold Analyzer
PrivilegesRequired=lowest
AllowNoIcons=no
LicenseFile=
OutputDir=Output
OutputBaseFilename=InFluxThermalMoldAnalyzerSetup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
UninstallDisplayIcon={app}\{#MyAppExeName}

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Additional icons:"; Flags: checkedonce

[Files]
Source: "..\dist\InFluxThermalMoldAnalyzer\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "Launch {#MyAppName}"; Flags: nowait postinstall skipifsilent
