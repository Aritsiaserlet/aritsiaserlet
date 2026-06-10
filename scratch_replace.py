import sys

file_path = r'd:\GitHub\aritsiaserlet\js\admin.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update paths and add switchAdminMode
old_config = '''const API     = `https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents`;
const JSON_PATH = 'settings.json';
let GH_TOKEN  = '';'''

new_config = '''const API     = `https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents`;
let WORKS_PATH = 'works.json';
let SETTINGS_PATH = 'settings.json';
const SHARED_SETTINGS_PATH = 'settings.json';
let adminMode = 'aritsia';
let GH_TOKEN  = '';

window.switchAdminMode = async function(mode) {
  if (adminMode === mode) return;
  adminMode = mode;
  
  document.getElementById('btnModeAritsia').style.background = (mode === 'aritsia') ? 'var(--gold)' : 'var(--white)';
  document.getElementById('btnModeOzonz').style.background = (mode === 'ozonz') ? 'var(--sky2)' : 'var(--white)';
  
  if (mode === 'aritsia') {
    WORKS_PATH = 'works.json';
    SETTINGS_PATH = 'settings.json';
  } else {
    WORKS_PATH = 'ozonz_works.json';
    SETTINGS_PATH = 'ozonz_settings.json';
  }
  
  document.getElementById('ghStatus').textContent = 'Loading ' + mode.toUpperCase() + '...';
  await loadWorks();
  await loadSettings();
  document.getElementById('ghStatus').textContent = '✓ Connected (' + mode.toUpperCase() + ')';
};'''

content = content.replace(old_config, new_config)

# 2. Update loadWorks
old_loadworks = '''async function loadWorks(){
  try{
    const data=await ghGet('works.json');
    if(data){
      worksSha=data.sha;
      works=JSON.parse(decodeURIComponent(escape(atob(data.content.replace(/\\n/g,'')))));
      window.ghConnected = true;
      document.getElementById('ghStatusBox').style.background = '#abebc6';
      document.getElementById('ghStatus').className='gh-status ok';
      document.getElementById('ghStatus').textContent='✓ Connected to GitHub';
    } else {
      works=[];worksSha=null;
    }
    renderAdminList();
    updateStats();
  } catch(e){
    window.ghConnected = false;
    document.getElementById('ghStatusBox').style.background = '#fadbd8';
    document.getElementById('ghStatus').className='gh-status err';
    document.getElementById('ghStatus').textContent='✗ GitHub connection failed';
    works=[];renderAdminList();
  }
}'''

new_loadworks = '''async function loadWorks(){
  try{
    const data=await ghGet(WORKS_PATH);
    if(data){
      worksSha=data.sha;
      works=JSON.parse(decodeURIComponent(escape(atob(data.content.replace(/\\n/g,'')))));
    } else {
      works=[];worksSha=null;
    }
    window.ghConnected = true;
    document.getElementById('ghStatusBox').style.background = '#abebc6';
    document.getElementById('ghStatus').className='gh-status ok';
    document.getElementById('ghStatus').textContent='✓ Connected (' + adminMode.toUpperCase() + ')';
    const modeSel = document.getElementById('adminModeSelector');
    if (modeSel) modeSel.style.display = 'flex';
    renderAdminList();
    updateStats();
  } catch(e){
    window.ghConnected = false;
    document.getElementById('ghStatusBox').style.background = '#fadbd8';
    document.getElementById('ghStatus').className='gh-status err';
    document.getElementById('ghStatus').textContent='✗ GitHub connection failed';
    works=[];renderAdminList();
  }
}'''

content = content.replace(old_loadworks, new_loadworks)

# 3. Update loadSettings
old_loadsettings = '''let settings={}, settingsSha=null;
async function loadSettings(){
  try{
    const data=await ghGet(JSON_PATH);
    if(data){
      settingsSha=data.sha;
      settings=JSON.parse(decodeURIComponent(escape(atob(data.content.replace(/\\n/g,'')))));'''

new_loadsettings = '''let settings={}, settingsSha=null;
let sharedSettings = {};
async function loadSettings(){
  try {
    const sharedData = await ghGet(SHARED_SETTINGS_PATH);
    if (sharedData) sharedSettings = JSON.parse(decodeURIComponent(escape(atob(sharedData.content.replace(/\\n/g,'')))));
  } catch(e) {}

  try{
    const data=await ghGet(SETTINGS_PATH);
    if(data){
      settingsSha=data.sha;
      settings=JSON.parse(decodeURIComponent(escape(atob(data.content.replace(/\\n/g,'')))));
    } else {
      settings={}; settingsSha=null;
    }
    // Inject shared
    settings.icons = sharedSettings.icons || [];
    settings.teams = sharedSettings.teams || [];
    settings.sounds = sharedSettings.sounds || [];
'''

content = content.replace(old_loadsettings, new_loadsettings)

# 4. update remaining JSON_PATH
content = content.replace('JSON_PATH', 'SETTINGS_PATH')

# 5. Fix saveWorks
content = content.replace('''const result=await ghPut('works.json', json, 'Update works.json', worksSha);''', '''const result=await ghPut(WORKS_PATH, json, `Update ${WORKS_PATH}`, worksSha);''')

# 6. Update addIconToLibrary to use SHARED_SETTINGS_PATH
old_addicon = '''      if(!settings.icons) settings.icons = [];

  if(!settings.teams) settings.teams = [];

      settings.icons.push({ id, name: nameInput.value.trim(), url });
      
      const json = JSON.stringify(settings, null, 2);
      const saveResult = await ghPut(SETTINGS_PATH, json, 'Update settings.json with new icon', settingsSha);
      settingsSha = saveResult.content.sha;'''

new_addicon = '''      if(!sharedSettings.icons) sharedSettings.icons = [];
      sharedSettings.icons.push({ id, name: nameInput.value.trim(), url });
      
      const sharedData = await ghGet(SHARED_SETTINGS_PATH);
      const sha = sharedData ? sharedData.sha : null;
      const json = JSON.stringify(sharedSettings, null, 2);
      await ghPut(SHARED_SETTINGS_PATH, json, 'Update shared settings.json with new icon', sha);
      settings.icons = sharedSettings.icons;'''

content = content.replace(old_addicon, new_addicon)

# 7. Update deleteIcon
old_delicon = '''async function deleteIcon(idx) {
  customConfirm("Delete this icon? It will be removed from any links or categories using it.", async () => {
    settings.icons.splice(idx, 1);
    try {
      const json = JSON.stringify(settings, null, 2);
      const res = await ghPut(SETTINGS_PATH, json, 'Delete icon from library', settingsSha);
      settingsSha = res.content.sha;'''

new_delicon = '''async function deleteIcon(idx) {
  customConfirm("Delete this icon? It will be removed from any links or categories using it.", async () => {
    sharedSettings.icons.splice(idx, 1);
    try {
      const sharedData = await ghGet(SHARED_SETTINGS_PATH);
      const sha = sharedData ? sharedData.sha : null;
      const json = JSON.stringify(sharedSettings, null, 2);
      await ghPut(SHARED_SETTINGS_PATH, json, 'Delete icon from shared library', sha);
      settings.icons = sharedSettings.icons;'''

content = content.replace(old_delicon, new_delicon)

# 8. addTeamLibraryMember
old_addteam = '''async function addTeamLibraryMember() {
  const name = document.getElementById('newTeamName').value.trim();
  const link = document.getElementById('newTeamLink').value.trim();
  const iconId = document.getElementById('newTeamIcon').value;
  if(!name) return alert("Please enter a team member name.");

  const btn = document.querySelector('#teamLibraryList').nextElementSibling.querySelector('.anav-btn');
  btn.textContent = "ADDING..."; btn.disabled = true;

  if(!settings.teams) settings.teams = [];
  const newTeam = {
    id: 'team_' + Date.now(),
    name,
    url: link,
    image: iconId
  };
  settings.teams.push(newTeam);

  try {
    const json = JSON.stringify(settings, null, 2);
    const res = await ghPut(SETTINGS_PATH, json, 'Add team member', settingsSha);
    settingsSha = res.content.sha;'''

new_addteam = '''async function addTeamLibraryMember() {
  const name = document.getElementById('newTeamName').value.trim();
  const link = document.getElementById('newTeamLink').value.trim();
  const iconId = document.getElementById('newTeamIcon').value;
  if(!name) return alert("Please enter a team member name.");

  const btn = document.querySelector('#teamLibraryList').nextElementSibling.querySelector('.anav-btn');
  btn.textContent = "ADDING..."; btn.disabled = true;

  if(!sharedSettings.teams) sharedSettings.teams = [];
  const newTeam = {
    id: 'team_' + Date.now(),
    name,
    url: link,
    image: iconId
  };
  sharedSettings.teams.push(newTeam);

  try {
    const sharedData = await ghGet(SHARED_SETTINGS_PATH);
    const sha = sharedData ? sharedData.sha : null;
    const json = JSON.stringify(sharedSettings, null, 2);
    await ghPut(SHARED_SETTINGS_PATH, json, 'Add team member to shared library', sha);
    settings.teams = sharedSettings.teams;'''

content = content.replace(old_addteam, new_addteam)

# 9. deleteTeamLibraryMember
old_delteam = '''async function deleteTeamLibraryMember(id) {
  customConfirm("Delete this team member?", async () => {
    settings.teams = settings.teams.filter(t => t.id !== id);
    try {
      const json = JSON.stringify(settings, null, 2);
      const res = await ghPut(SETTINGS_PATH, json, 'Delete team member', settingsSha);
      settingsSha = res.content.sha;'''

new_delteam = '''async function deleteTeamLibraryMember(id) {
  customConfirm("Delete this team member?", async () => {
    sharedSettings.teams = sharedSettings.teams.filter(t => t.id !== id);
    try {
      const sharedData = await ghGet(SHARED_SETTINGS_PATH);
      const sha = sharedData ? sharedData.sha : null;
      const json = JSON.stringify(sharedSettings, null, 2);
      await ghPut(SHARED_SETTINGS_PATH, json, 'Delete team member from shared library', sha);
      settings.teams = sharedSettings.teams;'''

content = content.replace(old_delteam, new_delteam)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
