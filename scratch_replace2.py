import re

with open('js/admin-ozonz.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update paths and add shared settings
code = code.replace("const JSON_PATH = 'settings.json';", "const JSON_PATH = 'ozonz_settings.json';\nconst SHARED_JSON_PATH = 'settings.json';\nlet sharedSettings = {}, sharedSettingsSha = null;\n\nasync function saveSharedSettings() {\n  sharedSettings.icons = settings.icons || [];\n  sharedSettings.teams = settings.teams || [];\n  const json = JSON.stringify(sharedSettings, null, 2);\n  const saveResult = await ghPut(SHARED_JSON_PATH, json, 'Update shared settings', sharedSettingsSha);\n  sharedSettingsSha = saveResult.content.sha;\n}")
code = code.replace("const data=await ghGet('works.json');", "const data=await ghGet('ozonz_works.json');")
code = code.replace("const result=await ghPut('works.json', json, 'Update works.json', worksSha);", "const result=await ghPut('ozonz_works.json', json, 'Update ozonz_works.json', worksSha);")

# 2. Modify loadSettings
old_loadSettings = """async function loadSettings(){
  try{
    const data=await ghGet(JSON_PATH);
    if(data){
      settingsSha=data.sha;
      settings=JSON.parse(decodeURIComponent(escape(atob(data.content.replace(/\\n/g,'')))));"""

new_loadSettings = """async function loadSettings(){
  try {
    const sharedData = await ghGet(SHARED_JSON_PATH);
    if(sharedData) {
      sharedSettingsSha = sharedData.sha;
      sharedSettings = JSON.parse(decodeURIComponent(escape(atob(sharedData.content.replace(/\\n/g,'')))));
    }
  } catch(e) { console.log('Error loading shared settings', e); }

  try{
    const data=await ghGet(JSON_PATH);
    if(data){
      settingsSha=data.sha;
      settings=JSON.parse(decodeURIComponent(escape(atob(data.content.replace(/\\n/g,'')))));
    } else { settings = {}; }
    
    settings.icons = sharedSettings.icons || [];
    settings.teams = sharedSettings.teams || [];
"""
code = code.replace(old_loadSettings, new_loadSettings)

# 3. Update icon saving
code = re.sub(r'const json = JSON\.stringify\(settings, null, 2\);\s+const saveResult = await ghPut\(JSON_PATH, json, \'Update settings\.json with new icon\', settingsSha\);\s+settingsSha = saveResult\.content\.sha;', 'await saveSharedSettings();', code)

code = re.sub(r'const json = JSON\.stringify\(settings, null, 2\);\s+const res = await ghPut\(JSON_PATH, json, \'Delete icon from library\', settingsSha\);\s+settingsSha = res\.content\.sha;', 'await saveSharedSettings();', code)

# 4. Update team saving
code = re.sub(r'const json = JSON\.stringify\(settings, null, 2\);\s+const res = await ghPut\(JSON_PATH, json, \'Update settings\.json with new team member\', settingsSha\);\s+settingsSha = res\.content\.sha;', 'await saveSharedSettings();', code)

code = re.sub(r'const json = JSON\.stringify\(settings, null, 2\);\s+const res = await ghPut\(JSON_PATH, json, \'Delete team member\', settingsSha\);\s+settingsSha = res\.content\.sha;', 'await saveSharedSettings();', code)

# 5. Remove unused game functions
code = re.sub(r'async function saveGameAnimations\(\)\s*\{[\s\S]*?\}\s*\}', '', code)
code = re.sub(r'async function saveGameBalance\(\)\s*\{[\s\S]*?\}\s*\}', '', code)

with open('js/admin-ozonz.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
