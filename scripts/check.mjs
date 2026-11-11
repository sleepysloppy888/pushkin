import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context=vm.createContext({window:{},localStorage:{getItem:()=>null},$:()=>{},console});
for(const file of ['books.js','descriptions.js','app.js','enhancements.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
assert.equal(context.B.length,30);
assert.equal(Object.keys(context.details).length,30);
for(const b of context.B){assert.ok(context.details[b.id][1].length>250,'Detailed annotation: '+b.id);assert.equal(Boolean(b.e),Boolean(context.BOOKS[b.id]));}
for(const [id,book] of Object.entries(context.BOOKS)){
 const pages=context.paginate(book.text);
 assert.ok(pages.length>3,'Full book pagination: '+id);
 assert.equal(pages.map(p=>p.text).join('').replace(/\s/g,''),book.text.replace(/\s/g,''),'Pagination must not lose any text: '+id);
 for(let i=1;i<pages.length;i++)assert.equal(pages[i].start,pages[i-1].end);
 assert.ok(!book.text.includes('\uFFFD'),'Encoding: '+id);
}
const onegin=context.BOOKS[1].text;
assert.ok(onegin.includes('Мой дядя самых честных правил'));
assert.ok(onegin.includes('Как я с Онегиным моим.'));
assert.ok(!onegin.includes('СКУПОЙ РЫЦАРЬ'),'Do not include another work in Onegin');
assert.equal(context.chapterList(onegin,context.paginate(onegin)).filter(c=>/^ГЛАВА/.test(c.name)).length,8);
assert.ok(context.BOOKS[13].text.includes('ЧАСТЬ ВТОРАЯ'));
assert.ok(context.BOOKS[15].text.includes('И усы лишь обмочил.'));
assert.ok(context.BOOKS[22].text.includes('З а н а в е с.'));
assert.equal((context.card(context.B[0]).match(/data-rd=/g)||[]).length,1);
assert.equal((context.card(context.B[6]).match(/data-rd=/g)||[]).length,0);
context.CU={my:[{id:1}]};context.my=context.CU.my;
assert.match(context.card(context.B[0]),/disabled>Забронировано/);
assert.equal(context.escapeHtml('<img onerror="x">'),'&lt;img onerror=&quot;x&quot;&gt;');
const html=fs.readFileSync('index.html','utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,'Unique HTML IDs');
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){const url=match[1];if(!/^(?:https?:|mailto:|tel:|data:)/.test(url))assert.ok(fs.existsSync(url),'Local resource: '+url);}
console.log('PASS: 30 annotations; 9 full texts; lossless pagination; chapters; booking states; escaping; local resources.');
