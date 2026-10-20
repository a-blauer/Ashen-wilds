// domcheck.js before.html after.html -> element ids the script looks up ($('x'), getElementById('x'), '#x' in querySelector)
// that exist (in markup or created by the script) before but not after
const fs=require('fs');
function scan(f){
  const t=fs.readFileSync(f,'utf8');const i=t.lastIndexOf('<script>')+8,j=t.lastIndexOf('</script>');const js=t.slice(i,j),page=t.slice(0,i)+t.slice(j);
  const used=new Set(),made=new Set();
  for(const m of js.matchAll(/\$\('([\w-]+)'\)|getElementById\('([\w-]+)'\)/g))used.add(m[1]||m[2]);
  for(const m of (page+js).matchAll(/\bid=\\?["']([\w-]+)\\?["']|\.id=['"]([\w-]+)['"]/g))made.add(m[1]||m[2]);
  return {used,made};
}
const a=scan(process.argv[2]),b=scan(process.argv[3]);
const missA=[...a.used].filter(x=>!a.made.has(x)),missB=[...b.used].filter(x=>!b.made.has(x)&&!missA.includes(x));
console.log(missB.length?'NEW MISSING ELEMENT IDS: '+missB.join(', '):'no new missing element ids');
